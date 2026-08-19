const { v4: uuidv4 } = require('uuid');
const { wrapHandler } = require('../middleware/wrapper');
const { success } = require('../utils/response');
const { validate, schemas } = require('../validation/schemas');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');
const cartsRepository = require('../repositories/cartsRepository');
const productsRepository = require('../repositories/productsRepository');
const ordersRepository = require('../repositories/ordersRepository');
const usersRepository = require('../repositories/usersRepository');
const { sendOrderConfirmation } = require('../services/emailService');
const logger = require('../utils/logger');

const checkout = wrapHandler(
  async (event) => {
    const { shippingAddress } = validate(schemas.checkout, event.body || {});
    const { userId } = event.user;

    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Tu sesión ya no es válida, por favor inicia sesión de nuevo');
    }

    const cart = await cartsRepository.getCart(userId);
    if (!cart.items.length) {
      throw new BadRequestError('El carrito está vacío');
    }

    // Descuenta stock de forma atómica; falla si algún producto no tiene stock.
    await productsRepository.decrementStockBatch(
      cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    );

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
      userId,
      orderId: uuidv4(),
      items: cart.items,
      total,
      shippingAddress: shippingAddress || null,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    await ordersRepository.createOrder(order);
    await cartsRepository.clearCart(userId);

    const emailResult = await sendOrderConfirmation({ user, order });

    logger.info('Checkout completado', { userId, orderId: order.orderId, total });

    return success(201, { order, email: emailResult });
  },
  { auth: true }
);

module.exports = { checkout };
