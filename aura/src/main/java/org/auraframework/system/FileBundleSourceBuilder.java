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
package org.auraframework.system;

import java.io.File;

/**
 * An interface defining a class to convert a directory into a bundle.
 */
public interface FileBundleSourceBuilder {
    /**
     * Check to see if the bundle actually matches what is expected to build one.
     */
    boolean isBundleMatch(File base);

    /**
     * Build a bundle from a source directory.
     *
     * FIXME: need to handle errors nicely here.
     *
     * @return the newly built bundle.
     */
    BundleSource<?> buildBundle(File base);
}
