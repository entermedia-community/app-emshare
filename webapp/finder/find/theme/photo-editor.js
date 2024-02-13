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
var editorCanvas;
var ctx;

var imgSrc = $("#editingCandidate").attr("src");
var editorCanvas = document.getElementById("canvas");
var width = $("#photoEditorColumn").width() - 56;
var height = $("#photoEditorColumn").height() - 91;
editorCanvas.width = width;
editorCanvas.height = height;

var canvas = new fabric.Canvas("canvas");
this.__canvas = canvas;
canvas.preserveObjectStacking = true;
canvas.selection = false;

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
  var hRatio = width / img.width;
  var vRatio = height / img.height;
  var ratio = Math.min(hRatio, vRatio);
  if (ratio > 1) ratio = 1;
  var centerShift_x = (width - img.width * ratio) / 2;
  var centerShift_y = (height - img.height * ratio) / 2;
  var padding = 16;
  var imgElement = document.getElementById("editingCandidate");

  cropClip = new fabric.Rect({
    left: centerShift_x + padding / 2,
    top: centerShift_y + padding / 2,
    width: img.width * ratio - padding,
    height: img.height * ratio - padding,
    absolutePositioned: true,
    fill: "rgba(255,255,255,0.1)",
    originX: "left",
    originY: "top",
    opacity: 1,
    transparentCorners: false,
    stroke: "black",
    strokeDashArray: [2, 5],
    cornerColor: "white",
    cornerSize: 10,
    cornerStrokeColor: "black",
    cornerStyle: "circle",
    borderColor: "transparent",
    visible: false,
    uniformScaling: false,
  });

  cropClip.controls = {
    ...fabric.Object.prototype.controls,
    mtr: new fabric.Control({
      visible: false,
    }),
  };
  delete cropClip.controls.deleteControl;
  delete cropClip.controls.clone;
  var renderWidth = img.width * ratio - padding;
  var renderHeight = img.height * ratio - padding;
  imgInstance = new fabric.Image(imgElement, {
    left: centerShift_x + padding / 2 + renderWidth / 2,
    top: centerShift_y + padding / 2 + renderHeight / 2,
    width: renderWidth,
    height: renderHeight,
    selectable: false,
    evented: false,
    originX: "center",
    originY: "center",
  });
  canvas.add(imgInstance);
  canvas.sendToBack(imgInstance);
  canvas.add(cropClip);
  // var filter = new fabric.Image.filters.Grayscale();
  // imgInstance.filters.push(filter);
  // imgInstance.applyFilters();
  // canvas.renderAll();
  // console.log(imgInstance.filters.find((f) => f.type === "Grayscale"));
};

$("#preDefFilters a").click(function (e) {
  e.preventDefault();
  var isActive = $(this).hasClass("active");
  $(this).toggleClass("active");
  var filter = $(this).data("action");
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
      left: canvas.width / 2 - 100,
      top: canvas.height / 2 - 100,
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
      var hRatio = canvas.width / img.width;
      var vRatio = canvas.height / img.height;
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
