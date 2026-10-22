function readPort(value: string | undefined): number {
  const port = Number(value ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer from 1 to 65535; received: ${value}`);
  }
  return port;
}

export const config = { port: readPort(Bun.env.PORT) };
