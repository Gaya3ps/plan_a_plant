const bcrypt=require('bcrypt');
const crypto=require('crypto');
const mongoose = require('mongoose'); 

// const Schema=mongoose.Schema;

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    isBLock:{
      type:Boolean,
      default:false
    },

    token:{
        type:String,
        default:''
    }
   
},{timestamps:true });



userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};


//Export the model
module.exports = mongoose.model('User', userSchema);