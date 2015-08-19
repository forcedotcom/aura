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
package org.auraframework.integration.test.root.component;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.NoAccessException;

/**
 * Verify access checks done during Instance creation, particularly in custom (non-privileged) namespaces
 */
public class InstanceAccessTest extends AuraImplTestCase {
    private static final String DEFAULT = StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE;
    private static final String OTHER = StringSourceLoader.OTHER_CUSTOM_NAMESPACE;
    private static final String ANOTHER = StringSourceLoader.ANOTHER_CUSTOM_NAMESPACE;

    public InstanceAccessTest(String name) {
        super(name);
    }

    public void testAccessToNonGlobalInSameNS() throws Exception {
        DefDescriptor<ComponentDef> otherCmp = buildCmp(DEFAULT, "cmp", "", "");
        assertAccess(otherCmp);
    }

    public void testNoAccessToNonGlobalInOtherNS() throws Exception {
        DefDescriptor<ComponentDef> otherCmp = buildCmp(OTHER, "cmp", "", "");
        assertNoAccess(otherCmp);
    }

    public void testAccessToGlobalInOtherNS() throws Exception {
        DefDescriptor<ComponentDef> otherCmp = buildCmp(OTHER, "global", "access='GLOBAL'", "");
        assertAccess(otherCmp);
    }

    public void testAccessToGlobalExtendingNonGlobalInOtherNS() throws Exception {
        DefDescriptor<ComponentDef> superCmp = buildCmp(OTHER, "super", "extensible='true'", "");
        DefDescriptor<ComponentDef> otherCmp = buildCmp(OTHER, "cmp",
                String.format("extends='%s' access='GLOBAL'", superCmp.getDescriptorName()), "");
        assertAccess(otherCmp);
    }

    public void testAccessToGlobalExtendingNonGlobalInOtherNSFromSameNS() throws Exception {
        DefDescriptor<ComponentDef> superCmp = buildCmp(OTHER, "super", "extensible='true'", "");
        DefDescriptor<ComponentDef> otherCmp = buildCmp(OTHER, "global",
                String.format("extends='%s' access='GLOBAL'", superCmp.getDescriptorName()), "");
        DefDescriptor<ComponentDef> relativeCmp = buildCmp(DEFAULT, "container", "",
                String.format("<%s/>", otherCmp.getDescriptorName()));
        assertAccess(relativeCmp);
    }

    public void testNoAccessToOtherGlobalExtendingNonGlobalInAnotherNS() throws Exception {
        DefDescriptor<ComponentDef> anotherCmp = buildCmp(ANOTHER, "super", "extensible='true'", "");
        DefDescriptor<ComponentDef> otherCmp = buildCmp(OTHER, "cmp",
                String.format("extends='%s' access='GLOBAL'", anotherCmp.getDescriptorName()), "");
        assertNoAccess(otherCmp);
    }

    public void testAccessToOtherGlobalAsFacetOfSameNS() throws Exception {
        DefDescriptor<ComponentDef> facetCmp = buildCmp(OTHER, "global", "access='GLOBAL'", "");
        DefDescriptor<ComponentDef> holderCmp = buildCmp(DEFAULT, "holder", "", "{!v.body}");
        DefDescriptor<ComponentDef> containerCmp = buildCmp(DEFAULT, "container", "",
                String.format("<%s><%s/></%1$s>", holderCmp.getDescriptorName(), facetCmp.getDescriptorName()));
        assertAccess(containerCmp);
    }

    /**
     * Should be able to pass provided facet to other global cmp
     */
    public void testAccessToNonGlobalAsFacetOfOtherGlobal() throws Exception {
        DefDescriptor<ComponentDef> facetCmp = buildCmp(DEFAULT, "cmp", "", "");
        DefDescriptor<ComponentDef> holderCmp = buildCmp(OTHER, "holder", "access='GLOBAL'", "{!v.body}");
        DefDescriptor<ComponentDef> containerCmp = buildCmp(DEFAULT, "container", "",
                String.format("<%s><%s/></%1$s>", holderCmp.getDescriptorName(), facetCmp.getDescriptorName()));
        assertAccess(containerCmp);
    }

    public void testNoAccessToOtherNonGlobalAsFacetOfOtherGlobal() throws Exception {
        DefDescriptor<ComponentDef> facetCmp = buildCmp(OTHER, "cmp", "", "");
        DefDescriptor<ComponentDef> holderCmp = buildCmp(OTHER, "holder", "access='GLOBAL'", "{!v.body}");
        DefDescriptor<ComponentDef> containerCmp = buildCmp(DEFAULT, "container", "",
                String.format("<%s><%s/></%1$s>", holderCmp.getDescriptorName(), facetCmp.getDescriptorName()));
        assertNoAccess(containerCmp);
    }

    /**
     * Should not be able to access other non-global cmp, even if facet of other global cmp
     */
    public void testNoAccessToOtherNonGlobalAsFacetOfOtherGlobalInDefaultGlobal() throws Exception {
        DefDescriptor<ComponentDef> facetCmp = buildCmp(OTHER, "cmp", "", "");
        DefDescriptor<ComponentDef> holderCmp = buildCmp(OTHER, "holder", "access='GLOBAL'", "{!v.body}");
        DefDescriptor<ComponentDef> containerCmp = buildCmp(DEFAULT, "container", "access='GLOBAL'",
                String.format("<%s><%s/></%1$s>", holderCmp.getDescriptorName(), facetCmp.getDescriptorName()));
        assertNoAccess(containerCmp);
    }

    public void testNoAccessToOtherNonGlobalAsFacetOfGlobalInSameNS() throws Exception {
        DefDescriptor<ComponentDef> facetCmp = buildCmp(OTHER, "cmp", "", "");
        DefDescriptor<ComponentDef> holderCmp = buildCmp(DEFAULT, "holder", "access='GLOBAL'", "{!v.body}");
        DefDescriptor<ComponentDef> containerCmp = buildCmp(DEFAULT, "container", "",
                String.format("<%s><%s/></%1$s>", holderCmp.getDescriptorName(), facetCmp.getDescriptorName()));
        assertNoAccess(containerCmp);
    }

    public void testAccessToOtherGlobalExtendingOtherNonGlobalAsFacetOfNonGlobalInSameNS() throws Exception {
        DefDescriptor<ComponentDef> superCmp = buildCmp(OTHER, "super", "extensible='true'", "");
        DefDescriptor<ComponentDef> facetCmp = buildCmp(OTHER, "global",
                String.format("extends='%s' access='GLOBAL'", superCmp.getDescriptorName()), "");
        DefDescriptor<ComponentDef> holderCmp = buildCmp(DEFAULT, "container", "", "{!v.body}");
        DefDescriptor<ComponentDef> containerCmp = buildCmp(DEFAULT, "container", "",
                String.format("<%s><%s/></%1$s>", holderCmp.getDescriptorName(), facetCmp.getDescriptorName()));
        assertAccess(containerCmp);
    }

    public void testAccessToOtherGlobalExtendingOtherAbsNonGlobalImplOtherIntf() throws Exception {
        DefDescriptor<InterfaceDef> intf = getAuraTestingUtil().addSourceAutoCleanup(InterfaceDef.class,
                "<aura:interface/>", OTHER + ":" + getName(), false);
        DefDescriptor<ComponentDef> absCmp = buildCmp(OTHER, "abstract",
                String.format("abstract='true' extensible='true' implements='%s'", intf.getDescriptorName()), "");
        DefDescriptor<ComponentDef> otherCmp = buildCmp(OTHER, "cmp",
                String.format("extends='%s' access='GLOBAL'", absCmp.getDescriptorName()), "");
        DefDescriptor<ComponentDef> relativeCmp = buildCmp(DEFAULT, "container", "",
                String.format("<%s/>", otherCmp.getDescriptorName()));
        assertAccess(relativeCmp);
    }

    private DefDescriptor<ComponentDef> buildCmp(String namespace, String namePrefix, String attributes, String body) {
        return getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, attributes, body), namespace + ":" + namePrefix + "_" + getName(),
                false);
    }

    private DefDescriptor<ApplicationDef> buildApp(String namespace, String attributes, String body) {
        return getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, attributes, body), namespace + ":" + getName(), false);
    }

    private void assertNoAccess(DefDescriptor<?> desc) throws Exception {
        DefDescriptor<ApplicationDef> appDesc = buildApp(DEFAULT, "", String.format("<%s/>", desc.getDescriptorName()));
        try {
            Aura.getInstanceService().getInstance(appDesc);
            fail("Expected NoAccessException");
        } catch (NoAccessException e) {
        }
    }

    private void assertAccess(DefDescriptor<?> desc) throws Exception {
        DefDescriptor<ApplicationDef> appDesc = buildApp(DEFAULT, "", String.format("<%s/>", desc.getDescriptorName()));
        Aura.getInstanceService().getInstance(appDesc);
    }

}
