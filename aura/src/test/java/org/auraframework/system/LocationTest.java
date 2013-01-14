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
package org.auraframework.system;

import org.auraframework.test.UnitTestCase;

public class LocationTest extends UnitTestCase {
    private static final Location testLocationFileOnly = new Location("filenameonly", 10);
    private static final Location testLocation = new Location("filename", 5, 5, 10);

    public LocationTest(String name) {
        super(name);
    }

    public void testLocationStringIntInt() throws Exception {
        Location testLocationLocal = new Location("filename", 5, 5, 10);
        assertNotNull(testLocationLocal);
    }

    public void testLocationString() throws Exception {
        Location testLocationFileOnlyLocal = new Location("filename", 10);
        assertNotNull(testLocationFileOnlyLocal);
    }

    public void testGetFileName() throws Exception {
        assertEquals("filenameonly", testLocationFileOnly.getFileName());
        assertEquals("filename", testLocation.getFileName());

        assertFalse("filenameonly".equals(testLocation.getFileName()));
        assertFalse("filename".equals(testLocationFileOnly.getFileName()));
    }

    public void testGetLine() throws Exception {
        assertEquals(-1, testLocationFileOnly.getLine());
        assertEquals(5, testLocation.getLine());

        assertFalse(-1 == testLocation.getLine());
        assertFalse(5 == testLocationFileOnly.getLine());
    }

    public void testGetColumn() throws Exception {
        assertEquals(-1, testLocationFileOnly.getColumn());
        assertEquals(5, testLocation.getColumn());

        assertFalse(-1 == testLocation.getColumn());
        assertFalse(5 == testLocationFileOnly.getColumn());
    }

    public void testToString() throws Exception {
        assertEquals("filenameonly", testLocationFileOnly.toString());
        assertEquals("filename:5,5", testLocation.toString());

        assertFalse("filenameonly".equals(testLocation.toString()));
        assertFalse("filename:5,5".equals(testLocationFileOnly.toString()));
    }

    public void testEquals() throws Exception {
        Location testLocationLocal = new Location("filename", 5, 5, 10);
        Location testLocationFileOnlyLocal = new Location("filenameonly", 10);

        assertEquals(testLocationLocal, testLocation);
        assertEquals(testLocationFileOnlyLocal, testLocationFileOnly);

        assertFalse(testLocationLocal.equals(testLocationFileOnly));
        assertFalse(testLocationFileOnlyLocal.equals(testLocation));

        assertFalse(testLocationLocal.equals("string"));
        assertFalse(testLocationFileOnlyLocal.equals("string"));
    }

    public void testHashCode() throws Exception {
        Location testLocationLocal = new Location("filename", 5, 5, 10);
        Location testLocationFileOnlyLocal = new Location("filenameonly", 10);

        assertEquals(testLocationLocal.hashCode(), testLocation.hashCode());
        assertEquals(testLocationFileOnlyLocal.hashCode(), testLocationFileOnly.hashCode());

        assertTrue(testLocationFileOnlyLocal.hashCode() != testLocation.hashCode());
    }

}
