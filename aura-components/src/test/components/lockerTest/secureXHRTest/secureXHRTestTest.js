({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741): FF version in autobuilds is too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testCannotAccessAuraEndpoints: {
        test: function(cmp) {
            cmp.testCannotAccessAuraEndpoints();
        }
    },

    testAddEventListener: {
        test: function(cmp) {
            cmp.testAddEventListener();
        }
    },

    testOnReadyStateChange: {
        test: function(cmp) {
            cmp.testOnReadyStateChange();
        }
    },

    testResponseXML: {
        test: function(cmp) {

            function StubXMLHttpRequest() {}
            function noop() {}
            Object.assign(StubXMLHttpRequest.prototype, {
                open: noop,
                setRequestHeader: noop,
                getResponseHeader: noop,
                send: function() {
                    this.readyState = 4;
                    this.status = 200;
                    this.responseText = '<?xml version="1.0"?><catalog><book id="bk101"/><book id="bk102"/></catalog>';
                    this.responseXML = (new DOMParser()).parseFromString(this.responseText,"text/xml");
                },
                abort: noop,
                getAllResponseHeaders: noop,
                overrideMimeType: noop,
                readyState: null,
                status: null,
                responseText: null,
                responseXML: null
            });
            StubXMLHttpRequest.DONE = XMLHttpRequest.DONE;

            var override = $A.test.overrideFunction(window, "XMLHttpRequest", StubXMLHttpRequest);
            cmp.testResponseXML();
            $A.test.addCleanup(function() { override.restore(); });
        }
    }
})