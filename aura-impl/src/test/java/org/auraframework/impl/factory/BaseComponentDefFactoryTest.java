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

import java.util.List;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.system.BundleSource;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

import com.google.common.collect.Lists;

public abstract class BaseComponentDefFactoryTest<D extends BaseComponentDef> extends AuraImplTestCase {
    protected DefinitionFactory<BundleSource<D>, D> factory;
    private String tag;
    Class<D> defClass;
    DefType type;

    /**
     * Constructor for the common tests on both application and component bundles.
     *
     * @param tag the start tag, with a two %s in it for attributes and contents.
     * @param type the deftype
     */
    protected BaseComponentDefFactoryTest(String tag, Class<D> defClass) {
        this.tag = tag;
        this.defClass = defClass;
        this.type = DefType.getDefType(defClass);
    }

    public void setFactory(DefinitionFactory<BundleSource<D>, D> factory) {
        this.factory = factory;
    }

    @Test
    public void testEmptyXML() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<D> bundleSource = util.buildBundleSource(util.getInternalNamespace(), defClass,
                Lists.newArrayList(new BundleEntryInfo(type, String.format(tag, "", ""))));
        assertNotNull(factory.getDefinition(bundleSource.getDescriptor(), bundleSource));
    }

    @Test
    public void testEmptyXMLPlusController() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<D> bundleSource = util.buildBundleSource(util.getInternalNamespace(), defClass,
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "", "")),
                    new BundleEntryInfo(DefType.CONTROLLER, "({ myFunction : function () {} })")
                    ));
        D def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        assertNotNull(def.getRemoteControllerDef());
    }

    @Test
    public void testControllerAttrPlusControllerMissing() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<D> bundleSource = util.buildBundleSource(util.getInternalNamespace(), defClass,
                Lists.newArrayList(
                        new BundleEntryInfo(type, String.format(tag, "controller='java://org.auraframework.BogusJavaController'", "")),
                        new BundleEntryInfo(DefType.CONTROLLER, "({ myFunction : function () {} })")
                        ));
        D def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        assertNotNull(def.getRemoteControllerDef());
    }

    @Test
    public void testControllerDifferenceInHash() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        List<BundleEntryInfo> entries = Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "", "")),
                    new BundleEntryInfo(DefType.CONTROLLER, "({ myFunction : function () {} })")
                    );
        List<BundleEntryInfo> entries2 = Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "", "")),
                    new BundleEntryInfo(DefType.CONTROLLER, "({ myFunction : function () { return 'hah'; } })")
                    );
        BundleSource<D> bundleSource = util.buildBundleSource(util.getInternalNamespace(), defClass, entries);
        D def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        bundleSource = util.buildBundleSource(util.getInternalNamespace(), entries.get(0).getName(), defClass, entries2);
        D def2 = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        assertNotNull(def.getRemoteControllerDef());
        assertNotNull(def2);
        assertNotNull(def2.getRemoteControllerDef());
        assertFalse("Hashes should be different "+def.getOwnHash()+" == "+def2.getOwnHash(),
                def.getOwnHash().equals(def2.getOwnHash()));
    }

    @Test
    public void testEmptyXMLPlusRenderer() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<D> bundleSource = util.buildBundleSource(util.getInternalNamespace(), defClass,
                Lists.newArrayList(
                        new BundleEntryInfo(type, String.format(tag, "", "")),
                        new BundleEntryInfo(DefType.RENDERER, "({ render : function () {} })")
                        ));
        D def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        assertNotNull(def.getRemoteRendererDef());
    }

    @Test
    public void testRendererAttrPlusRendererMissing() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<D> bundleSource = util.buildBundleSource(util.getInternalNamespace(), defClass,
                Lists.newArrayList(
                        new BundleEntryInfo(type, String.format(tag, "renderer='java://org.auraframework.BogusJavaRenderer'", "")),
                        new BundleEntryInfo(DefType.RENDERER, "({ render : function () {} })")
                        ));
        D def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        assertNull(def.getRemoteRendererDef());
    }

    @Test
    public void testRendererDifferenceInHash() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        List<BundleEntryInfo> entries = Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "", "")),
                    new BundleEntryInfo(DefType.RENDERER, "({ render : function () {} })")
                    );
        List<BundleEntryInfo> entries2 = Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "", "")),
                    new BundleEntryInfo(DefType.RENDERER, "({ render : function () { return 'hah'; } })")
                    );
        BundleSource<D> bundleSource = util.buildBundleSource(util.getInternalNamespace(), defClass, entries);
        D def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        bundleSource = util.buildBundleSource(util.getInternalNamespace(), entries.get(0).getName(), defClass, entries2);
        D def2 = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        assertNotNull(def.getRemoteRendererDef());
        assertNotNull(def2);
        assertNotNull(def2.getRemoteRendererDef());
        assertFalse("Hashes should be different "+def.getOwnHash()+" == "+def2.getOwnHash(),
                def.getOwnHash().equals(def2.getOwnHash()));
    }

    @Test
    public void testEmptyXMLPlusProvider() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<D> bundleSource = util.buildBundleSource(util.getInternalNamespace(), defClass,
                Lists.newArrayList(
                        new BundleEntryInfo(type, String.format(tag, "", "")),
                        new BundleEntryInfo(DefType.HELPER, "({ provider : function () {} })")
                        ));
        D def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        assertNotNull(def.getRemoteHelperDef());
    }

    @Test
    public void testRegisterDuplicateEventNames() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<D> bundleSource = util.buildBundleSource(util.getInternalNamespace(), defClass,
                Lists.newArrayList(
                    new BundleEntryInfo(type,
                        String.format(tag, "", 
                            "<aura:registerevent name='dupName' type='aura:click'/>"
                            +"<aura:registerevent name='dupName' type='aura:click'/>"
                            ))
                    ));
        D def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        InvalidDefinitionException expected = null;

        assertNotNull(def);
        try {
            def.validateDefinition();
        } catch (InvalidDefinitionException e) {
            expected = e;
        }
        assertNotNull("Should have thrown AuraRuntimeException for registering two events with the same name",
                expected);
        checkExceptionContains(expected, InvalidDefinitionException.class, 
                    String.format("There is already an event named 'dupName' registered on %s '%s'.", type.toString().toLowerCase(), bundleSource.getDescriptor().getDescriptorName()));
    }
}
