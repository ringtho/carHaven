const { StatusCodes } = require('http-status-codes')
const {
  checkUserFields,
  hashPassword,
  createJwt,
  decodePassword
} = require('./utils')
const pool = require('../db/db')
const { BadRequestError, UnAuthorizedError } = require('../errors')

const register = async (req, res) => {
  const { email, name, password, roleId } = req.body
  const now = new Date()
  checkUserFields(email, name, password)
  let role
  if (!roleId) {
    role = 3
  } else {
    role = roleId
  }
  const newPassword = await hashPassword(password)
  const user = await pool.query(
    `INSERT INTO users (name, email, password, role_id, created_on, last_login)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING user_id, name, email, created_on, last_login`,
    [name, email, newPassword, role, now, now]
  )
  const { id, name: fullName } = user.rows[0]
  const token = createJwt(id, fullName, role)
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
  if (user.rows.length === 0) {
    throw new UnAuthorizedError('Incorrect username or password')
  }
  const { user_id: id, name, password: rawPassword, role_id: role } = user.rows[0]
  const isPasswordCorrect = await decodePassword(password, rawPassword)
  if (!isPasswordCorrect) {
    throw new UnAuthorizedError('Incorrect username or password')
  }
  const now = new Date()
  await pool.query('UPDATE users SET last_login = $1 WHERE email = $2',
    [now, email])
  const token = createJwt(id, name, role)
  res.status(StatusCodes.CREATED).json({ user: { name }, token })
}

module.exports = {
  register,
  login
}
