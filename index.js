
const connectToDatabase = require('./data/configDb')
// const microCors = require('micro-cors')

// const cors = microCors({ allowMethods: ['GET','POST'] })
// const allowCors = fn => async (req, res) => {
//   res.setHeader('Access-Control-Allow-Credentials', true)
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   // another common pattern
//   // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
//   res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
//   )
//   if (req.method === 'OPTIONS') {
//     res.status(200).end()
//     return
//   }
//   return await fn(req, res)
// }

const handler = async (req, res) => {
  const db = await connectToDatabase(process.env.DB_URI)
  const collection = await db.collection('datasets')
  const datasets = await collection.find().sort({'created': -1}).limit(1).toArray()    
  res.status(200).json({'lastDataset': datasets[0]})
}

// module.exports = cors(handler)
// module.exports = allowCors(handler)
module.exports = handler
