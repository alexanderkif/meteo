var mongoose = require('mongoose');
 
var datasetSchema = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    temperature: Number,
    humidity: Number,
    pressure: Number,
    altitude: Number,
    created: { 
        type: Date,
        default: Date.now
    }
});
 
var Dataset = mongoose.model('Dataset', datasetSchema);
 
module.exports = Dataset;