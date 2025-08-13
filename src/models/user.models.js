// searching for error
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema(
    {
        username:{
            type: String,
            required:true,
            unique:true,
            lowercase: true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true, // Added to prevent duplicate emails
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required: true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,//claudinary url
            // default:"https://res.cloudinary.com/dz3d1m8xj/image/upload/v1736405980/avatar/avatar-default.png",
            required:true,
         
        },
        coverImage:{
            type:String,
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video",
            },
        
        ],
        password:{
            type:String,
            required: [true, 'password is required'],
        },
        refreshToken:{
            type:String,

        }

    },
    {
        timestamps:true,
    }
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.isPasswordCorrect = async function(password){
 return await  bcrypt.compare(password, this.password);

}

userSchema.methods.generateAccessToken = function(){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id: this._id,
          
        },
        process.env.REFRESH_TOKEN_SECTRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        }
    )
}
export const User = mongoose.model("User",userSchema)






















// import mongoose, { Schema } from "mongoose";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";

// // Define the User schema
// const userSchema = new Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true, // Added to prevent duplicate emails
//       lowercase: true,
//       trim: true,
//       match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"], // Optional: basic email validation
//     },
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//       index: true,
//     },
//     avatar: {
//       type: String, // Cloudinary URL
//       required: true,
//       // default: "https://res.cloudinary.com/dz3d1m8xj/image/upload/v1736405980/avatar/avatar-default.png", // Uncomment if needed
//     },
//     coverImage: {
//       type: String,
//     },
//     watchHistory: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Video",
//       },
//     ],
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [8, "Password must be at least 8 characters"], // Optional: added for better security
//     },
//     refreshToken: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Pre-save hook to hash password (async)
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10); // Added await for proper async hashing
//   next();
// });

// // Method to check if provided password matches the hashed one
// userSchema.methods.isPasswordCorrect = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// // Method to generate JWT access token
// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign( // Corrected to jwt.sign (lowercase)
//     {
//       _id: this._id,
//       email: this.email,
//       username: this.username,
//       fullName: this.fullName,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
//     }
//   );
// };

// // Method to generate JWT refresh token
// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
//     }
//   );
// };
// export const User = mongoose.model("User", userSchema);
// // export const User= mongoose.model("User", userSchema); 




// // import mongoose, {Schema} from "mongoose";
// // import jwt from "jsonwebtoken"; 
// // // import  Jwt  from "jsonwebtoken";
// // import bcrypt from "bcrypt";


// // const userSchema = new Schema(
// //     {
// //         username:{
// //             type: String,
// //             required:true,
// //             unique:true,
// //             lowercase: true,
// //             trim:true,
// //             index:true
// //         },
// //         email:{
// //             type:String,
// //             required:true,
// //             lowercase:true,
// //             trim:true,
// //         },
// //         fullName:{
// //             type:String,
// //             required: true,
// //             trim:true,
// //             index:true
// //         },
// //         avatar:{
// //             type:String,//claudinary url
// //             // default:"https://res.cloudinary.com/dz3d1m8xj/image/upload/v1736405980/avatar/avatar-default.png",
// //             required:true,
         
// //         },
// //         coverImage:{
// //             type:String,
// //         },
// //         watchHistory:[
// //             {
// //                 type:Schema.Types.ObjectId,
// //                 ref:"Video",
// //             },
        
// //         ],
// //         password:{
// //             type:String,
// //             required: [true, 'password is required'],
// //         },
// //         refreshToken:{
// //             type:String,

// //         }

// //     },
// //     {
// //         timestamps:true,
// //     }


// // )


// // userSchema.pre("save",async function(next){
// //     if(!this.isModified("password")) return next()
// //     this.password= bcrypt.hash(this.password,10)
// //     next()
// // })
    
// // userSchema.methods.isPasswordCorrect= async function(password){
// //    return await bcrypt.compare(password,this.password)
// // }
// // userSchema.methods.generateAccessToken = function(){
// //   return  jwt.sign(
// //         {
// //             _id:this._id,
// //             email:this.email,
// //             username:this.username,
// //             fullName:this.fullName
// //     },
// //     process.env.ACCESS_TOKEN_SECRET,
// //     {
// //         expiresIn: process.env.ACCESS_TOKEN_EXPIRY
// //     }
// //     )
// // }
// // userSchema.methods.generateRefreshToken = function(){
// //     return  jwt.sign(
// //         {
// //             _id:this._id,
          
// //     },
// //     process.env.REFRESH_TOKEN_SECRET,
// //     {
// //         expiresIn: process.env.REFRESH_TOKEN_EXPIRY
// //     }
// //     )
// // }   


// // export const User = mongoose.model("User",userSchema)