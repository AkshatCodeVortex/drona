var express = require("express");
var app = express();
var bodyParser = require("body-parser");
//var parser = require("json-parser");
const { v4: uuidv4 } = require("uuid");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
app.use(bodyParser.json());
const cors = require("cors");
const { parseArgs } = require("util");
app.use("/static", express.static("public"));
const session = require("express-session");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/static", express.static("public"));

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

var dbUrl =
  "mongodb+srv://Akshat_Verma:akshat1234@cluster0.d4yimus.mongodb.net/";
var dbName = "drona";

// Use connect method to connect to the server
MongoClient.connect(dbUrl, function (err, client) {
  async function run() {
    try {
      await client.connect();

      console.log("MongoDB Connected successfully to server");
    } catch (err) {
      console.log(err.stack);
    } finally {
      await client.close();
    }
  }
  //const assert = require('assert');
  // console.log('MongoDB Connected successfully to server');
  const db = client.db(dbName);
  app.locals.db = db;
});

// app.use('/api', router);

// router.get('/demo', function(req, res){
//     res.json("DEMO API TEST");
//     console.log('/demo api hit');
// });
// router.get('/', function(req, res){
//     res.json("DEMO API TEST");
//     console.log('/demo api hit');
// });

// app.get("/checkversion/:version", (req, res) => {
//   var version = req.params.version;
//   var currentversion = "3";
//   if (version >= currentversion) {
//     res.json({ version: version, newversionavaible: false });
//   } else {
//     res.json({ version: version, newversionavaible: true });
//   }
// });
// bcrypt.hash("password", 10, (err, hash) => {
//   console.log(hash);
// });
router.get("/login", function (req, res) {
  res.render("login");
});

app.post("/register", async (req, res) => {
  const db = req.app.locals.db;
  const { email, name, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const collectionA = db.collection("user");

  var data2 = {
    name: name,
    email: email,
    password: hashedPassword,
    profileimage: "",
    profileimageexist: false,
  };

  const user = await collectionA.find({ email: email }).limit(1).toArray();
  if (user.length) {
    res.json({
      email: email,
      register: false,
      msg: "user is not register",
    });
  } else {
    collectionA.insert(data2, { w: 1 }, function (err, result) {
      if (err) {
        res.end("Registration Error1");
        console.warn(err.message); // returns error if no matching object found
      } else {
      }
    });
    res.json({
      email: email,
      register: true,
      msg: "Sucessfull",
    });
    // res.render("login");
  }
});

app.post("/login", async (req, res) => {
  const db = req.app.locals.db;
  var uid = uuidv4();
  var key = "" + uid + "";
  const { email, password } = req.body;

  const collectionA = db.collection("user");
  const user2 = await collectionA.find({ email: email }).limit(1).toArray();

  if (user2.length) {
    var hashedPassword = String(user2[0]["password"]);
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordMatch) {
      res.status(200).json({
        email: email,
        register: true,
        msg: "login sucessfull",
        key: key,
      });
      console.log("login sucessfull");
      collectionA.updateOne(
        { email: email }, // query
        { $set: { akey: key } }, // replacement, replaces only the field "hi"
        {}, // options
        function (err, object) {}
      );
    } else {
      res.status(400).json({
        email: email,
        register: false,
        msg: "password does not match",
      });
      console.log("password does not match");
    }
  } else {
    res.status(400).json({
      email: email,
      register: false,
      msg: "email is not exists",
    });
    console.log("email is not found");
  }
});

// Dashboard route
app.get("/auth", async (req, res) => {
  var key = req.headers.key;
  const db = req.app.locals.db;
  const collectionA = db.collection("user");
  const user2 = await collectionA.find({ akey: key }).limit(1).toArray();
  console.log(user2.length);
  if (user2.length) {
    var name = String(user2[0]["name"]);
    var email = String(user2[0]["email"]);
    var profileimage = String(user2[0]["profileimage"]);
    var profileimageexist = String(user2[0]["profileimageexist"]);
    res.status(200).json({
      email: email,
      profileimage: profileimage,
      profileimageexist: profileimageexist,
      login: true,
      key: key,
      msg: `welcom ${name} to the dashboard ${key}`,
    });

    console.log("login to dashboard sucessfull");
  } else {
    res.status(400).json({
      email: "",
      login: false,
      msg: "invalid key",
    });
    console.log("invalid key");
  }
});

app.get("/logout", async (req, res) => {
  var key = req.headers.key;
  var updatekey = 1;
  const db = req.app.locals.db;
  const collectionA = db.collection("user");
  const user2 = await collectionA.find({ akey: key }).limit(1).toArray();
  if (user2.length) {
    collectionA.updateOne(
      { akey: key },
      { $set: { akey: updatekey } }, // replacement, replaces only the field "hi"
      {}, // options
      function (err, object) {}
    );
    res.status(200).json({
      msg: " key found",
    });
  } else {
    res.status(400).json({
      msg: "invalid key",
    });
  }
});

app.get("/list", async (req, res) => {
  const db = req.app.locals.db;
  const collectionA = db.collection("user");
  const user2 = await collectionA.find({}).limit(0).toArray();
  if (user2.length) {
    console.log(user2.length);
    res.json({
      size: user2.length,
      list: user2,
    });
  }
});

app.post("/delete", async (req, res) => {
  var email = req.body.email;
  const db = req.app.locals.db;
  const collectionA = db.collection("user");

  const result = await collectionA.deleteOne({ email: email });
  console.log(email);
  if (result.deletedCount) {
    console.log("Successfully deleted one document.");
    res.json({
      msg: "Successfully deleted one document.",
    });
  } else {
    console.log("email is not found.");
    res.json({
      msg: "email is not found.",
    });
  }
});

// profile picture uplode in node js using the multer lib..
const storage = multer.diskStorage({
  destination: "./public/upload",
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${file.originalname}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png"]; // Specify the allowed extensions

  const fileExtension = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf("."));
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file type.")); // Reject the file
  }
};
const upload = multer({
  storage,
  fileFilter,
});

app.post("/profile", upload.single("profile"), async (req, res) => {
  var key = req.body.key;
  const db = req.app.locals.db;
  const collectionA = db.collection("user");
  const filename = req.file.filename;
  const result = await collectionA.find({ akey: key }).limit(1).toArray();
  if (result.length) {
    var email = String(result[0]["email"]);
    collectionA.updateOne(
      { email: email }, // query
      { $set: { profileimage: filename, profileimageexist: true } }, // replacement, replaces only the field "hi"
      {}, // options
      function (err, object) {}
    );
    res.json({
      success: 1,
      filename: `${req.file.filename}`,
    });
  } else {
    res.json({
      msg: "user is not exist",
    });
  }
});

app.post("/profiledelete", async (req, res) => {
  var key = req.headers.key;
  const db = req.app.locals.db;
  const collectionA = db.collection("user");
  const result = await collectionA.find({ akey: key }).limit(1).toArray();

  if (result.length) {
    var filename = String(result[0]["profileimage"]);
    var email = String(result[0]["email"]);
    const filePath = `./public/upload/${filename}`;
    collectionA.updateOne(
      { email: email }, // query
      { $set: { profileimage: "", profileimageexist: false } }, // replacement, replaces only the field "hi"
      {}, // options
      function (err, object) {}
    );
    // Delete the file
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ error: "File not found." });
      }

      // Delete the file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return res.status(500).json({ error: "Failed to delete file." });
        }

        res.json({ message: "File deleted successfully." });
      });
    });
  } else {
    res.json({
      msg: "profileimage is not exist",
    });
  }
});
app.post("/otpverify", (req, res) => {
  var email = req.body.email;
  var otp = req.body.otp;
  const db = req.app.locals.db;
  const collection = db.collection("otp");
  const collection2 = db.collection("user");
  var uid = uuidv4();
  collection
    .find({ email: email, otp: otp })
    .limit(1)
    .sort({ _id: -1 })
    .toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        var name = String(result[0]["name"]);

        collection2
          .find({ email: email })
          .limit(1)
          .sort({ _id: -1 })
          .toArray(function (err, result2) {
            if (err) {
              console.log(err);
            } else if (result2.length) {
              ////////update otp start//////////
              collection2.updateOne(
                { email: email }, // query
                { $set: { akey: "" + uid + "" } }, // replacement, replaces only the field "hi"
                {}, // options
                function (err, object) {}
              );
              ///////update otp close///////////
              console.log("Update work");
            } else {
              var data2 = { name: name, email: email, akey: uid };
              collection2.insert(data2, { w: 1 }, function (err, result) {
                if (err) {
                  res.end("Registration Error1");
                  console.warn(err.message); // returns error if no matching object found
                } else {
                }
              });
            }
          });

        res.json({
          email: email,
          otpverify: true,
          msg: "login sucessfull",
          akey: uid,
        });
      } else {
        res.json({ email: email, otpverify: false, msg: "login failed" });
      }
    });
});

// app.get("/productlist", (req, res) => {
//   res.json({ result: true, msg: "product list" });
// });

// app.get("/user/:key", (req, res) => {
//   const db = req.app.locals.db;
//   var key = req.params.key;

//   const collection = db.collection("user");
//   collection
//     .find({ akey: key })
//     .limit(1)
//     .sort({ _id: -1 })
//     .toArray(function (err, result2) {
//       if (err) {
//         console.log(err);
//       } else if (result2.length) {
//         collection
//           .find({})
//           .sort({ _id: -1 })
//           .toArray(function (err, result) {
//             if (err) {
//               console.log(err);
//             } else if (result.length) {
//               res.json({ result: true, data: result });
//             } else {
//               res.json({ result: false, data: [] });
//             }
//           });
//       } else {
//         res.json({ result: false, msg: "you are not authorized", data: [] });
//       }
//     });
// });

// app.get("/products/:key", (req, res) => {
//   const db = req.app.locals.db;
//   var key = req.params.key;

//   const collection = db.collection("user");
//   const collectionB = db.collection("products");
//   collection
//     .find({ akey: key })
//     .limit(1)
//     .sort({ _id: -1 })
//     .toArray(function (err, result2) {
//       if (err) {
//         console.log(err);
//       } else if (result2.length) {
//         collectionB
//           .find({})
//           .sort({ _id: -1 })
//           .toArray(function (err, products) {
//             if (err) {
//               console.log(err);
//             } else if (products.length) {
//               res.json({ result: true, totalresult: 0, data: products });
//             } else {
//               res.json({ result: false, data: [] });
//             }
//           });
//       } else {
//         res.json({ result: false, msg: "you are not authorized", data: [] });
//       }
//     });
// });

// app.post("/addproduct", (req, res) => {
//   const db = req.app.locals.db;
//   var name = req.body.name;
//   var price = req.body.price;
//   var img = req.body.img;
//   var desc = req.body.desc;
//   var discount = req.body.discount;
//   var pid = Math.floor(Math.random() * 900000) + 1000;

//   const collectionB = db.collection("products");

//   var data2 = {
//     pid: "" + pid + "",
//     name: name,
//     price: price,
//     img: img,
//     desc: desc,
//     discount: discount,
//   };
//   collectionB.insert(data2, { w: 1 }, function (err, result) {
//     if (err) {
//       res.end("Registration Error1");
//       console.warn(err.message); // returns error if no matching object found
//     } else {
//     }
//   });
//   res.json({ result: true, msg: "PRODUCT ADD SUCCESSFULLY" });
// });

// app.get("/addcart/:pid/:key", (req, res) => {
//   const db = req.app.locals.db;
//   var key = req.params.key;
//   var pid = req.params.pid;

//   const collection = db.collection("user");
//   const collectionB = db.collection("products");
//   const collectionC = db.collection("cart");

//   collection
//     .find({ akey: key })
//     .limit(1)
//     .sort({ _id: -1 })
//     .toArray(function (err, result2) {
//       if (err) {
//         console.log(err);
//       } else if (result2.length) {
//         var email = String(result2[0]["email"]);
//         collectionB
//           .find({ pid: pid })
//           .limit(1)
//           .sort({ _id: -1 })
//           .toArray(function (err, result) {
//             if (err) {
//               console.log(err);
//             } else if (result.length) {
//               var name = String(result[0]["name"]);
//               var price = String(result[0]["price"]);
//               var desc = String(result[0]["desc"]);
//               var img = String(result[0]["img"]);
//               collectionC
//                 .find({ pid: pid, email: email })
//                 .limit(1)
//                 .sort({ _id: -1 })
//                 .toArray(function (err, result4) {
//                   if (err) {
//                     console.log(err);
//                   } else if (result4.length) {
//                     var quantity2 = parseInt(result4[0]["quantity"]);
//                     var quantityUP = quantity2 + 1;
//                     var tpriceUpdate = quantityUP * parseInt(price);
//                     collectionC.updateOne(
//                       { pid: pid, email: email }, // query
//                       {
//                         $set: {
//                           quantity: "" + quantityUP + "",
//                           tprice: "" + tpriceUpdate + "",
//                         },
//                       }, // replacement, replaces only the field "hi"
//                       {}, // options
//                       function (err, object) {}
//                     );
//                   } else {
//                     var data2 = {
//                       pid: "" + pid + "",
//                       name: name,
//                       price: price,
//                       img: img,
//                       desc: desc,
//                       quantity: "1",
//                       tprice: price,
//                       email: email,
//                     };
//                     collectionC.insert(
//                       data2,
//                       { w: 1 },
//                       function (err, result3) {
//                         if (err) {
//                           res.end("Registration Error1");
//                           console.warn(err.message); // returns error if no matching object found
//                         } else {
//                         }
//                       }
//                     );
//                   }
//                 });

//               //here pid match
//               res.json({
//                 result: true,
//                 addcart: true,
//                 name: name,
//                 price: price,
//                 msg: "product add to cart sucesssfully",
//               });
//             } else {
//               res.json({ result: true, addcart: false, msg: "pid is invalid" });
//               // pid not match
//             }
//           });
//         //res.json({"result":true,"addcart":true, "msg":"product add to cart sucesssfully"});
//       } else {
//         res.json({
//           result: false,
//           addcart: false,
//           msg: "you are not authorized",
//         });
//       }
//     });
// });

// app.get("/removecart/:pid/:key", (req, res) => {
//   const db = req.app.locals.db;
//   var key = req.params.key;
//   var pid = req.params.pid;

//   const collection = db.collection("user");
//   const collectionB = db.collection("products");
//   const collectionC = db.collection("cart");

//   collection
//     .find({ akey: key })
//     .limit(1)
//     .sort({ _id: -1 })
//     .toArray(function (err, result2) {
//       if (err) {
//         console.log(err);
//       } else if (result2.length) {
//         var email = String(result2[0]["email"]);
//         collectionC
//           .find({ pid: pid, email: email })
//           .limit(1)
//           .sort({ _id: -1 })
//           .toArray(function (err, result4) {
//             if (err) {
//               console.log(err);
//             } else if (result4.length) {
//               //here pid match

//               res.json({
//                 result: true,
//                 removecart: true,
//                 msg: "product remove from cart sucesssfully",
//               });
//             } else {
//               res.json({
//                 result: true,
//                 removecart: false,
//                 msg: "product remove from cart failed",
//               });
//             }
//           });

//         //res.json({"result":true,"addcart":true, "msg":"product add to cart sucesssfully"});
//       } else {
//         res.json({
//           result: false,
//           addcart: false,
//           msg: "you are not authorized",
//         });
//       }
//     });
// });

// app.get("/mycart/:key", (req, res) => {
//   const db = req.app.locals.db;
//   var key = req.params.key;

//   const collection = db.collection("user");
//   const collectionB = db.collection("cart");
//   collection
//     .find({ akey: key })
//     .limit(1)
//     .sort({ _id: -1 })
//     .toArray(function (err, result2) {
//       if (err) {
//         console.log(err);
//       } else if (result2.length) {
//         var email = String(result2[0]["email"]);
//         collectionB
//           .find({ email: email })
//           .sort({ _id: -1 })
//           .toArray(function (err, cart) {
//             if (err) {
//               console.log(err);
//             } else if (cart.length) {
//               res.json({ result: true, totalresult: cart.length, data: cart });
//             } else {
//               res.json({ result: false, data: [] });
//             }
//           });
//       } else {
//         res.json({ result: false, msg: "you are not authorized", data: [] });
//       }
//     });
// });

app.listen(4044);
console.log("Running on port 4044");
