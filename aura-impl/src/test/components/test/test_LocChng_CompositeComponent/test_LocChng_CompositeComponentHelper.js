({
	getSearchParameters: function(token) {
		var parameters = {};
		var url = token.split("?");
		if(url.length != 2) {
			return parameters;
		}
		
		var urlparams = url[1].split("&");
		for(var c=0;c<urlparams.length;c++) {
			var pair = urlparams[c].split("=");
			parameters[pair[0]] = pair[1];			
		}
		return parameters;
	}
})