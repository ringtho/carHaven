const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authentication')
const { createReview } = require('../controllers/reviews')

router.route('/')
  .post(authMiddleware, createReview)

module.exports = router
