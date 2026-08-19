const { wrapHandler } = require('../middleware/wrapper');
const { success } = require('../utils/response');
const productsRepository = require('../repositories/productsRepository');
const { BadRequestError } = require('../utils/errors');

const list = wrapHandler(async (event) => {
  const { category, limit, cursor } = event.query;
  const { items, nextCursor } = await productsRepository.list({ category, limit, cursor });
  return success(200, { items, nextCursor, count: items.length });
});

const getById = wrapHandler(async (event) => {
  const { id } = event.pathParams;
  if (!id) {
    throw new BadRequestError('Falta el id del producto');
  }
  const product = await productsRepository.getById(id);
  return success(200, product);
});

module.exports = { list, getById };
