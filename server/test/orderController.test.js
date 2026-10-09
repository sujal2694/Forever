import assert from "node:assert/strict";
import test from "node:test";
import {
    isAllowedCheckoutOrigin,
    isValidOrderItem,
} from "../controllers/orderController.js";

test("accepts an order item with a custom string product ID", () => {
    assert.equal(isValidOrderItem({ product: "aaaaa", size: "M", quantity: 1 }), true);
});

test("rejects order items with missing or invalid fields", () => {
    assert.equal(isValidOrderItem({ product: "bad.id", size: "M", quantity: 1 }), false);
    assert.equal(isValidOrderItem({ product: "aaaaa", size: "", quantity: 1 }), false);
    assert.equal(isValidOrderItem({ product: "aaaaa", size: "M", quantity: 0 }), false);
});

test("allows a configured checkout origin with a trailing slash", () => {
    assert.equal(
        isAllowedCheckoutOrigin("https://shop.example.com", ["https://shop.example.com/"]),
        true
    );
});

test("rejects checkout origins that are malformed or include a path", () => {
    const allowedOrigins = ["https://shop.example.com"];
    assert.equal(isAllowedCheckoutOrigin("https://shop.example.com.attacker.test", allowedOrigins), false);
    assert.equal(isAllowedCheckoutOrigin("https://shop.example.com/path", allowedOrigins), false);
    assert.equal(isAllowedCheckoutOrigin("not-a-url", allowedOrigins), false);
});