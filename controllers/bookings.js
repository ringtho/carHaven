const { StatusCodes } = require('http-status-codes')
const pool = require('../db/db')
const { BadRequestError, NotFoundError } = require('../errors')
const { checkCarExists } = require('./cars')
const { checkBookingFields } = require('./utils')

const checkBookingExists = async (bookingId) => {
  const booking = await pool.query(
    'SELECT * FROM bookings WHERE booking_id = $1', [bookingId]
  )
  if (booking.rows.length === 0) {
    throw new NotFoundError(`Not found booking with id: ${bookingId}`)
  }
  return booking
}

const createBooking = async (req, res) => {
  const { carId, price, bookingDate, returnDate } = req.body
  const { userId } = req.user
  checkBookingFields(carId, price, bookingDate, returnDate)
  const carResult = await checkCarExists(carId)
  const car = carResult.rows[0]
  if (!car || !car.available) {
    throw new BadRequestError('Car is not available for booking')
  }
  const bookingResult = await pool.query(
    `INSERT INTO bookings (car_id, user_id, price, booking_date, return_date)
    VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [carId, userId, price, bookingDate, returnDate]
  )

  await pool.query(
    'UPDATE cars SET available = false WHERE car_id = $1', [carId]
  )
  res.status(StatusCodes.CREATED).json(bookingResult.rows[0])
}

const getAllBookings = async (req, res) => {
  const bookings = await pool.query('SELECT * FROM bookings')
  res.status(StatusCodes.OK)
    .json({ bookings: bookings.rows, count: bookings.rows.length })
}

const getSingleBooking = async (req, res) => {
  const bookingId = req.params.id
  const bookingResult = await checkBookingExists(bookingId)
  const booking = bookingResult.rows[0]
  res.status(StatusCodes.OK).json({ booking })
}

const updateBooking = async (req, res) => {
  const { userId } = req.user
  const { bookingDate, returnDate } = req.body
  if (!bookingDate || !returnDate) {
    throw new BadRequestError('Please provide a booking date or return date')
  }
  const bookingId = req.params.id
  await checkBookingExists(bookingId)
  const bookingResult = await pool.query(
    `UPDATE bookings SET booking_date=$1, return_date=$2 
    WHERE user_id=$3 AND booking_id=$4 RETURNING *`,
    [bookingDate, returnDate, userId, bookingId]
  )
  const booking = bookingResult.rows[0]
  if (!booking) {
    throw new BadRequestError(`No booking with id ${bookingId} was found`)
  }
  res.status(StatusCodes.OK).json({ booking })
}

const cancelBooking = async (req, res) => {
  const { userId } = req.user
  const bookingId = req.params.id
  await checkBookingExists(bookingId)
  const bookingResult = await pool.query(
    'DELETE FROM bookings WHERE booking_id = $1 AND user_id = $2 RETURNING *',
    [bookingId, userId]
  )
  const booking = bookingResult.rows[0]
  if (!booking) {
    throw new NotFoundError(`No booking with id ${bookingId} was found`)
  }
  const { car_id: carId } = booking
  await checkCarExists(carId)
  await pool.query(
    'UPDATE cars SET available=true WHERE car_id = $1', [carId]
  )
  res.status(StatusCodes.OK)
    .json({ msg: `Successfully deleted booking with id: ${bookingId}` })
}

const getBookingsByCar = async (req, res) => {
  const { carId } = req.params
  const bookingsResult = await pool.query(
    'SELECT * FROM bookings WHERE car_id = $1', [carId]
  )
  const bookings = bookingsResult.rows
  if (!bookings[0]) {
    throw new NotFoundError(`No bookings for car with id ${carId}`)
  }

  res.status(StatusCodes.OK).json({ bookings, count: bookings.length })
}

const getBookingsByUser = async (req, res) => {
  const { userId } = req.params
  const bookingsResult = await pool.query(
    'SELECT * FROM bookings WHERE user_id = $1', [userId]
  )
  const bookings = bookingsResult.rows
  if (!bookings[0]) {
    throw new NotFoundError(`No bookings for user with id ${userId}`)
  }

  res.status(StatusCodes.OK).json({ bookings, count: bookings.length })
}

module.exports = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  cancelBooking,
  updateBooking,
  getBookingsByCar,
  getBookingsByUser
}
