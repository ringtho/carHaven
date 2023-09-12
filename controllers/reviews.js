const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const pool = require('../db/db')
const { checkCarExists } = require('./cars')
const { checkUserExists } = require('./users')

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

const getAllReviews = async (req, res) => {
  const reviewsResult = pool.query('SELECT * FROM reviews')
  const reviews = (await reviewsResult).rows
  if (reviews.length === 0) {
    throw new NotFoundError('There are currently no reviews')
  }
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getReviewsByCar = async (req, res) => {
  const { carId } = req.params
  await checkCarExists(carId)
  const reviewsResult = await pool.query(
    'SELECT * FROM reviews WHERE car_id = $1', [carId]
  )
  const reviews = reviewsResult.rows
  if (reviews.length === 0) {
    throw new NotFoundError('This car has not been reviewed yet')
  }
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getReviewsByUser = async (req, res) => {
  const { userId } = req.params
  await checkUserExists(userId)
  const reviewsResult = await pool.query(
    'SELECT * FROM reviews WHERE user_id = $1',
    [userId]
  )
  const reviews = reviewsResult.rows
  if (reviews.length === 0) {
    throw new NotFoundError(`No reviews by user with id ${userId}`)
  }
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

module.exports = {
  createReview,
  getReviewsByCar,
  getAllReviews,
  getReviewsByUser
}
