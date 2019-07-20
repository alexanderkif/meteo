
const connectToDatabase = require('./configDb')

module.exports = async (req, res) => {
   const db = await connectToDatabase(process.env.DB_URI)
   const collection = await db.collection('datasets')
   let dataset = {}
   dataset.temperature = req.body.temperature
   dataset.humidity = req.body.humidity
   dataset.pressure = req.body.pressure
   dataset.altitude = req.body.altitude
   if (!dataset.created) dataset.created = new Date()
   if (dataset.temperature && dataset.humidity && dataset.pressure) {
      const result = await collection.insertOne(dataset)
      res.status(200).json( result.ops[0] )
   }
   else res.status(400).send( "Bad Request" )
}
