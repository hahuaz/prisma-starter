import express from "express";

import prisma from "../config/db";

const router = express.Router();

// get all services
router.get("/", async (req, res) => {
  const services = await prisma.service.findMany({
    include: {
      organization: true,
    },
  });
  console.log(services);
  res.json(services);
});

// get all unique service names
router.get("/unique-service-names", async (req, res) => {
  const uniqueServiceNames = await prisma.service.findMany({
    select: {
      name: true,
    },
    distinct: ["name"],
  });
  console.log(uniqueServiceNames);
  res.json(uniqueServiceNames);
});

// get a specific service by ID
router.get("/:serviceId", async (req, res) => {
  const serviceId = parseInt(req.params.serviceId);

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      organization: true,
    },
  });
  console.log(service);
  res.json(service);
});

// get services by service name in ascending order of price
router.get("/byname/:serviceName", async (req, res) => {
  const serviceName = req.params.serviceName;

  try {
    const services = await prisma.service.findMany({
      where: {
        name: serviceName,
      },
      include: {
        organization: true,
      },
      orderBy: {
        price: "asc", // Specify 'asc' for ascending order or 'desc' for descending order
      },
    });
    console.log(services);
    res.json(services);
  } catch (error) {
    console.error("Error retrieving services by name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE endpoint to drop a service by ID
router.delete("/:id", async (req, res) => {
  const serviceId = parseInt(req.params.id);

  try {
    const deletedService = await prisma.service.delete({
      where: { id: serviceId },
    });
    console.log(deletedService);
    res.json(deletedService);
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
