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
package org.auraframework.throwable.test;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.system.Location;
import org.auraframework.throwable.ErrorMessageData;
import org.auraframework.throwable.ProcessFailedException;
import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

public class ProcessFailedExceptionTest {
    @SuppressWarnings("serial")
    private static class NonAbstractPFE extends ProcessFailedException {
        public NonAbstractPFE(String message, List<ErrorMessageData> errors) {
            super(message, errors);
        }
    }

    @Test
    public void testMessageSetWithNoErrors() {
        NonAbstractPFE target = new NonAbstractPFE("mymessage", new ArrayList<>());

        Assert.assertThat(target.getMessage(), Matchers.equalTo("mymessage"));
    }

    @Test
    public void testMessageSetWithOneError() {
        ErrorMessageData errorData = Mockito.mock(ErrorMessageData.class);
        Location location = Mockito.mock(Location.class);
        Mockito.doReturn(location).when(errorData).getLocation();
        Mockito.doReturn("locationToString").when(location).toString();
        Mockito.doReturn("errorDataMessage").when(errorData).getMessage();
        ArrayList<ErrorMessageData> errors = new ArrayList<>();
        errors.add(errorData);
        NonAbstractPFE target = new NonAbstractPFE("mymessage", errors);

        Assert.assertThat(target.getMessage(),
                          Matchers.stringContainsInOrder("mymessage",
                                                         "locationToString", "errorDataMessage"));
    }

    @Test
    public void testMessageSetWithTwoErrors() {
        ErrorMessageData errorData1 = Mockito.mock(ErrorMessageData.class);
        Location location1 = Mockito.mock(Location.class);
        Mockito.doReturn(location1).when(errorData1).getLocation();
        Mockito.doReturn("locationToString1").when(location1).toString();
        Mockito.doReturn("errorDataMessage1").when(errorData1).getMessage();

        ErrorMessageData errorData2 = Mockito.mock(ErrorMessageData.class);
        Location location2 = Mockito.mock(Location.class);
        Mockito.doReturn(location2).when(errorData2).getLocation();
        Mockito.doReturn("locationToString2").when(location2).toString();
        Mockito.doReturn("errorDataMessage2").when(errorData2).getMessage();


        ArrayList<ErrorMessageData> errors = new ArrayList<>();
        errors.add(errorData1);
        errors.add(errorData2);
        NonAbstractPFE target = new NonAbstractPFE("mymessage", errors);

        Assert.assertThat(target.getMessage(),
                          Matchers.stringContainsInOrder("mymessage",
                                                         "locationToString1", "errorDataMessage1",
                                                         "locationToString2", "errorDataMessage2"));
    }

    @Test
    public void testErrorsWithTwoErrors() {
        ErrorMessageData errorData1 = Mockito.mock(ErrorMessageData.class);
        Location location1 = Mockito.mock(Location.class);
        Mockito.doReturn(location1).when(errorData1).getLocation();
        Mockito.doReturn("locationToString1").when(location1).toString();
        Mockito.doReturn("errorDataMessage1").when(errorData1).getMessage();

        ErrorMessageData errorData2 = Mockito.mock(ErrorMessageData.class);
        Location location2 = Mockito.mock(Location.class);
        Mockito.doReturn(location2).when(errorData2).getLocation();
        Mockito.doReturn("locationToString2").when(location2).toString();
        Mockito.doReturn("errorDataMessage2").when(errorData2).getMessage();


        ArrayList<ErrorMessageData> errors = new ArrayList<>();
        errors.add(errorData1);
        errors.add(errorData2);
        NonAbstractPFE target = new NonAbstractPFE("mymessage", errors);

        Assert.assertThat(target.getErrors(),
                          Matchers.containsInRelativeOrder(errorData1, errorData2));
    }
}
