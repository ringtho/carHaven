const express = require('express')
const router = express.Router()
const authMiddlware = require('../middleware/authentication')
const {
  updatePassword,
  getUserProfile,
  getAllUsers
} = require('../controllers/users')
const { getBookingsByUser } = require('../controllers/bookings')
const { getReviewsByUser } = require('../controllers/reviews')

router.route('/')
  .get(authMiddlware, getAllUsers)
router.route('/profile')
  .get(authMiddlware, getUserProfile)
router.route('/update-password')
  .patch(authMiddlware, updatePassword)
router.route('/:userId/bookings')
  .get(getBookingsByUser)
router.route('/:userId/reviews')
  .get(getReviewsByUser)
module.exports = router
