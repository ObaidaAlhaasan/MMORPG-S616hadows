"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var _nodemailerExpressHandlebars = _interopRequireDefault(require("nodemailer-express-handlebars"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _path = _interopRequireDefault(require("path"));

var _crypto = _interopRequireDefault(require("crypto"));

var _UserModel = _interopRequireDefault(require("../models/UserModel"));

var email = process.env.EMAIL;
var password = process.env.PASSWORD;

var smtpTransport = _nodemailer["default"].createTransport({
  service: process.env.EMAIL_PROVIDER,
  auth: {
    user: email,
    pass: password
  }
});

var handlebarsOptions = {
  viewEngine: {
    extName: '.hbs',
    defaultLayout: null,
    partialsDir: './templates/',
    layoutsDir: './templates/'
  },
  viewPath: _path["default"].resolve('./templates/'),
  extName: '.html'
};
smtpTransport.use('compile', (0, _nodemailerExpressHandlebars["default"])(handlebarsOptions));

var router = _express["default"].Router();

router.post('/forgot-password',
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(request, response) {
    var userEmail, user, buffer, token, emailOptions;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            userEmail = request.body.email;
            _context.next = 3;
            return _UserModel["default"].findOne({
              email: userEmail
            });

          case 3:
            user = _context.sent;

            if (user) {
              _context.next = 7;
              break;
            }

            response.status(400).json({
              message: 'invalid email',
              status: 400
            });
            return _context.abrupt("return");

          case 7:
            // create user token
            buffer = _crypto["default"].randomBytes(20);
            token = buffer.toString('hex'); // update user reset password token and exp

            _context.next = 11;
            return _UserModel["default"].findByIdAndUpdate({
              _id: user._id
            }, {
              resetToken: token,
              resetTokenExp: Date.now() + 600000
            });

          case 11:
            // send user password reset email
            emailOptions = {
              to: userEmail,
              from: email,
              template: 'forgot-password',
              subject: 'Zenva Phaser MMO Password Reset',
              context: {
                name: 'joe',
                url: "http://localhost:".concat(process.env.PORT || 3000, "/?token=").concat(token, "&scene=resetPassword")
              }
            };
            _context.next = 14;
            return smtpTransport.sendMail(emailOptions);

          case 14:
            response.status(200).json({
              message: 'An email has been sent to your email address. Password reset link is only valid for 10 minutes.',
              status: 200
            });

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.post('/reset-password',
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(request, response) {
    var userEmail, user, emailOptions;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            userEmail = request.body.email;
            _context2.next = 3;
            return _UserModel["default"].findOne({
              resetToken: request.body.token,
              resetTokenExp: {
                $gt: Date.now()
              },
              email: userEmail
            });

          case 3:
            user = _context2.sent;

            if (user) {
              _context2.next = 7;
              break;
            }

            response.status(400).json({
              message: 'invalid token',
              status: 400
            });
            return _context2.abrupt("return");

          case 7:
            if (!(!request.body.password || !request.body.verifiedPassword || request.body.password !== request.body.verifiedPassword)) {
              _context2.next = 10;
              break;
            }

            response.status(400).json({
              message: 'passwords do not match',
              status: 400
            });
            return _context2.abrupt("return");

          case 10:
            // update user model
            user.password = request.body.password;
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            _context2.next = 15;
            return user.save();

          case 15:
            // send user password update email
            emailOptions = {
              to: userEmail,
              from: email,
              template: 'reset-password',
              subject: 'Zenva Phaser MMO Password Reset Confirmation',
              context: {
                name: user.username
              }
            };
            _context2.next = 18;
            return smtpTransport.sendMail(emailOptions);

          case 18:
            response.status(200).json({
              message: 'password updated',
              status: 200
            });

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=password.js.map