const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponce = require('../utils/errorResponce')
const User = require('../models/User')

exports.protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  //   else if (req.cookies.token) {
  //     token = req.cookies.token
  //   }

  //   Make sure token exits
  if (!token) {
    return next(new ErrorResponce('Not authorized to access this route', 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    next()
  } catch (err) {
    return next(new ErrorResponce('Not authorized to access this route', 401))
  }
})
