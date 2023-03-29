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
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
})

module.exports = mongoose.model('Phone', phoneSchema)