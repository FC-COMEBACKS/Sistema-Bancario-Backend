import {config} from "dotenv";
import { initServer } from "./configs/server.js";
import { crearAdmin} from "./configs/adminDefault.js"
import { inicializarDivisas } from "./configs/divisasDefault.js";

config();
initServer();
crearAdmin();
inicializarDivisas();