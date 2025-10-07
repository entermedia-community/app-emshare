$(document).ready(function () {
	var apphome = $("#application").data("apphome");

	var lasttypeahead;
	var previewsearch;
	var mainsearchresults;
	var mainsearcheinput;

	lQuery(".quicksearchlinks").livequery("click", function () {
		closeMainSearch();
	});

	var semanticLoaderTO = null;

	lQuery("#mainsearchinput").livequery(function () {
		mainsearcheinput = $(this);

		previewsearch = $("#previewsearch");
		mainsearchresults = $("#mainsearchresults");

		var defaulttext = mainsearcheinput.data("showdefault");
		if (!defaulttext) {
			defaulttext = "Search";
		}
		var allowClear = mainsearcheinput.data("allowclear");
		if (allowClear == undefined) {
			allowClear = true;
		}

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
			var searchquery = mainsearcheinput.val();

			if (e.keyCode == 27) {
				closeMainSearch();
				return;
			}

			if (searchquery.length < 2) {
				previewsearch.show();
				mainsearchresults.html("");
				return;
			} else {
				previewsearch.hide();
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
				url: `${apphome}/components/quicksearch/results.html`,
				async: true,
				type: "GET",
				data: terms,
				timeout: 6000,
				beforeSend: function () {
					$("#searchLoading").addClass("show");
				},
				success: function (data) {
					if (data) {
						mainsearchresults.html(data);
						jQuery(window).trigger("resize");
						return;
					}

					var entityids = [];
					$(".emfolder-wrapper", mainsearchresults).each(function () {
						var entityid = $(this).data("id");
						if (entityid) {
							entityids.push("" + entityid);
						}
					});
					var assetids = [];
					$(".masonry-grid-cell", mainsearchresults).each(function () {
						var assetid = $(this).data("assetid");
						if (assetid) {
							assetids.push("" + assetid);
						}
					});

					semanticLoaderTO = setTimeout(function () {
						loadSemanticMatches(mainsearcheinput.val(), {
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
	});

	function closeMainSearch() {
		$(".modal#mainsearch").fadeOut(function () {
			$(this).remove();
		});
		$(".modal-backdrop").remove();
	}

	function loadSemanticMatches(searchquery, excludeids) {
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
			url: `${apphome}/views/modules/modulesearch/results/semanticsearch/semanticsearch.html`,
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
