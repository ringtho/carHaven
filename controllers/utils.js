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
  checkFields,
  createJwt,
  hashPassword,
  decodePassword
}
