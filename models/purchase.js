const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
    resourceID: String,
    name: String,
    price: Number,
    file: String,
    buyer: String,
    purchaseDate: String
});

module.exports = mongoose.model('Purchase', PurchaseSchema);