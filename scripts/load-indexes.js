const couchHTTPLocation =
  'https://ciperilessitheandesseene:347fc61e0e4d46f825fb04000f89e9626915b3ec@tripott.cloudant.com'
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const db = new PouchDB(couchHTTPLocation + '/fishing')

const query = {
  selector: {
    type: { $eq: 'entry' },
    authProfileID: 'google-oauth2|104444359422689207738'
  },
  sort: [
    { type: 'desc' },
    { authProfileID: 'desc' },
    { startDateTime: 'desc' }
  ],
  limit: 10
}

db
  .createIndex({
    index: { fields: ['type', 'authProfileID', 'startDateTime'] }
  })
  .then(function() {
    return db.find(query)
  })
  .then(result => console.log(result))
  .catch(err => console.log(err))

const designDoc = {
  _id: '_design/filteredReplication',
  filters: {
    myfilter: function(doc, req) {
      return doc.authProfileID === req.query.profileSub
    }.toString()
  }
}

db
  .put(designDoc)
  .then(result => console.log('Added filteredReplication design doc: ', result))
  .catch(err =>
    console.log('Error with adding filteredReplication design doc: ', err)
  )
