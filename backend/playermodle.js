const mongoose=require('mongoose');
mongoose.connect("mongodb://localhost:27017/userdetails");
const userschema=mongoose.Schema({
    name:String,
    userEmail:String,
    passward:String,
    score:Number,
    logintime:String,
    rank:Number
})
 
module.exports=mongoose.model("user",userschema);