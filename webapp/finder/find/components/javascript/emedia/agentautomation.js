"use strict";

var canvas = null;
var canvasContainer = null;
var canvasWidth = 1920 * window.devicePixelRatio;
var canvasHeight = 1920 * window.devicePixelRatio;
var fullCanvasWidth = canvasWidth + 1000;
var fullCanvasHeight = canvasHeight + 1000;
var midX = fullCanvasWidth / 2;
var midY = fullCanvasHeight / 2;

const agentSwatch = {
	eventagent: "#44acff",
	taskagent: "#c684ff",
	logicagent: "#ffde59",
};

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

const arrowDeco = new draw2d.decoration.connection.ArrowDecorator(16, 16);
arrowDeco.setBackgroundColor("#4d5d80");

const colorOnConnect = (source, target, conn) => {
	if (target.cssClass === "prevLabel") {
		let temp = source;
		source = target;
		target = temp;
	}
	if (source.cssClass === "prevLabel") {
		let bgColor = source.getBackgroundColor();
		if (target.cssClass === "preview") {
			const assignedFigures = target.getAssignedFigures();
			const circle = assignedFigures.find(
				(f) => f instanceof draw2d.shape.basic.Circle,
			);
			const label = assignedFigures.find(
				(f) => f instanceof draw2d.shape.basic.Text,
			);
			circle.setBackgroundColor(bgColor);
			label.setFontColor(getContrast(bgColor));

			const lightenedColor = lightenHex(
				rgbToHex(bgColor.red, bgColor.green, bgColor.blue),
				10,
			);
			circle.setColor(lightenedColor);
			conn.setColor(lightenedColor);
			const ports = target.getPorts();
			ports.each(function (_, port) {
				port.setColor(bgColor);
				port.setBackgroundColor(lightenedColor);
			});
		}
	}
};

function createConnection(sourcePort, targetPort, attr = {}) {
	let sourcePortParent = sourcePort.getParent(),
		targetPortParent = targetPort.getParent();

	if (attr.arrowColor) {
		arrowDeco.setBackgroundColor(attr.arrowColor);
	} else if (sourcePortParent) {
		const spBg = sourcePortParent.getBackgroundColor();
		arrowDeco.setBackgroundColor(
			lightenHex(rgbToHex(spBg.red, spBg.green, spBg.blue), 10),
		);
	}

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
		...attr,
	});
	colorOnConnect(sourcePortParent, targetPortParent, conn);
	conn.on("connect", function () {
		let sourcePortParent = conn.getSource().getParent(),
			targetPortParent = conn.getTarget().getParent();
		colorOnConnect(sourcePortParent, targetPortParent, conn);
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
	locator: "draw2d.layout.locator.XYRelPortLocator",
};

const previewJson = (attr, userdata = {}) => [
	{
		type: "draw2d.shape.composite.Group",
		id: attr.id + "-group",
		cssClass: "preview",
		x: attr.x,
		y: attr.y,
		height: 200,
		width: 200,
		userData: userdata,
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
			// {
			// 	...nodePort,
			// 	id: draw2d.util.UUID.create(),
			// 	name: "bottomPort",
			// 	locatorAttr: {
			// 		x: 50,
			// 		y: 100,
			// 	},
			// },
			// {
			// 	...nodePort,
			// 	id: draw2d.util.UUID.create(),
			// 	name: "rightPort",
			// 	locatorAttr: {
			// 		x: 100,
			// 		y: 50,
			// 	},
			// },
			// {
			// 	...nodePort,
			// 	id: draw2d.util.UUID.create(),
			// 	name: "leftPort",
			// 	locatorAttr: {
			// 		x: 0,
			// 		y: 50,
			// 	},
			// },
		],
	},
	{
		type: "draw2d.shape.basic.Circle",
		cssClass: "previewCircle",
		...attr,
		bgColor: "#ffffff",
		stroke: 4,
		color: "royalblue",
		radius: 100,
		composite: attr.id + "-group",
	},
	{
		cssClass: "previewLabel",
		type: "draw2d.shape.basic.Text",
		id: attr.id + "-label",
		x: attr.x + 25,
		y: attr.y + 16,
		fontSize: 22,
		width: 150,
		fontColor: attr.fontColor,
		textAlign: "center",
		stroke: 0,
		selectable: false,
		draggable: false,
		text: attr.text,
		composite: attr.id + "-group",
	},
];

const agentJson = (attr, userdata = {}) => [
	{
		type: "draw2d.shape.note.PostIt",
		...attr,
		fontSize: 18,
		cssClass: "node",
		userData: userdata,
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
const logicJson = (attr, userdata = {}) => [
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
		userData: userdata,
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

var labelPort = {
	type: "draw2d.HybridPort",
	bgColor: "#60729e",
	color: "#4d5d80",
	port: "draw2d.HybridPort",
	locator: "draw2d.layout.locator.XYRelPortLocator",
	width: 16,
	height: 16,
};
var labelJson = function (attr) {
	if (!attr.id) {
		attr.id = draw2d.util.UUID.create();
	}
	return [
		{
			type: "draw2d.shape.note.PostIt",
			...attr,
			fontSize: 32,
			padding: 40,
			bold: true,
			fontColor: getContrast(attr.bgColor),
			stroke: 3,
			cssClass: "prevLabel",
			radius: 4,
			ports: [
				{
					id: draw2d.util.UUID.create(),
					name: "bottomPort",
					...labelPort,
					locatorAttr: {
						x: 50,
						y: 100,
					},
				},
			],
		},
	];
};

function hexToRgb(hex) {
	if (hex.length == 4) {
		hex = hex.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3");
	}
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				red: parseInt(result[1], 16),
				green: parseInt(result[2], 16),
				blue: parseInt(result[3], 16),
			}
		: null;
}
function rgbToHex(r, g, b) {
	return (
		"#" +
		((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
	);
}

function rgbaStringToHex(rgb) {
	const [r, g, b, _] = rgb.match(/[\d.]+/g).map(Number);
	return rgbToHex(r, g, b);
}

function getContrast(color) {
	if (typeof color === "string") {
		color = hexToRgb(color);
	}
	const brightness = Math.round(
		(parseInt(color.red) * 299 +
			parseInt(color.green) * 587 +
			parseInt(color.blue) * 114) /
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

		const parents = node.runafter; //.split("|");
		for (const parent of parents) {
			var parentnode = children[parent.id];
			if (parentnode === undefined) {
				console.log("Invalid parent tree ", parent, children);
			} else {
				parentnode.push(node.id);
			}
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

function installPolicies(canvas, config = {}) {
	canvas.installEditPolicy(
		new draw2d.policy.connection.DragConnectionCreatePolicy({
			createConnection: function (sourcePort, targetPort) {
				return createConnection(
					sourcePort,
					targetPort,
					config.connectionAttr || {},
				);
			},
		}),
	);

	canvas.installEditPolicy(new draw2d.policy.canvas.CoronaDecorationPolicy());
	canvas.uninstallEditPolicy(new draw2d.policy.canvas.WheelZoomPolicy());
	canvas.uninstallEditPolicy(new draw2d.policy.canvas.DefaultKeyboardPolicy());
	canvas.installEditPolicy(new draw2d.policy.canvas.ZoomPolicy());

	canvas.installEditPolicy(
		new draw2d.policy.canvas.KeyboardPolicy({
			onKeyDown: function (canvas, keyCode) {
				var selections = canvas.getSelection();
				if (selections.getSize() === 0) return;
				if (46 === keyCode || 8 == keyCode) {
					const deleteIds = [];
					canvas.getCommandStack().startTransaction("batch_delete");
					selections.each(function (_, figure) {
						const del = {};
						if (figure.cssClass === "preview") {
							del.type = "scenario";
							del.id = figure.getUserData().id;
						} else if (figure.cssClass === "prevLabel") {
							del.type = "label";
							del.id = figure.getId();
						} else if (figure.cssClass === "node") {
							del.type = "agent";
							del.id = figure.getUserData().id;
						}
						if (del.id && del.type) deleteIds.push(del);
						var cmd = null;
						if (figure instanceof draw2d.shape.composite.Group) {
							cmd = new draw2d.command.CommandDeleteGroup(figure);
						} else {
							cmd = new draw2d.command.CommandDelete(figure);
						}
						var connections = figure.getConnections?.();
						if (connections) {
							connections.each(function (_, conn) {
								var c = new draw2d.command.CommandDelete(conn);
								c !== null && canvas.getCommandStack().execute(c);
							});
						}
						cmd !== null && canvas.getCommandStack().execute(cmd);
					});
					canvas.getCommandStack().commitTransaction();
					if (deleteIds.length) {
						var siteroot = $("#application").data("siteroot");
						var mediadb = $("#application").data("mediadbappid");
						const url = `${siteroot}/${mediadb}/services/automation/delete.json`;
						jQuery.ajax({
							url: url,
							method: "POST",
							contentType: "application/json",
							data: JSON.stringify({ deleteIds }),
							success: function (response) {
								console.log("Delete successful", response);
							},
							error: function (error) {
								console.error("Delete failed", error);
							},
						});
					}
				}
			},
		}),
	);
}

$(document).ready(function () {
	var app = jQuery("#application");
	var apphome = app.data("apphome");
	var siteroot = $("#application").data("siteroot");
	var applink = siteroot + apphome;
	var mediadb = $("#application").data("mediadbappid");
	// var userid = $("#application").data("user");

	function loadCanvasPosition(canvasProps) {
		if (canvasProps) {
			canvas.setZoom(parseFloat(canvasProps.zoom) || 1);
			canvasContainer.data("zoom", parseFloat(canvasProps.zoom) || 1);
			if (canvasProps.posx && canvasProps.posy) {
				canvasContainer.data("posx", parseInt(canvasProps.posx));
				canvasContainer.data("posy", parseInt(canvasProps.posy));

				canvasContainer.css({
					marginLeft: parseInt(canvasProps.posx),
					marginTop: parseInt(canvasProps.posy),
				});
			}
		}
	}

	lQuery("#automation_canvas_preview").livequery(function () {
		canvasContainer = $(this);
		canvasContainer.data("changed", false);

		if (canvas) {
			canvas.clear();
			canvas = null;
		}

		canvasContainer.css({
			width: fullCanvasWidth,
			height: fullCanvasHeight,
			marginTop: 0,
			marginLeft: 0,
		});

		const previewConnConfig = {
			stroke: 4,
			strokeDasharray: "5 5",
			color: "royalblue",
			targetDecorator: undefined,
		};

		canvas = new draw2d.Canvas("automation_canvas_preview");
		installPolicies(canvas, {
			connectionAttr: previewConnConfig,
		});

		canvas.on("select", function () {
			canvasContainer.data("changed", true);
		});

		canvas.on("dblclick", function (_, node) {
			var figure = node.figure;
			if (figure) {
				if (figure.composite) {
					figure = figure.composite;
				}
				if (figure.cssClass === "preview") {
					const shape = figure.shape[0].getBoundingClientRect();
					const bb = {
						x: shape.x + shape.width,
						y: shape.y - 20,
					};
					const data = figure.getUserData();
					const anchor = $("<a>")
						.attr("href", `${applink}/components/smartautomation/view.html`)
						.appendTo("body");
					anchor.data("scenarioid", data.id);
					anchor.data("targetdivinner", "previewpan");
					anchor.data("oemaxlevel", 1);
					anchor.runAjax(function () {
						$("#previewpan").attr("data-figure", figure.getId());
						$("#previewpan").fadeIn();
					});
				} else if (figure.cssClass === "prevLabel") {
					const anchor = $("<a>")
						.attr("href", `${applink}/components/smartautomation/label.html`)
						.appendTo("body");
					anchor.data("oemaxlevel", 1);
					anchor.data("id", figure.getId());
					anchor.data("title", figure.getText());
					const bgColor = figure.getBackgroundColor();
					anchor.data(
						"bgColor",
						rgbToHex(bgColor.red, bgColor.green, bgColor.blue),
					);
					const color = figure.getColor();
					anchor.data("color", rgbToHex(color.red, color.green, color.blue));
					anchor.data("dialogid", "prevLabelConfig");
					anchor.emDialog();
				}
			}
		});

		lQuery("#previewLabelForm").livequery("submit", function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();

			var id = $(this).data("id");

			var titleText = $(this).find("input[name='title']").val();
			var color = $(this).find("input[name='stroke']").val();
			var bgColor = $(this).find("input[name='fill']").val();

			addLabelAt({
				id,
				titleText,
				color,
				bgColor,
			});
			closeemdialog($("#prevLabelConfig"));
		});

		canvas.on("unselect", function () {
			if ($("#previewpan").is(":visible")) {
				$("#previewpan").hide();
				$("#previewpan").empty();
			}
		});

		function loadPreviews() {
			const url = `${siteroot}/${mediadb}/services/automation/preview.json`;

			jQuery.ajax({
				dataType: "json",
				url: url,
				method: "GET",
				success: function (res) {
					try {
						if (res.status && res.status == "ok") {
							const data = res.data;
							const scenarios = data.scenarios;
							const labels = data.labels;
							renderPreview(scenarios, labels);
							loadCanvasPosition(data.canvas);
						} else {
							console.log("Invalid response", res);
						}
					} catch (err) {
						console.log(err);
						customToast("Error loading: " + err.message, {
							positive: false,
						});
					}
				},
			});

			// var logo = $("#brandLogo").val();
			// var img = new Image();
			// img.src = logo;
			// img.onload = function () {
			// 	var imgWidth = img.naturalWidth;
			// 	var imgHeight = img.naturalHeight;
			// 	var aspectRatio = imgWidth / imgHeight;

			// 	if (aspectRatio > 1) {
			// 		imgWidth = 150;
			// 		imgHeight = imgWidth / aspectRatio;
			// 	} else {
			// 		imgHeight = 150;
			// 		imgWidth = imgHeight * aspectRatio;
			// 	}
			// 	const imgX = midX - imgWidth / 2;
			// 	const imgY = $(".automation-canvas").height() / 2 - imgHeight / 2;
			// 	canvas.add(
			// 		new draw2d.shape.basic.Circle({
			// 			id: "logoCircle",
			// 			x: imgX + imgWidth / 2 - 25,
			// 			y: imgY + imgHeight / 2 - 20,
			// 			radius: Math.max(imgWidth, imgHeight) / 2 + 20,
			// 			bgColor: "#efefef",
			// 			color: "#ddd",
			// 			stroke: 2,
			// 			selectable: false,
			// 			draggable: false,
			// 			cssClass: "brandLogoCircle",
			// 		}),
			// 	);
			// 	canvas.add(
			// 		new draw2d.shape.basic.Image({
			// 			id: "logo",
			// 			path: logo,
			// 			width: imgWidth,
			// 			height: imgHeight,
			// 			draggable: false,
			// 			selectable: false,
			// 			cssClass: "brandLogo",
			// 		}),
			// 		imgX,
			// 		imgY,
			// 	);
			// };
		}

		function renderPreview(scenarios, labels) {
			const connections = [];
			const startX = midX - canvasWidth / 2 + 200;
			const startY = midY - canvasHeight / 2 + 200;
			let row = 0,
				col = 0;
			console.log(scenarios);
			scenarios.forEach((scenario, i) => {
				if (scenario.connectedtop) {
					connections.push({
						source: scenario.connectedtop,
						target: scenario.id,
					});
				}
				row = i % 3;
				col = Math.floor(i / 3);
				let label = scenario.name;
				label = label.replace(/[^A-Za-z0-9 ]/g, " ");
				label = label.replace(/\s+/g, " ");

				let X = startX + 50 + col * 250;
				let Y = startY + row * 250;

				let skipover = false;

				if (
					scenario.position &&
					scenario.position.posx &&
					scenario.position.posy
				) {
					X = parseFloat(scenario.position.posx);
					Y = parseFloat(scenario.position.posy);
					skipover = true;
				}

				const attr = {
					id: "scenario" + scenario.id,
					x: X,
					y: Y,
					text: label,
					fontColor: "royalblue",
					bold: true,
					bgColor: "#f5f7ff",
				};
				const userdata = {
					id: scenario.id,
				};

				const node_obj = previewJson(attr, userdata);
				readerUnmarshal(canvas, node_obj);

				const renderedPreview = canvas.getFigure(
					"scenario" + scenario.id + "-label",
				);

				if (renderedPreview) {
					renderedPreview.setY(
						renderedPreview.getY() - renderedPreview.getHeight() * 0.28,
					);
				}
				if (skipover) {
					const renderedGroup = canvas.getFigure(
						"scenario" + scenario.id + "-group",
					);
					renderedGroup.setX(renderedPreview.getX() + 75);
					renderedGroup.setY(renderedPreview.getY() + 75);
				}
				renderedPreview.composite.setWidth(200);
			});

			labels.forEach((label) => {
				if (label.connectedbottom) {
					connections.push({
						source: label.connectedbottom,
						target: label.id,
					});
				}

				addLabelAt({
					id: label.id,
					x: parseFloat(label.position.posx),
					y: parseFloat(label.position.posy),
					titleText: label.text,
					color: rgbaStringToHex(label.strokecolor),
					bgColor: rgbaStringToHex(label.bgcolor),
				});
			});

			connections.forEach((conn) => {
				let sourceNode = canvas.getFigure("scenario" + conn.source + "-group");
				if (!sourceNode) {
					sourceNode = canvas.getFigure(conn.source);
				}
				let targetNode = canvas.getFigure("scenario" + conn.target + "-group");
				if (!targetNode) {
					targetNode = canvas.getFigure(conn.target);
				}

				if (sourceNode && targetNode) {
					const sourcePortName =
						sourceNode.cssClass === "prevLabel" ? "bottomPort" : "topPort";
					const targetPortName =
						targetNode.cssClass === "prevLabel" ? "bottomPort" : "topPort";

					const sourcePort = sourceNode.getPort(sourcePortName);
					const targetPort = targetNode.getPort(targetPortName);
					if (sourcePort && targetPort) {
						canvas.add(
							createConnection(sourcePort, targetPort, previewConnConfig),
						);
					} else {
						console.log({ sourceNode, targetNode, sourcePort, targetPort });
					}
				}
			});
			recenterCanvas();
		}

		loadPreviews();

		lQuery("#closeautomationprev").livequery("click", function () {
			$("#previewpan").fadeOut(function () {
				$(this).empty();
			});
		});

		$(".automation-canvas").droppable({
			scope: "automationPrev",
			tolerance: "pointer",
			drop: function (_, ui) {
				var zoom = canvas.getZoom();
				var offsetLeft = $("#automation_canvas_preview").css("margin-left");
				offsetLeft = parseInt(offsetLeft) * -1;
				var offsetTop = $("#automation_canvas_preview").css("margin-top");
				offsetTop = parseInt(offsetTop) * -1;
				$(this).css("opacity", 1);
				console.log(ui);
				addLabelAt({
					x: offsetLeft + ui.offset.left * zoom,
					y: offsetTop + ui.offset.top * zoom - 100,
				});
			},
			over: function () {
				$(this).css("opacity", 0.5);
			},
			out: function () {
				$(this).css("opacity", 1);
			},
		});

		var labelDragging = false;
		$("#addPrevLabelBtn").on("mouseup", function () {
			if (!canvas) return;

			if (labelDragging) {
				labelDragging = false;
				return;
			}
			var mainNode = canvas.getFigure("logoCircle");
			var centerX = mainNode.getX() + 110;
			var centerY = mainNode.getY() + 50;
			var dirX = Math.random() > 0.5 ? 150 : -300;
			var dirY = Math.random() > 0.5 ? 150 : -300;

			addLabelAt({
				x: centerX + dirX + Math.random() * 50,
				y: centerY + dirY + Math.random() * 50,
			});
		});
		$("#addPrevLabelBtn").draggable({
			scope: "automationPrev",
			helper: "clone",
			revert: "invalid",
			start: function () {
				labelDragging = true;
			},
			end: function () {
				labelDragging = false;
			},
		});

		function addLabelAt({
			x = midX + 200,
			y = midY + 100,
			id = null,
			titleText = "Double click to edit",
			color = null,
			bgColor = null,
		}) {
			if (!bgColor) {
				bgColor = getRandomColor();
			}
			if (!color) {
				color = lightenHex(bgColor, 10);
			}

			if (id) {
				var previousLabel = canvas.getFigure(id);
				if (previousLabel) {
					previousLabel.setText(titleText);
					previousLabel.setBackgroundColor(bgColor);
					previousLabel.setColor(color);
					previousLabel.setFontColor(getContrast(bgColor));

					const connectedFigures = previousLabel.getConnections();
					connectedFigures.each(function (_, conn) {
						let sourcePortParent = conn.getSource().getParent(),
							targetPortParent = conn.getTarget().getParent();
						colorOnConnect(sourcePortParent, targetPortParent, conn);
					});

					const ports = previousLabel.getPorts();
					ports.each(function (_, port) {
						port.setColor(bgColor);
						port.setBackgroundColor(lightenHex(color, 10));
					});

					closeemdialog($("#prevLabelConfig"));
					return;
				}
			}

			const json = labelJson({
				id,
				x,
				y,
				text: titleText,
				bgColor: bgColor,
				color: color,
			});
			readerUnmarshal(canvas, json);

			const renderedLabel = canvas.getFigure(json[0].id);
			if (renderedLabel) {
				renderedLabel.setPadding({ top: 20, right: 40, bottom: 20, left: 40 });
				const ports = renderedLabel.getPorts();
				ports.each(function (_, port) {
					port.setColor(bgColor);
					port.setBackgroundColor(lightenHex(color, 10));
				});
			}

			closeemdialog($("#prevLabelConfig"));
		}

		$("#savePreviewLayout").on("click", function (e) {
			e.preventDefault();
			if (!canvas) {
				return;
			}
			canvasContainer.data("changed", false);

			writerMarshal(canvas, function (json) {
				if (json.length === 0) {
					customToast("Nothing to save", { positive: false });
					return;
				}

				const scenarios = [];
				const labels = [];
				const connectedTo = {};

				json.forEach((element) => {
					if (element.type?.endsWith(".Connection")) {
						console.log(element);
						const sourceNode = element.source?.node;
						const targetNode = element.target?.node;
						const targetPort = element.target?.port;

						if (sourceNode && targetNode) {
							const sourcePort = element.source?.port;
							if (sourcePort === "topPort") {
								connectedTo[sourceNode] = targetNode;
							} else if (targetPort === "topPort") {
								connectedTo[targetNode] = sourceNode;
							}
						}
					}
				});

				json.forEach((element) => {
					const userData = element.userData || {};
					if (element.cssClass === "preview" && userData.id) {
						const node = {
							...userData,
							posx: element.x - 100,
							posy: element.y - 80,
						};
						if (connectedTo[element.id]) {
							node.connectedtop = connectedTo[element.id];
						}
						scenarios.push(node);
					} else if (element.cssClass === "prevLabel") {
						const node = {
							id: element.id,
							text: element.text,
							bgcolor: element.bgColor,
							strokecolor: element.color,
							posx: element.x,
							posy: element.y,
						};
						if (connectedTo[element.id]) {
							node.connectedbottom = connectedTo[element.id];
						}
						labels.push(node);
					}
				});

				const url = `${siteroot}/${mediadb}/services/automation/savepreview.json`;
				const marginLeft = parseInt(
					$("#automation_canvas_preview").css("margin-left"),
				);
				const marginTop = parseInt(
					$("#automation_canvas_preview").css("margin-top"),
				);
				const zoom = canvas.getZoom();

				const canvasProps = {
					id: "automation_canvas_preview",
					posx: marginLeft,
					posy: marginTop,
					zoom: zoom,
				};

				const payload = {
					scenarios,
					labels,
					canvas: canvasProps,
				};
				$.ajax({
					url,
					method: "POST",
					contentType: "application/json",
					data: JSON.stringify(payload),
					success: function () {
						customToast("Preview layout saved successfully");
					},
					error: function (err) {
						console.log(err);
						customToast("Error while saving!", {
							positive: false,
						});
					},
				});
			});
		});
	});

	lQuery("#automation_canvas").livequery(function () {
		canvasContainer = $(this);
		canvasContainer.data("changed", false);

		if (canvasContainer.hasClass("viewmode")) {
			canvasWidth -= 340;
		}

		if (canvas) {
			canvas.clear();
			canvas = null;
		}

		canvasContainer.css({
			width: fullCanvasWidth,
			height: fullCanvasHeight,
			marginTop: midY - canvasHeight / 2,
			marginLeft: -midX + canvasWidth / 2,
		});

		canvas = new draw2d.Canvas("automation_canvas");

		installPolicies(canvas);

		function loadJSON() {
			const id = $("#automationId").val();
			const url = `${siteroot}/${mediadb}/services/automation/scenario.json?scenarioid=${id}`;

			jQuery.ajax({
				dataType: "json",
				url: url,
				method: "GET",
				success: function (res) {
					try {
						if (res.status && res.status == "ok") {
							const data = res.data;
							// console.log({ data });
							// const scenario = data.scenario;
							// console.log({ scenario });

							const agents = data.agents;
							var queue = bfsTopDown(agents);

							renderQueue(queue);

							loadCanvasPosition(data.canvas);
						} else {
							console.log("Invalid response", res);
						}
					} catch (err) {
						console.log(err);
						customToast("Error loading: " + err.message, {
							positive: false,
						});
					}
				},
			});
		}

		function renderQueue(queue) {
			var rootX = midX - $(".automation-canvas").width() / 4;
			var rootY = midY - $(".automation-canvas").height() / 2 + 50;

			let previousNode = null;
			let parentNode = null;

			queue.map((nodes) => {
				let y = rootY;
				if (previousNode) {
					y = previousNode.getY() + previousNode.getHeight() + 40;
				}

				nodes.map((node, i) => {
					let startX = rootX;
					let startY = y;
					let skipover = false;
					if (node.offsetx > 0 && node.offsety > 0) {
						startX = parseInt(node.offsetx);
						startY = parseInt(node.offsety);
						skipover = true;
					} else {
						if (node.runafter) {
							const parents = node.runafter; //.split("|");
							if (parents.length === 1) {
								parentNode = canvas.getFigure(parents[0].id);
								if (parentNode) {
									startX = parentNode.getX() + parentNode.getWidth() / 2;
								}
							} else {
								let minX = Infinity;
								let maxX = -Infinity;
								parents.forEach((parent) => {
									const p = canvas.getFigure(parent.id);
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
					}

					const label = node.name || node.automationagent.name;
					const icon = node.agenticon || null;

					const attr = {
						id: node.id,
						x: startX,
						y: startY,
						icon: icon,
						text: JSON.parse(`"${icon}"`) + " " + label,
						fontFamily: "bootstrap-icons, Arial, sans-serif",
						bgColor: node.enabled
							? agentSwatch[node.agenttype?.id] || "#888888"
							: "#ff849f80",
					};

					const userData = {
						id: node.id,
						enabled: node.enabled,
						automationagent: node.automationagent.id,
						automationscenario: node.automationscenario.id,
						skilloverview: node.skilloverview,
					};

					let node_obj = null;

					if (node.agenttype?.id == "logicagent") {
						node_obj = logicJson(attr, userData);
					} else {
						node_obj = agentJson(attr, userData);
					}

					if (!node_obj) return;

					readerUnmarshal(canvas, node_obj);

					const renderedNode = canvas.getFigure(node.id);

					const lightenedColor = lightenHex(attr.bgColor, 10);

					const ports = renderedNode.getPorts();
					ports.each(function (_, port) {
						port.setColor(attr.bgColor);
						port.setBackgroundColor(lightenedColor);
					});

					if (!skipover) {
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
					}

					if (node.runafter) {
						var runafter = node.runafter; //.split("|");

						var connectedTo = canvas.getFigures().data.filter(
							// runafter.includes(f.id),
							(f) =>
								f.cssClass === "node" &&
								runafter.some((item) => item.id === f.id),
						);

						connectedTo.forEach((connectedNode) => {
							var conn = createConnection(
								connectedNode.getPort("bottomPort"),
								renderedNode.getPort("topPort"),
								{
									color: lightenedColor,
									arrowColor: lightenedColor,
								},
							);
							canvas.add(conn);
						});
					}
					if (!skipover) {
						previousNode = renderedNode;
					}
				});
			});

			recenterCanvas();
		}

		function handleSelect(selectedNode = null) {
			if (!selectedNode) {
				selectedNode = canvas.getPrimarySelection();
			}
			if (selectedNode) {
				if (selectedNode.cssClass === "node") {
					updateModPosition(selectedNode);

					$("#edit-toggler").fadeIn();

					selectedNode.on("drag", function () {
						updateModPosition(selectedNode);
					});
				}
			} else {
				hideConfig();
			}
		}

		function hideConfig() {
			$("#edit-toggler").fadeOut();
		}

		function updateModPosition(selectedNode) {
			if (!selectedNode) {
				selectedNode = canvas.getPrimarySelection();
			}
			if (!selectedNode || !selectedNode.shape || !selectedNode.shape[0]) {
				return;
			}
			const shape = selectedNode.shape[0].getBoundingClientRect();
			const bb = {
				x: shape.x + shape.width,
				y: shape.y - 20,
			};

			$("#edit-toggler").css({
				left: bb.x,
				top: bb.y,
			});
		}

		canvas.on("select", function () {
			handleSelect();
			canvasContainer.data("changed", true);
		});

		canvas.on("unselect", function () {
			hideConfig();
		});

		$("#edit-toggler").on("click", function (e) {
			e.stopImmediatePropagation();
			const selectedNode = canvas.getPrimarySelection();
			if (!selectedNode) return;
			const nodeId = selectedNode.getUserData().id;
			const formPath = `${applink}/components/smartautomation/agent-form.html`;
			const anchor = $("<a>").attr("href", formPath).appendTo("body");
			anchor.data("agentid", nodeId);
			anchor.data("hidefooter", true);
			anchor.emDialog();
			anchor.remove();
		});

		canvas.on("dblclick", function (_, node) {
			var figure = node.figure;
			if (figure && figure.cssClass === "node") {
				$("#edit-toggler").trigger("click");
				return;
			}
			recenterCanvas();
		});

		function addNodeAt(type, x, y) {
			const formPath = `${applink}/components/smartautomation/agent-form.html`;
			const anchor = $("<a>").attr("href", formPath).appendTo("body");
			const scenarioid = $("#automationId").val();
			anchor.data("scenarioid", scenarioid);
			anchor.data("offsetx", x);
			anchor.data("offsety", y);
			anchor.data("hidefooter", true);
			anchor.emDialog();
			anchor.remove();
		}

		$(".addComp").draggable({
			scope: "automationOrg",
			helper: "clone",
			revert: "invalid",
		});

		// $("#previewpan").draggable({
		// 	handle: "#dragHandle",
		// });

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

				const type = $(ui.draggable).data("type");
				addNodeAt(
					type,
					(offsetLeft + ui.position.left) * zoom - 120 * zoom,
					(offsetTop + ui.position.top) * zoom - 30 * zoom,
				);
			},
			over: function () {
				$(this).css("opacity", 0.2);
			},
			out: function () {
				$(this).css("opacity", 1);
			},
		});

		$("#exportScenario").on("click", function () {
			if (!canvas) {
				return;
			}

			const _this = $(this);
			const data = {
				scenario: {
					name: _this.data("name") || "Untitled Scenario",
					description: _this
						.closest(".automation-header")
						.find("p.scenario-description")
						.text(),
				},
				agents: [],
			};
			writerMarshal(canvas, function (json) {
				data.agents = json;
				const dataStr =
					"data:text/json;charset=utf-8," +
					encodeURIComponent(JSON.stringify(data));
				const downloadAnchorNode = document.createElement("a");
				downloadAnchorNode.setAttribute("href", dataStr);
				const id = $("#automationId").val();
				downloadAnchorNode.setAttribute(
					"download",
					`scenario-${id || "untitled"}.json`,
				);
				document.body.appendChild(downloadAnchorNode); // required for firefox
				downloadAnchorNode.click();
				downloadAnchorNode.remove();
			});
		});

		function getPngPreview(cb) {
			if (!canvas) {
				return;
			}
			var xCoords = [];
			var yCoords = [];
			canvas.getFigures().each(function (i, f) {
				var b = f.getBoundingBox();
				xCoords.push(b.x, b.x + b.w);
				yCoords.push(b.y, b.y + b.h);
			});
			var minX = Math.min.apply(Math, xCoords);
			var minY = Math.min.apply(Math, yCoords);
			var width = Math.max.apply(Math, xCoords) - minX;
			var height = Math.max.apply(Math, yCoords) - minY;

			console.log({ minX, minY, width, height });

			// add padding
			const paddingX = 40;
			const paddingY = 20;
			minX = minX - paddingX;
			minY = minY - paddingY;
			width = width + paddingX * 2;
			height = height + paddingY * 2;

			// make square & centered
			// if (width > height) {
			// 	minY = minY - (width - height) / 2;
			// 	height = width;
			// } else {
			// 	minX = minX - (height - width) / 2;
			// 	width = height;
			// }

			var pngWriter = new draw2d.io.png.Writer();
			pngWriter.marshal(
				canvas,
				function (png) {
					cb(png);
				},
				new draw2d.geo.Rectangle(minX, minY, width, height),
			);
		}

		$("#saveScenarioLayout").on("click", function (e) {
			e.preventDefault();
			if (!canvas) {
				return;
			}
			canvasContainer.data("changed", false);

			writerMarshal(canvas, function (json) {
				if (json.length === 0) {
					customToast("Nothing to save", { positive: false });
					return;
				}

				const data = [];
				const runAfters = {};
				json.forEach((element) => {
					if (element.type && element.type.endsWith(".Connection")) {
						const sourceNode = element.source?.node;
						const targetNode = element.target?.node;
						if (sourceNode && targetNode) {
							runAfters[targetNode] = sourceNode;
						}
					}
				});
				json.forEach((element) => {
					if (element.userData && element.userData.id) {
						const node = {
							...element.userData,
							offsetx: element.x,
							offsety: element.y,
						};
						if (runAfters[element.id]) {
							node.runafter = runAfters[element.id];
						}
						data.push(node);
					}
				});

				const scenarioid = $("#automationId").val();

				const marginLeft = parseInt($("#automation_canvas").css("margin-left"));
				const marginTop = parseInt($("#automation_canvas").css("margin-top"));
				const zoom = canvas.getZoom();

				const canvasProps = {
					id: `automation_canvas--${scenarioid}`,
					posx: marginLeft,
					posy: marginTop,
					zoom: zoom,
				};

				getPngPreview(function (png) {
					const url = `${siteroot}/${mediadb}/services/automation/savelayout.json`;
					const payload = {
						thumbnail: png,
						data,
						scenarioid,
						canvas: canvasProps,
					};
					$.ajax({
						url,
						method: "POST",
						contentType: "application/json",
						data: JSON.stringify(payload),
						success: function () {
							customToast("Layout saved successfully");
						},
						error: function (err) {
							console.log(err);
							customToast("Error while saving!", {
								positive: false,
							});
						},
					});
				});
			});
		});

		loadJSON();
	});

	function recenterCanvas() {
		if (!canvasContainer) return;

		const posx = canvasContainer.data("posx");
		const posy = canvasContainer.data("posy");
		const _zoom = canvasContainer.data("zoom");
		console.log({ posx, posy, _zoom });
		if (posx !== undefined && posy !== undefined && _zoom !== undefined) {
			canvas.setZoom(_zoom);
			canvasContainer.css({
				marginTop: posy,
				marginLeft: posx,
			});
			return;
		}

		var xCoords = [];
		var yCoords = [];
		canvas.getFigures().each(function (i, f) {
			var b = f.getBoundingBox();
			xCoords.push(b.x, b.x + b.w);
			yCoords.push(b.y, b.y + b.h);
		});
		var minX = Math.min.apply(Math, xCoords);
		var minY = Math.min.apply(Math, yCoords);
		var width = Math.max.apply(Math, xCoords) - minX;
		var height = Math.max.apply(Math, yCoords) - minY;

		const containerWidth = $(".automation-canvas").width();
		const containerHeight = $(".automation-canvas").height();

		const centerX = minX + width / 2;
		const centerY = minY + height / 2;

		const x = containerWidth / 2 - centerX;
		const y = containerHeight / 2 - centerY;

		let offsetTop = 0;
		let offsetLeft = 0;
		if (canvasContainer.hasClass("editmode")) {
			offsetLeft = 100;
		}

		const zoom = width / (containerWidth - offsetLeft * 2) + 0.1;

		if (zoom <= 1) {
			canvasContainer.css({
				marginTop: y + offsetTop,
				marginLeft: x + offsetLeft,
			});
		} else {
			canvas.setZoom(zoom);
			const zoomedWidth = containerWidth / zoom;
			const zoomedHeight = containerHeight / zoom;
			const zoomedCenterX = minX + zoomedWidth / 2;
			const zoomedCenterY = minY + zoomedHeight / 2;

			const zoomedX = containerWidth / 2 - zoomedCenterX;
			const zoomedY = containerHeight / 2 - zoomedCenterY;

			canvas.setZoom(zoom);
			canvasContainer.css({
				marginTop: zoomedY + offsetTop,
				marginLeft: zoomedX + offsetLeft,
			});
		}
	}

	var maxLeft = Math.floor(canvasWidth / 2 + 100);

	lQuery("#vToTop").livequery("click", function (e) {
		e.stopImmediatePropagation();
		if (!canvasContainer) return;
		var pos = parseInt(canvasContainer.css("margin-top")) + 50;
		if (pos > 0) {
			$(this).prop("disabled", true);
			return;
		}
		$("#vToBottom").prop("disabled", false);
		canvasContainer.css("margin-top", pos);
		// updateModPosition();
	});
	lQuery("#vToBottom").livequery("click", function (e) {
		e.stopImmediatePropagation();
		if (!canvasContainer) return;
		var pos = parseInt(canvasContainer.css("margin-top")) - 50;
		if (Math.abs(pos) > canvasHeight - 80) {
			$(this).prop("disabled", true);
			return;
		}
		$("#vToTop").prop("disabled", false);
		canvasContainer.css("margin-top", pos);
		// updateModPosition();
	});
	lQuery("#vToLeft").livequery("click", function (e) {
		e.stopImmediatePropagation();
		if (!canvasContainer) return;
		var pos = parseInt(canvasContainer.css("margin-left")) + 50;
		if (pos > 0) {
			$(this).prop("disabled", true);
			return;
		}
		$("#vToRight").prop("disabled", false);
		canvasContainer.css("margin-left", pos);
		// updateModPosition();
	});
	lQuery("#vToRight").livequery("click", function (e) {
		e.stopImmediatePropagation();
		if (!canvasContainer) return;
		var pos = parseInt(canvasContainer.css("margin-left")) - 50;
		if (Math.abs(pos) > maxLeft) {
			$(this).prop("disabled", true);
			return;
		}
		$("#vToLeft").prop("disabled", false);
		canvasContainer.css("margin-left", pos);
		// updateModPosition();
	});
	lQuery("#zoomInBtn").livequery("click", function (e) {
		e.stopImmediatePropagation();
		if (!canvas || !canvasContainer) return;
		var zoom = canvas.getZoom();
		if (zoom < 0.5) return;
		zoom -= 0.1;
		canvas.setZoom(zoom);

		var change = -80;

		var newleft = parseInt(canvasContainer.css("margin-left")) + change;
		canvasContainer.css("margin-left", newleft);

		var newtop = parseInt(canvasContainer.css("margin-top")) + change;
		canvasContainer.css("margin-top", newtop);
		// updateModPosition();
	});

	lQuery("#zoomOutBtn").livequery("click", function (e) {
		e.stopImmediatePropagation();
		if (!canvas || !canvasContainer) return;
		var zoom = canvas.getZoom();
		if (zoom > 2) return;
		zoom += 0.1;
		canvas.setZoom(zoom);

		var change = 80;

		var newleft = parseInt(canvasContainer.css("margin-left")) + change;
		canvasContainer.css("margin-left", newleft);

		var newtop = parseInt(canvasContainer.css("margin-top")) + change;
		canvasContainer.css("margin-top", newtop);
		// updateModPosition();
	});

	lQuery("#zoomResetBtn").livequery("click", function (e) {
		e.stopImmediatePropagation();
		if (!canvas) return;
		recenterCanvas();
		// updateModPosition();
	});

	lQuery("#closeautomation").livequery("click", function (e) {
		var changed = canvasContainer.data("changed");
		if (!changed) {
			closeemdialog($(this).closest(".modal"));
			return;
		}
		if (confirm("You have unsaved changes. Are you sure you want to close?")) {
			canvasContainer.data("changed", false);
			closeemdialog($(this).closest(".modal"));
		}
	});

	window.onbeforeunload = function () {
		var changed = canvasContainer.data("changed");
		if (changed) {
			return "You have unsaved changes. Are you sure you want to leave?";
		}
	};

	lQuery("#importScenario").livequery("click", function (e) {
		e.stopPropagation();
		e.preventDefault();
		$("#importScenarioFile").trigger("click");
	});

	lQuery("#importScenarioFile").livequery("change", function (e) {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = function (event) {
			const content = event.target.result;
			try {
				const json = JSON.parse(content);
				if (json && json.agents && json.scenario) {
					const url = `${siteroot}/${mediadb}/components/smartautomation/import.html`;
					$.ajax({
						url,
						method: "POST",
						contentType: "application/json",
						data: JSON.stringify(json),
						success: function (res) {
							if (res.status && res.status === "ok") {
								const anchor = $("<a>").attr(
									"href",
									`${applink}/components/smartautomation/editor.html`,
								);
								anchor.data("scenarioid", res.data.id);
								anchor.data("targetdivinner", "smartautomation");
								anchor.data("hidefooter", true);
								anchor.runAjax(function () {
									customToast("Scenario imported successfully");
								});
							} else {
								customToast("Failed to import scenario", { positive: false });
							}
						},
						error: function (err) {
							customToast("Error importing scenario: " + err.message, {
								positive: false,
							});
						},
					});
				} else {
					customToast("Invalid scenario file", { positive: false });
				}
			} catch (err) {
				customToast("Error reading scenario file: " + err.message, {
					positive: false,
				});
			}
		};
		reader.readAsText(file);
		$(this).val("");
	});

	lQuery(".scenario-card").livequery("click", function (e) {
		if (e.target.tagName.toLowerCase() === "a") {
			return;
		}
		$(this).find(".edit-btn").trigger("click");
	});

	lQuery("#automationagentvalue").livequery("select2:select", function (e) {
		let newLabel = e.params.data.text;
		newLabel = newLabel.substring(newLabel.indexOf(":") + 1).trim();
		$(this).closest("form").find("#name\\.value").val(newLabel);
	});

	function connect() {
		if (chatConnection && chatConnection.readyState !== chatConnection.CLOSED) {
			return;
		}
		const tabID =
			sessionStorage.tabID && sessionStorage.closedLastTab !== "2"
				? sessionStorage.tabID
				: (sessionStorage.tabID = Math.random());
		sessionStorage.closedLastTab = "2";
		$(window).on("unload beforeunload", function () {
			sessionStorage.closedLastTab = "1";
		});

		const protocol = location.protocol;

		let url = "//TODO";

		//Get the channel
		const channel = $(".chatterbox").data("channel");
		if (channel != null) {
			url = `${url}&channel=${channel}`;
		}

		if (protocol === "https:") {
			chatConnection = new WebSocket(`wss://${location.host}${url}`);
		} else {
			chatConnection = new WebSocket(`ws://${location.host}${url}`);
		}

		chatConnection.addEventListener("message", function (event) {});
	}

	// $("a[data-dialogid='smartautomation']").trigger("click");
});
