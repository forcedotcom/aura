export function isLockerized(testUtils) {
    testUtils.assertEquals(window + "", 'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }');
}