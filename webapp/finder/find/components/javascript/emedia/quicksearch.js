$(document).ready(function () {
	var apphome = $("#application").data("apphome");
	var lastTypeAhead;
	var searchQuery = "";

	function checkUrlForSearch() {
		var queryparam = window.location.search;
		var params = new URLSearchParams(queryparam);
		var query = params.get("query");
		if (query) {
			searchQuery = decodeURIComponent(query);
		}
	}

	checkUrlForSearch();

	var urlHash = window.location.hash;

	if (urlHash && urlHash === "#mainsearch") {
		if ($("#mainsearch").length > 0) {
			$("#mainsearch").modal("show");
		} else {
			$(".mainSearchDialog").emDialog();
		}
	}

	lQuery(".mainSearchDialog").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();

		if ($("#mainsearch").length > 0) {
			$("#mainsearch").modal("show");
		} else {
			$(this).emDialog();
		}
	});

	lQuery("#clearmainsearch").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();

		var searchInput = $("#mainsearchinput");
		searchInput.val("");
		searchInput.attr("value", "");
		searchInput.focus();
		searchQuery = "";
		$(window).trigger("autoreload", [$("#mainsearchcontainer")]);
		history.pushState($("#application").html(), "", `${apphome}#mainsearch`);
	});

	$(window).on("modalclosed", function (e, dialogid) {
		if (dialogid !== "mainsearch" && $("#mainsearch").is(":visible")) {
			$("#mainsearch").trigger("focus");
			setTimeout(function () {
				var searchInput = $("#mainsearchinput");
				searchInput.focus();
				var val = searchInput.val();
				searchInput.val("");
				searchInput.val(val);
			}, 200);
		}
	});

	lQuery("#mainsearch").livequery(function (e) {
		if ($(this).hasClass("disposed")) {
			$(this).modal();
		}
	});

	lQuery("#mainsearch").livequery("show.bs.modal", function (e) {
		e.stopPropagation();
		checkUrlForSearch();
	});

	lQuery("#mainsearch").livequery("shown.bs.modal", function (e) {
		var searchInput = $("#mainsearchinput");
		searchInput.focus();
		var val = searchInput.val();
		searchInput.val("");
		searchInput.val(val);
	});

	lQuery(".quicksearchlinks").livequery("click", function () {
		closeMainSearch();
	});

	lQuery("#mainsearch a.ajax").livequery("click", function () {
		closeMainSearch();
	});

	var semanticLoaderTO = null;

	lQuery("#mainsearchinput").livequery(function () {
		var mainSearchInput = $(this);

		mainSearchInput.on("keydown", function (e) {
			if (e.keyCode == 27) {
				closeMainSearch();
			}
		});

		mainSearchInput.on("keyup change paste", onMainSearchInput);
		function onMainSearchInput(e) {
			e.preventDefault();
			e.stopPropagation();
			if (e.keyCode == 27) {
				closeMainSearch();
				return;
			}
			if (mainSearchInput.val() == searchQuery) {
				return;
			}
			handleSearch();
		}
		function handleSearch() {
			if (semanticLoaderTO) {
				clearTimeout(semanticLoaderTO);
			}

			searchQuery = mainSearchInput.val();

			if (searchQuery.length === 0) {
				$("#clearmainsearch").hide();
			} else {
				$("#clearmainsearch").show();
			}

			if (searchQuery.length < 2) {
				return;
			}

			var terms = `query=${encodeURIComponent(searchQuery)}`;

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
						$("#mainsearchresults").html(data);
						jQuery(window).trigger("resize");
					}
					var entityIds = [];
					$("#mainsearchresults .emfolder-wrapper").each(function () {
						var entityId = $(this).data("id");
						if (entityId) {
							entityIds.push("" + entityId);
						}
					});
					var assetIds = [];
					$("#mainsearchresults .masonry-grid-cell").each(function () {
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
					mainSearchInput.attr("value", searchQuery);
					$("#mainsearch").addClass("disposed");
					history.pushState(
						$("#application").html(),
						"",
						`${apphome}?${terms}#mainsearch`
					);
				},
			});
		}

		if (searchQuery.length > 0 && mainSearchInput.val().length == 0) {
			mainSearchInput.focus();
			mainSearchInput.val(searchQuery);
			handleSearch();
		}
	});

	lQuery(".qssuggestion").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();
		var suggestion = $(this).data("suggestion");
		$("#mainsearchinput").val(decodeURI(suggestion));
		$("#mainsearchinput").trigger("change");
	});

	lQuery(".closemainsearch").livequery("click", function (e) {
		e.preventDefault();
		closeMainSearch();
	});

	function closeMainSearch() {
		$(".modal#mainsearch").modal("hide");
	}

	function loadSemanticMatches(query, excludeIds) {
		if (!query || query.length < 3) {
			return;
		}
		var data = {
			oemaxlevel: 1,
			semanticquery: query,
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
