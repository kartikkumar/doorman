// Generated by CoffeeScript 1.3.3
(function() {
  var Plugin, Twilio, getCode,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Twilio = require('twilio');

  Plugin = require('../plugin');

  getCode = (function(_super) {

    __extends(getCode, _super);

    function getCode() {
      this.run = __bind(this.run, this);
      return getCode.__super__.constructor.apply(this, arguments);
    }

    getCode.prototype.run = function(callSid, request, response, expectedDigits) {
      var twiml, url, _ref, _ref1;
      if ((((_ref = global.data[callSid][this.hash]) != null ? (_ref1 = _ref.data) != null ? _ref1.Digits : void 0 : void 0) != null) === true && global.data[callSid][this.hash].data.Digits === expectedDigits) {
        return global.data[callSid][this.hash].data.Digits;
      } else {
        url = String("/respondToVoiceCall?pluginHash=" + this.hash);
        twiml = new Twilio.TwimlResponse();
        twiml.gather({
          numDigits: 4,
          action: url
        }, function() {
          return twiml.say('Yo! Please enter 4 digits.');
        });
        response.send(twiml.toString());
        return global.dieNow = true;
      }
    };

    return getCode;

  })(Plugin);

  module.exports = getCode;

}).call(this);
