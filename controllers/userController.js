import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function createUser(req, res) {
  try {
    if (!req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
      image: req.body.image,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "User creation failed", error: error.message });
  }
}

export async function loginUser(req, res) {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User with given email not found..." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked." });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect Password" });
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
      { expiresIn: "30d" }
    );

    return res.json({
      message: "Login Successful...",
      token: token,
      role: user.role  
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      message: "Internal server error...",
      error: err.message
    });
  }
}

export async function getUser(req, res) {
  if (req.user == null) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      image: user.image,
      isEmailVerified: user.isEmailVerified,
      isBlocked: user.isBlocked
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
}


export async function updateUserProfile(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "Unauthorized"
    })
    return
  }
  try {
    await User.updateOne({ email: req.user.email }, { firstName: req.body.firstName, lastName: req.body.lastName, image: req.body.image })

    const user = await User.findOne({ email : req.user.email })

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
      { expiresIn: "30d" }
    );

    res.json({
   message: "Profile updated successfully",
   token: token
})

  } catch (error) {
      res.status(500).json({ message : "Error updating profile", error : error })
  }
}

export async function changeUserPassword(req, res) {

    if (req.user == null) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.body.password) {
        return res.status(400).json({ message: "New password is required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        await User.updateOne(
            { email: req.user.email },
            { password: hashedPassword }
        );

        res.json({ message: "Password changed successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error changing password", error: error.message });
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

export async function getAllUsers(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
}

export async function toggleBlockUser(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: "Error updating user status", error });
  }
}

export async function deleteUser(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  try {
    const result = await User.deleteOne({ email: req.params.email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
}
