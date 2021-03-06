var AWS = require('aws-sdk');
var bcrypt   = require('bcrypt-nodejs');

AWS.config.update({ // Security = ...
  endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com",
  accessKeyId: "AKIAJ3EW4JY7RGPIGELA",
  secretAccessKey: "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",
  region: "ap-southeast-1"
});

var ddb = new AWS.DynamoDB();

var tableName = "Users";

module.exports.findUserById = function(id, done) {
  var params = { 
    "TableName": tableName, 
    "Key": { 
      "id": { "N": id } 
    } 
  };

  ddb.getItem(params, function (err, data) {
    if (err) {
      done(err, data);
    }
    done(err, data.Item)
  })
}

module.exports.login = function (req, email, password, done) {
  var params = {
    "TableName": tableName,
    "IndexName": "email-index",
    "KeyConditions": {
      "email": {
        "ComparisonOperator": "EQ",
        "AttributeValueList": [{ "S": email }]
      }
    }
  }

  ddb.query(params, function (err, data) {
    if (err) { return done(err); }
    if (data.Items.length == 0) {
      return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
    }
    
    var userParams = { 
      "TableName": tableName, 
      "Key": { 
        "id": data.Items[0]["id"] 
      } 
    };
    ddb.getItem(userParams, function (err, data) {
      if (err) { return done(err); }
      if (!bcrypt.compareSync(password, data.Item.pw.S)) {
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong email or password.')); // create the loginMessage and save it to session as flashdata
      } else {
        // Update last login timestamp
        userParams["UpdateExpression"] = "SET #lastLogin = :ts";
        userParams["ExpressionAttributeNames"] = {
          "#lastLogin": "lastLogin"
        };
        userParams["ExpressionAttributeValues"] = { 
          ":ts": { "N": new Date().getTime().toString() } 
        };
        userParams["ReturnValues"] = "UPDATED_NEW";
        console.log(userParams);
        ddb.updateItem(userParams, function(err, data) {
          if (err) { console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2)); }
        });
        return done(null, data.Item);
      }
    })
  });
}

module.exports.createUser = function (req, email, password, done) {
  var params = {
    "TableName": tableName,
    "IndexName": "email-index",
    "KeyConditions": {
      "email": {
        "ComparisonOperator": "EQ",
        "AttributeValueList": [{ "S": email }]
      }
    }
  }

  console.log("Scanning for :" + JSON.stringify(params))//.Items["email"].name)

  // find a user whose email is the same as the forms email
  // we are checking to see if the user trying to login already exists
  ddb.query(params, function (err, data) {
    // if there are any errors, return the error
    if (err) {
      return done(err);
    }

    // check to see if theres already a user with that email
    if (data.Items.length > 0) {
      return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
    } else {

      var params = {
        "TableName": tableName,
        "Item": {
          "id": { "N": (Math.floor(Math.random() * 4294967296)).toString() },
          "email": { "S": email },
          "pw": { "S": bcrypt.hashSync(password) }
        }
      }
      ddb.putItem(params, function (err, data) {
        if (err) {
          return done(null, false, req.flash('signupMessage', "Apologies, please try again now. (" + err + ")"));
        } else {
          return done(null, params.Item);
        }
      })
    }
  });
}

module.exports.subscribe = function (emails, user) {
  console.log("user email: ", user.email.S);
  var params = {
    "TableName": tableName,
    "IndexName": "email-index",
    "KeyConditions": {
      "email": {
        "ComparisonOperator": "EQ",
        "AttributeValueList": [{ "S": user.email.S }]
      }
    }
  }

  ddb.query(params, function (err, data) {
    if (err) {
      console.error("Cannot find user", JSON.stringify(err, null, 2));
    } else {
      console.log(emails);
      var userParams = {
        "TableName": tableName,
        "Key": {
          "id": data.Items[0]["id"]
        },
        "UpdateExpression": "ADD #subscribedEmails :emails",
        "ExpressionAttributeNames": {
          "#subscribedEmails": "subscribedEmails"
        },
        "ExpressionAttributeValues": {
          ":emails": { SS: emails }
        },
        "ReturnValues": "UPDATED_NEW"
      };

      ddb.updateItem(userParams, function (err, data) {
        if (err) {
          console.error("Cannot subscribes", JSON.stringify(err, null, 2));
        } else {
          console.log("Subcribe successful!");
        }
      })
    }
  });
}