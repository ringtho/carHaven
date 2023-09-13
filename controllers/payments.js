const { StatusCodes } = require('http-status-codes')
const { checkBookingExists } = require('./bookings')
const { BadRequestError, NotFoundError } = require('../errors')
const pool = require('../db/db')

const createPayment = async (req, res) => {
  const { bookingId, amount, status } = req.body
  const { userId } = req.user
  if (!amount || !status) {
    throw new BadRequestError('Please provide an amount or status')
  }
  if (!bookingId) {
    throw new BadRequestError('Please provide a booking Id')
  }
  await checkBookingExists(bookingId)
  const paymentResult = await pool.query(
    `INSERT INTO payments (booking_id, user_id, amount, status)
    VALUES($1, $2, $3, $4) RETURNING *`,
    [bookingId, userId, amount, status]
  )
  const payment = paymentResult.rows[0]
  res.status(StatusCodes.CREATED).json({ payment })
}

const getPayments = async (req, res) => {
  const paymentResults = await pool.query(
    'SELECT * FROM payments'
  )
  const payments = paymentResults.rows
  if (payments.length === 0) {
    throw new NotFoundError('There are no payments made on the platform')
  }
  res.status(StatusCodes.OK).json({ payments })
}

const getPaymentsByUser = async (req, res) => {
  const { userId } = req.params
  const paymentResults = await pool.query(
    'SELECT * FROM payments WHERE user_id=$1', [userId]
  )
  const payments = paymentResults.rows
  if (payments.length === 0) {
    throw new NotFoundError(`There are no payments made by user with id: ${userId}`)
  }
  res.status(StatusCodes.OK)
    .json({ payments, count: payments.length })
}

const updatePayment = async (req, res) => {
  const { body: { status }, user: { userId } } = req
  const { id: paymentId } = req.params
  if (!status) {
    throw new BadRequestError('Please provide a status')
  }
  const paymentResult = await pool.query(
    `UPDATE payments SET status=$1 WHERE user_id = $2 
    AND id = $3 RETURNING *`,
    [status, userId, paymentId]
  )
  const payment = paymentResult.rows[0]
  if (!payment) {
    throw new NotFoundError(`No payment with id: ${payment} found`)
  }
  res.status(StatusCodes.OK).json({ payment })
}

module.exports = {
  createPayment,
  getPayments,
  getPaymentsByUser,
  updatePayment
}
