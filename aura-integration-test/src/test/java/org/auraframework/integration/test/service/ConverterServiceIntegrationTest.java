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
package org.auraframework.integration.test.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;

import javax.inject.Inject;
import javax.inject.Provider;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.impl.java.converter.ConverterServiceImpl;
import org.auraframework.impl.util.AuraLocaleImpl;
import org.auraframework.integration.test.util.IntegrationTestCase;
import org.auraframework.service.ConverterService;
import org.auraframework.service.LoggingService;
import org.auraframework.util.date.AuraDateUtil;
import org.auraframework.util.type.Converter;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.context.annotation.Lazy;

import com.google.common.collect.Maps;

/**
 * Verify implementation of JavaLocalizedconverterService used to convert data from a
 * given type to a desired type using a Locale.
 */
public class ConverterServiceIntegrationTest extends IntegrationTestCase {

    @Inject
    @Lazy
    private ConverterService converterService;

    @Inject
    @Lazy
    private List<Converter<?,?>> converters;

    @Test
    public void testForBadConverters() throws Exception {
        ConverterServiceImpl testService = new ConverterServiceImpl(true);
        testService.setConverters(converters);
        final LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        @SuppressWarnings("unchecked")
        final Provider<LocalizationAdapter> localizationAdapterProvider = Mockito.mock(Provider.class);
        Mockito.when(localizationAdapterProvider.get()).thenReturn(localizationAdapter);
        testService.setLocalizationAdapter(localizationAdapterProvider);
        testService.setLoggingService(Mockito.mock(LoggingService.class));
        testService.setApplicationContext(applicationContext);
        // The real test is that this should not fail.
        Integer i = testService.convert("1", Integer.class);
        assertNotNull(i);
        assertEquals(1, i.intValue());
    }

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
        Integer expected = Integer.valueOf(123);

        Integer actual = converterService.convert("123.456", Integer.class, new AuraLocaleImpl());
        assertEquals(expected, actual);
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
    public void testBoolean() {
        runPassPairs(Boolean.class, new Object[] { "true", Boolean.TRUE, "false", Boolean.FALSE, "True", Boolean.TRUE,
                "False", Boolean.FALSE, "truE", Boolean.TRUE, "falsE", Boolean.FALSE, "yes", Boolean.FALSE, "on",
                Boolean.FALSE, "1", Boolean.FALSE, }, true);
    }

    /**
     * {@link Long} to {@link Date}.
     * 
     * aura-util/java/src/aura/util/type/converter/LongToDateConverter.java
     */
    @Test
    public void testLongToDate() {
        runPassPairs(Date.class, new Object[] { Long.valueOf(0L), new Date(0), Long.valueOf(-1234L), new Date(-1234L),
                Long.valueOf(12345678901234L), new Date(12345678901234L), }, true);
    }

    /**
     * {@link String} to {@link ArrayList}.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToArrayListConverter.
     * java
     */
    @Test
    public void testStringToArrayList() {
        runPassPairs(
                ArrayList.class,
                new Object[] { "a,,b, c,d , e ",
                        new ArrayList<>(Arrays.asList(new String[] { "a", "", "b", " c", "d ", " e " })), "",
                        new ArrayList<>(Arrays.asList(new String[] {})), }, true);
    }

    /**
     * {@link String} to {@link List}.
     * 
     * FIXME W-1336388: does this converter make any sense? List vs. ArrayList
     * gives very different results.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToListConverter.java
     */
    @Test
    public void testStringToList() {
        runPassPairs(List.class,
                new Object[] { "a,,b, c,d , e ",
                        new ArrayList<>(Arrays.asList(new String[] { "a,,b, c,d , e " })), "",
                        new ArrayList<>(Arrays.asList(new String[] { "" })), }, false);
    }

    /**
     * {@link ArrayList} of {@link String} to array of {@link Date}s.
     * 
     * FIXME W-1336388: This converter is totally bogus, it doesn't act like
     * other string to date converters, meaning that we have a totally
     * inconsistent interface.
     * 
     * aura-util/java/src/aura/util/type/converter/ArrayListToDateArrayConverter
     * .java
     */
    @Test
    public void testStringToDateArray() {
        runPassPairs(Date.class, Date[].class,
                new Object[] { new ArrayList<>(Arrays.asList(new String[] { "1234", "2345", "-3456" })),
                        new Date[] { new Date(1234L), new Date(2345L), new Date(-3456) } });
    }

    /**
     * {@link String} to {@link Date} only.
     * 
     * FIXME W-1336388: This converter is totally bogus, it doesn't act like
     * other string to date converters, meaning that we have a totally
     * inconsistent interface.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToDateOnlyConverter.
     * java
     */
    // public void testStringToDateOnly() {
    // runPassPairs(DateOnly.class,
    // new Object [] {
    // "2000-01-01", new DateOnly(946684800000L),
    // "1950-01-01", new DateOnly(-30609792000000L),
    // "3000-01-01", new DateOnly(32503680000000L),
    // }, true);
    // }

    /**
     * {@link Boolean} to {@link String}.
     * 
     * aura-util/java/src/aura/util/type/converter/BooleanToStringConverter.java
     */
    @Test
    public void testBooleanToString() {
        runPassPairs(String.class, new Object[] { Boolean.TRUE, "true", Boolean.FALSE, "false", }, true);
    }

    /**
     * {@link BigDecimal} to {@link String}.
     * 
     * aura-util/java/src/aura/util/type/converter/BigDecimalToStringConverter.
     * java
     */
    @Test
    public void testBigDecimalToString() {
        runPassPairs(String.class, new Object[] { new BigDecimal(0), "0", new BigDecimal(12345678901234L),
                "12345678901234", new BigDecimal(-12345678901234L), "-12345678901234",
                new BigDecimal("12345678.901234"), "12345678.901234", new BigDecimal("-12345678.901234"),
                "-12345678.901234", }, true);
    }

    /**
     * {@link String} to {@link BigDecimal}.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToBigDecimalConverter.
     * java
     */
    @Test
    public void testStringToBigDecimal() {
        runPassPairs(BigDecimal.class, new Object[] { "0", new BigDecimal(0), "12345678901234",
                new BigDecimal(12345678901234L), "-12345678901234", new BigDecimal(-12345678901234L),
                "12345678.901234", new BigDecimal("12345678.901234"), "-12345678.901234",
                new BigDecimal("-12345678.901234"), }, true);
    }

    /**
     * {@link Long} to {@link Integer}
     * 
     * aura-util/java/src/aura/util/type/converter/LongToIntegerConverter.java
     */
    @Test
    public void testLongToInteger() {
        runPassPairs(Integer.class, new Object[] { new Long(1234), new Integer(1234), new Long(-1234),
                new Integer(-1234), new Long(Integer.MAX_VALUE), new Integer(Integer.MAX_VALUE),
                new Long(Integer.MIN_VALUE), new Integer(Integer.MIN_VALUE), new Long(Integer.MAX_VALUE + 1L),
                new Integer(Integer.MIN_VALUE), }, true);
    }

    /**
     * {@link ArrayList} to {@link Integer} array.
     * 
     * aura-util/java/src/aura/util/type/converter/
     * ArrayListToIntegerArrayConverter.java
     */
    @Test
    public void testArrayListToIntegerArray() {
        runPassPairs(Integer.class, Integer[].class,
                new Object[] { new ArrayList<>(Arrays.asList(new String[] { "0", "-1234", "1234567890" })),
                        new Integer[] { new Integer(0), new Integer(-1234), new Integer(1234567890), }, });
    }

    /**
     * {@link String} to {@link Integer} converter.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToIntegerConverter.java
     */
    @Test
    public void testStringToInteger() {
        runPassPairs(Integer.class, new Object[] { "0", new Integer(0), "-1234", new Integer(-1234), "1234567890",
                new Integer(1234567890), }, true);
    }

    /**
     * {@link String} to {@code String} array.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToStringArrayConverter.
     * java
     */
    @Test
    public void testStringToStringArray() {
        runPassPairs(String.class, String[].class, new Object[] { "a,,b, c,d , e ",
                new String[] { "a", "", "b", " c", "d ", " e " }, "", new String[] {}, });
    }

    /**
     * {@link String} to {@link Calendar}.
     * 
     * FIXME W-1336388: This, again, is inconsistent.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToCalendarConverter.
     * java
     */
    @Test
    public void testStringToCalendar() {
        Calendar c1, c2, c3, c4;

        c1 = Calendar.getInstance();
        c1.setTimeInMillis(1234L);
        c2 = Calendar.getInstance();
        c2.setTimeInMillis(-1234L);
        c3 = Calendar.getInstance();
        c3.setTimeInMillis(12345678901234L);

        c4 = Calendar.getInstance();
        String s4 = "2018-08-23T23:33:53.404Z";
        c4.setTime(AuraDateUtil.isoToDate(s4));
        runPassPairs(Calendar.class, new Object[] { "1234", c1, "-1234", c2, "12345678901234", c3, s4, c4}, false);
    }

    /**
     * {@link ArrayList} to {@link String} array.
     * 
     * FIXME W-1336388: This is bizarre, as this one trims.
     * 
     * aura-util/java/src/aura/util/type/converter/
     * ArrayListToStringArrayConverter.java
     */
    @Test
    public void testArrayListToStringArray() {
        runPassPairs(String.class, String[].class,
                new Object[] { new ArrayList<>(Arrays.asList(new String[] { " a ", "b", " ", "c" })),
                        new String[] { "a", "b", "", "c" }, });
    }

    /**
     * {@link ArrayList} to {@link Boolean} array.
     * 
     * aura-util/java/src/aura/util/type/converter/
     * ArrayListToBooleanArrayConverter.java
     */
    @Test
    public void testArrayListToBooleanArray() {
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
     * {@link String} to {@link HashSet}.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToHashSetConverter.java
     */
    @Test
    public void testStringToHashSet() {
        runPassPairs(HashSet.class,
                new Object[] { "a,b, c, d ",
                        new HashSet<>(Arrays.asList(new String[] { "a", "b", " c", " d " })), }, true);
    }

    /**
     * {@link String} to {@link Double}.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToDoubleConverter.java
     */
    @Test
    public void testStringToDouble() {
        runPassPairs(Double.class, new Object[] { "1234.1234", new Double(1234.1234), }, true);
    }

    /**
     * {@link String} to {@link Long}.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToLongConverter.java
     */
    @Test
    public void testStringToLong() {
        runPassPairs(Long.class, new Object[] { "1", new Long(1), "-1234", new Long(-1234), }, true);
    }

    /**
     * {@link Integer} to {@link String}.
     * 
     * aura-util/java/src/aura/util/type/converter/IntegerToStringConverter.java
     */
    @Test
    public void testIntegerToString() {
        runPassPairs(String.class, new Object[] { new Integer(0), "0", new Integer(1234567890), "1234567890",
                new Integer(-1234567890), "-1234567890", }, true);
    }

    /**
     * {@link BigDecimal} to {@link Integer}.
     * 
     * aura-util/java/src/aura/util/type/converter/BigDecimalToIntegerConverter.
     * java
     */
    @Test
    public void testBigDecimalToInteger() {
        runPassPairs(Integer.class, new Object[] { new BigDecimal(1234567890), new Integer(1234567890),
                new BigDecimal(-1234567890), new Integer(-1234567890), }, true);
    }

    /**
     * {@link String} to {@link Date}.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToDateConverter.java
     */
    @Test
    public void testStringToDate() {
        runPassPairs(Date.class, new Object[] {}, true);
    }

    /**
     * {@link String} to {@link HashMap}.
     * 
     * aura-util/java/src/aura/util/type/converter/StringToHashMapConverter.java
     */
    @Test
    public void testStringToHashMap() {
        HashMap<String, String> out = Maps.newLinkedHashMapWithExpectedSize(2);

        out.put("a", "b");
        out.put("c", "d");
        runPassPairs(HashMap.class, new Object[] { "{ 'a': 'b' , 'c':'d'}", out }, false);
    }

    /**
     * {@link Long} to {@link String}.
     * 
     * aura-util/java/src/aura/util/type/converter/LongToStringConverter.java
     */
    @Test
    public void testLongToString() {
        runPassPairs(String.class, new Object[] { new Long(0), "0", new Long(12345678901234L), "12345678901234",
                new Long(-12345678901234L), "-12345678901234", }, true);
    }

    /**
     * {@link BigDecimal} to {@link Long}.
     * 
     * aura-util/java/src/aura/util/type/converter/BigDecimalToLongConverter.
     * java
     */
    @Test
    public void testBigDecimalToLong() {
        runPassPairs(Long.class, new Object[] { new BigDecimal(12345678901234L), new Long(12345678901234L),
                new BigDecimal(-12345678901234L), new Long(-12345678901234L), }, true);
    }
}
