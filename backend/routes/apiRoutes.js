var express = require('express');
const regController = require('../controllers/regController');
var router = express.Router();
var app = require('../../ApplicationInstance');



router.route('/api/register').post(regController.register);
router.route('/api/login').post(regController.login);
// router.route('/api/forgot').post(regController.forgotPassword);
router.route('/api/change').post(regController.changePassword);

//================================================================================
//============ GeT REQ ===========================================================
//================================================================================

router.route('/api/captcha').get(regController.recaptcha);
router.route('/api/reg-count').get(regController.getRegCount);
//authorize('none')
router.route('/api/admin/registrations').get(regController.getRegistrations);

module.exports = router;
