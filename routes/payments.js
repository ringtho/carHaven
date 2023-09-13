const express = require('express')
const router = express.Router()
const { createPayment, getPayments, updatePayment } = require('../controllers/payments')
const authMiddleware = require('../middleware/authentication')

router.route('/')
  .post(authMiddleware, createPayment)
  .get(getPayments)
router.route('/:id')
  .patch(authMiddleware, updatePayment)

module.exports = router
