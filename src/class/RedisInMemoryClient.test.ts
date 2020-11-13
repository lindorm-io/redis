import { RedisInMemoryClient } from "./RedisInMemoryClient";

describe("RedisInMemoryClient", () => {
  let client: RedisInMemoryClient;

  beforeEach(async () => {
    client = new RedisInMemoryClient();
    await client.connect();
  });

  test("should quit", async () => {
    await expect(client.quit()).resolves.toBe("OK");
  });

  test("should set", async () => {
    await expect(client.set("key", { blob: { object: { is: true } } })).resolves.toBe("OK");
    expect(client.cache).toMatchSnapshot();
  });

  test("should get", async () => {
    await expect(client.set("key", { blob: "yes" })).resolves.toBe("OK");

    await expect(client.get("key")).resolves.toMatchSnapshot();
  });

  test("should get all", async () => {
    await expect(client.set("key1", { blob: "yes" })).resolves.toBe("OK");
    await expect(client.set("key2", { blob: "no" })).resolves.toBe("OK");

    await expect(client.getAll("key*")).resolves.toMatchSnapshot();
  });

  test("should delete", async () => {
    await expect(client.set("key", { blob: "yes" })).resolves.toBe("OK");

    await expect(client.del("key")).resolves.toBe(1);
    expect(client.cache).toMatchSnapshot();
  });
});
