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
package org.auraframework.impl.java.type;

import java.math.BigDecimal;
import java.util.*;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.instance.Component;
import org.auraframework.instance.Model;
import org.auraframework.throwable.AuraRuntimeException;
/**
 * This class has automation to verify the implementation of @Type() annotation in models.
 *
 *
 *
 */
public class TypeAnnotationInModelTest extends AuraImplTestCase {
    public TypeAnnotationInModelTest(String name){
        super(name);
    }

    public void testValidTypeAnnotationInJavaModel() throws Exception{
        Model model = getJavaModelByQualifiedName("java://org.auraframework.impl.java.model.TestModelWithJavaTypeAnnotation");
        // Verify model values for basic data types
        assertBasicDataTypes(model);
        //Any java type which implements the Serializable interface can be specified as return type.
        assertEachModelMember(model, "javaString", "Java");
        ////TODO:W-967767, Should be able to specify Array as return type
        //assertEachModelMember(model, "stringArray", new String[]{"one", "two"});

        //TODO W-990851, Verify model values for collections and map data types
        //assertCollectionAndMapDataTypes(model);
    }

    public void testValidAuraTypeAnnotationInJavaModel() throws Exception{
        Model model = getJavaModelByQualifiedName("java://org.auraframework.impl.java.model.TestModelWithAuraTypeAnnotation");
        // Verify model values for basic data types
        assertBasicDataTypes(model);

        //TODO:W-967767, Should be able to specify array as return type
        //assertEachModelMember(model, "stringArray", new String[]{"one", "two"});

        //Verify model values for collections and map data types
        assertCollectionAndMapDataTypes(model);
    }

    public void testInvalidLiteralTypeAnnotationInJavaModel() throws Exception{
        Model model = getJavaModelByQualifiedName("java://org.auraframework.impl.java.model.TestModelWithLiteralTypeAnnotation");
        try{
            model.getValue(new PropertyReferenceImpl("string", null));
            fail("Failed to catch invalid type specified for member method in model.");
        }catch(AuraRuntimeException expected){}

    }

    public void testAuraComponentTypeAnnotationInJavaModel() throws Exception{
        Model model = getJavaModelByQualifiedName("java://org.auraframework.impl.java.model.TestModelWithAuraTypeAnnotation");
        Object value = model.getValue(new PropertyReferenceImpl("auraComponent", null));
        assertTrue(value instanceof Component);
        assertEquals("markup://test:text",((Component)value).getDescriptor().getQualifiedName());

        /** TODO:W-967767
        */

    }
    /**
     * TODO: Find out if we should support case insensitivity.
     * @throws Exception
     */
    public void _testCaseSensitivityOfTypeAnnotationInJavaModel() throws Exception{
        Model model = getJavaModelByQualifiedName("java://org.auraframework.impl.java.model.TestModelWithCaseInsensitiveTypeAnnotation");
        assertEachModelMember(model, "string", "Model");
        assertEachModelMember(model, "double", 1.23);
    }

    private void assertBasicDataTypes(Model model) throws Exception{

        assertEachModelMember(model, "string", "Model");
        assertEachModelMember(model, "integer", 123);
        assertEachModelMember(model, "long", 123l);
        assertEachModelMember(model, "double", 1.23);
        assertEachModelMember(model, "decimal", new BigDecimal(3.1415));
        assertEachModelMember(model, "boolean", true);
        assertEachModelMember(model, "date", new Date(1095957000000l));
        assertEachModelMember(model, "object", "Aura");
        assertEachModelMember(model, "stringMap", new HashMap<String,String>());
        assertEachModelMember(model, "stringList", new ArrayList<String>());
        assertEachModelMember(model, "stringSet", new TreeSet<String>());

    }
    private void assertCollectionAndMapDataTypes(Model model) throws Exception{
        //List of Maps.
        Map<String, String> m1 = new HashMap<String,String>();
        List<Map<String,String>> l1 = new ArrayList<Map<String,String>>();
        l1.add(m1);
        assertEachModelMember(model, "listOfMaps", l1);
        //Set of maps.
        Map<String, String> m2 = new HashMap<String,String>();
        Set<Map<String,String>> s2 = new TreeSet<Map<String,String>>();
        s2.add(m2);
        assertEachModelMember(model, "setOfMaps", s2);
        //List of List
        List<String> l3 = new ArrayList<String>();
        List<List<String>> ll3 = new ArrayList<List<String>>();
        ll3.add(l3);
        assertEachModelMember(model, "listOfList", ll3);
        //Set of List
        List<String> l4 = new ArrayList<String>();
        Set<List<String>> s4 = new TreeSet<List<String>>();
        s4.add(l4);
        assertEachModelMember(model, "setOfList", s4);
        //List of Set
        Set<String> s5 = new TreeSet<String>();
        List<Set<String>> l5 = new ArrayList<Set<String>>();
        l5.add(s5);
        assertEachModelMember(model, "listOfSet", l5);
        //Set of Set
        Set<String> s6 = new TreeSet<String>();
        Set<Set<String>> ss6 = new TreeSet<Set<String>>();
        ss6.add(s6);
        assertEachModelMember(model, "setOfSet", ss6);
    }
    private void assertEachModelMember(Model model, String memberName, Object expectedResult ) throws Exception{
        Object value = model.getValue(new PropertyReferenceImpl(memberName, null));
        assertEquals("Expected model method to return "+expectedResult.getClass()+" type object.",
                expectedResult.getClass(), value.getClass());
        if(value.getClass()!= TreeSet.class)
            assertEquals("Model returned unexpected object.",expectedResult, value);
    }
}
