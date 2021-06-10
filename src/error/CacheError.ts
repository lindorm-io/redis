import { ExtendableError, ExtendableErrorOptions } from "@lindorm-io/errors";

export class CacheError extends ExtendableError {
  public constructor(message: string, options?: ExtendableErrorOptions) {
    super(message, options);
  }
}
