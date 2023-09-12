const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authentication')
const { createReview, getReviewsByCar } = require('../controllers/reviews')

router.route('/')
  .post(authMiddleware, createReview)
router.route('/:id')
  .get(getReviewsByCar)

module.exports = router
