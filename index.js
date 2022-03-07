const express = require("express");
const app = express();
const connectDatabase = require("./config/database");
const port = process.env.PORT || 3000;
const Maxtoys = require("./model/maxtoys");
const { body, validationResult } = require("express-validator");

const Mongoose = require("mongoose");
const Bcrypt = require("bcryptjs");

const Admin = require("./model/admin");
var jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
var bodyParser = require("body-parser");
const timestamp = require("time-stamp");
var cors = require('cors');

// database Connection
connectDatabase();

// app.use(express.json());
app.use(cors({origin: '*'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

console.log(timestamp("MM/DD/YYYY HH:mm:ss"));

//----------------------------------------Add admin & Login----------------------------------
//----------------------------------------Add admin & Login----------------------------------
app.post("/admin", async (request, response) => {
  try {
    request.body.password = Bcrypt.hashSync(request.body.password, 10);
    var user = new Admin(request.body);
    var result = await user.save();
    response.json({ result });
  } catch (error) {
    response.status(500).send(error);
  }
});
//---------------------Login----------------
app.post("/login", async (request, response) => {
  try {
    var user = await Admin.findOne({ username: request.body.username }).exec();
    if (!user) {
      return response.status(400).send({
        success: false,
        message: "The admin does not exist",
      });
    }
    if (!Bcrypt.compareSync(request.body.password, user.password)) {
      return response.status(400).send({
        success: false,
        message: "The password is invalid",
      });
    }
    //jwt Token
    const token = jwt.sign(
      {
        username: request.body.username,
        password: request.body.password,
      },
      "maxtoys",     // secrat key
      {
        expiresIn: "24h",
      }
    );
    response.send({
      success: true,
      message: "Admin successfully login.",
      token,
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

//*************************************Verify Token**************************

const verifyToken = (req, res, next) => {
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") {
        return res.status(401).json("invalid request"); //invalid request
      } else {
        req.jwt = jwt.verify(authorization[1], "maxtoys", (err, authData) => {
          if (err) {
            return res.json({ result: err , status:500});
          }
          // user
          // return res.json({authData})
          return next();
        });
      }
    } catch (err) {
      return res.status(403).send(); //invalid token
    }
  } else {
    return res.status(401).json("invalid request");
  }
};
//*************************************Verify Token**************************
//----------------------------------------Add admin to mongodb----------------------------------
//----------------------------------------Add admin to mongodb----------------------------------

//----------------------------------------Post Add data to mongodb----------------------------------
//----------------------------------------Post Add  data to mongodb----------------------------------

//=========================================for upload image=================
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageUpload = multer({
  storage: storage,
  limits: { fileSize: 524288 },
});
//=========================================for upload image=================

// function save data to mongodb
const newMaxtoysData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  //------------------------for upload image
  // console.log(req.file);

  req.body.time = timestamp("MM/DD/YYYY HH:mm:ss");
  // console.log(`http://localhost:3000/image/${req.file.filename}`);
  // console.log(`https://maxtoys-api.herokuapp.com/image/${req.file.filename}`);
  const imageUrl = `https://maxtoys-api.herokuapp.com/image/${req.file.filename}`;
  req.body.image = imageUrl;
  const maxtoys = await Maxtoys.create(req.body);

  res.status(201).json({
    success: true,
    maxtoys,
  });
};

app.use("/image", express.static("./upload/images"));

//Route for save data
app.post(
  "/newMaxtoys",
  //------------------------for upload image
  imageUpload.single("image"),
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
//---------iamge upload errorHandler-----------
function errHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.json({
      success: false,
      message: err.message,
    });
  }
}
app.use(errHandler);
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
      status:200,
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
    status:200,
    totalCount,
    count: maxtoys.length,
    pageNo,
    perPage,
    maxtoys,
  });
};
app.get("/getMaxtoys", verifyToken, getMextoys);

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

app.get("/update", verifyToken, updateMaxData);
//------------------------------------------------update data to mongodb----------------------------------
//------------------------------------------------update data to mongodb----------------------------------



//------------------------------------------------suggestions----------------------------------
//------------------------------------------------suggestions----------------------------------
app.get("/suggestion", async(req, res)=>{
  let fieldName = req.query.fieldName;
  const totalCount = await Maxtoys.countDocuments();  
  let searchTerm = new RegExp(req.query.searchTerm, "i");
  let data = await Maxtoys.find({ [fieldName] : searchTerm },  {[fieldName]: 1, _id:0})
  res.json({
    totalCount,
    suggestionCount : data.length,
    data
  })  
})
//------------------------------------------------suggestions----------------------------------
//------------------------------------------------suggestions----------------------------------


app.get("/test", verifyToken, (req, resp) => {
  resp.json({
    success: true,
    Name: "This is Testing Api!",
  });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
