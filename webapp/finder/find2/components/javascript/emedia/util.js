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



saveProfileProperty = function (property, value, onsuccess = null) {
	app = $("#application");
	siteroot = app.data("siteroot");
	apphome = siteroot + app.data("apphome");
	
	var data = app.cleandata();
	data.oemaxlevel = 1;
	data.propertyfield = property;
	data['property.value'] = value;
	
	jQuery.ajax({
		url:
		apphome +"/components/userprofile/saveprofileproperty.html",
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
