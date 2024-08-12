lQuery("#componentViewer").livequery(function () {
  var apphome = app.data("siteroot") + app.data("apphome");

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

  var rootId = draw2d.util.UUID.create();
  var rootJson = function ({ x, y }) {
    return [
      {
        type: "draw2d.shape.composite.Group",
        id: rootId,
        x: x,
        y: y,
        width: 150,
        height: 125,
        bgColor: "none",
        color: "none",
        stroke: 0,
        alpha: 1,
        cssClass: "rootGroup",
        ports: [
          {
            id: draw2d.util.UUID.create(),
            type: "draw2d.HybridPort",
            width: 16,
            height: 16,
            selectable: true,
            draggable: true,
            bgColor: "#60729e",
            color: "#4d5d80",
            stroke: 2,
            port: "draw2d.HybridPort",
            locator: "draw2d.layout.locator.XYAbsPortLocator",
            name: draw2d.util.UUID.create(),
            locatorAttr: {
              x: 150,
              y: 64,
            },
          },
        ],
      },
      {
        type: "draw2d.shape.basic.Image",
        x: x,
        y: y,
        id: draw2d.util.UUID.create(),
        type: "draw2d.shape.basic.Image",
        width: 150,
        height: 125,
        path: apphome + "/theme/images/ft.svg",
        draggable: true,
        selectable: true,
        resizable: false,
        cssClass: "rootImage",
        composite: rootId,
      },
      {
        type: "draw2d.shape.basic.Label",
        id: rootId + "-label",
        x: x + 72,
        y: y + 88,
        width: 150,
        text: "Book",
        textAnchor: "middle",
        stroke: 0,
        fontSize: 20,
        fontWeight: "bold",
        fontColor: "#ffffff",
        bgColor: "none",
        selectable: false,
        draggable: false,
        cssClass: "rootLabel",
        userData: {
          description: "",
          moduleid: "",
        },
        composite: rootId,
      },
      {
        type: "draw2d.shape.basic.Image",
        id: rootId + "-icon",
        x: x + (150 - 50) / 2,
        y: y + 30,
        width: 50,
        height: 50,
        draggable: false,
        selectable: false,
        composite: rootId,
        cssClass: "rootIcon",
        path: apphome + "/theme/icons/bootstrap/folder.svg",
      },
    ];
  };

  var labelPort = {
    type: "draw2d.HybridPort",
    bgColor: "#60729e",
    color: "#4d5d80",
    port: "draw2d.HybridPort",
    locator: "draw2d.layout.locator.XYRelPortLocator",
    width: 16,
    height: 16,
  };
  var componentJson = function (attr) {
    var componentId = draw2d.util.UUID.create();
    var data = [
      {
        type: "draw2d.shape.composite.Group",
        id: componentId,
        x: attr.x,
        y: attr.y,
        width: 300,
        height: 80,
        bgColor: attr.bgColor,
        color: attr.color,
        stroke: 1,
        cssClass: "labelGroup",
        radius: 4,
        ports: [
          {
            id: draw2d.util.UUID.create(),
            name: "labelPortLeft",
            ...labelPort,
            locatorAttr: {
              x: 0,
              y: 50,
            },
          },
          {
            id: draw2d.util.UUID.create(),
            name: "labelPortRight",
            ...labelPort,
            locatorAttr: {
              x: 100,
              y: 50,
            },
          },
        ],
      },
      {
        type: "draw2d.shape.basic.Label",
        id: componentId + "-title",
        x: attr.x + 300 / 2 - 5,
        y: attr.y + 80 / 4,
        text: attr.title,
        textAnchor: "middle",
        stroke: 0,
        fontSize: 20,
        fontColor: "#4d5d80",
        bgColor: "none",
        selectable: false,
        draggable: false,
        cssClass: "titleLabel",
        composite: componentId,
      },
    ];
    return data;
  };

  var reader = new draw2d.io.json.Reader();

  var root = rootJson({
    x: 100,
    y: 400,
  });
  var component1 = componentJson({
    x: 360,
    y: 280,
    title: "Author",
    bgColor: "#f0f0f0",
    color: "#4d5d80",
  });
  var component2 = componentJson({
    x: 360,
    y: 580,
    title: "Name",
    bgColor: "#f0f0f0",
    color: "#4d5d80",
  });
  var component3 = componentJson({
    x: 720,
    y: 180,
    title: "Age",
    bgColor: "#fd7e14",
    color: "#ffffff",
  });
  var component4 = componentJson({
    x: 720,
    y: 380,
    title: "Cover",
    bgColor: "#fd7e14",
    color: "#ffffff",
  });
  var data = root
    .concat(component1)
    .concat(component2)
    .concat(component3)
    .concat(component4);
  reader.unmarshal(canvas, data);
  $(document).on("keydown", function (e) {
    var writer = new draw2d.io.json.Writer();
    writer.marshal(canvas, function (json) {
      console.log(JSON.stringify(json, null, 2));
    });
  });
});
