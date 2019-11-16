"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

/* eslint-disable func-names */
var Schema = _mongoose["default"].Schema;
var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unqiue: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  resetToken: {
    type: String
  },
  resetTokenExp: {
    type: Date
  }
});
UserSchema.pre('save',
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(next) {
    var hash;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _bcrypt["default"].hash(this.password, 10);

          case 2:
            hash = _context.sent;
            this.password = hash;
            next();

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

UserSchema.methods.isValidPassword =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(password) {
    var user, compare;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            user = this;
            _context2.next = 3;
            return _bcrypt["default"].compare(password, user.password);

          case 3:
            compare = _context2.sent;
            return _context2.abrupt("return", compare);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var UserModel = _mongoose["default"].model('user', UserSchema);

var _default = UserModel;
exports["default"] = _default;
//# sourceMappingURL=UserModel.js.map