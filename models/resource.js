const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceSchema = new Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    subject: String,
    file: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // reviews: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Review'
    //     }
    // ]
});

module.exports = mongoose.model('Resource', ResourceSchema);