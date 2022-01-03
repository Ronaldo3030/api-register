const mongoose = require('mongoose')

const User = mongoose.model('User', {
    email: String,
    login: String,
    senha: String
})

module.exports = User