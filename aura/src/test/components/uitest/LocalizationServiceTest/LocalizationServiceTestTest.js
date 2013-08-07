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
	testDisplayDuration:{
        test:function(component){
        	var num = 1095957000000;
			var duration = $A.localizationService.duration(num, 'milliseconds');		        
	        aura.test.assertEquals("35 years", $A.localizationService.displayDuration(duration, false), "Both values should be same.");
	        aura.test.assertEquals("in 35 years", $A.localizationService.displayDuration(duration, true), "Both values should be same.");		        		        	    			        
        }        
    },

	testDisplayDurationInDays:{
        test:function(component){
        	var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');		        
    		aura.test.assertEquals(12684.6875, $A.localizationService.displayDurationInDays(duration), "Both values should be same.");	        		        
        }
    },	

	testDisplayDurationInHours:{
        test:function(component){
        	var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');		        
    		aura.test.assertEquals(304432.5, $A.localizationService.displayDurationInHours(duration), "Both values should be same.");	        		        
        }
    },

	testDisplayDurationInMilliseconds:{
        test:function(component){
        	var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');		        
    		aura.test.assertEquals(num, $A.localizationService.displayDurationInMilliseconds(duration), "Both values should be same.");	        		        
        }
    },

	testDisplayDurationInMinutes:{
        test:function(component){
        	var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');		        
    		aura.test.assertEquals(18265950, $A.localizationService.displayDurationInMinutes(duration), "Both values should be same.");	        		        
        }
    },
    
	testDisplayDurationInMonths:{
        test:function(component){            
			var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');		        
    		aura.test.assertEquals(422.8229166666667, $A.localizationService.displayDurationInMonths(duration), "Both values should be same.");	        		        
        }
    },
    
	testDisplayDurationInSeconds:{
        test:function(component){            
			var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');		        
    		aura.test.assertEquals(num/1000, $A.localizationService.displayDurationInSeconds(duration), "Both values should be same.");	        		        
        }
    },
    
	testDisplayDurationInYears:{
        test:function(component){            
			var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');		        
    		aura.test.assertEquals(34.75256849315068, $A.localizationService.displayDurationInYears(duration), "Both values should be same.");	        		        
        }
    },
    
    testGetDaysInDuration:{
        test:function(component){                        
			var num = 23;
			var duration = $A.localizationService.duration(num, 'days');		        
    		aura.test.assertEquals(num, $A.localizationService.getDaysInDuration(duration), "Both values should be same.");	        		        	
        }
    },
    
    testGetHoursInDuration:{
        test:function(component){                        
			var num = 16;
			var duration = $A.localizationService.duration(num, 'hours');		        
    		aura.test.assertEquals(num, $A.localizationService.getHoursInDuration(duration), "Both values should be same.");	        		        	
        }
    },
    
    testGetMillisecondsInDuration:{
        test:function(component){                        
			var num = 50;
			var duration = $A.localizationService.duration(num, 'milliseconds');		        
    		aura.test.assertEquals(num, $A.localizationService.getMillisecondsInDuration(duration), "Both values should be same.");	        		        	
        }
    },
    
    testGetMinutesInDuration:{
        test:function(component){                        
			var num = 30;
			var duration = $A.localizationService.duration(num, 'minutes');		        
    		aura.test.assertEquals(num, $A.localizationService.getMinutesInDuration(duration), "Both values should be same.");	        		        	
        }
    },
    
    testGetMonthsInDuration:{
        test:function(component){                        
			var num = 9;
			var duration = $A.localizationService.duration(num, 'months');		        
    		aura.test.assertEquals(num, $A.localizationService.getMonthsInDuration(duration), "Both values should be same.");	        		        	
        }
    },
    
    testGetSecondsInDuration:{
        test:function(component){                        
			var num = 30;
			var duration = $A.localizationService.duration(num, 'seconds');		        
    		aura.test.assertEquals(num, $A.localizationService.getSecondsInDuration(duration), "Both values should be same.");	        		        	
        }
    },
    
    testGetYearsInDuration:{
        test:function(component){                        
			var num = 13;
			var duration = $A.localizationService.duration(num, 'years');		        
    		aura.test.assertEquals(num, $A.localizationService.getYearsInDuration(duration), "Both values should be same.");	        		        	
        }
    },
    
    testIsAfter:{
    	test:function(component){
	        var testCmp = component.find('myOutputDateTimeComp');
	        aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
		        var dateObj1 = $A.localizationService.parseDateTime(outputDateStr, 'MMM DD, YYYY h:mm:ss A', 'en');			        
		        
		        // seconds
		        var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:01 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'seconds'), "date1 is not after date2.");
	    		aura.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'seconds'), "date2 is after date1.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'seconds'), "Both dates are not same.");
	    		
	    		//minutes
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:31:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'minutes'), "date1 is not after date2.");
	    		aura.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'minutes'), "date1 is not after date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'minutes'), "Both dates are not same.");
	    		
	    		//minutes
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 5:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'hours'), "date1 is not after date2.");
	    		aura.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'hours'), "date1 is not after date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'hours'), "Both dates are not same.");
	    		
	    		//days
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 24, 2004 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'days'), "date1 is not after date2.");
	    		aura.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'days'), "date1 is not after date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'days'), "Both dates are not same.");
	    		
	    		//months
	    		dateObj2 = $A.localizationService.parseDateTime('Oct 23, 2004 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'months'), "date1 is not after date2.");
	    		aura.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'months'), "date1 is not after date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'months'), "Both dates are not same.");
	    		
	    		//years
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2005 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'years'), "date1 is not after date2.");
	    		aura.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'years'), "date1 is not after date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'years'), "Both dates are not same.");
	        });	
    	}
	},
	
	testIsBefore:{
    	test:function(component){
	        var testCmp = component.find('myOutputDateTimeComp');
	        aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
		        var dateObj1 = $A.localizationService.parseDateTime(outputDateStr, 'MMM DD, YYYY h:mm:ss A', 'en');			        
		        
		        // seconds
		        var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:01 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'seconds'), "date1 is before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'seconds'), "date2 is not before date1.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'seconds'), "Both dates are not same.");
	    		
	    		//minutes
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:31:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'minutes'), "date1 is before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'minutes'), "date1 is not before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'minutes'), "Both dates are not same.");
	    		
	    		//minutes
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 5:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'hours'), "date1 is before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'hours'), "date1 is not before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'hours'), "Both dates are not same.");
	    		
	    		//days
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 24, 2004 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'days'), "date1 is before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'days'), "date1 is not before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'days'), "Both dates are not same.");
	    		
	    		//months
	    		dateObj2 = $A.localizationService.parseDateTime('Oct 23, 2004 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'months'), "date1 is before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'months'), "date1 is not before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'months'), "Both dates are not same.");
	    		
	    		//years
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2005 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'years'), "date1 is before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'years'), "date1 is not before date2.");
	    		aura.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'years'), "Both dates are not same.");
	        });	
    	}
	},
	
	testIsSame:{
    	test:function(component){
	        var testCmp = component.find('myOutputDateTimeComp');
	        aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
		        var dateObj1 = $A.localizationService.parseDateTime(outputDateStr, 'MMM DD, YYYY h:mm:ss A', 'en');			        
		        var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
		        
		        aura.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2), "Both dates are same.");
		        aura.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'seconds'), "Both dates are same.");
		        aura.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'minutes'), "Both dates are same.");
		        aura.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'hours'), "Both dates are same.");
		        aura.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'days'), "Both dates are same.");
		        aura.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'weeks'), "Both dates are same.");
		        aura.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'months'), "Both dates are same.");
		        aura.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'years'), "Both dates are same.");		        
	        });	
    	}
	},
    
    testEndOf:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
	        	
	        	var dateObj = $A.localizationService.endOf(outputDateStr, 'second');		        
		        aura.test.assertEquals('Sep 23, 2004 4:30:00 PM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	        	
		        dateObj = $A.localizationService.endOf(outputDateStr, 'minute');		        
	    		aura.test.assertEquals('Sep 23, 2004 4:30:59 PM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	    		
	    		dateObj = $A.localizationService.endOf(outputDateStr, 'hour');		        
	    		aura.test.assertEquals('Sep 23, 2004 4:59:59 PM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	    		
	    		dateObj = $A.localizationService.endOf(outputDateStr, 'day');		        
	    		aura.test.assertEquals('Sep 23, 2004 11:59:59 PM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	    		
	    		dateObj = $A.localizationService.endOf(outputDateStr, 'month');		        
	    		aura.test.assertEquals('Sep 30, 2004 11:59:59 PM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	    		
	    		dateObj = $A.localizationService.endOf(outputDateStr, 'year');		        
	    		aura.test.assertEquals('Dec 31, 2004 11:59:59 PM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");	    		
	        });	
        }
    },  

	
    testStartOf:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());		        
	        	
	        	var dateObj = $A.localizationService.startOf(outputDateStr, 'second');		        
		        aura.test.assertEquals('Sep 23, 2004 4:30:00 PM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	        	
		        dateObj = $A.localizationService.startOf(outputDateStr, 'minute');		        
	    		aura.test.assertEquals('Sep 23, 2004 4:30:00 PM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	    		
	    		dateObj = $A.localizationService.startOf(outputDateStr, 'hour');		        
	    		aura.test.assertEquals('Sep 23, 2004 4:00:00 PM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	    		
	    		dateObj = $A.localizationService.startOf(outputDateStr, 'day');		        
	    		aura.test.assertEquals('Sep 23, 2004 12:00:00 AM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	    		
	    		dateObj = $A.localizationService.startOf(outputDateStr, 'month');		        
	    		aura.test.assertEquals('Sep 01, 2004 12:00:00 AM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	    		
	    		dateObj = $A.localizationService.startOf(outputDateStr, 'year');		        
	    		aura.test.assertEquals('Jan 01, 2004 12:00:00 AM', $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en'), "Both values should be same.");
	        });	
        }
    },    	
    
    testFormatDate:{
        test:function(component){
            var testCmp = component.find('myOutputDateComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
	        	aura.test.assertEquals($A.localizationService.formatDate('Sep 23, 2004', 'MMM DD, YYYY', 'en'), outputDateStr, "Both dates should be same.");	        	
	    		aura.test.assertEquals($A.localizationService.formatDate('Sep 23, 2004', '', 'en'), outputDateStr, "Both dates should be same.");	    		
	    		try{
	    			$A.localizationService.formatDate('', '', 'en');	    			
	    		}
	    		catch(e){
	    			aura.test.assertEquals("Invalid date value", e.message, "Expected:Invalid date value");
	    		}
	    		
	    		try{
	    			$A.localizationService.formatDate('a', '', 'en');	    			
	    		}
	    		catch(e){
	    			aura.test.assertEquals("Invalid date value", e.message, "Expected:Invalid date value");
	    		}
	        });	
        }
    },
    
    testFormatDateUTC:{
        test:function(component){
            var testCmp = component.find('myOutputDateComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());		        				
	    		aura.test.assertEquals($A.localizationService.formatDateUTC('Sep 23, 2004', 'MMM DD, YYYY', 'en'), outputDateStr, "Both dates should be same.");	        	
	    		aura.test.assertEquals($A.localizationService.formatDateUTC('Sep 23, 2004', '', 'en'), outputDateStr, "Both dates should be same.");
	    		try{
	    			$A.localizationService.formatDateUTC('', '', 'en');	    			
	    		}
	    		catch(e){
	    			aura.test.assertEquals("Invalid date value", e.message, "Expected:Invalid date value");
	    		}
	    		try{
	    			$A.localizationService.formatDateUTC('a', '', 'en');	    			
	    		}
	    		catch(e){
	    			aura.test.assertEquals("Invalid date value", e.message, "Expected:Invalid date value");
	    		}
	        });	
        }
    },
    
    testFormatDateTime:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());		        				
	    		aura.test.assertEquals($A.localizationService.formatDateTime('Sep 23, 2004 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en'), outputDateStr, "Both datetimes should be same.");
	    		aura.test.assertEquals($A.localizationService.formatDateTime('Sep 23, 2004 4:30:00 PM', '', 'en'), outputDateStr, "Both datetimes should be same.");
	    		try{
	    			$A.localizationService.formatDateTime('', '', 'en');	    			
	    		}
	    		catch(e){
	    			aura.test.assertEquals("Invalid date time value", e.message, "Expected:Invalid date time value");
	    		}
	    		try{
	    			$A.localizationService.formatDateTime('a', '', 'en');	    			
	    		}
	    		catch(e){
	    			aura.test.assertEquals("Invalid date time value", e.message, "Expected:Invalid date time value");
	    		}
	        });	
        }
    },
    
    testFormatDateTimeUTC:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());		        				
	    		aura.test.assertEquals($A.localizationService.formatDateTimeUTC('Sep 23, 2004 9:30:00 AM', 'MMM DD, YYYY h:mm:ss A', 'en'), outputDateStr, "Both datetimes should be same.");
	    		aura.test.assertEquals($A.localizationService.formatDateTimeUTC('Sep 23, 2004 9:30:00 AM', '', 'en'), outputDateStr, "Both datetimes should be same.");
	    		try{
	    			$A.localizationService.formatDateTimeUTC('', '', 'en');	    			
	    		}
	    		catch(e){
	    			aura.test.assertEquals("Invalid date time value", e.message, "Expected:Invalid date time value");
	    		}
	    		try{
	    			$A.localizationService.formatDateTimeUTC('a', '', 'en');	    			
	    		}
	    		catch(e){
	    			aura.test.assertEquals("Invalid date time value", e.message, "Expected:Invalid date time value");
	    		}
	        });	
        }
    },
    
    testFormatTime:{
        test:function(component){
            var testCmp = component.find('myOutputTextComp');
            aura.test.assertNotNull(testCmp);            
            var outputDateStr = $A.test.getText(testCmp.find('span').getElement());        		        			
    		aura.test.assertEquals($A.localizationService.formatTime('Sep 23, 2004 4:30:00 PM', 'h:mm:ss A', 'en'), outputDateStr, "Both times should be same.");
    		aura.test.assertEquals($A.localizationService.formatTime('Sep 23, 2004 4:30:00 PM', '', 'en'), outputDateStr, "Both times should be same.");
    		try{
    			$A.localizationService.formatTime('', '', 'en');	    			
    		}
    		catch(e){
    			aura.test.assertEquals("Invalid time value", e.message, "Expected:Invalid time value");
    		}
    		try{
    			$A.localizationService.formatTime('a', '', 'en');	    			
    		}
    		catch(e){
    			aura.test.assertEquals("Invalid time value", e.message, "Expected:Invalid time value");
    		}
        }
    },
    
    testFormatTimeUTC:{
        test:function(component){
        	var testCmp = component.find('myOutputTextComp');
            aura.test.assertNotNull(testCmp);            
            var outputDateStr = $A.test.getText(testCmp.find('span').getElement());  		        			
    		aura.test.assertEquals($A.localizationService.formatTimeUTC('Sep 23, 2004 9:30:00 AM', 'h:mm:ss A', 'en'), outputDateStr, "Both times should be same.");
    		aura.test.assertEquals($A.localizationService.formatTimeUTC('Sep 23, 2004 9:30:00 AM', '', 'en'), outputDateStr, "Both times should be same.");
    		try{
    			$A.localizationService.formatTimeUTC('', '', 'en');	    			
    		}
    		catch(e){
    			aura.test.assertEquals("Invalid time value", e.message, "Expected:Invalid time value");
    		}
    		try{
    			$A.localizationService.formatTimeUTC('a', '', 'en');	    			
    		}
    		catch(e){
    			aura.test.assertEquals("Invalid time value", e.message, "Expected:Invalid time value");
    		}
        }
    },
    
    testParseDateTime:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
		        var dateObj = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
				var dt = $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
	    			    		
	    		aura.test.assertEquals(null, $A.localizationService.parseDateTime('', 'MMM DD, YYYY h:mm:ss A', 'en'), "Expect null.");
	        });	
        }
    },
    
    testToISOString:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
	        	var dateObj = new Date(2004,8,23,4,30,00);
				var dt1 = $A.localizationService.toISOString(dateObj);				
				var dt2 = $A.localizationService.formatDateTimeUTC(outputDateStr, "YYYY-MM-DDThh:mm:ss.SSS", 'en');
	    		aura.test.assertEquals('2004-09-23T11:30:00.000Z', dt1, "Both dates should be same.");	    		
	    		aura.test.assertEquals('2004-09-23T11:30:00.000', dt2, "Both dates should be same.");
	    		aura.test.assertEquals('', $A.localizationService.toISOString(''), "Expect ''.");
	    		aura.test.assertEquals(null, $A.localizationService.toISOString(null), "Expect null.");
	        });	
        }
    },
    
    testParseDateTimeISO8601:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
	        	var dateObj = $A.localizationService.parseDateTimeISO8601('2004-09-23T16:30:00');
				var dt = $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(dt, outputDateStr, "Both dates should be same.");	    		
	    			    		
	    		aura.test.assertEquals(null, $A.localizationService.parseDateTimeISO8601(''), "Expect null.");
	        });	
        }
    },
    
    testParseDateTimeUTC:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
		        var dateObj = $A.localizationService.parseDateTimeUTC('Sep 23, 2004 11:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
				var dt = $A.localizationService.formatDateTime(dateObj, 'MMM DD, YYYY h:mm:ss A', 'en');
	    		aura.test.assertEquals(dt, outputDateStr, "Both dates should be same.");	
	    		
	    		aura.test.assertEquals(null, $A.localizationService.parseDateTimeUTC('', 'MMM DD, YYYY h:mm:ss A', 'en'), "Expected null.");
	        });	
        }
    },
    
    testUTCToWallTime:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());		        				
	        	var dateObj1 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	        	
	        	var callback1 = function(walltime){
	        		var dt = $A.localizationService.formatDateTime(walltime, 'MMM DD, YYYY h:mm:ss A', 'en');
	        		aura.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
	        	}
	        	
				$A.localizationService.UTCToWallTime(dateObj1, 'GMT', callback1);
				
				// Now use EST				
				var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 8:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	        	
	        	var callback2 = function(walltime){
	        		var dt = $A.localizationService.formatDateTime(walltime, 'MMM DD, YYYY h:mm:ss A', 'en');
	        		aura.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
	        	}
	        	
				$A.localizationService.UTCToWallTime(dateObj2, 'America_NewYork', callback2);
				
				// Now use PST				
				var dateObj3 = $A.localizationService.parseDateTime('Sep 23, 2004 11:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	        	
	        	var callback3 = function(walltime){
	        		var dt = $A.localizationService.formatDateTime(walltime, 'MMM DD, YYYY h:mm:ss A', 'en');
	        		aura.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
	        	}
	        	
				$A.localizationService.UTCToWallTime(dateObj3, 'America_LosAngeles', callback3);
	    		
	        });	
        }
    },
    
    testWallTimeToUTC:{
        test:function(component){
            var testCmp = component.find('myOutputDateTimeComp');
            aura.test.assertNotNull(testCmp);
			aura.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());		        					        	
	        	var dateObj1 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
	        	
	        	var callback1 = function(walltime){
	        		var dt = $A.localizationService.formatDateTime(walltime, 'MMM DD, YYYY h:mm:ss A', 'en');
	        		aura.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
	        	}
	        	
				$A.localizationService.WallTimeToUTC(dateObj1, 'GMT', callback1);
				
				// Now use EST
				var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 12:30:00 PM', 'MMM DD, YYYY h:mm:ss A', 'en');
				
				var callback2 = function(walltime){
	        		var dt = $A.localizationService.formatDateTime(walltime, 'MMM DD, YYYY h:mm:ss A', 'en');
	        		aura.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
	        	}
	        	
				$A.localizationService.WallTimeToUTC(dateObj2, 'America_NewYork', callback2);
				
				// Now use PST
				var dateObj3 = $A.localizationService.parseDateTime('Sep 23, 2004 9:30:00 AM', 'MMM DD, YYYY h:mm:ss A', 'en');
				
				var callback3 = function(walltime){
	        		var dt = $A.localizationService.formatDateTime(walltime, 'MMM DD, YYYY h:mm:ss A', 'en');
	        		aura.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
	        	}
	        	
				$A.localizationService.WallTimeToUTC(dateObj3, 'America_LosAngeles', callback3);
	    		
	        });	
        }
    },
    
    testFormatNumber:{
        test:function(component){
        	var testCmp = component.find('myOutputNumberComp');
            aura.test.assertNotNull(testCmp);
        	aura.test.assertEquals('3.14', $A.test.getText(testCmp.find('span').getElement()), "Decimal part of value was not rounded up based on format.");        			
	        aura.test.assertEquals("3.142", $A.localizationService.formatNumber(3.14159), "Both values should be same.");
	        aura.test.assertEquals("3.146", $A.localizationService.formatNumber(3.14559), "Both values should be same.");
	        aura.test.assertEquals("-3.142", $A.localizationService.formatNumber(-3.14159), "Both values should be same.");
	        aura.test.assertEquals("-3.146", $A.localizationService.formatNumber(-3.14559), "Both values should be same.");
        }        
    },
    
    testFormatPercent:{
        test:function(component){
        	var testCmp = component.find('myOutputPercentComp');
            aura.test.assertNotNull(testCmp);
        	aura.test.assertEquals('14.57%', $A.test.getText(testCmp.find('span').getElement()), "Decimal part of value was not rounded up based on format.");        			
	        aura.test.assertEquals("15%", $A.localizationService.formatPercent(0.14566), "Both values should be same.");
	        aura.test.assertEquals("315%", $A.localizationService.formatPercent(3.14559), "Both values should be same.");
	        aura.test.assertEquals("314%", $A.localizationService.formatPercent(3.14119), "Both values should be same.");
	        aura.test.assertEquals("-315%", $A.localizationService.formatPercent(-3.14559), "Both values should be same.");
	        aura.test.assertEquals("-314%", $A.localizationService.formatPercent(-3.14119), "Both values should be same.");
        }        
    }
})
