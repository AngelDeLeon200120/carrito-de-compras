const { GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/dynamo');

function emptyCart(userId) {
  return { userId, items: [], updatedAt: new Date().toISOString() };
}

async function getCart(userId) {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLES.CARTS, Key: { userId } })
  );
  return result.Item || emptyCart(userId);
}

async function saveCart(cart) {
  const updated = { ...cart, updatedAt: new Date().toISOString() };
  await docClient.send(new PutCommand({ TableName: TABLES.CARTS, Item: updated }));
  return updated;
}

async function clearCart(userId) {
  await docClient.send(new DeleteCommand({ TableName: TABLES.CARTS, Key: { userId } }));
}

module.exports = { getCart, saveCart, clearCart, emptyCart };
