const mongooes = require('mongoose');


const maxtoysSchema = new mongooes.Schema({
    name:{
        type: String,
        required: true,
    },
    time:{
        type: Date,
        default: Date.now
    },
    length:{
        type: Number,
        required: true,
    },
    width:{
        type: Number,
        required: true,
    },
    height:{
        type: Number,
        required:true,
    },
    barcode:{
        type:Number,
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
    }
    
})


module.exports = mongooes.model("maxtoys", maxtoysSchema);