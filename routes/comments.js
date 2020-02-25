var express = require("express"),
	// merge params of campgrounds and comments together/ as they are seperated via router
	// also allows us to acces :id
	router  = express.Router({mergeParams:true}),
	Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	middleWareObj = require("../middleware")
// ====================
// COMMENTS ROUTES
// ====================

router.get("/new",middleWareObj.isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

router.post("/",middleWareObj.isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
			   req.flash("error","Something went wrong");
               console.log(err);
           } else {
			   //add username and id to comment
			   //req.user.username  and req.user._id comes from isLoggedIn
			   //add username and id to the comment
			   comment.author.id = req.user._id;// this links the user id to the comment author id
			   comment.author.username = req.user.username;
			   comment.save();
                campground.comments.push(comment);
               campground.save();
			   console.log(comment);
			   req.flash("success","Succesfully added comment");
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
   //create new comment
   //connect new comment to campground
   //redirect campground show page
});

router.get("/:comment_id/edit",middleWareObj.checkCommentOwnership,function(req,res){
	//no need to req.params.id becuase req.params.id is provided via app.js route*
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			res.redirect("back");
		}else{//didnt need to look up req.param.sid
			res.render("comments/edit",{campground_id: req.params.id,comment:foundComment});
		}
	})
		
});

//update

router.put("/:comment_id",function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err|| !foundCampground){
			req.flash("error","No campground Found");
			return res.redirect("back");
		}
		Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,foundComment){
			if(err){
				res.redirect("back");
			}else{
				res.redirect("/campgrounds/" + req.params.id);
			}
		})
	});
});

router.delete("/:comment_id",middleWareObj.checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			res.redirect("back");
		}else{
			req.flash("success","Comment Deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

module.exports = router;