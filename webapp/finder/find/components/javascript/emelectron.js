jQuery(document).ready(function() {
	//electron
	if(window && window.process && window.process.type) {
		var electron = require('electron');
		
		
		lQuery("#localfolderPicker").livequery("click", function(e) {
			e.stopPropagation();
			
			var uploadFolder = electron.remote.require('./index.js').uploadFolder;
			var userid = app.data("user");
			var entermediakey = '';
			if (app && app.data('entermediakey') != null) {
				entermediakey = app.data('entermediakey');
			}
			var serverurl = app.data("siteroot");
			var mediadbid = app.data("mediadbappid");
			var sourcepath = $(this).data("sourcepath");
						
			var mediadburl = serverurl + "/" + mediadbid;
			
			var redirecturl = serverurl + app.data("apphome") + "/views/modules/asset/index.html";
			
			uploadFolder(entermediakey, sourcepath, mediadburl, redirecturl);
		});
		
		
		
		lQuery("#localfolderDownloadPath").livequery("click", function(e) {
			e.stopPropagation();
			
			//Select items
			var downloadpaths = [];
			$(".downloadpreset :selected").each(function() {
				var presetid = $(this).val();
				$(".orderitemsperpreset"+presetid).each(function(){
					var url = $(this).val();
					
					downloadpaths.push(url);
				})
				
			});
			
			
			var selectFolder = electron.remote.require('./index.js').selectFolder;
			
			var userid = app.data("user");
			var entermediakey = '';
			if (app && app.data('entermediakey') != null) {
				entermediakey = app.data('entermediakey');
			}
			var serverurl = app.data("siteroot");
			var mediadbid = app.data("mediadbappid");
						
			var mediadburl = serverurl + "/" + mediadbid;
			
			selectFolder(entermediakey, downloadpaths);
		});
		
	}
	
});

var app = $("#application");
var serverurl = app.data("siteroot");
var mediadbid = app.data("mediadbappid");

function listCategoryAssets(inCategoryId)
{
	const json = '{	  "page": "1",  "hitsperpage": "20", "query": {   "terms": [     {   "field": "category", "operator": "exact", "value": ';
	json = json +  '"' + inCategoryId + '"  }   ]  } }';
	const obj = JSON.parse(json);

	var url = serverurl + "/" + mediadbid + "/services/module/asset/search";
	$.ajax({
		  type: "POST",
		  url: url,
		  data: obj,
		  success: function(inresponse)
		  {
			  console.log(inresponse);
		  },
		  xhrFields: {
			  withCredentials: true
		  },
		  crossDomain: true
		});

}