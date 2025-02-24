const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    productId: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    price: {
        type: String,
        require: true
    },
    quantity: {
        type: String,
        require: true
    },
    productImage: {
        type: String,
        require: true
    },
    userId: {
        type: String,
        require: true
    }
})

const carts = mongoose.model('carts', cartSchema)

module.exports = carts
