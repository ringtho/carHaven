const jwt = require('jsonwebtoken')
const { UnAuthorizedError } = require('../errors')

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnAuthorizedError('Authentication Invalid')
  }
  const token = authHeader.split(' ')[1]
  try {
    const { userId, name } = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { userId, name }
    next()
  } catch (error) {
    throw new UnAuthorizedError('Authentication Invalid')
  }
}

module.exports = authenticateUser
