// Generated by CoffeeScript 1.3.3
(function() {
  var Plugin, config, loadPlugin;

  Plugin = require('./plugins/plugin');

  global.config = config = {};

  config.plugins = {};

  config.plugins.sources = [];

  config.plugins.decisions = [];

  config.plugins.actions = [];

  loadPlugin = function(type, name) {
    var path, plugin, _klass;
    path = './plugins/' + type + '/' + name;
    _klass = require(path);
    plugin = new _klass(path);
    return config.plugins[type].push(plugin);
  };

  /* Plugins
  */


  loadPlugin('sources', 'getCode');

  loadPlugin('decisions', 'alwaysFalse');

  loadPlugin('decisions', 'alwaysTrue');

  loadPlugin('decisions', 'askForCode');

  loadPlugin('actions', 'playEnterTone');

  loadPlugin('actions', 'printToConsole');

  module.exports = config;

}).call(this);
