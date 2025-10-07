$(document).ready(function () {
	var apphome = $("#application").data("apphome");

	lQuery("#mainsearch").livequery("shown.bs.modal", function (e) {
		var searchInput = $("#mainsearchinput");
		searchInput.focus();
		var val = searchInput.val();
		searchInput.val("");
		searchInput.val(val);
	});

	var lastTypeAhead;
	var previewSearch;
	var mainSearchResults;
	var mainSearchInput;
	var searchQuery;

	lQuery(".quicksearchlinks").livequery("click", function () {
		closeMainSearch();
	});

	var semanticLoaderTO = null;

	lQuery("#mainsearchinput").livequery(function () {
		mainSearchInput = $(this);

		previewSearch = $("#previewsearch");
		mainSearchResults = $("#mainsearchresults");

		mainSearchInput.on("keydown", function (e) {
			if (e.keyCode == 27) {
				closeMainSearch();
			}
		});

		mainSearchInput.on("keyup change paste", function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (semanticLoaderTO) {
				clearTimeout(semanticLoaderTO);
			}

			if (mainSearchInput.val() == searchQuery) {
				return;
			}

			searchQuery = mainSearchInput.val();

			if (e.keyCode == 27) {
				closeMainSearch();
				return;
			}

			if (searchQuery.length < 2) {
				previewSearch.show();
				mainSearchResults.html("");
				return;
			} else {
				previewSearch.hide();
			}

			var terms =
				"field=description&operation=contains" +
				"&description.value=" +
				encodeURIComponent(searchQuery);

			var mainsearchmodule = mainSearchInput.data("mainsearchmodule");
			if (mainsearchmodule != null) {
				terms = terms + "&mainsearchmodule=" + mainsearchmodule;
			}

			if (lastTypeAhead) {
				lastTypeAhead.abort();
			}

			lastTypeAhead = $.ajax({
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
						mainSearchResults.html(data);
						jQuery(window).trigger("resize");
						return;
					}

					var entityIds = [];
					$(".emfolder-wrapper", mainSearchResults).each(function () {
						var entityId = $(this).data("id");
						if (entityId) {
							entityIds.push("" + entityId);
						}
					});
					var assetIds = [];
					$(".masonry-grid-cell", mainSearchResults).each(function () {
						var assetId = $(this).data("assetid");
						if (assetId) {
							assetIds.push("" + assetId);
						}
					});

					semanticLoaderTO = setTimeout(function () {
						loadSemanticMatches(mainSearchInput.val(), {
							entityIds: entityIds,
							assetIds: assetIds,
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
			mainSearchInput.val(decodeURI(suggestion));
			mainSearchInput.trigger("change");
		});

		lQuery(".closemainsearch").livequery("click", function (e) {
			e.preventDefault();
			closeMainSearch();
		});
	});

	function closeMainSearch() {
		closeemdialog($(".modal#mainsearch"));
	}

	function loadSemanticMatches(searchQuery, excludeIds) {
		if (!searchQuery || searchQuery.length < 3) {
			return;
		}
		var data = {
			oemaxlevel: 1,
			semanticquery: searchQuery,
			excludeentityids: excludeIds.entityIds,
			excludeassetids: excludeIds.assetIds,
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
