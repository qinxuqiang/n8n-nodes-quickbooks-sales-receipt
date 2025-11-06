import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
	salesReceiptFields,
	salesReceiptOperations,
} from './descriptions/SalesReceiptDescription';
import {
	getSyncToken,
	loadResource,
	populateFields,
	processLines,
	quickBooksApiRequest,
} from './GenericFunctions';
import type { QuickBooksOAuth2Credentials } from './types';

export class QuickBooksSalesReceipt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QuickBooks Sales Receipt',
		name: 'quickBooksSalesReceipt',
		icon: 'file:quickbooks.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Create and delete sales receipts in QuickBooks Online',
		defaults: {
			name: 'QuickBooks Sales Receipt',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'quickBooksOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'hidden',
				noDataExpression: true,
				default: 'salesReceipt',
				options: [
					{
						name: 'Sales Receipt',
						value: 'salesReceipt',
					},
				],
			},
			...salesReceiptOperations,
			...salesReceiptFields,
		],
	};

	methods = {
		loadOptions: {
			async getCustomers(this: ILoadOptionsFunctions) {
				return await loadResource.call(this, 'customer');
			},

			async getCustomFields(this: ILoadOptionsFunctions) {
				return await loadResource.call(this, 'preferences');
			},

			async getItems(this: ILoadOptionsFunctions) {
				return await loadResource.call(this, 'item');
			},

			async getTaxCodeRefs(this: ILoadOptionsFunctions) {
				return await loadResource.call(this, 'TaxCode');
			},

			async getAccounts(this: ILoadOptionsFunctions) {
				const returnData: INodePropertyOptions[] = [];

				const qs = {
					query: `SELECT * FROM account WHERE AccountType IN ('Bank', 'Other Current Asset')`,
				} as IDataObject;

				const {
					oauthTokenData: {
						callbackQueryString: { realmId },
					},
				} = await this.getCredentials<QuickBooksOAuth2Credentials>('quickBooksOAuth2Api');
				const endpoint = `/v3/company/${realmId}/query`;

				const responseData = await quickBooksApiRequest.call(this, 'GET', endpoint, qs, {});
				const accounts = responseData.QueryResponse.Account || [];

				accounts.forEach((account: { Name: string; Id: string }) => {
					returnData.push({
						name: account.Name || `Account ${account.Id}`,
						value: account.Id,
					});
				});

				return returnData;
			},

			async getPaymentMethods(this: ILoadOptionsFunctions) {
				return await loadResource.call(this, 'paymentmethod');
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const resource = 'salesReceipt';
		const operation = this.getNodeParameter('operation', 0);

		let responseData;
		const returnData: INodeExecutionData[] = [];

		const { oauthTokenData } =
			await this.getCredentials<QuickBooksOAuth2Credentials>('quickBooksOAuth2Api');
		const companyId = oauthTokenData.callbackQueryString.realmId;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'create') {
					// ----------------------------------
					//    salesReceipt: create
					// ----------------------------------

					const lines = this.getNodeParameter('Line', i) as IDataObject[];

					if (!lines.length) {
						throw new NodeOperationError(
							this.getNode(),
							'Please enter at least one line for the sales receipt.',
							{ itemIndex: i },
						);
					}

					if (
						lines.some(
							(line) =>
								line.DetailType === undefined ||
								line.Amount === undefined ||
								line.Description === undefined,
						)
					) {
						throw new NodeOperationError(
							this.getNode(),
							'Please enter detail type, amount and description for every line.',
							{ itemIndex: i },
						);
					}

					lines.forEach((line) => {
						if (line.DetailType === 'SalesItemLineDetail' && line.itemId === undefined) {
							throw new NodeOperationError(
								this.getNode(),
								'Please enter an item ID for the associated line.',
								{ itemIndex: i },
							);
						}
					});

					let body: IDataObject = {
						CustomerRef: {
							value: this.getNodeParameter('CustomerRef', i),
						},
					};

					body.Line = processLines.call(this, lines, resource);

					const additionalFields = this.getNodeParameter('additionalFields', i);

					body = populateFields.call(this, body, additionalFields, resource);

					const endpoint = `/v3/company/${companyId}/salesreceipt`;
					responseData = await quickBooksApiRequest.call(this, 'POST', endpoint, {}, body);
					responseData = responseData.SalesReceipt;
				} else if (operation === 'delete') {
					// ----------------------------------
					//    salesReceipt: delete
					// ----------------------------------

					const qs: IDataObject = {
						operation: 'delete',
					};

					const body: IDataObject = {
						Id: this.getNodeParameter('salesreceiptId', i),
						SyncToken: await getSyncToken.call(this, i, companyId, resource),
					};

					const endpoint = `/v3/company/${companyId}/salesreceipt`;
					responseData = await quickBooksApiRequest.call(this, 'POST', endpoint, qs, body);
					responseData = responseData.SalesReceipt;
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData as IDataObject),
				{ itemData: { item: i } },
			);

			returnData.push(...executionData);
		}

		return [returnData];
	}
}

