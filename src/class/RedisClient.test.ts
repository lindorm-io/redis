import { RedisClient } from "./RedisClient";
import { stringifyBlob } from "@lindorm-io/string-blob";

const mockDel = jest.fn((key: string, cb: any): void => {
  cb(null, 1);
});
const mockGet = jest.fn((key: string, cb: any): void => {
  cb(null, stringifyBlob({ key, mock: "blob", data: 12345 }));
});
const mockKeys = jest.fn((pattern: string, cb: any): void => {
  cb(null, ["key1", "key2"]);
});
const mockQuit = jest.fn((cb: any): void => {
  cb(null, "OK");
});
const mockSet = jest.fn((key: string, val: string, cb: any): void => {
  cb(null, "OK");
});
const mockSetex = jest.fn((key: string, val: string, num: number, cb: any): void => {
  cb(null, "OK");
});

jest.mock("redis", () => ({
  createClient: () => ({
    del: mockDel,
    get: mockGet,
    keys: mockKeys,
    quit: mockQuit,
    set: mockSet,
    setex: mockSetex,
  }),
}));

describe("RedisClient", () => {
  let client: RedisClient;

  beforeEach(async () => {
    client = new RedisClient({ port: 1 });
    await client.connect();
  });

  afterEach(jest.clearAllMocks);

  test("should disconnect", async () => {
    await client.quit();

    expect(mockQuit).toHaveBeenCalled();
  });

  test("should set", async () => {
    await expect(client.set("key", { mock: "mock" })).resolves.toBe("OK");
    expect(mockSet).toHaveBeenCalledWith(
      "key",
      '{"json":{"mock":"mock"},"meta":{"mock":"string"}}',
      expect.any(Function),
    );
  });

  test("should set with expiry", async () => {
    await expect(client.set("key", { mock: true }, 100)).resolves.toBe("OK");
    expect(mockSetex).toHaveBeenCalledWith(
      "key",
      100,
      '{"json":{"mock":"true"},"meta":{"mock":"boolean"}}',
      expect.any(Function),
    );
  });

  test("should get", async () => {
    await expect(client.get("key")).resolves.toMatchSnapshot();
    expect(mockGet).toHaveBeenCalledWith("key", expect.any(Function));
  });

  test("should get all", async () => {
    await expect(client.getAll("pattern*")).resolves.toMatchSnapshot();
  });

  test("should delete", async () => {
    await expect(client.del("key")).resolves.toBe(1);
    expect(mockDel).toHaveBeenCalledWith("key", expect.any(Function));
  });
});
