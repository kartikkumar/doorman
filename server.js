// Generated by CoffeeScript 1.3.3
(function() {
  var app, config, express, main, redis, rtg, twilio;

  express = require('express');

  twilio = require('twilio');

  config = require('./config');

  global.app = app = express();

  main = function() {
    var actions, checkDecisionPlugins, saveParameters,
      _this = this;
    app.use(express.bodyParser());
    saveParameters = function(callSid, request) {
      var hash, obj;
      if (request.query.pluginHash != null) {
        hash = request.query.pluginHash;
        if (global.data[callSid][hash] == null) {
          global.data[callSid][hash] = {};
        }
        global.data[callSid][hash].data = request.body;
        obj = JSON.stringify({
          hasRun: global.data[callSid][hash].hasRun != null,
          data: request.body
        });
        return global.redis.hset(callSid, request.query.pluginHash, obj, function(err, obj) {});
      }
    };
    checkDecisionPlugins = function(callSid, request, response) {
      var decisionPlugin, state, _i, _len, _ref, _ref1;
      state = false;
      _ref = global.config.plugins.decisions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        decisionPlugin = _ref[_i];
        if (((_ref1 = global.data[callSid][decisionPlugin.hash]) != null ? _ref1.hasRun : void 0) == null) {
          state = decisionPlugin.run(callSid, request, response);
          if (global.dieNow) {
            break;
          }
          if (global.data[callSid][decisionPlugin.hash] == null) {
            global.data[callSid][decisionPlugin.hash] = {};
          }
          global.data[callSid][decisionPlugin.hash].hasRun = true;
          global.redis.hset(callSid, decisionPlugin.hash, JSON.stringify(global.data[callSid][decisionPlugin.hash]));
          if (state === true) {
            break;
          }
        }
      }
      if (!global.dieNow) {
        return actions(callSid, request, response, state);
      }
    };
    actions = function(callSid, request, response, decision) {
      var actionPlugin, _i, _len, _ref, _ref1, _results;
      _ref = global.config.plugins.actions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        actionPlugin = _ref[_i];
        if (actionPlugin.runOnTrue === true && decision === true || actionPlugin.runOnFalse === true && decision === false) {
          if (((_ref1 = global.data[callSid][actionPlugin.hash]) != null ? _ref1.hasRun : void 0) == null) {
            actionPlugin.run(callSid, request, response, decision);
            if (global.data[callSid][actionPlugin.hash] == null) {
              global.data[callSid][actionPlugin.hash] = {};
            }
            global.data[callSid][actionPlugin.hash].hasRun = true;
            _results.push(global.redis.hset(callSid, actionPlugin.hash, JSON.stringify(global.data[callSid][actionPlugin.hash])));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    return app.post("/respondToVoiceCall", function(request, response) {
      var callSid;
      console.log('THIS IS A NEW POST');
      callSid = request.body.CallSid;
      global.dieNow = false;
      if (global.data[callSid] == null) {
        global.data[callSid] = {};
      }
      return global.redis.hgetall(callSid, function(err, obj) {
        var key, val;
        if (obj) {
          for (key in obj) {
            val = obj[key];
            global.data[callSid][key] = JSON.parse(val);
          }
        }
        saveParameters(callSid, request);
        if (twilio.validateExpressRequest(request, '20f65a9da68ec4630c9c43d19baef94e')) {
          return checkDecisionPlugins(callSid, request, response);
        } else {
          return response.send("you are not twilio. Buzz off.");
        }
      });
    });
  };

  /* REDIZZZZZ
  */


  if (process.env.REDISTOGO_URL) {
    rtg = require("url").parse(process.env.REDISTOGO_URL);
    redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
  } else {
    redis = require("redis").createClient();
  }

  if (global.data == null) {
    global.data = {};
  }

  global.redis = redis;

  global.redis.on("error", function(err) {
    return console.log("Error " + err);
  });

  global.redis.on("connect", function() {
    global.redis.incr('started');
    global.redis.get('started', function(err, response) {
      if (!err) {
        return console.log('Started', response, 'times');
      }
    });
    return main();
  });

  app.listen(process.env.PORT || 5000);

}).call(this);
