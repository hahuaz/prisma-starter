import express from "express";

import prisma from "../config/prisma";
import redis from "../config/redis";

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
  const takeCount = parseInt(req.query.take as string) || 5;

  const REDIS_HASH_KEY = `services`;
  const REDIS_HASH_FIELD = `${serviceName}:${takeCount}`;

  try {
    const cachedServices = await redis.hGet(REDIS_HASH_KEY, REDIS_HASH_FIELD);
    if (cachedServices) {
      console.log("cachedServices", cachedServices);

      const parsedServices = JSON.parse(cachedServices);
      res.json(parsedServices);
      return;
    }

    const services = await prisma.service.findMany({
      where: {
        name: serviceName,
      },
      include: {
        organization: true,
      },
      orderBy: {
        price: "asc",
      },
      take: takeCount,
    });
    await redis.hSet(
      REDIS_HASH_KEY,
      REDIS_HASH_FIELD,
      JSON.stringify(services)
    );
    redis.expire(REDIS_HASH_KEY, 86400); // 24 hours

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

    await invalidateServicesCache();

    console.log(deletedService);
    res.json(deletedService);
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST endpoint to create a new service for a specific organization
router.post("/", async (req, res) => {
  try {
    const { name, organizationId } = req.body;
    if (!name || !organizationId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const newService = await prisma.service.create({
      data: {
        name,
        organization: { connect: { id: organizationId } },
      },
    });

    await invalidateServicesCache();

    console.log(newService);
    res.json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const invalidateServicesCache = async () => {
  const REDIS_HASH_KEY = `services`;
  await redis.del(REDIS_HASH_KEY);
  return;
};

export default router;
