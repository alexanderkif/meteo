
const url = require('url')
const MongoClient = require('mongodb').MongoClient

let cachedDb = null

async function connectToDatabase(uri) {
  if (cachedDb) {
    return cachedDb
  }
  const client = await MongoClient.connect(uri, { useNewUrlParser: true })
  const db = await client.db(url.parse(uri).pathname.substr(1))
  cachedDb = db
  return db
}

module.exports = async (req, res) => {
  const page = +req.query.page || 1
  const perPage = +req.query.perPage || 20
  const db = await connectToDatabase(process.env.DB_URI)
  const collection = await db.collection('datasets')
  const datasets = await collection.find({}).skip(page * perPage - perPage).limit(perPage).toArray()
  const count = await collection.find({}).count()
  let result = {}
  result.page = page
  result.perPage = perPage
  result.count = count
  result.pages = Math.ceil(count / perPage)
  result.datasets = datasets
  res.status(200).json(result)
}
