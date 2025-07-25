import jwt from "jsonwebtoken"
import User from "../user/user.model.js"

export const validateJWT = async (req, res, next) => {
    try{
        let token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers["authorization"]

        if(!token){
            return res.status(400).json({
                success: false,
                message: "No existe token en la petición"
            })
        }

        token = token.replace(/^Bearer\s+/, "")
        
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: "Token inválido",
                error: jwtError.message
            });
        }
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Token inválido o malformado"
            });
        }
        
        if (!decoded.uid) {
            return res.status(401).json({
                success: false,
                message: "Token no contiene información de usuario válida"
            });
        }
        
        const { uid } = decoded

        const user = await User.findById(uid)

        if(!user){
           return res.status(400).json({
                success: false,
                message: "usuario no existe en la DB"
           }) 
        }

        if(user.estado === "INACTIVO"){
            return res.status(400).json({
                success: false,
                message: "Usuario desactivado previamente"
            })
        }

        req.usuario = user
        next()
    }catch(err){
        return res.status(500).json({
            success: false,
            message : "Error al validar el token",
            error: err.message
        })
    }
}