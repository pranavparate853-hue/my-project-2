const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/auth-system")
    .then(() => {
        console.log("mongo connected")
    })
    .catch((e) => {
        console.log("error")
    })

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
})

const Collection = new mongoose.model("AuthCollection", userSchema)

module.exports = Collection