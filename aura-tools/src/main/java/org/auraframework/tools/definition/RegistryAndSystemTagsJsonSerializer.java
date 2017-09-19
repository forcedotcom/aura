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

package org.auraframework.tools.definition;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.TreeMap;

import javax.annotation.Nonnull;

import org.auraframework.Aura;
import org.auraframework.def.Definition;
import org.auraframework.impl.root.parser.handler.ApplicationDefHandler;
import org.auraframework.impl.root.parser.handler.AttributeDefHandler;
import org.auraframework.impl.root.parser.handler.AttributeDefRefHandler;
import org.auraframework.impl.root.parser.handler.ComponentDefHandler;
import org.auraframework.impl.root.parser.handler.DependencyDefHandler;
import org.auraframework.impl.root.parser.handler.EventDefHandler;
import org.auraframework.impl.root.parser.handler.EventHandlerDefHandler;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.impl.root.parser.handler.InterfaceDefHandler;
import org.auraframework.impl.root.parser.handler.LibraryDefHandler;
import org.auraframework.impl.root.parser.handler.LibraryDefRefHandler;
import org.auraframework.impl.root.parser.handler.LocatorContextDefHandler;
import org.auraframework.impl.root.parser.handler.LocatorDefHandler;
import org.auraframework.impl.root.parser.handler.MethodDefHandler;
import org.auraframework.impl.root.parser.handler.RegisterEventHandler;
import org.auraframework.impl.root.parser.handler.TokensDefHandler;
import org.auraframework.impl.root.parser.handler.XMLHandler;
import org.auraframework.impl.root.parser.handler.design.DesignAttributeDefHandler;
import org.auraframework.impl.root.parser.handler.design.DesignDefHandler;
import org.auraframework.impl.root.parser.handler.design.DesignTemplateDefHandler;
import org.auraframework.impl.root.parser.handler.design.DesignTemplateRegionDefHandler;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.RegistryJsonSerializer;

/**
 * Serialize Aura Component Registry to json for consumption by tools like
 * eclipse plugin.
 */
public class RegistryAndSystemTagsJsonSerializer {
    final static String FILE_NAME_SYSTEM_TAGS = "auraSystemTags.json";
    final static String DEFAULT_FILE_SYSTEM_TAGS = RegistryJsonSerializer.DEFAULT_DIR + File.separator
            + FILE_NAME_SYSTEM_TAGS;

    public static void main(String[] args) throws IOException, QuickFixException {
        serializeToFile();
    }

    private static void serializeToFile() throws QuickFixException, IOException {
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED);
        Map<String, Map<String, Map<String, Map<String, String>>>> components = new TreeMap<>();
        try {
            loadMetadataForSystemComponents(components);
            RegistryJsonSerializer.writeMetadataToFile(components, DEFAULT_FILE_SYSTEM_TAGS);
            components.clear();
            RegistryJsonSerializer.serializeToFile();
        } finally {
            Aura.getContextService().endContext();
        }
    }

    /**
     * Get a handler for a tag.
     *
     * This routine is rather bogus, but will work until we have a better way.
     */
    private static XMLHandler<? extends Definition> getHandler(@Nonnull String tag) {
        if (tag.equals(ApplicationDefHandler.TAG)) {
            return new ApplicationDefHandler();
        } else if (tag.equals(AttributeDefHandler.TAG)) {
            return new AttributeDefHandler<>();
        } else if (tag.equals(ComponentDefHandler.TAG)) {
            return new ComponentDefHandler();
        } else if (tag.equals(EventDefHandler.TAG)) {
            return new EventDefHandler();
        } else if (tag.equals(InterfaceDefHandler.TAG)) {
            return new InterfaceDefHandler();
        } else if (tag.equals(EventHandlerDefHandler.TAG)) {
            return new EventHandlerDefHandler();
        } else if (tag.equals(LibraryDefRefHandler.TAG)) {
            return new LibraryDefRefHandler();
        } else if (tag.equals(MethodDefHandler.TAG)) {
            return new MethodDefHandler<>();
        } else if (tag.equals(RegisterEventHandler.TAG)) {
            return new RegisterEventHandler<>();
        } else if (tag.equals(AttributeDefRefHandler.TAG)) {
            return new AttributeDefRefHandler<>();
        } else if (tag.equals(DependencyDefHandler.TAG)) {
            return new DependencyDefHandler<>();
        } else if (tag.equals(TokensDefHandler.TAG)) {
            return new TokensDefHandler();
        } else if (tag.equals(DesignDefHandler.TAG)) {
            return new DesignDefHandler();
        } else if (tag.equals(DesignAttributeDefHandler.TAG)) {
            return new DesignAttributeDefHandler();
        } else if (tag.equals(DesignTemplateDefHandler.TAG)) {
            return new DesignTemplateDefHandler();
        } else if (tag.equals(DesignTemplateRegionDefHandler.TAG)) {
            return new DesignTemplateRegionDefHandler();
        } else if (tag.equals(LibraryDefHandler.TAG)) {
            return new LibraryDefHandler();
        } else if (tag.equals(IncludeDefRefHandler.TAG)) {
            return new IncludeDefRefHandler();
        } else if (tag.equals(LocatorDefHandler.TAG)) {
            return new LocatorDefHandler<>();
        } else if (tag.equals(LocatorContextDefHandler.TAG)) {
            return new LocatorContextDefHandler<>();
        }
        return null;
    }

    private static void loadMetadataForSystemComponents(
            Map<String, Map<String, Map<String, Map<String, String>>>> components) {
        Map<String, Map<String, Map<String, String>>> component;
        Map<String, Map<String, String>> componentDetails;
        for (String tag : XMLHandler.SYSTEM_TAGS) {
        //for (XMLHandler<?> specialComp : specialComps) {
            XMLHandler<? extends Definition> handler = getHandler(tag);
            // some handlers don't really have a TAG..
            if (handler != null) {
                component = new TreeMap<>();
                componentDetails = new TreeMap<>();
                for (String attribute : handler.getAllowedAttributes()) {
                    Map<String, String> attributeProps = new TreeMap<>();
                    attributeProps.put(RegistryJsonSerializer.TYPE_KEY, "Object");
                    componentDetails.put(attribute, attributeProps);
                }
                component.put(RegistryJsonSerializer.ATTRIBUTES_KEY, componentDetails);
                components.put(tag, component);
            }
        }
    }
}
