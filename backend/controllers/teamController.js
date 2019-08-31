/**
 * Created by Sunil
 */
const utils = require('../utils');
const teamAddMailer = require('../mailers/teamAddMailer');
const defaultPermissions = require('./defaultPermissions');
const crypto = require('crypto');
const _ = require('underscore');

const dynamoDB = utils.connectToDB();
const tableName = '2019_RDV_Team';
const secret = require('../secrets');


//get all team except web team admin
function getTeam(req, res) {
  const params = {
    TableName: tableName
  };
  dynamoDB.scan(params, function(err, data) {
    if (err)
      return utils.error(res, 500, "Internal Server Error");
    const team = _.reject(data.Items, {email: "admin@rdv.com"});
    return res.json({
      team: team,
    })
  });
}

//get team based on email
function getTeamMember(req, res) {
  const email = req.params.email;
  if (!email)
    return utils.error(res, 400, "Invalid Email Address");
  const params = {
    TableName: tableName,
    Key: {
      "email": email,
    }
  };
  dynamoDB.get(params, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (!data.Item)
        return utils.error(res, 400, "Email does not exist");
      return res.json({
        member: data.Item,
      })
    }
  })
}

// Adding a new team member
function addTeamMember(req, res) {
  const member = req.body.member;
  console.log(member)
  //Basic checks and balances for foolishness
  if (!member)
    return utils.error(res, 400, "Invalid Data");
  if (!member.email)
    return utils.error(res, 400, "Enter Email Address");
  if (!member.name)
    return utils.error(res, 400, "Enter Name");
  if (!member.role)
    return utils.error(res, 400, "Enter Role");
  if (!member.designation)
    return utils.error(res, 400, "Enter Designation");

  const cleanMember = {};
  cleanMember.email = member.email;
  cleanMember.name = member.name;
  cleanMember.role = member.role;
  if (member.department !== '')
    cleanMember.department = member.department;
  cleanMember.designation = member.designation;
  const password = (Math.random() + 1).toString(36).substr(2,6);
  cleanMember.password = crypto.createHash('md5').update(password).digest('hex');
  // Get permissions for that role from default set
  cleanMember.permissions = defaultPermissions.getDefault(member.role, member.department);
  cleanMember.permissions.can_update_all = false;
  const params = {
    TableName: tableName,
    Item: cleanMember,
    ConditionExpression: 'attribute_not_exists(email)'
  };
  dynamoDB.put(params, function (err, data) {
    if (err) {
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        return utils.error(res, 400, "Member with Email Address already exists");
    } else {
      // Send a mail to new member with id and password
      teamAddMailer.sendMail(member, password);
      return res.json({error: false, message: "Member added successfully! Login credentials have been mailed to the given ID"});
    }
  })
}

// Update team member
function updateTeamMember(req, res) {
  const email = req.params.email;
  if (!email)
    return utils.error(res, 400, "Invalid Email Address");
  if (email === "admin@rdv.com")
    return utils.error(res, 400, "Cannot update Web Admin! 3:)");
  const member = req.body.member;
  if (!member)
    return utils.error(res, 400, "Invalid Data");
  if (!member.name)
    return utils.error(res, 400, "Enter Name");
  if (!member.role)
    return utils.error(res, 400, "Enter Role");
  if (!member.designation)
    return utils.error(res, 400, "Enter Designation");
  const params = {
    TableName: tableName,
    Key: {
      "email": email,
    },
    UpdateExpression: "SET #a1 = :v1, #a2 = :v2, #a4 = :v4",
    ExpressionAttributeNames: {
      "#a1": "name",
      "#a2": "role",
      "#a4": "designation",
    },
    ExpressionAttributeValues: {
      ":v1": member.name,
      ":v2": member.role,
      ":v4": member.designation,
    },
    ConditionExpression: 'attribute_exists(email)',
    ReturnValues:"NONE"
  };
  if (member.department && member.department !== '') {
    params.UpdateExpression += ", #a3 = :v3";
    params.ExpressionAttributeNames["#a3"] = "department";
    params.ExpressionAttributeValues[":v3"] = member.department;
  } else {
    params.UpdateExpression += " REMOVE #a3";
    params.ExpressionAttributeNames["#a3"] = "department";
  }
  dynamoDB.update(params, function (err, data) {
    if (err) {
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        return utils.error(res, 400, "Member with Email Address does not exist");
    } else {
      return res.json({error: false, message: "Details updated successfully!"});
    }
  })
}

// Self update contact info
function selfUpdate(req, res) {
  const member = req.body.member;
  if (!member)
    return utils.error(res, 400, "Invalid Data");
  if (!member.email)
    return utils.error(res, 400, "Invalid Email Address");
  const email = member.email;
  if (!member.name)
    return utils.error(res, 400, "Enter Name");
  if (!member.contact)
    return utils.error(res, 400, "Enter Contact");
  const params = {
    TableName: tableName,
    Key: {
      "email": email,
    },
    UpdateExpression: "SET #a1 = :v1, #a2 = :v2",
    ExpressionAttributeNames: {
      "#a1": "name",
      "#a2": "contact",
    },
    ExpressionAttributeValues: {
      ":v1": member.name,
      ":v2": member.contact,
    },
    ConditionExpression: 'attribute_exists(email)',
    ReturnValues:"NONE"
  };
  if (member.password) {
    params.UpdateExpression += ", #a0 = :v0";
    params.ExpressionAttributeNames["#a0"] = "password";
    params.ExpressionAttributeValues[":v0"] = member.password;
  }
  dynamoDB.update(params, function (err, data) {
    if (err) {
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        return utils.error(res, 400, "Member with Email Address does not exist");
    } else {
      return res.json({error: false, message: "Details updated successfully!"});
    }
  })
}

// delte a team member
function deleteTeamMember (req, res) {
  const email = req.params.email;
  if (!email)
    return utils.error(res, 400, "Invalid Email Address");
  if (email === "admin@rdv.com")
    return utils.error(res, 400, "Cannot delete Web Admin! 3:)");
  const params = {
    TableName: tableName,
    Key: {
      "email": email,
    },
    ConditionExpression: 'attribute_exists(email)',
  };
  dynamoDB.delete(params, function (err, data) {
    if (err) {
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        return utils.error(res, 400, "Member with Email Address does not exist");
    } else {
      return res.json({error: false, message: "Member deleted successfully!"});
    }
  })
}

// Changing permission
function updatePermissions (req, res) {
  const email = req.params.email;
  if (!email)
    return utils.error(res, 400, "Invalid Email Address");
  if (email === "admin@rdv.com")
    return utils.error(res, 400, "Cannot update Web Admin! 3:)");
  const permissions = req.body.permissions;
  if (!permissions)
    return utils.error(res, 400, "Invalid Data");
  permissions.can_update_all = false;
  const params = {
    TableName: tableName,
    Key: {
      "email": email,
    },
    UpdateExpression: "SET #a = :v",
    ExpressionAttributeNames: {
      "#a": "permissions",
    },
    ExpressionAttributeValues: {
      ":v": permissions,
    },
    ConditionExpression: 'attribute_exists(email)',
    ReturnValues:"NONE"
  };
  dynamoDB.update(params, function (err, data) {
    if (err) {
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        return utils.error(res, 400, "Member with Email Address does not exist");
    } else {
      return res.json({error: false, message: "Permissions updated successfully!"});
    }
  })
}

module.exports = {
  getTeam: getTeam,
  getTeamMember: getTeamMember,
  addTeamMember: addTeamMember,
  updateTeamMember: updateTeamMember,
  deleteTeamMember: deleteTeamMember,
  selfUpdate: selfUpdate,
  updatePermissions: updatePermissions,
};
