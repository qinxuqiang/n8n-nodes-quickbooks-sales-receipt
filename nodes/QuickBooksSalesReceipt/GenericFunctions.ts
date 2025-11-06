import { NodeApiError } from 'n8n-workflow';
import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	JsonObject,
} from 'n8n-workflow';

import type { CustomField, GeneralAddress, Ref } from './descriptions/Shared.interface';
import type { QuickBooksOAuth2Credentials } from './types';

/**
 * Make an authenticated API request to QuickBooks.
 */
export async function quickBooksApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	qs: IDataObject,
	body: IDataObject,
	option: IDataObject = {},
): Promise<any> {
	const productionUrl = 'https://quickbooks.api.intuit.com';
	const sandboxUrl = 'https://sandbox-quickbooks.api.intuit.com';

	const credentials = await this.getCredentials<QuickBooksOAuth2Credentials>('quickBooksOAuth2Api');

	const options: IHttpRequestOptions = {
		headers: {
			'user-agent': 'n8n',
		},
		method,
		url: `${credentials.environment === 'sandbox' ? sandboxUrl : productionUrl}${endpoint}`,
		qs,
		body,
		json: true,
	};

	if (!Object.keys(body).length) {
		delete options.body;
	}

	if (!Object.keys(qs).length) {
		delete options.qs;
	}

	if (Object.keys(option)) {
		Object.assign(options, option);
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'quickBooksOAuth2Api', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Get the SyncToken required for delete operations in QuickBooks.
 */
export async function getSyncToken(
	this: IExecuteFunctions,
	i: number,
	companyId: string,
	resource: string,
) {
	const parameterName = resource === 'salesReceipt' ? 'salesreceipt' : resource;
	const endpointName = resource === 'salesReceipt' ? 'salesreceipt' : resource;
	const propertyName = resource === 'salesReceipt' ? 'SalesReceipt' : resource;

	const resourceId = this.getNodeParameter(`${parameterName}Id`, i);
	const getEndpoint = `/v3/company/${companyId}/${endpointName}/${resourceId}`;
	const response = await quickBooksApiRequest.call(this, 'GET', getEndpoint, {}, {});

	return response[propertyName].SyncToken;
}

/**
 * Load options for dropdowns (customers, items, etc.)
 */
export async function loadResource(this: ILoadOptionsFunctions, resource: string) {
	const returnData: INodePropertyOptions[] = [];

	const qs = {
		query: `SELECT * FROM ${resource}`,
	} as IDataObject;

	const {
		oauthTokenData: {
			callbackQueryString: { realmId },
		},
	} = await this.getCredentials<QuickBooksOAuth2Credentials>('quickBooksOAuth2Api');
	const endpoint = `/v3/company/${realmId}/query`;

	const responseData = await quickBooksApiRequest.call(this, 'GET', endpoint, qs, {});

	if (resource === 'preferences') {
		const {
			SalesFormsPrefs: { CustomField },
		} = responseData.QueryResponse.Preferences[0];
		const customFields = CustomField[1].CustomField;
		for (const customField of customFields) {
			const length = customField.Name.length;
			returnData.push({
				name: customField.StringValue,
				value: customField.Name.charAt(length - 1),
			});
		}
		return returnData;
	}

	const resourceKey = resource.charAt(0).toUpperCase() + resource.slice(1);
	const items = responseData.QueryResponse[resourceKey] || [];

	items.forEach((item: { DisplayName?: string; Name?: string; Id: string }) => {
		returnData.push({
			name: item.DisplayName || item.Name || `Item ${item.Id}`,
			value: item.Id,
		});
	});

	return returnData;
}

/**
 * Populate the `Line` property in a request body for Sales Receipts.
 */
export function processLines(this: IExecuteFunctions, lines: IDataObject[], resource: string) {
	lines.forEach((line) => {
		if (resource === 'salesReceipt') {
			if (line.DetailType === 'SalesItemLineDetail') {
				line.SalesItemLineDetail = {
					ItemRef: {
						value: line.itemId,
					},
					TaxCodeRef: {
						value: line.TaxCodeRef,
					},
					Qty: line.Qty,
				};
				if (line.Qty === undefined) {
					delete (line.SalesItemLineDetail as IDataObject).Qty;
				}
				delete line.itemId;
				delete line.TaxCodeRef;
				delete line.Qty;
			}
		}
	});

	return lines;
}

/**
 * Populate additional fields into a request body for Sales Receipts.
 */
export function populateFields(
	this: IExecuteFunctions,
	body: IDataObject,
	fields: IDataObject,
	resource: string,
) {
	Object.entries(fields).forEach(([key, value]) => {
		if (resource === 'salesReceipt') {
			if (key === 'BillAddr' || key === 'ShipAddr') {
				const { details } = value as { details: GeneralAddress };
				body[key] = Object.fromEntries(
					Object.entries(details).filter(([_, detail]) => detail !== '')
				);
			} else if (key === 'BillEmail') {
				body.BillEmail = {
					Address: value,
				};
			} else if (key === 'CustomFields') {
				const { Field } = value as { Field: CustomField[] };
				body.CustomField = Field;
				const length = (body.CustomField as CustomField[]).length;
				for (let i = 0; i < length; i++) {
					(body.CustomField as CustomField[])[i].Type = 'StringType';
				}
			} else if (key === 'CustomerMemo') {
				body.CustomerMemo = {
					value,
				};
			} else if (key.endsWith('Ref')) {
				if (typeof value === 'string') {
					// For simple string refs like PaymentMethodRef or DepositToAccountRef
					body[key] = {
						value,
					};
				} else if (typeof value === 'object' && value !== null && 'details' in value) {
					// For complex refs with name and value
					const refValue = value as { details: Ref };
					body[key] = {
						name: refValue.details.name,
						value: refValue.details.value,
					};
				}
			} else {
				body[key] = value;
			}
		}
	});
	return body;
}


