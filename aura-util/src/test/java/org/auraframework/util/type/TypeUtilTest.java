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
package org.auraframework.util.type;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.type.TypeUtil.ConversionException;

/**
 * Verify implementation of TypeUtil used to convert data from a given type to
 * desired type.
 * 
 * 
 * @since 0.0.248
 */
public class TypeUtilTest extends UnitTestCase {

    /**
     * Verify conversion of String to Custom data type using custom converters.
     */
    public void testRegisteringTypeConverter() {

        // 1. Convert from String to a custom type
        assertTrue("Failed to register custom converter",
                TypeUtil.hasConverter(String.class, CustomPairType.class, null));
        // W-1295664 Null pointer exception here
        assertFalse("Converter registration is not commutative.",
                TypeUtil.hasConverter(CustomPairType.class, String.class, null));
        assertFalse("Registered a fictatious converter.",
                TypeUtil.hasConverter(Integer.class, CustomPairType.class, null));
        CustomPairType result = TypeUtil.convert("HouseNo$300", CustomPairType.class);
        assertNotNull(result);
        assertEquals("Custom type converter failed to convert string value.", "HouseNo", result.getStrMember());
        assertEquals("Custom type converter failed to convert string value.", 300, result.getIntMember());

        // 2. Convert from String to an array of custom type converters
        assertTrue("Failed to register a custom array converter.",
                TypeUtil.hasConverter(String.class, CustomPairType[].class, null));
        assertFalse("Registered a fictatious converter.",
                TypeUtil.hasConverter(Integer.class, CustomPairType[].class, null));
        CustomPairType[] arrayOfValues = TypeUtil.convert("[lat$12890,long$5467]", CustomPairType[].class);
        assertNotNull(arrayOfValues);
        assertEquals("Custom array type converter failed to convert.", 2, arrayOfValues.length);
        assertEquals("Custom array type converter failed to convert.", new CustomPairType("lat", 12890),
                arrayOfValues[0]);
        assertEquals("Custom array type converter failed to convert.", new CustomPairType("long", 5467),
                arrayOfValues[1]);
    }

    /**
     * W-1295660 This is a big hole. Anybody can override the converters we have
     * written and screw up the system. Or may be this is acceptable. Currently
     * we use the last converter to be encountered while going through classes
     * in classpath.
     */
    public void testRegisteringDuplicateTypeConverters() {
        assertTrue("Failed to register custom converter",
                TypeUtil.hasConverter(String.class, CustomDupType.class, null));
        try {
            TypeUtil.convert("foobar", CustomDupType.class);
            fail("expected ConversionException due to duplicate registration");
        } catch (ConversionException e) {
            // expected
        }
    }

    /**
     * Verify that value of assignable types don't need a special converter.
     */
    public void testImplicitConversionThroughInheritance() {
        // 1. Upcasting value object
        CustomChildType obj = new CustomChildType();
        assertFalse("Should not have found a converter as there are none registered for this conversion",
                TypeUtil.hasConverter(CustomChildType.class, CustomParentType.class, null));
        CustomParentType newObj = TypeUtil.convert(obj, CustomParentType.class);
        assertNotNull(newObj);
        // Make sure conversion up the inheritance hierarchy did not go through
        // any special procedure
        assertTrue("Converting a value object of child type to parent failed.", newObj == obj);

        // 2. Downcasting value object
        assertFalse("Should not have found a converter as there are none registered for this conversion",
                TypeUtil.hasConverter(CustomParentType.class, CustomChildType.class, null));

        CustomParentType pObj = new CustomParentType();
        try {
            TypeUtil.convert(pObj, CustomChildType.class);
            fail("Should have thrown conversion exception due to missing converter");
        } catch (ConversionException e) {
            // expected
        }
    }

    /**
     * Verify that TypeUtil doesn't barf because of bad converters. Enable
     * converter registration in TestTypeConvertersConfig.java
     */
    public void testHandlingNulls() {
        assertFalse(TypeUtil.hasConverter(CustomPairType.class, String.class, null));
    }

    public void testParameterizedConverter() {
        assertTrue("Failed to locate parameterized converter.",
                TypeUtil.hasConverter(String.class, CustomPairType.class, "String,Integer"));
        assertFalse("Should not have found a converter for this parameter.",
                TypeUtil.hasConverter(String.class, CustomPairType.class, "String"));
        assertFalse("Should not have found a converter for this parameter.",
                TypeUtil.hasConverter(String.class, CustomPairType.class, ""));
        // Will use the non parameterized converter
        assertTrue("Using null for parameter should have resulted in usage of default converter.",
                TypeUtil.hasConverter(String.class, CustomPairType.class, null));
    }
}
