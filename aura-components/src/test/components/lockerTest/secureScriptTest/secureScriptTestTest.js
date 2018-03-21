({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741, W-4446969): FF and LockerService disabled for iOS browser in 212
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    mock: function(response) {
        function StubXMLHttpRequest() {}
        Object.assign(StubXMLHttpRequest.prototype, {
            open: function(method, url) {
                this.response = response;
            },
            setRequestHeader: function() {},
            getResponseHeader: function(name) {
                return this.response.headers[name];
            },
            send: function() {
                this.readyState = this.response.readyState;
                this.status = this.response.status;
                this.responseText = this.response.responseText;
                this.onreadystatechange();
            }
        });
        StubXMLHttpRequest.DONE = 4;
        var override = $A.test.overrideFunction(window, "XMLHttpRequest", StubXMLHttpRequest);
        $A.test.addCleanup(function() { override.restore(); });
    },

    testScriptSrcExposed: {
        test: function(cmp) {
            cmp.testScriptSrcExposed();
        }
    },

    testGetSetAttribute: {
        test: function(cmp) {
            cmp.testGetSetAttribute();
        }
    },

    testGetSetAttributeNode: {
        test: function(cmp) {
            cmp.testGetSetAttributeNode();
        }
    },

    testLoadScript: {
        test: function(cmp) {
            cmp.testLoadScript();
        }
    },

    testScriptURL: {
        test: function(cmp) {
            this.mock({
                readyState:4, status: 200,
                headers: {'content-type': "application/javascript"},
                responseText: "window.testScript=true"
            });
            cmp.testScriptURL();
        }
    },

    testSetAttributeNodeSrcAttribute: {
        test: function(cmp) {      
            cmp.testSetAttributeNodeSrcAttribute(cmp);
        }
    },

    testSVGScriptLoadHref: {
        test: function(cmp) {
            cmp.testSVGScriptLoadHref();
        }
    },

    testSVGScriptLoadHrefOnlySVG: {
        test: function(cmp) {
            cmp.testSVGScriptLoadHrefOnlySVG();
        }
    },

    testSVGScriptAttributesList: {
        test: function(cmp) {
            cmp.testSVGScriptAttributesList();
        }
    },

    testSVGScriptSetAttributeNode: {
        test: function(cmp) {
            cmp.testSVGScriptSetAttributeNode();
        }
    },

    testScriptDisableXlinkHref: {
        test: function(cmp) {
            cmp.testScriptDisableXlinkHref();
        }
    }
})