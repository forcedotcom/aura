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

import java.util.*;

import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Common base for ComponentDef and ApplicationDef
 */
public interface BaseComponentDef extends RootDefinition {

    @Override
    DefDescriptor<? extends BaseComponentDef> getDescriptor();

    boolean isExtensible();

    boolean isAbstract();

    /**
     * @return all the handlers on this component, including those inherited
     * @throws QuickFixException
     */
    Collection<EventHandlerDef> getHandlerDefs() throws QuickFixException;

    DefDescriptor<ModelDef> getLocalModelDefDescriptor();

    List<DefDescriptor<ModelDef>> getModelDefDescriptors() throws QuickFixException;

    List<DefDescriptor<ControllerDef>> getControllerDefDescriptors() throws QuickFixException;

    ModelDef getModelDef() throws QuickFixException;

    ControllerDef getControllerDef() throws QuickFixException;

    DefDescriptor<? extends BaseComponentDef> getExtendsDescriptor();

    DefDescriptor<RendererDef> getRendererDescriptor() throws QuickFixException;

    DefDescriptor<ThemeDef> getThemeDescriptor();

    List<AttributeDefRef> getFacets();

    RendererDef getLocalRendererDef() throws QuickFixException;

    boolean isLocallyRenderable() throws QuickFixException;

    ComponentDef getTemplateDef() throws QuickFixException;

    DefDescriptor<ComponentDef> getTemplateDefDescriptor();

    public static enum RenderType{SERVER,CLIENT,AUTO};

    RenderType getRender();

    HelperDef getHelperDef() throws QuickFixException;

    Set<DefDescriptor<InterfaceDef>> getInterfaces();

    boolean hasLocalDependencies() throws QuickFixException;

    public static enum WhitespaceBehavior{
        OPTIMIZE, /**< keep or eliminate insignificant whitespace as the framework determines is best */ 
        PRESERVE  /**< treat all whitespace as significant, hence preserving it  */
        };
    
    public static final WhitespaceBehavior DefaultWhitespaceBehavior = WhitespaceBehavior.OPTIMIZE;
    
    WhitespaceBehavior getWhitespaceBehavior();
    
}
