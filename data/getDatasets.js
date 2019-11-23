
const connectToDatabase = require('./configDb')
const microCors = require('micro-cors')

const cors = microCors({ allowMethods: ['GET'] })

const MS_IN_MIN = 60000
const MS_IN_HOUR = 60 * MS_IN_MIN
const MS_IN_DAY = 24 * MS_IN_HOUR

const MAX_DAYS = 60
const MAX_AVG_1 = 2 * MS_IN_DAY
const MAX_AVG_2 = 7 * MS_IN_DAY
const MAX_AVG_3 = 31 * MS_IN_DAY

const handler = async (req, res) => {
  const start = req.query.start ? new Date(req.query.start) : new Date(new Date() - 3 * 60 * 60 * 1000)
  const finish = req.query.finish ? new Date(req.query.finish) : new Date()

  if (finish - start > MAX_DAYS * MS_IN_DAY) {
    res.status(200).json({'result': `Range mast be less then ${MAX_DAYS} days.`})
    return
  }

  const db = await connectToDatabase(process.env.DB_URI)
  const collection = await db.collection('datasets')
  let datasets = null
  const MATCH_FROM_TO = {
    '$match' : {
      'created': { '$gte': start, '$lte': finish }
    }
  }
  const TEMP_VALUE = {
    '$avg': {
      '$convert': {
        'input': '$temperature', 
        'to': 'double'
      }
    }
  }
  const HUM_VALUE = {
    '$avg': {
      '$convert': {
        'input': '$humidity', 
        'to': 'double'
      }
    }
  }
  const PRESS_VALUE = {
    '$avg': {
      '$convert': {
        'input': '$pressure', 
        'to': 'double'
      }
    }
  }
  const ALT_VALUE = {
    '$avg': {
      '$convert': {
        'input': '$altitude', 
        'to': 'double'
      }
    }
  }
  const BAT_VALUE = {
    '$avg': {
      '$convert': {
        'input': '$battery', 
        'to': 'double'
      }
    }
  } 
  const SORT_1 = { '$sort': { '_id': 1 } }

  if (finish - start <= MAX_AVG_1) {
    let EVERY_M_MINITS = 5
    if (finish - start > MS_IN_DAY) EVERY_M_MINITS = 30

    datasets = await collection.aggregate(
      [
        MATCH_FROM_TO,
        {
          '$project': {
            'temperature': 1, 
            'humidity': 1, 
            'pressure': 1, 
            'altitude': 1,
            'battery': 1,
            'created': 1, 
            'M': {
              '$floor': {
                '$divide': [
                  {
                    '$minute': '$created'
                  }, EVERY_M_MINITS
                ]
              }
            }
          }
        }, {
          '$group': {
            '_id': {
              '$dateFromParts': {
                'year': {
                  '$year': '$created'
                }, 
                'month': {
                  '$month': '$created'
                }, 
                'day': {
                  '$dayOfMonth': '$created'
                }, 
                'hour': {
                  '$hour': '$created'
                }, 
                'minute': {
                  '$multiply': [
                    '$M', EVERY_M_MINITS
                  ]
                }
              }
            }, 
            'temperature': TEMP_VALUE, 
            'humidity': HUM_VALUE, 
            'pressure': PRESS_VALUE, 
            'altitude': ALT_VALUE,
            'battery': BAT_VALUE
          }
        },
        SORT_1
      ]
    ).toArray()
  }

  else if (finish - start <= MAX_AVG_2) {
    datasets = await collection.aggregate(
      [
        MATCH_FROM_TO,
        {
          '$group': {
            '_id': {
              '$dateFromParts': {
                'year': {
                  '$year': '$created'
                }, 
                'month': {
                  '$month': '$created'
                }, 
                'day': {
                  '$dayOfMonth': '$created'
                }, 
                'hour': {
                  '$hour': '$created'
                }
              }
            }, 
            'temperature': TEMP_VALUE, 
            'humidity': HUM_VALUE, 
            'pressure': PRESS_VALUE, 
            'altitude': ALT_VALUE,
            'battery': BAT_VALUE
          }
        },
        SORT_1
      ]
    ).toArray()
  }

  else if (finish - start <= MAX_AVG_3) {
    let EVERY_H_HOURS = 12
    if (finish - start < 15 * MS_IN_DAY) EVERY_H_HOURS = 6

    datasets = await collection.aggregate(
      [
        MATCH_FROM_TO,
        {
          '$project': {
            'temperature': 1, 
            'humidity': 1, 
            'pressure': 1, 
            'altitude': 1,
            'battery': 1, 
            'created': 1, 
            'H': {
              '$floor': {
                '$divide': [
                  {
                    '$hour': '$created'
                  }, EVERY_H_HOURS
                ]
              }
            }
          }
        }, {
          '$group': {
            '_id': {
              '$dateFromParts': {
                'year': {
                  '$year': '$created'
                }, 
                'month': {
                  '$month': '$created'
                }, 
                'day': {
                  '$dayOfMonth': '$created'
                }, 
                'hour': {
                  '$multiply': [
                    '$H', EVERY_H_HOURS
                  ]
                }
              }
            }, 
            'temperature': TEMP_VALUE, 
            'humidity': HUM_VALUE, 
            'pressure': PRESS_VALUE, 
            'altitude': ALT_VALUE,
            'battery': BAT_VALUE
          }
        },
        SORT_1
      ]
    ).toArray()
  }

  else {
    datasets = await collection.aggregate(
      [
        MATCH_FROM_TO,
        {
          '$group': {
            '_id': {
              '$dateFromParts': {
                'year': {
                  '$year': '$created'
                }, 
                'month': {
                  '$month': '$created'
                }, 
                'day': {
                  '$dayOfMonth': '$created'
                }
              }
            }, 
            'temperature': TEMP_VALUE, 
            'humidity': HUM_VALUE, 
            'pressure': PRESS_VALUE, 
            'altitude': ALT_VALUE,
            'battery': BAT_VALUE
          }
        },
        SORT_1
      ]
    ).toArray()
  }

  if (!datasets.length) {
    res.status(200).json({'result': 'There are no data sets for this range.'})
    return
  }

  let result = {}
  result.start = datasets[0]._id
  result.finish = datasets[datasets.length - 1]._id
  result.count = datasets.length
  result.datasets = datasets
  console.log(result)
  res.status(200).json(result)
}

module.exports = cors(handler)
