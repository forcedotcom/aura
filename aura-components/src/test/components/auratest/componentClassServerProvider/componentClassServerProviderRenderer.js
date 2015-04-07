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
    render : function(cmp, helper) {
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter() + 'ServerProviderRender' );
        return this.superRender();
    },

    afterRender : function(cmp, helper) {
        this.superAfterRender();
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter() + 'ServerProviderAfterrender');
    },

    rerender : function(cmp, helper) {
        this.superRerender();
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter() + 'ServerProviderRerender');
    },

    unrender : function(cmp, helper) {
        this.superUnrender();
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter() + 'ServerProviderUnrender');
    }
})
