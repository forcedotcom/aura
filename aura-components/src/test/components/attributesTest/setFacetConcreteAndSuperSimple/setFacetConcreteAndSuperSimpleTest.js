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
	_testSetting_setFacet1_String: {
		test: function(cmp) {
			var expected = "[setFacet1_String]";

			var actual = cmp.get("v.setFacet1_String");

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet1_Facet: {
		test: function(cmp) {
			var expected = "[setFacet1_Facet][setFacet1_String][/setFacet1_Facet]";

			var actual = $A.test.getText(cmp.getSuper().getSuper().find("setFacet1_Facet_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet1_DefRef: {
		test: function(cmp) {
			var expected = "[setFacet1_DefRef][setFacet1_String][/setFacet1_DefRef]";

			var actual = $A.test.getText(cmp.getSuper().getSuper().find("setFacet1_DefRef_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	},

	_testSetting_setFacet2_String: {
		test: function(cmp) {
			var expected = "[setFacet2_String]";

			var actual = cmp.get("v.setFacet2_String");

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet2_Facet: {
		test: function(cmp) {
			var expected = "[setFacet2_Facet][setFacet2_String][/setFacet2_Facet]";

			var actual = $A.test.getText(cmp.getSuper().find("setFacet2_Facet_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet2_DefRef: {
		test: function(cmp) {
			var expected = "[setFacet2_DefRef][setFacet2_String][/setFacet2_DefRef]";

			var actual = $A.test.getText(cmp.getSuper().find("setFacet2_DefRef_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet3_String: {
		test: function(cmp) {
			var expected = "[setFacet3_String]";

			var actual = cmp.get("v.setFacet3_String");

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet3_Facet: {
		test: function(cmp) {
			var expected = "[setFacet3_Facet][setFacet3_String][/setFacet3_Facet]";

			var actual = $A.test.getText(cmp.find("setFacet3_Facet_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	},
	
	_testSetting_setFacet3_DefRef: {
		test: function(cmp) {
			var expected = "[setFacet3_DefRef][setFacet3_String][/setFacet3_DefRef]";

			var actual = $A.test.getText(cmp.find("setFacet3_DefRef_Output").getElement()).trim();

			$A.test.assertEquals(expected, actual);
		}
	},

    testSettingRenderedInFcv_setFacet1_PrivateString: {
        test: function(cmp) {
            // verifying fix for W-3686136
            var expected = "[setFacet1_PrivateString]";
            var actual = $A.test.getText(cmp.getSuper().getSuper().find("setFacet1_PrivateString_Output").getElement()).trim();
            $A.test.assertEquals(expected, actual);
        }
    },

    testCannotAccessSetting_setFacet1_PrivateString: {
        test: function(cmp) {
            // verifying fix for W-3686136
            $A.test.expectAuraError("Access Check Failed!");
            cmp.get("v.setFacet1_PrivateString");
            $A.test.addWaitForWithFailureMessage(true,
                function(){
                    var element = document.getElementById('auraErrorMask');
                    var style = $A.test.getStyle(element, 'display');
                    return style === 'block';
                },
                "Error Modal didn't show up.", null,
                function() {
                    $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),
                        "\' is not visible to \'",
                        "Access Check Failed! AttributeSet.get():\'attribute 'setFacet1_PrivateString'",
                        "markup://attributesTest:setFacetConcreteAndSuperSimple");
                }
            );
        }
    }

})