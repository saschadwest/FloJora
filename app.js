require('dotenv').config();
var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    seedDB      = require("./seeds"),
	//authentication below
	passport 	= require("passport"),
	localStrategy = require("passport-local"),
	User		= require('./models/user'),
	// above two good enough for user model
	methodOverride = require("method-override"),
	
//import routes

	commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes		 = require("./routes/index"),
	flash 	= require("connect-flash")

	
console.log(process.env.DATABASEURL);

   //production db 
//Databaseurl = "mongodb://localhost:27017/floCamp4" PUT THIS IN .ENV EXPORT DIDNT WORK
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true,useUnifiedTopology: true });

// mongoose.connect('mongodb+srv://thessential:'+process.env.mon_password+'@flo1-rzene.mongodb.net/test?retryWrites=true&w=majority',{
// 	useNewUrlParser:true,
// 	useCreateIndex:true,
// 	useUnifiedTopology:true
// }).then(()=>{
// 	console.log("connected to DB")
// }).catch(err=>{
// 	console.log("ERROR",err.message);
// });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


//seed the database seedDB();

// express session configuration
app.use(require("express-session")({
	secret:"HelloAgain",
	resave: false,
	saveUninitialized:false
}));
// end of passport configuration

// creating passport
app.use(passport.initialize());
app.use(passport.session());
// local strategy come from requireing local-strategy/ User.authenticate comes from User.plugin in models
passport.use(new localStrategy(User.authenticate()));
// also comes free with passport-local0-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// end of creating

//middle ware for every code that includes current user + flash into every route
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error	= req.flash("error");
	res.locals.success	= req.flash("success");
	next();
});
// the cod above is very unique by preventing us from adding req.user to eveyr path which the app will not work without adding req.user to every path.

// continue for router. tells our app to use those three rout riles that we have required

app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

// router.get("/", function(req, res){
//     res.render("landing");
// });

// app.listen(3000,()=>{
// 	console.log("server listing to port 3000")
// })

app.listen(process.env.PORT || 3000 ,function(){
    console.log("up and running on port "+process.env.PORT);
});