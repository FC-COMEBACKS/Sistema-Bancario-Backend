import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options ={
    swaggerDefinition:{
        openapi:"3.0.0",
        info:{
            title: "Hacker Rank Bank API",
            version: "1.0.0",
            description: "API para un sistema bancario",
            contact:{
                name: "FCComebacks",
                email: "FCComebacks@gmail.com"
            }
        },
        servers:[
            {
                url: "http://127.0.0.1:3000/HRB/v1"
            }
        ]
    },
    apis:[
        "./src/auth/auth.routes.js",
        "./src/user/user.routes.js",
        "./src/Cuenta/cuenta.routes.js",
        "./src/Favorito/favorito.routes.js",
        "./src/Movimiento/movimiento.routes.js",
        "./src/ProductoServicio/productoServicio.routes.js",
        "./src/divisas/divisa.routes.js",
        "./src/estadisticas/estadisticas.routes.js"
    ]
}

const swaggerDocs = swaggerJSDoc(options)

export { swaggerDocs, swaggerUi}
