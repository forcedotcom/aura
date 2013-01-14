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
package org.auraframework.service;

import java.util.List;

import org.auraframework.impl.AuraImpl;
import org.auraframework.system.LoggingContext;

import com.google.common.collect.Lists;

/**
 * @hierarchy Aura.Services.ContextService
 * @userStory a07B0000000FcRW
 * 
 * @since touch.174.1
 */
public class LoggingServiceTest extends BaseServiceTest<LoggingService, LoggingServiceTest.Config> implements
        LoggingService {

    /**
     */
    private static final long serialVersionUID = -2128236826297707002L;

    public LoggingServiceTest(String name) {
        super(name);
    }

    @Override
    public List<Config> getConfigs() {
        return Lists.newArrayList(new Config());
    }

    @Override
    public LoggingService establish() {
        try {
            LoggingContext lc = AuraImpl.getLoggingAdapter().getLoggingContext();
            assertNull(lc);
            service.establish();
            lc = AuraImpl.getLoggingAdapter().getLoggingContext();
            assertNotNull(lc);
            LoggingContext lc2 = AuraImpl.getLoggingAdapter().getLoggingContext();
            assertSame(lc, lc2);
        } finally {
            service.release();
        }
        assertNull(AuraImpl.getLoggingAdapter().getLoggingContext());
        return null;
    }

    @Override
    public void release() {
        try {
            LoggingContext lc = AuraImpl.getLoggingAdapter().getLoggingContext();
            assertNull(lc);
            service.establish();
            lc = AuraImpl.getLoggingAdapter().getLoggingContext();
            assertNotNull(lc);
        } finally {
            service.release();
            assertNull(AuraImpl.getLoggingAdapter().getLoggingContext());
        }
    }

    @Override
    public void startTimer(String name) {
        try {
            service.establish();
            service.startTimer("startTimerTest");
            Thread.sleep(10);
        } catch (InterruptedException ie) {

        } finally {
            service.stopTimer("startTimerTest");
            long duration = service.getTime("startTimerTest");
            assertTrue(duration > 0L);
            service.resetTimer("startTimerTest");
            service.release();
        }
    }

    @Override
    public void stopTimer(String name) {
        try {
            service.establish();
            service.startTimer("stopTimerTest");
            service.stopTimer("stopTimerTest");
            Thread.sleep(5);
            long duration = service.getTime("stopTimerTest");
            assertTrue(duration < 5L);
        } catch (InterruptedException ie) {

        } finally {
            service.resetTimer("stopTimerTest");
            service.release();
        }
    }

    @Override
    public long getTime(String name) {
        try {
            service.establish();
            service.startTimer("getTimeTest");
            Thread.sleep(10);
            service.stopTimer("getTimeTest");
            long duration1 = service.getTime("getTimeTest");
            long duration2 = service.getTime("getTimeTest");
            assertEquals(duration1, duration2);
        } catch (InterruptedException ie) {

        } finally {
            service.resetTimer("getTimeTest");
            service.release();
        }
        return 0L;
    }

    @Override
    public void resetTimer(String name) {
        try {
            service.establish();
            service.startTimer("resetTimerTest");
            Thread.sleep(10);
            service.stopTimer("resetTimerTest");
        } catch (InterruptedException ie) {

        } finally {
            service.resetTimer("resetTimerTest");
            assertTrue(service.getTime("resetTimerTest") == 0);
            service.release();
        }
    }

    @Override
    public long getNum(String key) {
        try {
            service.establish();
            service.incrementNumBy("getNumTest", 5L);
            assertEquals(service.getNum("getNumTest"), 5L);
        } finally {
            service.setNum("getNumTest", 0L);
            service.release();
        }
        return 0L;
    }

    @Override
    public void incrementNum(String key) {
        try {
            service.establish();
            service.setNum("incrementNumTest", 10L);
            service.incrementNum("incrementNumTest");
            assertEquals(service.getNum("incrementNumTest"), 11);
        } finally {
            service.setNum("incrementNumTest", 0L);
            service.release();
        }
    }

    @Override
    public void incrementNumBy(String key, Long num) {
        try {
            service.establish();
            service.setNum("incrementNumByTest", 2L);
            service.incrementNumBy("incrementNumByTest", 15L);
            assertEquals(service.getNum("incrementNumByTest"), 17L);
            service.incrementNumBy("incrementNumByTest", 3L);
            assertEquals(service.getNum("incrementNumByTest"), 20L);
        } finally {
            service.setNum("incrementNumByTest", 0L);
            service.release();
        }
    }

    @Override
    public void setNum(String key, Long num) {
        try {
            service.establish();
            service.setNum("setNumTest", 2L);
            assertEquals(service.getNum("setNumTest"), 2L);
            service.setNum("setNumTest", -3L);
            assertEquals(service.getNum("setNumTest"), -3L);
        } finally {
            service.setNum("setNumTest", 0L);
            service.release();
        }
    }

    @Override
    public Object getValue(String key) {
        try {
            service.establish();
            assertNull(service.getValue("getValueTest"));
            service.setValue("getValueTest", "getValueTestValue");
            assertEquals(service.getValue("getValueTest"), "getValueTestValue");
        } finally {
            service.setValue("getValueTest", null);
            service.release();
        }
        return null;
    }

    @Override
    public void setValue(String key, Object value) {
        try {
            service.establish();
            service.setValue("setValueTest", "setValueTestValue");
            assertEquals(service.getValue("setValueTest"), "setValueTestValue");
        } finally {
            service.release();
        }
    }

    @Override
    public void doLog() {

    }

    public static class Config extends BaseServiceTest.Config {
    }
}
