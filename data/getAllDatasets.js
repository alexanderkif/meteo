
const mongoose = require('mongoose')
const Dataset = require('./Dataset')

module.exports = async (req, res) => {
   mongoose.connect(process.env.DB_URI, {useNewUrlParser: true})
   var db = mongoose.connection;
   db.on('error', console.error.bind(console, 'connection error:'));
   db.once('open', function() {
      Dataset.find({})
         .exec(function(err, datasets) {
            if (err) throw err
            // console.log(datasets)
            res.status(200).json(datasets)
         })

      // const dataset = new Dataset({ temperature: 26.5,
      //                               humidity: 65,
      //                               pressure: 750 });
      // dataset.save().then((data) => res.status(200).json( data ));
   })
}