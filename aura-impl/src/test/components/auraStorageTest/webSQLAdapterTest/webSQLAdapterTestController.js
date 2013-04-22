({
    storageModified:function(cmp){
	cmp._storageModified = true;
	if(cmp._storageModifiedCounter === undefined){
	    cmp._storageModifiedCounter = 0;
	}
	cmp._storageModifiedCounter = cmp._storageModifiedCounter + 1 ;
    }
})