export const isSafeProductId = (value) =>
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    value.trim() === value &&
    !/[.$\u0000-\u001f\u007f]/.test(value);