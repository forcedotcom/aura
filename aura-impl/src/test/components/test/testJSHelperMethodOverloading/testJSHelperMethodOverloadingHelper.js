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
({
    /**
     * Overriding helper method on parent's helper Def
     */
    superSuperz : function(){
        return "func superSuperZ in child component";
    },
    /**
     * Overloading parents's helper method.
     */
    superSuperY : function(arg1){
        return "func superSuperY on child component";
    },

    /**
     * Overloading helper methods.
     */
    localX : function(arg1){
        return "func x on component, with one argument";
    },
    /**
     * Overloading helper methods.
     */
    localX : function(arg1, arg2){
        return "func x on component, with two argument";
    }
})
