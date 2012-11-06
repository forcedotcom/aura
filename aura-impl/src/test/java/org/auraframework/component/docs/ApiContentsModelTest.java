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
package org.auraframework.component.docs;

import java.util.List;

import org.auraframework.components.ui.TreeNode;
import org.auraframework.docs.ApiContentsModel;
import org.auraframework.test.IntegrationTestCase;

public class ApiContentsModelTest extends IntegrationTestCase {

    public ApiContentsModelTest(String name){
        super(name);
    }

    /**
     * Verifies generated jsdoc JSON file is loaded and contains list of jsdoc items.
     */
    public void testLoadJavaScriptApi() {
        List<TreeNode> jsDocTreeNodes = new ApiContentsModel().getNodes();
        assertTrue("No jsdoc nodes loaded from generated JSON file.", jsDocTreeNodes.size() > 0);
    }
}
