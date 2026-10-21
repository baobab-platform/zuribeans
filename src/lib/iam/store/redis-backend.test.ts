// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
const mocks = vi.hoisted(() => ({ create: vi.fn() }))
vi.mock("@redis/client", () => ({ createClient: mocks.create }))
import { TlsRedisBackend } from "./redis-backend"
import { ConfidentialStoreError } from "./confidential-store"

/**
 * Resource-lifetime regression for node-redis's pre-connection metrics
 * registration. Actual TLS/ACL behaviour is covered by the real Redis suite;
 * this unit boundary makes the otherwise invisible cleanup obligation explicit.
 */
describe("Redis client failure cleanup", () => {
  it("destroys and unregisters a client after connect fails while isOpen is false", async () => {
    const client = {
      isOpen: false,
      on: vi.fn(),
      destroy: vi.fn(),
      sendCommand: vi.fn(),
      connect: vi.fn().mockRejectedValue(new Error("private-host-password-error")),
    }
    mocks.create.mockReturnValue(client)
    const backend = new TlsRedisBackend({
      host: "redis.example.test",
      port: 6380,
      username: "fixture",
      password: "test-only-password",
    })
    const error = await backend
      .execute(["GET", "zuribeans:bff:v1:fixture:session:fixture"])
      .catch((e: Error) => e)
    expect(error).toBeInstanceOf(ConfidentialStoreError)
    expect((error as Error).cause).toBeUndefined()
    expect(String(error)).not.toContain("private-")
    expect(client.destroy).toHaveBeenCalledOnce()
    expect(client.sendCommand).not.toHaveBeenCalled()
    expect(client.connect).toHaveBeenCalledOnce()
  })
})
