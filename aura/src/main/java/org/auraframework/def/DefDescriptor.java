/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonSerializable;

/**
 * A descriptor "handle" for a definition. For applications which care about sorting, such as generating a unique hash
 * from an application and all its dependencies, descriptors are comparable by their qualified name
 * (case-insensitively).
 * 
 * @param <T> the more specific subtype of definition being described, e.g. {@link ComponentDef}, {@link EventDef}, etc.
 */
public interface DefDescriptor<T extends Definition> extends JsonSerializable, Serializable,
        Comparable<DefDescriptor<?>> {

    public static final String MARKUP_PREFIX = "markup";
    public static final String CSS_PREFIX = "css";
    public static final String TEMPLATE_CSS_PREFIX = "templateCss";
    public static final String JAVASCRIPT_PREFIX = "js";
    public static final String COMPOUND_PREFIX = "compound";
    public static final String JAVA_PREFIX = "java";

    public static enum DefType {
        ATTRIBUTE(AttributeDef.class, 'B'), //
        APPLICATION(ApplicationDef.class, 'A'), //
        COMPONENT(ComponentDef.class, 'C'), //
        EVENT(EventDef.class, 'E'), //
        HELPER(HelperDef.class, 'H'), //
        INTERFACE(InterfaceDef.class, 'I'), //
        CONTROLLER(ControllerDef.class, 'X'), //
        MODEL(ModelDef.class, 'M'), //
        RENDERER(RendererDef.class, 'R'), //
        SECURITY_PROVIDER(SecurityProviderDef.class, 'S'), //
        ACTION(ActionDef.class, 'O'), //
        TYPE(TypeDef.class, 'T'), //
        STYLE(ThemeDef.class, 'Y'), //
        DOCUMENTATION(DocumentationDef.class, 'D'), //
        TESTSUITE(TestSuiteDef.class, 'U'), //
        TESTCASE(TestCaseDef.class, 'V'), //
        PROVIDER(ProviderDef.class, 'P'), //
        LAYOUTS(LayoutsDef.class, 'K'), //
        LAYOUT(LayoutDef.class, 'L'), //
        LAYOUT_ITEM(LayoutItemDef.class, 'J'),
        NAMESPACE(NamespaceDef.class, 'N');

        private static Map<Class<? extends Definition>, DefType> defTypeMap;
        private static Map<String, DefType> sTypeMap;

        private final Class<? extends Definition> clz;
        private final String stype;

        private DefType(Class<? extends Definition> clz, char stype) {
            this.clz = clz;
            this.stype = String.valueOf(stype);

            mapDefType(clz, this.stype, this);
        }

        private static void mapDefType(Class<? extends Definition> clz, String stype, DefType defType) {
            if (defTypeMap == null) {
                defTypeMap = new HashMap<Class<? extends Definition>, DefType>();
                sTypeMap = new HashMap<String, DefType>();
            }
            if (defTypeMap.get(clz) != null) {
                throw new AuraError("Duplicate types for " + clz);
            }
            if (sTypeMap.get(stype) != null) {
                throw new AuraError("Duplicate marker for " + stype);
            }
            defTypeMap.put(clz, defType);
            sTypeMap.put(stype, defType);
        }

        public Class<? extends Definition> getPrimaryInterface() {
            return clz;
        }

        public String getSType() {
            return stype;
        }

        public static boolean hasDefType(Class<?> primaryInterface) {
            return defTypeMap.containsKey(primaryInterface);
        }

        public static DefType getDefType(Class<? extends Definition> primaryInterface) {
            DefType ret = defTypeMap.get(primaryInterface);
            if (ret == null) {
                String message = String.format(
                        "Unsupported Java Interface %s specified for DefDescriptor. Valid types are : %s",
                        primaryInterface.getName(), defTypeMap.keySet().toString());
                throw new AuraRuntimeException(message);
            }
            return ret;
        }

        public static DefType getDefType(String stype) {
            DefType ret = sTypeMap.get(stype);
            if (ret == null) {
                String message = String.format(
                        "Unsupported marker %s specified for DefDescriptor. Valid markers are : %s",
                        stype, sTypeMap.keySet().toString());
                throw new AuraRuntimeException(message);
            }
            return ret;
        }
    }

    /**
     * @return The name of this descriptor
     */
    String getName();

    /**
     * @return The type, pseudo-protocol, namespace, and name of this descriptor
     */
    String getFullyQualifiedName();

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
     * Gets the actual definition described by this descriptor, compiling it if necessary, from Aura's definition
     * service.
     * 
     * @return the definition (compiles it if necessary)
     * @throws QuickFixException if the definition is not found
     */
    T getDef() throws QuickFixException;

    /**
     * @return true if the definition represented by this descriptor exists at all. does not compile the definition
     */
    boolean exists();
}
