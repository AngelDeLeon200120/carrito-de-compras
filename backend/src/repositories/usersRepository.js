const { GetCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/dynamo');

async function findByEmail(email) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email.toLowerCase() },
      Limit: 1,
    })
  );
  return result.Items?.[0] || null;
}

async function findById(userId) {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLES.USERS, Key: { userId } })
  );
  return result.Item || null;
}

async function create(user) {
  await docClient.send(
    new PutCommand({
      TableName: TABLES.USERS,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)',
    })
  );
  return user;
}

module.exports = { findByEmail, findById, create };
