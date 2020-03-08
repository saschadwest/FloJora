// express router is used to refactor
var express = require("express"),
	router = express.Router(),
	Campground = require("../models/campground"),
	middleWareObj = require("../middleware")// index.js does not have to be called, "index" files are auto called
	

//multer configuration
	var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});
//end of multer ocnfig

//beg of cloudinary config
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'floki', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});



//INDEX - show all campgrounds
router.get("/", function(req, res){
	var noMatch = null;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get all campgrounds from DB
		Campground.find({name:regex}, function(err, allCampgrounds){
		   if(err){
			   console.log(err);
		   } else {
				if(allCampgrounds.length < 1){
					noMatch = "No Campgrounds match that query, please try again.";
				}
			  res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch:noMatch});
		   }
		});
	}else{
		// Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds){
		   if(err){
			   console.log(err);
		   } else {
			   //currentUser:req.user comes from isLoggedIn since user is created. PssPrt creat req.user hence req.user which is defined by pssport after you are authenticate, given by passport
			  res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch:noMatch});
		   }
		});
	}	
});

//CREATE - add new campground to DB
router.post("/", middleWareObj.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
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
router.put("/:id", upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});
//Destroy Campground Route
router.delete("/:id",middleWareObj.checkCampGroundOwnership,function(req,res){
	Campground.findById(req.params.id, async function(err,campground){
		if(err){
			req.flash("error",err.message);
			return res.redirect("back");
		}
		try{
			await cloudinary.v2.uploader.destroy(campground.imageId);
			campground.remove();
			req.flash("success", "Campground deleted Successfully");
			res.redirect("/campgrounds");
		}catch(err){
			if(err){
				req.flash("error",err.message);
				return res.redirect("back");
			}
		}
	});
	});
	


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;