const express = require("express");
const app = express();
const connectDatabase = require("./config/database");
const port = process.env.PORT || 3000;
const Maxtoys = require("./model/maxtoys");
const { body, validationResult } = require("express-validator");

const Mongoose = require("mongoose");
const Bcrypt = require("bcryptjs");

const Admin = require('./model/admin')
var jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path')
var bodyParser = require('body-parser');
const timestamp = require('time-stamp');

// database Connection
connectDatabase();

// app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

console.log(timestamp('MM/DD/YYYY HH:mm:ss'));

//----------------------------------------Add admin & Login----------------------------------


app.post("/admin", async (request, response) => {
  try {
      request.body.password = Bcrypt.hashSync(request.body.password, 10);
      var user = new Admin(request.body);
      var result = await user.save();
      response.send(result);
  } catch (error) {
      response.status(500).send(error);
  }
});

app.post("/login", async (request, response) => {
  try {
      var user = await Admin.findOne({ username: request.body.username }).exec();
      if(!user) {
          return response.status(400).send({
              success : false,
              message: "The admin does not exist"
             });
      }
      if(!Bcrypt.compareSync(request.body.password, user.password)) {
          return response.status(400).send({
            success : false,
             message: "The password is invalid"
             });
      }
      //jwt Token
      const token = jwt.sign(
        {
          username : request.body.username,
          password : request.body.password
        },
         'maxtoys',
        {
          expiresIn : "24h"
        } 
        );
      response.send({
        success : true,
         message: "Admin successfully login.",
         token
         });
  } catch (error) {
      response.status(500).send(error);
  }
});

//----------------------------------------Add admin to mongodb----------------------------------



//----------------------------------------Post Add data to mongodb----------------------------------
//----------------------------------------Post Add  data to mongodb----------------------------------

//=========================================for upload image=================
const storage = multer.diskStorage({
  destination : './upload/images',
  filename:  function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname) );
  } 
})

const imageUpload = multer({
  storage: storage
})
//=========================================for upload image=================


// function save data to mongodb
const newMaxtoysData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
//------------------------for upload image
// console.log(req.file);
// console.log(req.body);

req.body.time =timestamp('MM/DD/YYYY HH:mm:ss');
console.log(`http://localhost:3000/image/${req.file.filename}`);
console.log(`https://maxtoys-api.herokuapp.com/images/${req.file.filename}`);
const imageUrl =`https://maxtoys-api.herokuapp.com/images/${req.file.filename}`
req.body.image =imageUrl;
  const maxtoys = await Maxtoys.create(req.body);

  res.status(201).json({
    success: true,
    //------------------------for upload image
    // image: `http://localhost:3000/image/${req.file.filename}`,
    maxtoys,
  });
};

app.use('/image', express.static('./upload/images'))
//Route for save data
app.post(
  "/newMaxtoys",
  //------------------------for upload image
  imageUpload.single('image'),
  [
    body("length", "enter length").isLength({ min: 1 }),
    body("width", "enter width").isLength({ min: 1 }),
    body("height", "enter height").isLength({ min: 1 }),
    // body('barcode', "enter barcode").isLength({ min: 5 }),
    body("shape", "enter shape").isLength({ min: 4 }),
    body("device", "enter device").isLength({ min: 4 }),
  ], 
  newMaxtoysData
);

//-----------------------------------------------Post  Add data to mongodb----------------------------------
//-----------------------------------------------Post Add  data to mongodb----------------------------------

//------------------------------------------------Get data to mongodb----------------------------------
//------------------------------------------------Get data to mongodb----------------------------------

const getMextoys = async (req, res, next) => {
  const totalCount = await Maxtoys.countDocuments();

  //----------search query exist--------------
  if (req.query.search) {
    let pageNo = req.query.page_no;
    let perPage = req.query.rowPerPage;
    let searchTerm = new RegExp(req.query.search, "i");
    let search_term = await Maxtoys.find({
      $or: [
        { name: searchTerm },
        { customer: searchTerm },
        { supplier: searchTerm },
        { barcode: searchTerm },
        { height: searchTerm },
        { width: searchTerm },
        { length: searchTerm },
        { device: searchTerm },
        { shape: searchTerm },
      ],
    })
      .skip((pageNo - 1) * perPage)
      .limit(perPage);

    return res.json({
      success: true,
      totalCount,
      count: search_term.length,
      pageNo,
      perPage,
      maxtoys: search_term,
    });
  }

  //----------search query no exist--------------
  var sortObject = {};
  var stype = req.query.column_name;
  var sdir = req.query.sortType;
  sortObject[stype] = sdir;
  let pageNo = req.query.page_no;
  let perPage = req.query.rowPerPage;
  const maxtoys = await Maxtoys.find()
    .skip((pageNo - 1) * perPage)
    .limit(perPage)
    .sort(sortObject); //For Sorting

  return res.status(200).json({
    success: true,
    totalCount,
    count: maxtoys.length,
    pageNo,
    perPage,
    maxtoys,
  });
};
app.get("/getMaxtoys", getMextoys);

//------------------------------------------------Get data to mongodb----------------------------------
//------------------------------------------------Get data to mongodb----------------------------------

//------------------------------------------------update data to mongodb----------------------------------
//------------------------------------------------update data to mongodb----------------------------------

const updateMaxData = async (req, res, next) => {
  try {
    let maxtoys = await Maxtoys.findByIdAndUpdate(
      { _id: req.query._id },
      {
        $set: {
          name: req.query.name,
          customer: req.query.customer,
          supplier: req.query.supplier,
        },
      }
    );
    res.json({
      success: true,
      message: "Successfully updated",
    });
  } catch (er) {
    console.log(er);
  }
};

app.get("/update", updateMaxData);
//------------------------------------------------update data to mongodb----------------------------------
//------------------------------------------------update data to mongodb----------------------------------

app.get("/test", (req, resp) => {
  resp.json({
    success: true,
    Name: "This is Testing Api!",
  });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
