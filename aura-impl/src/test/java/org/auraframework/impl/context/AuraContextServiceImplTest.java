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

import org.auraframework.adapter.ContextAdapter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.GlobalValue;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.test.util.AuraPrivateAccessor;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import javax.inject.Inject;

import java.util.HashMap;
import java.util.Map;

@RunWith(PowerMockRunner.class)
@PrepareForTest({ContextService.class, AuraContextServiceImpl.class})
public class AuraContextServiceImplTest extends AuraImplTestCase {
    @Inject
    private ContextAdapter contextAdapter;

    public AuraContextServiceImplTest() {
    	this.setShouldSetupContext(false);
    }

    @Test
    public void testAuraContextServiceImpl() {
        assertTrue(contextService instanceof AuraContextServiceImpl);
    }
    
    /*
     * Verify we can start Aura Context with globalValueProviders passed in
     * public AuraContext startContext(Mode mode, Set<SourceLoader> loaders, Format format, Authentication access,
                                    Map<String, GlobalValueProvider> globalValueProviders,
                                    DefDescriptor<? extends BaseComponentDef> appDesc)
     */
    @Test
    public void testStartLiteContext() throws Exception {
    	Map<String, GlobalValueProvider> emptyGVP = new HashMap<>();
    	ContextService contextServiceMocked = PowerMockito.spy(contextService);
    	contextServiceMocked.startContext(Mode.DEV, Format.JSON, Authentication.AUTHENTICATED, emptyGVP, null);
    	assertTrue(contextServiceMocked.isEstablished());
    	assertNotNull(contextServiceMocked.getCurrentContext());
    	
    	PowerMockito.verifyPrivate(contextServiceMocked, Mockito.never()).invoke("getGlobalProviders");
    	
    	contextServiceMocked.endContext();
    }

    @Test
    public void testTestContext() {
        // can only test the test context
        assertFalse(contextAdapter.isEstablished());
        contextService.startContext(Mode.DEV, Format.JSON, Authentication.AUTHENTICATED);
        assertTrue(contextAdapter.isEstablished());
        assertNotNull(contextAdapter.getCurrentContext());

        contextService.endContext();
        assertFalse(contextAdapter.isEstablished());
    }

    private void unregisterGlobal(String name) {
        try {
            Map<String, GlobalValue> values = AuraPrivateAccessor.get(AuraContextImpl.class, "allowedGlobalValues");
            values.remove(name);
        } catch (Exception e) {
            throw new Error(String.format("Failed to unregister the global value '%s'", name), e);
        }
    }

    @Test
    public void testGetAllowedGlobals() {
        final String name = getName();
        final String defaultValue = "some default value";
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

    @Test
    public void testRegisterGlobalWithInvalidName() {
        try {
            contextService.registerGlobal("this wouldn't serialize properly", true, true);
            fail("shouldn't be able to register with an invalid name");
        } catch (Throwable t) {
            assertExceptionMessageStartsWith(t, AuraRuntimeException.class,
                    "Invalid name for $Global value: 'this wouldn't serialize properly'");
        }
    }

    @Test
    public void testRegisterGlobalWithNullName() {
        try {
            contextService.registerGlobal(null, true, true);
            fail("shouldn't be able to register with an invalid name");
        } catch (Throwable t) {
            assertExceptionMessageStartsWith(t, AuraRuntimeException.class,
                    "Invalid name for $Global value: 'null");
        }
    }

    @Test
    public void testRegisterGlobalDuplicate() {
        final String name = getName();
        final String initialDefaultValue = "initial";
        final String defaultValue = "override";

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
