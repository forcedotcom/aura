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
package org.auraframework.test.throwable;

import java.io.IOError;

import org.auraframework.system.Location;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraHandledException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Assert;
import org.junit.Test;

/**
 * Tests for AuraExceptionUtil.
 * 
 * 
 * @since 0.0.210
 */
public class AuraExceptionUtilTest {
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
    @Test
    public void testAddLocationWithFileAndLine() throws Exception {
        Throwable t = new Throwable();
        AuraExceptionUtil.addLocation(new Location("test", 22, 0, 0), t);
        Assert.assertEquals("Expected StackTraceElement not inserted at top",
                new StackTraceElement("", "", "test", 22), t.getStackTrace()[0]);
    }

    /**
     * New StackTraceElement with filename only is inserted at top of stack if
     * location has negative line number set.
     */
    @Test
    public void testAddLocationWithoutLine() throws Exception {
        Throwable t = new Throwable();
        AuraExceptionUtil.addLocation(new Location("test", 33), t);
        Assert.assertEquals("Expected StackTraceElement not inserted at top", new StackTraceElement("", "", "test", -1),
                t.getStackTrace()[0]);
    }

    /**
     * New StackTraceElement with null filename is inserted at top of stack if
     * location contains null filename.
     */
    @Test
    public void testAddLocationWithoutFile() throws Exception {
        Throwable t = new Throwable();
        AuraExceptionUtil.addLocation(new Location(null, 33, 0, 0), t);
        Assert.assertEquals("Expected StackTraceElement not inserted at top", new StackTraceElement("", "", null, 33),
                t.getStackTrace()[0]);
    }

    /**
     * No new StackTraceElement is inserted at top of stack if location is null.
     */
    @Test
    public void testAddLocationWithoutLocation() throws Exception {
        Throwable t = new Throwable();
        StackTraceElement expected = t.getStackTrace()[0];
        AuraExceptionUtil.addLocation(null, t);
        Assert.assertEquals("Expected StackTraceElement not inserted at top", expected, t.getStackTrace()[0]);
    }

    /**
     * QuickFixException is returned as is.
     */
    @Test
    public void testWrapExecutionExceptionInstanceOfQuickFixException() throws Exception {
        Exception t = new TestQuickFixException("test");
        Assert.assertEquals("Did not get the original QuickFixException", t,
                AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0)));
    }

    /**
     * Topmost AuraUnhandledException is wrapped.
     */
    @Test
    public void testWrapExecutionExceptionInstanceOfAuraUnhandledException() throws Exception {
        Throwable start = new Exception("start");
        Throwable child = new AuraUnhandledException("child", start);
        Exception t = new AuraUnhandledException("test", child);
        AuraExecutionException expected = null;
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
        } catch (AuraExecutionException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the AuraRuntimeException to get rethrown", expected);
        Assert.assertEquals("Topmost AuraRuntimeException was not wrapped", t, expected.getCause());
    }

    /**
     * Topmost AuraExecutionException is wrapped.
     */
    @Test
    public void testWrapExecutionExceptionInstanceOfAuraExecutionException() throws Exception {
        Throwable start = new Exception("start");
        Throwable child = new AuraUnhandledException("child", start);
        Exception t = new AuraExecutionException(child, new Location("there", 0));
        AuraExecutionException expected = null;
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
        } catch (AuraExecutionException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the AuraRuntimeException to get rethrown", expected);
        Assert.assertEquals("Topmost AuraRuntimeException was not wrapped", t, expected.getCause());
    }

    /**
     * Topmost AuraHandledException is unwrapped.
     */
    @Test
    public void testWrapExecutionExceptionInstanceOfAuraHandledException() throws Exception {
        Throwable start = new Exception("start");
        Throwable child = new AuraHandledException(start);
        Exception t = new AuraUnhandledException("test", child);
        AuraHandledException expected = null;
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
        } catch (AuraHandledException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the AuraRuntimeException to get rethrown", expected);
        Assert.assertEquals("Topmost AuraHandledException was not unwrapped", child, expected);
    }

    /**
     * Topmost Error is rethrown.
     */
    @Test
    public void testWrapExecutionExceptionInstanceOfError() throws Exception {
        Throwable child = new TestQuickFixException("test");
        Throwable error = new IOError(child);
        Exception t = new Exception(error);

        IOError expected = null;
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
        } catch (IOError e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the Error to get rethrown", expected);
        Assert.assertEquals("Topmost Error was not rethrown", error, expected);
        expected = null;
        try {
            AuraExceptionUtil.wrapExecutionException(error, new Location("here", 0));
        } catch (IOError e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the Error to get rethrown", expected);
        Assert.assertEquals("Topmost Error was not rethrown", error, expected);
    }

    /**
     * Nested QuickFixException is returned as is.
     */
    @Test
    public void testWrapExecutionExceptionNestedQuickFixException() throws Exception {
        Throwable t4 = new TestQuickFixException("test");
        Throwable t3 = new RuntimeException("intermediate3", t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new AuraUnhandledException("intermediate1", t2);
        Exception t = new RuntimeException("top", t1);
        Assert.assertEquals("Did not get the original nested QuickFixException", t4,
                AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0)));
    }

    /**
     * Topmost nested AuraRuntimeException is rethrown.
     */
    @Test
    public void testWrapExecutionExceptionNestedAuraRuntimeException() throws Exception {
        Throwable t4 = new Exception("intermediate3");
        Throwable t3 = new AuraUnhandledException("intermediate3", t4);
        Throwable t2 = new AuraUnhandledException("intermediate2", t3);
        Throwable t1 = new AuraUnhandledException("intermediate1", t2);
        Exception t = new RuntimeException("top", t1);
        AuraExecutionException expected = null;
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
        } catch (AuraExecutionException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the topmost nested AuraRuntimeException to get rethrown", expected);
        Assert.assertEquals("Topmost exception was not wrapped", t, expected.getCause());
    }

    /**
     * Topmost nested Error is rethrown.
     */
    @Test
    public void testWrapExecutionExceptionNestedError() throws Exception {
        Throwable t4 = new TestQuickFixException("test");
        Throwable t3 = new IOError(t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new RuntimeException("intermediate3", t2);
        Exception t = new RuntimeException("top", t1);
        IOError expected = null;
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
        } catch (IOError e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the nested Error to get rethrown", expected);
        Assert.assertEquals("Topmost nested Error was not rethrown", t3, expected);
    }

    /**
     * QuickFixException nested 5 or more levels deep is not extracted. New
     * AuraRuntimeException is thrown.
     */
    @Test
    public void testWrapExecutionExceptionNestedTooDeep() throws Exception {
        Throwable t4 = new TestQuickFixException("test");
        Throwable t3 = new RuntimeException("intermediate3", t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new RuntimeException("intermediate1", t2);
        Throwable t0 = new RuntimeException("intermediate1", t1);
        Exception t = new RuntimeException("top", t0);
        AuraRuntimeException expected = null;
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
        } catch (AuraRuntimeException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the original Throwable to get wrapped in a new AuraRuntimeException", expected);
        Assert.assertEquals("Original Throwable was not wrapped", t, expected.getCause());
    }

    /**
     * Any other Throwable is wrapped in a new AuraRuntimeException.
     */
    @Test
    public void testWrapExecutionExceptionWithoutMatching() throws Exception {
        Exception t = new RuntimeException("test");
        AuraRuntimeException expected = null;
        try {
            AuraExceptionUtil.wrapExecutionException(t, new Location("here", 0));
        } catch (AuraRuntimeException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the original Throwable to get wrapped in a new AuraRuntimeException", expected);
        Assert.assertEquals("Original Throwable was not wrapped", t, expected.getCause());
    }

    /**
     * QuickFixException is returned as is.
     */
    @Test
    public void testPassQuickFixInstanceOfQuickFixException() throws Exception {
        Throwable t = new TestQuickFixException("test");
        Assert.assertEquals("Did not get the original QuickFixException", t, AuraExceptionUtil.passQuickFix(t));
    }

    /**
     * Topmost AuraRuntimeException is rethrown.
     */
    @Test
    public void testPassQuickFixInstanceOfAuraRuntimeException() throws Exception {
        Throwable child = new AuraRuntimeException("test");
        Throwable t = new AuraRuntimeException("test", null, child);
        AuraRuntimeException expected = null;
        try {
            AuraExceptionUtil.passQuickFix(t);
        } catch (AuraRuntimeException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the AuraRuntimeException to get rethrown", expected);
        Assert.assertEquals("Topmost AuraRuntimeException was not rethrown", t, expected);
    }

    /**
     * Topmost Error is rethrown.
     */
    @Test
    public void testPassQuickFixInstanceOfError() throws Exception {
        Throwable child = new TestQuickFixException("test");
        Throwable t = new IOError(child);
        IOError expected = null;
        try {
            AuraExceptionUtil.passQuickFix(t);
        } catch (IOError e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the Error to get rethrown", expected);
        Assert.assertEquals("Topmost Error was not rethrown", t, expected);
    }

    /**
     * Nested QuickFixException is returned as is.
     */
    @Test
    public void testPassQuickFixNestedQuickFixException() throws Exception {
        Throwable t4 = new TestQuickFixException("test");
        Throwable t3 = new RuntimeException("intermediate3", t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new AuraRuntimeException("intermediate1", t2);
        Throwable t = new RuntimeException("top", t1);
        Assert.assertEquals("Did not get the original nested QuickFixException", t4, AuraExceptionUtil.passQuickFix(t));
    }

    /**
     * Topmost nested AuraRuntimeException is rethrown.
     */
    @Test
    public void testPassQuickFixNestedAuraRuntimeException() throws Exception {
        Throwable t4 = new Exception("intermediate3");
        Throwable t3 = new AuraUnhandledException("intermediate3", t4);
        Throwable t2 = new AuraUnhandledException("intermediate2", t3);
        Throwable t1 = new AuraUnhandledException("intermediate1", t2);
        Throwable t = new RuntimeException("top", t1);
        AuraRuntimeException expected = null;
        try {
            AuraExceptionUtil.passQuickFix(t);
        } catch (AuraRuntimeException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the topmost nested AuraRuntimeException to get rethrown", expected);
        Assert.assertEquals("Topmost nested AuraRuntimeException was not rethrown", t1, expected);
    }

    /**
     * Topmost nested Error is rethrown.
     */
    @Test
    public void testPassQuickFixNestedError() throws Exception {
        Throwable t4 = new TestQuickFixException("test");
        Throwable t3 = new IOError(t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new RuntimeException("intermediate3", t2);
        Throwable t = new RuntimeException("top", t1);
        IOError expected = null;
        try {
            AuraExceptionUtil.passQuickFix(t);
        } catch (IOError e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the nested Error to get rethrown", expected);
        Assert.assertEquals("Topmost nested Error was not rethrown", t3, expected);
    }

    /**
     * QuickFixException nested 5 or more levels deep is not extracted. New
     * AuraRuntimeException is thrown.
     */
    @Test
    public void testPassQuickFixNestedTooDeep() throws Exception {
        Throwable t4 = new TestQuickFixException("test");
        Throwable t3 = new RuntimeException("intermediate3", t4);
        Throwable t2 = new RuntimeException("intermediate2", t3);
        Throwable t1 = new RuntimeException("intermediate1", t2);
        Throwable t0 = new RuntimeException("intermediate1", t1);
        Throwable t = new RuntimeException("top", t0);
        AuraRuntimeException expected = null;
        try {
            AuraExceptionUtil.passQuickFix(t);
        } catch (AuraRuntimeException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the original Throwable to get wrapped in a new AuraRuntimeException", expected);
        Assert.assertEquals("Original Throwable was not wrapped", t, expected.getCause());
    }

    /**
     * Any other Throwable is wrapped in a new AuraRuntimeException.
     */
    @Test
    public void testPassQuickFixWithoutMatching() throws Exception {
        Throwable t = new RuntimeException("test");
        AuraRuntimeException expected = null;
        try {
            AuraExceptionUtil.passQuickFix(t);
        } catch (AuraRuntimeException e) {
            expected = e;
        }
        Assert.assertNotNull("Expected the original Throwable to get wrapped in a new AuraRuntimeException", expected);
        Assert.assertEquals("Original Throwable was not wrapped", t, expected.getCause());
    }
}
