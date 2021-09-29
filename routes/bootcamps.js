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

const { protect } = require('../middleware/auth')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/:id/photo').put(protect, bootcampPhotoUpload)

router
  .route('/')
  .get(advancedResults(Bootcamp), getBootcamps)
  .post(protect, createBootcamp)

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp)

module.exports = router
