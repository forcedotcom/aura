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
package org.auraframework.util.json;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;
import org.auraframework.util.AuraTextUtil.JSONEscapedFunctionStringBuilder;
import org.auraframework.util.Utf8InputStreamReader;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

/**
 * Test utilities in {@link JsonEncoder}.
 */
public class JsonTest extends UnitTestCase {

    @Test
    public void testSerializeNumbers() throws IOException {
        byte b = 127;
        short s = 32767;
        assertEquals("127", JsonEncoder.serialize(b));
        assertEquals("32767", JsonEncoder.serialize(s));
        assertEquals("123", JsonEncoder.serialize(123));
        assertEquals("123", JsonEncoder.serialize(123L));
        assertEquals("123.456", JsonEncoder.serialize(123.456f));
        assertEquals("123.456", JsonEncoder.serialize(123.456));
        assertEquals("-123.456", JsonEncoder.serialize(-123.456d));
        assertEquals("1.2E21", JsonEncoder.serialize(12e20));
        assertEquals("1.2E20", JsonEncoder.serialize(1.2E+20));
        assertEquals("-1.2E-20", JsonEncoder.serialize(-1.2E-20));
    }

    @Test
    public void testSerializeCharacters() throws IOException {
        assertEquals("\"a\"", JsonEncoder.serialize('a'));
        assertEquals("\"\\n\"", JsonEncoder.serialize('\n'));
        // JSON spec does not require these chars to be encoded, and we don't.
        // assertEquals("\"\\t\"",Json.serialize('\t'));
        assertEquals("\"\\\\\"", JsonEncoder.serialize('\\'));
        // assertEquals("\"\\b\"",Json.serialize('\b'));
        // assertEquals("\"\\f\"",Json.serialize('\f'));
        assertEquals("\"\\r\"", JsonEncoder.serialize('\r'));
        assertEquals("\"\\\"\"", JsonEncoder.serialize('\"'));
        assertEquals("\"\\\"\"", JsonEncoder.serialize('"'));
        // assertEquals("\"\\/\"", Json.serialize('/'));
        assertEquals("\"ë\"", JsonEncoder.serialize('ë'));
        assertEquals("\"分\"", JsonEncoder.serialize('分')); // Chinese
        assertEquals("\"本\"", JsonEncoder.serialize('本')); // Japanese
        assertEquals("\"조\"", JsonEncoder.serialize('조')); // Korean
        assertEquals("\"ᄑ\"", JsonEncoder.serialize('\u1111'));
        assertEquals("\"\u2111\"", JsonEncoder.serialize('\u2111'));
        assertEquals("0", JsonEncoder.serialize(0x00));
    }

    @Test
    public void testSerializeBoolean() throws IOException {
        assertEquals("true", JsonEncoder.serialize(true));
        assertEquals("false", JsonEncoder.serialize(false));
    }

    @Test
    public void testSerializeStrings() throws IOException {
        assertEquals("null", JsonEncoder.serialize((String) null));
        assertEquals("\"\"", JsonEncoder.serialize(""));
        assertEquals("\"test\"", JsonEncoder.serialize("test"));
        assertEquals("\"    ! @#$%^&*()_+-=|}{[]:;?.,`~\"", JsonEncoder.serialize("    ! @#$%^&*()_+-=|}{[]:;?.,`~"));
        // Japanese, Chinese, Korean
        assertEquals("\"速い茶色のキツネは怠け者の犬を跳び越えました。 福克斯布朗的快速跳过懒狗。 위를 건너뛰었습니다. 게으르고 개 \"",
                JsonEncoder.serialize("速い茶色のキツネは怠け者の犬を跳び越えました。 福克斯布朗的快速跳过懒狗。 위를 건너뛰었습니다. 게으르고 개 "));
        // Russian, German, Hebrew
        assertEquals(
                "\"Быстрый Браун Фокс выросло за ленивый собака. Die schnelle Braun Fuchs sprang über den faulen Hund. השועל החום המהיר קפץ מעל הכלב העצלן.\"",
                JsonEncoder.serialize("Быстрый Браун Фокс выросло за ленивый собака. Die schnelle Braun Fuchs sprang über den faulen Hund. השועל החום המהיר קפץ מעל הכלב העצלן."));
    }

    @Test
    public void testSerializeArray() throws IOException {
        String[] s = new String[2];
        assertEquals("[]", JsonEncoder.serialize(s));
        s[0] = "test1";
        assertEquals("[\"test1\"]", JsonEncoder.serialize(s));
        s[1] = "test2";
        assertEquals("[\"test1\",\"test2\"]", JsonEncoder.serialize(s));
        assertEquals("[\n  \"test1\",\n  \"test2\"\n]", JsonEncoder.serialize(s, true));
    }

    @Test
    public void testSerializeMap() throws IOException {
        Map<Object, Object> m = new LinkedHashMap<>(2);
        assertEquals("{}", JsonEncoder.serialize(m));
        m.put("key1", "val1");
        assertEquals("{\"key1\":\"val1\"}", JsonEncoder.serialize(m));
        m.put("key2", "val2");
        assertEquals("{\"key1\":\"val1\",\"key2\":\"val2\"}", JsonEncoder.serialize(m));
        assertEquals("{\n  \"key1\":\"val1\",\n  \"key2\":\"val2\"\n}", JsonEncoder.serialize(m, true));

        Map<String, Object> stringMap = new LinkedHashMap<>(2);
        stringMap.put("stringKey", "stringValue");
        assertEquals("{\"stringKey\":\"stringValue\"}", JsonEncoder.serialize(stringMap));
    }

    @Test
    public void testSerializeCollection() throws IOException {
        Collection<Object> c = new ArrayList<>();
        assertEquals("[]", JsonEncoder.serialize(c));
        c.add("val1");
        assertEquals("[\"val1\"]", JsonEncoder.serialize(c));
        c.add("val2");
        assertEquals("[\"val1\",\"val2\"]", JsonEncoder.serialize(c));
        assertEquals("[\n  \"val1\",\n  \"val2\"\n]", JsonEncoder.serialize(c, true));
    }

    @Test
    public void testSerializeComplexObject() throws IOException {
        Map<Object, Object> m = new LinkedHashMap<>(1);
        Map<Object, Object> m2 = new LinkedHashMap<>(1);
        String[] s = { "string1", "string2" };
        m2.put("key2", s);
        Collection<Object> c = new ArrayList<>();
        Collection<Object> c2 = new ArrayList<>();
        c.add(s);
        c.add(true);
        c.add(10);
        c.add(c2);
        c2.add(false);
        c2.add(1.5);
        c2.add(m2);
        m.put("key1", c);
        assertEquals("{\"key1\":[[\"string1\",\"string2\"],true,10,[false,1.5,{\"key2\":[\"string1\",\"string2\"]}]]}",
                JsonEncoder.serialize(m));
    }

    @Test
    public void testWriteMapBegin() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
        json.writeMapBegin();
        assertEquals("{", json.getAppendable().toString());
        json = new JsonEncoder(new StringBuilder(), true);
        json.writeMapBegin();
        assertEquals("{\n", json.getAppendable().toString());
    }

    private static class NoSerializerClass { public NoSerializerClass() { } };

    private static class NoSerializerContext extends DefaultJsonSerializationContext {
        public NoSerializerContext() {
            super(false, false);
        }

        @Override
        public JsonSerializer<Object> getSerializer(Object o) {
            if (o instanceof NoSerializerClass) {
                return null;
            }
            return super.getSerializer(o);
        }
    }

    @Test
    public void testWriteValueNoSerializer() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), null, new NoSerializerContext());
        try {
            json.writeValue(new NoSerializerClass());
            fail("should throw exception");
        } catch (JsonSerializerNotFoundException jse) {
            assertTrue(jse.getMessage().contains("NoSerializerClass"));
        }
    }

    @Test
    public void testWriteKeyNoSerializer() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), null, new NoSerializerContext());
        json.writeMapBegin();
        try {
            json.writeMapKey(new NoSerializerClass());
            fail("should throw exception");
        } catch (JsonSerializerNotFoundException jse) {
            assertTrue(jse.getMessage().contains("NoSerializerClass"));
        }
    }

    @Test
    public void testWriteMapEnd() throws IOException {
        try {
            JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
            json.writeMapEnd();
            fail("Should throw exception");
        } catch (JsonEncoder.JsonException e) {
        }

        try {
            JsonEncoder json = new JsonEncoder(new StringBuilder(), true);
            json.writeMapEnd();
            fail("Should throw exception");
        } catch (JsonEncoder.JsonException e) {
        }

        StringBuilder sb = new StringBuilder();
        JsonEncoder json = new JsonEncoder(sb, false);
        json.writeMapBegin();
        sb.delete(0, sb.length());
        json.writeMapEnd();
        assertEquals("}", sb.toString());

        sb.delete(0, sb.length());
        json = new JsonEncoder(sb, true);
        json.writeMapBegin();
        sb.delete(0, sb.length());
        json.writeMapEnd();
        assertEquals("\n}", json.getAppendable().toString());
    }

    @Test
    public void testWriteArrayBegin() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
        json.writeArrayBegin();
        assertEquals("[", json.getAppendable().toString());
        json = new JsonEncoder(new StringBuilder(), true);
        json.writeArrayBegin();
        assertEquals("[\n", json.getAppendable().toString());
    }

    @Test
    public void testWriteArrayEnd() throws IOException {
        try {
            JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
            json.writeArrayEnd();
            fail("Should throw exception");
        } catch (JsonEncoder.JsonException e) {
        }

        try {
            JsonEncoder json = new JsonEncoder(new StringBuilder(), true);
            json.writeArrayEnd();
            fail("Should throw exception");
        } catch (JsonEncoder.JsonException e) {
        }

        StringBuilder sb = new StringBuilder();
        JsonEncoder json = new JsonEncoder(sb, false);
        json.writeArrayBegin();
        sb.delete(0, sb.length());
        json.writeArrayEnd();
        assertEquals("]", sb.toString());

        sb.delete(0, sb.length());
        json = new JsonEncoder(sb, true);
        json.writeArrayBegin();
        sb.delete(0, sb.length());
        json.writeArrayEnd();
        assertEquals("\n]", json.getAppendable().toString());
    }

    @Test
    public void testMismatchStartEnd() throws Exception {
        try {
            JsonEncoder json = new JsonEncoder(new StringBuilder(), true);
            json.writeArrayBegin();
            json.writeMapEnd();
            fail("Should throw exception");
        } catch (JsonEncoder.JsonException e) {
        }

        try {
            JsonEncoder json = new JsonEncoder(new StringBuilder(), true);
            json.writeMapBegin();
            json.writeArrayEnd();
            fail("Should throw exception");
        } catch (JsonEncoder.JsonException e) {
        }
    }

    @Test
    public void testWriteComma() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), true);
        try {
            json.writeComma();
            fail("Should throw exception");
        } catch (JsonEncoder.JsonException expected) {
            assertEquals("writeComma with no writeArrayBegin or writeMapBegin", expected.getMessage());
        }

        try {
            json.pushIndent(JsonEncoder.IndentType.COMMENT);
            json.writeComma();
            fail("Should throw exception");
        } catch (JsonEncoder.JsonException expected) {
            assertEquals("Cannot use separator on COMMENT", expected.getMessage());
        }
    }

    @Test
    public void testWriteLiteral() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
        json.writeLiteral(5);
        assertEquals("5", json.getAppendable().toString());
    }

    @Test
    public void testWriteString() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
        json.writeString("test");
        assertEquals("\"test\"", json.getAppendable().toString());

        json = new JsonEncoder(new JSONEscapedFunctionStringBuilder(new StringBuilder()), false);
        json.writeString("<!--\f div */>\u0000\u2028");
        assertEquals("HTML markup should be escaped for JSON format.", "\"<!--\\f div \\u002A/>\\n\"",
                json.getAppendable().toString());

        json = new JsonEncoder(new StringBuilder(), false);
        json.writeString("<!--\f div */>\u0000\u2028");
        assertEquals("HTML markup should be escaped for JSON format.", "\"<!--\\f div */>\\n\"",
                json.getAppendable().toString());
    }

    @Test
    public void testWriteArrayEntry() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
        json.writeArrayBegin();
        json.writeArrayEntry("test");
        json.writeArrayEnd();
        assertEquals("[\"test\"]", json.getAppendable().toString());

        json = new JsonEncoder(new StringBuilder(), false);
        json.writeArrayBegin();
        json.writeArrayEntry("test1");
        json.writeArrayEntry("test2");
        json.writeArrayEnd();
        assertEquals("[\"test1\",\"test2\"]", json.getAppendable().toString());

        json = new JsonEncoder(new StringBuilder(), true);
        json.writeArrayBegin();
        json.writeArrayEntry("test1");
        json.writeArrayEntry("test2");
        json.writeArrayEnd();
        assertEquals("[\n  \"test1\",\n  \"test2\"\n]", json.getAppendable().toString());
    }

    @Test
    public void testWriteMapEntry() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
        json.writeMapBegin();
        json.writeMapEntry("key", "value");
        json.writeMapEnd();
        assertEquals("{\"key\":\"value\"}", json.getAppendable().toString());

        json = new JsonEncoder(new StringBuilder(), false);
        json.writeMapBegin();
        json.writeMapEntry("key1", "value1");
        json.writeMapEntry("key2", "value2");
        json.writeMapEnd();
        assertEquals("{\"key1\":\"value1\",\"key2\":\"value2\"}", json.getAppendable().toString());

        json = new JsonEncoder(new StringBuilder(), true);
        json.writeMapBegin();
        json.writeMapEntry("key1", "value1");
        json.writeMapEntry("key2", "value2");
        json.writeMapEnd();
        assertEquals("{\n  \"key1\":\"value1\",\n  \"key2\":\"value2\"\n}", json.getAppendable().toString());

        json = new JsonEncoder(new StringBuilder(), false);
        json.writeMapBegin();
        json.writeMapEntry(1, "value1");
        json.writeMapEntry(2, "value2");
        json.writeMapEnd();
        assertEquals("{\"1\":\"value1\",\"2\":\"value2\"}", json.getAppendable().toString());
    }

    @Test
    public void testWriteMapEntryTyped() throws IOException {
        List<String> list = new ArrayList<>(2);
        list.add("item1");
        list.add("item2");
        JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
        json.writeMapBegin();
        json.writeMapEntry("key", list);
        json.writeMapEnd();
        assertEquals("{\"key\":[\"item1\",\"item2\"]}", json.getAppendable().toString());

        json = new JsonEncoder(new StringBuilder(), false);
        json.writeMapBegin();
        json.writeMapEntry("key", null, "java://java.util.List");
        json.writeMapEnd();
        assertEquals("{\"key\":[]}", json.getAppendable().toString());

        Map<String,Integer> map = new TreeMap<>();
        map.put("item1", 1);
        map.put("item2", 2);
        json = new JsonEncoder(new StringBuilder(), false);
        json.writeMapBegin();
        json.writeMapEntry("map1", map);
        json.writeMapEntry("map2", null, "java://java.util.Map");
        json.writeMapEnd();
        assertEquals("{\"map1\":{\"item1\":1,\"item2\":2},\"map2\":{}}", json.getAppendable().toString());
    }

    @Test
    public void testWriteMapKey() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), false);
        json.writeMapBegin();
        json.writeMapKey("key");
        json.writeMapEnd();
        assertEquals("{\"key\":}", json.getAppendable().toString());

        json = new JsonEncoder(new StringBuilder(), false);
        json.writeMapBegin();
        json.writeMapKey("key1");
        json.writeMapKey("key2");
        json.writeMapEnd();
        assertEquals("{\"key1\":,\"key2\":}", json.getAppendable().toString());

        json = new JsonEncoder(new StringBuilder(), true);
        json.writeMapBegin();
        json.writeMapKey("key1");
        json.writeMapKey("key2");
        json.writeMapEnd();
        assertEquals("{\n  \"key1\":,\n  \"key2\":\n}", json.getAppendable().toString());
    }

    /**
     * Ensures that a down-the-middle binary stream case works properly
     */
    @Test
    public void testBinaryStream() throws Exception {

        // Write out a JSON+binary stream
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false);
        json.writeMapBegin();
        json.writeMapKey("header");
        final String[] columns = new String[] { "guid䷴", "id", "blob" };
        json.writeArray(columns);
        json.writeMapKey("rows");
        json.writeArrayBegin();
        json.writeComma(); // needs to be called before each array entry.
        // writeArrayEntry does this for us later
        json.writeArrayBegin();
        final String testChars = "𥝱𥞩𥞴𥞴𥝱𥝱𠵅🁛🀦𐌸𐍄７辶헪ȦE§קஇ𥞴";
        json.writeArrayEntry(testChars);
        final String id1 = "00DxCatsAreCool";
        json.writeArrayEntry(id1);
        json.writeComma();
        OutputStream out = json.writeBinaryStreamBegin(37);
        for (int i = 0; i < 37; i++) {
            out.write(i);
        }
        out.close();
        json.writeBinaryStreamEnd();
        json.writeArrayEnd();
        json.writeComma();
        json.writeArrayBegin();
        final String uuid = UUID.randomUUID().toString();
        json.writeArrayEntry(uuid);
        final String id2 = "00AxCatsMeowToo";
        json.writeArrayEntry(id2);
        json.writeComma();
        out = json.writeBinaryStreamBegin(7);
        for (int i = 0; i < 7; i++) {
            out.write(255 - i);
        }
        out.close();
        json.writeBinaryStreamEnd();
        json.writeArrayEnd();
        json.writeArrayEnd();
        json.writeMapEnd();
        json.close();

        // Compare this against our expectations
        final DataInputStream in = new DataInputStream(new ByteArrayInputStream(baos.toByteArray()));
        final Reader reader = new Utf8InputStreamReader(in);
        final char[] chars = new char[88];
        assertNextStringFromReader(reader, "{\"header\":[", chars);
        for (int i = 0; i < columns.length; i++) {
            assertNextStringFromReader(reader, "\"" + columns[i] + "\"", chars);
            if (i < columns.length - 1) {
                assertEquals(',', (char) reader.read());
            }
        }
        assertNextStringFromReader(reader, "],\"rows\":[[\"", chars);
        assertNextStringFromReader(reader, testChars, chars);
        assertNextStringFromReader(reader, "\",\"", chars);
        assertNextStringFromReader(reader, id1, chars);
        assertNextStringFromReader(reader, "\",`", chars);
        assertEquals(37, in.readLong());
        for (int i = 0; i < 37; i++) {
            assertEquals(i, in.read());
        }
        assertNextStringFromReader(reader, "`],[\"", chars);
        assertNextStringFromReader(reader, uuid, chars);
        assertNextStringFromReader(reader, "\",\"", chars);
        assertNextStringFromReader(reader, id2, chars);
        assertNextStringFromReader(reader, "\",`", chars);
        assertEquals(7, in.readLong());
        for (int i = 0; i < 7; i++) {
            assertEquals(255 - i, in.read());
        }
        assertNextStringFromReader(reader, "`]]}", chars);
        assertEquals(-1, reader.read());
        assertEquals(-1, in.read());
    }

    private void assertNextStringFromReader(Reader reader, String str, char[] buffer) throws IOException {

        // We just do one read(), since the underlying ByteArrayInputStream
        // always has bytes available (and I'm slightly lazy)
        assertEquals("Did not read the number of bytes expected", str.length(), reader.read(buffer, 0, str.length()));
        assertEquals(str, String.valueOf(buffer, 0, str.length()));
    }

    /**
     * Ensures that trying to stream on an unsupported scenario fails
     */
    @Test
    public void testBinaryStreamOnAppendable() throws Exception {
        final StringBuilder str = new StringBuilder(1);
        final JsonEncoder json = new JsonEncoder(str, false);
        try {
            json.writeBinaryStreamBegin(1);
            fail("should have failed");
        } catch (IllegalStateException e) {
            assertTrue(e.getMessage().contains("Binary streams are supported only when"));
        }
    }

    @Test
    public void testBinaryStreamEndBeforeBegin() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false);
        try {
            json.writeBinaryStreamEnd();
            fail();
        } catch (IllegalStateException e) {
            assertTrue(e.getMessage().contains("Binary stream was not started"));
        }
    }

    @Test
    public void testBinaryStreamTooShort() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false);
        final OutputStream out = json.writeBinaryStreamBegin(2);
        out.write(new byte[1]);
        try {
            json.writeBinaryStreamEnd();
            fail();
        } catch (IllegalStateException e) {
            assertTrue(e.getMessage().contains("Length of the binary stream was written"));
        }
    }

    @Test
    public void testBinaryStreamTooLong() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false);
        final OutputStream out = json.writeBinaryStreamBegin(1);
        out.write(new byte[2]);
        try {
            json.writeBinaryStreamEnd();
            fail();
        } catch (IllegalStateException e) {
            assertTrue(e.getMessage().contains("Length of the binary stream was written"));
        }
    }

    /**
     * Ensures that it's not possible to put a binary stream within a binary
     * stream
     */
    @Test
    public void testBinaryStreamWithinBinaryStream() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false);
        json.writeBinaryStreamBegin(5);
        try {
            json.writeBinaryStreamBegin(1);
            fail();
        } catch (IllegalStateException e) {
            assertTrue(e.getMessage().contains("Previous binary stream was not ended"));
        }
    }

    @Test
    public void testBinaryStreamOfSizeZero() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false);
        json.writeBinaryStreamBegin(0);
        json.writeBinaryStreamEnd();
        json.close();

        // Check what was written
        final DataInputStream in = new DataInputStream(new ByteArrayInputStream(baos.toByteArray()));
        final Reader reader = new Utf8InputStreamReader(in);
        try {
            assertEquals('`', reader.read());
            assertEquals(0, in.readLong());
            assertEquals('`', reader.read());
            assertEquals(-1, reader.read());
        } finally {
            reader.close();
        }
    }

    @Test
    public void testNullValuesInMapsWithJsonStream() throws Exception {
        final Map<String, Object> map = new LinkedHashMap<>(8);
        map.put("cats", null);
        map.put("dogs", "bark");
        map.put("birds", "chirp");
        map.put("bacteria", null);

        // Try it with null values disabled
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false);
        json.writeMap(map);
        json.close();
        assertEquals("{\"dogs\":\"bark\",\"birds\":\"chirp\"}", new String(baos.toByteArray(), Charsets.UTF_8));

        // Try it with null values enabled
        baos.reset();
        json = JsonEncoder.createJsonStream(baos, false, true);
        json.writeMap(map);
        json.close();
        assertEquals("{\"cats\":null,\"dogs\":\"bark\",\"birds\":\"chirp\",\"bacteria\":null}",
                new String(baos.toByteArray(), Charsets.UTF_8));
    }

    @Test
    public void testNullValuesInArraysWithJsonStream() throws Exception {
        final List<String> list = Lists.newArrayList(null, "cats", "dogs", null, "bacteria");

        // Try it with null values disabled
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false);
        json.writeArray(list);
        json.close();
        assertEquals("[\"cats\",\"dogs\",\"bacteria\"]", new String(baos.toByteArray(), Charsets.UTF_8));

        // Try it with null values enabled
        baos.reset();
        json = JsonEncoder.createJsonStream(baos, false, true);
        json.writeArray(list);
        json.close();
        assertEquals("[null,\"cats\",\"dogs\",null,\"bacteria\"]", new String(baos.toByteArray(), Charsets.UTF_8));
    }

    private class SendNullObject implements JsonSerializable {
        public SendNullObject(String v1, String v3) {
            this.v1 = v1;
            this.v3 = v3;
        }

        @Override
        public void serialize(Json json) throws IOException {
            boolean oldV = json.getSerializationContext().setNullValueEnabled(true);
            try {
                json.writeMapBegin();
                json.writeMapEntry("v1", v1);
                json.writeMapEntry("v2", v2);
                json.writeMapEntry("v3", v3);
                json.writeMapEnd();
            } finally {
                json.getSerializationContext().setNullValueEnabled(oldV);
            }
        }

        private final String v1;
        private final String v2 = null;
        private final String v3;
    }

    /**
     * Ensure that encoding is is correct while encoding the nullable object.
     */
    @Test
    public void testSerializeSimpleWithNulls() throws IOException {
        SendNullObject sno = new SendNullObject("a", "b");
        assertEquals("{\"v1\":\"a\",\"v2\":null,\"v3\":\"b\"}", JsonEncoder.serialize(sno));


    }

    /**
     * Ensure that encoding is restored to normal after encoding the nullable object.
     */
    @Test
    public void testSerializeComplexWithNulls() throws IOException {
        Map<Object, Object> m = new LinkedHashMap<>(1);
        m.put("v", "c");
        m.put("w", null);
        m.put("x", new SendNullObject("a", "b"));
        m.put("y", null);
        m.put("z", "d");
        assertEquals("{\"v\":\"c\",\"x\":{\"v1\":\"a\",\"v2\":null,\"v3\":\"b\"},\"z\":\"d\"}", JsonEncoder.serialize(m));
    }

    // we have two ways to output null in serialization, one is
    // setNullValueEnabled with SerializationContext, another
    //one is set it when createJsonStream. This test mix them together, and verify it works.
    @Test
    public void testSerializeComplexWithNullsWithJsonStreamAndSetNullValueEnabled() throws IOException {
        Map<Object, Object> m = new LinkedHashMap<>(1);
        m.put("v", "c");
        m.put("w", null);
        m.put("x", new SendNullObject("a", "b"));
        m.put("y", null);
        m.put("z", "d");
        String expect = "{\"v\":\"c\",\"w\":null,\"x\":{\"v1\":\"a\",\"v2\":null,\"v3\":\"b\"},\"y\":null,\"z\":\"d\"}";
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);

        //test with Json Stream that output null
        JsonEncoder json = JsonEncoder.createJsonStream(baos, false, true);
        json.writeMap(m);
        json.close();
        assertEquals("fail with Json Stream output null", expect, new String(baos.toByteArray(), Charsets.UTF_8));

        //test with Json Stream that skip null
        String expect2 = "{\"v\":\"c\",\"x\":{\"v1\":\"a\",\"v2\":null,\"v3\":\"b\"},\"z\":\"d\"}";
        baos.reset();
        JsonEncoder jsonSkipNull = JsonEncoder.createJsonStream(baos, false, false);
        jsonSkipNull.writeMap(m);
        jsonSkipNull.close();
        assertEquals("fail with Json Stream Skip null", expect2, new String(baos.toByteArray(), Charsets.UTF_8) );
    }

    @Test
    public void testNestedStartStopCapturing() throws IOException {
        JsonEncoder json = new JsonEncoder(new StringBuilder(), new NoSerializerContext());

        json.startCapturing();
        json.writeMapBegin();

        json.startCapturing();
        json.writeMapEntry("k", "v");
        // assert nested start/stop capturing
        assertEquals("\"k\":\"v\"", json.stopCapturing());

        json.writeMapEnd();

        // assert outer start/stop capturing
        assertEquals("{\"k\":\"v\"}", json.stopCapturing());

        // assert overall json
        assertEquals("{\"k\":\"v\"}", json.getAppendable().toString());
    }
}
