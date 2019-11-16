import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const tokenList = {};
const router = express.Router();

function processLogoutRequest(request, response) {
  if (request.cookies) {
    const refreshToken = request.cookies.refreshJwt;
    if (refreshToken in tokenList) delete tokenList[refreshToken];
    response.clearCookie('jwt');
    response.clearCookie('refreshJwt');
  }
  if (request.method === 'POST') {
    response.status(200).json({ message: 'logged out', status: 200 });
  } else if (request.method === 'GET') {
    response.sendFile('logout.html', { root: './public' });
  }
}

router.get('/status', (request, response) => {
  response.status(200).json({ message: 'ok', status: 200 });
});

router.post('/signup', passport.authenticate('signup', { session: false }), async (request, response) => {
  response.status(200).json({ message: 'signup successful', status: 200 });
});

router.post('/login', async (request, response, next) => {
  // eslint-disable-next-line consistent-return
  passport.authenticate('login', async (error, user) => {
    try {
      if (error) {
        return next(error);
      }
      if (!user) {
        return next(new Error('email and password are required'));
      }

      request.login(user, { session: false }, (err) => {
        if (err) return next(err);

        // create our jwt
        const body = {
          _id: user._id,
          email: user.email,
          name: user.username,
        };

        const token = jwt.sign({ user: body }, process.env.JWT_SECRET, { expiresIn: 300 });
        const refreshToken = jwt.sign(
          { user: body }, process.env.JWT_REFRESH_SECRET, { expiresIn: 86400 },
        );

        // store tokens in cookie
        response.cookie('jwt', token);
        response.cookie('refreshJwt', refreshToken);

        // store tokens in memory
        tokenList[refreshToken] = {
          token,
          refreshToken,
          email: user.email,
          _id: user._id,
          name: user.username,
        };

        // send the token to the user
        return response.status(200).json({ token, refreshToken, status: 200 });
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
  })(request, response, next);
});

router.route('/logout')
  .get(processLogoutRequest)
  .post(processLogoutRequest);

router.post('/token', (request, response) => {
  const { refreshToken } = request.body;
  if (refreshToken in tokenList) {
    const body = {
      email: tokenList[refreshToken].email,
      _id: tokenList[refreshToken]._id,
      name: tokenList[refreshToken].name,
    };
    const token = jwt.sign({ user: body }, process.env.JWT_SECRET, { expiresIn: 300 });

    // update jwt
    response.cookie('jwt', token);
    tokenList[refreshToken].token = token;

    response.status(200).json({ token, status: 200 });
  } else {
    response.status(401).json({ message: 'unauthorized', status: 401 });
  }
});

export default router;
