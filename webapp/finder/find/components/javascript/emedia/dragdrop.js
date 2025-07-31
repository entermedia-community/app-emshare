var ajaxtimerrunning = false;
var app, siteroot, apphome, themeprefix;
var collectionId = "";
var categoryDragged;
var newCollection;
var isCategoryDragged = false;
var isCollectionCreatedByDragging = false;

var currentlyOver = null;
function handleDroppableOver(_, ui) {
	currentlyOver = $(this).parent().attr("id");
	$(this).addClass("dragoverselected");
	if (
		$(".lightboxdropasset.ui-droppable-hover").length > 0 ||
		$(".categorydroparea.ui-droppable-hover").length > 0
	) {
		ui.helper.css("transform", "scale(0.25)");
	}
}

function handleDroppableOut(_, ui) {
	$(this).removeClass("dragoverselected");
	if ($(this).parent().attr("id") == currentlyOver) {
		var scale = ui.helper.data("scale") || 1;
		ui.helper.css("transform", "scale(" + scale + ")");
	}
}

toggleajax = function (e) {
	e.preventDefault();
	var nextpage = $(this).attr("href");
	var loaddiv = $(this).attr("targetdivinner");
	var maxlevel = $(this).data("oemaxlevel");
	if (maxlevel) {
		if (!nextpage.contains("?")) {
			nextpage = nextpage + "?";
		}
		nextpage = nextpage + "oemaxlevel=" + maxlevel;
	}

	loaddiv = loaddiv.replace(/\//g, "\\/");
	var cell = $("#" + loaddiv);

	if (cell.hasClass("toggle_on") || cell.hasClass("toggle_off")) {
		var off = cell.hasClass("toggle_off");
		if (off) {
			cell.removeClass("toggle_off");
			cell.addClass("toggle_on");
			cell.show("fast");
		} else {
			cell.removeClass("toggle_on");
			cell.addClass("toggle_off");
			cell.hide("fast");
		}
	} else {
		jQuery.get(nextpage, {}, function (data) {
			cell.addClass("toggle_on");
			cell.show("fast");
		});
	}
};

// window.addEventListener("hashchange", function(e) { //Try listening to
// popstate and put the state (html) back in
$(window).bind("popstate", function change(e) {
	// alert('popped');
	var state = e.originalEvent.state;
	if (state) {
		$("#application").html(state);
		$(".modal-backdrop").remove();
	}
});

checkoutrefresh = function (e) {
	window.location.reload();
};

// Is this being used?
getConfirmation = function (inText) {
	if (!confirm(inText)) {
		return false;
	}
	return true;
};

clearApplets = function () {
	// Try to remove all applets before submitting form with jQuery.
	var coll = document.getElementsByTagName("APPLET");
	for (var i = 0; i < coll.length; i++) {
		var el = coll[i];
		el.parentNode.removeChild(el);
	}
};

pageload = function (hash) {
	// hash doesn't contain the first # character.
	if (hash) {
		var hasharray = hash.split("|");
		var targetdiv = hasharray[1];
		var location = hasharray[0];
		if (targetdiv != null && location != null) {
			targetdiv = targetdiv.replace(/\//g, "\\/");
			$("#" + targetdiv).load(location);
		}
	}
};

// Everyone put your onload stuff in here:
onloadselectors = function () {
	// autoheight("#emcontent");

	lQuery("a.toggleajax").livequery("click", toggleajax);

	lQuery("a.updatebasket").livequery("click", updatebasket);
	lQuery("a.updatebasketmediaviewer").livequery(
		"click",
		updatebasketmediaviewer
	);

	// $("a.updatebasketonasset").livequery('click', updatebasketonasset);

	lQuery(".em-delete").livequery("click", function (e) {
		var data = jQuery(this).data();
		var target = jQuery(this).data("target");
		jQuery.ajax({
			url: siteroot + apphome + "/components/data/delete.html",
			data: data,
			success: function () {
				jQuery(target).fadeOut();
			},
		});
		e.preventDefault();
	});

	lQuery("a.propertyset").livequery("click", function (e) {
		e.stopPropagation();
		e.preventDefault();
		var thelink = $(this);
		var propertyname = $(this).attr("propertyname");
		var propertyvalue = $(this).attr("propertyvalue");

		app = $("#application");
		siteroot = app.data("siteroot");
		apphome = app.data("apphome");
		var href =
			apphome +
			"/components/userprofile/saveprofileproperty.html?field=" +
			propertyname +
			"&" +
			propertyname +
			".value=" +
			propertyvalue;
		jQuery.ajax({
			url: href,
			success: function () {
				thelink.runAjax();
			},
			type: "POST",
			dataType: "text",
			xhrFields: {
				withCredentials: true,
			},
			crossDomain: true,
		});
		e.preventDefault();
	});

	lQuery(".desktop-send").livequery("click", function () {
		var button = jQuery(this);
		var data = button.data();
		var json = encodeURIComponent(JSON.stringify(data));

		app = $("#application");
		siteroot = app.data("siteroot");
		apphome = app.data("apphome");
		jQuery.ajax({
			url: apphome + "/components/desktop/sendcommand.html?command=" + json,
		});
	});

	// move this to the settings.js or someplace similar
	lQuery(".addmygroupusers").livequery(function () {
		var theinput = $(this);
		if (theinput && theinput.autocomplete) {
			var assetid = theinput.attr("assetid");
			/*
			 * theinput.autocomplete({ source: ["c++", "java",
			 * "php", "coldfusion", "javascript", "asp", "ruby"]
			 * });
			 */
			theinput.autocomplete({
				source:
					apphome +
					"/components/autocomplete/addmygroupusers.txt?assetid=" +
					assetid,
				select: function (event, ui) {
					// set input that's just for display
					// purposes
					$(".addmygroupusers").val(ui.item.display);
					// set a hidden input that's
					// actually used when the form is
					// submitted
					$("#hiddenaddmygroupusers").val(ui.item.value);
					var targetdiv = $("#hiddenaddmygroupusers").attr("targetdiv");
					var targeturl = $("#hiddenaddmygroupusers").attr("postpath");
					jQuery.get(targeturl + ui.item.value, function (result) {
						$("#" + targetdiv).html(result);
					});
					return false;
				},
			});
		}
	});
	lQuery(".userautocomplete").livequery(function () {
		var theinput = $(this);
		if (theinput && theinput.autocomplete) {
			var theinputhidden = theinput.attr("id") + "hidden";
			theinput.autocomplete({
				source: apphome + "/components/autocomplete/usersuggestions.txt",
				select: function (event, ui) {
					// set input that's just for display
					// purposes
					theinput.val(ui.item.display);
					// set a hidden input that's
					// actually used when the form is
					// submitted
					$("#" + theinputhidden).val(ui.item.value);
					return false;
				},
			});
		}
	});

	lQuery(".googlecontactlist").livequery(function () {
		var theinput = $(this);
		if (theinput) {
			var theinputhidden = theinput.attr("id") + "hidden";
			theinput.autocomplete({
				source: apphome + "/views/settings/google/contactsearch.txt",
				select: function (event, ui) {
					// set input that's just for display purposes
					theinput.val(ui.item.display);
					// set a hidden input that's actually used when the form is
					// submitted
					$("#" + theinputhidden).val(ui.item.value);
					return false;
				},
			});
		}
	});

	lQuery(".addmygroups").livequery(function () {
		var theinput = $(this);
		if (theinput && theinput.autocomplete) {
			var assetid = theinput.attr("assetid");
			theinput.autocomplete({
				source:
					apphome +
					"/components/autocomplete/addmygroups.txt?assetid=" +
					assetid,
				select: function (event, ui) {
					// set input that's just for display
					// purposes
					$(".addmygroups").val(ui.item.label);
					// set a hidden input that's
					// actually used when the form is
					// submitted
					$("#hiddenaddmygroups").val(ui.item.value);
					var targetdiv = $("#hiddenaddmygroups").attr("targetdiv");
					var targeturl = $("#hiddenaddmygroups").attr("postpath");
					jQuery.get(targeturl + ui.item.value, function (result) {
						$("#" + targetdiv).html(result);
					});
					return false;
				},
			});
		}
	});

	lQuery("table.striped tr:nth-child(even)").livequery(function () {
		$(this).addClass("odd");
	});

	lQuery("div.emtable.striped div.row:nth-child(even)").livequery(function () {
		$(this).addClass("odd");
	});

	lQuery("#tree div:even").livequery(function () {
		$(this).addClass("odd");
	});
	lQuery(".commentresizer").livequery(function () {
		var ta = $(this).find("#commenttext");
		ta.click(function () {
			var initial = ta.attr("initialtext");
			if (ta.val() == "Write a comment" || ta.val() == initial) {
				ta.val("");
				ta.unbind("click");
				var button = $(".commentresizer #commentsubmit");
				button.show();
			}
		});
		// ta.prettyComments();
		ta.focus();
	});

	lQuery(".initialtext").livequery("click", function () {
		var ta = $(this);

		var initial = ta.data("initialtext");
		if (!initial) {
			initial = ta.attr("initialtext");
		}
		if (ta.val() == "Write a comment" || ta.val() == initial) {
			ta.val("");
			ta.removeClass("initialtext");
			ta.unbind("click");
		}
	});

	if (!window.name || window.name == "") {
		window.name = "uploader" + new Date().getTime();
	}

	/*
	 * var appletholder = $('#emsyncstatus'); // if(appletholder.size() > 0) // { //
	 * appletholder.load('$siteroot/${page.applicationid}/components/uploadqueue/index.html?appletname=' +
	 * window.name); // }
	 */
	lQuery(".baseemshowonhover").livequery(function () {
		var image = $(this);

		$(this)
			.parent()
			.hover(
				function () {
					image.addClass("baseemshowonhovershow");
				},
				function () {
					image.removeClass("baseemshowonhovershow");
				}
			);
	});

	// Handles emdropdowns
	lQuery("div[id='emdropdown']").livequery(function () {
		$(this).mouseleave(function () {
			var el = document.getElementById("emdropdowndiv");
			if (el) {
				$(el).attr("status", "hide"); // Beware this gets
				// called when popup
				// is shown
			}
		});

		$(this).click(function () {
			var el = $(this).find(".emdropdowncontent");
			el.bind("mouseleave", function () {
				$(this).attr("status", "hide");
				$(this).hide();
			});
			// var offset = $(this).offset();
			// var top = offset.top + 20;
			// el.css("top", top + "px");
			// el.css("left", offset.left+ "px");

			var path = el.attr("contentpath");
			if (path) {
				el.load(siteroot + path);
			}
			el.attr("status", "show"); // The mouse may jump over a gap so we
			// need delay the show
			el.show();
			var id = el.attr("id");
			setTimeout(function () {
				el = $("#" + id);
				if (el.attr("status") == "show") {
					el.show();
				}
			}, 300);
		});
	});
	if (jQuery.history) {
		jQuery.history.init(pageload);
		// set onlick event for buttons
		$("a[class='ajax']").click(function () {
			var hash = this.href;
			var targetdiv = this.targetdiv;

			hash = hash.replace(/^.*#/, "");
			// moves to a new page.
			// page load is called at once.
			hash = hash + "|" + targetdiv;
			jQuery.history.load(hash);
			return false; // why is this here
		});
	}

	// This clears out italics and grey coloring from the search box if it has a
	// user-entered value
	if ($("#assetsearchinput").val() != "Search") {
		$("#assetsearchinput").removeClass("defaulttext");
	}

	lQuery(".rowdraggable").livequery(function () {
		$(this).draggable({
			helper: "clone",
			revert: "invalid",
		});
	});

	function scaleDown(el, maxD = 150) {
		var scale = maxD / Math.max(el.width(), el.height());
		if (scale === Infinity) {
			scale = 1;
		}
		el.css("transform", "scale(" + scale + ")");
		el.data("scale", scale);
	}
	//Check on jquery.draggable
	if (jQuery.fn.draggable) {
		lQuery(".assetdraggable").livequery(function () {
			var scope = "default";
			var modalCheck = $(this).closest(".modal");
			if (modalCheck.length) {
				scope = "modal";
			}
			$(this).draggable({
				distance: 10,
				scope: scope,
				helper: function () {
					var toclone = $(this);
					var draggclone = $(this).data("draggholderclone");
					if (draggclone) {
						var toclone2 = $(this).find("." + draggclone);
						if (toclone2) {
							toclone = toclone2;
							console.log("found " + draggclone);
						}
					}
					var cloned = toclone.clone();
					scaleDown(cloned);
					cloned.addClass("clonedragging");
					var total = $("input.selectionbox:checked").length;
					if (total > 1) {
						cloned.append(
							'<div class="dragcount emnotify">+' + total + "</div>"
						);
					}

					return cloned;
				},
				start: function () {
					$(this).draggable("instance").offset.click = {
						left: Math.floor($(this).width() / 2),
						top: Math.floor($(this).height() / 2),
					};
				},
				handle: $(".draggholder"),
				revert: "invalid",
				appendTo: "body",
				containment: "document",
				zIndex: 300000,
			});
		}); //assetdraggable

		lQuery(".headerdroppable").livequery(function () {
			$(this).droppable({
				drop: function (event, ui) {
					var source = ui.draggable.attr("id");
					var node = $(this);
					var destination = $(this).attr("id");

					if (!node || !destination) {
						return;
					}

					var resultsdiv = $(this).closest(".resultsdiv");
					if (!resultsdiv.length) {
						resultsdiv = $(this).data("targetdiv");
						resultsdiv = $("#" + resultsdiv);
					}

					var searchhome = resultsdiv.data("searchhome");
					var options = resultsdiv.data();
					options.source = source;
					options.destination = destination;

					var editing = ui.draggable.attr("editing");
					if (!editing) {
						editing = false;
					}

					options.editheader = editing;

					$.get(searchhome + "/savecolumns.html", options, function (data) {
						resultsdiv.replaceWith(data);
					});
				},
				tolerance: "pointer",
				over: handleDroppableOver,
				out: handleDroppableOut,
			});
		}); //headerdroppable

		lQuery(".categorydraggable").livequery(function () {
			$(this).draggable({
				delay: 300,
				helper: function () {
					var cloned = $(this).clone();
					scaleDown(cloned, 250);
					$(cloned).addClass("categorydragging");
					var total = $("input.selectionbox:checked").length;
					if (total > 1) {
						cloned.append(
							'<div class="dragcount emnotify">+' + total + "</div>"
						);
					}

					return cloned;
				},
				revert: "invalid",
			});
		}); //categorydraggable

		lQuery(".assetdropcategory .categorydroparea").livequery(function () {
			var scope = "default";
			var modalCheck = $(this).closest(".modal");
			if (modalCheck.length) {
				scope = "modal";
			}

			$(this).droppable({
				scope: scope,
				drop: function (event, ui) {
					var node = $(this);
					if (
						!node.hasClass("categorydroparea") &&
						!node.hasClass("assetdropcategory")
					) {
						return;
					}
					var categoryid = node.parent().data("nodeid");
					var targetcategoryid = ui.draggable.data("nodeid");

					if (targetcategoryid) {
						var tree = node.closest(".emtree");
						var params = tree.data();
						params["categoryid"] = targetcategoryid; // Remove
						// from
						// self
						params["categoryid2"] = categoryid;
						params["oemaxlevel"] = "1";
						params["tree-name"] = tree.data("treename");

						jQuery.get(
							apphome + "/components/emtree/movecategory.html",
							params,
							function (data) {
								tree.closest("#treeholder").replaceWith(data);
							}
						);
					} else {
						var assetid = ui.draggable.data("assetid");
						if (!assetid) {
							console.log("No asset");
							//Could be an entity drop
							return;
						}
						var resultsdiv = ui.draggable.closest(".resultsdiv");
						if (!resultsdiv.length) {
							resultsdiv = $(".resultsdiv");
						}
						var hitssessionid = resultsdiv.data("assethitssessionid");

						// this is a category
						var moveit = false;
						if (node.closest(".assetdropcategorymove").length > 0) {
							moveit = true;
						}
						var rootcategory = node.closest(".emtree").data("rootnodeid");

						jQuery.get(
							apphome + "/components/categorize/addassetcategory.html",
							{
								assetid: assetid,
								categoryid: categoryid,
								assethitssessionid: hitssessionid,
								moveasset: moveit,
								rootcategoryid: rootcategory,
								oemaxlevel: 1,
							},
							function (data) {
								customToast(data);
								node.removeClass("dragoverselected");
							}
						);
					}
				},
				tolerance: "pointer",
				over: handleDroppableOver,
				out: handleDroppableOut,
			});
		}); //assetdropcategory

		// Entities tree droppable
		lQuery(".assetdropentity").livequery(function () {
			var node = $(this);
			node.droppable({
				drop: function (event, ui) {
					var element = $(this);

					var entityid = element.data("entityid");
					var moduleid = element.data("moduleid");

					var assetid = ui.draggable.data("assetid");
					var categoryid = ui.draggable.data("nodeid");

					var hitssessionid = $(".resultsdiv").data("assethitssessionid");

					var options = {};
					if (assetid) {
						options.assetid = assetid;
					}
					if (categoryid) {
						options.categoryid = categoryid;
					}
					options.entityid = entityid;
					options.moduleid = moduleid;
					options.hitssessionid = hitssessionid;

					$.ajax({
						url: apphome + "/components/entities/addassetentity.html",
						data: options,
						async: false,
						success: function (data) {
							var targetdiv = node.data("targetdiv");
							var targeturl = node.data("attachedmediaurl");
							targetdiv = $("#" + targetdiv);
							if (targetdiv.length) {
								var options = {};
								options.entityid = entityid;
								options.moduleid = moduleid;
								options.rootcategory = node.data("rootcategory");
								options.assetsshown = node.data("assetsshown");
								jQuery.get(targeturl, options, function (data2) {
									// success
									targetdiv.replaceWith(data2);
									if (data.trim() != "") {
										customToast(data);
									}
									targetdiv.removeClass("dragoverselected");
								});
							}
						},
					});
				},
				tolerance: "pointer",
				over: handleDroppableOver,
				out: handleDroppableOut,
			});
		}); //assetdropentity

		// Entities tree droppable
		lQuery(".lightboxdropasset").livequery(function () {
			var scope = "default";
			var modalCheck = $(this).closest(".modal");
			if (modalCheck.length) {
				scope = "modal";
			}

			var node = $(this);
			node.droppable({
				scope: scope,
				drop: function (event, ui) {
					var boxmenu = $(this);
					var assetid = ui.draggable.data("assetid");

					var dragged = $(ui.draggable);

					var resultsdiv = dragged.closest(".resultsdiv");
					var hitssessionid = dragged
						.closest(".resultsdiv")
						.data("assethitssessionid");
					if (hitssessionid == undefined) {
						hitssessionid = resultsdiv.data("assethitssessionid");
					}

					var options = boxmenu.cleandata();
					if (assetid) {
						options.assetid = assetid;
					}
					options.hitssessionid = hitssessionid;

					var searchhome = boxmenu.data("edithome");

					$.ajax({
						url: searchhome + "/addassetstobox.html",
						data: options,
						xhrFields: {
							withCredentials: true,
						},
						crossDomain: true,
						type: "POST",
						success: function (data) {
							var targetdiv = node.closest("#lightboxessidemenu");
							if (targetdiv.length) {
								targetdiv.replaceWith(data);
							}
							node.removeClass("dragoverselected");
						},
					});
				},
				tolerance: "pointer",
				over: handleDroppableOver,
				out: handleDroppableOut,
			});
		}); //lightboxdropasset

		lQuery(".sortableassets .assetdroppable").livequery(function () {
			var scope = "default";
			var modalCheck = $(this).closest(".modal");
			if (modalCheck.length) {
				scope = "modal";
			}

			var targetnode = $(this);
			targetnode.droppable({
				scope: scope,
				drop: function (event, ui) {
					var sourcenode = $(ui.draggable);
					var sourceid = sourcenode.data("dataid");

					var resultsdiv = $(targetnode).closest(".resultsdiv");

					var options = resultsdiv.cleandata();
					options.dataid = sourceid;
					options.targetid = targetnode.data("dataid");
					options.hitssessionid = resultsdiv.data("assethitssessionid");

					//Save scroll location?
					var searchhome = resultsdiv.data("searchhome");
					$.ajax({
						url: searchhome + "/orderInsertData.html",
						data: options,
						xhrFields: {
							withCredentials: true,
						},
						crossDomain: true,
						type: "POST",
						success: function (data) {
							//load
							var editdiv = resultsdiv.closest(".editdiv");
							//autoreload(editdiv, null, "editdiv");
							$(window).trigger("autoreload", [editdiv, null, "editdiv"]);

							//$(window).trigger("checkautoreload", [resultsdiv]);
						},
					});
				},
				tolerance: "pointer",
				over: handleDroppableOver,
				out: handleDroppableOut,
			});
		}); //sortableassets

		lQuery(".hitmovetotop").livequery("click", function () {
			var cell = $(this).closest(".masonry-grid-cell");
			var resultsdiv = cell.closest(".resultsdiv");

			var options = resultsdiv.cleandata();
			options.dataid = cell.data("dataid");

			//Save scroll location?
			var searchhome = resultsdiv.data("searchhome");
			$.ajax({
				url: searchhome + "/orderMoveToTop.html",
				data: options,
				xhrFields: {
					withCredentials: true,
				},
				crossDomain: true,
				type: "POST",
				success: function (data) {
					//load
					//$(window).trigger("checkautoreload", [resultsdiv]);
					var editdiv = resultsdiv.closest(".editdiv");
					$(window).trigger("autoreload", [editdiv, null, "editdiv"]);
				},
			});
		});
	} //all droppable items

	$(this) //Is this used?
		.find(".autosubmited")
		.change(function () {
			$(this).parents("form").submit();
		});

	lQuery(".emfadeout").livequery(function () {
		$(this).fadeOut(3000, function () {
			$(this).html("");
		});
	});
}; // End of selections

autoheight = function (container) {
	var maxHeight = 0;

	// This will check first level children ONLY as intended.
	$(container + " > *").each(function () {
		height = $(this).outerHeight(true); // outerHeight will add padding and
		// margin to height total
		if (height > maxHeight) {
			maxHeight = height;
		}
	});

	$(container).height(maxHeight);
};

$(document).ready(function () {
	app = $("#application");
	siteroot = app.data("siteroot");
	apphome = app.data("apphome");
	themeprefix = app.data("siteroot") + app.data("themeprefix");
	onloadselectors();
	emcomponents();
});

emcomponents = function () {
	lQuery("img.assetdragdrop").livequery(function () {
		var img = $(this);

		var httplink = location.protocol + "//" + location.host;
		var filename = img.data("name");
		var urls =
			httplink +
			apphome +
			"/views/modules/asset/downloads/originals/" +
			img.data("sourcepath") +
			"/" +
			filename;

		var handler = function (event) {
			if (
				event.dataTransfer.getData("application/x-moz-file-promise-url") &&
				navigator.appVersion.indexOf("Win") != -1
			) {
				event.dataTransfer.setData("application/x-moz-file-promise-url", urls);
				event.dataTransfer.setData(
					"application/x-moz-file-promise-dest-filename",
					filename
				);
				event.dataTransfer.effectAllowed = "all";
			} else {
				event.dataTransfer.clearData();
				var download = "application/force-download:" + filename + ":" + urls;
				event.dataTransfer.setData("DownloadURL", download);
				event.dataTransfer.effectAllowed = "copy";
			}

			event.dataTransfer.setData("text/uri-list", urls);
			event.dataTransfer.setData("text/plain", urls);

			return true;
		};

		// THIS IS NOT QUITE WORKING
		// this.addEventListener('dragstart', handler, false );
		// this.parentNode.addEventListener('dragstart', handler, false
		// ); //Deal with A tags?
	});
};

String.prototype.trimEllip = function (length) {
	return this.length > length ? this.substring(0, length) + "..." : this;
};
