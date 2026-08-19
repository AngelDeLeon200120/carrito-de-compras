const { wrapHandler } = require('../middleware/wrapper');
const { success } = require('../utils/response');
const ordersRepository = require('../repositories/ordersRepository');

const history = wrapHandler(
  async (event) => {
    const orders = await ordersRepository.listByUser(event.user.userId);
    return success(200, { items: orders, count: orders.length });
  },
  { auth: true }
);

module.exports = { history };
