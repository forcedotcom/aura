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
package org.auraframework.instance;

import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.LoggingContext.KeyValueLogger;

/**
 * This delegate supplies the ability to serialize an Action with a different set of action keys 
 * than the one you want it to run with.
 */
public class ActionWithKeyOverride extends ActionDelegate {

    public static final String ERROR_ACTIONTOEXECUTE_MISSING = "actionToExecute required.";
    public static final String ERROR_ACTIONASKEY_MISSING = "actionAsKey required.";
    private Action actionAsKey;
    private Action actionToExecute;
    
    public ActionWithKeyOverride(Action actionAsKey, Action actionToExecute) {
        super(actionToExecute);
        if (actionAsKey == null) {
            throw new IllegalArgumentException(ERROR_ACTIONASKEY_MISSING);
        }
        if (actionToExecute == null) {
            throw new IllegalArgumentException(ERROR_ACTIONTOEXECUTE_MISSING);
        }
        this.actionAsKey = actionAsKey;
        actionAsKey.setStorable();
        this.actionToExecute = actionToExecute;
        actionToExecute.setStorable();
    }
    
    // ----
    // Some methods are delegated to actionAsKey
    // ----
    @Override
    public Map<String, Object> getParams() {
        return actionAsKey.getParams();
    }
    
    @Override
    public DefDescriptor<ActionDef> getDescriptor() {
        return actionAsKey.getDescriptor();
    }
    
    @Override
    public boolean isStorable() {
        return actionAsKey.isStorable();
    }
    
    @Override
    public void logParams(KeyValueLogger logger) {
        actionAsKey.logParams(logger);
    }

    @Override
    public String getId() {
        return actionAsKey.getId();
    }

    //----------------------------
    // Setting the id (and storable, because it sets id by default), is done for
    // both actions to keep them in sync. Note that actionToExecute holds the definitive
    // globalId/instanceStack.
    //-----------------------------
    /**
     * Set storable on both actions to ensure that components are linked correctly.
     */
    @Override
    public void setStorable() {
        actionAsKey.setStorable();
        actionToExecute.setStorable();
    }

    /**
     * Set the Id of both actions to ensure that components are linked correctly.
     */
    @Override
    public void setId(String id) {
        actionAsKey.setId(id);
        actionToExecute.setId(id);
    }

    // ----
    // And a few things are overridden here.
    // ----
    
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        
        ActionWithKeyOverride other = (ActionWithKeyOverride)o;
        
        return actionAsKey.equals(other.actionAsKey) && actionToExecute.equals(other.actionToExecute);
    }
    
    @Override
    public int hashCode() {
        return actionAsKey.hashCode()+actionToExecute.hashCode();
    }
}
