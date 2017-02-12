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
package org.auraframework.impl.java;

import java.lang.annotation.Annotation;

import javax.annotation.Nonnull;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.JavaSource;
import org.auraframework.system.Parser.Format;

public class JavaSourceImpl<D extends Definition> implements JavaSource<D> {
    public static final String JAVA_MIME_TYPE = "application/x-java-class";

    private final Class<?> javaClass;
    private final String systemId;
    private final Format format;
    private final DefDescriptor<D> descriptor;


    public JavaSourceImpl(DefDescriptor<D> descriptor, @Nonnull Class<?> javaClass) {
        this.javaClass = javaClass;
        this.systemId = javaClass.getName();
        this.format = Format.JAVA;
        this.descriptor = descriptor;
    }

    @Override
    public String getMimeType() {
        return JAVA_MIME_TYPE;
    }

    @Override
    public Class<?> getJavaClass() {
        return javaClass;
    }

    @Override
    public String getSystemId() {
        return systemId;
    }

    /**
     * Get the format of this source.
     */
    @Override
    public Format getFormat() {
        return format;
    }

    @Override
    public DefDescriptor<D> getDescriptor() {
        return descriptor;
    }

    @Override
    public String getHash() {
        return null;
    }

    /**
     * Fnd an annotation up to two levels deep.
     *
     * This helper function allows us to search 'meta' annotations, at a certain cost during compilation...
     * We do this to allow a single level of nesting for annotations. This maybe should be replaced by the
     * ability to get an annotation from the adapter instead of trying all of them.
     */
    @Override
    public <T extends Annotation> T findAnnotation(Class<T> annClass) {
        T ann = javaClass.getAnnotation(annClass);
        if (ann != null) {
            return ann;
        }
        Annotation [] annList = javaClass.getAnnotations();
        for (Annotation t : annList) {
            ann = t.annotationType().getAnnotation(annClass);
            if (ann != null) {
                return ann;
            }
        }
        return null;
    }

    @Override
    public boolean isDefaultNamespaceSupported() {
        return false;
    }

    @Override
    public String getDefaultNamespace() {
        return null;
    }

    @Override
    public long getLastModified() {
        return 0L;
    }
}
