jQuery(document).ready(function (url, params) {
	var appdiv = $("#application");
	var apphome = appdiv.data("apphome");
	var siteroot = appdiv.data("siteroot") + appdiv.data("apphome");
	var componenthome = appdiv.data("siteroot") + appdiv.data("componenthome");

	var header = $("#header");

	var headerHeight = header.outerHeight(true);
	if (!headerHeight) {
		headerHeight = 0;
	}

	lQuery("div.masonry-grid").livequery(function () {
		$(this).brick();
	});

	lQuery("div.brickvertical").livequery(function () {
		$(this).brickvertical();
	});

	lQuery("#entityNavBarContainer").livequery(function () {
		var _top = headerHeight;
		$(this).css("top", _top + "px");
		_top += $(this).outerHeight(true);
		var breadCrumbContainer = $("#breadCrumbContainer");
		if (breadCrumbContainer) {
			breadCrumbContainer.css("top", _top + "px");
		}
		_top += breadCrumbContainer.outerHeight(true);
		var defaultExpandedModule = $("#defaultExpandedModule");
		if (defaultExpandedModule.length) {
			defaultExpandedModule.css("top", _top + "px");
		}
		var assetresultscontainer = $("#assetresultscontainer");
		if (assetresultscontainer.length) {
			assetresultscontainer.css("top", _top + "px");
		}
	});

	lQuery("#assetlocked").livequery("change", function () {
		var locked = $(this).prop("checked");
		var uncheckedlabel = $(this).data("uncheckedlabel");
		var checkedlabel = $(this).data("checkedlabel");
		var user = $(this).data("user");
		if (locked) {
			$(this)
				.next("label")
				.html(checkedlabel + " <strong>" + user + "</strong>");
		} else {
			$(this).next("label").text(uncheckedlabel);
		}
	});

	var refreshdiv = function (targetdiv, url, params) {
		jQuery.ajax({
			url: url,
			async: false,
			data: params,
			success: function (data) {
				targetdiv.replaceWith(data);
			},
			xhrFields: {
				withCredentials: true,
			},
			crossDomain: true,
		});
	};

	$(".emlogo").click(function (e) {
		e.preventDefault();
		var href = $(this).attr("href");
		var url = window.location.href;
		if (href === url) {
			if (window.screenY > 0) {
				window.focus();
				window.scrollTo({
					top: 0,
					behavior: "smooth",
				});
			}
			$("#emselectable").animate({ scrollTop: 0 }, 500);
		} else {
			window.location.href = href;
		}
	});

	lQuery(".formatDate").livequery(function () {
		var _this = $(this);
		_this.each(function () {
			var datetype = _this.data("datetype");
			var fDate = [];
			var dates = [];
			if (datetype === "betweendates") {
				dates = _this.text().split("-");
			} else {
				dates.push(_this.text());
			}
			dates.forEach(function (date) {
				var d = new Date(date).toDateString();
				if (d == "Invalid Date") {
					return;
				}
				var date = d.substring(4, 15);
				fDate.push(date);
			});
			_this.html(fDate.join(" &mdash; "));
		});
	});

	lQuery("select#selectresultview").livequery(function () {
		var select = $(this);
		var resultsdiv = select.closest(".resultsdiv");

		select.on("change", function () {
			var searchhome = resultsdiv.data("searchhome");
			var href = searchhome + "/changeresultview.html";
			resultsdiv.data("url", href);

			var resultviewselected = select.val();
			resultsdiv.data("changeresultview", resultviewselected);

			if (
				resultviewselected == "stackedgallery" ||
				resultviewselected == "brickvertical"
			) {
				resultsdiv.data("page", "1");
			}
			resultsdiv.data("noToast", true);
			resultsdiv.runAjax();
		});
	});

	lQuery(".hitsperpagechange").livequery(function () {
		var select = $(this);

		var resultsdiv = select.closest(".resultsdiv");

		select.on("change", function () {
			if (resultsdiv.data("oemaxlevel") === undefined) {
				resultsdiv.data("oemaxlevel", "1");
			}

			var searchhome = resultsdiv.data("searchhome");
			resultsdiv.data("url", searchhome + "/changehitsperpage.html");
			resultsdiv.data("hitsperpage", select.val());
			resultsdiv.data("noToast", true);
			resultsdiv.runAjax();
		});
	});

	lQuery("input#jumptopageresults").livequery(function () {
		var input = $(this);
		input.on("keydown", function (e) {
			if (e.key === "Enter" || e.keyCode === 13) {
				var page = input.val();
				var maxpage = input.data("maxpage");

				if (!page || page < 1 || page > maxpage) {
					alert(
						"Invalid page number. Enter a number between 1 - " + maxpage + "."
					);
					input.val("");
					return;
				}
				var url = input.data("url");
				input.data("url", url + page);
				var urlbar = input.data("urlbar");
				if(urlbar !== undefined)
				{
					input.data("urlbar", urlbar + page);
				}
				input.data("noToast", true);
				input.runAjax();
			}
		});
	});

	lQuery(".filterschangesort").livequery("click", function (e) {
		// debugger;
		e.preventDefault();
		var sirtbyfield = $(this).data("sortbyfield");
		var dropdown = $("#" + sirtbyfield);
		var up = dropdown.data("sortup");
		var selected = dropdown.find(":selected");
		var id = selected.data("detailid");
		var icon = $(this).find("i");
		if (up) {
			selected.attr("value", id + "Down");
			icon.removeClass("fa-sort-alpha-down");
			icon.addClass("fa-sort-alpha-up");

			dropdown.data("sortup", false);
		} else {
			selected.attr("value", id + "Up");
			icon.removeClass("fa-sort-alpha-up");
			icon.addClass("fa-sort-alpha-down");

			dropdown.data("sortup", true);
		}
		var form = selected.closest("form");
		form.trigger("submit");
		return false;
	});

	//clearfiltersearch

	lQuery(".clearfiltersearch").livequery("click", function (e) {
		// debugger;
		var box = $(this).parent().find(".inlinefiltersearch");
		if (box.length) {
			box.val("");
		}
		$(this).hide();
	});

	lQuery(".inlinefiltersearch").livequery("keydown", function (e) {
		if (e.which == 13) {
			$(".clearfiltersearch").show();
		}
	});

	lQuery("a.clearsearchbar").livequery("click", function () {
		$("#mainsearchvalue").val("");
	});

	lQuery(".resultsheader").livequery(function () {
		if ($(this).hasClass("hasselections")) {
			$(this).parent().find("#unselectall").show();
		} else {
			$(this).parent().find("#unselectall").hide();
		}
	});

	lQuery(".gallery-checkbox input").livequery("click", function () {
		if ($(this).is(":checked")) {
			$(this).closest(".emthumbbox").addClass("selected");
		} else {
			$(this).closest(".emthumbbox").removeClass("selected");
		}
	});

	lQuery(".moduleselectionbox").livequery("click", function (e) {
		e.stopPropagation();

		var dataid = $(this).data("dataid");
		var sessionid = $(this).data("hitssessionid");

		$.get(componenthome + "/moduleresults/selections/toggle.html", {
			dataid: dataid,
			hitssessionid: sessionid,
		});

		return;
	});

	autosubmitformtriggers = function (form) {
		if ($(form).hasClass("autosubmitform")) {
			$("select", form).on("select2:select", function () {
				if (!$(this).hasClass("cancelautosubmit")) {
					form.trigger("submit");
				}
			});
			$("select", form).on("select2:unselect", function () {
				if (!$(this).hasClass("cancelautosubmit")) {
					$("#filtersremoveterm", form).val($(this).data("searchfield"));
					form.trigger("submit");
				}
			});
			$("input[type=checkbox]", form).change(function () {
				if ($(this).hasClass("filtercheck")) {
					var fieldname = $(this).data("fieldname");
					var fieldtype = $(this).data("fieldtype");
					if (fieldtype == "boolean") {
						if ($("#filtersremoveterm", form).length) {
							$("#filtersremoveterm", form).val(fieldname);
						}
					}
					var boxes = $(".filtercheck" + fieldname + ":checkbox:checked", form);
					if (boxes.length == 0) {
						if ($("#filtersremoveterm", form).length) {
							$("#filtersremoveterm", form).val(fieldname);
						}
					}
				} else {
					var parent = $(this).closest(".boolean-switches");
					if ($(this).hasClass("true-switch")) {
						parent.find(".false-switch").prop("checked", false);
					} else {
						parent.find(".true-switch").prop("checked", false);
					}
				}
				form.trigger("submit");
			});
			$("input[type=radio], .selectbox", form).change(function () {
				form.trigger("submit");
			});

			$("input[type=text]", form)
				.not(".datepicker")
				.change(function () {
					form.trigger("submit");
				});
		}
	};

	lQuery(".autosubmitform").livequery(function () {
		autosubmitformtriggers($(this));
	});

	$(".autosubmitform").on("submit", function () {
		var form = $(this);
		// Remove required from Filters Form
		if (form.hasClass("filterform")) {
			$(".required", form).each(function () {
				$(this).removeClass("required");
			});
		}
		if (form.valid()) {
			return true;
		}
		return false;
	});

	overlayResize = function () {
		var img = $("#hiddenoverlay #main-media");
		var avwidth = $(window).width();
		var wheight = $(window).height();
		var overlay = $("#hiddenoverlay");
		overlay.height(wheight);
		overlay.width(avwidth);
		var w = parseInt(img.data("width"));
		var h = parseInt(img.data("height"));

		$("#hiddenoverlay .playerarea").width(avwidth);

		var avheight = $(window).height() - 65;
		if (!isNaN(w) && w != "") {
			w = parseInt(w);

			var newh = Math.floor((avwidth * h) / w);
			var neww = Math.max(avwidth, Math.floor((avwidth * w) / h));
			img.width(avwidth);
			img.css("height", "auto");
			// Only if limited by height

			if (newh > avheight) {
				img.height(avheight);
				img.css("margin-top", "0px");
				// var neww2 = Math.floor( avheight * w / h );
				// img.width(neww2);
				img.css("width", "auto");
				img.css("height", avheight);
			} else {
				var remaining = avheight - newh;

				if (remaining > 0) {
					remaining = Math.floor(remaining / 2);
					img.css("margin-top", remaining + "px");
				} else {
					img.css("margin-top", "0px");
				}
			}
			// img.css("height", avheight);
		} else {
			/*
			 * img.width(avwidth); //img.css("height", "auto");
			 * img.css("height", avheight); img.css("margin-top","0px");
			 */
		}
	};
	$(window).resize(function () {
		overlayResize(); // TODO: Add this to the shared
	});

	$.fn.exists = function () {
		return this.length !== 0;
	};

	getCurrentAssetId = function () {
		var assetdialog = $("#main-media-viewer");
		return assetdialog.data("assetid");
	};

	function enable(inData, inSpan) {
		if (inData == "") {
			$(inSpan).addClass("arrowdisabled");
			$(inSpan).data("enabled", "false");
			$(inSpan).attr("data-enabled", "false");
		} else {
			$(inSpan).addClass("arrowenabled");
			$(inSpan).data("enabled", "true");
			$(inSpan).attr("data-enabled", "true");
		}
	}
	disposevideos = function () {
		// Stop/Dispose Videos
		$(".video-js, .video-player").each(function () {
			if (this.id) {
				videojs(this.id).dispose();
			}
		});
		//Stop Audios
		$.jPlayer.pause();
	};
	hideOverlayDiv = function (inOverlay) {
		// debugger;
		disposevideos();
		stopautoscroll = false;
		$("body").css({ overflow: "auto" });
		inOverlay.hide();
		inOverlay.removeClass("show");
		if ($(".modal.behind").length) {
			adjustZIndex($(".modal.behind"));
		}

		var reloadonclose = $("#resultsdiv").data("reloadresults");
		if (reloadonclose == undefined) {
			reloadonclose = false;
		}
		if (reloadonclose) {
			refreshresults();
		} else {
			//$(document).trigger("domchanged");
			$(window).trigger("resize");
			// gridResize();
		}
		var assetdetaileditor = $("#asset-detail-editor");
		$(window).trigger("checkautoreload", [assetdetaileditor]);

		var lastscroll = getOverlay().data("lastscroll");
		// remove Asset #hash
		history.replaceState(null, null, " ");
		$(window).scrollTop(lastscroll);
		jQuery(window).trigger("resize");
	};

	showOverlayDiv = function (inOverlay) {
		stopautoscroll = true;
		$("body").css({ overflow: "hidden" });
		inOverlay.show();

		adjustZIndex(inOverlay);

		inOverlay.addClass("show");
		var lastscroll = $(window).scrollTop();
		getOverlay().data("lastscroll", lastscroll);
	};

	showAsset = function (element, assetid, pagenum) {
		if (assetid) {
			var assetdialog = $("#main-media-container");

			var tmpedithomeid = assetdialog.data("originaledithomeid");
			assetdialog.data("edithomeid",tmpedithomeid);

			var overlay = getOverlay();

			assetdialog.data("pageheight",$(window).height() - 100);

			window.location.hash = "asset-" + assetid;
			disposevideos();
			
			assetdialog.runAjax(function()
			{
				showOverlayDiv(overlay);

				//assetdialog = $("#main-media-viewer");
				//$(".gallery-thumb").removeClass("active-asset");

			});
		}
	};
	initKeyBindings = function (hidden) {
		$(document).keydown(function (e) {
			if (hidden && !hidden.is(":visible")) {
				return;
			}
			var target = e.target;
			if ($(target).is("input") || $(target).is(".form-control")) {
				return;
			}
			switch (e.which) {
				case 37: // left
					var div = $("#main-media-viewer");
					var id = div.data("previous");
					if (id) {
						showAsset(div, id);
					}
					break;

				case 39: // right
					var div = $("#main-media-viewer");
					var id = div.data("next");
					if (id) {
						showAsset(div, id);
					}
					break;

				// TODO: background window.scrollTo the .masonry-grid-cell we
				// view, so we can reload hits

				case 27000: // esc  MOVED TO UI-COMPONENTS
					var ismodal = $("#modals, #inlineedit, .modal");
					if (ismodal.hasClass("show")) {
						// Close modal only
						closeemdialog(ismodal);
						e.stopPropagation();
						return;
					} else {
						hideOverlayDiv(getOverlay());
					}
					break;

				default:
					return; // exit this handler for other keys
			}
			e.preventDefault(); // prevent the default action (scroll / move
			// caret)
		});
	};

	getOverlay = function () {
		var hidden = $("#hiddenoverlay");
		if (hidden.length == 0) {
			var grid = $(".masonry-grid");
			var href = grid.data("viewertemplate");
			if (href == null) {
				href = apphome + "/views/modules/asset/mediaviewer/fullscreen/index.html";
			}

			$.ajax({
				url: href,
				async: false,
				data: { oemaxlevel: 1 },
				success: function (data) {
					$("#application").append(data);
					hidden = $("#hiddenoverlay");
					initKeyBindings(hidden);
				},
			});
		}
		hidden = $("#hiddenoverlay");

		return hidden;
	};

	refreshresults = function () {
		var resultsdiv = $("#resultsdiv");
		if (resultsdiv.length) {
			var href = siteroot + "/views/search/index.html";
			var searchdata = resultsdiv.data();
			searchdata.oemaxlevel = 1;
			searchdata.cache = false;
			$.ajax({
				url: href,
				async: false,
				data: searchdata,
				success: function (data) {
					$("#filteredresults").html(data);
					$(window).trigger("resize");
				},
			});
		}
	};

	lQuery("#jumptoform .jumpto-left").livequery("click", function (e) {
		e.preventDefault();
		var input = $("#jumptoform #pagejumper");
		var current = input.val();
		current = parseInt(current);
		current--;
		if (current > 0) {
			input.val(current);
			$("#jumptoform").submit();
		} else {
			$("#jumptoform .jumpto-left").addClass("invisible");
		}

		$("#jumptoform .jumpto-right").removeClass("invisible");
	});

	lQuery("#jumptoform .jumpto-right").livequery("click", function (e) {
		e.preventDefault();
		var input = $("#jumptoform #pagejumper");
		var current = input.val();
		current = parseInt(current);
		current++;
		var totalpages = $("#jumptoform").data("totalpages");
		totalpages = parseInt(totalpages);
		if (current <= totalpages) {
			input.val(current);
			$("#jumptoform").submit();
		}
		if (current >= totalpages) {
			$("#jumptoform .jumpto-right").addClass("invisible");
		}
		$("#jumptoform .jumpto-left").removeClass("invisible");
	});

	lQuery(".goleftclick").livequery("click", function (e) {
		e.preventDefault();
		var div = $("#main-media-viewer");
		var id = div.data("previous");
		var enabled = $(this).data("enabled");
		if (id && enabled) {
			showAsset($(this), id);
		}
	});

	lQuery(".gorightclick").livequery("click", function (e) {
		e.preventDefault();
		var div = $("#main-media-viewer");
		var id = div.data("next");
		var enabled = $(this).data("enabled");
		if (id && enabled) {
			showAsset($(this), id);
		}
	});

	lQuery(".carousel-indicators li#leftpage").livequery("click", function (e) {
		e.preventDefault();
		var div = $("#main-media-viewer");
		var id = div.data("previouspage");
		if (id) {
			showAsset($(this), id);
		}
	});
	lQuery(".carousel-indicators li#rightpage").livequery("click", function (e) {
		e.preventDefault();
		var div = $("#main-media-viewer");
		var id = div.data("nextpage");
		if (id) {
			showAsset($(this), id);
		}
	});

	lQuery("#main-media").livequery("swipeleft", function () {
		var div = $("#main-media-viewer");
		var id = div.data("next");
		if (id) {
			showAsset($(this), id);
		}
	});
	lQuery("#main-media").livequery("swiperight", function () {
		var div = $("#main-media-viewer");
		var id = div.data("previous");
		if (id) {
			showAsset($(this), id);
		}
	});

	lQuery("a.stackedplayer").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();
		var link = $(this);
		link.data("includeeditconext",true);
		link.data("includesearchconext",true);
		link.data("dialogid","mediaviewer");
		//var url = link.attr("href");
		link.data("url",apphome + "/views/modules/asset/mediaviewer/fullscreen/currentasset.html")
		
		link.emDialog();
		return false;
	});

	// Select multiple assets with Shift+Mouse
	var isMouseDown = false;
	var currentCol;
	lQuery(".stackedplayertable td").livequery("mousedown", function (e) {
		isMouseDown = true;
		if (e.shiftKey) {
			var row = $(this).closest("tr");
			currentCol = row.data("rowid");
			if (currentCol) {
				// row.toggleClass("emrowselected");
				var isHighlighted = row.hasClass("emrowselected");
				var chkbox = row.find(".selectionbox");
				$(chkbox).prop("checked", true);
				$(chkbox).trigger("change");
			}
		}
		return false; // Prevent text selection
	});

	lQuery(".stackedplayertable td").livequery("mouseover", function (e) {
		if (isMouseDown && e.shiftKey) {
			// Mouse + Shift Key
			var row = $(this).closest("tr");
			var currentColDown = row.data("rowid");
			var isHighlighted = row.hasClass("emrowselected");
			if (currentColDown && !isHighlighted) {
				// row.toggleClass("emrowselected", isHighlighted);
				var chkbox = row.find(".selectionbox");
				$(chkbox).prop("checked", true);
				$(chkbox).trigger("change");
			}
		}
	});

	$(window).mouseup(function () {
		isMouseDown = false;
	});

	lQuery(".stackedplayertable tr td").livequery("click", function (e) {
		var clicked = $(this);
		if (clicked.attr("noclick") == "true") {
			e.stopPropagation();
			return true;
		}
	});

	// Click on asset
	var selectStart = null;
	// Table clicking
	lQuery(".stackedplayertable tr").livequery("click", function (e) {
		var clicked = $(this);
		/*	if (clicked.find("td:first").attr("noclick") == "true") {
			return true;
		}*/
		var pickerresults = clicked.closest(".pickerresults");
		if (clicked.hasClass("resultsdivdata") && pickerresults.length > 0) {
			return;
		}
		if ($(e.target).is("input") || $(e.target).is("a")) {
			return true;
		}
		// click+ctrl
		if (e.ctrlKey) {
			var chkbox = clicked.find(".selectionbox");
			if (chkbox) {
				var ischecked = $(chkbox).prop("checked");
				if (!ischecked || ischecked == "true") {
					$(chkbox).prop("checked", true);
				} else {
					$(chkbox).prop("checked", false);
				}
				$(chkbox).trigger("change");
			}
			return false;
		}
		// click+shift
		if (e.shiftKey) {
			if (selectStart == null) {
				selectStart = clicked;
			} else {
				var selectEnd = clicked;
				if (selectStart) {
					$(selectStart)
						.nextUntil($(selectEnd))
						.each(function () {
							var chkbox = $(this).find(".selectionbox");
							if (chkbox) {
								var ischecked = $(chkbox).prop("checked");
								if (!ischecked || ischecked == "true") {
									$(chkbox).prop("checked", true);
								} else {
									$(chkbox).prop("checked", false);
								}
								$(chkbox).trigger("change");
							}
						});
					selectStart = null;
					selectEnd = null;
				}
			}
			return false;
		}
		e.preventDefault();
		e.stopPropagation();

		var assetid = clicked.data("dataid");

		showAsset(clicked, assetid);
	});
	// Gallery clicking
	lQuery(".emgallery .emthumbimage").livequery("click", function (e) {
		var clicked = $(this);
		// click+ctrl
		if (ctrlPressed) {
			var chkbox = clicked.closest(".emboxthumb").find(".selectionbox");
			if (chkbox) {
				var ischecked = $(chkbox).prop("checked");
				if (!ischecked || ischecked == "true") {
					$(chkbox).prop("checked", true);
				} else {
					$(chkbox).prop("checked", false);
				}
				$(chkbox).trigger("change");
			}
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
		// click+shift
		if (e.shiftKey) {
			if (selectStart == null) {
				selectStart = $(clicked).closest(".emboxthumb");
			} else {
				var selectEnd = $(clicked).closest(".emboxthumb");
				if (selectStart) {
					$(selectStart)
						.nextUntil($(selectEnd))
						.each(function () {
							var chkbox = $(this).find(".selectionbox");
							if (chkbox) {
								var ischecked = $(chkbox).prop("checked");
								if (!ischecked || ischecked == "true") {
									$(chkbox).prop("checked", true);
								} else {
									$(chkbox).prop("checked", false);
								}
								$(chkbox).trigger("change");
							}
						});
					selectStart = null;
					selectEnd = null;
				}
			}
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	});

	//Launch the Dialog? Use a parmeter check instead
	openEntity = function (entityid) {
		var entity = $(".showentity");
		if (entity.length) {
			var resultsdiv = $(".resultsdiv");
			var moduleid = resultsdiv.data("moduleid");
			var searchhome = resultsdiv.data("searchhome");
			if (searchhome) {
				var url = searchhome + "/tabs/index.html";
				entity.data("targetlink", url);
				entity.data("updateurl", true);
				entity.data("urlbar", window.location.href);
				var currenturl = window.location.origin + window.location.pathname;
				history.pushState($("#application").html(), null, currenturl);

				entity.emDialog();
			}
		}
	};

	// Selections
	function handRowSelection(clicked) {
		var resultsdiv = clicked.closest(".resultsdiv");

		if (resultsdiv.length) {
			var ischecked = clicked.prop("checked");
			if (ischecked == true) {
				clicked.closest(".resultsassetcontainer").addClass("emrowselected");
			} else {
				clicked.closest(".resultsassetcontainer").removeClass("emrowselected");
			}

			var resultsheader = resultsdiv.find(".resultsheader");
			clicked.data("selectedtargetdiv", resultsheader);
			clicked.data("oemaxlevel", "1");
			clicked.data("includesearchcontext", true);
			clicked.data("includeeditcontext", true);

			var searchhome = resultsdiv.data("searchhome");
			clicked.data("url", searchhome + "/toggle.html");
			clicked.data("noToast", true);
			clicked.runAjax();

			//$(".assetproperties").trigger("click");
		}
	}

	lQuery("div.toggle-selection").livequery("click", function () {
		var pickerresults = $(this).closest(".pickerresults");
		if (pickerresults.length) {
			return;
		}
		var checkbox = $(this)
			.parent()
			.siblings("input.resultsselection.selectionbox");
		checkbox.prop("checked", !checkbox.prop("checked"));
		handRowSelection(checkbox);
	});

	lQuery("input.resultsselection.selectionbox").livequery(
		"change",
		function () {
			handRowSelection($(this));
		}
	);

	lQuery("input[name=pagetoggle]").livequery("click", function () {
		var clicked = $(this);
		var resultsdiv = clicked.closest(".resultsdiv");

		var status = clicked.is(":checked");

		var searchhome = resultsdiv.data("searchhome");

		var action;
		if (status) {
			action = "page";
			$(".selectionbox", resultsdiv).prop("checked", true);
		} else {
			action = "pagenone";
			$(".selectionbox", resultsdiv).prop("checked", false);
		}

		var resultsheader = resultsdiv.find(".resultsheader");

		clicked.data("selectedtargetdiv", resultsheader);
		clicked.data("action", action);
		clicked.data("oemaxlevel", "1");
		clicked.data("includesearchcontext", true);
		clicked.data("includeeditcontext", true);
		clicked.data("url", searchhome + "/togglepage.html");
		clicked.data("noToast", true);
		clicked.runAjax();
	});

	lQuery("a.selectpage").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();
		var selectpage = $(this);
		var resultsdiv = selectpage.closest(".resultsdiv");
		if (!resultsdiv.length) {
			resultsdiv = $("#resultsdiv");
		}
		var action = selectpage.data("action");

		$(".selectionbox", resultsdiv).prop("checked", action != "none");
		$("input[name=pagetoggle]", resultsdiv).prop("checked", action != "none");
		var resultsheader = resultsdiv.find(".resultsheader");
		selectpage.data("selectedtargetdiv", resultsheader);

		selectpage.data("oemaxlevel", "1");
		selectpage.runAjax();
	});

	lQuery(".showasset").livequery("click", function (e) {
		var clicked = $(this);
		if (clicked.attr("noclick") == "true") {
			return true;
		}

		e.preventDefault();
		e.stopPropagation();

		var assetid = clicked.data("assetid");
		showAsset(clicked, assetid);
	});

	lQuery("a#multiedit-menu").livequery("click", function (e) {
		e.preventDefault();
		var link = $(this);
		var assetid = link.data("assetid");
		showAsset(link, assetid, 1);
		return false;
	});

	lQuery("#hiddenoverlay .overlay-close").livequery("click", function (e) {
		e.preventDefault();
		hideOverlayDiv(getOverlay());
	});

	lQuery("#hiddenoverlay .overlay-popup span").livequery("click", function (e) {
		e.preventDefault();
		// editor/viewer/index.html?hitssessionid=${hits.getSessionId()}&assetid=${hit.id}
		var hitssessionid = $("#resultsdiv").data("hitssessionid");
		var href =
			home +
			"/views/modules/asset/editor/viewer/index.html?hitssessionid=" +
			hitssessionid +
			"&assetid=" +
			getCurrentAssetId();
		window.location = href;
	});

	lQuery(".tableresultsaddcolumn").livequery("change", function () {
		var selector = $(this);
		var targetdiv = selector.data("targetdiv");
		var selectedval = $(this).val();
		if (selectedval) {
			var link = selector.data("componenthome");
			var args = {
				addcolumn: selectedval,
				oemaxlevel: selector.data("oemaxlevel"),
			};

			// jQuery("#"+targetdiv).load(link);
			$.get(link, args, function (data) {
				$("#" + targetdiv).replaceWith(data);
				$(window).trigger("resize");
			});
		}
	});

	paintimagebox = function (image) {
		var faceprofilebox = image.closest(".emshowbox");
		if (faceprofilebox.length == 0) {
			return;
		}
		var newheight = image.data("fixedheight");
		if (newheight === undefined) {
			newheight = image.height();
		}

		//check if faceprofilebox

		var inputheight = faceprofilebox.data("inputheight");

		var scale = newheight / inputheight;

		var originalbox = faceprofilebox.data("showbox");
		var box = new Array(
			originalbox[0] * scale,
			originalbox[1] * scale,
			originalbox[2] * scale,
			originalbox[3] * scale
		);

		var canvas = $(faceprofilebox.find("canvas"));
		if (canvas.length >= 0) {
			canvas.remove();
		}
		faceprofilebox.prepend("<canvas></canvas>");
		canvas = $(faceprofilebox.find("canvas"));
		canvas.css("position", "absolute");

		var w = faceprofilebox.data("imagewidth");
		//var h = faceprofilebox.data("inputheight");

		canvas.attr({ width: image.width(), height: image.height() });
		var context = canvas[0].getContext("2d");
		context.beginPath();
		context.lineWidth = 1;
		context.strokeStyle = "#666";
		context.strokeRect(box[0], box[1], box[2], box[3]);
		context.strokeStyle = "#fff";
		context.strokeRect(box[0] - 1, box[1] - 1, box[2] + 1, box[3] + 1);
	};

	lQuery(".emshowbox").livequery(function () {
		var div = $(this);
		div.css("position", "relative");
		var image = $(div.find("img"));

		paintimagebox(image);

		image.on("load", function () {
			paintimagebox(image);
		});

		var container = div.data("centerbox");
		if (container) {
			var topbox = box[1];
			if (topbox > h / 2) {
				div.css("top", topbox + 5);
			}
		}
	});

	lQuery("select.addremovecolumns").livequery("change", function () {
		var selectedval = $(this).val();
		var resultsdiv = $(this).data("targetdiv");

		if (resultsdiv) {
			resultsdiv = $("#" + resultsdiv);
		} else {
			resultsdiv = $(this).closest("#resultsdiv");
		}

		var options = resultsdiv.data();
		var searchhome = resultsdiv.data("searchhome");
		$.get(
			searchhome +
				"/addremovecolumns.html?oemaxlevel=1&editheader=true&addcolumn=" +
				selectedval,
			options,
			function (data) {
				resultsdiv.html(data);
			}
		);
	});

	lQuery("th.sortable").livequery("click", function () {
		//.emselectable ?
		var column = $(this);
		var id = column.data("sortby");

		var resultsdiv = column.closest(".resultsdiv");
		var searchhome = resultsdiv.data("searchhome");

		resultsdiv.data("url", searchhome + "/columnsort.html");
		resultsdiv.data("includeeditcontext", true);

		if (column.hasClass("currentsort")) {
			if (column.hasClass("up")) {
				resultsdiv.data("sortby", id + "Down");
			} else {
				resultsdiv.data("sortby", id + "Up");
			}
		} else {
			$("th.sortable").removeClass("currentsort");
			column.addClass("currentsort");
			resultsdiv.data("sortby", id + "Down");
		}
		resultsdiv.runAjax();
	});

	var hash = window.location.hash;
	var hidemediaviewer = $("body").data("hidemediaviewer");

	if (
		hash &&
		hash.startsWith("#asset-") &&
		!hidemediaviewer &&
		!$("#main-media-viewer").length
	) {
		var assetid = hash.substring(7, hash.length);
		if (assetid) {
			showAsset(null, assetid);
		}
	}

	//openEntity();  //Why here?. Use a selector?

	/* lQuery(".scrollview").livequery("scroll", function () {
		checkScroll();
	});
	
	*/

	// TODO: remove this. using ajax Used for modules
	togglehits = function (action) {
		var data = $("#resultsdiv").data();
		data.oemaxlevel = 1;
		data.action = action;

		$.get(componenthome + "/moduleresults/selections/togglepage.html", data);
		if (action == "all" || action == "page") {
			$(".moduleselectionbox").attr("checked", "checked");
		} else {
			$(".moduleselectionbox").removeAttr("checked");
		}
		return false;
	};

	function updateentities(element) {
		// get form fields as data
		var data = $(element)
			.serializeArray()
			.reduce(function (obj, item) {
				obj[item.name] = item.value;
				return obj;
			}, {});
		//or get data from element (<a>)
		if (data.constructor === Object && Object.keys(data).length === 0) {
			data = element.data();
		}
		if (data.id && data.searchtype) {
			var entitycontainerclass = "entity" + data.searchtype + data.id;
			$("." + entitycontainerclass).each(function () {
				$(this).trigger("reload");
			});
		}

		$(window).trigger("ajaxautoreload", {
			eventtype: "entitysave",
			moduleid: data.searchtype,
		});
	}

	lQuery(".entitycontainer").livequery(function (e) {
		// debugger;
		var entity = $(this);
		entity.on("reload", function (e) {
			var entityparent = entity.closest(".entitiescontainer");
			var entityreloadurl = entityparent.data("entityrenderurl");
			if (entityreloadurl != null) {
				var options = {};
				var targetdiv = entity.closest(".emgridcell");
				options = entity.data();
				$.ajax({
					url: entityreloadurl,
					data: options,
					success: function (data) {
						targetdiv.replaceWith(data);
						$(window).trigger("resize");
					},
				});
			}
		});
	});

	lQuery("div.assetpreview").livequery("click", function (e) {
		e.preventDefault();
		$(".assettabnav").removeClass("tabselected");
		$(this).closest(".assettabnav").addClass("tabselected");
		var div = $("#main-media-viewer");
		var assetid = div.data("assetid");
		showAsset($(this), assetid);
		saveProfileProperty("assetopentab", "viewpreview", function () {});
	});

	lQuery(".auto-remove").livequery("click", function () {
		var catid = $(this).data("categoryid");
		if (catid) {
			$("#auto-" + catid)
				.parent()
				.remove();
		}
	});

	lQuery("a.assettab").livequery("click", function (e) {
		e.preventDefault();
		var tab = $(this);

		$(".assettabnav").removeClass("tabselected");
		$(".assettabactions a").removeClass("dropdown-current");
		$(this).closest(".assettabnav").addClass("tabselected");
		var div = $("#main-media-viewer");
		var options = div.data();

		options.pageheight = $(window).height() - 100;

		var assettab = tab.data("assettab");

		var collectionid = $("#resultsdiv").data("collectionid");
		if (collectionid) {
			options.collectionid = collectionid;
		}

		// save to profile (Remember Tab)
		if (tab.hasClass("rememberassettab")) {
			saveProfileProperty("assetopentab", assettab, function () {});
		}

		if (assettab == "viewpreview") {
			var assetid = div.data("assetid");
			showAsset($(this), assetid);
		} else if (assettab == "multiedit") {
			var link = $(this).data("link");
			div.load(link, options, function () {
				// Update AssetID
				var assetid = $("#multieditpanel").data("assetid");
				$("#main-media-viewer").data("assetid", assetid);
				$(window).trigger("tabready");
			});
		} else {
			disposevideos();
			var link = tab.data("link");
			div.load(link, options, function () {
				// console.log("triggered");
				$(window).trigger("tabready");
			});

			var assettabactions = $(this).data("assettabactions");
			if (assettabactions) {
				$(this).addClass("dropdown-current");
				var label = $(this).data("assettabname");
				if (label) {
					$(".assettabactionstext").text(label);
				}
				// saveProfileProperty("assetopentabactions",assettabactions,function(){});
			}
			var assettabtable = $(this).data("assettabtable");
			if (assettabtable) {
				$(this).addClass("dropdown-current");
				var label = $(this).data("assettabname");
				if (label) {
					$(".assettabactionstext").text(label);
				}
				// saveProfileProperty("assetopentabassettable",assettabtable,function(){});
			}
		}
	}); //End of

	//FUSE Library
	var Fuse;
	eval(
		`function I(e){return Array.isArray?Array.isArray(e):ft(e)==="[object Array]"}var Mt=1/0;function yt(e){if(typeof e=="string")return e;let t=e+"";return t=="0"&&1/e==-Mt?"-0":t}function _t(e){return e==null?"":yt(e)}function E(e){return typeof e=="string"}function lt(e){return typeof e=="number"}function Et(e){return e===!0||e===!1||wt(e)&&ft(e)=="[object Boolean]"}function ut(e){return typeof e=="object"}function wt(e){return ut(e)&&e!==null}function M(e){return e!=null}function H(e){return!e.trim().length}function ft(e){return e==null?e===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(e)}var At="Incorrect 'index' type",It=e=>"Invalid value for key "+e,St=e=>"Pattern length exceeds max of "+e+".",Lt=e=>"Missing "+e+" property in key",xt=e=>"Property 'weight' in key '"+e+"' must be a positive integer",it=Object.prototype.hasOwnProperty,U=class{constructor(t){this._keys=[],this._keyMap={};let s=0;t.forEach(n=>{let r=dt(n);this._keys.push(r),this._keyMap[r.id]=r,s+=r.weight}),this._keys.forEach(n=>{n.weight/=s})}get(t){return this._keyMap[t]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}};function dt(e){let t=null,s=null,n=null,r=1,i=null;if(E(e)||I(e))n=e,t=ct(e),s=V(e);else{if(!it.call(e,"name"))throw new Error(Lt("name"));let c=e.name;if(n=c,it.call(e,"weight")&&(r=e.weight,r<=0))throw new Error(xt(c));t=ct(c),s=V(c),i=e.getFn}return{path:t,id:s,weight:r,src:n,getFn:i}}function ct(e){return I(e)?e:e.split(".")}function V(e){return I(e)?e.join("."):e}function Rt(e,t){let s=[],n=!1,r=(i,c,o)=>{if(M(i))if(!c[o])s.push(i);else{let h=c[o],l=i[h];if(!M(l))return;if(o===c.length-1&&(E(l)||lt(l)||Et(l)))s.push(_t(l));else if(I(l)){n=!0;for(let a=0,f=l.length;a<f;a+=1)r(l[a],c,o+1)}else c.length&&r(l,c,o+1)}};return r(e,E(t)?t.split("."):t,0),n?s:s[0]}var bt={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},Nt={isCaseSensitive:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(e,t)=>e.score===t.score?e.idx<t.idx?-1:1:e.score<t.score?-1:1},kt={location:0,threshold:.6,distance:100},Ot={useExtendedSearch:!1,getFn:Rt,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1},u={...Nt,...bt,...kt,...Ot},_dt=/[^ ]+/g;function Ct(e=1,t=3){let s=new Map,n=Math.pow(10,t);return{get(r){let i=r.match(_dt).length;if(s.has(i))return s.get(i);let c=1/Math.pow(i,.5*e),o=parseFloat(Math.round(c*n)/n);return s.set(i,o),o},clear(){s.clear()}}}var _d=class{constructor({getFn:t=u.getFn,fieldNormWeight:s=u.fieldNormWeight}={}){this.norm=Ct(s,3),this.getFn=t,this.isCreated=!1,this.setIndexRecords()}setSources(t=[]){this.docs=t}setIndexRecords(t=[]){this.records=t}setKeys(t=[]){this.keys=t,this._keysMap={},t.forEach((s,n)=>{this._keysMap[s.id]=n})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,E(this.docs[0])?this.docs.forEach((t,s)=>{this._addString(t,s)}):this.docs.forEach((t,s)=>{this._addObject(t,s)}),this.norm.clear())}add(t){let s=this.size();E(t)?this._addString(t,s):this._addObject(t,s)}removeAt(t){this.records.splice(t,1);for(let s=t,n=this.size();s<n;s+=1)this.records[s].i-=1}getValueForItemAtKeyId(t,s){return t[this._keysMap[s]]}size(){return this.records.length}_addString(t,s){if(!M(t)||H(t))return;let n={v:t,i:s,n:this.norm.get(t)};this.records.push(n)}_addObject(t,s){let n={i:s,_d:{}};this.keys.forEach((r,i)=>{let c=r.getFn?r.getFn(t):this.getFn(t,r.path);if(M(c)){if(I(c)){let o=[],h=[{nestedArrIndex:-1,value:c}];for(;h.length;){let{nestedArrIndex:l,value:a}=h.pop();if(M(a))if(E(a)&&!H(a)){let f={v:a,i:l,n:this.norm.get(a)};o.push(f)}else I(a)&&a.forEach((f,d)=>{h.push({nestedArrIndex:d,value:f})})}n._d[i]=o}else if(E(c)&&!H(c)){let o={v:c,n:this.norm.get(c)};n._d[i]=o}}}),this.records.push(n)}toJSON(){return{keys:this.keys,records:this.records}}};function gt(e,t,{getFn:s=u.getFn,fieldNormWeight:n=u.fieldNormWeight}={}){let r=new _d({getFn:s,fieldNormWeight:n});return r.setKeys(e.map(dt)),r.setSources(t),r.create(),r}function Tt(e,{getFn:t=u.getFn,fieldNormWeight:s=u.fieldNormWeight}={}){let{keys:n,records:r}=e,i=new _d({getFn:t,fieldNormWeight:s});return i.setKeys(n),i.setIndexRecords(r),i}function v(e,{errors:t=0,currentLocation:s=0,expectedLocation:n=0,distance:r=u.distance,ignoreLocation:i=u.ignoreLocation}={}){let c=t/e.length;if(i)return c;let o=Math.abs(n-s);return r?c+o/r:o?1:c}function vt(e=[],t=u.minMatchCharLength){let s=[],n=-1,r=-1,i=0;for(let c=e.length;i<c;i+=1){let o=e[i];o&&n===-1?n=i:!o&&n!==-1&&(r=i-1,r-n+1>=t&&s.push([n,r]),n=-1)}return e[i-1]&&i-n>=t&&s.push([n,i-1]),s}var N=32;function Ft(e,t,s,{location:n=u.location,distance:r=u.distance,threshold:i=u.threshold,findAllMatches:c=u.findAllMatches,minMatchCharLength:o=u.minMatchCharLength,includeMatches:h=u.includeMatches,ignoreLocation:l=u.ignoreLocation}={}){if(t.length>N)throw new Error(St(N));let a=t.length,f=e.length,d=Math.max(0,Math.min(n,f)),g=i,p=d,m=o>1||h,R=m?Array(f):[],A;for(;(A=e.indexOf(t,p))>-1;){let y=v(t,{currentLocation:A,expectedLocation:d,distance:r,ignoreLocation:l});if(g=Math.min(y,g),p=A+a,m){let L=0;for(;L<a;)R[A+L]=1,L+=1}}p=-1;let k=[],b=1,C=a+f,mt=1<<a-1;for(let y=0;y<a;y+=1){let L=0,x=C;for(;L<x;)v(t,{errors:y,currentLocation:d+x,expectedLocation:d,distance:r,ignoreLocation:l})<=g?L=x:C=x,x=Math.floor((C-L)/2+L);C=x;let nt=Math.max(1,d-x+1),W=c?f:Math.min(d+x,f)+a,O=Array(W+2);O[W+1]=(1<<y)-1;for(let _=W;_>=nt;_-=1){let T=_-1,rt=s[e.charAt(T)];if(m&&(R[T]=+!!rt),O[_]=(O[_+1]<<1|1)&rt,y&&(O[_]|=(k[_+1]|k[_])<<1|1|k[_+1]),O[_]&mt&&(b=v(t,{errors:y,currentLocation:T,expectedLocation:d,distance:r,ignoreLocation:l}),b<=g)){if(g=b,p=T,p<=d)break;nt=Math.max(1,2*d-p)}}if(v(t,{errors:y+1,currentLocation:d,expectedLocation:d,distance:r,ignoreLocation:l})>g)break;k=O}let K={isMatch:p>=0,score:Math.max(.001,b)};if(m){let y=vt(R,o);y.length?h&&(K.indices=y):K.isMatch=!1}return K}function jt(e){let t={};for(let s=0,n=e.length;s<n;s+=1){let r=e.charAt(s);t[r]=(t[r]||0)|1<<n-s-1}return t}var F=class{constructor(t,{location:s=u.location,threshold:n=u.threshold,distance:r=u.distance,includeMatches:i=u.includeMatches,findAllMatches:c=u.findAllMatches,minMatchCharLength:o=u.minMatchCharLength,isCaseSensitive:h=u.isCaseSensitive,ignoreLocation:l=u.ignoreLocation}={}){if(this.options={location:s,threshold:n,distance:r,includeMatches:i,findAllMatches:c,minMatchCharLength:o,isCaseSensitive:h,ignoreLocation:l},this.pattern=h?t:t.toLowerCase(),this.chunks=[],!this.pattern.length)return;let a=(d,g)=>{this.chunks.push({pattern:d,alphabet:jt(d),startIndex:g})},f=this.pattern.length;if(f>N){let d=0,g=f%N,p=f-g;for(;d<p;)a(this.pattern.substr(d,N),d),d+=N;if(g){let m=f-N;a(this.pattern.substr(m),m)}}else a(this.pattern,0)}searchIn(t){let{isCaseSensitive:s,includeMatches:n}=this.options;if(s||(t=t.toLowerCase()),this.pattern===t){let p={isMatch:!0,score:0};return n&&(p.indices=[[0,t.length-1]]),p}let{location:r,distance:i,threshold:c,findAllMatches:o,minMatchCharLength:h,ignoreLocation:l}=this.options,a=[],f=0,d=!1;this.chunks.forEach(({pattern:p,alphabet:m,startIndex:R})=>{let{isMatch:A,score:k,indices:b}=Ft(t,p,m,{location:r+R,distance:i,threshold:c,findAllMatches:o,minMatchCharLength:h,includeMatches:n,ignoreLocation:l});A&&(d=!0),f+=k,A&&b&&(a=[...a,...b])});let g={isMatch:d,score:d?f/this.chunks.length:1};return d&&n&&(g.indices=a),g}},w=class{constructor(t){this.pattern=t}static isMultiMatch(t){return ot(t,this.multiRegex)}static isSingleMatch(t){return ot(t,this.singleRegex)}search(){}};function ot(e,t){let s=e.match(t);return s?s[1]:null}var B=class extends w{constructor(t){super(t)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(t){let s=t===this.pattern;return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}},Y=class extends w{constructor(t){super(t)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(t){let n=t.indexOf(this.pattern)===-1;return{isMatch:n,score:n?0:1,indices:[0,t.length-1]}}},G=class extends w{constructor(t){super(t)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(t){let s=t.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}},z=class extends w{constructor(t){super(t)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(t){let s=!t.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,t.length-1]}}},Q=class extends w{constructor(t){super(t)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(t){let s=t.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[t.length-this.pattern.length,t.length-1]}}},X=class extends w{constructor(t){super(t)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(t){let s=!t.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,t.length-1]}}},j=class extends w{constructor(t,{location:s=u.location,threshold:n=u.threshold,distance:r=u.distance,includeMatches:i=u.includeMatches,findAllMatches:c=u.findAllMatches,minMatchCharLength:o=u.minMatchCharLength,isCaseSensitive:h=u.isCaseSensitive,ignoreLocation:l=u.ignoreLocation}={}){super(t),this._bitapSearch=new F(t,{location:s,threshold:n,distance:r,includeMatches:i,findAllMatches:c,minMatchCharLength:o,isCaseSensitive:h,ignoreLocation:l})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(t){return this._bitapSearch.searchIn(t)}},P=class extends w{constructor(t){super(t)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(t){let s=0,n,r=[],i=this.pattern.length;for(;(n=t.indexOf(this.pattern,s))>-1;)s=n+i,r.push([n,s-1]);let c=!!r.length;return{isMatch:c,score:c?0:1,indices:r}}},J=[B,P,G,z,X,Q,Y,j],ht=J.length,Pt=/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,Dt="|";function Kt(e,t={}){return e.split(Dt).map(s=>{let n=s.trim().split(Pt).filter(i=>i&&!!i.trim()),r=[];for(let i=0,c=n.length;i<c;i+=1){let o=n[i],h=!1,l=-1;for(;!h&&++l<ht;){let a=J[l],f=a.isMultiMatch(o);f&&(r.push(new a(f,t)),h=!0)}if(!h)for(l=-1;++l<ht;){let a=J[l],f=a.isSingleMatch(o);if(f){r.push(new a(f,t));break}}}return r})}var Wt=new Set([j.type,P.type]),Z=class{constructor(t,{isCaseSensitive:s=u.isCaseSensitive,includeMatches:n=u.includeMatches,minMatchCharLength:r=u.minMatchCharLength,ignoreLocation:i=u.ignoreLocation,findAllMatches:c=u.findAllMatches,location:o=u.location,threshold:h=u.threshold,distance:l=u.distance}={}){this.query=null,this.options={isCaseSensitive:s,includeMatches:n,minMatchCharLength:r,findAllMatches:c,ignoreLocation:i,location:o,threshold:h,distance:l},this.pattern=s?t:t.toLowerCase(),this.query=Kt(this.pattern,this.options)}static condition(t,s){return s.useExtendedSearch}searchIn(t){let s=this.query;if(!s)return{isMatch:!1,score:1};let{includeMatches:n,isCaseSensitive:r}=this.options;t=r?t:t.toLowerCase();let i=0,c=[],o=0;for(let h=0,l=s.length;h<l;h+=1){let a=s[h];c.length=0,i=0;for(let f=0,d=a.length;f<d;f+=1){let g=a[f],{isMatch:p,indices:m,score:R}=g.search(t);if(p){if(i+=1,o+=R,n){let A=g.constructor.type;Wt.has(A)?c=[...c,...m]:c.push(m)}}else{o=0,i=0,c.length=0;break}}if(i){let f={isMatch:!0,score:o/i};return n&&(f.indices=c),f}}return{isMatch:!1,score:1}}},q=[];function Ht(...e){q.push(...e)}function tt(e,t){for(let s=0,n=q.length;s<n;s+=1){let r=q[s];if(r.condition(e,t))return new r(e,t)}return new F(e,t)}var D={AND:"$and",OR:"$or"},et={PATH:"$path",PATTERN:"$val"},st=e=>!!(e[D.AND]||e[D.OR]),Ut=e=>!!e[et.PATH],Vt=e=>!I(e)&&ut(e)&&!st(e),at=e=>({[D.AND]:Object.keys(e).map(t=>({[t]:e[t]}))});function pt(e,t,{auto:s=!0}={}){let n=r=>{let i=Object.keys(r),c=Ut(r);if(!c&&i.length>1&&!st(r))return n(at(r));if(Vt(r)){let h=c?r[et.PATH]:i[0],l=c?r[et.PATTERN]:r[h];if(!E(l))throw new Error(It(h));let a={keyId:V(h),pattern:l};return s&&(a.searcher=tt(l,t)),a}let o={children:[],operator:i[0]};return i.forEach(h=>{let l=r[h];I(l)&&l.forEach(a=>{o.children.push(n(a))})}),o};return st(e)||(e=at(e)),n(e)}function Bt(e,{ignoreFieldNorm:t=u.ignoreFieldNorm}){e.forEach(s=>{let n=1;s.matches.forEach(({key:r,norm:i,score:c})=>{let o=r?r.weight:null;n*=Math.pow(c===0&&o?Number.EPSILON:c,(o||1)*(t?1:i))}),s.score=n})}function Yt(e,t){let s=e.matches;t.matches=[],M(s)&&s.forEach(n=>{if(!M(n.indices)||!n.indices.length)return;let{indices:r,value:i}=n,c={indices:r,value:i};n.key&&(c.key=n.key.src),n.idx>-1&&(c.refIndex=n.idx),t.matches.push(c)})}function Gt(e,t){t.score=e.score}function zt(e,t,{includeMatches:s=u.includeMatches,includeScore:n=u.includeScore}={}){let r=[];return s&&r.push(Yt),n&&r.push(Gt),e.map(i=>{let{idx:c}=i,o={item:t[c],refIndex:c};return r.length&&r.forEach(h=>{h(i,o)}),o})}Fuse=class{constructor(t,s={},n){this.options={...u,...s},this.options.useExtendedSearch,this._keyStore=new U(this.options.keys),this.setCollection(t,n)}setCollection(t,s){if(this._docs=t,s&&!(s instanceof _d))throw new Error(At);this._myIndex=s||gt(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}add(t){M(t)&&(this._docs.push(t),this._myIndex.add(t))}remove(t=()=>!1){let s=[];for(let n=0,r=this._docs.length;n<r;n+=1){let i=this._docs[n];t(i,n)&&(this.removeAt(n),n-=1,r-=1,s.push(i))}return s}removeAt(t){this._docs.splice(t,1),this._myIndex.removeAt(t)}getIndex(){return this._myIndex}search(t,{limit:s=-1}={}){let{includeMatches:n,includeScore:r,shouldSort:i,sortFn:c,ignoreFieldNorm:o}=this.options,h=E(t)?E(this._docs[0])?this._searchStringList(t):this._searchObjectList(t):this._searchLogical(t);return Bt(h,{ignoreFieldNorm:o}),i&&h.sort(c),lt(s)&&s>-1&&(h=h.slice(0,s)),zt(h,this._docs,{includeMatches:n,includeScore:r})}_searchStringList(t){let s=tt(t,this.options),{records:n}=this._myIndex,r=[];return n.forEach(({v:i,i:c,n:o})=>{if(!M(i))return;let{isMatch:h,score:l,indices:a}=s.searchIn(i);h&&r.push({item:i,idx:c,matches:[{score:l,value:i,norm:o,indices:a}]})}),r}_searchLogical(t){let s=pt(t,this.options),n=(o,h,l)=>{if(!o.children){let{keyId:f,searcher:d}=o,g=this._findMatches({key:this._keyStore.get(f),value:this._myIndex.getValueForItemAtKeyId(h,f),searcher:d});return g&&g.length?[{idx:l,item:h,matches:g}]:[]}let a=[];for(let f=0,d=o.children.length;f<d;f+=1){let g=o.children[f],p=n(g,h,l);if(p.length)a.push(...p);else if(o.operator===D.AND)return[]}return a},r=this._myIndex.records,i={},c=[];return r.forEach(({_d:o,i:h})=>{if(M(o)){let l=n(s,o,h);l.length&&(i[h]||(i[h]={idx:h,item:o,matches:[]},c.push(i[h])),l.forEach(({matches:a})=>{i[h].matches.push(...a)}))}}),c}_searchObjectList(t){let s=tt(t,this.options),{keys:n,records:r}=this._myIndex,i=[];return r.forEach(({_d:c,i:o})=>{if(!M(c))return;let h=[];n.forEach((l,a)=>{h.push(...this._findMatches({key:l,value:c[a],searcher:s}))}),h.length&&i.push({idx:o,item:c,matches:h})}),i}_findMatches({key:t,value:s,searcher:n}){if(!M(s))return[];let r=[];if(I(s))s.forEach(({v:i,i:c,n:o})=>{if(!M(i))return;let{isMatch:h,score:l,indices:a}=n.searchIn(i);h&&r.push({score:l,key:t,value:i,idx:c,norm:o,indices:a})});else{let{v:i,n:c}=s,{isMatch:o,score:h,indices:l}=n.searchIn(i);o&&r.push({score:h,key:t,value:i,norm:c,indices:l})}return r}};Fuse.createIndex=gt;Fuse.parseIndex=Tt;Fuse.config=u;Fuse.parseQuery=pt;Ht(Z);`
	);

	lQuery(".icons-picker").livequery(function () {
		var iconListContainer = document.querySelector("#icons-list");
		var iconElements = iconListContainer.children;
		var iconElementList = Array.from(iconElements);
		var iconDataList = iconElementList.map((element) => {
			return {
				name: element.dataset.name,
				categories: element.dataset.categories.split(" "),
				tags: element.dataset.tags.split(" "),
			};
		});

		var fuse = new Fuse(iconDataList, {
			ignoreLocation: true,
			useExtendedSearch: true,
			shouldSort: false,
			keys: ["name", "categories", "tags"],
			threshold: 0,
		});

		function search(searchTerm) {
			var trimmedSearchTerm = searchTerm ? searchTerm.trim() : "";

			iconListContainer.innerHTML = "";
			if (trimmedSearchTerm.length > 0) {
				var searchResult = fuse.search(trimmedSearchTerm);
				var resultElements = searchResult.map(
					(result) => iconElementList[result.refIndex]
				);
				iconListContainer.append(...resultElements);
				if (resultElements.length == 0) {
					iconListContainer.innerHTML =
						"<p class='text-muted my-2'>No results found</p>";
				}
			} else {
				iconListContainer.append(...iconElementList);
			}
		}

		var searchInput = $("#icon-search");
		var timeout;
		searchInput.keydown(function () {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				search(searchInput.val());
			}, 250);
		});
	});

	lQuery(".forceresize").livequery(function () {
		$(window).trigger("resize");
	});
}); // document ready
