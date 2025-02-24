const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({

    //unique id 
  place: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Place'},
  user: {type:mongoose.Schema.Types.ObjectId, required:true}, //we neeed mltiple user._id refrence 
  checkIn: {type:Date, required:true}, //booking date -start date
  checkOut: {type:Date, required:true}, //end date - given not taken
  name: {type:String, required:true}, //not needed
  phone: {type:String, required:true}, //not needed 
  price: Number, // 3 prises needed
});

const BookingModel = mongoose.model('Booking', bookingSchema);

module.exports = BookingModel;