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
package org.auraframework.def;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.throwable.MissingRequiredAttributeException;

public class ForEachDefTest extends DefinitionTest<ComponentDef> {
    /**
     * @param name
     */
    public ForEachDefTest(String name) {
        super(name);
    }

    public void testInnerRequiredAttribute1() throws Exception {
        DefDescriptor<ComponentDef> required = registerComponentRequiredAttribute();
        DefDescriptor<ComponentDef> missing = registerComponentMissingRequiredAttribute(required);
        try {
            Aura.getInstanceService().getInstance(missing.getQualifiedName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredAttribute2() throws Exception {
        DefDescriptor<ComponentDef> required = registerComponentRequiredAttribute();
        DefDescriptor<ComponentDef> missing = registerComponentMissingRequiredAttribute(required);
        try {
            Aura.getInstanceService().getInstance(missing.getQualifiedName(), DefType.COMPONENT);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredAttribute3() throws Exception {
        DefDescriptor<ComponentDef> required = registerComponentRequiredAttribute();
        DefDescriptor<ComponentDef> missing = registerComponentMissingRequiredAttribute(required);
        try {
            Aura.getInstanceService().getInstance(missing);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredAttribute4() throws Exception {
        DefDescriptor<ComponentDef> required = registerComponentRequiredAttribute();
        DefDescriptor<ComponentDef> missing = registerComponentMissingRequiredAttribute(required);
        try {
            Aura.getInstanceService().getInstance(missing.getDef());
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredInheritedAttribute1() throws Exception {
        DefDescriptor<ComponentDef> required = registerComponentInheritedRequiredAttribute();
        DefDescriptor<ComponentDef> missing = registerComponentMissingInheritedRequiredAttribute(required);
        try {
            Aura.getInstanceService().getInstance(missing.getQualifiedName(), ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredInheritedAttribute2() throws Exception {
        DefDescriptor<ComponentDef> required = registerComponentInheritedRequiredAttribute();
        DefDescriptor<ComponentDef> missing = registerComponentMissingInheritedRequiredAttribute(required);
        try {
            Aura.getInstanceService().getInstance(missing.getQualifiedName(), DefType.COMPONENT);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredInheritedAttribute3() throws Exception {
        DefDescriptor<ComponentDef> required = registerComponentInheritedRequiredAttribute();
        DefDescriptor<ComponentDef> missing = registerComponentMissingInheritedRequiredAttribute(required);
        try {
            Aura.getInstanceService().getInstance(missing);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredInheritedAttribute4() throws Exception {
        DefDescriptor<ComponentDef> required = registerComponentInheritedRequiredAttribute();
        DefDescriptor<ComponentDef> missing = registerComponentMissingInheritedRequiredAttribute(required);
        try {
            Aura.getInstanceService().getInstance(missing.getDef());
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    private DefDescriptor<ComponentDef> registerComponentRequiredAttribute() {
        return addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>");
    }

    private DefDescriptor<ComponentDef> registerComponentMissingRequiredAttribute(
            DefDescriptor<ComponentDef> withRequiredAttribute) {
        return addSourceAutoCleanup(
                ComponentDef.class,
                "<aura:component model=\"java://org.auraframework.impl.java.model.TestJavaModel\"><aura:foreach items='{!m.stringList}' var='i'><"
                        + withRequiredAttribute.getDescriptorName() + "/></aura:foreach></aura:component>");
    }

    private DefDescriptor<ComponentDef> registerComponentInheritedRequiredAttribute() {
        DefDescriptor<ComponentDef> parentDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'><aura:attribute name='req' type='String' required='true'/></aura:component>");
        return addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component extends='%s'/>", parentDesc.getDescriptorName()));
    }

    private DefDescriptor<ComponentDef> registerComponentMissingInheritedRequiredAttribute(
            DefDescriptor<ComponentDef> required) {
        String contents = "<aura:component model=\"java://org.auraframework.impl.java.model.TestJavaModel\">"
                + "<aura:foreach items='{!m.stringList}' var='i'><" + required.getDescriptorName()
                + "/></aura:foreach></aura:component>";
        return addSourceAutoCleanup(ComponentDef.class, contents);
    }
}