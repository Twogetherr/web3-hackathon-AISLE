export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  /**
   * Creates a typed application error for structured API responses.
   *
   * @param code The stable machine-readable error code.
   * @param message The human-readable error message.
   * @param statusCode The HTTP status code for the error.
   * @returns A new application error instance.
   * @throws Never.
   */
  public constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
