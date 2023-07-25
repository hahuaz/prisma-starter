import express, { Application } from "express";

import {
  organizationRouter,
  personRouter,
  serviceRouter,
  skillRouter,
} from "./routes";
import prisma from "./config/db";

const app: Application = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (_req, res) => {
  res.send("Hello World!");
});
app.use("/services", serviceRouter);
app.use("/organizations", organizationRouter);
app.use("/skills", skillRouter);
app.use("/persons", personRouter);

async function deleteAllData() {
  try {
    // Delete all records from the "Skill" model
    await prisma.skill.deleteMany();

    // Delete all records from the "Person" model
    await prisma.person.deleteMany();

    // Delete all records from the "Service" model
    await prisma.service.deleteMany();

    // Delete all records from the "Organization" model
    await prisma.organization.deleteMany();

    console.log("All data has been deleted from the database.");
  } catch (error) {
    console.error("Error deleting data:", error);
  }
}
// deleteAllData();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
