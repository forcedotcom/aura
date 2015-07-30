({
	move : function (cmp, direction) {
		 var inputDateDiv = cmp.find('inputDateDiv').getElement();
		 var pos = cmp.get('v.pos');
		 var oldClass = "pos" + pos.toString();
		 cmp.find(oldClass).set('v.value', "Position " + pos.toString());
		 if(direction == "forward") {
			 pos++;
			 if(pos > 9)
				 pos = 1;
		 }
		 else if(direction == "back") {
			 pos--;
			 if(pos < 1)
				 pos = 9;
		 }
		 cmp.set('v.pos', pos);
		 var newClass = "pos" + pos.toString();
		 cmp.find(newClass).set('v.value', '');
		 $A.util.swapClass(inputDateDiv, oldClass, newClass);
	}
})