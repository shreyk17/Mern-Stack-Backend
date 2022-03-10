const express = require('express')
const postController = require('../controllers/post')
const postValidations = require('../validators/index')
const { requireSignin } = require('../controllers/auth')
const { userById } = require('../controllers/user')

const route = express.Router()

route.get("/posts" , requireSignin , postController.getPosts);

route.put("/post/like" , requireSignin , postController.like)
route.put("/post/unlike" , requireSignin , postController.unlike)

route.put("/post/comment" ,requireSignin , postController.comment )
route.put("/post/uncomment" , requireSignin , postController.uncomment)

route.get("/post/:postId" , requireSignin, postController.singlePost)
route.post("/post/new/:userId",requireSignin,postController.createPost,postValidations.createPostValidations)
route.get("/posts/by/:userId" , requireSignin , postController.postsByUser)
route.delete("/post/:postId" , requireSignin , postController.isPoster,postController.deletePost)
route.put("/post/:postId" , requireSignin , postController.isPoster , postController.updatePost)
route.get("/post/photo/:postId"  , postController.photo)

route.param("userId" , userById)
route.param("postId" , postController.postById)

module.exports = route

