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


import java.util.EnumSet;
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.BundleSource;
import org.auraframework.system.BundleSourceOption;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;

/**
 * A BundleSource is a set of source files that make up a full definition.
 *
 * This should contain all of the "local" source needed to build the definition for the client,
 * but it will not include external references. This allows the full compilation of the def, but
 * not linking.
 */
public class BundleSourceImpl<D extends Definition> implements BundleSource<D> {
    private final DefDescriptor<D> descriptor;
    private final Map<DefDescriptor<?>,Source<?>> bundleParts;
    private final EnumSet<BundleSourceOption> options;

    /**
     * Create a bundle source.
     *
     * @param descriptor the descriptor for the bundle level descriptor.
     * @param bundleParts a map of all of the bundle parts, including the top level markup.
     * @param minifyEnabled whether minify enabled
     */
    public BundleSourceImpl(DefDescriptor<D> descriptor, Map<DefDescriptor<?>, Source<?>> bundleParts,
                            boolean minifyEnabled) {
        this(descriptor, bundleParts, minifyEnabled ? EnumSet.of(BundleSourceOption.Minify) : EnumSet.noneOf(BundleSourceOption.class));
    }

    /**
     * Create a bundle source.
     *
     * @param descriptor the descriptor for the bundle level descriptor.
     * @param bundleParts a map of all of the bundle parts, including the top level markup.
     * @param options a set of bundle option enums to drive minification and linting
     */
    public BundleSourceImpl(DefDescriptor<D> descriptor, Map<DefDescriptor<?>, Source<?>> bundleParts,
                            EnumSet<BundleSourceOption> options) {
        this.descriptor = descriptor;
        this.bundleParts = bundleParts;
        this.options = options;
    }

    @Override
    public Map<DefDescriptor<?>,Source<?>> getBundledParts() {
        return bundleParts;
    }

    @Override
    public String getSystemId() {
        return null;
    }

    @Override
    public Format getFormat() {
        return null;
    }

    @Override
    public String getMimeType() {
        return "";
    }

    @Override
    public String getHash() {
        return null;
    }

    @Override
    public long getLastModified() {
        return 0;
    }

    @Override
    public DefDescriptor<D> getDescriptor() {
        return descriptor;
    }

    @Override
    public EnumSet<BundleSourceOption> getOptions() {
        return options;
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
    public String toString() {
        return descriptor+"->"+bundleParts;
    }
}
