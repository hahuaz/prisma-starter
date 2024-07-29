import * as fs from "fs";
import path from "path";

class EphemeralStorage {
  private root = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "ephemeral-storage"
  );

  public async put(
    filePath: string,
    content: string | Buffer,
    encoding?: string
  ): Promise<void> {
    filePath = this.root + "/" + filePath;

    return new Promise<void>((resolve, reject) => {
      if (!filePath?.trim()) return reject(new Error("The path is required!"));
      if (!content) return reject(new Error("The content is required!"));

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) this.createDirectory(dir);

      if (dir === filePath.trim())
        return reject(new Error("The path is invalid!"));

      fs.writeFile(
        filePath,
        content,
        { encoding } as fs.EncodingOption,
        (error) => {
          if (error) return reject(error);
          resolve();
        }
      );
    });
  }

  public createDirectory(dir: string): void {
    const splitPath = dir.split("/");
    if (splitPath.length > 20) throw new Error("The path is invalid!");

    splitPath.reduce((path, subPath) => {
      let currentPath: string;
      if (subPath !== ".") {
        currentPath = path + "/" + subPath;
        if (!fs.existsSync(currentPath)) fs.mkdirSync(currentPath);
      } else currentPath = subPath;

      return currentPath;
    }, "");
  }
}

export const ephemeralStorage = new EphemeralStorage();
