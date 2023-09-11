const express = require('express')
const router = express.Router()
const authMiddlware = require('../middleware/authentication')
const {
  updatePassword,
  getUserProfile,
  getAllUsers
} = require('../controllers/users')

router.route('/')
  .get(authMiddlware, getAllUsers)
router.route('/profile')
  .get(authMiddlware, getUserProfile)
router.route('/update-password')
  .patch(authMiddlware, updatePassword)
module.exports = router
