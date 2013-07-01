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
    /**
     * Verify behavior when 'Value' attribute is assigned an empty string.
     */
    testEmptyStringValue: {
        attributes: {value: ''},
        test: function(component){
            aura.test.assertEquals('', $A.test.getText(component.find('span').getElement()), "Expected an empty span.");
        }
    },

    /**
     * Verify behavior when 'Value' attribute is assigned a Garbage value.
     */
    testInvalidValue: {
        attributes: {value: 'cornholio'},
        test: function(component){
            aura.test.assertEquals("Invalid date time value", $A.test.getText(component.find('span').getElement()), "Value must be an ISO8601-formatted string or a number of milliseconds from Epoch.");
        }
    },
    
    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
    testEmptyFormat:{
        attributes: {value : '2004-09-23T16:30:00.000Z', format: '', langLocale: 'en', timezone: 'GMT'},
        test:function(component){
        	aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
        		aura.test.assertEquals("Sep 23, 2004 4:30:00 PM", $A.test.getText(component.find('span').getElement()), "Incorrect date/time format.");
        	});
        }
    },
    
    /**
     * Verify behavior when 'format' is given a valid time format.
     */
    testFormat: {
        attributes: {value : '2004-09-23T16:30:00.000Z', format: 'Z ss:mm:HH MM dd yyyy', langLocale: 'en', timezone: 'GMT'},
        test: function(component){
        	aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
        		aura.test.assertEquals("+00:00 00:30:16 09 23 2004", $A.test.getText(component.find('span').getElement()), "Incorrect date/time format in display.");
        	});
      }
    },
    
    /**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
    testInvalidFormat: {
        attributes: {value : '2004-09-23T16:30:00.000Z', format: 'cornoio', langLocale: 'en', timezone: 'GMT'},
        test: function(component){
        	aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
        		aura.test.assertEquals("cornoio", $A.test.getText(component.find('span').getElement()), "Invalid pattern character is output as it is.");
        	});
      }
    },
    
    /**
     * Verify AM/PM in a non-English language.
     */
    testLanguage: {
        attributes: {value : '2004-09-23T16:30:00.000Z', format: 'M/dd/yy h:mm A', langLocale: 'zh_CN', timezone: 'Asia/Shanghai'},
        test: function(component){
            aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
                aura.test.assertEquals("9/24/04 12:30 上午", $A.test.getText(component.find('span').getElement()), "Incorrect formatted datetime string.");
            });                        

        }
    },
    
    /**
     * Verify behavior when 'langLocale' is not provided.
     */
    testDefaultLangLocale:{
	attributes : {value:'2004-09-23T16:30:00.000Z', timezone: 'GMT'},
	test: function(component){	        
	        aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr  = $A.test.getText(component.find('span').getElement());
		        var dt            = 'Sep 23, 2004 4:30:00 PM';
	    		aura.test.assertEquals(dt, outputDateStr, "Should have used Default langLocale.");	        	
	        });	
        }
    },
    
    /**
     * Verify behavior when 'langLocale' is assigned a empty string.
     */
    testEmptyStringLangLocale:{
	attributes : {value:'2004-09-23T16:30:00.000Z', timezone: 'GMT', langLocale: ''},
	test: function(component){	        
	        aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr  = $A.test.getText(component.find('span').getElement());
		        var dt            = 'Sep 23, 2004 4:30:00 PM';
	    		aura.test.assertEquals(dt, outputDateStr, "Should have used Default langLocale.");	        	
	        });	
        }
    },
    
    /**
     * Verify behavior when 'langLocale' is assigned garbage.
     */
    testInvalidLangLocale:{
 	attributes : {value:'2004-09-23T16:30:00.000Z', timezone: 'GMT', langLocale: 'kk'},	
	test: function(component){	        
	        aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr  = $A.test.getText(component.find('span').getElement());
		        var dt            = 'Sep 23, 2004 4:30:00 PM';
	    		aura.test.assertEquals(dt, outputDateStr, "Should have used Default langLocale.");	        	
	        });	
        }
    },
    
    /**
     * Verify behavior when 'timezone' attribute is assigned an empty string.
     */
    testEmptyStringForTimeZone:{
        attributes: {value: '2004-09-23T16:30:00.000Z', timezone: '', format: 'M/dd/yy h:mm A', langLocale: 'en'},
        test: function(component){
        	aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){        		
        		var timezone = $A.getGlobalValueProviders().get("$Locale.timezone");
        		if(timezone  == "GMT"){
	        		aura.test.assertEquals("9/23/04 4:30 PM", $A.test.getText(component.find('span').getElement()), "Should have used default as default timezone.");
	        	}
	        	else if(timezone  == "America/Los_Angeles"){
	        		aura.test.assertEquals("9/23/04 9:30 AM", $A.test.getText(component.find('span').getElement()), "Should have used default as default timezone.");
	        	} 
	        	else{// For any other time zone we just make sure it has some value
	        		aura.test.assertTrue($A.test.getText(component.find('span').getElement()).length > 0, "Should have used default as default timezone.");	        		
	        	}
        	});
        }
    },
    
    /**
     * Verify behavior when 'timezone' is assigned a valid time zone.
     */
    testTimezoneByCity: {
        attributes: {value : '2004-09-23T16:30:00.000Z', timezone: 'America/New_York', format: 'M/dd/yy h:mm A', langLocale: 'en'},
        test: function(component){
        	aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
        		aura.test.assertEquals("9/23/04 12:30 PM", $A.test.getText(component.find('span').getElement()), "Incorrect date/time, failed to use specified timezone");
        	});
      }
    },
    
    testTimezoneObeysDayLightSaving: {
        attributes: {value : '2004-09-23T16:30:00.000Z', timezone: 'America/Los_Angeles', format: 'M/dd/yy h:mm A', langLocale: 'en'},
        test: function(component){
        	aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
        		aura.test.assertEquals("9/23/04 9:30 AM", $A.test.getText(component.find('span').getElement()), "Incorrect date/time, failed to recognize that timezone has Daylight saving in effect.");
        	});
      }
    },
    
    /**
     * Verify behavior when 'timezone' attribute is assigned a garbage value.
     */
    testInvalidTimezone: {
        attributes: {value : '2004-09-23T16:30:00.000Z', timezone: 'sasquatch', format: 'M/dd/yy h:mm A', langLocale: 'en'},
        test: function(component){
        	aura.test.addWaitFor(true, function(){return $A.test.getText(component.find('span').getElement()).length > 0;},function(){
        		var timezone = $A.getGlobalValueProviders().get("$Locale.timezone");
        		if(timezone  == "GMT"){
	        		aura.test.assertEquals("9/23/04 4:30 PM", $A.test.getText(component.find('span').getElement()), "Should have used default as default timezone.");
	        	}
	        	else if(timezone  == "America/Los_Angeles"){
	        		aura.test.assertEquals("9/23/04 9:30 AM", $A.test.getText(component.find('span').getElement()), "Should have used default as default timezone.");
	        	} 
	        	else{// For any other time zone we just make sure it has some value
	        		aura.test.assertTrue($A.test.getText(component.find('span').getElement()).length > 0, "Should have used default as default timezone.");	        		
	        	}
        	});
        }
    }

})
