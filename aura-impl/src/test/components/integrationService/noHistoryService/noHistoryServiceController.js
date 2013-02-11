{
	locationChange :function(cmp){
		if(!cmp._counter){cmp._counter=0;}
		cmp.getAttributes().setValue('txt', 'Location Change fired:'+ cmp._counter++);
	}
}