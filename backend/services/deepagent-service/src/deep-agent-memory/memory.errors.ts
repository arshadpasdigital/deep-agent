export type MemoryOperation =
  | "initialize"
  | "checkpoint"
  | "store"
  | "get"
  | "upsert"
  | "delete"
  | "search"
  | "close";

export class MemoryError extends Error {
  readonly operation: MemoryOperation;

  constructor(message: string, operation: MemoryOperation, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "MemoryError";
    this.operation = operation;
  }
}

export class MemoryIdentityError extends MemoryError {
  readonly field: string;

  constructor(field: string) {
    super(`Missing memory identifier: ${field}`, "store");
    this.name = "MemoryIdentityError";
    this.field = field;
  }
}
