const express = require('express');
const adminRoute = express.Router();
const admincontroller = require('../controllers/admincontroller');
const productController = require("../controllers/productControl");

const adminAuth=require('../middleware/adminAuth')
const categoryController = require('../controllers/categoryControl')
const { upload } = require("../config/upload");



require('dotenv').config()




adminRoute.use((req, res, next) => {
  req.app.set('layout', 'admin/layout/admin');
  next();
});

adminRoute.get("/",adminAuth.isLogout,admincontroller.loadLogin);
adminRoute.post("/",admincontroller.adminPanel);

adminRoute.get("/dashboard",adminAuth.isLogin,admincontroller.loadDashboard);
adminRoute.get('/logout',admincontroller.adminlogout)


//USER MANAGEMENT

adminRoute.get("/user",admincontroller.userManagement);
adminRoute.post("/user",admincontroller.searchUser);
adminRoute.get("/useractions", admincontroller.useraction);

// categoryManagement--- 
adminRoute.get('/category', categoryController.categoryManagement)
adminRoute.get('/addCategory',  categoryController.addCategory)
adminRoute.post('/addCategory',  categoryController.insertCategory)
adminRoute.get('/category/list/:id',  categoryController.list)
adminRoute.get('/category/unList/:id',  categoryController.unList)
adminRoute.get('/editCategory/:id', categoryController.editCategory)
adminRoute.post('/editCategory/:id',  categoryController.updateCategory)
adminRoute.post('/category/search', categoryController.searchCategory)









// Product Management---
adminRoute.get("/product/addProduct", productController.addProduct);

adminRoute.post(
  "/product/addProduct",
  upload.fields([
    { name: "secondaryImage", maxCount: 3 },
    { name: "primaryImage" },
  ]),
  productController.insertProduct
); /** Product adding and multer using  **/
adminRoute.get("/product", productController.productManagement);
adminRoute.post("/product/list/:id", productController.listProduct);
adminRoute.post("/product/unList/:id", productController.unListProduct);
adminRoute.get("/product/editproduct/:id", productController.editProductPage);
adminRoute.post(
  "/product/editproduct/:id",
  upload.fields([
    { name: "secondaryImage", maxCount: 4 },
    { name: "primaryImage", maxCount: 3 },
  ]),
  productController.updateProduct
);



// order
adminRoute.get('/orders', admincontroller.loadorders)
adminRoute.get('/orderdetails/:id', admincontroller.loadorderdetails)
adminRoute.post('/orderdetails/update/:id', admincontroller.OrderStatusupdate);















module.exports = adminRoute;
