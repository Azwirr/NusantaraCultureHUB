import { describe, expect, it } from "vitest";

import { callbackErrorFromParam, callbackFailure } from "../../src/lib/auth-callback";

describe("callbackFailure", () => {
  it("reports a declined Google consent as cancelled", () => {
    expect(callbackFailure("google", "access_denied")).toBe("oauth_cancelled");
  });

  it("reports any other Google problem as failed", () => {
    expect(callbackFailure("google", "server_error")).toBe("oauth_failed");
    expect(callbackFailure("google", null)).toBe("oauth_failed");
  });

  it("treats everything without via=google as an email link", () => {
    // An expired email link also comes back as error=access_denied.
    expect(callbackFailure(null, "access_denied")).toBe("link_invalid");
    expect(callbackFailure("github", null)).toBe("link_invalid");
  });
});

describe("callbackErrorFromParam", () => {
  it.each([
    ["link_invalid", "link_invalid"],
    ["link", "link_invalid"],
    ["oauth_failed", "oauth_failed"],
    ["oauth_cancelled", "oauth_cancelled"],
  ])("maps %j to %j", (input, expected) => {
    expect(callbackErrorFromParam(input)).toBe(expected);
  });

  it.each([null, "", "unknown", "<script>", "invalid_credentials"])("ignores %j", (input) => {
    expect(callbackErrorFromParam(input)).toBeNull();
  });
});
