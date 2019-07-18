
var connectToDatabase = require('./configDb')

module.exports = async (req, res) => {
   const db = await connectToDatabase(process.env.DB_URI)
   const collection = await db.collection('datasets')
   let dataset = req.body
   if (!dataset.created) dataset.created = new Date()
   const result = await collection.insertOne(dataset)
   res.status(200).json( result.ops[0] )
}
