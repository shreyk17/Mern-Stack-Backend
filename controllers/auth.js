const User = require('../models/user')
const _ = require("lodash");
const { sendEmail } = require("../helper");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require('jsonwebtoken')
require('dotenv').config()
const expressJwt = require('express-jwt')

exports.signup = async (req,res) => {
    const userExist =  await User.findOne({email : req.body.email}) 
    if(userExist){
        return res.status(403).json({
            error : "Email is already taken"
        })
    }

    const user = await new User(req.body)
    await user.save()
    res.status(200).json({
        message : "Signup successfully"
    })

}

exports.signin = (req,res,next) => {
    const {_id , name , email , password } = req.body
    User.findOne({email} , (err,user) => {
        if(err || !user) {
            return res.status(401).json({
                error : "User doesnot exist. Please signup"
            })
        }

        if(!user.authenticate(password)){
            return res.status(401).json({
                error : "Email or password do not match. Try again!"
            })
        }

        const token = jwt.sign({_id:user._id , role : user.role }, process.env.JWT_SECRET);
        res.cookie("t",token, {expire: new Date() + 9999})

        const {_id , name , email , role } = user
        return res.status(200).json({token , user : {_id,email,name ,role}})

    }) 
}

exports.signout = (req,res,next) => {
    res.clearCookie("t")
    return res.status(200).json({
        message : "Signed out successfully"
    })
}

exports.requireSignin = expressJwt({

    //if the token is valid , expressJwt appends the verified user id

    secret:process.env.JWT_SECRET,
    userProperty: "auth",
    algorithms: ["HS256"], 
    
})

exports.forgotPassword = (req, res) => {
    if (!req.body) return res.status(400).json({ message: "No request body" });
    if (!req.body.email)
        return res.status(400).json({ message: "No Email in request body" });
 
    console.log("forgot password finding user with that email");
    const { email } = req.body;
    console.log("signin req.body", email);
    // find the user based on email
    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status("401").json({
                error: "User with that email does not exist!"
            });
 
        // generate a token with user id and secret
        const token = jwt.sign(
            { _id: user._id, iss: "NODEAPI" },
            process.env.JWT_SECRET
        );
 
        // email data
        const emailData = {
            from: "noreply@node-react.com",
            to: email,
            subject: "Password Reset Instructions",
            text: `Please use the following link to reset your password: ${
                process.env.CLIENT_URL
            }/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${
                process.env.CLIENT_URL
            }/reset-password/${token}</p>`
        };
 
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                sendEmail(emailData);
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
                });
            }
        });
    });
};
 
// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user
 
exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;
 
    User.findOne({ resetPasswordLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status("401").json({
                error: "Invalid Link!"
            });
 
        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ""
        };
 
        user = _.extend(user, updatedFields);
        user.updated = Date.now();
 
        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Great! Now you can login with your new password.`
            });
        });
    });
}

exports.socialLogin = (req,res,next) => {
    let user = User.findOne( { email : req.body.email } , (err,user) => {
        if(err || !user ){
            user = new User(req.body)
            req.profile = user;
            user.save()
            
            const token = jwt.signin(
                {_id : user._id , iss : "NODEAPI" },
                process.env.JWT_SECRET
            )
            res.cookie("t" , token , { expire : new Date() + 999});

            const {_id , name , email } = user
            return res.status(200).json({
                token,
                user : {
                    _id ,
                    name,
                    email
                }
            })
        }
        else {
            req.profile = user;
            user = _.extend(user,req.body)
            user.updated = Date.now()
            user.save()

            const token = jwt.signin(
                {_id : user._id, iss :"NODEAPI" },
                process.env.JWT_SECRET
            );
            res.cookie("t" , token , { expire : new Date() + 999});
            const { _id , name , email } = user;
            return res.status(200).json({
                token,
                user : {
                    _id,
                    name,
                    email
                }
            }) 
        }
    })
}