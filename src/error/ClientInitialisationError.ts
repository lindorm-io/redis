import { ExtendableError } from "@lindorm-io/errors";

export class ClientInitialisationError extends ExtendableError {
  public constructor() {
    super("Client initialisation error");
  }
}
