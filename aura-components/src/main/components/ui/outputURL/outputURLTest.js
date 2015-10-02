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
    testDir: {
        attributes: {dir: 'rtl', label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals('rtl', component.find("link").getElement().dir, "Dir attribute not correct");
        }
    },

    testDirMissing: {
        attributes: {label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals('ltr', component.find("link").getElement().dir, "Dir attribute not set to default");
        }
    },

    testDirDirty: {
        attributes: {label: 'link', value: 'www.salesforce.com'},
        test: [function (component) {
            $A.test.assertEquals('ltr', component.find("link").getElement().dir, "Dir attribute not set to default");
            component.set("v.dir", "rtl");
        }, function (component) {
            $A.test.assertEquals('rtl', component.find("link").getElement().dir, "Dir attribute not updated");
        }]
    },

    testDisabled: {
        attributes: {disabled: true, label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertTrue($A.util.hasClass(component.find("link").getElement(), "disabled"), "Disabled class not correctly added");
        }
    },

    testDisabledMissing: {
        attributes: {label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertFalse($A.util.hasClass(component.find("link").getElement(), "disabled"), "Should not be disabled by default");
        }
    },

    testDisabledDirty: {
        attributes: {label: 'link', value: 'www.salesforce.com'},
        test: [function (component) {
            $A.test.assertFalse($A.util.hasClass(component.find("link").getElement(), "disabled"), "Should not be disabled by default");
            component.set("v.disabled", "true");
        }, function (component) {
            $A.test.assertTrue($A.util.hasClass(component.find("link").getElement(), "disabled"), "Disabled class not added correctly");
        }]
    },

    testValue: {
        attributes: {label: 'link', value: 'https://www.salesforce.com:8080/home/home.jsp?chatter=off&tasks=on#top'},
        test: function (component) {
            $A.test.assertTrue($A.test.contains(component.find("link").getElement().href, 'https://www.salesforce.com:8080/home/home.jsp?chatter=off&tasks=on#top'), "href attribute not correct");
        }
    },

    testValueOnlyFragment: { // for layouts
        attributes: {label: 'link', value: '#top'},
        test: function (component) {
            $A.test.assertEquals('javascript:void(0/*#top*/);', component.find("link").getElement().getAttribute('href'), "href attribute not correct");
        }
    },

    testValueOnlyParams: {
        attributes: {label: 'link', value: '?you=lost&me=found'},
        test: function (component) {
            $A.test.assertTrue($A.test.contains(component.find("link").getElement().getAttribute('href'), '?you=lost&me=found'), "href attribute not correct");
        }
    },

    testValueEmpty: {
        attributes: {label: 'link', value: ''},
        test: function (component) {
            $A.test.assertEquals('javascript:void(0);', component.find("link").getElement().getAttribute('href'), "href attribute not correct");
        }
    },

    testValueMailto: {
        attributes: {label: 'link', value: 'mailto:friend@salesforce.com'},
        test: function (component) {
            $A.test.assertTrue($A.test.contains(component.find("link").getElement().getAttribute('href'), 'mailto:friend@salesforce.com'), "href attribute not correct");
        }
    },

    testValueDirty: {
        attributes: {label: 'link', value: 'www.salesforce.com'},
        test: [function (component) {
            $A.test.assertTrue($A.test.contains(component.find("link").getElement().getAttribute('href'), 'www.salesforce.com'), "href attribute not correct");
            component.set("v.value", "www.database.com");
        }, function (component) {
            $A.test.assertTrue($A.test.contains(component.find("link").getElement().getAttribute('href'), 'www.database.com'), "href attribute not updated");
        }]
    },

    testValueFragmentDirty: {
        attributes: {label: 'link', value: '#top'},
        test: [function (component) {
            var href = component.find("link").getElement().getAttribute('href');
            if ($A.util.supportsTouchEvents()) {
                // prod mode doesn't have comment within void
                $A.test.assertTrue(href === "javascript:void(0);" || href === "javascript:void(0/*#top*/);", "href attribute not correct");
            } else {
                $A.test.assertEquals("#top", href, "href attribute not correct");
            }
            component.set("v.value", "#bottom");
        }, function (component) {
            var href = component.find("link").getElement().getAttribute('href');
            if ($A.util.supportsTouchEvents()) {
                // prod mode doesn't have comment within void
                $A.test.assertTrue(href === "javascript:void(0);" || href === "javascript:void(0/*#bottom*/);", "href attribute not correct");
            } else {
                $A.test.assertEquals("#bottom", href, "href attribute not correct");
            }
        }]
    },

    testIconClassMissing: {
        attributes: {label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals(0, component.find("link").getElement().getElementsByTagName("img").length, "Nested image should not be output without iconClass");
        }
    },

    testIconClassEmpty: {
        attributes: {iconClass: '', label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals(0, component.find("link").getElement().getElementsByTagName("img").length, "Nested image should not be output without iconClass");
        }
    },

    testIconClass: {
        attributes: {iconClass: 'myIcon', label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertTrue($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "myIcon"), "IconClass not correctly added");
        }
    },

    testIconClassDirty: {
        attributes: {iconClass: 'myIcon', label: 'link', value: 'www.salesforce.com'},
        test: [function (component) {
            $A.test.assertTrue($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "myIcon"), "IconClass not correctly added");
            component.set("v.iconClass", "someIconClass");
        }, function (component) {
            $A.test.assertFalse($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "myIcon"), "Original iconClass not removed");
            $A.test.assertTrue($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "someIconClass"), "New iconClass not correctly added");
        }]
    },

    testLabel: {
        attributes: {label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals('link', $A.test.getText(component.find('link').getElement()), "Label attribute not correct");
        }
    },

    testLabelEmpty: {
        attributes: {label: '', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals('', $A.test.getText(component.find('link').getElement()), "Label attribute not correct");
        }
    },

    testLabelMissing: {
        attributes: {value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals('', $A.test.getText(component.find('link').getElement()), "Label attribute not correct");
        }
    },

    testLabelDirty: {
        attributes: {label: 'link', value: 'www.salesforce.com'},
        test: [function (component) {
            $A.test.assertEquals('link', $A.test.getText(component.find('link').getElement()), "Label attribute not correct");
            component.set("v.label", "updated link");
        }, function (component) {
            $A.test.assertEquals('updated link', $A.test.getText(component.find('link').getElement()), "Label attribute not updated");
        }]
    },

    testTitle: {
        attributes: {title: 'hover me', label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals('hover me', component.find("link").getElement().title, "Title attribute not correct");
        }
    },

    testTitleEmpty: {
        attributes: {title: '', label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals('', component.find("link").getElement().title, "Title attribute not correct");
        }
    },

    testTitleMissing: {
        attributes: {label: 'link', value: 'www.salesforce.com'},
        test: function (component) {
            $A.test.assertEquals("", component.find("link").getElement().getAttribute('title'), "Title attribute not correct");
        }
    },

    testTitleDirty: {
        attributes: {title: 'hover me', label: 'link', value: 'www.salesforce.com'},
        test: [function (component) {
            $A.test.assertEquals('hover me', component.find("link").getElement().title, "Title attribute not correct");
            component.set("v.title", "check again");
        }, function (component) {
            $A.test.assertEquals('check again', component.find("link").getElement().title, "Title attribute not updated");
        }]
    },

    testLabelAndIgnorePassedInAlt: {
        attributes: {
            label: "link",
            value: 'www.salesforce.com',
            alt: "wrongAlt",
            iconClass: "somethingSomethingDarkSide"
        },
        test: function (component) {
            var icon = component.getElement().getElementsByTagName("img")[0];
            var alt = icon.getAttribute("alt");
            $A.test.assertEquals('', alt, "Alt is set incorrectly");

        }
    },

    testNoLabelWithAlt: {
        attributes: {value: 'www.salesforce.com', alt: "Alt Should exist", iconClass: "somethingSomethingComplete"},
        test: function (component) {
            var icon = component.getElement().getElementsByTagName("img")[0];
            var alt = icon.getAttribute('alt');
            $A.test.assertEquals(alt, "Alt Should exist", "Alt is set incorrectly");

        }
    },

    testNoLabelNoAlt: {
        failOnWarning: true,
        auraWarningsExpectedDuringInit: ["\"alt\" attribute should not be empty"],
        attributes: {value: 'www.salesforce.com', iconClass: "somethingSomethingDarkSide"},
        test: function () {
            // This is testing component "init" which is already tested above (auraWarningsExpectedDuringInit).
        }
    },

    testValueWithHttp: {
        attributes: {fixURL: true, label: "link", value: "http://www.salesforce.com:9090/home/home.jsp"},
        browsers : ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPAD", "-IPHONE"],
        test: function (component) {
            $A.test.assertEquals("http://www.salesforce.com:9090/home/home.jsp", component.find("link").getElement().href, "href attribute not correct");
        }
    },

    testValueWithHttps: {
        attributes: {
            fixURL: true,
            label: "link",
            value: "https://www.salesforce.com:8080/home/home.jsp?chatter=off&tasks=on#top"
        },
        browsers : ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPAD", "-IPHONE"],
        test: function (component) {

            $A.test.assertEquals("https://www.salesforce.com:8080/home/home.jsp?chatter=off&tasks=on#top", component.find("link").getElement().href, "href attribute not correct");
        }
    },

    testValueWithFtp: {
        attributes: {fixURL: true, label: "link", value: "ftp://www.salesforce.com:6060/images"},
        browsers : ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPAD", "-IPHONE"],
        test: function (component) {
            $A.test.assertEquals("ftp://www.salesforce.com:6060/images", component.find("link").getElement().href, "href attribute not correct");
        }
    },

    // unsupported protocol
    testValueWithMailto: {
        attributes: {fixURL: true, label: "link", value: "mailto:friend@salesforce.com"},
        browsers : ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPAD", "-IPHONE"],
        test: function (component) {
            $A.test.assertEquals("http://mailto:friend@salesforce.com", component.find("link").getElement().getAttribute("href"), "href attribute not correct");
        }
    },

    // not expecting layout handling from SFDC URLs
    testValueOnlyFragment: {
        attributes: {fixURL: true, label: "link", value: "#top"},
        browsers : ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPAD", "-IPHONE"],
        test: function (component) {
            $A.test.assertEquals("http://#top", component.find("link").getElement().getAttribute("href"), "href attribute not correct");
        }
    },

    testValueDefaultHttp: {
        attributes: {fixURL: true, label: "link", value: "www.salesforce.com"},
        browsers : ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPAD", "-IPHONE"],
        test: function (component) {
            $A.test.assertEquals("http://www.salesforce.com", component.find("link").getElement().getAttribute("href"), "href attribute not correct");
        }
    }
/*eslint-disable semi*/
})
/*eslint-enable semi*/
