const express = require("express");
var router = express.Router();


const AuthenticationValidator = require("../../middleware/validator/authenthication/Authentication");
const Authentication = require("../../controller/auth/Authentication");
const Auth = require("../../middleware/Auth");

router.post('/user/signup',   Auth.verifyToken,Authentication.signup);

router.post('/user/login', AuthenticationValidator.validateLogin, Authentication.login);

router.get('/user/logout', Auth.verifyToken, Authentication.logout);
 
router.get('/user/type', Auth.verifyToken, Authentication.checkUserType);
 
 
router.post('/user/forgotpassword', AuthenticationValidator.validateForgotPassword, Authentication.forgotPassword);
 
 
router.post('/user/checkresetpassword', AuthenticationValidator.validateCheckResetPassword, Authentication.checkResetPassword);
 

router.post('/user/resetpassword', AuthenticationValidator.validateResetPassword, Authentication.resetPassword);
 

router.post('/user/changepassword', Auth.verifyToken, AuthenticationValidator.validateChangePassword, Authentication.changePassword);
 
 module.exports = router;