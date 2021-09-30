const ErrorResponce = require('../utils/errorResponce')
const User = require('../models/User')
const asyncHandler = require('../middleware/async')

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, key } = req.body

  //   Create User
  const user = await User.create({
    name,
    email,
    password,
    role,
    key,
  })

  sendTokenResponce(user, 200, res)
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

  sendTokenResponce(user, 200, res)
})

const sendTokenResponce = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken()
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }
  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token })
}

// @desc Get logged in user
// @route GET /api/v1/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user,
  })
})
