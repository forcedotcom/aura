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
package org.auraframework.test;

import java.io.File;
import java.util.Collection;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Source;

public interface AuraTestingUtil {
    public void setUp();

    public void tearDown();

    File getAuraJavascriptSourceDirectory();

    /**
     * Get a unique value for use in tests
     */
    String getNonce();

    /**
     * Get a unique value and append it to a provided string
     */
    String getNonce(String prefix);

    /**
     * Retrieves the source of a component resource. Note: Works only for markup://string:XXXXX components and not for
     * any other namespace. By default, test util is aware of StringSourceLoader only.
     * 
     * @param descriptor Descriptor of the resource you want to see the source of
     * @return
     */
    <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor);

    /**
     * Convenience method to create a description and load a source in one shot.
     * 
     * @param defClass interface of the definition represented by this source
     * @param contents source contents
     * @return the {@link DefDescriptor} for the created definition
     */
    <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents);

    /**
     * Convenience method to create a description and load a source in one shot.
     * 
     * @param defClass interface of the definition represented by this source
     * @param contents source contents
     * @param namePrefix package name prefix
     * @return the {@link DefDescriptor} for the created definition
     */
    <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents, String namePrefix);

    /**
     * Convenience method to create a description and load a source in one shot.
     * 
     * @param descriptor descriptor for the source to be created
     * @param contents source contents
     * @return the {@link DefDescriptor} for the created definition
     */
    <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents);

    /**
     * Clear cached defs from the system. When mocking a def, if the def has already been cached, as itself, or as part
     * of a preloaded set, the mock will not be effective, so it's safer to clear any cached defs after setting up mocks
     * but before executing a test. This relies on source change notifications to get the servlets to clear their
     * caches.
     * 
     * @param defs the Definitions to be cleared from any caches
     * @throws InterruptedException
     */
    <T extends Definition> void clearCachedDefs(Collection<T> defs) throws Exception;
}
