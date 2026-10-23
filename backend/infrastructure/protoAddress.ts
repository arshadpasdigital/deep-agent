const PROTO_DIRECTORY = "/backend/packages/proto";

/** Resolve a proto filename against the shared backend proto directory. */
export function getProtoAddress(fileName: string): string {
  return `${PROTO_DIRECTORY}/${fileName.replace(/^\/+/, "")}`;
}
