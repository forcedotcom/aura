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
    testInitialValue:{
        attributes : {displayDatePicker: 'true', value: '2012-09-10', format: 'MM/dd/yyyy'},
        test: function(cmp){
            var inputDateStr = cmp.find("inputText").getElement().value;
            aura.test.assertEquals("09/10/2012", inputDateStr, "Dates are not the same and they should be");
        }
    },
    
    /**
     * Verify behavior when 'format' attribute is not assigned a value.
     */
    testDefaultFormat:{
        attributes : {displayDatePicker: 'true', value: '2012-09-10'},
        test: function(cmp){
            var inputDateStr = cmp.find("inputText").getElement().value;
            aura.test.assertEquals("Sep 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },
    
    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
	testEmptyFormat:{
	attributes : {displayDatePicker:'true', value: '2012-09-10', format: ''},
	test: function(cmp){	        
	        var inputDateStr = cmp.find("inputText").getElement().value;	        
    		aura.test.assertEquals("Sep 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },
    
    /**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
	testInvalidFormat:{
	attributes : {displayDatePicker:'true', format: 'KKKKKK'},
	test: function(cmp){			
	        cmp.find("datePicker").get('c.selectToday').runDeprecated();
	        var inputDateStr = cmp.find("inputText").getElement().value;
	        var dt           = moment().format('KKKKKK');
    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }
    },
    
    /**
     * Verify behavior when 'langLocale' attribute is not assigned a value.
     */
    testDefaultLangLocale:{
        attributes : {displayDatePicker: 'true', format: 'MMMM dd, yyyy', value: '2012-09-10'},
        test: function(cmp){
            var inputDateStr = cmp.find("inputText").getElement().value;
            aura.test.assertEquals("September 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },
    
    /**
     * Verify behavior when 'langLocale' attribute is assigned a different value.
     */
    testLangLocale:{
        attributes : {displayDatePicker: 'true', format: 'MMMM dd, yyyy', value: '2012-09-10', langLocale: 'es'},
        test: function(cmp){
            var inputDateStr = cmp.find("inputText").getElement().value;
            aura.test.assertEquals("septiembre 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },
    
    /**
     * Verify behavior when 'langLocale' attribute is not assigned an empty string.
     */
    testEmptyLangLocale:{
        attributes : {displayDatePicker: 'true', format: 'MMMM dd, yyyy', value: '2012-09-10', langLocale: ''},
        test: function(cmp){
            var inputDateStr = cmp.find("inputText").getElement().value;
            aura.test.assertEquals("September 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },
    
    /**
     * Verify behavior when 'langLocale' attribute is not assigned an invalid value.
     */
    testInvalidLangLocale:{
        attributes : {displayDatePicker: 'true', format: 'MMMM dd, yyyy', value: '2012-09-10', langLocale: 'xx'},
        test: function(cmp){
            var inputDateStr = cmp.find("inputText").getElement().value;
            aura.test.assertEquals("September 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },
       
	/**
     * Verify behavior of Today() with default 'format' value.
     */
	testToday:{
	attributes : {displayDatePicker:'true'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').runDeprecated();
	        var inputDateStr = cmp.find("inputText").getElement().value;
	        var dt           = moment().format('MMM DD, YYYY');
    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }
    },

	/**
     * Verify behavior of Today() when 'format' is assigned a valid value.
     */
	testTodayDifferentFormat:{
	attributes : {displayDatePicker:'true', format: 'DD/MM/YYYY'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').runDeprecated();
	        var inputDateStr = cmp.find("inputText").getElement().value;
	        var dt           = moment().format('DD/MM/YYYY');
    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }
    }	
        
})
