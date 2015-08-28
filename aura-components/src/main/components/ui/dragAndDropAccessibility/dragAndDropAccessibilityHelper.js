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
	/**
	 * Get dropzones of associated operation type.
	 * @param {String} type - drag and drop operation type
	 * @return {Aura.Component[]} the dropzones of associated operation type
	 */
	getDropzoneComponents: function(type) {
		var components = $A.dragAndDropService.getDropzoneComponents(type);
		var dropZones = [];
		$A.util.forEach(components,function(component) {
			if(window.getComputedStyle(component.getElement()).visibility !== "hidden" ) {
				dropZones.push(component);
			}
		});
		return dropZones;
	},
	
	/**
	 * Make dropzones enter drag operation.
	 * @param {Aura.Component[]} dropzones - the ui:dropzone's
	 */
	enterDragOperation: function(dropzones) {
		$A.util.forEach(dropzones, function(dropzone) {
			dropzone.enterDragOperation();
		});
	},
	
	/**
	 * Make dropzones exit drag operation.
	 * @param {Aura.Component[]} dropzones - the ui:dropzone's
	 */
	exitDragOperation: function(dropzones) {
		$A.util.forEach(dropzones, function(dropzone) {
			dropzone.exitDragOperation();
		});
	},
	
	/**
	 * Make draggables fire dragEnd event.
	 * @param {Aura.Component[]} draggables - the ui:draggable's
	 * @param {boolean} isValid - true if drag operation is successful or false if it's aborted
	 * @param {HTMLElement} target - the event target for dragend event
	 */
	fireDragEnd: function(draggables, isValid, target) {
		if (isValid === undefined) {
			isValid = false;
		}
		
		$A.util.forEach(draggables, function(draggable) {
			draggable.fireDragEnd(target, isValid, true);
		});
	},
	
	/**
	 * Make dropzones fire dragEnter event.
	 * @param {Aura.Component[]} dropzones - the ui:dropzone's
	 * @param {HTMLElement} target - the event target for dragenter event
	 */
	fireDragEnter: function(dropzones, target) {
		$A.util.forEach(dropzones, function(dropzone) {
			dropzone.fireDragEnter(target, true);
		});
	},
	
	/**
	 * Make dropzones fire dragLeave event.
	 * @param {Aura.Component[]} dropzones - the ui:dropzone's
	 * @param {HTMLElement} target - the event target for dragleave event
	 */
	fireDragLeave: function(dropzones, target) {
		$A.util.forEach(dropzones, function(dropzone) {
			dropzone.fireDragLeave(target, true);
		});
	},
	
	/**
	 * Make dropzones fire drop event.
	 * @param {Aura.Component[]} dropzones - the ui:dropzone's
	 * @param {Aura.Component[]} draggables - the ui:draggable's
	 * @param {HTMLElement} target - the event target for drop event
	 */
	fireDrop: function(dropzones, draggables, target) {
		$A.util.forEach(dropzones, function(dropzone) {
			dropzone.fireDrop(target, draggables, true);
		});
	}
})// eslint-disable-line semi