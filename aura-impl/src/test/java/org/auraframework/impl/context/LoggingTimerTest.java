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
package org.auraframework.impl.context;

import java.lang.reflect.Field;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.context.LoggingContextImpl.Timer;

public class LoggingTimerTest extends AuraImplTestCase {

    public LoggingTimerTest(String name) {
        super(name);
    }
    
    public void testTimer() throws Exception {
        Timer timer = new Timer("foo");
        assertEquals("Uninitialized timer has a totalTime", -1, timer.getTime());
        assertEquals("Timer name is wrong", "foo", timer.getName());
        
        timer.start();
        assertEquals("Running timer has a totalTime", -1, timer.getTime());
        
        timer.stop();
        assertTrue("Completed timer has no totalTime", timer.getTime() >= 0);
        
        timer.reset();
        assertEquals("Reseted timer has a totalTime", -1, timer.getTime());
    }
    
    public void testNesting() throws Exception {
        Timer timer = new Timer("foo");
        
        timer.start();
        assertEquals("Running timer has a totalTime", -1, timer.getTime());
        
        timer.start();
        assertEquals("Nested Running timer has a totalTime", -1, timer.getTime());
        
        timer.stop();
        assertEquals("Running timer has a totalTime", -1, timer.getTime());
        
        timer.stop();
        assertTrue("Completed timer has no totalTime", timer.getTime() >= 0);
    }
    
    public void testRestart() throws Exception {
        Long skipAhead = 60L * 60L * 1000000000L;
        Timer timer = new Timer("foo");
        //this test is a little funky to avoid the need for Thread.sleep()
        //a second timer is used as somewhat of a control.
        
        timer.start();
        assertEquals("Running timer has a totalTime", -1, timer.getTime());
        
        //since totalTime is initially negative even if no time has passed 
        //it will change to '0' and this test will pass
        timer.stop();
        assertTrue("Completed timer has no totalTime", timer.getTime() >= 0);
        
        Field totalTime = Timer.class.getDeclaredField("totalTime");
        totalTime.setAccessible(true);
        totalTime.setLong(timer, skipAhead); //assure value > 0 + likely thread down time
        
        Timer innerTimer = new Timer("bar");
        timer.start();
        innerTimer.start();
        
        innerTimer.stop(); //probably '0' totalTime but it could be a whole lot more
        timer.stop();
        
        //if reset is broken in the future this test becomes flappable with false passes
        //that would be the case if the innerTimer above waited for 1h less that the timer under test.
        //this is extremely unlikely.
        assertTrue("Timer restart did not accumulate time", timer.getTime() >= ((skipAhead / 1000000L) + innerTimer.getTime()));
    }

}
