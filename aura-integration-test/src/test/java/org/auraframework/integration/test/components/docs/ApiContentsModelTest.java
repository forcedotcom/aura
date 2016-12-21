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
package org.auraframework.integration.test.components.docs;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.auraframework.components.ui.TreeNode;
import org.auraframework.docs.ApiContentsModel;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.util.resource.ResourceLoader;
import org.junit.Test;
import org.mockito.Mockito;

public class ApiContentsModelTest extends AuraImplTestCase {
    /**
     * Verifies generated jsdoc JSON file is loaded and contains list of jsdoc
     * items.
     */
    @Test
    public void testLoadJavaScriptApi() {
        /*
         * Nodes string is equal to this, which was taken from symbolSet.json

        [{
            'description': 'The Aura Event Service, accessible using $A.eventService. Creates and Manages Events.',
            'kind': 'class',
            'name': 'AuraEventService',
            'tags': [{
                'originalTitle': 'export',
                'title': 'export',
                'text': ''
            }],
            'longname': 'AuraEventService'
        }]

         */
        final String nodes = "[{\"description\":\"The Aura Event Service, accessible using $A.eventService. Creates and Manages Events.\",\"kind\":\"class\",\"name\":\"AuraEventService\",\"tags\":[{\"originalTitle\":\"export\",\"title\":\"export\",\"text\":\"\"}],\"longname\":\"AuraEventService\"}]";

        InputStream stream = new ByteArrayInputStream(nodes.getBytes(StandardCharsets.UTF_8));
        ResourceLoader loader = Mockito.mock(ResourceLoader.class);
        Mockito.when(loader.getResourceAsStream(Mockito.eq("jsdoc/symbolSet.json"))).thenReturn(stream);

        ApiContentsModel.refreshSymbols(loader);

        ApiContentsModel model = new ApiContentsModel();
        List<TreeNode> jsDocTreeNodes = model.getNodes();
        assertTrue("No jsdoc nodes loaded from generated JSON file.", jsDocTreeNodes.size() > 0);
    }

    @Test
    public void testNamespaceIsAddedToNodes() {
        String nodes = "[{'description':'This, $A, is supposed to be our ONLY window-polluting top-level variable. Everything else in Aura is attached to it.', 'kind':'namespace', 'alias':'$A', 'name':'$A', 'longname':'$A', 'scope':'global'}]";
        InputStream stream = new ByteArrayInputStream(nodes.getBytes(StandardCharsets.UTF_8));
        ResourceLoader loader = Mockito.mock(ResourceLoader.class);
        Mockito.when(loader.getResourceAsStream(Mockito.eq("jsdoc/symbolSet.json"))).thenReturn(stream);

        ApiContentsModel.refreshSymbols(loader);

        ApiContentsModel model = new ApiContentsModel();
        List<TreeNode> jsDocTreeNodes = model.getNodes();
        assertTrue("Namespace symbol has not been added to nodes.", jsDocTreeNodes.size() > 0);
    }
}
