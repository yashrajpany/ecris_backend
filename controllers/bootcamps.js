const path = require('path')
const ErrorResponce = require('../utils/errorResponce')
const Bootcamp = require('../models/Bootcamp')
const User = require('../models/User')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const sendEmail = require('../utils/sendEmail')

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
  req.body.phone = req.user.phone
  req.body.email = req.user.email
  req.body.institute = req.user.institute
  req.body.dept = req.user.dept

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

  // If user is not admin, they cannot add bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponce(
        `The user with ID ${req.user.id} cannot publish bootcamp`,
        400
      )
    )
  }

  const bootcamp = await Bootcamp.create(req.body)

  // Sending email to user for notification of event
  if (req.body.criteria === 'Private') {
    const user = await User.find({
      dept: req.user.dept,
      institute: req.user.institute,
      role: 'user',
    })
    const emails = []
    let message

    Object.values(user).forEach((user) => {
      emails.push(user.email)
    })

    // Sending email of confirmation
    if (bootcamp.address) {
      message = `A new event ${bootcamp.name} is added. The details for the following are: \n\n Mode of conduct: ${bootcamp.mode} \n\n Address/Link: ${bootcamp.address} \n\n Date: ${bootcamp.date} \n\n Time: ${bootcamp.time} \n\n For further information contact below \n\n ${bootcamp.email} \n\n ${bootcamp.phone}`
    } else {
      message = `A new event ${bootcamp.name} is added. The details for the following are: \n\n Mode of conduct: ${bootcamp.mode} \n\n Address/Link: ${bootcamp.link} \n\n Date: ${bootcamp.date} \n\n Time: ${bootcamp.time} \n\n For further information contact below \n\n ${bootcamp.email} \n\n ${bootcamp.phone}`
    }

    emails.forEach(async (email) => {
      try {
        await sendEmail({
          email: email,
          subject: `New event from ${req.user.name} ECRIS`,
          message,
        })
      } catch (err) {
        console.log(err)
        return next(new ErrorResponce('Email could not be sent', 500))
      }
    })
  }

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
  // Make sure user is Bootcamp owner/admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponce(
        `User ${req.params.id} is not authorized to delete this bootcamp`,
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
