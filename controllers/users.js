const ErrorResponce = require('../utils/errorResponce')
const User = require('../models/User')
const asyncHandler = require('../middleware/async')

// @desc      Get all users using admin key
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const key = req.user.id
  const users = await User.find({ key })
  res.status(200).json({
    success: true,
    data: users,
  })
})

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const key = req.user.id
  const { name, email, password, role } = req.body

  if (role === 'user' || !role) {
    return next(new ErrorResponce('Admins can create publishers only', 400))
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    key,
  })

  res.status(201).json({
    success: true,
    data: user,
  })
})

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc      Delete me
// @route     DELETE /api/v1/users/
// @access    Private/Admin
exports.deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id)

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc      Remove a user using from admin key
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
exports.deletePublisher = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  user.key = undefined
  await user.save()

  res.status(200).json({
    success: true,
    data: user,
  })
})
