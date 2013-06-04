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

import java.util.Map;
import java.util.Map.Entry;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ComponentDefRef.Load;
import org.auraframework.def.Definition.Visibility;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.root.component.ComponentDefRefImpl.Builder;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImplUnitTest;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.mockito.Mockito;

import com.google.common.collect.ImmutableMap;

public class ComponentDefRefImplUnitTest extends
        DefinitionImplUnitTest<ComponentDefImpl, ComponentDef, ComponentDefRef, Builder> {

    protected Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributeValues;
    protected DefDescriptor<InterfaceDef> intfDescriptor;
    protected String localId;
    protected Load load;

    public ComponentDefRefImplUnitTest(String name) {
        super(name);
    }

    public void testValidateReferencesPrivateAttribute() throws Exception {
        setupValidateReferences();
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);
        this.location = new Location("root", 0);
        ComponentDef rootDef = this.descriptor.getDef();

        DefDescriptor<AttributeDef> attrDesc = DefDescriptorImpl.getInstance("privateAttribute", AttributeDef.class);
        AttributeDef attrDef = Mockito.mock(AttributeDef.class);
        Mockito.doReturn(attrDesc).when(attrDef).getDescriptor();
        Mockito.doReturn(Visibility.PRIVATE).when(attrDef).getVisibility();
        Mockito.doReturn(ImmutableMap.of(attrDesc, attrDef)).when(rootDef).getAttributeDefs();
        AttributeDefRef attrRef = Mockito.mock(AttributeDefRef.class);
        this.attributeValues = ImmutableMap.of(attrDesc, attrRef);

        try {
            buildDefinition().validateReferences();
            fail("Expected an exception when trying to set a private attribute");
        } catch (Throwable t) {
            assertExceptionMessage(t, InvalidDefinitionException.class,
                    "Attribute 'privateAttribute' is specified as private");
            // check that the reported location is the location of the ref
            assertEquals(this.location, ((InvalidDefinitionException) t).getLocation());
        }
    }

    public void testValidateReferencesPublicAttribute() throws Exception {
        setupValidateReferences();
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);
        this.location = new Location("root", 0);
        ComponentDef rootDef = this.descriptor.getDef();

        DefDescriptor<AttributeDef> attrDesc = DefDescriptorImpl.getInstance("privateAttribute", AttributeDef.class);
        AttributeDef attrDef = Mockito.mock(AttributeDef.class);
        TypeDef attrType = Mockito.mock(TypeDef.class);
        Mockito.doReturn(attrDesc).when(attrDef).getDescriptor();
        Mockito.doReturn(attrType).when(attrDef).getTypeDef();
        Mockito.doReturn(Visibility.PUBLIC).when(attrDef).getVisibility();
        Mockito.doReturn(ImmutableMap.of(attrDesc, attrDef)).when(rootDef).getAttributeDefs();
        AttributeDefRef attrRef = Mockito.mock(AttributeDefRef.class);
        this.attributeValues = ImmutableMap.of(attrDesc, attrRef);

        Mockito.verifyZeroInteractions(attrRef);
        
        buildDefinition().validateReferences();
        
        Mockito.verify(attrRef).parseValue(attrType);
        Mockito.verify(attrRef).validateReferences();
    }

    @Override
    protected void setupValidateReferences() throws Exception {
        super.setupValidateReferences();
        ComponentDef def = Mockito.mock(ComponentDef.class);
        Mockito.doReturn(def).when(this.descriptor).getDef();
    }

    @Override
    protected Builder getBuilder() {
        return new Builder();
    }

    @Override
    protected ComponentDefRef buildDefinition(Builder builder) throws Exception {
        builder.setIntfDescriptor(this.intfDescriptor);
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
