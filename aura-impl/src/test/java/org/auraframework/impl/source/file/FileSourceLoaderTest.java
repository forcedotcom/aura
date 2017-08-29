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

import java.io.File;
import java.io.FileOutputStream;
import java.io.Reader;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.source.file.FileSourceLoader;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.IOUtil;
import org.junit.Test;

public class FileSourceLoaderTest extends AuraImplTestCase {
    @Inject
    private DefinitionService definitionService;

    @Inject
    private FileMonitor fileMonitor;

    @Test
    public void testFileSourceLoaderSanity() {
        File tmpDir = new File(IOUtil.newTempDir("fileSourceLoaderTest"));
        assertNotNull(new FileSourceLoader(tmpDir, fileMonitor));
    }

    @Test
    public void testFileSourceLoaderWithNonExistentFile() {
        Exception expected = null;
        try {
            new FileSourceLoader(new File("this_probably_doesnt_exist"), fileMonitor);
        } catch (Exception e) {
            expected = e;
        }
        assertNotNull("Should have thrown AuraException(Base directory does not exist)", expected);
        checkExceptionRegex(expected, AuraRuntimeException.class, "Base directory.*.does not exist");
    }

    @Test
    public void testFileSourceLoaderWithNullFile() {
        Exception expected = null;
        try {
            new FileSourceLoader(null, fileMonitor);
        } catch (Exception e) {
            expected = e;
        }
        assertNotNull("Should have thrown AuraException(Base directory does not exist)", expected);
        checkExceptionRegex(expected, AuraRuntimeException.class, "Base directory.*.does not exist");
    }

    private void makeFile(File namespace, String name, String extension, String contents) throws Exception {
        File dir = new File(namespace, name);
        File file = new File(dir, name+extension);
        dir.mkdirs();
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(contents.getBytes("UTF-8"));
            fos.close();
        }
    }

    private FileSourceLoader createLoaderWithContents() throws Exception {
        File tmpDir = new File(IOUtil.newTempDir("fileSourceLoaderTest"));

        File testNamespace = new File(tmpDir, "test");

        makeFile(testNamespace, "parent", ".cmp", "<component />");
        makeFile(testNamespace, "anevent", ".evt", "<event />");
        makeFile(testNamespace, "aninterface", ".intf", "<interface />");

        return new FileSourceLoader(tmpDir, fileMonitor);
    }
    
    @Test
    public void testGetMissingComponentSource() throws Exception {
        FileSourceLoader loader = createLoaderWithContents();

        // We should not find something that isn't there.
        DefDescriptor<ComponentDef> nonDescriptor = definitionService.getDefDescriptor("test:nonExistent",
                ComponentDef.class);
        assertNull(loader.getSource(nonDescriptor));
    }


    @Test
    public void testGetComponentSource() throws Exception {
        FileSourceLoader loader = createLoaderWithContents();

        DefDescriptor<ComponentDef> descriptor = definitionService.getDefDescriptor("test:parent", ComponentDef.class);
        TextSource<?> src = loader.getSource(descriptor);
        assertNotNull(src);
        assertEquals(Format.XML, src.getFormat());
        assertTrue(src.getSystemId().endsWith("parent.cmp"));
        try (Reader reader = src.getHashingReader()) {
            assertNotNull(reader);
            IllegalStateException expected = null;
            try {
                reader.close();
            } catch (IllegalStateException ise) {
                expected = ise;
            }
            assertNotNull("Did not get an exception for not reading the entire file", expected);
            checkExceptionFull(expected,IllegalStateException.class,"Closed a hashing file without reading the entire thing");
        }
    }

    @Test
    public void testGetEventSource() throws Exception {
        FileSourceLoader loader = createLoaderWithContents();

        DefDescriptor<EventDef> descriptor = definitionService.getDefDescriptor("test:anevent", EventDef.class);
        TextSource<EventDef> src = loader.getSource(descriptor);
        assertNotNull(src);
        assertEquals(Format.XML, src.getFormat());
        assertTrue(src.getSystemId().endsWith("anevent.evt"));
        try (Reader reader = src.getHashingReader()) {
            assertNotNull(reader);
            IllegalStateException expected = null;
            try {
                reader.close();
            } catch (IllegalStateException ise) {
                expected = ise;
            }
            assertNotNull("Did not get an exception for not reading the entire file", expected);
            checkExceptionFull(expected,IllegalStateException.class,"Closed a hashing file without reading the entire thing");
        }
    }

    @Test
    public void testGetNamespaces() throws Exception {
        FileSourceLoader loader = createLoaderWithContents();
        Set<String> namespaces = loader.getNamespaces();
        assertTrue(namespaces.contains("test"));
    }

    @Test
    public void testFindRegex() throws Exception {
        FileSourceLoader loader = createLoaderWithContents();
        Set<DefDescriptor<?>> found;

        found = loader.find(new DescriptorFilter("markup://test:parent"));
        assertEquals("Should have found a single component", 1, found.size());
        assertTrue(found.contains(definitionService.getDefDescriptor("markup://test:parent", ComponentDef.class)));

        found = loader.find(new DescriptorFilter("markup://test:an*"));
        assertEquals("Should have found multiple components", found.size(), 2);
        assertTrue(found.contains(definitionService.getDefDescriptor("markup://test:anevent", EventDef.class)));
        assertTrue(found.contains(definitionService.getDefDescriptor("markup://test:aninterface", InterfaceDef.class)));

        found = loader.find(new DescriptorFilter("markup://test:doesntexist"));
        assertEquals("Should not have found any components", 0, found.size());
    }
    
    /**
     * All namespaces loaded by FileSourceLoader are internal, verify that FileSourceLoader says so.
     */
    @Test
    public void testIsInternalNamespace() throws Exception {
        FileSourceLoader loader = createLoaderWithContents();
        assertTrue("All namespaces loaded by FileSourceLoader are to be intenal",
                loader.isInternalNamespace(null));
        assertTrue("All namespaces loaded by FileSourceLoader are to be internal," +
        		"Regardless of the namespace.", loader.isInternalNamespace("fooBared"));
        assertTrue(loader.isInternalNamespace("aura"));
    }
}
