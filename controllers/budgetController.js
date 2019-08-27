/**
 * Created by Sunil and Manish
 */
const utils = require('../utils');

const dynamoDB = utils.connectToDB();
const tableName = '2017_RDV_Budget';

function getBudgetRequests(req, res) {
  const params = {
    TableName: tableName,
    IndexName: 'type',
    KeyConditionExpression: '#a = :value',
    ExpressionAttributeNames: {
      '#a': "type",
    },
    ExpressionAttributeValues: {
      ':value': "Outflow",
    },
  };

  let user = req.user;
  const isMaster = (user.permissions.can_manage_all || user.permissions.can_manage_all_budget || user.permissions.can_approve_budget_request);

  dynamoDB.query(params, function(err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      return res.json({
        requests: (isMaster)? data.Items : data.Items.filter(r => r.added_by.email === user.email),
      })
    }
  });
}

function getBudgetRequest(req, res) {
  const id = req.params.id;
  if (!id)
    return utils.error(res, 400, "Invalid Request ID");
  const params = {
    TableName: tableName,
    Key: {
      "id": id,
    },
  };
  dynamoDB.get(params, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (!data.Item)
        return utils.error(res, 400, "Request does not exist");
      return res.json({
        request: data.Item,
      })
    }
  })
}

function addBudgetRequest(req, res) {
  let request = req.body.request;
  if (!request || !request.id)
    return utils.error(res, 400, "Invalid Data");
  for (let key in request) {
    if (request.hasOwnProperty(key) && (request[key] === ""))
      request[key] = null;
  }

  if (request.status === 'Approved' || request.status === 'Paid')
    return utils.error(res, 400, request.status + " Requests cannot be edited");

  let user = req.user;
  const isMaster = (user.permissions.can_manage_all || user.permissions.can_manage_all_budget || user.permissions.can_approve_budget_request);
  if (!isMaster && request.added_by.email != user.email)
    return utils.error(res, 400, "You cannot edit this Request!");

  request.status = "Pending";
  request.type = "Outflow";
  const params = {
    TableName: tableName,
    Item: request,
  };
  if (!request.status) {
    params.ConditionExpression = 'attribute_not_exists(#a)';
    params.ExpressionAttributeNames = {"#a": "id"};
  }
  dynamoDB.put(params, function (err, data) {
    if (err) {
      console.log(err);
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        return utils.error(res, 400, "Request with ID already exists");
    } else {
      return res.json({error: false, message: "Budget Request successful!"});
    }
  })
}

function updateBudgetRequest(req, res) {
  const id = req.params.id;
  if (!id)
    return utils.error(res, 400, "Invalid Request ID");
  const status = req.body.status;
  const modifier = req.body.modifier;

  let params = {
    TableName: tableName,
    Key: {
      'id': id,
    },
    UpdateExpression: 'SET #a = :value1, last_modifier = :value2',
    ExpressionAttributeNames: {
      '#a': "status",
    },
    ExpressionAttributeValues: {
      ':value1': status,
      ':value2': modifier,
    },
  };
  dynamoDB.update(params, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      res.json({error: false, message: "Status Change Successful!"});
    }
  })
}

module.exports = {
  getBudgetRequest: getBudgetRequest,
  getBudgetRequests: getBudgetRequests,
  addBudgetRequest: addBudgetRequest,
  updateBudgetRequest: updateBudgetRequest,
};