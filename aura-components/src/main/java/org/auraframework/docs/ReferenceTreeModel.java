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

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.components.ui.TreeNode;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Model
public class ReferenceTreeModel {
    public static boolean hasAccess(Definition def) throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();
        MasterDefRegistry registry = definitionService.getDefRegistry();
        return registry.hasAccess(getReferencingDescriptor(), def) == null;
    }

    public static void assertAccess(Definition def) throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();
        MasterDefRegistry registry = definitionService.getDefRegistry();
        registry.assertAccess(getReferencingDescriptor(), def);
    }

    public static boolean isRunningInInternalNamespace() {
        String ns = Aura.getConfigAdapter().getDefaultNamespace();
        return ns != null ? Aura.getConfigAdapter().isInternalNamespace(ns) : true;
    }

    private static final <E extends Definition> List<TreeNode> makeTreeNodes(String prefix, DefType type)
            throws QuickFixException {
        Aura.getContextService().pushSystemContext();
        try {
            DefinitionService definitionService = Aura.getDefinitionService();
            List<TreeNode> ret = Lists.newArrayList();

            Map<String, TreeNode> namespaceTreeNodes = Maps.newHashMap();
            DescriptorFilter matcher = new DescriptorFilter(String.format("%s://*:*", prefix), type);
            Set<DefDescriptor<?>> descriptors = definitionService.find(matcher);
            ConfigAdapter configAdapter = Aura.getConfigAdapter();
            for (DefDescriptor<?> desc : descriptors) {
                if (desc == null) {
                    // Getting null here after commit 2037c31ddc81eae3edaf6ddd5bcfd0009fefe1bd. This causes a NPE and
                    // breaks the left nav of the reference tab.
                    continue;
                }

                String namespace = desc.getNamespace();
                if (configAdapter.isDocumentedNamespace(namespace)) {
                    try {
                        Definition def = desc.getDef();
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
                                desc.getDef();
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
            Aura.getContextService().popSystemContext();
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

            tree.add(new TreeNode(null, "JavaScript API", new ApiContentsModel().getNodes(), false));

            /*
             * Javadoc not publicly accessible tree.add(new TreeNode( "http://javadoc.auraframework.org/", "Java API"));
             */
        }

        return tree;
    }

    static DefDescriptor<ApplicationDef> getReferencingDescriptor() {
        String defaultNamespace = Aura.getConfigAdapter().getDefaultNamespace();
        if (defaultNamespace == null) {
            defaultNamespace = "aura";
        }

        DefinitionService definitionService = Aura.getDefinitionService();
        return definitionService.getDefDescriptor(String.format("%s:application", defaultNamespace),
                ApplicationDef.class);
    }

    private List<TreeNode> tree;
}