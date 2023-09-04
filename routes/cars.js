const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authentication')
const {
  getAllCars,
  createCar,
  getSingleCar,
  updateCar,
  deleteCar
} = require('../controllers/cars')

router.route('/')
  .post(authMiddleware, createCar)
  .get(getAllCars)
router.route('/:carId')
  .get(getSingleCar)
  .put(authMiddleware, updateCar)
  .delete(authMiddleware, deleteCar)

module.exports = router
