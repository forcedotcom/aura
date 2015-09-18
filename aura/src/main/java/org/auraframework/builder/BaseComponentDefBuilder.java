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

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseComponentDef.RenderType;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
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

    BaseComponentDefBuilder<T> setStyleDef(StyleDef styleDef);

    BaseComponentDefBuilder<T> addRendererDef(RendererDef rendererDef);

    BaseComponentDefBuilder<T> addControllerDef(ControllerDef controllerDef);

    BaseComponentDefBuilder<T> addInterfaceDef(InterfaceDef interfaceDef);

    BaseComponentDefBuilder<T> setRenderType(RenderType renderType);

    BaseComponentDefBuilder<T> setWhitespaceBehavior(WhitespaceBehavior whitespaceBehavior);

    BaseComponentDefBuilder<T> setFacet(String key, Object value);

    BaseComponentDefBuilder<T> addClientLibrary(ClientLibraryDef clientLibrary);

    /**
     * Specifies the token descriptors.
     *
     * @param tokenOverrides Comma-separated list of token descriptors.
     */
    BaseComponentDefBuilder<T> setTokenOverrides(String tokenOverrides);

    /**
     * Same as {@link #setTokenOverrides(String)}.
     *
     * @param tokenOverride The {@link TokensDef} descriptor.
     */
    BaseComponentDefBuilder<T> setTokenOverride(DefDescriptor<TokensDef> tokenOverride);

    /**
     * Specifies the {@link FlavorsDef} descriptor.
     *
     * @param flavorOverride The {@link FlavorsDef} descriptor.
     */
    BaseComponentDefBuilder<T> setFlavorOverrides(DefDescriptor<FlavorsDef> flavorOverrides);

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
}
