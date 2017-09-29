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

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.throwable.quickfix.QuickFixException;



/**
 * A dependency entry for a uid+descriptor.
 *
 * This entry is created for each descriptor that a context uses at the top level. It is cached globally and
 * locally. The second version of the entry (with a quick fix) is only ever cached locally.
 *
 * all values are final, and unmodifiable.
 */
public class DependencyEntry {
    public final String uid;
    public final Map<DefDescriptor<? extends Definition>, Definition> dependencyMap;
    public final List<ClientLibraryDef> clientLibraries;
    public final Map<String, Set<PropertyReference>> globalReferencesMap;
    public final QuickFixException qfe;
    public final boolean cacheable;

    public DependencyEntry(String uid, Map<DefDescriptor<? extends Definition>, Definition> dependencyMap,
                           List<ClientLibraryDef> clientLibraries, boolean cacheable,
                           Map<String,Set<PropertyReference>> globalReferencesMap) {
        this.uid = uid;
        this.dependencyMap = Collections.unmodifiableMap(dependencyMap);
        this.clientLibraries = Collections.unmodifiableList(clientLibraries);
        this.qfe = null;
        this.cacheable = cacheable;
        if (globalReferencesMap != null) {
            this.globalReferencesMap = Collections.unmodifiableMap(globalReferencesMap);
        } else {
            this.globalReferencesMap = null;
        }
    }

    public DependencyEntry(QuickFixException qfe) {
        this.uid = null;
        this.dependencyMap = null;
        this.clientLibraries = null;
        this.qfe = qfe;
        this.cacheable = false;
        this.globalReferencesMap = null;
    }

    @Override
    public String toString() {
        StringBuffer sb = new StringBuffer();

        sb.append(uid);
        sb.append("[");
        sb.append(cacheable);
        sb.append("]");
        sb.append(" : ");
        if (qfe != null) {
            sb.append(qfe);
        } else {
            sb.append(dependencyMap);
        }
        return sb.toString();
    }
}
