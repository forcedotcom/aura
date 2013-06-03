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
    
    testDefaultFormat:{
        attributes : {displayDatePicker: 'true', value: '2012-09-10'},
        test: function(cmp){
            var inputDateStr = cmp.find("inputText").getElement().value;
            aura.test.assertEquals("Sep 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },
    
    testlangLocale:{
        attributes : {displayDatePicker: 'true', format: 'MMMM dd, yyyy', value: '2012-09-10', langLocale: 'es'},
        test: function(cmp){
            var inputDateStr = cmp.find("inputText").getElement().value;
            aura.test.assertEquals("septiembre 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },
    
    testInputDateToday:{
        attributes : {displayDatePicker:'true', format: 'YYYY-MM-DD'},
        test: function(cmp){
            cmp.find("datePicker").get('c.selectToday').run()
            var inputDateStr = cmp.find("inputText").getElement().value;
            var dt           = moment().format('YYYY-MM-DD');
            aura.test.assertTrue(aura.test.contains(dt, inputDateStr), "Dates are not the same and they should be");
    },

	/**
     * Verify behavior when 'format' is given a valid date format.
     */
	testTodayInEuropeFormat:{
	attributes : {displayDatePicker:'true', format: 'DD-MM-YYYY'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').run()
	        var inputDateStr = cmp.find("inputText").getElement().value;
	        var dt           = moment().format('DD-MM-YYYY');
    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }
    },

	/**
     * Verify behavior when 'format' is given a valid date format.
     */
	testMonthNameInFormat:{
	attributes : {displayDatePicker:'true', format: 'MMMM DD,YYYY'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').run()
	        var inputDateStr = cmp.find("inputText").getElement().value;
	        var dt           = moment().format('MMMM DD,YYYY');
    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }
    },

	/**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
	testEmptyStringForFormat:{
	attributes : {displayDatePicker:'true', format: ''},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').run()
	        var inputDateStr = cmp.find("inputText").getElement().value;
	        var dt           = moment().format('YYYY-MM-DD');
    		aura.test.assertTrue(aura.test.contains(inputDateStr, dt), "Dates are not the same and they should be");
        }
    },

	/**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
	testInvalidFormat:{
	attributes : {displayDatePicker:'true', format: 'KKKKKK'},
	test: function(cmp){			
	        cmp.find("datePicker").get('c.selectToday').run()
	        var inputDateStr = cmp.find("inputText").getElement().value;
	        var dt           = moment().format('KKKKKK');
    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }
    }
})
