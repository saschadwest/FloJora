// express router is used to refactor
var express = require("express"),
	router = express.Router(),
	Campground = require("../models/campground"),
	middleWareObj = require("../middleware")// index.js does not have to be called, "index" files are auto called


//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
		   //currentUser:req.user comes from isLoggedIn since user is created. PssPrt creat req.user hence req.user which is defined by pssport after you are authenticate, given by passport
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
router.post("/",middleWareObj.isLoggedIn,function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
	var price = req.body.price;
    var desc = req.body.description;
	var author ={
		id: req.user._id,//the user id comes from req.user check it in console
		username:req.user.username
	}
    var newCampground = {name: name, image: image, description: desc,author:author, price:price}
    // Create a new campground and save to DB
	// newly created just hold the data and represents that it is a thing, it is console.loggable
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
			console.log(newlyCreated);
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleWareObj.isLoggedIn,function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id",function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
			req.flash("error","Campground Not Found");
			res.redirect("back");
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMGROUND ROUTE
// this id comes from the campground id in the show page pressed from teh button
router.get("/:id/edit",middleWareObj.checkCampGroundOwnership,function(req,res){
	// for authentication we need to check if user is logged in , if not redirect
	// if logged in does user own campgrounds? if so, run this code else redirect
	//First Step is the user logged in(authenticated)
			Campground.findById(req.params.id,function(err,foundCampground){
				
					res.render("campgrounds/edit",{campground:foundCampground});
			});
		});


//UPDATE CAMPGROUND ROUTE
router.put("/:id",middleWareObj.checkCampGroundOwnership,function(req,res){
	//find and update the correct campground + redirect
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

//Destroy Campground Route
router.delete("/:id",middleWareObj.checkCampGroundOwnership,function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
		}else{
			res.redirect("/campgrounds");
		}
	})
});



module.exports = router;