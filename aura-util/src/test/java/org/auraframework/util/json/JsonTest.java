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
import java.util.UUID;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.Utf8InputStreamReader;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;

/**
 * Test utilities in {@link Json}.
 */
public class JsonTest extends UnitTestCase {

    public void testSerializeNumbers() throws IOException {
        byte b = 127;
        short s = 32767;
        assertEquals("127", Json.serialize(b));
        assertEquals("32767", Json.serialize(s));
        assertEquals("123", Json.serialize(123));
        assertEquals("123", Json.serialize(123L));
        assertEquals("123.456", Json.serialize(123.456f));
        assertEquals("123.456", Json.serialize(123.456));
        assertEquals("-123.456", Json.serialize(-123.456d));
        assertEquals("1.2E21", Json.serialize(12e20));
        assertEquals("1.2E20", Json.serialize(1.2E+20));
        assertEquals("-1.2E-20", Json.serialize(-1.2E-20));
    }

    public void testSerializeCharacters() throws IOException {
        assertEquals("\"a\"", Json.serialize('a'));
        assertEquals("\"\\n\"", Json.serialize('\n'));
        // JSON spec does not require these chars to be encoded, and we don't.
        // assertEquals("\"\\t\"",Json.serialize('\t'));
        assertEquals("\"\\\\\"", Json.serialize('\\'));
        // assertEquals("\"\\b\"",Json.serialize('\b'));
        // assertEquals("\"\\f\"",Json.serialize('\f'));
        assertEquals("\"\\r\"", Json.serialize('\r'));
        assertEquals("\"\\\"\"", Json.serialize('\"'));
        assertEquals("\"\\\"\"", Json.serialize('"'));
        // assertEquals("\"\\/\"", Json.serialize('/'));
        assertEquals("\"ë\"", Json.serialize('ë'));
        assertEquals("\"分\"", Json.serialize('分')); // Chinese
        assertEquals("\"本\"", Json.serialize('本')); // Japanese
        assertEquals("\"조\"", Json.serialize('조')); // Korean
        assertEquals("\"ᄑ\"", Json.serialize('\u1111'));
        assertEquals("\"\u2111\"", Json.serialize('\u2111'));
        assertEquals("0", Json.serialize(0x00));
    }

    public void testSerializeBoolean() throws IOException {
        assertEquals("true", Json.serialize(true));
        assertEquals("false", Json.serialize(false));
    }

    public void testSerializeStrings() throws IOException {
        assertEquals("null", Json.serialize((String) null));
        assertEquals("\"\"", Json.serialize(""));
        assertEquals("\"test\"", Json.serialize("test"));
        assertEquals("\"    ! @#$%^&*()_+-=|}{[]:;?.,`~\"", Json.serialize("    ! @#$%^&*()_+-=|}{[]:;?.,`~"));
        // Japanese, Chinese, Korean
        assertEquals("\"速い茶色のキツネは怠け者の犬を跳び越えました。 福克斯布朗的快速跳过懒狗。 위를 건너뛰었습니다. 게으르고 개 \"",
                Json.serialize("速い茶色のキツネは怠け者の犬を跳び越えました。 福克斯布朗的快速跳过懒狗。 위를 건너뛰었습니다. 게으르고 개 "));
        // Russian, German, Hebrew
        assertEquals(
                "\"Быстрый Браун Фокс выросло за ленивый собака. Die schnelle Braun Fuchs sprang über den faulen Hund. השועל החום המהיר קפץ מעל הכלב העצלן.\"",
                Json.serialize("Быстрый Браун Фокс выросло за ленивый собака. Die schnelle Braun Fuchs sprang über den faulen Hund. השועל החום המהיר קפץ מעל הכלב העצלן."));
    }

    public void testSerializeArray() throws IOException {
        String[] s = new String[2];
        assertEquals("[]", Json.serialize(s));
        s[0] = "test1";
        assertEquals("[\"test1\"]", Json.serialize(s));
        s[1] = "test2";
        assertEquals("[\"test1\",\"test2\"]", Json.serialize(s));
        assertEquals("[\n  \"test1\",\n  \"test2\"\n]", Json.serialize(s, true, false));
    }

    public void testSerializeMap() throws IOException {
        Map<Object, Object> m = new LinkedHashMap<Object, Object>(2);
        assertEquals("{}", Json.serialize(m));
        m.put("key1", "val1");
        assertEquals("{\"key1\":\"val1\"}", Json.serialize(m));
        m.put("key2", "val2");
        assertEquals("{\"key1\":\"val1\",\"key2\":\"val2\"}", Json.serialize(m));
        assertEquals("{\n  \"key1\":\"val1\",\n  \"key2\":\"val2\"\n}", Json.serialize(m, true, false));

        Map<String, Object> stringMap = new LinkedHashMap<String, Object>(2);
        stringMap.put("stringKey", "stringValue");
        assertEquals("{\"stringKey\":\"stringValue\"}", Json.serialize(stringMap));
    }

    public void testSerializeCollection() throws IOException {
        Collection<Object> c = new ArrayList<Object>();
        assertEquals("[]", Json.serialize(c));
        c.add("val1");
        assertEquals("[\"val1\"]", Json.serialize(c));
        c.add("val2");
        assertEquals("[\"val1\",\"val2\"]", Json.serialize(c));
        assertEquals("[\n  \"val1\",\n  \"val2\"\n]", Json.serialize(c, true, false));
    }

    public void testSerializeComplexObject() throws IOException {
        Map<Object, Object> m = new LinkedHashMap<Object, Object>(1);
        Map<Object, Object> m2 = new LinkedHashMap<Object, Object>(1);
        String[] s = { "string1", "string2" };
        m2.put("key2", s);
        Collection<Object> c = new ArrayList<Object>();
        Collection<Object> c2 = new ArrayList<Object>();
        c.add(s);
        c.add(true);
        c.add(10);
        c.add(c2);
        c2.add(false);
        c2.add(1.5);
        c2.add(m2);
        m.put("key1", c);
        assertEquals("{\"key1\":[[\"string1\",\"string2\"],true,10,[false,1.5,{\"key2\":[\"string1\",\"string2\"]}]]}",
                Json.serialize(m));
    }

    public void testSerializeIdentityReferenceType() throws IOException {
        JsonIdentitySerializableTest obj1 = new JsonIdentitySerializableTest(1);
        JsonIdentitySerializableTest obj2 = new JsonIdentitySerializableTest(1);
        JsonIdentitySerializableTest[] objArray = { obj1, obj1 };
        // Testing with objects that have same memory reference
        assertEquals("[{\"serId\":1,\"value\":\"JsonIdentitySerializableTest serialized string\"},{\"serRefId\":1}]",
                Json.serialize(objArray, false, true));
        JsonIdentitySerializableTest[] objArray2 = { obj1, obj2 };
        // Testing with objects that have same different memory references
        assertEquals(
                "[{\"serId\":1,\"value\":\"JsonIdentitySerializableTest serialized string\"},{\"serId\":2,\"value\":\"JsonIdentitySerializableTest serialized string\"}]",
                Json.serialize(objArray2, false, true));
    }

    public void testSerializeEqualityReferenceType() throws IOException {
        JsonEqualitySerializableTest obj1 = new JsonEqualitySerializableTest(1);
        JsonEqualitySerializableTest obj2 = new JsonEqualitySerializableTest(1);
        JsonEqualitySerializableTest obj3 = new JsonEqualitySerializableTest(2);
        JsonEqualitySerializableTest[] objArray = { obj1, obj2 };
        // Testing when obj1.equals(obj2)
        assertEquals("[{\"serId\":1,\"value\":\"JsonEqualitySerializableTest serialized string\"},{\"serRefId\":1}]",
                Json.serialize(objArray, false, true));
        JsonEqualitySerializableTest[] objArray2 = { obj1, obj3 };
        // Testing when !obj1.equals(obj3)
        assertEquals(
                "[{\"serId\":1,\"value\":\"JsonEqualitySerializableTest serialized string\"},{\"serId\":2,\"value\":\"JsonEqualitySerializableTest serialized string\"}]",
                Json.serialize(objArray2, false, true));
    }

    public void testWriteMapBegin() throws IOException {
        Json json = new Json(new StringBuilder(), false, false);
        json.writeMapBegin();
        assertEquals("{", json.getAppendable().toString());
        json = new Json(new StringBuilder(), true, false);
        json.writeMapBegin();
        assertEquals("{\n", json.getAppendable().toString());
    }

    private static class NoSerializerClass { public NoSerializerClass() { } };

    private static class NoSerializerContext extends DefaultJsonSerializationContext {
        public NoSerializerContext() {
            super(false, false, false);
        }

        @Override
        public JsonSerializer<Object> getSerializer(Object o) {
            if (o instanceof NoSerializerClass) {
                return null;
            }
            return super.getSerializer(o);
        }
    }

    public void testWriteValueNoSerializer() throws IOException {
        Json json = new Json(new StringBuilder(), null, new NoSerializerContext());
        try {
            json.writeValue(new NoSerializerClass());
            fail("should throw exception");
        } catch (JsonSerializerNotFoundException jse) {
            assertTrue(jse.getMessage().contains("NoSerializerClass"));
        }
    }

    public void testWriteKeyNoSerializer() throws IOException {
        Json json = new Json(new StringBuilder(), null, new NoSerializerContext());
        json.writeMapBegin();
        try {
            json.writeMapKey(new NoSerializerClass());
            fail("should throw exception");
        } catch (JsonSerializerNotFoundException jse) {
            assertTrue(jse.getMessage().contains("NoSerializerClass"));
        }
    }

    public void testWriteMapEnd() throws IOException {
        try {
            Json json = new Json(new StringBuilder(), false, false);
            json.writeMapEnd();
            fail("Should throw exception");
        } catch (Json.JsonException e) {
        }

        try {
            Json json = new Json(new StringBuilder(), true, false);
            json.writeMapEnd();
            fail("Should throw exception");
        } catch (Json.JsonException e) {
        }

        StringBuilder sb = new StringBuilder();
        Json json = new Json(sb, false, false);
        json.writeMapBegin();
        sb.delete(0, sb.length());
        json.writeMapEnd();
        assertEquals("}", sb.toString());

        sb.delete(0, sb.length());
        json = new Json(sb, true, false);
        json.writeMapBegin();
        sb.delete(0, sb.length());
        json.writeMapEnd();
        assertEquals("\n}", json.getAppendable().toString());
    }

    public void testWriteArrayBegin() throws IOException {
        Json json = new Json(new StringBuilder(), false, false);
        json.writeArrayBegin();
        assertEquals("[", json.getAppendable().toString());
        json = new Json(new StringBuilder(), true, false);
        json.writeArrayBegin();
        assertEquals("[\n", json.getAppendable().toString());
    }

    public void testWriteArrayEnd() throws IOException {
        try {
            Json json = new Json(new StringBuilder(), false, false);
            json.writeArrayEnd();
            fail("Should throw exception");
        } catch (Json.JsonException e) {
        }

        try {
            Json json = new Json(new StringBuilder(), true, false);
            json.writeArrayEnd();
            fail("Should throw exception");
        } catch (Json.JsonException e) {
        }

        StringBuilder sb = new StringBuilder();
        Json json = new Json(sb, false, false);
        json.writeArrayBegin();
        sb.delete(0, sb.length());
        json.writeArrayEnd();
        assertEquals("]", sb.toString());

        sb.delete(0, sb.length());
        json = new Json(sb, true, false);
        json.writeArrayBegin();
        sb.delete(0, sb.length());
        json.writeArrayEnd();
        assertEquals("\n]", json.getAppendable().toString());
    }

    public void testMismatchStartEnd() throws Exception {
        try {
            Json json = new Json(new StringBuilder(), true, false);
            json.writeArrayBegin();
            json.writeMapEnd();
            fail("Should throw exception");
        } catch (Json.JsonException e) {
        }

        try {
            Json json = new Json(new StringBuilder(), true, false);
            json.writeMapBegin();
            json.writeArrayEnd();
            fail("Should throw exception");
        } catch (Json.JsonException e) {
        }

        try {
            Json json = new Json(new StringBuilder(), true, false);
            json.writeCommentBegin();
            json.writeArrayEnd();
            fail("Should throw exception");
        } catch (Json.JsonException e) {
        }
    }

    public void testCommentBody() throws Exception {
        Json json = new Json(new StringBuilder(), false, false);

        try {
            json.writeCommentBody("hi");
            fail("Should throw exception");
        } catch (Json.JsonException expected) {
            assertEquals("Json.writeCommentBody must be preceded by Json.writeCommentBegin", expected.getMessage());
        }

        json.writeCommentBegin();
        json.writeCommentBody("hi");
        json.writeCommentEnd();
        assertEquals("", json.getAppendable().toString());

        try {
            json.writeArrayBegin();
            json.writeCommentBody("hi");
            fail("Should throw exception");
        } catch (Json.JsonException expected) {
            assertEquals("Json.writeCommentBody must be preceded by Json.writeCommentBegin", expected.getMessage());
        }

        json = new Json(new StringBuilder(), true, false);
        json.writeCommentBegin();
        json.writeCommentBody("hi");
        json.writeCommentEnd();
        assertEquals("\n/*\n * hi\n */", json.getAppendable().toString());

        json = new Json(new StringBuilder(), true, false);
        json.writeCommentBegin();
        json.writeCommentBody("*/hi*/");
        json.writeCommentEnd();
        assertEquals("\n/*\n * hi\n */", json.getAppendable().toString());
    }

    public void testWriteComma() throws IOException {
        Json json = new Json(new StringBuilder(), true, false);
        try {
            json.writeComma();
            fail("Should throw exception");
        } catch (Json.JsonException expected) {
            assertEquals("writeComma with no writeArrayBegin or writeMapBegin", expected.getMessage());
        }

        try {
            json.pushIndent(Json.IndentType.COMMENT);
            json.writeComma();
            fail("Should throw exception");
        } catch (Json.JsonException expected) {
            assertEquals("Cannot use separator on COMMENT", expected.getMessage());
        }
    }

    public void testWriteLiteral() throws IOException {
        Json json = new Json(new StringBuilder(), false, false);
        json.writeLiteral(5);
        assertEquals("5", json.getAppendable().toString());
    }

    public void testWriteString() throws IOException {
        Json json = new Json(new StringBuilder(), false, false);
        json.writeString("test");
        assertEquals("\"test\"", json.getAppendable().toString());

        json = new Json(new StringBuilder(), false, false);
        json.writeString("<!-- div />");
        assertEquals("HTML markup should be escaped for JSON format.", "\"\\u003C\\u0021-- div /\\u003E\"", json
                .getAppendable().toString());
    }

    public void testWriteArrayEntry() throws IOException {
        Json json = new Json(new StringBuilder(), false, false);
        json.writeArrayBegin();
        json.writeArrayEntry("test");
        json.writeArrayEnd();
        assertEquals("[\"test\"]", json.getAppendable().toString());

        json = new Json(new StringBuilder(), false, false);
        json.writeArrayBegin();
        json.writeArrayEntry("test1");
        json.writeArrayEntry("test2");
        json.writeArrayEnd();
        assertEquals("[\"test1\",\"test2\"]", json.getAppendable().toString());

        json = new Json(new StringBuilder(), true, false);
        json.writeArrayBegin();
        json.writeArrayEntry("test1");
        json.writeArrayEntry("test2");
        json.writeArrayEnd();
        assertEquals("[\n  \"test1\",\n  \"test2\"\n]", json.getAppendable().toString());
    }

    public void testWriteMapEntry() throws IOException {
        Json json = new Json(new StringBuilder(), false, false);
        json.writeMapBegin();
        json.writeMapEntry("key", "value");
        json.writeMapEnd();
        assertEquals("{\"key\":\"value\"}", json.getAppendable().toString());

        json = new Json(new StringBuilder(), false, false);
        json.writeMapBegin();
        json.writeMapEntry("key1", "value1");
        json.writeMapEntry("key2", "value2");
        json.writeMapEnd();
        assertEquals("{\"key1\":\"value1\",\"key2\":\"value2\"}", json.getAppendable().toString());

        json = new Json(new StringBuilder(), true, false);
        json.writeMapBegin();
        json.writeMapEntry("key1", "value1");
        json.writeMapEntry("key2", "value2");
        json.writeMapEnd();
        assertEquals("{\n  \"key1\":\"value1\",\n  \"key2\":\"value2\"\n}", json.getAppendable().toString());
    }

    public void testWriteMapKey() throws IOException {
        Json json = new Json(new StringBuilder(), false, false);
        json.writeMapBegin();
        json.writeMapKey("key");
        json.writeMapEnd();
        assertEquals("{\"key\":}", json.getAppendable().toString());

        json = new Json(new StringBuilder(), false, false);
        json.writeMapBegin();
        json.writeMapKey("key1");
        json.writeMapKey("key2");
        json.writeMapEnd();
        assertEquals("{\"key1\":,\"key2\":}", json.getAppendable().toString());

        json = new Json(new StringBuilder(), true, false);
        json.writeMapBegin();
        json.writeMapKey("key1");
        json.writeMapKey("key2");
        json.writeMapEnd();
        assertEquals("{\n  \"key1\":,\n  \"key2\":\n}", json.getAppendable().toString());
    }

    /**
     * Ensures that a down-the-middle binary stream case works properly
     */
    public void testBinaryStream() throws Exception {

        // Write out a JSON+binary stream
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final Json json = Json.createJsonStream(baos, false, false, false);
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
    public void testBinaryStreamOnAppendable() throws Exception {
        final StringBuilder str = new StringBuilder(1);
        final Json json = new Json(str, false, false);
        try {
            json.writeBinaryStreamBegin(1);
            fail("should have failed");
        } catch (IllegalStateException e) {
            assertTrue(e.getMessage().contains("Binary streams are supported only when"));
        }
    }

    public void testBinaryStreamEndBeforeBegin() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final Json json = Json.createJsonStream(baos, false, false, false);
        try {
            json.writeBinaryStreamEnd();
            fail();
        } catch (IllegalStateException e) {
            assertTrue(e.getMessage().contains("Binary stream was not started"));
        }
    }

    public void testBinaryStreamTooShort() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final Json json = Json.createJsonStream(baos, false, false, false);
        final OutputStream out = json.writeBinaryStreamBegin(2);
        out.write(new byte[1]);
        try {
            json.writeBinaryStreamEnd();
            fail();
        } catch (IllegalStateException e) {
            assertTrue(e.getMessage().contains("Length of the binary stream was written"));
        }
    }

    public void testBinaryStreamTooLong() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final Json json = Json.createJsonStream(baos, false, false, false);
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
    public void testBinaryStreamWithinBinaryStream() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final Json json = Json.createJsonStream(baos, false, false, false);
        json.writeBinaryStreamBegin(5);
        try {
            json.writeBinaryStreamBegin(1);
            fail();
        } catch (IllegalStateException e) {
            assertTrue(e.getMessage().contains("Previous binary stream was not ended"));
        }
    }

    public void testBinaryStreamOfSizeZero() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        final Json json = Json.createJsonStream(baos, false, false, false);
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

    public void testNullValuesInMaps() throws Exception {
        final Map<String, Object> map = new LinkedHashMap<String, Object>(8);
        map.put("cats", null);
        map.put("dogs", "bark");
        map.put("birds", "chirp");
        map.put("bacteria", null);

        // Try it with null values disabled
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        Json json = Json.createJsonStream(baos, false, false, false);
        json.writeMap(map);
        json.close();
        assertEquals("{\"dogs\":\"bark\",\"birds\":\"chirp\"}", new String(baos.toByteArray(), Charsets.UTF_8));

        // Try it with null values enabled
        baos.reset();
        json = Json.createJsonStream(baos, false, false, true);
        json.writeMap(map);
        json.close();
        assertEquals("{\"cats\":null,\"dogs\":\"bark\",\"birds\":\"chirp\",\"bacteria\":null}",
                new String(baos.toByteArray(), Charsets.UTF_8));
    }

    public void testNullValuesInArrays() throws Exception {
        final List<String> list = Lists.newArrayList(null, "cats", "dogs", null, "bacteria");

        // Try it with null values disabled
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        Json json = Json.createJsonStream(baos, false, false, false);
        json.writeArray(list);
        json.close();
        assertEquals("[\"cats\",\"dogs\",\"bacteria\"]", new String(baos.toByteArray(), Charsets.UTF_8));

        // Try it with null values enabled
        baos.reset();
        json = Json.createJsonStream(baos, false, false, true);
        json.writeArray(list);
        json.close();
        assertEquals("[null,\"cats\",\"dogs\",null,\"bacteria\"]", new String(baos.toByteArray(), Charsets.UTF_8));
    }
}
