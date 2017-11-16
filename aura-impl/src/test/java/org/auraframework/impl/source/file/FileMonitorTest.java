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
package org.auraframework.impl.source.file;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.LoggingService;
import org.auraframework.util.FileListener;
import org.auraframework.util.IOUtil;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.io.File;
import java.util.Arrays;

/**
 * This class tests the FileMonitorImpl class... but it cheats, it relies on the base classes that do a bunch of spring setup for us.
 * Here we are taking benefiting from that setup... but we're likely to break if someone touches that with a feather :)
 *
 * As unit-test like that this class looks, it is not, it's really an integration test. It goes to the file system!
 */
public class FileMonitorTest extends AuraImplTestCase {

    @Test
    public void testFileMonitorNotifiesWithRegistryCreationTimeInPast() throws Exception {
        File tmpDir = new File(IOUtil.newTempDir("testFileMonitorNotifiesWithRegistryCreationTimeInPast"));

        getAuraTestingUtil().makeFile(tmpDir, "sample", ".txt", "sample file");
        FileListener listenerMock = Mockito.mock(FileListener.class);

        ((FileMonitorImpl)fileMonitor).listener = listenerMock;

        LoggingService loggingServiceMock = Mockito.mock(LoggingService.class);
        ((FileMonitorImpl)fileMonitor).loggingService = loggingServiceMock;

        fileMonitor.addDirectory(tmpDir.toString(), 0L);

        ArgumentCaptor<String> argumentCaptor = ArgumentCaptor.forClass(String.class);
        Mockito.verify(loggingServiceMock, Mockito.atLeast(0)).error(argumentCaptor.capture());
        Mockito.verify(loggingServiceMock, Mockito.atLeast(0)).warn(argumentCaptor.capture());
        assertEquals("Should not have any errors or warnings", Arrays.asList(), argumentCaptor.getAllValues());

        Mockito.verify(listenerMock, Mockito.atLeastOnce()).fileChanged(Mockito.anyObject());
    }

    @Test
    public void testFileMonitorDoesNotNotifyWithRegistryCreationTimeInFuture() throws Exception {
        File tmpDir = new File(IOUtil.newTempDir("testFileMonitorDoesNotNotifyWithoutRegistryCreationTime"));

        getAuraTestingUtil().makeFile(tmpDir, "sample", ".txt", "sample file");
        FileListener listenerMock = Mockito.mock(FileListener.class);

        ((FileMonitorImpl)fileMonitor).listener = listenerMock;

        // the far future! Just has to be beyond the last modified time of the files we just created
        fileMonitor.addDirectory(tmpDir.toString(), System.currentTimeMillis() + 10);

        Mockito.verify(listenerMock, Mockito.never()).fileChanged(Mockito.anyObject());
    }

    @Test
    public void testFileMonitorDoesNotNotifyWithoutRegistryCreationTime() throws Exception {
        File tmpDir = new File(IOUtil.newTempDir("testFileMonitorDoesNotNotifyWithoutRegistryCreationTime"));

        getAuraTestingUtil().makeFile(tmpDir, "sample", ".txt", "sample file");
        FileListener listenerMock = Mockito.mock(FileListener.class);

        ((FileMonitorImpl)fileMonitor).listener = listenerMock;

        fileMonitor.addDirectory(tmpDir.toString(), null);

        Mockito.verify(listenerMock, Mockito.never()).fileChanged(Mockito.anyObject());
    }
}
