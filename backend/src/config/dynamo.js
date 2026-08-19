const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const isOffline = process.env.IS_OFFLINE || !process.env.LAMBDA_TASK_ROOT;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(isOffline
    ? {
        endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
        },
      }
    : {}),
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLES = {
  PRODUCTS: process.env.PRODUCTS_TABLE,
  CARTS: process.env.CARTS_TABLE,
  ORDERS: process.env.ORDERS_TABLE,
  USERS: process.env.USERS_TABLE,
};

module.exports = { docClient, TABLES };
