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

{
    /**
     * Wire the real tree to the decorators.
     */
    doInit : function(cmp, event) {
        var searchTree = cmp.find('searchTree');
        var topicTree = cmp.find('topicTree');
        var tree = cmp.find('tree');
        searchTree.getAttributes().setValue('tree', tree);
        topicTree.getAttributes().setValue('tree', tree);
    }
}