import request from "supertest";
import { app } from "../src/server";

describe("GET /api/validate-users", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
    // Mock fetch to always return success (names are normalized before sending)
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: "Valid name" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    ) as jest.Mock;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should validate all users successfully", async () => {
    const response = await request(app).get("/api/validate-users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ validated: 9 });
  }, 30000);
});
