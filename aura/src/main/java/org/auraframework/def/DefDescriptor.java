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

import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonSerializable;

public interface DefDescriptor<T extends Definition> extends JsonSerializable, Serializable {

    public static final String MARKUP_PREFIX = "markup";
    public static final String CSS_PREFIX = "css";
    public static final String TEMPLATE_CSS_PREFIX = "templateCss";
    public static final String JAVASCRIPT_PREFIX = "js";
    public static final String COMPOUND_PREFIX = "compound";
    public static final String JAVA_PREFIX = "java";

    public static enum DefType {
        ATTRIBUTE(AttributeDef.class), //
        APPLICATION(ApplicationDef.class), //
        COMPONENT(ComponentDef.class), //
        EVENT(EventDef.class), //
        HELPER(HelperDef.class), //
        INTERFACE(InterfaceDef.class), //
        CONTROLLER(ControllerDef.class), //
        MODEL(ModelDef.class), //
        RENDERER(RendererDef.class), //
        SECURITY_PROVIDER(SecurityProviderDef.class), //
        ACTION(ActionDef.class), //
        TYPE(TypeDef.class), //
        STYLE(ThemeDef.class), //
        DOCUMENTATION(DocumentationDef.class), //
        TESTSUITE(TestSuiteDef.class), //
        TESTCASE(TestCaseDef.class), //
        PROVIDER(ProviderDef.class), //
        LAYOUTS(LayoutsDef.class), //
        LAYOUT(LayoutDef.class), //
        LAYOUT_ITEM(LayoutItemDef.class);

        private static Map<Class<? extends Definition>, DefType> defTypeMap;

        private final Class<? extends Definition> clz;

        private DefType(Class<? extends Definition> clz) {
            this.clz = clz;

            mapDefType(clz, this);
        }

        private static void mapDefType(Class<? extends Definition> clz, DefType defType) {
            if (defTypeMap == null) {
                defTypeMap = new HashMap<Class<? extends Definition>, DefType>();
            }

            defTypeMap.put(clz, defType);
        }

        public Class<? extends Definition> getPrimaryInterface() {
            return clz;
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
    }

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
     * @return the definition (compiles it if necessary)
     * @throws QuickFixException
     *             if the definition is not found
     */
    T getDef() throws QuickFixException;

    /**
     * @return true if the definition represented by this descriptor exists at all. does not compile the definition
     */
    boolean exists();
}
