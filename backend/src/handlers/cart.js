const { wrapHandler } = require('../middleware/wrapper');
const { success } = require('../utils/response');
const { validate, schemas } = require('../validation/schemas');
const { BadRequestError } = require('../utils/errors');
const cartsRepository = require('../repositories/cartsRepository');
const productsRepository = require('../repositories/productsRepository');

const getCart = wrapHandler(
  async (event) => {
    const cart = await cartsRepository.getCart(event.user.userId);
    return success(200, cart);
  },
  { auth: true }
);

const addItem = wrapHandler(
  async (event) => {
    const { productId, quantity } = validate(schemas.addCartItem, event.body);
    const product = await productsRepository.getById(productId);

    const cart = await cartsRepository.getCart(event.user.userId);
    const existingItem = cart.items.find((item) => item.productId === productId);
    const newQuantity = (existingItem?.quantity || 0) + quantity;

    if (newQuantity > product.stock) {
      throw new BadRequestError(
        `Stock insuficiente. Disponible: ${product.stock}, solicitado: ${newQuantity}`
      );
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    const saved = await cartsRepository.saveCart(cart);
    return success(200, saved);
  },
  { auth: true }
);

const removeItem = wrapHandler(
  async (event) => {
    const { productId } = event.pathParams;
    if (!productId) {
      throw new BadRequestError('Falta el id del producto');
    }

    const cart = await cartsRepository.getCart(event.user.userId);
    cart.items = cart.items.filter((item) => item.productId !== productId);
    const saved = await cartsRepository.saveCart(cart);
    return success(200, saved);
  },
  { auth: true }
);

module.exports = { getCart, addItem, removeItem };
