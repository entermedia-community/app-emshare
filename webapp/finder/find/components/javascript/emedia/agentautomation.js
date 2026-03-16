"use strict";

const arrowDeco = new draw2d.decoration.connection.ArrowDecorator(16, 16);
arrowDeco.setBackgroundColor("#4d5d80");

function createConnection(sourcePort, targetPort) {
	// console.log({ sourcePort, targetPort });
	const conn = new draw2d.Connection({
		stroke: 2,
		color: "#4d5d80",
		radius: 20,
		cssClass: "connection",
		resizable: false,
		router: new draw2d.layout.connection.InteractiveManhattanConnectionRouter(),
		source: sourcePort,
		target: targetPort,
		targetDecorator: arrowDeco,
	});
	conn.on("connect", function () {
		let sourcePort = conn.sourcePort?.name?.includes("mainInput");
		let targetPort = conn.targetPort?.name?.includes("mainInput");
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
}

const nodePort = {
	type: "draw2d.HybridPort",
	width: 8,
	height: 8,
	selectable: true,
	draggable: true,
	bgColor: "#60729e",
	color: "#4d5d80",
	stroke: 2,
	port: "draw2d.HybridPort",
	maxFanOut: 1,
	locator: "draw2d.layout.locator.XYRelPortLocator",
};

const nodeJson = (attr) => [
	{
		type: "draw2d.shape.note.PostIt",
		...attr,
		padding: 40,
		fontSize: 18,
		cssClass: "node",
		ports: [
			{
				...nodePort,
				id: draw2d.util.UUID.create(),
				name: "topPort",
				locatorAttr: {
					x: 50,
					y: 0,
				},
			},
			{
				...nodePort,
				id: draw2d.util.UUID.create(),
				name: "bottomPort",
				locatorAttr: {
					x: 50,
					y: 100,
				},
			},
		],
	},
];
const logicJson = (attr) => [
	{
		type: "draw2d.shape.composite.Group",
		id: attr.id + "-group",
	},
	{
		type: "draw2d.shape.basic.Diamond",
		...attr,
		padding: 20,
		fontSize: 18,
		height: 50,
		width: 50,
		cssClass: "node",
		ports: [
			{
				...nodePort,
				id: draw2d.util.UUID.create(),
				name: "topPort",
				locatorAttr: {
					x: 50,
					y: 0,
				},
			},
			{
				...nodePort,
				id: draw2d.util.UUID.create(),
				name: "bottomPort",
				locatorAttr: {
					x: 50,
					y: 100,
				},
			},
		],
		composite: attr.id + "-group",
	},
	{
		type: "draw2d.shape.note.PostIt",
		id: attr.id + "-label",
		x: attr.x + 30,
		y: attr.y + 12,
		text: attr.text,
		selectable: false,
		draggable: false,
		composite: attr.id + "-group",
		fontColor: "#444",
		bgColor: "#ffde59",
	},
];

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
			1000,
	);
	return brightness > 125 ? "#000000" : "#ffffff";
}

function fallbackCopyText(text) {
	var $temp = $("<input>");
	$("body").append($temp);
	$temp.val(text);
	$temp.trigger("select");
	document.execCommand("copy");
	$temp.remove();
}

function bfsTopDown(nodes) {
	const children = {};
	const inDegree = {};
	const hash = new Map();
	for (const node of nodes) {
		children[node.id] = [];
		inDegree[node.id] = 0;
		hash.set(node.id, node);
	}

	for (const node of nodes) {
		if (!node.runafter) continue;

		const parents = node.runafter.split("|");
		for (const parent of parents) {
			children[parent].push(node.id);
		}

		inDegree[node.id] = parents.length;
	}

	const queue = [];
	for (const node of nodes) {
		if (!node.runafter) {
			queue.push(node.id);
		}
	}

	const result = [];
	while (queue.length) {
		const levelSize = queue.length;
		const level = [];

		for (let i = 0; i < levelSize; i++) {
			const id = queue.shift();
			level.push(hash.get(id));

			for (const child of children[id]) {
				inDegree[child]--;
				if (inDegree[child] === 0) queue.push(child);
			}
		}

		result.push(level);
	}

	return result;
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
	var canvasHeight = 1920 * window.devicePixelRatio;
	var fullCanvasWidth = canvasWidth + 1000;
	var fullCanvasHeight = canvasHeight + 1000;
	var midX = fullCanvasWidth / 2;
	var midY = fullCanvasHeight / 2;

	lQuery("#automation_canvas").livequery(function () {
		var canvasContainer = $(this);
		canvasContainer.data("uiloaded", true);
		canvasContainer.data("changed", false);
		canvasContainer.data("initializing", true);
		if (canvas) {
			canvas.clear();
			canvas = null;
		}

		canvasContainer.css({
			width: fullCanvasWidth,
			height: fullCanvasHeight,
			marginTop: 0,
			marginLeft: -midX + canvasWidth / 2,
		});

		canvas = new draw2d.Canvas("automation_canvas");

		var reader = new draw2d.io.json.Reader();
		var writer = new draw2d.io.json.Writer();

		function removeDuplicates(json) {
			var checkedIds = {
				Connection: {},
				Group: {},
				Label: {},
				Image: {},
				End: {},
			};
			json.forEach((element, index) => {
				Object.keys(checkedIds).forEach((key) => {
					if (element.type && element.type.endsWith("." + key)) {
						if (checkedIds[key][element.id]) {
							json.splice(index, 1);
						} else {
							checkedIds[key][element.id] = true;
						}
					}
				});
			});
		}

		function readerUnmarshal(canvas, json) {
			removeDuplicates(json);
			reader.unmarshal(canvas, json);
		}

		function writerMarshal(canvas, callback) {
			writer.marshal(canvas, function (json) {
				removeDuplicates(json);
				callback(json);
			});
		}

		canvas.installEditPolicy(
			new draw2d.policy.connection.DragConnectionCreatePolicy({
				createConnection: createConnection,
			}),
		);

		canvas.installEditPolicy(new draw2d.policy.canvas.ShowGridEditPolicy());
		canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGridEditPolicy());
		canvas.installEditPolicy(new draw2d.policy.canvas.CoronaDecorationPolicy());
		canvas.uninstallEditPolicy(new draw2d.policy.canvas.WheelZoomPolicy());
		canvas.uninstallEditPolicy(
			new draw2d.policy.canvas.DefaultKeyboardPolicy(),
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
							if (figure.cssClass === "node") {
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
				},
			}),
		);

		function recenterCanvas() {
			$(".automation-canvas").animate(
				{
					scrollTop: 0,
				},
				"fast",
			);
			canvasContainer.css({
				marginTop: 0,
				marginLeft: -midX + canvasWidth / 2,
			});
		}

		function loadJSON() {
			var id = "informatics";
			var url =
				siteroot +
				"/" +
				mediadb +
				"/services/automation/scenario.json?scenarioid=" +
				id;

			jQuery.ajax({
				dataType: "json",
				url: url,
				method: "GET",
				success: function (res) {
					if (res.status && res.status == "ok") {
						var data = res.data;
						// console.log({ data });
						var scenario = data.scenario;
						// console.log({ scenario });

						var agents = data.agents;
						var queue = bfsTopDown(agents);

						renderQueue(queue);
					} else {
						console.log("Invalid response", res);
					}
				},
			});
		}

		function renderQueue(queue) {
			var rootX = midX - $(".automation-canvas").width() / 4;

			const renderedRef = {};

			let previousNode = null;
			let parentNode = null;

			queue.map((nodes) => {
				let y = 50;
				if (previousNode) {
					y = previousNode.getY() + previousNode.getHeight() + 40;
				}

				nodes.map((node, i) => {
					let startX = rootX;
					if (node.runafter) {
						const parents = node.runafter.split("|");
						if (parents.length === 1) {
							parentNode = canvas.getFigure(parents[0]);
							if (parentNode) {
								startX = parentNode.getX() + parentNode.getWidth() / 2;
							}
						} else {
							let minX = Infinity;
							let maxX = -Infinity;
							parents.forEach((parent) => {
								const p = canvas.getFigure(parent);
								if (p) {
									minX = Math.min(minX, p.getX());
									maxX = Math.max(maxX, p.getX() + p.getWidth());
								}
							});
							if (minX !== Infinity && maxX !== -Infinity) {
								startX = (minX + maxX) / 2;
							}
						}
					}

					var attr = {
						id: node.id,
						x: startX,
						y,
						bgColor: "#c684ff",
						text: node.automationagent.name,
					};

					let node_obj = null;

					if (node.automationagent.id == "javaifcheck") {
						attr.bgColor = "#ffde59";
						node_obj = logicJson(attr);
					} else {
						node_obj = nodeJson(attr);
					}
					if (!node_obj) return;
					readerUnmarshal(canvas, node_obj);

					const renderedNode = canvas.getFigure(node.id);
					if (nodes.length === 1) {
						renderedNode.setX(
							renderedNode.getX() - renderedNode.getWidth() / 2,
						);
					} else {
						if (i === 0) {
							renderedNode.setX(
								renderedNode.getX() - (renderedNode.getWidth() + 20),
							);
						} else {
							renderedNode.setX(renderedNode.getX() + 20);
						}
					}

					renderedRef[node.id] = {
						w: renderedNode.getWidth(),
						center: startX,
					};

					if (node.runafter) {
						var runafter = node.runafter.split("|");
						var connectedTo = canvas
							.getFigures()
							.data.filter(
								(f) => f.cssClass === "node" && runafter.includes(f.id),
							);

						connectedTo.forEach((connectedNode) => {
							var conn = createConnection(
								connectedNode.getPort("bottomPort"),
								renderedNode.getPort("topPort"),
							);
							canvas.add(conn);
						});
					}
					previousNode = renderedNode;
				});
			});

			// var visited = new Set();
			// var x = midX - $(".automation-canvas").width() / 2;
			// var levelSpacingX = 220;
			// var levelCursor = new Map();

			// var parentNode = null;

			// queue.forEach((items, level) => {
			// 	if (!items) {
			// 		return;
			// 	}

			// 	var y = 50;
			// 	var parentCenterX = 0;
			// 	if (parentNode) {
			// 		y = parentNode.getY() + parentNode.getHeight() + 40;
			// 		var parentCenterX = parentNode.getX() + parentNode.getWidth() / 2;
			// 	}

			// 	items.forEach((item) => {
			// 		if (visited.has(item.id)) {
			// 			console.warn(`Skipping already visited item with id ${item.id}`);
			// 			return;
			// 		}
			// 		visited.add(item.id);

			// var attr = {
			// 	id: item.id,
			// 	x: parentCenterX,
			// 	y,
			// 	bgColor: "#c684ff",
			// };
			// var node = null;
			// if (item.automationagent.id == "javaifcheck") {
			// 	attr.bgColor = "#ffde59";
			// 	node = logicJson(attr);
			// } else {
			// 	attr.text = item.automationagent.name;
			// 	node = nodeJson(attr);
			// }
			// readerUnmarshal(canvas, node);
			// 		node = canvas.getFigure(item.id);

			// 		parentNode = node;

			// 	});
			// });

			// console.log(visited);

			recenterCanvas();

			// loadEvents();
			// customToast("Scenario loaded successfully.");
			// console.log({ scenario });
			// console.log({ queue });
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
					imageNode ? imageNode.getWidth() : 0,
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
							`<img src="${selectedIcon.getPath()}" />`,
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
						moduleid = "entity" + moduleid.replace(" ", "");
						moduleid += "-" + draw2d.util.UUID.create().substring(0, 4);
						selectedLabel.getUserData().moduleid = moduleid;
					}
					$("#folderId").val(moduleid);
					$("#folderLabel").val(selectedLabel.getText() || "");
					$("#folderDesc").val(selectedLabel.getUserData()?.description || "");
					var ordering = selectedLabel.getUserData()?.ordering || "-1";
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
						applink + "/components/smartautomation/label.html",
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
						bgColor.blue,
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

		lQuery(".deploy-automation-finish").livequery("click", function (e) {
			e.stopPropagation();
			e.preventDefault();
			saveJSON(true);

			var url = $(this).data("url");
			var id = $("#automationId").val();
			$("#deployOrganizer").load(url + "?oemaxlevel=1&id=" + id, function () {
				window.location = apphome;
			});
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
				return;
			}
			recenterCanvas();
		});

		function addNodeAt(type, x, y) {
			const node = nodeJson(attr);

			canvas.add(node);

			// readerUnmarshal(canvas, newFolder);
			var prevSelections = canvas.getSelection();
			if (prevSelections) {
				var selections = prevSelections.getAll();
				selections.each((_, selection) => selection.unselect());
			}
			$(canvas.html).trigger("focusin");
			node.select();
			handleSelect(node);
			return node;
		}

		var compDragging = false;
		$(".addComp").on("mouseup", function () {
			if (compDragging) {
				compDragging = false;
				return;
			}
			// addNodeAt();
			// TODO
		});

		$(".addComp").draggable({
			scope: "automationOrg",
			helper: "clone",
			revert: "invalid",
			start: function () {
				compDragging = true;
			},
			end: function () {
				compDragging = false;
			},
		});

		$(".automation-canvas").droppable({
			scope: "automationOrg",
			tolerance: "pointer",
			drop: function (_, ui) {
				var zoom = canvas.getZoom();
				var offsetTop = $("#automation_canvas").css("margin-top");
				var offsetLeft = $("#automation_canvas").css("margin-left");
				offsetTop = parseInt(offsetTop) * -1;
				offsetLeft = parseInt(offsetLeft) * -1;
				$(this).css("opacity", 1);
				compDragging = false;
				labelDragging = false;
				if ($(ui.draggable).attr("id") === "addFolderBtn") {
					addNodeAt(
						(offsetLeft + ui.position.left) * zoom - 120 * zoom,
						(offsetTop + ui.position.top) * zoom - 30 * zoom,
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

				var id = $("#automationId").val();

				data.id = id;
				data.name = $("#automationName").val();

				if (data.name === undefined || data.name == "") {
					data.name = "New";
				}

				if (usersaved) {
					// TODO
				}

				data.json = JSON.stringify(json);
				data.updatedby = userid;
				const date2 = new Date();
				data.updatedon = date2.toJSON();

				data.iscurrent = "true";
				data.canvaszoom = canvas.getZoom();
				data.canvastop = canvasContainer.css("margin-top");
				data.canvasleft = canvasContainer.css("margin-left");
			});
		}

		var maxLeft = Math.floor(canvasWidth / 2 + 100);

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

		$("#closeorgnizer").on("click", function () {
			var changed = $("#automation_canvas").data("changed");
			if (!changed) {
				closeemdialog($(this).closest(".modal"));
				return;
			}
			if (
				confirm("You have unsaved changes. Are you sure you want to close?")
			) {
				$("#automation_canvas").data("changed", false);
				closeemdialog($(this).closest(".modal"));
			}
		});

		loadJSON();
	});

	window.onbeforeunload = function () {
		var changed = $("#automation_canvas").data("changed");
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
						encodeURI(newName),
				);
		});
		cancelBtn.click(hideInput);
	});

	// $('.emdialog[data-sidebar="smartautomation"]').emDialog();
});
