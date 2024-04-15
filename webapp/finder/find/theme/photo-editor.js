function isWebGLEnabled() {
  try {
    var canvas = document.createElement("canvas");
    return (
      !!window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

var fabricFilters = [
  "Brightness",
  "Contrast",
  "Saturation",
  "HueRotation",
  "Vibrance",
  "Blur",
  "Noise",
  "Pixelate",
  "Sharpen",
  "Grayscale",
  "BlackWhite",
  "Sepia",
  "Invert",
  "Vintage",
  "Technicolor",
  "Polaroid",
  "Kodachrome",
  "Sharpen",
  "Emboss",
  "Edge",
];
var convolutionMatrices = {
  Emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
  Sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  Edge: [1, 1, 1, 1, -7, 1, 1, 1, 1],
};

$("document").ready(function () {
  function initializeEditor() {
    $(".photo-editor-container").css("width", window.innerWidth);
    var imgSrc = $(this).attr("src");
    if (!imgSrc) return;
    var editorWidth = window.innerWidth - 350;
    var editorHeight = window.innerHeight - 100;

    fabric.Object.prototype.transparentCorners = false;

    fabric.textureSize = 4096;
    var canvas = new fabric.Canvas("canvas");
    console.log(canvas);
    canvas.setWidth(editorWidth);
    canvas.setHeight(editorHeight);
    canvas.preserveObjectStacking = true;
    canvas.selection = false;

    canvas.on("mouse:wheel", function (opt) {
      if (!opt.e.ctrlKey) return;
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
        -imageRenderLeft + canvas.width / 2 - imageRenderWidth / 2,
        -imageRenderTop + canvas.height / 2 - imageRenderHeight / 2,
      ]);
    }

    canvas.on("mouse:down", function (opt) {
      var evt = opt.e;
      var activeObj = canvas.getActiveObject();
      if (!activeObj) {
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
    fabric.Object.prototype.cornerStyle = "circle";
    fabric.Text.prototype.cornerStyle = "circle";

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
    img.onload = function () {
      console.log(img.width, img.height);
      var hRatio = (editorWidth - 16) / img.width;
      var vRatio = (editorHeight - 16) / img.height;
      var ratio = Math.min(hRatio, vRatio);
      if (ratio > 1) ratio = 1;

      var renderWidth = Math.floor(img.width * ratio);
      var renderHeight = Math.round(img.height * ratio);
      var primaryOffsetLeft = 0; // Math.round((editorWidth - renderWidth) / 2);
      var primaryOffsetTop = 0; // Math.round((editorHeight - renderHeight) / 2);

      window.imageRenderWidth = renderWidth;
      window.__imageRenderWidth = renderWidth;
      window.imageRenderHeight = renderHeight;
      window.__imageRenderHeight = renderHeight;
      window.imageRenderLeft = primaryOffsetLeft;
      window.__imageRenderLeft = primaryOffsetLeft;
      window.imageRenderTop = primaryOffsetTop;
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

      canvas.add(imgInstance);
      canvas.sendToBack(imgInstance);
      canvas.add(selectionRect);
      canvas.setViewportTransform([1, 0, 0, 1, 8, 8]);
      window.imageRenderWidth = imgInstance.getScaledWidth();
      window.imageRenderHeight = imgInstance.getScaledHeight();

      $("#editCandidateLoader").hide();

      centerViewPort();

      fabricFilters.forEach(function (_, i) {
        imgInstance.filters[i] = false;
      });

      $("#preDefFilters a").each(function () {
        var filter = $(this).data("action");
        var fpCanvas = new fabric.StaticCanvas("fpCanvas");
        fpCanvas.width = 100;
        fpCanvas.height = 100;
        var fpFilter = new fabric.Image.filters[filter]();
        var fpImgInstance = new fabric.Image(img, { left: 0, top: 0 });
        var fpRatio = img.width / img.height;
        var fpW, fpH;
        if (fpRatio > 1) {
          fpH = 100;
          fpW = 100 * fpRatio;
        } else {
          fpW = 100;
          fpH = 100 / fpRatio;
        }
        fpImgInstance.scaleToWidth(fpW);
        fpImgInstance.scaleToHeight(fpH);
        fpImgInstance.filters.push(fpFilter);
        fpImgInstance.applyFilters();
        fpCanvas.add(fpImgInstance);
        fpCanvas.requestRenderAll();
        $(this).find("img").attr("src", fpCanvas.toDataURL());
        fpCanvas.dispose();
        $(this).show();
      });
    };
    img.src = imgSrc;

    // var imgElement = document.getElementById("editingCandidate");

    $("#preDefFilters a").click(function (e) {
      e.preventDefault();
      var filter = $(this).data("action");
      var filterIdx = fabricFilters.indexOf(filter);
      var isActive = $(this).hasClass("active");
      $(this).toggleClass("active");
      if (!isActive) {
        var filterInstance = new fabric.Image.filters[filter]();
        imgInstance.filters[filterIdx] = filterInstance;
      } else {
        imgInstance.filters[filterIdx] = false;
      }
      imgInstance.applyFilters();
      canvas.requestRenderAll();
    });
    $("#resetCrop").click(function () {
      window.imageRenderWidth = window.__imageRenderWidth;
      window.imageRenderHeight = window.__imageRenderHeight;
      window.imageRenderLeft = window.__imageRenderLeft;
      window.imageRenderTop = window.__imageRenderTop;
      imgInstance.clipPath = null;
      selectionRect.visible = false;
      canvas.setZoom(1);
      centerViewPort();
      canvas.discardActiveObject();
      canvas.renderAll();
      $(".crop-editor").removeClass("active");
    });
    $("#cropBtn").click(function () {
      canvas.renderAll();
      window.imageRenderWidth = selectionRect.getScaledWidth();
      window.imageRenderHeight = selectionRect.getScaledHeight();
      window.imageRenderLeft = selectionRect.left;
      window.imageRenderTop = selectionRect.top;
      cropRect = new fabric.Rect({
        left: imageRenderLeft,
        top: imageRenderTop,
        width: imageRenderWidth,
        height: imageRenderHeight,
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
        -imageRenderLeft + canvas.width / 2 - imageRenderWidth / 2,
        -imageRenderTop + canvas.height / 2 - imageRenderHeight / 2,
      ]);
      canvas.discardActiveObject();
      canvas.renderAll();
      $(".crop-editor").removeClass("active");
    });

    $(".rotate-editor button").click(function () {
      var action = $(this).data("action");
      var activeObject = canvas.getActiveObject();
      if (!activeObject || activeObject.get("type") !== "text") {
        return;
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
      } else if (
        ["flipX", "flipY", "rotateLeft", "rotateRight"].includes(action)
      ) {
        selectionRect.visible = false;
      } else {
        selectionRect.visible = false;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    });

    $(".x-close").click(function () {
      $(this).parent().removeClass("active");
      selectionRect.visible = false;
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    });

    canvas.on("selection:created", onObjectSelected);
    canvas.on("selection:updated", onObjectSelected);
    function onObjectSelected(obj) {
      if (typeof obj.selected[0].text !== "undefined") {
        $("#textField").val(obj.selected[0].text);
        $("#font-color").minicolors("value", obj.selected[0].fill);
        fontFamily.val(obj.selected[0].fontFamily);
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
      fontFamily.val("Roboto");
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
          width: 250,
          fontSize: 54,
          fill: $("#font-color").minicolors("value"),
          textAlign: "center",
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        fontFamily.val("Roboto");
        $("#font-weight").val(`{"weight":400,"style":"normal"}`);
        loadFontAndUse("Charmonman", { weight: 400, style: "normal" });
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
      console.log($(this).val(), JSON.parse(fontWeight.val()));
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
          ef.removeClass("show").addClass("hide");
        });
    }

    $(".fltr input[type=range]").on("input", function () {
      var valInput = $(this).next("input");
      var dataType = valInput.data("type");
      var filterValue = $(this).val();
      var valInputValue = filterValue;
      if (dataType === "percentage") {
        valInputValue = Math.round(valInputValue * 100);
      } else if (dataType === "degree") {
        valInputValue = Math.round(valInputValue * 180);
      }
      valInput.val(valInputValue);
      var primaryParent = $(this).parent().parent();
      var id = primaryParent.attr("id");
      if (!id) id = primaryParent.data("id");
      var filterIdx = fabricFilters.indexOf(id);

      var prop = primaryParent.data("prop");
      if (!prop) prop = id.toLowerCase();
      var filterInstance = imgInstance.filters.find((f) => f.type === id);
      if (!filterInstance) {
        filterInstance = new fabric.Image.filters[id]();
        imgInstance.filters[filterIdx] = filterInstance;
      }
      filterInstance[prop] = filterValue;
      imgInstance.applyFilters();
      canvas.requestRenderAll();
    });

    $(".matrixFilter input[type=checkbox]").click(function () {
      var action = $(this).data("action");
      var filterIdx = fabricFilters.indexOf(action);
      var checked = $(this).prop("checked");
      var matrix = convolutionMatrices[action];
      if (checked) {
        var filterInstance = new fabric.Image.filters["Convolute"]({
          matrix: matrix,
        });
        imgInstance.filters[filterIdx] = filterInstance;
      } else {
        imgInstance.filters[filterIdx] = false;
      }
      imgInstance.applyFilters();
      canvas.requestRenderAll();
    });

    $(".fltr a").click(function () {
      var id = $(this).data("id");
      var filterIdx = fabricFilters.indexOf(id);
      imgInstance.filters[filterIdx] = false;
      imgInstance.applyFilters();
      canvas.requestRenderAll();
    });

    $("#imageField").change(function () {
      var fileReader = new FileReader();
      fileReader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var hRatio = (editorWidth - 100) / img.width;
          var vRatio = (editorHeight - 100) / img.height;
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

      var format = "jpeg";
      if ($("input[name=presetid]:checked").val() == "png") format = "png";
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      formdata.append(
        "image",
        canvas.toDataURL({
          format: format,
          left: window.imageRenderLeft,
          top: window.imageRenderTop,
          width: window.imageRenderWidth,
          height: window.imageRenderHeight,
        })
      );
      centerViewPort();
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
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      a.href = canvas.toDataURL({
        format: ext,
        left: window.imageRenderLeft,
        top: window.imageRenderTop,
        width: window.imageRenderWidth,
        height: window.imageRenderHeight,
      });
      centerViewPort();
      a.download = filename + "." + ext;
      a.click();
    });

    $("#aspectRatio").change(function () {
      var ratio = $(this).val();
      var newWidth = window.imageRenderWidth;
      var newHeight = window.imageRenderHeight;
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

        var minDim = Math.min(imageRenderWidth, imageRenderHeight);
        if (ratio != 0) {
          if (ratio == 1) {
            newWidth = minDim;
            newHeight = newWidth;
          } else if (ratio > 1) {
            if (imageRenderWidth > imageRenderHeight) {
              newHeight = minDim;
              newWidth = minDim * ratio;
            } else {
              newWidth = minDim / ratio;
              newHeight = minDim;
            }
          } else if (ratio < 1) {
            if (imageRenderWidth > imageRenderHeight) {
              newHeight = minDim;
              newWidth = minDim * ratio;
            } else {
              newWidth = minDim;
              newHeight = minDim * ratio;
            }
          }
        }
      }
      console.log(newWidth, newHeight, imgInstance.scaleX);
      selectionRect.set("width", newWidth);
      selectionRect.set("height", newHeight);
      selectionRect.set("left", imgInstance.left);
      selectionRect.set("top", imgInstance.top);
      selectionRect.set("scaleX", 1);
      selectionRect.set("scaleY", 1);
      canvas.requestRenderAll();
    });
    $("input[name=replaceall]").click(function () {
      if ($(this).prop("checked")) {
        $("#customSizeOptions").hide();
      } else {
        $("#customSizeOptions").show();
      }
    });
    $("#copyImg").click(function () {
      if ("clipboard" in navigator) {
        var _this = $(this);
        _this.html('<i class="fas fa-spinner fa-spin"></i>');
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        var dataURL = canvas.toDataURL({
          left: window.imageRenderLeft,
          top: window.imageRenderTop,
          width: window.imageRenderWidth,
          height: window.imageRenderHeight,
        });
        centerViewPort();
        fetch(dataURL)
          .then((res) => res.blob())
          .then((blob) => {
            navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);
          })
          .then(() => {
            _this.html('<i class="bi bi-check-lg"></i>');
            setTimeout(() => {
              _this.html('<i class="bi bi-clipboard"></i>');
            }, 2000);
          })
          .catch(() => {
            _this.html(
              '<i class="bi bi-exclamation-triangle-fill text-warning"></i>'
            );
            setTimeout(() => {
              _this.html('<i class="bi bi-clipboard"></i>');
            }, 2000);
          });
      } else {
        alert("Clipboard API not supported");
        return;
      }
    });
    fontFamily.select2({
      minimumResultsForSearch: Infinity,
      templateResult: function (state) {
        if (!state.id) {
          return state.text;
        }
        var $state = $(
          `<span style="font-family:${state.id};font-size:1.25em">${state.text}</span>`
        );
        return $state;
      },
      templateSelection: function (state) {
        if (!state.id) {
          return state.text;
        }
        var $state = $(
          `<span style="font-family:${state.id};font-size:1.25em">${state.text}</span>`
        );
        return $state;
      },
      dropdownParent: fontFamily.parent(),
    });
  }
  lQuery("#editingCandidate").livequery(initializeEditor);

  $("form#clearAllPreset").submit(function (e) {
    e.preventDefault();
    if (confirm("Are you sure you want to clear all?")) {
      this.submit();
    }
  });
});
