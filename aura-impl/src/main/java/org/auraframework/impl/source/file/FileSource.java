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
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.AbstractTextSourceImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.IOUtil;

public class FileSource<D extends Definition> extends AbstractTextSourceImpl<D> {
    private final File file;
    private final long lastModified;

    public FileSource(DefDescriptor<D> newDescriptor, FileSource<D> original) throws IOException {
        super(newDescriptor, getFilePath(original.file), original.getMimeType());
        this.file = original.file;
        this.lastModified = original.lastModified;
    }

    /**
     * The 'normal' constructor for a file source.
     *
     * This constructor gets both the file path and the mime type from the file given.
     * The file must exist prior to constructing the source. Behaviour is undefined
     * if the file does not exist, please do not test this case.
     *
     * @param descriptor the descriptor for the source.
     * @param file the file that contains the source.
     */
    public FileSource(DefDescriptor<D> descriptor, File file) throws IOException {
        super(descriptor, getFilePath(file), getMimeTypeFromExtension(file.getName()));
        this.file = file;
        this.lastModified = file.lastModified();
    }

    public FileSource(DefDescriptor<D> descriptor, File file, Format format) {
        this(descriptor, getFilePath(file), file, format);
    }

    protected FileSource(DefDescriptor<D> descriptor, String systemId, File file, Format format) {
        super(descriptor, systemId, format);
        this.file = file;
        this.lastModified = file.lastModified();
    }

    @Override
    public Reader getReader() {
        try {
            return new InputStreamReader(new FileInputStream(file), "UTF8");
        } catch (FileNotFoundException e) {
            throw new AuraRuntimeException(e);
        } catch (UnsupportedEncodingException uee) {
            throw new AuraError(uee);
        }
    }

    @Override
    public long getLastModified() {
        return lastModified;
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
            IOUtil.copyStream(getHashingReader(), sw);
            return sw.toString();
        } catch (IOException e) {
            throw new AuraRuntimeException(e);
        }
    }
}
