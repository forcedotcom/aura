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

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasToString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertThat;

import org.auraframework.system.Location;
import org.ehoffman.classloader.RestrictiveClassloader;
import org.ehoffman.junit.aop.Junit4AopClassRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * Test class for (@link Location}.
 */
@RunWith(Junit4AopClassRunner.class)
public class LocationTest {
    private final Location testLocationFileOnly = new Location("filenameonly", 10);
    private final Location testLocation = new Location("filename", 5, 5, 10);

    @SuppressWarnings("static-method")
    @Test
    @RestrictiveClassloader
    public void testLocationStringIntInt() {
        Location testLocationLocal = new Location("filename", 5, 5, 10);
        assertThat(testLocationLocal, notNullValue());
    }

    @SuppressWarnings("static-method")
    @Test
    public void testLocationString() {
        Location testLocationFileOnlyLocal = new Location("filename", 10);
        assertThat(testLocationFileOnlyLocal, notNullValue());
    }

    @SuppressWarnings("static-method")
    @Test
    public void testGetFileName() {
        assertThat(testLocationFileOnly.getFileName(), equalTo("filenameonly"));
        assertThat(testLocation.getFileName(), equalTo("filename"));

        assertThat(testLocation.getFileName(), not(equalTo("filenameonly")));
        assertThat(testLocationFileOnly.getFileName(), not(equalTo("filename")));
    }

    @SuppressWarnings("static-method")
    @Test
    public void testGetLine() {
        assertThat(testLocationFileOnly.getLine(), equalTo(-1));
        assertThat(testLocation.getLine(), equalTo(5));

        assertThat(testLocation.getLine(), not(equalTo(-1)));
        assertThat(testLocationFileOnly.getLine(), not(equalTo(5)));
    }

    @SuppressWarnings("static-method")
    @Test
    public void testGetColumn() {
        assertThat(testLocationFileOnly.getColumn(), equalTo(-1));
        assertThat(testLocation.getColumn(), equalTo(5));

        assertThat(testLocation.getColumn(), not(equalTo(-1)));
        assertThat(testLocationFileOnly.getColumn(), not(equalTo(5)));
    }

    @SuppressWarnings("static-method")
    @Test
    public void testToString() {
        assertThat(testLocationFileOnly, hasToString(equalTo("filenameonly")));
        assertThat(testLocation, hasToString(equalTo("filename:5,5")));

        assertThat(testLocation, hasToString(not(equalTo("filenameonly"))));
        assertThat(testLocationFileOnly, hasToString(not(equalTo("filename:5,5"))));
    }
}
