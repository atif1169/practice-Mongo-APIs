const mongooes = require('mongoose');


const maxtoysSchema = new mongooes.Schema({
    time:{
        type: String,
        default: Date.now
    },
    length:{
        type: String,
        required: true,
    },
    width:{
        type: String,
        required: true,
    },
    height:{
        type: String,
        required:true,
    },
    barcode:{
        type:String,
        required: true,
        default:123456789,
    },
    shape:{
        type: String,
        required: true,
    },
    device:{
        type: String,
        required:true,
    },
    image: {
        type: String
    },
    name : {
        type : String
    },
    customer : {
        type : String
    },
    supplier : {
        type : String
    },
    
})


module.exports = mongooes.model("maxtoys", maxtoysSchema);