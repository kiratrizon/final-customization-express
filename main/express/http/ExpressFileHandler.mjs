import multer from "multer";
import Busboy from "busboy";
import fs from "fs";


class FileHandler {
  static filePath = "/tmp";

  static multer() {
    FileHandler.validatePath();
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, FileHandler.filePath);
      },
      filename: (req, file, cb) => {
        const randomString = Math.random().toString(36).substring(2, 7);
        const sanitizedFilename = FileHandler.fileSpaceCharsDevoid(
          `${FileHandler.date("Y-m-d-H-i-s")}-${randomString}-${file.originalname}`
        );
        const saveTo = `${FileHandler.filePath}/${sanitizedFilename}`;
        file.tmp_name = saveTo;
        cb(null, sanitizedFilename);
      },
    });

    const upload = multer({
      storage: storage,
      fileFilter: (req, file, cb) => {
        cb(null, true);
      },
    }).any();

    return (req, res, next) => {
      upload(req, res, (err) => {
        if (err) {
          req.files = [{ error: 1, message: err.message }];
        } else {
          req.files = (req.files || []).map((file) => ({
            ...file,
            error: 0,
          }));
        }
        next();
      });
    };
  }

  static busboy() {
    FileHandler.validatePath();

    return (req, res, next) => {
      const allowedMethods = ["POST", "PUT"];
      if (!allowedMethods.includes(req.method)) return next();

      const contentType = req.headers["content-type"] || "";
      if (!contentType.startsWith("multipart/form-data")) return next();

      const busboy = Busboy({ headers: req.headers });
      const files = [];

      busboy.on("file", (fieldname, file, filename) => {
        let fileSize = 0;
        let hasError = false;
        const arrangeFile = {};
        let originalname = "";

        if (typeof filename === "object") {
          for (const key in filename) {
            if (key === "filename") originalname = filename[key];
            else if (key === "mimeType") arrangeFile.mimetype = filename[key];
            else arrangeFile[key] = filename[key];
          }
        } else {
          originalname = filename;
        }

        const randomString = Math.random().toString(36).substring(2, 7);
        const sanitizedFilename = FileHandler.fileSpaceCharsDevoid(
          `${FileHandler.date("Y-m-d-H-i-s")}-${randomString}-${originalname}`
        );
        const saveTo = `${FileHandler.filePath}/${sanitizedFilename}`;
        const writeStream = fs.createWriteStream(saveTo);
        file.pipe(writeStream);

        file.on("data", (chunk) => {
          fileSize += chunk.length;
        });

        file.on("error", (err) => {
          hasError = true;
          files.push({ fieldname, originalname, ...arrangeFile, tmp_name: saveTo, error: 1, message: err.message });
        });

        file.on("end", () => {
          if (!hasError) {
            files.push({ fieldname, originalname, ...arrangeFile, tmp_name: saveTo, size: fileSize, error: 0 });
          }
        });
      });

      busboy.on("finish", () => {
        req.files = files.length > 0 ? files : null;
        next();
      });

      req.pipe(busboy);
    };
  }

  static useBusboy() {
    FileHandler._useBusboy = true;
  }

  static getFileHandler() {
    return FileHandler._useBusboy ? FileHandler.busboy() : FileHandler.multer();
  }

  static handleFiles(req, res, next) {
    const newData = {};
    if (req.files) {
      req.files.forEach((file) => {
        const { fieldname, originalname, mimetype, tmp_name, size, error = 0, message = "" } = file;
        newData[fieldname] = { originalname, mimetype, tmp_name, size, error, message };
      });
    }
    req.files = newData;
    next();
  }

  static validatePath() {
    if (!IN_PRODUCTION) {
      if (!fs.existsSync(FileHandler.filePath)) {
        fs.mkdirSync(FileHandler.filePath, { recursive: true });
      }
    } else {
      return true;
    }

  }

  static fileSpaceCharsDevoid(name) {
    return name.replace(/\s/g, "_");
  }

  static date(fmt) {
    const d = new Date();
    const pad = (n) => (n < 10 ? "0" + n : n);
    return fmt
      .replace("Y", d.getFullYear())
      .replace("m", pad(d.getMonth() + 1))
      .replace("d", pad(d.getDate()))
      .replace("H", pad(d.getHours()))
      .replace("i", pad(d.getMinutes()))
      .replace("s", pad(d.getSeconds()));
  }
}

export default FileHandler;
