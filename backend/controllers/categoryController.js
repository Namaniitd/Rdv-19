/**
Sunil and Manish
 */

const utils = require('../utils');

const dynamoDB = utils.connectToDB();
const tableName = 'RDV_Resources';

// get all categories of events
function getCategories(req, res) {
  const params = {
    TableName: tableName
  };
  dynamoDB.scan(params, function(err, data) {
    if (err)
      return utils.error(res, 500, "Internal Server Error");
    return res.json({
      categories: data.Items.filter(item => item.type == "category"),
    })
  });
}

// add a new category for events
// cat is obj of key and name
function addCategory(req, res) {
  const category = req.body.category;
  if (!category)
    return utils.error(res, 400, "Invalid Data");
  if (!category.key)
    return utils.error(res, 400, "Enter Key");
  // just a check for meaning full things
  if (!category.key.match(/^[A-Za-z_]+$/))
    return utils.error(res, 400, "Key can only contain Alphabets and Underscore");
  if (!category.name)
    return utils.error(res, 400, "Enter Name");
  const cleanCategory = {};
  cleanCategory.type = "category";
  cleanCategory.key = category.key;
  cleanCategory.name = category.name;
  const params = {
    TableName: tableName,
    Item: cleanCategory,
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
        return utils.error(res, 400, "Category with Key already exists");
    } else {
      return res.json({error: false, message: "Category added successfully!"});
    }
  })
}

// delete a category give us key
function deleteCategory (req, res) {
  const key = req.params.key;
  if (!key)
    return utils.error(res, 400, "Invalid Key");
  const params = {
    TableName: tableName,
    Key: {
      "type": "category",
      "key": key,
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
        return utils.error(res, 400, "Category with Key does not exist");
    } else {
      return res.json({error: false, message: "Category deleted successfully!"});
    }
  })
}

module.exports = {
  getCategories: getCategories,
  addCategory: addCategory,
  deleteCategory: deleteCategory,
};
