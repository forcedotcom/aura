({
    /**
     * Tests for TransportMetricsPlugin.js
     */

    /**
     * Verify method the plugin binds to is accessible.
     */
    testMethodAccessible: {
        test: function(cmp) {
            $A.test.assertDefined($A.util.transport["request"]);
        }
    },

    /**
     * Verify Transport.js#request uses the passed in config the same way TransportMetricsPlugin.js expects. If the
     * shape of the config must be changed here, verify the plugin's config also reflects those changes.
     */
    testRequestConfig: {
        test: function(cmp) {
            var url,
                callbackFlag = false,
                transport = $A.util.transport,
                mockRequestObject = {
                    "open": function(method, url_t, async) {
                        url = url_t;
                    },
                    "send": function() {}
                },
                // Only populate what we use in TransportMetricsPlugin.js
                config = {
                        "url": "/testUrl",
                        "method": "GET",
                        "callback": function(param) {
                            callbackFlag = true;
                        },
                        "params": {
                            "message": "testMessage",
                            "aura.num": "13371337"
                        }
                };

            // We really only care about the API under test (Transport.js#request) for this test, not our plugin code.
            $A.metricsService.disablePlugin("transport");

            var requestOverride = $A.test.overrideFunction(
                    transport,
                    "createHttpRequest",
                    function() { return mockRequestObject }
            );
            try {
                transport.request(config);

                $A.test.assertTrue(url.indexOf(config["url"]) !== -1,
                        "Expected 'url' property on config to be present in request url for GET");
                $A.test.assertTrue(url.indexOf(config["params"]["message"]) !== -1,
                        "Expected config['params']['message'] to be present on request url for GET");

                this.induceCallback(mockRequestObject);
                $A.test.assertTrue(callbackFlag);
            } finally {
                requestOverride.restore();
            }
        }
    },

    /**
     * TransportMetricsPlugin.js overrides the original callback. Verify the original callback still gets called.
     */
    testCallbackCalledWithPluginEnabled: {
        test: function(cmp) {
            var callbackFlag = false,
                transport = $A.util.transport,
                mockRequestObject = {
                    open: function(){},
                    send: function(){},
                    setRequestHeader: function(){}
                },
                config = {
                    "callback": function(param) {
                        callbackFlag = true;
                    },
                    "params": {
                        "aura.num": "13371337",
                        "message" : '{"foo":123}'
                    }
                };

            // Should be enabled by default, but just to be sure
            $A.metricsService.enablePlugin("transport");

            var requestOverride = $A.test.overrideFunction(
                    transport,
                    "createHttpRequest",
                    function() { return mockRequestObject; }
            );
            try {
                transport.request(config);
                this.induceCallback(mockRequestObject);
                $A.test.assertTrue(callbackFlag);
            } finally {
                requestOverride.restore();
            }
        }
    },

    /**
     * Actions necessary to hit the callback on the config.
     */
    induceCallback: function(request) {
        request["readyState"] = 4;
        request["responseText"] = "foo";
        request.onreadystatechange();
    }
})