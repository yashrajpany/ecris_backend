const ErrorResponce = require('../utils/errorResponce')
const Apply = require('../models/Apply')
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')
const sendEmail = require('../utils/sendEmail')

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

  if (bootcamp.criteria === 'Public') {
    const apply = await Apply.find({
      bootcamp: req.params.id,
      user: req.user.id,
    })

    if (apply.length !== 1) {
      // Sending email of confirmation
      const message = `You have successfully applied to the event ${bootcamp.name}. The details for the following are: \n\n Mode of conduct: ${bootcamp.mode} \n\n Address/Link: ${bootcamp.location.formattedAddress} ${bootcamp.location.city} ${bootcamp.location.state} \n\n For further information contact below \n\n ${bootcamp.email} \n\n ${bootcamp.phone}`

      try {
        await sendEmail({
          email: req.user.email,
          subject: 'Successfully applied to event from ECRIS',
          message,
        })
      } catch (err) {
        console.log(err)
        return next(new ErrorResponce('Email could not be sent', 500))
      }

      // Applying to event
      await Apply.create({
        bootcamp: req.params.id,
        user: req.user.id,
      })

      res.status(201).json({
        success: true,
        data: 'Successfully enrolled!',
      })
    } else {
      return next(new ErrorResponce(`Already enrolled to the event`, 409))
    }
  } else if (
    bootcamp.dept === req.user.dept &&
    bootcamp.institute === req.user.institute
  ) {
    const apply = await Apply.find({
      bootcamp: req.params.id,
      user: req.user.id,
    })

    if (apply.length !== 1) {
      // Sending email of confirmation
      const message = `You have successfully applied to the event ${bootcamp.name}. The details for the following are: \n\n Mode of conduct: ${bootcamp.mode} \n\n Address/Link: ${bootcamp.location.formattedAddress} ${bootcamp.location.city} ${bootcamp.location.state} \n\n For further information contact below \n\n ${bootcamp.email} \n\n ${bootcamp.phone}`

      try {
        await sendEmail({
          email: req.user.email,
          subject: 'Successfully applied to event from ECRIS',
          message,
        })
      } catch (err) {
        console.log(err)
        return next(new ErrorResponce('Email could not be sent', 500))
      }

      // Applying to event
      await Apply.create({
        bootcamp: req.params.id,
        user: req.user.id,
      })

      res.status(201).json({
        success: true,
        data: 'Successfully enrolled!',
      })
    } else {
      return next(new ErrorResponce(`Already enrolled to the event`, 409))
    }
  } else {
    console.log(req.user.dept)
    console.log(req.user.institute)
    return next(new ErrorResponce(`This is a private event`, 400))
  }
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

  await Apply.findByIdAndDelete(req.params.id)

  res.status(200).json({
    success: true,
    data: 'Successfully disenroll',
  })
})
