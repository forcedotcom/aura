({
    init: function(cmp) {
    	var concrete = cmp.getConcreteComponent();
    	var desc = concrete.getDef().getDescriptor();
    	var name = desc.getNamespace() + ":" + desc.getName();
    	
    	cmp.getValue("v.descriptor").setValue(name);
    }
})