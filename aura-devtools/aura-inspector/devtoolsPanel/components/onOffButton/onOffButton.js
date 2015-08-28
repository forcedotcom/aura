(function() {
	var onoffButton = Object.create(HTMLButtonElement.prototype);

	onoffButton.createdCallback = function(){
    	this.addEventListener("click", OnOffButton_Click);	
	};

	onoffButton.attributeChangedCallback = function(attr) {
		//console.log("The attribute %s changed", attr);
	};

	document.registerElement('aurainspector-onOffButton', {
		prototype: onoffButton
	});

	function OnOffButton_Click(event) {
		this.classList.toggle("on");
	}

})();