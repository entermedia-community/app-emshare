jQuery(document).ready(function() {
	//electron
	if(window && window.process && window.process.type) {
		var electron = require('electron');
		
		
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
		
		connectDesktop();
	}
	
});

function downloadAsset(message)
{
	var subpath = (String)message.get("subpath");
	//debug("downloadFolders on" + subpath + " sent " + request.toJSONString());
	

}

function connectDesktop() {
    
	var app = jQuery("#application");
	var userid = app.data("user");
    var protocol = location.protocol;
    
	var url = "/entermedia/services/websocket/org/entermediadb/websocket/mediaboat/MediaBoatConnection?userid=" + userid;
    
    if (protocol === "https:") {
    	chatconnection = new WebSocket("wss://" +location.host + url );	
    } else{
    	chatconnection = new WebSocket("ws://" +location.host  + url );
    }
    
    chatconnection.onmessage = function(event) {
    	
    	var app = jQuery("#application");
    	var apphome = app.data("home") + app.data("apphome");
    	jQuery(window).trigger("ajaxsocketautoreload");
        var message = JSON.parse(event.data);
        //console.log(message);

        console.log(message);
		var command = message.get("command");

		if( "downloadasset".equals( command))
		{
			downloadAsset(message);
		}
		else if( "openasset".equals( command))
		{
			openAsset(message);
		}
		else if( "downloadcategory".equals( command))
		{
			downloadFolders(message);
		}
		else if( "opencategorypath".equals( command))
		{

		}
        
    }; 

}

