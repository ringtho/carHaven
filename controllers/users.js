const { StatusCodes } = require('http-status-codes')
const pool = require('../db/db')
const { UnAuthorizedError, NotFoundError } = require('../errors')
const {
  hashPassword,
  decodePassword
} = require('./utils')

const checkUserExists = async (userId) => {
  const userResult = await pool.query(
    'SELECT * FROM users WHERE user_id=$1', [userId]
  )
  const user = userResult.rows[0]
  if (!user) {
    throw new NotFoundError(`No user with id: ${userId}`)
  }
  return user
}

const getAllUsers = async (req, res) => {
  const usersResult = await pool.query(
    'SELECT * FROM users ORDER BY name DESC')
  const users = usersResult.rows
  res.status(StatusCodes.OK).json({ users, count: users.length })
}

const getUserProfile = async (req, res) => {
  const { userId } = req.user
  const userResult = await pool.query(
    `SELECT name, email, last_login, created_on, role_id 
    FROM users WHERE user_id=$1`, [userId]
  )
  const user = userResult.rows[0]
  if (!user) {
    throw NotFoundError(`User with id: ${userId} not found`)
  }
  res.status(StatusCodes.OK).json({ user })
}

const updatePassword = async (req, res) => {
  const { user: { userId }, body: { oldPassword, newPassword } } = req
  const user = await pool.query(
    'SELECT * FROM users WHERE user_id=$1', [userId]
  )
  const { password: rawPassword } = user.rows[0]
  const isPasswordCorrect = await decodePassword(oldPassword, rawPassword)
  if (!isPasswordCorrect) {
    throw new UnAuthorizedError('Incorrect old password provided')
  }
  const encodedPassword = await hashPassword(newPassword)
  const updateUser = await pool.query(
    'UPDATE users SET password = $1 WHERE user_id = $2 RETURNING name',
    [encodedPassword, userId]
  )
  res.status(StatusCodes.OK).json({
    success: true,
    msg: `Successfully updated the password for ${updateUser.rows[0].name}`
  })
}

module.exports = {
  getAllUsers,
  getUserProfile,
  checkUserExists,
  updatePassword
}
