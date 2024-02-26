$("div.thumb").on("click", function (e) {
  e.preventDefault();
  $(this).siblings().removeClass("selected");
  $(this).toggleClass("selected");
  var href = $(this).data("href");

  var data = $(this).data();
  delete data.href;

  $.ajax({
    url: href,
    data: data,
    async: false,
    success: function (data) {
      $("#photoEditorColumn").html(data);
    },
  });
});

var imgSrc = $("#editingCandidate").attr("src");
var editorWidth = $("#photoEditorColumn").width() - 56;
var editorHeight = $("#photoEditorColumn").height() - 91;

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
  if (action === "reset") {
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
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
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.requestRenderAll();
  }
});

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
  // on mouse up we want to recalculate new interaction
  // for all objects, so we call setViewportTransform
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

var imgInstance, cropClip;

var img = new Image();
img.src = imgSrc;
img.onload = function () {
  var hRatio = editorWidth / img.width;
  var vRatio = editorHeight / img.height;
  var ratio = Math.min(hRatio, vRatio);
  if (ratio > 1) ratio = 1;

  var renderWidth = Math.floor(img.width * ratio);
  var renderHeight = Math.round(img.height * ratio);
  var primaryOffsetLeft = Math.round((editorWidth - renderWidth) / 2);
  var primaryOffsetTop = Math.round((editorHeight - renderHeight) / 2);

  window.__imageRenderWidth = renderWidth;
  window.__imageRenderHeight = renderHeight;
  window.__imageRenderLeft = primaryOffsetLeft;
  window.__imageRenderTop = primaryOffsetTop;

  cropClip = new fabric.Rect({
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

  cropClip.scaleToWidth(renderWidth);
  cropClip.scaleToHeight(renderHeight);

  cropClip.setControlVisible("mtr", false);
  cropClip.setControlVisible("mt", false);
  cropClip.setControlVisible("mb", false);
  cropClip.setControlVisible("ml", false);
  cropClip.setControlVisible("mr", false);
  cropClip.setControlVisible("deleteControl", false);
  cropClip.setControlVisible("clone", false);

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
  canvas.add(cropClip);
  canvas.setZoom(0.95);
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
    imgInstance.filters = imgInstance.filters.filter((f) => f.type !== filter);
    imgInstance.applyFilters();
  }
  canvas.requestRenderAll();
});
$("#cropBtn").click(function () {
  //TODO: crop image
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
    cropClip.visible = true;
    canvas.setActiveObject(cropClip);
    canvas.requestRenderAll();
  } else {
    cropClip.visible = false;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }
});

$(".x-close").click(function () {
  $(this).parent().removeClass("active");
  cropClip.visible = false;
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
      console.log(activeObject);
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
      console.log(e);
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

$("#aspectRatio").change(function () {
  var ratio = parseFloat($(this).val());
  var activeObject;
  if (cropClip) activeObject = cropClip;
  else activeObject = canvas.getActiveObject();
  if (activeObject) {
    var newWidth = window.__imageRenderWidth;
    var newHeight = window.__imageRenderHeight;
    if (ratio === 1) {
      var min = Math.min(newWidth, newHeight);
      newWidth = min;
      newHeight = min;
    } else {
      if (ratio < 1) {
        newHeight = newWidth / ratio;
      }
      if (ratio > 1) {
        newWidth = newHeight * ratio;
      }
    }
    console.log({ ratio, newWidth, newHeight });
    activeObject.set("width", newWidth);
    activeObject.set("height", newHeight);
    canvas.requestRenderAll();
  }
});

$("#downloadImg").click(function () {
  console.log(window.__imageRenderWidth);
  var a = document.createElement("a");
  var filename = $(this).data("filename");
  // const formdata = new FormData();
  // formdata.append("image", dataUrl);
  a.href = canvas.toDataURL({
    left: window.__imageRenderLeft,
    top: window.__imageRenderTop,
    width: window.__imageRenderWidth,
    height: window.__imageRenderHeight,
  });
  a.download = filename + ".png";
  a.click();
});

$("#saveAs").click(function () {
  var mask = $(this).siblings(".mask");
  var saveAs = $(this).siblings(".save-as-menu");
  mask.addClass("active");
  saveAs.addClass("active");
});
function closeSaveAs() {
  $(".mask").removeClass("active");
  $(".save-as-menu").removeClass("active");
}
$(".mask").click(closeSaveAs);
$("#saveAsCancel").click(closeSaveAs);

$("#saveAsConfirm").click(function () {
  var saveAsName = $("#saveAsName").val();
  if (!saveAsName) {
    saveAsName = $("#saveAsName").data("filename");
  }
  var saveAsType = $("input[name=saveAsType]:checked").val();
  var saveAsDimension = $("input[name=saveAsDimension]:checked").val();
  console.log(saveAsType, saveAsDimension, saveAsName);
});
