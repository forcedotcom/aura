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
        attributes : {dir : 'rtl', label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('rtl', component.find("link").getElement().dir, "Dir attribute not correct");
        }
    },

    testDirMissing: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('ltr', component.find("link").getElement().dir, "Dir attribute not set to default");
        }
    },

    testDirDirty: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: [function(component){
            aura.test.assertEquals('ltr', component.find("link").getElement().dir, "Dir attribute not set to default");
            component.set("v.dir", "rtl");
        }, function(component){
            aura.test.assertEquals('rtl', component.find("link").getElement().dir, "Dir attribute not updated");
        }]
    },

    testDisabled: {
        attributes : {disabled: true, label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertTrue($A.util.hasClass(component.find("link").getElement(), "disabled"), "Disabled class not correctly added");
        }
    },

    testDisabledMissing: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertFalse($A.util.hasClass(component.find("link").getElement(), "disabled"), "Should not be disabled by default");
        }
    },

    testDisabledDirty: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: [function(component){
            aura.test.assertFalse($A.util.hasClass(component.find("link").getElement(), "disabled"), "Should not be disabled by default");
            component.set("v.disabled", "true");
        }, function(component){
            aura.test.assertTrue($A.util.hasClass(component.find("link").getElement(), "disabled"), "Disabled class not added correctly");
        }]
    },

    testValue: {
    	attributes : {label: 'link', value: 'https://www.salesforce.com:8080/home/home.jsp?chatter=off&tasks=on#top'},
        test: function(component){
            aura.test.assertTrue(aura.test.contains(component.find("link").getElement().href,'https://www.salesforce.com:8080/home/home.jsp?chatter=off&tasks=on#top'), "href attribute not correct");
        }
    },

    testValueOnlyFragment: { // for layouts
        attributes : {label: 'link', value: '#top'},
        test: function(component){
            aura.test.assertEquals('javascript:void(0/*#top*/);', component.find("link").getElement().getAttribute('href'), "href attribute not correct");
        }
    },

    testValueOnlyParams: {
        attributes : {label: 'link', value: '?you=lost&me=found'},
        test: function(component){
        	aura.test.assertTrue(aura.test.contains(component.find("link").getElement().getAttribute('href'),'?you=lost&me=found'), "href attribute not correct");
        }
    },

    testValueEmpty: {
        attributes : {label: 'link', value: ''},
        test: function(component){
            aura.test.assertEquals('javascript:void(0);', component.find("link").getElement().getAttribute('href'), "href attribute not correct");
        }
    },

    testValueMailto: {
        attributes : {label: 'link', value: 'mailto:friend@salesforce.com'},
        test: function(component){
        	aura.test.assertTrue(aura.test.contains(component.find("link").getElement().getAttribute('href'),'mailto:friend@salesforce.com'), "href attribute not correct");
        }
    },

    testValueDirty: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: [function(component){
        	aura.test.assertTrue(aura.test.contains(component.find("link").getElement().getAttribute('href'),'www.salesforce.com'), "href attribute not correct");
            component.set("v.value", "www.database.com");
        }, function(component){
            aura.test.assertTrue(aura.test.contains(component.find("link").getElement().getAttribute('href'),'www.database.com'), "href attribute not updated");
        }]
    },

    testValueFragmentDirty: {
        attributes : {label: 'link', value: '#top'},
        test: [function(component){
            var href = component.find("link").getElement().getAttribute('href');
            // prod mode doesn't have comment within void
            aura.test.assertTrue(href == "javascript:void(0);" || href == "javascript:void(0/*#top*/);", "href attribute not correct");
            component.set("v.value", "#bottom");
        }, function(component){
            href = component.find("link").getElement().getAttribute('href');
            aura.test.assertTrue(href == "javascript:void(0);" || href == "javascript:void(0/*#bottom*/);", "href attribute not updated");
        }]
    },

    testIconClassMissing: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals(0, component.find("link").getElement().getElementsByTagName("img").length, "Nested image should not be output without iconClass");
        }
    },

    testIconClassEmpty: {
        attributes : {iconClass: '', label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals(0, component.find("link").getElement().getElementsByTagName("img").length, "Nested image should not be output without iconClass");
        }
    },

    testIconClass: {
        attributes : {iconClass: 'myIcon', label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertTrue($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "myIcon"), "IconClass not correctly added");
        }
    },

    testIconClassDirty: {
        attributes : {iconClass: 'myIcon', label: 'link', value: 'www.salesforce.com'},
        test: [function(component){
            aura.test.assertTrue($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "myIcon"), "IconClass not correctly added");
            component.set("v.iconClass", "someIconClass");
        }, function(component){
            aura.test.assertFalse($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "myIcon"), "Original iconClass not removed");
            aura.test.assertTrue($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "someIconClass"), "New iconClass not correctly added");
        }]
    },

    testLabel: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('link', $A.test.getText(component.find('link').getElement()), "Label attribute not correct");
        }
    },

    testLabelEmpty: {
        attributes : {label: '', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('', $A.test.getText(component.find('link').getElement()), "Label attribute not correct");
        }
    },

    testLabelMissing: {
        attributes : {value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('', $A.test.getText(component.find('link').getElement()), "Label attribute not correct");
        }
    },

    testLabelDirty: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: [function(component){
            aura.test.assertEquals('link', $A.test.getText(component.find('link').getElement()), "Label attribute not correct");
            component.set("v.label", "updated link");
        }, function(component){
            aura.test.assertEquals('updated link', $A.test.getText(component.find('link').getElement()), "Label attribute not updated");
        }]
    },

    testTitle: {
        attributes : {title: 'hover me', label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('hover me', component.find("link").getElement().title, "Title attribute not correct");
        }
    },

    testTitleEmpty: {
        attributes : {title: '', label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('', component.find("link").getElement().title, "Title attribute not correct");
        }
    },

    testTitleMissing: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals("", component.find("link").getElement().getAttribute('title'), "Title attribute not correct");
        }
    },

    testTitleDirty: {
        attributes : {title: 'hover me', label: 'link', value: 'www.salesforce.com'},
        test: [function(component){
            aura.test.assertEquals('hover me', component.find("link").getElement().title, "Title attribute not correct");
            component.set("v.title", "check again");
        }, function(component){
            aura.test.assertEquals('check again', component.find("link").getElement().title, "Title attribute not updated");
        }]
    },  
    
    testLabelAndIgnorePassedInAlt: {
        attributes: {label: "link", value : 'www.salesforce.com', alt : "wrongAlt", iconClass : "somethingSomethingDarkSide"},
        test:function(component){
            var icon = component.find("icon");
            var imageType  = icon.get('v.imageType');
            var alt        = icon.get('v.alt');
            aura.test.assertEquals(alt, "", "Alt is set incorrectly");
            aura.test.assertEquals(imageType, "decorative", "Image is not set to type decorative");

        }
     },
     
     testNoLabelWithAlt: {
        attributes: {value : 'www.salesforce.com', alt : "Alt Should exist", iconClass : "somethingSomethingComplete"},
        test:function(component){
            var icon = component.find("icon");
            var imageType  = icon.get('v.imageType');
            var alt        = icon.get('v.alt');
            aura.test.assertEquals(alt, "Alt Should exist", "Alt is set incorrectly");
            aura.test.assertEquals(imageType, "informational", "Image is not set to type informational");

        }
     },
     
     testNoLabelNoAlt: {
         auraErrorsExpectedDuringInit : ["\"alt\" attribute should not be empty for informational image"],
         attributes: {value : 'www.salesforce.com', iconClass : "somethingSomethingDarkSide"},
         test:function(component){
              var id = component.find("icon").getLocalId();
              var errorMessage =  "component: "+id+" \"alt\" attribute should not be empty for informational image";
              var actual = $A.test.getAuraErrorMessage();
              $A.test.assertTrue($A.test.contains(actual, errorMessage),
                      "Expected '" + errorMessage+"', Got:'"+actual+"'");
         }
     }
})
