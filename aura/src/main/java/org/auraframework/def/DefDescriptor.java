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

import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignTemplateDef;
import org.auraframework.def.design.DesignTemplateRegionDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonSerializable;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * A descriptor "handle" for a definition. For applications which care about sorting, such as generating a unique hash
 * from an application and all its dependencies, descriptors are comparable by their qualified name
 * (case-insensitively).
 *
 * @param <T> the more specific subtype of definition being described, e.g. {@link ComponentDef}, {@link EventDef}, etc.
 */
public interface DefDescriptor<T extends Definition> extends JsonSerializable,
        Serializable, Comparable<DefDescriptor<?>> {

    String MARKUP_PREFIX = "markup";
    String CSS_PREFIX = "css";
    String TEMPLATE_CSS_PREFIX = "templateCss";
    String CUSTOM_FLAVOR_PREFIX = "customFlavorCss";
    String JAVASCRIPT_PREFIX = "js";
    String COMPOUND_PREFIX = "compound";
    String JAVA_PREFIX = "java";

    /**
     * @return The name of this descriptor
     */
    String getName();

    /**
     * @return The pseudo-protocol, namespace, and name of this descriptor
     */
    String getQualifiedName();

    /**
     * @return the namespace and name portion of this descriptor for cases where the prefix/protocol is already known.
     */
    String getDescriptorName();

    /**
     * @return The prefix/protocol of this descriptor
     */
    String getPrefix();

    /**
     * @return the namespace, if this descriptor has one
     */
    String getNamespace();

    /**
     * @return The portion of a name occurring within any generic delimiters, such as < >, including said delimiters
     */
    String getNameParameters();

    /**
     * @return isParameterized - identifies if additional processing is warranted to consider generic collections should
     *         be considered
     */
    boolean isParameterized();

    /**
     * @return The type of this definition, which can be used to branch and parse serialized representations
     */
    DefType getDefType();

    /**
     * get the 'bundle' for this descriptor.
     *
     * If we have a bundle for the descriptor, then the descriptor is for a file within the bundle, and it is fully
     * specified by the bundle descriptor plus the name from this descriptor.
     *
     * @return the bundle associated with this descriptor.
     */
    DefDescriptor<? extends Definition> getBundle();

    /**
     * Gets the actual definition described by this descriptor, compiling it if necessary, from Aura's definition
     * service.
     *
     * @return the definition (compiles it if necessary)
     * @throws QuickFixException if the definition is not found
     * @deprecated
     */
    @Deprecated
    T getDef() throws QuickFixException;

    /**
     * @return true if the definition represented by this descriptor exists at all. does not compile the definition
     */
    boolean exists();

    enum DefType {
        ATTRIBUTE(AttributeDef.class), //
        APPLICATION(ApplicationDef.class, true), //
        COMPONENT(ComponentDef.class, true), //
        EVENT(EventDef.class, true), //
        HELPER(HelperDef.class), //
        INTERFACE(InterfaceDef.class, true), //
        CONTROLLER(ControllerDef.class), //
        METHOD(MethodDef.class), //
        MODEL(ModelDef.class), //
        LIBRARY(LibraryDef.class, true), //
        INCLUDE(IncludeDef.class), //
        INCLUDE_REF(IncludeDefRef.class), //
        RENDERER(RendererDef.class), //
        ACTION(ActionDef.class), //
        TYPE(TypeDef.class), //
        STYLE(StyleDef.class), //
        FLAVORED_STYLE(FlavoredStyleDef.class), //
        FLAVORS(FlavorsDef.class), //
        FLAVOR_DEFAULT(FlavorDefaultDef.class), //
        FLAVOR_INCLUDE(FlavorIncludeDef.class), //
        FLAVOR_BUNDLE(FlavorBundleDef.class, true), //
        TOKEN(TokenDef.class), //
        TOKENS(TokensDef.class, true), //
        TOKENS_IMPORT(TokensImportDef.class), //
        TOKEN_DESCRIPTOR_PROVIDER(TokenDescriptorProviderDef.class), //
        TOKEN_MAP_PROVIDER(TokenMapProviderDef.class), //
        DOCUMENTATION(DocumentationDef.class), //
        DESCRIPTION(DescriptionDef.class), //
        EXAMPLE(ExampleDef.class), //
        TESTSUITE(TestSuiteDef.class), //
        TESTCASE(TestCaseDef.class), //
        PROVIDER(ProviderDef.class), //
        REQUIRED_VERSION(RequiredVersionDef.class), //
        DESIGN(DesignDef.class),
        ATTRIBUTE_DESIGN(DesignAttributeDef.class),
        DESIGN_TEMPLATE(DesignTemplateDef.class),
        DESIGN_TEMPLATE_REGION(DesignTemplateRegionDef.class),
        SVG(SVGDef.class),

        /* TODO: MODULE */
        MODULE(ModuleDef.class),

        REGISTEREVENT(RegisterEventDef.class);
        private static Map<Class<? extends Definition>, DefType> defTypeMap;

        private final Class<? extends Definition> clz;
        private final boolean definesBundle;
        DefType(Class<? extends Definition> clz) {
            this(clz, false);
        }

        DefType(Class<? extends Definition> clz, boolean definesBundle) {
            this.clz = clz;
            this.definesBundle = definesBundle;
            mapDefType(clz, this);
        }

        private static void mapDefType(Class<? extends Definition> clz, DefType defType) {
            if (defTypeMap == null) {
                defTypeMap = new HashMap<>();
            }

            defTypeMap.put(clz, defType);
        }

        public static boolean hasDefType(Class<?> primaryInterface) {
            return defTypeMap.containsKey(primaryInterface);
        }

        public static DefType getDefType(
                Class<? extends Definition> primaryInterface) {
            DefType ret = defTypeMap.get(primaryInterface);
            if (ret == null) {
                String message = String
                        .format("Unsupported Java Interface %s specified for DefDescriptor. Valid types are : %s",
                                primaryInterface.getName(), defTypeMap.keySet()
                                        .toString());
                throw new AuraRuntimeException(message);
            }
            return ret;
        }

        public Class<? extends Definition> getPrimaryInterface() {
            return clz;
        }

        /**
         * Indicated this def type can stand alone in a bundle.
         */
        public boolean definesBundle() {
            return definesBundle;
        }
    }

    final class DescriptorKey {
        private final String name;
        private final Class<? extends Definition> clazz;
        private final DefDescriptor<? extends Definition> bundle;

        public DescriptorKey(String name, Class<? extends Definition> clazz) {
            this(name, clazz, null);
        }

        public DescriptorKey(String name, Class<? extends Definition> clazz, DefDescriptor<? extends Definition> bundle) {
            // FIXME: this case flattening would remove the extra copies of
            // definitions.
            // If we go case sensitive, we won't want it though.
            // this.qualifiedName = qualifiedName.toLowerCase();
            this.name = name;
            this.clazz = clazz;
            this.bundle = bundle;
        }

        @Override
        public int hashCode() {
            return new HashCodeBuilder().append(name).append(clazz).append(bundle).build();
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (!(obj instanceof DescriptorKey)) {
                return false;
            }
            DescriptorKey dk = (DescriptorKey) obj;
            return dk.clazz.equals(clazz) && dk.name.equals(name)
                    && (dk.bundle == bundle || dk.bundle != null && dk.bundle.equals(bundle));
        }

        public String getName() {
            return name;
        }

        public Class<? extends Definition> getClazz() {
            return clazz;
        }

        public DefDescriptor<? extends Definition> getBundle() {
            return bundle;
        }
    }
}
