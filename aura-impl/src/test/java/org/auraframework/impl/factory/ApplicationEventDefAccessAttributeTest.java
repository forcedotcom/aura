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

import org.auraframework.def.EventDef;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.system.Source;
import org.junit.Test;

import com.google.common.collect.Lists;

public class ApplicationEventDefAccessAttributeTest extends BaseAccessAttributeTest<EventDef> {
    public ApplicationEventDefAccessAttributeTest() {
        super(EventDef.class, "<aura:event type='application' %s>%s</aura:event>");
    }

    @Test
    @Override
    public void testDefinitionWithPrivateAccessCustomNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<EventDef> source = util.buildBundleSource(util.getCustomNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PRIVATE'", ""))
                    ));
        EventDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Bogus. We should faile here.", def);
    }

    @Test
    @Override
    public void testDefinitionWithPrivateAccessInternalNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<EventDef> source = util.buildBundleSource(util.getInternalNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PRIVATE'", ""))
                    ));
        EventDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Bogus. We should faile here.", def);
    }

    @Test
    @Override
    public void testDefinitionWithPrivateAccessPrivilegedNamespace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<EventDef> source = util.buildBundleSource(util.getPrivilegedNamespace(),
                defClass, 
                Lists.newArrayList(
                    new BundleEntryInfo(type, String.format(tag, "access='PRIVATE'", ""))
                    ));
        EventDef def = compilerService.compile(source.getDescriptor(), source);
        assertNotNull("Bogus. We should faile here.", def);
    }
}
