import {config} from "dotenv";
import { initServer } from "./configs/server.js";
import { crearAdmin} from "./configs/adminDefault.js"

config();
initServer();
crearAdmin()