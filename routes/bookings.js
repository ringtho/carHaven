const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authentication')
const {
  createBooking,
  getAllBookings,
  getSingleBooking,
  cancelBooking
} = require('../controllers/bookings')

router.route('/')
  .post(authMiddleware, createBooking)
  .get(authMiddleware, getAllBookings)

router.route('/:id')
  .get(authMiddleware, getSingleBooking)
  .delete(authMiddleware, cancelBooking)

module.exports = router
