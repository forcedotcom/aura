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
package org.auraframework.integration.test.source.file;

import java.io.File;
import java.io.Reader;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.components.AuraComponentsFiles;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.EventDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.source.file.FileSourceLoader;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.FileMonitor;
import org.junit.Test;

public class FileSourceLoaderTest extends AuraImplTestCase {
    @Inject
    private DefinitionService definitionService;

    @Inject
    private FileMonitor fileMonitor;

    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    @Override
    public void runTest() throws Throwable {
        // filesystem tests are only good if loading from filesystem
        if (AuraComponentsFiles.TestComponents.asFile().exists()) {
            super.runTest();
        }
    }

    @Test
    public void testFileSourceLoaderSanity() {
        assertNotNull(new FileSourceLoader(AuraComponentsFiles.TestComponents.asFile(), fileMonitor));
    }

    @Test
    public void testFileSourceLoaderWithNonExistentFile() {
        try {
            new FileSourceLoader(new File("this_probably_doesnt_exist"), fileMonitor);
            fail("Should have thrown AuraException(Base directory does not exist)");
        } catch (Exception e) {
        	checkExceptionRegex(e, AuraRuntimeException.class, "Base directory.*.does not exist");
        }
    }

    @Test
    public void testFileSourceLoaderWithNullFile() {
        try {
            new FileSourceLoader(null, fileMonitor);
            fail("Should have thrown AuraException(Base directory does not exist)");
        } catch (Exception e) {
        	checkExceptionRegex(e, AuraRuntimeException.class, "Base directory.*.does not exist");
        }

    }

    @Test
    public void testGetComponentSource() {
        FileSourceLoader loader = new FileSourceLoader(AuraComponentsFiles.TestComponents.asFile(), fileMonitor);
        DefDescriptor<ComponentDef> descriptor = definitionService.getDefDescriptor("test:parent", ComponentDef.class);
        TextSource<?> src = loader.getSource(descriptor);
        assertNotNull(src);
        assertEquals(Format.XML, src.getFormat());
        assertEquals(new File(AuraComponentsFiles.TestComponents.asFile(), "test" + File.separator + "parent"
                + File.separator + "parent.cmp").lastModified(), src.getLastModified());
        assertTrue(src.getSystemId().endsWith("parent.cmp"));
        Reader reader = null;
        try {
            reader = src.getHashingReader();
            assertNotNull(reader);
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                    fail("Did not get an exception for not reading the entire file");
                } catch (IllegalStateException ise) {
                	// expected, we didn't read the file.
                	checkExceptionFull(ise,IllegalStateException.class,"Closed a hashing file without reading the entire thing");
                } catch (Exception e) {
                    fail(e.getMessage());
                }
            }
        }

        DefDescriptor<ComponentDef> nonDescriptor = definitionService.getDefDescriptor("test:nonExistent",
                ComponentDef.class);

        assertNull(loader.getSource(nonDescriptor));

    }

    @Test
    public void testGetEventSource() {
        FileSourceLoader loader = new FileSourceLoader(AuraComponentsFiles.TestComponents.asFile(), fileMonitor);
        DefDescriptor<EventDef> descriptor = definitionService.getDefDescriptor("test:anevent", EventDef.class);
        TextSource<EventDef> src = loader.getSource(descriptor);
        assertNotNull(src);
        assertEquals(Format.XML, src.getFormat());
        assertEquals(new File(AuraComponentsFiles.TestComponents.asFile(), "test" + File.separator + "anevent"
                + File.separator + "anevent.evt").lastModified(), src.getLastModified());
        assertTrue(src.getSystemId().endsWith("anevent.evt"));
        Reader reader = null;
        try {
            reader = src.getHashingReader();
            assertNotNull(reader);
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                    fail("Did not get an exception for not reading the entire file");
                } catch (IllegalStateException ise) {
                    // expected, we didn't read the file.
                	checkExceptionFull(ise,IllegalStateException.class,"Closed a hashing file without reading the entire thing");
                } catch (Exception e) {
                    fail(e.getMessage());
                }
            }
        }

        DefDescriptor<EventDef> nonDescriptor = definitionService.getDefDescriptor("test:nonExistentEvent", EventDef.class);
        assertNull(loader.getSource(nonDescriptor));

    }

    @Test
    public void testGetNamespaces() {
        FileSourceLoader loader = new FileSourceLoader(AuraComponentsFiles.TestComponents.asFile(), fileMonitor);
        Set<String> namespaces = loader.getNamespaces();
        assertTrue(namespaces.contains("test"));
        assertTrue(namespaces.contains("preloadTest"));
        assertTrue(namespaces.contains("setAttributesTest"));
    }

    @Test
    public void testFindRegex() {
        FileSourceLoader loader = new FileSourceLoader(AuraComponentsFiles.TestComponents.asFile(), fileMonitor);
        Set<DefDescriptor<?>> found;

        found = loader.find(new DescriptorFilter("markup://test:extendsParent"));
        assertEquals("Should have found a single component", 1, found.size());
        assertTrue(found.contains(definitionService.getDefDescriptor("markup://test:extendsParent", ComponentDef.class)));

        // Number of results can change if files modified so just check at least
        // 2 results from wildcard search since
        // components are more likely to be added than deleted.
        found = loader.find(new DescriptorFilter("markup://test:style*"));
        assertTrue("Should have found multiple components", found.size() > 1);
        assertTrue(found.contains(definitionService.getDefDescriptor("markup://test:styleTestTemplate", ComponentDef.class)));
        assertTrue(found.contains(definitionService.getDefDescriptor("markup://test:styleTest", ApplicationDef.class)));

        found = loader.find(new DescriptorFilter("markup://test:doesntexist"));
        assertEquals("Should not have found any components", 0, found.size());
    }
    
    /**
     * All namespaces loaded by FileSourceLoader are internal, verify that FileSourceLoader says so.
     */
	@Test
    public void testIsInternalNamespace(){
        FileSourceLoader loader = new FileSourceLoader(AuraComponentsFiles.TestComponents.asFile(), fileMonitor);
        assertTrue("All namespaces loaded by FileSourceLoader are to be intenal",
                loader.isInternalNamespace(null));
        assertTrue("All namespaces loaded by FileSourceLoader are to be internal," +
        		"Regardless of the namespace.", loader.isInternalNamespace("fooBared"));
        assertTrue(loader.isInternalNamespace("aura"));
    }
}
