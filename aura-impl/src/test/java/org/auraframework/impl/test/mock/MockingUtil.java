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
package org.auraframework.impl.test.mock;

import java.util.Arrays;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.StringSource;
import org.auraframework.service.CompilerService;
import org.auraframework.service.DefinitionService;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;

/**
 * Provides access to mocks for internal framework objects that would be difficult to mock traditionally in the context
 * of integration tests. For integration tests (interacting with a server), the service tracks mocked objects with the
 * TestContext from the TestContextAdapter, so be sure to establish a context before mocking. For all other unit tests
 * (in-process), a default TestContext is used.
 */
public class MockingUtil {

    private final TestContextAdapter testContextAdapter;
    private final DefinitionService definitionService;
    private final CompilerService compilerService;

    public MockingUtil(TestContextAdapter testContextAdapter, DefinitionService definitionService, CompilerService compilerService) {
        this.testContextAdapter = testContextAdapter;
        this.definitionService = definitionService;
        this.compilerService = compilerService;
    }
    
    /**
     * Mock a Definition in the MasterDefRegistry. This takes effect on the next AuraContext establishment from this
     * test.
     * 
     * @param mockDefs the Definitions to be mocked
     * @throws Exception
     */
    public <D extends Definition> void mockDef(@SuppressWarnings("unchecked") D... mockDefs) throws Exception {
        if (mockDefs != null && mockDefs.length > 0) {
            TestContext testContext = testContextAdapter.getTestContext();
            if (testContext == null) {
                throw new IllegalStateException(
                        "TestContext not established; use TestContextAdapter.getTestContext(String).");
            }
            Set<Definition> mocks = testContext.getLocalDefs();
            if (mocks != null) {
                mocks.addAll(Arrays.asList(mockDefs));
            }
        }
    }

    /**
     * Mock a definition with the given markup.
     * 
     * @param defClass the type of Definition to generate
     * @param descriptor the name of the descriptor to assign to the generated Definition
     * @param markup content to parse
     * @return the Definition created from the provided markup
     * @throws Exception
     */
    public <D extends Definition> D mockDefMarkup(Class<D> defClass, String descriptor, String markup)
            throws Exception {
        DefDescriptor<D> desc = definitionService.getDefDescriptor(descriptor, defClass);
        return mockDefMarkup(desc, markup);
    }

    /**
     * Mock a definition with the given markup.
     * 
     * @param descriptor the descriptor to assign to the generated Definition
     * @param markup content to parse
     * @return the Definition created from the provided markup
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public <D extends Definition> D mockDefMarkup(DefDescriptor<D> descriptor, String markup) throws Exception {
        D def = compilerService.compile(descriptor,
                new StringSource<>(descriptor, markup, descriptor.getQualifiedName(), org.auraframework.system.Parser.Format.XML));
        mockDef(def);
        return def;
    }
}
