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
/*jslint sub: true */
/**
 * @description Creates a Model instance.
 * @constructor
 * @param {Object} def
 * @param {Object} data
 * @param {Component} component
 * @returns {Function}
 */
function Model(def, data, component){
    this.def=def;
    this.data=$A.util.apply({}, data, true, true);
    this.component=component;
    this.errors = {};
    if(def){
        var members=def.getMembers();
        for(var i=0;i<members.length;i++){
            var name=members[i].getName();
            if(!this.data.hasOwnProperty(name)){
                this.data[name]=null;
            }
        }
    }
}

Model.prototype.get=function(key){
    var value = undefined;
    if (key.indexOf('.') < 0) {
        value = this.data[key];
    } else {
        value = aura.expressionService.resolve(key, this.data);
    }
    if (aura.util.isExpression(value)) {
        value = value.evaluate();
    }
    return value;
};

Model.prototype.set=function(key,value){
    var oldValue;
    var target=this.data;
    var step=key;
    if (key.indexOf('.') >= 0) {
        var path = key.split('.');
        target = aura.expressionService.resolve(path.slice(0, path.length - 1), target);
        $A.assert(target,"Model.set: unable to resolve '"+key+"'.");
        step=path[path.length-1];
    }
    oldValue = target[step];
    if (oldValue instanceof PropertyReferenceValue) {
        oldValue.set(value);
    } else {
        target[step]=value;
    }
};

// JF: HALO: TODO: TEMPORARY VALID/ERROR MANAGEMENT - REMOVE WHEN POSSIBLE
Model.prototype.isValid = function(expression) {
    return !this.errors.hasOwnProperty(expression);
};
Model.prototype.setValid = function(expression, valid) {
    if (valid) {
        this.clearErrors(expression);
    } else {
        this.addErrors(expression, []);
    }
};
Model.prototype.addErrors = function(expression, errors) {
    if (!this.errors[expression]) {
        this.errors[expression] = [];
    }
    this.errors[expression] = this.errors[expression].concat(errors);
};
Model.prototype.clearErrors = function(expression) {
    delete this.errors[expression];
};
Model.prototype.getErrors = function(expression) {
    return this.errors[expression] || [];
};

Model.prototype.destroy=function(async){
    this.data = this.def = this.component = this.errors = null;
};
