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
        attributes : {value: '2012-09-10T14:00:00.000Z', format: 'MM/dd/yyyy HH:mm:ss', timezone: 'Europe/Berlin'},
        test: function(cmp){
            aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
                var inputDateStr = cmp.find("inputText").getElement().value;
                aura.test.assertEquals("09/10/2012 16:00:00", inputDateStr, "Incorrect initial date/time display.");
            });
        }
    },

    /**
     * Verify behavior when 'Value' attribute is assigned an empty string.
     */  
    testEmptyStringValue: {
        attributes: {value: '', langLocale: 'en'},
        test: function(cmp){        	
			var inputDateStr  = cmp.find("inputText").getElement().value;	        
    		aura.test.assertEquals('', inputDateStr, "Expected an empty inputText.");			
        }
    },
    
    /**
     * Verify behavior when 'Value' attribute is assigned a Garbage value.
     */
    testInvalidValue: {
        attributes: {value: 'cornholio', langLocale: 'en'},
        test: function(cmp){
        	aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
				var inputDateStr  = cmp.find("inputText").getElement().value;		        
	    		aura.test.assertEquals('Invalid date time value', inputDateStr, "Value must be an ISO8601-formatted string or a number of milliseconds from Epoch.");
			});            
        }
    },     
    
    /**
     * Verify behavior when 'timezone' attribute is assigned a garbage value.
     */
    testInvalidTimeZone:{
	attributes : {displayDatePicker:'true', langLocale: 'en', timezone: 'dummy'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').run();
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = moment().format('YYYY-MM-DD 00:00');
	    		aura.test.assertEquals(dt, inputDateStr, "Should have used GMT timezone.");	        	
	        });	        
        }
    },        

    /**
     * Verify behavior when 'timezone' is assigned a empty string.
     */
    testEmptyStringTimeZone:{
	attributes : {displayDatePicker:'true', langLocale: 'en', timezone: ''},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').run();
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = moment().format('YYYY-MM-DD 00:00');
	    		aura.test.assertEquals(dt, inputDateStr, "Should have used GMT timezone.");	        	
	        });	
        }
    },  
    
    /**
     * Verify behavior when 'langLocale' is not provided.
     */
    testDefaultLangLocale:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A'},
	test: function(cmp){	        
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = '9/23/04 4:30 PM';
	    		aura.test.assertEquals(dt, inputDateStr, "Should have used Default langLocale.");	        	
	        });	
        }
    },
    
    /**
     * Verify behavior when 'langLocale' is assigned a empty string.
     */
    /*testEmptyStringLangLocale:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A', langLocale: ''},
	test: function(cmp){	        
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = '9/23/04 4:30 PM';
	    		aura.test.assertEquals(dt, inputDateStr, "Should have used Default langLocale.");	        	
	        });	
        }
    }, */
    
    /**
     * Verify behavior when 'langLocale' is assigned garbage.
     */
    /*testInvalidLangLocale:{
 	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A', langLocale: 'xx'},	
	test: function(cmp){	        
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = '9/23/04 4:30 PM';
	    		aura.test.assertEquals(dt, inputDateStr, "Should have used Default langLocale.");	        	
	        });	
        }
    },*/ 
    
    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
    testEmptyFormat:{
        attributes: {value : '2004-09-23T16:30:00.000Z', langLocale: 'en', format: '', timezone: 'GMT'},
        test:function(cmp){
        	aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
        		var inputDateStr  = cmp.find("inputText").getElement().value;
        		aura.test.assertEquals("2004-09-23T16:30:00+00:00", inputDateStr, "Incorrect date/time format.");
        	});
        }
    },
    
    /**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
    testInvalidFormat: {
        attributes: {value : '2004-09-23T16:30:00.000Z', langLocale: 'en', format: 'cornoio', timezone: 'GMT'},
        test: function(cmp){
        	aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
        		var inputDateStr  = cmp.find("inputText").getElement().value;
        		aura.test.assertEquals("cornoio", inputDateStr, "Invalid pattern character is output as it is.");
        	});
      }
    },
    
    /*
     * Note: currently dateTimePicker, requires the user to manually put the time they are looking for. The
     * following tests are just a stub for future functionality.
     */	  
	
    /**
     * Verify Today in default time zone.
     */
    testTodayInDefaultTimeZone:{
	attributes : {displayDatePicker:'true', timezone: 'GMT'},
	test: function(cmp){				
	        cmp.find("datePicker").get('c.selectToday').run();
	        var inputDateStr  = cmp.find("inputText").getElement().value;
	        var dt            = moment().format('YYYY-MM-DD 00:00');
    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }
    },

    /**
     * Verify Today in LA time zone.
     */
    testTodayInLosAngeles:{
	attributes : {displayDatePicker:'true', langLocale: 'en', timezone: 'America/Los_Angeles'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').run();
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = moment().subtract('days',1).format('YYYY-MM-DD 17:00');
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");	        	
	        });			
        }
    },

    /**
     * Verify Today in NY time zone.
     */
    testTodayInNewYork:{
	attributes : {displayDatePicker:'true', langLocale: 'en', timezone: 'America/New_York'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').run();	        
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = moment().subtract('days',1).format('YYYY-MM-DD 20:00');
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");	        	
	        });	        	        
        }
    },

    /**
     * Verify a value in default time zone.
     */
	testTimeInDefaultTimeZone:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A', langLocale: 'en', timezone: 'GMT'},
	test: function(cmp){				
			aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
				var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = '9/23/04 4:30 PM';
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
			});
        }
    },

    /**
     * Verify a value in LA time zone.
     */
	testTimeInLosAngeles:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A', langLocale: 'en', timezone: 'America/Los_Angeles'},
	test: function(cmp){
			aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
		        var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = '9/23/04 9:30 AM';
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
			});
        }
    },
    
    /**
     * Verify a value in LA time zone.
     */
	testTimeInLosAngeles11:{
	attributes : {value:'2013-05-31T00:00:00.000Z', displayDatePicker:'true', format: 'YYYY-MM-dd HH:mm', langLocale: 'en', timezone: 'America/Los_Angeles'},
	test: function(cmp){
			aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
		        var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = '2013-05-30 17:00';
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
			});
        }
    },

    /**
     * Verify a value in NY time zone.
     */
	testTimeInNewYork:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A', langLocale: 'en', timezone: 'America/New_York'},
	test: function(cmp){				
			aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
		        var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = '9/23/04 12:30 PM';
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
			});
        }
    },

    /**
     * Verify a value in other language.
     */
	testLanguage:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A', langLocale: 'zh_CN', timezone: 'Asia/Shanghai'},
	test: function(cmp){			
			aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;		        
		        var dt            = '9/24/04 12:30 \u4e0a\u5348';
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");	        	
	        });				        
        }
    }

})
