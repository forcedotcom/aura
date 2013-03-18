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
	init: function(cmp) {
    	var imageType = cmp.get('v.imageType'),
    		altText = cmp.get('v.alt') || '',
    		id = cmp.getLocalId() || cmp.getGlobalId() || '';
    	
    	if (imageType === 'informational' && altText.length == 0) {    		
    		throw new Error('component: ' + id + ' "alt" attribute should not be empty for informational image');
    	} else if (imageType === 'decorative' && altText.length > 0) {
    		throw new Error('component: ' + id + ': "alt" attribute should be empty for decorative image');
    	}
    }
}