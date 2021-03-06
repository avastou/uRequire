// Generated by CoffeeScript 1.4.0
var JSManipulator, Logger, ModuleManipulator, l, parser, proc, seekr, _, _B,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require('lodash');

_B = require('uberscore');

Logger = require('../utils/Logger');

l = new Logger('ModuleManipulator');

seekr = require('./seekr');

parser = require("uglify-js").parser;

proc = require("uglify-js").uglify;

JSManipulator = (function() {

  function JSManipulator(js, options) {
    var _base, _ref;
    this.js = js != null ? js : '';
    this.options = options != null ? options : {};
    this.safeEval = __bind(this.safeEval, this);

    if ((_ref = (_base = this.options).beautify) == null) {
      _base.beautify = false;
    }
    try {
      this.AST = parser.parse(this.js);
    } catch (err) {
      err.urequireError = "uRequire : error parsing javascript source.\nMake sure uRequire is using Uglify 1.x, (and NOT 2.x).\nOtherwise, check you Javascript source!\nError=\n";
      l.err(err.urequireError, err);
      throw err;
    }
  }

  JSManipulator.prototype.toCode = function(astCode) {
    if (astCode == null) {
      astCode = this.AST;
    }
    return proc.gen_code(astCode, {
      beautify: this.options.beautify
    });
  };

  JSManipulator.prototype.evalByType = _B.certain({
    'string': function(val) {
      return (this.toCode(val)).replace(/\"|\'/g, '');
    },
    '*': function(val) {
      return this.toCode(val);
    }
  }, '*');

  JSManipulator.prototype.safeEval = function(elem) {
    return this.evalByType(elem[0]).call(this, elem);
  };

  JSManipulator.prototype.readAST = {
    'call': function(ast) {
      var dot, dotExpr, expr, name;
      expr = ast[1];
      name = dot = '';
      dotExpr = expr;
      while (dotExpr[0] === 'dot') {
        name = "" + dotExpr[2] + dot + name;
        dotExpr = dotExpr[1];
        dot = '.';
      }
      name = dotExpr[1] + dot + name;
      return {
        name: name,
        expr: expr,
        args: ast[2]
      };
    },
    'object': function(ast) {
      var _ref;
      return {
        top: (_ref = ast[1][0]) != null ? _ref[0] : void 0,
        props: ast[1][0][1]
      };
    },
    'function': function(ast) {
      return {
        name: ast[1],
        args: ast[2],
        body: ast[3]
      };
    },
    'defun': function(ast) {
      return {
        name: ast[1],
        args: ast[2],
        body: ast[3]
      };
    }
  };

  return JSManipulator;

})();

ModuleManipulator = (function(_super) {

  __extends(ModuleManipulator, _super);

  function ModuleManipulator(js, options) {
    var _base;
    this.options = options != null ? options : {};
    ModuleManipulator.__super__.constructor.apply(this, arguments);
    (_base = this.options).extractFactory || (_base.extractFactory = false);
    this.moduleInfo = {};
    this.AST_FactoryBody = null;
  }

  ModuleManipulator.prototype._gatherItemsInSegments = function(astArray, segments) {
    var elType, elem, _base, _i, _len, _name, _results;
    if (!_.isArray(astArray)) {
      astArray = [astArray];
    }
    _results = [];
    for (_i = 0, _len = astArray.length; _i < _len; _i++) {
      elem = astArray[_i];
      elType = elem[0];
      if (!segments[elType]) {
        if (segments['*']) {
          elType = '*';
        } else {
          break;
        }
      }
      _results.push(((_base = this.moduleInfo)[_name = segments[elType]] || (_base[_name] = [])).push(this.safeEval(elem)));
    }
    return _results;
  };

  ModuleManipulator.prototype.extractModuleInfo = function() {
    var UMDSeeker, defineAMDSeeker, requireCallsSeeker, urequireJsonHeaderSeeker;
    urequireJsonHeaderSeeker = {
      level: {
        min: 4,
        max: 4
      },
      '_object': function(o) {
        var properties;
        if (o.top === 'urequire') {
          properties = eval("(" + (this.toCode(o.props)) + ")");
          this.moduleInfo = _.extend(this.moduleInfo, properties);
          return 'stop';
        }
      }
    };
    defineAMDSeeker = {
      level: {
        min: 4,
        max: 4
      },
      '_call': function(c) {
        var amdDeps, factoryFn, fn, _ref;
        if ((_ref = c.name) === 'define' || _ref === 'require') {
          if (c.args.length === 3 && c.args[0][0] === 'string' && c.args[1][0] === 'array' && c.args[2][0] === 'function') {
            this.moduleInfo.moduleName = this.safeEval(c.args[0]);
            amdDeps = c.args[1][1];
            factoryFn = c.args[2];
          } else {
            if (c.args.length === 2 && c.args[0][0] === 'array' && c.args[1][0] === 'function') {
              amdDeps = c.args[0][1];
              factoryFn = c.args[1];
            } else {
              if (c.args.length === 1 && c.args[0][0] === 'function') {
                amdDeps = [];
                factoryFn = c.args[0];
              }
            }
          }
          if (factoryFn) {
            fn = this.readAST['function'](factoryFn);
            if (!_.isEmpty(fn.args)) {
              this.moduleInfo.parameters = fn.args;
            }
            this.AST_FactoryBody = ['block', fn.body];
            if (this.options.extractFactory) {
              this.moduleInfo.factoryBody = this.toCode(this.AST_FactoryBody);
              this.moduleInfo.factoryBody = this.moduleInfo.factoryBody.slice(1, +(this.moduleInfo.factoryBody.length - 2) + 1 || 9e9).trim();
            }
            this._gatherItemsInSegments(amdDeps, {
              'string': 'arrayDependencies',
              '*': 'untrustedArrayDependencies'
            });
            this.moduleInfo.moduleType = 'AMD';
            this.moduleInfo.amdCall = c.name;
            return 'stop';
          }
        }
      }
    };
    seekr([urequireJsonHeaderSeeker, defineAMDSeeker], this.AST, this.readAST, this);
    if (this.moduleInfo.moduleType !== 'AMD') {
      UMDSeeker = {
        level: {
          min: 4,
          max: 5
        },
        '_function': function(f) {
          if (_.isEqual(f.args, ['root', 'factory'])) {
            this.moduleInfo.moduleType = 'UMD';
            this.AST_FactoryBody = null;
            return 'stop';
          }
        }
      };
      seekr([UMDSeeker], this.AST, this.readAST, this);
      if (this.moduleInfo.moduleType !== 'UMD') {
        this.moduleInfo.moduleType = 'nodejs';
        this.AST_FactoryBody = this.AST;
        if (this.options.extractFactory) {
          this.moduleInfo.factoryBody = this.js;
        }
      }
    }
    if (this.AST_FactoryBody) {
      requireCallsSeeker = {
        '_call': function(c) {
          if (c.name === 'require') {
            if (c.args[0][0] === 'array') {
              return this._gatherItemsInSegments(c.args[0][1], {
                'string': 'asyncDependencies',
                '*': 'untrustedAsyncDependencies'
              });
            } else {
              return this._gatherItemsInSegments(c.args, {
                'string': 'requireDependencies',
                '*': 'untrustedRequireDependencies'
              });
            }
          }
        }
      };
      seekr([requireCallsSeeker], this.AST_FactoryBody, this.readAST, this);
      if (!_.isEmpty(this.moduleInfo.requireDependencies)) {
        this.moduleInfo.requireDependencies = _.difference(_.uniq(this.moduleInfo.requireDependencies), this.moduleInfo.arrayDependencies);
      }
    }
    return this.moduleInfo;
  };

  ModuleManipulator.prototype._replaceASTStringElements = function(astArray, replacements) {
    var elem, _i, _len, _results;
    if (!_.isArray(astArray)) {
      astArray = [astArray];
    }
    _results = [];
    for (_i = 0, _len = astArray.length; _i < _len; _i++) {
      elem = astArray[_i];
      if (elem[0] === 'string') {
        if (replacements[elem[1]]) {
          _results.push(elem[1] = replacements[elem[1]]);
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  ModuleManipulator.prototype.getFactoryWithReplacedRequires = function(requireReplacements) {
    var fb, requireCallsReplacerSeeker;
    if (this.AST_FactoryBody) {
      requireCallsReplacerSeeker = {
        '_call': function(c) {
          if (c.name === 'require') {
            if (c.args[0][0] === 'array') {
              return this._replaceASTStringElements(c.args[0][1], requireReplacements);
            } else if (c.args[0][0] === 'string') {
              return this._replaceASTStringElements(c.args, requireReplacements);
            }
          }
        }
      };
      seekr([requireCallsReplacerSeeker], this.AST_FactoryBody, this.readAST, this);
      fb = (this.toCode(this.AST_FactoryBody)).trim();
      if (this.moduleInfo.moduleType === 'AMD') {
        fb = fb.slice(1, +(fb.length - 2) + 1 || 9e9).trim();
      }
      return this.moduleInfo.factoryBody = fb;
    }
  };

  return ModuleManipulator;

})(JSManipulator);

module.exports = ModuleManipulator;
