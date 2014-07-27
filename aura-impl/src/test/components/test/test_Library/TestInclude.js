function(Dependency) {
    return function() {
    	return "TEST:" + Dependency();
    }
}