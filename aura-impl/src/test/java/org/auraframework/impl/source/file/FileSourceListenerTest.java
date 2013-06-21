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
import org.auraframework.impl.DefinitionServiceImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.SourceListener;
import org.auraframework.test.ServiceLocatorMocker;
import org.auraframework.test.UnitTestCase;
import org.auraframework.util.ServiceLoader;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link FileSourceListener}
 */
public class FileSourceListenerTest extends UnitTestCase {

    @Mock private FileSourceLoader loader1;
    @Mock private FileSourceLoader loader2;
    @Mock private FileChangeEvent createEvent;
    @Mock private FileChangeEvent deleteEvent;
    @Mock private FileChangeEvent changeEvent;
    @Mock private FileChangeEvent invalidEvent;
    @Mock private FileObject createFile;
    @Mock private FileObject deleteFile;
    @Mock private FileObject changeFile;
    @Mock private FileObject invalidFile;

    @Mock private DefinitionServiceImpl definitionService;

    private FileSourceListener listener = new FileSourceListener();

    @Override
    public void setUp() throws Exception {
        super.setUp();

        when(createEvent.getFile()).thenReturn(createFile);
        when(deleteEvent.getFile()).thenReturn(deleteFile);
        when(changeEvent.getFile()).thenReturn(changeFile);
        when(invalidEvent.getFile()).thenReturn(invalidFile);

        when(createFile.toString()).thenReturn("/some/awesome/dir/newfile");
        when(deleteFile.toString()).thenReturn("/some/awesome/dir/deletefile");
        when(changeFile.toString()).thenReturn("/some/cool/dir/changedfile");
        when(invalidFile.toString()).thenReturn("/some/invalid/dir/wrongfile");

        listener.addLoader("/some/awesome/dir", loader1);
        listener.addLoader("/some/cool/dir", loader2);
    }

    public void testCreateEvent() throws Exception {
        listener.fileCreated(createEvent);
        //verify(loader1).notifySourceChanges(createEvent, SourceListener.SourceMonitorEvent.created);
    }

    public void testDeleteEvent() throws Exception {
        listener.fileDeleted(deleteEvent);
        //verify(loader1).notifySourceChanges(deleteEvent, SourceListener.SourceMonitorEvent.deleted);
    }

    public void testChangeEvent() throws Exception {
        listener.fileChanged(changeEvent);
        //verify(loader2).notifySourceChanges(changeEvent, SourceListener.SourceMonitorEvent.changed);
    }

    public void testInvalidateAll() throws Exception {

        try {

            ServiceLocatorMocker.mockServiceLocator();
            ServiceLoader slm = ServiceLocatorMocker.getMockedServiceLocator();
            when(slm.get(DefinitionService.class)).thenReturn(definitionService);

            listener.fileChanged(invalidEvent);
            verify(definitionService, atLeastOnce()).onSourceChanged(null, SourceListener.SourceMonitorEvent.changed);

        } finally {

            ServiceLocatorMocker.unmockServiceLocator();
        }

    }
}
