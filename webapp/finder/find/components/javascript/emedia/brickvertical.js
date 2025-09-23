(function ($) {
	var stopautoscroll = false;

	function verticalGridResize(grid) {
		//TODO: Put these on grid.data()
		stopautoscroll = false;
		gridcurrentpageviewport = 1;
		gridlastscroll = 0;

		if (!grid) {
			return;
		}

		if (!grid.is(":visible")) {
			return;
		}

		var minwidth = grid.data("minwidth");
		if (minwidth == null || minwidth.length == 0) {
			minwidth = 200;
		}
		var totalavailablew = grid.width();
		
		var maxcols = totalavailablew / minwidth; //Ideally
		var eachwidth = 0;

		while (eachwidth < minwidth) { //Divide evenly
			eachwidth = totalavailablew / maxcols;
			maxcols--;
		}
		maxcols++;

		if (maxcols == 0) {
			maxcols = 1;
		}
		var colheight = {};
		for (let col = 0; col < maxcols; col++) {
			colheight[col] = 0;
		}

		var autosort = true;

		eachwidth -= 8;
		var colwidthpx = totalavailablew / maxcols;
		var colnum = 0;
		$(grid)
			.find(".masonry-grid-cell")
			.each(function () {
				var cell = $(this);
				var embrickcontent = cell.find(".embrickcontent");
				var imgw = embrickcontent.data("imgwidth");
				var imgh = embrickcontent.data("imgheight");
				imgw = parseInt(imgw);
				imgh = parseInt(imgh);
				var a = imgw / imgh;
				var newheight = Math.floor(eachwidth / a);
				if (embrickcontent.hasClass("nothumb")) {
					newheight = Math.max(120, newheight);
				}
				embrickcontent
					.find(".emcategory-thumb")
					.attr("data-height", newheight)
					.height(newheight)
					.css("height", newheight + "px"); //need both height and css("height") cz jquery hates us

				//w = colwidthpx - 8;
				var textcontent = embrickcontent.find(".embricktext");
				if (textcontent.length) {
					embrickcontent.attr(
						"data-textcontent-height",
						textcontent.outerHeight()
					);
					newheight = newheight + textcontent.outerHeight();
				}
				//if (!embrickcontent.data("hasheight")) {
				//	newheight = embrickcontent.height();
				//}

				if (autosort) {
					colnum = shortestColumn(colheight, colnum);
				}
				cell.data("colnum", colnum);
				var runningtotal = colheight[colnum];
				runningtotal = runningtotal + 8;
				var currenth = runningtotal + newheight;
				if (isNaN(currenth)) {
					// debugger;
				}
				colheight[colnum] = currenth;

				cell.css("top", runningtotal + "px");
				cell.width(eachwidth);
				cell.height(newheight);

				var colx = colwidthpx * colnum;
				cell.css("left", colx + "px");
				grid.css("height", colheight[colnum] + "px");

				colnum++;
				if (colnum >= maxcols) {
					colnum = 0;
				}
			});
		checkScroll(grid);
	}

	function shortestColumn(colheight, defaultcolumn) {
		var shortColumn = 0;
		var shortColumnHeight = -1;
		for (let column in Object.keys(colheight)) {
			var onecolheight = colheight[column];
			if (shortColumnHeight == -1 || onecolheight < shortColumnHeight) {
				shortColumnHeight = onecolheight;
				shortColumn = column;
			}
		}
		//	return shortColumn;

		//Only change if its over 50px in diference
		var defaulttop = colheight[defaultcolumn];
		var shortesttop = colheight[shortColumn];
		if (defaulttop - shortesttop > 175) {
			return shortColumn;
		}

		return defaultcolumn;
	}

	function isInViewport(cell) {
		const rect = cell.getBoundingClientRect();
		var top = rect.top;
		top = top - 600;
		var isin =
			top <= (window.innerHeight || document.documentElement.clientHeight);
		return isin;
	}

	function gridupdatepositions(grid) {
		var resultsdiv = grid.closest(".lightboxresults");
		if (resultsdiv.length < 1) {
			resultsdiv = grid.closest(".resultsdiv");
		}

		var positionsDiv = resultsdiv.find(".resultspositions");

		if (positionsDiv.length > 0) {
			var oldpage = grid.data("currentpagenum");

			$(".masonry-grid-cell", grid).each(function (index, cell) {
				var elementviewport = isInViewport(cell);
				if (elementviewport) {
					var pagenum = $(cell).data("pagenum");
					if (pagenum != oldpage) {
						grid.data("currentpagenum", pagenum);
						positionsDiv.data("currentpagenum", pagenum);
						var url = positionsDiv.data("url");
						var options = positionsDiv.data();
						replaceelement(url, positionsDiv, options);
					}
					return false;
				}
			});
		}
	}

	function checkScroll(grid) {
		var currentscroll = $(".scrollview").scrollTop();

		var gridcells = $(".masonry-grid-cell", grid);
		if (gridcells.length == 0) {
			return; //No results?
		}

		//From the top to this height. Set the src
		$(grid)
			.find(".masonry-grid-cell")
			.each(function () {
				var cell = $(this);
				if (isInViewport(cell.get(0))) {
					var image = cell.find("img");
					if (image.prop("src") == undefined || image.prop("src") == "") {
						image.prop("src", image.data("imagesrc"));
						image.show();
					}
				}
			});

		var resultsdiv = grid.closest(".lightboxresults");
		if (resultsdiv.length < 1) {
			resultsdiv = grid.closest(".resultsdiv");
		}

		if (stopautoscroll) {
			// ignore scrolls
			// if (typeof getOverlay === "function" && getOverlay().is(":visible")) {
			// 	var lastscroll = getOverlay().data("lastscroll");

			// 	if (Math.abs(lastscroll - currentscroll) > 50) {
			// 		$(window).scrollTop(lastscroll);
			// 	}
			// }
			return;
		}

		gridupdatepositions(grid);

		var page = parseInt(resultsdiv.data("pagenum"));
		if (isNaN(page)) {
			page = 1;
		}

		var total = parseInt(resultsdiv.data("totalpages"));
		if (isNaN(total)) {
			total = 1;
		}
		if (page == total) {
			return;
		}

		var lastcell = gridcells.last().get(0);
		if (!isInViewport(lastcell)) {
			return; //not yet at bottom
		}

		stopautoscroll = true;
		page = page + 1;
		resultsdiv.data("pagenum", page);

		// if (!stackedviewpath) {
		// 	stackedviewpath = "/brickvertical.html";
		// }

		// var searchhome = resultsdiv.data("searchhome");
		// debugger;
		var link = grid.data("stackedviewpath");
		if (link == undefined) {
			console.log("No stackedviewpath defined");
			return;
		}

		var params = resultsdiv.cleandata();
		params.page = page;
		params.oemaxlevel = 1;

		$.ajax({
			url: link,
			xhrFields: {
				withCredentials: true,
			},
			cache: false,
			data: params,
			success: function (data) {
				var jdata = $(data);
				var code = $(".brickvertical", jdata).html();
				grid.append(code);
				grid.brickvertical("resize");
				$(window).trigger("resultsgenerated", [grid]);
				stopautoscroll = false;
			},
		});
	}

	var methods = {
		init: function (options) {
			var grid = $(this);
			verticalGridResize(grid);
			jQuery(window).on("resize", function () {
				verticalGridResize(grid);
			});

			jQuery(window).on("scroll", function () {
				checkScroll(grid);
			});

			grid.parents().filter(function () {
				var element = jQuery(this);
				if (
					element.css("overflow-y") == "auto" ||
					element.css("overflow") == "auto"
				) {
					element.on("scroll", function () {
						checkScroll(grid);
					});
				}
			});
			grid.removeClass("uninitialized");
			$(window).trigger("resultsgenerated", [grid]);
		},
		resize: function () {
			var grid = $(this);
			verticalGridResize(grid);
			grid.removeClass("uninitialized");
		},
	}; //Methods end

	$.fn.brickvertical = function (methodOrOptions) {
		//Generic brick caller
		if (methods[methodOrOptions]) {
			return methods[methodOrOptions].apply(
				this,
				Array.prototype.slice.call(arguments, 1)
			);
		} else if (typeof methodOrOptions === "object" || !methodOrOptions) {
			// Default to "init"
			return methods.init.apply(this, arguments);
		} else {
			$.error(
				"Method " + methodOrOptions + " does not exist on jQuery.tooltip"
			);
		}
	};
})(jQuery);
