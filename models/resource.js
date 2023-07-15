const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceSchema = new Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    subject: String,
    file: String,
    // Author will be added separately from this schema and will be written to the Postgres DB.
    // author: String, 
    // reviews: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Review'
    //     }
    // ]
});

module.exports = mongoose.model('Resource', ResourceSchema);