const express = require('express')
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteMe,
  deletePublisher,
} = require('../controllers/users')

// Include other resource router
const applyRouter = require('./apply')
const router = express.Router({ mergeParams: true })

// Re-route into other resource router
router.use('/:userId/apply', applyRouter)

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
router.route('/').delete(deleteMe)

router.use(authorize('admin'))

router.route('/').get(getUsers).post(createUser)

router.route('/:id').get(getUser).put(updateUser).delete(deletePublisher)

module.exports = router
