const { v4: uuidv4 } = require('uuid');
const { wrapHandler } = require('../middleware/wrapper');
const { success } = require('../utils/response');
const { validate, schemas } = require('../validation/schemas');
const { ConflictError, UnauthorizedError } = require('../utils/errors');
const usersRepository = require('../repositories/usersRepository');
const { hashPassword, comparePassword, signToken } = require('../services/authService');
const logger = require('../utils/logger');

const register = wrapHandler(async (event) => {
  const { name, email, password } = validate(schemas.register, event.body);
  const normalizedEmail = email.toLowerCase();

  const existing = await usersRepository.findByEmail(normalizedEmail);
  if (existing) {
    throw new ConflictError('Ya existe una cuenta registrada con este correo');
  }

  const user = {
    userId: uuidv4(),
    name,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  await usersRepository.create(user);
  logger.info('User registered', { userId: user.userId });

  const token = signToken(user);
  return success(201, {
    token,
    user: { userId: user.userId, name: user.name, email: user.email },
  });
});

const login = wrapHandler(async (event) => {
  const { email, password } = validate(schemas.login, event.body);
  const user = await usersRepository.findByEmail(email.toLowerCase());
  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const token = signToken(user);
  return success(200, {
    token,
    user: { userId: user.userId, name: user.name, email: user.email },
  });
});

module.exports = { register, login };
