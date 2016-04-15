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
package org.auraframework.integration.test.components.ui.inputCurrency;

import org.auraframework.integration.test.components.ui.inputSmartNumber.BaseInputSmartNumber;

public class InputCurrencyUITest extends BaseInputSmartNumber {

    private final String INPUT_SEL = ".input";
    private final String OUTPUT_SEL = ".vvalue";
    
    public InputCurrencyUITest() {
        super("/uitest/inputCurrency_Test.cmp");
    }

    /**
     * Test positive number with shortcut
     */
    public void testPositiveWithShortcut() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "1.23k", "1230", "$1,230.00");
    }

    /**
     * Test negative number with shortcut
     */
    public void testNegativeWithShortcut() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "-1.23k", "-1230", "-$1,230.00");
    }

    /**
     * Test only two decimal places allowed; extra are not allowed to enter
     */
    public void testDefaultFormatOnlyTwoDecimalPlacesAllowed() throws Exception {
        open(this.URL);
        inputAndVerifyValuesAfterFormatted(INPUT_SEL, OUTPUT_SEL, "0.12345", "0.12", "$0.12");
    }
}
