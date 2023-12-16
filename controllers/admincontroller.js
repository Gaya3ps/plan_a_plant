const User=require('../models/usermodels');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Order = require('../models/orderModel')
const Address=require('../models/addressModel')

const loadLogin=async(req,res)=>{
  try {
    res.render('./admin/pages/acclogin',{title:"Login"});
  } catch (error) {
    throw new Error(error);
  }
}


const loadDashboard=async(req,res)=>{
  try {
    res.render('./admin/pages/index')
  } catch (error) {
    throw new Error(error);
  }
}

const loadproductlist=async(req,res)=>{
  try {
    res.render('./admin/pages/productlist',{title:"Product"})
  } catch (error) {
    throw new Error(error);
  }
}

const loadorders=async(req,res)=>{
  try {
    const order= await Order.find().populate('address')
    res.render('./admin/pages/orders',{title:"order",order})
  } catch (error) {
    throw new Error(error);
  }
}

const loadorderdetails=async(req,res)=>{
  try {
    const orderId=req.params.id
    console.log(orderId);
    const order= await Order.findById(orderId).populate('address').populate('products.product').populate('user')
    res.render('./admin/pages/orderdetails',{title:"order",order})
  } catch (error) {
    throw new Error(error);
  }
}



const OrderStatusupdate = async (req, res) => {
  const orderId = req.params.id;
  const newStatus = req.body.status;

  try {
     
      const order = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
      res.redirect(`/admin/orderdetails/${orderId}`);

  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};



// Login

const adminPanel = async(req,res)=>{
  try {

    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    const emailCheck = req.body.email
   
    const user = await User.findOne({ email: emailCheck })

    if (user) {
        res.render('./admin/pages/acclogin', { adminCheck: 'You are not an Admin', title: 'Login' })
    }
    if (emailCheck === email && req.body.password === password) {

        req.session.admin = email;
        res.render('./admin/pages/index',{title:'Dashboard'})
    } else {
        res.render('./admin/pages/acclogin', { adminCheck: 'Invalid Credentials', title: 'Login' })
    }

} catch (error) {
    throw new Error(error)
}
}

//USER MANAGEMENT

const userManagement = async (req, res) => {

  try {

      const findUsers = await User.find();

      res.render('./admin/pages/userList', { users: findUsers, title: 'UserList' })

  } catch (error) {
      throw new Error(error)
  }
}

// searchUser
const searchUser = async (req, res) => {

  try {

      const data = req.body.search
      const searching = await User.find({ userName: { $regex: data, $options: 'i' } });
      if (searching) {
          res.render('./admin/pages/userList', { users: searching, title: 'Search' })
      } else {
          res.render('./admin/pages/userList', { title: 'Search' })
      }


  } catch (error) {
      throw new Error(error)
  }
}


const useraction = async (req, res) => {
  const userID = req.query.id;
  const action = req.query.action;
  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(400).send("user not found");
    }
    if (action === "block") {
      user.isBLock = true;
    } else if (action === "unblock") {
      user.isBLock = false;
    }
    await user.save();
    res.redirect("/admin/user");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
};

// logout
const adminlogout = async(req,res)=>{
  try {
    res.redirect('/admin')
  } catch (error) {
    throw new Error(error)
  }
}









module.exports={
  loadDashboard,
  loadproductlist,
  loadorders,
  loadLogin,
  adminPanel,
  userManagement,
  searchUser,
  useraction,
  adminlogout,
  loadorderdetails,
 
  OrderStatusupdate
  
}