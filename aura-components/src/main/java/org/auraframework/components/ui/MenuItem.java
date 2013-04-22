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
    private final boolean disabled;
    private final String label;    
    private final boolean selected;
    private final String type;
    private final String value;
    
    public MenuItem(String label, String type) {
        this(label, false, type);
    }
    
    public MenuItem(String label, boolean selected, String type) {
        this("", label, selected, type);
    }
    
    public MenuItem(String className, String label, boolean selected, String type) {
        this(className, false, label, selected, type, null);
    }
    
    public MenuItem(String className, boolean disabled, String label, boolean selected, String type) {
        this(className, disabled, label, selected, type, null);
    }
    
    public MenuItem(String className, boolean disabled, String label, boolean selected, String type, String value) {
        this.className = className;
        this.disabled = disabled;
        this.label = label;
        this.selected = selected;
        this.type = type;
        this.value = value;
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
     * Is the component disabled.
     * @return the true if disabled, otherwise false
     */
    public boolean isDisabled() {
        return this.disabled;
    }

    /**
     * Is the component selected.
     * @return the true if selected, otherwise false
     */
    public boolean isSelected() {
        return this.selected;
    }

    /**
     * Get the menu item type ("action", "checkbox", "radio", "separator" or user defined).
     * @return the type of this menu item
     */
    public String getType() {
        return this.type;
    }
    
    /**
     * Get the value.
     * @return the value of this menu item
     */
    public String getValue() {
        return this.value;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("className", this.className);
        json.writeMapEntry("disabled", this.disabled);
        json.writeMapEntry("label", this.label);
        json.writeMapEntry("selected", this.selected);
        json.writeMapEntry("type", this.type);
        json.writeMapEntry("value", this.value);
        json.writeMapEnd();
    }

    @Override
    public String toString() {
        return String.format("MenuItem(className[%s] disabled[%s] label[%s] selected[%s] type[%s] value[%s])", 
                this.className, this.disabled, this.label, this.selected, this.type, this.value);
    }

}
