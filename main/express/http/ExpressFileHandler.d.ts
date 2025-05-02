// FileHandler.d.ts

import { Request, Response, NextFunction } from "express";

declare class FileHandler {
  static filePath: string;
  private static _useBusboy: boolean;

  /**
   * Returns a Multer middleware handler
   */
  static multer(): (req: Request, res: Response, next: NextFunction) => void;

  /**
   * Returns a Busboy middleware handler
   */
  static busboy(): (req: Request, res: Response, next: NextFunction) => void;

  /**
   * Enables the usage of Busboy instead of Multer
   */
  static useBusboy(): void;

  /**
   * Returns the appropriate file handler middleware based on useBusboy setting
   */
  static getFileHandler(): (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;

  /**
   * Rewrites req.files to a simplified object keyed by field name
   */
  static handleFiles(req: Request, res: Response, next: NextFunction): void;

  /**
   * Ensures filePath directory exists
   */
  static validatePath(): void;

  /**
   * Replaces space characters in a filename with underscores
   */
  static fileSpaceCharsDevoid(name: string): string;

  /**
   * Returns a formatted timestamp string
   * @param fmt Format like "Y-m-d-H-i-s"
   */
  static date(fmt: string): string;
}

export = FileHandler;
