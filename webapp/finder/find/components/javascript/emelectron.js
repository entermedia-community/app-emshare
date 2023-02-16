refreshEntiyDialog = function() {
	var entityid = $(".current-entity").data("entityid");
	$('a[data-entityid="'+entityid+'"].entity-tab-label').trigger("click");
	
	console.log("refreshEntiyDialog refreshing... " + entityid);
}

jQuery(document).ready(function() {
	//electron
	if(window && window.process && window.process.type) {
		var electron = require('electron');
		
		
		lQuery("#localfilePicker").livequery("click", function(e) {
			e.stopPropagation();
			
			var uploadFiles = electron.remote.require('./index.js').uploadFiles;
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
			
			uploadFiles(entermediakey, sourcepath, mediadburl, redirecturl);
		});
		
		
		lQuery(".localfolderPicker").livequery("click", function(e) {
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
			
			var options = $(this).data();
			console.log(options);
			uploadFolder(entermediakey, sourcepath, mediadburl, redirecturl, options);
			//uploadFolder(entermediakey, sourcepath, mediadburl, redirecturl);
		});
		
		
//Download
		
		lQuery("#localfolderDownloadPath").livequery("click", function(e) {
			e.stopPropagation();
			
			//Select items
			var downloadpaths = [];
			$(".downloadpreset :selected").each(function() {
				var presetid = $(this).val();
				$(".orderitemsperpreset"+presetid).each(function(){
					var url = $(this).val();
					var asset = $(this).data();
					downloadpaths.push(asset);
				})
				
			});
			
			downloadAssetsToDesktop(downloadpaths);
			
		});
		
	}
	

	
	downloadAssetsToDesktop = function(downloadpaths) {
			var electron = require('electron');
			var serverurl = app.data("siteroot");
			var mediadbid = app.data("mediadbappid");
			
			var selectFolder = electron.remote.require('./index.js').selectFolder;
			
			var userid = app.data("user");
			var entermediakey = '';
			if (app && app.data('entermediakey') != null) {
				entermediakey = app.data('entermediakey');
			}
			
						
			var mediadburl = serverurl + "/" + mediadbid;
			
			var selectedPath = selectFolder(entermediakey, downloadpaths);
			
			console.log(selectedPath);
	};
		
	
	
	listCategoryAssets = function(element, event, inCategoryId)
	{
		
		var serverurl = app.data("siteroot");
		var mediadbid = app.data("mediadbappid");
		
		var json = '{	  "page": "1", "hitsname": "downloadfolderhits", "hitsperpage": "20", "query": {   "terms": [     {   "field": "category", "operator": "exact", "value": ';
		json = json +  '"' + inCategoryId + '"  }   ]  } }';
		var obj = JSON.parse(json);
		
		var url = serverurl + "/" + mediadbid + "/services/module/asset/search";
		$.ajax({
			  type: "POST",
			  url: url,
			  data: json,
			  contentType: 'application/json',
			  dataType: 'json',
			  success: function(inresponse)
			  {
				  console.log(inresponse);
				  
				  var hitSessionId = inresponse.response.hitsessionid;
				  var url = app.data("apphome") + '/components/sidebars/userdownloads/downloadpresetpicker.html?selectall=true&hitssessionid='+hitSessionId+"&categoryid="+inCategoryId;
				  element.attr("href", url);
				  element.data("dialogid", "downloadorder");
				  element.data("hidefooter", "true");
				  emdialog(element, event);
				  /*
				  var downloadpaths = [];
				  $.each( inresponse.results, function( key, value ) { 
					  //console.log(value);
					  var asset = [];
					  asset['url'] = '';
					  asset['sourcepath'] = value.sourcepath;
					  downloadpaths.push(asset);
				  });
				  downloadAssetsToDesktop(downloadpaths);
				  */
			  },
			  xhrFields: {
				  withCredentials: true
			  },
			  crossDomain: true
			});

	}
	
});






