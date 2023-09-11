const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authentication')
const {
  getAllCars,
  createCar,
  getSingleCar,
  getAvailableCars,
  updateCar,
  deleteCar
} = require('../controllers/cars')
const { getBookingsByCar } = require('../controllers/bookings')

router.route('/')
  .post(authMiddleware, createCar)
  .get(getAllCars)
router.route('/available')
  .get(getAvailableCars)
router.route('/:carId')
  .get(getSingleCar)
  .put(authMiddleware, updateCar)
  .delete(authMiddleware, deleteCar)
router.route('/:carId/bookings')
  .get(getBookingsByCar)

module.exports = router
