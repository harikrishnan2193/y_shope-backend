const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    price: {
        type: String,
        require: true
    },
    stock: {
        type: String,
        require: true
    },
    productImage: {
        type: String,
        require: true
    }
})

const products = mongoose.model('products', productSchema)

module.exports = products