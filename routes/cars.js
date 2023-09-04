const express = require('express')
const router = express.Router()
const authMiddlware = require('../middleware/authentication')
const { getAllCars, createCar } = require('../controllers/cars')

router.route('/')
  .post(authMiddlware, createCar)
  .get(authMiddlware, getAllCars)

module.exports = router
