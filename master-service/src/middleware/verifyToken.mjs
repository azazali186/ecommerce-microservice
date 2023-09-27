import jwt from "jsonwebtoken"
import { getMethodName } from '../utils/index.mjs'
import { requestAuthentication } from '../rabbitMq/requestAuthentication.mjs'

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) res.status(401).json(err)
      req.user = user
      next()
    })
  } else {
    return res.status(401).json({ message: "Required token in header!" })
  }
}

export const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, async () => {
    let granted = false;

    if(req.user.role != 'admin' || req.user.id != req.params.id ){
  
      let name = (getMethodName(req.method) + (req.baseUrl).split(':')[0].replaceAll('/', "-")).toLowerCase();
      if (name.endsWith('-')) {
        name = name.slice(0, -1);
      }

      const id = req.params.id ? '/:id' : ''

      let path = req.baseUrl.endsWith('/') ? req.baseUrl.slice(0, -1) : req.baseUrl;

      const reqData = {
        userId: req.user.id,
        route: path + id ,
        token: req.headers.authorization.split(" ")[1]
      }

      granted = JSON.parse(await requestAuthentication(reqData))

    }

    if (req.user.id === req.params.id || req.user.role == 'admin' || granted?.isAuthenticated ) {
      next();
    } else {
      res.status(403).json({
        message: 'You are not Authorize to perform this action!'
      })
    }
  })
}

export const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role == 'admin') {
      next();
    } else {
      res.status(403).json({
        message: 'You are not Authorize to perform this action!'
      })
    }
  })
}

export default { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin }