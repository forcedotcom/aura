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
package org.auraframework.impl.source;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.source.file.FileSource;
import org.auraframework.util.IOUtil;
import org.junit.Test;

public class FileSourceTest extends AuraImplTestCase {
    private void writeTextFile(File f, String contents) throws IOException {
        try (Writer br = new OutputStreamWriter(new FileOutputStream(f), "UTF-8")) {
            br.append(contents);
        }
    }

    @Test
    public void testMimeTypeForJS() throws Exception {
        String dir = IOUtil.newTempDir("filesource");
        File jsFile = new File(dir, "test.js");
        writeTextFile(jsFile, "({})");
        FileSource<?> source = new FileSource<>(null, jsFile);
        assertEquals("application/javascript", source.getMimeType());
    }

    @Test
    public void testMimeTypeForLib() throws Exception {
        String dir = IOUtil.newTempDir("filesource");
        File libFile = new File(dir, "test.lib");
        writeTextFile(libFile, "<aura:library></aura:library>");
        FileSource<?> source = new FileSource<>(null, libFile);
        assertEquals("application/xml", source.getMimeType());
    }

    @Test
    public void testMimeTypeForComponent() throws Exception {
        String dir = IOUtil.newTempDir("filesource");
        File libFile = new File(dir, "test.cmp");
        writeTextFile(libFile, "<aura:component></aura:component>");
        FileSource<?> source = new FileSource<>(null, libFile);
        assertEquals("application/xml", source.getMimeType());
    }

    @Test
    public void testMimeTypeForApplication() throws Exception {
        String dir = IOUtil.newTempDir("filesource");
        File libFile = new File(dir, "test.app");
        writeTextFile(libFile, "<aura:application></aura:application>");
        FileSource<?> source = new FileSource<>(null, libFile);
        assertEquals("application/xml", source.getMimeType());
    }

    @Test
    public void testMimeTypeForEvent() throws Exception {
        String dir = IOUtil.newTempDir("filesource");
        File libFile = new File(dir, "test.evt");
        writeTextFile(libFile, "<aura:event></aura:event>");
        FileSource<?> source = new FileSource<>(null, libFile);
        assertEquals("application/xml", source.getMimeType());
    }

    @Test
    public void testMimeTypeForInterface() throws Exception {
        String dir = IOUtil.newTempDir("filesource");
        File libFile = new File(dir, "test.intf");
        writeTextFile(libFile, "<aura:interface></aura:interface>");
        FileSource<?> source = new FileSource<>(null, libFile);
        assertEquals("application/xml", source.getMimeType());
    }
}
