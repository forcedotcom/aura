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
package org.auraframework.test;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.MockConfigAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.service.ContextService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Base class for unit tests referencing the Aura framework.
 * 
 * @since 0.0.178
 */
public abstract class AuraTestCase extends UnitTestCase {
    protected final static String baseApplicationTag = "<aura:application %s>%s</aura:application>";
    protected final static String baseComponentTag = "<aura:component %s>%s</aura:component>";

    private AuraTestingUtil auraTestingUtil;

    public AuraTestCase(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        TestContextAdapter testContextAdapter = Aura.get(TestContextAdapter.class);
        if (testContextAdapter != null) {
            testContextAdapter.getTestContext(getQualifiedName());
        }
    }

    @Override
    public void tearDown() throws Exception {
        LoggingService loggingService = Aura.getLoggingService();
        if (loggingService != null) {
            loggingService.release();
        }
        try {
            resetMocks();
        } catch (Throwable t) {
            Logger.getLogger(getClass().getName()).log(Level.SEVERE, t.getMessage(), t);
        }
        ContextService contextService = Aura.getContextService();
        if (contextService != null && contextService.isEstablished()) {
            contextService.endContext();
        }
        TestContextAdapter testContextAdapter = Aura.get(TestContextAdapter.class);
        if (testContextAdapter != null) {
            testContextAdapter.release();
        }
        if (auraTestingUtil != null) {
            auraTestingUtil.tearDown();
        }
        super.tearDown();
    }

    public static MockConfigAdapter getMockConfigAdapter() {
        ConfigAdapter adapter = Aura.getConfigAdapter();
        if (adapter instanceof MockConfigAdapter) {
            return (MockConfigAdapter) adapter;
        }
        throw new Error("MockConfigAdapter is not configured!");
    }

    public static void resetMocks() throws Exception {
        getMockConfigAdapter().reset();
    }

    public String getQualifiedName() {
        return getClass().getCanonicalName() + "." + getName();
    }

    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents,
            String namePrefix) {
        return getAuraTestingUtil().addSourceAutoCleanup(defClass, contents, namePrefix);
    }

    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents) {
        return getAuraTestingUtil().addSourceAutoCleanup(defClass, contents);
    }

    protected <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents) {
        return getAuraTestingUtil().addSourceAutoCleanup(descriptor, contents);
    }

    protected <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        return getAuraTestingUtil().getSource(descriptor);
    }

    /**
     * Useful for restoring a context in case a test needs to temporarily switch contexts.
     */
    protected static void setContext(AuraContext context) {
        ContextService service = Aura.getContextService();
        AuraContext current = service.getCurrentContext();
        if (context == null || context == current) {
            return;
        }
        if (current != null) {
            service.endContext();
        }
        AuraContext newContext = service.startContext(context.getMode(), context.getFormat(), context.getAccess(),
                context.getApplicationDescriptor());
        newContext.setLastMod(context.getLastMod());
        newContext.clearPreloads();
        for (String preload : context.getPreloads()) {
            newContext.addPreload(preload);
        }
    }

    /**
     * Check to ensure that an exception exactly matches both message and location.
     * 
     * @param e the exception to check.
     * @param clazz a class to match if it is not null.
     * @param message The message to match (must be exact match).
     * @param filename a 'file name' to match the location.
     */
    protected void checkExceptionFull(Throwable e, Class<?> clazz, String message, String filename) {
        checkExceptionFull(e, clazz, message);
        assertLocation(e, filename);
    }

    /**
     * Check the exception exactly matches the message and check the location of an Exception using the Source of the
     * file in error. Use this method when the location is a full filesystem path to the file (instead of just a
     * qualified name).
     * 
     * Depending on whether we are reading form jars or source, the location in the exception is different. When reading
     * from source we need to strip the "file:" prefix. When reading from jars we leave the "jar:file:" prefix.
     */
    protected void checkExceptionFull(Throwable e, Class<?> clazz, String message, Source<?> src) {
        checkExceptionFull(e, clazz, message);
        assertLocation(e, src);
    }

    /**
     * Check that an exception exactly matches the message, ignore location.
     */
    protected void checkExceptionFull(Throwable e, Class<?> clazz, String message) {
        if (clazz != null) {
            assertEquals("Exception must be " + clazz.getSimpleName(), clazz, e.getClass());
        }
        assertEquals("Unexpected message", message, e.getMessage());
    }

    /**
     * Check to ensure that an exception message starts with a given message and matches a location.
     * 
     * @param e the exception to check.
     * @param clazz a class to match if it is not null.
     * @param message The message to match (must be exact match).
     * @param filename a 'file name' to match the location (not checked if null).
     */
    protected void checkExceptionStart(Throwable e, Class<?> clazz, String message, String filename) {
        checkExceptionStart(e, clazz, message);
        assertLocation(e, filename);
    }

    /**
     * Check the exception message starts with a given message and check the location of an Exception using the Source
     * of the file in error. Use this method when the location is a full filesystem path to the file (instead of just a
     * qualified name).
     * 
     * Depending on whether we are reading form jars or source, the location in the exception is different. When reading
     * from source we need to strip the "file:" prefix. When reading from jars we leave the "jar:file:" prefix.
     */
    protected void checkExceptionStart(Throwable e, Class<?> clazz, String message, Source<?> src) {
        checkExceptionStart(e, clazz, message);
        assertLocation(e, src);
    }

    /**
     * Just check the exception and message, ignore location.
     */
    protected void checkExceptionStart(Throwable e, Class<?> clazz, String message) {
        if (clazz != null) {
            assertEquals("Exception must be " + clazz.getSimpleName(), clazz, e.getClass());
        }
        assertTrue("Unexpected message: " + e.getMessage() + "!=" + message, e.getMessage().startsWith(message));
    }

    /**
     * Check to ensure that an exception message contains a string and has the correct location.
     * 
     * @param e the exception to check.
     * @param clazz a class to match if it is not null.
     * @param message The String which is contained in the Exception message.
     * @param filename a 'file name' to match the location.
     */
    protected void checkExceptionContains(Throwable e, Class<?> clazz, String message, String filename) {
        checkExceptionContains(e, clazz, message);
        assertLocation(e, filename);
    }

    /**
     * Check the exception exactly message contains a string and check the location of an Exception using the Source of
     * the file in error. Use this method when the location is a full filesystem path to the file (instead of just a
     * qualified name).
     * 
     * Depending on whether we are reading form jars or source, the location in the exception is different. When reading
     * from source we need to strip the "file:" prefix. When reading from jars we leave the "jar:file:" prefix.
     */
    protected void checkExceptionContains(Throwable e, Class<?> clazz, String message, Source<?> src) {
        checkExceptionContains(e, clazz, message);
        assertLocation(e, src);
    }

    /**
     * Check that an exception message contains a string, ignore location.
     */
    protected void checkExceptionContains(Throwable e, Class<?> clazz, String message) {
        if (clazz != null) {
            assertEquals("Exception must be " + clazz.getSimpleName(), clazz, e.getClass());
        }
        assertTrue("Expected exception message to contain <" + message + ">, but was <" + e.getMessage() + " >", e
                .getMessage().contains(message));
    }

    protected AuraTestingUtil getAuraTestingUtil() {
        if (auraTestingUtil == null) {
            auraTestingUtil = new AuraTestingUtil();
        }
        return auraTestingUtil;
    }

    protected DefDescriptor<ControllerDef> getClientController(BaseComponentDef def) throws Exception {
        for (DefDescriptor<ControllerDef> cd : def.getControllerDefDescriptors()) {
            if ("js".equals(cd.getPrefix())) {
                return cd;
            }
        }
        return null;
    }

    /**
     * Check to ensure that an exception message starts with a given message, ignore location.
     */
    private void assertLocation(Throwable e, String expectedLoc) {
        Location l = null;
        if (e instanceof QuickFixException) {
            l = ((QuickFixException) e).getLocation();
        } else if (e instanceof AuraRuntimeException) {
            l = ((AuraRuntimeException) e).getLocation();
        }
        assertNotNull("Unable to find location, expected " + expectedLoc, l);
        assertEquals("Unexpected location.", expectedLoc, l.getFileName());
    }

    private void assertLocation(Throwable e, Source<?> src) {
        String fileUrl = src.getUrl();
        if (fileUrl.startsWith("jar")) {
            assertLocation(e, fileUrl);
        } else if (fileUrl.startsWith("file")) {
            // If running from source, strip "file:" prefix, as in XMLParser.getLocation()
            String filePath = fileUrl.substring(5);
            assertLocation(e, filePath);
        }
    }
}
