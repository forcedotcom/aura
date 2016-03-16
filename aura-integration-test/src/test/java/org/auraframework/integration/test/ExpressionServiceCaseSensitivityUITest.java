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
package org.auraframework.integration.test;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.WebDriverTestCase;
import org.junit.Assert;

/**
 * Tests to verify case sensitivity
 * 
 * TODO(W-2498010): Convert these to JS tests when we have the ability to set the server mode there.
 */
public class ExpressionServiceCaseSensitivityUITest extends WebDriverTestCase {

    public ExpressionServiceCaseSensitivityUITest(String name) {
        super(name);
    }

    /**
     * Verify Aura error pops up suggesting the proper case when trying to get a nested map attribute with the wrong
     * case.
     */
    public void testGetNestedAttribute() throws Exception {
        open("/attributesTest/caseSensitivity.app", Mode.DEV);
        String expected = "Possible Case Sensitivity Issue: Expression 'map.Fruit' on segment 'Fruit'. Possible you meant 'fruit'";
        Object actual = getAuraUITestingUtil().getEval("try { $A.getRoot().get('v.map.Fruit'); } catch (e) { return e.message; }");
        Assert.assertEquals(expected, actual);
    }

    /**
     * Verify Aura error pops up suggesting the proper case when trying to get a nested map attribute with the wrong
     * case.
     */
    public void testGetNonExistentNestedAttribute() throws Exception {
        open("/attributesTest/caseSensitivity.app", Mode.DEV);
        String expected = "Possible Case Sensitivity Issue: Expression 'map.Fruit.blah' on segment 'Fruit'. Possible you meant 'fruit'";
        Object actual = getAuraUITestingUtil().getEval("try { $A.getRoot().get('v.map.Fruit.blah'); } catch (e) { return e.message; }");
        Assert.assertEquals(expected, actual);
    }

    /**
     * Verify Aura error pops up suggesting the proper case when trying to set a nested map attribute with the wrong
     * case.
     */
    public void testSetNestedAttribute() throws Exception {
        open("/attributesTest/caseSensitivity.app", Mode.DEV);
        String expected = "Possible Case Sensitivity Issue: Expression 'map.Fruit' on segment 'Fruit'. Possible you meant 'fruit'";
        Object actual = getAuraUITestingUtil().getEval("try { $A.getRoot().set('v.map.Fruit', 'orange'); } catch (e) {return e.message; }");
        Assert.assertEquals(expected, actual);
    }

    /**
     * Verify Aura error pops up suggesting the proper case when trying to set a nested map attribute with the wrong
     * case.
     */
    public void testSetNewNestedAttribute() throws Exception {
        open("/attributesTest/caseSensitivity.app", Mode.DEV);
        String expected = "Possible Case Sensitivity Issue: Expression 'map.Fruit.blah' on segment 'Fruit'. Possible you meant 'fruit'";
        Object actual = getAuraUITestingUtil().getEval("try { $A.getRoot().set('v.map.Fruit.blah', 'orange'); } catch (e) { return e.message; }");
        Assert.assertEquals(expected, actual);
    }

    /**
     * Verify we do not display the case sensitivity error message in Prod mode.
     */
    public void testGetNoErrorMessageInProdMode() throws Exception {
        open("/attributesTest/caseSensitivity.app", Mode.PROD);
        getAuraUITestingUtil().getEval("$A.getRoot().get('v.map.Fruit');");
        getAuraUITestingUtil().assertNoAuraErrorMessage(null);
    }

    /**
     * Verify we do not display the case sensitivity error message in Prod mode.
     */
    public void testSetNoErrorMessageInProdMode() throws Exception {
        open("/attributesTest/caseSensitivity.app", Mode.PROD);
        getAuraUITestingUtil().getEval("$A.getRoot().set('v.map.Fruit', 'orange');");
        getAuraUITestingUtil().assertNoAuraErrorMessage(null);
    }
}
