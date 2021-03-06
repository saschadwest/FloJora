var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    author: {
		id: {
			type:mongoose.Schema.Types.ObjectId,
			ref:'User' // this is the reference to the id create above 
	},
		username:String
	}
});

module.exports = mongoose.model("Comment", commentSchema);