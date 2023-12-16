const User = require('../models/usermodels')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
require('dotenv').config();
const Razorpay = require('razorpay')




const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
});





const confirmOrder = async (req, res) => {
    try {

        console.log(req.body);
        const userId = req.session.user_id
        const addressId = req.body.selectedAddress;
        const paymentMethod = req.body.selectedPaymentMethod;

        let cart = await Cart.findOne({ user_id: userId }).populate('products.productId');
        console.log("............................................................",cart);
        const order = {
            user: req.session.user_id,
            address: addressId,
            paymentMethod: paymentMethod,
            products: cart.products.map((item) => {
                return {
                    product: item.productId,
                    quantity: item.quantity,
                    price: item.productId.salePrice,
                    total: item.subTotal,

                }
            }),
            grandTotal: cart.total
        }
        console.log(order);
        await Order.insertMany(order);
        await Cart.findOneAndUpdate({ user_id: userId }, { $set: { products: [], total: 0 } });

if(order.paymentMethod ==='cashonDelivery'){
    res.status(200).json({ message: "success" });
}

else if(order.paymentMethod === 'razorpay'){
    const razorpayOrder = await razorpay.orders.create({
        amount: order.grandTotal * 100, // Amount in paise
        currency: 'INR',
        receipt: 'orderId',
        payment_capture: 1, // Auto-capture payment
    });
    console.log("////////////////////",razorpayOrder);
    res.status(200).json({
        message: 'success',
        razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        },
    });        
}


        


    } catch (error) {
        console.log(error);
    }
}


const loadSuccess = async (req, res) => {
    try {
        const user = req.session.user_id;
        res.render('successPage', { user })
    } catch (error) {
        console.log(error.message);
    }
};

const loadOrderList = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId)
        const orderDetails = await Order.find({ user: userId })
        .populate({
            path: 'products.product',
            select: 'primaryImage'// Select the fields you need
        })
        .exec();
            console.log(orderDetails,"ORDERDETAILS")
        res.render('./user/pages/orderDetails', {  orderDetails, user});
           
          
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const loadorderDetailing = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId)
      const orderId = req.query.id;
     
      const orderDetails = await Order.findOne({ user: userId,_id: orderId })
        .populate({
          path: 'products.product',
          select: 'title primaryImage', 
        })
        .exec();
        
  
      if (!orderDetails) {
        return res.status(404).send('Order details not found');
      }
  
      res.render('./user/pages/orderDetailing', { orderDetails, user });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  };


 const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        const result = await cancelOrderById(orderId);

        if (result === "redirectBack") {
            res.redirect("back");
        } else {
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
};

const cancelOrderById = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate("products.product");

        if (order.products.every((item) => item.returnStatus === "Cancelled")) {
            return { message: "Order is already cancelled." };
        }

        if (
            order.paymentMethod === "cashonDelivery" &&
            order.products.every((item) => {
                return item.returnStatus === "Pending" ? false : true;
            })
        ) {
            // Update product quantities and sold counts for each order item
            for (const item of order.products) {
                const updatedOrderItem = await Order.findByIdAndUpdate(
                    item._id,
                    {
                        $set: { "products.$.returnStatus": "Cancelled" },
                    },
                    { new: true }
                );

                const cancelledProduct = await Product.findById(item.product);
                cancelledProduct.quantity += item.quantity;
                cancelledProduct.sold -= item.quantity;
                await cancelledProduct.save();
            }

            // Update order status
            await Order.findByIdAndUpdate(orderId, {
                status: "Cancelled",
            });
           
            return { message: "Order cancelled successfully." };
        } else if (
                order.paymentMethod === "razorpay" &&
                order.products.every((item) => {
                    return item.returnStatus === "Pending" ? false : true;
                })
            ) {
                // Update product quantities and sold counts for each order item
                for (const item of order.products) {
                    const updatedOrderItem = await Order.findByIdAndUpdate(
                        item._id,
                        {
                            $set: { "products.$.returnStatus": "Cancelled" },
                        },
                        { new: true }
                    );
    
                    const cancelledProduct = await Product.findById(item.product);
                    cancelledProduct.quantity += item.quantity;
                    cancelledProduct.sold -= item.quantity;
                    await cancelledProduct.save();
                }
    
                // Update order status
                await Order.findByIdAndUpdate(orderId, {
                    status: "Cancelled",
                });
               
                return { message: "Order cancelled successfully." };
        }else{
            return { message: "Payment not completed for all items." };
        }
    } catch (error) {
        throw new Error(error);
    }
};








// The rest of your mongoose schema remains the same



//user side
// async function orderdetails(req,res){
//     try {
//       const user = req.session.user_id;
//       const orderId = req.query.orderId;
//       const orderDetails = await Order.findById(orderId).populate('address').populate('products.product')
//       res.render('orderDetails',{orderDetails , user})


//     } catch (error) {
//       console.log(error);
//     }
// }


module.exports = {
    loadSuccess,
    confirmOrder,
    loadorderDetailing,
    loadOrderList,
    cancelOrder,
    cancelOrderById
    // orderdetails
}