"use strict";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";   
import { dbConnection } from "./mongo.js";
import { swaggerDocs, swaggerUi } from "./swagger.js";
import  apiLimiter from "../src/middlewares/rate-limit-validator.js";
import authRoutes from "../src/auth/auth.routes.js";
import userRoutes from "../src/user/user.routes.js";
import cuentaRoutes from "../src/Cuenta/cuenta.routes.js";
import productoServicioRoutes from "../src/ProductoServicio/productoServicio.routes.js";
import favoritoRoutes from "../src/Favorito/favorito.routes.js";
import movimientoRoutes from "../src/Movimiento/movimiento.routes.js";
import divisaRoutes from "../src/divisas/divisa.routes.js";
import estadisticasRoutes from "../src/estadisticas/estadisticas.routes.js";
import { programarActualizacionDivisas } from "../src/divisas/divisa.controller.js";


const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(apiLimiter);
}

const routes = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    app.use("/HRB/v1/auth", authRoutes);
    app.use("/HRB/v1/users", userRoutes);
    app.use("/HRB/v1/cuentas", cuentaRoutes);
    app.use("/HRB/v1/productosOServicios", productoServicioRoutes);
    app.use("/HRB/v1/favoritos", favoritoRoutes);
    app.use("/HRB/v1/movimientos", movimientoRoutes);
    app.use("/HRB/v1/divisas", divisaRoutes);
    app.use("/HRB/v1/estadisticas", estadisticasRoutes);

}

const conectarDB = async () => {
    try {
        await dbConnection();
        programarActualizacionDivisas();
    } catch (err) {
        console.log(`Database connection failed: ${err}`);
        process.exit(1);
    }
};

export const initServer = () => {
    const app = express();
    try {
        middlewares(app);
        conectarDB();
        routes(app);
        const port = process.env.PORT; 
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.log(`Server init failed: ${err}`);
    }
};