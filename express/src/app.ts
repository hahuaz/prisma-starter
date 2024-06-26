import express from "express";

import { corsMiddleware } from "@/middleware";
import { router } from "@/router";
import { start } from "@/start";

const app = express();

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// parse application/json
app.use(express.json());
app.use(corsMiddleware);

router(app);

start(app);
console.log("Hello, world!");
