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
package org.auraframework.test.instance;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyListOf;

import java.util.Collections;

import org.auraframework.instance.Action;
import org.auraframework.instance.ActionWithKeyOverride;
import org.auraframework.util.json.JsonEncoder;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

public class ActionWithKeyOverrideTest {
    @Test
    public void testConstructingWithNullActionAsKey() {
        try {
            new ActionWithKeyOverride(null, null);
        } catch (IllegalArgumentException iae) {
            Assert.assertEquals(ActionWithKeyOverride.ERROR_ACTIONASKEY_MISSING, iae.getMessage());
        }
    }

    @Test
    public void testConstructingWithNullActionToExecute() {
        final Action actionAsKey = Mockito.mock(Action.class);

        try {
            new ActionWithKeyOverride(actionAsKey, null);
        } catch (IllegalArgumentException iae) {
            Assert.assertEquals(ActionWithKeyOverride.ERROR_ACTIONTOEXECUTE_MISSING, iae.getMessage());
        }
    }

    @Test
    public void testConstruction() {
        final Action actionAsKey = Mockito.mock(Action.class);
        final Action actionToExecute = Mockito.mock(Action.class);

        Action action = new ActionWithKeyOverride(actionAsKey, actionToExecute);

        // Verify
        Mockito.verify(actionAsKey, Mockito.times(1)).setStorable();
        Mockito.verify(actionToExecute, Mockito.times(1)).setStorable();
        Assert.assertNotNull("ActionWithKeyOverride was not properly created.", action);
    }

    @Test
    public void testDelegations() throws Exception {
        final Action actionAsKey = Mockito.mock(Action.class);
        final Action actionToExecute = Mockito.mock(Action.class);

        Action action = new ActionWithKeyOverride(actionAsKey, actionToExecute);

        // Run
        // Should delegate to actionAsKey
        action.getParams();
        action.getDescriptor();
        action.isStorable();
        action.setStorable();
        action.getId();
        action.setId("test");
        action.getInstanceStack();

        action.run();
        action.add(Collections.<Action>emptyList());
        action.getActions();
        action.getReturnValue();
        action.getState();
        action.getErrors();
        action.serialize(null);

        // Should delegate to actionToExecute.

        // Verify
        // Delegates to actionAsKey
        Mockito.verify(actionAsKey, Mockito.times(1)).getParams();
        Mockito.verify(actionAsKey, Mockito.times(1)).getDescriptor();
        Mockito.verify(actionAsKey, Mockito.times(1)).isStorable();
        // 2 because ActionWithKeyOverride constructor sets this on actionAsKey.
        Mockito.verify(actionAsKey, Mockito.times(2)).setStorable();
        Mockito.verify(actionAsKey, Mockito.times(1)).getId();
        Mockito.verify(actionAsKey, Mockito.times(1)).setId(any(String.class));

        //
        // These delegate to both.
        //
        Mockito.verify(actionToExecute, Mockito.times(1)).setId(any(String.class));
        Mockito.verify(actionToExecute, Mockito.times(1)).getInstanceStack();
        Mockito.verify(actionToExecute, Mockito.times(2)).setStorable();

        // Delegates to actionToExecute
        Mockito.verify(actionToExecute, Mockito.times(1)).run();
        Mockito.verify(actionToExecute, Mockito.times(1)).add(anyListOf(Action.class));
        Mockito.verify(actionToExecute, Mockito.times(1)).getActions();
        Mockito.verify(actionToExecute, Mockito.times(1)).getReturnValue();
        Mockito.verify(actionToExecute, Mockito.times(1)).getState();
        Mockito.verify(actionToExecute, Mockito.times(1)).getErrors();
        Mockito.verify(actionToExecute, Mockito.times(1)).serialize(any(JsonEncoder.class));

        Mockito.verifyNoMoreInteractions(actionAsKey);
        Mockito.verifyNoMoreInteractions(actionToExecute);
    }
}
