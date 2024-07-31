import cron from "node-cron";
import os from "os";

function getCPUUsage() {
  const cpus = os.cpus();
  return cpus.map((cpu, index) => {
    const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
    const percentage = (100 * cpu.times.user) / total;
    return `CPU ${index + 1}: ${percentage.toFixed(2)}%`;
  });
}

function getMemoryUsage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  return {
    totalMemory: (totalMemory / (1024 * 1024)).toFixed(2) + " MB",
    usedMemory: (usedMemory / (1024 * 1024)).toFixed(2) + " MB",
    freeMemory: (freeMemory / (1024 * 1024)).toFixed(2) + " MB",
    usagePercentage: ((usedMemory / totalMemory) * 100).toFixed(2) + "%",
  };
}

// Schedule the cron job to run every minute
cron.schedule("* * * * *", () => {
  console.log(`Task running at ${new Date().toLocaleString()}`);

  const cpuUsages = getCPUUsage();
  console.log("CPU Usage:");
  cpuUsages.forEach((usage) => console.log(usage));

  const memoryUsage = getMemoryUsage();
  console.log("Memory Usage:");
  console.log(`Total Memory: ${memoryUsage.totalMemory}`);
  console.log(`Used Memory: ${memoryUsage.usedMemory}`);
  console.log(`Free Memory: ${memoryUsage.freeMemory}`);
  console.log(`Usage Percentage: ${memoryUsage.usagePercentage}`);
});
