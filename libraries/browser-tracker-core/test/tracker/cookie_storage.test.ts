import { newCookieStorage, syncCookieStorage } from "../../src/tracker/cookie_storage";

test("cookieStorage sets, gets, and deletes value", () => {
  const cookieStorage = newCookieStorage();
  cookieStorage.setCookie("test", "value");
  expect(cookieStorage.getCookie("test")).toBe("value");

  cookieStorage.deleteCookie("test");
  expect(cookieStorage.getCookie("test")).toBeFalsy();
});

test("cookieStorage sets value with ttl and clears cache after ttl", (done) => {
  const cookieStorage = newCookieStorage();
  const ttl = 1;
  cookieStorage.setCookie("test", "value", ttl);

  expect(cookieStorage.getCookie("test")).toBe("value");

  setTimeout(() => {
    expect(cookieStorage.getCookie("test")).toBeFalsy();
    done();
  }, ttl * 1000 + 100);
});

test("cookieStorage sets value with path, domain, samesite, and secure", () => {
  const cookieStorage = newCookieStorage();
  const path = "/";
  const domain = "example.com";
  const samesite = "Strict";
  const secure = true;

  cookieStorage.setCookie("test", "value", undefined, path, domain, samesite, secure);
  expect(cookieStorage.getCookie("test")).toBe("value");
});

test("cookieStorage sets value with synchronous cookie write", () => {
  const cookieStorage = syncCookieStorage;
  cookieStorage.setCookie("test", "value");
  expect(cookieStorage.getCookie("test")).toBe("value");
});
