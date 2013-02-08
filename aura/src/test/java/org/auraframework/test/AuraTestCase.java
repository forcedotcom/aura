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
package org.auraframework.test;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.MockConfigAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Base class for unit tests referencing the Aura framework.
 * 
 * 
 * @since 0.0.178
 */
public abstract class AuraTestCase extends UnitTestCase {
    protected final static String baseApplicationTag = "<aura:application %s>%s</aura:application>";
    protected final static String baseComponentTag = "<aura:component %s>%s</aura:component>";

    public AuraTestCase(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        Aura.get(TestContextAdapter.class).getTestContext(getQualifiedName());
    }

    @Override
    public void tearDown() throws Exception {
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }
        Aura.getLoggingService().release();
        resetMocks();
        Aura.get(TestContextAdapter.class).release();
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
     * @param filename a 'file name' to match the location (not checked if null).
     */
    protected void checkExceptionFull(Throwable e, Class<?> clazz, String message, String filename) {
        if (clazz != null) {
            assertEquals("Exception must be " + clazz.getSimpleName(), clazz, e.getClass());
        }
        assertEquals("unexpected message", message, e.getMessage());
        if (filename != null) {
            Location l = null;

            if (e instanceof QuickFixException) {
                l = ((QuickFixException) e).getLocation();
            } else if (e instanceof AuraRuntimeException) {
                l = ((AuraRuntimeException) e).getLocation();
            }
            assertNotNull("Unable to find location, expected " + filename, l);
            assertEquals("Unexpected location", filename, l.getFileName());
        }
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
        if (clazz != null) {
            assertEquals("Exception must be " + clazz.getSimpleName(), clazz, e.getClass());
        }
        assertTrue("unexpected message: " + e.getMessage() + "!=" + message, e.getMessage().startsWith(message));
        if (filename != null) {
            Location l = null;

            if (e instanceof QuickFixException) {
                l = ((QuickFixException) e).getLocation();
            } else if (e instanceof AuraRuntimeException) {
                l = ((AuraRuntimeException) e).getLocation();
            }
            assertNotNull("Unable to find location, expected " + filename, l);
            assertEquals("Unexpected location", filename, l.getFileName());
        }
    }

    protected DefDescriptor<ControllerDef> getClientController(BaseComponentDef def) throws Exception {
        for (DefDescriptor<ControllerDef> cd : def.getControllerDefDescriptors()) {
            if ("js".equals(cd.getPrefix())) {
                return cd;
            }
        }
        return null;
    }

}
