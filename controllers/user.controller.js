import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import genertedRefreshToken from "../utils/generatedRefreshToken.js";
import PendingUser from "../models/pendingUser.model.js";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ReviewModel from "../models/reviews.model.js.js";
import WelcomeEmail from "../utils/welcomeEmailTemplate.js";
import validatePassword from "../utils/validatePassword.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

// export async function registerUserController(request, response) {
//   try {
//     let user;
//     const { name, email, phone, password } = request.body;
//     if (!name || !email || !phone || !password) {
//       return response.status(400).json({
//         message: "provide name, email, phone, password",
//         error: true,
//         success: false,
//       });
//     }

//     // Check if user exists by email OR phone
//     user = await UserModel.findOne({
//       $or: [{ email: email }, { phone: phone }],
//     });

//     if (user) {
//       // Adjust message based on which field is duplicated
//       const message =
//         user.email === email
//           ? "User already Registered with this Email"
//           : "User already Registered with this Phone Number";
//       return response.json({
//         message: message,
//         error: true,
//         success: false,
//       });
//     }

//     const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

//     const salt = await bcryptjs.genSalt(10);
//     const hashPassword = await bcryptjs.hash(password, salt);

//     user = new UserModel({
//       name: name,
//       email: email,
//       phone: phone,
//       password: hashPassword,
//       otp: verifyCode,
//       verify_email: false, // Keep email unverified initially if using OTP later
//       otpExpires: Date.now() + 600000,
//     });

//     await user.save();

//     // Send verification email
//     await sendEmailFun({
//       sendTo: email,
//       subject: "Verify email from Soouqna App",
//       text: "",
//       html: VerificationEmail(name, verifyCode),
//     });

//     // Create a JWT token for verification purposes
//     const token = jwt.sign(
//       { phone: user.phone, id: user._id },
//       process.env.JSON_WEB_TOKEN_SECRET_KEY
//     );

//     return response.status(200).json({
//       success: true,
//       error: false,
//       message: "User registered successfully! Please verify your PhoneNumber.",
//       token: token, // Optional: include this if needed for verification
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// export async function verifyEmailController(request, response) {
//   try {
//     const { phone, otp } = request.body;

//     const user = await UserModel.findOne({ phone: phone });
//     if (!user) {
//       return response
//         .status(400)
//         .json({ error: true, success: false, message: "User not found" });
//     }

//     const isCodeValid = user.otp === otp;
//     const isNotExpired = user.otpExpires > Date.now();

//     if (isCodeValid && isNotExpired) {
//       user.verify_email = true;
//       user.otp = null;
//       user.otpExpires = null;
//       await user.save();
//       return response.status(200).json({
//         error: false,
//         success: true,
//         message: "Email verified successfully",
//       });
//     } else if (!isCodeValid) {
//       return response
//         .status(400)
//         .json({ error: true, success: false, message: "Invalid OTP" });
//     } else {
//       return response
//         .status(400)
//         .json({ error: true, success: false, message: "OTP expired" });
//     }
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// export async function registerUserController(req, res) {
//   try {
//     const { name, email, phone, password } = req.body;
//     if (!name || !email || !phone || !password) {
//       return res
//         .status(400)
//         .json({ message: "All fields are required", error: true });
//     }

//     const existingUser = await UserModel.findOne({
//       $or: [{ email }, { phone }],
//     });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "User already registered.", error: true });
//     }

//     const existingPending = await PendingUser.findOne({
//       $or: [{ email }, { phone }],
//     });
//     if (existingPending) {
//       return res
//         .status(400)
//         .json({
//           message: "An OTP is already sent. Please verify.",
//           error: true,
//         });
//     }

//     const hashedPassword = await bcryptjs.hash(password, 10);
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = Date.now() + 600000; // 10 minutes

//     await PendingUser.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       otp,
//       otpExpires,
//     });

//     await sendEmailFun({
//       sendTo: email,
//       subject: "Verify email from Soouqna App",
//       html: VerificationEmail(name, otp),
//     });

//     return res
//       .status(200)
//       .json({
//         success: true,
//         message: "OTP sent to your email. Please verify.",
//       });
//   } catch (error) {
//     return res.status(500).json({ message: error.message, error: true });
//   }
// }

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", error: true });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already registered.", error: true });
    }

    if (!validatePassword(password)) {
      return response.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
        error: true,
        success: false,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 600000;

    const existingPending = await PendingUser.findOne({ email });

    if (existingPending) {
      // Update OTP for existing pending user
      existingPending.otp = otp;
      existingPending.otpExpires = otpExpires;
      existingPending.password = hashedPassword;
      existingPending.name = name;
      await existingPending.save();
    } else {
      // Create new pending user
      await PendingUser.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
      });
    }

    await sendEmailFun({
      sendTo: email,
      subject: "Verify email from Soouqna App",
      html: VerificationEmail(name, otp),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true });
  }
}

export async function verifyEmailController(req, res) {
  try {
    const { email, otp } = req.body;
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res
        .status(400)
        .json({ message: "No pending registration found.", error: true });
    }

    if (pendingUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP.", error: true });
    }

    if (pendingUser.otpExpires < Date.now()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(400).json({ message: "OTP expired.", error: true });
    }

    const newUser = new UserModel({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      verify_email: true,
    });

    await newUser.save();
    await PendingUser.deleteOne({ _id: pendingUser._id });

    await sendEmailFun({
      sendTo: newUser.email,
      subject: "Welcome to Soouqna!",
      html: WelcomeEmail(newUser.name),
    });

    return res.status(200).json({
      success: true,
      message: "Email verified. Registration complete.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true });
  }
}

// Update user location
export async function updateUserLocation(request, response) {
  try {
    const userId = request.userId; // From auth middleware
    const { latitude, longitude } = request.body; // Assuming these are sent

    if (latitude === undefined || longitude === undefined) {
      return response.status(400).json({
        message: "Please provide latitude and longitude.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        currentLocation: {
          type: "Point",
          coordinates: [longitude, latitude], // GeoJSON format: [longitude, latitude]
        },
      },
      { new: true } // Return the updated document
    );

    if (!user) {
      return response.status(404).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "User location updated successfully.",
      error: false,
      success: true,
      data: {
        userId: user._id,
        location: user.currentLocation,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error updating user currentLocation.",
      error: true,
      success: false,
    });
  }
}

export async function authWithGoogle(request, response) {
  const { name, email, password, avatar, phone, role } = request.body;

  try {
    const existingUser = await UserModel.findOne({ email: email });

    if (!existingUser) {
      const user = await UserModel.create({
        name: name,
        phone: phone,
        email: email,
        password: "null",
        avatar: avatar,
        role: role,
        verify_email: true,
        signUpWithGoogle: true,
      });

      await user.save();

      const accesstoken = await generatedAccessToken(user._id);
      const refreshToken = await genertedRefreshToken(user._id);

      await UserModel.findByIdAndUpdate(user?._id, {
        last_login_date: new Date(),
      });

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      response.cookie("accessToken", accesstoken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "Login successfully",
        error: false,
        success: true,
        data: {
          accesstoken,
          refreshToken,
        },
      });
    } else {
      const accesstoken = await generatedAccessToken(existingUser._id);
      const refreshToken = await genertedRefreshToken(existingUser._id);

      await UserModel.findByIdAndUpdate(existingUser?._id, {
        last_login_date: new Date(),
      });

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      response.cookie("accessToken", accesstoken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "Login successfully",
        error: false,
        success: true,
        data: {
          accesstoken,
          refreshToken,
        },
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function loginUserController(request, response) {
  try {
    const { email, password } = request.body;

    // Check if either email or phone is provided
    if (!email) {
      return response.status(400).json({
        message: "Please provide email for login.",
        error: true,
        success: false,
      });
    }

    let user = null;

    // Find user based on whether email or phone is provided
    if (email) {
      user = await UserModel.findOne({ email: email });
      console.log("Attempting to find user by email:", email);
    }

    if (!user) {
      console.log("User not found for login:", { email });
      return response.status(400).json({
        message: "User not registered with this email.",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Your account is not active. Please contact admin.",
        error: true,
        success: false,
      });
    }

    // Check if the user registered with Google
    if (user.signUpWithGoogle) {
      return response.status(400).json({
        message:
          "This account was registered with Google. Please login with Google.",
        error: true,
        success: false,
      });
    }

    // Check password
    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      console.log("Password comparison failed.");
      return response.status(400).json({
        message: "Incorrect password.",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id);
    const refreshToken = await genertedRefreshToken(user._id);

    await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", accesstoken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.json({
      message: "Login successful",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//logout controller
export async function logoutController(request, response) {
  try {
    const userid = request.userId; //middleware

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
      refresh_token: "",
    });

    return response.json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//image upload
var imagesArr = [];
export async function userAvatarController(request, response) {
  try {
    imagesArr = [];

    const userId = request.userId; //auth middleware
    const image = request.files;

    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return response.status(500).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    //first remove image from cloudinary
    const imgUrl = user.avatar;

    const urlArr = imgUrl.split("/");
    const avatar_image = urlArr[urlArr.length - 1];

    const imageName = avatar_image.split(".")[0];

    if (imageName) {
      const res = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {
          // console.log(error, res)
        }
      );
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image?.length; i++) {
      const img = await cloudinary.uploader.upload(
        image[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${request.files[i].filename}`);
        }
      );
    }

    user.avatar = imagesArr[0];
    await user.save();

    return response.status(200).json({
      _id: userId,
      avtar: imagesArr[0],
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function removeImageFromCloudinary(request, response) {
  const imgUrl = request.query.img;

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  if (imageName) {
    const res = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {
        // console.log(error, res)
      }
    );

    if (res) {
      response.status(200).send(res);
    }
  }
}

//update user details
export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId; //auth middleware
    const { name, email, phone, password } = request.body;

    const userExist = await UserModel.findById(userId);
    if (!userExist)
      return response.status(400).send("The user cannot be Updated!");

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name: name,
        phone: phone,
        email: email,
      },
      { new: true }
    );

    return response.json({
      message: "User Updated successfully",
      error: false,
      success: true,
      user: {
        name: updateUser?.name,
        _id: updateUser?._id,
        email: updateUser?.email,
        phone: updateUser?.phone,
        avatar: updateUser?.avatar,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//forgot password
export async function forgotPasswordController(request, response) {
  try {
    const { email } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    } else {
      let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      user.otp = verifyCode;
      user.otpExpires = Date.now() + 600000;

      await user.save();

      await sendEmailFun({
        sendTo: email,
        subject: "Verify OTP from Soouqna App",
        text: "",
        html: VerificationEmail(user.name, verifyCode),
      });

      return response.json({
        message: "check your email",
        error: false,
        success: true,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyForgotPasswordOtp(request, response) {
  try {
    const { email, otp } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    if (!email || !otp) {
      return response.status(400).json({
        message: "Provide required field email, otp.",
        error: true,
        success: false,
      });
    }

    if (otp !== user.otp) {
      return response.status(400).json({
        message: "Invailid OTP",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString();

    if (user.otpExpires < currentTime) {
      return response.status(400).json({
        message: "Otp is expired",
        error: true,
        success: false,
      });
    }

    user.otp = "";
    user.otpExpires = "";

    await user.save();

    return response.status(200).json({
      message: "Verify OTP successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//reset password
export async function resetpassword(request, response) {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = request.body;
    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "provide required fields email, newPassword, confirmPassword",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }

    if (user?.signUpWithGoogle === false) {
      const checkPassword = await bcryptjs.compare(oldPassword, user.password);
      if (!checkPassword) {
        return response.status(400).json({
          message: "your old password is wrong",
          error: true,
          success: false,
        });
      }
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "newPassword and confirmPassword must be same.",
        error: true,
        success: false,
      });
    }

    if (!validatePassword(confirmPassword)) {
      return response.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(confirmPassword, salt);

    user.password = hashPassword;
    user.signUpWithGoogle = false;
    await user.save();

    return response.json({
      message: "Password updated successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//change password
export async function changePasswordController(request, response) {
  try {
    const { email, newPassword, confirmPassword } = request.body;
    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "provide required fields email, newPassword, confirmPassword",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "newPassword and confirmPassword must be same.",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(confirmPassword, salt);

    user.password = hashPassword;
    user.signUpWithGoogle = false;
    await user.save();

    return response.json({
      message: "Password updated successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//refresh token controler
export async function refreshToken(request, response) {
  try {
    const refreshToken =
      request.cookies.refreshToken ||
      request?.headers?.authorization?.split(" ")[1]; /// [ Bearer token]

    if (!refreshToken) {
      return response.status(401).json({
        message: "Invalid token",
        error: true,
        success: false,
      });
    }

    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );
    if (!verifyToken) {
      return response.status(401).json({
        message: "token is expired",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken?._id;
    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.cookie("accessToken", newAccessToken, cookiesOption);

    return response.json({
      message: "New Access token generated",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get login user details
export async function userDetails(request, response) {
  try {
    const userId = request.userId;

    const user = await UserModel.findById(userId)
      .select("-password -refresh_token")
      .populate("address_details");

    return response.json({
      message: "user details",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
}

//review controller
export async function addReview(request, response) {
  try {
    const { image, userName, review, rating, userId, productId } = request.body;

    const userReview = new ReviewModel({
      image: image,
      userName: userName,
      review: review,
      rating: rating,
      userId: userId,
      productId: productId,
    });

    await userReview.save();

    return response.json({
      message: "Review added successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
}

//get reviews
export async function getReviews(request, response) {
  try {
    const productId = request.query.productId;

    const reviews = await ReviewModel.find({ productId: productId });
    console.log(reviews);

    if (!reviews) {
      return response.status(400).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      reviews: reviews,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
}

//get all reviews
export async function getAllReviews(request, response) {
  try {
    const reviews = await ReviewModel.find();

    if (!reviews) {
      return response.status(400).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      reviews: reviews,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
}

//get all users
export async function getAllUsers(request, response) {
  try {
    const { page, limit } = request.query;

    const totalUsers = await UserModel.find();

    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UserModel.countDocuments(users);

    if (!users) {
      return response.status(400).json({
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      users: users,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalUsersCount: totalUsers?.length,
      totalUsers: totalUsers,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
}

export async function deleteUser(request, response) {
  const user = await UserModel.findById(request.params.id);

  if (!user) {
    return response.status(404).json({
      message: "User Not found",
      error: true,
      success: false,
    });
  }

  const deletedUser = await UserModel.findByIdAndDelete(request.params.id);

  if (!deletedUser) {
    response.status(404).json({
      message: "User not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    success: true,
    error: false,
    message: "User Deleted!",
  });
}

//delete multiple products
export async function deleteMultiple(request, response) {
  const { ids } = request.body;

  if (!ids || !Array.isArray(ids)) {
    return response
      .status(400)
      .json({ error: true, success: false, message: "Invalid input" });
  }

  try {
    await UserModel.deleteMany({ _id: { $in: ids } });
    return response.status(200).json({
      message: "Users delete successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
