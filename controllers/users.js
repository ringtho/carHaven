const { StatusCodes } = require('http-status-codes')
const { checkFields, hashPassword, createJwt, decodePassword } = require('./utils')
const pool = require('../db/db')
const { BadRequestError, UnAuthorizedError } = require('../errors')

const register = async (req, res) => {
  const { email, name, password } = req.body
  const now = new Date()
  checkFields(email, name, password)
  const newPassword = await hashPassword(password)
  const user = await pool.query(
    `INSERT INTO users (name, email, password, created_on, last_login)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, created_on, last_login`,
    [name, email, newPassword, now, now]
  )
  const { id, name: fullName } = user.rows[0]
  const token = createJwt(id, fullName)
  res.status(StatusCodes.CREATED).json({ user: { name: fullName }, token })
}

const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new BadRequestError('Please provide an email or password')
  }
  const user = await pool.query(
    'SELECT * FROM users WHERE email = $1', [email]
  )
  if (!user) {
    throw new UnAuthorizedError('Incorrect username or password')
  }
  const { id, name, password: rawPassword } = user.rows[0]
  const isPasswordCorrect = await decodePassword(password, rawPassword)
  if (!isPasswordCorrect) {
    throw new UnAuthorizedError('Incorrect username or password')
  }
  const token = createJwt(id, name)
  res.status(StatusCodes.CREATED).json({ user: { name }, token })
}

const updatePassword = async (req, res) => {
  const { user: { userId }, body: { oldPassword, newPassword } } = req
  const user = await pool.query(
    'SELECT * FROM users WHERE id=$1', [userId]
  )
  const { password: rawPassword } = user.rows[0]
  const isPasswordCorrect = await decodePassword(oldPassword, rawPassword)
  if (!isPasswordCorrect) {
    throw new UnAuthorizedError('Incorrect old password provided')
  }
  const encodedPassword = await hashPassword(newPassword)
  const updateUser = await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING name',
    [encodedPassword, userId]
  )
  res.status(StatusCodes.OK).json({
    success: true,
    msg: `Successfully updated the password for ${updateUser.rows[0].name}`
  })
}

module.exports = {
  register,
  login,
  updatePassword
}
