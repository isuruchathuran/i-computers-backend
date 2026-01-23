import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function createUser(req, res) {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashedPassword,
    image: req.body.image,
  });

  user
    .save()
    .then(() => {
      res.json({
        message: "User created Successfully...",
      });
    })
    .catch(() => {
      res.json({
        message: "user creation Failed...",
      });
    });
}

export async function loginUser(req, res) {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User with given email not found...",
      });
    }

    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Incorrect Password",
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        image: user.image,
        isEmailVerified: user.isEmailVerified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login Successful...",
      token: token,
      role: user.role  
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error...",
    });
  }
}

export function isAdmin(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role == "admin") {
    return true;
  } else {
    return false;
  }
}
