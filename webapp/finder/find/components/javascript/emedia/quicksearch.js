var lasttypeahead;
var lastsearch;
var searchmodaldialog;
var mainsearcheinput;
var lasttypeaheadsummary;
$(document).ready(function () {
	lQuery(".quicksearchlinks").livequery("click", function () {
		closeMainSearch();
	});

	var semanticLoaderTO = null;

	lQuery("#mainsearchinput").livequery(function () {
		mainsearcheinput = $(this);

		searchmodaldialog = $(".modal#mainsearch");

		function setSearchModalSize() {
			var applicationcontentwidth = $("#applicationmaincontent").width();
			if (!applicationcontentwidth) {
				applicationcontentwidth = $("#header").width();
			}

			var topposition = $("#header").outerHeight();
			topposition -= 40;
			topposition /= 2;
			topposition += 56;
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
				closeMainSearch();
			}
		});

		mainsearcheinput.on("keyup change paste", function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (semanticLoaderTO) {
				clearTimeout(semanticLoaderTO);
			}
			if (mainsearcheinput.val() == searchquery) {
				return;
			}
			searchquery = mainsearcheinput.val();

			if (e.keyCode == 27) {
				closeMainSearch();
				return;
			}

			if (searchquery && searchquery.length < 2) {
				return;
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
						jQuery(window).trigger("resize");
					}

					var entityids = [];
					$(".emfolder-wrapper", searchmodaldialog).each(function () {
						var entityid = $(this).data("id");
						if (entityid) {
							entityids.push("" + entityid);
						}
					});
					var assetids = [];
					$(".masonry-grid-cell", searchmodaldialog).each(function () {
						var assetid = $(this).data("assetid");
						if (assetid) {
							assetids.push("" + assetid);
						}
					});

					semanticLoaderTO = setTimeout(function () {
						loadSemanticMatches(semanticurl, searchquery, {
							entityids: entityids,
							assetids: assetids,
						});
					}, 200);
				},
				complete: function () {
					$("#searchLoading").removeClass("show");
				},
			});
		});

		lQuery(".qssuggestion").livequery("click", function () {
			var suggestion = $(this).data("suggestion");
			mainsearcheinput.val(decodeURI(suggestion));
			mainsearcheinput.trigger("change");
		});

		lQuery(".closemainsearch").livequery("click", function () {
			closeMainSearch();
		});

		function closeMainSearch() {
			if (!searchmodaldialog) {
				searchmodaldialog = $(".modal#mainsearch");
			}
			searchmodaldialog.fadeOut(function () {
				$(this).remove();
			});
			$(".modal-backdrop").remove();
		}
	});

	function loadSemanticMatches(url, searchquery, excludeids) {
		if (!searchquery || searchquery.length < 3) {
			return;
		}
		var data = {
			oemaxlevel: 1,
			semanticquery: searchquery,
			excludeentityids: excludeids.entityids,
			excludeassetids: excludeids.assetids,
		};
		$.ajax({
			url: url,
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
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
