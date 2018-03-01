const express = require('express');
const bodyParser = require('body-parser');


const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;
const NO_CONTENT = 204;

function serve(port, model) {
  const app = express();
  app.locals.model = model;
  app.locals.port = port;
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}


function setupRoutes(app) {
  app.use('/users/:id', bodyParser.json());
  app.put('/users/:id', newUser(app)); //yeni
  app.get('/users/:id', getUser(app));
  app.post('/users/:id', updateUser(app));
  app.delete('/users/:id', deleteUser(app));
}

function requestUrl(req) {
  const port = req.app.locals.port;
  return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}

module.exports = {
  serve: serve
}

function getUser(app) {
  return function(request, response) {
    const id = request.params.id;
    if (typeof id === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {

      request.app.locals.model.users.getUser(id).
        then((results) => response.json(results)).
        catch((err) => {
          console.error(err);
          response.sendStatus(NOT_FOUND);
        });
    }
  };
}

function cacheUser(app) {
  return function(request, response, next) {
    const id = request.params.id;
    if (typeof id === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      request.app.locals.model.users.getUser(id).
        then(function(user) {
          response.locals.user = user;
          next();
        }).
        catch((err) => {
          console.error(err);
          response.sendStatus(NOT_FOUND);
        });
    }
  }
}

function deleteUser(app) {
  return function(request, response) {
    const id = request.params.id;
    if (typeof id === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      request.app.locals.model.users.deleteUser(id).
        then(() => response.end()).
        catch((err) => {
          console.error(err);
          response.sendStatus(NOT_FOUND);
        });
    }
  };
}


function newUser(app) {
  return function(request, response) {
    const user = request.body;
    const id = request.params.id;

    if(typeof user === 'undefined' || typeof id === 'undefined')
    {
      response.sendStatus(BAD_REQUEST);
    }
    else
    {
      //---
      request.app.locals.model.users.getUserNoReject(id).
      then(function(results)
      {
        if(results.id === undefined)
        {
          request.app.locals.model.users.newUser(id, user).
          then(function(id)
          {
            response.append('Location', requestUrl(request) + '/');
            response.sendStatus(CREATED);
          }).
          catch((err) =>
          {
            console.log(JSON.stringify(user));
            console.error(err);
            response.sendStatus(SERVER_ERROR);
          });
        }
        else
		{
          let newUser = request.body;
          const user = request.params.id;
          newUser.id = request.params.id;

          request.app.locals.model.users.updateUser(user, newUser).
          then(function(id) {
            response.append('Location', requestUrl(request) + '/');
            response.sendStatus(NO_CONTENT);
          }).
          catch((err) => {
            console.error(err);
            response.sendStatus(SERVER_ERROR);
          });
        }
      });
    }//---
  };
}

function updateUser(app) {
  return function(request, response) {
    let newUser = request.body;

    if (typeof newUser  === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      const user = request.params.id;
      newUser.id = request.params.id;
      request.app.locals.model.users.updateUser(user, newUser).
        then(function(id) {
        response.append('Location', requestUrl(request) + '/');
        response.sendStatus(CREATED);
      }).
      catch((err) => {
        console.error(err);
        response.sendStatus(NOT_FOUND);
      });
    }
  };
}
