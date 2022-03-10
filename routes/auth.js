const express = require('express')
const { signup , signin , signout , forgotPassword,resetPassword,socialLogin} = require('../controllers/auth')
const { userById } = require('../controllers/user')
const validator = require('../validators/index')

const router = express.Router()

router.post("/signup" ,validator.userSignupValidator, signup)
router.post("/signin" , signin)
router.get("/signout" , signout)
router.put("/forget-password" , forgotPassword)
router.put("/reset-password" , validator.passwordResetValidator , resetPassword)
router.post("/social-login" , socialLogin)
router.param("userId" , userById)

module.exports = router;