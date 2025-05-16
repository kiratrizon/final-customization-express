// GuardInitiator.d.ts

import Guard from "./Guard";

declare class GuardInitiator {
  constructor(guard: string);

  /**
   * Initializes the Guard class based on the configuration.
   * It creates and returns a new instance of the Guard class
   * either using a model or table depending on the driver type.
   *
   * @returns Guard The initialized Guard instance
   */
  init(): InstanceType<typeof Guard>;
}

export default GuardInitiator;
