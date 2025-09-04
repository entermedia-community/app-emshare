var lasttypeahead;
var lastsearch;
var searchmodaldialog;
var searchmodalmask;
var mainsearcheinput;
var lasttypeaheadsummary;
$(document).ready(function () {
	lQuery(".quicksearch-toggler").livequery("click", function () {
		var navbar = $(this).data("target");
		$("#" + navbar).toggle();
	});

	lQuery(".quicksearchlinks").livequery("click", function () {
		closetypeaheadmodal();
		/*var modalparent = $(this).closest('.typeaheadmodal');
  modalparent.toggle();*/
	});
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

	var semanticLoaderTO = null;

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
				searchmodaldialog.css("height", wh - topposition - 52 + "px");
			}
		}
		setSearchModalSize();
		window.onresize = setSearchModalSize;

		var typeaheadtargetdiv = mainsearcheinput.data("typeaheadtargetdiv");

		if (typeaheadtargetdiv == null) {
			typeaheadtargetdiv = "applicationmaincontent";
		}

		var defaulttext = mainsearcheinput.data("showdefault");
		if (!defaulttext) {
			defaulttext = "Search";
		}
		var allowClear = mainsearcheinput.data("allowclear");
		if (allowClear == undefined) {
			allowClear = true;
		}

		var url = mainsearcheinput.data("typeaheadurl");
		var semanticurl = mainsearcheinput.data("semanticurl");

		var searchquery = "";
		mainsearcheinput.on("keydown", function (e) {
			if (e.keyCode == 27) {
				togglemodaldialog("hide");
			}
		});
		mainsearcheinput.on("keyup change", function (e) {
			if (semanticLoaderTO) {
				clearTimeout(semanticLoaderTO);
			}
			if (mainsearcheinput.val() == searchquery) {
				return;
			}
			searchquery = mainsearcheinput.val();
			if (!searchquery) {
				togglemodaldialog("hide");
				return;
			}

			if (e.keyCode == 27) {
				togglemodaldialog("hide");
			} else if (
				(searchquery != "" && e.which == undefined) ||
				e.which == 8 ||
				(e.which != 37 && e.which != 39 && e.which > 32)
			) {
				//Real words and backspace
				if (searchquery && searchquery.length < 2) {
					togglemodaldialog("hide");
					return;
				} else {
					togglemodaldialog("show");
				}

				var terms =
					"field=description&operation=contains" +
					"&description.value=" +
					encodeURIComponent(searchquery);

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
						semanticLoaderTO = setTimeout(function () {
							loadSemanticMatches(semanticurl, searchquery);
						}, 200);
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

		mainsearcheinput.bind("paste", function () {
			if (mainsearcheinput.val().length > 0) {
				$(".quicksearchexpand").trigger("click");
			}
		});

		lQuery(".quicksearchexpand").livequery("click", function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (searchmodaldialog.length) {
				var searchquery = mainsearcheinput.val();
				var terms = "";
				if (searchquery) {
					terms =
						"field=description&operation=contains" +
						"&description.value=" +
						encodeURI(searchquery);
				}
				searchquery = mainsearcheinput.data("mainsearchmodule");
				if (searchquery) {
					terms =
						(terms.length > 0 ? terms + "&" : "") +
						"mainsearchmodule=" +
						searchquery;
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

	//Not used?
	lQuery(".filtertypeahead").livequery(function () {
		mainsearcheinput = $(this);
		var searchquery = "";
		var form = mainsearcheinput.closest("#filterform");

		function filtertypeaheadsuccess() {
			$(".filtertypeahead").trigger("focus");
		}

		form.data("onsuccess", "filtertypeaheadsuccess");
		var url = form.attr("action");

		mainsearcheinput.on("keydown", function (e) {
			if (e.keyCode == 27) {
			}
		});
		mainsearcheinput.on("keyup change", function (e) {
			if (mainsearcheinput.val() == searchquery) {
				return;
			}
			searchquery = mainsearcheinput.val();
			if (!searchquery) {
				return;
			}

			if (e.keyCode == 27) {
			} else if (
				(searchquery != "" && e.which == undefined) ||
				e.which == 8 ||
				(e.which != 37 && e.which != 39 && e.which > 32)
			) {
				//Real words and backspace
				if (searchquery && searchquery.length < 2) {
					return;
				} else {
				}

				var terms =
					"field=description&operation=contains" +
					"&description.value=" +
					encodeURIComponent(searchquery);

				if (lasttypeaheadsummary) {
					lasttypeaheadsummary.abort();
				}

				form.trigger("submit");
			} else {
				//console.log(e.keyCode);
			}
		});
	});

	function loadSemanticMatches(url, searchquery) {
		if (!searchquery || searchquery.length < 3) {
			return;
		}
		$.ajax({
			url: url,
			async: true,
			type: "GET",
			data: "query=" + encodeURIComponent(searchquery),
			beforeSend: function () {
				$("#semanticLoading").addClass("show");
			},
			success: function (data) {
				if (data) {
					$("#semanticMatches").html(data);
					$("#semanticLoading").removeClass("show");
					jQuery(window).trigger("resize");
				} else {
					$("#semanticMatches").html("");
				}
			},
			error: function () {
				$("#semanticMatches").html("");
				$("#semanticLoading").removeClass("show");
			},
			complete: function () {
				$("#semanticLoading").removeClass("show");
			},
		});
	}
});
