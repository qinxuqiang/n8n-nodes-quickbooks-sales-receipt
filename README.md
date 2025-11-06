# n8n-nodes-quickbooks-sales-receipt

This is an n8n community node that adds QuickBooks Sales Receipt operations (create and delete) to n8n.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Node Installation

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-quickbooks-sales-receipt` in **Enter npm package name**
4. Agree to the risks and select **Install**

After installation, the **QuickBooks Sales Receipt** node will be available in your n8n instance.

### Manual Installation

To install manually (for development or testing):

```bash
# Navigate to your n8n installation
cd ~/.n8n/nodes

# Install the package
npm install n8n-nodes-quickbooks-sales-receipt
```

## Operations

This node supports the following operations for QuickBooks Sales Receipts:

### Create
Create a new sales receipt in QuickBooks Online.

**Required fields:**
- Customer Reference
- At least one line item with:
  - Detail Type (Sales Item Line Detail)
  - Amount
  - Description
  - Item ID

**Optional fields:**
- Billing Address
- Shipping Address
- Billing Email
- Customer Memo
- Private Note
- Payment Method
- Deposit To Account
- Transaction Date
- Document Number
- Email Status
- Print Status
- Custom Fields

### Delete
Delete an existing sales receipt from QuickBooks Online.

**Required fields:**
- Sales Receipt ID

## Credentials

This node uses the **QuickBooks OAuth2 API** credentials from n8n-nodes-base. You must set up QuickBooks OAuth2 credentials before using this node.

### Setting up QuickBooks OAuth2 Credentials

1. Create a QuickBooks app at [https://developer.intuit.com](https://developer.intuit.com)
2. Get your Client ID and Client Secret
3. In n8n, create new credentials for **QuickBooks OAuth2 API**
4. Enter your Client ID and Client Secret
5. Choose environment (Production or Sandbox)
6. Complete the OAuth2 authentication flow

For detailed instructions, see the [n8n QuickBooks credentials documentation](https://docs.n8n.io/integrations/builtin/credentials/quickbooks/).

## Usage

### Creating a Sales Receipt

1. Add the **QuickBooks Sales Receipt** node to your workflow
2. Select **Create** operation
3. Choose a customer from the dropdown (or use an expression)
4. Add line items:
   - Set the amount
   - Add a description
   - Select an item
   - Optionally set quantity and tax code
5. Optionally add additional fields like payment method, billing address, etc.
6. Execute the node

### Deleting a Sales Receipt

1. Add the **QuickBooks Sales Receipt** node to your workflow
2. Select **Delete** operation
3. Enter the Sales Receipt ID (you can get this from a previous Create or Get operation)
4. Execute the node

### Example Workflow

Here's a simple example workflow:

1. **Manual Trigger** - Start the workflow
2. **QuickBooks Sales Receipt (Create)** - Create a new sales receipt
   - Customer: Select from list
   - Line Item:
     - Amount: 100
     - Description: "Product Sale"
     - Item: Select from list
3. **QuickBooks Sales Receipt (Delete)** - Delete the created receipt
   - Sales Receipt ID: `{{ $json.Id }}`

## Compatibility

- Tested with n8n version 1.0.0 and above
- Requires Node.js 18.0.0 or higher

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [QuickBooks Online API Documentation](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/salesreceipt)
* [QuickBooks Developer Portal](https://developer.intuit.com/)

## Development

### Setup

```bash
# Clone or download the repository
git clone https://github.com/yourusername/n8n-nodes-quickbooks-sales-receipt.git
cd n8n-nodes-quickbooks-sales-receipt

# Install dependencies
npm install

# Build the node
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Local Development

```bash
# Link the package locally
npm link

# In your n8n installation directory
cd ~/.n8n/nodes
npm link n8n-nodes-quickbooks-sales-receipt

# Restart n8n
```

## License

[MIT](LICENSE)

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/qinxuqiang/n8n-nodes-quickbooks-sales-receipt).



