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
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.StyleDef;

/**
 */
public interface BaseComponentDefBuilder<T extends BaseComponentDef> extends RootDefinitionBuilder<T> {
    BaseComponentDefBuilder<T> setAbstract(boolean abs);

    BaseComponentDefBuilder<T> setExtensible(boolean extensible);

    BaseComponentDefBuilder<T> setModelDef(ModelDef modelDef);

    BaseComponentDefBuilder<T> setTemplateDef(ComponentDef templateDef);

    BaseComponentDefBuilder<T> setTemplate(String templateName);

    BaseComponentDefBuilder<T> setStyleDef(StyleDef styleDef);

    BaseComponentDefBuilder<T> addRendererDef(RendererDef rendererDef);

    BaseComponentDefBuilder<T> addControllerDef(ControllerDef controllerDef);

    BaseComponentDefBuilder<T> addInterfaceDef(InterfaceDef interfaceDef);

    BaseComponentDefBuilder<T> setRenderType(RenderType renderType);

    BaseComponentDefBuilder<T> setWhitespaceBehavior(WhitespaceBehavior whitespaceBehavior);

    BaseComponentDefBuilder<T> setFacet(String key, Object value);
}
