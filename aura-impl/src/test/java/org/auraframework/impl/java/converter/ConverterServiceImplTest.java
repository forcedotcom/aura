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
package org.auraframework.impl.java.converter;

import org.auraframework.impl.util.AuraLocaleImpl;
import org.auraframework.service.ConverterService;
import org.auraframework.util.test.util.UnitTestCase;
import org.auraframework.util.type.ConversionException;
import org.auraframework.util.type.CustomAbstractType;
import org.auraframework.util.type.CustomChildType;
import org.auraframework.util.type.CustomConcreteType1;
import org.auraframework.util.type.CustomConcreteType2;
import org.auraframework.util.type.CustomDupType;
import org.auraframework.util.type.CustomPairType;
import org.auraframework.util.type.CustomParentType;
import org.junit.Test;

import javax.inject.Inject;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;

/**
 * Verify implementation of JavaLocalizedconverterService used to convert data from a
 * given type to a desired type using a Locale.
 */
public class ConverterServiceImplTest extends UnitTestCase {

    @Inject
    ConverterService converterService;

    /**
     * Verify initialization of converters for Localized Strings and numbers.
     */
    @Test
    public void testNumberConvertersExist() {

        // verify number converters are available
        // there should be one assertion here for every LocalizedConverter in
        // aura.impl.java.type.converter
        assertTrue("Missing LocalizedConverter: String to BigDecimal",
                converterService.hasLocalizedConverter(String.class, BigDecimal.class));
        assertTrue("Missing LocalizedConverter: String to Double",
                converterService.hasLocalizedConverter(String.class, Double.class));
        assertTrue("Missing LocalizedConverter: String to Integer",
                converterService.hasLocalizedConverter(String.class, Integer.class));
        assertTrue("Missing LocalizedConverter: String to Long",
                converterService.hasLocalizedConverter(String.class, Long.class));
        assertTrue("Missing LocalizedConverter: BigDecimal to String",
                converterService.hasLocalizedConverter(BigDecimal.class, String.class));
        assertTrue("Missing LocalizedConverter: Integer to String",
                converterService.hasLocalizedConverter(Integer.class, String.class));

        // but only if they are really available
        assertFalse("Wrongly identified an available LocalizedConverter",
                converterService.hasLocalizedConverter(BigDecimal.class, java.util.Date.class));

    }

    /**
     * Verify conversion of Localized Strings and consistent numeric data.
     *
     * Reference for how different countries handle decimals:
     * http://en.wikipedia.org/wiki/Decimal_mark#Examples_of_use
     */
    @Test
    public void testNumberConvertersWork() {

        // verify the converter returns a valid value...
        BigDecimal correctDecimal = new BigDecimal("123456.789");
        Integer correctInteger = new Integer(123);

        // ...for unstyled ints in default Locale
        Integer anInteger = converterService.convert("123", Integer.class, new AuraLocaleImpl());
        assertNotNull("String to Integer with Locale was null", anInteger);
        assertEquals("String to Integer with Locale was wrong", correctInteger, anInteger);

        // ...for US format decimals
        BigDecimal usDecimal = converterService.convert("123,456.789", BigDecimal.class, new AuraLocaleImpl(Locale.US));
        assertNotNull("U.S. localized String to BigDecimal was null", usDecimal);
        assertEquals("U.S. localized String to BigDecimal problem", correctDecimal, usDecimal);

        // ...for de_DE format decimals
        BigDecimal deDecimal = converterService.convert("123.456,789", BigDecimal.class, new AuraLocaleImpl(Locale.GERMANY));
        assertNotNull("German localized String to BigDecimal was null", deDecimal);
        assertEquals("German localized String to BigDecimal problem", correctDecimal, deDecimal);

        // ...for fr format decimals
        BigDecimal frDecimal = converterService.convert("123456,789", BigDecimal.class, new AuraLocaleImpl(Locale.FRANCE));
        assertNotNull("France localized String to BigDecimal was null", frDecimal);
        assertEquals("France localized String to BigDecimal problem", correctDecimal, frDecimal);
    }

    @Test
    public void testConvertingInvalidDoubleDoesNotThrow() {
        assertNull("Expected null return for invalid value",
                converterService.convert("notanumber", Double.class, new AuraLocaleImpl()));
    }

    @Test
    public void testConvertingInvalidBigDecimalDoesNotThrow() {
        assertNull("Expected null return for invalid value",
                converterService.convert("notanumber", BigDecimal.class, new AuraLocaleImpl()));
    }

    @Test
    public void testConvertingInvalidIntegerDoesNotThrow() {
        assertNull("Expected null return for invalid value",
                converterService.convert("notanumber", Integer.class, new AuraLocaleImpl()));
    }

    @Test
    public void testConvertingInvalidLongDoesNotThrow() {
        assertNull("Expected null return for invalid value",
            converterService.convert("notanumber", Long.class, new AuraLocaleImpl()));
    }

    @Test
    public void testStringToIntWithDecimal() {
        Integer expected = 123;

        Integer actual = converterService.convert("123.456", Integer.class, new AuraLocaleImpl());
        assertEquals(expected, actual);
    }


    /**
     * Verify conversion of String to Custom data type using custom converters.
     */
    @Test
    public void testRegisteringTypeConverter() {

        // 1. Convert from String to a custom type
        assertTrue("Failed to register custom converter",
                converterService.hasConverter(String.class, CustomPairType.class, null));
        // W-1295664 Null pointer exception here
        assertFalse("Converter registration is not commutative.",
                converterService.hasConverter(CustomPairType.class, String.class, null));
        assertFalse("Registered a fictatious converter.",
                converterService.hasConverter(Integer.class, CustomPairType.class, null));
        CustomPairType result = converterService.convert("HouseNo$300", CustomPairType.class);
        assertNotNull(result);
        assertEquals("Custom type converter failed to convert string value.", "HouseNo", result.getStrMember());
        assertEquals("Custom type converter failed to convert string value.", 300, result.getIntMember());

        // 2. Convert from String to an array of custom type converters
        assertTrue("Failed to register a custom array converter.",
                converterService.hasConverter(String.class, CustomPairType[].class, null));
        assertFalse("Registered a fictatious converter.",
                converterService.hasConverter(Integer.class, CustomPairType[].class, null));
        CustomPairType[] arrayOfValues = converterService.convert("[lat$12890,long$5467]", CustomPairType[].class);
        assertNotNull(arrayOfValues);
        assertEquals("Custom array type converter failed to convert.", 2, arrayOfValues.length);
        assertEquals("Custom array type converter failed to convert.", new CustomPairType("lat", 12890),
                arrayOfValues[0]);
        assertEquals("Custom array type converter failed to convert.", new CustomPairType("long", 5467),
                arrayOfValues[1]);
    }

    /**
     * Verify conversion of custom converters that handle multiple output types.
     */
    @Test
    public void testRegisteringMulticonverters() {

        // 1. Try to convert from String to subclasses of CustomAbstractType.
        assertTrue("Failed to register custom multi converter",
                converterService.hasConverter(String.class, CustomConcreteType1.class, null));
        assertTrue("Failed to register custom multi converter",
                converterService.hasConverter(String.class, CustomConcreteType2.class, null));

        CustomAbstractType result = converterService.convert("blah:52", CustomConcreteType1.class);
        assertNotNull(result);
        assertEquals("Custom multi converter failed to convert string value.", "blah", result.getStrValue());
        assertEquals("Custom multi converter failed to convert string value.", 52, result.getIntValue());

        result = converterService.convert("zebra zebra:73", CustomConcreteType2.class);
        assertNotNull(result);
        assertEquals("Custom multi converter failed to convert string value.", "zebra zebra", result.getStrValue());
        assertEquals("Custom multi converter failed to convert string value.", -146, result.getIntValue());
    }

    /**
     * W-1295660 This is a big hole. Anybody can override the converters we have
     * written and screw up the system. Or may be this is acceptable. Currently
     * we use the last converter to be encountered while going through classes
     * in classpath.
     */
    @Test
    public void testRegisteringDuplicateTypeConverters() {
        assertTrue("Failed to register custom converter",
                converterService.hasConverter(String.class, CustomDupType.class, null));
        try {
            converterService.convert("foobar", CustomDupType.class);
            fail("expected ConversionException due to duplicate registration");
        } catch (ConversionException e) {
            // expected
        }
    }

    /**
     * Verify that value of assignable types don't need a special converter.
     */
    @Test
    public void testImplicitConversionThroughInheritance() {
        // 1. Upcasting value object
        CustomChildType obj = new CustomChildType();
        assertFalse("Should not have found a converter as there are none registered for this conversion",
                converterService.hasConverter(CustomChildType.class, CustomParentType.class, null));
        CustomParentType newObj = converterService.convert(obj, CustomParentType.class);
        assertNotNull(newObj);
        // Make sure conversion up the inheritance hierarchy did not go through
        // any special procedure
        assertTrue("Converting a value object of child type to parent failed.", newObj == obj);

        // 2. Downcasting value object
        assertFalse("Should not have found a converter as there are none registered for this conversion",
                converterService.hasConverter(CustomParentType.class, CustomChildType.class, null));

        CustomParentType pObj = new CustomParentType();
        try {
            converterService.convert(pObj, CustomChildType.class);
            fail("Should have thrown conversion exception due to missing converter");
        } catch (ConversionException e) {
            // expected
        }
    }

    /**
     * Verify that converterService doesn't barf because of bad converters. Enable
     * converter registration in TestTypeConvertersConfig.java
     */
    @Test
    public void testHandlingNulls() {
        assertFalse(converterService.hasConverter(CustomPairType.class, String.class, null));
    }

    @Test
    public void testParameterizedConverter() {
        assertTrue("Failed to locate parameterized converter.",
                converterService.hasConverter(String.class, CustomPairType.class, "String,Integer"));
        assertFalse("Should not have found a converter for this parameter.",
                converterService.hasConverter(String.class, CustomPairType.class, "String"));
        assertFalse("Should not have found a converter for this parameter.",
                converterService.hasConverter(String.class, CustomPairType.class, ""));
        // Will use the non parameterized converter
        assertTrue("Using null for parameter should have resulted in usage of default converter.",
                converterService.hasConverter(String.class, CustomPairType.class, null));
    }


    /**
     * Run a set of conversions checking for equality when they are arrays.
     * 
     * @param end the destination class.
     * @param set the pairs of source, dest
     */
    public <T> void runPassPairs(Class<T> end, Class<T[]> array, Object[] set) {
        for (int i = 0; i < set.length; i += 2) {
            Object in = set[i];
            T[] out = array.cast(set[i + 1]);
            Class<?> start = in.getClass();
            T[] result;

            result = converterService.convert(in, array, null, false);
            assertNotNull(result);
            assertEquals("Conversion[" + i + "]: Bad Class :: " + start.getSimpleName() + "->" + array.getSimpleName(),
                    array, result.getClass());
            List<T> outL = Arrays.asList(out);
            List<T> resultL = Arrays.asList(result);
            assertEquals("Conversion[" + i + "]: Value :: " + start.getSimpleName() + "->" + end.getSimpleName()
                    + " input=" + in, outL, resultL);
        }
    }

    /**
     * Run a set of conversions checking for equality.
     * 
     * @param end the destination class.
     * @param set the pairs of source, dest
     * @param exactClass true if the end class must be an exact match,
     *            otherwise, it just needs to assign.
     */
    public <T> void runPassPairs(Class<T> end, Object[] set, boolean exactClass) {
        for (int i = 0; i < set.length; i += 2) {
            Object in = set[i];
            T out = end.cast(set[i + 1]);
            Class<?> start = in.getClass();
            T result;

            result = converterService.convert(in, end, null, false);
            assertNotNull("Conversion[" + i + "]: Null result for " + in, result);
            if (exactClass) {
                assertEquals(
                        "Conversion[" + i + "]: Bad Class :: " + start.getSimpleName() + "->" + end.getSimpleName(),
                        end, result.getClass());
            } else {
                assertTrue("Conversion[" + i + "]: Bad Class :: " + start.getSimpleName() + "->" + end.getSimpleName(),
                        end.isAssignableFrom(result.getClass()));
            }
            assertEquals("Conversion[" + i + "]: Value :: " + start.getSimpleName() + "->" + end.getSimpleName()
                    + " input=" + in, out, result);
        }
    }

    /**
     * Test boolean conversions.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToBooleanConverter.java
     */
    @Test
    public void testBoolean() throws Exception {
        runPassPairs(Boolean.class, new Object[] { "true", Boolean.TRUE, "false", Boolean.FALSE, "True", Boolean.TRUE,
                "False", Boolean.FALSE, "truE", Boolean.TRUE, "falsE", Boolean.FALSE, "yes", Boolean.FALSE, "on",
                Boolean.FALSE, "1", Boolean.FALSE, }, true);
    }

    /**
     * Long to Date.
     * 
     * aura-util/java/src/aura/util/type/converter/LongToDateConverter.java
     */
    @Test
    public void testLongToDate() throws Exception {
        runPassPairs(Date.class, new Object[] { Long.valueOf(0L), new Date(0), Long.valueOf(-1234L), new Date(-1234L),
                Long.valueOf(12345678901234L), new Date(12345678901234L), }, true);
    }

    /**
     * String to array list.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToArrayListConverter.
     * java
     */
    @Test
    public void testStringToArrayList() throws Exception {
        runPassPairs(
                ArrayList.class,
                new Object[] { "a,,b, c,d , e ",
                        new ArrayList<>(Arrays.asList(new String[] { "a", "", "b", " c", "d ", " e " })), "",
                        new ArrayList<>(Arrays.asList(new String[] {})), }, true);
    }

    /**
     * String to list.
     * 
     * FIXME W-1336388: does this converter make any sense? List vs. ArrayList
     * gives very different results.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToListConverter.java
     */
    @Test
    public void testStringToList() throws Exception {
        runPassPairs(List.class,
                new Object[] { "a,,b, c,d , e ",
                        new ArrayList<>(Arrays.asList(new String[] { "a,,b, c,d , e " })), "",
                        new ArrayList<>(Arrays.asList(new String[] { "" })), }, false);
    }

    /**
     * ArrayList of String to array of dates.
     * 
     * FIXME W-1336388: This converter is totally bogus, it doesn't act like
     * other string to date converters, meaning that we have a totally
     * inconsistent interface.
     * 
     * aura-util/java/src/aura/util/type/converter/ArrayListToDateArrayConverter
     * .java
     */
    @Test
    public void testStringToDateArray() throws Exception {
        runPassPairs(Date.class, Date[].class,
                new Object[] { new ArrayList<>(Arrays.asList(new String[] { "1234", "2345", "-3456" })),
                        new Date[] { new Date(1234L), new Date(2345L), new Date(-3456) } });
    }

    /**
     * String to date only.
     * 
     * FIXME W-1336388: This converter is totally bogus, it doesn't act like
     * other string to date converters, meaning that we have a totally
     * inconsistent interface.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToDateOnlyConverter.
     * java
     */
    // public void testStringToDateOnly() throws Exception {
    // runPassPairs(DateOnly.class,
    // new Object [] {
    // "2000-01-01", new DateOnly(946684800000L),
    // "1950-01-01", new DateOnly(-30609792000000L),
    // "3000-01-01", new DateOnly(32503680000000L),
    // }, true);
    // }

    /**
     * Boolean to string.
     * 
     * aura-util/java/src/aura/util/type/converter/BooleanToStringConverter.java
     */
    @Test
    public void testBooleanToString() throws Exception {
        runPassPairs(String.class, new Object[] { Boolean.TRUE, "true", Boolean.FALSE, "false", }, true);
    }

    /**
     * Big Decimal to string.
     * 
     * aura-util/java/src/aura/util/type/converter/BigDecimalToStringConverter.
     * java
     */
    @Test
    public void testBigDecimalToString() throws Exception {
        runPassPairs(String.class, new Object[] { new BigDecimal(0), "0", new BigDecimal(12345678901234L),
                "12345678901234", new BigDecimal(-12345678901234L), "-12345678901234",
                new BigDecimal("12345678.901234"), "12345678.901234", new BigDecimal("-12345678.901234"),
                "-12345678.901234", }, true);
    }

    /**
     * String to big decimal.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToBigDecimalConverter.
     * java
     */
    @Test
    public void testStringToBigDecimal() throws Exception {
        runPassPairs(BigDecimal.class, new Object[] { "0", new BigDecimal(0), "12345678901234",
                new BigDecimal(12345678901234L), "-12345678901234", new BigDecimal(-12345678901234L),
                "12345678.901234", new BigDecimal("12345678.901234"), "-12345678.901234",
                new BigDecimal("-12345678.901234"), }, true);
    }

    /**
     * Long to Integer
     * 
     * aura-util/java/src/aura/util/type/converter/LongToIntegerConverter.java
     */
    @Test
    public void testLongToInteger() throws Exception {
        runPassPairs(Integer.class, new Object[] { new Long(1234), new Integer(1234), new Long(-1234),
                new Integer(-1234), new Long(Integer.MAX_VALUE), new Integer(Integer.MAX_VALUE),
                new Long(Integer.MIN_VALUE), new Integer(Integer.MIN_VALUE), new Long(Integer.MAX_VALUE + 1L),
                new Integer(Integer.MIN_VALUE), }, true);
    }

    /**
     * ArrayList to Integer array.
     * 
     * aura-util/java/src/aura/util/type/converter/
     * ArrayListToIntegerArrayConverter.java
     */
    @Test
    public void testArrayListToIntegerArray() throws Exception {
        runPassPairs(Integer.class, Integer[].class,
                new Object[] { new ArrayList<>(Arrays.asList(new String[] { "0", "-1234", "1234567890" })),
                        new Integer[] { new Integer(0), new Integer(-1234), new Integer(1234567890), }, });
    }

    /**
     * String to integer converter.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToIntegerConverter.java
     */
    @Test
    public void testStringToInteger() throws Exception {
        runPassPairs(Integer.class, new Object[] { "0", new Integer(0), "-1234", new Integer(-1234), "1234567890",
                new Integer(1234567890), }, true);
    }

    /**
     * String to String array.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToStringArrayConverter.
     * java
     */
    @Test
    public void testStringToStringArray() throws Exception {
        runPassPairs(String.class, String[].class, new Object[] { "a,,b, c,d , e ",
                new String[] { "a", "", "b", " c", "d ", " e " }, "", new String[] {}, });
    }

    /**
     * String to Calendar.
     * 
     * FIXME W-1336388: This, again, is inconsistent.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToCalendarConverter.
     * java
     */
    @Test
    public void testStringToCalendar() throws Exception {
        Calendar c1, c2, c3;

        c1 = Calendar.getInstance();
        c1.setTimeInMillis(1234L);
        c2 = Calendar.getInstance();
        c2.setTimeInMillis(-1234L);
        c3 = Calendar.getInstance();
        c3.setTimeInMillis(12345678901234L);

        runPassPairs(Calendar.class, new Object[] { "1234", c1, "-1234", c2, "12345678901234", c3, }, false);
    }

    /**
     * ArrayList to String array.
     * 
     * FIXME W-1336388: This is bizarre, as this one trims.
     * 
     * aura-util/java/src/aura/util/type/converter/
     * ArrayListToStringArrayConverter.java
     */
    @Test
    public void testArrayListToStringArray() throws Exception {
        runPassPairs(String.class, String[].class,
                new Object[] { new ArrayList<>(Arrays.asList(new String[] { " a ", "b", " ", "c" })),
                        new String[] { "a", "b", "", "c" }, });
    }

    /**
     * ArrayList to Boolean array.
     * 
     * aura-util/java/src/aura/util/type/converter/
     * ArrayListToBooleanArrayConverter.java
     */
    @Test
    public void testArrayListToBooleanArray() throws Exception {
        runPassPairs(Boolean.class, Boolean[].class,
                new Object[] { new ArrayList<>(Arrays.asList(new Boolean[] { Boolean.TRUE, Boolean.FALSE })),
                        new Boolean[] { Boolean.TRUE, Boolean.FALSE }, });
        try {
            converterService.convert(new ArrayList<>(Arrays.asList(new Integer[]{Integer.valueOf(1)})),
                    Boolean[].class, null, false);
            fail("Should fail to convert a list of integers");
        } catch (Exception expected) {
            // We don't really care what exception is thrown, just that we get
            // one.
        }
    }

    /**
     * String to hash set.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToHashSetConverter.java
     */
    @Test
    public void testStringToHashSet() throws Exception {
        runPassPairs(HashSet.class,
                new Object[] { "a,b, c, d ",
                        new HashSet<>(Arrays.asList(new String[] { "a", "b", " c", " d " })), }, true);
    }

    /**
     * String to double.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToDoubleConverter.java
     */
    @Test
    public void testStringToDouble() throws Exception {
        runPassPairs(Double.class, new Object[] { "1234.1234", new Double(1234.1234), }, true);
    }

    /**
     * String to long.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToLongConverter.java
     */
    @Test
    public void testStringToLong() throws Exception {
        runPassPairs(Long.class, new Object[] { "1", new Long(1), "-1234", new Long(-1234), }, true);
    }

    /**
     * Integer to string.
     * 
     * aura-util/java/src/aura/util/type/converter/IntegerToStringConverter.java
     */
    @Test
    public void testIntegerToString() throws Exception {
        runPassPairs(String.class, new Object[] { new Integer(0), "0", new Integer(1234567890), "1234567890",
                new Integer(-1234567890), "-1234567890", }, true);
    }

    /**
     * Big Decimal to Integer.
     * 
     * aura-util/java/src/aura/util/type/converter/BigDecimalToIntegerConverter.
     * java
     */
    @Test
    public void testBigDecimalToInteger() throws Exception {
        runPassPairs(Integer.class, new Object[] { new BigDecimal(1234567890), new Integer(1234567890),
                new BigDecimal(-1234567890), new Integer(-1234567890), }, true);
    }

    /**
     * String to Date.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToDateConverter.java
     */
    @Test
    public void testStringToDate() throws Exception {
        runPassPairs(Date.class, new Object[] {}, true);
    }

    /**
     * String to HashMap.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToHashMapConverter.java
     */
    @Test
    public void testStringToHashMap() throws Exception {
        HashMap<String, String> out = new HashMap<>();

        out.put("a", "b");
        out.put("c", "d");
        runPassPairs(HashMap.class, new Object[] { "{ 'a': 'b' , 'c':'d'}", out }, false);
    }

    /**
     * Long to String.
     * 
     * aura-util/java/src/aura/util/type/converter/LongToStringConverter.java
     */
    @Test
    public void testLongToString() throws Exception {
        runPassPairs(String.class, new Object[] { new Long(0), "0", new Long(12345678901234L), "12345678901234",
                new Long(-12345678901234L), "-12345678901234", }, true);
    }

    /**
     * Big decimal to long.
     * 
     * aura-util/java/src/aura/util/type/converter/BigDecimalToLongConverter.
     * java
     */
    @Test
    public void testBigDecimalToLong() throws Exception {
        runPassPairs(Long.class, new Object[] { new BigDecimal(12345678901234L), new Long(12345678901234L),
                new BigDecimal(-12345678901234L), new Long(-12345678901234L), }, true);
    }
}
