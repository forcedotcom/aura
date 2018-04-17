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
    /**
     * Verify that when v.type is undefined,
     * ui:pagerNextPrevious is used as the concrete cmp
     */
    testProviderTypeUndefined: {
        test: function(cmp) {
            this.assertProviderType(cmp, "ui:pagerNextPrevious");
        }
    },

    /**
     * Verify that when v.type is an empty string,
     * ui:pagerNextPrevious is used as the concrete cmp
     */
    testProviderTypeEmptyString: {
        attributes: { type: "" },
        test: function(cmp) {
            this.assertProviderType(cmp, "ui:pagerNextPrevious");
        }
    },

    /**
     * Verify that when v.type is "NextPrevious",
     * ui:pagerNextPrevious is used as the concrete cmp
     */
    testProviderTypeNextPrevious: {
        attributes: { type: "NextPrevious" },
        test: function(cmp) {
            this.assertProviderType(cmp, "ui:pagerNextPrevious");
        }
    },

    /**
     * Verify that when v.type is "JumpToPage",
     * ui:pagerJumpToPage is used as the concrete cmp
     */
    testProviderTypeJumpToPage: {
        attributes: { type: "JumpToPage" },
        test: function(cmp) {
            this.assertProviderType(cmp, "ui:pagerJumpToPage");
        }
    },

    /**
     * Verify that when v.type is "PageInfo",
     * ui:pagerPageInfo is used as the concrete cmp
     */
    testProviderTypePageInfo: {
        attributes: { type: "PageInfo" },
        test: function(cmp) {
            this.assertProviderType(cmp, "ui:pagerPageInfo");
        }
    },

    /**
     * Verify that when v.type is "PageSize",
     * ui:pagerPageSize is used as the concrete cmp
     */
    testProviderTypePageSize: {
        attributes: { type: "PageSize" },
        test: function(cmp) {
            this.assertProviderType(cmp, "ui:pagerPageSize");
        }
    },

    /****************************************************************
     * Helper Functions
     ****************************************************************/
    assertProviderType: function(cmp, expProvidedCmp) {
        var type = cmp.get("v.type");
        var actProvidedCmp = cmp.getDef().getDescriptor().getQualifiedName().replace("markup://", "");
        $A.test.assertEquals(expProvidedCmp, actProvidedCmp,
                "With type='"+type+"', "+"expected provided cmp should be "+expProvidedCmp);
    }
})//eslint-disable-line semi
