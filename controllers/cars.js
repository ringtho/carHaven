const { StatusCodes } = require('http-status-codes')
const { checkCarFields } = require('./utils')
const pool = require('../db/db')
const { UnAuthorizedError } = require('../errors')

const getAllCars = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: 'All Cars' })
}

const createCar = async (req, res) => {
  const { userId } = req.user
  const { make, model, description, rentalPrice } = req.body
  checkCarFields(make, model, description, rentalPrice)
  const now = new Date()
  const car = await pool.query(
    `INSERT INTO cars (make, model, description, rental_price, 
      availability_dates, user_id, created_on, updated_on) VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [make, model, description, rentalPrice, now, userId, now, now]
  )
  res.status(StatusCodes.CREATED).json({ car: car.rows })
}

module.exports = {
  getAllCars,
  createCar
}
