export const logger = {
  error: (): void => undefined,
  warn: (): void => undefined,
  info: (): void => undefined,
  verbose: (): void => undefined,
  debug: (): void => undefined,
  silly: (): void => undefined,
  createChildLogger: (): any => logger,
};
