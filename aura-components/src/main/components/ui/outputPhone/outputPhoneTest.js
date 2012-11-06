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
    /**
     * outputPhone blank value attribute results in nothing displayed.
     */
    testEmptyValue:{
        attributes : {value: ''},
        test: function(component){
            aura.test.assertEquals('', component.find('link').getElement().textContent, "When value is initialized to an empty string, nothing should be shown.");
        }
    },

    /**
     * outputPhone displays basic phone number as link.
     */
    testValue: {
        attributes : {value : '+1 (415) 867-5309'},
        test: function(component){
        	aura.test.assertEquals('+1 (415) 867-5309', component.find('link').getElement().textContent, "Visible phone number not correct");
            aura.test.assertTrue(aura.test.contains(unescape(component.find('link').getElement().href),'tel:+1(415)867-5309'), "Link not correct");
        }
    },

    /**
     * outputPhone with asterisk in value is not displayed as a link (or at least the portion following the asterisk) .
     */
    // https://gus.soma.salesforce.com/a07B0000000FDmFIAW
    testValueContainsAsterisk: {
        attributes : {value : '867-5309*222'},
        test: function(component){
            aura.test.assertEquals('867-5309*222', component.find('link').getElement().textContent, "Visible phone number not correct");
            aura.test.assertEquals('', component.find('link').getElement().href, "Number should not be linked");
        }
    },

    /**
     * outputPhone with value beginning with asterisk is not displayed as a link.
     */
    // https://gus.soma.salesforce.com/a07B0000000FDmFIAW
    testValueStartsWithAsterisk: {
        attributes : {value : '*69'},
        test: function(component){
            aura.test.assertEquals('*69', component.find('link').getElement().textContent, "Visible phone number not correct");
            aura.test.assertEquals('', component.find('link').getElement().href, "Number should not be linked");
        }
    },

    /**
     * outputPhone with pound sign in value is not displayed as a link (or at least the portion following the pound sign).
     */
    // https://gus.soma.salesforce.com/a07B0000000FDmFIAW
    testValueContainsPound: {
        attributes : {value : '867-5309 # 2222'},
        test: function(component){
            aura.test.assertEquals('867-5309 # 2222', component.find('link').getElement().textContent, "Visible phone number not correct");
            aura.test.assertEquals('', component.find('link').getElement().href, "Number should not be linked");
        }
    },

    /**
     * outputPhone with value beginning with pound sign is not displayed as a link.
     */
    // https://gus.soma.salesforce.com/a07B0000000FDmFIAW
    testValueStartsWithPound: {
        attributes : {value : '#2222'},
        test: function(component){
            aura.test.assertEquals('#2222', component.find('link').getElement().textContent, "Visible phone number not correct");
            aura.test.assertEquals('', component.find('link').getElement().href, "Number should not be linked");
        }
    },
    
    /**
     * outputPhone with leading and trailing whitespaces
     */
    testValueWithWhitespaces: {
    	attributes : {value : '   555-1234   '},
        test: function(component){
        	var link = component.find('link').getElement();
            aura.test.assertTrue(aura.test.contains(link.textContent, '555-1234'), "Visible phone number not correct");
            aura.test.assertEquals('tel:555-1234', link.href, "Link not correct");
        }
    }
})
