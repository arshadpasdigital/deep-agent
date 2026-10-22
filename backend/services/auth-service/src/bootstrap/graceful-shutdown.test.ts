import { EventEmitter, once } from "node:events";
import { describe, expect, test } from "bun:test";
import express from "express";
import { createApp } from "./app.ts";
import { installGracefulShutdown } from "./graceful-shutdown.ts";

const logger = { info() {}, error() {} };

describe("Auth Service shutdown", () => {
  test("stops accepting requests and waits for an in-flight response", async () => {
    let markStarted;
    let releaseRequest;
    const started = new Promise((resolve) => (markStarted = resolve));
    const requestGate = new Promise((resolve) => (releaseRequest = resolve));
    const router = express.Router();
    router.get("/slow", async (_request, response) => {
      markStarted();
      await requestGate;
      response.send("drained");
    });

    const server = createApp({ featureRouter: router }).listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind a TCP port");
    const signals = new EventEmitter();
    let resolveExit;
    const exited = new Promise((resolve) => (resolveExit = resolve));
    const removeHandlers = installGracefulShutdown(server, {
      signals,
      onExit: resolveExit,
      logger,
      timeoutMs: 500,
    });
    const responsePromise = fetch(`http://127.0.0.1:${address.port}/api/v1/auth/slow`);

    try {
      await started;
      signals.emit("SIGTERM");
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(server.listening).toBe(false);
      releaseRequest();
      const response = await responsePromise;
      expect(await response.text()).toBe("drained");
      expect(await exited).toBe(0);
    } finally {
      removeHandlers();
      releaseRequest();
      if (server.listening) {
        server.close();
        await once(server, "close");
      }
    }
  });

  test("forces exit when the drain deadline expires", async () => {
    const signals = new EventEmitter();
    let resolveExit;
    const exited = new Promise((resolve) => (resolveExit = resolve));
    const removeHandlers = installGracefulShutdown({ close() {} }, {
      signals,
      onExit: resolveExit,
      logger,
      timeoutMs: 25,
    });
    signals.emit("SIGINT");
    try {
      expect(await exited).toBe(1);
    } finally {
      removeHandlers();
    }
  });
});
