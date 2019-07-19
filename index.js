
const connectToDatabase = require('./data/configDb')

module.exports = async (req, res) => {
  const db = await connectToDatabase(process.env.DB_URI)
  const collection = await db.collection('datasets')
  const datasets = await collection.find().sort({'created': -1}).limit(1).toArray()    
  res.status(200).json({'lastDataset': datasets[0]})
}
