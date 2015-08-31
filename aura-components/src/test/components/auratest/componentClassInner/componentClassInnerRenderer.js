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
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter(cmp) + 'InnerRender' );
        if (cmp.get("v.errorOutFromRender_Inner") === true ) {
        	blahFromInnerRerender.willExplode();
        }
        return this.superRender();
    },

    afterRender : function(cmp, helper) {
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter(cmp) + 'InnerAfterrender');
        if (cmp.get("v.errorOutFromAfterRender_Inner") === true ) {
        	blahFromInnerAfterRerender.willExplode();
        }
        this.superAfterRender();
    },

    rerender : function(cmp, helper) {
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter(cmp) + 'InnerRerender');
        if (cmp.get("v.errorOutFromReRender_Inner") === true ) {
        	blahFromInnerReRerender.willExplode();
        }
        this.superRerender();
    },

    unrender : function(cmp, helper) {
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter(cmp) + 'InnerUnrender');
        if (cmp.get("v.errorOutFromUnRender_Inner") === true ) {
        	blahFromInnerUnRerender.willExplode();
        }
        this.superUnrender();
    }
})
