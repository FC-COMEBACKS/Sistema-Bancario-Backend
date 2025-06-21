import { Router } from "express";
import {
    getUserById,
    getUsers,
    deleteUserAdmin,
    deleteUserClient,
    updatePassword,
    updateUserAdmin,
    updateUserUser,
    updateRole
} from "./user.controler.js";
import {
    getUserByIdValidator,
    updateUserValidatorAdmin,
    updateUserValidatorClient,
    deleteUserValidatorAdmin,
    deleteUserValidatorClient,
    updatePasswordValidator,
    updateRoleValidator
} from "../middlewares/user-validator.js";

const router = Router();

router.get("/:uid", getUserByIdValidator, getUserById);

router.get("/", getUsers);

router.delete("/admin/:uid", deleteUserValidatorAdmin, deleteUserAdmin);

router.delete("/client", deleteUserValidatorClient, deleteUserClient);

router.patch("/password", updatePasswordValidator, updatePassword);

router.put("/admin/:uid", updateUserValidatorAdmin, updateUserAdmin);

router.put("/client", updateUserValidatorClient, updateUserUser);

router.patch("/role/:uid", updateRoleValidator, updateRole);

export default router;