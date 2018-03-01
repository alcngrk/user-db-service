const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;

const USERS = 'users';

function Users(db) {
  this.db = db;
  this.users = db.collection(USERS);
}


Users.prototype.getUserNoReject = function(id) {
  let searchSpec = {}
  searchSpec.id = id;
  return this.users.find(searchSpec).toArray().
    then(function(users) {
      return new Promise(function(resolve, reject) {
        if (users.length === 1) {
          resolve(users[0]);
        }
        else {
          resolve({});
        }
      });
    });
}


Users.prototype.getUser = function(id) {
  let searchSpec = {}
  searchSpec.id = id;
  return this.users.find(searchSpec).toArray().
    then(function(users) {
      return new Promise(function(resolve, reject) {
        if (users.length === 1) {
          resolve(users[0]);
        }
        else {
          reject(new Error(`cannot find user ${id}`));
        }
      });
    });
}

Users.prototype.newUser = function(idIn, user) {
  let addUser = {};
  if(user === {})
  {
    addUser.id = idIn;
  }
  else
  {
    addUser = user;
    addUser.id = idIn;
  }

  return this.users.insertOne(addUser).
    then(function(results) {
        return new Promise((resolve) => resolve(results.ops[0].id));
    });
}

Users.prototype.deleteUser = function(idIn) {
	let delUser = {};
	delUser.id = idIn;

    return this.users.deleteOne(delUser).
    then(function(results) {
      return new Promise(function(resolve, reject) {
        if (results.deletedCount === 1) {
          resolve();
        }
        else {
          reject(new Error(`cannot delete user ${id}`));
        }
      });
    });
}

Users.prototype.updateUser = function(userId, userObj) {
  let userSpec = {}
  userSpec.id = userId;

  return this.users.replaceOne(userSpec, userObj).
    then(function(result) {
      return new Promise(function(resolve, reject) {
        if (result.modifiedCount != 1) {
          reject(new Error(`updated ${result.modifiedCount} users`));
        }
        else {
          resolve();
        }
      });
    });
}

module.exports = {
  Users: Users,
};
