const ErrorResponce = require('../utils/errorResponce')
const User = require('../models/User')
const asyncHandler = require('../middleware/async')

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body

  //   Create User
  const user = await User.create({
    name,
    email,
    password,
    role,
  })

  //   Create token
  const token = user.getSignedJwtToken()
  res.status(200).json({ success: true, token })
})

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  //    Validation email and password
  if (!email || !password) {
    return next(new ErrorResponce('Please provide and email and password', 400))
  }

  //   Check User
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorResponce('Invalid credentials', 401))
  }

  //   Password match
  const isMatch = await user.matchPassword(password)

  if (!isMatch) {
    return next(new ErrorResponce('Invalid credentials', 401))
  }

  //   Create token
  const token = user.getSignedJwtToken()
  res.status(200).json({ success: true, token })
})
