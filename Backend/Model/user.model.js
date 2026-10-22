const mongoose = require('mongoose')


const userSchema=new mongoose.Schema({


    "fname":{type:String,required:true},
    "email":{type:String,required:true,unique:true,lowercase:true},
    "role":{type:String,required:true},
    "password":{type:String,required:true,unique:true,minlength:8}    
},
{timestamps:true}
)

module.exports=mongoose.model("user",userSchema,"user")
