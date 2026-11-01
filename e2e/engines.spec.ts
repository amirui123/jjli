import { expect, test } from "@playwright/test";
import {
  cleanupPersianText,
  generateIranianShebaFromBban,
  generateShebaFromCard,
  validateIranianSheba,
} from "../src/engines/persianEngines";

test.describe("Persian engine regressions", () => {
  test("joins Persian prefixes and suffixes and normalizes Arabic forms", () => {
    const result = cleanupPersianText("می خواهم کتاب ها را برای كودکان بنویسم 123");
    expect(result.cleaned).toBe("می‌خواهم کتاب‌ها را برای کودکان بنویسم ۱۲۳");
    expect(result.fixesCount).toBeGreaterThan(0);
  });

  test("generates and validates a 26-character Iranian IBAN from a real BBAN", () => {
    const bban = "0561234567890123456789";
    const iban = generateIranianShebaFromBban(bban);
    expect(iban).toMatch(/^IR\\d{24}$/);
    expect(iban).toHaveLength(26);
    expect(validateIranianSheba(iban)).toBe(true);
    expect(validateIranianSheba(`${iban.slice(0, -1)}0`)).toBe(false);
  });

  test("refuses to fabricate an IBAN from a card number", () => {
    expect(() => generateShebaFromCard("6037991234567890")).toThrow();
  });
});
