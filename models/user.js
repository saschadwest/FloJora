var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose")
	
	
	
var UserSchema = new mongoose.Schema({
		username:String,
		password:String,
	});
	
UserSchema.plugin(passportLocalMongoose);// add in methods to my user	

module.exports = mongoose.model("User",UserSchema);