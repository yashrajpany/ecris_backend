const path = require('path')
const ErrorResponce = require('../utils/errorResponce')
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc Get single bootcamps
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponce(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  })
})

// @desc Create new bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user
  req.body.user = req.user.id

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

  // If user is not admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponce(
        `The user with ID ${req.user.id} cannot publish bootcamp`,
        400
      )
    )
  }

  const bootcamp = await Bootcamp.create(req.body)

  res.status(201).json({
    success: true,
    data: bootcamp,
  })
})

// @desc Update bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponce(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }
  // Make sure user is Bootcamp owner
  if (
    bootcamp.user.toString() !== req.user.id &&
    bootcamp.user.toString() !== req.user.key
  ) {
    return next(
      new ErrorResponce(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    )
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: bootcamp,
  })
})

// @desc Delete bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponce(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }
  // Make sure user is Bootcamp owner
  if (
    bootcamp.user.toString() !== req.user.id &&
    bootcamp.user.toString() !== req.user.key
  ) {
    return next(
      new ErrorResponce(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    )
  }

  bootcamp.remove()

  res.status(200).json({
    success: true,
    data: bootcamp,
  })
})

// @desc Get bootcamps withtin a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params

  //    Getting lat/lng from geocoder

  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  //    Calculating radius in km (for miles divide by 3963)
  const radius = distance / 6378
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  })
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  })
})

// @desc Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponce(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  // Make sure user is Bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponce(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    )
  }

  if (!req.files) {
    return next(new ErrorResponce(`Please upload a file`, 400))
  }

  const file = req.files.file
  // To check for image files
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponce(`Please upload an image file`, 400))
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponce(
        `Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    )
  }

  // Create custom file name
  file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.err(err)
      return next(new ErrorResponce(`Problem with file upload`, 500))
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

    res.status(200).json({
      success: true,
      data: file.name,
    })
  })
})
