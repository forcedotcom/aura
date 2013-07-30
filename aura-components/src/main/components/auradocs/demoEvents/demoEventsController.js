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
{
	inspMouseDown : function(cmp, event, helper){
		var buttonValue =  event.getParam("button");
		if(buttonValue===0){
			var elem = cmp.find("boxy").getElement();
			$A.util.addClass(elem, "redText");
			helper.getUnwrapped(cmp, "mousedown");
		} else if (buttonValue===1){
			helper.getUnwrapped(cmp, "middle button");
		} else if(buttonValue===2){
			helper.getUnwrapped(cmp, "right click");
		};
	},
	
	inspMouseUp : function(cmp, event, helper){
		var elem = cmp.find("boxy").getElement();
		$A.util.removeClass(elem, "redText");
		helper.getUnwrapped(cmp, "mouseup");
	},
	
	inspFocus : function(cmp, event, helper){
		var elem = cmp.find("boxy").getElement();
		$A.util.addClass(elem, "whitebg");
		helper.getUnwrapped(cmp, "focus");
	},
	
	inspBlur : function(cmp, event, helper){
		var elem = cmp.find("boxy").getElement();
		$A.util.removeClass(elem, "whitebg");
		helper.getUnwrapped(cmp, "blur");
	},
	
	inspDblClick : function(cmp, event, helper){
		var elem = cmp.find("boxy").getElement();
		$A.util.toggleClass(elem, "blueText");
		helper.getUnwrapped(cmp, "dbclick");
	},
	
	inspMouseover : function(cmp, event, helper){
		var elem = cmp.find("boxy").getElement();
		$A.util.addClass(elem, "boldText");
		helper.getUnwrapped(cmp, "mouseover");

	},
	
	inspMouseout : function(cmp, event, helper){
		var elem = cmp.find("boxy").getElement();
		$A.util.removeClass(elem, "boldText");
		helper.getUnwrapped(cmp, "mouseout");
	},
	
	inspKey : function(cmp, event, helper){
		var keyCodeValue =  event.getParam("keyCode");
		helper.getUnwrapped(cmp, keyCodeValue);

	},
	
	inspSelect : function(cmp, event, helper){
		var len = window.getSelection().toString().length;
		helper.getUnwrapped(cmp, "selected " + len + " chars");
	},
	
	inspCut : function(cmp, event, helper){
		helper.getUnwrapped(cmp, "cut");
	},
	
	inspPaste : function(cmp, event, helper){
		helper.getUnwrapped(cmp, "paste");
	},
	
	inspCopy : function(cmp, event, helper){
		helper.getUnwrapped(cmp, "copy");
	},
	
	clearEvents : function(cmp, event){
		cmp.find("outputValue").getValue("v.value").setValue("");
	}
}