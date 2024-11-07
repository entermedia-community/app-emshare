//EM Media Finder
var lwt;
var lwht;
var trackKeydown = false;
var exitWarning = false;
var siteroot;
var apphome;

$.fn.cleandata = function () {
	var element = $(this);
	var params = element.data();

	var cleaned = {};
	Object.keys(params).forEach(function (key) {
		var param = params[key];
		var thetype = typeof param;
		if (thetype === "string" || thetype === "number" || thetype === "boolean") {
			cleaned[key] = param;
		}
	});
	return cleaned;
};

formatHitCountResult = function (inRow) {
	return inRow[1];
};

function getRandomColor() {
	var letters = "0123456789ABCDEF".split("");
	var color = "#";
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function getScriptIfNotLoaded(scriptLocationAndName) {
	var len = $('script[src*="' + scriptLocationAndName + '"]').length;

	//script already loaded!
	if (len > 0) return;

	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = scriptLocationAndName;
	head.appendChild(script);
}

findalldata = function (inlink) {
	var item = $(inlink);
	var options = item.data();
	var parent = item;
	do {
		parent = parent.parent().closest(".domdatacontext");
		var moreoptions = parent.data();
		$.each(moreoptions, function (key, value) {
			if (!options[key]) {
				options[key] = value;
			}
		});
	} while (parent.length > 0);

	return options;
};

var toastTO;

$(window).on("showToast", function (_, anchor) {
	if (!anchor || typeof anchor.data != "function") return;
	var uid = Date.now();
	anchor.data("uid", uid);
	console.log(anchor);
	console.log("created uid:" + uid);
	var toastMessage = anchor.data("toastmessage");
	var toastSuccess = anchor.data("toastsuccess");
	var toastError = anchor.data("toasterror");
	if (!toastSuccess) {
		toastSuccess = toastMessage ? "Done!" : "Loaded!";
	}
	if (!toastError) {
		toastError = toastMessage ? "Failed!" : "Error processing the request";
	}
	if (!toastMessage) {
		toastMessage = "Loading...";
	}
	var toast = $(
		'<div class="toastContainer" role="alert" data-uid="' +
			uid +
			'"><div class="toastLoader"></div><div class="toastMessage" data-success="' +
			toastSuccess +
			'"  data-error="' +
			toastError +
			'">' +
			toastMessage +
			"</div><div class='toastClose'>&times;</div></div>"
	);
	toastTO = setTimeout(function () {
		$(".toastList").append(toast);
	}, 500);
});

lQuery(".toastClose").livequery("click", function () {
	var toast = $(this).closest(".toastContainer");
	toast.addClass("hide");
});

function destroyToast(toast, success = true) {
	clearTimeout(toastTO);
	if (!toast) return;
	var msg = toast.find(".toastMessage").data(success ? "success" : "error");
	toast
		.find(".toastLoader")
		.replaceWith(
			success
				? '<div class="toastSuccess"></div>'
				: '<div class="toastError"></div>'
		);
	toast.find(".toastMessage").text(msg);
	setTimeout(function () {
		toast.addClass("hide");
	}, 2000);
}

lQuery(".toastContainer.hide").livequery(function () {
	setTimeout(function () {
		$(this).remove();
	}, 500);
});

$(window).on("successToast", function (_, anchor) {
	var uid = anchor.data("uid");
	console.log(anchor);
	console.log("successfully removing uid:" + uid);
	var toast = $(".toastContainer[data-uid='" + uid + "']");
	destroyToast(toast);
});
$(window).on("errorToast", function (_, anchor) {
	var uid = anchor.data("uid");
	console.log(anchor);
	console.error("unsuccessfully removing uid:" + uid);
	var toast = $(".toastContainer[data-uid='" + uid + "']");
	destroyToast(toast, false);
});

runajaxonthis = function (inlink, e) {
	$(".ajaxprogress").show();
	var inText = $(inlink).data("confirm");
	if (e && inText && !confirm(inText)) {
		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	inlink.attr("disabled", "disabled");

	if (inlink.hasClass("activelistener")) {
		$(".activelistener").removeClass("active");
		inlink.addClass("active");
	}
	//for listeners in a container
	if (inlink.hasClass("activelistenerparent")) {
		var listenerparent = inlink.closest(".activelistcontainer");
		if (listenerparent.length > 0) {
			listenerparent.siblings().removeClass("active");
			listenerparent.addClass("active");
		}
	}

	var nextpage = inlink.attr("href");
	if (!nextpage) {
		nextpage = inlink.data("nextpage");
	}

	var options = $(inlink).data();
	if (options.isEmptyObject || $(inlink).data("findalldata")) {
		options = findalldata(inlink);
	}

	var targetDiv = inlink.data("targetdiv");
	var replaceHtml = true;

	var targetDivInner = inlink.data("targetdivinner");
	if (targetDivInner) {
		targetDiv = targetDivInner;
		replaceHtml = false;
	}

	var useparent = inlink.data("useparent");
	var activemenu;
	if (inlink.hasClass("auto-active-link")) {
		activemenu = inlink;
	} else if (inlink.data("autoactivecontainer")) {
		activemenu = $("." + inlink.data("autoactivecontainer"));
	}
	if (activemenu !== undefined && activemenu.length > 0) {
		var container = activemenu.closest(".auto-active-container");
		if (container.length == 0) {
			container = activemenu.parent().parent();
		}

		jQuery(".auto-active-row", container).removeClass("current");
		var row = activemenu.closest(".auto-active-row");
		row.addClass("current");

		jQuery("li", container).removeClass("current");
		var row = activemenu.closest("li");
		row.addClass("current");
	}

	var inlinkmodal = inlink.closest(".modal");

	if (targetDiv) {
		inlink.css("cursor", "wait");
		$("body").css("cursor", "wait");

		targetDiv = targetDiv.replace(/\//g, "\\/");

		//before ajaxcall
		if (inlink.data("onbefore")) {
			var onbefore = inlink.data("onbefore");
			var fnc = window[onbefore];
			if (fnc && typeof fnc === "function") {
				//make sure it exists and it is a function
				fnc(inlink); //execute it
			}
		}

		if (!targetDiv.startsWith("#") && !targetDiv.startsWith(".")) {
			targetDiv = "#" + targetDiv;
		}

		$(window).trigger("showToast", [inlink]);
		var toastUid = $(inlink).data("uid");
		jQuery
			.ajax({
				url: nextpage,
				data: options,
				success: function (data) {
					inlink.data("uid", toastUid);
					$(window).trigger("successToast", [inlink]);
					var cell;
					if (useparent && useparent == "true") {
						cell = $("#" + targetDiv, window.parent.document);
					} else {
						cell = findclosest(inlink, targetDiv);
					}
					var onpage;
					var newcell;
					if (replaceHtml) {
						//Call replacer to pull $scope variables
						onpage = cell.parent();
						cell.replaceWith(data); //Cant get a valid dom element
						newcell = findclosest(onpage, targetDiv);
					} else {
						onpage = cell;
						cell.html(data);
						newcell = onpage.children(":first");
					}
					$(window).trigger("setPageTitle", [newcell]);

					//on success execute extra JS
					if (inlink.data("onsuccess")) {
						var onsuccess = inlink.data("onsuccess");
						var fnc = window[onsuccess];
						if (fnc && typeof fnc === "function") {
							//make sure it exists and it is a function
							fnc(inlink); //execute it
						}
					}

					$(window).trigger("checkautoreload", [inlink]);

					//actions after autoreload?
					var message = inlink.data("alertmessage");
					if (message) {
						$("body").append(
							'<div class="alert alert-success fader alert-save">' +
								message +
								"</div>"
						);
					}
				},
				error: function () {
					inlink.data("uid", toastUid);
					$(window).trigger("errorToast", [inlink]);
				},
				type: "POST",
				dataType: "text",
				xhrFields: {
					withCredentials: true,
				},
				crossDomain: true,
			})
			.always(function () {
				var scrolltotop = inlink.data("scrolltotop");
				if (scrolltotop) {
					window.scrollTo(0, 0);
				}

				$(".ajaxprogress").hide();
				//inlink.css("enabled",true);
				inlink.removeAttr("disabled");

				//Close All Dialogs
				var closealldialogs = inlink.data("closealldialogs");
				if (closealldialogs) {
					closeallemdialogs();
				} else {
					//Close Dialog
					var closedialog = inlink.data("closedialog");
					if (closedialog && inlinkmodal != null) {
						closeemdialog(inlinkmodal);
					}
					//Close MediaViewer
					var closemediaviewer = inlink.data("closemediaviewer");
					if (closemediaviewer) {
						var overlay = $("#hiddenoverlay");
						if (overlay.length) {
							hideOverlayDiv(overlay);
						}
					}
				}
				//Close Navbar if exists
				var navbar = inlink.closest(".navbar-collapse");
				if (navbar) {
					navbar.collapse("hide");
				}

				$(window).trigger("resize");

				inlink.css("cursor", "");
				$("body").css("cursor", "");

				if (
					typeof global_updateurl !== "undefined" &&
					global_updateurl == false
				) {
					//globaly disabled updateurl
				} else {
					var updateurl = inlink.data("updateurl");
					if (updateurl) {
						//console.log("Saving state ", updateurl);
						history.pushState($("#application").html(), null, nextpage);
					}
				}
			});
	}
};
runajax = function (e) {
	e.stopPropagation();
	e.preventDefault();
	runajaxonthis($(this), e);
	return false;
};

lQuery(".reloadpage").livequery(function () {
	window.location.reload();
});
lQuery(".redirecttopage").livequery(function () {
	var url = $(this).data("redirectok");
	window.location.href = url;
});

uiload = function () {
	var app = jQuery("#application");
	siteroot = app.data("siteroot");
	apphome = app.data("apphome");
	var themeprefix = app.data("themeprefix");
	if (siteroot !== undefined) {
		//legacy siteroot
		apphome = siteroot + apphome;
		themeprefix = siteroot + themeprefix;
	}
	var mediadb = $("#application").data("mediadbappid");

	if ($.fn.tablesorter) {
		$("#tablesorter").tablesorter();
	}
	if ($.fn.selectmenu) {
		lQuery(".uidropdown select").livequery(function () {
			$(this).selectmenu({
				style: "dropdown",
			});
		});
	}

	lQuery("a.ajax").livequery("click", runajax);

	var browserlanguage = app.data("browserlanguage");
	if (browserlanguage == undefined || browserlanguage == "") {
		browserlanguage = "en";
	}

	lQuery("input.datepicker").livequery("mousedown", function () {
		var trigger = $(this).parent().find(".ui-datepicker-trigger");
		trigger.trigger("click");
	});
	lQuery("input.datepicker").livequery(function () {
		if ($.datepicker) {
			var dpicker = $(this);
			$.datepicker.setDefaults($.datepicker.regional[browserlanguage]);
			$.datepicker.setDefaults(
				$.extend({
					showOn: "button",
					buttonImage:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23444444' class='bi bi-calendar-plus' viewBox='0 0 16 16'%3E%3Cpath d='M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7'/%3E%3Cpath d='M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z'/%3E%3C/svg%3E",
					buttonImageOnly: true,
					changeMonth: true,
					changeYear: true,
					yearRange: "1900:2050",
				})
			); // Move this to the Layouts?

			var targetid = dpicker.data("targetid");
			dpicker.datepicker({
				altField: "#" + targetid,
				altFormat: "yy-mm-dd",
				yearRange: "1900:2050",
				beforeShow: function (input, inst) {
					setTimeout(function () {
						$("#ui-datepicker-div").css("z-index", 100100);
						$("#application").append($("#ui-datepicker-div"));
						// var quickSelect = $("#operationentitydatefindercatalog");
						// quickSelect.css("display", "block");
						// $("#ui-datepicker-div").append(quickSelect);
						//Fix Position if in bootstrap modal
						var modal = $("#modals");
						if (modal.length) {
							var modaltop = $("#modals").offset().top;
							if (modaltop) {
								var dpickertop = dpicker.offset().top;
								dpickertop = dpickertop - modaltop;
								var dpHeight = inst.dpDiv.outerHeight();
								var inputHeight = inst.input ? inst.input.outerHeight() : 0;
								var viewHeight = document.documentElement.clientHeight;
								if (dpickertop + dpHeight + inputHeight > viewHeight) {
									dpickertop = dpickertop - dpHeight;
								}
								inst.dpDiv.css({
									top: dpickertop + inputHeight,
								});
							}
						}
					}, 0);
				},
			});

			var current = $("#" + targetid).val();
			if (current != undefined) {
				// alert(current);
				var date;
				if (current.indexOf("-") > 0) {
					// this is the standard
					current = current.substring(0, 10);
					// 2012-09-17 09:32:28 -0400
					date = $.datepicker.parseDate("yy-mm-dd", current);
				} else {
					date = $.datepicker.parseDate("mm/dd/yy", current); // legacy
				}
				$(this).datepicker("setDate", date);
			}
			$(this).blur(function () {
				var val = $(this).val();
				if (val == "") {
					$("#" + targetid).val("");
				}
			});
		} //datepicker
	});

	if ($.fn.minicolors) {
		lQuery(".color-picker").livequery(function () {
			$(this).minicolors({
				defaultValue: "",
				letterCase: "uppercase",
			});
		});
	}

	lQuery(".focusme").livequery(function () {
		$(this).focus();
	});

	lQuery("#module-dropdown").livequery("click", function (e) {
		e.stopPropagation();
		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
			$("#module-list").hide();
		} else {
			$(this).addClass("active");
			$("#module-list").show();
		}
	});

	lQuery("select.select2").livequery(function () {
		var theinput = $(this);
		var dropdownParent = theinput.data("dropdownparent");
		if (dropdownParent && $("#" + dropdownParent).length) {
			dropdownParent = $("#" + dropdownParent);
		} else {
			dropdownParent = $(this).parent();
		}
		var parent = theinput.closest("#main-media-container");
		if (parent.length) {
			dropdownParent = parent;
		}
		var parent = theinput.parents(".modal-content");
		if (parent.length) {
			dropdownParent = parent;
		}
		var allowClear = $(this).data("allowclear");
		if (allowClear == undefined) {
			allowClear = true;
		}
		var placeholder = $(this).data("placeholder");
		if (placeholder == undefined) {
			placeholder = "";
		}
		if ($.fn.select2) {
			theinput.select2({
				allowClear: allowClear,
				placeholder: placeholder,
				dropdownParent: dropdownParent,
			});
		}

		theinput.on("select2:open", function (e) {
			var selectId = $(this).attr("id");
			if (selectId) {
				$(
					".select2-search__field[aria-controls='select2-" +
						selectId +
						"-results']"
				).each(function (key, value) {
					value.focus();
				});
			} else {
				document
					.querySelector(".select2-container--open .select2-search__field")
					.focus();
			}
		});
	});
	/*
	$(".select2simple").select2({
		 minimumResultsForSearch: Infinity
	});
	*/
	lQuery("select.listdropdown").livequery(function () {
		var theinput = $(this);
		var dropdownParent = theinput.data("dropdownparent");
		if (dropdownParent && $("#" + dropdownParent).length) {
			dropdownParent = $("#" + dropdownParent);
		} else {
			dropdownParent = $(this).parent();
		}
		var parent = theinput.closest("#main-media-container");
		if (parent.length) {
			dropdownParent = parent;
		}
		var parent = theinput.parents(".modal-content");
		if (parent.length) {
			dropdownParent = parent;
		}

		//console.log(theinput.attr("id")+"using: "+dropdownParent.attr("id"));
		var placeholder = theinput.data("placeholder");
		if (!placeholder) {
			placeholder = "";
		}
		var allowClear = theinput.data("allowclear");

		if (allowClear == undefined) {
			allowClear = true;
		}
		if ($.fn.select2) {
			theinput = theinput.select2({
				placeholder: placeholder,
				allowClear: allowClear,
				minimumInputLength: 0,
				dropdownParent: dropdownParent,
			});
		}
		theinput.on("change", function (e) {
			//console.log("XX changed")
			if (theinput.hasClass("uifilterpicker")) {
				var selectedids = theinput.val();
				if (selectedids) {
					//console.log("XX has class" + selectedids);
					var parent = theinput.closest(".filter-box-options");
					//console.log(parent.find(".filtercheck"));
					parent.find(".filtercheck").each(function () {
						var filter = $(this);
						filter.prop("checked", false); //remove?
					});
					for (i = 0; i < selectedids.length; i++) {
						//$entry.getId()${fieldname}_val
						var selectedid = selectedids[i];
						var fieldname = theinput.data("fieldname");
						var targethidden = $("#" + selectedid + fieldname + "_val");
						targethidden.prop("checked", true);
					}
				}
			}
		});

		theinput.on("select2:open", function (e) {
			var selectId = $(this).attr("id");
			if (selectId) {
				$(
					".select2-search__field[aria-controls='select2-" +
						selectId +
						"-results']"
				).each(function (key, value) {
					value.focus();
				});
			} else {
				document
					.querySelector(".select2-container--open .select2-search__field")
					.focus();
			}
		});
	});

	lQuery(".select2editable").livequery(function () {
		var input = $(this);
		var arr = new Array(); // [{id: 0, text: 'story'},{id: 1, text:
		// 'bug'},{id: 2, text: 'task'}]

		var options = $(this).find("option");

		if (!options.length) {
			//			return;
		}

		options.each(function () {
			var id = $(this).data("value");
			var text = $(this).text();
			//console.log(id + " " + text);
			arr.push({
				id: id,
				text: text,
			});
		});

		// Be aware: calling select2 forces livequery to filter again
		if ($.fn.select2) {
			input
				.select2({
					createSearchChoice: function (term, data) {
						if (
							$(data).filter(function () {
								return this.text.localeCompare(term) === 0;
							}).length === 0
						) {
							//console.log("picking" + term);
							return {
								id: term,
								text: term,
							};
						}
					},
					multiple: false,
					tags: true,
				})
				.on("select2:select", function (e) {
					var thevalue = $(this).val();
					if (thevalue != "" && $(this).hasClass("autosubmited")) {
						var theform = $(this).parent("form");
						if (theform.hasClass("autosubmitform")) {
							theform.trigger("submit");
						}
					}
				});
		}

		input.on("select2:open", function (e) {
			var selectId = $(this).attr("id");
			if (selectId) {
				$(
					".select2-search__field[aria-controls='select2-" +
						selectId +
						"-results']"
				).each(function (key, value) {
					value.focus();
				});
			} else {
				document
					.querySelector(".select2-container--open .select2-search__field")
					.focus();
			}
		});
	});

	lQuery("select.ajax").livequery("change", function (e) {
		var inlink = $(this);
		var nextpage = inlink.data("href");
		nextpage = nextpage + inlink.val();
		var targetDiv = inlink.data("targetdiv");
		if (!targetDiv) {
			targetDiv = inlink.attr("targetdiv");
		}

		var options = inlink.data();
		options[inlink.attr("name")] = inlink.val();
		$.get(nextpage, options, function (data) {
			if (targetDiv) {
				var cell = $("#" + targetDiv);
				cell.html(data);
			} else {
				if (!targetDiv) {
					targetDiv = inlink.data("targetdivinner");
					var cell = $("#" + targetDiv);
					cell.replaceWith(data);
				}
			}
			$(window).trigger("resize");
		});
	});

	lQuery("a.toggle-visible").livequery("click", function (e) {
		e.preventDefault();
		var div = $(this).data("targetdiv");
		var target = $("#" + div);
		if (target.is(":hidden")) {
			var hidelable = $(this).data("hidelabel");
			$(this).find("span").text(hidelable);
			target.show();
		} else {
			var showlabel = $(this).data("showlabel");
			$(this).find("span").text(showlabel);
			target.hide();
		}
	});
	function humanFileSize(bytes) {
		var thresh = 1000;
		if (Math.abs(bytes) < thresh) {
			return bytes + " B";
		}
		var units = ["kB", "MB", "GB", "TB"];
		var u = -1;
		do {
			bytes /= thresh;
			++u;
		} while (
			Math.round(Math.abs(bytes) * 10) / 10 >= thresh &&
			u < units.length - 1
		);
		return bytes.toFixed(1) + " " + units[u];
	}
	lQuery(".autoFileSize").livequery(function () {
		var size = $(this).text();
		size = parseInt(size);
		if (!isNaN(size)) {
			$(this).text(humanFileSize(size));
		}
	});

	// deprecated, use data-confirm
	lQuery(".confirm").livequery("click", function (e) {
		if ($(this).hasClass("ajax")) {
			return;
		}
		var inText = $(this).data("confirm");
		if (!inText) {
			inText = "Are you sure?";
		}
		if (confirm(inText)) {
			return;
		} else {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	});

	lQuery(".uibutton").livequery(function () {
		$(this).button();
	});

	lQuery(".fader").livequery(function () {
		var _this = $(this);
		if (_this.hasClass("alert-save")) {
			_this.prepend('<span class="bi bi-check-circle-fill ns"></span>');
			_this.append('<button><span class="bi bi-x-circle ns"></span>');
		} else if (_this.hasClass("alert-error")) {
			_this.prepend('<span class="bi bi-info-circle-fill ns"></span>');
			_this.append('<button><span class="bi bi-x ns"></span>');
		}
		var timeout = 4000;
		if (_this.hasClass("fade-quick")) {
			timeout = 2000;
		}
		setTimeout(function () {
			_this.fadeOut(500, function () {
				_this.remove();
			});
		}, timeout);
		_this.find("button").click(function () {
			_this.fadeOut(500, function () {
				_this.remove();
			});
		});
	});

	lQuery(".uipanel").livequery(function () {
		$(this).addClass("ui-widget");
		var header = $(this).attr("header");
		if (header != undefined) {
			// http://dev.$.it/ticket/9134
			$(this).wrapInner('<div class="ui-widget-content"/>');
			$(this).prepend('<div class="ui-widget-header">' + header + "</div>");
		}
	});

	lQuery(".ajaxchange select").livequery(function () {
		var select = $(this);
		var div = select.parent(".ajaxchange");
		var url = div.attr("targetpath");
		var divid = div.attr("targetdiv");

		select.change(function () {
			var url2 = url + $(this).val();
			$("#" + divid).load(url2);
		});
	});

	lQuery("form.ajaxform").livequery(
		"submit", // Make sure you use
		// $(this).closest("form").trigger("submit")
		function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			e.stopPropagation();

			var warning = $(this).data("warning");
			if (warning && !confirm(warning)) {
				return;
			}

			if (typeof CKEDITOR !== "undefined") {
				for (instance in CKEDITOR.instances) {
					var editor = CKEDITOR.instances[instance];
					var div = $(editor.element.$);
					var id = div.data("saveto");
					var tosave = $("#" + id);
					//editor.updateElement() //does not work
					var data = editor.getData();
					tosave.val(data);
				}
			}

			var form = $(this);

			if (!form.hasClass("novalidate")) {
				if (form.validate) {
					try {
						form.validate({
							ignore: ".ignore",
						});
						var isvalidate = form.valid();
						if (!isvalidate) {
							e.preventDefault();
							return;
						}
					} catch (_) {
						console.log(e);
					}
				}
			}
			var targetdiv_ = form.data("targetdiv");
			if (targetdiv_ === undefined) {
				targetdiv_ = form.attr("targetdiv");
			}
			if (targetdiv_ === undefined) {
				targetdiv_ = form.data("targetdivinner");
			}
			var targetdiv = $("#" + $.escapeSelector(targetdiv_));
			if (!targetdiv.length) {
				targetdiv = $("." + $.escapeSelector(targetdiv_));
			}
			if (form.attr("action") == undefined) {
				var action = targetdiv.data("saveaction");
				if (action == undefined) {
					action = form.data("defaultaction");
				}
				form.attr("action", action);
			}

			if (form.hasClass("showwaiting")) {
				var apphome = app.data("siteroot") + app.data("apphome");
				var showwaitingtarget = targetdiv;
				if (form.data("showwaitingtarget")) {
					showwaitingtarget = form.data("showwaitingtarget");
					showwaitingtarget = $("#" + $.escapeSelector(showwaitingtarget));
				}
				showwaitingtarget.html(
					'<img src="' + apphome + '/theme/images/ajax-loader.gif">'
				);
				showwaitingtarget.show();
			}

			var oemaxlevel = targetdiv.data("oemaxlevel");
			if (oemaxlevel == undefined) {
				oemaxlevel = form.data("oemaxlevel");
			}
			if (oemaxlevel == undefined) {
				oemaxlevel = 1;
			}
			//targetdiv.data("oemaxlevel", oemaxlevel);

			var data = {};
			if (form.data("includesearchcontext") == true) {
				data = jQuery("#resultsdiv").data();
				data.oemaxlevel = oemaxlevel;
			} else {
				if (targetdiv.data() !== undefined) {
					//data = targetdiv.data();
				}
			}

			data.oemaxlevel = oemaxlevel;

			var formmodal = form.closest(".modal");

			var submitButton = form.find('button[type="submit"]');
			if (submitButton.length == 0) {
				submitButton = form.find('input[type="submit"]');
			}
			submitButton.attr("disabled", "disabled");
			submitButton.append("<i class='fa fa-spinner fa-spin ml-2'></i>");

			$(window).trigger("showToast", [form]);
			var toastUid = $(form).data("uid");
			form.ajaxSubmit({
				data: data,
				xhrFields: {
					withCredentials: true,
				},
				crossDomain: true,
				success: function (result) {
					form.data("uid", toastUid);
					$(window).trigger("successToast", [form]);
					$(window).trigger("checkautoreload", [form]);
					if (showwaitingtarget !== undefined) {
						showwaitingtarget.hide();
					}

					var pickertarget = form.data("pickertarget");
					var targettype = form.data("targettype");
					if (pickertarget !== undefined && targettype == "entitypickerfield") {
						var parsed = $(result);
						var dataid = parsed.data("dataid");
						var dataname = parsed.data("dataname");

						$(window).trigger("updatepickertarget", [
							pickertarget,
							dataid,
							dataname,
						]);
					}

					var targetdivinner = form.data("targetdivinner");
					if (targetdivinner) {
						$("#" + $.escapeSelector(targetdivinner)).html(result);
					} else {
						if (targetdiv) {
							targetdiv.replaceWith(result);
						}
					}
					if (formmodal.length > 0 && form.hasClass("autocloseform")) {
						if (formmodal.modal) {
							closeemdialog(formmodal);
						}
					}

					//Entity Back Btn
					formsavebackbutton(form);

					//who uses this?
					$("#resultsdiv").data("reloadresults", true);

					//TODO: Move this to results.js
					if (form.hasClass("autohideOverlay")) {
						hideOverlayDiv(getOverlay());
					}

					if (form.hasClass("autoreloadsource")) {
						//TODO: Use ajaxreloadtargets
						var link = form.data("openedfrom");
						if (link) {
							window.location.replace(link);
						}
					}
					$(window).trigger("resize");

					//on success execute extra JS
					if (form.data("onsuccess")) {
						var onsuccess = form.data("onsuccess");
						var fnc = window[onsuccess];
						if (fnc && typeof fnc === "function") {
							//make sure it exists and it is a function
							fnc(form); //execute it
						}
					}

					//experimental
					if (form.data("onsuccessreload")) {
						document.location.reload(true);
					}
				},
				error: function (data) {
					form.data("uid", toastUid);
					$(window).trigger("errorToast", [form]);
					if (targetdiv) {
						$("#" + $.escapeSelector(targetdiv)).html(data);
					}
					form.append(data);
				},
				complete: function () {
					submitButton.removeAttr("disabled");
					submitButton.find(".fa-spinner").remove();
				},
			});

			var reset = form.data("reset");
			if (reset == true) {
				form.get(0).reset();
			}

			if (
				typeof global_updateurl !== "undefined" &&
				global_updateurl == false
			) {
				//globaly disabled updateurl
			} else {
				//Update Address Bar
				var updateurl = form.data("updateurl");
				if (updateurl) {
					//serialize and attach
					var params = form.serialize();
					var url = form.attr("action");
					url += (url.indexOf("?") >= 0 ? "&" : "?") + params;
					history.pushState($("#application").html(), null, url);
					window.scrollTo(0, 0);
				}
			}
			return false;
		}
	);

	lQuery("form.autosubmit").livequery(function () {
		var form = $(this);

		$("select", form).change(function (e) {
			e.stopPropagation();
			$(form).trigger("submit");
		});
		/* Todo: use onblur
		$("input", form).on("focusout", function (event) {
			$(form).trigger("submit");
		});
		*/
		$("input", form).on("keyup", function (e) {
			//Enter Key handled by default the submit
			if (e.keyCode == 13) {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			$(form).trigger("submit");
		});
		$(
			'input[type="file"],input[name="date.after"],input[type="checkbox"]',
			form
		).on("change", function (e) {
			e.stopPropagation();
			$(form).trigger("submit");
		});
	});

	lQuery("select.ajaxautosubmitselect").livequery(function () {
		var select = $(this);
		select.change(function () {
			var targetdiv = select.data("targetdiv");
			var link = select.data("url");
			var param = select.data("parametername");

			var url = link + "?" + param + "=" + select.val();

			var options = select.data();
			$("#" + targetdiv).load(url, options, function () {});
		});
	});

	lQuery("form.ajaxautosubmit").livequery(function () {
		var theform = $(this);
		theform.find("select").change(function () {
			theform.submit();
		});
	});

	lQuery(".submitform").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		console.log($(this).prop("disabled"));
		$(this).prop("disabled", true);
		var theform = $(this).closest("form");
		console.log($(this).prop("disabled"));

		var clicked = $(this);
		if (clicked.data("updateaction")) {
			var newaction = clicked.attr("href");
			theform.attr("action", newaction);
		}
		console.log("Submit Form " + theform);
		theform.trigger("submit");

		return false;
	});
	lQuery(".submitform").livequery("dblclick", function (e) {
		e.preventDefault();
		console.log("DblClick!");
	});
	lQuery(".submitform-oehtml, .dialogsubmitbtn").livequery(
		"click",
		function (e) {
			var theform = $(this).closest("form");
			if (theform.length == 0) {
				//dialog form?
				var dialogform = $(this).attr("form");
				theform = $("#" + dialogform);
			}
			if (theform.length) {
				e.preventDefault();
				e.stopImmediatePropagation();
				e.stopPropagation();

				theform.data("readytosubmit", "true");
				theform.find(".oehtmlinput").trigger("blur");
				theform.trigger("submit");
			}
		}
	);

	lQuery(".selectsubmitform").livequery("change", function (e) {
		e.preventDefault();
		var theform = $(this).closest("form");
		theform.trigger("submit");
	});

	lQuery(".quicksearch-toggler").livequery("click", function () {
		var navbar = $(this).data("target");
		$("#" + navbar).toggle();
	});

	lQuery(".quicksearchlinks").livequery("click", function () {
		closetypeaheadmodal();
		/*var modalparent = $(this).closest('.typeaheadmodal');
		modalparent.toggle();*/
	});

	lQuery(".clearallfilters").livequery("click", function () {
		closetypeaheadmodal();
	});

	function closetypeaheadmodal() {
		var modal = $(".typeaheadmodal");
		if (modal.length > 0) {
			modal.hide();
		}
		$("#searchinput").val("");
	}

	emdialog = function (dialog, event) {
		if (event) {
			event.stopPropagation();
		}
		var dialog = dialog;
		var hidescrolling = dialog.data("hidescrolling");

		var width = dialog.data("width");
		var maxwidth = dialog.data("maxwidth");
		var id = dialog.data("dialogid");
		if (!id) {
			id = "modals";
		}

		var modaldialog = $("#" + id);
		if (modaldialog.length == 0) {
			jQuery("#application").append(
				'<div class="modal" tabindex="-1" id="' +
					id +
					'" style="display:none" ></div>'
			);
			modaldialog = jQuery("#" + id);
		}
		var options = dialog.data();
		var link = dialog.attr("href");
		if (!link) {
			link = dialog.data("targetlink");
		}
		if (
			dialog.hasClass("entity-dialog") &&
			dialog.closest(".modal").length !== 0
		) {
			//link = link.replace("entity.html", "entitytab.html");
			options.oemaxlevel = 1;
		}
		var param = dialog.data("parameterdata");
		if (param) {
			var element = jQuery("#" + param);
			var name = element.prop("name");
			options[name] = element.val();
		}
		var openfrom = window.location.href;

		var searchpagetitle = "";

		$(window).trigger("showToast", [dialog]);
		var toastUid = dialog.data("uid");
		jQuery.ajax({
			xhrFields: {
				withCredentials: true,
			},
			crossDomain: true,
			url: link,
			data: options,
			success: function (data) {
				dialog.data("uiid", toastUid);
				$(window).trigger("successToast", [dialog]);
				//--Entities
				if (
					dialog.hasClass("entity-dialog") &&
					dialog.closest(".modal").length !== 0
				) {
					//find tab
					var tabid = dialog.data("tabid");
					if (!tabid) {
						tabid = "tab_metadata";
					}
					if (tabid) {
						var container = dialog.closest(".entity-body");
						var tabs = container.find(".entity-tab-content");
						if (tabs.length >= 10) {
							alert("Max Tabs Limit");
							return;
						}

						//open new entity
						var parent = container.closest(".entitydialog");
						container = dialog.closest(".entity-wraper");
						container.replaceWith(data);
						tabbackbutton(parent);
					}
				} else if (dialog.data("targetrendertype") == "entity") {
					var container = dialog.closest(".entity-wraper");
					var parent = dialog.closest(".entitydialog");
					container.replaceWith(data);
					tabbackbutton(parent);
				} else {
					modaldialog.html(data);
					if (width !== undefined) {
						if (width > $(window).width()) {
							width = $(window).width();
						}

						$(".modal-dialog", modaldialog).css("min-width", width + "px");
					}
					if (maxwidth) {
						$(".modal-dialog", modaldialog).css("max-width", maxwidth + "px");
					}

					var modalkeyboard = false;
					var modalbackdrop = true;
					if ($(".modal-backdrop").length) {
						modalbackdrop = false;
					}

					var modalinstance;
					if (modalkeyboard) {
						modalinstance = modaldialog.modal({
							closeExisting: false,
							show: true,
							backdrop: modalbackdrop,
						});
					} else {
						modalinstance = modaldialog.modal({
							keyboard: false,
							closeExisting: false,
							show: true,
							backdrop: modalbackdrop,
						});
					}

					var firstform = $("form", modaldialog);
					firstform.data("openedfrom", openfrom);
					// fix submit button
					var justok = dialog.data("cancelsubmit");
					if (justok != null) {
						$(".modal-footer #submitbutton", modaldialog).hide();
					} else {
						var id = $("form", modaldialog).attr("id");
						$("#submitbutton", modaldialog).attr("form", id);
					}
					var hidetitle = dialog.data("hideheader");
					if (hidetitle == null) {
						var title = dialog.attr("title");
						if (title == null) {
							title = dialog.text();
						}
						$(".modal-title", modaldialog).text(title);
					}
					var hidefooter = dialog.data("hidefooter");
					if (hidefooter != null) {
						$(".modal-footer", modaldialog).hide();
					}

					//backup url
					var currenturl = window.location.href;
					modalinstance.data("oldurlbar", currenturl);

					searchpagetitle = modaldialog.find("[data-setpagetitle]");

					modalinstance.on("hidden.bs.modal", function () {
						//on close execute extra JS -- Todo: Move it to closedialog()
						if (dialog.data("onclose")) {
							var onclose = dialog.data("onclose");
							var fnc = window[onclose];
							if (fnc && typeof fnc === "function") {
								//make sure it exists and it is a function
								fnc(dialog); //execute it
							}
						}

						closeemdialog($(this)); //Without this the asset Browse feature does not close all the way
						$(window).trigger("resize");
					});

					modalinstance.on("scroll", function () {
						//checkScroll();
					});

					adjustzindex(modalinstance);
				}

				if (
					typeof global_updateurl !== "undefined" &&
					global_updateurl == false
				) {
					//globaly disabled updateurl
				} else {
					//Update Address Bar
					var updateurl = dialog.data("updateurl");
					if (updateurl) {
						var urlbar = dialog.data("urlbar");
						if (!urlbar) {
							urlbar = link;
						}

						history.pushState($("#application").html(), null, urlbar);
						window.scrollTo(0, 0);
					}
				}

				if (searchpagetitle) {
					$(window).trigger("setPageTitle", [searchpagetitle]);
				}

				//on success execute extra JS
				if (dialog.data("onsuccess")) {
					var onsuccess = dialog.data("onsuccess");
					var fnc = window[onsuccess];
					if (fnc && typeof fnc === "function") {
						//make sure it exists and it is a function
						fnc(dialog); //execute it
					}
				}

				$(window).trigger("resize");
			},
			error: function () {
				dialog.data("uiid", toastUid);
				$(window).trigger("errorToast", [dialog]);
			},
		});

		$(modaldialog).on("shown.bs.modal", function () {
			trackKeydown = true;
			//adjustzindex($(this));
			var focuselement = modaldialog.data("focuson");
			if (focuselement) {
				//console.log(focuselement);
				var elmnt = document.getElementById(focuselement);
				elmnt.scrollIntoView();
			} else {
				var focusme = modaldialog.find(".focusme");
				if (focusme.length) {
					setTimeout(function () {
						focusme.focus();
					}, 1000);
				} else {
					$("form", modaldialog)
						.find("*")
						.filter(":input:visible:first")
						.focus();
				}
			}
		});

		$(modaldialog).on("hide.bs.modal", function (e) {
			trackKeydown = false;
			if (!$(this).hasClass("onfront")) {
				e.stopPropagation();
				e.stopImmediatePropagation();
				return;
			} else {
				if ($(".modal:visible").length > 0) {
					// restore the modal-open class to the body element, so that scrolling works
					// properly after de-stacking a modal.
					setTimeout(function () {
						$(document.body).removeClass("modal-open");
					}, 0);
				}
			}
		});

		//Close drodpown if exists
		if (dialog.closest(".dropdown-menu").length !== 0) {
			dialog.closest(".dropdown-menu").removeClass("show");
		}
		if (event) {
			event.preventDefault();
		}

		return false;
	}; //emdialog

	lQuery("a.openemdialog").livequery(function () {
		var link = $(this);
		//link[0].click();
		emdialog($(this), event);
		//link.trigger("click");
	});

	lQuery("a.emdialog").livequery("click", function (event) {
		emdialog($(this), event);
	});

	lQuery(".closemodal").livequery("click", function (event) {
		closeemdialog($(this).closest(".modal"));
	});

	lQuery("#closebutton").livequery("click", function (event) {
		closeemdialog($(this).closest(".modal"));
	});

	closeemdialog = function (modaldialog) {
		var oldurlbar = modaldialog.data("oldurlbar");

		if (modaldialog.modal) {
			modaldialog.modal("hide");
			modaldialog.remove();
		}
		//other modals?
		var othermodal = $(".modal");
		if (othermodal.length && !othermodal.is(":hidden")) {
			adjustzindex(othermodal);
		}

		$(window).trigger("hideLoader");
		$(window).trigger("setPageTitle", [othermodal]);

		if (oldurlbar !== undefined) {
			history.pushState($("#application").html(), null, oldurlbar);
		}
	};

	closeallemdialogs = function () {
		$(".modal").each(function () {
			var modaldialog = $(this);
			modaldialog.modal("hide");
			modaldialog.remove();
		});
		var overlay = $("#hiddenoverlay");
		if (overlay.length) {
			hideOverlayDiv(overlay);
		}
	};

	$(window).on("setPageTitle", function (event, element) {
		if (element === undefined) {
			element = $("#applicationcontent");
		}
		if (element === undefined || $(element).data("setpagetitle") == null) {
			element = $("#application");
		}
		var setpagetitle = $(element).data("setpagetitle");
		var titlepostfix = $("#application").data("titlepostfix");
		var title = "";
		if (setpagetitle) {
			title = setpagetitle;
		}
		if (titlepostfix) {
			title = title ? title + " - " + titlepostfix : titlepostfix;
		}
		document.title = title;
	});

	lQuery(".entitydialogback").livequery("click", function (event) {
		var link = $(this);
		event.preventDefault();
		var parentcontainerid = link.data("parentcontainerid");
		var parent = $("#" + parentcontainerid);
		if (parent.length) {
			var grandparent = parent.parent().closest(".entitydialog");
			var urlbar = parent.data("urlbar");
			autoreload(parent);
			tabbackbutton(grandparent);
			if (urlbar !== undefined) {
				history.pushState($("#application").html(), null, urlbar);
			}
		}
	});

	adjustzindex = function (element) {
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
		}, 0);
	};

	lQuery("a.triggerjs").livequery("click", function (event) {
		event.preventDefault();
		var link = $(this);
		var id = link.data("triggerid");
		var action = link.data("triggeraction");
		if (id) {
			$("#" + id).trigger(action); //callback?
		}
		return;
	});

	lQuery("a.entity-tab-label").livequery("click", function (event) {
		event.preventDefault();
		event.stopPropagation();
		entitytabclick($(this));
		return;
	});

	function entitytabclick(link) {
		if (link.data("isnewentity")) {
			return;
		}
		var tabid = link.data("tabid");
		var currenttab = link.data("currenttab");
		$(".entity-tab").removeClass("current-entity");
		link.closest(".entity-tab").addClass("current-entity");
		var topmoduleid = link.data("topmoduleid");
		var entityid = link.data("entityid");

		var options = link.data();
		options["oemaxlevel"] = 1;
		var url = link.attr("href");

		$.ajax({
			xhrFields: {
				withCredentials: true,
			},
			crossDomain: true,
			url: url,
			data: options,
			success: function (data) {
				$(".entity-tab-content").replaceWith(data);

				$(".entity-tab-content img")
					.last()
					.on("load", function () {
						$(window).trigger("resize");
					});
			},
		});
		/*
		var container = link.attr("href");
		container = $(container);
		container.data("currenttab", currenttab); //me
		$(".entity-tab-content").hide();
		*/

		var entitydialog = link.closest(".entitydialog");
		var entityshare = entitydialog.find(".entityshare");
		if (entityshare.length) {
			entityshare.data("entitytabopen", currenttab);
		}
		$(".entitytabactions").removeClass("enabledaction");
		var tabtype = link.data("tabtype");

		if (tabtype == "tabpublishing") {
			$(".tabactionpublishing").addClass("enabledaction");
		} else if (tabtype == "tabimport") {
			$(".tabactionimport").addClass("enabledaction");
		} else if (tabtype == "tabexport") {
			$(".tabactionexport").addClass("enabledaction");
		} else {
			saveProfileProperty(
				topmoduleid + "_entitytabopen",
				link.data("currenttab"),
				function () {}
			);
		}

		var url =
			apphome +
			"/views/modules/" +
			topmoduleid +
			"/index.html?entityid=" +
			entityid +
			"&entitytabopen=" +
			currenttab;
		history.pushState($("#application").html(), null, url);
	}

	lQuery("a.entity-tab-close").livequery("click", function (event) {
		event.preventDefault();
		if ($(".entity-tab").length > 1) {
			//only remove if more than one tab
			var tabcontainer = $(this).closest(".entity-tab");
			var open = $(".current-entity");
			if (open.data("entityid") == $(this).data("entityid")) {
				open = tabcontainer.prev();
			}
			if (open.length == 0) {
				open = tabcontainer.next();
			}
			var entityid = open.find(".entity-tab-label").data("entityid");
			$(".entity-tab").removeClass("current-entity");
			open.addClass("current-entity");
			tabcontainer.remove();
			$(
				'div[data-id="' + $(this).data("entityid") + '"].entity-tab-content'
			).remove();
			$(".entity-tab-content").hide();
			$('div[data-id="' + entityid + '"].entity-tab-content').show();
		} else {
			//close dialog
			closeemdialog($(this).closest(".modal"));
		}
	});

	$(window).on("keydown", function (e) {
		if (trackKeydown) {
			exitWarning = true;
		} else {
			exitWarning = false;
		}
	});

	function confirmModalClose(modal) {
		var checkForm = modal.find("form.checkCloseDialog");

		if (!checkForm) {
			closeemdialog(modal);
		} else {
			var prevent = false;
			$(checkForm)
				.find("input, textarea, select")
				.each(function () {
					if ($(this).attr("type") == "hidden") {
						return true;
					}
					var value = $(this).val();
					if (value) {
						prevent = value.length > 0;
						return false;
					}
				});

			if (prevent && exitWarning) {
				$("#exitConfirmationModal").css("display", "flex");
				return false;
			} else {
				closeemdialog(modal);
			}
			return false;
		}
		trackKeydown = false;
	}

	lQuery("form.checkCloseDialog").livequery(function () {
		var m = $(this).closest(".modal");
		if (m) {
			m.modal({
				backdrop: "static",
				keyboard: false,
			});
			m.on("click", function (e) {
				e.stopPropagation();
				e.stopImmediatePropagation();
				if (e.currentTarget === e.target) {
					confirmModalClose(m);
				}
			});
		}
	});

	lQuery("#closeExit").livequery("click", function () {
		$("#exitConfirmationModal").hide();
	});
	lQuery("#confirmExit").livequery("click", function () {
		$("#exitConfirmationModal").hide();
		closeallemdialogs();
	});

	$(document).on("click", ".modal", function (e) {
		e.stopPropagation();
		e.stopImmediatePropagation();
		if (e.target.classList.contains("modal")) {
			confirmModalClose($(this));
		}
	});

	lQuery(".entityclose").livequery("click", function (event) {
		event.preventDefault();
		var targetModal = $(this).closest(".modal");
		confirmModalClose(targetModal);
		$(window).trigger("hideLoader");
	});

	lQuery(".entitytabactions").livequery("click", function (event) {
		event.preventDefault();
		var link = $(this);
		var tabaction = link.data("tabtype");
		var uploadmedia = link.data("uploadmedia");
		var lightboxid = link.data("lightboxid");
		var tabsection = link.data("tabsection");
		var entity = link.closest(".entitydialog");
		entity.data("entitytabopen", tabaction);
		entity.data("uploadmedia", uploadmedia);
		entity.data("tabsection", tabsection);
		entity.data("lightboxid", lightboxid);
		var parent = entity.parent(".entitydialog");
		autoreload(entity);
		if (parent !== undefined) {
			tabbackbutton(parent);
		}
	});

	lQuery(".btn-savepublishing").livequery("click", function (event) {
		var form = $(this).closest("form");

		if ($("#wgEnabledLabel", form).is(":checked")) {
			$(".tabactionpublishing").addClass("statusenabled");
		} else {
			$(".tabactionpublishing").removeClass("statusenabled");
		}
	});

	var wgst;
	lQuery(".wg-autosave").livequery("change", function () {
		$(this).closest("form").submit();
		$("#wgAutoSaved").show();
		if (wgst) clearTimeout(wgst);
		wgst = setTimeout(function () {
			$("#wgAutoSaved").fadeOut();
		}, 2000);
	});

	lQuery(".autoopenemdialog").livequery(function () {
		emdialog($(this));
	});

	lQuery(".mediaboxheader").livequery("click", function (event) {
		event.preventDefault();
		var box = $(this).closest(".entity-media-box");
		box.toggleClass("collapsedmediabox");
		if (box.hasClass("collapsedmediabox")) {
			$(this)
				.find(".expandmediaboxicon")
				.removeClass("fa-caret-down")
				.addClass("fa-caret-right");
		} else {
			$(this)
				.find(".expandmediaboxicon")
				.removeClass("fa-caret-right")
				.addClass("fa-caret-down");
		}
	});

	function expandmediabox(item) {
		var box = item.closest(".entity-media-box");
		box.removeClass("collapsedmediabox");
		$(this)
			.find(".expandmediaboxicon")
			.removeClass("fa-caret-right")
			.addClass("fa-caret-down");
	}

	lQuery(".trim-text").livequery(function (e) {
		var text = $(this).text();
		var check = $(this).closest(".entitymetadatamodal");
		if (check.length > 0) {
			text = text.replace(/</g, "&lt;");
			text = text.replace(/>/g, "&gt;");
			text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
			$(this).html(text);
			return;
		}
		$(this).click(function (e) {
			if (
				e.target.classList.contains("see-more") ||
				e.target.classList.contains("see-less")
			) {
				e.stopPropagation();
			}
		});
		var maxLength = $(this).data("max");
		if (text.length <= maxLength) return;
		var minimizedText = text.substring(0, maxLength).trim();
		minimizedText = minimizedText.replace(/</gm, "&lt;");
		minimizedText = minimizedText.replace(/>/gm, "&gt;");
		minimizedText = minimizedText.replace(/(\r\n|\n|\r)/gm, "<br>");
		$(this).html(minimizedText);
		$(this).data("text", text);
		var btn = $(this).parent().find(".see-more");
		btn.html(btn.data("seemore"));
	});

	lQuery(".see-more-btn").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var textParent = $(this).prev(".trim-text");
		var text = textParent.data("text");
		if (!text) {
			$(this).remove();
			return;
		}
		if ($(this).hasClass("see-more")) {
			text = text.replace(/</gm, "&lt;");
			text = text.replace(/>/gm, "&gt;");
			textParent.html(text.replace(/(\r\n|\n|\r)/gm, "<br>"));
			//textParent.append('<button class="see-less">(...see less)</button>');
			$(this).removeClass("see-more").addClass("see-less");
			$(this).html($(this).data("seeless"));
		} else {
			var maxLength = textParent.data("max");
			if (!maxLength || !text) {
				$(this).remove();
				return;
			}
			var minimizedText = text.substring(0, maxLength).trim();
			minimizedText = minimizedText.replace(/<br>/gm, "\n");
			minimizedText = minimizedText.replace(/</gm, "&lt;");
			minimizedText = minimizedText.replace(/>/gm, "&gt;");
			minimizedText = minimizedText.replace(/(\r\n|\n|\r)/gm, "<br>");
			textParent.html(minimizedText);
			$(this).removeClass("see-less").addClass("see-more");
			$(this).html($(this).data("seemore"));
		}
	});

	lQuery(".see-more-tags-btn").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var tagsParent = $(this).prev(".tageditor-viewer");
		if ($(this).hasClass("see-more")) {
			$(".seelesstags", tagsParent).css("display", "inline-block");
			$(this).removeClass("see-more").addClass("see-less");
			$(this).html($(this).data("seeless"));
		} else {
			$(".seelesstags", tagsParent).hide();
			$(this).removeClass("see-less").addClass("see-more");
			$(this).html($(this).data("seemore"));
		}
	});

	lQuery(".filtersshowmoretags").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var moretags = $(this).next(".moreoptions");
		moretags.show();
		$(this).hide();
	});

	lQuery("#filterautorefresh").livequery("change", function () {
		toggleUserProperty("filtershowall", function () {});
	});

	lQuery(".expandmediabox").livequery("click", function (e) {
		expandmediabox($(this));
	});

	lQuery(".emrowpicker table td").livequery("click", function (event) {
		var clicked = $(this);
		if (clicked.attr("noclick") == "true") {
			return true;
		}
		if ($(event.target).is("input") || $(event.target).is("a")) {
			return true;
		}

		event.preventDefault();
		var row = clicked.closest("tr");
		var table = clicked.closest("table");
		var form = clicked.closest(".pickedcategoryform");

		var existing = row.hasClass("emrowselected");
		if (!form.hasClass("emmultivalue")) {
			$("tr", table).removeClass("emrowselected");
		}
		row.toggleClass("emrowselected");
		var id = row.data("id");

		$(".emselectedrow", form).each(function () {
			if (form.hasClass("emmultivalue")) {
				var old = $(this).val();
				if (old) {
					if (existing) {
						// removing the value
						old = old.replace(id, "");
						old = old.replace("||", "|");
					} else {
						old = old + "|" + id;
					}
				} else {
					old = id;
				}
				$(this).val(old);
			} else {
				$(this).val(id);
			}
		});

		form.trigger("submit");

		if (form.hasClass("autoclose")) {
			closeemdialog(form.closest(".modal"));
		}
	});

	lQuery(".emselectable table td").livequery("click", function (event) {
		var clicked = $(this);
		if (clicked.attr("noclick") == "true") {
			return true;
		}
		if ($(event.target).is("input")) {
			return true;
		}
		if ($(event.target).is("a")) {
			return true;
		}
		if ($(event.target).hasClass("jp-audio")) {
			return true;
		}

		var emselectable = clicked.closest("#emselectable");
		if (emselectable.length < 1) {
			emselectable = clicked.closest(".emselectable");
		}
		var row = $(clicked.closest("tr"));
		var rowid = row.attr("rowid");

		if (row.hasClass("thickbox")) {
			var href = row.data("href");
			openFancybox(href);
		} else {
			emselectable.find("table tr").each(function (index) {
				clicked.removeClass("emhighlight");
			});
			row.addClass("emhighlight");
			row.removeClass("emborderhover");
			var table = row.closest("table");

			// var url = emselectable.data("clickpath");

			var url = table.data("clickpath");
			var form = emselectable.find("form");
			if (!form.length) {
				form = emselectable.data("emselectableform");
				if (form) {
					form = $("#" + form);
				}
			}
			var data = row.data();

			if (form && form.length > 0) {
				data.id = rowid;
				data.oemaxlevel = form.data("oemaxlevel");
				form.find("#emselectedrow").val(rowid);
				form.find(".emneedselection").each(function () {
					clicked.removeAttr("disabled");
				});
				//form.submit();
				var targetdiv = form.data("targetdiv");
				/*if ((typeof targetdiv) != "undefined") {
					$(form).ajaxSubmit({
						target : "#" + $.escapeSelector(targetdiv), 
						data:data
						
					});
				} else {
					*/
				$(form).trigger("submit");
				//}
				if (form.hasClass("autoclose")) {
					closeemdialog(form.closest(".modal"));
				}
			} else if (url != undefined) {
				//-- table clickpath
				if (url == "") {
					return true;
				}
				var link = url;
				var post = table.data("viewpostfix");
				if (post != undefined) {
					link = link + rowid + post;
				} else {
					link = link + rowid;
				}
				if (emselectable.hasClass("showmodal")) {
					showmodal(emselectable, link);
				} else {
					parent.document.location.href = link;
				}
			}
		}
	});

	lQuery(".assetpickerselectrow").livequery("click", function () {
		var assetid = $(this).data("assetid");
		jQuery("#" + targetdiv).attr("value", assetid);

		//Todo: Integrte with emselectable
		var emselectable = $(this).closest(".emselectable");

		var launcher = emselectable.data("launcher");
		launcher = $("#" + launcher);
		if (launcher.length) {
			var options = launcher.data();
			options.assetid = assetid;

			var clickurl = launcher.data("clickurl");
			if (clickurl && clickurl != "") {
				var targetdiv = launcher.data("targetdiv");
				if (targetdiv !== undefined) {
					jQuery.ajax({
						url: clickurl,
						data: options,
						success: function (data) {
							if (!targetdiv.jquery) {
								targetdiv = $("#" + targetdiv);
							}
							targetdiv.replaceWith(data);
							closeemdialog(emselectable.closest(".modal"));
						},
					});
				}
				return;
			}
		}
	});

	//Main Module results
	lQuery(".topmodulecontainer .resultsdiv .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}

			var emselectable = clicked.closest(".emselectablemodule");

			var row = $(clicked.closest(".resultsdivdata"));
			var rowid = row.data("dataid");

			var targetlink = emselectable.data("targetlink");

			if (emselectable.hasClass("emselectablemodule_order")) {
				//Order Module
				var targetdiv = emselectable.data("targetdiv");
				if (targetlink && targetlink != "") {
					targetlink +=
						(targetlink.indexOf("?") >= 0 ? "&" : "?") + "id=" + rowid;

					$.ajax({
						url: targetlink,
						data: { oemaxlevel: "2" },
						success: function (data) {
							$("#" + targetdiv).replaceWith(data);
							jQuery(window).trigger("resize");
						},
					});
				}
			} else {
				//All entities
				if (targetlink && targetlink != "") {
					targetlink +=
						(targetlink.indexOf("?") >= 0 ? "&" : "?") + "id=" + rowid;
					row.data("targetlink", targetlink);
					row.data("oemaxlevel", "2");
					if (emselectable.data("tabletype") == "subentity") {
						row.data("targetrendertype", "entity");
						row.data("oemaxlevel", "1");
					}
					row.data("id", rowid);
					row.data("hitssessionid", emselectable.data("hitssessionid"));
					row.data("updateurl", true);
					var urlbar =
						apphome +
						"/views/modules/" +
						emselectable.data("searchtype") +
						"/index.html?entityid=" +
						rowid;
					row.data("urlbar", urlbar);

					emdialog(row, event);
				}
			}
		}
	);

	//Submodule picker reuslts
	lQuery(".submodulepicker .resultsdiv .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}

			var emselectable = clicked.closest(".emselectablemodule");

			var row = $(clicked.closest(".resultsdivdata"));
			var rowid = row.data("dataid");

			var targetlink = emselectable.data("targetlink");

			if (targetlink && targetlink != "") {
				targetlink +=
					(targetlink.indexOf("?") >= 0 ? "&" : "?") + "id=" + rowid;
				row.data("targetlink", targetlink);
				row.data("oemaxlevel", "2");
				if (emselectable.data("tabletype") == "subentity") {
					row.data("targetrendertype", "entity");
					row.data("oemaxlevel", "1");
				}
				row.data("id", rowid);
				row.data("hitssessionid", emselectable.data("hitssessionid"));
				row.data("updateurl", true);
				var urlbar =
					apphome +
					"/views/modules/" +
					emselectable.data("searchtype") +
					"/index.html?entityid=" +
					rowid;
				row.data("urlbar", urlbar);

				emdialog(row, event);
			}
		}
	);

	//Entity picker field
	lQuery(
		".pickerresults.entitypickerfield .resultsdiv .resultsdivdata"
	).livequery("click", function (event) {
		var clicked = $(this);
		if (!handleclick(clicked)) {
			return true;
		}
		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".pickerresults");

		if (pickerresults.length) {
			//Entity Picker Field
			var pickertarget = pickerresults.data("pickertarget");
			pickertarget = $("#" + pickertarget);
			if (pickertarget.length > 0) {
				updateentityfield(pickertarget, rowid, row.data("rowname"));
			}
			closeemdialog(pickerresults.closest(".modal"));
		}
	});

	//Entity picker Submodule Table
	lQuery(
		".pickerresults.entitypickersubmodule .resultsdiv .resultsdivdata"
	).livequery("click", function (event) {
		var clicked = $(this);
		if (!handleclick(clicked)) {
			return true;
		}
		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".pickerresults");

		if (pickerresults.length) {
			var clickurl = pickerresults.data("clickurl");
			var options = pickerresults.data();
			options.id = rowid;
			var pickertarget = pickerresults.data("pickertarget");
			pickertarget = $("#" + pickertarget);
			if (clickurl !== undefined && clickurl != "") {
				jQuery.ajax({
					url: clickurl,
					data: options,
					success: function (data) {
						autoreload(pickertarget);
					},
				});
			}
			closeemdialog(pickerresults.closest(".modal"));
		}
	});

	//Upload to Entity
	lQuery(".pickerresults.entitydialog .resultsdiv .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}
			var row = $(clicked.closest(".resultsdivdata"));
			var rowid = row.data("dataid");
			var pickerresults = clicked.closest(".pickerresults");
			var options = pickerresults.data();
			options.id = rowid;
			if (pickerresults.length) {
				emdialog(pickerresults, event);
			}
		}
	);

	//Copy Entities
	lQuery(".pickerresultscopy .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}
			var row = $(clicked.closest(".resultsdivdata"));
			var rowid = row.data("dataid");
			var pickerresults = clicked.closest(".pickerresults");

			var options = pickerresults.data();
			options.id = rowid;
			var clickurl = pickerresults.data("clickurl");
			var targetdiv = pickerresults.data("clicktargetdiv");
			var targettype = pickerresults.data("targettype");

			if (clickurl !== undefined && clickurl != "") {
				jQuery.ajax({
					url: clickurl,
					data: options,
					success: function (data) {
						if (!targetdiv.jquery) {
							targetdiv = $("#" + targetdiv);
						}
						if (targettype == "message") {
							if (targetdiv !== undefined) {
								targetdiv.prepend(data);
								targetdiv.find(".fader").fadeOut(3000, "linear");
							}
						} else {
							//regular targetdiv
							if (targetdiv !== undefined) {
								targetdiv.replaceWith(data);
							}
						}

						closeemdialog(pickerresults.closest(".modal"));
					},
				});
			}
		}
	);

	function handleclick(clicked) {
		if (clicked.attr("noclick") == "true") {
			return false;
		}
		if ($(event.target).is("input")) {
			return false;
		}
		if ($(event.target).is("a")) {
			return false;
		}
		if ($(event.target).closest(".jp-audio").length) {
			return false;
		}
		return true;
	}

	$(window).on(
		"updatepickertarget",
		function (event, pickertargetid, dataid, dataname) {
			var pickertarget = $("#" + pickertargetid);
			if (pickertarget.length > 0) {
				updateentityfield(pickertarget, dataid, dataname);
			}
		}
	);

	updateentityfield = function (pickertarget, id, name) {
		if (pickertarget.hasClass("assetpicker")) {
			//Asset  Picker
			var detailid = pickertarget.data("detailid");
			$("#" + detailid + "-value").attr("value", id);
			$("#" + detailid + "-preview").load(
				apphome +
					"/components/xml/types/assetpicker/preview.html?oemaxlevel=1&assetid=" +
					id,
				function () {}
			);
		} else {
			var template = $("#pickedtemplateREPLACEID", pickertarget).html(); //clone().appendTo(pickertarget);
			var newcode = template.replaceAll("REPLACEID", id);
			newcode = newcode.replaceAll("REPLACEFIELDNAME", "");
			var ismulti = pickertarget.data("ismulti");
			if (ismulti == undefined || !ismulti) {
				//clear others
				pickertarget.find("li:not(#pickedtemplateREPLACEID)").remove();
			}
			pickertarget.prepend("<li>" + newcode + "</li>");
			var newrow = pickertarget.find("li:first");
			newrow.attr("id", id);
			newrow.find("a:first").text(name);
			newrow.show();
		}
	};

	showmodal = function (emselecttable, url) {
		trackKeydown = true;
		var id = "modals";
		var modaldialog = $("#" + id);
		var width = emselecttable.data("dialogwidth");
		if (modaldialog.length == 0) {
			$("#emcontainer").append(
				'<div class="modal " tabindex="-1" id="' +
					id +
					'" style="display:none" ></div>'
			);
			modaldialog = $("#" + id);
		}

		var options = emselecttable.data();
		modaldialog.load(url, options, function () {
			$(".modal-lg").css("min-width", width + "px");
			modaldialog.modal({
				keyboard: true,
				backdrop: true,
				show: true,
			});

			var title = emselecttable.data("dialogtitle");
			if (title) {
				$(".modal-title", modaldialog).text(title);
			}

			$("form", modaldialog).find("*").filter(":input:visible:first").focus();
		});
	};

	lQuery("img.framerotator").livequery(function () {
		$(this).hover(
			function () {
				$(this).data("frame", 0);
				var path = this.sr$("select#speedC").selectmenu({
					style: "dropdown",
				});
				c.split("?")[0];
				var intval = setInterval(
					"nextFrame('" + this.id + "', '" + path + "')",
					1000
				);
				$(this).data("intval", intval);
			},
			function () {
				var path = this.src.split("?")[0];
				this.src = path + "?frame=0";
				var intval = $(this).data("intval");
				clearInterval(intval);
			}
		);
	});

	lQuery(".jp-play").livequery("click", function () {
		// alert("Found a player, setting it up");
		var player = $(this).closest(".jp-audio").find(".jp-jplayer");
		var url = player.data("url");
		var containerid = player.data("container");
		var container = $("#" + containerid);

		player.jPlayer({
			ready: function (event) {
				player
					.jPlayer("setMedia", {
						mp3: url,
					})
					.jPlayer("play");
			},
			play: function () {
				// To avoid both jPlayers playing together.
				player.jPlayer("pauseOthers");
			},
			swfPath: apphome + "/components/javascript",
			supplied: "mp3",
			wmode: "window",
			cssSelectorAncestor: "#" + containerid,
		});

		// player.jPlayer("play");
	});

	lQuery(".select-dropdown-open").livequery("click", function () {
		if ($(this).hasClass("down")) {
			$(this).removeClass("down");
			$(this).addClass("up");
			$(this).siblings(".select-dropdown").show();
		} else {
			$(this).removeClass("up");
			$(this).addClass("down");
			$(this).siblings(".select-dropdown").hide();
		}
	});
	lQuery(".select-dropdown li a").livequery("click", function () {
		$(this)
			.closest(".select-dropdown")
			.siblings(".select-dropdown-open")
			.removeClass("up");
		$(this)
			.closest(".select-dropdown")
			.siblings(".select-dropdown-open")
			.addClass("down");
		$(this).closest(".select-dropdown").hide();
	});

	function select2formatResult(emdata) {
		/*
		 * var element = $(this.element); var showicon =
		 * element.data("showicon"); if( showicon ) { var type =
		 * element.data("searchtype"); var html = "<img
		 * class='autocompleteicon' src='" + themeprefix + "/images/icons/" +
		 * type + ".png'/>" + emdata.name; return html; } else { return
		 * emdata.name; }
		 */
		return emdata.name;
	}
	function select2Selected(selectedoption) {
		// "#list-" + foreignkeyid
		// var id = container.closest(".select2-container").attr("id");
		// id = "list-" + id.substring(5); //remove sid2_
		// container.closest("form").find("#" + id ).val(emdata.id);
		return selectedoption.name || selectedoption.text;
	}

	lQuery(".suggestsearchinput").livequery(function () {
		var theinput = $(this);
		if (theinput && theinput.autocomplete) {
			theinput.autocomplete({
				source: apphome + "/components/autocomplete/assetsuggestions.txt",
				select: function (event, ui) {
					// set input that's just for display
					// purposes
					theinput.val(ui.item.value);
					$("#search_form").submit();
					return false;
				},
			});
		}
		//console.log(theinput);

		if (theinput.data("quicksearched") == true) {
			var strLength = theinput.val().length * 2;
			theinput.focus();
			theinput[0].setSelectionRange(strLength, strLength);
		}
	});

	lQuery("input.defaulttext").livequery("click", function () {
		var theinput = $(this);
		var startingtext = theinput.data("startingtext");
		if (theinput.val() == startingtext) {
			theinput.val("");
		}
	});

	lQuery("select.listtags").livequery(function () {
		var theinput = $(this);
		var isSelectMode = theinput.hasClass("choose-select");
		var dropdownParent = theinput.data("dropdownparent");
		if (dropdownParent && $("#" + dropdownParent).length) {
			dropdownParent = $("#" + dropdownParent);
		} else {
			dropdownParent = $(this).parent();
		}
		var parent = theinput.closest("#main-media-container");
		if (parent.length) {
			dropdownParent = parent;
		}
		var parent = theinput.parents(".modal-content");
		if (parent.length) {
			dropdownParent = parent;
		}
		var searchtype = theinput.data("searchtype");
		var searchfield = theinput.data("searchfield");
		// var catalogid = theinput.data("listcatalogid");
		var sortby = theinput.data("sortby");
		var defaulttext = theinput.data("showdefault");
		if (!defaulttext) {
			defaulttext = "Search";
		}
		var allowClear = $(this).data("allowclear");
		if (allowClear == undefined) {
			allowClear = true;
		}

		var url = theinput.data("url");
		if (!url) {
			url = apphome + "/components/xml/types/autocomplete/tagsearch.txt";
		}

		if ($.fn.select2) {
			var options = theinput.children("option");
			var preloadedData = [];
			options.each(function () {
				var option = $(this);
				if (isSelectMode && option.val() != "" && option.text() != "") {
					preloadedData.push({
						id: option.val(),
						name: option.text(),
					});
				}
			});
			theinput.select2({
				data: preloadedData,
				tags: true,
				placeholder: defaulttext,
				allowClear: allowClear,
				dropdownParent: dropdownParent,
				selectOnBlur: true,
				delay: 150,
				ajax: {
					url: url,
					xhrFields: {
						withCredentials: true,
					},
					crossDomain: true,
					dataType: "json",
					data: function (params) {
						var search = {
							page_limit: 15,
							page: params.page || 1,
						};
						search["field"] = searchfield;
						search["operation"] = "contains";
						search["searchtype"] = searchtype;
						search[searchfield + ".value"] = params.term || "";
						search["sortby"] = sortby;
						return search;
					},
					processResults: function (data, params) {
						params.page = params.page || 1;
						var results = data.rows;
						if (results.length == 0 && isSelectMode) {
							results = preloadedData;
						}
						return {
							results: results,
							pagination: {
								more: false,
							},
						};
					},
				},
				escapeMarkup: function (m) {
					return m;
				},
				templateResult: select2formatResult,
				templateSelection: select2Selected,
				tokenSeparators: ["|", ","],
				separator: "|",
			});
		}

		theinput.on("select2:open", function (e) {
			var selectId = $(this).attr("id");
			if (selectId) {
				$(
					".select2-search__field[aria-controls='select2-" +
						selectId +
						"-results']"
				).each(function (key, value) {
					value.focus();
				});
			} else {
				document
					.querySelector(".select2-container--open .select2-search__field")
					.focus();
			}
		});

		theinput.on("select2:select", function () {
			if ($(this).parents(".ignore").length == 0) {
				$(this).valid();
			}
		});

		theinput.on("select2:unselect", function () {
			if ($(this).parents(".ignore").length == 0) {
				$(this).valid();
			}
		});
	});

	lQuery("select.searchtags").livequery(function () {
		var theinput = $(this);
		var dropdownParent = theinput.data("dropdownparent");
		if (dropdownParent && $("#" + dropdownParent).length) {
			dropdownParent = $("#" + dropdownParent);
		} else {
			dropdownParent = $(this).parent();
		}
		var parent = theinput.closest("#main-media-container");
		if (parent.length) {
			dropdownParent = parent;
		}
		var parent = theinput.parents(".modal-content");
		if (parent.length) {
			dropdownParent = parent;
		}

		var searchfield = theinput.data("searchfield");
		var sortby = theinput.data("sortby");
		var defaulttext = theinput.data("showdefault");
		if (!defaulttext) {
			defaulttext = "Search";
		}
		var allowClear = $(this).data("allowclear");
		if (allowClear == undefined) {
			allowClear = true;
		}

		var url = theinput.data("url");
		if (!url) {
			url = apphome + "/components/xml/types/autocomplete/tagsearch.txt";
		}

		var form = theinput.closest("form");

		if ($.fn.select2) {
			theinput.select2({
				tags: true,
				placeholder: defaulttext,
				allowClear: allowClear,
				dropdownParent: dropdownParent,
				selectOnBlur: true,
				delay: 150,
				minimumInputLength: 2,
				ajax: {
					url: url,
					xhrFields: {
						withCredentials: true,
					},
					crossDomain: true,
					dataType: "json",
					data: function (params) {
						var search = {
							page_limit: 15,
							page: params.page,
						};
						search["field"] = searchfield;
						search["operation"] = "freeform";
						search[searchfield + ".value"] = params.term;

						return search;
					},
					processResults: function (data, params) {
						var term = params.term;
						var currentterms = $(theinput).val();
						if (currentterms) {
							term = currentterms.join(" ") + " " + term;
						}

						$("#descriptionvalue", form).val(term.trim());
						form.trigger("submit");

						params.page = params.page || 1;
						return {
							results: data.rows,
							pagination: {
								more: false,
								// (params.page * 30) <
								// data.total_count
							},
						};
					},
				},
				escapeMarkup: function (m) {
					return m;
				},
				templateResult: select2formatResult,
				templateSelection: select2Selected,
				tokenSeparators: ["|"],
				separator: "|",
			});
		}
		theinput.on("select2:select", function () {
			if ($(this).parents(".ignore").length == 0) {
				$(this).valid();
				var selected = $(this).select2("data");
				var terms = "";
				selected.forEach(function (item, index, arr) {
					terms = terms + " " + item["id"] + "";
				});
				$("#descriptionvalue", form).val(terms);
				form.trigger("submit");
			}
		});
		theinput.on("select2:unselect", function () {
			if ($(this).parents(".ignore").length == 0) {
				$(this).valid();
				var selected = $(this).select2("data");
				var terms = "";
				selected.forEach(function (item, index, arr) {
					terms = terms + " " + item["id"] + "";
				});
				$("#descriptionvalue", form).val(terms);
				form.trigger("submit");
			}
		});
	});

	lQuery(".switchmainsearch").livequery("click", function () {
		var link = $(this);
		var moduleid = link.data("moduleid");
		saveProfileProperty("mainsearchmodule", moduleid, function () {
			$("#mainsearchcontainer").data("moduleid", moduleid);
			$("#mainsearchvalue").data("mainsearchmodule", moduleid);
			$("#searchEntityDropdown").text(link.text());
			$(".quicksearchexpand").trigger("click");
		});
	});

	lQuery(".fieldsPicker").livequery("click", function (e) {
		if (e.target !== this) {
			return;
		}
		$(this).fadeOut(function () {
			$(this).replaceWith("<div id='fieldsPicker'></div>");
			$(".fieldsParent").trigger("refreshFields");
			$(".fieldsPicker").each(function () {
				$(this).remove();
			});
		});
	});
	lQuery(".close-fp").livequery("click", function (e) {
		e.stopPropagation();
		$(this)
			.closest(".fieldsPicker")
			.fadeOut(function () {
				$(this).replaceWith("<div id='fieldsPicker'></div>");
				$(".fieldsParent").trigger("refreshFields");
				$(".fieldsPicker").each(function () {
					$(this).remove();
				});
			});
	});

	lQuery(".resetsearch").livequery("click", function () {
		saveProfileProperty("mainsearchmodule", "", function () {});
	});

	var lasttypeahead;
	var lastsearch;
	var searchmodaldialog;
	var searchmodalmask;
	var mainsearcheinput;

	lQuery(".mainsearch").livequery(function () {
		mainsearcheinput = $(this);
		var dropdownParent = mainsearcheinput.data("dropdownparent");
		if (dropdownParent && $("#" + dropdownParent).length) {
			dropdownParent = $("#" + dropdownParent);
		} else {
			dropdownParent = $(this).parent();
		}
		var parent = mainsearcheinput.closest("#main-media-container");
		if (parent.length) {
			dropdownParent = parent;
		}
		var parent = mainsearcheinput.parents(".modal-content");
		if (parent.length) {
			dropdownParent = parent;
		}

		var hidescrolling = mainsearcheinput.data("hidescrolling");

		var id = mainsearcheinput.data("dialogid");
		if (!id) {
			id = "typeahead";
		}

		searchmodaldialog = getmodalsearchdialog(id);
		searchmodalmask = $("#quicksearch-mask");

		function setSearchModalSize() {
			var applicationcontentwidth = $("#applicationmaincontent").width();
			if (!applicationcontentwidth) {
				applicationcontentwidth = $("#header").width();
			}
			searchmodaldialog.css("width", applicationcontentwidth - 100 + "px");
			var topposition = $("#header").outerHeight();
			topposition -= 40;
			topposition /= 2;
			topposition += 56;
			searchmodaldialog.css("top", topposition + "px");
			searchmodaldialog.css("left", "50%");
			searchmodaldialog.css("transform", "translateX(-50%)");

			var wh = window.innerHeight;
			if (wh) {
				searchmodaldialog.css("height", wh - topposition - 20 + "px");
			}
		}
		setSearchModalSize();
		window.onresize = setSearchModalSize;

		var options = mainsearcheinput.data();
		var searchurltargetdiv = mainsearcheinput.data("searchurltargetdiv");
		var typeaheadtargetdiv = mainsearcheinput.data("typeaheadtargetdiv");

		if (typeaheadtargetdiv == null) {
			typeaheadtargetdiv = "applicationmaincontent";
		}

		var searchurlentertargetdiv = mainsearcheinput.data(
			"searchurlentertargetdiv"
		);

		var searchfield = mainsearcheinput.data("searchfield");
		var sortby = mainsearcheinput.data("sortby");
		var defaulttext = mainsearcheinput.data("showdefault");
		if (!defaulttext) {
			defaulttext = "Search";
		}
		var allowClear = mainsearcheinput.data("allowclear");
		if (allowClear == undefined) {
			allowClear = true;
		}

		var url = mainsearcheinput.data("typeaheadurl");

		var q = "";
		mainsearcheinput.on("keydown", function (e) {
			if (e.keyCode == 27) {
				togglemodaldialog("hide");
			}
		});
		mainsearcheinput.on("keyup change", function (e) {
			if (mainsearcheinput.val() == q) {
				return;
			}
			q = mainsearcheinput.val();
			if (!q) {
				togglemodaldialog("hide");
				return;
			}

			if (e.keyCode == 27) {
				togglemodaldialog("hide");
			} else if (
				(q != "" && e.which == undefined) ||
				e.which == 8 ||
				(e.which != 37 && e.which != 39 && e.which > 32)
			) {
				//Real words and backspace
				if (q && q.length < 2) {
					togglemodaldialog("hide");
					return;
				} else {
					togglemodaldialog("show");
				}

				var terms =
					"field=description&operation=contains" +
					"&description.value=" +
					encodeURIComponent(q);

				var mainsearchmodule = mainsearcheinput.data("mainsearchmodule");
				if (mainsearchmodule != null) {
					terms = terms + "&mainsearchmodule=" + mainsearchmodule;
				}

				if (lasttypeahead) {
					lasttypeahead.abort();
				}
				lasttypeahead = $.ajax({
					url: url,
					async: true,
					type: "GET",
					data: terms,
					timeout: 6000,
					beforeSend: function () {
						$("#searchLoading").addClass("show");
					},
					success: function (data) {
						if (data) {
							searchmodaldialog.html(data);
							togglemodaldialog("show");
							jQuery(window).trigger("resize");
						}
					},
					complete: function () {
						$("#searchLoading").removeClass("show");
					},
				});
			} else {
				//console.log(e.keyCode);
			}
		});

		lQuery(".qssuggestion").livequery("click", function () {
			var suggestion = $(this).data("suggestion");
			mainsearcheinput.val(decodeURI(suggestion));
			mainsearcheinput.trigger("change");
		});

		lQuery(".closemainsearch").livequery("click", function () {
			togglemodaldialog("hide");
		});
		lQuery(searchmodalmask).livequery("click", function () {
			togglemodaldialog("hide");
		});
		$(document).on("click", function (event) {
			if ($(event.target).closest(".search-entity-dropdown").length > 0) {
				return;
			}
			if ($(event.target).closest(searchmodaldialog).length === 0) {
				togglemodaldialog("hide");
			}
		});
		lQuery(".quicksearchexpand").livequery("click", function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (searchmodaldialog.length) {
				var q = mainsearcheinput.val();
				var terms = "";
				if (q) {
					terms =
						"field=description&operation=contains" +
						"&description.value=" +
						encodeURI(q);
				}
				q = mainsearcheinput.data("mainsearchmodule");
				if (q) {
					terms =
						(terms.length > 0 ? terms + "&" : "") + "mainsearchmodule=" + q;
				}
				var url = mainsearcheinput.data("typeaheadurl");

				$.ajax({
					url: url,
					async: true,
					type: "GET",
					data: terms,
					timeout: 1000,
					beforeSend: function () {
						$("#searchLoading").addClass("show");
					},
					success: function (data) {
						if (data) {
							searchmodaldialog.html(data);
							togglemodaldialog("show");
							$("#mainsearchvalue").focus();
							jQuery(window).trigger("resize");
						}
					},
					complete: function () {
						$("#searchLoading").removeClass("show");
					},
				});
			}
		});

		function getmodalsearchdialog() {
			searchmodaldialog = $("#" + id);
			if (searchmodaldialog.length == 0) {
				$("#header").append(
					'<div class="typeaheadmodal" tabindex="-1" id="' +
						id +
						'" style="display:none" ></div>'
				);
				searchmodaldialog = $("#" + id);
			}
			return searchmodaldialog;
		}

		function togglemodaldialog(action) {
			if (action == "show") {
				searchmodaldialog.show();
				searchmodalmask.show();
				$(".headersearchbar").addClass("searchbaropen");
			} else {
				searchmodalmask.hide();
				searchmodaldialog.hide();
				$(".headersearchbar").removeClass("searchbaropen");
			}
		}
	});

	var lasttypeaheadsummary;
	var searchmodaldialog;
	var searchmodalmask;
	var mainsearcheinput;

	lQuery(".filtertypeahead").livequery(function () {
		mainsearcheinput = $(this);
		var q = "";
		var form = mainsearcheinput.closest("#filterform");
		form.data("onsuccess", "filtertypeaheadsuccess");
		var url = form.attr("action");

		mainsearcheinput.on("keydown", function (e) {
			if (e.keyCode == 27) {
			}
		});
		mainsearcheinput.on("keyup change", function (e) {
			if (mainsearcheinput.val() == q) {
				return;
			}
			q = mainsearcheinput.val();
			if (!q) {
				return;
			}

			if (e.keyCode == 27) {
			} else if (
				(q != "" && e.which == undefined) ||
				e.which == 8 ||
				(e.which != 37 && e.which != 39 && e.which > 32)
			) {
				//Real words and backspace
				if (q && q.length < 2) {
					return;
				} else {
				}

				var terms =
					"field=description&operation=contains" +
					"&description.value=" +
					encodeURIComponent(q);

				if (lasttypeaheadsummary) {
					lasttypeaheadsummary.abort();
				}

				form.trigger("submit");
			} else {
				//console.log(e.keyCode);
			}
		});
		function filtertypeaheadsuccess() {
			$(".filtertypeahead").trigger("focus");
		}
	});

	lQuery(".filter-showall-group").livequery(function () {
		var parent = $(this);
		var input = parent.find("#filter-showall");
		// var hint = parent.find("small.hint");
		function handleFilerShowAllChange(e) {
			var checked = input.is(":checked");
			if (!checked) {
				parent.addClass("inclusive");
				parent.removeClass("exclusive");
				//     hint.html(
				//       "Shows results that match <b><u>ANY</u></b> selected filter."
				//     );
			} else {
				parent.removeClass("inclusive");
				parent.addClass("exclusive");
				//     hint.html(
				//       "Shows results that match <b><u>ALL</u></b> selected filters."
				//     );
			}
		}
		handleFilerShowAllChange();
		input.change(handleFilerShowAllChange);
	});

	lQuery(".grabfocus").livequery(function () {
		var theinput = $(this);
		theinput.focus();
		var val = theinput.val();
		theinput.val("");
		theinput.val(val);
	});

	lQuery(".emtabs").livequery(function () {
		var tabs = $(this);

		var tabcontent = $("#" + tabs.data("targetdiv"));

		// active the right tab
		var hash = window.location.hash;
		if (hash) {
			var activelink = $(hash, tabs);
			if (activelink.length == 0) {
				hash = false;
			}
		}
		if (!hash) {
			hash = "#" + tabs.data("defaulttab");
		}
		var activelink = $(hash, tabs);
		var loadedpanel = $(hash + "panel", tabcontent);
		if (loadedpanel.length == 0) {
			loadedpanel = $("#loadedpanel", tabcontent);
			loadedpanel.attr("id", activelink.attr("id") + "panel");
			activelink.data("tabloaded", true);
		}
		activelink.parent("li").addClass("emtabselected");
		activelink.data("loadpageonce", false);

		$("a:first-child", tabs).on("click", function (e) {
			e.preventDefault();

			var link = $(this); // activated tab
			$("li", tabs).removeClass("emtabselected");
			link.parent("li").addClass("emtabselected");

			var id = link.attr("id");

			var url = link.attr("href");
			var panelid = id + "panel";
			var tab = $("#" + panelid);
			if (tab.length == 0) {
				tab = tabcontent.append(
					'<div class="tab-pane" id="' + panelid + '" ></div>'
				);
				tab = $("#" + panelid);
			}

			var reloadpage = link.data("loadpageonce");
			var alwaysreloadpage = link.data("alwaysreloadpage");
			if (reloadpage || alwaysreloadpage) {
				if (window.location.href.endsWith(url)) {
					window.location.reload();
				} else {
					window.location.href = url;
				}
			} else {
				url = url + "#" + id;
				var loaded = link.data("tabloaded");
				if (link.data("allwaysloadpage")) {
					loaded = false;
				}
				if (!loaded) {
					var levels = link.data("layouts");
					if (!levels) {
						levels = "1";
					}
					$.get(
						url,
						{
							oemaxlevel: levels,
						},
						function (data) {
							tab.html(data);
							link.data("tabloaded", true);
							$(">.tab-pane", tabcontent).hide();
							tab.show();
							$(window).trigger("resize");
						}
					);
				} else {
					$(">.tab-pane", tabcontent).hide();
					tab.show();
					$(window).trigger("resize");
				}
			}
		});
	});

	lQuery(".closetab").livequery("click", function (e) {
		e.preventDefault();
		var tab = $(this);
		var nextpage = tab.data("closetab");
		$.get(
			nextpage,
			{
				oemaxlayout: 1,
			},
			function (data) {
				var prevtab = tab.closest("li").prev();
				prevtab.find("a").click();

				if (prevtab.hasClass("firstab")) {
					tab.closest("li").remove();
				}
			}
		);
		return false;
	});

	lQuery(".collectionclose").livequery("click", function (e) {
		e.preventDefault();
		var collection = $(this);
		var nextpage = collection.data("closecollection");
		$.get(
			nextpage,
			{
				oemaxlayout: 1,
			},
			function (data) {
				collection.closest("li").remove();
			}
		);
		return false;
	});

	lQuery(".createmedia-btn").livequery("click", function (e) {
		$(".createmedia-tab").removeClass("createmedia-selected");
		$(this).closest(".createmedia-tab").addClass("createmedia-selected");
	});

	lQuery("select.listautocomplete").livequery(function () // select2
	{
		var theinput = $(this);
		var searchtype = theinput.data("searchtype");
		if (searchtype != undefined) {
			// called twice due to
			// the way it reinserts
			// components
			var searchfield = theinput.data("searchfield");

			var foreignkeyid = theinput.data("foreignkeyid");
			var sortby = theinput.data("sortby");

			var defaulttext = theinput.data("showdefault");
			if (!defaulttext) {
				defaulttext = "Search";
			}
			var defaultvalue = theinput.data("defaultvalue");
			var defaultvalueid = theinput.data("defaultvalueid");

			var url =
				apphome +
				"/components/xml/types/autocomplete/datasearch.txt?" +
				"field=" +
				searchfield +
				"&operation=contains&searchtype=" +
				searchtype;
			if (defaultvalue != undefined) {
				url =
					url +
					"&defaultvalue=" +
					defaultvalue +
					"&defaultvalueid=" +
					defaultvalueid;
			}

			var dropdownParent = theinput.data("dropdownparent");
			if (dropdownParent && $("#" + dropdownParent).length) {
				dropdownParent = $("#" + dropdownParent);
			} else {
				dropdownParent = $(this).parent();
			}
			var parent = theinput.closest("#main-media-container");
			if (parent.length) {
				dropdownParent = parent;
			}
			var parent = theinput.parents(".modal-content");
			if (parent.length) {
				dropdownParent = parent;
			}

			var allowClear = theinput.data("allowclear");
			if (allowClear == undefined) {
				allowClear = true;
			}
			if ($.fn.select2) {
				theinput.select2({
					placeholder: defaulttext,
					allowClear: allowClear,
					minimumInputLength: 0,
					dropdownParent: dropdownParent,
					ajax: {
						// instead of writing the
						// function to execute the
						// request we use Select2's
						// convenient helper
						url: url,
						dataType: "json",
						data: function (params) {
							var fkv = theinput
								.closest("form")
								.find("#list-" + foreignkeyid + "value")
								.val();
							if (fkv == undefined) {
								fkv = theinput
									.closest("form")
									.find("#list-" + foreignkeyid)
									.val();
							}
							var search = {
								page_limit: 15,
								page: params.page,
							};
							search[searchfield + ".value"] = params.term; // search
							// term
							if (fkv) {
								search["field"] = foreignkeyid; // search
								// term
								search["operation"] = "matches"; // search
								// term
								search[foreignkeyid + ".value"] = fkv; // search
								// term
							}
							if (sortby) {
								search["sortby"] = sortby; // search
								// term
							}
							return search;
						},
						processResults: function (data, params) {
							// parse the
							// results into
							// the format
							// expected by
							// Select2.
							var rows = data.rows;
							if (theinput.hasClass("selectaddnew")) {
								if (params.page == 1 || !params.page) {
									var addnewlabel = theinput.data("addnewlabel");
									var addnewdata = {
										name: addnewlabel,
										id: "_addnew_",
									};
									rows.unshift(addnewdata);
								}
							}
							// addnew
							params.page = params.page || 1;
							return {
								results: rows,
								pagination: {
									more: false,
									// (params.page * 30) <
									// data.total_count
								},
							};
						},
					},
					escapeMarkup: function (m) {
						return m;
					},
					templateResult: select2formatResult,
					templateSelection: select2Selected,
				});
			}
			// TODO: Remove this?
			theinput.on("change", function (e) {
				if (e.val == "") {
					// Work around for a bug
					// with the select2 code
					var id = "#list-" + theinput.attr("id");
					$(id).val("");
				} else {
					// Check for "_addnew_" show ajax form
					var selectedid = theinput.val();

					if (selectedid == "_addnew_") {
						var clicklink = $("#" + theinput.attr("id") + "add");
						clicklink.trigger("click");

						e.preventDefault();
						theinput.select2("val", "");
						return false;
					}
					if (theinput.hasClass("uifilterpicker")) {
						//Not used?
						//$entry.getId()${fieldname}_val
						var fieldname = theinput.data("fieldname");
						var targethidden = $("#" + selectedid + fieldname + "_val");
						targethidden.prop("checked", true);
					}
					// Check for "_addnew_" show ajax form
					if (theinput.hasClass("selectautosubmit")) {
						if (selectedid) {
							//var theform = $(this).closest("form");
							var theform = $(this).parent("form");
							if (theform.hasClass("autosubmitform")) {
								theform.trigger("submit");
							}
						}
					}
				}
			});

			theinput.on("select2:open", function (e) {
				console.log("open");
				var selectId = $(this).attr("id");
				if (selectId) {
					$(
						".select2-search__field[aria-controls='select2-" +
							selectId +
							"-results']"
					).each(function (key, value) {
						value.focus();
					});
				} else {
					document
						.querySelector(".select2-container--open .select2-search__field")
						.focus();
				}
			});
		}
	});
	//-
	//List autocomplete multiple and accepting new options
	lQuery("select.listautocompletemulti").livequery(function () // select2
	{
		var theinput = $(this);
		var searchtype = theinput.data("searchtype");
		if (searchtype != undefined) {
			var searchfield = theinput.data("searchfield");

			var foreignkeyid = theinput.data("foreignkeyid");
			var sortby = theinput.data("sortby");

			var defaulttext = theinput.data("showdefault");
			if (!defaulttext) {
				defaulttext = "Search";
			}
			var defaultvalue = theinput.data("defaultvalue");
			var defaultvalueid = theinput.data("defaultvalueid");

			var url =
				apphome +
				"/components/xml/types/autocomplete/datasearch.txt?" +
				"field=" +
				searchfield +
				"&operation=contains&searchtype=" +
				searchtype;
			if (defaultvalue != undefined) {
				url =
					url +
					"&defaultvalue=" +
					defaultvalue +
					"&defaultvalueid=" +
					defaultvalueid;
			}

			var dropdownParent = theinput.data("dropdownparent");
			if (dropdownParent && $("#" + dropdownParent).length) {
				dropdownParent = $("#" + dropdownParent);
			} else {
				dropdownParent = $(this).parent();
			}
			var parent = theinput.closest("#main-media-container");
			if (parent.length) {
				dropdownParent = parent;
			}
			var parent = theinput.parents(".modal-content");
			if (parent.length) {
				dropdownParent = parent;
			}

			var allowClear = theinput.data("allowclear");
			if (allowClear == undefined) {
				allowClear = true;
			}
			theinput.select2({
				placeholder: defaulttext,
				allowClear: allowClear,
				minimumInputLength: 0,
				tags: true,
				dropdownParent: dropdownParent,
				ajax: {
					// instead of writing the
					// function to execute the
					// request we use Select2's
					// convenient helper
					url: url,
					dataType: "json",
					data: function (params) {
						var fkv = theinput
							.closest("form")
							.find("#list-" + foreignkeyid + "value")
							.val();
						if (fkv == undefined) {
							fkv = theinput
								.closest("form")
								.find("#list-" + foreignkeyid)
								.val();
						}
						var search = {
							page_limit: 15,
							page: params.page,
						};
						search[searchfield + ".value"] = params.term; // search
						// term
						if (fkv) {
							search["field"] = foreignkeyid; // search
							// term
							search["operation"] = "matches"; // search
							// term
							search[foreignkeyid + ".value"] = fkv; // search
							// term
						}
						if (sortby) {
							search["sortby"] = sortby; // search
							// term
						}
						return search;
					},
					processResults: function (data, params) {
						// parse the
						// results into
						// the format
						// expected by
						// Select2.
						var rows = data.rows;
						return {
							results: rows,
							pagination: {
								more: false,
								// (params.page * 30) <
								// data.total_count
							},
						};
					},
				},
				escapeMarkup: function (m) {
					return m;
				},
				templateResult: select2formatResult,
				templateSelection: select2Selected,
			});

			// TODO: Remove this?
			theinput.on("change", function (e) {
				if (e.val == "") {
					// Work around for a bug
					// with the select2 code
					var id = "#list-" + theinput.attr("id");
					$(id).val("");
				}
			});

			theinput.on("select2:open", function (e) {
				var selectId = $(this).attr("id");
				if (selectId) {
					$(
						".select2-search__field[aria-controls='select2-" +
							selectId +
							"-results']"
					).each(function (key, value) {
						value.focus();
					});
				} else {
					document
						.querySelector(".select2-container--open .select2-search__field")
						.focus();
				}
			});
		}
	});

	lQuery(".sidebarsubmenu").livequery("click", function (e) {
		e.stopPropagation();
	});

	lQuery(".mvpageclick").livequery("click", function (e) {
		e.preventDefault();
		$(".mvpageslist li").removeClass("current");
		$(this).closest("li").addClass("current");
		var pageurl = $(this).data("pageurl");
		$("#mainimage").attr("src", pageurl);
		$(".assetpanel-sidebar").removeClass("assetpanel-sidebar-ontop");
	});

	lQuery(".mvshowpages").livequery("click", function (e) {
		$(".assetpanel-sidebar").addClass("assetpanel-sidebar-ontop");
	});

	lQuery(".mvshowpages-toggle").livequery("click", function (e) {
		$(".assetpanel-sidebar").removeClass("assetpanel-sidebar-ontop");
		$(".assetpanel-sidebar").addClass("assetpanel-sidebar-hidden");
		$(".assetpanel-content").addClass("assetpanel-content-full");
		$(".mvshowpagestab").css("display", "block");
	});

	lQuery("#mainimageholder").livequery(function (e) {
		// Zooming code, only makes sense to run this when we
		// actually have the DOM
		if ($(this).position() == undefined) {
			// check if the
			// element isn't
			// there (best
			// practice
			// is...?)
			return;
		}
		var clickspot;
		var imageposition;
		var zoom = 30;
		var mainholder = $(this);
		var mainimage = $("#mainimage", mainholder);
		//mainimage.width(mainholder.width());
		$(window).bind("mousewheel DOMMouseScroll", function (event) {
			var mainimage = $("#mainimage");
			if (
				$("#hiddenoverlay").css("display") == "none" ||
				!$("#mainimage").length
			) {
				return true;
			}

			event.preventDefault();

			if (
				event.originalEvent.wheelDelta > 0 ||
				event.originalEvent.detail < 0
			) {
				// scroll up
				var w = mainimage.width();
				mainimage.width(w + zoom);
				var left = mainimage.position().left - zoom / 2;
				mainimage.css({
					left: left + "px",
				});
				return false;
			} else {
				// scroll down
				var w = mainimage.width();
				if (w > 100) {
					mainimage.width(w - zoom);
					var left = mainimage.position().left + zoom / 2;
					mainimage.css({
						left: left + "px",
					});
				}
				return false;
			}
		});

		mainimage.on("mousedown", function (event) {
			//console.log($(event.target));
			if ($(event.target).is(".zoomable")) {
				clickspot = event;
				imageposition = mainimage.position();
			}
			return false;
		});

		mainimage.on("mouseup", function (event) {
			clickspot = false;
			var mainimage = $("#mainimage");
			mainimage.removeClass("imagezooming");
			return false;
		});

		$(document).on("contextmenu", function (event) {
			clickspot = false;
		});

		mainimage.on("mousemove", function (event) {
			// if( isMouseDown() )

			if (clickspot) {
				//console.log(clickspot.pageX);
				var changetop = clickspot.pageY - event.pageY;
				var changeleft = clickspot.pageX - event.pageX;

				var left = imageposition.left - changeleft;
				var top = imageposition.top - changetop;
				var mainimage = $("#mainimage");
				mainimage.css({
					left: left + "px",
					top: top + "px",
				});
				mainimage.addClass("imagezooming");
			}
		});

		var dist1 = 0;

		mainimage.on("touchstart", function (e) {
			var touch = e.touches[0];
			var div = $(e.target);

			if (e.targetTouches.length == 2) {
				//check if two fingers touched screen
				dist1 = Math.hypot(
					//get rough estimate of distance between two fingers
					e.touches[0].pageX - e.touches[1].pageX,
					e.touches[0].pageY - e.touches[1].pageY
				);
			} else {
				div.data("touchstartx", touch.pageX);
				div.data("touchstarty", touch.pageY);
			}
		});

		mainimage.on("touchend", function (e) {
			var touch = e.touches[0];
			var div = $(e.target);
			div.removeData("touchstartx");
			div.removeData("touchstarty");
		});

		var touchzoom = 10;
		var zoomed = false;
		var ww = window.innerWidth;
		var wh = window.innerHeight;

		mainimage.on("touchmove", function (e) {
			var div = $(e.target);
			//Zoom!
			if (e.targetTouches.length == 2 && e.changedTouches.length == 2) {
				// Check if the two target touches are the same ones that started
				var dist2 = Math.hypot(
					//get rough estimate of new distance between fingers
					e.touches[0].pageX - e.touches[1].pageX,
					e.touches[0].pageY - e.touches[1].pageY
				);
				//alert(dist);
				var w = mainimage.width();

				if (dist1 > dist2) {
					//if fingers are closer now than when they first touched screen, they are pinching
					// Zoom out
					var neww = w - zoom;
					if (neww > 50) {
						//not smaller than 50px
						var newleft = mainimage.position().left + touchzoom / 2;
						var newright = newleft + mainimage.width();
						if (newleft < ww / 2 && newright > ww / 2) {
							mainimage.width(w - touchzoom);
							mainimage.css({
								left: left + "px",
							});
						}
						zoomed = true;
					} else {
						zoomed = false;
					}
				} else {
					//if fingers are further apart than when they first touched the screen, they are making the zoomin gesture
					// Zoom in

					var newleft = mainimage.position().left - touchzoom / 2;
					var newright = newleft + mainimage.width();
					if (newleft < ww / 2 && newright > ww / 2) {
						mainimage.width(w + touchzoom);
						mainimage.css({
							left: newleft + "px",
						});
					}
					zoomed = true;
				}
			} else {
				var touch = e.touches[0];
				//Move around only when zooming
				if (zoomed) {
					var left = mainimage.position().left;
					var top = mainimage.position().top;
					var newtop = left;

					var startingx = div.data("touchstartx");
					var startingy = div.data("touchstarty");
					var diffx = (touch.pageX - startingx) / 30; //?
					var diffy = (touch.pageY - startingy) / 30; //?

					if (Math.abs(diffx) > Math.abs(diffy)) {
						var change = Math.abs(diffx) / div.width();
						var newleft = left + diffx;
						var newright = newleft + mainimage.width();
						if (newleft < ww / 2 && newright > ww / 2) {
							mainimage.css({
								left: newleft + "px",
							});
						}
					} else {
						// up/down
						var change = Math.abs(diffy) / div.height();
						newtop = top + diffy;
						mainimage.css({
							top: newtop + "px",
						});
					}
				}

				/*
						 //Swipe?
						 var touch = e.touches[0];
							var startingx = div.data("touchstartx");
							var startingy = div.data("touchstarty");
							var diffx = touch.pageX - startingx;
							var diffy = touch.pageY - startingy;
							var swipe = false;
							if (Math.abs(diffx) > Math.abs(diffy)) {
								var change = Math.abs(diffx) / div.width();
								if (change > .2) {
									if (diffx > 0) {
										swipe = "swiperight";
									} else {
										swipe = "swipeleft";
									}
								}
							} else {
								// do swipeup and swipedown
								var change = Math.abs(diffy) / div.height();
								if (change > .2) {
									if (diffy > 0) {
										swipe = "swipedown";
									} else {
										swipe = "swipeup";
									}
								}

							}

							if (swipe) {
								//console.log(div);
								var event = {};
								event.originalEvent = e;
								event.preventDefault = function() {
								};
								// TODO: Find out why I can't trigger on $(e.target).trigger it
								// ignores us

								//$("#" + div.attr("id")).trigger(swipe);
							}
							*/
			}
		});

		jQuery(document).ready(function () {
			mainimage.width(mainholder.width());
		});
	});

	$("video").each(function () {
		$(this).append('controlsList="nodownload"');
		$(this).on("contextmenu", function (e) {
			e.preventDefault();
		});
	});

	lQuery(".dropdown").livequery(function (e) {
		var dropdown = $(this);

		dropdown.hover(function () {
			dropdown.children(".dropdown-menu").addClass("show");
		});
	});

	lQuery(".dropdown-menu a.dropdown-toggle").livequery("click", function (e) {
		if (!$(this).next().hasClass("show")) {
			$(this)
				.parents(".dropdown-menu")
				.first()
				.find(".show")
				.removeClass("show");
		}
		var $subMenu = $(this).next(".dropdown-menu");
		$subMenu.toggleClass("show");

		$(this)
			.parents("li.nav-item.dropdown.show")
			.on("hidden.bs.dropdown", function (e) {
				$(".dropdown-submenu .show").removeClass("show");
			});

		return false;
	});

	lQuery(".dropdown-menu a.dropdown-item").livequery("click", function (e) {
		$(this).parents(".dropdown-menu").removeClass("show");
	});

	lQuery(".sidetoggle").livequery("click", function () {
		var div = $(this);
		var target = $(this).data("target");
		var toggle = $(this).data("toggle");
		if (!toggle) {
			toggle = target;
		}
		toggleUserProperty("minimize" + toggle, function () {
			$("#" + target).slideToggle("fast", function () {
				$(window).trigger("resize");
			});
			div.find(".caret").toggleClass("exp");
			div.toggleClass("expanded");
			div.toggleClass("minimized");
			div.find(".component-actions").toggle();
		});
	});

	lQuery(".summary-toggler").livequery("click", function (e) {
		var toggler = $(this);
		var results = toggler.closest(".resultsarea");
		var container = $(".summary-container", results);
		var nowopen = false;

		if (container.hasClass("closed")) {
			nowopen = true;
			container.removeClass("closed");
			$(".summary-opener", results).addClass("closed");
			$(".summary-container", results).removeClass("closed");
		} else {
			nowopen = false;
			container.addClass("closed");
			$(".summary-opener", results).removeClass("closed");
		}
		setTimeout(() => {
			$(window).trigger("resize");
		}, 210); //match the transition speed of summary sidebar 200ms
		saveProfileProperty($(this).data("target"), nowopen);
	});

	/*
	lQuery(".summary-opener").livequery("click", function (e) {
		var opener = $(this);
		opener.addClass("closed");
		$(".summary-container").removeClass("closed");
		//$(window).trigger("resize");
		//saveProfileProperty($(this).data("target"), "true");
	});
*/
	lQuery(".sidebar-toggler").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var toggler = $(this);
		var options = toggler.data();
		var targetdiv = toggler.data("targetdiv");
		var sidebar = toggler.data("sidebar");
		options["propertyfield"] = "sidebarcomponent";
		var url = toggler.attr("href");

		if (toggler.data("action") == "home") {
			options["sidebarcomponent.value"] = "";
			options["sidebarcomponent"] = "home";

			jQuery.ajax({
				url: url,
				async: false,
				data: options,
				success: function (data) {
					//data = $(data);
					var cell = findclosest(toggler, "#" + targetdiv);
					cell.replaceWith(data); //Cant get a valid dom element
					$(".pushcontent").removeClass("pushcontent-" + sidebar);
					$(".pushcontent").removeClass("pushcontent-open");
					$(".pushcontent").addClass("pushcontent-fullwidth");

					$(window).trigger("setPageTitle", [cell]);

					$(window).trigger("resize");

					history.pushState($("#application").html(), null, url);
				},
				xhrFields: {
					withCredentials: true,
				},
				crossDomain: true,
			});
		} else if (toggler.data("action") == "hide") {
			//hide sidebar
			options["module"] = $("#applicationcontent").data("moduleid");
			options["sidebarcomponent.value"] = "";
			var url = apphome + "/components/sidebars/index.html";
			jQuery.ajax({
				url: url,
				async: false,
				data: options,
				success: function (data) {
					var cell = findclosest(toggler, "#" + targetdiv);
					cell.replaceWith(data); //Cant get a valid dom element
					$(".pushcontent").removeClass("pushcontent-" + sidebar);
					$(".pushcontent").removeClass("pushcontent-open");
					$(".pushcontent").addClass("pushcontent-fullwidth");

					$(window).trigger("resize");
				},
			});
		} else {
			//showsidebar
			showsidebar(toggler);
		}
	});

	showsidebar = function (toggler) {
		var options = toggler.data();
		var targetdiv = toggler.data("targetdiv");
		var sidebar = toggler.data("sidebar");
		options["propertyfield"] = "sidebarcomponent";
		options["module"] = $("#applicationcontent").data("moduleid");
		options["sidebarcomponent.value"] = sidebar;
		var url;
		if (options["contenturl"] != undefined) {
			url = options["contenturl"];
			targetdiv = $("#" + targetdiv);
		} else {
			url = apphome + "/components/sidebars/index.html";
			targetdiv = findclosest(toggler, "#" + targetdiv);
		}

		jQuery.ajax({
			url: url,
			async: false,
			data: options,
			success: function (data) {
				targetdiv.replaceWith(data); //Cant get a valid dom element
				$(".pushcontent").removeClass("pushcontent-fullwidth");
				$(".pushcontent").addClass("pushcontent-open");
				$(".pushcontent").addClass("pushcontent-" + sidebar);
				var mainsidebar = $(".col-mainsidebar");
				if (mainsidebar.data("sidebarwidth")) {
					var width = mainsidebar.data("sidebarwidth");
					if (typeof width == "number") {
						$(".pushcontent").css("margin-left", width + "px");
					}
				}
				$(window).trigger("setPageTitle", [targetdiv]);
				$(window).trigger("resize");
			},
		});
	};

	showsidebaruploads = function () {
		$("#sidebarUserUploads").trigger("click");
	};

	lQuery(".toggledialogtree").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var toggler = $(this);
		var options = toggler.data();
		var url = toggler.data("url");
		var targetdiv = toggler.data("targetdiv");
		var treestatus = toggler.data("treestatus");

		var dialogresults = $("#" + targetdiv).find("#dialogmediaentity");
		var currentcategoryid = dialogresults.data("categoryid");
		if (currentcategoryid !== undefined) {
			options.categoryid = currentcategoryid;
		}
		saveProfileProperty("dialogtreestatus", treestatus, function () {});
		jQuery.ajax({
			url: url,
			async: false,
			data: options,
			success: function (data) {
				data = $(data);
				$("#" + targetdiv).replaceWith(data);
				$(window).trigger("resize");
			},
		});
	});

	lQuery(".assetpicker .assetInput").livequery("change", function () {
		var detailId = $(this).data("detailid");
		var assetName = $(this).val();
		var assets = $(this).prop("files");
		if (assets.length == 0) return;
		var asset = assets[0];
		if (asset.name) assetName = asset.name;
		var fileReader = new FileReader();
		fileReader.onload = function (e) {
			if (!assetName && e.target.fileName) {
				assetName = e.target.fileName;
			}
			var preview = $(".render-type-thumbnail");
			preview.html("");
			var img = $("<img>");
			img.attr("src", e.target.result);
			img.attr("height", "140px");
			img.attr("width", "auto");
			preview.append(img);
			preview.append(
				`<div class="p-1"><span class="mr-2">${assetName}</span><a href="#" class="removefieldassetvalue" title="Remove Selected Asset" data-detailid="${detailId}"><i class="bi bi-x"></i> Remove</a></div>`
			);
		};
		fileReader.readAsDataURL(asset);
	});

	lQuery(".assetpicker .removefieldassetvalue").livequery(
		"click",
		function (e) {
			e.preventDefault();
			var picker = $(this).closest(".assetpicker");
			var detailid = $(this).data("detailid");

			picker.find("#" + detailid + "-preview").html("");
			picker.find("#" + detailid + "-value").val("");
			picker.find("#" + detailid + "-file").val("");

			var theform = $(picker).closest("form");
			theform = $(theform);
			if (theform.hasClass("autosubmit")) {
				theform.trigger("submit");
			}
		}
	);

	//$('[data-toggle="tooltipb"]').tooltip();

	//Sidebar Custom Width
	lQuery(".sidebar-toggler-resize").livequery(function () {
		var slider = $(this);
		var column = $(this).closest(".col-main");

		var clickspot;
		var startwidth;
		var width;

		slider.on("mouseover", function () {
			$(this).css("opacity", "0.6");
		});
		slider.on("mouseout", function () {
			if (!clickspot) {
				$(this).css("opacity", "0");
			}
		});
		slider.on("mousedown", function (event) {
			if (!clickspot) {
				clickspot = event;
				startwidth = column.width();
				return false;
			}
		});

		//$(".sidebar-toggler-resize").show();

		$(window).on("mouseup", function (event) {
			if (clickspot) {
				clickspot = false;
				$(this).css("opacity", "0");
				if (width != "undefined") {
					saveProfileProperty("sidebarwidth", width, function () {
						$(window).trigger("resize");
					});
				}
				return false;
			}
		});
		$(window).on("mousemove", function (event) {
			if (clickspot) {
				$(this).css("opacity", "0.6");
				width = 0;
				var changeleft = event.pageX - clickspot.pageX;
				width = startwidth + changeleft;
				width = width + 32;
				if (width < 200) {
					width = 200;
				}
				if (width > 380) {
					//break sidebarfilter columns
					column.addClass("sidebarwide");
				} else {
					column.removeClass("sidebarwide");
				}
				if (width > 500) {
					width = 500;
				}
				column.width(width);
				column.data("sidebarwidth", width);
				$(".pushcontent").css("margin-left", width + "px");
				event.preventDefault();
				$(window).trigger("resize");
				return false;
			}
		});
	});

	lQuery(".col-resize").livequery(function () {
		var slider = $(this);
		var column = $(this).closest(".col-main");
		var content = $(".pushcontent");

		var clickspot;
		var startwidth;
		var width;

		slider.on("mousedown", function (event) {
			if (!clickspot) {
				clickspot = event;
				startwidth = column.width();
				return false;
			}
		});

		//$(".sidebar-toggler-resize").show();

		$(window).on("mouseup", function (event) {
			if (clickspot) {
				clickspot = false;
				if (width != "undefined") {
					saveProfileProperty("sidebarwidth", width, function () {
						$(window).trigger("resize");
					});
				}
				return false;
			}
		});
		$(window).on("mousemove", function (event) {
			if (clickspot) {
				width = 0;
				var changeleft = event.pageX - clickspot.pageX;
				width = startwidth + changeleft;
				if (width < 200) {
					width = 200;
				}
				if (width > 480) {
					width = 480;
				}
				//console.log("W " , width);
				column.width(width);
				column.data("sidebarwidth", width);
				$(".pushcontent").css("margin-left", width + "px");
				event.preventDefault();
				$(window).trigger("resize");
				return false;
			}
		});
	});

	lQuery(".sidebarselected").livequery("click", function () {
		$("#sidebar-entities li").removeClass("current");
		$("#sidebar-list-upload").addClass("current");
	});

	//Moved From settings.js
	lQuery("#datamanager-workarea th.sortable").livequery("click", function (e) {
		var table = $("#main-results-table");
		var args = {
			oemaxlevel: 1,
			hitssessionid: table.data("hitssessionid"),
			origURL: table.data("origURL"),
			catalogid: table.data("catalogid"),
			searchtype: table.data("searchtype"),
		};
		var column = $(this);
		var fieldid = column.data("fieldid");

		if (column.hasClass("currentsort")) {
			if (column.hasClass("up")) {
				args.sortby = fieldid + "Down";
			} else {
				args.sortby = fieldid + "Up";
			}
		} else {
			$("#datamanager-workarea th.sortable").removeClass("currentsort");
			column.addClass("currentsort");
			column.addClass("up");
			args.sortby = fieldid + "Up";
		}
		$("#datamanager-workarea").load(
			apphome + "/views/settings/lists/datamanager/list/columnsort.html",
			args
		);
		e.stopPropagation();
	});

	lQuery(".tabnav a").livequery("click", function () {
		$(".tabnav a").removeClass("current");
		$(this).addClass("current");
	});

	lQuery("select.eventsjump").livequery("change", function () {
		var val = $(this).val();
		var url = $(this).data("eventurl");
		var targetdiv = $(this).data("targetdiv");

		$("#" + targetdiv).load(url + "?oemaxlevel=1&type=" + val, function () {
			$(window).trigger("resize");
		});
	});
	lQuery(".permissionsroles").livequery("change", function () {
		var val = $(this).val();
		var targetdiv = $(this).data("targetdiv");
		var url = $(this).data("urlprefix");
		var permissiontype = $(this).data("permissiontype");
		if (val == "new") {
			$("#" + targetdiv).load(
				url + "addnew.html?oemaxlevel=1&groupname=New",
				function () {
					$(window).trigger("resize");
				}
			);
			$("#module-picker").hide();
		} else {
			$("#" + targetdiv).load(
				url +
					"index.html?oemaxlevel=1&permissiontype=" +
					permissiontype +
					"&settingsgroupid=" +
					val,
				function () {
					$(window).trigger("resize");
				}
			);
			$("#module-picker").show();
		}
	});

	lQuery(".permission-radio").livequery("click", function () {
		var val = jQuery(this).val();

		if (val == "partial") {
			jQuery(this).parent().find(".sub-list").show();
		} else {
			jQuery(this).parent().find(".sub-list").hide();
		}
	});

	lQuery("#module-picker select").livequery("change", function () {
		var rolesval = $(".permissionsroles").val();
		var val = $(this).val();
		if (val == "all") {
			jQuery(".togglesection").show();
		} else {
			jQuery(".togglesection").hide();
			jQuery("." + val).show();
		}
	});

	function replaceAll(str, find, replace) {
		find = escapeRegExp(find);
		return str.replace(new RegExp(find, "g"), replace);
	}

	function escapeRegExp(str) {
		return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}

	lQuery("#setup-view").livequery("click", function () {
		if ($("#setup-view").hasClass("open")) {
			$("#views-header").height(44);
			$("#views-settings").hide();
			$("#setup-view").removeClass("open");
		} else {
			$("#views-header").height("auto");
			$("#views-settings").show();
			$("#setup-view").addClass("open");
		}
	});

	$("#renderastable").click(function () {
		if ($("#renderastable").is(":checked")) {
			$("#rendertableoptions").show();
		} else {
			$("#rendertableoptions").hide();
		}
	});

	lQuery(".sortviews").livequery(function () {
		var sortable = $(this);
		var path = sortable.data("path");
		if (typeof sortable.sortable == "function") {
			sortable.sortable({
				axis: "y",
				cancel: ".no-sort",
				update: function (event, ui) {
					//debugger;
					var data = sortable.sortable("serialize");
					data = replaceAll(data, "viewid[]=", "|");
					data = replaceAll(data, "&", "");
					data = data.replace("|", "");
					var args = {};
					args.items = data;
					args.viewpath = sortable.data("viewpath");
					args.searchtype = sortable.data("searchtype");
					args.assettype = sortable.data("assettype");
					args.viewid = sortable.data("viewid");
					$.ajax({
						data: args,
						type: "POST",
						url: path,
					});
				},
				stop: function (event, ui) {},
			});
		}
	});

	lQuery(".listsort").livequery(function () {
		var listtosort = $(this);
		if (typeof listtosort.sortable == "function") {
			listtosort.sortable({
				axis: "y",
				cancel: ".no-sort",
				stop: function (event, ui) {
					var path = $(this).data("path");

					var data = "";

					// var ids = new Array();
					$(this)
						.find("li")
						.each(function (index) {
							if (!$(this).hasClass("no-sort")) {
								var id = $(this).attr("id");
								data = data + "ids=" + id + "&";
							}
						});
					// POST to server using $.post or $.ajax
					$.ajax({
						data: data,
						type: "POST",
						url: path,
						success: function (data) {
							$(window).trigger("checkautoreload", [listtosort]);
						},
					});
				},
			});
		}
	});

	lQuery(".tablesort").livequery(function () {
		var listtosort = $(this);
		if (typeof listtosort.sortable == "function") {
			listtosort.sortable({
				axis: "y",
				cancel: ".no-sort",
				stop: function (event, ui) {
					var path = $(this).data("path");

					var data = "";

					// var ids = new Array();
					$(this)
						.find("tr")
						.each(function (index) {
							if (!$(this).hasClass("no-sort")) {
								var id = $(this).attr("id");
								data = data + "ids=" + id + "&";
							}
						});
					// POST to server using $.post or $.ajax
					$.ajax({
						data: data,
						type: "POST",
						url: path,
					});
				},
			});
		}
	});

	lQuery(".copytoclipboard").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();
		var btn = $(this);
		var copytextcontainer = btn.data("copytext");
		var copyText = $("#" + copytextcontainer);
		copyText.select();
		document.execCommand("copy");
		var alertdiv = btn.data("targetdiv");
		if (alertdiv) {
			console.log(copyText);
			$("#" + alertdiv)
				.show()
				.fadeOut(2000);
		}
	});

	lQuery(".favclick").livequery("click", function (e) {
		e.preventDefault();
		var item = $(this);
		var itemid = item.data("id");
		var moduleid = item.data("moduleid");
		var favurl = item.data("favurl");
		var targetdiv = item.data("targetdiv");
		var options = item.data();
		if (itemid) {
			if (item.hasClass("itemfavorited")) {
				jQuery.ajax({
					url:
						apphome +
						"/components/userprofile/favoritesremove.html?profilepreference=" +
						"favorites_" +
						moduleid +
						"&profilepreference.value=" +
						itemid,
					success: function () {
						//item.removeClass("ibmfavorited");
						jQuery.get(favurl, options, function (data) {
							$("." + targetdiv)
								.replaceWith(data)
								.hide()
								.fadeIn("slow");
						});
					},
				});
			} else {
				jQuery.ajax({
					url:
						apphome +
						"/components/userprofile/favoritesadd.html?profilepreference=" +
						"favorites_" +
						moduleid +
						"&profilepreference.value=" +
						itemid,
					success: function () {
						//item.addClass("ibmfavorited");
						jQuery.get(favurl, options, function (data) {
							$("." + targetdiv)
								.replaceWith(data)
								.hide()
								.fadeIn();
						});
					},
				});
			}
		}
	});

	lQuery(".seemorelink").livequery("click", function (e) {
		e.preventDefault();
		var textbox = $(this).data("seemore");
		if (textbox) {
			$("#" + textbox).removeClass("seemoreclosed");
			$(this).hide();
		}
	});

	lQuery("#assetcollectionresultsdialog .rowclick").livequery(
		"click",
		function (e) {
			closeemdialog($(this).closest(".modal"));
			var rowid = $(this).attr("rowid");
			$("#submitcollectionid").val(rowid);
			$("#colelectform").trigger("submit");
		}
	);

	lQuery(".copyembed").livequery("click", function (e) {
		e.preventDefault();
		var embedbtn = $(this);
		var loaddiv = embedbtn.data("targetdivinner");
		var nextpage = embedbtn.attr("href");
		jQuery.get(nextpage, function (data) {
			$("#" + loaddiv).html(data);
			var copyText = $("#" + loaddiv).children("textarea");
			if (typeof copyText != "undefined") {
				copyText.select();
				document.execCommand("copy");
			}
			$(window).trigger("resize"); //need this?
		});
	});

	lQuery(".toggle-upload-details").livequery("click", function (e) {
		toggleuploaddetails($(this));
	});

	toggleuploaddetails = function (detail, status = "") {
		if (status == "") {
			status = detail.data("status");
		}
		if (status == "open") {
			detail.next(".toggle-content").hide();
			detail
				.children(".fas")
				.removeClass("fa-caret-down")
				.addClass("fa-caret-right");
			detail.data("status", "closed");
		} else {
			detail.next(".toggle-content").show();
			detail
				.children(".fas")
				.removeClass("fa-caret-right")
				.addClass("fa-caret-down");
			detail.data("status", "open");
		}
	};

	lQuery(".togglesharelink").livequery("change", function (e) {
		var url = $("input.sharelink").val();
		var value = $(this).data("value");
		if (url.includes(value)) {
			url = url.replace("?" + value, "");
		} else {
			url = url + "?" + value;
		}
		$("span.sharelink").html(url);
		$("input.sharelink").val(url);
	});

	lQuery(".reloadcontainer").livequery("click", function (event) {
		event.preventDefault();
		var link = $(this);
		if (link.data("reloadcontainer")) {
			var container_ = link.data("reloadcontainer");
			var container = $("#" + container_);
			if (container.length) {
				autoreload(container);
			}
		}
		return;
	});

	$(document).keydown(function (e) {
		switch (e.which) {
			case 27: //esckey
				var ismodal = $(".modal.onfront");
				if (ismodal.length) {
					// Close modal only
					closeemdialog(ismodal);
					e.stopPropagation();
					e.preventDefault();
				} else {
					hideOverlayDiv(getOverlay());
				}

				return;
				break;

			default:
				return; // exit this handler for other keys
		}
	});

	lQuery(".emcarousel-link").livequery("click", function (e) {
		e.preventDefault();
		var image = $("#emcarousel-image");
		var link = $(this);
		image.attr("src", link.attr("href"));
		image.attr("alt", link.attr("title"));
		image.data("assetid", link.data("assetid"));
	});
	
	lQuery(".actions-enable-checkbox").livequery("change", function (e) { 
		var parent = $(this).closest(".actions-row");
		var actions = parent.find(".actions-elements");
		var status = true;		
		if(actions.hasClass("actions-disabled")) {
			status= false;
		}
		
		actions.find(".action-control").each(function(){
				var control = $(this);
				control.prop("disabled", status);
		});
		
		actions.toggleClass("actions-disabled");
	});
	
	
}; // uiload

function formsavebackbutton(form) {
	var savedcontainer = $(".enablebackbtn");
	if (savedcontainer.length) {
		var parent = savedcontainer.parent().closest(".entitydialog");
		tabbackbutton(parent);
	}
}

function tabbackbutton(parent) {
	var parentid = "";
	if (parent.length) {
		parentid = parent.data("entityid");
	}

	if (parentid != "") {
		//var container = parent.find('.entitydialog');
		var backbtn = $(".entitydialogback");
		$(backbtn).show();
		$(backbtn).data("parentid", parentid);
		$(backbtn).data("parentcontainerid", parent.attr("id"));
		$(backbtn).data("urlbar", parent.data("urlbar"));
	}
}

function switchsubmodulebox(item) {
	var parent = item.closest(".editentitymetadata-submodule");
	var results = item.data("targetdiv");
	parent.find("#" + results).hide("fast");
	parent.addClass("editingsubmodule");
	item.hide();
}

replaceelement = function (url, div, options, callback) {
	jQuery.ajax({
		url: url,
		async: false,
		data: options,
		success: function (data) {
			//Look for img and add ?cache=false
			div.replaceWith(data);

			if (callback && typeof callback === "function") {
				//make sure it exists and it is a function
				callback(); //execute it
			}
		},
		xhrFields: {
			withCredentials: true,
		},
		crossDomain: true,
	});
};

autoreload = function (div, callback) {
	var url = div.data("url");
	if (url != undefined) {
		var options = div.data();
		replaceelement(url, div, options, callback);
		jQuery(window).trigger("resize");
	}
};

$(window).on("checkautoreload", function (event, indiv) {
	var classes = indiv.data("ajaxreloadtargets"); //assetresults, projectpage, sidebaralbums
	if (classes) {
		var splitnames = classes.split(",");
		$.each(splitnames, function (index, classname) {
			$("." + classname).each(function (index, div) {
				autoreload($(div));
			});
		});
	}
});

lQuery(".fieldsParent").livequery("refreshFields", function () {
	autoreload($(this));
});

function isInViewport(cell) {
	const rect = cell.getBoundingClientRect();
	var isin =
		rect.top >= 0 &&
		rect.top <= (window.innerHeight || document.documentElement.clientHeight);
	return isin;
}

var ranajaxon = {};
var ranajaxonrunning = false;

runajaxstatus = function () {
	//for each asset on the page reload it's status
	//console.log(uid);

	for (const [uid, enabled] of Object.entries(ranajaxon)) {
		if (!enabled || enabled === undefined) {
			continue;
		}
		var cell = $("#" + uid);
		if (cell.length == 0) {
			continue;
		}
		if (!isInViewport(cell[0])) {
			continue;
		}
		var path = cell.attr("ajaxpath");
		if (!path || path == "") {
			path = cell.data("ajaxpath");
		}
		//console.log("Loading " + path );
		if (path && path.length > 1) {
			var entermediakey = "";
			if (app && app.data("entermediakey") != null) {
				entermediakey = app.data("entermediakey");
			}
			var data = cell.cleandata();
			jQuery.ajax({
				url: path,
				async: false,
				data: data,
				success: function (data) {
					cell.replaceWith(data);
					$(window).trigger("checkautoreload", [cell]);
					$(window).trigger("resize");
				},
				xhrFields: {
					withCredentials: true,
				},
				crossDomain: true,
			});
		}
	}

	setTimeout("runajaxstatus();", 1000); //Start checking
};

var resizecolumns = function () {
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
};

var resizesearchcategories = function () {
	var container = $("#sidecategoryresults");
	if (!container) {
		return;
	}
	var w = container.width();
	var h = container.height();

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

lQuery(".ajaxstatus").livequery(function () {
	var uid = $(this).attr("id");

	var iscomplete = $(this).data("ajaxstatuscomplete");

	if (iscomplete) {
		ranajaxon[uid] = false;
	} else {
		var inqueue = ranajaxon[uid];
		if (inqueue == undefined) {
			ranajaxon[uid] = true;
		}
	}
	if (ranajaxonrunning == false) {
		setTimeout("runajaxstatus();", 500); //Start checking
		ranajaxonrunning = true;
	}
});

lQuery(".changeimportmodule").livequery("change", function () {
	var select = $(this);
	var moduleid = select.val();

	app = $("#application");
	siteroot = app.data("siteroot");
	apphome = siteroot + app.data("apphome");
	var property = "desktop_lastselected_module";

	var targetdiv = select.data("targetdiv");

	jQuery.ajax({
		url:
			apphome +
			"/views/modules/" +
			moduleid +
			"/components/sidebars/localdrives/index.html?profilepreference=" +
			property +
			"&profilepreference.value=" +
			moduleid,
		success: function (data) {
			var cell = $("#" + targetDiv);
			cell.replaceWith(data);
		},
		xhrFields: {
			withCredentials: true,
		},
		crossDomain: true,
	});
});

//TODO: Move these to a jquery plugin
var resizegallery = function () {
	var container = $("#emslidesheet");
	if (container.length) {
		var containerw = container.width();
		var boxes = Math.floor(containerw / 230);
		var boxw = Math.floor(containerw / boxes) - 12;
		$("#emslidesheet .emthumbbox").width(boxw);
	}
};

adjustdatamanagertable = function () {
	if ($(".datamanagertable").length) {
		var height = $(window).height();
		$(".datamanagertable").height(height - 320);
	}
};

jQuery(document).ready(function () {
	uiload();
	jQuery(window).trigger("resize");

	window.onhashchange = function () {
		$("body").css({ overflow: "visible" }); //Enable scroll
		$(window).trigger("resize");
	};
});

function posiitionSubmitButtons() {
	var submitBtns = $(".form-submit-btns");
	console.log(submitBtns);
	if (!submitBtns.length) return;
	var offsetTop = submitBtns.offset().top;
	if (offsetTop > $(window).height()) {
		submitBtns.css({
			position: "sticky",
			bottom: 0,
			left: 0,
			zIndex: "1000",
			margin: 0,
			padding: 8,
			background: "var(--themed-light-bg)",
			borderTop: "var(--1px-light)",
		});
	}
}
posiitionSubmitButtons();
lQuery(".form-submit-btns").livequery(function () {
	posiitionSubmitButtons();
});

jQuery(window).on("resize", function () {
	adjustdatamanagertable();
	resizesearchcategories();
	resizecolumns();
	//posiitionSubmitButtons();
});

jQuery(document).on("domchanged", function () {
	//gridResize();
	//resizecolumns();
	//jQuery(window).trigger("resize");
});

jQuery(document).on("emtreeselect", function (event) {
	var treename = event.tree.data("treename");
	if (treename == "sidebarCategories") {
		var selectednode = event.nodeid;
		$("#parentfilter").val(selectednode);

		$("#autosubmitfilter").trigger("submit");
	}
	return false;
});

jQuery(window).on("ajaxsocketautoreload", function () {
	$(".ajaxsocketautoreload").each(function () {
		var cell = $(this);
		var path = cell.data("ajaxpath");
		jQuery.ajax({
			url: path,
			async: false,
			data: {},
			success: function (data) {
				cell.replaceWith(data);
			},
			xhrFields: {
				withCredentials: true,
			},
			crossDomain: true,
		});
	});
});
