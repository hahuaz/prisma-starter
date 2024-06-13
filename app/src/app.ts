import express from "express";

import { middleware, router, start } from "@/index";

const app = express();

middleware(app);

router(app);

start(app);
