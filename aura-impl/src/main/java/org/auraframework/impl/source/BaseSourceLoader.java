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

import java.util.EnumMap;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.system.SourceLoader;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

/**
 * Abstract superclass to {@link SourceLoader} implementations, providing common
 * descriptor and filename utilities.ß
 */
public abstract class BaseSourceLoader implements SourceLoader {

    protected static final EnumMap<DefType, String> extensions = new EnumMap<DefType, String>(DefType.class);
    public static final Set<String> PREFIXES = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX);
    public static final String FILE_SEPARATOR = System.getProperty("file.separator");

    static {
        extensions.put(DefType.APPLICATION, ".app");
        extensions.put(DefType.COMPONENT, ".cmp");
        extensions.put(DefType.EVENT, ".evt");
        extensions.put(DefType.INTERFACE, ".intf");
        extensions.put(DefType.STYLE, ".css");
        extensions.put(DefType.LAYOUTS, "Layouts.xml");
        extensions.put(DefType.NAMESPACE, ".xml");
        extensions.put(DefType.TESTSUITE, "Test.js");
    }

    protected String getPath(DefDescriptor<?> descriptor) {
        // Get rid of the inner type qualifier.
        String name = AuraTextUtil.splitSimple("$", descriptor.getName()).get(0);
        String namespace = descriptor.getNamespace();
        String filename = null;

        if (descriptor.getDefType() == DefType.NAMESPACE) {

            filename = String.format("%s/%s%s", namespace, namespace, extensions.get(descriptor.getDefType()));
        } else if (extensions.containsKey(descriptor.getDefType())) {
            // Alongside knowing the extension, we also know that namespace+name
            // is a directory,
            // and name+ext is the file inside that directory:
            filename = String.format("%s/%s/%s%s", namespace, name, name, extensions.get(descriptor.getDefType()));
        } else {
            // Otherwise, the extension matches the expected implementation
            // language, we need to
            // convert the namespace from dotted-package to slash-filename, and
            // we NOT repeat name:
            filename = String.format("%s/%s.%s", namespace.replace(".", FILE_SEPARATOR), name, descriptor.getPrefix());
        }
        return filename;
    }

    @SuppressWarnings("unchecked")
    protected <D extends Definition> DefDescriptor<D> updateDescriptorName(DefDescriptor<D> desc, String newNamespace,
            String newName) {
        String ext = extensions.get(desc.getDefType());
        String name = newName;
        if (name.endsWith(ext)) {
            name = name.substring(0, name.length() - ext.length());
        }
        String format = DefDescriptor.MARKUP_PREFIX.equals(desc.getPrefix()) ? "%s://%s:%s" : "%s://%s.%s";
        return (DefDescriptor<D>) Aura.getDefinitionService().getDefDescriptor(
                String.format(format, desc.getPrefix(), newNamespace, name), desc.getDefType().getPrimaryInterface());
    }

    @Override
    public Set<String> getPrefixes() {
        return PREFIXES;
    }

    protected static String getQName(DefType defType, String namespace, String name) {
        String ext = extensions.get(defType);
        if (name.endsWith(ext)) {
            name = name.substring(0, name.length() - ext.length());
        }
        String qname;
        if (defType == DefType.STYLE) {
            qname = String.format("css://%s.%s", namespace, name);
        } else if (defType == DefType.TESTSUITE) {
            qname = String.format("js://%s.%s", namespace, name);
        } else {
            qname = String.format("markup://%s:%s", namespace, name);
        }
        return qname;
    }

    @Override
    public Set<DefType> getDefTypes() {
        return extensions.keySet();
    }

    protected static boolean isValidNameForDefType(DefType defType, String name) {
        String ext = extensions.get(defType);
        if (ext == null) {
            return false;
        }
        return name.endsWith(ext);
    }

}
