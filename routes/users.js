const express = require('express')
const router = express.Router()
const authMiddlware = require('../middleware/authentication')
const {
  register,
  login,
  updatePassword
} = require('../controllers/users')

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/update-password')
  .patch(authMiddlware, updatePassword)

module.exports = router
