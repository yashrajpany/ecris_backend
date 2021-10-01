const express = require('express')

const { getReviews } = require('../controllers/reviews')

const router = express.Router({ mergeParams: true })

const advancedResults = require('../middleware/advancedResults')

const { protect, authorize } = require('../middleware/auth')
const Reviews = require('../models/Review')

router.route('/').get(
  advancedResults(Reviews, {
    path: 'bootcamp',
    select: 'name description',
  }),
  getReviews
)

module.exports = router
