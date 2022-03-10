const express = require('express')
const app = express();

const mongoose = require('mongoose')
const morgan = require('morgan')
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const jsonwebtoken = require('jsonwebtoken')
const { v1: uuidv1 } = require('uuid');
const cookieParser = require('cookie-parser')
const cors = require('cors')

//db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("dB connected successfully")
    })

mongoose.connection.on('error' , err => {
    console.log(`dB connection error ${err.message}`)
})

// routes
const postRoutes = require('./routes/post')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')

//middlewares
app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(expressValidator())
app.use(cookieParser())
app.use(cors())

// app.get("/", (req,res) => {
//     res.status(200).json({
//         list : [
//             {
//                 get : '/'
//             }
//         ]
//     })
// })
app.use('/', postRoutes)
app.use('/' , authRoutes)
app.use('/', userRoutes)

app.use(function(err,req,res,next) {
    if(err.name === 'UnauthorizedError'){
        res.status(401).json({
            error : "Unauthorized!!!"
        })
    }
})

const PORT = process.env.PORT || 8080

app.listen(PORT , () => {
    console.log(`Server is listening on port ${PORT}`);
});