/**
 * Created by Sunil Kumar
 */
const utils = require('../utils');
const _ = require('underscore');

const dynamoDB = utils.connectToDB();
const tableName = 'RDV_Resources';

//get all venues to be used
function getVenues(req, res) {
  const params = {
    TableName: tableName
  };
  dynamoDB.scan(params, function(err, data) {
    if (err)
      return utils.error(res, 500, "Internal Server Error");
    return res.json({
      venues: data.Items.filter(item => item.type == "venue"),
    })
  });
}

// Add a new venue to rdv db
function addVenue(req, res) {
  const venue = req.body.venue;
  if (!venue || venue === '')
    return utils.error(res, 400, "Enter Venue");
  const params = {
    TableName: tableName,
    Item: {type: "venue", key: venue},
    ConditionExpression: 'attribute_not_exists(#a)',
    ExpressionAttributeNames: {
      "#a": "key",
    },
  };
  dynamoDB.put(params, function (err, data) {
    if (err) {
      console.log(err);
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        return utils.error(res, 400, "Venue already exists");
    } else {
      return res.json({error: false, message: "Venue added successfully!"});
    }
  })
}

// Delete a venue
function deleteVenue (req, res) {
  const venue = req.params.venue;
  if (!venue || venue === '')
    return utils.error(res, 400, "Invalid Venue");
  const params = {
    TableName: tableName,
    Key: {
      "type": "venue",
      "key": venue,
    },
    ConditionExpression: 'attribute_exists(#a)',
    ExpressionAttributeNames: {
      "#a": "key",
    },
  };
  dynamoDB.delete(params, function (err, data) {
    if (err) {
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        return utils.error(res, 400, "Venue does not exist");
    } else {
      return res.json({error: false, message: "Venue deleted successfully!"});
    }
  })
}

module.exports = {
  getVenues: getVenues,
  addVenue: addVenue,
  deleteVenue: deleteVenue,
};