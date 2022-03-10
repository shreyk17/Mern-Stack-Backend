const express = require('express')
const { 
    getAllUser , 
    userById,getUser , 
    updateUser  , 
    deleteUser , 
    userPhoto , 
    addFollowing , 
    addFollowers ,
    removeFollowing,    
    removeFollowers,
    findPeople
} = require('../controllers/user')

const { requireSignin } = require('../controllers/auth')

const router = express.Router();

router.get("/users" ,getAllUser)

router.get("/user/:userId" , requireSignin , getUser)

router.put("/user/follow" , requireSignin , addFollowing , addFollowers )

router.put("/user/unfollow" , requireSignin , removeFollowing, removeFollowers)

router.put("/user/:userId" , requireSignin , updateUser)

router.delete("/user/:userId" , requireSignin , deleteUser)

router.get("/user/photo/:userId", userPhoto);

router.get("/user/findPeople/:userId" , requireSignin , findPeople)

router.param("userId" , userById)

module.exports = router