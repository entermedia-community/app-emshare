function hexToRgb(hex) {
  if (hex.length == 4) {
    hex = hex.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3");
  }
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
function rgbToHex(r, g, b) {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}
function setContrast(hex) {
  var rgb = hexToRgb(hex);
  const brightness = Math.round(
    (parseInt(rgb.r) * 299 + parseInt(rgb.g) * 587 + parseInt(rgb.b) * 114) /
      1000
  );
  return brightness > 125 ? "#000000" : "#ffffff";
}
$(document).ready(function () {
  //See if UI is already initialized
  if ($("#organizer_canvas").data("uiloaded") == true) {
    console.log("Smart Javascript already initialized");
    return;
  }

  var app = jQuery("#application");
  var apphome = app.data("siteroot") + app.data("apphome");
  var siteroot = $("#application").data("siteroot");
  var mediadb = $("#application").data("mediadbappid");
  var userid = $("#application").data("user");

  var canvas = null;
  var selectedLabel = null;
  var canvasWidth = 1920 * window.devicePixelRatio;
  var canvasHeight = 1080 * window.devicePixelRatio;
  var fullCanvasWidth = canvasWidth + 1000;
  var fullCanvasHeight = canvasHeight + 1000;
  var midX = fullCanvasWidth / 2;
  var midY = fullCanvasHeight / 2;
  var folderPort = {
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
  };
  var rootPort = {
    ...folderPort,
    width: 14,
    height: 14,
    stroke: 4,
    bgColor: "#43a343",
    color: "#378637",
  };
  var folderJson = function ({ x, y }) {
    var groupId = draw2d.util.UUID.create();
    return [
      {
        type: "draw2d.shape.composite.Group",
        id: groupId,
        x: x,
        y: y,
        width: 150,
        height: 125,
        bgColor: "none",
        color: "none",
        stroke: 0,
        alpha: 1,
        cssClass: "folderGroup",
        ports: [
          {
            ...folderPort,
            id: draw2d.util.UUID.create(),
            name: draw2d.util.UUID.create(),
            locatorAttr: {
              x: 0,
              y: 62,
            },
          },
          {
            ...folderPort,
            id: draw2d.util.UUID.create(),
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
        cssClass: "folderImage",
        composite: groupId,
      },
      {
        type: "draw2d.shape.basic.Label",
        id: groupId + "-label",
        x: x + 72,
        y: y + 88,
        width: 150,
        text: "New Folder",
        textAnchor: "middle",
        stroke: 0,
        fontSize: 20,
        fontWeight: "bold",
        fontColor: "#ffffff",
        bgColor: "none",
        selectable: false,
        draggable: false,
        cssClass: "folderLabel",
        userData: {
          description: "",
          moduleid: "",
        },
        composite: groupId,
      },
      {
        type: "draw2d.shape.basic.Image",
        id: groupId + "-icon",
        x: x + (150 - 50) / 2,
        y: y + 30,
        width: 50,
        height: 50,
        draggable: false,
        selectable: false,
        composite: groupId,
        cssClass: "folderIcon",
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
  var labelJson = function (attr, callback) {
    var groupId = draw2d.util.UUID.create();
    var w = attr.width;
    var h = attr.titleHeight + attr.captionHeight + (attr.image ? 110 : 30);
    var data = [
      {
        type: "draw2d.shape.composite.Group",
        id: groupId,
        x: attr.x,
        y: attr.y,
        width: w,
        height: h,
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
            name: "labelPortTop",
            ...labelPort,
            locatorAttr: {
              x: 50,
              y: 100,
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
          {
            id: draw2d.util.UUID.create(),
            name: "labelPortBottom",
            ...labelPort,
            locatorAttr: {
              x: 50,
              y: 0,
            },
          },
        ],
      },
    ];
    if (attr.title && attr.title.length > 0) {
      data.push({
        type: "draw2d.shape.basic.Label",
        id: groupId + "-title",
        x: attr.x + w / 2 - 5,
        y: attr.y + 10,
        text: attr.title,
        textAnchor: "middle",
        stroke: 0,
        fontSize: attr.titleFS,
        fontColor: setContrast(attr.bgColor),
        bgColor: "none",
        selectable: false,
        draggable: false,
        cssClass: "titleLabel",
        composite: groupId,
      });
    }
    if (attr.caption && attr.caption.length > 0) {
      data.push({
        type: "draw2d.shape.basic.Label",
        id: groupId + "-caption",
        x: attr.x + w / 2 - 5,
        y: attr.y + attr.titleHeight + (attr.image ? 110 : 10),
        text: attr.caption,
        textAnchor: "middle",
        stroke: 0,
        fontSize: attr.captionFS,
        fontColor: setContrast(attr.bgColor),
        selectable: false,
        draggable: false,
        cssClass: "captionLabel",
        composite: groupId,
      });
    }
    if (attr.image) {
      var img = new Image();
      img.onload = function () {
        var naturalWidth = img.naturalWidth;
        var naturalHeight = img.naturalHeight;
        var aspectRatio = naturalWidth / naturalHeight;

        var width = 100;
        var height = 100;
        if (aspectRatio > 1) {
          width = 100;
          height = 100 / aspectRatio;
        } else {
          height = 100;
          width = 100 * aspectRatio;
        }
        data.push({
          type: "draw2d.shape.basic.Image",
          id: groupId + "-image",
          x: attr.x + w / 2 - width / 2,
          y:
            attr.y +
            (h / 2 - height / 2) +
            (attr.titleHeight ? attr.titleHeight + 5 : 0),
          width: width,
          height: height,
          draggable: false,
          selectable: false,
          cssClass: "labelImage",
          path: attr.image,
          composite: groupId,
        });
        callback(data);
      };
      img.src = attr.image;
    } else {
      callback(data);
    }
  };
  var placeholderJSON = [
    {
      type: "draw2d.shape.node.End",
      id: "main",
      x: midX - 110,
      y: midY - 50,
      width: 220,
      height: 100,
      radius: 16,
      userData: {},
      bgColor: "#333e55",
      color: "#202835",
      stroke: 4,
      alpha: 1,
      draggable: false,
      selectable: false,
      ports: [
        {
          ...rootPort,
          id: draw2d.util.UUID.create(),
          name: "mainInputTop",
          locatorAttr: {
            x: 110,
            y: 0,
          },
        },
        {
          ...rootPort,
          id: draw2d.util.UUID.create(),
          name: "mainInputBottom",
          locatorAttr: {
            x: 110,
            y: 100,
          },
        },
        {
          ...rootPort,
          id: draw2d.util.UUID.create(),
          name: "mainInputLeft",
          locatorAttr: {
            x: 0,
            y: 50,
          },
        },
        {
          ...rootPort,
          id: draw2d.util.UUID.create(),
          name: "mainInputRight",
          locatorAttr: {
            x: 220,
            y: 50,
          },
        },
      ],
    },
  ];

  lQuery("#organizer_canvas").livequery(function () {
    $(this).data("uiloaded", true);

    var logo = $("#logoPicker").val();
    var bgColor = $("#logoPicker").data("bg");
    var strokeColor = $("#logoPicker").data("stroke");
    var changed = false;
    if (canvas) {
      canvas.clear();
      canvas = null;
    }
    //Boostrap does not use liveajax
    $(".dropdown-toggle").dropdown();
    var canvasContainer = $("#organizer_canvas");

    canvasContainer.css({
      width: fullCanvasWidth,
      height: fullCanvasHeight,
      marginTop: -midY + canvasHeight / 2,
      marginLeft: -midX + canvasWidth / 2,
    });

    canvas = new draw2d.Canvas("organizer_canvas");

    canvas.installEditPolicy(
      new draw2d.policy.connection.DragConnectionCreatePolicy({
        createConnection: function () {
          var conn = new draw2d.Connection({
            stroke: 2,
            color: "#4d5d80",
            radius: 20,
            cssClass: "connection",
            resizable: false,
            router:
              new draw2d.layout.connection.InteractiveManhattanConnectionRouter(),
          });
          conn.on("connect", function () {
            var sourcePort = conn.sourcePort?.name?.includes("mainInput");
            var targetPort = conn.targetPort?.name?.includes("mainInput");
            if (sourcePort || targetPort) {
              conn.setColor(strokeColor);
              return;
            }
            sourcePort = conn.sourcePort?.name?.includes("labelPort");
            targetPort = conn.targetPort?.name?.includes("labelPort");
            if (sourcePort || targetPort) {
              var parent = conn.getSource().getParent();
              if (parent.cssClass !== "labelGroup") {
                parent = conn.getTarget().getParent();
              }
              conn.setColor(parent.getColor());
            }
          });
          return conn;
        },
      })
    );

    canvas.installEditPolicy(new draw2d.policy.canvas.ShowGridEditPolicy());
    canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGridEditPolicy());
    canvas.installEditPolicy(new draw2d.policy.canvas.CoronaDecorationPolicy());
    canvas.uninstallEditPolicy(new draw2d.policy.canvas.WheelZoomPolicy());
    canvas.uninstallEditPolicy(
      new draw2d.policy.canvas.DefaultKeyboardPolicy()
    );
    canvas.installEditPolicy(new draw2d.policy.canvas.ZoomPolicy());

    canvas.installEditPolicy(
      new draw2d.policy.canvas.KeyboardPolicy({
        onKeyDown: function (canvas, keyCode, figure) {
          var selections = canvas.getSelection();
          if (selections.getSize() === 0) return;
          if (46 === keyCode) {
            canvas.getCommandStack().startTransaction(figure.id + " delete");
            var selections = canvas.getSelection();
            selections.each(function (_, figure) {
              var cmd = null;
              if (
                figure.cssClass === "folderGroup" ||
                figure.cssClass === "labelGroup"
              ) {
                cmd = new draw2d.command.CommandDeleteGroup(figure);
                var connections = figure.getConnections();
                connections.each(function (_, conn) {
                  var c = new draw2d.command.CommandDelete(conn);
                  c !== null && canvas.getCommandStack().execute(c);
                });
              } else {
                cmd = new draw2d.command.CommandDelete(figure);
              }
              cmd !== null && canvas.getCommandStack().execute(cmd);
            });
            canvas.getCommandStack().commitTransaction();
          }
        },
      })
    );

    function recenterCanvas() {
      var mainNode = canvas.getFigure("main");
      var centerX = mainNode.getX() + mainNode.getWidth() / 2 + 84;
      var centerY = mainNode.getY() + mainNode.getHeight() / 2 + 96;

      var containerTop = -centerY + window.innerHeight / 2;
      var containerLeft = -centerX + window.innerWidth / 2;

      canvasContainer.css({
        marginTop: containerTop,
        marginLeft: containerLeft,
      });

      /*
     //var changex = midX - centerX;
     //var changey = midY - centerY;
     var figures = canvas.getFigures();
     figures.data.forEach( function(element, index, array) {
		 if(element.cssClass == "folderGroup" || element.cssClass == "draw2d_shape_node_End") 
		 {
			 console.log("centering: " + element.cssClass);
		 	element.setX(element.getX() + changex);
		 	element.setY(element.getY() + changey);
		 }
	 }); 		
	*/
    }

    var reader = new draw2d.io.json.Reader();

    function loadJSON() {
      changed = false;
      var id = $("#organizerId").val();
      var url =
        siteroot + "/" + mediadb + "/services/module/smartorganizer/data/" + id;

      var insertjson = placeholderJSON;
      var data;
      jQuery.ajax({
        dataType: "json",
        url: url,
        method: "GET",
        success: function (res) {
          if (res.response != undefined && res.response.status == "ok") {
            data = res.data;
            var saveddata = data.json;
            if (saveddata !== undefined) {
              var updateddata = saveddata.replaceAll("${apphome}", apphome);
              var parsed = JSON.parse(updateddata);
              if (parsed.length) {
                insertjson = parsed;
                //console.log("Empty JSON, loading defaults.");
              }
            }
          } else {
            console.log("Error", res);
          }
        },
        complete: function () {
          reader.unmarshal(canvas, insertjson);
          loadEvents();

          recenterCanvas();

          if (data != null) {
            if (data.canvastop !== undefined) {
              canvasContainer.css("margin-top", parseInt(data.canvastop));
            }
            if (data.canvasleft !== undefined) {
              canvasContainer.css("margin-left", parseInt(data.canvasleft));
            }
            if (data.canvaszoom !== undefined) {
              canvas.setZoom(data.canvaszoom);
            }
          }
          var img = new Image();
          img.src = logo;
          img.onload = function () {
            var imgWidth = img.naturalWidth;
            var imgHeight = img.naturalHeight;

            var prevLogo = canvas.getFigure("logo");

            if (prevLogo) {
              canvas.remove(prevLogo);
            }

            var mainNode = canvas.getFigure("main");

            mainNode.setWidth(imgWidth * 1.2);
            mainNode.setHeight(imgHeight * 1.2);

            canvas.add(
              new draw2d.shape.basic.Image({
                id: "logo",
                path: logo,
                width: imgWidth,
                height: imgHeight,
                draggable: false,
                selectable: false,
                cssClass: "brandLogo",
              }),
              mainNode.getX() + (mainNode.getWidth() - imgWidth) / 2,
              mainNode.getY() + (mainNode.getHeight() - imgHeight) / 2
            );

            mainNode.setColor(strokeColor);
            mainNode.setBackgroundColor(bgColor);

            //TODOL: Fix ports
            mainNode.getPort("mainInputTop").setX(mainNode.getWidth() / 2);
            mainNode.getPort("mainInputTop").setY(0);

            mainNode.getPort("mainInputLeft").setX(0);
            mainNode.getPort("mainInputLeft").setY(mainNode.getHeight() / 2);

            mainNode.getPort("mainInputBottom").setX(mainNode.getWidth() / 2);
            mainNode.getPort("mainInputBottom").setY(mainNode.getHeight());

            mainNode.getPort("mainInputRight").setX(mainNode.getWidth());
            mainNode.getPort("mainInputRight").setY(mainNode.getHeight() / 2);
          };
        },
      });
    }

    function rearrangeLabel(groupNode) {
      var groupWidth = groupNode.getWidth();
      var groupHeight = groupNode.getHeight();
      var groupX = groupNode.getX();
      var groupY = groupNode.getY();

      var figures = groupNode.getAssignedFigures();
      var titleNode = figures.find((f) => f.cssClass === "titleLabel");
      var imageNode = figures.find((f) => f.cssClass === "labelImage");
      var captionNode = figures.find((f) => f.cssClass === "captionLabel");

      var onlyTitle = titleNode && !captionNode && !imageNode;
      var onlyCaption = captionNode && !titleNode && !imageNode;
      var onlyImage = imageNode && !titleNode && !captionNode;
      var titleAndCaption = titleNode && captionNode && !imageNode;
      var titleAndImage = titleNode && imageNode && !captionNode;
      var captionAndImage = captionNode && imageNode && !titleNode;
      var allThree = titleNode && captionNode && imageNode;

      var minHeight =
        (imageNode ? imageNode.getHeight() : 0) +
        (titleNode ? titleNode.getHeight() : 0) +
        (captionNode ? captionNode.getHeight() : 0);

      var minWidth =
        Math.max(
          titleNode ? titleNode.getWidth() : 0,
          captionNode ? captionNode.getWidth() : 0,
          imageNode ? imageNode.getWidth() : 0
        ) + 10;

      if (onlyTitle || onlyCaption || onlyImage) {
        minHeight += 10;
      }
      if (titleAndCaption || titleAndImage || captionAndImage) {
        minHeight += 15;
      }
      if (allThree) {
        minHeight += 20;
      }

      if (groupWidth < minWidth) {
        groupNode.setWidth(minWidth);
        groupWidth = minWidth;
      }

      if (groupHeight < minHeight) {
        groupNode.setHeight(minHeight);
        groupHeight = minHeight;
      }

      if (titleNode) {
        titleNode.setPosition(groupX + groupWidth / 2, groupY + 5);
      }

      if (imageNode) {
        var aspectRatio = imageNode.getWidth() / imageNode.getHeight();
        var newWidth;
        var newHeight;

        if (groupWidth / groupHeight > 1) {
          if (aspectRatio > 1) {
            newWidth = groupHeight - 10;
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = groupHeight - 10;
            newWidth = newHeight * aspectRatio;
          }
        } else {
          if (aspectRatio > 1) {
            newWidth = groupWidth - 10;
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = groupWidth - 10;
            newHeight = newWidth * aspectRatio;
          }
        }

        imageNode.setWidth(newWidth);
        imageNode.setHeight(newHeight);

        var x = groupX + (groupWidth - newWidth) / 2;
        var y = groupY + (groupHeight - newHeight) / 2;
        imageNode.setPosition(x, y);
      }

      if (captionNode) {
        captionNode.setX(groupX + groupWidth / 2);
        captionNode.setY(groupY + groupHeight - captionNode.getHeight() - 5);
      }
    }

    function loadEvents(labelGroups = null) {
      if (!labelGroups) {
        labelGroups = canvas
          .getFigures()
          .data.filter((f) => f.cssClass === "labelGroup");
      }
      labelGroups.forEach(function (node) {
        node.on("resize", rearrangeLabel);
      });
    }

    function handleSelect(selectedGroup = null) {
      if (!selectedGroup) {
        selectedGroup = canvas.getPrimarySelection();
      }
      if (selectedGroup) {
        if (selectedGroup.cssClass === "folderGroup") {
          var selectedGroupId = selectedGroup.getId();
          var selectedIcon = canvas.getFigure(selectedGroupId + "-icon");
          if (selectedIcon) {
            $("#folderThumbPickerBtn").html(
              `<img src="${selectedIcon.getPath()}" />`
            );
          } else {
            $("#folderThumbPickerBtn").html("");
          }
          selectedLabel = canvas.getFigure(selectedGroupId + "-label");
          if (!selectedLabel) return;
          $("#folderId").val(selectedLabel.getUserData()?.moduleid || "");
          $("#folderLabel").val(selectedLabel.getText() || "");
          $("#folderDesc").val(selectedLabel.getUserData()?.description || "");

          updateModPosition(selectedGroup);

          $("#mod-toggler")
            .find("i")
            .removeClass("bi-gear-fill")
            .addClass("bi-gear");
          $("#mod-toggler").fadeIn();

          selectedGroup.on("drag", function () {
            updateModPosition(selectedGroup);
          });
        } else if (selectedGroup.cssClass === "labelGroup") {
          var figures = selectedGroup.getAssignedFigures();
          var titleNode = figures.find((f) => f.cssClass === "titleLabel");
          var imageNode = figures.find((f) => f.cssClass === "labelImage");
          var captionNode = figures.find((f) => f.cssClass === "captionLabel");
          var A = document.createElement("a");
          A.className = "label-mod-toggler emdialog";
          A.setAttribute(
            "href",
            siteroot + apphome + "/components/smartorganizer/label.html"
          );
          A.setAttribute("role", "button");
          A.dataset.dialogid = "labelPicker";
          A.dataset.oemaxlevel = "1";
          A.dataset.id = selectedGroup.getId();
          A.dataset.title = titleNode ? titleNode.getText() : "";
          A.dataset.titleFS = titleNode ? titleNode.getFontSize() : "";
          A.dataset.caption = captionNode ? captionNode.getText() : "";
          A.dataset.captionFS = captionNode ? captionNode.getFontSize() : "";
          A.dataset.image = imageNode ? imageNode.getPath() : "";
          var bgColor = selectedGroup.getBackgroundColor();
          A.dataset.bgColor = rgbToHex(
            bgColor.red,
            bgColor.green,
            bgColor.blue
          );
          var color = selectedGroup.getColor();
          A.dataset.color = rgbToHex(color.red, color.green, color.blue);

          A.innerHTML = "<i class='bi bi-gear-fill'></i>";
          $(".org-row").append(A);
          updateLabelConfigPosition(
            A,
            selectedGroup.getX(),
            selectedGroup.getY(),
            selectedGroup.getWidth()
          );
          selectedGroup.on("drag", function () {
            updateLabelConfigPosition(
              A,
              selectedGroup.getX(),
              selectedGroup.getY(),
              selectedGroup.getWidth()
            );
          });
          hideFolderConfig();
        }
      } else {
        hideFolderConfig();
        hideLabelConfig();
      }
    }

    function updateLabelConfigPosition(A, x, y, width) {
      $(A).css({
        color: "#60729e",
        position: "fixed",
        left: x + width + parseInt(canvasContainer.css("margin-left")) + 125,
        top: y + parseInt(canvasContainer.css("margin-top")) + 55,
        zIndex: 999,
      });
    }

    function hideLabelConfig() {
      $(".label-mod-toggler").each(function () {
        $(this).remove();
      });
    }

    function hideFolderConfig() {
      $("#modifySelection").hide();
      $("#mod-toggler").fadeOut();
      selectedLabel = null;
    }

    lQuery(".deploy-organizer-finish").livequery("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      //saveJSON(); //is blocking?
      var url = $(this).data("url");
      var id = $("#organizerId").val();
      $("#deployOrganizer").load(url + "?oemaxlevel=1&id=" + id);
    });

    function updateModPosition(selectedFolder) {
      var bb = {
        x:
          selectedFolder.getX() +
          parseInt(canvasContainer.css("margin-left")) +
          116,
        y:
          selectedFolder.getY() +
          parseInt(canvasContainer.css("margin-top")) +
          70,
      };

      $("#mod-toggler").css({
        left: bb.x + 150,
        top: bb.y + 10,
      });

      var modCss = {
        left: bb.x + 170,
        top: Math.max(bb.y, 80),
        bottom: "auto",
      };
      if (bb.x + 566 > canvasWidth) {
        modCss.left = bb.x - 426;
      }
      if (bb.y + 350 > canvasHeight) {
        modCss.top = "auto";
        modCss.bottom = 0;
      }
      $("#modifySelection").css(modCss);
    }

    canvas.on("select", function () {
      handleSelect();
    });

    canvas.on("unselect", function () {
      hideFolderConfig();
      hideLabelConfig();
      $("#folderThumbPickerBtn").html("");
    });

    $("#mod-toggler").click(function (e) {
      e.stopImmediatePropagation();
      if ($("#modifySelection").is(":visible")) {
        $(this).find("i").removeClass("bi-gear-fill").addClass("bi-gear");
      } else {
        $(this).find("i").removeClass("bi-gear").addClass("bi-gear-fill");
      }
      $("#modifySelection").fadeToggle();
    });

    function triggerInplaceEdit(label) {
      function commit() {
        var newLabel = label.html.val();
        selectedLabel = label;
        handleLabelChange(newLabel);
        $("#folderLabel").val(newLabel);
        cancel();
      }

      function cancel() {
        canvasContainer.unbind("click", commit);
        selectedLabel = null;
        label.html.fadeOut(function () {
          label.html.remove();
          label.html = null;
        });
      }

      canvasContainer.bind("click", commit);

      label.html = $('<input id="inplaceeditor" autocomplete="off" />');
      label.html.val(label.getText());
      label.html.hide();

      canvasContainer.parent().append(label.html);

      label.html.bind("input", function (e) {
        var labelText = label.html.val();
        if (labelText.length > 32) {
          labelText = labelText.substring(0, 32);
          label.html.val(labelText);
          return;
        }
        if (e.which == 13) {
          commit();
        }
      });

      label.html.bind("blur", commit);

      label.html.bind("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
      });

      label.html.css({
        position: "absolute",
        top: label.getY() + parseInt(canvasContainer.css("margin-top")),
        left: label.getX() + parseInt(canvasContainer.css("margin-left")),
        width: 146,
        height: Math.max(32),
        marginLeft: 2,
      });
      label.html.fadeIn(function () {
        label.html.focus();
      });
    }

    canvas.on("dblclick", function (_, node) {
      var figure = node.figure;
      var cssClass = figure.cssClass;
      var composite = figure.getComposite();
      if (!cssClass || !composite) return;
      if (cssClass.startsWith("folder")) {
        var label = canvas.getFigure(composite.id + "-label");
        // var icon = canvas.getFigure(composite.id + "-icon");
        if (cssClass === "folderIcon") {
          $("#folderThumbPickerBtn").trigger("click");
        } else {
          triggerInplaceEdit(label);
        }
      }
    });

    function addFolderAt(x, y) {
      var newFolder = folderJson({
        x: x,
        y: y,
      });
      reader.unmarshal(canvas, newFolder);
      var folderGroup = canvas.getFigure(newFolder[0].id);
      var prevSelections = canvas.getSelection();
      if (prevSelections) {
        var selections = prevSelections.getAll();
        selections.each((_, selection) => selection.unselect());
      }
      canvas.html.focusin();
      folderGroup.select();
      handleSelect(folderGroup);
      saveJSON();
      changed = true;
    }

    var folderDragging = false;
    $("#addFolderBtn").on("mouseup", function () {
      if (folderDragging) {
        folderDragging = false;
        return;
      }
      var mainNode = canvas.getFigure("main");
      var centerX = mainNode.getX() + 110;
      var centerY = mainNode.getY() + 50;
      var dirX = Math.random() > 0.5 ? 150 : -300;
      var dirY = Math.random() > 0.5 ? 150 : -300;
      addFolderAt(
        centerX + dirX + Math.random() * 50,
        centerY + dirY + Math.random() * 50
      );
    });

    $("#addFolderBtn").draggable({
      scope: "smartOrg",
      helper: "clone",
      revert: "invalid",
      start: function () {
        folderDragging = true;
      },
      end: function () {
        folderDragging = false;
      },
    });
    $(".org-canvas").droppable({
      scope: "smartOrg",
      tolerance: "pointer",
      drop: function (_, ui) {
        var zoom = canvas.getZoom();
        var offsetTop = $("#organizer_canvas").css("margin-top");
        var offsetLeft = $("#organizer_canvas").css("margin-left");
        offsetTop = parseInt(offsetTop) * -1;
        offsetLeft = parseInt(offsetLeft) * -1;
        $(this).css("opacity", 1);
        folderDragging = false;
        addFolderAt(
          (offsetLeft + ui.position.left) * zoom - 120 * zoom,
          (offsetTop + ui.position.top) * zoom - 30 * zoom
        );
      },
      over: function () {
        $(this).css("opacity", 0.2);
      },
      out: function () {
        $(this).css("opacity", 1);
      },
    });

    function getLines(text) {
      text = text.trim();
      if (text.length <= 16) return [text];
      var lines = text.match(/.{1,16}/g);
      if (!lines) return [];
      return lines.map((l) => l.trim());
    }

    function measureText(text, fontSize) {
      if (text.length === 0) return { width: 0, height: 0 };
      var SPAN = document.createElement("span");
      SPAN.style.cssText =
        "display:inine-block;line-height:1;font-family:Arial;font-size:" +
        fontSize +
        "px";
      SPAN.innerHTML = text;
      var span = $(SPAN);
      $("body").append(span);
      var w = $(span).width();
      var h = $(span).height();
      span.remove();
      return { width: Math.ceil(w), height: Math.ceil(h) };
    }

    function getFontSize(txt, fs = 20) {
      var SPAN = document.createElement("span");
      SPAN.style.cssText =
        "display:inine-block;line-height:1;font-family:Arial;font-size:" +
        fs +
        "px";
      SPAN.innerHTML = txt;
      var span = $(SPAN);
      $("body").append(span);
      var w = $(span).width();
      var h = $(span).height();
      while (w > 134 || h > 36) {
        fs--;
        $(span).css("font-size", fs);
        w = $(span).width();
        h = $(span).height();
      }
      span.remove();
      return fs;
    }

    function handleLabelChange(newLabel) {
      if (newLabel.length === 0) {
        selectedLabel.setText("");
        return;
      }
      if (selectedLabel) {
        var lines = getLines(newLabel);
        selectedLabel.setText(lines.join("\n"));
        var fs = getFontSize(lines.join("<br>"));
        selectedLabel.setFontSize(fs);
      }
    }

    $("#folderLabel").on("input", function (e) {
      e.stopImmediatePropagation();
      var labelText = $(this).val();
      if (labelText.length > 32) {
        labelText = labelText.substring(0, 32);
        $(this).val(labelText);
        return;
      }
      handleLabelChange(labelText);
    });

    $("#folderLabel").on("focusout", function () {
      var currentdata = selectedLabel.getUserData();
      if (currentdata !== undefined && currentdata.moduleid == "") {
        var labelText = $(this).val();
        var newid = labelText.toLowerCase();
        newid = newid.replace(" ", "-");
        $("#folderId").val(newid);
        selectedLabel.setUserData({
          moduleid: newid,
        });
      }
    });

    $("#folderDesc").on("input", function (e) {
      e.stopImmediatePropagation();
      selectedLabel.setUserData({
        description: $(this).val(),
      });
    });

    $("#folderId").on("input", function (e) {
      e.stopImmediatePropagation();
      selectedLabel.setUserData({
        moduleid: $(this).val(),
      });
    });

    lQuery("#iconsList").livequery(function () {
      if ($(this).children().length < 2050) {
        var icHtm = "";
        _bsIcons = $(this).text();
        var bsIcons = JSON.parse(_bsIcons);
        for (var i = 0; i < bsIcons.length; i++) {
          icHtm += `<div><button type="button" class="btn"><img src="${apphome}/theme/icons/bootstrap/${bsIcons[i]}.svg" loading="lazy"/></button><span>${bsIcons[i]}</span></div>`;
        }
        $(this).html(icHtm);
      }
      $(this).on("click", "button", function (e) {
        e.stopImmediatePropagation();
        showLoader();
        var iconPath = $(this).find("img").attr("src");
        var selectedFolder = canvas.getPrimarySelection();
        var selectedFolderId = selectedFolder.getId();
        var prevIcon = canvas.getFigure(selectedFolderId + "-icon");
        if (!prevIcon) {
          return;
        }
        prevIcon.setPath(iconPath);
        $("#folderThumbPickerBtn").html(`<img src="${iconPath}" />`);
        closeemdialog($(this).closest(".modal"));
        hideLoader();
        saveJSON();
        changed = true;
      });
    });

    canvas.getCommandStack().addEventListener(function (e) {
      if (e.isPostChangeEvent()) {
        saveJSON();
        changed = true;
      }
    });

    $("#modifySelection").draggable({
      handle: "#dragHandle",
    });

    var saveBtn = $("#saveOrganizer");

    saveBtn.on("click", function () {
      changed = false;
      saveJSON();
      saveJSON(true);
    });

    //var autoSaveTimeout;

    function saveJSON(usersaved = false) {
      /*
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
      }
      */
      if (!canvas) {
        return;
      }

      var writer = new draw2d.io.json.Writer();

      writer.marshal(canvas, function (json) {
        if (json.length === 0) return;
        var data = {};

        var id = $("#organizerId").val();

        data.id = id;
        data.name = $("#organizerName").val();
        data.json = JSON.stringify(json);

        data.updatedby = userid;
        const date2 = new Date();
        data.updatedon = date2.toJSON();

        data.iscurrent = "true";
        data.canvaszoom = canvas.getZoom();
        data.canvastop = canvasContainer.css("margin-top");
        data.canvasleft = canvasContainer.css("margin-left");

        var url = "";
        var submitmethod = "";
        if (usersaved) {
          url =
            siteroot +
            "/" +
            mediadb +
            "/services/module/smartorganizer/data/" +
            id;
          submitmethod = "PUT";

          saveBtn.addClass("saving");
          saveBtn.find("span").text("Saving...");
        } else {
          url =
            siteroot +
            "/" +
            mediadb +
            "/services/module/smartorganizerversions/create";
          data.id = "";
          submitmethod = "POST";
        }

        var datastring = JSON.stringify(data);
        var updateddata = datastring.replaceAll(apphome, "${apphome}");

        jQuery.ajax({
          dataType: "json",
          method: submitmethod,
          contentType: "application/json; charset=utf-8",
          url: url,
          data: updateddata,
          success: function () {
            if (usersaved) {
              saveBtn.removeClass("saving");
              saveBtn.addClass("saved");
              saveBtn.find("span").text("Saved");
            }
          },
          complete: function () {
            if (usersaved) {
              setTimeout(() => {
                saveBtn.find("span").text("");
                saveBtn.removeClass("saved");
                saveBtn.removeClass("saving");
              }, 1000);
            }
          },
        });
      });
      //autoSaver();
    }
    /*
    function autoSaver() {
      if ($("#organizer_canvas").length == 0) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
        return;
      }
      if (!autoSaveTimeout) {
        autoSaveTimeout = setTimeout(autoSaver, 30 * 1000);
        return;
      }
      saveJSON();
    }
  */
    //autoSaveTimeout = setTimeout(autoSaver, 30 * 1000);

    var maxLeft = Math.floor(canvasWidth / 2 + 100);
    canvas.installEditPolicy(
      new draw2d.policy.canvas.CanvasPolicy({
        onMouseWheel: function (delta, _, _, shiftKey, ctrlKey) {
          delta *= 0.5;
          if (ctrlKey && !shiftKey) {
            var pos = parseInt(canvasContainer.css("margin-top")) + delta;
            if (pos > 0) {
              $("#vToTop").prop("disabled", true);
              $("#vToBottom").prop("disabled", false);
              canvasContainer.css("margin-top", 0);
              return;
            }
            if (Math.abs(pos) > canvasHeight - 80) {
              $("#vToBottom").prop("disabled", true);
              $("#vToTop").prop("disabled", false);
              canvasContainer.css("margin-top", -canvasHeight + 120);
              return;
            }
            $("#vToTop").prop("disabled", false);
            $("#vToBottom").prop("disabled", false);
            canvasContainer.css("margin-top", pos);
          } else if (ctrlKey && shiftKey) {
            var pos = parseInt(canvasContainer.css("margin-left")) + delta;
            if (pos > 0) {
              $("#vToLeft").prop("disabled", true);
              $("#vToRight").prop("disabled", false);
              canvasContainer.css("margin-left", 0);
              return;
            }
            if (Math.abs(pos) > maxLeft) {
              $("#vToRight").prop("disabled", true);
              $("#vToLeft").prop("disabled", false);
              canvasContainer.css("margin-left", -maxLeft);
              return;
            }
            $("#vToLeft").prop("disabled", false);
            $("#vToRight").prop("disabled", false);
            canvasContainer.css("margin-left", pos);
          }
        },
      })
    );

    $("#vToTop").click(function (e) {
      e.stopImmediatePropagation();
      var pos = parseInt(canvasContainer.css("margin-top")) + 50;
      if (pos > 0) {
        $(this).prop("disabled", true);
        return;
      }
      $("#vToBottom").prop("disabled", false);
      canvasContainer.css("margin-top", pos);
    });
    $("#vToBottom").click(function (e) {
      e.stopImmediatePropagation();
      var pos = parseInt(canvasContainer.css("margin-top")) - 50;
      if (Math.abs(pos) > canvasHeight - 80) {
        $(this).prop("disabled", true);
        return;
      }
      $("#vToTop").prop("disabled", false);
      canvasContainer.css("margin-top", pos);
    });
    $("#vToLeft").click(function (e) {
      e.stopImmediatePropagation();
      var pos = parseInt(canvasContainer.css("margin-left")) + 50;
      if (pos > 0) {
        $(this).prop("disabled", true);
        return;
      }
      $("#vToRight").prop("disabled", false);
      canvasContainer.css("margin-left", pos);
    });
    $("#vToRight").click(function (e) {
      e.stopImmediatePropagation();
      var pos = parseInt(canvasContainer.css("margin-left")) - 50;
      if (Math.abs(pos) > maxLeft) {
        $(this).prop("disabled", true);
        return;
      }
      $("#vToLeft").prop("disabled", false);
      canvasContainer.css("margin-left", pos);
    });
    $("#zoomInBtn").click(function (e) {
      e.stopImmediatePropagation();
      var zoom = canvas.getZoom();
      if (zoom < 0.5) return;
      zoom -= 0.1;
      canvas.setZoom(zoom);

      var change = -80;

      var newleft = parseInt(canvasContainer.css("margin-left")) + change;
      canvasContainer.css("margin-left", newleft);

      var newtop = parseInt(canvasContainer.css("margin-top")) + change;
      canvasContainer.css("margin-top", newtop);
    });

    $("#zoomOutBtn").click(function (e) {
      e.stopImmediatePropagation();
      var zoom = canvas.getZoom();
      if (zoom > 2) return;
      zoom += 0.1;
      canvas.setZoom(zoom);

      var change = 80;

      var newleft = parseInt(canvasContainer.css("margin-left")) + change;
      canvasContainer.css("margin-left", newleft);

      var newtop = parseInt(canvasContainer.css("margin-top")) + change;
      canvasContainer.css("margin-top", newtop);
    });

    $("#zoomResetBtn").click(function (e) {
      e.stopImmediatePropagation();
      canvas.setZoom(1.0);
      recenterCanvas();
    });

    lQuery("#labelForm").livequery("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      var id = $(this).data("id");

      var titleText = $(this).find("input[name='title']").val();
      var titleFS = $(this).find("input[name='fst']").val();
      var captionText = $(this).find("input[name='caption']").val();
      var captionFS = $(this).find("input[name='fsc']").val();
      var image = $(this).find("input[name='image']").val();
      var color = $(this).find("input[name='stroke']").val();
      var bgColor = $(this).find("input[name='fill']").val();

      var { width: tW, height: tH } = measureText(titleText, titleFS);
      var { width: cW, height: cH } = measureText(captionText, captionFS);
      var width = Math.max(tW, cW, 110);

      labelJson(
        {
          x: midX,
          y: midY + 200,
          width: width,
          title: titleText,
          titleFS: parseInt(titleFS) || 16,
          titleHeight: tH,
          caption: captionText,
          captionFS: parseInt(captionFS) || 16,
          captionHeight: cH,
          image: image,
          bgColor: bgColor || "#60729e",
          color: color || "#4d5d80",
        },
        function (json) {
          var groupId = json[0].id;
          reader.unmarshal(canvas, json);
          var labelGroup = canvas.getFigure(groupId);
          loadEvents([labelGroup]);
          if (id) {
            var previousGroup = canvas.getFigure(id);
            var figures = previousGroup.getAssignedFigures();
            var ports = previousGroup.getPorts();
            var prevX = previousGroup.getX();
            var prevY = previousGroup.getY();
            var prevWidth = previousGroup.getWidth();
            var prevHeight = previousGroup.getHeight();
            figures.each(function (_, figure) {
              canvas.remove(figure);
            });
            canvas.remove(previousGroup);
            labelGroup.setId(id);
            ports.each(function (_, port) {
              labelGroup.addPort(port);
              var connections = port.getConnections();
              connections.each(function (_, conn) {
                conn.setColor(labelGroup.getColor());
              });
            });
            labelGroup.setX(prevX);
            labelGroup.setY(prevY);
            labelGroup.setWidth(prevWidth);
            labelGroup.setHeight(prevHeight);
          }
          labelGroup.fireEvent("resize");
          closeemdialog($("#labelPicker"));
        }
      );
    });

    lQuery(".insert-btn").livequery("click", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      var data = $(this).siblings("textarea").val();
      //var parsed = JSON.parse(data);
      var updateparsed = data.replaceAll("${apphome}", apphome);
      var parsed = JSON.parse(updateparsed);

      //remove main node + logo
      parsed = parsed.filter((val) => val.cssClass !== "draw2d_shape_node_End");
      parsed = parsed.filter((val) => val.cssClass !== "brandLogo"); //TODO: keep Logo of current Catalog

      //skip current nodes
      var final = {};
      var writer = new draw2d.io.json.Writer();
      writer.marshal(canvas, function (json) {
        $.each(
          json.filter((el) => el.cssClass == "folderLabel"),
          function (key, folder) {
            if (folder.userData !== undefined) {
              var moduleid = folder.userData.moduleid;
              console.log(moduleid);
              var found = parsed.filter(
                (el) => el.userData.moduleid == moduleid
              );

              if (found.length > 0) {
                var composite = found[0].composite;
                //Folder Group
                parsed = parsed.filter((val) => val.id !== composite);
                //Label, icon, folder image
                parsed = parsed.filter((val) => val.composite !== composite);
              }
            }
          }
        );
      });

      reader.unmarshal(canvas, parsed);
      saveJSON();
      changed = true;
      recenterCanvas();
      console.log("Inserted template");
      closeemdialog($(this).closest(".modal"));
    });

    lQuery(".closeorgnizer").livequery("click", function () {
      if (!changed) {
        closeemdialog($(this).closest(".modal"));
        return;
      }
      if (
        confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        closeemdialog($(this).closest(".modal"));
      }
      changed = false;
    });

    loadJSON();
  }); //ends intitializer

  lQuery(".restoreversion").livequery("click", function (e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    runajaxonthis($(this), e);
    closeemdialog($(this).closest(".modal"));
  });

  lQuery(".rename-version").livequery("click", function () {
    $(this).siblings(".version-name").hide();
    $(this).siblings(".version-input").show();
    $(this).hide();
  });

  lQuery(".version-input").livequery(function () {
    var _this = $(this);
    var nameInput = $(this).find(".name");
    var vsaveBtn = $(this).find(".rename");
    var cancelBtn = $(this).find(".cancel");

    function hideInput() {
      _this.hide();
      _this.siblings(".version-name").show();
      _this.siblings(".rename-version").show();
    }

    vsaveBtn.click(function (e) {
      e.stopPropagation();

      //save
      var newName = nameInput.val();
      _this.siblings(".version-name").text(newName);

      //smartOrganizerRename
      var url = $("#templateVersionsInner").data("renameurl");

      var versionrow = vsaveBtn.closest(".version-row");
      $("#templateVersionsInner")
        .parent()
        .load(
          url +
            "?oemaxlevel=1&id=" +
            versionrow.data("versionid") +
            "&newname=" +
            encodeURI(newName)
        );
    });
    cancelBtn.click(hideInput);
  });
});
