const mongoose = require('mongoose');


const connectDatabase = () =>{
    mongoose.connect("mongodb://localhost:27017/maxtoys", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true  //error
        
    }).then(con =>{
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    })
}

module.exports = connectDatabase;

