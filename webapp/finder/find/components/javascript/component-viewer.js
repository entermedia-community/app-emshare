$(document).ready(function () {


lQuery("#componentViewer").livequery(function () {
var componentviewer = $(this);

  var canvas = new draw2d.Canvas("componentViewer");

  canvas.installEditPolicy(
    new draw2d.policy.connection.DragConnectionCreatePolicy({
      createConnection: function () {
        var conn = new draw2d.Connection({
          stroke: 2,
          color: "#4d5d80",
          radius: 40,
          cssClass: "connection",
          resizable: false,
          router:
            new draw2d.layout.connection.InteractiveManhattanConnectionRouter(),
        });
        return conn;
      },
    })
  );

  canvas.installEditPolicy(new draw2d.policy.canvas.ShowGridEditPolicy());
  canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGridEditPolicy());
  canvas.installEditPolicy(new draw2d.policy.canvas.CoronaDecorationPolicy());


 function loadJSON() {
      var url = componentviewer.data("loadurl");
	  console.log("Loading" + url);

	  var request = {
		  "componentdatasortby" : "orderingUp",		
		  "page": "1",
		  "hitsperpage": "400",
		  "query": {
		    "terms": [
		      {
		        "field": "entityid",
		        "operator": "exact",
		        "value": componentviewer.data("entityid")
		      }
		    ]
		  }
		};
	  
	   var datastring = JSON.stringify(request);
	  
      jQuery.ajax({
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: url,
        data: datastring,
        method: "POST",
        success: function (res) {
          if (res.response != undefined && res.response.status == "ok") {
            var results = res.results;
            //TODO: Support pagination
            canvas.clear();

     		var reader = new draw2d.io.json.Reader();
            for(let i = 0; i < results.length; i++) 
            {
			    let data = results[i];
			    //Fix any more math?
                
                //Check for errors
                try
                {
                	var parsed = JSON.parse(data.json);
	          		reader.unmarshal(canvas, data.json); //?parsed?
                } catch (e) {
					
				  console.log(data.json,e); // Logs the error
				}
                
			}
              //var updateddata = saveddata.replaceAll("${apphome}", apphome);
          } else {
            console.log("Error", res);
          }
        },
      });
    };
   componentviewer.on("click", function (e) {
	loadJSON();
  });

    
});
    
    
});
