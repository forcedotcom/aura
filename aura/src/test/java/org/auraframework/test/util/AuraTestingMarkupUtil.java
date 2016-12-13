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

package org.auraframework.test.util;

import java.io.IOException;
import java.io.StringWriter;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.RenderingService;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.springframework.context.annotation.Lazy;


@ServiceComponent
@Lazy
public class AuraTestingMarkupUtil {
    
    protected final static String baseApplicationTag = "<aura:application %s>%s</aura:application>";
    protected final static String baseComponentTag = "<aura:component %s>%s</aura:component>";
    
    protected final static String attributeStringMarkup = "<aura:attribute name=%s type='String'/>";
    protected final static String attributeBooleanMarkup = "<aura:attribute name=%s type='Boolean'/>";
    protected final static String attributeObjectMarkup = "<aura:attribute name=%s type='Object'/>";
    protected final static String attributeCmpMarkup = "<aura:attribute name=%s type='Aura.Component'/>";
    protected final static String attributeListMarkup = "<aura:attribute name=%s type='List'/>";
    protected final static String attributeStringListMarkup = "<aura:attribute name=%s type='String[]'/>";
    protected final static String attributeBooleanListMarkup = "<aura:attribute name=%s type='Boolean[]'/>";
    protected final static String attributeObjectListMarkup = "<aura:attribute name=%s type='Object[]'/>";
    protected final static String attributeCmpListMarkup = "<aura:attribute name=%s type='Aura.Component[]'/>";
    
    protected final static String attributeStringMarkupWithDefault = "<aura:attribute name=%s type='String' default=%s/>";
    protected final static String attributeBooleanMarkupWithDefault = "<aura:attribute name=%s type='Boolean' default=%s/>";
    protected final static String attributeObjectMarkupWithDefault = "<aura:attribute name=%s type='Object' default=%s/>";
    protected final static String attributeCmpMarkupWithDefault = "<aura:attribute name=%s type='Aura.Component' default=%s/>";
    protected final static String attributeListMarkupWithDefault = "<aura:attribute name=%s type='List' default=%s/>";
    protected final static String attributeStringListMarkupWithDefault = "<aura:attribute name=%s type='String[]' default=%s/>";
    protected final static String attributeBooleanListMarkupWithDefault = "<aura:attribute name=%s type='Boolean[]' default=%s/>";
    protected final static String attributeObjectListMarkupWithDefault = "<aura:attribute name=%s type='Object[]' default=%s/>";
    protected final static String attributeCmpListMarkupWithDefault = 
            "<aura:attribute name=%s type='Aura.Component[]'>" + "%s" + "</aura:attribute>";
    
    protected RenderingService renderingService;
    protected DefinitionService definitionService;
    
    public String getCommonAttributeMarkup(boolean getString, boolean getBoolean, boolean getObject, 
            boolean getComponent) {
        String attributeMarkup="";
        if(getString) {
            attributeMarkup = attributeMarkup+String.format(attributeStringMarkup,"'strAttr'");
        }
        if(getBoolean) {
            attributeMarkup = attributeMarkup+String.format(attributeBooleanMarkup,"'booleanAttr'");
        }
        if(getObject) {
            attributeMarkup = attributeMarkup+String.format(attributeObjectMarkup,"'objAttr'");
        }
        if(getComponent) {
            attributeMarkup = attributeMarkup+String.format(attributeCmpMarkup,"'cmpAttr'");
        }
        return attributeMarkup;
    }
    
    public String getAllCommonAttributeMarkup() {
        return getCommonAttributeMarkup(true,true,true,true);
    }
    
    public String getCommonAttributeWithDefaultMarkup(boolean getString, boolean getBoolean, boolean getObject, 
            boolean getComponent, String defaultString, String defaultBoolean, String defaultObject, String defaultComponent) 
    {
        String attributeMarkup="";
        if(getString) {
            attributeMarkup = attributeMarkup+String.format(attributeStringMarkupWithDefault,"'strAttrDefault'",defaultString);
        }
        if(getBoolean) {
            attributeMarkup = attributeMarkup+String.format(attributeBooleanMarkupWithDefault,"'booleanAttrDefault'", defaultBoolean);
        }
        if(getObject) {
            attributeMarkup = attributeMarkup+String.format(attributeObjectMarkupWithDefault,"'objAttrDefault'", defaultObject);
        }
        if(getComponent) {
            attributeMarkup = attributeMarkup+String.format(attributeCmpMarkupWithDefault,"'cmpAttrDefault'", defaultComponent);
        }
        return attributeMarkup;
    }
    
    public String getCommonAttributeListMarkup(boolean getList, boolean getString, boolean getBoolean, boolean getObject, 
            boolean getComponent) {
        String attributeMarkup="";
        if(getList) {
            attributeMarkup = attributeMarkup+String.format(attributeListMarkup,"'strList'");
        }
        if(getString) {
            attributeMarkup = attributeMarkup+String.format(attributeStringListMarkup,"'stringList'");
        }
        if(getBoolean) {
            attributeMarkup = attributeMarkup+String.format(attributeBooleanListMarkup,"'booleanList'");
        }
        if(getObject) {
            attributeMarkup = attributeMarkup+String.format(attributeObjectListMarkup,"'objList'");
        }
        if(getComponent) {
            attributeMarkup = attributeMarkup+String.format(attributeCmpListMarkup,"'cmps'");
        }
        return attributeMarkup;
    }
    
    public String getAllCommonAttributeListMarkup() {
        return getCommonAttributeListMarkup(true,true,true,true,true);
    }
    
    public String getCommonAttributeListWithDefaultMarkup(boolean getList, boolean getString, boolean getBoolean, boolean getObject, 
            boolean getComponent, String defaultList, String defaultString, String defaultBoolean, String defaultObject, String defaultComponent) {
        String attributeMarkup="";
        if(getList) {
            attributeMarkup = attributeMarkup+String.format(attributeListMarkupWithDefault,
                    "'strListDefault'", defaultList);
        }
        if(getString) {
            attributeMarkup = 
                    attributeMarkup+String.format(attributeStringListMarkupWithDefault,
                            "'stringListDefault'",defaultString);
        }
        if(getBoolean) {
            attributeMarkup = attributeMarkup+String.format(attributeBooleanListMarkupWithDefault,
                    "'booleanListDefault'",defaultBoolean);
        }
        if(getObject) {
            attributeMarkup = attributeMarkup+String.format(attributeObjectListMarkupWithDefault,
                    "'objListDefault'",defaultObject);
        }
        if(getComponent) {
            attributeMarkup = attributeMarkup+String.format(attributeCmpListMarkupWithDefault,
                    "'cmpsDefault'",defaultComponent);
        }
        return attributeMarkup;
    }
    
    /**
     * Take a component instance that is capable of being server rendered and return it as a string. 
     * 
     * @param component
     * @return
     */
    public String renderComponent(Component component) {
        if(component == null){
            return null;
        }
        
        StringWriter sw = new StringWriter();
        try {
            if(definitionService.getDefinition(component.getDescriptor()).isLocallyRenderable() == false) {
                return null;
            }
            renderingService.render(component, sw);
        } catch (QuickFixException e) {
            return null;
        } catch (IOException e) {
            return null;
        }
        return sw.toString().trim();
    }

    @Inject
    public void setRenderingService(RenderingService renderingService) {
        this.renderingService = renderingService;
    }
    
    @Inject
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }
    
}
