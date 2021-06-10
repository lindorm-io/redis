import { ExtendableErrorOptions } from "@lindorm-io/errors";
import { CacheError } from "./CacheError";

export class EntityNotFoundError extends CacheError {
  public constructor(message: string, options?: ExtendableErrorOptions) {
    super(message, options);
  }
}
