const { BadRequestError } = require('../errors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const checkUserFields = (email, name, password) => {
  if (!email) {
    throw new BadRequestError('Please provide an email')
  }
  if (!name) {
    throw new BadRequestError('Please provide a name')
  }

  if (!password) {
    throw new BadRequestError('Please provide a password')
  }
}

const checkCarFields = (make, model, description, rentalPrice) => {
  if (!make) {
    throw new BadRequestError('Please provide the make of the car')
  }
  if (!model) {
    throw new BadRequestError('Please provide the model of the car')
  }

  if (!description) {
    throw new BadRequestError('Please provide a description to the car')
  }

  if (!rentalPrice) {
    throw new BadRequestError('Please provide a rental price for the car')
  }
}

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

const decodePassword = async (password, rawPassword) => {
  return await bcrypt.compare(password, rawPassword)
}

const createJwt = (id, name, roleId) => {
  const token = jwt.sign(
    { userId: id, name, roleId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  )
  return token
}

module.exports = {
  checkUserFields,
  createJwt,
  hashPassword,
  decodePassword,
  checkCarFields
}
