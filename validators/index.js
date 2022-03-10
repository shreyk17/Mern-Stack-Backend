exports.createPostValidations = (req,res,next) => {

    //title
    req.check('title' , "Title cannot be empty").notEmpty()
    req.check('title',"Title must be between 4 to 150").isLength({
        min:4,
        max:150
    })

    //body
    req.check('body' , "Body cannot be empty").notEmpty()
    req.check('body',"Body must be between 4 to 200").isLength({
        min:4,
        max:200
    })

    //check for errors
    const errors = req.validationErrors()

    if(errors){
        const first = errors.map(error => error.msg)[0]
        return res.status(400).json({
            error : first
        })
    }

    next()

}

exports.userSignupValidator = (req,res,next) => {

    //name
    req.check("name" , "Name should not be empty").notEmpty()   


    //email
    req.check("email" , "Email should not be empty").notEmpty()
    req.check("email" , "Email must be between 3 to 25 chars")
        .matches(/.+\@.+\..+/)
        .withMessage("Email must contain @ ")
        .isLength({
            min : 4,
            max: 100
        })

    //password
    req.check("password", "Password should not be empty")
    req.check("password")    
        .isLength({
            min:6,
        })
        .withMessage("Password must contain atleast 6 characters")
        .matches(/\d/)
        .withMessage("Password must contain a number")

        //check for errors
        const errors = req.validationErrors()

        if(errors){
            const first = errors.map(error => error.msg)[0]
            return res.status(400).json({
                error : first
            })
        }
    
        next()
}

exports.passwordResetValidator = (req,res,next) => {
    req.check("newPassword" , "Password is required").notEmpty()
    req.check("newPassword")
        .isLength({
            min:6
        })
        .withMessage("Password must contain atleast 6 character")
        .matches(/\d/)
        .withMessage("Password must contain a number")

        const errors = req.validationErrors()
        
        if(errors){
            const first = errors.map(error => error.msg[0])
            return res.status(400).json({
                error : first
            })
        }
        next()
}