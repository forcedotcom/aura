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
package org.auraframework.components.ui;

import java.io.IOException;

import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

/**
 * A menu item object has all the information to create a ui:menuItem component (actionMenuItem, checkboxMenuItem and radioMenuItem).
 *
 *
 * @since 184
 */
public class MenuItem implements JsonSerializable {
    private final String className;
    private final String label;    
    private final boolean selected;
    private final String type;
    
    public MenuItem(String label, boolean selected, String type) {
        this("", label, selected, type);
    }
    
    public MenuItem(String className, String label, boolean selected, String type) {
        this.className = className;
        this.label = label;
        this.selected = selected;
        this.type = type;
    }

    /**
     * Get the class name.
     * @return the class name of this menu item
     */
    public String getClassName() {
        return this.className;
    }
    
    /**
     * Get the label.
     * @return the label of this menu item
     */
    public String getLabel() {
        return this.label;
    }

    

    /**
     * Is the component selected.
     * @return the true if selected, otherwise false
     */
    public boolean isSelected() {
        return this.selected;
    }

    /**
     * Get the value.
     * @return the value of this option
     */
    public String getType() {
        return this.type;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("className", this.className);
        json.writeMapEntry("label", this.label);
        json.writeMapEntry("selected", this.selected);
        json.writeMapEntry("type", this.type);
        json.writeMapEnd();
    }

    @Override
    public String toString() {
        return String.format("MenuItem(className[%s] label[%s] selected[%s] type[%s])", this.className, this.label, this.selected, this.type);
    }

}
