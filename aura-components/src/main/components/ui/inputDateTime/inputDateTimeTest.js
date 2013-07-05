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
	/*
     * Note: currently dateTimePicker, requires the user to manually put the time they are looking for. The
     * following tests are just a stub for future functionality.
     */	  
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
        attributes: {value: ''},
        test: function(cmp){        	
			var inputDateStr  = cmp.find("inputText").getElement().value;	        
    		aura.test.assertEquals('', inputDateStr, "Expected an empty inputText.");			
        }
    },
    
    /**
     * Verify behavior when 'Value' attribute is assigned a Garbage value.
     */
    testInvalidValue: {
        attributes: {value: 'cornholio'},
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
	attributes : {displayDatePicker:'true', timezone: 'dummy', format:'MMM dd, yyyy h:mm:ss a'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').runDeprecated();
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
	    		aura.test.assertEquals(dt, inputDateStr, "Should have used default timezone.");	        	
	        });	        
        }
    },   
    
    /**
     * Verify behavior when 'timezone' attribute is assigned a garbage value.
     */    
    testInvalidTimeZoneUsingValue:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', timezone: 'dummy'},
	test: function(cmp){	        
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
	        	var timezone = $A.getGlobalValueProviders().get("$Locale.timezone");
	        	if(timezone  == "GMT"){
	    			aura.test.assertEquals("Sep 23, 2004 4:30:00 PM", inputDateStr, "Should have used default timezone.");
	        	}
	        	else if(timezone  == "America/Los_Angeles"){
	    			aura.test.assertEquals("Sep 23, 2004 9:30:00 AM", inputDateStr, "Should have used default timezone.");
	        	} 
	        	else{// For any other time zone we just make sure it has some value
	        		aura.test.assertTrue(inputDateStr.length > 0, "Should have used default timezone.");
	        	}
	        });	        
        }
    },   

    /**
     * Verify behavior when 'timezone' is assigned a empty string.
     */
    testEmptyStringTimeZone:{
	attributes : {displayDatePicker:'true', timezone: '', format:'MMM dd, yyyy h:mm:ss a'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').runDeprecated();
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
	        	var dt            = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
	    		aura.test.assertEquals(dt, inputDateStr, "Should have used default timezone.");	        	
	        });	
        }
    },  
    
    /**
     * Verify behavior when 'langLocale' is not provided.
     */
    testDefaultLangLocale:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', timezone: 'GMT'},
	test: function(cmp){	        
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;		        
	    		aura.test.assertEquals("Sep 23, 2004 4:30:00 PM", inputDateStr, "Should have used Default langLocale.");	        	
	        });	
        }
    },
    
    /**
     * Verify behavior when 'langLocale' is assigned a empty string.
     */
    testEmptyStringLangLocale:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', langLocale: '', timezone: 'GMT'},
	test: function(cmp){	        
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;		        
	    		aura.test.assertEquals("Sep 23, 2004 4:30:00 PM", inputDateStr, "Should have used Default langLocale.");	        	
	        });	
        }
    },
    
    /**
     * Verify behavior when 'langLocale' is assigned garbage.
     */
    testInvalidLangLocale:{
 	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', langLocale: 'xx', timezone: 'GMT'},	
	test: function(cmp){	        
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;		        
	    		aura.test.assertEquals("Sep 23, 2004 4:30:00 PM", inputDateStr, "Should have used Default langLocale.");	        	
	        });	
        }
    }, 
    
    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
    testEmptyFormat:{
        attributes: {value : '2004-09-23T16:30:00.000Z', format: '', timezone: 'GMT'},
        test:function(cmp){
        	aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
        		var inputDateStr  = cmp.find("inputText").getElement().value;
        		aura.test.assertEquals("Sep 23, 2004 4:30:00 PM", inputDateStr, "Incorrect date/time format.");
        	});
        }
    },
    
    /**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
    testInvalidFormat: {
        attributes: {value : '2004-09-23T16:30:00.000Z', format: 'cornoio'},
        test: function(cmp){
        	aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
        		var inputDateStr  = cmp.find("inputText").getElement().value;
        		aura.test.assertEquals("cornoio", inputDateStr, "Invalid pattern character is output as it is.");
        	});
      }
    },        
	
    /**
     * Verify Today in default time zone.
     */
    testTodayInGMT:{
	attributes : {displayDatePicker:'true', timezone: 'GMT', format:'MMM dd, yyyy h:mm:ss a'},
	test: function(cmp){				
	        cmp.find("datePicker").get('c.selectToday').runDeprecated();
	        var inputDateStr  = cmp.find("inputText").getElement().value;
	        var dt            = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }
    },

    /**
     * Verify Today in LA time zone.
     */
    testTodayInLosAngeles:{
	attributes : {displayDatePicker:'true', format:'MMM dd, yyyy h:mm:ss a'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').runDeprecated();
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
	        	var dt            = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");	        	
	        });			
        }
    },

    /**
     * Verify Today in NY time zone.
     */
    testTodayInNewYork:{
	attributes : {displayDatePicker:'true', timezone: 'America/New_York', format:'MMM dd, yyyy h:mm:ss a'},
	test: function(cmp){
	        cmp.find("datePicker").get('c.selectToday').runDeprecated();	        
	        aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;
	        	var dt            = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");	        	
	        });	        	        
        }
    },

    /**
     * Verify a value in default time zone.
     */
	testTimeInGMT:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A', timezone: 'GMT'},
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
    testTimeInLA:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A', timezone: 'America/Los_Angeles'},
	test: function(cmp){
			aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
		        var inputDateStr  = cmp.find("inputText").getElement().value;
		        var dt            = '9/23/04 9:30 AM';
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
			});
        }
    },       

    /**
     * Verify a value in NY time zone.
     */
	testTimeInNewYork:{
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', format: 'M/dd/yy h:mm A', timezone: 'America/New_York'},
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
	attributes : {value:'2004-09-23T16:30:00.000Z', displayDatePicker:'true', timezone: 'GMT', langLocale: 'fr'},
	test: function(cmp){			
			aura.test.addWaitFor(true, function(){return cmp.find("inputText").getElement().value.length > 0;},function(){
	        	var inputDateStr  = cmp.find("inputText").getElement().value;		        
		        var dt            = 'sept. 23, 2004 4:30:00 PM';
	    		aura.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");	        	
	        });				        
        }
    }

})
