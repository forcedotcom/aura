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
package org.auraframework.impl.root;

import java.util.List;
import java.util.Map;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.RootDefinition.SupportLevel;
import org.auraframework.impl.root.RootDefinitionImpl.Builder;
import org.auraframework.impl.system.DefinitionImplUnitTest;

public abstract class RootDefinitionImplUnitTest<I extends RootDefinitionImpl<D>, D extends RootDefinition, B extends Builder<D>>
        extends DefinitionImplUnitTest<I, D, D, B> {

    protected Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs;
    protected List<String> providerDescriptors;
    protected SupportLevel support;

    public RootDefinitionImplUnitTest(String name) {
        super(name);
    }

    public void testGetProviderDefDefault() throws Exception {
        this.providerDescriptors = null;
        ProviderDef actual = buildDefinition().getProviderDef();
        assertNull(actual);
    }

    public void testGetSupportDefault() throws Exception {
        SupportLevel actual = buildDefinition().getSupport();
        assertEquals(SupportLevel.PROTO, actual);
    }

    public void testGetSupportProto() throws Exception {
        this.support = SupportLevel.PROTO;
        SupportLevel actual = buildDefinition().getSupport();
        assertEquals(this.support, actual);
    }

    public void testGetSupportBeta() throws Exception {
        this.support = SupportLevel.BETA;
        SupportLevel actual = buildDefinition().getSupport();
        assertEquals(this.support, actual);
    }

    public void testGetSupportDeprecated() throws Exception {
        this.support = SupportLevel.DEPRECATED;
        SupportLevel actual = buildDefinition().getSupport();
        assertEquals(this.support, actual);
    }

    public void testGetSupportGa() throws Exception {
        this.support = SupportLevel.GA;
        SupportLevel actual = buildDefinition().getSupport();
        assertEquals(this.support, actual);
    }

    @Override
    protected D buildDefinition(B builder) throws Exception {
        builder.attributeDefs = this.attributeDefs;
        if (this.providerDescriptors != null) {
            for (String provider : this.providerDescriptors) {
                builder.addProvider(provider);
            }
        }
        builder.setSupport(this.support);
        return super.buildDefinition(builder);
    }
}