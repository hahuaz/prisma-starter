import axios from "axios";
import { exec } from "child_process";
import yargs from "yargs";

export class VersionCommand implements yargs.CommandModule {
  public command = "version";
  public describe = "Prints Application version.";

  public async handler() {
    console.log(process.env.npm_package_version);
  }
}

export class CheckUnstagedCommand implements yargs.CommandModule {
  public command = "check-unstaged";
  public describe = "Checks for unstaged changes in the Git repository.";

  public handler() {
    exec("git status --porcelain", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error checking unstaged changes: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error: ${stderr}`);
        return;
      }

      const unstagedFiles = stdout.trim();
      if (unstagedFiles === "") {
        console.log("No unstaged changes.");
      } else {
        console.log("There are unstaged changes.");
        console.log(
          unstagedFiles
            .split("\n")
            .map((line) => line.trim())
            .join("\n")
        );
      }
    });
  }
}

export class IsHealthyCommand implements yargs.CommandModule {
  public command = "is-healthy";
  public describe =
    "Checks if the API is healthy by sending a request to /api/ping.";

  public async handler() {
    try {
      const response = await axios.get("http://localhost:3000/api/ping");
      if (response.status === 200) {
        console.log("API is healthy.");
      } else {
        console.log(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          `API health check failed with status code: ${error.response.status}`
        );
      } else {
        console.error(`API health check failed: ${error.message}`);
      }
    }
  }
}

yargs
  .usage("Usage: cli <command> [options]")
  .command(new VersionCommand())
  .command(new CheckUnstagedCommand())
  .command(new IsHealthyCommand())
  .demandCommand(1, "Please provide a valid command.")
  .strict()
  .help("help")
  .alias("help", "h").argv;
