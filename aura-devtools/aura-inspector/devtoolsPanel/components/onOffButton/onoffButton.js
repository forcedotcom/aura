(function() {
//	var ownerDocument = document.currentScript.ownerDocument;

	var prototype = Object.create(HTMLButtonElement.prototype);

	prototype.createdCallback = function(){
    	this.addEventListener("click", OnOffButton_Click);	
	};

	prototype.attributeChangedCallback = function(attr) {
		//console.log("The attribute %s changed", attr);
	};

	document.registerElement('aurainspector-onOffButton', {
		prototype: prototype
	});

	function OnOffButton_Click(event) {
		this.classList.toggle("on");
	}

})();