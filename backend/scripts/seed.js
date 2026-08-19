require('dotenv').config();
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../src/config/dynamo');
const products = require('./products-seed.json');

async function seed() {
  console.log(`Sembrando ${products.length} productos en la tabla ${TABLES.PRODUCTS}...`);
  for (const product of products) {
    await docClient.send(new PutCommand({ TableName: TABLES.PRODUCTS, Item: product }));
    console.log(`  ✓ ${product.name}`);
  }
  console.log('Seed completado.');
}

seed().catch((err) => {
  console.error('Error al sembrar datos. ¿Está corriendo DynamoDB Local? (npm run dev)');
  console.error(err);
  process.exit(1);
});
