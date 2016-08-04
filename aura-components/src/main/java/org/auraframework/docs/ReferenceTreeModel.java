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
package org.auraframework.docs;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponentModelInstance;
import org.auraframework.components.ui.TreeNode;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.ds.servicecomponent.ModelInstance;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

@ServiceComponentModelInstance
public class ReferenceTreeModel implements ModelInstance{
    
    private final DefinitionService definitionService;
    private final ContextService contextService;
    private final ConfigAdapter configAdapter;
    private List<TreeNode> tree;
    
    public ReferenceTreeModel(ContextService contextService, DefinitionService definitionService, ConfigAdapter configAdapter) {
        this.contextService = contextService;
        this.definitionService = definitionService;
        this.configAdapter = configAdapter;
    }


    public boolean isRunningInInternalNamespace() {
        String ns = configAdapter.getDefaultNamespace();
        return ns == null || configAdapter.isInternalNamespace(ns);
    }

    private final <E extends Definition> List<TreeNode> makeTreeNodes(String prefix, DefType type)
            throws QuickFixException {
        contextService.pushSystemContext();
        try {
            List<TreeNode> ret = Lists.newArrayList();

            Map<String, TreeNode> namespaceTreeNodes = Maps.newHashMap();
            DescriptorFilter matcher = new DescriptorFilter(String.format("%s://*:*", prefix), type);
            Set<DefDescriptor<?>> descriptors = definitionService.find(matcher);
            for (DefDescriptor<?> desc : descriptors) {
                if (desc == null) {
                    // Getting null here after commit 2037c31ddc81eae3edaf6ddd5bcfd0009fefe1bd. This causes a NPE and
                    // breaks the left nav of the reference tab.
                    continue;
                }

                String namespace = desc.getNamespace();
                if (configAdapter.isDocumentedNamespace(namespace)) {
                    try {
                        Definition def = definitionService.getDefinition(desc);
                        if (hasAccess(def)) {
                            TreeNode namespaceTreeNode = namespaceTreeNodes.get(desc.getNamespace());
                            if (namespaceTreeNode == null) {
                                namespaceTreeNode = new TreeNode(null, namespace);
                                namespaceTreeNodes.put(namespace, namespaceTreeNode);
                                ret.add(namespaceTreeNode);
                            }

                            String href;
                            DefType defType = desc.getDefType();
                            if (defType.equals(DefType.TESTSUITE)) {
                                href = String.format("#reference?descriptor=%s.%s", namespace, desc.getName());
                            } else {
                                href = String.format("#reference?descriptor=%s:%s", namespace, desc.getName());
                            }

                            href += "&defType=" + defType.name().toLowerCase();

                            // Preload the def
                            try {
                                definitionService.getDefinition(desc);
                            } catch (Throwable t) {
                                // ignore problems, we were only trying to preload
                            }

                            namespaceTreeNode.addChild(new TreeNode(href, desc.getName()));
                        }
                    } catch (Exception x) {
                        // Skip any invalid def
                        System.out.printf(
                                "\n*** ReferenceTreeModel.makeTreeNodes() failed to load component '%s': %s\n", desc,
                                x.toString());
                    }
                }
            }

            Collections.sort(ret);

            return ret;
        } finally {
            contextService.popSystemContext();
        }
    }

    @AuraEnabled
    public List<TreeNode> getTree() throws QuickFixException {
        if (tree == null) {
            tree = Lists.newArrayList();

            tree.add(new TreeNode("#reference", "Overview"));
            tree.add(new TreeNode(null, "Applications", makeTreeNodes("markup", DefType.APPLICATION), false));
            tree.add(new TreeNode(null, "Components", makeTreeNodes("markup", DefType.COMPONENT), false));
            tree.add(new TreeNode(null, "Interfaces", makeTreeNodes("markup", DefType.INTERFACE), false));
            tree.add(new TreeNode(null, "Events", makeTreeNodes("markup", DefType.EVENT), false));
            tree.add(new TreeNode(null, "Libraries", makeTreeNodes("markup", DefType.LIBRARY), false));

            if (isRunningInInternalNamespace()) {
                tree.add(new TreeNode(null, "Tests", makeTreeNodes("js", DefType.TESTSUITE), false));
            }

            ApiContentsModel.refreshSymbols(configAdapter.getResourceLoader());
            
            tree.add(new TreeNode(null, "JavaScript API", new ApiContentsModel().getNodes(), false));

            /*
             * Javadoc not publicly accessible tree.add(new TreeNode( "http://javadoc.auraframework.org/", "Java API"));
             */
        }

        return tree;
    }

    private DefDescriptor<ApplicationDef> getReferencingDescriptor() {
        String defaultNamespace = configAdapter.getDefaultNamespace();
        if (defaultNamespace == null) {
            defaultNamespace = "aura";
        }

        return definitionService.getDefDescriptor(String.format("%s:application", defaultNamespace),
                ApplicationDef.class);
    }
    
    public boolean hasAccess(Definition def) throws QuickFixException {
        MasterDefRegistry registry = definitionService.getDefRegistry();
        return registry.hasAccess(getReferencingDescriptor(), def) == null;
    }

    public void assertAccess(Definition def) throws QuickFixException {
        MasterDefRegistry registry = definitionService.getDefRegistry();
        registry.assertAccess(getReferencingDescriptor(), def);
    }

    public boolean isRunningInPrivilegedNamespace() {
        String ns = configAdapter.getDefaultNamespace();
        return ns != null ? configAdapter.isPrivilegedNamespace(ns) : true;
    }
}