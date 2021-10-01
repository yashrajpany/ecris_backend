const express = require('express')
const {
  register,
  login,
  getMe,
  updateDetails,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth')
const { protect } = require('../middleware/auth')

const router = express.Router()
router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.get('/updatedetails', protect, updateDetails)
router.get('/forgotpassword', forgotPassword)
router.put('/resetpassword/:resettoken', resetPassword)

module.exports = router
