require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()

const cors = require('cors')

const userRouter = require('./routes/users')
const carRouter = require('./routes/cars')

const errorHandlerMiddleware = require('./middleware/error-handler')
const notFoundMiddleware = require('./middleware/not-found')
app.use(cors())
app.use(express.json())

app.get('/api/v1', (req, res) => {
  res.status(200).send('Car Rental API')
})

app.use('/api/v1/auth', userRouter)
app.use('/api/v1/cars', carRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 5050
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
