const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const path = require("path");
const PORT = 8000;
const userRoute = require("./routes/userroute");
const expressLayout = require("express-ejs-layouts");
const adminRoute = require("./routes/adminroute");
const database = require("./config/database");
const bodyParser = require("body-parser");
require("dotenv").config();
const session = require("express-session");
const nocache = require("nocache");

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
app.use("/admin", express.static(__dirname + "/public/admin"));
app.use(expressLayout);
// res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
// app.use(nocache);
database.dbConnect();

app.use(
  session({
    secret: "process.env.SECRET",
    resave: false,
    saveUninitialized: true,
    cookies: {
      httponly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use("/admin", adminRoute);
app.use("/", userRoute);


app.listen(PORT, () => {
  console.log(`server is running succesfully on ${PORT}`);
});
