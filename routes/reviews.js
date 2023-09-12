const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authentication')
const { createReview, getAllReviews } = require('../controllers/reviews')

router.route('/')
  .post(authMiddleware, createReview)
  .get(getAllReviews)

module.exports = router
