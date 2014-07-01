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
package org.auraframework.component.aura;

import java.util.ArrayList;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import test.model.TestReinitializeModelWithCount;

public class reinitializeModelTest extends AuraImplTestCase {
    private final boolean debug = false;

    String componentTag = "<auratest:test_Model_Parent attrInParent=%s/>";
    String attributeTag = "<aura:attribute name=%s type=%s default=%s/>";
    String attributeTag2 = "<aura:attribute name=%s type=%s/>";
    String componentTagIf = "<ifTest:testIfWithModel attr=%s/>";
    String componentTagWithModelAndAttr = "<aura:component model='java://test.model.%s' extensible='true'>"
            + "<aura:attribute name='attrInParent' type='String' default=%s/>" + "%s" + "<br/>Parent CMP<br/>"
            + "m.valueParent={!m.valueParent}" + "%s" + "{!v.body}" + "</aura:component>";
    String componentTagIfWithModelAndAttr = "<aura:component render='client' model='java://test.model.%s'>"
            + "<aura:attribute name='attr' type='String' default=%s/>"
            + "%s" + "<br/>INNER CMP -- value of attr: {!v.attr} , value from module: {!m.value}<br/>"
            + "%s" + "</aura:component>";
    String componentTagExtendWithAttr = "<aura:component extends='%s' render='client'>"
            + "<aura:attribute name='%s' type='String' default='%s'/>" + "%s"
            + "<aura:set attribute='attrInParent' value='%s'/>"
            + "<br/>GrandCHILD CMP<br/>" + "%s" + "</aura:component>";

    public reinitializeModelTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    private DefDescriptor<ComponentDef> getDefDescriptorExtend(String extend, String attname, String attvalue,
            String extraAttr, String mvalue, String extraCmp) {
        String extraAttribute = "";
        if (extraAttr != null && extraAttr.length() > 0) {
            extraAttribute = extraAttr;
        }
        String extraComponent = "";
        if (extraCmp != null && extraCmp.length() > 0) {
            extraComponent = extraCmp;
        }
        String source = String.format(componentTagExtendWithAttr, extend, attname, attvalue, extraAttribute, mvalue,
                extraComponent);
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(ComponentDef.class, source);
        if (debug) {
            System.out.println(def.getDescriptorName() + ":\n" + source);
        }
        return def;
    }

    private DefDescriptor<ComponentDef> getDefDescriptor(String tag, String model, String attr, String extraAttr,
            String extraCmp) {
        String attribute = "defaultAttribute";
        if (attr != null && attr.length() > 0) {
            attribute = attr;
        }
        String extraAttribute = "";
        if (extraAttr != null && extraAttr.length() > 0) {
            extraAttribute = extraAttr;
        }
        String extraComponent = "";
        if (extraCmp != null && extraCmp.length() > 0) {
            extraComponent = extraCmp;
        }
        String source = String.format(tag, model, attribute, extraAttribute, extraComponent);
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(ComponentDef.class, source);
        if (debug) {
            System.out.println(def.getDescriptorName() + ":\n" + source);
        }
        return def;
    }

    private String getCmpString(DefDescriptor<ComponentDef> defDescriptor) {
        return "<" + defDescriptor.getDescriptorName() + "/>";
    }

    /*
     * This test is for one component(ChildCMP) has a component(GrandChildCMP) in its markup, both of them extend the
     * same parent component SetUP: ChildCMP and GrandChildCMP both extend ParentCMP, and ChildCMP include GrandChildCMP
     * in its markup ParentCMP(test_Model_Parent) set m.valueParent with v.attrInParent ChildCMP when we include
     * GrandChildCMP in ChildCMP's markup, we create it with
     * v.attributeInGrandChild="new attributeInGrandChild from child" Test: change v.attributeInChild and
     * v.attrInParent, hope to see if ParentCMP get updated individually for ChildCMP and GrandChildCMP. Function Wise:
     * ChildCMP and GrandChildCMP get updated individually. Performance Wise: manually verify we rebuild the model for
     * parentCMP twice, once as ChildCMP's super, once as GrandChildCMP's super bug filed W-2107548: it's a rare
     * situation, but if we remove all output from GrandChildCMP/ChildCMP/ParentCMP, it will reinitialize model for
     * grand child's super(parentCmp) TWICE, because component tree is different with grand child show up twice. if we
     * have some output in any of the cmp(or just {!v.body}), it only do it once, maybe we should force user to do this
     */
    public void runTestReinitializedModelSuperCmp(Boolean testModelWithCount, String model) throws Exception {
        if (testModelWithCount) {
            TestReinitializeModelWithCount.clearCount();
        }
        Map<String, Object> attributes = Maps.newHashMap();

        DefDescriptor<ComponentDef> defDesParent = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent1'", "", "");

        DefDescriptor<ComponentDef> defDesGrandChild = getDefDescriptorExtend
                (defDesParent.getDescriptorName(), "attributeInGrandChild", "default attribute in GrandChild", "",
                        "{!v.attributeInGrandChild}", "");
        String cmpGrandChild = "<" + defDesGrandChild.getDescriptorName()
                + " attributeInGrandChild='{!v.attributeFromChildToGrandChild}'" + "/>";

        String attributeFromChildToGrandChild = String.format(attributeTag, "'attributeFromChildToGrandChild'",
                "'String'", "'default attributeFromChildToGrandChild'");
        DefDescriptor<ComponentDef> defDesChild = getDefDescriptorExtend
                (defDesParent.getDescriptorName(), "attributeInChild", "default attribute in Child",
                        attributeFromChildToGrandChild, "{!v.attributeInChild}", cmpGrandChild);

        Component childCmp = Aura.getInstanceService().getInstance(defDesChild, attributes);

        String result =
                "<br/>ParentCMP<br/>m.valueParent=defaultattributeinChild" +
                        "<br/>GrandCHILDCMP<br/>" +
                        "<br/>ParentCMP<br/>m.valueParent=defaultattributeFromChildToGrandChild" +
                        "<br/>GrandCHILDCMP<br/>";
        if (testModelWithCount) {
            assertEquals(2, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            assertEquals(result, getRenderedBaseComponent(childCmp).replaceAll("\\s+", ""));
        }

        Map<String, Object> newAttributes = Maps.newHashMap();
        newAttributes.put("attributeFromChildToGrandChild", "new attributeFromChildToGrandChild");
        newAttributes.put("attributeInChild", "new attribute in Child");
        childCmp.getAttributes().set(newAttributes);
        childCmp.reinitializeModel();

        if (testModelWithCount) {
            assertEquals(2, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            assertEquals(result.replaceAll("default", "new"), getRenderedBaseComponent(childCmp).replaceAll("\\s+", ""));
        }
    }

    public void testReinitializedModelSuperCmp() throws Exception {
        runTestReinitializedModelSuperCmp(false, "TestReinitializeModel");
    }

    public void testReinitializedModelSuperCmpWithCount() throws Exception {
        runTestReinitializedModelSuperCmp(true, "TestReinitializeModelWithCount");
    }

    /*
     * This test is to verify different instance of same component(with same model) get reinitialized individually
     * Setup: a main component with list of 3 child components in its markup all of them use same
     * component(test_Model_Parent), with different attribute value:attrInParent ParentCMP(test_Model_Parent) set
     * m.valueParent with v.attrInParent Test: change attribute value (attributeInMain[1,2,3]), then reinitializeModel
     * on main component, Function wise: verify that each child component get updated correctly Performance wise:
     * manually verify that the TestReinitializeModel was reinitialized exactly 3 times
     */
    public void runTestSameCmpSameModel(Boolean testModelWithCount, String model) throws Exception {
        if (testModelWithCount) {
            TestReinitializeModelWithCount.clearCount();
        }
        DefDescriptor<ComponentDef> defDes1 = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent1'", "", "");
        String source1 = "<" + defDes1.getDescriptorName() + " attrInParent='{!v.attributeInMain1}'" + "/>";
        DefDescriptor<ComponentDef> defDes2 = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent1'", "", "");
        String source2 = "<" + defDes2.getDescriptorName() + " attrInParent='{!v.attributeInMain2}'" + "/>";
        DefDescriptor<ComponentDef> defDes3 = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent1'", "", "");
        String source3 = "<" + defDes3.getDescriptorName() + " attrInParent='{!v.attributeInMain3}'" + "/>";

        /*
         * String componentTag = "<auratest:test_Model_Parent attrInParent=%s/>"; String source1 =
         * String.format(componentTag,"'{!v.attributeInMain1}'"); String source2 =
         * String.format(componentTag,"'{!v.attributeInMain2}'"); String source3 =
         * String.format(componentTag,"'{!v.attributeInMain3}'");
         */
        String attributeInMain1 = String.format(attributeTag, "'attributeInMain1'", "'String'",
                "'default attributeInMain1'");
        String attributeInMain2 = String.format(attributeTag, "'attributeInMain2'", "'String'",
                "'default attributeInMain2'");
        String attributeInMain3 = String.format(attributeTag, "'attributeInMain3'", "'String'",
                "'default attributeInMain3'");
        String source = source1 + source2 + source3;
        Map<String, Object> attributes = Maps.newHashMap();
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(ComponentDef.class, String.format(
                "<aura:component render=\"client\">" +
                        attributeInMain1 + attributeInMain2 + attributeInMain3 +
                        "MAIN CMP%s</aura:component>", source));
        Component mainCMP = Aura.getInstanceService().getInstance(def, attributes);

        String result = "MAINCMP" +
                "<br/>ParentCMP<br/>m.valueParent=defaultattributeInMain1" +
                "<br/>ParentCMP<br/>m.valueParent=defaultattributeInMain2" +
                "<br/>ParentCMP<br/>m.valueParent=defaultattributeInMain3";

        if (testModelWithCount) {
            assertEquals(3, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            assertEquals(result, getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
        }
        Map<String, Object> newAttributes = Maps.newHashMap();
        newAttributes.put("attributeInMain1", "new attribute In Main1");
        newAttributes.put("attributeInMain2", "new attribute In Main2");
        newAttributes.put("attributeInMain3", "new attribute In Main3");
        mainCMP.getAttributes().set(newAttributes);
        mainCMP.reinitializeModel();

        if (testModelWithCount) {
            assertEquals(3, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            assertEquals(result.replaceAll("default", "new"), getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
        }
    }

    public void testSameCmpSameModel() throws Exception {
        runTestSameCmpSameModel(false, "TestReinitializeModel");
    }

    public void testSameCmpSameModelWithCount() throws Exception {
        runTestSameCmpSameModel(true, "TestReinitializeModelWithCount");
    }

    /*
     * This test is to verify different component with same model get reinitialized individually Setup: a main component
     * with 2 child components in its markup they are different component, but use same model Test: change attribute
     * value (attributeInMain[,1,2,3]), then reinitializeModel on main component
     */
    public void runTestDiffCMPSameModel(Boolean testModelWithCount, String model) throws Exception {
        if (testModelWithCount) {
            TestReinitializeModelWithCount.clearCount();
        }
        DefDescriptor<ComponentDef> defDes1 = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent1'", "", "");
        String source1 = "<" + defDes1.getDescriptorName() + " attrInParent='{!v.attributeInMain1}'" + "/>";

        DefDescriptor<ComponentDef> defDes2 = getDefDescriptor(componentTagIfWithModelAndAttr, model,
                "'defaultattributeinParent2'", "", "");
        String source2 = "<" + defDes2.getDescriptorName() + " attr='{!v.attributeInMain}'" + "/>";

        // String source1 = String.format(componentTag,"'{!v.attributeInMain1}'");
        // String source2 = String.format(componentTagIf,"'{!v.attributeInMain}'");
        String source = source1 + source2;
        String attributeInMain = String.format(attributeTag, "'attributeInMain'", "'String'",
                "'default attributeInMain'");
        String attributeInMain1 = String.format(attributeTag, "'attributeInMain1'", "'String'",
                "'default attributeInMain1'");
        Map<String, Object> attributes = Maps.newHashMap();
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(ComponentDef.class, String.format(
                "<aura:component render=\"client\">" +
                        attributeInMain + attributeInMain1 +
                        "MAIN CMP%s</aura:component>", source));
        Component mainCMP = Aura.getInstanceService().getInstance(def, attributes);

        String result = "MAINCMP<br/>ParentCMP<br/>m.valueParent=defaultattributeInMain1<br/>INNERCMP--valueofattr:defaultattributeInMain,valuefrommodule:defaultattributeInMain<br/>";
        if (testModelWithCount) {
            assertEquals(2, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            assertEquals(result, getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
        }
        Map<String, Object> newAttributes = Maps.newHashMap();
        newAttributes.put("attributeInMain", "new attribute In Main");
        newAttributes.put("attributeInMain1", "new attribute In Main1");
        mainCMP.getAttributes().set(newAttributes);
        mainCMP.reinitializeModel();

        if (testModelWithCount) {
            assertEquals(2, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            assertEquals(result.replaceAll("default", "new"), getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
        }
    }

    public void testDiffCMPSameModel() throws Exception {
        runTestDiffCMPSameModel(false, "TestReinitializeModel");
    }

    public void testDiffCMPSameModelWithCount() throws Exception {
        runTestDiffCMPSameModel(true, "TestReinitializeModelWithCount");
    }

    /*
     * This test is to verify 3 layers of components, when attribute changes, each get to rebuild its model correctly. a
     * main component with ParentContainer component in its markup, the ParentContainer has ParentCmp in its markup bug
     * filed W-2107437 : funny thing if we accidently include a component itself in its markup, we will end up with
     * infinity loop then out of memory.
     */
    public void runTestNestedCmp(Boolean testModelWithCount, String model) throws Exception {
        if (testModelWithCount) {
            TestReinitializeModelWithCount.clearCount();
        }
        Map<String, Object> attributes = Maps.newHashMap();

        DefDescriptor<ComponentDef> defDes3 = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent3'", "", "");
        String cmpString3 = "<" + defDes3.getDescriptorName() + " attrInParent='{!v.attributeInParentContainer}'"
                + "/>";

        String att2to3 = String.format(attributeTag, "'attributeInParentContainer'", "'String'",
                "'default attributeInParentContainer'");

        DefDescriptor<ComponentDef> defDes2 = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent2'", att2to3, cmpString3);
        String cmpString2 = "<" + defDes2.getDescriptorName()
                + " attrInParent='{!v.attMainToParentContainer}'"
                + " attributeInParentContainer='{!v.attMainToParent}'"
                + "/>";

        String att1to2 = String
                .format(attributeTag, "'attMainToParentContainer'", "'String'", "'defaultattribute1to2'");
        String att1to3 = String.format(attributeTag, "'attMainToParent'", "'String'", "'defaultattribute1to3'");
        DefDescriptor<ComponentDef> defDes1 = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent1'", att1to2 + att1to3, cmpString2);

        Component mainCMP = Aura.getInstanceService().getInstance(defDes1, attributes);

        String result = "<br/>ParentCMP<br/>m.valueParent=defaultattributeinParent1" +
                "<br/>ParentCMP<br/>m.valueParent=defaultattribute1to2" +
                "<br/>ParentCMP<br/>m.valueParent=defaultattribute1to3";
        if (testModelWithCount) {
            assertEquals(3, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            assertEquals(result, getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
        }

        attributes.clear();
        attributes.put("attrInParent", "new attributeinParent1");
        attributes.put("attMainToParentContainer", "new attribute1to2");
        attributes.put("attMainToParent", "new attribute1to3");
        mainCMP.getAttributes().set(attributes);
        mainCMP.reinitializeModel();
        if (testModelWithCount) {
            assertEquals(3, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            assertEquals(result.replaceAll("default", "new"), getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
        }
    }

    public void testNestedCmp() throws Exception {
        runTestNestedCmp(false, "TestReinitializeModel");
    }

    public void testNestedCmpCount() throws Exception {
        runTestNestedCmp(true, "TestReinitializeModelWithCount");
    }

    /*
     * This test is for main component with another child component as attribute child component has a model.
     * reinitializeModel on main component should rebuild model for the attribute too
     */
    public void runTestCmpAsAttribute(Boolean testModelWithCount, String model) throws Exception {
        if (testModelWithCount) {
            TestReinitializeModelWithCount.clearCount();
        }
        Map<String, Object> attributesMain = Maps.newHashMap();
        DefDescriptor<ComponentDef> defDes = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent'", "", "");
        String cmpString = getCmpString(defDes);
        String attributeSource =
                "<aura:attribute name='componentArray' type='Aura.Component[]'>" + cmpString + "</aura:attribute>";
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(ComponentDef.class, String.format(
                "<aura:component render='client'>" + attributeSource +
                        "%s</aura:component>", "'{!v.componentArray}'"));
        Component mainCMP = Aura.getInstanceService().getInstance(def, attributesMain);
        if (testModelWithCount) {
            assertEquals(1, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            String output = getRenderedBaseComponent(mainCMP);
            String result = "'<br/>ParentCMP<br/>m.valueParent=defaultattributeinParent'";
            assertEquals(result, output.replaceAll("\\s+", ""));
        }

        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("attrInParent", "newValueInParent");

        DefDescriptor<ComponentDef> newDefDes = getDefDescriptor(componentTagWithModelAndAttr, model,
                "'defaultattributeinParent'", "", "");
        Component newAttrCMP = Aura.getInstanceService().getInstance(newDefDes.getDescriptorName(), ComponentDef.class,
                attributes);
        if (testModelWithCount) {
            TestReinitializeModelWithCount.clearCount();
        }
        ArrayList<Component> newCmpList = new ArrayList<Component>();
        newCmpList.add(newAttrCMP);
        attributesMain.clear();
        attributesMain.put("componentArray", newCmpList);
        mainCMP.getAttributes().set(attributesMain);
        mainCMP.reinitializeModel();
        if (testModelWithCount) {
            assertEquals(1, TestReinitializeModelWithCount.getCount());
            TestReinitializeModelWithCount.clearCount();
        } else {
            String newoutput = getRenderedBaseComponent(mainCMP);
            String newresult = "'<br/>ParentCMP<br/>m.valueParent=newValueInParent'";
            assertEquals(newresult, newoutput.replaceAll("\\s+", ""));
        }
    }

    public void testCmpAsAttribute() throws Exception {
        runTestCmpAsAttribute(false, "TestReinitializeModel");
    }

    public void testCmpAsAttributeCount() throws Exception {
        runTestCmpAsAttribute(true, "TestReinitializeModelWithCount");
    }

    /*
     * This test is to verify a main component with java provider. the java provider provides a component with model
     * reinitializeModel on main component should rebuild model for the provided component. ParentCMP(test_Model_Parent)
     * set m.valueParent with v.attrInParent
     */
    public void testCmpWithJavaProvider() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("whatToDo", "provideTestModelParentCmp");
        Component mainCMP = Aura.getInstanceService().getInstance("test:test_Provider_Concrete", ComponentDef.class,
                attributes);
        String result = "<br/>ParentCMP<br/>m.valueParent=defaultattributeinParent";
        assertEquals(result, getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
        attributes.clear();
        // now what we really have is test_Model_Parent, not test_Provider_Concrete
        // trying to change what we provide like this won't work :
        // attributes.put("whatToDo", "provideTestModelParentCmpWithNewAttr");
        attributes.put("attrInParent", "provideTestModelParentCmpWithNewAttr");
        mainCMP.getAttributes().set(attributes);
        mainCMP.reinitializeModel();
        String newresult = "<br/>ParentCMP<br/>m.valueParent=provideTestModelParentCmpWithNewAttr";
        assertEquals(newresult, getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
    }

    /*
     * Bug: W-2107628 trying to change what we provide like this won't work also I didn't check in
     * provideTestModelParentCmpWithNewAttr for the provider of test_Provider_Concrete
     */
    public void _testCmpWithJavaProviderChangeWhatWeProvide() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("whatToDo", "provideTestModelParentCmp");
        Component mainCMP = Aura.getInstanceService().getInstance("test:test_Provider_Concrete", ComponentDef.class,
                attributes);
        String result = "<br/>ParentCMP<br/>m.valueParent=defaultattributeinParent";
        assertEquals(result, getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
        attributes.clear();
        // now what we really have is test_Model_Parent, not test_Provider_Concrete
        // trying to change what we provide like this won't work :
        attributes.put("whatToDo", "provideTestModelParentCmpWithNewAttr");
        mainCMP.getAttributes().set(attributes);
        mainCMP.reinitializeModel();
        String newresult = "<br/>ParentCMP<br/>m.valueParent=provideTestModelParentCmpWithNewAttr";
        assertEquals(newresult, getRenderedBaseComponent(mainCMP).replaceAll("\\s+", ""));
    }

    /*
     * A component with aura:if and a model, m.value is set by v.attr we output v.attr and m.value inside aura:if. this
     * test change v.attr to see if m.value get updated
     */
    public void testReinitializedModelIf() throws Exception {
        String source = "<aura:if isTrue=\"true\">value from attr:{!v.attr},value from model:{!m.value}</aura:if>";
        Map<String, Object> attributes = Maps.newHashMap();
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        "<aura:component model=\"java://test.model.TestReinitializeModel\"><aura:attribute name=\"attr\" type=\"String\" default=\"defaultValue\"/>%s</aura:component>",
                        source));
        Component ifcmp = Aura.getInstanceService().getInstance(def, attributes);
        assertEquals("value from attr:defaultValue,value from model:defaultValue", getRenderedBaseComponent(ifcmp));
        Map<String, Object> attributes2 = Maps.newHashMap();
        attributes2.put("attr", "new value from component");
        ifcmp.getAttributes().set(attributes2);
        ifcmp.reinitializeModel();
        assertEquals("value from attr:new value from component,value from model:new value from component",
                getRenderedBaseComponent(ifcmp));
    }

    /*
     * A Outer component with aura:if, inside aura:if there is a Inner component with module. Inner cmp's model.value is
     * set by inner cmp's v.attr, Inner cmp's v.attr is set by outer cmp's v.attr_out this test change attr_out, see if
     * inner cmp's module.value get update
     */
    public void testReinitializedModelIfInnerCMP() throws Exception {
        String sourceInnerCMP = "<aura:if isTrue=\"true\"><ifTest:testIfWithModel attr=\"{!v.attr_out}\"/></aura:if>";
        Map<String, Object> attributes = Maps.newHashMap();
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        "<aura:component><aura:attribute name=\"attr_out\" type=\"String\" default=\"defaultValue\"/>%s</aura:component>",
                        sourceInnerCMP));
        Component ifcmp = Aura.getInstanceService().getInstance(def, attributes);
        assertTrue(getRenderedBaseComponent(ifcmp).contains(
                "INNER CMP -- value of attr: defaultValue , value from module: defaultValue"));
        Map<String, Object> attributes2 = Maps.newHashMap();
        attributes2.put("attr_out", "newValue");
        ifcmp.getAttributes().set(attributes2);
        ifcmp.reinitializeModel();
        assertTrue(getRenderedBaseComponent(ifcmp).contains(
                "INNER CMP -- value of attr: newValue , value from module: newValue"));
    }

    /*
     * Top component come with a model:TestReinitializeModel, m.item can be changed by modifying attribute:listToShow
     * iteration on m.item this test to check if we change v.listToShow, iteration get updated or not enable this when
     * W-2088677 is resolved
     */
    public void _testReinitializeModelIteration() throws Exception {
        String source = "<aura:iteration items='{!m.itemList}' var='x' indexVar='i'>{!x}</aura:iteration>";
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("listToShow", Lists.newArrayList("q", "r", "s"));
        DefDescriptor<ComponentDef> def = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        "<aura:component model=\"java://test.model.TestReinitializeModel\"><aura:attribute name='listToShow' type='List'/>%s</aura:component>",
                        source));
        Component iteration = Aura.getInstanceService().getInstance(def, attributes);
        assertEquals("qrs", getRenderedBaseComponent(iteration));
        // listToShow is qrs
        iteration.reinitializeModel();
        Map<String, Object> attributes2 = Maps.newHashMap();
        attributes2.put("listToShow", Lists.newArrayList("a", "b", "c"));
        iteration.getAttributes().set(attributes2);
        iteration.reinitializeModel();
        // listToShow is abc now
        assertEquals("abc", getRenderedBaseComponent(iteration));
    }

}
