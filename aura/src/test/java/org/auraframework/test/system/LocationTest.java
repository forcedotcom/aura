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
package org.auraframework.test.system;

import org.auraframework.system.Location;
import org.junit.Assert;
import org.junit.Test;

public class LocationTest {
    private static final Location testLocationFileOnly = new Location("filenameonly", 10);
    private static final Location testLocation = new Location("filename", 5, 5, 10);

    @Test
    public void testLocationStringIntInt() throws Exception {
        Location testLocationLocal = new Location("filename", 5, 5, 10);
        Assert.assertNotNull(testLocationLocal);
    }

    @Test
    public void testLocationString() throws Exception {
        Location testLocationFileOnlyLocal = new Location("filename", 10);
        Assert.assertNotNull(testLocationFileOnlyLocal);
    }

    @Test
    public void testGetFileName() throws Exception {
        Assert.assertEquals("filenameonly", testLocationFileOnly.getFileName());
        Assert.assertEquals("filename", testLocation.getFileName());

        Assert.assertFalse("filenameonly".equals(testLocation.getFileName()));
        Assert.assertFalse("filename".equals(testLocationFileOnly.getFileName()));
    }

    @Test
    public void testGetLine() throws Exception {
        Assert.assertEquals(-1, testLocationFileOnly.getLine());
        Assert.assertEquals(5, testLocation.getLine());

        Assert.assertFalse(-1 == testLocation.getLine());
        Assert.assertFalse(5 == testLocationFileOnly.getLine());
    }

    @Test
    public void testGetColumn() throws Exception {
        Assert.assertEquals(-1, testLocationFileOnly.getColumn());
        Assert.assertEquals(5, testLocation.getColumn());

        Assert.assertFalse(-1 == testLocation.getColumn());
        Assert.assertFalse(5 == testLocationFileOnly.getColumn());
    }

    @Test
    public void testToString() throws Exception {
        Assert.assertEquals("filenameonly", testLocationFileOnly.toString());
        Assert.assertEquals("filename:5,5", testLocation.toString());

        Assert.assertFalse("filenameonly".equals(testLocation.toString()));
        Assert.assertFalse("filename:5,5".equals(testLocationFileOnly.toString()));
    }

    @Test
    public void testEquals() throws Exception {
        Location testLocationLocal = new Location("filename", 5, 5, 10);
        Location testLocationFileOnlyLocal = new Location("filenameonly", 10);

        Assert.assertEquals(testLocationLocal, testLocation);
        Assert.assertEquals(testLocationFileOnlyLocal, testLocationFileOnly);

        Assert.assertFalse(testLocationLocal.equals(testLocationFileOnly));
        Assert.assertFalse(testLocationFileOnlyLocal.equals(testLocation));

        Assert.assertFalse(testLocationLocal.equals("string"));
        Assert.assertFalse(testLocationFileOnlyLocal.equals("string"));
    }

    @Test
    public void testHashCode() throws Exception {
        Location testLocationLocal = new Location("filename", 5, 5, 10);
        Location testLocationFileOnlyLocal = new Location("filenameonly", 10);

        Assert.assertEquals(testLocationLocal.hashCode(), testLocation.hashCode());
        Assert.assertEquals(testLocationFileOnlyLocal.hashCode(), testLocationFileOnly.hashCode());

        Assert.assertTrue(testLocationFileOnlyLocal.hashCode() != testLocation.hashCode());
    }
}
