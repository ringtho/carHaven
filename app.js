require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()
const notFoundMiddleware = require('./middleware/not-found')

app.get('/api/v1', (req, res) => {
  res.status(200).send('Car Rental API')
})
app.use(notFoundMiddleware)

const PORT = process.env.PORT || 5050
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
