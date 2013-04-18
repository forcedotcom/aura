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
package org.auraframework.impl.context;

import java.util.EnumMap;
import java.util.Map;

import org.auraframework.adapter.PrefixDefaultsAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.AuraContext.Mode;

public class AuraPrefixDefaultsProviderImpl implements PrefixDefaultsAdapter {

    protected static final Map<DefType, String> defaults = new EnumMap<DefType, String>(DefType.class);

    static {
        defaults.put(DefType.ACTION, DefDescriptor.JAVA_PREFIX);
        defaults.put(DefType.COMPONENT, DefDescriptor.MARKUP_PREFIX);
        defaults.put(DefType.CONTROLLER, DefDescriptor.JAVA_PREFIX);
        defaults.put(DefType.MODEL, DefDescriptor.JAVA_PREFIX);
        defaults.put(DefType.NAMESPACE, DefDescriptor.MARKUP_PREFIX);
        defaults.put(DefType.EVENT, DefDescriptor.MARKUP_PREFIX);
        defaults.put(DefType.INTERFACE, DefDescriptor.MARKUP_PREFIX);
        defaults.put(DefType.STYLE, DefDescriptor.CSS_PREFIX);
        defaults.put(DefType.TYPE, DefDescriptor.JAVA_PREFIX);
        defaults.put(DefType.RENDERER, DefDescriptor.JAVASCRIPT_PREFIX);
        defaults.put(DefType.PROVIDER, DefDescriptor.JAVA_PREFIX);
        defaults.put(DefType.SECURITY_PROVIDER, DefDescriptor.JAVA_PREFIX);
        defaults.put(DefType.TESTSUITE, DefDescriptor.JAVASCRIPT_PREFIX);
    }

    @Override
    public Map<DefType, String> getPrefixDefaults(Mode mode) {
        return AuraPrefixDefaultsProviderImpl.defaults;
    }

}
