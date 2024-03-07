$(document).ready(function () {
  var imgSrc = $("#editingCandidate").attr("src");
  var editorWidth = $("#canvasContainer").width();
  var editorHeight = $("#canvasContainer").height();

  fabric.textureSize = 4096;
  var canvas = new fabric.Canvas("canvas");
  canvas.setWidth(editorWidth);
  canvas.setHeight(editorHeight);
  canvas.preserveObjectStacking = true;
  canvas.selection = false;

  canvas.on("mouse:wheel", function (opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 3) zoom = 3;
    if (zoom < 0.1) zoom = 0.1;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  $(".zoom-pan button").click(function () {
    var action = $(this).data("action");
    if (action === "tips") {
      $(this).popover({
        container: "body",
        html: true,
      });
      $(this).popover("show");
    } else if (action === "reset") {
      centerViewPort();
    } else {
      var zoom = canvas.getZoom();
      if (action === "zoomIn") {
        zoom *= 1.1;
      }
      if (action === "zoomOut") {
        zoom /= 1.1;
      }
      if (zoom > 3) zoom = 3;
      if (zoom < 0.1) zoom = 0.1;
      canvas.setZoom(zoom);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.code === "Numpad0" && e.ctrlKey) {
      centerViewPort();
    }
  });

  function centerViewPort() {
    canvas.setViewportTransform([
      1,
      0,
      0,
      1,
      -__imageRenderLeft + canvas.width / 2 - __imageRenderWidth / 2,
      -__imageRenderTop + canvas.height / 2 - __imageRenderHeight / 2,
    ]);
  }

  canvas.on("mouse:down", function (opt) {
    var evt = opt.e;
    if (evt.altKey === true) {
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }
  });
  canvas.on("mouse:move", function (opt) {
    if (this.isDragging) {
      var e = opt.e;
      var vpt = this.viewportTransform;
      vpt[4] += e.clientX - this.lastPosX;
      vpt[5] += e.clientY - this.lastPosY;
      this.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  });
  canvas.on("mouse:up", function (opt) {
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
    this.selection = true;
  });

  var deleteIcon =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI2ZmM2M0MSIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNNS41IDUuNUEuNS41IDAgMCAxIDYgNnY2YS41LjUgMCAwIDEtMSAwVjZhLjUuNSAwIDAgMSAuNS0uNW0yLjUgMGEuNS41IDAgMCAxIC41LjV2NmEuNS41IDAgMCAxLTEgMFY2YS41LjUgMCAwIDEgLjUtLjVtMyAuNWEuNS41IDAgMCAwLTEgMHY2YS41LjUgMCAwIDAgMSAweiIvPgogIDxwYXRoIGQ9Ik0xNC41IDNhMSAxIDAgMCAxLTEgMUgxM3Y5YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yVjRoLS41YTEgMSAwIDAgMS0xLTFWMmExIDEgMCAwIDEgMS0xSDZhMSAxIDAgMCAxIDEtMWgyYTEgMSAwIDAgMSAxIDFoMy41YTEgMSAwIDAgMSAxIDF6TTQuMTE4IDQgNCA0LjA1OVYxM2ExIDEgMCAwIDAgMSAxaDZhMSAxIDAgMCAwIDEtMVY0LjA1OUwxMS44ODIgNHpNMi41IDNoMTFWMmgtMTF6Ii8+Cjwvc3ZnPg==";
  var copyIcon =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI2IyY2NmZiIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00IDJhMiAyIDAgMCAxIDItMmg4YTIgMiAwIDAgMSAyIDJ2OGEyIDIgMCAwIDEtMiAySDZhMiAyIDAgMCAxLTItMnptMi0xYTEgMSAwIDAgMC0xIDF2OGExIDEgMCAwIDAgMSAxaDhhMSAxIDAgMCAwIDEtMVYyYTEgMSAwIDAgMC0xLTF6TTIgNWExIDEgMCAwIDAtMSAxdjhhMSAxIDAgMCAwIDEgMWg4YTEgMSAwIDAgMCAxLTF2LTFoMXYxYTIgMiAwIDAgMS0yIDJIMmEyIDIgMCAwIDEtMi0yVjZhMiAyIDAgMCAxIDItMmgxdjF6Ii8+Cjwvc3ZnPg==";

  var deleteImg = document.createElement("img");
  deleteImg.src = deleteIcon;

  var cloneImg = document.createElement("img");
  cloneImg.src = copyIcon;

  function renderIcon(icon) {
    return function renderIcon(ctx, left, top, _, fabricObject) {
      var size = this.cornerSize;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(icon, -size / 2, -size / 2, size, size);
      ctx.restore();
    };
  }

  function getDeleteControl() {
    return new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -32,
      offsetX: -4,
      cursorStyle: "pointer",
      mouseUpHandler: deleteObject,
      render: renderIcon(deleteImg),
      cornerSize: 24,
    });
  }
  function getCloneControl() {
    return new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetY: -32,
      offsetX: 4,
      cursorStyle: "pointer",
      mouseUpHandler: cloneObject,
      render: renderIcon(cloneImg),
      cornerSize: 24,
    });
  }
  fabric.Object.prototype.controls.deleteControl = getDeleteControl();
  fabric.Object.prototype.controls.clone = getCloneControl();
  fabric.Textbox.prototype.controls.deleteControl = getDeleteControl();
  fabric.Textbox.prototype.controls.clone = getCloneControl();

  function deleteObject(_, transform) {
    var target = transform.target;
    var canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
  }

  function cloneObject(_, transform) {
    var target = transform.target;
    var canvas = target.canvas;
    target.clone(function (cloned) {
      cloned.left += 10;
      cloned.top += 10;
      canvas.add(cloned);
    });
  }

  var imgInstance, selectionRect, cropRect;

  var img = new Image();
  img.src = imgSrc;
  img.onload = function () {
    var hRatio = (editorWidth - 16) / img.width;
    var vRatio = (editorHeight - 16) / img.height;
    var ratio = Math.min(hRatio, vRatio);
    if (ratio > 1) ratio = 1;

    var renderWidth = Math.floor(img.width * ratio);
    var renderHeight = Math.round(img.height * ratio);
    var primaryOffsetLeft = 0; // Math.round((editorWidth - renderWidth) / 2);
    var primaryOffsetTop = 0; // Math.round((editorHeight - renderHeight) / 2);

    window.__imageRenderWidth = renderWidth;
    window.__imageRenderHeight = renderHeight;
    window.__imageRenderLeft = primaryOffsetLeft;
    window.__imageRenderTop = primaryOffsetTop;

    selectionRect = new fabric.Rect({
      left: primaryOffsetLeft,
      top: primaryOffsetTop,
      width: img.naturalWidth,
      height: img.naturalHeight,
      fill: "rgba(255,255,255,0.35)",
      transparentCorners: false,
      stroke: "black",
      strokeDashArray: [2, 5],
      cornerColor: "white",
      cornerSize: 10,
      cornerStrokeColor: "black",
      cornerStyle: "circle",
      borderColor: "transparent",
      visible: false,
    });

    selectionRect.scaleToWidth(renderWidth);
    selectionRect.scaleToHeight(renderHeight);

    selectionRect.setControlVisible("mtr", false);
    selectionRect.setControlVisible("mt", false);
    selectionRect.setControlVisible("mb", false);
    selectionRect.setControlVisible("ml", false);
    selectionRect.setControlVisible("mr", false);
    selectionRect.setControlVisible("deleteControl", false);
    selectionRect.setControlVisible("clone", false);

    imgInstance = new fabric.Image(img, {
      left: primaryOffsetLeft,
      top: primaryOffsetTop,
      selectable: false,
      evented: false,
    });
    imgInstance.scaleToWidth(renderWidth);
    imgInstance.scaleToHeight(renderHeight);

    $("#editCandidateLoader").hide();
    canvas.add(imgInstance);
    canvas.sendToBack(imgInstance);
    canvas.add(selectionRect);
    canvas.setViewportTransform([1, 0, 0, 1, 8, 8]);
    window.__imageRenderWidth = imgInstance.getScaledWidth();
    window.__imageRenderHeight = imgInstance.getScaledHeight();
  };
  lQuery("#editingCandidate").livequery(function () {});

  var imgElement = document.getElementById("editingCandidate");
  $("#preDefFilters a").each(function () {
    var filter = $(this).data("action");
    var fpCanvas = new fabric.StaticCanvas("fpCanvas");
    fpCanvas.width = 100;
    fpCanvas.height = 100;
    var fpFilter = new fabric.Image.filters[filter]();
    var fpImgInstance = new fabric.Image(imgElement, { left: 0, top: 0 });
    fpImgInstance.scaleToWidth(100);
    fpImgInstance.scaleToHeight(100);
    fpImgInstance.filters.push(fpFilter);
    fpImgInstance.applyFilters();
    fpCanvas.add(fpImgInstance);
    fpCanvas.requestRenderAll();
    $(this).find("img").attr("src", fpCanvas.toDataURL());
    fpCanvas.dispose();
    $(this).show();
  });

  $("#preDefFilters a").click(function (e) {
    e.preventDefault();
    var filter = $(this).data("action");
    var isActive = $(this).hasClass("active");
    $(this).toggleClass("active");
    if (!isActive) {
      var filterInstance = new fabric.Image.filters[filter]();
      imgInstance.filters.push(filterInstance);
      imgInstance.applyFilters();
    } else {
      imgInstance.filters = imgInstance.filters.filter(
        (f) => f.type !== filter
      );
      imgInstance.applyFilters();
    }
    canvas.requestRenderAll();
  });
  $("#cropBtn").click(function () {
    canvas.renderAll();
    window.__imageRenderWidth = selectionRect.getScaledWidth();
    window.__imageRenderHeight = selectionRect.getScaledHeight();
    window.__imageRenderLeft = selectionRect.left;
    window.__imageRenderTop = selectionRect.top;
    cropRect = new fabric.Rect({
      left: __imageRenderLeft,
      top: __imageRenderTop,
      width: __imageRenderWidth,
      height: __imageRenderHeight,
      absolutePositioned: true,
    });

    imgInstance.clipPath = cropRect;

    selectionRect.visible = false;
    canvas.setZoom(1);
    canvas.setViewportTransform([
      1,
      0,
      0,
      1,
      -__imageRenderLeft + canvas.width / 2 - __imageRenderWidth / 2,
      -__imageRenderTop + canvas.height / 2 - __imageRenderHeight / 2,
    ]);
    canvas.discardActiveObject();
    canvas.renderAll();
    $(".crop-editor").removeClass("active");
  });

  $(".rotate-editor button").click(function () {
    var action = $(this).data("action");
    var activeObject = canvas.getActiveObject();
    if (!activeObject) {
      activeObject = imgInstance;
    }
    if (action === "flipX") {
      activeObject.flipX = !activeObject.flipX;
    }
    if (action === "flipY") {
      activeObject.flipY = !activeObject.flipY;
    }
    if (action === "rotateLeft") {
      activeObject.angle = activeObject.angle - 90;
    }
    if (action === "rotateRight") {
      activeObject.angle = activeObject.angle + 90;
    }
    canvas.requestRenderAll();
  });

  $(".editorarea a").click(function (e) {
    e.preventDefault();
    $(".panel").each(function () {
      $(this).removeClass("active");
    });
    var action = $(this).data("action");
    var panel = "." + action + "-editor";
    $(panel).css("top", $(this).offset().top);
    $(panel).toggleClass("active");
    if (action === "crop") {
      selectionRect.visible = true;
      canvas.setActiveObject(selectionRect);
      canvas.requestRenderAll();
    } else {
      selectionRect.visible = false;
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  });

  $(".x-close").click(function () {
    $(this).parent().removeClass("active");
    selectionRect.visible = false;
    canvas.requestRenderAll();
  });

  canvas.on("selection:created", onObjectSelected);
  canvas.on("selection:updated", onObjectSelected);
  function onObjectSelected(obj) {
    if (typeof obj.selected[0].text !== "undefined") {
      $("#textField").val(obj.selected[0].text);
      $("#font-color").minicolors("value", obj.selected[0].fill);
      $("#font-family").val(obj.selected[0].fontFamily);
      $("#font-weight").val(
        JSON.stringify({
          weight: obj.selected[0].fontWeight,
          style: obj.selected[0].fontStyle,
        })
      );
      $("button.text-align-btn.active").removeClass("active");
      $(
        `button.text-align-btn[data-action=${obj.selected[0].textAlign}]`
      ).addClass("active");
    } else {
      resetTextPanel();
    }
  }
  canvas.on("selection:cleared", resetTextPanel);

  function resetTextPanel() {
    $("#textField").val("");
    $("#font-color").minicolors("value", "#ffffff");
    $("#font-family").val("Roboto");
    $("#font-weight").val("{weight:400,style:normal}");
    $("button.text-align-btn").removeClass("active");
    $("button.text-align-btn").first().addClass("active");
  }

  $("#textField").keyup(function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject && typeof activeObject.text !== "undefined") {
      activeObject.text = $(this).val();
      canvas.requestRenderAll();
    } else {
      canvas.discardActiveObject();
      var text = new fabric.Textbox($(this).val(), {
        left: editorWidth / 2 - 100,
        top: editorHeight / 2 - 100,
        width: 150,
        fontSize: 20,
        fill: $("#font-color").minicolors("value"),
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      $("#font-family").val("Roboto");
      $("#font-weight").val(`{"weight":400,"style":"normal"}`);
      loadFontAndUse("Roboto", { weight: 400, style: "normal" });
    }
  });
  $("#font-color").minicolors({
    change: function (hex) {
      var activeObject = canvas.getActiveObject();
      if (activeObject && typeof activeObject.text !== "undefined") {
        activeObject.set("fill", hex);
        canvas.requestRenderAll();
      }
    },
  });

  $("button.text-align-btn").click(function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject && typeof activeObject.text !== "undefined") {
      activeObject.set("textAlign", $(this).data("action"));
      canvas.requestRenderAll();
    }
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
  });

  var fontFamily = $("#font-family");
  var fontWeight = $("#font-weight");

  fontFamily.change(function () {
    loadFontAndUse($(this).val(), JSON.parse(fontWeight.val()));
  });
  fontWeight.change(function () {
    var val = $(this).val();
    loadFontAndUse(fontFamily.val(), JSON.parse(val));
  });

  function loadFontAndUse(font = "Roboto", option = null) {
    if (!font) font = "Roboto";
    if (!option) {
      option = { weight: 400, style: "normal" };
    }
    var fob = new FontFaceObserver(font, option);

    var ef = $("#toast");
    ef.find("span").text("Loading font " + font);
    ef.removeClass("hide").addClass("show");
    fob
      .load()
      .then(function () {
        var activeObject = canvas.getActiveObject();
        if (activeObject && typeof activeObject.text !== "undefined") {
          activeObject.set("fontFamily", font);
          activeObject.set("fontWeight", option.weight);
          activeObject.set("fontStyle", option.style || "normal");
          canvas.requestRenderAll();
        }
        ef.removeClass("show").addClass("hide");
      })
      .catch(function (e) {
        console.error("font loading failed " + font);
        ef.removeClass("show").addClass("hide");
      });
  }

  $(".fltr input[type=checkbox]").change(function () {
    var isActive = $(this).prop("checked");
    var id = $(this).parent().attr("id");
    if (id == "Gamma") {
      $("input#gamma-red").prop("disabled", !isActive);
      $("input#gamma-green").prop("disabled", !isActive);
      $("input#gamma-blue").prop("disabled", !isActive);
    } else {
      $(this).next().find("input").prop("disabled", !isActive);
    }

    if (isActive) {
      var filterValue;
      if (id == "Gamma") {
        filterValue = [
          $("input#gamma-red").val(),
          $("input#gamma-green").val(),
          $("input#gamma-blue").val(),
        ];
      } else {
        filterValue = $(this).next().find("input").val();
      }
      var filterInstance = new fabric.Image.filters[id]({
        [id.toLowerCase()]: filterValue,
      });
      imgInstance.filters.push(filterInstance);
      imgInstance.applyFilters();
    } else {
      imgInstance.filters = imgInstance.filters.filter((f) => f.type !== id);
      imgInstance.applyFilters();
      canvas.requestRenderAll();
    }
  });

  $(".fltr input[type=range]").on("input", function () {
    var primaryParent = $(this).parent().parent();
    var id = primaryParent.attr("id");
    if (!id) id = primaryParent.data("id");

    var filterValue = $(this).val();
    if (id == "Gamma") {
      filterValue = [
        $("input#gamma-red").val(),
        $("input#gamma-green").val(),
        $("input#gamma-blue").val(),
      ];
    }
    var prop = primaryParent.data("prop");
    if (!prop) prop = id.toLowerCase();
    var filterInstance = imgInstance.filters.find((f) => f.type === id);
    filterInstance[prop] = filterValue;
    imgInstance.applyFilters();
    canvas.requestRenderAll();
  });
  $("#imageField").change(function () {
    var fileReader = new FileReader();
    fileReader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var hRatio = editorWidth / img.width;
        var vRatio = editorHeight / img.height;
        var ratio = Math.min(hRatio, vRatio);
        if (ratio > 1) ratio = 1;
        $("#imagePreview").attr("src", img.src).show();
        $("#imagePreview").data("ratio", ratio);
        $("#insertImg").parent().addClass("d-flex").show();
      };
      img.src = e.target.result;
    };
    fileReader.readAsDataURL(this.files[0]);
  });

  $("#insertImg").click(function () {
    var selectedImage = document.getElementById("imagePreview");
    var ratio = $("#imagePreview").data("ratio");
    var newImg = new fabric.Image(selectedImage, {
      left: 100,
      top: 100,
      scaleX: ratio,
      scaleY: ratio,
    });
    canvas.add(newImg);
    canvas.setActiveObject(newImg);
    canvas.requestRenderAll();
    $("#imageField").val("");
    $("#imagePreview").hide();
    $(this).parent().removeClass("d-flex").hide();
    $(this).parent().parent().removeClass("active");
  });

  $("#saveAsImg").click(function () {
    var form = $("#saveasform");

    var formdata = new FormData(form[0]);
    formdata.append(
      "image",
      imgInstance.toDataURL({
        left: window.__imageRenderLeft,
        top: window.__imageRenderTop,
        width: window.__imageRenderWidth,
        height: window.__imageRenderHeight,
      })
    );
    formdata.append("oemaxlevel", 1);

    $.ajax({
      url: form.attr("action"),
      data: formdata,
      type: "POST",
      contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
      processData: false, // NEEDED, DON'T OMIT THIS
      //Refresh imageeditor
      success: function (data) {
        $("#photo-editor-container").html(data);
      },
    });
  });

  $("#saveAs").click(function () {
    var mask = $(this).siblings(".mask");
    var saveAs = $(this).siblings(".save-as-menu");
    mask.addClass("active");
    saveAs.addClass("active");
  });
  $("#exportAs").click(function () {
    var mask = $(this).siblings(".mask");
    var exportAs = $(this).siblings(".export-menu");
    mask.addClass("active");
    exportAs.addClass("active");
  });

  function closeSaveAs() {
    $(".mask").removeClass("active");
    $(".save-as-menu").removeClass("active");
    $(".export-menu").removeClass("active");
  }
  $(".mask").click(closeSaveAs);
  $("#saveAsCancel").click(closeSaveAs);
  $("#exportAsCancel").click(closeSaveAs);

  $("#downloadImg").click(function () {
    canvas.renderAll();
    var a = document.createElement("a");
    var filename = $(this).data("filename");
    if (!filename) filename = "image";
    filename = filename.split(".")[0];

    var ext = $("input[name=exportAsType]:checked").val();
    if (!ext) ext = "png";
    a.href = imgInstance.toDataURL({
      format: ext,
      left: window.__imageRenderLeft,
      top: window.__imageRenderTop,
      width: window.__imageRenderWidth,
      height: window.__imageRenderHeight,
    });
    a.download = filename + "." + ext;
    a.click();
  });

  $("#aspectRatio").change(function () {
    var ratio = $(this).val();
    var newWidth = __imageRenderWidth;
    var newHeight = __imageRenderHeight;
    var top = 0;
    var left = 0;
    if (ratio == -1) {
      selectionRect.setControlVisible("mt", true);
      selectionRect.setControlVisible("mb", true);
      selectionRect.setControlVisible("ml", true);
      selectionRect.setControlVisible("mr", true);
    } else {
      selectionRect.setControlVisible("mt", false);
      selectionRect.setControlVisible("mb", false);
      selectionRect.setControlVisible("ml", false);
      selectionRect.setControlVisible("mr", false);

      if (ratio == 1) {
        newWidth = Math.min(__imageRenderWidth, __imageRenderHeight);
        newHeight = newWidth;
        left = newWidth / 2;
        top = newWidth / 2;
        if (__imageRenderWidth > __imageRenderHeight) {
          top = newWidth / 4;
          left = __imageRenderWidth / 2 - newWidth / 4;
        } else {
          left = newWidth / 4;
          top = __imageRenderHeight / 2 - newWidth / 4;
        }
      } else if (ratio > 1) {
        if (__imageRenderWidth > __imageRenderHeight) {
          newWidth = __imageRenderWidth;
          newHeight = __imageRenderWidth / ratio;
        } else {
          newHeight = __imageRenderHeight;
          newWidth = __imageRenderHeight * ratio;
        }
        left = (__imageRenderWidth - newWidth) / 2;
        top = (__imageRenderHeight - newHeight) / 2;
      } else {
        if (__imageRenderWidth > __imageRenderHeight) {
          newHeight = __imageRenderHeight;
          newWidth = __imageRenderHeight * ratio;
        } else {
          newWidth = __imageRenderWidth;
          newHeight = __imageRenderWidth / ratio;
        }
        left = (__imageRenderWidth - newWidth) / 2;
        top = (__imageRenderHeight - newHeight) / 2;
      }
      selectionRect.set("width", newWidth);
      selectionRect.set("height", newHeight);
      selectionRect.set("left", __imageRenderLeft + left);
      selectionRect.set("top", __imageRenderTop + top);
    }
    canvas.requestRenderAll();
  });
});
