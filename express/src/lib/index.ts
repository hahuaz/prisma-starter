import prisma from "@/config/prisma";

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
