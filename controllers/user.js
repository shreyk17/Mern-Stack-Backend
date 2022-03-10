const express = require('express')
const User = require('../models/user')
const _ =require('lodash')
const formidable = require('formidable')
const fs = require('fs')
// exports.userById = (req,res,next,id) => {
//     User.findById(id)
//         .exec((user,err) => {
//             if(err || !user){
//                 return res.status(400).json({
//                     error : "User not found"
//                 })
//             }
//             req.profile = user   //add profile object to user
//             next()
//         })
// }


exports.userById = (req, res, next, id) => {
    User.findById(id)
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'User not found'
                });
            }
            req.profile = user; // adds profile object in req with user info
            next();
        });
};


exports.hasAuthorzation = (req,res,next) => {
    const authorized = req.profile && req.auth && req.profile._id === req.auth._id
    if(!authorized) {
        return res.status(403).json({
            error : "User not authorized!"
        })
    }

}   

exports.getAllUser = (req,res,next) => {
    User.find((err,users) =>{
        if(err){
            return res.status(400).json({
                error : err
            })
        }
        return res.status(200).json(users)
    }).select("_id name email created updated role")
}

exports.getUser = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
};

// exports.updateUser = (req,res,next) => {
//     let user = req.profile
//     user = _.extend(user , req.body)
//     user.updated = Date.now()
//     user.save((err) => {
//         if(err){
//             return res.status(400).json({
//                 error : "You are not authorized to perform this action."
//             })
//         }
//         user.hashed_password = undefined
//         user.salt = undefined
//         res.status(200).json({
//             user : user
//         })
//     })
// }

exports.updateUser = (req,res,next) => {
    let form =  new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err,fields,files) => {
        if(err){
            return res.status(400).json({
                error : "Photo could not be uploded"
            })
        }
        let user = req.profile
        user = _.extend(user , fields)
        user.updated = Date.now()
        if(files.photo){
            user.photo.data = fs.readFileSync(files.photo.path)
            user.photo.contentType = files.photo.type
        }
        user.save((err,result) => {
            if(err){
                return res.status(400).json({
                    error : err
                })
            }
            user.hashed_password = undefined
            user.salt = undefined
            res.status(200).json(user)
        })
    })
}

exports.deleteUser = (req,res,next) => {
    let user = req.profile
    user.remove((err,user) => {
        if(err){
            return res.status(400).json({
                error : err
            })
        }
        user.hashed_password = undefined
        user.salt = undefined
        res.status(200).json({
            message  : "User deleted successfully!"
        })
    })
}

exports.userPhoto = (req, res, next) => {
    if (req.profile.photo.data) {
        res.set(('Content-Type', req.profile.photo.contentType));
        return res.send(req.profile.photo.data);
    }
    next();
};

exports.addFollowing = (req,res,next) => {
    User.findByIdAndUpdate(req.body.userId , {$push:{following : req.body.followId}} , (err,result) => {
        if(err){
            return res.status(400).json({
                error : err
            })
        }
        next()
    })

}

exports.addFollowers = (req,res,next) => {
    User.findByIdAndUpdate(
        req.body.followId,
        { $push : {followers : req.body.userId}},
        {new : true}
    )
    .populate('following' , '_id name about')
    .populate('followers' , '_id name about')
    .exec((err,result) => {
        if(err){
            return res.status(400).json({
                error : err
            })
        }
        result.hashed_password = undefined
        result.salt = undefined
        res.json(result)
    })
}

exports.removeFollowing = (req,res,next) => {
    User.findByIdAndUpdate(req.body.userId , {$pull:{following : req.body.unfollowId}} , (err,result) => {
        if(err){
            return res.status(400).json({
                error : err
            })
        }
        next()
    })

}

exports.removeFollowers = (req,res,next) => {
    User.findByIdAndUpdate(
        req.body.unfollowId,
        { $pull : {followers : req.body.userId}},
        {new : true}
    )
    .populate('following' , '_id name')
    .populate('followers' , '_id name')
    .exec((err,result) => {
        if(err){
            return res.status(400).json({
                error : err
            })
        }
        result.hashed_password = undefined
        result.salt = undefined
        res.json(result)
    })
}

exports.findPeople = (req,res) => {
    let following = req.profile.following
    following.push(req.profile._id)
    User.find({_id : {$nin : following}} , (err,users) => {
        if(err){
            return res.status(400).json({
                error : err
            })
        }

        res.status(200).json(users)
    }).select('name')
}