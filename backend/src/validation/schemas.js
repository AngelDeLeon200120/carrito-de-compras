const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const addCartItem = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(99).required(),
});

const checkout = Joi.object({
  shippingAddress: Joi.string().min(5).max(200).optional(),
});

function validate(schema, payload) {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const details = error.details.map((d) => d.message);
    const { BadRequestError } = require('../utils/errors');
    throw new BadRequestError('Error de validación', details);
  }
  return value;
}

module.exports = { schemas: { register, login, addCartItem, checkout }, validate };
