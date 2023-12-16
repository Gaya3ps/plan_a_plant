const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const User=require("../models/usermodels")
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel')

const loadshopcartpage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId)
    console.log(user);
    const getCart = await Cart.find({ user_id: user }).populate("products.productId");
    console.log("get cart"+getCart);

    // const cartSubtotal = getCart.reduce((subtotal, cartItem) => {
    //   subtotal += cartItem.price * cartItem.quantity;
    //   return subtotal;
    // }, 0);

    let total = 0;

    if (getCart && getCart.length > 0) {
      getCart.forEach((cartItem) => {
        if (cartItem.products && cartItem.products.length > 0) {
          cartItem.products.forEach((productItem) => {
            const productTotal = productItem.productId.salePrice * productItem.quantity;
            total += productTotal;
            productItem.subtotal = productTotal;
          });
        }
      });
    }
    


    const additionalCosts = 0; 
    // const cartTotal = cartSubtotal + additionalCosts;

    res.render("./user/pages/shopingcart", { user, getCart, total });
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};


const addToCart = async(req, res)=>{
  try {
      const userId = req.session.user_id
      const productId = req.body.productId;
      const product = await Product.findById(productId)
      // console.log("ProductID:-",product,"quantity:-", quantity);

      let cart = await Cart.findOne({ user_id: userId }).populate('products.productId');


      if(!cart){
        cart = await Cart.create({user_id: userId, products:[]})
      }
      const existingItem = cart.products.find(item => item.productId.equals(productId));
      console.log("existing passed");


      if(existingItem){
        existingItem.quantity += 1
        existingItem.subTotal = existingItem.quantity * product.salePrice
        if(existingItem.quantity > product.quantity){
            existingItem.quantity = product.quantity
            console.log("success");
        }
    }else{
      cart.products.push({productId : productId, quantity: 1, subTotal: product.salePrice});
        console.log("success");
    }

    cart.total = cart.products.reduce((acc, item)=>{
      return acc+(item.subTotal || 0)
    },0);

    await cart.save();
    res.redirect('/shopingcart');

  } catch (error) {
      console.log(error.message);
  }
}

const removeProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    console.log("============",productId);
    const user = req.session.user_id;

    const getCart = await Cart.findOne({ user_id: user });
    console.log("=====================",getCart);
    if (getCart) {
      const productIndex = getCart.products.findIndex((item) =>
        item.productId.toString() === productId
      );
      console.log("=====================",productIndex);


      if (productIndex !== -1) {
        const removedProduct = getCart.products[productIndex];
        console.log(removedProduct);

        const removedsubTotal = removedProduct.subTotal;
        console.log(removedsubTotal);

        getCart.products.splice(productIndex, 1);

        // Check if removedsubTotal is a valid number
        if (!isNaN(removedsubTotal)) {
          getCart.total = getCart.total - removedsubTotal;
        } else {
          // Handle the case where removedsubTotal is not a number
          console.error('Invalid removedsubTotal:', removedsubTotal);
        }

        await getCart.save();

        res.redirect('/shopingcart');
      } else {
        console.log('Product not found in the cart');
        res.redirect('/shopingcart');
      }
    } else {
      console.log('Cart not found for the user');
      res.redirect('/shopingcart');
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




 const loadCheckOutpage = async(req, res)=>{
  try {

    const userId = req.session.user_id;
    const user = await User.findById(userId)
    const getCart = await Cart.find({ user_id: user }).populate("products.productId");
    const address = await Address.find({ user: userId });
    const total = getCart.reduce((acc, cart) => acc + cart.total, 0);
        console.log("..................",total);
    res.render("./user/pages/checkOut",{getCart, user,address, total})
  } catch (error) {
    console.log(error.message);
  }
 }


 const updateCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    let updatedQuantity = req.body.quantity;
    const productId = req.body.productId;

    const getCart = await Cart.findOne({ user_id: user._id }).populate("products.productId");

    if (!getCart) {
      return res.status(404).json({ success: false, message: 'Cart not found for the user.' });
    }

    const productIndex = getCart.products.findIndex(item => item.productId._id.toString() === productId);

    if (productIndex !== -1) {
      getCart.products[productIndex].quantity = parseInt(updatedQuantity, 10); // Fix typo: newQuantity -> updatedQuantity
      getCart.products[productIndex].subTotal = getCart.products[productIndex].quantity * getCart.products[productIndex].productId.salePrice;

      const newTotal = getCart.products.reduce((acc, item) => {
        const itemSubTotal = item.subTotal || 0;
        return acc + itemSubTotal;
      }, 0);

      getCart.total = newTotal;

      await getCart.save();
      return res.status(200).json({ success: true, total: newTotal, getCart });
    } else {
      return res.status(404).json({ success: false, message: 'Product not found in the cart.' });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



module.exports = {
  loadshopcartpage,
  addToCart,
  loadCheckOutpage,
  removeProduct,
  updateCart
}