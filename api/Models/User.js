const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    name : String,
    email: {type:String , unique:true} ,
    password : String,
    //address - line 1,2,3
    //profession
    //age
    //insta id / facebook
    //phone no ??
    //personality category - int 
    //booking id[array] -refrence to take my bookings
    //

}); 

const UserModel = mongoose.model('User' , UserSchema);
 
module.exports = UserModel;