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

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.util.type.TypeUtil;

import java.math.BigDecimal;
import java.util.*;

/**
 * Test to check aura types
 * @hierarchy Aura.Framework
 * @userStorySyncIdOrName a07B0000000EQgW
 *
 *
 */
public class AuraConversionTest extends AuraImplTestCase {

    public AuraConversionTest(String name) {
        super(name);
    }

    /**
     * Run a set of conversions checking for equality when they are arrays.
     *
     * @param end the destination class.
     * @param set the pairs of source, dest
     */
    public <T> void runPassPairs(Class<T> end, Class<T []> array, Object [] set) {
        for (int i = 0; i < set.length; i += 2) {
            Object in = set[i];
            T [] out = array.cast(set[i+1]);
            Class<?> start = in.getClass();
            T [] result;

            result = TypeUtil.convertNoTrim(in, array);
            assertNotNull(result);
            assertEquals("Conversion["+i+"]: Bad Class :: "+start.getSimpleName()+"->"+array.getSimpleName(),
                         array, result.getClass());
            List<T> outL = Arrays.asList(out);
            List<T> resultL = Arrays.asList(result);
            assertEquals("Conversion["+i+"]: Value :: "+start.getSimpleName()+"->"+end.getSimpleName()+" input="+in,
                         outL, resultL);
        }
    }

    /**
     * Run a set of conversions checking for equality.
     *
     * @param end the destination class.
     * @param set the pairs of source, dest
     * @param exactClass true if the end class must be an exact match, otherwise, it just needs to assign.
     */
    public <T> void runPassPairs(Class<T> end, Object [] set, boolean exactClass) {
        for (int i = 0; i < set.length; i += 2) {
            Object in = set[i];
            T out = end.cast(set[i+1]);
            Class<?> start = in.getClass();
            T result;

            result = TypeUtil.convertNoTrim(in, end);
            assertNotNull("Conversion["+i+"]: Null result for "+in, result);
            if (exactClass) {
                assertEquals("Conversion["+i+"]: Bad Class :: "+start.getSimpleName()+"->"+end.getSimpleName(),
                             end, result.getClass());
            } else {
                assertTrue("Conversion["+i+"]: Bad Class :: "+start.getSimpleName()+"->"+end.getSimpleName(),
                           end.isAssignableFrom(result.getClass()));
            }
            assertEquals("Conversion["+i+"]: Value :: "+start.getSimpleName()+"->"+end.getSimpleName()+" input="+in,
                         out, result);
        }
    }

    /**
     * Test boolean conversions.
     *
     * aura-util/java/src/aura/util/type/converter/StringToBooleanConverter.java
     */
    public void testBoolean() throws Exception {
        runPassPairs(Boolean.class,
                     new Object [] {
                         "true", Boolean.TRUE,
                         "false", Boolean.FALSE,
                         "True", Boolean.TRUE,
                         "False", Boolean.FALSE,
                         "truE", Boolean.TRUE,
                         "falsE", Boolean.FALSE,
                         "yes", Boolean.FALSE,
                         "on", Boolean.FALSE,
                         "1", Boolean.FALSE,
                     }, true);
    }

    /**
     * Long to Date.
     *
     * aura-util/java/src/aura/util/type/converter/LongToDateConverter.java
     */
    public void testLongToDate() throws Exception {
        runPassPairs(Date.class,
                     new Object [] {
                         Long.valueOf(0L), new Date(0),
                         Long.valueOf(-1234L), new Date(-1234L),
                         Long.valueOf(12345678901234L), new Date(12345678901234L),
                     }, true);
    }

    /**
     * String to array list.
     *
     * aura-util/java/src/aura/util/type/converter/StringToArrayListConverter.java
     */
    public void testStringToArrayList() throws Exception {
        runPassPairs(ArrayList.class,
                     new Object [] {
                         "a,,b, c,d , e ",
                         new ArrayList<String>(Arrays.asList(new String [] { "a", "", "b", " c", "d ", " e " })),
                         "",
                         new ArrayList<String>(Arrays.asList(new String [] { })),
                     }, true);
    }


    /**
     * String to list.
     *
     * FIXME: does this converter make any sense? List vs. ArrayList gives very different results.
     *
     * aura-util/java/src/aura/util/type/converter/StringToListConverter.java
     */
    public void testStringToList() throws Exception {
        runPassPairs(List.class,
                     new Object [] {
                         "a,,b, c,d , e ", new ArrayList<String>(Arrays.asList(new String [] { "a,,b, c,d , e " })),
                         "", new ArrayList<String>(Arrays.asList(new String [] { "" })),
                     }, false);
    }

    /**
     * ArrayList of String to array of dates.
     *
     * FIXME:
     * This converter is totally bogus, it doesn't act like other string to date converters,
     * meaning that we have a totally inconsistent interface.
     *
     * aura-util/java/src/aura/util/type/converter/ArrayListToDateArrayConverter.java
     */
    public void testStringToDateArray() throws Exception {
        runPassPairs(Date.class, Date[].class,
                     new Object [] {
                         new ArrayList<String>(Arrays.asList(new String [] { "1234","2345","-3456"})),
                         new Date [] { new Date(1234L), new Date(2345L), new Date(-3456) }
                     });
    }

    /**
     * String to date only.
     *
     * FIXME:
     * This converter is totally bogus, it doesn't act like other string to date converters,
     * meaning that we have a totally inconsistent interface.
     *
     * aura-util/java/src/aura/util/type/converter/StringToDateOnlyConverter.java
     */
//    public void testStringToDateOnly() throws Exception {
//        runPassPairs(DateOnly.class,
//                     new Object [] {
//                         "2000-01-01", new DateOnly(946684800000L),
//                         "1950-01-01", new DateOnly(-30609792000000L),
//                         "3000-01-01", new DateOnly(32503680000000L),
//                     }, true);
//    }

    /**
     * Boolean to string.
     *
     * aura-util/java/src/aura/util/type/converter/BooleanToStringConverter.java
     */
    public void testBooleanToString() throws Exception {
        runPassPairs(String.class,
                     new Object [] {
                         Boolean.TRUE, "true",
                         Boolean.FALSE, "false",
                     }, true);
    }

    /**
     * Big Decimal to string.
     *
     * aura-util/java/src/aura/util/type/converter/BigDecimalToStringConverter.java
     */
    public void testBigDecimalToString() throws Exception {
        runPassPairs(String.class,
                     new Object [] {
                         new BigDecimal(0), "0",
                         new BigDecimal(12345678901234L), "12345678901234",
                         new BigDecimal(-12345678901234L), "-12345678901234",
                         new BigDecimal("12345678.901234"), "12345678.901234",
                         new BigDecimal("-12345678.901234"), "-12345678.901234",
                     }, true);
    }

    /**
     * String to big decimal.
     *
     * aura-util/java/src/aura/util/type/converter/StringToBigDecimalConverter.java
     */
    public void testStringToBigDecimal() throws Exception {
        runPassPairs(BigDecimal.class,
                     new Object [] {
                         "0", new BigDecimal(0),
                         "12345678901234", new BigDecimal(12345678901234L),
                         "-12345678901234", new BigDecimal(-12345678901234L),
                         "12345678.901234", new BigDecimal("12345678.901234"),
                         "-12345678.901234", new BigDecimal("-12345678.901234"),
                     }, true);
    }

    /**
     * Long to Integer
     *
     * aura-util/java/src/aura/util/type/converter/LongToIntegerConverter.java
     */
    public void testLongToInteger() throws Exception {
        runPassPairs(Integer.class,
                     new Object [] {
                         new Long(1234), new Integer(1234),
                         new Long(-1234), new Integer(-1234),
                         new Long(Integer.MAX_VALUE), new Integer(Integer.MAX_VALUE),
                         new Long(Integer.MIN_VALUE), new Integer(Integer.MIN_VALUE),
                         new Long(Integer.MAX_VALUE+1L), new Integer(Integer.MIN_VALUE),
                     }, true);
    }

    /**
     * ArrayList to Integer array.
     *
     * aura-util/java/src/aura/util/type/converter/ArrayListToIntegerArrayConverter.java
     */
    public void testArrayListToIntegerArray() throws Exception {
        runPassPairs(Integer.class, Integer [].class,
                     new Object [] {
                         new ArrayList<String>(Arrays.asList(new String[] {"0", "-1234", "1234567890"})),
                         new Integer [] { new Integer(0), new Integer(-1234), new Integer(1234567890), },
                     });
    }

    /**
     * String to integer converter.
     *
     * aura-util/java/src/aura/util/type/converter/StringToIntegerConverter.java
     */
    public void testStringToInteger() throws Exception {
        runPassPairs(Integer.class,
                     new Object [] {
                         "0", new Integer(0),
                         "-1234", new Integer(-1234),
                         "1234567890", new Integer(1234567890),
                     }, true);
    }

    /**
     * String to String array.
     *
     * aura-util/java/src/aura/util/type/converter/StringToStringArrayConverter.java
     */
    public void testStringToStringArray() throws Exception {
        runPassPairs(String.class, String [].class,
                     new Object [] {
                         "a,,b, c,d , e ", new String [] { "a", "", "b", " c", "d ", " e " },
                         "", new String [] { },
                     });
    }

    /**
     * String to Calendar.
     *
     * FIXME:
     * This, again, is inconsistent.
     *
     * aura-util/java/src/aura/util/type/converter/StringToCalendarConverter.java
     */
    public void testStringToCalendar() throws Exception {
        Calendar c1, c2, c3;

        c1 = Calendar.getInstance();
        c1.setTimeInMillis(1234L);
        c2 = Calendar.getInstance();
        c2.setTimeInMillis(-1234L);
        c3 = Calendar.getInstance();
        c3.setTimeInMillis(12345678901234L);

        runPassPairs(Calendar.class,
                     new Object [] {
                         "1234", c1,
                         "-1234", c2,
                         "12345678901234", c3,
                     }, false);
    }

    /**
     * ArrayList to String array.
     *
     * FIXME: This is bizarre, as this one trims.
     *
     * aura-util/java/src/aura/util/type/converter/ArrayListToStringArrayConverter.java
     */
    public void testArrayListToStringArray() throws Exception {
        runPassPairs(String.class, String [].class,
                     new Object [] {
                         new ArrayList<String>(Arrays.asList(new String [] { " a ", "b", " ", "c" })),
                         new String [] { "a", "b", "", "c" },
                     });
    }

    /**
     * ArrayList to Boolean array.
     *
     * aura-util/java/src/aura/util/type/converter/ArrayListToBooleanArrayConverter.java
     */
    public void testArrayListToBooleanArray() throws Exception {
        runPassPairs(Boolean.class, Boolean [].class,
                     new Object [] {
                         new ArrayList<Boolean>(Arrays.asList(new Boolean [] { Boolean.TRUE, Boolean.FALSE })),
                         new Boolean [] { Boolean.TRUE, Boolean.FALSE },
                     });
        try {
            TypeUtil.convertNoTrim(new ArrayList<Integer>(Arrays.asList(new Integer [] { Integer.valueOf(1) })),
                                   Boolean [].class);
            fail("Should fail to convert a list of integers");
        } catch (Exception expected) {
            // We don't really care what exception is thrown, just that we get one.
        }
    }

    /**
     * String to hash set.
     *
     * aura-util/java/src/aura/util/type/converter/StringToHashSetConverter.java
     */
    public void testStringToHashSet() throws Exception {
        runPassPairs(HashSet.class,
                     new Object [] {
                         "a,b, c, d ", new HashSet<String>(Arrays.asList(new String [] { "a", "b", " c", " d " })),
                     }, true);
    }

    /**
     * String to double.
     *
     * aura-util/java/src/aura/util/type/converter/StringToDoubleConverter.java
     */
    public void testStringToDouble() throws Exception {
        runPassPairs(Double.class,
                     new Object [] {
                         "1234.1234", new Double(1234.1234),
                     }, true);
    }

    /**
     * String to long.
     *
     * aura-util/java/src/aura/util/type/converter/StringToLongConverter.java
     */
    public void testStringToLong() throws Exception {
        runPassPairs(Long.class,
                     new Object [] {
                         "1", new Long(1),
                         "-1234", new Long(-1234),
                     }, true);
    }

    /**
     * Integer to string.
     *
     * aura-util/java/src/aura/util/type/converter/IntegerToStringConverter.java
     */
    public void testIntegerToString() throws Exception {
        runPassPairs(String.class,
                     new Object [] {
                         new Integer(0), "0",
                         new Integer(1234567890), "1234567890",
                         new Integer(-1234567890), "-1234567890",
                     }, true);
    }

    /**
     * Big Decimal to Integer.
     *
     * aura-util/java/src/aura/util/type/converter/BigDecimalToIntegerConverter.java
     */
    public void testBigDecimalToInteger() throws Exception {
        runPassPairs(Integer.class,
                     new Object [] {
                         new BigDecimal(1234567890), new Integer(1234567890),
                         new BigDecimal(-1234567890), new Integer(-1234567890),
                     }, true);
    }

    /**
     * String to Date.
     *
     * aura-util/java/src/aura/util/type/converter/StringToDateConverter.java
     */
    public void testStringToDate() throws Exception {
        runPassPairs(Date.class,
                     new Object [] {
                     }, true);
    }

    /**
     * String to HashMap.
     *
     * aura-util/java/src/aura/util/type/converter/StringToHashMapConverter.java
     */
    public void testStringToHashMap() throws Exception {
        HashMap<String,String> out = new HashMap<String,String>();

        out.put("a", "b");
        out.put("c", "d");
        runPassPairs(HashMap.class,
                     new Object [] {
                         "{ 'a': 'b' , 'c':'d'}", out
                     }, true);
    }

    /**
     * Long to String.
     *
     * aura-util/java/src/aura/util/type/converter/LongToStringConverter.java
     */
    public void testLongToString() throws Exception {
        runPassPairs(String.class,
                     new Object [] {
                         new Long(0), "0",
                         new Long(12345678901234L), "12345678901234",
                         new Long(-12345678901234L), "-12345678901234",
                     }, true);
    }
    /**
     * Big decimal to long.
     *
     * aura-util/java/src/aura/util/type/converter/BigDecimalToLongConverter.java
     */
    public void testBigDecimalToLong() throws Exception {
        runPassPairs(Long.class,
                     new Object [] {
                         new BigDecimal(12345678901234L), new Long(12345678901234L),
                         new BigDecimal(-12345678901234L), new Long(-12345678901234L),
                     }, true);
    }
}
