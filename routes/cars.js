const express = require('express')
const router = express.Router()
const authMiddlware = require('../middleware/authentication')
const { getAllCars, createCar } = require('../controllers/cars')

router.route('/')
  .post(authMiddlware, createCar)
  .get(getAllCars)

module.exports = router
