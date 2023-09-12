const { StatusCodes } = require('http-status-codes')
const { BadRequestError } = require('../errors')
const pool = require('../db/db')
const { checkCarExists } = require('./cars')

const createReview = async (req, res) => {
  const { carId, rating, comment } = req.body
  const { userId } = req.user
  if (!rating || !comment) {
    throw new BadRequestError('Please provide a rating or comment')
  }
  if (!carId) {
    throw new BadRequestError('Please provide a car Id')
  }
  await checkCarExists(carId)
  const now = new Date()
  const reviewResult = await pool.query(
    `INSERT INTO reviews (car_id, user_id, rating, comment, created_on) 
    VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [carId, userId, rating, comment, now]
  )
  const review = reviewResult.rows[0]
  res.status(StatusCodes.CREATED).json({ review })
}

module.exports = {
  createReview
}
