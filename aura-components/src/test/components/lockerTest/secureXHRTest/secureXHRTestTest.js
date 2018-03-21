({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741, W-4446969): FF and LockerService disabled for iOS browser in 212
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],

    mock: function(responseList) {
        function StubXMLHttpRequest() {}
        function noop() {}
        Object.assign(StubXMLHttpRequest.prototype, {
            addEventListener: function(type, listener) {
                this.__listners[type] = listener;
            },
            open: function(method, url) {
                var dummy = document.createElement("a");
                dummy.href = url;
                this.response = responseList[dummy.pathname];
            },
            setRequestHeader: noop,
            getResponseHeader: noop,
            send: function() {
                this.readyState = this.response.readyState;
                this.status = this.response.status;
                this.responseText = this.response.responseText;
                this.responseXML = this.response.responseXML;
                this.onreadystatechange && this.onreadystatechange(document.createEvent("Event"));

                var onload = this.__listners["load"];
                if (onload) {
                    onload(document.createEvent("Event"));
                }
            },
            abort: noop,
            getAllResponseHeaders: noop,
            __listners: {},
            overrideMimeType: noop,
            readyState: null,
            status: null,
            responseText: null,
            responseXML: null
        });
        StubXMLHttpRequest.DONE = XMLHttpRequest.DONE;

        var override = $A.test.overrideFunction(window, "XMLHttpRequest", StubXMLHttpRequest);
        $A.test.addCleanup(function() { override.restore(); });
    },

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
            this.mock({
                "/resources/qa/testDocument.xml": {
                    readyState: 4, status: 200,
                    responseText: '<!DOCTYPE html><html lang="en"><head><title>Aura</title></head></html>'
                }
            });

            cmp.testAddEventListener();
        }
    },

    testOnReadyStateChange: {
        test: function(cmp) {
            this.mock({
                "/resources/qa/testDocument.xml": {
                    readyState: 4, status: 200,
                    responseText: '<!DOCTYPE html><html lang="en"><head><title>Aura</title></head></html>'
                }
            });

            cmp.testOnReadyStateChange();
        }
    },

    testResponseXML: {
        test: function(cmp) {

            this.mock({
                "/document.xml": {
                    readyState: 4, status: 200,
                    responseText: '<?xml version="1.0"?><catalog><book id="bk101"/><book id="bk102"/></catalog>',
                    responseXML: (new DOMParser()).parseFromString(this.responseText,"text/xml")
                }
            });

            cmp.testResponseXML();
        }
    },

    testOpenMethodURLParameter: {
        test: function(cmp) {
            this.mock({
                "/api/get": {
                    readyState: 4, status: 200,
                    responseText: 'good',
                },
                "/auraFW/resources/qa/testScript.js": {
                    readyState: 4, status: 200,
                    responseText: 'bad',
                },
            });

            cmp.testOpenMethodURLParameter();
        }
    }
})