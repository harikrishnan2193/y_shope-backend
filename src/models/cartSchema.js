const mangoose = require('mongoose')

const cartSchema = new mangoose.Schema({
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

const carts = mangoose.model('carts', cartSchema)

module.exports = carts
