/*&&& Suil &&&*/

let utils = require('../utils');

let rdvPoints = module.exports = {};

let dynamoDB = utils.connectToDB();
let tableName = '2018_RDV_Registrations';

rdvPoints.set = function (req, res) {
	let user = req.body;
	let rdv_number = user.rdv_number;
	let points_increment = user.rdv_points_increment;

	let refParams = {
		TableName: tableName,
		Key: {
			'rdv_number': user.rdv_number,
		},
		ConditionExpression: 'attribute_exists(rdv_number)',
		UpdateExpression: 'SET rdv_points = rdv_points + :value',
		ExpressionAttributeValues: {
			':value': points_increment,
		},
	};
	dynamoDB.update(refParams, function (err, data) {
		if (err) {
			return res.send("error");
			console.log("Got error:", err.message);
		} else {
			return res.send("success");
			console.log("Increased RDV points of %s", user.email);
		}
	});
};