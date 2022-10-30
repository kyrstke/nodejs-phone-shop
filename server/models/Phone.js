const mongoose = require('mongoose')

const phoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number
    },
    image: {
        type: String,
        unique: true
    },
    in_stock: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('Phone', phoneSchema)