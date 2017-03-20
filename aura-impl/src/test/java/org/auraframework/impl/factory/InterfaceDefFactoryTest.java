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
package org.auraframework.impl.factory;

import javax.inject.Inject;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.system.BundleSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import com.google.common.collect.Lists;

public class InterfaceDefFactoryTest extends AuraImplTestCase {
    @Inject
    private InterfaceDefFactory factory;

    /**
     * sanity test.
     * check we can pass support/description to aura:interface (support only works for internal namespace)
     * also in the markup, we can have aura:attribute
     *
     * @throws Exception
     */
    @Test
    public void testInterfaceDefHandler() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<InterfaceDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                InterfaceDef.class, Lists.newArrayList(new BundleEntryInfo(DefType.INTERFACE,
                "<aura:interface support='PROTO' description='some description'><aura:attribute name='mystring' type='String'/><aura:registerevent name='click' type='aura:click' description='The Description'/></aura:interface>"
                )));
        InterfaceDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        assertEquals(1, def.getAttributeDefs().size());
        assertTrue(def.getAttributeDefs().containsKey(definitionService.getDefDescriptor("mystring", AttributeDef.class)));
        assertEquals(1, def.getRegisterEventDefs().size());
        assertNotNull(def.getRegisterEventDefs().get("click"));
    }

    /**
     * verify interface can extend from another interface
     *
     * @throws Exception
     */
    @Test
    public void testInterfaceDefHandlerWithExtension() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<InterfaceDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                InterfaceDef.class, Lists.newArrayList(new BundleEntryInfo(DefType.INTERFACE,
                "<aura:interface extends='aura:testinterfaceparent'></aura:interface>"
                )));
        InterfaceDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertEquals(1, def.getExtendsDescriptors().size());
        assertEquals("testinterfaceparent", def.getExtendsDescriptors().iterator().next().getName());
    }

    /**
     * verify invalid child tag error out
     *
     * @throws Exception
     */
    @Test
    public void testInterfaceDefHandlerWithInvalidChildTag() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<InterfaceDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                InterfaceDef.class, Lists.newArrayList(new BundleEntryInfo(DefType.INTERFACE,
                "<aura:interface><aura:foo/></aura:interface>"
                )));
        InterfaceDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);

        InvalidDefinitionException expected = null;

        try {
            def.validateDefinition();
        } catch (InvalidDefinitionException e) {
            expected = e;
        }

        assertNotNull("Should have thrown AuraException aura:foo isn't a valid child tag for aura:interface",
                expected);
        checkExceptionContains(expected, InvalidDefinitionException.class,
                "Found unexpected tag <aura:foo>");
    }

    /**
     * verify we cannot have text in the markup of aura:interface
     *
     * @throws Exception
     */
    @Test
    public void testInterfaceDefHandlerWithTextBetweenTag() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<InterfaceDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                InterfaceDef.class, Lists.newArrayList(new BundleEntryInfo(DefType.INTERFACE,
                "<aura:interface>Invalid text</aura:interface>"
                )));
        InterfaceDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        InvalidDefinitionException expected = null;

        try {
            def.validateDefinition();
        } catch (InvalidDefinitionException e) {
            expected = e;
        }
        assertNotNull("Should have thrown AuraException because text is between aura:interface tags", expected);
        checkExceptionContains(expected, InvalidDefinitionException.class,
                "No literal text allowed in interface definition");
    }

    /**
     * verify support is not allowed with non-internal namespace
     * @throws QuickFixException
     */
	@Test
    public void testSupportNotAllowedWithNonInternalNamespace() throws QuickFixException {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<InterfaceDef> bundleSource = util.buildBundleSource(util.getCustomNamespace(),
                InterfaceDef.class, Lists.newArrayList(new BundleEntryInfo(DefType.INTERFACE,
                "<aura:interface support='PROTO'></aura:interface>"
                )));
        InterfaceDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        InvalidDefinitionException expected = null;

    	try {
            def.validateDefinition(); 
    	} catch (InvalidDefinitionException e) {
            expected = e;
        }
        assertNotNull("we don't allow 'support' with non-internal namespace", expected);
        checkExceptionContains(expected, InvalidDefinitionException.class, 
                "Invalid attribute \"support\"");
    }
}
