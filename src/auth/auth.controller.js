import { hash, verify } from "argon2";
import User from "../user/user.model.js";
import { generateJWT } from "../helpers/generate-jwt.js";

export const register = async (req, res) => {
  try {
    const data = req.body;
    const encryptPassword = await hash(data.password);
    data.password = encryptPassword;
    const user = await User.create(data);
    return res.status(201).json({
      message: "You have successfully registered",
      success: true,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).json({
      message: "User registration failed",
      success: false,
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username, estado: "ACTIVO" });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credential",
        error: "There is no user with the entered username",
      });
    }
    const isPasswordValid = await verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
        error: "The password is incorrect",
      });
    }
    const token = await generateJWT(user.id);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      userDetails: {
        _id: user._id,
        username: user.username,
        rol: user.rol,
        token: token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Login failed, server error",
      error: err.message,
    });
  }
};