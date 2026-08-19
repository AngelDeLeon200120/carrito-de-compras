const { PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/dynamo');

async function createOrder(order) {
  await docClient.send(new PutCommand({ TableName: TABLES.ORDERS, Item: order }));
  return order;
}

async function listByUser(userId) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.ORDERS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false,
    })
  );
  return result.Items || [];
}

module.exports = { createOrder, listByUser };
