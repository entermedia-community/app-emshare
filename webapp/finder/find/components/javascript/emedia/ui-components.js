function isInViewport(cell) {
	const rect = cell.getBoundingClientRect();
	var isin =
		rect.top >= 0 &&
		rect.top <= (window.innerHeight || document.documentElement.clientHeight);
	return isin;
}

jQuery(document).ready(function () {
	lQuery("a.ajax").livequery("click", function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).runAjax();
	});

	lQuery("a.toggleAjax").livequery("click", function (e) {
		/**
		 * Runs an ajax call and removes the element from the DOM on ajax success
		 * Optionally checks for a focus parent
		 **/
		e.stopPropagation();
		e.preventDefault();
		var $this = $(this);
		$this.data("noToast", true);
		$this.runAjax(function () {
			var focusParent = $this.closest(`.${$this.data("focusparent")}`);
			if (focusParent.length) {
				focusParent.find("input:visible:first").focus();
			}
			$this.remove();
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

	lQuery(".entityNavHistory").livequery(function () {
		var history = [];
		$(".entityNavHistory").each(function () {
			history.push($(this).data());
		});
		var link = $(".entityNavBack");
		var currentLinkIdx = history.findIndex(function (d) {
			return d.entityid == link.data("entityid");
		});
		if (currentLinkIdx > 0) {
			var backLink = history[currentLinkIdx - 1];
			link.data("entityid", backLink.entityid);
			link.data("entitymoduleid", backLink.entitymoduleid);
			link.data("entitymoduleviewid", backLink.entitymoduleviewid);
			link.data("url", backLink.url);
			link.attr("href", backLink.url);
			//link.find("#showname").html();
			link.show();
		}
	});

	lQuery(".entity-tab-content.overflow-x").livequery(
		"scroll",
		function (event) {
			if (event.shiftKey) {
				if (event.originalEvent.deltaY > 0) {
					event.preventDefault();
					$(this).scrollLeft($(this).scrollLeft() - 100);
				} else {
					event.preventDefault();
					$(this).scrollLeft($(this).scrollLeft() + 100);
				}
			}
		}
	);

	autoreload = function (div, callback, classname = null) {
		var url = div.data("autoreloadurl");
		if (url !== undefined) {
			div.data("url", url);
		}
		url = div.data("url");
		if (url != undefined) {
			var targetdiv = div.data("targetdiv");
			if (targetdiv == undefined) {
				div.data("targetdiv", classname); //Save to ourself
				div.data("oemaxlevel", 1);
			}
			div.data("noToast", true);
			div.runAjax(function () {
				if (callback !== undefined && callback != null) {
					callback();
				}
				jQuery(window).trigger("resize");
			});
		}
	};

	$(window).on("checkautoreload", function (event, indiv) {
		var classes = indiv.data("ajaxreloadtargets"); //assetresults, projectpage, sidebaralbums
		if (classes) {
			var splitnames = classes.split(",");
			$.each(splitnames, function (index, classname) {
				$("." + classname).each(function (index, div) {
					autoreload($(div), null, classname);
				});
			});
		} else {
		}
	});

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

	lQuery(".autoopen").livequery(function () {
		var link = $(this);
		link.emDialog();
	});

	window.onhashchange = function () {
		$("body").css({ overflow: "visible" }); //Enable scroll
		$(window).trigger("resize");
	};
}); //on ready
