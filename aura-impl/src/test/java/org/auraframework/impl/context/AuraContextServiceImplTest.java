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

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.adapter.ContextAdapter;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.GlobalValue;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.test.util.AuraPrivateAccessor;

public class AuraContextServiceImplTest extends AuraImplTestCase {

    public AuraContextServiceImplTest(String name) {
        super(name, false);
    }

    public void testAuraContextServiceImpl() {
        ContextService contextService = Aura.getContextService();
        assertTrue(contextService instanceof AuraContextServiceImpl);
    }

    public void testTestContext() {
        // can only test the test context
        ContextService contextService = Aura.getContextService();
        ContextAdapter p = AuraImpl.getContextAdapter();
        assertFalse(p.isEstablished());
        contextService.startContext(Mode.DEV, Format.JSON, Authentication.AUTHENTICATED);
        assertTrue(p.isEstablished());
        assertNotNull(p.getCurrentContext());

        contextService.endContext();
        assertFalse(p.isEstablished());
    }

    private void unregisterGlobal(String name) {
        try {
            Map<String, GlobalValue> values = AuraPrivateAccessor.get(AuraContextImpl.class, "allowedGlobalValues");
            values.remove(name);
        } catch (Exception e) {
            throw new Error(String.format("Failed to unregister the global value '%s'", name), e);
        }
    }

    public void testGetAllowedGlobals() {
        final String name = getName();
        final String defaultValue = "some default value";
        ContextService contextService = Aura.getContextService();
        assertEquals("unregistered value should not be allowed", false,
                contextService.getAllowedGlobals().containsKey(name));

        addTearDownStep(new Runnable() {
            @Override
            public void run() {
                unregisterGlobal(name);
            }
        });
        contextService.registerGlobal(name, true, defaultValue);
        assertEquals("registered value should be allowed", true, contextService.getAllowedGlobals().containsKey(name));
        GlobalValue value = contextService.getAllowedGlobals().get(name);
        assertEquals(true, value.isWritable());
        assertEquals(defaultValue, value.getValue());
    }

    public void testRegisterGlobalWithInvalidName() {
        try {
            Aura.getContextService().registerGlobal("this wouldn't serialize properly", true, true);
            fail("shouldn't be able to register with an invalid name");
        } catch (Throwable t) {
            assertExceptionMessageStartsWith(t, AuraRuntimeException.class,
                    "Invalid name for $Global value: 'this wouldn't serialize properly'");
        }
    }

    public void testRegisterGlobalWithNullName() {
        try {
            Aura.getContextService().registerGlobal(null, true, true);
            fail("shouldn't be able to register with an invalid name");
        } catch (Throwable t) {
            assertExceptionMessageStartsWith(t, AuraRuntimeException.class,
                    "Invalid name for $Global value: 'null");
        }
    }
    
    public void testRegisterGlobalDuplicate() {
        final String name = getName();
        final String initialDefaultValue = "initial";
        final String defaultValue = "override";
        ContextService contextService = Aura.getContextService();

        addTearDownStep(new Runnable() {
            @Override
            public void run() {
                unregisterGlobal(name);
            }
        });

        contextService.registerGlobal(name, true, initialDefaultValue);
        GlobalValue value = contextService.getAllowedGlobals().get(name);
        assertEquals(true, value.isWritable());
        assertEquals(initialDefaultValue, value.getValue());

        contextService.registerGlobal(name, false, defaultValue);
        value = contextService.getAllowedGlobals().get(name);
        assertEquals(false, value.isWritable());
        assertEquals(defaultValue, value.getValue());
    }

}
