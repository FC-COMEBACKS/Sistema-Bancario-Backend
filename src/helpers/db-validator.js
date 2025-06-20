import User from "../user/user.model.js";

export const emailExists = async (email = "") => {
    const existe = await User.findOne({email})
    if(existe){
        throw new Error(`The email ${email} is already registered`)
    }
}

export const userExists = async (uid = " ") => {
    const existe = await User.findById(uid)
    console.log(existe)
    if(!existe){
        throw new Error("The user does not exist")
    }
}

export const isClient = async (uid = " ") =>{
    const existe = await User.findById(uid)
    if(!existe){
        throw new Error("The client does not exist")
    }
    if(existe.rol !== "CLIENT" && existe.rol !== "ADMIN" && existe.rol !== "ADMIN"){
        throw new Error("Is not a client")
    }
}

export const isAdmin = async (uid = " ") =>{
    const existe = await User.findById(uid)
    console.log(existe)
    if(!existe){
        throw new Error("The admin does not exist")
    }
    if(existe.rol !== "ADMIN" ){
        throw new Error("Is not a admin")
    }
}

export const dpiExists = async (dpi = "") => {
    const existe = await User.findOne({ dpi });
    if (existe) {
        throw new Error(`El DPI ${dpi} ya está registrado`);
    }
}