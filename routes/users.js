const express = require('express')
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deletePublisher,
} = require('../controllers/users')

const User = require('../models/User')

// Include other resource router
const applyRouter = require('./apply')
const router = express.Router({ mergeParams: true })

// Re-route into other resource router
router.use('/:userId/apply', applyRouter)

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
router.use(authorize('admin'))

router.route('/').get(getUsers).post(createUser)

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)
  .delete(deletePublisher)

module.exports = router
