var express = require("express"),
	router = express.Router({mergeParams:true}),
	passport = require("passport"),
	User	= require("../models/user")
//===================
// AUTHENTICATION ROUTES
//-------------------

router.get("/",function(req,res){
	res.render("landing");
});

// REGISTRATION FIRST
router.get("/register",function(req,res){
	res.render("register");
});


router.post("/register",function(req,res){
	req.body.username
	req.body.password
	// user.register salts the password in the DB and authenticates, PLM also prevents multiple same users
	User.register(new User({username:req.body.username}),req.body.password,function(err,user){
		if(err){
			// err comes from passport(parameters)
			req.flash("error",err.message);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			//user comes from paramters
			req.flash("success","Welcome to the FLO" + user.username);
			res.redirect("/campgrounds");
		});
		
	})
});
//=END REGISTRATION==

//==========LOGIN BEGIN=======

router.get("/login",function(req,res){
	res.render("login");
});

// passport.authenticate is a middle ware
router.post("/login",passport.authenticate("local",
{
	successRedirect:"/campgrounds",
	failureRedirect:"/login"
}));
		
//==== END OF LOGIN====

router.get("/logout",function(req,res){
	req.logout();
	// flash key:value
	req.flash("success", "Logged you out");
	res.redirect("/campgrounds");
})



module.exports = router;