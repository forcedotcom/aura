/*
 * Copyright (C) 2012 salesforce.com, inc.
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
        test: function(component){
            aura.test.assertEquals('ltr', component.find("link").getElement().dir, "Dir attribute not set to default");
            component.getAttributes().setValue("dir", "rtl");
            $A.renderingService.rerender(component);
            aura.test.assertEquals('rtl', component.find("link").getElement().dir, "Dir attribute not updated");
        }
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
        test: function(component){
            aura.test.assertFalse($A.util.hasClass(component.find("link").getElement(), "disabled"), "Should not be disabled by default");
            component.getAttributes().setValue("disabled", "true");
            $A.renderingService.rerender(component);
            aura.test.assertTrue($A.util.hasClass(component.find("link").getElement(), "disabled"), "Disabled class not added correctly");
        }
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
            aura.test.assertEquals('', component.find("link").getElement().getAttribute('href'), "href attribute not correct");
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
        test: function(component){
        	aura.test.assertTrue(aura.test.contains(component.find("link").getElement().getAttribute('href'),'www.salesforce.com'), "href attribute not correct");
            component.getAttributes().setValue("value", "www.database.com");
            $A.renderingService.rerender(component);
            aura.test.assertTrue(aura.test.contains(component.find("link").getElement().getAttribute('href'),'www.database.com'), "href attribute not updated");
        }
    },

    // https://gus.soma.salesforce.com/a07B0000000FA87IAG
    _testValueFragmentDirty: {
        attributes : {label: 'link', value: '#top'},
        test: function(component){
            aura.test.assertEquals('javascript:void(0)', component.find("link").getElement().getAttribute('href'), "href attribute not correct");
            component.getAttributes().setValue("value", "#bottom");
            $A.renderingService.rerender(component);
            aura.test.assertEquals('javascript:void(0)', component.find("link").getElement().getAttribute('href'), "href attribute not updated");
        }
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
        test: function(component){
            aura.test.assertTrue($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "myIcon"), "IconClass not correctly added");
            component.getAttributes().setValue("iconClass", "someIconClass");
            $A.renderingService.rerender(component);
            aura.test.assertFalse($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "myIcon"), "Original iconClass not removed");
            aura.test.assertTrue($A.util.hasClass(component.find("link").getElement().getElementsByTagName("img")[0], "someIconClass"), "New iconClass not correctly added");
        }
    },

    testLabel: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('link', component.find("link").getElement().textContent, "Label attribute not correct");
        }
    },

    testLabelEmpty: {
        attributes : {label: '', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('', component.find("link").getElement().textContent, "Label attribute not correct");
        }
    },

    testLabelMissing: {
        attributes : {value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('', component.find("link").getElement().textContent, "Label attribute not correct");
        }
    },

    testLabelDirty: {
        attributes : {label: 'link', value: 'www.salesforce.com'},
        test: function(component){
            aura.test.assertEquals('link', component.find("link").getElement().textContent, "Label attribute not correct");
            component.getAttributes().setValue("label", "updated link");
            $A.renderingService.rerender(component);
            aura.test.assertEquals('updated link', component.find("link").getElement().textContent, "Label attribute not updated");
        }
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
        test: function(component){
            aura.test.assertEquals('hover me', component.find("link").getElement().title, "Title attribute not correct");
            component.getAttributes().setValue("title", "check again");
            $A.renderingService.rerender(component);
            aura.test.assertEquals('check again', component.find("link").getElement().title, "Title attribute not updated");
        }
    }
})
