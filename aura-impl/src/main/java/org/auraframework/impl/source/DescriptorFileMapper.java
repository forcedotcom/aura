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

import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * Abstract superclass to {@link SourceLoader} implementations, providing common descriptor and filename utilities.
 */
public class DescriptorFileMapper {

    public static final String FILE_SEPARATOR = System.getProperty("file.separator");

    public enum NameFormat {
        BUNDLE, // ! A 'bundle' file like controller, component, app, helper.
        BUNDLED_EXTRA, // ! An 'extra' file e.g. library include js file
    };

    protected static final class ExtensionInfo {
        public final String extension;
        public final NameFormat nameFormat;
        public final String prefix;
        public final DefType defType;
        public final Format format;
        public final DefType bundleDefType;

        public ExtensionInfo(String extension, NameFormat nameFormat, String prefix, DefType defType, Format format, DefType bundleDefType) {
            this.extension = extension;
            this.nameFormat = nameFormat;
            this.prefix = prefix;
            this.defType = defType;
            this.format = format;
            this.bundleDefType = bundleDefType;
        }

        @Override
        public String toString() {
            return "ExtensionInfo{" + this.extension + ", " + this.prefix + ", " + this.nameFormat
                    + ", " + this.defType + ", " + this.format + "}";
        }
    }

    protected final static Map<String, List<ExtensionInfo>> byExtension = Maps.newHashMapWithExpectedSize(32);
    private final static Map<String, Map<DefType, ExtensionInfo>> byCompound = Maps.newHashMapWithExpectedSize(8);
    private final static Map<NameFormat, Map<String, List<ExtensionInfo>>> byNameFormatCompound = Maps.newHashMapWithExpectedSize(4);
    private final static Set<DefType> defTypes = Sets.newHashSet();
    private final static Set<String> prefixes = Sets.newHashSet();

    protected synchronized static void addExtension(String extension, NameFormat nameFormat,
            String prefix, DefType defType, Format format) {
        addExtension(extension, nameFormat, prefix, defType, format, null);
    }

    protected synchronized static void addExtension(String extension, NameFormat nameFormat,
            String prefix, DefType defType, Format format, DefType bundleDefType) {
        ExtensionInfo ei = new ExtensionInfo(extension, nameFormat, prefix, defType, format, bundleDefType);

        List<ExtensionInfo> eiList = byExtension.get(ei.extension.toLowerCase());
        if (eiList == null) {
            eiList = Lists.newArrayList();
            byExtension.put(ei.extension.toLowerCase(), eiList);
        }
        eiList.add(ei);

        Map<DefType, ExtensionInfo> defTypeMap = byCompound.get(ei.prefix.toLowerCase());
        if (defTypeMap == null) {
            defTypeMap = Maps.newHashMap();
            byCompound.put(ei.prefix.toLowerCase(), defTypeMap);
        }
        defTypeMap.put(defType, ei);

        // index by nameFormat => { extension => ei } for cases where the extensions are the same
        Map<String, List<ExtensionInfo>> extMap = byNameFormatCompound.get(nameFormat);
        if (extMap == null) {
            extMap = Maps.newHashMap();
            byNameFormatCompound.put(nameFormat, extMap);
        }
        eiList = extMap.get(ei.extension.toLowerCase());
        if (eiList == null) {
            eiList = Lists.newArrayList();
            extMap.put(ei.extension.toLowerCase(), eiList);
        }
        eiList.add(ei);

        defTypes.add(defType);
        prefixes.add(ei.prefix.toLowerCase());
    }

    private boolean havePrefix(DefDescriptor<?> desc) {
        return byCompound.get(desc.getPrefix().toLowerCase()) != null;
    }

    protected ExtensionInfo getExtensionInfo(DefDescriptor<?> desc) {
        Map<DefType, ExtensionInfo> defTypeMap = byCompound.get(desc.getPrefix().toLowerCase());
        if (defTypeMap != null) {
            return defTypeMap.get(desc.getDefType());
        }
        return null;
    }

    static {
        addExtension(".app", NameFormat.BUNDLE, "markup", DefType.APPLICATION, Format.XML);
        addExtension(".cmp", NameFormat.BUNDLE, "markup", DefType.COMPONENT, Format.XML);
        addExtension(".evt", NameFormat.BUNDLE, "markup", DefType.EVENT, Format.XML);
        addExtension(".lib", NameFormat.BUNDLE, "markup", DefType.LIBRARY, Format.XML);
        addExtension(".intf", NameFormat.BUNDLE, "markup", DefType.INTERFACE, Format.XML);
        addExtension(".tokens", NameFormat.BUNDLE, "markup", DefType.TOKENS, Format.XML);
        addExtension(".auradoc", NameFormat.BUNDLE, "markup", DefType.DOCUMENTATION, Format.XML);
        addExtension(".design", NameFormat.BUNDLE, "markup", DefType.DESIGN, Format.XML);
        addExtension(".svg", NameFormat.BUNDLE, "markup", DefType.SVG, Format.SVG);
        addExtension(".flavors", NameFormat.BUNDLE, "markup", DefType.FLAVORS, Format.XML);
        addExtension(".html", NameFormat.BUNDLE, "markup", DefType.MODULE, Format.XML);

        addExtension("Controller.js", NameFormat.BUNDLE, "js", DefType.CONTROLLER, Format.JS);
        addExtension("Renderer.js", NameFormat.BUNDLE, "js", DefType.RENDERER, Format.JS);
        addExtension("Provider.js", NameFormat.BUNDLE, "js", DefType.PROVIDER, Format.JS);
        addExtension("Helper.js", NameFormat.BUNDLE, "js", DefType.HELPER, Format.JS);
        addExtension("Model.js", NameFormat.BUNDLE, "js", DefType.MODEL, Format.JS);
        addExtension("Test.js", NameFormat.BUNDLE, "js", DefType.TESTSUITE, Format.JS);
        addExtension(".js", NameFormat.BUNDLED_EXTRA, "js", DefType.INCLUDE, Format.JS, DefType.LIBRARY);

        addExtension(".css", NameFormat.BUNDLED_EXTRA, DefDescriptor.CUSTOM_FLAVOR_PREFIX, DefType.FLAVORED_STYLE, Format.CSS, DefType.FLAVOR_BUNDLE);
        addExtension("Flavors.css", NameFormat.BUNDLE, DefDescriptor.CSS_PREFIX, DefType.FLAVORED_STYLE, Format.CSS);
        addExtension(".css", NameFormat.BUNDLE, "templateCss", DefType.STYLE, Format.TEMPLATE_CSS);
        addExtension(".css", NameFormat.BUNDLE, "css", DefType.STYLE, Format.CSS);
    }

    public static DefDescriptor<? extends Definition> getDescriptor(String filename) {
    	return getDescriptor(filename, FILE_SEPARATOR);
    }

    public static List<DefDescriptor<? extends Definition>> getAllDescriptors(String filename, String separator) {
        List<String> names = AuraTextUtil.splitSimple(separator, filename);
        if (names.size() < 3) {
            return null;
        }
        String last = names.get(names.size() - 1);
        String lastLower = (last == null ? last : last.toLowerCase());
        String name = names.get(names.size() - 2);
        String nameLower = (name == null ? name : name.toLowerCase());
        String ns = names.get(names.size() - 3);
        List<ExtensionInfo> eiList;
        List<DefDescriptor<?>> descList;
        //
        // First try the bundled type.
        //
        if (lastLower.startsWith(nameLower)) {
            String ext;
            ext = last.substring(name.length());
            eiList = byExtension.get(ext.toLowerCase());
            if (eiList != null) {
                descList = Lists.newArrayList();
                for (ExtensionInfo ei : eiList) {
                    if (ei.bundleDefType == null) {
                        descList.add(new DefDescriptorImpl<>(ei.prefix, ns, name, ei.defType.getPrimaryInterface()));
                    }
                }
                if (descList.size() > 0) {
                    return descList;
                }
            }
        }

        // bundle extras
        List<String> ext = AuraTextUtil.splitSimple(".", last);
        if (ext != null && ext.size() == 2) {
            Map<String, List<ExtensionInfo>> bundledExtras = byNameFormatCompound.get(NameFormat.BUNDLED_EXTRA);
            eiList = bundledExtras.get("." + ext.get(1));

            if (eiList != null) {
                descList = Lists.newArrayList();
                for (ExtensionInfo ei : eiList) {
                    if (ei.bundleDefType != null) {
                        DefDescriptor<? extends Definition> bundle = new DefDescriptorImpl<>(
                        DefDescriptor.MARKUP_PREFIX, ns, name, ei.bundleDefType.getPrimaryInterface());
                        descList.add(new DefDescriptorImpl<>(ei.prefix, ns, ext.get(0), ei.defType.getPrimaryInterface(), bundle));
                    }
                }
                if (descList.size() > 0) {
                    return descList;
                }
            }
        }

        return null;
    }

    public static List<DefDescriptor<? extends Definition>> getAllDescriptors(String filename) {
    	return getAllDescriptors(filename, FILE_SEPARATOR);
    }

    public static DefDescriptor<? extends Definition> getDescriptor(String filename, String separator) {
        List<DefDescriptor<? extends Definition>> descList = getAllDescriptors(filename, separator);
        if (descList == null || descList.size() == 0) {
            return null;
        }
        return descList.get(descList.size()-1);
    }

    protected Format getFormat(DefDescriptor<?> descriptor) {
        ExtensionInfo ei = getExtensionInfo(descriptor);
        if (ei != null) {
            return ei.format;
        }
        try {
            return Format.valueOf(descriptor.getPrefix().toUpperCase());
        } catch (Throwable t) {
            // Doh! don't know what the format is, just punt.
            return null;
        }
    }

    /**
     * The magic to convert a descriptor into a path.
     *
     * This handles all of the odd cases, including 'bundled' files like library includes.
     *
     * @param descriptor the descriptor for which we want a path.
     */
    protected String getPath(DefDescriptor<?> descriptor, String separator) {
        // Get rid of the inner type qualifier.
        ExtensionInfo ei;
        String name = descriptor.getName();
        String namespace = descriptor.getNamespace();
        DefDescriptor<?> bundle = descriptor.getBundle();

        ei = getExtensionInfo(descriptor);
        if (ei == null && !havePrefix(descriptor)) {
            // Assume we are java-like.
            // The extension matches the expected implementation language, we need to
            // convert the namespace from dotted-package to slash-filename, and we do NOT repeat name:
            // The $ split here is just wrong...
            //
            name = AuraTextUtil.splitSimple("$", name).get(0);
            return String.format("%s/%s.%s", namespace.replace(".", separator), name, descriptor.getPrefix());
        }
    	if (ei != null) {
	        switch (ei.nameFormat) {
	        case BUNDLED_EXTRA:
	            if (bundle == null) {
	                // whoops.
	                throw new AuraRuntimeException("Invalid " + descriptor + "@" + descriptor.getDefType() + " with ei="
	                        + ei);
	            }
	            return String.format("%s%s%s%s%s%s", namespace, separator, bundle.getName(), separator, name,
	                    ei.extension);
	        case BUNDLE:
	            if (bundle != null) {
	                // whoops.
	                throw new AuraRuntimeException("Invalid " + descriptor + "@" + descriptor.getDefType() + " with ei="
	                        + ei);
	            }
	            // Alongside knowing the extension, we also know that namespace+name is a directory,
	            // and name+ext is the file inside that directory:
	            return String.format("%s%s%s%s%s%s", namespace, separator, name, separator, name, ei.extension);
	        }
    	}
        throw new AuraRuntimeException("Could not get path for " + descriptor + "@" + descriptor.getDefType()
                + " with ei=" + ei);
    }

    protected String getPath(DefDescriptor<?> descriptor) {
    	return getPath(descriptor, FILE_SEPARATOR);
    }

    @SuppressWarnings("unchecked")
    protected <D extends Definition> DefDescriptor<D> updateDescriptorName(DefDescriptor<D> desc, String newNamespace,
            String newName) {
        ExtensionInfo ei = getExtensionInfo(desc);
        String name = newName;
        if (name.endsWith(ei.extension) || name.toLowerCase().endsWith(ei.extension.toLowerCase())) {
            name = name.substring(0, name.length() - ei.extension.length());
        }
        String format = DefDescriptor.MARKUP_PREFIX.equals(desc.getPrefix()) ? "%s://%s:%s" : "%s://%s.%s";
        return (DefDescriptor<D>) Aura.getDefinitionService().getDefDescriptor(
                String.format(format, desc.getPrefix(), newNamespace, name), ei.defType.getPrimaryInterface());
    }

    public Set<String> getPrefixes() {
        return prefixes;
    }

    public Set<DefType> getDefTypes() {
        return defTypes;
    }
}
