import assert from "node:assert/strict";
import {
  MAX_CERT_FILE_BYTES,
  getAgeFromDob,
  isValidDni,
  isValidEmail,
  isValidPhone,
  normalizeDni,
} from "../src/scripts/inscripcion-validation.ts";

assert.equal(MAX_CERT_FILE_BYTES, 8 * 1024 * 1024);
assert.equal(normalizeDni("43.123.456"), "43123456");
assert.equal(isValidDni("43123456"), true);
assert.equal(isValidDni("123456"), false);
assert.equal(isValidDni("1234567890"), false);

assert.equal(isValidEmail("juan@ejemplo.com"), true);
assert.equal(isValidEmail("hola"), false);
assert.equal(isValidEmail("a@b"), false);

assert.equal(isValidPhone("2615551234"), true);
assert.equal(isValidPhone("12345"), false);

const ref = new Date("2026-11-25T00:00:00Z");
assert.equal(getAgeFromDob("2000-01-01", ref), 26);
assert.equal(getAgeFromDob("2008-11-25", ref), 18);
assert.equal(getAgeFromDob("2008-11-26", ref), 17);
assert.equal(getAgeFromDob("invalid", ref), null);
assert.equal(getAgeFromDob("2000-99-99", ref), null);

console.log("inscripcion-validation tests passed!");
