const AWS = require('aws-sdk');
const utils = require('../utils');
const fs = require('fs');

//Db
const dynamoDB = utils.connectToDB();
const tableName = '2019_RDV_Events';
const tableName2 = '2019_RDV_Registrations';
// secret keys
const secret = require('../Models/secrets');

// get all events
function getEvents(req, res) {
  onEventScan(res, [], null, 0, function (events) {
    return res.json({
      events: events,
    })
  })
}

function onEventScan(res, events, lastEvaluatedKey, num, cb) {
  const params = {
    TableName: tableName,
    AttributesToGet: [
      "id",
      "name",
      "subheading",
      "type",
      "category",
      "category_name",
      "registration",
      "dtv",
      "photos",
      "poc",
      "description",
      "rules",
      "prizes",
      "reg_type",
      "reg_mode",
      "reg_deadline",
      "reg_email",
      "reg_link",
      "reg_status",
      "reg_min_team_size",
      "reg_max_team_size",
      "reg_link_upload",
      "reg_count",
    ],
  };
  if (!lastEvaluatedKey && num != 0)
    cb(events);
  else {
    if (lastEvaluatedKey)
      params.ExclusiveStartKey = lastEvaluatedKey;
    dynamoDB.scan(params, function (err, data) {
      if (err)
        return utils.error(res, 500, "Internal Server Error");
      else {
        events = events.concat(data.Items);
        onEventScan(res, events, data.LastEvaluatedKey, num+1, cb);
      }
    })
  }
}

// get events based on category
function getEventsCategory(req, res) {
  let category = req.params.category;
  const params = {
    TableName: tableName,
    IndexName: 'category',
    KeyConditionExpression: '#a = :value',
    ExpressionAttributeNames: {
      '#a': "category",
      '#b': "name",
      '#c': "type",
      '#d': "rules",
    },
    ExpressionAttributeValues: {
      ':value': category,
    },
    ProjectionExpression:
      "id," +
      "#b," +
      "subheading," +
      "#c," +
      "category," +
      "category_name," +
      "registration," +
      "dtv," +
      "photos," +
      "description," +
      "#d," +
      "prizes," +
      "poc," +
      "reg_type," +
      "reg_mode," +
      "reg_deadline," +
      "reg_email," +
      "reg_link," +
      "reg_status," +
      "reg_min_team_size," +
      "reg_max_team_size," +
      "reg_link_upload"
    ,
  };
  dynamoDB.query(params, function(err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      return res.json({
        events: data.Items,
      })
    }
  });
}

//get event based in event id
function getEvent(req, res) {
  const id = req.params.id;
  if (!id)
    return utils.error(res, 400, "Invalid Event ID");
  const params = {
    TableName: tableName,
    Key: {
      "id": id,
    },
    AttributesToGet: [
      "id",
      "name",
      "subheading",
      "type",
      "category",
      "category_name",
      "registration",
      "dtv",
      "photos",
      "description",
      "rules",
      "poc",
      "prizes",
      "reg_type",
      "reg_mode",
      "reg_deadline",
      "reg_email",
      "reg_link",
      "reg_status",
      "reg_min_team_size",
      "reg_max_team_size",
      "reg_link_upload",
    ],
  };
  dynamoDB.get(params, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (!data.Item)
        return utils.error(res, 400, "Event does not exist");
      return res.json({
        event: data.Item,
      })
    }
  })
}

//get event req info
function getEventReg(req, res) {
  const id = req.params.id.split(':')[0];
  if (!id)
    return utils.error(res, 400, "Invalid Event ID");
  const params = {
    TableName: tableName,
    Key: {
      "id": id,
    },
    AttributesToGet: [
      "id",
      "name",
      "reg_type",
      "reg_mode",
      "registration",
      "reg_link_upload",
      "registrations",
    ],
  };
  dynamoDB.get(params, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (!data.Item)
        return utils.error(res, 400, "Event does not exist");
      return res.json({
        event: data.Item,
      })
    }
  })
}

// Add a new event
function addEvent(req, res) {
  let event = req.body.event;
  if (!event || !event.id)
    return utils.error(res, 400, "Invalid Data");
  for (let key in event) {
    if (event.hasOwnProperty(key) && (event[key] === ""))
      event[key] = null;
  }
  let update = event.update;
  delete event["update"];
  if (!update) {
    const params = {
      TableName: tableName,
      Item: event,
    };
    params.ConditionExpression = 'attribute_not_exists(#a)';
    params.ExpressionAttributeNames = {"#a": "id"};
    dynamoDB.put(params, function (err, data) {
      if (err) {
        console.log(err);
        if (err.statusCode >= 500)
          return utils.error(res, 500, "Internal Server Error");
        else
          return utils.error(res, 400, "Event with ID already exists");
      } else {
          return res.json({error: false, message: "Event added successfully!"});
      }
    })
  } else {
    const getParams = {
      TableName: tableName,
      Key: {
        "id": event.id,
      },
      AttributesToGet: [
        "id",
        "registrations",
        "reg_count",
      ],
    };
    dynamoDB.get(getParams, function (err, data) {
      if (err) {
        return utils.error(res, 500, "Internal Server Error");
      } else {
        if (!data.Item)
          return utils.error(res, 400, "Event does not exist");
        event.registrations = data.Item.registrations;
        event.reg_count = data.Item.reg_count;
        const params = {
          TableName: tableName,
          Item: event,
        };
        dynamoDB.put(params, function (err, data) {
          if (err) {
            console.log(err);
            if (err.statusCode >= 500)
              return utils.error(res, 500, "Internal Server Error");
          } else {
            return res.json({error: false, message: "Event updated successfully!"});
          }
        })
      }
    })
  }
}

function deleteEvent (req, res) {
  const id = req.params.id.split(':')[0];
  if (!id)
    return utils.error(res, 400, "Invalid Event ID");
  const params = {
    TableName: tableName,
    Key: {
      "id": id,
    },
    ConditionExpression: 'attribute_exists(id)',
  };
  dynamoDB.delete(params, function (err, data) {
    if (err) {
      if (err.statusCode >= 500)
        return utils.error(res, 500, "Internal Server Error");
      else
        return utils.error(res, 400, "Event with ID does not exist");
    } else {
      return res.json({error: false, message: "Event deleted successfully!"});
    }
  })
}
// Upload images on aws
function uploadPhoto(req, res) {
  AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: "ap-south-1",
    endpoint: new AWS.Endpoint('https://s3.ap-south-1.amazonaws.com')
  });
  let s3Bucket = new AWS.S3();
  fs.readFile(req.file.path, (err, data) => {
    if (err) {
        utils.error(res, 500, "Error Uploading Image");
    } else {
      const params = {
        ACL: "public-read",
        Body: data,
        Bucket: 'rdv-website-assets',
        ContentType: "image/jpeg",
        Key: "images/events/" + req.file.originalname
      };
      s3Bucket.putObject(params, (err, data) => {
        if (err) {
          utils.error(res, 500, "Error Uploading Image");
        } else {
          res.json({
            error: false,
            message: "Image Uploaded successfully!",
            img: "https://assets.rdviitd.org/images/events/" + req.file.originalname
          });
        }
      });
      fs.unlink(req.file.path);
    }
  });
};

//Event Registrations
function eventReg(req, res) {
  let eventID = req.params.id;
  let reg = req.body;
  // console.log(reg)
  // console.log(eventID)
  const getParams = {
    TableName: tableName,
    Key: {
      "id": eventID,
    },
    AttributesToGet: [
      "id",
      "name",
      "registration",
      "reg_type",
      "reg_mode",
      "reg_deadline",
      "reg_email",
      "reg_status",
      "reg_min_team_size",
      "reg_max_team_size",
      "reg_link_upload",
      "reg_count",
      "registrations",
    ],
  };
  //getting even req info to cross verify details
  dynamoDB.get(getParams, function (err, data) {
    if (err) {
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (!data.Item)
        return utils.error(res, 400, "Event does not exist");
      addUserToEvent(res, data.Item, reg);
    }
  })
}

// Add a user to event or register him
/* Flow : -
      1) checks for correct data
      2) if single verifyUser then addUserToEventDatabase
      3) if team check team name and team size requirements
      4)  Then add to userToEventDb

*/
function addUserToEvent(res, event, reg) {
  let submission = reg.submission;
  let userData = reg.register;
  if (!event.registration || !event.reg_status)
    return utils.error(res, 400, "This event isn't accepting registrations");
  if (event.reg_mode === "Email")
    return utils.error(res, 400, "Please mail to the given ID for registration");
  if (event.reg_mode === "External")
    return utils.error(res, 400, "Please visit the given link for registration");
  if (event.reg_type === "Single" && Object.prototype.toString.call( userData ) === '[object Array]')
    return utils.error(res, 400, "This event is only for individuals");
  if (event.reg_type === "Team" && Object.prototype.toString.call( userData ) !== '[object Array]')
    return utils.error(res, 400, "This event is only for teams");
  if (event.reg_link_upload && !submission)
    return utils.error(res, 400, "This event requires you to submit a link");
  if (event.reg_link_upload && !submission.match(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)$/))
    return utils.error(res, 400, "Please enter a valid Submission Link");
  // console.log(event);
  // console.log("life crzzzz")
  // console.log(typeof(userData))
  if(typeof(userData)!="string")
    userData = userData.filter(String);
  // console.log(userData);
  //Till here there  are only checks and balances
  // Real work starts here
  if (event.reg_type === "Single") {
    // for single user event we need to verify
    verifyUser(res, userData, event, function (user) {
      if (event.reg_link_upload)
        user.submission = submission;
      user.reg_time = (new Date()).toString();
      addUsersToEventDatabase(res, [user], event);
    });
  } else {
    let teamName = reg.team_name;
    if (!teamName)
      return utils.error(res, 400, "Please provide a Team Name");
    if (event.reg_min_team_size && userData.length < event.reg_min_team_size)
      return utils.error(res, 400, "This event requires a minimum of " + event.reg_min_team_size + " team members");
    if (event.reg_max_team_size && userData.length > event.reg_max_team_size)
      return utils.error(res, 400, "This event allows a maximum of " + event.reg_max_team_size + " team members");
    // console.log("been here atleaset 1");

    verifyTeam(res, userData, 0, [], event, function (users) {
      users = users.map(function (user) {
        let u = Object.assign({}, user);
        u.team_name = teamName;
        u.reg_time = (new Date()).toString();
        if (event.reg_link_upload)
          u.submission = submission;
        return u;
      });
      // console.log("been here atleaset 5");
      addUsersToEventDatabase(res, users, event);
    });
  }
}

function addUsersToEventDatabase(res, users, event) {
  let regCount = event.reg_count;
  let registrations = event.registrations;
  if (!regCount)
    regCount = 0;
  if (!registrations)
    registrations = [];
  regCount += users.length;
  registrations = registrations.concat(users);

  let addParams = {
    TableName: tableName,
    Key: {
      'id': event.id,
    },
    UpdateExpression: 'SET registrations = :value1, reg_count = :value2',
    ExpressionAttributeValues: {
      ':value1': registrations,
      ':value2': regCount,
    },
  };
  // Adding events to users for easy access for every user

  addEventToUsers(users, event);
  dynamoDB.update(addParams, function (err, data) {
    if (err) {
      console.log(err);
      console.log("updateion error for "+addParams);
      return utils.error(res, 500, "Internal Server Error");
    } else {
      res.json({message: "Event registeration successful!"});
    }
  })
}

// Adding  event to user db for easy access infuture
function addEventToUsers(users, event) {
  for (let i = 0; i < users.length; i++) {
    let addParams = {
      TableName: tableName2,
      Key: {
        'rdv_number': users[i].rdv_number,
      },
      UpdateExpression: 'SET registered_events = list_append(registered_events, :value)',
      ExpressionAttributeValues: {
        ':value': [{id: event.id, name: event.name}],
      },
    };
    dynamoDB.update(addParams, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log("%s: %s successfully registered for %s", utils.logTime(), users[i].email, event.name);
      }
    });
  }
}

// For verifying user
function verifyUser(res, id, event, cb) {
  console.log("verifying user by user");
  dynamoDB.query(params('email', id), function (err, data) {
    if (err) {
      console.log("rdv_number not found:: "+id+"  "+err);
      return utils.error(res, 500, "Internal Server Error");
    } else {
      if (data.Items.length === 0) {
        dynamoDB.get(params('rdv_number', id), function (err, data) {
          if (err) {
            console.log("rdv_number not found:: "+id);
            return utils.error(res, 500, "Internal Server Error");
          } else {
            if (!data.Item)
              return utils.error(res, 400, id + " is not registered for RDV!");
            if (event.registrations && event.registrations.find(r => r.rdv_number === data.Item.rdv_number))
              return utils.error(res, 400, id + " is already registered for this event");
            delete data.Item.password;
            delete data.Item.registered_events;
            cb(data.Item);
          }
        })
      } else {
        if (event.registrations && event.registrations.find(r => r.rdv_number === data.Items[0].rdv_number))
          return utils.error(res, 400, id + " is already registered for this event");
        delete data.Items[0].password;
        delete data.Items[0].registered_events;
        cb(data.Items[0]);
      }
    }
  })
}

function verifyTeam(res, team, index, users, event, final_cb) {
  if (index === team.length - 1) {
    verifyUser(res, team[index], event, function (user) {
      if (users.find(u => u.rdv_number === user.rdv_number))
        return utils.error(res, 400, "Same user cannot be present more than once");
      users.push(user);
      final_cb(users);
    })
  } else {
    verifyUser(res, team[index], event, function (user) {
      if (users.find(u => u.rdv_number === user.rdv_number))
        return utils.error(res, 400, "Same user cannot be present more than once");
      users.push(user);
      verifyTeam(res, team, index+1, users, event, final_cb);
    });
  }
}

function params(key, id) {
  if (key == 'rdv_number') {
    return {
      TableName: tableName2,
      Key: {
        rdv_number: id,
      },
    }
  } else {
    return {
      TableName: tableName2,
      IndexName: 'email',
      KeyConditionExpression: 'email = :value',
      ExpressionAttributeValues: {
        ':value': id,
      },
    }
  }
}

module.exports = {
  uploadPhoto: uploadPhoto,
  getEvents: getEvents,
  getEvent: getEvent,
  addEvent: addEvent,
  deleteEvent: deleteEvent,
  eventReg: eventReg,
  getEventsCategory: getEventsCategory,
  getEventReg: getEventReg,
};
