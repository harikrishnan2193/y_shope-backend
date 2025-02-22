const mangoose = require('mongoose')

const userSchema = new mangoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    role:{
        type:String,
        default: 'user'
    }
})

const users = mangoose.model('users', userSchema)

module.exports = users