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
		var editorWidth = window.innerWidth - 72;
		var editorHeight = window.innerHeight - 100;

		fabric.Object.prototype.transparentCorners = false;

		fabric.textureSize = 4096;
		var canvas = new fabric.Canvas("canvas");
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
			if (e.code === "Numpad0" && (e.ctrlKey || e.metaKey)) {
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
				this.renderAll();
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
		var controls = fabric.controlsUtils.createObjectDefaultControls();
		delete controls.mt;
		delete controls.ml;
		delete controls.mr;
		delete controls.mb;
		fabric.InteractiveFabricObject.ownDefaults.controls = {
			...controls,
			deleteControl: getDeleteControl(),
			clone: getCloneControl(),
		};
		// fabric.Textbox.prototype.controls.deleteControl = getDeleteControl();
		// fabric.Textbox.prototype.controls.clone = getCloneControl();
		fabric.Object.prototype.cornerStyle = "circle";
		fabric.Text.prototype.cornerStyle = "circle";

		function deleteObject(_, transform) {
			var target = transform.target;
			var canvas = target.canvas;
			canvas.remove(target);
			canvas.renderAll();
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

		var primaryImg, imgInstance, selectionRect, debugRect;
		var imgLoading = true;

		function loadPrimaryImage(src) {
			imgLoading = true;
			$("#preDefFilters a").removeClass("show");
			primaryImg = new Image();
			primaryImg.onload = function () {
				imgLoading = false;
				var hRatio = (editorWidth - 16) / primaryImg.width;
				var vRatio = (editorHeight - 16) / primaryImg.height;
				var ratio = Math.min(hRatio, vRatio);
				if (ratio > 1) ratio = 1;

				var renderWidth = Math.floor(primaryImg.width * ratio);
				var renderHeight = Math.round(primaryImg.height * ratio);

				window.imageRenderWidth = renderWidth;
				window.__imageRenderWidth = renderWidth;
				window.imageRenderHeight = renderHeight;
				window.__imageRenderHeight = renderHeight;
				window.imageRenderLeft = 0;
				window.__imageRenderLeft = 0;
				window.imageRenderTop = 0;
				window.__imageRenderTop = 0;
				window.imageRenderAngle = 0;

				imgInstance = new fabric.Image(primaryImg, {
					left: 0,
					top: 0,
					selectable: false,
					evented: false,
				});
				imgInstance.scaleToWidth(renderWidth);
				imgInstance.scaleToHeight(renderHeight);

				canvas.add(imgInstance);
				canvas.setViewportTransform([1, 0, 0, 1, 8, 8]);
				window.imageRenderWidth = imgInstance.getScaledWidth();
				window.imageRenderHeight = imgInstance.getScaledHeight();

				$("#editCandidateLoader").hide();

				centerViewPort();

				imgInstance.filters = [];
				fabricFilters.forEach(function (_, i) {
					imgInstance.filters.push(false);
				});

				canvas.renderAll();
			};

			primaryImg.src = src;
		}

		loadPrimaryImage(imgSrc);

		function generateFilterPreview() {
			$("#preDefFilters a").each(function () {
				if ($(this).is(":visible")) return;
				var filter = $(this).data("action");
				var fpCanvas = new fabric.StaticCanvas("fpCanvas");
				fpCanvas.width = 100;
				fpCanvas.height = 100;
				var fpFilter = new fabric.filters[filter]();
				var fpImgInstance = new fabric.Image(primaryImg, { left: 0, top: 0 });
				var fpRatio = primaryImg.width / primaryImg.height;
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
				fpCanvas.renderAll();
				$(this).find("img").attr("src", fpCanvas.toDataURL());
				fpCanvas.dispose();
				$(this).addClass("show");
			});
		}

		$(".editorarea a").click(function (e) {
			e.preventDefault();
			if (imgLoading) return;
			$(".panel").each(function () {
				$(this).removeClass("active");
			});
			var action = $(this).data("action");
			var panel = "." + action + "-editor";
			$(panel).css("top", $(this).offset().top);
			$(panel).toggleClass("active");
			if (action === "crop") {
				createCropSelectionRect();
			} else if (
				["flipX", "flipY", "rotateLeft", "rotateRight"].includes(action)
			) {
				destroySelectionRect();
			} else {
				destroySelectionRect();
				canvas.discardActiveObject();
				canvas.renderAll();
			}
			if (action === "filter") {
				setTimeout(function () {
					generateFilterPreview();
				}, 250);
			}
		});

		$(".x-close").click(function () {
			$(this).parent().removeClass("active");
			destroySelectionRect();
			canvas.discardActiveObject();
			canvas.renderAll();
		});

		$("#preDefFilters a").click(function (e) {
			e.preventDefault();
			var filter = $(this).data("action");
			var filterIdx = fabricFilters.indexOf(filter);
			var isActive = $(this).hasClass("active");
			$(this).toggleClass("active");
			if (!isActive) {
				var filterInstance = new fabric.filters[filter]();
				imgInstance.filters[filterIdx] = filterInstance;
			} else {
				imgInstance.filters[filterIdx] = false;
			}
			imgInstance.applyFilters();
			canvas.renderAll();
		});

		function createCropSelectionRect(freeTransform = false) {
			if (selectionRect) {
				destroySelectionRect();
			}
			selectionRect = new fabric.Rect({
				left: window.imageRenderLeft,
				top: window.imageRenderTop,
				width: window.imageRenderWidth,
				height: window.imageRenderHeight,
				fill: "rgba(255,255,255,0.35)",
				transparentCorners: false,
				stroke: "black",
				strokeDashArray: [2, 5],
				cornerColor: "white",
				cornerSize: 10,
				cornerStrokeColor: "black",
				cornerStyle: "circle",
				borderColor: "transparent",
			});
			selectionRect.setControlVisible("mtr", false);
			selectionRect.setControlVisible("deleteControl", false);
			selectionRect.setControlVisible("clone", false);
			if (freeTransform) {
				var controls = fabric.controlsUtils.createObjectDefaultControls();
				delete controls.mtr;
				selectionRect.controls = controls;
			}
			canvas.add(selectionRect);
			setTimeout(function () {
				canvas.setActiveObject(selectionRect);
				canvas.renderAll();
			});

			// selectionRect.scaleToWidth(renderWidth);
			// selectionRect.scaleToHeight(renderHeight);
		}

		function destroySelectionRect() {
			canvas.remove(selectionRect);
			canvas.discardActiveObject();
			canvas.renderAll();
			selectionRect = null;
		}

		$("#resetCrop").click(function () {
			window.imageRenderWidth = window.__imageRenderWidth;
			window.imageRenderHeight = window.__imageRenderHeight;
			window.imageRenderLeft = window.__imageRenderLeft;
			window.imageRenderTop = window.__imageRenderTop;
			window.imageRenderAngle = 0;
			imgInstance.clipPath = null;
			destroySelectionRect();
			canvas.setZoom(1);
			centerViewPort();
			canvas.discardActiveObject();
			canvas.renderAll();
			$(".crop-editor").removeClass("active");
		});

		function handleCrop() {
			if (!selectionRect) return;
			// cdr(selectionRect);
			var newBounds = selectionRect.getBoundingRect();
			window.imageRenderWidth = newBounds.width;
			window.imageRenderHeight = newBounds.height;
			window.imageRenderLeft = newBounds.left;
			window.imageRenderTop = newBounds.top;

			var clipPath = new fabric.Rect({
				left: imageRenderLeft,
				top: imageRenderTop,
				width: imageRenderWidth,
				height: imageRenderHeight,
				absolutePositioned: true,
				evented: false,
			});

			imgInstance.clipPath = clipPath;

			selectionRect.visible = false;
			canvas.setZoom(1);
			getFinalImage("png", selectionRect);
			canvas.setViewportTransform([
				1,
				0,
				0,
				1,
				-newBounds.left + canvas.width / 2 - newBounds.width / 2,
				-newBounds.top + canvas.height / 2 - newBounds.height / 2,
			]);
			canvas.discardActiveObject();
			canvas.renderAll();
			$(".crop-editor").removeClass("active");
			// loadPrimaryImage(getFinalImage("png", selectionRect));
			// $("#editingCandidate").attr("src", getFinalImage());
		}

		$("#cropBtn").click(function () {
			handleCrop();
		});

		function cdr(object) {
			if (debugRect) {
				canvas.remove(debugRect);
			}
			var bounds = object.getBoundingRect();
			debugRect = new fabric.Rect({
				...bounds,
				stroke: "blue",
				strokeWidth: 1,
				fill: "rgba(0,0,255,0.1)",
			});
			canvas.add(debugRect);
			canvas.renderAll();
		}

		$(".rotate-editor button").click(function () {
			var action = $(this).data("action");
			var activeObject = canvas.getActiveObject();
			if (!activeObject) {
				if (action.startsWith("rotate")) {
					alert("Please select an object to rotate");
					return;
				} else {
					activeObject = imgInstance;
				}
			}
			if (action === "flipX") {
				activeObject.set("flipX", !activeObject.flipX);
			}
			if (action === "flipY") {
				activeObject.set("flipY", !activeObject.flipY);
			}
			var angle = activeObject.angle % 360;
			if (action.startsWith("rotate")) {
				if (action === "rotateLeft") {
					angle -= 90;
				} else {
					angle += 90;
				}
				activeObject.rotate(angle);
				// activeObject.setCoords();
				// cdr(activeObject);
			}

			canvas.renderAll();
		});

		canvas.on("selection:created", onObjectSelected);
		canvas.on("selection:updated", onObjectSelected);
		function onObjectSelected(obj) {
			if (
				obj.selected.length > 0 &&
				obj.selected[0].get("type") === "textbox"
			) {
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
		}

		$("#textField").keyup(function () {
			var activeObject = canvas.getActiveObject();
			if (activeObject && activeObject.get("type") == "textbox") {
				activeObject.set("text", $(this).val());
			} else {
				canvas.discardActiveObject();
				var styles = JSON.parse($("#font-weight").val());
				var text = new fabric.Textbox($(this).val(), {
					left: window.imageRenderWidth / 2 - 100,
					top: window.imageRenderHeight / 2 - 100,
					width: 250,
					fontSize: 54,
					fill: $("#font-color").minicolors("value"),
					textAlign: "center",
					fontFamily: $("#font-family").val(),
					fontWeight: styles.weight,
					fontStyle: styles.style,
				});
				canvas.add(text);
				canvas.setActiveObject(text);
			}
			canvas.renderAll();
		});
		$("#font-color").minicolors({
			change: function (hex) {
				var activeObject = canvas.getActiveObject();
				if (activeObject && activeObject.get("type") == "textbox") {
					activeObject.set("fill", hex);
					canvas.renderAll();
				}
			},
		});

		$("button.text-align-btn").click(function () {
			var activeObject = canvas.getActiveObject();
			if (activeObject && activeObject.get("type") == "textbox") {
				activeObject.set("textAlign", $(this).data("action"));
				canvas.renderAll();
			}
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
		});

		$("#font-family").change(function () {
			updateFont();
		});
		$("#font-weight").change(function () {
			updateFont();
		});

		function updateFont() {
			var activeObject = canvas.getActiveObject();
			if (activeObject && activeObject.get("type") === "textbox") {
				var font = $("#font-family").val();
				var style = JSON.parse($("#font-weight").val());
				activeObject.set("fontFamily", font);
				activeObject.set("fontWeight", style.weight);
				activeObject.set("fontStyle", style.style);
				canvas.renderAll();
			}
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
				filterInstance = new fabric.filters[id]();
				imgInstance.filters[filterIdx] = filterInstance;
			}
			filterInstance[prop] = filterValue;
			imgInstance.applyFilters();
			canvas.renderAll();
		});

		$(".matrixFilter input[type=checkbox]").click(function () {
			var action = $(this).data("action");
			var filterIdx = fabricFilters.indexOf(action);
			var checked = $(this).prop("checked");
			var matrix = convolutionMatrices[action];
			if (checked) {
				var filterInstance = new fabric.filters["Convolute"]({
					matrix: matrix,
				});
				imgInstance.filters[filterIdx] = filterInstance;
			} else {
				imgInstance.filters[filterIdx] = false;
			}
			imgInstance.applyFilters();
			canvas.renderAll();
		});

		$(".fltr a").click(function () {
			var id = $(this).data("id");
			var filterIdx = fabricFilters.indexOf(id);
			imgInstance.filters[filterIdx] = false;
			imgInstance.applyFilters();
			canvas.renderAll();
			var rangeInp = $("#" + id).find("input[type=range]");
			var defaultVal = rangeInp.attr("defaultValue");
			rangeInp.val(defaultVal);
			$("#" + id)
				.find("input[type=text]")
				.val(0);
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
			canvas.renderAll();
			$("#imageField").val("");
			$("#imagePreview").hide();
			$(this).parent().removeClass("d-flex").hide();
			$(this).parent().parent().removeClass("active");
		});

		function getFinalImage(format = "png", obj = null) {
			var imgDim = obj
				? obj.getBoundingRect()
				: {
						left: window.imageRenderLeft,
						top: window.imageRenderTop,
						width: window.imageRenderWidth,
						height: window.imageRenderHeight,
				  };
			// if (imgInstance.clipPath) {
			// 	imgDim = imgInstance.clipPath.getBoundingRect();
			// }
			var data = canvas.toDataURL({
				format: format,
				...imgDim,
			});
			var a = document.createElement("a");
			a.href = data;
			a.download = "download." + format;
			a.click();
			a.remove();
			return data;
		}

		$("#imagesave").click(function (e) {
			e.preventDefault();
			var form = $("#saveform");
			var formdata = new FormData(form[0]);
			formdata.append("oemaxlevel", 1);

			var assetfileformat = $(form).data("assetfileformat").toLowerCase();
			if (assetfileformat === "jpg") assetfileformat = "jpeg";
			canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
			formdata.append("image", getFinalImage(assetfileformat));
			centerViewPort();

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
			var filenameInp = $("#saveasform input.newfilename");
			filenameInp.focus();
			var val = filenameInp.val();
			filenameInp.val("");
			filenameInp.val(val);
		});

		$("#saveAsImg").click(function () {
			var form = $("#saveasform");

			var formdata = new FormData(form[0]);

			var filenameInp = form.find("input.newfilename");
			var oldFilename = filenameInp.data("originalname");
			var newFilename = filenameInp.val();
			var fileExtInp = form.find("select.newfileext");
			var oldFileExt = fileExtInp.data("originalext");
			var newFileExt = fileExtInp.val();
			var fullNewName = newFilename + "." + newFileExt;
			var fullOldName = oldFilename + "." + oldFileExt;
			var existingNames = [fullOldName];
			var fNames = $("p.filename");
			fNames.each(function () {
				existingNames.push($(this).text());
			});
			if (existingNames.includes(fullNewName)) {
				var conf = confirm(
					"The file name is the same as an existing file. Do you want to overwrite?"
				);
				if (!conf) {
					return;
				}
			}
			var assetfileformat = $(form).data("assetfileformat");

			if (assetfileformat != "jpg" || assetfileformat != "png") {
				assetfileformat = "png";
			}

			canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
			formdata.append(
				"image",
				canvas.toDataURL({
					format: assetfileformat,
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

			var ext = $("select#exportAsType").val();
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
			a.remove();
			closeSaveAs();
		});

		$("#aspectRatio").change(function () {
			var ratio = $(this).val();
			var newWidth = window.imageRenderWidth;
			var newHeight = window.imageRenderHeight;
			if (ratio == -1) {
				createCropSelectionRect(true);
			} else {
				createCropSelectionRect();
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
			selectionRect.set("width", newWidth);
			selectionRect.set("height", newHeight);
			selectionRect.set("left", imgInstance.left);
			selectionRect.set("top", imgInstance.top);
			selectionRect.set("scaleX", 1);
			selectionRect.set("scaleY", 1);
			canvas.renderAll();
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
	}
	lQuery("#editingCandidate").livequery(initializeEditor);
});

var fonts = {
	Lato: ["Bold", "Italic", "Regular"],
	Arvo: ["Bold", "Italic", "Regular"],
	Caveat: ["Bold", "Regular"],
	Corinthia: ["Bold", "Regular"],
	DancingScript: ["Bold", "Regular"],
	KodeMono: ["Bold", "Regular"],
	MadimiOne: ["Regular"],
	MajorMonoDisplay: ["Regular"],
	Montserrat: ["Bold", "Italic", "Regular"],
	OpenSans: ["Bold", "Italic", "Regular"],
	Oswald: ["Bold", "Regular"],
	PixelifySans: ["Bold", "Regular"],
	Poppins: ["Bold", "Italic", "Regular"],
	PTSans: ["Bold", "Italic", "Regular"],
	PTSerif: ["Bold", "Italic", "Regular"],
	Roboto: ["Bold", "Italic", "Regular"],
	Wallpoet: ["Regular"],
};

lQuery("select#font-family").livequery(function () {
	var _this = $(this);
	var options = _this.find("option");
	if (options.length !== 0) return;

	var themeprefix = siteroot + $("#application").data("themeprefix");

	var promises = [];
	var fontInstances = [];
	Object.keys(fonts).forEach((font) => {
		_this.append('<option value="' + font + '">' + font + "</option>");
		var styles = fonts[font];
		styles.forEach((style) => {
			var url = "url(" + themeprefix + "/fonts/" + font + "-" + style + ".ttf)";
			var f = new FontFace(font, url, {
				style: style === "Italic" ? "italic" : "normal",
				weight: style === "Bold" ? "bold" : "normal",
			});
			fontInstances.push(f);
			promises.push(function () {
				return f.load();
			});
		});
	});
	Promise.all(promises).then(() => {
		fontInstances.forEach((ins) => {
			document.fonts.add(ins);
		});
	});
	_this.val("Roboto").change();
	_this.select2({
		minimumResultsForSearch: 10,
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
		dropdownParent: _this.parent(),
	});
});
