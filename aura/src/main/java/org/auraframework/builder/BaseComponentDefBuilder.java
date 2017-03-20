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
package org.auraframework.builder;

import java.util.Collection;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseComponentDef.RenderType;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.def.LocatorDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.design.DesignDef;

/**
 */
public interface BaseComponentDefBuilder<T extends BaseComponentDef> extends RootDefinitionBuilder<T> {
    BaseComponentDefBuilder<T> setAbstract(boolean abs);

    BaseComponentDefBuilder<T> setExtensible(boolean extensible);

    BaseComponentDefBuilder<T> setModelDef(ModelDef modelDef);

    BaseComponentDefBuilder<T> setTemplateDef(ComponentDef templateDef);

    BaseComponentDefBuilder<T> setDesignDef(DesignDef designDef);

    BaseComponentDefBuilder<T> setSVGDef(SVGDef svgDef);

    BaseComponentDefBuilder<T> setTemplate(String templateName);

    BaseComponentDefBuilder<T> setStyleDefExternal(DefDescriptor<StyleDef> styleDefDescriptor);

    BaseComponentDefBuilder<T> setStyleDef(StyleDef styleDef);

    /**
     * Add a renderer descriptor.
     */
    BaseComponentDefBuilder<T> addRendererDescriptor(DefDescriptor<RendererDef> rendererDef);

    /**
     * Add a controller descriptor.
     */
    BaseComponentDefBuilder<T> addControllerDescriptor(DefDescriptor<ControllerDef> controllerDef);

    /**
     * Add an interface descriptor.
     *
     * @param interfaceDef the interface descriptor to add.
     */
    BaseComponentDefBuilder<T> addInterfaceDescriptor(DefDescriptor<InterfaceDef> interfaceDef);

    /**
     * Add a helper descriptor.
     *
     * @param helperDef the helper descriptor to add.
     */
    BaseComponentDefBuilder<T> addHelperDescriptor(DefDescriptor<HelperDef> helperDef);

    BaseComponentDefBuilder<T> setRenderType(RenderType renderType);

    BaseComponentDefBuilder<T> setFacet(String key, Object value);

    BaseComponentDefBuilder<T> addClientLibrary(ClientLibraryDef clientLibrary);

    BaseComponentDefBuilder<T> addLocatorDef(LocatorDef locator);

    BaseComponentDefBuilder<T> setExtendsDescriptor(DefDescriptor<T> extendsDescriptor);

    DefDescriptor<T> getExtendsDescriptor();

    BaseComponentDefBuilder<T> addLibraryImport(LibraryDefRef newImport);

    Collection<LibraryDefRef> getLibraryImports();

    /**
     * Specifies the default flavor (the name of a flavor in the component bundle flavor def).
     *
     * @param defaultFlavor Name of a flavor in the component bundle {@link FlavoredStyleDef}, e.g., "primary".
     * @see FlavoredStyleDef
     */
    BaseComponentDefBuilder<T> setDefaultFlavor(String defaultFlavor);

    /**
     * Specifies that this component has a child component def ref (e.g., html element) that has aura:flavorable.
     *
     * @see FlavoredStyleDef
     */
    BaseComponentDefBuilder<T> setHasFlavorableChild(boolean hasFlavorableChild);

    /**
     * Specifies whether this component is dynamically flavorable.
     */
    BaseComponentDefBuilder<T> setDynamicallyFlavorable(boolean dynamicallyFlavorable);

    BaseComponentDefBuilder<T> setClientModelDef(ModelDef clientModelDef);
    BaseComponentDefBuilder<T> setClientRendererDef(RendererDef clientRendererDef);
    BaseComponentDefBuilder<T> setClientHelperDef(HelperDef clientHelperDef);
    BaseComponentDefBuilder<T> setClientControllerDef(ControllerDef clientControllerDef);
    BaseComponentDefBuilder<T> setClientProviderDef(ProviderDef clientProviderDef);
    BaseComponentDefBuilder<T> setFlavoredStyle(FlavoredStyleDef flavoredStyle);

    ModelDef getClientModelDef();
    RendererDef getClientRendererDef();
    HelperDef getClientHelperDef();
    ControllerDef getClientControllerDef();
    ProviderDef getClientProviderDef();

    BaseComponentDefBuilder<T> setMinifyEnabled(boolean minify);

    BaseComponentDefBuilder<T> addDependency(DependencyDef dependency);

    void finish();
}
