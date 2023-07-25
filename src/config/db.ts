import { PrismaClient } from "@prisma/client";

console.log("Connecting to database");
const prisma = new PrismaClient();

export default prisma;
