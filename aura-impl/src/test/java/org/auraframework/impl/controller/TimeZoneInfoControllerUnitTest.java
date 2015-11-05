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
package org.auraframework.impl.controller;

import static org.mockito.Mockito.when;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.impl.controller.TimeZoneInfoController;
import org.auraframework.impl.controller.TimeZoneInfoController.TimeZoneInfo;
import org.auraframework.util.test.util.UnitTestCase;
import org.mockito.Mock;
import org.mockito.Mockito;

/**
 * Unit tests for TimeZoneInfoController.java
 * 
 */
public class TimeZoneInfoControllerUnitTest extends UnitTestCase {
	
	@Mock
	TimeZoneInfoController.Helpers helpers;
	
	private ConfigAdapter mci;

	
	/**
     * setUp mocks Aura.getConfigAdapter().getAvailableTimezone(timezone).
     */
    @Override
    public void setUp() throws Exception {
    	 super.setUp();
    	 mci = Mockito.mock(ConfigAdapter.class);
    	 TimeZoneInfoController.setConfigAdapter(mci);
    }
	
	/** 
	 * Test null value
	 */
	public void testNullTimeZoneInfo() throws Exception{
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo(null);
		assertEquals(null, ti);		
	}
	
	/** 
	 * Test empty string as time zone value
	 */
	public void testEmptyTimeZoneInfo() throws Exception{
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo("");
		assertEquals(null, ti);		
	}
	
	/** 
	 * Test string with slash only as time zone value
	 */
	public void testSlashTimeZoneInfo() throws Exception{
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo("/");
		assertEquals(null, ti);		
	}
	
	/** 
	 * Test invalid time zone value
	 */
	public void testInvalidTimeZoneInfo() throws Exception{
		String timezoneId = "America/San_Francisco";	
		Mockito.when(mci.getAvailableTimezone("America/San_Francisco")).thenReturn("GMT");
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo(timezoneId);
		assertEquals(null, ti);		
	}
	
	/**
	 * Test valid time zone value
	 */
	public void testLATimeZoneInfo() throws Exception{
		String timezoneId = "America/Los_Angeles";	
		String info = "Los_Angeles";
		Mockito.when(mci.getAvailableTimezone("America/Los_Angeles")).thenReturn("America/Los_Angeles");
		when(helpers.readTZInfoFromFile(timezoneId)).thenReturn(info);
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo(timezoneId, helpers);
		assertNotNull(ti);	
		assertTrue(ti.getInfo().contains(info));
	}	
	
	/** 
	 * Test valid time zone value
	 */
	public void testNYTimeZoneInfo() throws Exception{
		String timezoneId = "America/New_York";	
		String info = "New_York";
		Mockito.when(mci.getAvailableTimezone("America/New_York")).thenReturn("America/New_York");
		when(helpers.readTZInfoFromFile(timezoneId)).thenReturn(info);
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo(timezoneId, helpers);
		assertNotNull(ti);		
		assertTrue(ti.getInfo().contains(info));
	}
	
	/** 
	 * Test equivalent time zone value
	 */
	public void testIETTimeZoneInfo() throws Exception{
		String timezoneId = "IET";	
		String availableTimezoneId = "America/Indiana/Indianapolis";
		String info = "IET";
		Mockito.when(mci.getAvailableTimezone(timezoneId)).thenReturn(availableTimezoneId);
		when(helpers.readTZInfoFromFile(availableTimezoneId)).thenReturn(info);
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo(timezoneId, helpers);
		assertNotNull(ti);		
		assertTrue(ti.getInfo().contains(info));
	}
}
