import express from "express";

import { setupRouter } from "@/router";
import { start } from "@/start";

const app = express();

setupRouter(app);

start(app);
