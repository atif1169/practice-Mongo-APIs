const mongoose = require('mongoose');


const connectDatabase = () =>{
    mongoose.connect("mongodb+srv://atif:atif@cluster0.ddngw.mongodb.net/maxtoys?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true  //error
        
    }).then(con =>{
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    })
}

module.exports = connectDatabase;

