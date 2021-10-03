const express = require('express')
const {
  getApplyEvent,
  applyEvent,
  removeApplyEvent,
} = require('../controllers/apply')

const router = express.Router({ mergeParams: true })

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

const Apply = require('../models/Apply')

router.use(protect)
router.use(authorize('user'))

router.route('/').get(
  advancedResults(Apply, {
    path: 'bootcamp',
    select: 'name',
  }),
  getApplyEvent
)
router.route('/:id').post(applyEvent).delete(removeApplyEvent)

module.exports = router
