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

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;

public class FileSource<D extends Definition> extends Source<D> {

    private static final long serialVersionUID = -5816647732422404876L;
    private final File file;
    private final long lastModified;

    public FileSource(DefDescriptor<D> descriptor, File file, Format format) {
        this(descriptor, getFilePath(file), file, format);
    }

    protected FileSource(DefDescriptor<D> descriptor, String systemId, File file, Format format) {
        super(descriptor, systemId, format);
        this.file = file;

        // Ensure that lastModified doesn't change after construction of this
        // Source.
        this.lastModified = file.lastModified();
    }

    @Override
    public long getLastModified() {
        return lastModified;
    }

    @Override
    public Reader getReader() {
        try {
            return new FileReader(file);
        } catch (FileNotFoundException e) {
            throw new AuraRuntimeException(e);
        }
    }

    @Override
    public Writer getWriter() {
        try {
            if (!file.exists()) {
                file.getParentFile().mkdirs();
                file.createNewFile();
            } else if (!file.canWrite()) {
                Aura.getSourceControlAdapter().checkout(file);
            }
            return new FileWriter(file);
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }
    }

    /**
     * Provides an absolute {@code file://} URL for this source.
     */
    @Override
    public String getUrl() {
        return "file://" + file.getAbsolutePath();
    }

    public static String getFilePath(File file) {
        try {
            if (!file.exists()) {
                throw new AuraRuntimeException("File does not exist: " + file.getPath());
            }
            return file.getCanonicalPath();
        } catch (Exception e) {
            throw new AuraRuntimeException(e);
        }
    }

    /**
     * @see Source#getContents()
     */
    @Override
    public String getContents() {
        try {
            StringWriter sw = new StringWriter();
            IOUtil.copyStream(getReader(), sw);
            return sw.toString();
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }
    }

    /**
     * @see Source#exists()
     */
    @Override
    public boolean exists() {
        return file.exists();
    }

    @Override
    public boolean addOrUpdate(CharSequence newContents) {
        try {
            return Aura.getSourceControlAdapter().writeIfDifferent(new StringBuilder(newContents), file);
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }
    }

}
