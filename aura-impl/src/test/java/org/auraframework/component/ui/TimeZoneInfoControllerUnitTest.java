package org.auraframework.component.ui;

import org.auraframework.component.ui.TimeZoneInfoController.TimeZoneInfo;
import org.auraframework.test.UnitTestCase;

public class TimeZoneInfoControllerUnitTest extends UnitTestCase {
	
	public void testLATimeZoneInfo() throws Exception{
		String timezoneId = "America/Los_Angeles";		
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo(timezoneId);
		assertNotNull(ti);		
		assertTrue(ti.getInfo().contains("Los_Angeles"));
	}	
	
	public void testNYTimeZoneInfo() throws Exception{
		String timezoneId = "America/New_York";		
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo(timezoneId);
		assertNotNull(ti);		
		assertTrue(ti.getInfo().contains("New_York"));
	}	
	
	public void testNullTimeZoneInfo() throws Exception{
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo(null);
		assertEquals(null, ti);		
	}
	
	public void testEmptyTimeZoneInfo() throws Exception{
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo("");
		assertNotNull(ti);		
		assertEquals(null, ti.getInfo());		
	}
	
	public void testSlashTimeZoneInfo() throws Exception{
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo("/");
		assertNotNull(ti);		
		assertEquals(null, ti.getInfo());		
	}
	
	public void testInvalidTimeZoneInfo() throws Exception{
		String timezoneId = "America/San_Francisco";										
		TimeZoneInfo ti = TimeZoneInfoController.getTimeZoneInfo(timezoneId);
		assertNotNull(ti);		
		assertEquals(null, ti.getInfo());		
	}
}
