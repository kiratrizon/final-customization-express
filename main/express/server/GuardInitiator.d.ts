// GuardInitiator.d.ts

import Guard from "./Guard";

declare class GuardInitiator {
  private guard: string;
  private driver: string;
  private model?: any;
  private table?: string;
  private driverType: string;

  constructor(guard: string);

  /**
   * Initializes the Guard class based on the configuration.
   * It creates and returns a new instance of the Guard class
   * either using a model or table depending on the driver type.
   *
   * @returns Guard The initialized Guard instance
   */
  init(): Guard;
}

export = GuardInitiator;
