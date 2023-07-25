import express from "express";

import prisma from "../config/db";

const router = express.Router();

// GET all organizations
router.get("/", async (req, res) => {
  const organizations = await prisma.organization.findMany({
    include: { services: true, employees: true },
  });
  console.log(organizations);
  res.json(organizations);
});

// GET a specific organization by ID
router.get("/:organizationId", async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { services: true, employees: true },
  });
  console.log(organization);
  res.json(organization);
});

// POST endpoint to create a new organization
router.post("/", async (req, res) => {
  try {
    const { name, employees, services } = req.body;

    const newOrganization = await prisma.organization.create({
      data: {
        name,
        employees: {
          create: employees,
        },
        services: {
          create: services,
        },
      },
      include: { services: true, employees: true },
    });

    console.log(newOrganization);
    res.json(newOrganization);
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST endpoint to create a new service for a specific organization
router.post("/:id/services", async (req, res) => {
  try {
    const organizationId = parseInt(req.params.id);
    const { name } = req.body;

    const newService = await prisma.service.create({
      data: {
        name,
        organization: { connect: { id: organizationId } },
      },
    });

    console.log(newService);
    res.json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST endpoint to create a new employee for a specific organization
router.post("/:id/employee", async (req, res) => {
  try {
    const organizationId = parseInt(req.params.id);
    const { name } = req.body;

    const newEmployee = await prisma.person.create({
      data: {
        name,
        organization: { connect: { id: organizationId } },
      },
    });

    console.log(newEmployee);
    res.json(newEmployee);
  } catch (error) {
    console.error("Error creating newEmployee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE endpoint to drop an organization by ID
router.delete("/:id", async (req, res) => {
  const organizationId = parseInt(req.params.id);

  try {
    // Delete the organization along with its associated services and persons
    const deletedOrganization = await prisma.organization.delete({
      where: { id: organizationId },
      include: { services: true, employees: true },
    });

    console.log(deletedOrganization);
    res.json(deletedOrganization);
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
