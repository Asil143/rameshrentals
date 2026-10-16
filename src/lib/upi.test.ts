import { describe, expect, it } from "vitest";
import { upiPaymentUri } from "./upi";

describe("upiPaymentUri", () => {
  it("builds a upi://pay link with amount, currency and note", () => {
    expect(upiPaymentUri({ upiId: "ramesh@okaxis", payee: "Ramesh Rentals", amount: 500, note: "RR-4390C68085" })).toBe(
      "upi://pay?pa=ramesh%40okaxis&pn=Ramesh%20Rentals&am=500.00&cu=INR&tn=RR-4390C68085"
    );
  });

  it("always sends two decimal places", () => {
    expect(upiPaymentUri({ upiId: "a@b", payee: "x", amount: 1234.5, note: "n" })).toContain("am=1234.50");
  });

  it("encodes characters that would break the link", () => {
    const uri = upiPaymentUri({ upiId: "a@b", payee: "R & R Rentals", amount: 1, note: "a=b&c" });
    expect(uri).toContain("pn=R%20%26%20R%20Rentals");
    expect(uri).toContain("tn=a%3Db%26c");
  });
});
