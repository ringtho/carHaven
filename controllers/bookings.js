const { StatusCodes } = require('http-status-codes')
const pool = require('../db/db')
const { BadRequestError, NotFoundError } = require('../errors')
const { checkCarExists } = require('./cars')
const { checkBookingFields } = require('./utils')

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
  const car = await pool.query(
    'SELECT * FROM bookings WHERE booking_id = $1', [bookingId]
  )

  if (car.rows.length === 0) {
    throw new NotFoundError(`Not found booking with id: ${bookingId}`)
  }

  res.status(StatusCodes.OK).json(car.rows[0])
}

module.exports = {
  createBooking,
  getAllBookings,
  getSingleBooking
}
