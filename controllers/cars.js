const { StatusCodes } = require('http-status-codes')
const { checkCarFields } = require('./utils')
const pool = require('../db/db')

const { NotFoundError } = require('../errors')

const checkCarExists = async (carId) => {
  const car = await pool.query(
    'SELECT * FROM cars WHERE car_id = $1',
    [carId]
  )
  if (car.rows.length === 0) {
    throw new NotFoundError(`No item with id ${carId} was found`)
  }
  return car
}

const createCar = async (req, res) => {
  const { userId } = req.user
  const { make, model, description, rentalPrice } = req.body
  checkCarFields(make, model, description, rentalPrice)
  const now = new Date()
  const car = await pool.query(
    `INSERT INTO cars (make, model, description, rental_price, 
      available, user_id, created_on, updated_on) VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [make, model, description, rentalPrice, true, userId, now, now]
  )
  res.status(StatusCodes.CREATED).json({ car: car.rows })
}

const getAllCars = async (req, res) => {
  const cars = await pool.query(
    'SELECT * FROM cars ORDER BY updated_on DESC'
  )
  res.status(StatusCodes.OK).json({
    cars: cars.rows,
    count: cars.rows.length
  })
}

const getSingleCar = async (req, res) => {
  const { carId } = req.params
  const car = await checkCarExists(carId)
  res.status(StatusCodes.OK).json(car.rows[0])
}

const updateCar = async (req, res) => {
  const { params: { carId }, user: { userId } } = req
  const { make, model, description, rentalPrice, available } = req.body
  checkCarFields(make, model, description, rentalPrice)
  await checkCarExists(carId)
  const now = new Date()
  const updatedCar = await pool.query(
    `UPDATE cars SET  make=$1, model=$2, description=$3, rental_price=$4,
    available=$5, updated_on=$6 WHERE car_id=$7 AND user_id=$8 
    RETURNING *`,
    [make, model, description, rentalPrice, available, now, carId, userId]
  )
  if (updatedCar.rows.length === 0) {
    throw new NotFoundError(`No item with id ${carId} was found`)
  }
  res.status(StatusCodes.OK).json({
    car: updatedCar.rows
  })
}

const deleteCar = async (req, res) => {
  const { params: { carId }, user: { userId } } = req
  await checkCarExists(carId)
  const car = await pool.query(
    'DELETE FROM cars WHERE car_id=$1 AND user_id=$2 RETURNING *',
    [carId, userId]
  )
  if (car.rows.length === 0) {
    throw new NotFoundError(`No item with id ${carId} was found`)
  }
  res.status(StatusCodes.OK).json({
    msg: `Successfully deleted item with id: ${carId}`
  })
}

module.exports = {
  getAllCars,
  getSingleCar,
  createCar,
  updateCar,
  deleteCar,
  checkCarExists
}
