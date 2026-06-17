import { Before, Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import request from "supertest";

import { createOrderApp } from "../../src/app.ts";

let app;
let response;

Before(() => {
  app = createOrderApp();
});

Given("the order API is available", () => {
  assert.ok(app);
});

When("I submit an order for {string} with items:", async (customerName, table) => {
  const items = table.raw().map(([item]) => item);

  response = await request(app).post("/orders").send({ customerName, items });
});

Then("the response status should be {int}", (statusCode) => {
  assert.equal(response.status, statusCode);
});

Then("the created order priority should be {string}", (priority) => {
  assert.equal(response.body.priority, priority);
});