var app, siteroot, apphome, themeprefix;

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
	const a = (s * Math.min(l, 1 - l)) / 100;
	const f = (n) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
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

	// r = (255 - r).toString(16);
	// g = (255 - g).toString(16);
	// b = (255 - b).toString(16);
	// return "#" + padZero(r) + padZero(g) + padZero(b);

	return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#444444" : "#FFFFFF";
}

toggleUserProperty = function (property, onsuccess = null) {
	app = $("#application");
	siteroot = app.data("siteroot");
	apphome = siteroot + app.data("apphome");
	console.log("Saving: " + property);
	jQuery.ajax({
		url:
			apphome +
			"/components/userprofile/toggleprofileproperty.html?field=" +
			property,
		success: function () {
			if (onsuccess) onsuccess();
		},
	});
};

saveProfileProperty = function (property, value, onsuccess = null) {
	app = $("#application");
	siteroot = app.data("siteroot");
	apphome = siteroot + app.data("apphome");

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
	apphome = siteroot + app.data("apphome");

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
	apphome = siteroot + app.data("apphome");

	jQuery.ajax({
		url: apphome + "/components/session/getvalue.html?key=" + key,
		async: false,
		success: function (data) {
			returnval = data;
		},
	});

	return returnval;
};

findClosest = function (link, inid) {
	var result = link.closest(inid);
	if (result.length == 0) {
		result = link.children(inid);
		if (result.length == 0) {
			result = $(inid);
		}
	}
	return result.first();
};

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
	var top = $(window).height() - elm.offset().top - offset;
	top = Math.max(top, 400);
	target.css("height", top + "px");
}

function resizeColumns() {
	var windowh = $(window).height();

	//togglers always screen height
	var coltogglers = $(".col-sidebar-togglers");
	coltogglers.css("height", windowh - 1);
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
		//var wt = ctree.width();
		//cfilter.width(w-wt-12);
		//cfilter.height(h);
		//ctree.height(h);
	} else {
		ctree.removeClass("widesidebar");
		cfilter.removeClass("widesidebar");
		//cfilter.width(w-12);
		//ctree.height('250');
		//cfilter.height(h-300);
	}
	//console.log(h);
}

function adjustDataManagerTable() {
	if ($(".datamanagertable").length) {
		var height = $(window).height();
		$(".datamanagertable").height(height - 320);
	}
}

jQuery(window).on("resize", function () {
	adjustDataManagerTable();
	resizeSearchCategories();
	resizeColumns();
});

adjustZIndex = function (element) {
	var zIndex = 100000;
	setTimeout(function () {
		var adjust = 0;
		if (element.hasClass("modalmediaviewer")) {
			$(".modal:visible").css("z-index", zIndex);
			$(".modal:visible").off();
			$(".modal:visible").addClass("behind");
			$(".modal:visible").hide();
		} else {
			$(".modalmediaviewer").css("z-index", zIndex);
			$(".modal:visible").css("z-index", zIndex - 1); //reset others?
			$(".modal-backdrop")
				.not(".modal-stack")
				.css("z-index", zIndex - 1)
				.addClass("modal-stack");
		}
		adjust = 1 + 1 * $(".modal:visible").length;
		element.css("z-index", zIndex + adjust);
		$(".onfront").removeClass("onfront");
		element.show();
		element.addClass("onfront");

		$(window).trigger("resize");
	});
};
focusInput = function (input) {
	//console.log(input);
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

lQuery("form").livequery(function () {
	var modal = $(this).closest(".modal");
	if (modal.length === 0) {
		return;
	}
	var input = $(this).find("input[autofocus]:visible:first");
	var focused = focusInput(input);
	if (!focused) {
		var $this = $(this);
		setTimeout(function () {
			focusInput($this.find("input:visible:first"));
		});
	}
});

document.onkeydown = function (event) {
	if (event.ctrlKey) {
		var href = document.querySelector("a#oeselector").href;
		if (event.key == "r") {
			event.preventDefault();
			href = href.replace(
				"components/toolbar/plugintoolbar",
				"views/filemanager/clearpagemanager"
			);
			window.location.href = href;
		} else if (event.key == "d") {
			event.preventDefault();
			var mode = document.querySelector(".openeditdebug") ? "preview" : "debug";
			href = href.replace(
				"components/toolbar/plugintoolbar",
				`views/workflow/mode/view${mode}`
			);
			jQuery.get(href);
		}
	}
};
