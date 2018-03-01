({
    // Verify that a SecureURL instance meets specifications.
    testNewURL: function(cmp) {
        var T = cmp.get("v.testUtils");

        // Based on http://trac.webkit.org/browser/trunk/LayoutTests/fast/url/script-tests/segments.js

        var expected = {
          "input": "http://user:pass@foo:21/bar;par?b#c",
          "base": "http://example.org/foo/bar",
          "href": "http://user:pass@foo:21/bar;par?b#c",
          "origin": "http://foo:21",
          "protocol": "http:",
          "username": "user",
          "password": "pass",
          "host": "foo:21",
          "hostname": "foo",
          "port": "21",
          "pathname": "/bar;par",
          "search": "?b",
          "hash": "#c"
        };

        // ---

        var result;
        try {
            result = new URL(null);
        } catch (e) { result = e.name; }
        T.assertStartsWith("TypeError", result, 'did not throw on null');

        // ---

        var url = new URL(expected.input, expected.base);

        T.assertTrue(url instanceof URL, "instanceof failed");

        T.assertEquals(url.href, expected.href, "href failed");
        T.assertEquals(url.protocol, expected.protocol, "protocol failed");
        T.assertEquals(url.username, expected.username, "username failed");
        T.assertEquals(url.password, expected.password, "password failed");
        T.assertEquals(url.host, expected.host, "host failed");
        T.assertEquals(url.hostname, expected.hostname, "hostname failed");
        T.assertEquals(url.port, expected.port, "port failed");
        T.assertEquals(url.pathname, expected.pathname, "pathname failed");
        T.assertEquals(url.search, expected.search, "search failed");
        T.assertEquals(url.hash, expected.hash, "hash failed");
    },
    // Verify that the secure method meets specifications.
    testCreateObjectURL: function(cmp) {
        var T = cmp.get("v.testUtils");

        // ---

        var result;
        try {
            result = URL.createObjectURL(null);
        } catch (e) { result = e.name; }
        T.assertStartsWith("TypeError", result, 'Should throw on null');

        // ---

        var blob0 = new Blob([]);
        var url0 = URL.createObjectURL(blob0);
        T.assertEquals("string", typeof url0, 'Blob URI should be typeof string');
        T.assertStartsWith("blob:", url0, 'Blob URI should start with "blob:"');

        // ---

        var blob1 = new Blob(["Hello"], {type: "text/plain"});
        var url1 = URL.createObjectURL(blob1);
        T.assertEquals("string", typeof url1, 'Blob URI should be typeof string');
        T.assertStartsWith("blob:", url1, 'Blob URI should start with "blob:"');

        // ---
        // disable in favor of internal Locker tests
        // var blob2 = new Blob(['<html><body onload="alert(window)"></body></html>'], {type: 'text/html'});
        // try {
        //     result = URL.createObjectURL(blob2);
        // } catch (e) { result = e.name; }
        // T.assertStartsWith("TypeError", result, 'Should throw on on a blob type text/html');

        // ---

    },
    // Verify that the passthrough method meets specifications.
    testRevokeObjectURL: function(cmp) {
        var T = cmp.get("v.testUtils");

        var blob = new Blob([]);
        var url = URL.createObjectURL(blob);
        URL.revokeObjectURL(url);

        // Not much we can do here expect that the function did not thow. To
        // test a blob URL, we need to create a side effect, but CSP prevents
        // most usage (XHR, WebWorker, etc.)
    }
})