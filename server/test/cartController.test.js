import assert from "node:assert/strict";
import test from "node:test";
import { isValidCartRequest } from "../controllers/cartController.js";

test("accepts string product IDs supported by the product schema", () => {
    assert.equal(isValidCartRequest("user-id", "shirt-blue-42", "M"), true);
});

test("rejects unsafe product IDs and invalid sizes", () => {
    for (const itemId of ["", "bad.id", "$where", "bad\u0000id", "x".repeat(129)]) {
        assert.equal(isValidCartRequest("user-id", itemId, "M"), false);
    }

    assert.equal(isValidCartRequest("user-id", "shirt-blue-42", "invalid size"), false);
});