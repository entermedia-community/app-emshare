"use strict";

const agentSwatch = {
	eventagent: "#44acff",
	taskagent: "#c684ff",
	logicagent: "#ffde59",
};

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

const agentJson = (attr, userdata = {}) => [
	{
		type: "draw2d.shape.note.PostIt",
		...attr,
		padding: 40,
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
	var canvasWidth = 1920 * window.devicePixelRatio;
	var canvasHeight = 1920 * window.devicePixelRatio;
	var fullCanvasWidth = canvasWidth + 1000;
	var fullCanvasHeight = canvasHeight + 1000;
	var midX = fullCanvasWidth / 2;
	// var midY = fullCanvasHeight / 2;

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
			const id = $("#automationId").val();
			const url = `${siteroot}/${mediadb}/services/automation/scenario.json?scenarioid=${id}`;

			jQuery.ajax({
				dataType: "json",
				url: url,
				method: "GET",
				success: function (res) {
					if (res.status && res.status == "ok") {
						const data = res.data;
						// console.log({ data });
						// const scenario = data.scenario;
						// console.log({ scenario });

						const agents = data.agents;
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

			let previousNode = null;
			let parentNode = null;

			queue.map((nodes) => {
				let y = 50;
				if (previousNode) {
					y = previousNode.getY() + previousNode.getHeight() + 40;
				}

				nodes.map((node, i) => {
					let startX = rootX;
					let startY = y;
					let skipover = false;
					if (node.offsetx && node.offsety) {
						startX = parseInt(node.offsetx);
						startY = parseInt(node.offsety);
						skipover = true;
					} else {
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
					}

					const attr = {
						id: node.id,
						x: startX,
						y: startY,
						text: node.name || node.automationagent.name,
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
		});

		canvas.on("unselect", function () {
			hideConfig();
		});

		$("#edit-toggler").click(function (e) {
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

			// make square & centered
			if (width > height) {
				minY = minY - (width - height) / 2;
				height = width;
			} else {
				minX = minX - (height - width) / 2;
				width = height;
			}

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
			canvasContainer.data("changed", false); //User Save

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
				console.log(data);

				getPngPreview(function (png) {
					const url = `${siteroot}/${mediadb}/services/automation/savelayout.json`;
					const payload = {
						thumbnail: png,
						data,
						scenarioid: $("#automationId").val(),
					};
					$.ajax({
						url,
						method: "POST",
						contentType: "application/json",
						data: JSON.stringify(payload),
					});
				});
			});
		});

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
		});

		$("#zoomResetBtn").click(function (e) {
			e.stopImmediatePropagation();
			canvas.setZoom(1.0);
			recenterCanvas();
			updateModPosition();
		});

		$("#closeautomation").on("click", function () {
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
});
