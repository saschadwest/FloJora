// all middle ware goes here
var middleWareObj = {},
	Comment = require("../models/comment"),
	Campground =require("../models/campground")

middleWareObj.checkCampGroundOwnership = function(req,res,next){
	if(req.isAuthenticated()){
			Campground.findById(req.params.id,function(err,foundCampground)
			{
				if(err || !foundCampground){ // campground not found is null
					req.flash("error", "Campground not found");
					res.redirect("back");
				}else{
					// does the user own the campground
					// musst be equals(req.user._id) because req.user._id is an object
					if(foundCampground.author.id.equals(req.user._id)){//if req.param.id.author = isAuthenticated
					next();
					}else{
						res.redirect("back");
					}
				}
			});
	}else{
		req.flash("error","You need to be logged into to do that");
		res.redirect("back");
	}
}

middleWareObj.checkCommentOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found");
				res.redirect("back");
			}else{ // req.user._id logged in user Id stored, thanks to passport
				if(foundComment.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error","You do not have permission to do that.")
					res.redirect("back");
				}
			}
		})
	}else{
		req.flash("error","You need to permission to do that");
		res.redirect("back");
	}
}

middleWareObj.isLoggedIn =function (req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You need to be logged in");
	res.redirect("/login");
}

module.exports = middleWareObj;