import assert from "node:assert/strict";
import {
  getAgeFromDob,
  isValidDni,
  isValidEmail,
  isValidPhone,
  normalizeDni,
  normalizeName,
  namesMatch,
} from "../src/scripts/inscripcion-validation.ts";

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

// Name normalization & matching tests
assert.equal(normalizeName(" Lucía   Fernández "), "lucia fernandez");
assert.equal(namesMatch("Lucía Fernández", "lucia fernandez"), true);
assert.equal(namesMatch("LUCÍA FERNÁNDEZ", "Lucia Fernandez"), true);
assert.equal(namesMatch("Fernández, Lucía", "Lucia Fernandez"), true);
assert.equal(namesMatch("Lucía Fernández", "Mateo Gómez"), false);
assert.equal(namesMatch("", "Lucía"), false);

console.log("inscripcion-validation tests passed!");
