const {
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/dynamo');
const { ConflictError, NotFoundError } = require('../utils/errors');

function encodeCursor(lastEvaluatedKey) {
  if (!lastEvaluatedKey) return null;
  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
}

function decodeCursor(cursor) {
  if (!cursor) return undefined;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  } catch (err) {
    return undefined;
  }
}

async function list({ category, limit = 8, cursor } = {}) {
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 50);
  const ExclusiveStartKey = decodeCursor(cursor);

  let result;
  if (category) {
    result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.PRODUCTS,
        IndexName: 'category-index',
        KeyConditionExpression: 'category = :category',
        ExpressionAttributeValues: { ':category': category },
        Limit: pageSize,
        ExclusiveStartKey,
      })
    );
  } else {
    result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.PRODUCTS,
        Limit: pageSize,
        ExclusiveStartKey,
      })
    );
  }

  return {
    items: result.Items || [],
    nextCursor: encodeCursor(result.LastEvaluatedKey),
  };
}

async function getById(productId) {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLES.PRODUCTS, Key: { productId } })
  );
  if (!result.Item) {
    throw new NotFoundError(`Producto ${productId} no encontrado`);
  }
  return result.Item;
}

async function decrementStock(productId, quantity) {
  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLES.PRODUCTS,
        Key: { productId },
        UpdateExpression: 'SET stock = stock - :qty',
        ConditionExpression: 'attribute_exists(productId) AND stock >= :qty',
        ExpressionAttributeValues: { ':qty': quantity },
        ReturnValues: 'ALL_NEW',
      })
    );
    return result.Attributes;
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new ConflictError(`Stock insuficiente para el producto ${productId}`);
    }
    throw err;
  }
}

/**
 * Descuenta el stock de varios productos de forma atómica: si alguno no
 * tiene stock suficiente, ningún producto del lote se modifica.
 */
async function decrementStockBatch(items) {
  try {
    await docClient.send(
      new TransactWriteCommand({
        TransactItems: items.map(({ productId, quantity }) => ({
          Update: {
            TableName: TABLES.PRODUCTS,
            Key: { productId },
            UpdateExpression: 'SET stock = stock - :qty',
            ConditionExpression: 'attribute_exists(productId) AND stock >= :qty',
            ExpressionAttributeValues: { ':qty': quantity },
          },
        })),
      })
    );
  } catch (err) {
    if (err.name === 'TransactionCanceledException') {
      throw new ConflictError(
        'No se pudo completar la compra: uno o más productos ya no tienen stock suficiente'
      );
    }
    throw err;
  }
}

module.exports = { list, getById, decrementStock, decrementStockBatch };
