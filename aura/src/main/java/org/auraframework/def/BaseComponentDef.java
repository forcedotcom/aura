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

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.design.DesignDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Common base for ComponentDef and ApplicationDef
 */
public interface BaseComponentDef extends RootDefinition {

    /**
     * Get the component descriptor.
     */
    @Override
    DefDescriptor<? extends BaseComponentDef> getDescriptor();

    /**
     * is the component extensible?
     *
     * @return true if this component can be extended
     */
    boolean isExtensible();

    /**
     * Is this component abstract.
     *
     * @return true if this component cannot be instantiated.
     */
    boolean isAbstract();

    /**
     * Is this component a template.
     *
     * FIXME: this should really be a different type.
     *
     * @return true if this component is a template.
     */
    boolean isTemplate();

    /**
     * Get the set of dependencies declared on this component.
     *
     * These dependencies must be loaded for the component to be functional, either at the initial load time or before
     * rendering. These dependencies are in the form of DescriptorFilters which can then be used to match the actual
     * descriptors.
     *
     * @return the list of declared dependencies for the component.
     */
    List<DependencyDef> getDependencies();

    /**
     * Get the set of dependencies tracked by the server.
     *
     * These only dependencies that the client should indicates has having or not, using the 'loaded"
     * context attribute during communications.
     *
     */
    List<DefDescriptor<ComponentDef>> getTrackedDependencies();

    /**
     * Get the event handlers for the component.
     *
     * @return all the handlers on this component, including those inherited
     * @throws QuickFixException
     */
    Collection<EventHandlerDef> getHandlerDefs() throws QuickFixException;

    /**
     * Get the library import statements for the component.
     *
     * @return all library requirements on this component, including those inherited
     * @throws QuickFixException
     */
    List<LibraryDefRef> getImports() throws QuickFixException;

    /**
     * @return All the locators defined in this component def
     */
    Map<String, LocatorDef> getLocators();

    List<DefDescriptor<ModelDef>> getModelDefDescriptors() throws QuickFixException;

    List<DefDescriptor<ControllerDef>> getControllerDefDescriptors() throws QuickFixException;

    ModelDef getModelDef() throws QuickFixException;

    ControllerDef getControllerDef() throws QuickFixException;

    HelperDef getHelperDef() throws QuickFixException;

    /**
     * Get the code for the client side for this component.
     *
     * @param minify should it be the minified version or not.
     */
    String getCode(boolean minify);

    @Override
    ProviderDef getProviderDef() throws QuickFixException;

    ControllerDef getLocalControllerDef() throws QuickFixException;

    DefDescriptor<? extends BaseComponentDef> getExtendsDescriptor();

    DefDescriptor<RendererDef> getRendererDescriptor() throws QuickFixException;

    FlavoredStyleDef getFlavoredStyleDef() throws QuickFixException;

    Set<PropertyReference> getExpressionRefs();

    List<AttributeDefRef> getFacets();

    Map<DefDescriptor<MethodDef>, MethodDef> getMethodDefs() throws QuickFixException;

    RendererDef getLocalRendererDef() throws QuickFixException;

    boolean isLocallyRenderable() throws QuickFixException;

    ComponentDef getTemplateDef() throws QuickFixException;

    DefDescriptor<ComponentDef> getTemplateDefDescriptor();

    public List<ClientLibraryDef> getClientLibraries();

    public static enum RenderType {
        SERVER, CLIENT, AUTO
    };

    RenderType getRender();

    Set<DefDescriptor<InterfaceDef>> getInterfaces();

    boolean hasLocalDependencies() throws QuickFixException;

    /**
     * Adds specified client libraries to definition
     *
     * @param clientLibs list of client libraries
     */
    void addClientLibs(List<ClientLibraryDef> clientLibs);

    /**
     * Gets the default flavor name, or if an explicit defaultFlavor is not specified, and a {@link FlavoredStyleDef}
     * exists in the bundle with a flavor named "default", then "default" will be returned.
     * <p>
     * WARNING: This method may potentially load a {@link FlavoredStyleDef}. Do not call in places where loading a
     * definition may be inappropriate (e.g., in a validateDefinition impl).
     *
     * @return The default flavor if specified, or the implicit default flavor "default" if defined, or null if neither
     *         apply.
     * @throws QuickFixException If there is a problem loading the flavor def.
     */
    String getDefaultFlavorOrImplicit() throws QuickFixException;

    /**
     * Returns true if this component has a child component def ref html element that has aura:flavorable. To check
     * whether a parent component has a flavorable child, use {@link #inheritsFlavorableChild()} instead (or as well).
     *
     * @see FlavoredStyleDef
     */
    boolean hasFlavorableChild();

    /**
     * Returns true if any super component has a child component def ref html element that has aura:flavorable. To check
     * this component itself use {@link #hasFlavorableChild()} instead (or as well).
     * @throws QuickFixException If there is a problem loading a parent def.
     */
    boolean inheritsFlavorableChild() throws QuickFixException;

    /**
     * Returns true if this component or any super component has the dynamicallyFlavorable attribute set as true.
     *
     * @throws QuickFixException If there is a problem loading the parent def.
     */
    boolean isDynamicallyFlavorable() throws QuickFixException;

    /**
     * Gets the set of defined flavor names in this component and all parent components.
     *
     * @return The set of defined flavor names.
     * @throws QuickFixException If there is a problem loading a flavor or parent def.
     */
    Set<String> getAllFlavorNames() throws QuickFixException;

    //
    // Bundled Defs.
    //
    ControllerDef getRemoteControllerDef();
    HelperDef getRemoteHelperDef();
    ProviderDef getRemoteProviderDef();
    RendererDef getRemoteRendererDef();
    StyleDef getStyleDef();
    DefDescriptor<DesignDef> getDesignDefDescriptor();
    DesignDef getDesignDef();
    SVGDef getSVGDef();
    // FIXME: this should be deprecated.
    DefDescriptor<SVGDef> getSVGDefDescriptor();
}
