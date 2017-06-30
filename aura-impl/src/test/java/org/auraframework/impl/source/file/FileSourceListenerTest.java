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

import org.auraframework.system.SourceListener;
import org.auraframework.util.FileChangeEvent;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.nio.file.FileSystems;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link FileSourceListener}
 */
public class FileSourceListenerTest extends UnitTestCase {
    private FileSourceListener listener = new FileSourceListener(null);

    @Captor
    ArgumentCaptor<String> fileCaptor;

    final private String filename = "/some/awesome/ui/inputSearch/inputSearch.cmp";

    @Mock
    private FileChangeEvent fileChangeEvent;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        MockitoAnnotations.initMocks(this);
        listener = spy(listener);
    }

    @Test
    public void testCreateEvent() throws Exception {
        when(fileChangeEvent.getPath()).thenReturn(FileSystems.getDefault().getPath(filename));

        listener.fileCreated(fileChangeEvent);
        verify(listener, atLeastOnce()).onSourceChanged(eq(SourceListener.SourceMonitorEvent.CREATED), fileCaptor.capture());
        assertEquals(filename, fileCaptor.getValue());
    }

    @Test
    public void testDeleteEvent() throws Exception {
        when(fileChangeEvent.getPath()).thenReturn(FileSystems.getDefault().getPath(filename));

        listener.fileDeleted(fileChangeEvent);
        verify(listener, atLeastOnce()).onSourceChanged(eq(SourceListener.SourceMonitorEvent.DELETED), fileCaptor.capture());
        assertEquals(filename, fileCaptor.getValue());
    }

    @Test
    public void testChangeEvent() throws Exception {
        when(fileChangeEvent.getPath()).thenReturn(FileSystems.getDefault().getPath(filename));

        listener.fileChanged(fileChangeEvent);
        verify(listener, atLeastOnce()).onSourceChanged(eq(SourceListener.SourceMonitorEvent.CHANGED), fileCaptor.capture());
        assertEquals(filename, fileCaptor.getValue());
    }
}
