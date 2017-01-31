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
package org.auraframework.impl.root.component;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefinitionReference.Load;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.root.component.ComponentDefRefImpl.Builder;
import org.auraframework.impl.system.DefinitionImplUnitTest;
import org.mockito.Mockito;

import java.util.Map;
import java.util.Map.Entry;

public class ComponentDefRefImplUnitTest extends
        DefinitionImplUnitTest<ComponentDefImpl, ComponentDef, ComponentDefRef, Builder> {

    protected Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues;
    protected DefDescriptor<InterfaceDef> intfDescriptor;
    protected String localId;
    protected Load load;

    @Override
    protected void setupValidateReferences() throws Exception {
        super.setupValidateReferences();
        ComponentDef def = Mockito.mock(ComponentDef.class);
        Mockito.doReturn(false).when(def).isAbstract();
        Mockito.doReturn(def).when(this.descriptor).getDef();
    }

    @Override
    protected Builder getBuilder() {
        return new Builder();
    }

    @Override
    protected ComponentDefRef buildDefinition(Builder builder) throws Exception {
        builder.setLocalId(this.localId);
        builder.setLoad(this.load);
        if (this.attributeValues != null) {
            for (Entry<DefDescriptor<AttributeDef>, AttributeDefRef> entry : attributeValues.entrySet()) {
                builder.setAttribute(entry.getKey(), entry.getValue());
            }
        }
        return super.buildDefinition(builder);
    }
}
