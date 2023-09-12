const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authentication')
const { createReview, getReviewsByCar, getAllReviews } = require('../controllers/reviews')

router.route('/')
  .post(authMiddleware, createReview)
  .get(getAllReviews)
router.route('/:id')
  .get(getReviewsByCar)

module.exports = router
