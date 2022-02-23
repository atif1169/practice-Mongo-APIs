const express = require("express");
const app = express();
const connectDatabase = require("./config/database");
const port = process.env.PORT || 3000;
const Maxtoys = require("./model/maxtoys");
const { body, validationResult } = require("express-validator");

// database Connection
connectDatabase();

app.use(express.json());

//----------------------------------------Post Add data to mongodb----------------------------------
//----------------------------------------Post Add  data to mongodb----------------------------------

// function save data to mongodb
const newMaxtoysData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const maxtoys = await Maxtoys.create(req.body);

  res.status(201).json({
    success: true,
    maxtoys,
  });
};

//Route for save data
app.post(
  "/newMaxtoys",
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

const getMextoys = async(req, res, next)=>{
  // console.log(req.query.no);

  const totalCount = await Maxtoys.countDocuments();

  let pageNo =req.query.page_no;
  let perPage = req.query.rowPerPage; 
  const maxtoys = await Maxtoys.find()
    .skip((pageNo-1) * perPage )
    .limit(perPage);

    res.status(200).json({
        success: true,
        totalCount,
        count : maxtoys.length,
        pageNo,
        perPage,
        maxtoys
    })
}
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
      success : true,
      message : "Successfully updated"
    })
  } catch (er) {
    console.log(er);
  }
};


app.get("/update", updateMaxData)
//------------------------------------------------update data to mongodb----------------------------------
//------------------------------------------------update data to mongodb----------------------------------


app.get("/test", (req, resp) => {
  resp.json({
    success: true,
    Name: "This is Testing Api!",
  });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
