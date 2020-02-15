
const connectToDatabase = require('./configDb')
const microCors = require('micro-cors')

const MAX_POINTS_TO_DISPLAY = 73
const TFRAME_DEFAULT = 'minute'
const STEP_DEFAULT = 5

const cors = microCors({ allowMethods: ['GET'] })

const handler = async (req, res) => {

  const start = req.query.start ? new Date(req.query.start) : new Date(new Date() - 3 * 60 * 60 * 1000)
  const finish = req.query.finish ? new Date(req.query.finish) : new Date()

  const tframe = req.query.tframe || TFRAME_DEFAULT
  const step = +req.query.step || +STEP_DEFAULT
  const learn = req.query.learn || false

  let msecTFrame = 60000
  if (tframe === 'hour') {
    msecTFrame *= 60
  }
  if (tframe === 'day') {
    msecTFrame = msecTFrame * 60 * 24
  }
  if (tframe === 'month') {
    msecTFrame = msecTFrame * 60 * 24 * 31
  }

  if (((finish-start)/(msecTFrame*step) > MAX_POINTS_TO_DISPLAY) && !learn) {
    res.status(200).json({'result': 'The data you requested is too large'})
    return
  }

  const db = await connectToDatabase(process.env.DB_URI)
  const collection = await db.collection('datasets')

  const datasets = await collection.aggregate(
    [
      {
        '$match': {
          'created': {
            '$gte': new Date(start), 
            '$lte': new Date(finish)
          }
        }
      }, {
        '$project': {
          'temperature': 1, 
          'humidity': 1, 
          'pressure': 1, 
          'altitude': 1, 
          'battery': 1,
          'sp': 1,
          'created': 1, 
          'range': {
            '$switch': {
              'branches': [
                {
                  'case': {
                    '$eq': [
                      tframe, 'minute'
                    ]
                  }, 
                  'then': {
                    '$floor': {
                      '$divide': [
                        {
                          '$minute': '$created'
                        }, step
                      ]
                    }
                  }
                }, {
                  'case': {
                    '$eq': [
                      tframe, 'hour'
                    ]
                  }, 
                  'then': {
                    '$floor': {
                      '$divide': [
                        {
                          '$hour': '$created'
                        }, step
                      ]
                    }
                  }
                }, {
                  'case': {
                    '$eq': [
                      tframe, 'day'
                    ]
                  }, 
                  'then': {
                    '$floor': {
                      '$divide': [
                        {
                          '$dayOfMonth': '$created'
                        }, step
                      ]
                    }
                  }
                }, {
                  'case': {
                    '$eq': [
                      tframe, 'month'
                    ]
                  }, 
                  'then': {
                    '$floor': {
                      '$divide': [
                        {
                          '$month': '$created'
                        }, step
                      ]
                    }
                  }
                }
              ]
            }
          }
        }
      }, {
        '$group': {
          '_id': {
            '$switch': {
              'branches': [
                {
                  'case': {
                    '$eq': [
                      tframe, 'minute'
                    ]
                  }, 
                  'then': {
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
                          '$range', step
                        ]
                      }
                    }
                  }
                }, {
                  'case': {
                    '$eq': [
                      tframe, 'hour'
                    ]
                  }, 
                  'then': {
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
                          '$range', step
                        ]
                      }
                    }
                  }
                }, {
                  'case': {
                    '$eq': [
                      tframe, 'day'
                    ]
                  }, 
                  'then': {
                    '$dateFromParts': {
                      'year': {
                        '$year': '$created'
                      }, 
                      'month': {
                        '$month': '$created'
                      }, 
                      'day': {
                        '$multiply': [
                          '$range', step
                        ]
                      }
                    }
                  }
                }, {
                  'case': {
                    '$eq': [
                      tframe, 'month'
                    ]
                  }, 
                  'then': {
                    '$dateFromParts': {
                      'year': {
                        '$year': '$created'
                      }, 
                      'month': {
                        '$multiply': [
                          '$range', step
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }, 
          'temperature': {
            '$avg': {
              '$convert': {
                'input': '$temperature', 
                'to': 'double'
              }
            }
          }, 
          'humidity': {
            '$avg': {
              '$convert': {
                'input': '$humidity', 
                'to': 'double'
              }
            }
          }, 
          'pressure': {
            '$avg': {
              '$convert': {
                'input': '$pressure', 
                'to': 'double'
              }
            }
          }, 
          'altitude': {
            '$avg': {
              '$convert': {
                'input': '$altitude', 
                'to': 'double'
              }
            }
          }, 
          'battery': {
            '$avg': {
              '$convert': {
                'input': '$battery', 
                'to': 'double'
              }
            }
          }, 
          'sp': {
            '$avg': {
              '$convert': {
                'input': '$sp', 
                'to': 'double'
              }
            }
          }
        }
      }, {
        '$sort': {
          '_id': 1
        }
      }
    ]
  ).toArray()

  if (!datasets.length) {
    res.status(200).json({'result': 'There are no data sets for this range.'})
    return
  }

  let result = {}
  result.start = datasets[0]._id
  result.finish = datasets[datasets.length - 1]._id
  result.count = datasets.length
  result.datasets = datasets
  res.status(200).json(result)
}

module.exports = cors(handler)
