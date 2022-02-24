const mongooes = require('mongoose');
const Bcrypt = require("bcryptjs");


const adminSchema = new mongooes.Schema({
    username:{
        type: String,
        required : true
    },
    password:{
        type: String,
        required : true
    }
})


module.exports = mongooes.model("admin", adminSchema);