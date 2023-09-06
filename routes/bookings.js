const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authentication')
const {
  createBooking,
  getAllBookings,
  getSingleBooking,
  cancelBooking,
  updateBooking
} = require('../controllers/bookings')

router.route('/')
  .post(authMiddleware, createBooking)
  .get(authMiddleware, getAllBookings)

router.route('/:id')
  .get(authMiddleware, getSingleBooking)
  .delete(authMiddleware, cancelBooking)
  .patch(authMiddleware, updateBooking)

module.exports = router
