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
package org.auraframework.impl.controller;

import java.util.List;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.impl.util.ModuleDefinitionUtil;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;

/**
 * Utility methods for parsing cause descriptor and javascript stacktrace.
 */
public class AuraClientExceptionUtil {

    static void parseCauseDescriptor(AuraClientException auraClientException) {
        String descriptor = auraClientException.getCauseDescriptor();

        // namespace:name$controller$method
        String[] parts = descriptor.split("[$]");
        if (parts.length > 1) {
            auraClientException.setFailedComponentMethod(parts[parts.length-1]);
        }

        // parse out ://
        parts[0] = parts[0].replaceAll("\\S+://", "");

        // namespace:name
        String[] componentInfoParts = parts[0].split(":");
        if (componentInfoParts.length > 1) {
            auraClientException.setFailedComponentNamespace(componentInfoParts[0]);
            auraClientException.setFailedComponent(componentInfoParts[1]);
        }
    }

    static void parseStacktrace(
            AuraClientException auraClientException,
            String jsStack,
            DefinitionService definitionService,
            ConfigAdapter configAdapter,
            ContextService contextService) {
        boolean isModule = jsStack.indexOf("/engine/engine.") > -1;
        String[] traces = jsStack.split("\n");
        for (String trace : traces) {
            // trace: method()@sourceURL.js:lineNumber:columNumber
            // sourceURL could be:
            // aura components: ORIGIN/components/namespace/name.js
            // aura libraries: ORIGIN/libraries/namespace/libraryName/name.js
            // module components: ORIGIN/components/namespace-name.js
            // module libraries: ORIGIN/libraries/namespace-name.js
            String[] traceParts = trace.split("@");
            if (auraClientException.getFailedComponentMethod() == null || auraClientException.getFailedComponentMethod().isEmpty()) {
                auraClientException.setFailedComponentMethod(traceParts[0].replace("()", ""));
            }

            if (traceParts.length > 1) {
                // remove ORIGIN
                String sourceURL = traceParts[1].replaceAll("https?://([^/]*/)", "");
                int i = sourceURL.indexOf(".js:");
                if (i > -1) {
                    String filepath = sourceURL.substring(0, i);
                    String locatorString = sourceURL.substring(i+4);
                    String[] pathparts = filepath.split("/");
                    String[] locators = locatorString.split(":");
                    // we don't care about stack frames from aura script
                    if (pathparts.length > 1 &&
                        !pathparts[pathparts.length-1].matches("aura_.+")) {
                        boolean isComponent = pathparts[0].equals("components");
                        String namePart;
                        String namespacePart;
                        String libraryPart = null;
                        // module components and libraries
                        if (pathparts.length == 2) {
                            isModule = true;
                            String auraDescriptor = ModuleDefinitionUtil.convertToAuraDescriptor(pathparts[pathparts.length-1], configAdapter);
                            String[] parts = auraDescriptor.split(":");
                            namespacePart = parts[0];
                            namePart = parts[1];
                        } else {
                            libraryPart = isComponent ? null : pathparts[pathparts.length-1];
                            namePart = isComponent ? pathparts[pathparts.length-1] : pathparts[pathparts.length-2];
                            namespacePart = isComponent ? pathparts[pathparts.length-2] : pathparts[pathparts.length-3];
                        }

                        String typeName = String.format("%s:%s", namespacePart, namePart);
                        if (auraClientException.getFailedComponent() == null || auraClientException.getFailedComponent().isEmpty()) {
                            if (auraClientException.getCauseDescriptor() == null || auraClientException.getCauseDescriptor().isEmpty()) {
                                auraClientException.setCauseDescriptor(typeName);
                            }
                            auraClientException.setFailedComponent(namePart);
                            auraClientException.setFailedComponentNamespace(namespacePart);
                        }

                        boolean shouldMinified = false;
                        if (contextService != null) {
                            AuraContext auraContext = contextService.getCurrentContext();
                            if (auraContext != null) {
                                shouldMinified = auraContext.getMode() == Mode.PROD;
                            }
                        }

                        String qualifiedName = String.format("markup://%s:%s", namespacePart, namePart);
                        String code = isComponent ?
                                getComponentSourceCode(qualifiedName, definitionService, shouldMinified, isModule) :
                                getLibrarySourceCode(qualifiedName, libraryPart, definitionService, shouldMinified, isModule);

                        if (code != null && !code.isEmpty()) {
                            auraClientException.setSourceCode(generateCodeSnippet(code, locators[0], locators[1]));
                        }

                        break;
                    }
                }
            }
        }
    }

    static String generateCodeSnippet(String code, String line, String column) {
        String[] codeLines = code.split("\n");
        StringBuilder sb = new StringBuilder();
        int lineNumber = Integer.parseInt(line) - 1;
        if (codeLines.length > lineNumber) {
            if (lineNumber - 1 >= 0) {
                sb.append(codeLines[lineNumber-1]);
                sb.append("\n");
            }
            sb.append(">>>");
            sb.append(codeLines[lineNumber]);
            sb.append("\n");
            if (lineNumber + 1 < codeLines.length) {
                sb.append(codeLines[lineNumber+1]);
                sb.append("\n");
            }
        }

        return sb.toString();
    }

    static String getComponentSourceCode(
            String qualifiedName,
            DefinitionService definitionService,
            boolean shouldMinified,
            boolean isModule) {
        if (isModule) {
            try {
                ModuleDef moduleDef = definitionService.getDefinition(qualifiedName, ModuleDef.class);
                CodeType codeType = shouldMinified ? CodeType.PROD : CodeType.DEV;
                return moduleDef.getCode(codeType);
            } catch (Exception e) {
                // ignore
            }
        } else {
            try {
                ComponentDef componentDef = definitionService.getDefinition(qualifiedName, ComponentDef.class);
                return componentDef.getCode(shouldMinified);
            } catch (Exception e) {
                // try again with AppDef
                try {
                    ApplicationDef applicationDef = definitionService.getDefinition(qualifiedName, ApplicationDef.class);
                    return applicationDef.getCode(shouldMinified);
                } catch (Exception e1) {
                    // ignore
                }
            }
        }

        return null;
    }

    static String getLibrarySourceCode(
            String qualifiedName,
            String part,
            DefinitionService definitionService,
            boolean shouldMinified,
            boolean isModule) {
        if (isModule && (part == null || part.isEmpty())) {
            try {
                ModuleDef moduleDef = definitionService.getDefinition(qualifiedName, ModuleDef.class);
                CodeType codeType = shouldMinified ? CodeType.PROD : CodeType.DEV;
                return moduleDef.getCode(codeType);
            } catch (Exception e) {
                // ignore
            }
        } else {
            try {
                LibraryDef libraryDef = definitionService.getDefinition(qualifiedName, LibraryDef.class);
                List<IncludeDefRef> includes =  libraryDef.getIncludes();
                for (IncludeDefRef include : includes) {
                    if (include.getName().equals(part)) {
                        return include.getCode(shouldMinified);
                    }
                }
            } catch (Exception e) {
                // ignore
            }
        }

        return null;
    }
}
