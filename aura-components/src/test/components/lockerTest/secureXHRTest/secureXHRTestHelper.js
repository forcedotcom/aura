({
    createXHRHandler: function(cmp, testUtils, useXML) {
        return function(event) {
            testUtils.assertStartsWith("SecureDOMEvent", event.toString(), "Expected event to be a SecureDOMEvent");
            testUtils.assertStartsWith("SecureXMLHttpRequest", this.toString(), "Expected this to return SecureXMLHttpRequest");

            if (this.readyState == 4 && this.status == 200) {
                if (useXML) {
                    testUtils.assertEquals("[object XMLDocument]", this.responseXML.toString());
                } else {
                    var regex = new RegExp('^<!DOCTYPE html><html lang="[^"]*"><head><title>Aura</title>');
                    testUtils.assert(regex.test(this.responseText.trim()));
                }
            }

            cmp.set("v.completed", true);
        };
    },

    testCallback: function (cmp, wireUpEventHandler, useXML) {
        var testUtils = cmp.get("v.testUtils");

        var xhr = new XMLHttpRequest();
        testUtils.assertStartsWith("SecureXMLHttpRequest", xhr.toString(), "Expected new XMLHttpRequest() to return SecureXMLHttpRequest");

        xhr.open("GET", "/lockerTest/secureXHRTest.cmp", true);

        if (useXML) {
            xhr.overrideMimeType('text/xml');
        }

        wireUpEventHandler(xhr, testUtils);

        xhr.send();
    }
})