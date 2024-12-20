// Generated by CoffeeScript 1.8.0
var ParsedError, PrettyError, RenderKid, arrayUtils, defaultStyle, instance, isPlainObject, merge, nodePaths, prop, _fn, _i, _len, _ref,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

isPlainObject = require('lodash/isPlainObject');

defaultStyle = require('./defaultStyle');

ParsedError = require('./ParsedError');

nodePaths = require('./nodePaths');

RenderKid = require('renderkid');

merge = require('lodash/merge');

arrayUtils = {
  pluckByCallback: function(a, cb) {
    var index, removed, value, _i, _len;
    if (a.length < 1) {
      return a;
    }
    removed = 0;
    for (index = _i = 0, _len = a.length; _i < _len; index = ++_i) {
      value = a[index];
      if (cb(value, index)) {
        removed++;
        continue;
      }
      if (removed !== 0) {
        a[index - removed] = a[index];
      }
    }
    if (removed > 0) {
      a.length = a.length - removed;
    }
    return a;
  },
  pluckOneItem: function(a, item) {
    var index, reached, value, _i, _len;
    if (a.length < 1) {
      return a;
    }
    reached = false;
    for (index = _i = 0, _len = a.length; _i < _len; index = ++_i) {
      value = a[index];
      if (!reached) {
        if (value === item) {
          reached = true;
          continue;
        }
      } else {
        a[index - 1] = a[index];
      }
    }
    if (reached) {
      a.length = a.length - 1;
    }
    return a;
  }
};

instance = null;

module.exports = PrettyError = (function() {
  var self;

  self = PrettyError;

  PrettyError._filters = {
    'module.exports': function(item) {
      if (item.what == null) {
        return;
      }
      item.what = item.what.replace(/\.module\.exports\./g, ' - ');
    }
  };

  PrettyError._getDefaultStyle = function() {
    return defaultStyle();
  };

  PrettyError.start = function() {
    if (instance == null) {
      instance = new self;
      instance.start();
    }
    return instance;
  };

  PrettyError.stop = function() {
    return instance != null ? instance.stop() : void 0;
  };

  function PrettyError() {
    this._useColors = true;
    this._maxItems = 50;
    this._packagesToSkip = [];
    this._pathsToSkip = [];
    this._skipCallbacks = [];
    this._filterCallbacks = [];
    this._parsedErrorFilters = [];
    this._aliases = [];
    this._renderer = new RenderKid({
      layout: {
        terminalWidth: 9999
      }
    });
    this._style = self._getDefaultStyle();
    this._renderer.style(this._style);
  }

  PrettyError.prototype.start = function() {
    var prepeare;
    this._oldPrepareStackTrace = Error.prepareStackTrace;
    prepeare = this._oldPrepareStackTrace || function(exc, frames) {
      var result;
      result = exc.toString();
      frames = frames.map(function(frame) {
        return "  at " + (frame.toString());
      });
      return result + "\n" + frames.join("\n");
    };
    Error.prepareStackTrace = (function(_this) {
      return function(exc, trace) {
        var stack;
        stack = prepeare.apply(null, arguments);
        return _this.render({
          stack: stack,
          message: exc.toString().replace(/^.*: /, '')
        }, false);
      };
    })(this);
    return this;
  };

  PrettyError.prototype.stop = function() {
    Error.prepareStackTrace = this._oldPrepareStackTrace;
    return this._oldPrepareStackTrace = null;
  };

  PrettyError.prototype.config = function(c) {
    var alias, path, _ref;
    if (c.skipPackages != null) {
      if (c.skipPackages === false) {
        this.unskipAllPackages();
      } else {
        this.skipPackage.apply(this, c.skipPackages);
      }
    }
    if (c.skipPaths != null) {
      if (c.skipPaths === false) {
        this.unskipAllPaths();
      } else {
        this.skipPath.apply(this, c.skipPaths);
      }
    }
    if (c.skip != null) {
      if (c.skip === false) {
        this.unskipAll();
      } else {
        this.skip.apply(this, c.skip);
      }
    }
    if (c.maxItems != null) {
      this.setMaxItems(c.maxItems);
    }
    if (c.skipNodeFiles === true) {
      this.skipNodeFiles();
    } else if (c.skipNodeFiles === false) {
      this.unskipNodeFiles();
    }
    if (c.filters != null) {
      if (c.filters === false) {
        this.removeAllFilters();
      } else {
        this.filter.apply(this, c.filters);
      }
    }
    if (c.parsedErrorFilters != null) {
      if (c.parsedErrorFilters === false) {
        this.removeAllParsedErrorFilters();
      } else {
        this.filterParsedError.apply(this, c.parsedErrorFilters);
      }
    }
    if (c.aliases != null) {
      if (isPlainObject(c.aliases)) {
        _ref = c.aliases;
        for (path in _ref) {
          alias = _ref[path];
          this.alias(path, alias);
        }
      } else if (c.aliases === false) {
        this.removeAllAliases();
      }
    }
    return this;
  };

  PrettyError.prototype.withoutColors = function() {
    this._useColors = false;
    return this;
  };

  PrettyError.prototype.withColors = function() {
    this._useColors = true;
    return this;
  };

  PrettyError.prototype.skipPackage = function() {
    var packages, pkg, _i, _len;
    packages = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = packages.length; _i < _len; _i++) {
      pkg = packages[_i];
      this._packagesToSkip.push(String(pkg));
    }
    return this;
  };

  PrettyError.prototype.unskipPackage = function() {
    var packages, pkg, _i, _len;
    packages = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = packages.length; _i < _len; _i++) {
      pkg = packages[_i];
      arrayUtils.pluckOneItem(this._packagesToSkip, pkg);
    }
    return this;
  };

  PrettyError.prototype.unskipAllPackages = function() {
    this._packagesToSkip.length = 0;
    return this;
  };

  PrettyError.prototype.skipPath = function() {
    var path, paths, _i, _len;
    paths = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = paths.length; _i < _len; _i++) {
      path = paths[_i];
      this._pathsToSkip.push(path);
    }
    return this;
  };

  PrettyError.prototype.unskipPath = function() {
    var path, paths, _i, _len;
    paths = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = paths.length; _i < _len; _i++) {
      path = paths[_i];
      arrayUtils.pluckOneItem(this._pathsToSkip, path);
    }
    return this;
  };

  PrettyError.prototype.unskipAllPaths = function() {
    this._pathsToSkip.length = 0;
    return this;
  };

  PrettyError.prototype.skip = function() {
    var callbacks, cb, _i, _len;
    callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      cb = callbacks[_i];
      this._skipCallbacks.push(cb);
    }
    return this;
  };

  PrettyError.prototype.unskip = function() {
    var callbacks, cb, _i, _len;
    callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      cb = callbacks[_i];
      arrayUtils.pluckOneItem(this._skipCallbacks, cb);
    }
    return this;
  };

  PrettyError.prototype.unskipAll = function() {
    this._skipCallbacks.length = 0;
    return this;
  };

  PrettyError.prototype.skipNodeFiles = function() {
    return this.skipPath.apply(this, nodePaths);
  };

  PrettyError.prototype.unskipNodeFiles = function() {
    return this.unskipPath.apply(this, nodePaths);
  };

  PrettyError.prototype.filter = function() {
    var callbacks, cb, _i, _len;
    callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      cb = callbacks[_i];
      this._filterCallbacks.push(cb);
    }
    return this;
  };

  PrettyError.prototype.removeFilter = function() {
    var callbacks, cb, _i, _len;
    callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      cb = callbacks[_i];
      arrayUtils.pluckOneItem(this._filterCallbacks, cb);
    }
    return this;
  };

  PrettyError.prototype.removeAllFilters = function() {
    this._filterCallbacks.length = 0;
    return this;
  };

  PrettyError.prototype.filterParsedError = function() {
    var callbacks, cb, _i, _len;
    callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      cb = callbacks[_i];
      this._parsedErrorFilters.push(cb);
    }
    return this;
  };

  PrettyError.prototype.removeParsedErrorFilter = function() {
    var callbacks, cb, _i, _len;
    callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      cb = callbacks[_i];
      arrayUtils.pluckOneItem(this._parsedErrorFilters, cb);
    }
    return this;
  };

  PrettyError.prototype.removeAllParsedErrorFilters = function() {
    this._parsedErrorFilters.length = 0;
    return this;
  };

  PrettyError.prototype.setMaxItems = function(maxItems) {
    if (maxItems == null) {
      maxItems = 50;
    }
    if (maxItems === 0) {
      maxItems = 50;
    }
    this._maxItems = maxItems | 0;
    return this;
  };

  PrettyError.prototype.alias = function(stringOrRx, alias) {
    this._aliases.push({
      stringOrRx: stringOrRx,
      alias: alias
    });
    return this;
  };

  PrettyError.prototype.removeAlias = function(stringOrRx) {
    arrayUtils.pluckByCallback(this._aliases, function(pair) {
      return pair.stringOrRx === stringOrRx;
    });
    return this;
  };

  PrettyError.prototype.removeAllAliases = function() {
    this._aliases.length = 0;
    return this;
  };

  PrettyError.prototype._getStyle = function() {
    return this._style;
  };

  PrettyError.prototype.appendStyle = function(toAppend) {
    merge(this._style, toAppend);
    this._renderer.style(toAppend);
    return this;
  };

  PrettyError.prototype._getRenderer = function() {
    return this._renderer;
  };

  PrettyError.prototype.render = function(e, logIt, useColors) {
    var obj, rendered;
    if (logIt == null) {
      logIt = false;
    }
    if (useColors == null) {
      useColors = this._useColors;
    }
    obj = this.getObject(e);
    rendered = this._renderer.render(obj, useColors);
    if (logIt === true) {
      console.error(rendered);
    }
    return rendered;
  };

  PrettyError.prototype.getObject = function(e) {
    var count, header, i, item, obj, traceItems, _i, _len, _ref;
    if (!(e instanceof ParsedError)) {
      e = new ParsedError(e);
    }
    this._applyParsedErrorFiltersOn(e);
    header = {
      title: (function() {
        var ret;
        ret = {};
        if (e.wrapper !== '') {
          ret.wrapper = "" + e.wrapper;
        }
        ret.kind = e.kind;
        return ret;
      })(),
      colon: ':',
      message: String(e.message).trim()
    };
    traceItems = [];
    count = -1;
    _ref = e.trace;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      item = _ref[i];
      if (item == null) {
        continue;
      }
      if (this._skipOrFilter(item, i) === true) {
        continue;
      }
      count++;
      if (count > this._maxItems) {
        break;
      }
      if (typeof item === 'string') {
        traceItems.push({
          item: {
            custom: item
          }
        });
        continue;
      }
      traceItems.push((function() {
        var markupItem;
        markupItem = {
          item: {
            header: {
              pointer: (function() {
                if (item.file == null) {
                  return '';
                }
                return {
                  file: item.file,
                  colon: ':',
                  line: item.line
                };
              })()
            },
            footer: (function() {
              var foooter;
              foooter = {
                addr: item.shortenedAddr
              };
              if (item.extra != null) {
                foooter.extra = item.extra;
              }
              return foooter;
            })()
          }
        };
        if (typeof item.what === 'string' && item.what.trim().length > 0) {
          markupItem.item.header.what = item.what;
        }
        return markupItem;
      })());
    }
    obj = {
      'pretty-error': {
        header: header
      }
    };
    if (traceItems.length > 0) {
      obj['pretty-error'].trace = traceItems;
    }
    return obj;
  };

  PrettyError.prototype._skipOrFilter = function(item, itemNumber) {
    var cb, modName, pair, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    if (typeof item === 'object') {
      if (_ref = item.modName, __indexOf.call(this._packagesToSkip, _ref) >= 0) {
        return true;
      }
      if (_ref1 = item.path, __indexOf.call(this._pathsToSkip, _ref1) >= 0) {
        return true;
      }
      _ref2 = item.packages;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        modName = _ref2[_i];
        if (__indexOf.call(this._packagesToSkip, modName) >= 0) {
          return true;
        }
      }
      if (typeof item.shortenedAddr === 'string') {
        _ref3 = this._aliases;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          pair = _ref3[_j];
          item.shortenedAddr = item.shortenedAddr.replace(pair.stringOrRx, pair.alias);
        }
      }
    }
    _ref4 = this._skipCallbacks;
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
      cb = _ref4[_k];
      if (cb(item, itemNumber) === true) {
        return true;
      }
    }
    _ref5 = this._filterCallbacks;
    for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
      cb = _ref5[_l];
      cb(item, itemNumber);
    }
    return false;
  };

  PrettyError.prototype._applyParsedErrorFiltersOn = function(error) {
    var cb, _i, _len, _ref;
    _ref = this._parsedErrorFilters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cb = _ref[_i];
      cb(error);
    }
  };

  return PrettyError;

})();

_ref = ['renderer', 'style'];
_fn = function() {
  var methodName;
  methodName = '_get' + prop[0].toUpperCase() + prop.substr(1, prop.length);
  return PrettyError.prototype.__defineGetter__(prop, function() {
    return this[methodName]();
  });
};
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  prop = _ref[_i];
  _fn();
}
