import express from "express";

import prisma from "../config/prisma";

const router = express.Router();

// GET all skills
router.get("/", async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        persons: true,
      },
    });
    res.json(skills);
  } catch (error) {
    console.error("Error retrieving skills:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET skill by ID
router.get("/:skillId", async (req, res) => {
  const skillId = parseInt(req.params.skillId);

  try {
    const skill = await prisma.skill.findUnique({
      where: {
        id: skillId,
      },
      include: {
        persons: true,
      },
    });

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.json(skill);
  } catch (error) {
    console.error("Error retrieving skill:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create a new skill
router.post("/", async (req, res) => {
  const { name } = req.body;

  try {
    const skill = await prisma.skill.create({
      data: {
        name,
      },
    });
    res.status(201).json(skill);
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
