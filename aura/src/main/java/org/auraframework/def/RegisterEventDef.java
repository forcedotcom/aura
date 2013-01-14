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
package org.auraframework.def;

/**
 */
public interface RegisterEventDef extends Definition {
    /**
     * FIXME: W-1328555 this method violates the contract with DefDescriptor.
     * 
     * These two calls should be used instead, but they cause other bugs.
     * 
     * DefDescriptor<RegisterEventDef> getDescriptor(); DefDescriptor<EventDef>
     * getEventDescriptor();
     */
    @Override
    DefDescriptor<EventDef> getDescriptor();

    boolean isGlobal();

    String getAttributeName();
}
