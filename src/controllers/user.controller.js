import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cluadnary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
try {
  const user = await User.findById(userId)
  const accessToken= user.generateAccessToken()
  const refreshToken= user.generateRefreshToken()
  user.refreshToken = refreshToken
  user.save({validateBeforeSave: false}) // to avoid password validation error

  return { accessToken, refreshToken };
} catch (error) {
  throw new ApiError(500, "something went wrong while generating refresh and access toke" , error.message);
}
}

const registerUser = asyncHandler( async (req,res)=>{
//  get user details from frontend
//  validation- not empty
// check if user already exists : username or email
// check for image ,check for avatar
// upload them to claudanary,avatar
// create user object - create entry in db
// remove password and refresh token from response
// check for user creation
// return res 
 



const { fullName, email, password, username } = req.body;
// console.log(req)
console.log("email:",email)
console.log("password:",password)
// if (
//   [!fullName, !email, !password, !username].some((field) => field?.trim()=="")
//   ) {
//     throw new ApiError(400, "All fields are required");
// }

if ([fullName, email, password, username].some((field) => field?.trim() === "")) {
  throw new ApiError(400, "All fields are required");
}

  const existedUser = await User.findOne({
  $or:[{ username },{ email }]
 })

 if( existedUser ){
  throw new ApiError(409, "User with this username or email already exists");
 }
//  console.log(req.files)
 const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required");
  }
   const avatar =await uploadOnCloudinary(avatarLocalPath)
  const coverImage= await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(500, "Failed to upload avatar image");
  }
  const user= await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url|| "",
    email,
    password,
    username:username.toLowerCase(),
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError(500, "something went wrong while creating user");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User created successfully")
  )


} )

const loginUser = asyncHandler(async(req,res)=>{
// req body -> data
// username or email
// find the user in db
// password check
// access and refresh token generation
// send cokie

const {email,username,password} = req.body;
console.log(email)
if(!email && !username){
  throw new ApiError(400, "Email or username is required");
}
const user = await User.findOne({
  $or:[{username},{email}]
})

if(!user){
  throw new ApiError(404, "User not found");
}
const isPasswordValid = await user.isPasswordCorrect(password)
if(!isPasswordValid){
  throw new ApiError(401, "Invalid password");
}

 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

const loggedInUser =await User.findById(user._id).select("-password -refreshToken")

const options = {
  httpOnly: true, // to prevent XSS attacks
  secure: true,
}
return res
.status(200)
.cookie("accessToken",accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
  new ApiResponse(
    200, 
    {
      user:loggedInUser,accessToken,refreshToken
    },
    "user logged in succesfully"
  )
 )
})
const logoutUser = asyncHandler(async(req,res)=>{
 await User.findOneAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined,
      }
    }
  )
  const options = {
    httpOnly: true, // to prevent XSS attacks
    secure: true,
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, { }, "User logged out successfully"))
  
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
 const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

 if(!incomingRefreshToken){
  throw new ApiError(400, "unauthorized request");
 }

 try {
  const decodedToken =  jwt.verify(
   incomingRefreshToken,
   process.env.REFRESH_TOKEN_SECRET,
  )
 
  const user = await User.findById(decodedToken?._id)
 
  if(!user){
 
    throw new ApiError(404, "Invalid refresh token");
  }
  if(user.refreshToken !== incomingRefreshToken){
   throw new ApiError(401, "refresh token is expired or used");
  }
  const options ={
   httpOnly: true, // to prevent XSS attacks
   secure: true,
  }
 
  const {accessToken , newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
 
  return res
  .status(200)
  .cookie("accessToken", accessToken, options) 
  .cookie("refreshToken", newRefreshToken, options)
  .json(
   new ApiResponse(
     200,
     {accessToken, refreshToken: newRefreshToken},
     "Access token refreshed successfully"
   )
  )
 } catch (error) {
  throw new ApiError(401, error?.message || "Invalid refresh token");
 }
 
})
export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,

};