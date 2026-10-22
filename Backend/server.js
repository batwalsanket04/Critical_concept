const express = require("express");
const cors = require("cors");
const cookieParser =require("cookie-parser")
const app = express();

const PORT = process.env.PORT || 4000;


// Middleware
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true
    }
));

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//routes
 require("./Config/Connection.js")


 const userRoute = require('./Routes/user.route.js');
const auditRoutes = require("./Routes/audit.routes.js");
 
 
 app.use("/api",userRoute)
 app.use("/api/log",auditRoutes)



// Test API
app.get("/", (req,res)=>{
    res.status(200).json({
        message:"API Working Successfully"
    });
});

app.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

app.use(require("./middleware/error.middleware.js"));

// Server
app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});