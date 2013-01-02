/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.io.*;
import java.util.Set;

import org.auraframework.def.*;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.system.*;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;

public class FileSourceLoaderTest extends AuraImplTestCase {

    public FileSourceLoaderTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    @Override
    public void runTest() throws Throwable {
        // filesystem tests are only good if loading from filesystem
        if (AuraImplFiles.TestComponents.asFile().exists())
            super.runTest();
    }

    public void testFileSourceLoader() {
        assertNotNull(new FileSourceLoader(AuraImplFiles.TestComponents.asFile()));

        try {
            new FileSourceLoader(new File("this_probably_doesnt_exist"));
            fail("Should have thrown AuraException(Base directory does not exist)");
        } catch (AuraRuntimeException e) {}

        try {
            new FileSourceLoader(null);
            fail("Should have thrown AuraException(Base directory does not exist)");
        } catch (AuraRuntimeException e) {}

    }

    public void testGetComponentSource() {
        FileSourceLoader loader = new FileSourceLoader(AuraImplFiles.TestComponents.asFile());
        DefDescriptor<ComponentDef> descriptor = DefDescriptorImpl.getInstance("test:parent", ComponentDef.class);
        Source<?> src = loader.getSource(descriptor);
        assertNotNull(src);
        assertEquals(Format.XML, src.getFormat());
        assertEquals(new File(AuraImplFiles.TestComponents.asFile(), "test" + File.separator + "parent"
                + File.separator + "parent.cmp").lastModified(), src.getLastModified());
        assertTrue(src.getSystemId().endsWith("parent.cmp"));
        Reader reader = null;
        try {
            reader = src.getReader();
            assertNotNull(reader);
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    fail(e.getMessage());
                }
            }
        }

        DefDescriptor<ComponentDef> nonDescriptor = DefDescriptorImpl.getInstance("test:nonExistent",
                ComponentDef.class);

        assertFalse(loader.getSource(nonDescriptor).exists());

    }

    public void testGetEventSource() {
        FileSourceLoader loader = new FileSourceLoader(AuraImplFiles.TestComponents.asFile());
        DefDescriptor<EventDef> descriptor = DefDescriptorImpl.getInstance("test:anevent", EventDef.class);
        Source<EventDef> src = loader.getSource(descriptor);
        assertNotNull(src);
        assertEquals(Format.XML, src.getFormat());
        assertEquals(new File(AuraImplFiles.TestComponents.asFile(), "test" + File.separator + "anevent"
                + File.separator + "anevent.evt").lastModified(), src.getLastModified());
        assertTrue(src.getSystemId().endsWith("anevent.evt"));
        Reader reader = null;
        try {
            reader = src.getReader();
            assertNotNull(reader);
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    fail(e.getMessage());
                }
            }
        }

        DefDescriptor<EventDef> nonDescriptor = DefDescriptorImpl.getInstance("test:nonExistentEvent", EventDef.class);
        assertFalse(loader.getSource(nonDescriptor).exists());

    }

    public void testGetNamespaces() {
        FileSourceLoader loader = new FileSourceLoader(AuraImplFiles.TestComponents.asFile());
        Set<String> namespaces = loader.getNamespaces();
        assertTrue(namespaces.contains("test"));
        assertTrue(namespaces.contains("preloadTest"));
        assertTrue(namespaces.contains("setAttributesTest"));
    }

    public void testFindRegex() {
        FileSourceLoader loader = new FileSourceLoader(AuraImplFiles.TestComponents.asFile());
        Set<DefDescriptor<?>> found;

        found = loader.find(new DescriptorFilter("markup://test:extendsParent"));
        assertEquals("Should have found a single component", 1, found.size());
        assertTrue(found.contains(DefDescriptorImpl.getInstance("markup://test:extendsParent", ComponentDef.class)));
        
        // Number of results can change if files modified so just check at least 2 results from wildcard search since 
        // components are more likely to be added than deleted.
        found = loader.find(new DescriptorFilter("markup://test:theme*"));
        assertTrue("Should have found multiple components", found.size() > 1);
        assertTrue(found.contains(DefDescriptorImpl.getInstance("markup://test:themeTestTemplate", ComponentDef.class)));
        assertTrue(found.contains(DefDescriptorImpl.getInstance("markup://test:themeTest", ApplicationDef.class)));
        
        found = loader.find(new DescriptorFilter("markup://test:doesntexist"));
        assertEquals("Should not have found any components", 0, found.size());
    }
}
