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

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.apache.commons.vfs2.FileChangeEvent;
import org.apache.commons.vfs2.FileObject;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.SourceListener;
import org.auraframework.test.UnitTestCase;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

/**
 * Unit tests for {@link FileSourceListener}
 */
public class FileSourceListenerTest extends UnitTestCase {
    @Captor
    private ArgumentCaptor<DefDescriptor<?>> defDescriptorCaptor;

    private FileSourceListener listener = new FileSourceListener();

    @Override
    public void setUp() throws Exception {
        super.setUp();
        listener = spy(listener);
    }

    public void testCreateEvent() throws Exception {
        FileChangeEvent event = mock(FileChangeEvent.class);
        FileObject file = mock(FileObject.class);
        when(event.getFile()).thenReturn(file);
        when(file.toString()).thenReturn("/some/awesome/ui/inputSearch/inputSearch.cmp");

        listener.fileCreated(event);
        verify(listener, atLeastOnce()).onSourceChanged(defDescriptorCaptor.capture(),
                eq(SourceListener.SourceMonitorEvent.created));

        assertFileChangeEvent();
    }

    public void testDeleteEvent() throws Exception {
        FileChangeEvent event = mock(FileChangeEvent.class);
        FileObject file = mock(FileObject.class);
        when(event.getFile()).thenReturn(file);
        when(file.toString()).thenReturn("/some/awesome/ui/inputSearch/inputSearch.cmp");

        listener.fileDeleted(event);
        verify(listener, atLeastOnce()).onSourceChanged(defDescriptorCaptor.capture(),
                eq(SourceListener.SourceMonitorEvent.deleted));

        assertFileChangeEvent();
    }

    public void testChangeEvent() throws Exception {
        FileChangeEvent event = mock(FileChangeEvent.class);
        FileObject file = mock(FileObject.class);
        when(event.getFile()).thenReturn(file);
        when(file.toString()).thenReturn("/some/awesome/ui/inputSearch/inputSearch.cmp");

        listener.fileChanged(event);
        verify(listener, atLeastOnce()).onSourceChanged(defDescriptorCaptor.capture(),
                eq(SourceListener.SourceMonitorEvent.changed));

        assertFileChangeEvent();
    }

    private void assertFileChangeEvent() {
        DefDescriptor<?> dd = defDescriptorCaptor.getValue();
        assertEquals("ui", dd.getNamespace());
        assertEquals("inputSearch", dd.getName());
        assertEquals(DefDescriptor.DefType.COMPONENT, dd.getDefType());
        assertEquals("markup", dd.getPrefix());
    }

    /**
     * If the file that changed does not match the list of {@link DefDescriptor.DefType} (i.e. java) in
     * {@link FileSourceListener} then null should be passed to DefinitionService.onSourceChanged() to wipe out the
     * whole cache.
     */
    public void testNullDefDescriptor() throws Exception {
        FileChangeEvent event = mock(FileChangeEvent.class);
        FileObject file = mock(FileObject.class);
        when(event.getFile()).thenReturn(file);
        when(file.toString()).thenReturn("/some/awesome/ui/inputSearch/inputSearchModel.java");

        listener.fileChanged(event);
        verify(listener, atLeastOnce()).onSourceChanged(defDescriptorCaptor.capture(),
                eq(SourceListener.SourceMonitorEvent.changed));

        assertNull(defDescriptorCaptor.getValue());
    }

    public void testSourceChangedApplication() throws Exception {
        assertSourceChangedCalled("markup", "appCache", "withpreload", DefDescriptor.DefType.APPLICATION,
                "/some/awesome/appCache/withpreload/withpreload.app");
    }

    public void testSourceChangedComponent() throws Exception {
        assertSourceChangedCalled("markup", "ui", "inputSearch", DefDescriptor.DefType.COMPONENT,
                "/some/awesome/ui/inputSearch/inputSearch.cmp");
    }

    public void testSourceChangedEvent() throws Exception {
        assertSourceChangedCalled("markup", "ui", "focus", DefDescriptor.DefType.EVENT,
                "/some/awesome/ui/focus/focus.evt");
    }

    public void testSourceChangedInterface() throws Exception {
        assertSourceChangedCalled("markup", "ui", "visible", DefDescriptor.DefType.INTERFACE,
                "/some/awesome/ui/visible/visible.intf");
    }

    public void testSourceChangedStyle() throws Exception {
        assertSourceChangedCalled("css", "ui", "inputSearch", DefDescriptor.DefType.STYLE,
                "/some/awesome/ui/inputSearch/inputSearch.css");
    }

    public void testSourceChangedLayouts() throws Exception {
        assertSourceChangedCalled("markup", "test", "layouts", DefDescriptor.DefType.LAYOUTS,
                "/some/awesome/test/layouts/layoutsLayouts.xml");
    }

    public void testSourceChangedNamespace() throws Exception {
        assertSourceChangedCalled("markup", "namespaceDefTest", "namespaceDefTest", DefDescriptor.DefType.NAMESPACE,
                "/some/awesome/namespaceDefTest/namespaceDefTest.xml");
    }

    public void testSourceChangedTestSuite() throws Exception {
        assertSourceChangedCalled("js", "ui", "inputSelect", DefDescriptor.DefType.TESTSUITE,
                "/some/awesome/ui/inputSelect/inputSelectTest.js");
    }

    public void testSourceChangedController() throws Exception {
        assertSourceChangedCalled("js", "ui", "inputSearch", DefDescriptor.DefType.CONTROLLER,
                "/some/awesome/ui/inputSearch/inputSearchController.js");
    }

    public void testSourceChangedRenderer() throws Exception {
        assertSourceChangedCalled("js", "ui", "inputSearch", DefDescriptor.DefType.RENDERER,
                "/some/awesome/ui/inputSearch/inputSearchRenderer.js");
    }

    public void testSourceChangedProvider() throws Exception {
        assertSourceChangedCalled("js", "ui", "pager", DefDescriptor.DefType.PROVIDER,
                "/some/awesome/ui/pager/pagerProvider.js");
    }

    public void testSourceChangedHelper() throws Exception {
        assertSourceChangedCalled("js", "ui", "inputSearch", DefDescriptor.DefType.HELPER,
                "/some/awesome/ui/inputSearch/inputSearchHelper.js");
    }

    public void testSourceChangedModel() throws Exception {
        assertSourceChangedCalled("js", "test", "jsModel", DefDescriptor.DefType.MODEL,
                "/some/awesome/test/jsModel/jsModelModel.js");
    }

    private void assertSourceChangedCalled(String prefix, String namespace, String name, DefDescriptor.DefType defType,
            String filePath) throws Exception {
        FileObject file = mock(FileObject.class);
        FileChangeEvent event = mock(FileChangeEvent.class);
        when(event.getFile()).thenReturn(file);
        when(file.toString()).thenReturn(filePath);

        listener.fileChanged(event);
        verify(listener, times(1)).onSourceChanged(defDescriptorCaptor.capture(),
                eq(SourceListener.SourceMonitorEvent.changed));

        DefDescriptor<?> dd = defDescriptorCaptor.getValue();

        assertEquals(namespace, dd.getNamespace());
        assertEquals(name, dd.getName());
        assertEquals(defType, dd.getDefType());
        assertEquals(prefix, dd.getPrefix());
    }
}
