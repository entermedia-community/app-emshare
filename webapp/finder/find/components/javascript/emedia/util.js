var app, siteroot, apphome;
var externalmessage;

function getRandomColor() {
	var letters = "0123456789ABCDEF".split("");
	var color = "#";
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function lightenHex(hex, lighten = 0) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	var r = parseInt(result[1], 16);
	var g = parseInt(result[2], 16);
	var b = parseInt(result[3], 16);

	(r /= 255), (g /= 255), (b /= 255);
	var max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	var h,
		s,
		l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	s *= 100;
	s = Math.round(s);
	l *= 100;
	if (l + lighten > 100 || l + lighten < 0) {
		l -= lighten;
	} else {
		l += lighten;
	}
	l = Math.round(l);
	h = Math.round(360 * h);

	l /= 100;
	var a = (s * Math.min(l, 1 - l)) / 100;
	var f = (n) => {
		var k = (n + h / 30) % 12;
		var color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, "0");
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}
function contrastColor(hex) {
	if (hex.indexOf("#") === 0) {
		hex = hex.slice(1);
	}

	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	if (hex.length !== 6) {
		throw new Error("Invalid HEX color.");
	}
	var r = parseInt(hex.slice(0, 2), 16),
		g = parseInt(hex.slice(2, 4), 16),
		b = parseInt(hex.slice(4, 6), 16);

	return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#444444" : "#FFFFFF";
}

toggleUserProperty = function (property, onsuccess = null, onfailure = null) {
	app = $("#application");
	siteroot = app.data("siteroot");
	apphome = app.data("apphome");
	console.log("Saving: " + property);
	jQuery.ajax({
		url:
			apphome +
			"/components/userprofile/toggleprofileproperty.html?field=" +
			property,
		success: function () {
			if (onsuccess) onsuccess();
		},
		error: function () {
			if (onfailure) onfailure();
		},
	});
};

saveProfileProperty = function (property, value, onsuccess = null) {
	app = $("#application");
	siteroot = app.data("siteroot");
	apphome = app.data("apphome");

	var data = app.cleandata();
	data.oemaxlevel = 1;
	data.propertyfield = property;
	data["property.value"] = value;

	jQuery.ajax({
		url: apphome + "/components/userprofile/saveprofileproperty.html",
		data: data,
		success: function () {
			if (onsuccess) onsuccess();
		},
		xhrFields: {
			withCredentials: true,
		},
		crossDomain: true,
	});
};

setSessionValue = function (key, value) {
	app = $("#application");
	siteroot = app.data("siteroot");
	apphome = app.data("apphome");

	jQuery.ajax({
		url:
			apphome +
			"/components/session/setvalue.html?key=" +
			key +
			"&value=" +
			value,
	});
};

getSessionValue = function (key) {
	var returnval = null;
	app = $("#application");
	siteroot = app.data("siteroot");
	apphome = app.data("apphome");

	jQuery.ajax({
		url: apphome + "/components/session/getvalue.html?key=" + key,
		async: false,
		success: function (data) {
			returnval = data;
		},
	});

	return returnval;
};

var desktopOffset = 0;

$(document).ready(function () {
	app = $("#application");
	if (app.data("desktop")) {
		desktopOffset = 32;
	}
	function setMaxHeight(elm, child, offset = 32) {
		if (!elm || !elm.length) {
			return;
		}
		var target = elm;
		if (child) {
			target = elm.find(child);
			if (!target || !target.length) {
				return;
			}
		}
		var top = $(window).height() - elm.offset().top - offset - desktopOffset;
		top = Math.max(top, 400);
		target.css("height", top + "px");
	}

	function resizeColumns() {
		var windowh = $(window).height() - desktopOffset;

		//togglers always screen height
		var coltogglers = $(".col-sidebar-togglers");
		coltogglers.css("height", windowh - 4);
		var colsidebar = $(".col-mainsidebar");
		colsidebar.css("height", windowh);

		//reset some heights
		$(".settingslayout").css("height", "auto");
		$(".col-content-main").css("height", "auto"); //reset

		$(".adjustHeight").each(function () {
			setMaxHeight($(this));
		});
	}

	function resizeSearchCategories() {
		var container = $("#sidecategoryresults");
		if (!container) {
			return;
		}
		var w = container.width();

		var ctree = container.find(".searchcategories-tree");
		var cfilter = container.find(".searchcategories-filter");
		if (w > 640) {
			ctree.addClass("widesidebar");
			cfilter.addClass("widesidebar");
		} else {
			ctree.removeClass("widesidebar");
			cfilter.removeClass("widesidebar");
		}
		//console.log(h);
	}

	function adjustDataManagerTable() {
		if ($(".datamanagertable").length) {
			var height = $(window).height() - desktopOffset;
			$(".datamanagertable").height(height - 352);
		}
	}

	var resizeTimer = null; //Prevent back to back resize events, only run the last trigger
	jQuery(window).on("resize", function () {
		resizeTimer && clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function () {
			adjustDataManagerTable();
			resizeSearchCategories();
			resizeColumns();
		}, 50);
	});

	focusInput = function (input) {
		//console.log(input);
		if (window.innerWidth < 768) return false;
		if (input.length > 0) {
			input.focus();
			var inputVal = input.val();
			if (inputVal) {
				input.val("");
				input.val(inputVal);
			}
			return true;
		}
		return false;
	};

	window.debugMode = false;
	window.onkeydown = function (event) {
		if (event.ctrlKey) {
			var selector = document.querySelector("a#oeselector");
			if (selector == undefined) {
				return;
			}
			var href = selector.href;
			if (event.key == "r") {
				event.preventDefault();
				href = href.replace(
					"components/toolbar/plugintoolbar",
					"views/filemanager/clearpagemanager"
				);
				window.location.href = href;
			} else if (event.key == "d") {
				event.preventDefault();
				if (!debugMode) {
					debugMode = !document.querySelector(".openeditdebug");
				} else {
					debugMode = false;
				}
				var mode = debugMode ? "debug" : "preview";
				href = href.replace(
					"components/toolbar/plugintoolbar",
					`views/workflow/mode/view${mode}`
				);
				jQuery.get(href);
				customToast("Switched to&nbsp;<b>" + mode + "</b>&nbsp;mode!", {
					positive: !debugMode,
					icon: debugMode ? "bug-fill" : "eye-fill",
				});
				if (mode == "preview") {
					window.location.reload();
				}
			}
		}
	};

	setTimeout(function () {
		var path = new URL(window.location.href).pathname;
		$(".auto-active-link").each(function () {
			var href = $(this).attr("href");
			if (href == path) {
				var container = $(this).closest(".auto-active-container");
				container.find("li.current").removeClass("current");
				container.find("a.active").removeClass("active");
				$(this).addClass("active");
				$(this).parents("li").addClass("current");
			}
		});
	});

	lQuery(".pickfromiframe").livequery("click", function (e) {
		if ($("#application").hasClass("blockfind")) {
			e.preventDefault();
			e.stopImmediatePropagation();

			var pickerBtn = $(this);

			var imageUrl = pickerBtn.data("imageurl");
			var assetInfo = pickerBtn.closest("[data-assetid]");
			var assetid = "";
			var target = "";
			if (externalmessage && externalmessage.target) {
				target = externalmessage.target;
			}
			if (!target) {
				target = $("#application").data("targetfieldid") || "";
			}
			if (assetInfo.length) {
				assetid = assetInfo.data("assetid");
			}

			var type = $("#application").data("targettype");
			if (!type) {
				type = "asset";
			}

			if (type == "entity") {
				assetid = pickerBtn.data("primarymedia");
			}

			var entityid = pickerBtn.data("entityid");

			var payload = {
				name: "eMediaPicked",
				assetpicked: imageUrl,
				assetid: assetid,
				entityid: entityid,
				target: target,
				type: type,
			};

			if (top && externalmessage) {
				var parenturl = externalmessage["parenturl"];
				if (parenturl !== null) {
					var parentProtocol = new URL(parenturl).protocol;
					var hostname = new URL(parenturl).hostname;
					var parentPort = new URL(parenturl).port;
					var targetOrigin = `${parentProtocol}//${hostname}`;
					if (parentPort) targetOrigin += `:${parentPort}`;

					// Use the target origin in the postMessage.
					top.postMessage(payload, targetOrigin);
				}
			} else {
				window.parent.postMessage(payload);
			}
		}
	});

	lQuery("form").livequery(function () {
		var modal = $(this).closest(".modal");
		if (modal.length === 0 || $(this).hasClass("noautofocus")) {
			return;
		}
		var input = $(this).find("input[autofocus]:visible:first");
		if (input.length === 0) {
			input = $(this).find("textarea[autofocus]:visible:first");
		}
		var focused = focusInput(input);
		if (!focused) {
			var $this = $(this);
			setTimeout(function () {
				focusInput($this.find("input:visible:first"));
			});
		}
	});
	lQuery("textarea#postcontent").livequery(function () {
		var text = $(this).val();
		var $text = $(text);
		var finalText = "";
		let counter = 0;
		function getText(node, parents = []) {
			var nodeName = node.nodeName;

			if (nodeName == "OL") {
				counter = 0;
			}

			if (nodeName == "LI") {
				if (parents.length >= 1 && parents[parents.length - 1] == "OL") {
					counter++;
					finalText += counter + ". ";
				} else {
					finalText += "  •  ";
				}
			}

			if (nodeName == "BR") {
				finalText += "\n";
			} else if (nodeName == "#text") {
				var textContent = node.textContent;
				if (parents.length > 0) {
					var parent = parents[parents.length - 1];
					var grandParents = parents.slice(0, parents.length - 1);
					if (parent == "B" || parent == "STRONG" || /H\d/.test(parent)) {
						if (grandParents.includes("I") || grandParents.includes("EM")) {
							textContent = asciiBoldItalicText(textContent);
						} else {
							textContent = asciiBoldText(textContent);
						}
					} else if (parent == "I" || parent == "EM") {
						if (grandParents.includes("B") || grandParents.includes("STRONG")) {
							textContent = asciiBoldItalicText(textContent);
						} else {
							textContent = asciiItalicText(textContent);
						}
					} else if (parent == "U" || parent == "INS") {
						if (grandParents.includes("B") || grandParents.includes("STRONG")) {
							textContent = asciiBoldUnderlineText(textContent);
						} else if (
							grandParents.includes("I") ||
							grandParents.includes("EM")
						) {
							textContent = asciiBoldUnderlineText(textContent);
						} else {
							textContent = asciiUnderlineText(textContent);
						}
					}
				}
				finalText += textContent;
			} else {
				var childNodes = node.childNodes;
				for (var i = 0; i < childNodes.length; i++) {
					getText(childNodes[i], parents.concat(node.nodeName));
				}
			}
			if (nodeName == "P") {
				finalText += "\n\n";
			}
			if (
				/H\d/.test(nodeName) ||
				nodeName == "LI" ||
				nodeName == "UL" ||
				nodeName == "OL"
			) {
				finalText += "\n";
			}
		}

		$text.each(function () {
			getText(this);
		});

		finalText = finalText.trim();
		$(this).text(finalText);
		$(this).val(finalText);
	});

	lQuery(".postiz-format").livequery("click", function () {
		var textarea = document.querySelector("textarea#postcontent");
		var format = $(this).data("format");
		var selectionStart = textarea.selectionStart;
		var selectionEnd = textarea.selectionEnd;
		var selection = "";
		if (selectionStart >= 0 && selectionEnd >= 1) {
			if (selectionStart == selectionEnd) {
				selection = prompt("Enter the text you want to insert");
			} else {
				selection = textarea.value.substring(selectionStart, selectionEnd);
			}
		}
		if (selection.length) {
			selection = asciiNormalText(selection);
			if (format == "bold") {
				selection = asciiBoldText(selection);
			} else if (format == "italic") {
				selection = asciiItalicText(selection);
			} else if (format == "underline") {
				selection = asciiUnderlineText(selection);
			}
		}
		if (selectionStart != selectionEnd) {
			textarea.value =
				textarea.value.substring(0, selectionStart) +
				selection +
				textarea.value.substring(selectionEnd);
		} else {
			textarea.value = textarea.value + selection;
			textarea.scroll(0, textarea.scrollHeight);
		}
		$(textarea).focus();
	});
}); //document ready

window.addEventListener(
	"message",
	function (e) {
		if (
			typeof e.data === "object" &&
			e.data.name === "setEmediaLibraryPicker"
		) {
			externalmessage = e.data;
		}
	},
	false
);

var asciiFormatRanges = {
	n: [120812, 120821],
	bA: [120276, 120301],
	ba: [120302, 120327],
	iA: [120328, 120353],
	ia: [120354, 120379],
};

function getAsciiFormat(char) {
	for (var type in asciiFormatRanges) {
		var start = asciiFormatRanges[type][0];
		var end = asciiFormatRanges[type][1];
		if (char.codePointAt(0) >= start && char.codePointAt(0) <= end) {
			return type;
		}
	}
	return false;
}

function asciiNormalText(text) {
	Object.keys(asciiFormatRanges).forEach(function (type) {
		var start = asciiFormatRanges[type][0];
		var end = asciiFormatRanges[type][1];
		var diff = 48;
		if (type == "bA" || type == "iA") diff = 65;
		else if (type == "ba" || type == "ia") diff = 97;
		for (var i = start; i <= end; i++) {
			text = text.replaceAll(String.fromCodePoint(i), function (char) {
				return String.fromCharCode(char.codePointAt(0) - start + diff);
			});
		}
		text = text.replaceAll(String.fromCodePoint(818), "");
	});
	return text;
}

function asciiBoldText(text) {
	return text.replace(/[A-Za-z0-9]/g, function (char) {
		let diff;
		if (/[0-9]/.test(char)) {
			diff = "𝟬".codePointAt(0) - "0".codePointAt(0);
		} else if (/[A-Z]/.test(char)) {
			diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
		} else {
			diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
		}
		return String.fromCodePoint(char.codePointAt(0) + diff);
	});
}
function asciiItalicText(text) {
	return text.replace(/[A-Za-z]/g, function (char) {
		let diff;
		if (/[A-Z]/.test(char)) {
			diff = "𝘈".codePointAt(0) - "A".codePointAt(0);
		} else {
			diff = "𝘢".codePointAt(0) - "a".codePointAt(0);
		}
		return String.fromCodePoint(char.codePointAt(0) + diff);
	});
}
function asciiBoldItalicText(text) {
	return text.replace(/[A-Za-z]/g, function (char) {
		let diff;
		if (/[A-Z]/.test(char)) {
			diff = "𝘼".codePointAt(0) - "A".codePointAt(0);
		} else {
			diff = "𝙖".codePointAt(0) - "a".codePointAt(0);
		}
		return String.fromCodePoint(char.codePointAt(0) + diff);
	});
}

function asciiUnderlineText(text) {
	return text.replace(/[A-Za-z0-9]/g, function (char) {
		return String.fromCodePoint(char.codePointAt(0), 818);
	});
}
function asciiBoldUnderlineText(text) {
	return text.replace(/[A-Za-z]/g, function (char) {
		let diff;
		if (/[0-9]/.test(char)) {
			diff = "𝟬".codePointAt(0) - "0".codePointAt(0);
		} else if (/[A-Z]/.test(char)) {
			diff = "𝗔".codePointAt(0) - "A".codePointAt(0);
		} else {
			diff = "𝗮".codePointAt(0) - "a".codePointAt(0);
		}
		return String.fromCodePoint(char.codePointAt(0) + diff, 818);
	});
}

function asciiItalicUnderlineText(text) {
	return text.replace(/[A-Za-z]/g, function (char) {
		let diff;
		if (/[A-Z]/.test(char)) {
			diff = "𝘈".codePointAt(0) - "A".codePointAt(0);
		} else {
			diff = "𝘢".codePointAt(0) - "a".codePointAt(0);
		}
		return String.fromCodePoint(char.codePointAt(0) + diff, 818);
	});
}
