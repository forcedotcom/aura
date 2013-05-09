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
    updateDefaultError : function(component, event, helper){
        var concreteCmp = component.getConcreteComponent();
        var value = concreteCmp.getValue("v.value");
        helper.setErrorComponent(component, value);
    },
    
    init: function(cmp) {
    	var attrs = cmp.getAttributes(),	
    	labelPos = attrs.get('labelPosition');
    		
    	if ($A.util.arrayIndexOf(['top', 'right', 'bottom', 'left', 'hidden'], labelPos) < 0) {
    		//once W-1419175 is fixed, then we can set default labelPosition instead of throwing error    		
    		$A.error("labelPosition must be one of the following values: 'top', 'right', 'bottom', 'left', 'hidden'");
        	//default labelPosition to 'left'
    		//cmp.getDef().getHelper().setAttribute(cmp, {key: 'labelPosition', value: 'left'});
        }    
    } 
})
