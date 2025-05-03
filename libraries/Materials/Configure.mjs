import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Configure {
  static storedData = {};
  static basePath = path.join(__dirname, "..", "..", "config");

  static async read(pathString) {
    let keys = pathString.split(".").map((key) => {
      const parsed = Number(key);
      return Number.isInteger(parsed) ? parsed : key;
    });

    let basePath = Configure.basePath;
    let configData = null;

    if (keys.length) {
      const firstKey = String(keys.shift());
      const pathJs = path.join(basePath, firstKey);
      if (!keys.length && Configure.storedData[firstKey]) {
        return Configure.storedData[firstKey];
      }

      // Dynamically import the JS file instead of require
      if (fs.existsSync(pathJs + '.mjs')) {
        const module = await import(pathToFileURL(pathJs + '.mjs').href);  // Use dynamic import
        Configure.storedData[firstKey] = module;
        configData = Configure.storedData[firstKey].default;
      }

      keys.forEach((key) => {
        if (!Array.isArray(configData) && typeof key === "number") {
          key = key.toString();
        }
        if (configData && configData[key]) {
          configData = configData[key];
        } else {
          configData = null;
          return;
        }
      });
    }

    return configData;
  }

  static async write(pathString, data) {
    let keys = pathString.split(".").map((key) => {
      const parsed = Number(key);
      return Number.isInteger(parsed) ? parsed : key;
    });

    if (!keys.length) return;

    const firstKey = String(keys.shift());

    // If firstKey still doesn't exist in storedData after reading, throw an error
    if (await (Configure.read(firstKey)) === undefined) {
      console.warn(
        `Warning: "${firstKey}" does not exist in config path.`
      );
      return;
    }

    let current = Configure.storedData[firstKey];

    // Traverse the keys
    keys.forEach((key, index) => {
      const isLastKey = index === keys.length - 1;
      const keyToUse =
        typeof key === "number" || Array.isArray(current) ? key : String(key);

      if (isLastKey) {
        // Assign the final value
        current[keyToUse] = data;
      } else {
        // Initialize the key if it doesn't exist
        if (!(keyToUse in current) || typeof current[keyToUse] !== "object") {
          current[keyToUse] = {};
        }
        current = current[keyToUse]; // Move deeper
      }
    });
  }
}

export default Configure;
