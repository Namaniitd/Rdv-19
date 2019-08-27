var express = require('express');
var mainController = require('../controllers/MainController');
var router = express.Router();
var app = require('../../ApplicationInstance');

router.route('/').get(mainController.home);
router.route('/login').get(mainController.login);

// router.route('/sponsors').get(mainController.sponsors);
// router.route('/team').get(mainController.team);
//
// router.route('/events').get(mainController.events);
// router.route('/accommodation').get(mainController.accommodation);

// router.route('/events/dance').get(mainController.dance);
// router.route('/events/dramatics').get(mainController.dramatics);
// router.route('/events/debating').get(mainController.debating);
// router.route('/events/pfc').get(mainController.pfc);
// router.route('/events/facc').get(mainController.facc);
// router.route('/events/literary').get(mainController.literary);
// router.route('/events/adventure').get(mainController.adventure);
// router.route('/events/comedy').get(mainController.comedy);
// router.route('/events/culinary').get(mainController.culinary);
// router.route('/events/glamour').get(mainController.glamour);
// router.route('/events/hindisamiti').get(mainController.hindisamiti);
// router.route('/events/magic').get(mainController.magic);
// router.route('/events/music').get(mainController.music);
// router.route('/events/quizzing').get(mainController.quizzing);
// router.route('/events/spicmacay').get(mainController.spicmacay);
// router.route('/events/talent').get(mainController.talent);
//
// router.route('/passFac').get(mainController.passFac);
// router.route('/passFac').post(mainController.passFac1);
//
// router.route('/'+process.env.addition+'pronite/login').get(mainController.proniteLogin);
// router.route('/'+process.env.addition+'pronite/login').post(mainController.proniteLoginPost);
// router.route('/'+process.env.addition+'pronite/passbook').get(mainController.pronitePassbook);
// router.route('/'+process.env.addition+'pronite/confirm').get(mainController.proniteConfirm);

router.route('/*').get(mainController.coming);

module.exports = router;
