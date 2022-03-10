const mongoose = require('mongoose')
//const User = require('./user')
const {ObjectId} = mongoose.Schema


const postSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    body : {
        type:String,
        required:true
    },
    photo : {
        data : Buffer,
        contentType : String
    },
    postedBy : {
        type : mongoose.Schema.ObjectId ,
        ref : "User"
    },
    created : {
        type : Date,
        default : Date.now
    },
    updated : {
        type : Date
    },
    likes: [{ type: ObjectId, ref: 'User' }],
    comments : [
        {
            text: String,
            createdDate : {
                type : Date,
                default : Date.now
            },
            postedBy : {
                type: ObjectId,
                ref: 'User'
            }
        }
    ]
 
})

module.exports = mongoose.model("Post" , postSchema)