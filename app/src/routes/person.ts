import express from "express";

import prisma from "../config/prisma";

const router = express.Router();

// GET persons with a specific skill (e.g., TypeScript)
router.get("/by-skill/:skillName", async (req, res) => {
  const skillName = req.params.skillName;

  try {
    const personsWithSkill = await prisma.person.findMany({
      where: {
        skills: {
          some: {
            name: skillName,
          },
        },
      },
      include: {
        skills: true,
        organization: true,
      },
    });

    if (personsWithSkill.length === 0) {
      return res
        .status(404)
        .json({ message: "No persons with the skill found" });
    }

    res.json(personsWithSkill);
  } catch (error) {
    console.error("Error retrieving persons with the skill:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

interface CreatePersonRequest {
  name: string;
  lastName: string;
  organizationId: number;
  skills: string[]; // An array of skill names
}

// POST create a new person with organization ID from request and include skills
router.post("/", async (req, res) => {
  const { name, organizationId, skills, lastName }: CreatePersonRequest =
    req.body;

  try {
    // Check if the organization exists before creating the person
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Create the new person with the provided organization ID and skills
    const newPerson = await prisma.person.create({
      data: {
        name,
        lastName,
        organization: {
          connect: {
            id: organizationId,
          },
        },
        skills: {
          create: skills.map((skillName) => ({
            name: skillName,
          })),
        },
      },
      include: {
        skills: true,
        organization: true,
      },
    });

    res.status(201).json(newPerson);
  } catch (error) {
    console.error("Error creating person:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE a person by ID
router.delete("/:personId", async (req, res) => {
  const personId = parseInt(req.params.personId);

  // junction table _PersonToSkill will be updated automatically by prisma
  try {
    const deletedPerson = await prisma.person.delete({
      where: {
        id: personId,
      },
    });

    if (!deletedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.json(deletedPerson);
  } catch (error) {
    console.error("Error deleting person:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
