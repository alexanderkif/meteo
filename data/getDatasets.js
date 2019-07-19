
const connectToDatabase = require('./configDb')

const MAX_RANGE = 30 * 24 * 60 * 60 * 1000

module.exports = async (req, res) => {
  const start = req.query.start ? new Date(req.query.start) : new Date(new Date() - 3 * 60 * 60 * 1000)
  const finish = req.query.finish ? new Date(req.query.finish) : new Date()
  // const page = +req.query.page || 1
  // const perPage = +req.query.perPage || 25
  // console.log(start)
  // console.log(finish)

  if (finish - start > MAX_RANGE) {
    res.status(200).json({'result': 'Error. Too large range'})
  }
  else {
    const filter = {'created': { $gte: start, $lte: finish }}

    const db = await connectToDatabase(process.env.DB_URI)
    const collection = await db.collection('datasets')
    // const datasets = await collection.find({}).sort({'created': -1}).skip(page * perPage - perPage).limit(perPage).toArray()
    const datasets = await collection.find(filter).toArray()
    const count = await collection.find(filter).count()
    let result = {}  
    result.start = start
    result.finish = finish
    // result.page = page
    // result.perPage = perPage
    result.count = count
    // result.pages = Math.ceil(count / perPage)
    result.datasets = datasets
    res.status(200).json(result)
  }
}
