require('dotenv').config()

const express = require('express')
const app = express()
let couchProxy = require('./lib/express-couch-proxy')
//const request = require('request')
const helmet = require('helmet')
const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')
const port = process.env.PORT || 3000
const HTTPError = require('node-http-error')
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(helmet())
app.use(jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://tripott.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_CLIENT_ID,
  issuer: `https://tripott.auth0.com/`,
  algorithms: ['RS256']
}))

couchProxy = couchProxy({ realm: 'CouchDB Replication' }, function(
  database,
  username,
  password,
  next
) {
  //console.log('couchProxy', process.env.COUCHDB + '/' + database)
  return next(null, process.env.COUCHDB + '/' + database)
})

app.use('/sync', couchProxy)


app.use(bodyParser.json())

app.get('/', function(req, res, next) {
  res.send('pouch offline api')
})

// app.all('*', (req, res) => {
//   console.log('couch url: ', process.env.COUCHDB + req.url)
//   //request[req.method.toLowerCase()](process.env.COUCHDB).pipe(res)
//   request
//     [req.method.toLowerCase()](process.env.COUCHDB + req.url, {
//       auth: {
//         user: process.env.COUCH_KEY,
//         pass: process.env.COUCH_SECRET
//       },
//       headers: { 'Content-Type': 'application/json' }
//     })
//     .pipe(res)
// })

app.use((err, req, res, next) => {
  console.log(req.method, ' ', req.path, ' ', 'error: ', err)
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, () => console.log('API is up on', port))

/////////////////////////////////////////
/////////      HELPERS       ////////////
/////////////////////////////////////////
// const callback = (res, next) => (err, result) =>
//   err
//     ? next(new HTTPError(err.status, err.message, err))
//     : res.status(200).send(result)
