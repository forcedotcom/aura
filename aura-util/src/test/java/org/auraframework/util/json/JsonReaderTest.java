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

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.auraframework.test.UnitTestCase;
import org.mockito.Mockito;

/**
 */
public class JsonReaderTest extends UnitTestCase {
    /**
     * This class just uses JsonReader class to parse a JsonString.
     *
     * @throws IOException
     */
    @SuppressWarnings("unchecked")
    public void testReadComplexObject() throws IOException {
        String json = "{\"key1\":[[\"string1\",\"string2\"],true,10,[false,1.5,{\"key2\":[\"string1\",\"string2\"]}]]}";
        Object o = new JsonReader().read(json);
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
     * Test case to verify the handling of IOExceptions
     *
     * @throws Exception
     */
    public void testIOException() throws Exception {
        File newFileobj = getResourceFile("/testdata/IOExceptionSimulate.txt");
        newFileobj.getParentFile().mkdirs();
        Writer writer = null;
        writer = new FileWriter(newFileobj, false);
        try {
            writer.append(new Long(System.currentTimeMillis()).toString());
            writer.flush();
        } finally {
            writer.close();
        }
        Reader newFile = Mockito.mock(FileReader.class);
        Mockito.when(newFile.read()).thenThrow(new IOException());
        try {
            new JsonReader().read(newFile);
            fail("When the reader fumbles, the JsonReader should have signaled that");
        } catch (JsonStreamReader.JsonParseException expected) {
            // Expected to throw this exception
        } finally {
            newFile.close();
            newFileobj.delete();
        }
    }
}
