jQuery(document).ready(function() {
	//electron
	if(window && window.process && window.process.type) {
		var electron = require('electron');
		
		
		lQuery("#localfolderPicker").livequery("click", function(e) {
			e.stopPropagation();
			console.log("localfolderPicker click");
			var uploadFolder = electron.remote.require('./index.js').uploadFolder;
			var userid = app.data("user");
			var entermediakey = '';
			if (app && app.data('entermediakey') != null) {
				entermediakey = app.data('entermediakey');
			}
			var serverurl = app.data("siteroot");
			var mediadbid = app.data("mediadbappid");
			var sourcepath = $(this).data("sourcepath");
			
			var uploadasseturl = serverurl + "/finder/mediadb/services/module/asset/create";
			var redirecturl = serverurl + app.data("apphome") + "/views/modules/asset/index.html";
			uploadFolder(entermediakey, sourcepath, uploadasseturl, redirecturl);
		});
	}
	
});
