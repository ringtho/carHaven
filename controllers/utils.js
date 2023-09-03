const { BadRequestError } = require('../errors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const checkFields = (email, name, password) => {
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

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

const decodePassword = async (rawPassword, password) => {
  return await bcrypt.compare(rawPassword, password)
}

const createJwt = (id, name) => {
  const token = jwt.sign(
    { userId: id, name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  )
  return token
}

module.exports = {
  checkFields,
  createJwt,
  hashPassword,
  decodePassword
}
