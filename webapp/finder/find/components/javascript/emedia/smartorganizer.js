var colorSwatch = [
	"#0000ff",
	"#a52a2a",
	"#00008b",
	"#006400",
	"#8b008b",
	"#556b2f",
	"#ff8c00",
	"#9932cc",
	"#8b0000",
	"#e9967a",
	"#9400d3",
	"#ff00ff",
	"#ffd700",
	"#008000",
	"#4b0082",
	"#f0e68c",
	"#00ff00",
	"#800000",
	"#000080",
	"#808000",
	"#800080",
	"#ff0000",
];
var lastRandomColor = null;
function getRandomColor() {
	var randomColor = colorSwatch[Math.floor(Math.random() * colorSwatch.length)];
	if (lastRandomColor === randomColor) {
		return "#4d5d80";
	}
	lastRandomColor = randomColor;
	return randomColor;
}

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

function fallbackCopyText(text) {
	var $temp = $("<input>");
	$("body").append($temp);
	$temp.val(text).select();
	document.execCommand("copy");
	$temp.remove();
}

$(document).ready(function () {
	var app = jQuery("#application");
	var apphome = app.data("apphome");
	var siteroot = $("#application").data("siteroot");
	var applink = siteroot + apphome;
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
						name: "leftPort",
						locatorAttr: {
							x: 0,
							y: 62,
						},
					},
					{
						...folderPort,
						id: draw2d.util.UUID.create(),
						name: "rightPort",
						locatorAttr: {
							x: 150,
							y: 64,
						},
					},
					{
						...folderPort,
						id: draw2d.util.UUID.create(),
						name: "bottomPort",
						locatorAttr: {
							x: 75,
							y: 125,
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
				path: applink + "/theme/images/ft.svg",
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
				path: applink + "/theme/icons/bootstrap/folder.svg",
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
		var h = attr.titleHeight + attr.captionHeight + (attr.image ? 110 : 0);
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
		var canvasContainer = $(this);
		canvasContainer.data("uiloaded", true);
		canvasContainer.data("changed", false);
		canvasContainer.data("initializing", true);

		var logo = $("#logoPicker").val();
		var bgColor = $("#logoPicker").data("bg");
		var strokeColor = $("#logoPicker").data("stroke");
		if (canvas) {
			canvas.clear();
			canvas = null;
		}
		//Boostrap does not use liveajax
		$(".dropdown-toggle").dropdown();

		canvasContainer.css({
			width: fullCanvasWidth,
			height: fullCanvasHeight,
			marginTop: -midY + canvasHeight / 2,
			marginLeft: -midX + canvasWidth / 2,
		});

		canvas = new draw2d.Canvas("organizer_canvas");

		var reader = new draw2d.io.json.Reader();
		var writer = new draw2d.io.json.Writer();

		function readerUnmarshal(canvas, json) {
			reader.unmarshal(canvas, json);
		}

		function writerMarshal(canvas, callback) {
			writer.marshal(canvas, function (json) {
				callback(json);
			});
		}

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
							if (parent && parent.cssClass !== "labelGroup") {
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
				onKeyDown: function (canvas, keyCode, _, ctrlOrMeta) {
					var selections = canvas.getSelection();
					if (selections.getSize() === 0) return;
					if (46 === keyCode || 8 == keyCode) {
						canvas.getCommandStack().startTransaction("batch_delete");
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
						hideLabelConfig();
					}
					if (ctrlOrMeta && 68 === keyCode) {
						selections.each(function (_, figure) {
							var assignedFigures = figure.getAssignedFigures();
							if (figure.cssClass === "folderGroup") {
								var label = assignedFigures.find(
									(f) => f.cssClass === "folderLabel"
								);
								var icon = assignedFigures.find(
									(f) => f.cssClass === "folderIcon"
								);
								var dupFolder = folderJson({
									x: figure.getX() + 20,
									y: figure.getY() + 20,
								});
								dupFolder[2].text = label.getText();
								dupFolder[2].fontSize = label.getFontSize();
								dupFolder[2].userData.moduleid =
									label.getUserData().moduleid + "-copy";
								dupFolder[2].userData.description =
									label.getUserData().description;
								dupFolder[3].path = icon.getPath();
								readerUnmarshal(canvas, dupFolder);
							} else if (figure.cssClass === "labelGroup") {
								var title = assignedFigures.find(
									(f) => f.cssClass === "titleLabel"
								);
								var caption = assignedFigures.find(
									(f) => f.cssClass === "captionLabel"
								);
								var image = assignedFigures.find(
									(f) => f.cssClass === "labelImage"
								);
								var titleText = title ? title.getText() : "";
								var titleFS = title ? title.getFontSize() : 16;
								var captionText = caption ? caption.getText() : "";
								var captionFS = caption ? caption.getFontSize() : 16;
								var image = image ? image.getPath() : "";
								var bgColor = figure.getBackgroundColor();
								bgColor = bgColor
									? rgbToHex(bgColor.red, bgColor.green, bgColor.blue)
									: getRandomColor();
								var color = figure.getColor();
								color = color
									? rgbToHex(color.red, color.green, color.blue)
									: lightenHex(bgColor, -5);

								var { width: tW, height: tH } = measureText(titleText, titleFS);
								var { width: cW, height: cH } = measureText(
									captionText,
									captionFS
								);
								var width = Math.max(tW, cW, 110);

								addLabelAt({
									x: figure.getX() + 20,
									y: figure.getY() + 20,
									titleText,
									titleFS,
									captionText,
									captionFS,
									image,
									color,
									bgColor,
									width,
									titleHeight: tH,
									captionHeight: cH,
								});
							}
						});
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
		}

		function localizeJSON(jsonText) {
			var json;
			try {
				json = JSON.parse(jsonText);
				if (!json || typeof json !== "object") {
					throw new Error();
				}
			} catch (error) {
				customToast("Invalid JSON structure.", {
					positive: false,
				});
				throw new Error("Invalid JSON structure.");
			}

			if (!Array.isArray(json)) {
				json.json = localizeJSON(json.json);
				return JSON.stringify(json);
			} else {
				function restoreAppHomeRecursive(obj) {
					if (!obj || typeof obj !== "object") {
						return;
					}
					Object.entries(obj).forEach(([key, value]) => {
						if (typeof value === "object") {
							restoreAppHomeRecursive(value);
						} else if (typeof value === "string") {
							if (key !== "path" && key !== "moduleicon") return;
							var apphomeIdx = value.indexOf("${apphome}");
							if (apphomeIdx === -1) return;
							obj[key] = apphome + value.substring(apphomeIdx + 10);
						}
					});
				}

				json.forEach(restoreAppHomeRecursive);

				return JSON.stringify(json);
			}
		}

		function getDynamicPath(path) {
			if (path.startsWith("//")) {
				path = path.substring(1);
			} else if (!path.startsWith("/")) {
				path = "/" + path;
			}
			if (path.startsWith(apphome)) {
				path = "${apphome}" + path.substring(apphome.length);
			}
			return path;
		}

		function globalizeJSON(json) {
			if (!json || typeof json !== "object") {
				customToast("Invalid JSON structure.", {
					positive: false,
				});
				throw new Error("Invalid JSON structure.");
			}

			if (!Array.isArray(json)) {
				var jsonObj = JSON.parse(json.json);
				json.json = globalizeJSON(jsonObj);
				return JSON.stringify(json);
			} else {
				function addAppHomeRecursive(obj) {
					if (!obj || typeof obj !== "object") {
						return;
					}
					Object.entries(obj).forEach(([key, value]) => {
						if (typeof value === "object") {
							addAppHomeRecursive(value);
						} else if (typeof value === "string") {
							if (key !== "path" && key !== "moduleicon") return;
							try {
								var url = new URL(value);
								obj[key] = getDynamicPath(url.pathname);
							} catch {
								obj[key] = getDynamicPath(value);
							}
						}
					});
				}

				json.forEach(addAppHomeRecursive);

				return JSON.stringify(json);
			}
		}

		function loadJSON() {
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
							var updateddata = localizeJSON(saveddata);
							var parsed = JSON.parse(updateddata);
							if (parsed.length) {
								insertjson = parsed;
							}
						}
					} else {
						console.error("Error", res);
					}
				},
				complete: function () {
					readerUnmarshal(canvas, insertjson);
					loadEvents();

					recenterCanvas();
					canvasContainer.data("changed", false);
					canvasContainer.data("initializing", false);

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
						var aspectRatio = imgWidth / imgHeight;

						if (aspectRatio > 1) {
							imgWidth = 220;
							imgHeight = 220 / aspectRatio;
						} else {
							imgHeight = 200;
							imgWidth = 200 * aspectRatio;
						}

						var prevLogo = canvas.getFigure("logo");

						if (prevLogo) {
							canvas.remove(prevLogo);
						}

						var mainNode = canvas.getFigure("main");

						mainNode.setWidth(imgWidth + 16);
						mainNode.setHeight(imgHeight + 16);

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

		function updateLabelConfigPosition(A) {
			if (!A) {
				A = $(".label-mod-toggler");
			}
			var selectedLabel = canvas.getPrimarySelection();
			if (!selectedLabel || !selectedLabel.shape || !selectedLabel.shape[0]) {
				return;
			}
			var shape = selectedLabel.shape[0].getBoundingClientRect();
			var bb = {
				x: shape.x + shape.width + 8,
				y: shape.y - 20,
			};
			$(A).css({
				color: "#60729e",
				position: "fixed",
				left: bb.x,
				top: bb.y,
				zIndex: 999,
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

					if (selectedIcon) {
						selectedLabel.getUserData().moduleicon = selectedIcon.getPath();
					}

					var moduleid = selectedLabel.getUserData()?.moduleid;
					if (moduleid === undefined || moduleid == "") {
						moduleid = selectedLabel.getText().toLowerCase();
						moduleid = "entity" + moduleid.replace(" ", "-");
						selectedLabel.getUserData().moduleid = moduleid;
					}
					$("#folderId").val(moduleid);
					$("#folderLabel").val(selectedLabel.getText() || "");
					$("#folderDesc").val(selectedLabel.getUserData()?.description || "");
					var ordering = selectedLabel.getUserData()?.ordering || "0";
					$("#ordering").val(ordering).trigger("change");

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
						applink + "/components/smartorganizer/label.html"
					);
					A.setAttribute("role", "button");
					A.dataset.dialogid = "addLabel";
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
					updateLabelConfigPosition(A);
					selectedGroup.on("drag", function () {
						updateLabelConfigPosition(A);
					});
					hideFolderConfig();
				}
			} else {
				hideFolderConfig();
				hideLabelConfig();
			}
		}

		function hideLabelConfig() {
			$("#folderLabel").trigger("blur");
			$(".label-mod-toggler").each(function () {
				$(this).remove();
			});
		}

		function hideFolderConfig() {
			$("#folderId").trigger("blur");
			$("#folderDesc").trigger("blur");
			$("#modifySelection").hide();
			$("#mod-toggler").fadeOut();
			selectedLabel = null;
		}

		lQuery(".deploy-organizer-finish").livequery("click", function (e) {
			e.stopPropagation();
			e.preventDefault();
			saveJSON(true); //is blocking?

			var url = $(this).data("url");
			var id = $("#organizerId").val();
			$("#deployOrganizer").load(url + "?oemaxlevel=1&id=" + id);
		});

		function updateModPosition(selectedFolder) {
			if (!selectedFolder) {
				selectedFolder = canvas.getPrimarySelection();
			}
			if (
				!selectedFolder ||
				!selectedFolder.shape ||
				!selectedFolder.shape[0]
			) {
				return;
			}
			var shape = selectedFolder.shape[0].getBoundingClientRect();
			var bb = {
				x: shape.x + shape.width + 8,
				y: shape.y - 20,
			};

			$("#mod-toggler").css({
				left: bb.x,
				top: bb.y,
			});

			var modCss = {
				left: bb.x + 24,
				top: Math.max(bb.y, 100),
			};
			if (bb.x + 420 > window.innerWidth - 92) {
				modCss.left = bb.x - 440 - shape.width;
			}
			var mH = $("#modifySelection").height() + 92;
			if (bb.y + mH > window.innerHeight) {
				modCss.top = window.innerHeight - mH;
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

		canvas.on("dblclick", function (_, node) {
			var figure = node.figure;
			if (figure && figure.cssClass.startsWith("folder")) {
				$("#mod-toggler").trigger("click");
			}
		});

		function addFolderAt(x, y) {
			var newFolder = folderJson({
				x: x,
				y: y,
			});
			readerUnmarshal(canvas, newFolder);
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

		var labelDragging = false;
		$("#addLabelBtn").on("mouseup", function () {
			if (labelDragging) {
				labelDragging = false;
				return;
			}
			var mainNode = canvas.getFigure("main");
			var centerX = mainNode.getX() + 110;
			var centerY = mainNode.getY() + 50;
			var dirX = Math.random() > 0.5 ? 150 : -300;
			var dirY = Math.random() > 0.5 ? 150 : -300;
			addLabelAt({
				x: centerX + dirX + Math.random() * 50,
				y: centerY + dirY + Math.random() * 50,
			});
		});
		$("#addLabelBtn").draggable({
			scope: "smartOrg",
			helper: "clone",
			revert: "invalid",
			start: function () {
				labelDragging = true;
			},
			end: function () {
				labelDragging = false;
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
				labelDragging = false;
				if ($(ui.draggable).attr("id") === "addFolderBtn") {
					addFolderAt(
						(offsetLeft + ui.position.left) * zoom - 120 * zoom,
						(offsetTop + ui.position.top) * zoom - 30 * zoom
					);
					return;
				}
				if ($(ui.draggable).attr("id") === "addLabelBtn") {
					addLabelAt({
						x: (offsetLeft + ui.position.left) * zoom - 120 * zoom,
						y: (offsetTop + ui.position.top) * zoom - 30 * zoom,
					});
				}
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

		$("#folderLabel").on("blur", function () {
			if (!selectedLabel) return;
			var currentdata = selectedLabel.getUserData();
			if (currentdata !== undefined && currentdata.moduleid == "") {
				var labelText = $(this).val();
				var newid = labelText.toLowerCase();
				newid = newid.replace(" ", "-");

				var moduleid = selectedLabel.getUserData()?.moduleid;
				if (moduleid === undefined || moduleid == "") {
					$("#folderId").val(newid);
					selectedLabel.getUserData().moduleid = newid;
				}
			}
		});

		$("#folderDesc").on("blur", function () {
			if (selectedLabel) {
				selectedLabel.getUserData().description = $(this).val();
			}
		});

		$("#folderId").on("blur", function () {
			if (selectedLabel) {
				selectedLabel.getUserData().moduleid = $(this).val();
			}
		});

		$("#ordering").on("change", function () {
			var value = $(this).val();
			if (selectedLabel) {
				selectedLabel.getUserData().ordering = value;
			}
		});

		lQuery("#icons-list").livequery(function () {
			$(this).on("click", "button", function (e) {
				e.stopImmediatePropagation();
				var iconPath =
					apphome +
					"/theme/icons/bootstrap/" +
					$(this).parent().attr("title") +
					".svg";
				var selectedFolder = canvas.getPrimarySelection();
				if (!selectedFolder) {
					var allSelected = canvas.getSelection().getAll().data;
					if (allSelected.length == 0) {
						closeemdialog($(this).closest(".modal"));
						return;
					} else {
						selectedFolder = allSelected[0];
					}
				}

				var selectedFolderId = selectedFolder.getId();
				var prevIcon = canvas.getFigure(selectedFolderId + "-icon");
				if (!prevIcon) {
					closeemdialog($(this).closest(".modal"));
					return;
				}
				prevIcon.setPath(iconPath);
				$("#folderThumbPickerBtn").html(`<img src="${iconPath}" />`);
				selectedLabel.getUserData().moduleicon = iconPath;
				closeemdialog($(this).closest(".modal"));
				saveJSON();
			});
		});

		canvas.getCommandStack().addEventListener(function (e) {
			if (e.isPostChangeEvent()) {
				if (!canvasContainer.data("initializing")) {
					saveJSON(); //While moving? Too much?
				}
			}
		});

		$("#modifySelection").draggable({
			handle: "#dragHandle",
		});

		var saveBtn = $("#saveOrganizer");

		saveBtn.on("click", function () {
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
			if (usersaved) {
				canvasContainer.data("changed", false); //User Save
			} else {
				canvasContainer.data("changed", true); //Version save
			}

			writerMarshal(canvas, function (json) {
				if (json.length === 0) return;
				var data = {};

				var id = $("#organizerId").val();

				data.id = id;
				data.name = $("#organizerName").val();

				if (data.name === undefined || data.name == "") {
					data.name = "New";
				}

				function createChildParentRelation(parentId, childId) {
					var parentNode = json.find(
						(node) =>
							node.composite === parentId && node.cssClass === "folderLabel"
					);
					if (parentNode && parentNode.userData.moduleid) {
						var childNode = json.find(
							(node) =>
								node.composite === childId && node.cssClass === "folderLabel"
						);

						//var childNode = json.find((node) => node.composite + "-label" === childId); //Hard to read
						//groupId + "-label",
						if (childNode) {
							childNode.userData.parent = parentNode.userData.moduleid;
						}
					}
				}

				if (usersaved) {
					json.forEach((item) => {
						if (item.type === "draw2d.Connection") {
							if (item.source.port === "leftPort") {
								var childId = item.source.node;
								var parentId = item.target.node;
								createChildParentRelation(parentId, childId);
							}
							if (item.target.port === "leftPort") {
								var childId = item.target.node;
								var parentId = item.source.node;
								createChildParentRelation(parentId, childId);
							}
						}
					});
				}

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

				var updateddata = globalizeJSON(data);

				jQuery.ajax({
					dataType: "json",
					method: submitmethod,
					contentType: "application/json; charset=utf-8",
					url: url,
					async: false, //Dont go forward until done
					data: updateddata,
					success: function (json) {
						if (json.response.status == "ok" && !id) {
							$("#organizerId").val(json.response.id);
						}
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

		$(document).on("keydown", function (e) {
			if ((e.metaKey || e.ctrlKey) && e.keyCode == 83) {
				e.preventDefault();
				saveJSON();
				saveJSON(true);
			}
		});
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
			updateModPosition();
			updateLabelConfigPosition();
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
			updateModPosition();
			updateLabelConfigPosition();
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
			updateModPosition();
			updateLabelConfigPosition();
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
			updateModPosition();
			updateLabelConfigPosition();
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
			updateModPosition();
			updateLabelConfigPosition();
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
			updateModPosition();
			updateLabelConfigPosition();
		});

		$("#zoomResetBtn").click(function (e) {
			e.stopImmediatePropagation();
			canvas.setZoom(1.0);
			recenterCanvas();
			updateModPosition();
			updateLabelConfigPosition();
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

			addLabelAt({
				id,
				titleText,
				titleFS,
				captionText,
				captionFS,
				image,
				color,
				bgColor,
				width,
				titleHeight: tH,
				captionHeight: cH,
			});
		});

		function addLabelAt({
			x = midX,
			y = midY + 200,
			id = null,
			titleText = "Label",
			titleFS = 16,
			captionText = "",
			captionFS = 16,
			image = "",
			color = "#ffffff",
			bgColor = null,
			width = 100,
			titleHeight = 22,
			captionHeight = 0,
		}) {
			if (!bgColor) {
				bgColor = getRandomColor();
				color = lightenHex(bgColor, -5);
			}
			labelJson(
				{
					x,
					y,
					width: width,
					title: titleText,
					titleFS: parseInt(titleFS) || 16,
					titleHeight: titleHeight,
					caption: captionText,
					captionFS: parseInt(captionFS) || 16,
					captionHeight: captionHeight,
					image: image,
					bgColor: bgColor || "#60729e",
					color: color || "#4d5d80",
				},
				function (json) {
					var groupId = json[0].id;
					readerUnmarshal(canvas, json);
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
					closeemdialog($("#addLabel"));
				}
			);
		}

		lQuery("#copySmartNodes").livequery("click", function () {
			getSelectedJson(function (json) {
				var icon = $(this).find("i");
				icon.removeClass("bi-copy").addClass("bi-check-lg");
				var copyJson = globalizeJSON(json);
				if (!navigator.clipboard) {
					fallbackCopyText(copyJson);
					setTimeout(function () {
						icon.removeClass("bi-check-lg").addClass("bi-copy");
					}, 1000);
					return;
				}
				navigator.clipboard
					.writeText(copyJson)
					.then(function () {
						validateClipboard();
					})
					.catch((error) => {
						customToast("Error copying to clipboard!", {
							positive: false,
							log: error,
						});
					})
					.finally(() => {
						setTimeout(function () {
							icon.removeClass("bi-check-lg").addClass("bi-copy");
						}, 1000);
					});
			});
		});

		lQuery("#exportSmartNodes").livequery("click", function () {
			getSelectedJson(function (json) {
				if (!Array.isArray(json) || json.length == 0) {
					customToast("Invalid JSON structure.", {
						positive: false,
					});
					return;
				}
				var moduleids = [];
				for (var i = 0; i < json.length; i++) {
					var moduleid = json[i].userData.moduleid;
					if (moduleid) {
						moduleids.push(moduleid);
					}
				}

				var copyJson = globalizeJSON(json);

				$.ajax({
					url:
						apphome +
						"/views/settings/customizations/export/customizations.zip",
					data: {
						moduleid: moduleids,
					},
					method: "GET",
					xhrFields: { responseType: "arraybuffer" },
					success: function (data) {
						var exBlob = new Blob([data], { type: "octet/stream" });
						var zip = new JSZip();
						zip.file("export.json", copyJson);
						zip.file("export.zip", exBlob);
						zip.generateAsync({ type: "blob" }).then(function (blob) {
							saveAs(blob, moduleids.join(",") + ".zip");
						});
					},
					error: function (error) {
						customToast("Error exporting!", {
							positive: false,
							log: error,
						});
					},
				});
			});
		});

		lQuery("#importSmartNodes").livequery("click", function (e) {
			e.stopPropagation();
			e.preventDefault();
			$("#importSmartNodesFile").trigger("click");
		});

		lQuery("#importSmartNodesFile").livequery("change", function () {
			var file = this.files[0];
			if (file) {
				JSZip.loadAsync(file).then(function (zip) {
					zip
						.file("export.json")
						.async("string")
						.then(function (data) {
							var json = JSON.parse(localizeJSON(data));
							if (!Array.isArray(json) || json.length == 0) {
								customToast("Invalid JSON structure.", {
									positive: false,
								});
								return false;
							}
							readerUnmarshal(canvas, json);
							return true;
						})
						.then(function (result) {
							if (!result) {
								return false;
							}
							zip
								.file("export.zip")
								.async("blob")
								.then(function (blob) {
									var data = new FormData();
									data.append("file", blob);
									$.ajax({
										url: apphome + "/views/settings/customizations/import.html",
										method: "POST",
										data: data,
										contentType: false,
										processData: false,
									});
								});
						})
						.catch((error) => {
							customToast("Error importing!", {
								positive: false,
								log: error,
							});
						})
						.finally(() => {
							$("#importSmartNodesFile").val("");
						});
				});
			} else {
				$("#importSmartNodesFile").val("");
			}
		});

		function validateClipboard(callback = null) {
			var json = null;
			if (!navigator.clipboard) {
				customToast("Clipboard API is not supported in http mode!", {
					positive: false,
				});
				return;
			}
			navigator.clipboard
				.readText()
				.then(function (text) {
					if (!text) {
						customToast("Clipboard is empty!", {
							positive: false,
						});
					} else {
						try {
							text = localizeJSON(text);
							json = JSON.parse(text);
							if (!Array.isArray(json) || json.length == 0) {
								customToast("Invalid JSON.", {
									positive: false,
								});
							}
						} catch (error) {
							customToast("Invalid JSON structure.", {
								positive: false,
							});
						}
					}
				})
				.catch((error) => {
					json = null;
					customToast("Error reading clipboard!", {
						positive: false,
						log: error,
					});
				})
				.finally(() => {
					if (callback) {
						callback(json);
					}
				});
		}

		lQuery("#pasteSmartNodes").livequery("click", function () {
			validateClipboard(function (json) {
				if (json) {
					readerUnmarshal(canvas, json);
				}
			});
		});

		lQuery("#closeorgnizer").livequery("click", function () {
			var changed = $("#organizer_canvas").data("changed");
			if (!changed) {
				closeemdialog($(this).closest(".modal"));
				return;
			}
			if (
				confirm("You have unsaved changes. Are you sure you want to close?")
			) {
				$("#organizer_canvas").data("changed", false);
				closeemdialog($(this).closest(".modal"));
			}
		});

		lQuery("#exportForm").livequery("submit", function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();

			var exportType = $(this).find("select[name='exportType']").val();
			var exportJson = [];
			if (exportType === "all") {
				writerMarshal(canvas, function (json) {
					exportJson = json;
					downloadJson(exportJson);
				});
				return;
			}
			if (exportType === "selected") {
				getSelectedJson(function (json) {
					downloadJson(json);
				});
			}
		});

		function getSelectedJson(callback) {
			var figures = canvas.getSelection().getAll();
			if (figures.data && figures.data.length == 0) {
				customToast("No nodes selected.", {
					positive: false,
				});
				return;
			}
			var ids = [];
			function fetchIds({ data }) {
				data.forEach(function (d) {
					if (d.assignedFigures) {
						fetchIds(d.getAssignedFigures());
					}
					ids.push(d.getId());
				});
			}
			fetchIds(figures);
			var idReplacement = {};
			ids.forEach((id) => {
				if (
					id !== "main" &&
					!id.endsWith("-label") &&
					!id.endsWith("-image") &&
					!id.endsWith("-icon") &&
					!id.endsWith("-title") &&
					!id.endsWith("-caption")
				) {
					idReplacement[id] = draw2d.util.UUID.create();
				}
			});
			const parentIds = Object.keys(idReplacement);
			ids.forEach((id) => {
				if (id !== "main" && !idReplacement[id]) {
					var parentId = id
						.replace("-label", "")
						.replace("-image", "")
						.replace("-icon", "")
						.replace("-title", "")
						.replace("-caption", "");
					if (parentIds.includes(parentId)) {
						idReplacement[id] = id.replace(parentId, idReplacement[parentId]);
					}
				}
			});
			var selectedJson = [];
			writerMarshal(canvas, function (json) {
				json.forEach(function (jso) {
					if (jso.id == "main" || jso.id == "logo") {
						return;
					}
					if (ids.includes(jso.id)) {
						if (jso.id && idReplacement[jso.id]) {
							jso.id = idReplacement[jso.id];
						}
						if (jso.composite && idReplacement[jso.composite]) {
							jso.composite = idReplacement[jso.composite];
						}
						if (jso.type === "draw2d.Connection") {
							if (jso.source && idReplacement[jso.source.node]) {
								jso.source.node = idReplacement[jso.source.node];
							}
							if (jso.target && idReplacement[jso.target.node]) {
								jso.target.node = idReplacement[jso.target.node];
							}
						}
						selectedJson.push(jso);
					}
				});
				callback(selectedJson);
			});
		}

		lQuery("#importForm").livequery("submit", function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();

			var file = $("#importFile")[0].files[0];
			if (!file) {
				alert("No file selected.");
				return;
			}

			var thisModal = $(this).closest(".modal");

			var fileReader = new FileReader();
			fileReader.onload = function () {
				try {
					var json = JSON.parse(fileReader.result);
					if (Array.isArray(json) && json.length > 0) {
						readerUnmarshal(canvas, json);
						loadEvents();
						closeemdialog(thisModal);
					} else {
						customToast("Invalid JSON structure.", {
							positive: false,
						});
					}
				} catch (error) {
					customToast("Error parsing JSON!", {
						positive: false,
						log: error,
					});
				}
			};
			fileReader.readAsText(file);
		});

		function downloadJson(json) {
			var exportName = $("#organizerName").val() + "-" + Date.now();
			var dataStr =
				"data:text/json;charset=utf-8," +
				encodeURIComponent(JSON.stringify(json));
			var dlAnchor = document.createElement("a");
			dlAnchor.setAttribute("href", dataStr);
			dlAnchor.setAttribute("download", exportName + ".json");
			document.body.appendChild(dlAnchor);
			dlAnchor.click();
			dlAnchor.remove();
		}

		loadJSON();
	});

	window.onbeforeunload = function () {
		var changed = $("#organizer_canvas").data("changed");
		if (changed) {
			return "You have unsaved changes. Are you sure you want to leave?";
		}
	};

	lQuery(".restoreversion").livequery("click", function (e) {
		e.stopImmediatePropagation();
		e.preventDefault();
		$(this).runAjax();
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

	// var zip = new JSZip();
	// zip.file("Hello.", "hello.txt");
	// zip.generateAsync({ type: "blob" }).then(function (blob) {
	// 	saveAs(blob, "hello.zip");
	// });
});
