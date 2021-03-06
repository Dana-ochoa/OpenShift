var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;
//var cookieSession = require("cookie-session");
var session = require("express-session");
var router_app = require("./routes_app");
var session_middleware = require("./middlewares/session");
var RedisStore = require("connect-redis")(session);
var http = require("http");
var realtime = require("./realtime");

var methodOverride = require("method-override");

var app = express();
var server = http.Server(app);

var sessionMiddleware = session ({
	store : new RedisStore({}),
	secret: "super ultra secret word"
});

app.use(sessionMiddleware);

realtime(server, sessionMiddleware);

app.use("/public",express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride("_method"));

/*
app.use(cookieSession({
    name: "session",
    keys: ["llave1","llave2"]
}));
*/



app.use("/app",session_middleware);
app.use("/app",router_app);


app.set("view engine", "jade");

app.get('/', function(req, res) {
    console.log(req.session.user_id);
    res.render("index");
});

app.get('/signup', function(req, res) {
    User.find(function(err,doc){
        console.log(doc);
        res.render("signup");
    })    
});

app.get('/login', function(req, res) {
        res.render("login");
    });

app.post('/users', function(req, res) {
    var user = new User({
                            email: req.body.email, 
                            password: req.body.password,
                            password_confirmation: req.body.password_confirmation,
                            username: req.body.username
                        });

    user.save().then(function(us) {
        res.send("Guardamos el usuario exitosamente");
    },function(err){
        if(err){
            console.log(String(err));
            res.send("No se pudo guardar la informacion");
        }
    })

});

app.post('/sessions', function(req, res) {
    User.findOne({email:req.body.email,password:req.body.password},function(err,user){
        req.session.user_id = user._id;
        res.redirect("/app");
});
});

server.listen(3000, function() {
    console.log('App listening on port 3000!');
});


