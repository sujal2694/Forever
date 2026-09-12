// One-time data migration — converts legacy sizes like ["S", "L"]
// into the current schema shape [{ size: "S", stock: 10 }, { size: "L", stock: 10 }].
//
// SAFE BY DEFAULT: running this with no arguments only PRINTS what it would
// change. Nothing is written to your database until you pass --apply.
//
// Usage (run from inside the server/ folder, where your .env lives):
//   node scripts/migrateLegacySizes.js            <- dry run, no changes made
//   node scripts/migrateLegacySizes.js --apply     <- actually writes the fix
//
// Uses the native MongoDB driver (not the productModel/Mongoose schema) for
// both reading and writing, deliberately bypassing Mongoose's schema casting —
// that casting is exactly what silently drops legacy string sizes on read.

import "dotenv/config";
import mongoose from "mongoose";

const VALID_SIZES = ["S", "M", "L", "XL", "XXL"];
const DEFAULT_STOCK = 10;
const APPLY = process.argv.includes("--apply");

const buildNewSizes = (rawSizes) => {
    if (!Array.isArray(rawSizes)) return { newSizes: [], skippedInvalid: [] };

    const seen = new Map(); // uppercase size -> { size, stock }
    const skippedInvalid = [];

    for (const entry of rawSizes) {
        let size;
        let stock;

        if (typeof entry === "string") {
            size = entry.trim().toUpperCase();
            stock = DEFAULT_STOCK;
        } else if (entry && typeof entry === "object") {
            size = String(entry.size || "").trim().toUpperCase();
            stock = Number.isInteger(entry.stock) && entry.stock >= 0 ? entry.stock : DEFAULT_STOCK;
        } else {
            skippedInvalid.push(entry);
            continue;
        }

        if (!VALID_SIZES.includes(size)) {
            skippedInvalid.push(entry);
            continue;
        }

        // Keep the highest stock if the same size appears twice (defensive; shouldn't normally happen)
        if (!seen.has(size) || seen.get(size).stock < stock) {
            seen.set(size, { size, stock });
        }
    }

    return { newSizes: Array.from(seen.values()), skippedInvalid };
};

const alreadyMigrated = (rawSizes) =>
    Array.isArray(rawSizes) &&
    rawSizes.length > 0 &&
    rawSizes.every(
        (entry) =>
            entry &&
            typeof entry === "object" &&
            VALID_SIZES.includes(String(entry.size || "").toUpperCase()) &&
            Number.isInteger(entry.stock) &&
            entry.stock >= 0
    );

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to: ${mongoose.connection.name}`);
    console.log(`Mode: ${APPLY ? "APPLY (writing changes)" : "DRY RUN (no changes will be made)"}\n`);

    const collection = mongoose.connection.db.collection("products");
    const products = await collection.find({}).toArray();

    console.log(`Total products: ${products.length}\n`);

    let toMigrate = 0;
    let alreadyOk = 0;
    let needsManualReview = [];

    for (const product of products) {
        if (alreadyMigrated(product.sizes)) {
            alreadyOk += 1;
            continue;
        }

        const { newSizes, skippedInvalid } = buildNewSizes(product.sizes);

        if (newSizes.length === 0) {
            needsManualReview.push({ id: product._id, name: product.name, rawSizes: product.sizes });
            continue;
        }

        toMigrate += 1;
        console.log(
            `${APPLY ? "Updating" : "Would update"}: "${product.name}" (${product._id})\n` +
            `  before: ${JSON.stringify(product.sizes)}\n` +
            `  after:  ${JSON.stringify(newSizes)}` +
            (skippedInvalid.length > 0 ? `\n  ignored invalid entries: ${JSON.stringify(skippedInvalid)}` : "")
        );

        if (APPLY) {
            await collection.updateOne({ _id: product._id }, { $set: { sizes: newSizes } });
        }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Already in correct format: ${alreadyOk}`);
    console.log(`${APPLY ? "Migrated" : "Would migrate"}: ${toMigrate}`);
    console.log(`Needs manual review (no recognizable sizes at all): ${needsManualReview.length}`);

    if (needsManualReview.length > 0) {
        console.log(`\nThese products have no usable size data and were left untouched.`);
        console.log(`You'll need to add sizes to them yourself via the admin panel:`);
        needsManualReview.forEach((p) => console.log(`  - ${p.id}  "${p.name}"  raw sizes: ${JSON.stringify(p.rawSizes)}`));
    }

    if (!APPLY && toMigrate > 0) {
        console.log(`\nThis was a dry run — nothing was changed.`);
        console.log(`Re-run with --apply once this output looks correct:`);
        console.log(`  node scripts/migrateLegacySizes.js --apply`);
    }

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});