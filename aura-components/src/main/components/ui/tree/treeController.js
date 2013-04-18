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
({
    getChildren : function(cmp, event) {
        var body = cmp.get("v.body") || [];

        var treeNodes = [];
        for (var n = 0; n < body.length; n++) {
        	var child = body[n];
        	
        	if (child.isInstanceOf("ui:treeNode")) {
        		treeNodes.push(child);
        	}
        }
        
        // Grab the model nodes from the tree.
        var modelNodes = cmp.find("modelNode");
        if ($A.util.isUndefinedOrNull(modelNodes)) {
            modelNodes = [];
        } else if (!$A.util.isArray(modelNodes)) {
            modelNodes = [modelNodes];
        }
        
        // Return them to the caller
        event.getParam("callback")(modelNodes.concat(treeNodes));
    },
    
    onActiveNodeChange : function(cmp, event) {
        var activeNode = cmp.get("v.activeNode");
        $A.assert(activeNode.isInstanceOf("ui:treeNode"));
        
        // Unset the old active node if we had one.
        if (cmp._activeNode) {
            cmp._activeNode.getAttributes().setValue("active", false);
        }
        
        cmp._activeNode = activeNode;
    }
})