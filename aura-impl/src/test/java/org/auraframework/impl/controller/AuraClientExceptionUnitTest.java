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
package org.auraframework.impl.controller;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;

/**
 * Unit tests for ComponentController$AuraClientException
 */
public class AuraClientExceptionUnitTest extends UnitTestCase {

    @Test
    public void testCreateAuraClientExceptionWithQualifiedName() {
        String descriptor = "markup://foo:bar";

        AuraClientException ace = new AuraClientException(descriptor, null, null, null, null, null, null, null, null, null, null);

        String expectedNamespace = "foo";
        String expectedComponent = "bar";
        assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        assertEquals(expectedComponent, ace.getFailedComponent());
    }

    @Test
    public void testCreateAuraClientExceptionWithInvalidComponentQualifiedName() {
        String descriptor = "InvalidComponent markup://c:DTE_ImageCarousel {10:149;a}";

        AuraClientException ace = new AuraClientException(descriptor, null, null, null, null, null, null, null, null, null, null);

        String expectedNamespace = "c";
        String expectedComponent = "DTE_ImageCarousel";
        assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        assertEquals(expectedComponent, ace.getFailedComponent());
    }

    @Test
    public void testCreateAuraClientExceptionWithActionName() {
        String descriptor = "foo:bar$controller$doSomething";

        AuraClientException ace = new AuraClientException(descriptor, null, null, null, null, null, null, null, null, null, null);

        String expectedNamespace = "foo";
        String expectedComponent = "bar";
        String expectedMethod = "doSomething";
        assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        assertEquals(expectedComponent, ace.getFailedComponent());
        assertEquals(expectedMethod, ace.getFailedComponentMethod());
    }

    @Test
    public void testCreateAuraClientExceptionWithStacktrace() {
        String stacktrace =
                "VA()@https://customers.sage.com/s/sfsites/auraFW/javascript/9vevg4v6I80p1u_pT1V5VQ/aura_prod.js:266:132\n" +
                "b.P.get()@(https://customers.sage.com/s/sfsites/auraFW/javascript/9vevg4v6I80p1u_pT1V5VQ/aura_prod.js:263:381\n" +
                "value [as get]()@https://customers.sage.com/s/sfsites/auraFW/javascript/9vevg4v6I80p1u_pT1V5VQ/aura_prod.js:548:194\n" +
                "Object.next@components/c/UICarousel.js:57:36";

        AuraClientException ace = new AuraClientException(null, null, null, stacktrace, null, null, null, null, null, null, null);

        String expectedNamespace = "c";
        String expectedComponent = "UICarousel";
        assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        assertEquals(expectedComponent, ace.getFailedComponent());
    }

    @Test
    public void testCreateAuraClientExceptionWithModuleStacktrace() {
        String stacktrace =
         "AppNavBarItem.handleClick()@http://errortest.lightning.localhost.soma.force.com:6109/components/one-app-nav-bar-item.js:68:15\n"+
         "Object.boundFn()@http://errortest.lightning.localhost.soma.force.com:6109/auraFW/resources/tl_W7omHGRGQiu-tfZgpug/engine/engine.js:91:31\n"+
         "invokeHandler()@http://errortest.lightning.localhost.soma.force.com:6109/auraFW/resources/tl_W7omHGRGQiu-tfZgpug/engine/engine.js:2825:13\n"+
         "handleEvent()@http://errortest.lightning.localhost.soma.force.com:6109/auraFW/resources/tl_W7omHGRGQiu-tfZgpug/engine/engine.js:2853:5\n"+
         "HTMLAnchorElement.handler()@http://errortest.lightning.localhost.soma.force.com:6109/auraFW/resources/tl_W7omHGRGQiu-tfZgpug/engine/engine.js:2859:5";

        AuraClientException ace = new AuraClientException(null, null, null, stacktrace, null, null, null, null, Mockito.mock(ConfigAdapter.class), Mockito.mock(ContextService.class), Mockito.mock(DefinitionService.class));

        String expectedNamespace = "one";
        String expectedComponent = "appNavBarItem";
        String expectedFailingDescriptor = "markup://one:appNavBarItem";
        assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        assertEquals(expectedComponent, ace.getFailedComponent());
        assertEquals(expectedFailingDescriptor, ace.getCauseDescriptor());
    }
}
