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
package org.auraframework.throwable;

import java.io.IOError;

import org.auraframework.system.Location;
import org.auraframework.test.UnitTestCase;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Tests for AuraExceptionUtil.
 * 
 * 
 * @since 0.0.210
 */
public class AuraExceptionUtilTest extends UnitTestCase {
    /**
     * An internal class to create quick fix exceptions.
     */
    private static class TestQuickFixException extends QuickFixException {
        private static final long serialVersionUID = 7887234381181710432L;

        public TestQuickFixException(String name) {
            super(name, null);
        }
    }

    /**
     * New StackTraceElement with filename and line number is inserted at top of
     * stack if location contains both properties.
     */
    public void testAddLocationWithFileAndLine() throws Exception {
        Throwable t = new Throwable();
        AuraExceptionUtil.addLocation(new Location(getName(), 22, 0, 0), t);
        assertEquals("Expected StackTraceElement not inserted at top", new StackTraceElement("", "", getName(), 22),
                t.getStackTrace()[0]);
    }

    /**
     * New StackTraceElement with filename only is inserted at top of stack if
     * location has negative line number set.
     */
    public void testAddLocationWithoutLine() throws Exception {
        Throwable t = new Throwable();
        AuraExceptionUtil.addLocation(new Location(getName(), 33), t);
        assertEquals("Expected StackTraceElement not inserted at top", new StackTraceElement("", "", getName(), -1),
                t.getStackTrace()[0]);
    }

    /**
     * New StackTraceElement with null filename is inserted at top of stack if
     * location contains null filename.
     */
    public void testAddLocationWithoutFile() throws Exception {
        Throwable t = new Throwable();
        AuraExceptionUtil.addLocation(new Location(null, 33, 0, 0), t);
        assertEquals("Expected StackTraceElement not inserted at top", new StackTraceElement("", "", null, 33),
                t.getStackTrace()[0]);
    }

    /**
     * No new StackTraceElement is inserted at top of stack if location is null.
     */
    public void testAddLocationWithoutLocation() throws Exception {
        Throwable t = new Throwable();
        StackTraceElement expected = t.getStackTrace()[0];
        AuraExceptionUtil.addLocation(null, t);
        assertEquals("Expected StackTraceElement not inserted at top", expected, t.getStackTrace()[0]);
    }

    /**
     * QuickFixException is returned as is.
     */
    public void testWrapExecutionExceptionInstanceOfQuickFixException() throws Exception {
        Exception t = new TestQuickFixException(getName());
        assertEquals("Did not get the original QuickFixException", t,
                AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0)));
    }

    /**
     * Topmost AuraUnhandledException is wrapped.
     */
    public void testWrapExecutionExceptionInstanceOfAuraUnhandledException() throws Exception {
        Throwable start = new Exception("start");
        Throwable child = new AuraUnhandledException("child", start);
        Exception t = new AuraUnhandledException(getName(), child);
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
            fail("Expected the AuraRuntimeException to get rethrown");
        } catch (AuraExecutionException e) {
            assertEquals("Topmost AuraRuntimeException was not wrapped", t, e.getCause());
        }
    }

    /**
     * Topmost AuraExecutionException is wrapped.
     */
    public void testWrapExecutionExceptionInstanceOfAuraExecutionException() throws Exception {
        Throwable start = new Exception("start");
        Throwable child = new AuraUnhandledException("child", start);
        Exception t = new AuraExecutionException(child, new Location("there", 0));
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
            fail("Expected the AuraRuntimeException to get rethrown");
        } catch (AuraExecutionException e) {
            assertEquals("Topmost AuraRuntimeException was not wrapped", t, e.getCause());
        }
    }

    /**
     * Topmost AuraHandledException is unwrapped.
     */
    public void testWrapExecutionExceptionInstanceOfAuraHandledException() throws Exception {
        Throwable start = new Exception("start");
        Throwable child = new AuraHandledException(start);
        Exception t = new AuraUnhandledException(getName(), child);
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
            fail("Expected the AuraRuntimeException to get rethrown");
        } catch (AuraHandledException e) {
            assertEquals("Topmost AuraHandledException was not unwrapped", child, e);
        }
    }

    /**
     * Topmost Error is rethrown.
     */
    public void testWrapExecutionExceptionInstanceOfError() throws Exception {
        Throwable child = new TestQuickFixException(getName());
        Throwable error = new IOError(child);
        Exception t = new Exception(error);

        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
            fail("Expected the Error to get rethrown");
        } catch (IOError e) {
            assertEquals("Topmost Error was not rethrown", error, e);
        }
        try {
            AuraExceptionUtil.wrapExecutionException(error, new Location("here", 0));
            fail("Expected the Error to get rethrown");
        } catch (IOError e) {
            assertEquals("Topmost Error was not rethrown", error, e);
        }
    }

    /**
     * Nested QuickFixException is returned as is.
     */
    public void testWrapExecutionExceptionNestedQuickFixException() throws Exception {
        Throwable t4 = new TestQuickFixException(getName());
        Throwable t3 = new RuntimeException("intermediate3", t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new AuraUnhandledException("intermediate1", t2);
        Exception t = new RuntimeException("top", t1);
        assertEquals("Did not get the original nested QuickFixException", t4,
                AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0)));
    }

    /**
     * Topmost nested AuraRuntimeException is rethrown.
     */
    public void testWrapExecutionExceptionNestedAuraRuntimeException() throws Exception {
        Throwable t4 = new Exception("intermediate3");
        Throwable t3 = new AuraUnhandledException("intermediate3", t4);
        Throwable t2 = new AuraUnhandledException("intermediate2", t3);
        Throwable t1 = new AuraUnhandledException("intermediate1", t2);
        Exception t = new RuntimeException("top", t1);
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
            fail("Expected the topmost nested AuraRuntimeException to get rethrown");
        } catch (AuraExecutionException e) {
            assertEquals("Topmost exception was not wrapped", t, e.getCause());
        }
    }

    /**
     * Topmost nested Error is rethrown.
     */
    public void testWrapExecutionExceptionNestedError() throws Exception {
        Throwable t4 = new TestQuickFixException(getName());
        Throwable t3 = new IOError(t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new RuntimeException("intermediate3", t2);
        Exception t = new RuntimeException("top", t1);
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
            fail("Expected the nested Error to get rethrown");
        } catch (IOError e) {
            assertEquals("Topmost nested Error was not rethrown", t3, e);
        }
    }

    /**
     * QuickFixException nested 5 or more levels deep is not extracted. New
     * AuraRuntimeException is thrown.
     */
    public void testWrapExecutionExceptionNestedTooDeep() throws Exception {
        Throwable t4 = new TestQuickFixException(getName());
        Throwable t3 = new RuntimeException("intermediate3", t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new RuntimeException("intermediate1", t2);
        Throwable t0 = new RuntimeException("intermediate1", t1);
        Exception t = new RuntimeException("top", t0);
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
            fail("Expected the original Throwable to get wrapped in a new AuraRuntimeException");
        } catch (AuraRuntimeException e) {
            assertEquals("Original Throwable was not wrapped", t, e.getCause());
        }
    }

    /**
     * Any other Throwable is wrapped in a new AuraRuntimeException.
     */
    public void testWrapExecutionExceptionWithoutMatching() throws Exception {
        Exception t = new RuntimeException(getName());
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
            fail("Expected the original Throwable to get wrapped in a new AuraRuntimeException");
        } catch (AuraRuntimeException e) {
            assertEquals("Original Throwable was not wrapped", t, e.getCause());
        }
    }

    /**
     * QuickFixException is returned as is.
     */
    public void testPassQuickFixInstanceOfQuickFixException() throws Exception {
        Throwable t = new TestQuickFixException(getName());
        assertEquals("Did not get the original QuickFixException", t, AuraExceptionUtil.passQuickFix(t));
    }

    /**
     * Topmost AuraRuntimeException is rethrown.
     */
    public void testPassQuickFixInstanceOfAuraRuntimeException() throws Exception {
        Throwable child = new AuraRuntimeException(getName());
        Throwable t = new AuraRuntimeException(getName(), null, child);
        try {
            AuraExceptionUtil.passQuickFix(t);
            fail("Expected the AuraRuntimeException to get rethrown");
        } catch (AuraRuntimeException e) {
            assertEquals("Topmost AuraRuntimeException was not rethrown", t, e);
        }
    }

    /**
     * Topmost Error is rethrown.
     */
    public void testPassQuickFixInstanceOfError() throws Exception {
        Throwable child = new TestQuickFixException(getName());
        Throwable t = new IOError(child);
        try {
            AuraExceptionUtil.passQuickFix(t);
            fail("Expected the Error to get rethrown");
        } catch (IOError e) {
            assertEquals("Topmost Error was not rethrown", t, e);
        }
    }

    /**
     * Nested QuickFixException is returned as is.
     */
    public void testPassQuickFixNestedQuickFixException() throws Exception {
        Throwable t4 = new TestQuickFixException(getName());
        Throwable t3 = new RuntimeException("intermediate3", t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new AuraRuntimeException("intermediate1", t2);
        Throwable t = new RuntimeException("top", t1);
        assertEquals("Did not get the original nested QuickFixException", t4, AuraExceptionUtil.passQuickFix(t));
    }

    /**
     * Topmost nested AuraRuntimeException is rethrown.
     */
    public void testPassQuickFixNestedAuraRuntimeException() throws Exception {
        Throwable t4 = new Exception("intermediate3");
        Throwable t3 = new AuraUnhandledException("intermediate3", t4);
        Throwable t2 = new AuraUnhandledException("intermediate2", t3);
        Throwable t1 = new AuraUnhandledException("intermediate1", t2);
        Throwable t = new RuntimeException("top", t1);
        try {
            AuraExceptionUtil.passQuickFix(t);
            fail("Expected the topmost nested AuraRuntimeException to get rethrown");
        } catch (AuraRuntimeException e) {
            assertEquals("Topmost nested AuraRuntimeException was not rethrown", t1, e);
        }
    }

    /**
     * Topmost nested Error is rethrown.
     */
    public void testPassQuickFixNestedError() throws Exception {
        Throwable t4 = new TestQuickFixException(getName());
        Throwable t3 = new IOError(t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new RuntimeException("intermediate3", t2);
        Throwable t = new RuntimeException("top", t1);
        try {
            AuraExceptionUtil.passQuickFix(t);
            fail("Expected the nested Error to get rethrown");
        } catch (IOError e) {
            assertEquals("Topmost nested Error was not rethrown", t3, e);
        }
    }

    /**
     * QuickFixException nested 5 or more levels deep is not extracted. New
     * AuraRuntimeException is thrown.
     */
    public void testPassQuickFixNestedTooDeep() throws Exception {
        Throwable t4 = new TestQuickFixException(getName());
        Throwable t3 = new RuntimeException("intermediate3", t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new RuntimeException("intermediate1", t2);
        Throwable t0 = new RuntimeException("intermediate1", t1);
        Throwable t = new RuntimeException("top", t0);
        try {
            AuraExceptionUtil.passQuickFix(t);
            fail("Expected the original Throwable to get wrapped in a new AuraRuntimeException");
        } catch (AuraRuntimeException e) {
            assertEquals("Original Throwable was not wrapped", t, e.getCause());
        }
    }

    /**
     * Any other Throwable is wrapped in a new AuraRuntimeException.
     */
    public void testPassQuickFixWithoutMatching() throws Exception {
        Throwable t = new RuntimeException(getName());
        try {
            AuraExceptionUtil.passQuickFix(t);
            fail("Expected the original Throwable to get wrapped in a new AuraRuntimeException");
        } catch (AuraRuntimeException e) {
            assertEquals("Original Throwable was not wrapped", t, e.getCause());
        }
    }

}
