import { hash, verify } from "argon2"
import User from "../user/user.model.js";
import { generateJWT } from "../helpers/generate-jwt.js";

export const register = async (req, res) => {
    try {
        const data = req.body;
        const encryptPassword = await hash(data.password)
        data.password = encryptPassword
        const user = await User.create(data);
        return res.status(201).json({
            message: "You have successfully registered",
            success: true,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        return res.status(500).json({
            message: "User registration failed",
            success: false,
            error: err.message
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const acces = await User.findOne({ email: email, status: true });
        if (!acces) {
            return res.status(400).json({
                success: false,
                message: "Invalid credential",
                error: "There is no user with the entered email"
            })
        }
        const validatorPassword = await verify(acces.password, password)
        if (!validatorPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
                error: "The password is incorrect"
            })
        }
        const webToken = await generateJWT(acces.id)
        return res.status(200).json({
            success: true,
            message: "login successful",
            userDetails: {
                _id: acces._id,
                name: acces.name,
                email: acces.email,
                role: acces.role,
                token: webToken
            }
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "login failed, server error",
            error: err.message

        })
    }
}