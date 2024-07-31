$(document).ready(function () {
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
    alpha: 1,
    selectable: true,
    draggable: true,
    angle: 0,
    userData: {},
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
      bgColor: "#43a343",
      color: "#378637",
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
    var logo = $("#logoPicker").val();
    var bgColor = $("#logoPicker").data("bg");
    var strokeColor = $("#logoPicker").data("stroke");
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
              if (figure.cssClass === "folderGroup") {
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

      canvasContainer.css({
        marginTop: -centerY + window.innerHeight / 2,
        marginLeft: -centerX + window.innerWidth / 2,
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
      var id = $("#organizerId").val();
      var url =
        siteroot + "/" + mediadb + "/services/module/smartorganizer/data/" + id;
      jQuery.ajax({
        dataType: "json",
        url: url,
        method: "GET",
        success: function (res) {
          if (res.response.status == "ok") {
            var saveddata = res.data.json;
            try {
              if (saveddata == undefined) {
                throw new Error("Empty JSON");
              }
              var updateddata = saveddata.replaceAll("${apphome}", apphome);
              var parsed = JSON.parse(updateddata);
              if (!parsed.length) {
                throw new Error("Empty JSON");
              }
              reader.unmarshal(canvas, parsed);
            } catch (e) {
              //console.log(e);
              console.log("Empty JSON, loading defaults.");
              reader.unmarshal(canvas, placeholderJSON);
            }
            recenterCanvas();

            var img = new Image();
            img.src = logo;
            img.onload = function () {
              var imgWidth = img.naturalWidth;
              var imgHeight = img.naturalHeight;
              var aspectRatio = imgWidth / imgHeight;

              if (aspectRatio > 1) {
                imgWidth = 200;
                imgHeight = imgWidth / aspectRatio;
              } else {
                imgHeight = 90;
                imgWidth = imgHeight * aspectRatio;
              }

              var prevLogo = canvas.getFigure("logo");

              if (prevLogo) {
                canvas.remove(prevLogo);
              }

              var mainNode = canvas.getFigure("main");
              var centerX = mainNode.getX() + 110;
              var centerY = mainNode.getY() + 50;

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
                centerX - imgWidth / 2,
                centerY - imgHeight / 2
              );

              var main = canvas.getFigure("main");
              main.setColor(strokeColor);
              main.setBackgroundColor(bgColor);
            };
          }
        },
      });
    }

    loadJSON();

    function handleSelect(selectedFolder = null) {
      if (!selectedFolder) {
        selectedFolder = canvas.getPrimarySelection();
      }
      if (selectedFolder && selectedFolder.cssClass === "folderGroup") {
        var selectedFolderId = selectedFolder.getId();
        var selectedIcon = canvas.getFigure(selectedFolderId + "-icon");
        if (selectedIcon) {
          $("#folderThumbPickerBtn").html(
            `<img src="${selectedIcon.getPath()}" />`
          );
        } else {
          $("#folderThumbPickerBtn").html("");
        }
        selectedLabel = canvas.getFigure(selectedFolderId + "-label");
        if (!selectedLabel) return;
        $("#folderId").val(selectedLabel.getUserData()?.moduleid || "");
        $("#folderLabel").val(selectedLabel.getText() || "");
        $("#folderDesc").val(selectedLabel.getUserData()?.description || "");

        updateModPosition(selectedFolder);
        $("#mod-toggler")
          .find("i")
          .removeClass("bi-gear-fill")
          .addClass("bi-gear");
        $("#mod-toggler").fadeIn();

        selectedFolder.on("drag", function () {
          updateModPosition(selectedFolder);
        });

        // var connections = selectedFolder.getConnections();
        // connections.each(function (_, n) {
        //   n.select();
        //   console.log(n.getSource());
        // });
        // console.log(canvas.getSelection());
      } else {
        $("#modifySelection").hide();
        $("#mod-toggler").fadeOut();
        selectedLabel = null;
      }
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
        left: bb.x - 30,
        top: bb.y + 10,
      });

      var modCss = {
        left: bb.x + 160,
        top: Math.max(bb.y, 80),
        bottom: "auto",
      };
      if (bb.x + 566 > canvasWidth) {
        modCss.left = bb.x - 436;
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
      $("#modifySelection").hide();
      $("#mod-toggler").fadeOut();
      $("#folderThumbPickerBtn").html("");
      selectedLabel = null;
    });

    $("#mod-toggler").click(function () {
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
      if (!cssClass || !cssClass.startsWith("folder")) return;
      var composite = figure.getComposite();
      var label = canvas.getFigure(composite.id + "-label");
      // var icon = canvas.getFigure(composite.id + "-icon");
      if (cssClass === "folderIcon") {
        $("#folderThumbPickerBtn").trigger("click");
      } else {
        triggerInplaceEdit(label);
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

    $("#folderLabel").on("input", function () {
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

    $("#folderDesc").on("input", function () {
      selectedLabel.setUserData({
        description: $(this).val(),
      });
    });

    $("#folderId").on("input", function () {
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
      $(this).on("click", "button", function () {
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
      });
    });

    canvas.getCommandStack().addEventListener(function (e) {
      if (e.isPostChangeEvent()) {
        saveJSON();
      }
    });

    $("#modifySelection").draggable({
      handle: "#dragHandle",
    });

    var saveBtn = $("#saveOrganizer");

    saveBtn.click(saveJSON);

    var autoSaveTimeout;

    function saveJSON() {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
      }
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

        saveBtn.addClass("saving");
        saveBtn.find("span").text("Saving...");

        var url =
          siteroot +
          "/" +
          mediadb +
          "/services/module/smartorganizer/data/" +
          id;

        var datastring = JSON.stringify(data);
        var updateddata = datastring.replaceAll(apphome, "${apphome}");

        jQuery.ajax({
          dataType: "json",
          method: "PUT",
          contentType: "application/json; charset=utf-8",
          url: url,
          data: updateddata,
          success: function () {
            saveBtn.removeClass("saving");
            saveBtn.addClass("saved");
            saveBtn.find("span").text("Saved");
          },
          complete: function () {
            setTimeout(() => {
              saveBtn.find("span").text("");
              saveBtn.removeClass("saved");
              saveBtn.removeClass("saving");
            }, 1000);
          },
        });
      });
      autoSaver();
    }

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
    autoSaveTimeout = setTimeout(autoSaver, 30 * 1000);

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

    $("#vToTop").click(function () {
      var pos = parseInt(canvasContainer.css("margin-top")) + 50;
      if (pos > 0) {
        $(this).prop("disabled", true);
        return;
      }
      $("#vToBottom").prop("disabled", false);
      canvasContainer.css("margin-top", pos);
    });
    $("#vToBottom").click(function () {
      var pos = parseInt(canvasContainer.css("margin-top")) - 50;
      if (Math.abs(pos) > canvasHeight - 80) {
        $(this).prop("disabled", true);
        return;
      }
      $("#vToTop").prop("disabled", false);
      canvasContainer.css("margin-top", pos);
    });
    $("#vToLeft").click(function () {
      var pos = parseInt(canvasContainer.css("margin-left")) + 50;
      if (pos > 0) {
        $(this).prop("disabled", true);
        return;
      }
      $("#vToRight").prop("disabled", false);
      canvasContainer.css("margin-left", pos);
    });
    $("#vToRight").click(function () {
      var pos = parseInt(canvasContainer.css("margin-left")) - 50;
      if (Math.abs(pos) > maxLeft) {
        $(this).prop("disabled", true);
        return;
      }
      $("#vToLeft").prop("disabled", false);
      canvasContainer.css("margin-left", pos);
    });
    $("#zoomInBtn").click(function () {
      var zoom = canvas.getZoom();
      if (zoom < 0.5) return;
      zoom -= 0.1;
      canvas.setZoom(zoom);
    });

    $("#zoomOutBtn").click(function () {
      var zoom = canvas.getZoom();
      if (zoom > 2) return;
      zoom += 0.1;
      canvas.setZoom(zoom);
    });

    $("#zoomResetBtn").click(function () {
      canvas.setZoom(1.0);
      recenterCanvas();
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
      recenterCanvas();
      console.log("Inserted template");
      closeemdialog($(this).closest(".modal"));
    });
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

  lQuery(".restoreversion").livequery("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
    runajaxonthis($(this), e);
    closeemdialog($(this).closest(".modal"));
  });
});
