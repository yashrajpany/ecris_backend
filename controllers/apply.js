const ErrorResponce = require('../utils/errorResponce')
const Apply = require('../models/Apply')
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')

// // @desc      Get all applied to event
// // @route     GET /api/v1/bootcamps/:bootcampId/apply
// // @access    Private
// exports.getApplyAdmin = asyncHandler(async (req, res, next) => {
//   const result = await Bootcamp.find(req.params.bootcampId)

//   // Make sure review belongs to user or user is admin
//   if (result.user.toString() !== req.user.id) {
//     return next(new ErrorResponce(`Not authorized`, 401))
//   }

//   if (req.params.bootcampId) {
//     const applys = await Apply.find({
//       bootcamp: req.params.bootcampId,
//     })

//     return res.status(200).json({
//       success: true,
//       count: applys.length,
//       data: applys,
//     })
//   } else {
//     res.status(200).json(res.advancedResults)
//   }
// })

// @desc      Get all applied event for user
// @route     GET /api/v1/apply
// @access    Private
exports.getApplyEvent = asyncHandler(async (req, res, next) => {
  if (req.user.id) {
    const applys = await Apply.find({ user: req.user.id }).populate({
      path: 'bootcamp',
      select: 'name',
    })

    return res.status(200).json({
      success: true,
      count: applys.length,
      data: applys,
    })
  }
})

// @desc      Apply for a event
// @route     POST /api/v1/apply/:id
// @access    Private
exports.applyEvent = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponce(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    )
  }
  const result = await Apply.create({
    bootcamp: req.params.id,
    user: req.user.id,
  })
  res.status(201).json({
    success: true,
    data: result,
  })
})

// @desc      Remove applied event
// @route     Delete /api/v1/apply/:id
// @access    Private
exports.removeApplyEvent = asyncHandler(async (req, res, next) => {
  const result = await Apply.findById(req.params.id)

  if (!result) {
    return next(
      new ErrorResponce(`No applied event with the id of ${req.params.id}`, 404)
    )
  }

  // Make sure review belongs to user or user is admin
  if (result.user.toString() !== req.user.id) {
    return next(new ErrorResponce(`Not authorized `, 401))
  }

  await result.remove()

  res.status(200).json({
    success: true,
    data: result,
  })
})
