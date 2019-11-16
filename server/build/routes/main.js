"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var _passport = _interopRequireDefault(require("passport"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var tokenList = {};

var router = _express["default"].Router();

function processLogoutRequest(request, response) {
  if (request.cookies) {
    var refreshToken = request.cookies.refreshJwt;
    if (refreshToken in tokenList) delete tokenList[refreshToken];
    response.clearCookie('jwt');
    response.clearCookie('refreshJwt');
  }

  if (request.method === 'POST') {
    response.status(200).json({
      message: 'logged out',
      status: 200
    });
  } else if (request.method === 'GET') {
    response.sendFile('logout.html', {
      root: './public'
    });
  }
}

router.get('/status', function (request, response) {
  response.status(200).json({
    message: 'ok',
    status: 200
  });
});
router.post('/signup', _passport["default"].authenticate('signup', {
  session: false
}),
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(request, response) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            response.status(200).json({
              message: 'signup successful',
              status: 200
            });

          case 1:
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
router.post('/login',
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3(request, response, next) {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // eslint-disable-next-line consistent-return
            _passport["default"].authenticate('login',
            /*#__PURE__*/
            function () {
              var _ref3 = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee2(error, user) {
                return _regenerator["default"].wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.prev = 0;

                        if (!error) {
                          _context2.next = 3;
                          break;
                        }

                        return _context2.abrupt("return", next(error));

                      case 3:
                        if (user) {
                          _context2.next = 5;
                          break;
                        }

                        return _context2.abrupt("return", next(new Error('email and password are required')));

                      case 5:
                        request.login(user, {
                          session: false
                        }, function (err) {
                          if (err) return next(err); // create our jwt

                          var body = {
                            _id: user._id,
                            email: user.email,
                            name: user.username
                          };

                          var token = _jsonwebtoken["default"].sign({
                            user: body
                          }, process.env.JWT_SECRET, {
                            expiresIn: 300
                          });

                          var refreshToken = _jsonwebtoken["default"].sign({
                            user: body
                          }, process.env.JWT_REFRESH_SECRET, {
                            expiresIn: 86400
                          }); // store tokens in cookie


                          response.cookie('jwt', token);
                          response.cookie('refreshJwt', refreshToken); // store tokens in memory

                          tokenList[refreshToken] = {
                            token: token,
                            refreshToken: refreshToken,
                            email: user.email,
                            _id: user._id,
                            name: user.username
                          }; // send the token to the user

                          return response.status(200).json({
                            token: token,
                            refreshToken: refreshToken,
                            status: 200
                          });
                        });
                        _context2.next = 12;
                        break;

                      case 8:
                        _context2.prev = 8;
                        _context2.t0 = _context2["catch"](0);
                        console.log(_context2.t0);
                        return _context2.abrupt("return", next(_context2.t0));

                      case 12:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, null, [[0, 8]]);
              }));

              return function (_x6, _x7) {
                return _ref3.apply(this, arguments);
              };
            }())(request, response, next);

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}());
router.route('/logout').get(processLogoutRequest).post(processLogoutRequest);
router.post('/token', function (request, response) {
  var refreshToken = request.body.refreshToken;

  if (refreshToken in tokenList) {
    var body = {
      email: tokenList[refreshToken].email,
      _id: tokenList[refreshToken]._id,
      name: tokenList[refreshToken].name
    };

    var token = _jsonwebtoken["default"].sign({
      user: body
    }, process.env.JWT_SECRET, {
      expiresIn: 300
    }); // update jwt


    response.cookie('jwt', token);
    tokenList[refreshToken].token = token;
    response.status(200).json({
      token: token,
      status: 200
    });
  } else {
    response.status(401).json({
      message: 'unauthorized',
      status: 401
    });
  }
});
var _default = router;
exports["default"] = _default;
//# sourceMappingURL=main.js.map