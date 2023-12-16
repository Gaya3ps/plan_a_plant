const mongoose = require("mongoose");
const User = require("../models/usermodels");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const asyncHandler = require("express-async-handler");
const { sendOtp } = require("../utility/nodemailer");
const { generateOTP } = require("../utility/nodemailer");
const { sendVerifymail } = require("../utility/nodemailer");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");

const loadlandingpage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    const getalldata = await Product.find();
    res.render("./user/pages/index", { getalldata, user });
  } catch (error) {
    throw new Error(error);
  }
};

const loaduserprofile = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);

    res.render("./user/pages/userprofile", { user });
  } catch (error) {
    throw new Error(error);
  }
};

async function editProfilePost(req, res) {
  // Get the user's current information.
  const userId = req.session.user_id;
  const user = await User.findOne({ _id: userId });

  // Get the user's updated information.
  const newuserName = req.body.username;
  const newEmail = req.body.email;
  const newMobile = req.body.mobile;

  // Update the user's information.
  user.username = newuserName;
  user.email = newEmail;
  user.mobile = newMobile;
  await user.save();

  // Return a success response.

  res.redirect("/userprofile");
}

const loadloginpage = async (req, res) => {
  try {
    const user = req.session.user_id;

    res.render("./user/pages/login", { user });
  } catch (error) {
    throw new Error(error);
  }
};

const loadregistration = async (req, res) => {
  try {
    const user = req.session.user_id;
    res.render("./user/pages/registration", { user });
  } catch (error) {
    throw new Error(error);
  }
};

const loadaboutpage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    res.render("./user/pages/about", { user });
  } catch (error) {
    throw new Error(error);
  }
};

const loadcontactpage = async (req, res) => {
  try {
    const user = req.session.user_id;

    res.render("./user/pages/contact", { user });
  } catch (error) {
    throw new Error(error);
  }
};

const loadshoppage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    const getalldata = await Product.find();
    res.render("./user/pages/shop", { getalldata, user });
  } catch (error) {
    throw new Error(error);
  }
};

const loadproductdetail = async (req, res) => {
  try {
    const productId = req.query.id;
    const userId = req.session.user_id;
    const user = await User.findById(userId);

    const getalldata = await Product.findById(productId);
    res.render("./user/pages/productdetail", { getalldata, user });
  } catch (error) {
    throw new Error(error);
  }
};

// inserting User--
const register = async (req, res) => {
  try {
    const emailCheck = req.body.email;
    const checkData = await User.findOne({ email: emailCheck });
    if (checkData) {
      const user = req.session.user_id;

      return res.render("./user/pages/registration", {
        userCheck: "User already exists, please try with a new email",
        user,
      });
    } else {
      const UserData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      };

      const OTP = generateOTP(); /** otp generating **/

      req.session.otpUser = { ...UserData, otp: OTP };
      console.log(req.session.otpUser.otp);
      // req.session.mail = req.body.email;

      /***** otp sending ******/
      try {
        sendOtp(req.body.email, OTP, req.body.username);
        return res.redirect("/otp");
      } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).send("Error sending OTP");
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

//password hashing
// const securePassword = async (password) => {
//   try {
//     const passwordHash = await bcrypt.hash(password, 10);
//     return passwordHash;
//   } catch (error) {
//     console.log(error.message);
//   }
// };

/*************** OTP Section *******************/
// loadSentOTP page Loading--
const sendOTPpage = async (req, res) => {
  try {
    const email = req.session.otpUser;
    const user = req.session.user_id;

    res.render("./user/pages/otpVerification", { user });
  } catch (error) {
    throw new Error(error);
  }
};

//verify otp
const verifyOTP = asyncHandler(async (req, res) => {
  try {
    const enteredOTP = req.body.otp;
    const email = req.session.otpUser.email;
    const storedOTP = req.session.otpUser.otp; // Getting the stored OTP from the session
    const user = req.session.otpUser;
    let messages = "";

    if (enteredOTP == storedOTP) {
      user.password = await bcrypt.hash(user.password, 10);
      const newUser = await User.create(user);
      delete req.session.otpUser.otp;
      res.redirect("/login");
    } else {
      messages = "Verification failed, please check the OTP or resend it.";
      console.log("verification failed");
      const user = req.session.user_id;

      res.render("./user/pages/otpVerification", { messages, email, user });
    }
  } catch (error) {
    throw new Error(error);
  }
});

//resending otp
const reSendOTP = async (req, res) => {
  try {
    const OTP = generateOTP(); /** otp generating **/
    req.session.otpUser.otp = { otp: OTP };
    const email = req.session.otpUser.email;
    const username = req.session.otpUser.username;

    // otp resending
    try {
      sendOtp(email, OTP, username);
      console.log("otp is sent");
      console.log(OTP);
      const user = req.session.user_id;

      return res.render("./user/pages/reSendOTP", { email, user });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).send("Error sending OTP");
    }
  } catch (error) {
    throw new Error(error);
  }
};

//verify resend otp
const verifyResendOTP = asyncHandler(async (req, res) => {
  try {
    const enteredOTP = req.body.otp;
    console.log(enteredOTP);
    const storedOTP = req.session.otpUser.otp;
    console.log(storedOTP);

    const user = req.session.otpUser;

    if (enteredOTP == storedOTP.otp) {
      console.log("inside verification");
      user.password = await bcrypt.hash(user.password, 10);
      const newUser = await User.create(user);
      if (newUser) {
        console.log("new user insert in resend page", newUser);
      } else {
        console.log("error in insert user");
      }
      delete req.session.otpUser.otp;
      res.redirect("/login");
    } else {
      console.log("verification failed");
    }
  } catch (error) {
    throw new Error(error);
  }
});

// forgetpassword
const forgetLoad = async (req, res) => {
  try {
    res.render("./user/pages/forgetpassword");
  } catch (error) {
    throw new Error(error);
  }
};

//reset pswd postemail--
const forgetpswd = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user) {
      const randomString = randomstring.generate();
      const updateData = await User.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendVerifymail(user.userName, user.email, randomString);
      res.render("./user/pages/forgetpassword", {
        message: "Please check your mail to reset your password",
      });
    } else {
      res.render("./user/pages/forgetpassword", {
        message: "user email is incorrect",
      });
    }
  } catch (error) {
    throw new Error(error);
  }
};

//forget pswd page get---
const forgetPswdload = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render("./user/pages/forget-password", { user_id: tokenData._id });
    }
  } catch (error) {
    throw new Error(error);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//forget pswd post--
const resetPswd = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const secure_password = await securePassword(password);

    const updateData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password, token: "" } }
    );
    res.render("./user/pages/login", {
      message: "password reset successfully",
    });
  } catch (error) {
    throw new Error(error);
  }
};

// LOGIN PAGE
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by username using async/await
    const user = await User.findOne({ email });

    if (!user) {
      const errorMessage = "Invalid username or password";
      return res.render("user/pages/login", { errorMessage });
    }

    if (user.isBLock) {
      const errorMessage = "User is blocked. Please contact support.";
      // Clear the user session upon blocking
      return res.render("user/pages/login", { errorMessage });
    }
    if (user && user.isBLock) {
      req.session.user._id = null;
      res.redirect("/");
    }

    const passwordMatch = await user.verifyPassword(password);

    if (!passwordMatch) {
      const errorMessage = "Invalid password";
      return res.render("user/pages/login", { errorMessage });
    }

    req.session.user_id = user._id;
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).render("error-page", { error: "An error occurred" });
  }
};

// User Logout--
const userlogout = async (req, res) => {
  try {
    req.session.user_id = null;
    res.redirect("/");
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  loadloginpage,
  loadregistration,
  loadaboutpage,
  loadcontactpage,
  loadshoppage,
  // loadshopcartpage,
  loadlandingpage,
  loadproductdetail,
  register,
  sendOTPpage,
  verifyOTP,
  login,
  verifyOTP,
  reSendOTP,
  verifyResendOTP,
  userlogout,
  loaduserprofile,
  editProfilePost,
  forgetLoad,
  forgetpswd,
  forgetPswdload,
  resetPswd,
};
