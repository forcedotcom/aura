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
import java.util.EnumSet;
import java.util.Set;

import com.google.common.collect.ImmutableSet;

import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.util.AuraTextUtil;

public class FileJavaSourceLoader extends FileSourceLoader {

    public static final Set<String> PREFIXES = ImmutableSet.of("java");
    private static final Set<DefType> DEFTYPES = EnumSet.of(DefType.COMPONENT, DefType.INTERFACE);
    private final Set<String> namespaces;

    public FileJavaSourceLoader(File base, Set<String> namespaces) {
        super(base);
        this.namespaces = namespaces;
    }

    @Override
    public <D extends Definition> FileSource<D> getSource(DefDescriptor<D> descriptor) {

        String javaFilename = String.format("cmp/%s/%sCmp%s", descriptor.getNamespace().replace('.', '/'), AuraTextUtil.initCap(descriptor.getName()), ".java");
        File javaFile = new File(base, javaFilename);
        String javaName = String.format("java://%s.%s", descriptor.getNamespace(), descriptor.getName());
        return new FileJavaSource<D>(descriptor, javaName, javaFile);
    }

    @Override
    public Set<String> getPrefixes() {
        return PREFIXES;
    }

    @Override
    public Set<DefType> getDefTypes() {
        return DEFTYPES;
    }

    @Override
    public Set<String> getNamespaces() {
        return namespaces;
    }
}
