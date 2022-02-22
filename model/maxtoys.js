const mongooes = require('mongoose');


const maxtoysSchema = new mongooes.Schema({
    time:{
        type: Date,
        default: Date.now
    },
    length:{
        type: Number,
        required: [true, 'Please enter length'],
        // default: 0
    },
    width:{
        type: Number,
        required: [true, 'Please enter width'],
        // default: 0
    },
    height:{
        type: Number,
        required: [true, 'Please enter height'],
        // default: 0
    },
    barcode:{
        type:Number,
        required: [true, 'Please enter barcode'],
        default: 0
    },
    shape:{
        type: String,
        required: [true, 'Please enter shape'],
        // default: "shape"
    },
    device:{
        type: String,
        required:[true, 'Please enter device'],
        // default: "device"
    },
    image: {
        type: String
    }
    
})


module.exports = mongooes.model("maxtoys", maxtoysSchema);