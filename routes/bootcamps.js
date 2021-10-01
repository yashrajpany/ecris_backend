const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps')

const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

const Bootcamp = require('../models/Bootcamp')

// Include other resource router
const reviewRouter = require('./reviews')

const advancedResults = require('../middleware/advancedResults')

// Re-route into other resource router
router.use('/:bootcampId/reviews', reviewRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

router
  .route('/')
  .get(advancedResults(Bootcamp), getBootcamps)
  .post(protect, authorize('admin'), createBootcamp)

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('admin'), deleteBootcamp)

module.exports = router
