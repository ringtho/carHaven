const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('../errors/custom-error')

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message })
  }

  if (err.code === '22P02') {
    console.log(err)
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: `No item with id ${err} was found`
    })
  }
  console.log(err)
  res.status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: 'Something went wrong, Please try again later' })
}

module.exports = errorHandler
