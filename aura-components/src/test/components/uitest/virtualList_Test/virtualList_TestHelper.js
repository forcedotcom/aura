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
    generateItemTemplates: function(cmp) {
        var itemTemplates = {
                "simple": {
                    "componentDef": {
                        descriptor: "markup://uitest:virtualItem_Simple"
                    },
                    "attributes": {
                        "values": {
                            id: this.generateExpression("_id"),
                            index: this.generateExpression("index"),
                            name: this.generateExpression("name")
                        }
                    }
                },
                "complex": {
                    "componentDef": {
                        descriptor: "markup://test:testVirtualListTemplate"
                    },
                    "attributes": {
                        "values": {
                            id: this.generateExpression("_id"),
                            index: this.generateExpression("index"),
                            name: this.generateExpression("name"),
                            balance: this.generateExpression("name"),
                            friends: this.generateExpression("friends"),
                            counter: this.generateExpression("counter")
                        }
                    }
                }
        };

        cmp.set("v.templateMap", itemTemplates);
    },

    generateExpression: function(attr) {
        return $A.expressionService.create(null, "{!item." + attr + "}");
    }
})