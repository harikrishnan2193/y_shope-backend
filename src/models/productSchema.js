const mangoose = require('mongoose')

const productSchema = new mangoose.Schema({
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

const products = mangoose.model('products', productSchema)

module.exports = products