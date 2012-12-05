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
package org.auraframework.util.json;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.io.StringReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.IOUtil;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;
import org.auraframework.util.json.JsonStreamReader.JsonStreamParseException;

import com.google.common.base.Charsets;

/**
 * @hierarchy Aura.Unit Tests.Json StreamReader
 * @priority medium
 * @userStorySyncIdOrName a0790000000DQXVAA4
 */
public class JsonStreamReaderTest extends UnitTestCase {
    private JsonStreamReader jsonStreamReader;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        // Keep the reader clean
        jsonStreamReader = null;
    }

    @Override
    public void tearDown() throws Exception {
        // Close the stream
        if (jsonStreamReader != null) {
            jsonStreamReader.close();
        }
        super.tearDown();
    }

    /**
     * Testing extreme cases for constructor
     */
    public void testExtremeCases() throws Exception {
        Reader nullReader = null;
        String nullString = null;
        JsonHandlerProvider nullProvider = null;

        try {
            new JsonStreamReader(nullReader, new JsonHandlerProviderImpl());
            fail("Should not have accepted a null reader");
        } catch (JsonParseException expected) {}
        try {
            new JsonStreamReader(nullString, nullProvider);
            fail("Should not have accepted a null string");
        } catch (JsonParseException expected) {}
        // When a null provider is passed, it's expected to use a default provider
        JsonStreamReader obj = new JsonStreamReader("[{key:\"value\"},30]", nullProvider);
        obj.next();
        assertTrue(obj.getValue() instanceof List);
    }

    /**
     * Passing a literal to a Json reader should throw an exception
     */
    public void testLiteral() throws Exception {
        try {
            this.parseAndRetrieve("literal");
            fail("Trying to parse a literal should throw an exception");
        } catch (JsonStreamParseException expected) {
            // Expected to throw an exception
        }

        try {
            this.parseAndRetrieve("nuller");
            fail("Should not have mistaken this input for null");
        } catch (JsonStreamParseException expected) {
            // Expected to throw an exception
        }

    }

    /**
     * Positive and negative tests for {@link JsonStreamReader#getList()} for when recursive reading is
     * disabled
     */
    public void testGetListWithRecursiveReadDisabled() throws Exception {
        runGetListTest(new JsonStreamGetObjectOrArrayTestConfig() {
            @Override
            public JsonStreamReader createJsonStreamReader(String json) {
                final JsonStreamReader reader = new JsonStreamReader(new ByteArrayInputStream(
                        json.getBytes(Charsets.UTF_8)));
                assertFalse(reader.isRecursiveReadEnabled());
                return reader;
            }

            @Override
            public boolean isRecursiveReadEnabled() {
                return false;
            }
        });
    }

    /**
     * Positive and negative tests for {@link JsonStreamReader#getList()}.
     */
    public void testGetList() throws Exception {
        runGetListTest(new JsonStreamGetObjectOrArrayTestConfig() {
            @Override
            public JsonStreamReader createJsonStreamReader(String json) {
                final JsonStreamReader reader = new JsonStreamReader(json);
                assertTrue(reader.isRecursiveReadEnabled());
                return reader;
            }

            @Override
            public boolean isRecursiveReadEnabled() {
                return true;
            }
        });
    }

    /**
     * Positive and negative tests for {@link JsonStreamReader#getList()}.
     */
    @SuppressWarnings("unchecked")
    private void runGetListTest(JsonStreamGetObjectOrArrayTestConfig config) throws Exception {
        try {
            jsonStreamReader = config.createJsonStreamReader("\"string\"");
            jsonStreamReader.next();
            jsonStreamReader.getList();
            fail("Trying to get a list by passing a string should have failed.");
        } catch (JsonStreamParseException expected) {
            // Make sure the exception was because of mis-match between expected token and actual token
            assertTrue(expected.getMessage().startsWith("Current Token is STRING, not ARRAY"));
        } finally {
            jsonStreamReader.close();
        }
        jsonStreamReader = config.createJsonStreamReader("[\"test1\",\"test2\"]");
        try {
            assertEquals(config.isRecursiveReadEnabled() ? JsonConstant.ARRAY : JsonConstant.ARRAY_START,
                    jsonStreamReader.next());
            List<Object> list = jsonStreamReader.getList();
            assertEquals("JsonStreamReader should have extracted only 2 items", 2, list.size());
            assertEquals("JsonStreamReader has extracted the wrong string or disordered the elements", list.get(0),
                    "test1");
            assertEquals("JsonStreamReader has extracted the wrong string or disordered the elements", list.get(1),
                    "test2");
        } finally {
            jsonStreamReader.close();
        }
        /*
         * Positive test case 2: Passing a combination of object types
         */
        jsonStreamReader = config.createJsonStreamReader("[\"test1\",20]");
        try {
            assertEquals(config.isRecursiveReadEnabled() ? JsonConstant.ARRAY : JsonConstant.ARRAY_START,
                    jsonStreamReader.next());
            List<Object> assortedList = jsonStreamReader.getList();
            assertEquals("JsonStreamReader should have extracted only 2 items", 2, assortedList.size());
            assertTrue(assortedList.get(0) instanceof String);
            assertEquals("JsonStreamReader has extracted the wrong string or disordered the elements",
                    assortedList.get(0), "test1");
            assertTrue(assortedList.get(1) instanceof BigDecimal);
            assertEquals("JsonStreamReader has extracted the wrong element or disordered the elements",
                    ((BigDecimal)assortedList.get(1)).doubleValue(), 20.0);
        } finally {
            jsonStreamReader.close();
        }
        /*
         * Positive test case 3: Pass a Json string with Arrays inside of an Array
         */
        jsonStreamReader = config.createJsonStreamReader("[[\"test1\",\"test2\"],[20,30],true]");
        try {
            assertEquals(config.isRecursiveReadEnabled() ? JsonConstant.ARRAY : JsonConstant.ARRAY_START,
                    jsonStreamReader.next());
            List<Object> nestedList = jsonStreamReader.getList();
            assertEquals("JsonStreamReader should have extracted only 3 list items from the nested list", 3,
                    nestedList.size());

            List<Object> stringList = (List<Object>)nestedList.get(0);
            assertEquals("JsonStreamReader should have extracted only 2 items for the first inner list", 2,
                    stringList.size());
            assertTrue("JsonStreamReader has extracted the wrong element or disordered the elements", stringList.get(0)
                    .equals("test1"));
            assertTrue("JsonStreamReader has extracted the wrong element or disordered the elements", stringList.get(1)
                    .equals("test2"));

            List<Object> numberList = (List<Object>)nestedList.get(1);
            assertEquals("JsonStreamReader should have extracted only 2 items for the second inner list", 2,
                    numberList.size());
            assertEquals("JsonStreamReader has extracted the wrong element or disordered the elements",
                    ((BigDecimal)numberList.get(0)).doubleValue(), 20.0);
            assertEquals("JsonStreamReader has extracted the wrong element or disordered the elements",
                    ((BigDecimal)numberList.get(1)).doubleValue(), 30.0);

            Object o = nestedList.get(2);
            assertTrue("JsonStreamReader has extracted the wrong element", o.equals(Boolean.TRUE));
        } finally {
            jsonStreamReader.close();
        }
    }

    /**
     * Positive and Negative test for {@link JsonStreamReader#getBoolean()}.
     */
    public void testGetBoolean() throws Exception {

        jsonStreamReader = new JsonStreamReader("1");
        try {
            jsonStreamReader.next();
            jsonStreamReader.getBoolean();
            fail("Trying to get a boolean by passing a string should have failed.");
        } catch (JsonParseException expected) {
            // Make sure the exception was because of mis-match between expected token
            // and actual token
            assertTrue(expected.getMessage().startsWith("Current Token is NUMBER, not BOOLEAN"));
        } finally {
            jsonStreamReader.close();
        }

        jsonStreamReader = new JsonStreamReader("true1");
        try {
            assertEquals(JsonConstant.BOOLEAN, jsonStreamReader.next());
            jsonStreamReader.getBoolean();
            fail("JsonStreamReader should have treated this input as a literal");
        } catch (JsonParseException expected) {} finally {
            jsonStreamReader.close();
        }

        jsonStreamReader = new JsonStreamReader(new StringReader("true"));
        try {
            assertEquals(JsonConstant.BOOLEAN, jsonStreamReader.next());
            assertTrue(jsonStreamReader.getBoolean());
        } finally {
            jsonStreamReader.close();
        }
        jsonStreamReader = new JsonStreamReader(new StringReader("false"));
        try {
            assertEquals(JsonConstant.BOOLEAN, jsonStreamReader.next());
            assertFalse(jsonStreamReader.getBoolean());
        } finally {
            jsonStreamReader.close();
        }
    }

    /**
     * Positive and Negative test for {@link JsonStreamReader#getNumber()}.
     */
    public void testGetNumber() throws Exception {
        try {
            jsonStreamReader = new JsonStreamReader(new StringReader("\"string\""));
            jsonStreamReader.next();
            jsonStreamReader.getNumber();
            fail("Trying to get a number by passing a string should have failed.");
        } catch (JsonStreamParseException expected) {
            // Make sure the exception was because of mis-match between expected token and actual token
            assertTrue(expected.getMessage().startsWith("Current Token is STRING, not NUMBER"));
        }
        /**
         * Negative test case 2: Pass a valid literal and expect a number
         */
        try {
            jsonStreamReader = new JsonStreamReader("true");
            jsonStreamReader.next();
            jsonStreamReader.getNumber();
            fail("Trying to get a boolean by passing a string should have failed.");
        } catch (JsonStreamParseException expected) {
            // Make sure the exception was because of mis-match between expected token and actual token
            assertTrue(expected.getMessage().startsWith("Current Token is BOOLEAN, not NUMBER"));
        }
        /*
         * Negative test case 3: Pass an invalid number and expect a numberformat exception
         */
        try {
            jsonStreamReader = new JsonStreamReader("30xyz");
            jsonStreamReader.next();
            fail("Should have recognized the fake number like input");
        } catch (JsonStreamParseException expected) {
            // expected to throw this exception
        } finally {
            jsonStreamReader.close();
        }

        jsonStreamReader = new JsonStreamReader("30");
        try {
            jsonStreamReader.next();
            assertEquals("Failed to read the right number", jsonStreamReader.getNumber().doubleValue(), 30.0);
        } finally {
            jsonStreamReader.close();
        }

        jsonStreamReader = new JsonStreamReader(new StringReader("-1.2E-20"));
        try {
            jsonStreamReader.next();
            assertEquals("Failed to read the right number", jsonStreamReader.getNumber().doubleValue(), -1.2e-20);
        } finally {
            jsonStreamReader.close();
        }

        jsonStreamReader = new JsonStreamReader(new StringReader("1.2e-20"));
        try {
            jsonStreamReader.next();
            assertEquals("Failed to read the right number", jsonStreamReader.getNumber().doubleValue(), 1.2e-20);
        } finally {
            jsonStreamReader.close();
        }
    }

    private static interface JsonStreamGetObjectOrArrayTestConfig {
        JsonStreamReader createJsonStreamReader(String json);

        boolean isRecursiveReadEnabled();
    }

    /**
     * Positive and Negative test for {@link JsonStreamReader#getObject()} and
     * {@link JsonStreamReader#next()} when recursive reading is disabled. Also other cases while
     * parsing a string representing an Object
     */
    public void testGetObjectWithRecursiveReadDisabled() throws Exception {
        runGetObjectTest(new JsonStreamGetObjectOrArrayTestConfig() {
            @Override
            public JsonStreamReader createJsonStreamReader(String json) {
                final JsonStreamReader reader = new JsonStreamReader(new ByteArrayInputStream(
                        json.getBytes(Charsets.UTF_8)));
                assertFalse(reader.isRecursiveReadEnabled());
                return reader;
            }

            @Override
            public boolean isRecursiveReadEnabled() {
                return false;
            }
        });
    }

    /**
     * Positive and Negative test for {@link JsonStreamReader#getObject()} and
     * {@link JsonStreamReader#next()}. Also other cases while parsing a string representing an Object
     */
    public void testGetObject() throws Exception {
        runGetObjectTest(new JsonStreamGetObjectOrArrayTestConfig() {
            @Override
            public JsonStreamReader createJsonStreamReader(String json) {
                final JsonStreamReader reader = new JsonStreamReader(json);
                assertTrue(reader.isRecursiveReadEnabled());
                return reader;
            }

            @Override
            public boolean isRecursiveReadEnabled() {
                return true;
            }
        });
    }

    /**
     * Positive and Negative test for {@link JsonStreamReader#getObject()} and
     * {@link JsonStreamReader#next()}. Also other cases while parsing a string representing an Object
     */
    private void runGetObjectTest(JsonStreamGetObjectOrArrayTestConfig config) throws Exception {
        jsonStreamReader = config.createJsonStreamReader("[\"test1\",20]");
        jsonStreamReader.next();
        try {
            jsonStreamReader.getObject();
            fail("Expeccting an object when a string representing an array is passed.");
        } catch (JsonStreamParseException expected) {
            // Make sure the exception was because of mis-match between expected token and actual token
            assertTrue(expected.getMessage().startsWith(
                    "Current Token is ARRAY" + (config.isRecursiveReadEnabled() ? "" : "_START") + ", not OBJECT"));
        } finally {
            jsonStreamReader.close();
        }

        jsonStreamReader = config
                .createJsonStreamReader("//comment 0\n/*comment1*/{/*comme\n\n\nnt2*/objName://comment 3\n20/*comment4*/}");
        try {
            assertEquals(config.isRecursiveReadEnabled() ? JsonConstant.OBJECT : JsonConstant.OBJECT_START,
                    jsonStreamReader.next());
            Map<String, Object> o = jsonStreamReader.getObject();
            assertTrue(o.containsKey("objName"));
            assertTrue(o.get("objName") instanceof BigDecimal);
            assertEquals(((BigDecimal)o.get("objName")).doubleValue(), 20.0);
        } finally {
            jsonStreamReader.close();
        }
        try {
            jsonStreamReader = config.createJsonStreamReader("{\"objName\":null}");
            assertEquals(config.isRecursiveReadEnabled() ? JsonConstant.OBJECT : JsonConstant.OBJECT_START,
                    jsonStreamReader.next());
            Map<String, Object> o = jsonStreamReader.getObject();
            assertTrue(o.containsKey("objName"));
            assertTrue(o.get("objName") == null);
        } finally {
            jsonStreamReader.close();
        }
        /*
         * Positive test case 3: object with comments and multi line comments and special characters Object starts with
         * comments, consists of comments.
         */
        jsonStreamReader = config.createJsonStreamReader(" //comment line, followed by another //\n"
                + "/*  Start object paren  */ \n" + "{" + "/*comme\n\n\nnt2*/" + "objName:" + "//comment 3\n" + "20"
                + " /* comment4*/" + "}");
        try {
            assertEquals(config.isRecursiveReadEnabled() ? JsonConstant.OBJECT : JsonConstant.OBJECT_START,
                    jsonStreamReader.next());
            Map<String, Object> o = jsonStreamReader.getObject();
            assertTrue(o.containsKey("objName"));
            assertTrue(o.get("objName") instanceof BigDecimal);
            assertEquals(((BigDecimal)o.get("objName")).doubleValue(), 20.0);
        } finally {
            jsonStreamReader.close();
        }
    }

    /**
     * Test method for {@link JsonStreamReader#next()}.
     */
    @SuppressWarnings("unchecked")
    public void testNext() throws IOException {
        jsonStreamReader = new JsonStreamReader("{\"objName\':\"string\"}");
        try {
            jsonStreamReader.next();
            fail("String represented with single quote and double quote should not be accepted");
        } catch (JsonStreamParseException expected) {
            // Expect this exception because of unterminated string
        } finally {
            jsonStreamReader.close();
        }
        jsonStreamReader = new JsonStreamReader("{obj Name:\"string\"}");
        try {
            jsonStreamReader.next();
            fail("Object key with a space ");
        } catch (JsonStreamParseException expected) {
            // Expect this exception because Object key with a space
        } finally {
            jsonStreamReader.close();
        }
        jsonStreamReader = new JsonStreamReader("{\"obj Name\":\"string\"}");
        try {
            jsonStreamReader.next();
            Map<String, Object> obj = jsonStreamReader.getObject();
            assertTrue(obj.containsKey("obj Name"));
            assertTrue(obj.get("obj Name").equals("string"));
        } finally {
            jsonStreamReader.close();
        }
        String func = "function (arg1, arg2) {   /*comment\n\n\n*/var str = \"\\\"\"; var str2 = '\\'vads\\nadf' var foo = {\n}; var func = function(){ var foo = {};var str = \"{\";};}";
        jsonStreamReader = new JsonStreamReader("  { " + "'foo' : 'bar', " + "'baz' : 'qux', "
                + "\"quux\" : \"corge grault\\n\\\"\\\\\\tga\\u030A\\u031Frply\", "
                + "'waldo' : [ 'fred','plu\\'gh' , 'xyzzy'], " + "'thud' : { 'wibble' : 'wobble'},"
                + " wubble : \"flob\"," + "spam : true ," + "ham : false ," + "eggs : null," + "num : -123.456E2,"
                + "otherNum : 123.456E-2," + "otherOtherNum : 123.456e+2," + "func : " + func
                + ", jsean :  'whose\\'s son?'," + "Фокс : 'за'}");
        try {
            assertTrue(jsonStreamReader.hasNext());
            assertEquals(JsonConstant.OBJECT, jsonStreamReader.next());
            assertFalse(jsonStreamReader.hasNext());

            Map<String, Object> outerMap = jsonStreamReader.getObject();
            assertEquals("bar", outerMap.get("foo"));
            assertEquals("qux", outerMap.get("baz"));
            assertEquals("corge grault\n\"\\\tga\u030A\u031Frply", outerMap.get("quux"));

            List<String> waldo = new ArrayList<String>();
            waldo.add("fred");
            waldo.add("plu'gh");
            waldo.add("xyzzy");
            assertEquals(waldo, outerMap.get("waldo"));

            Object thud = outerMap.get("thud");
            Map<String, Object> wibble = (Map<String, Object>)thud;
            assertTrue(wibble.containsKey("wibble"));
            assertTrue(wibble.get("wibble").equals("wobble"));

            assertEquals("flob", outerMap.get("wubble"));
            assertTrue((Boolean)outerMap.get("spam"));
            assertFalse((Boolean)outerMap.get("ham"));
            assertNull(outerMap.get("eggs"));
            assertEquals(-12345.6, ((BigDecimal)outerMap.get("num")).doubleValue());
            assertEquals(1.23456, ((BigDecimal)outerMap.get("otherNum")).doubleValue());
            assertEquals(12345.6, ((BigDecimal)outerMap.get("otherOtherNum")).doubleValue());
            assertTrue(outerMap.get("func") instanceof JsFunction);
            assertEquals("\n" + AuraTextUtil.replaceSimple(func, "/*comment\n\n\n*/", "\n"),
                    Json.serialize(outerMap.get("func"), true, false));
            assertEquals("whose's son?", outerMap.get("jsean"));
            assertEquals("за", outerMap.get("Фокс"));
        } finally {
            jsonStreamReader.close();
        }
    }

    /**
     * Tests for reading functions.
     */
    public void testReadFunction() throws Exception {
        String func = "{key:function (arg1, arg2) {   " + "var str = \"\\\"\"; " + "var func = function(){ "
                + "var foo = {};" + "var str = \"{\";" + "}; " +
                // missing closing paranthesis for outer function
                "}";
        try {
            this.parseAndRetrieve(func);
            fail("Unterminated function body should be recognized and throws back as exception");
        } catch (JsonStreamParseException expected) {
            // expect this to fail since the function body is unterminated
        }
        func = "{key:function (arg1, arg2) {" + "var str = \"\\\"\"; " + "var str2 = '\\'vads\\nadf' "
                + "var foo = {\n}; " + "var func = function(){ " + "var foo = {};" + "var str = \"{\";" +
                // Missing closing paranthesis for inner function body
                "}" + "}";
        try {
            this.parseAndRetrieve(func);
            fail("Invalid function body should be recognized and throws back as exception");
        } catch (JsonStreamParseException expected) {
            // expect this to fail since the function body is unterminated
        }

        func = "{key:function () {var str = \"do Nothing\";}}";
        Object funcMapObj = this.parseAndRetrieve(func);
        assertTrue(funcMapObj instanceof Map);
        Map<?, ?> funcObj = (Map<?, ?>)funcMapObj;
        assertTrue(funcObj.get("key") instanceof JsFunction);
        JsFunction jsfuncObj = (JsFunction)funcObj.get("key");
        assertTrue(jsfuncObj.getArguments().size() == 0);
        assertEquals("var str = \"do Nothing\";", jsfuncObj.getBody());

        Object functionAsLiteral = this.parseAndRetrieve("function () {var str = \"do Nothing\";}");
        assertTrue(functionAsLiteral instanceof JsFunction);
        assertEquals("var str = \"do Nothing\";", ((JsFunction)functionAsLiteral).getBody());

        Object functionAsList = this.parseAndRetrieve("[function () {var str = \"do Nothing\";} , 30]");
        assertTrue(functionAsList instanceof List);
        assertEquals(((List<?>)functionAsList).size(), 2);
        assertTrue(((List<?>)functionAsList).get(0) instanceof JsFunction);
        JsFunction functionAsListObj1 = (JsFunction)((List<?>)functionAsList).get(0);
        assertTrue(functionAsListObj1.getArguments().size() == 0);
        assertEquals("var str = \"do Nothing\";", functionAsListObj1.getBody());
        assertTrue(((List<?>)functionAsList).get(1) instanceof BigDecimal);
        assertEquals(((BigDecimal)((List<?>)functionAsList).get(1)).doubleValue(), 30.0);

        Object functionAsStringInList = this.parseAndRetrieve("[\"function () {var str = \\\"do Nothing\\\";}\" , 30]");
        assertTrue(functionAsStringInList instanceof List);
        assertTrue(((List<?>)functionAsStringInList).get(0) instanceof String);

        func = "{key:function(101, 280) {var str = 'do nothing';}}";
        Object functionLiteralArgs = this.parseAndRetrieve(func);
        assertTrue(functionLiteralArgs instanceof Map);
        assertTrue(((Map<?, ?>)functionLiteralArgs).get("key") instanceof JsFunction);
        JsFunction functionLiteralArgs1 = (JsFunction)((Map<?, ?>)functionLiteralArgs).get("key");
        assertTrue(functionLiteralArgs1.getArguments().size() == 2);
        assertEquals(functionLiteralArgs1.getArguments().get(0), "101");
        assertEquals("var str = \'do nothing\';", functionLiteralArgs1.getBody());

        func = "function(101, 280) {var str = 'do nothing';}";
        Object functionAsLiteral1 = this.parseAndRetrieve(func);
        assertTrue(functionAsLiteral1 instanceof JsFunction);
        JsFunction functionLiteralArgs2 = (JsFunction)(functionAsLiteral1);
        assertTrue(functionLiteralArgs2.getArguments().size() == 2);
        assertEquals(functionLiteralArgs2.getArguments().get(0), "101");
        assertEquals("var str = 'do nothing';", functionLiteralArgs2.getBody());

        func = "{key:function foo(arg1, arg2) { var str = 'do nothing';}}";
        this.parseAndRetrieve(func);
        Object namedFuncMapObj = this.parseAndRetrieve(func);
        assertTrue(namedFuncMapObj instanceof Map);
        Map<?, ?> namedFuncObj = (Map<?, ?>)namedFuncMapObj;
        assertTrue(namedFuncObj.get("key") instanceof JsFunction);
        JsFunction namedJsfuncObj = (JsFunction)namedFuncObj.get("key");
        assertEquals("foo", namedJsfuncObj.getName());
        assertTrue(namedJsfuncObj.getArguments().size() == 2);
        assertEquals(" var str = 'do nothing';", namedJsfuncObj.getBody());

    }

    /**
     * Test for reading Strings.
     */
    @SuppressWarnings("unchecked")
    public void testReadString() throws Exception {
        String key1 = "key1";
        String value1 = "value1";
        String key2 = "key2";
        String value2 = "value2";
        String key3 = "key3";
        String value3_0 = "one";
        boolean value3_1 = true;
        boolean value3_2 = false;
        BigDecimal value3_3 = new BigDecimal("2");
        BigDecimal value3_4 = new BigDecimal("3.14159265358979323846");

        String json = String.format("{ '%s' : '%s', \"%s\" : \"%s\",     '%s' : ['%s', %s, %s, %s, %s]}  ", key1,
                value1, key2, value2, key3, value3_0, value3_1, value3_2, value3_3, value3_4);

        Object o = parseAndRetrieve(json);
        assertNotNull(o);
        assertTrue(o instanceof Map);
        Map<String, Object> m = (Map<String, Object>)o;
        assertEquals(value1, m.get(key1));
        assertEquals(value2, m.get(key2));
        List<?> l = (List<?>)m.get(key3);
        assertEquals(value3_0, l.get(0));
        assertEquals(value3_1, l.get(1));
        assertEquals(value3_2, l.get(2));
        assertEquals(value3_3, l.get(3));
        assertEquals(value3_4, l.get(4));

        try {
            parseAndRetrieve("\"halfstring");
            fail("Unterminated String should not pass.");
        } catch (JsonParseException e) {
            // should fail.
        }
    }

    /**
     * Tests to verify parsing of Arrays.
     */
    @SuppressWarnings("unchecked")
    public void testReadArray() throws IOException {
        String json = "[\"test1\",\"test2\"]";
        Object o = parseAndRetrieve(json);
        assertTrue(o instanceof List);
        List<String> list = (List<String>)o;
        assertEquals("JsonStreamReader should have extracted only 2 items", 2, list.size());
        assertEquals("JsonStreamReader has extracted the wrong string or disordered the elements", "test1", list.get(0));
        assertEquals("JsonStreamReader has extracted the wrong string or disordered the elements", "test2", list.get(1));
        try {
            parseAndRetrieve("[1");
            fail("Unterminated Array should not pass.");
        } catch (JsonStreamReader.JsonStreamParseException e) {
            // should fail.
        }
    }

    /**
     * Tests to verify that maps are recognized and parsed correctly.
     *
     * @throws IOException
     */
    @SuppressWarnings("unchecked")
    public void testReadMap() throws IOException {
        String json = "{\"key1\":\"val1\",\"key2\":\"val2\"}";
        Object o = parseAndRetrieve(json);
        assertTrue(o instanceof Map);
        Map<Object, Object> map = (HashMap<Object, Object>)o;
        assertEquals(2, map.size());
        assertEquals("val1", map.get("key1"));
        assertEquals("val2", map.get("key2"));
        try {
            parseAndRetrieve("{");
            fail("Unterminated Map should not pass.");
        } catch (JsonParseException e) {
            // should fail.
        }
        // Values not enclosed in quotes must not be accepted
        try {
            parseAndRetrieve("{'key1': val1}");
            fail("Only key values can be specified without quotes");
        } catch (JsonStreamParseException expected) {

        }
    }

    /**
     * Tests to verify all accepted forms of n
     */
    public void testReadNumbers() throws IOException {
        String json = "1";
        Object o = parseAndRetrieve(json);
        assertTrue(o instanceof BigDecimal);
        BigDecimal num = (BigDecimal)o;
        assertEquals(new BigDecimal(1), num);
        assertEquals(123.456, ((BigDecimal)parseAndRetrieve("123.456")).doubleValue());
        assertEquals(-123.456, ((BigDecimal)parseAndRetrieve("-123.456")).doubleValue());
        assertEquals(1.2E21, ((BigDecimal)parseAndRetrieve("1.2E21")).doubleValue());
        assertEquals(-1.2E-20, ((BigDecimal)parseAndRetrieve("-1.2E-20")).doubleValue());
        assertEquals(1.2, ((BigDecimal)parseAndRetrieve("+1.2")).doubleValue());
    }

    /**
     * Tests to verify all accepted forms of string values mentioned in http://www.json.org and in
     * {@link JsonStreamReader}
     */
    public void testReadStrings() throws IOException {
        assertEquals(null, parseAndRetrieve(""));

        assertEquals(null, parseAndRetrieve("null"));
        assertEquals(" // ", parseAndRetrieve("\" // \"")); // Single line comment characters with in quotes are not
                                                            // treated specially
        assertEquals(" /*  * \n *  */ ", parseAndRetrieve("\" /*  * \n *  */ \"")); // multi line comment characters
                                                                                    // with in quotes are not treated
                                                                                    // specially
        assertEquals("a", parseAndRetrieve("'a'\b")); // Single quote string
        assertEquals("a", parseAndRetrieve("\"a\""));
        assertEquals("\n", parseAndRetrieve("\"\\n\""));
        assertEquals("\t", parseAndRetrieve("\"\\t\""));
        assertEquals("\\", parseAndRetrieve("\"\\\\\""));
        assertEquals("\b", parseAndRetrieve("\"\\b\""));
        assertEquals("\f", parseAndRetrieve("\"\\f\""));
        assertEquals("\r", parseAndRetrieve("\"\\r\""));
        assertEquals("\"", parseAndRetrieve("\"\\\"\""));
        assertEquals("/", parseAndRetrieve("\"\\/\""));
        assertEquals("ë", parseAndRetrieve("\"ë\""));
        assertEquals("分", parseAndRetrieve("\"分\"")); // Chinese
        assertEquals("本", parseAndRetrieve("\"本\"")); // Japanese
        assertEquals("조", parseAndRetrieve("\"조\"")); // Korean
        assertEquals("\u1111", parseAndRetrieve("\"ᄑ\""));
        assertEquals("\u2111", parseAndRetrieve("\"\u2111\""));
        assertEquals("'", parseAndRetrieve("\"\\'\""));
        assertEquals("\\'", parseAndRetrieve("\"\\\\\\'\""));
        assertEquals("\\\\", parseAndRetrieve("\"\\\\\\\\\""));
        assertEquals("<", parseAndRetrieve("\"\\u003C\""));
        assertEquals(">", parseAndRetrieve("\"\\u003E\""));
        assertEquals("!--", parseAndRetrieve("\"\\u0021--\""));
        assertEquals("\"!--\"", parseAndRetrieve("'\\\"\\u0021--\\\"'"));
        // Parsing strings which look like a key word throw an exception
        try {
            parseAndRetrieve("functioneer");
            fail("Should have thrown an exception on encountering key word like words");
        } catch (JsonStreamParseException expected) {}
        assertEquals("    ! @#$%^&*()_+-=|}{[]:;?.,`~", parseAndRetrieve("\"    ! @#$%^&*()_+-=|}{[]:;?.,`~\""));
        // Japanese, Chinese, Korean
        assertEquals("速い茶色のキツネは怠け者の犬を跳び越えました。 福克斯布朗的快速跳过懒狗。 위를 건너뛰었습니다. 게으르고 개 ",
                parseAndRetrieve("\"速い茶色のキツネは怠け者の犬を跳び越えました。 福克斯布朗的快速跳过懒狗。 위를 건너뛰었습니다. 게으르고 개 \""));
        // Russian, German, Hebrew
        assertEquals(
                "Быстрый Браун Фокс выросло за ленивый собака. Die schnelle Braun Fuchs sprang über den faulen Hund. השועל החום המהיר קפץ מעל הכלב העצלן.",
                parseAndRetrieve("\"Быстрый Браун Фокс выросло за ленивый собака. Die schnelle Braun Fuchs sprang über den faulen Hund. השועל החום המהיר קפץ מעל הכלב העצלן.\""));

    }

    /**
     * Tests to verify Json strings with boolean values
     */
    public void testReadBooleans() throws IOException {
        String json = "true";
        Object o = parseAndRetrieve(json);
        assertTrue(o instanceof Boolean);
        Boolean bool = (Boolean)o;
        assertTrue(bool);
        json = "false";
        o = parseAndRetrieve(json);
        assertTrue(o instanceof Boolean);
        bool = (Boolean)o;
        assertFalse(bool);
    }

    /**
     * Test to cover JsonStreamReader.readObject(), JsonStreamReader.readArray(), and
     * JsonStreamReader.getHandlerProvider()
     */
    @SuppressWarnings("unchecked")
    public void testReadComplexObject() throws IOException {
        String json = "{\"key1\":" + "[" + "[\"string1\",\"string2\"]," + "true," + "10," + "[" + "false," + "1.5,"
                + "{\"key2\":[\"string1\",\"string2\"]}" + "]" + "]" + "}";
        Object o = parseAndRetrieve(json);
        assertTrue(o instanceof Map);
        Map<String, Object> outerMap = (Map<String, Object>)o;
        List<Object> outerList = (List<Object>)outerMap.get("key1");

        List<Object> item0 = (List<Object>)outerList.get(0);
        assertEquals("string1", item0.get(0));
        assertEquals("string2", item0.get(1));

        assertEquals(true, outerList.get(1));
        assertEquals(new BigDecimal(10), outerList.get(2));

        List<Object> item3 = (List<Object>)outerList.get(3);
        assertEquals(false, item3.get(0));
        assertEquals(new BigDecimal(1.5), item3.get(1));

        Map<String, Object> innerMap = (Map<String, Object>)item3.get(2);
        List<Object> innerList = (List<Object>)innerMap.get("key2");
        assertEquals("string1", innerList.get(0));
        assertEquals("string2", innerList.get(1));
    }

    /**
     * @newTestCase Verify that JSON with comments embedded can be handled by JsonStreamReader. The first is a special
     *              case of JSON string, because aura javascript controllers is in this format.
     * @newTestCase Everything after a single line comment delimiter should be ignored Starting another multiline
     *              comment with in a multiline comment is ok.
     * @newTestCase Incomplete multi line comment.
     * @newTestCase Invalid multi line comment
     * @hierarchy Aura.Unit Tests.Json StreamReader
     * @priority medium
     * @userStorySyncIdOrName a07B0000000DUGn
     */
    @SuppressWarnings("unchecked")
    public void testCommentsInJsonBody() throws Exception {
        // Positive test Case1
        String commentsAtStartOfObject = "/*Multiline comment \n Yeah really */ {\n"
                + "/** Some more multiline comments and Some speci@l character's\n * \n*/"
                + " functionName1: function(args1, args2) {" + "/*Multi line Comments\n **/\n"
                + "//Single line Comments\n" + "var str = 'do Nothing'; \n" + "},"
                + "/*Multiline comment \n Yeah really */\n" + "functionName2: function(args1, args2, args3) {"
                + "//Single line comments \n" + "var str = 'Still do Nothing';" + "}," + "}";
        Object o = parseAndRetrieve(commentsAtStartOfObject);
        assertTrue(o instanceof Map);
        Map<String, Object> functionMap = (Map<String, Object>)o;
        assertEquals(2, functionMap.size());
        Object function1 = functionMap.get("functionName1");
        assertTrue(function1 instanceof JsFunction);
        Object function2 = functionMap.get("functionName2");
        assertTrue(function2 instanceof JsFunction);

        /*
         * Positive test case 2: Everything after a single line comment delimiter should be ignored, Starting another
         * multiline comment with in a multiline comment is ok,
         */
        String fakeMultiLine = "// /*Multi line comment delimiter after a single line comment delimiter \n" + "{\n"
                + "/* */ " + " functionName1: function(args1, args2) {" + "var str = 'do Nothing'; \n" + "}," + "}";
        o = parseAndRetrieve(fakeMultiLine);
        assertTrue(o instanceof Map);
        functionMap = (Map<String, Object>)o;
        assertEquals(1, functionMap.size());
        Object function = functionMap.get("functionName1");
        assertTrue(function instanceof JsFunction);

        String inCompleteMLComments = "/*Multiline comment \n Yeah really " + "{\n"
                + " functionName1: function(args1, args2) {" + "var str = 'do Nothing'; \n" + "}," + "}";
        try {
            parseAndRetrieve(inCompleteMLComments);
            fail("Should have raised an End of stream exception when trying to parse JSOn with incomplete comments.");
        } catch (JsonStreamParseException expected) {
            assertTrue(expected.getMessage().contains("Unclosed comment"));
        }

        String invalidMLComments = "/* */ */ " + "{\n" + " functionName1: function(args1, args2) {"
                + "var str = 'do Nothing'; \n" + "}," + "}";
        try {
            parseAndRetrieve(invalidMLComments);
            fail("Should have raised a parse exception when trying to parse JSON with stray comment-close.");
        } catch (JsonStreamParseException expected) {
            assertTrue(expected.getMessage().contains("Illegal '*' token"));
        }

    }

    /**
     * Tests cases of illegal input, which historically were "successfully" parsed because of quirks in the comment
     * parsing.
     */
    public void testBadParseSlashAndStar() throws Exception {
        String invalidSymbols = "{\n" + "  / foo: 3,\n" + "}";
        try {
            parseAndRetrieve(invalidSymbols);
            fail("Should have failed to parse a standalone '/' in object");
        } catch (JsonStreamParseException expected) {
            // that's what we want.
        }

        invalidSymbols = "{ *\n" + "  foo: 3,\n" + "}";
        try {
            parseAndRetrieve(invalidSymbols);
            fail("Should have failed to parse a standalone '*' in object");
        } catch (JsonStreamParseException expected) {
            // that's what we want.
        }

        invalidSymbols = "/ {\n" + "  foo: 3,\n" + "}";
        try {
            parseAndRetrieve(invalidSymbols);
            fail("Should have failed to parse a standalone '/'");
        } catch (JsonStreamParseException expected) {
            // that's what we want.
        }

        invalidSymbols = "* {\n" + "  foo: 3,\n" + "}";
        try {
            parseAndRetrieve(invalidSymbols);
            fail("Should have failed to parse a standalone '*'");
        } catch (JsonStreamParseException expected) {
            // that's what we want.
        }

        // This test actually parses, because we DON'T check function
        // bodies for correctness (only the outside text).
        invalidSymbols = "{\n" + "  foo: function(a) { / return a; },\n" + "}";
        parseAndRetrieve(invalidSymbols);
    }

    /**
     * Tests cases of string values which could confuse parsing.
     */
    public void testAnnoyingStrings() throws Exception {
        String jsonString = "{\n" + "  foo: \"unterminated string,\n" + "  bar: \'unterminated string,\n" + "}";
        try {
            parseAndRetrieve(jsonString);
            fail("Should have failed to parse an unterminated string");
        } catch (JsonStreamParseException expected) {
            assertTrue(expected.getMessage().contains("Unterminated string"));
        }

        // For all the rest of these tests, the input is chosen such that any
        // errors should result in exceptions being thrown, so there is little
        // to assert for validation. Just check we don't explode when parsing.
        jsonString = "{\n" + "  foo: \"non-signifying brace: }\",\n" + "  bar: 'non-signifying brace: }',\n" + "}";
        parseAndRetrieve(jsonString);

        jsonString = "{\n" + "  foo: \"nested ', or * would cause parse error\",\n"
                + "  bar: 'nested \", or * would cause parse error',\n" + "}";
        parseAndRetrieve(jsonString);

        // Strings in function bodies retain escapers, outside do not, so test both here & below:
        jsonString = "{\n" + "  foo: \"non-signifying quote \\\", or * would cause parse error\",\n"
                + "  bar: 'non-signifying quote \\', or * would cause parse error',\n"
                + "  baz: function() { return \"non-signifying quote \\\", or * would cause parse error\"; },\n"
                + "  qux: function() { return 'non-signifying quote \\', or * would cause parse error'; },\n" + "}";
        parseAndRetrieve(jsonString);

        jsonString = "{\n" + "  foo: \"SIGNIFYING quote \\\\\",\n" + "  foo2: \" or * would cause parse error\",\n"
                + "  bar: 'SIGNIFYING quote \\\\',\n" + "  bar2: ' or * would cause parse error',\n"
                + "  baz: function() { return \"SIGNIFYING quote \\\\\",\n"
                + "                    + \" or parse error 'opening' here:\"; },\n"
                + "  qux: function() { return 'SIGNIFYING quote \\\\',\n"
                + "                    + ' or parse error here:'; },\n" + "}";
        parseAndRetrieve(jsonString);
    }

    /**
     * A convenience method to verify the functioning of JsonStreamReader. All this method does is accepts a String,
     * creates a stream with this and creates a JsonStreamReader object to accept this stream.
     *
     * @param s
     *            Json String
     * @return
     */
    private Object parseAndRetrieve(String s) throws IOException {
        jsonStreamReader = new JsonStreamReader(s);
        try {
            jsonStreamReader.next();
            Object temp = jsonStreamReader.getValue();
            return temp;
        } finally {
            jsonStreamReader.close();

        }
    }

    /**
     * Ensures that down-the-middle JSON+binary works properly
     */
    public void testJsonPlusBinary() throws Exception {

        // Create our test data, which has several binary streams in it
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        baos.write("[{'freddy':'versus','json':'the-movie','my-binary䷴':`".getBytes(Charsets.UTF_8));
        final byte[] stream1bytes = new byte[32];
        new DataOutputStream(baos).writeLong(stream1bytes.length);
        for (int i = 0; i < stream1bytes.length; i++) {
            stream1bytes[i] = (byte)i;
        }
        baos.write(stream1bytes);
        baos.write("`},`".getBytes(Charsets.UTF_8));
        final byte[] stream2bytes = new byte[7];
        new DataOutputStream(baos).writeLong(stream2bytes.length);
        for (int i = 0; i < stream2bytes.length; i++) {
            stream2bytes[i] = (byte)(255 - i);
        }
        baos.write(stream2bytes);
        baos.write("`,{'䷓hello':'world'},`".getBytes(Charsets.UTF_8));
        new DataOutputStream(baos).writeLong(0);
        baos.write("`,'meowДth']".getBytes(Charsets.UTF_8));

        // Read this back using a JsonStreamReader. It's Freddy versus JSON. Or is it JSON X -- Evil gets an upgrade?
        final InputStream in = new ByteArrayInputStream(baos.toByteArray());
        final JsonStreamReader reader = new JsonStreamReader(in);
        assertEquals(JsonConstant.ARRAY_START, reader.next());
        assertEquals(JsonConstant.OBJECT_START, reader.next());
        assertEquals(JsonConstant.STRING, reader.next());
        assertEquals("freddy", reader.getValue());
        assertEquals(JsonConstant.OBJECT_SEPARATOR, reader.next());
        assertEquals(JsonConstant.STRING, reader.next());
        assertEquals("versus", reader.getValue());
        assertEquals(JsonConstant.ENTRY_SEPARATOR, reader.next());
        assertEquals(JsonConstant.STRING, reader.next());
        assertEquals("json", reader.getValue());
        assertEquals(JsonConstant.OBJECT_SEPARATOR, reader.next());
        assertEquals(JsonConstant.STRING, reader.next());
        assertEquals("the-movie", reader.getValue());
        assertEquals(JsonConstant.ENTRY_SEPARATOR, reader.next());
        assertEquals(JsonConstant.STRING, reader.next());
        assertEquals("my-binary䷴", reader.getValue());
        assertEquals(JsonConstant.OBJECT_SEPARATOR, reader.next());
        assertEquals(JsonConstant.BINARY_STREAM, reader.next());
        final ByteArrayOutputStream outputStream = new ByteArrayOutputStream(32);
        IOUtil.copyStream(reader.getBinaryStream(), outputStream);
        assertTrue(Arrays.equals(stream1bytes, outputStream.toByteArray()));
        assertEquals(JsonConstant.OBJECT_END, reader.next());
        assertEquals(JsonConstant.ENTRY_SEPARATOR, reader.next());
        assertEquals(JsonConstant.BINARY_STREAM, reader.next());
        outputStream.reset();
        IOUtil.copyStream(reader.getBinaryStream(), outputStream);
        assertTrue(Arrays.equals(stream2bytes, outputStream.toByteArray()));
        assertEquals(JsonConstant.ENTRY_SEPARATOR, reader.next());
        assertEquals(JsonConstant.OBJECT_START, reader.next());
        assertEquals(JsonConstant.STRING, reader.next());
        assertEquals("䷓hello", reader.getValue());
        assertEquals(JsonConstant.OBJECT_SEPARATOR, reader.next());
        assertEquals(JsonConstant.STRING, reader.next());
        assertEquals("world", reader.getValue());
        assertEquals(JsonConstant.OBJECT_END, reader.next());
        assertEquals(JsonConstant.ENTRY_SEPARATOR, reader.next());
        assertEquals(JsonConstant.BINARY_STREAM, reader.next());
        outputStream.reset();
        IOUtil.copyStream(reader.getBinaryStream(), outputStream);
        assertEquals(0, outputStream.toByteArray().length);
        assertEquals(JsonConstant.ENTRY_SEPARATOR, reader.next());
        assertEquals(JsonConstant.STRING, reader.next());
        assertEquals("meowДth", reader.getValue());
        assertEquals(JsonConstant.ARRAY_END, reader.next());
        assertEquals(JsonConstant.WHITESPACE, reader.next());
        assertEquals(-1, in.read());
    }

    public void testDisableLengthLimitsBecauseIAmStreamingAndMyMemoryUseIsNotProportionalToTheStreamLength()
            throws Exception {

        // Try it with a nonstreaming reader
        JsonStreamReader reader = new JsonStreamReader("['hello, world']");

        // Try it with a streaming reader
        reader = new JsonStreamReader(new ByteArrayInputStream("['hello, world']".getBytes(Charsets.UTF_8)));
        reader.disableLengthLimitsBecauseIAmStreamingAndMyMemoryUseIsNotProportionalToTheStreamLength();
    }
}
