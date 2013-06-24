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


import org.apache.commons.vfs2.FileChangeEvent;
import org.apache.commons.vfs2.FileObject;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.SourceListener;
import org.auraframework.test.UnitTestCase;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;

import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link FileSourceListener}
 */
public class FileSourceListenerTest extends UnitTestCase {

    @Mock private FileChangeEvent createEvent;
    @Mock private FileChangeEvent deleteEvent;
    @Mock private FileChangeEvent changeEvent;
    @Mock private FileChangeEvent invalidEvent;
    @Mock private FileObject createFile;
    @Mock private FileObject deleteFile;
    @Mock private FileObject changeFile;
    @Mock private FileObject invalidFile;

    @Captor private ArgumentCaptor<DefDescriptor<?>> defDescriptorCaptor;

    private FileSourceListener listener = new FileSourceListener();

    @Override
    public void setUp() throws Exception {
        super.setUp();

        when(createEvent.getFile()).thenReturn(createFile);
        when(deleteEvent.getFile()).thenReturn(deleteFile);
        when(changeEvent.getFile()).thenReturn(changeFile);
        when(invalidEvent.getFile()).thenReturn(invalidFile);

        when(createFile.toString()).thenReturn("/some/awesome/ui/inputSearch/inputSearch.cmp");
        when(deleteFile.toString()).thenReturn("/some/awesome/ui/inputSearch/inputSearchController.js");
        when(changeFile.toString()).thenReturn("/some/awesome/ui/inputSearch/inputSearch.css");
        when(invalidFile.toString()).thenReturn("/some/awesome/ui/inputSearchModel.java");

        listener = spy(listener);


    }

    public void testCreateEvent() throws Exception {
        listener.fileCreated(createEvent);
        verify(listener, atLeastOnce()).onSourceChanged(defDescriptorCaptor.capture(), eq(SourceListener.SourceMonitorEvent.created));

        DefDescriptor<?> dd = defDescriptorCaptor.getValue();

        assertEquals("ui", dd.getNamespace());
        assertEquals("inputSearch", dd.getName());
        assertEquals(DefDescriptor.DefType.COMPONENT, dd.getDefType());
        assertEquals("markup", dd.getPrefix());
    }

    public void testDeleteEvent() throws Exception {
        listener.fileDeleted(deleteEvent);
        verify(listener, atLeastOnce()).onSourceChanged(defDescriptorCaptor.capture(), eq(SourceListener.SourceMonitorEvent.deleted));

        DefDescriptor<?> dd = defDescriptorCaptor.getValue();

        assertEquals("ui", dd.getNamespace());
        assertEquals("inputSearch", dd.getName());
        assertEquals(DefDescriptor.DefType.CONTROLLER, dd.getDefType());
        assertEquals("js", dd.getPrefix());
    }

    public void testChangeEvent() throws Exception {
        listener.fileChanged(changeEvent);
        verify(listener, atLeastOnce()).onSourceChanged(defDescriptorCaptor.capture(), eq(SourceListener.SourceMonitorEvent.changed));

        DefDescriptor<?> dd = defDescriptorCaptor.getValue();

        assertEquals("ui", dd.getNamespace());
        assertEquals("inputSearch", dd.getName());
        assertEquals(DefDescriptor.DefType.STYLE, dd.getDefType());
        assertEquals("css", dd.getPrefix());
    }

    public void testNullDefDescriptor() throws Exception {
        listener.fileChanged(invalidEvent);
        verify(listener, atLeastOnce()).onSourceChanged(defDescriptorCaptor.capture(), eq(SourceListener.SourceMonitorEvent.changed));

        assertNull(defDescriptorCaptor.getValue());
    }
}
