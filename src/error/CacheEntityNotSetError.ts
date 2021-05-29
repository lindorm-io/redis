import { ExtendableError } from "@lindorm-io/errors";

export class CacheEntityNotSetError extends ExtendableError {
  public constructor(key: string, result: any) {
    super("Unable to set Entity", {
      debug: { key, result },
    });
  }
}
