$(document).on("draw2d", function () {
  var canvas = null;

  lQuery("#componentViewer").livequery(function () {
    if (canvas) {
      return;
    }
    setTimeout(function () {
      console.log(window.draw2d);
    }, 2000);

    var componentviewer = $(this);

    canvas = new draw2d.Canvas("componentViewer");

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

    // canvas.installEditPolicy(new draw2d.policy.canvas.ShowGridEditPolicy());
    canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGridEditPolicy());
    canvas.installEditPolicy(new draw2d.policy.canvas.CoronaDecorationPolicy());

    var reader = new draw2d.io.json.Reader();

    function loadJSON() {
      var url = componentviewer.data("loadurl");
      console.log("Loading" + url);

      var request = {
        componentdatasortby: "orderingUp",
        page: "1",
        hitsperpage: "400",
        query: {
          terms: [
            {
              field: "entityid",
              operator: "exact",
              value: componentviewer.data("entityid"),
            },
          ],
        },
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
            // canvas.clear();
            var json = [];
            for (let i = 0; i < results.length; i++) {
              let data = results[i];
              //Fix any more math?

              //Check for errors
              try {
                var parsed = JSON.parse(data.json);
                json = json.concat(parsed);
              } catch (e) {
                console.log(data.json, e); // Logs the error
              }
            }
            console.log(json);
            reader.unmarshal(canvas, json); //?parsed?
            //var updateddata = saveddata.replaceAll("${apphome}", apphome);
          } else {
            console.log("Error", res);
          }
        },
      });
    }
    loadJSON();
  });
});
