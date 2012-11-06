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
package org.auraframework.impl.type;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Component;
import org.auraframework.util.type.CustomPairType;
/**
 * Unit test for using custom java data types for attribute values.
 *
 * A new data type can be introduced by creating a java class to represent the data.
 * Attributes of this type can be declared like to
 * <aura:attribute name="xyz" type="java://org.auraframework.util.type.CustomPairType" default="abc"/>
 *
 * Default values are converted to java objects using the TypeUtil conversion.
 *
 *
 * @since 0.0.248
 */
public class CustomDataTypeTest extends AuraImplTestCase {
    public CustomDataTypeTest(String name){
        super(name);
    }

    public void testCustomDataTypeConversion() throws Exception{
        DefDescriptor<ComponentDef> cmpDesc = addSource(String.format(baseComponentTag, "",
                "<aura:attribute name='pairAttr' type='java://org.auraframework.util.type.CustomPairType' default='HouseNo$300'/>"),
                ComponentDef.class);
            Component cmp = Aura.getInstanceService().getInstance(cmpDesc);
            assertEquals("Failed to convert attribute default value to custom data type object.",
                    new CustomPairType("HouseNo",300),cmp.getValue(new PropertyReferenceImpl("v.pairAttr", AuraUtil.getExternalLocation("direct attributeset access"))));
    }
}
