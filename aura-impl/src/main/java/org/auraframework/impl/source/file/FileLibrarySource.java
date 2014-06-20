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
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;

public class FileLibrarySource<D extends Definition> extends FileSource<D> {
    private static final long serialVersionUID = 9085172576669283451L;

    private final Map<String, String> includes;
    
    /**
     * @param pathOrId - the canonical path of the file provided, if available.
     *            Otherwise a useful systemID in the form namespace:item
     */
    public FileLibrarySource(DefDescriptor<D> descriptor, String pathOrId, File file, Map<String, String> includes) {
        super(descriptor, pathOrId, file, Format.JS);
        this.includes = includes;
    }

    public Map<String, String> getIncludes() {
        return includes;
    }
}
