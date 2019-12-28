
const connectToDatabase = require('./configDb')
const ObjectId = require('mongodb').ObjectID;

module.exports = async (req, res) => {

   if (req.body.key != 'mySuperKey') {
      res.status(400).send('Access denied')
      return
   }

   let dataset = {}
   dataset.temperature = +req.body.temperature
   dataset.humidity = +req.body.humidity
   dataset.pressure = +req.body.pressure
   dataset.altitude = +req.body.altitude
   dataset.battery = +req.body.battery
   
   const db = await connectToDatabase(process.env.DB_URI)
   const collection = await db.collection('datasets')

   if ( req.body.id ) {
      // update
      if (await collection.find({_id: ObjectId(req.body.id)}).count() < 1) {
         res.status(400).send('No object with this id.')
         return
      }
      dataset._id = ObjectId(req.body.id)
      dataset.created = new Date(req.body.created)
   } else {
      // insert
      dataset.created = new Date()
   }

   try {
      const result = await collection.save(dataset)
      res.status(200).json( result.ops ? result.ops[0] : dataset )
   } catch (error) {
      res.status(400).send( error )
   }
}
