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
package org.auraframework.test.mock;

import java.util.Arrays;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.ValueDef;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.instance.Action.State;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.mockito.Mockito;

/**
 * Provides access to mocks for internal framework objects that would be difficult to mock traditionally in the context
 * of integration tests. For integration tests (interacting with a server), the service tracks mocked objects with the
 * TestContext from the TestContextAdapter, so be sure to establish a context before mocking. For all other unit tests
 * (in-process), a default TestContext is used.
 */
public class MockingUtil {
    /**
     * Mock a Definition in the MasterDefRegistry.  This takes effect on the next AuraContext establishment from this test.
     * @param mockDefs
     *            the Definitions to be mocked
     * @throws QuickFixException
     */
    public <D extends Definition> void mockDef(D... mockDefs) throws QuickFixException {
		if (mockDefs != null && mockDefs.length > 0) {
			TestContextAdapter testContextAdapter = Aura
					.get(TestContextAdapter.class);
			TestContext testContext = testContextAdapter.getTestContext();
			if (testContext == null) {
				throw new IllegalStateException(
						"TestContext not established; use TestContextAdapter.getTestContext(String).");
			}
            Set<Definition> mocks = testContext.getLocalDefs();
            if(mocks !=null){
                mocks.addAll(Arrays.asList(mockDefs));
            }
        }
    }
    
    /**
     * Mock a Model.  This will still rely on the current ModelDef to be valid.
     * 
     * @param modelDefDescriptor
     * @param properties
     *            the complete set of properties to be mocked
     * @return the MockModel that will be provided when instantiating the requested ModelDef
     * @throws QuickFixException
     */
    public MockModel mockModel(DefDescriptor<ModelDef> modelDefDescriptor, Map<String, Object> properties)
            throws QuickFixException {
        final ModelDef modelDef = Mockito.spy(Aura.getDefinitionService().getDefinition(modelDefDescriptor));
        final MockModel model = Mockito.spy(new MockModel(modelDefDescriptor, properties));
        Mockito.doReturn(model).when(modelDef).newInstance();
        mockDef(modelDef);
        return model;
    }

    /**
     * Mock a ModelDef.
     * 
     * @param modelDefDescriptor
     * @param members
     *            the ValueDef members of the ModelDef
     * @return the MockModelDef that will be provided by the registry
     * @throws QuickFixException
     */
    public MockModelDef mockModelDef(DefDescriptor<ModelDef> modelDefDescriptor, Set<ValueDef> members)
            throws QuickFixException {
        final MockModelDef modelDef = Mockito.spy(new MockModelDef(modelDefDescriptor, members, null));
        mockDef(modelDef);
        return modelDef;
    }

    
    /**
     * Mock a server ProviderDef.
     * 
     * @param providerDefDescriptor
     * @param componentConfig
     *            the ComponentConfig that the mock should provide
     * @return the MockProviderDef that will be provided by the registry
     * @throws QuickFixException
     */
    public MockProviderDef mockServerProviderDef(DefDescriptor<ProviderDef> providerDefDescriptor,
            ComponentConfig componentConfig) throws QuickFixException {
        final MockProviderDef providerDef = Mockito.spy(new MockProviderDef(providerDefDescriptor, componentConfig));
        mockDef(providerDef);
        return providerDef;
    }

    /**
     * Mock a server Action.
     * 
     * @param controllerDefDescriptor
     * @param actionName
     * @param returnValue
     * @return the MockAction that will be provided when instantiating the requested Action
     * @throws DefinitionNotFoundException
     * @throws QuickFixException
     */
    public MockAction mockServerAction(DefDescriptor<ControllerDef> controllerDefDescriptor, String actionName,
            Object returnValue) throws DefinitionNotFoundException, QuickFixException {
        final ControllerDef originalControllerDef = Aura.getDefinitionService().getDefinition(controllerDefDescriptor);
        final ControllerDef controllerDef = Mockito.spy(originalControllerDef);
        final MockAction mockAction = Mockito.spy(new MockAction(originalControllerDef.getSubDefinition(actionName)
                .getDescriptor(), State.SUCCESS, returnValue));
        Mockito.doReturn(mockAction).when(controllerDef)
                .createAction(Mockito.eq(actionName), Mockito.anyMapOf(String.class, Object.class));
        mockDef(controllerDef);
        return mockAction;
    }
}
