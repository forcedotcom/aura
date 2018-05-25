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
package org.auraframework.def;

import java.util.List;
import java.util.Map;

import org.auraframework.instance.Versionable;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * RootDefinitions are the Definitions that can be defined at the top-level of markup. This includes things like
 * component, interface, and event. The common trait of all of these types is that they can include AttributeDefs.
 */
public interface RootDefinition extends PlatformDef, Versionable {

    @Override
    DefDescriptor<? extends RootDefinition> getDescriptor();

    /**
     * @return all the required versions for this component
     * @throws QuickFixException
     */
    Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs();

    /**
     * @param namespace
     * @return The RequiredVersionDef for the given namespace
     */
    RequiredVersionDef getRequiredVersion(String namespace);

    /**
     * Get the full set of registered event defs (including inherited)
     * 
     * @return all the events this component can fire, including those inherited
     * @throws QuickFixException
     */
    Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException;
    
    /**
     * Check to see if this definition is an instance of another.
     *
     * This does a recursive check for instances, and will not work until after the definition has been
     * 'rolled-up' so that we can effectively do the check.
     *
     * @param other the other definition to check.
     * @return true if the definition is an instance of the other definition.
     * @throws QuickFixException never - this should be removed.
     */
    boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException;

    DefDescriptor<? extends ProviderDef> getProviderDescriptor() throws QuickFixException;

    ProviderDef getProviderDef() throws QuickFixException;

    ProviderDef getLocalProviderDef() throws QuickFixException;

    @Deprecated
    List<DefDescriptor<?>> getBundle();

    DocumentationDef getDocumentationDef() throws QuickFixException;
}
