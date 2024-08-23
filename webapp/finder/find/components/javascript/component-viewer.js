var colors = ["#4d5d80", "#4d5d80", "#4caf50", "#ff5722", "#caf550", "#4d5ddf"];
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

    // canvas.installEditPolicy(
    //   new draw2d.policy.connection.DragConnectionCreatePolicy({
    //     createConnection: function () {
    //       var conn = new draw2d.Connection({
    //         stroke: 2,
    //         color: "#4d5d80",
    //         radius: 40,
    //         cssClass: "connection",
    //         resizable: false,
    //         router:
    //           new draw2d.layout.connection.InteractiveManhattanConnectionRouter(),
    //       });
    //       return conn;
    //     },
    //   })
    // );

    // canvas.installEditPolicy(new draw2d.policy.canvas.ShowGridEditPolicy());
    canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGridEditPolicy());
    // canvas.installEditPolicy(new draw2d.policy.canvas.CoronaDecorationPolicy());

    var reader = new draw2d.io.json.Reader();
    var currentRender = "";
    function loadJSON(topnodeid = "0_0") {
      hideDetails();
      currentRender = topnodeid;
      var url = componentviewer.data("loadurl");

      var request = {
        componentdatasortby: "orderingUp",
        page: "1",
        hitsperpage: "100",
        orqueries: [
          {
            terms: [
              {
                field: "entityid",
                operator: "exact",
                value: componentviewer.data("entityid"),
              },
              {
                field: "toplevelparent",
                operator: "exact",
                value: topnodeid,
              },
            ],
          },
          {
            terms: [
              {
                field: "entityid",
                operator: "exact",
                value: componentviewer.data("entityid"),
              },
              {
                field: "alwaysrender",
                operator: "exact",
                value: "true",
              },
            ],
          },
        ],
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
              try {
                if (data.json !== undefined) {
                  var parsed = JSON.parse(data.json);
                  if (data.toplevelparent) {
                    for (var j = 0; j < parsed.length; j++) {
                      var obj = parsed[j];
                      if (
                        topnodeid !== data.toplevelparent &&
                        obj.cssClass == "labelGroup"
                      ) {
                        obj.ports = obj.ports.slice(0, 1);
                      }
                      if (obj.type === "draw2d.Connection") {
                        obj.color =
                          colors[parseInt(data.nodelevel) % colors.length];
                        obj.radius = 10;
                      }
                      obj.userData = {
                        toplevelparent: data.toplevelparent,
                      };
                    }
                  }
                  json = json.concat(parsed);
                }
              } catch (e) {
                console.log(data.json, e);
              }
            }
            canvas.clear();
            $("#componentLoader").hide();
            reader.unmarshal(canvas, json);
          } else {
            console.log("Error", res);
          }
        },
      });
    }
    loadJSON();
    canvas.on("select", function (_, event) {
      var toplevelparent = event.figure.getUserData().toplevelparent;
      var id = event.figure.getId().replace("id_", "");
      var x = event.figure.getX();
      var y = event.figure.getY();
      var w = event.figure.getWidth();

      if (toplevelparent === id && currentRender !== id) {
        $("#componentLoader")
          .css({
            left: x + w + 8,
            top: y + 4,
          })
          .show();
        loadJSON(id);
      } else {
        var nodes = event.figure.getAssignedFigures();
        console.log(nodes);
        var textNode = nodes.find((n) => n.cssClass === "titleLabel");
        $("#componentDetails")
          .css({
            left: x + w + 8,
            top: y + 4,
          })
          .html('<i class="fa fa-spinner fa-spin"></i>')
          .show();
        loadDetails(id, textNode.getText());
      }
    });

    let temp;
    function loadDetails(id, text) {
      console.log(id);
      //pseudo data loading
      $("#componentDetails")
        .html(
          "<b class='mb-2'>" +
            text +
            "</b><p class='m-0'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec.</p>"
        )
        .show();
    }
    function hideDetails() {
      $("#componentDetails")
        .html('<i class="fa fa-spinner fa-spin"></i>')
        .hide();
    }
  });
});
