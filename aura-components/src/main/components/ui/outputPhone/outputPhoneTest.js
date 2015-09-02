/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    testEmptyValue: {
        attributes: {value: ''},
        test: function (component) {
            aura.test.assertEquals("", $A.test.getText(component.getElement()), "When value is initialized to an empty string, expecting empty link");
            if ($A.get("$Browser.formFactor") === "PHONE") {
                aura.test.assertEquals(null, this.getAnchor(component), "Link not empty");
            }
        }
    },

    testNoLinkOnDesktop: {
        attributes: {value: '+1 (415) 867-5309'},
        test: function (component) {
            if ($A.get("$Browser.formFactor") !== "PHONE") {
                aura.test.assertNotEquals('a', this.getAnchor(component).tagName, "Anchor should not be present on non-phone systems");
            }
        }
    },

    testLinkOnPhone: {
        attributes: {value: '+1 (415) 867-5309'},
        test: function (component) {
            if ($A.get("$Browser.formFactor") == "PHONE") {
                aura.test.assertEquals('tel:+1(415)867-5309', unescape(this.getAnchor(component).href), "Link not correct");
            }
        }
    },

    /**
     * outputPhone with asterisk in value is not displayed as a link (or at least the portion following the asterisk) .
     */
    // https://gus.soma.salesforce.com/a07B0000000FDmFIAW
    testValueContainsAsterisk: {
        attributes: {value: '867-5309*222'},
        test: function (component) {
            aura.test.assertEquals('867-5309*222', $A.test.getText(component.getElement()), "Visible phone number not correct");
            aura.test.assertNotEquals('a', this.getAnchor(component).tagName, "Number with asterisk is considered uncallable");
        }
    },

    /**
     * outputPhone with value beginning with asterisk is not displayed as a link.
     */
    // https://gus.soma.salesforce.com/a07B0000000FDmFIAW
    testValueStartsWithAsterisk: {
        attributes: {value: '*69'},
        test: function (component) {
            aura.test.assertEquals('*69', $A.test.getText(component.getElement()), "Visible phone number not correct");
            aura.test.assertNotEquals('a', this.getAnchor(component).tagName, "Number with asterisk is considered uncallable");
        }
    },

    /**
     * outputPhone with pound sign in value is not displayed as a link (or at least the portion following the pound sign).
     */
    // https://gus.soma.salesforce.com/a07B0000000FDmFIAW
    testValueContainsPound: {
        attributes: {value: '867-5309 # 2222'},
        test: function (component) {
            aura.test.assertEquals('867-5309 # 2222', $A.test.getText(component.getElement()), "Visible phone number not correct");
            aura.test.assertNotEquals('a', this.getAnchor(component).tagName, "Number with # is considered uncallable");
        }
    },

    /**
     * outputPhone with value beginning with pound sign is not displayed as a link.
     */
    // https://gus.soma.salesforce.com/a07B0000000FDmFIAW
    testValueStartsWithPound: {
        attributes: {value: '#2222'},
        test: function (component) {
            aura.test.assertEquals('#2222', $A.test.getText(component.getElement()), "Visible phone number not correct");
            aura.test.assertNotEquals('a', this.getAnchor(component).tagName, "Number with # is considered uncallable");
        }
    },

    /**
     * outputPhone with leading and trailing whitespaces
     */
    testValueWithWhitespaces: {
        attributes: {value: '   555-1234   '},
        test: function (component) {
            if ($A.get("$Browser.formFactor") == "PHONE") {
                var body = component.getElement();
                aura.test.assertTrue(aura.test.contains($A.test.getText(body), '555-1234'), "Visible phone number not correct");
                aura.test.assertEquals('tel:555-1234', this.getAnchor(component).href, "Link not correct");
            }
        }
    },
    testResetValue: {
        attributes : {value: '4154154155'},
        test: [function(component) {
            aura.test.assertEquals('(415) 415-4155', $A.test.getText(component.getElement()), "Visible phone number not correct");

            component.set("v.value", null);
        }, function(component){
            aura.test.assertEquals('', $A.test.getText(component.getElement()), "Visible phone number not correct");
        }]
    },

    testNorthAmericaPhoneFormatting: {
        attributes : {value: '4154154155'},
        test: function(component) {
            aura.test.assertEquals('(415) 415-4155', $A.test.getText(component.getElement()), "Visible phone number not formatted");
        }
    },

    testExtensionPreserved: {
        attributes : {value: '4154154155 #123'},
        test: function(component) {
            aura.test.assertEquals('(415) 415-4155 #123', $A.test.getText(component.getElement()), "Visible phone number not formatted");
        }
    },

    testNonNorthAmericanNumbersNotFormatted: {
        attributes : {value: '+442012341234'},
        test: function(component) {
            aura.test.assertEquals('+442012341234', $A.test.getText(component.getElement()), "Visible phone number not formatted");
        }
    },

    testNorthAmericaPrefixRemoved: {
        attributes : {value: '14154154155'},
        test: function(component) {
            aura.test.assertEquals('(415) 415-4155', $A.test.getText(component.getElement()), "Prefix not removed, or number not formatted.");
        }
    },

    getAnchor: function (component) {
        return component.getElement().firstChild;
    }

})
