const express=require('express');
const userRoute=express.Router();
const usercontroller=require('../controllers/usercontroller');
const addressController= require('../controllers/addressController')
const userAuth =require('../middleware/userAuth');
const setErrorMessage=require('../middleware/errormsg')
const cartController=require('../controllers/cartController');
const orderController = require('../controllers/orderControl')



userRoute.use(setErrorMessage);

userRoute.use((req, res, next) => {
  req.app.set('layout', 'user/layout/user');
  
  next();
})

// userRoute.get('/',usercontroller.loadlandingpage)
// userRoute.get('/login',usercontroller.loadloginpage);

userRoute.get('/registration',usercontroller.loadregistration);

userRoute.post('/registration',usercontroller.register);
userRoute.post('/login',usercontroller.login);
userRoute.get('/about',usercontroller.loadaboutpage);
userRoute.get('/shop',usercontroller.loadshoppage);
// userRoute.get('/shopingcart',userAuth.isLogin,usercontroller.loadshopcartpage);
userRoute.get('/contact',usercontroller.loadcontactpage);
userRoute.get('/login',userAuth.isLogout,usercontroller.loadloginpage);
userRoute.get('/',usercontroller.loadlandingpage);
userRoute.get('/product',usercontroller.loadproductdetail);
userRoute.get('/userprofile',userAuth.isLogin,usercontroller.loaduserprofile);
userRoute.post('/userprofile',userAuth.isLogin,usercontroller.editProfilePost);


// resetpassword
userRoute.get('/forget',userAuth.isLogout,usercontroller.forgetLoad)
userRoute.post('/forget', userAuth.isLogout,usercontroller.forgetpswd)
userRoute.get('/forget-password',userAuth.isLogout,usercontroller.forgetPswdload);
userRoute.post('/forget-password',userAuth.isLogout, usercontroller.resetPswd)







userRoute.get("/otp",userAuth.isLogout,usercontroller.sendOTPpage);
userRoute.post('/otp',usercontroller.verifyOTP);
// userRoute.post('/otp',usercontroller.verifyOTP);
userRoute.get('/reSendOTP',usercontroller.reSendOTP)
userRoute.post('/reSendOTP',usercontroller.verifyResendOTP);
userRoute.get("/logout",userAuth.isLogin,usercontroller.userlogout)



//ADDRESS
userRoute.get('/address', userAuth.isLogin,addressController.getAllAddress )
userRoute.get('/addAddress', userAuth.isLogin, addressController.addAddressPage)
userRoute.post('/addAddress', userAuth.isLogin, addressController.newAddress)
userRoute.get('/editAddress', userAuth.isLogin, addressController.editAddressPage)
userRoute.post('/editAddress', userAuth.isLogin, addressController.editAddress)
userRoute.get('/deleteAddress/:id',userAuth.isLogin,addressController.deleteAddress)




// Add to Cart
userRoute.get('/shopingcart',userAuth.isLogin,cartController.loadshopcartpage);
userRoute.post('/shopingcart',cartController.addToCart);
userRoute.get('/removecart', cartController.removeProduct);


//update cart
userRoute.post('/updateCart',userAuth.isLogin,cartController.updateCart);


//checkOut
userRoute.get('/checkOut',userAuth.isLogin,cartController.loadCheckOutpage);
userRoute.post('/confirm-order',userAuth.isLogin,orderController.confirmOrder);
userRoute.get('/orderList',userAuth.isLogin,orderController.loadOrderList)
userRoute.get('/orderDetailing',orderController.loadorderDetailing);

// order
userRoute.get('/cancelOrder/:id', orderController.cancelOrder)
userRoute.get('/cancelSingleOrder/:id',orderController.cancelOrderById)






module.exports=userRoute;