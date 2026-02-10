$(function () {
	lQuery(".emtree-widget ul li div .cat-arrow").livequery(
		"click",
		function (e) {
			e.stopPropagation();
			toggleExpandNode.call(this);
		}
	);
	function toggleExpandNode(selecting = false) {
		//console.log($(this), selecting);
		var tree = $(this).closest(".emtree");
		var node = $(this).closest(".noderow");
		var iscurrent = $(this).hasClass("cat-current");
		var nodeid = node.data("nodeid");
		var depth = node.data("depth");
		tree.find("ul li div").removeClass("selected");

		var home = $(this).closest(".emtree").data("home");

		if ($(this).find(".cat-arrow").hasClass("down")) {
			$(this).find(".cat-arrow").removeClass("down");
		} else {
			//Open it. add a UL
			$(this).find(".cat-arrow").addClass("down");
		}

		tree.find(nodeid + "_add").remove();
		node.load(
			home +
				"/components/emtree/tree.html?toggle=true&treename=" +
				tree.data("treename") +
				"&nodeID=" +
				nodeid +
				"&depth=" +
				depth +
				"&canupload=" +
				tree.data("canupload") +
				(selecting ? "&selecting=true" : "") +
				(iscurrent ? "&currentnodeid=" + nodeid : ""),
			function () {
				$(window).trigger("resize");
			}
		);
	}

	lQuery(".emtree-widget ul li div .cat-name").livequery(
		"click",
		function (event) {
			event.stopPropagation();
			if (
				$(this).hasClass("cat-leaf") &&
				!$(this).parent().hasClass("expanded")
			) {
				toggleExpandNode.call($(this).siblings(".cat-arrow"), true);
			}
			var tree = $(this).closest(".emtree");
			var node = $(this).closest(".noderow");
			$("ul li div.cat-current", tree).addClass("categorydroparea");
			$("ul li div", tree).removeClass("selected cat-current");
			$("div:first", node)
				.addClass("cat-current")
				.removeClass("categorydroparea");
			var nodeid = node.data("nodeid");
			tree.data("currentnodeid", nodeid);
			var prefix = tree.data("urlprefix");

			//Regular Tree
			var options = [];
			var resultsdiv = tree.closest(".resultsdiv");
			if (resultsdiv.length) {
				resultsdiv.data("categoryid", nodeid);
				resultsdiv.data("nodeID", nodeid);
			}
			gotopage(tree, node, prefix, options);

			var event = $.Event("emtreeselect");
			event.tree = tree;
			event.nodeid = nodeid;
			$(document).trigger(event);

			var $contextMenu = $(".treecontext");
			if ($contextMenu.length > 0) {
				$contextMenu.hide();
			}
		}
	);

	lQuery(".treerow.cat-current").livequery(function () {
		console.log(this);
		$(this).scrollIntoView({
			offset: -50,
			container: ".searchcategories-tree",
		});
	});

	gotopage = function (tree, node, prefix, inOptions) {
		//postfix not used

		var treeholder = $("div#categoriescontent");
		var toplocation = parseInt(treeholder.scrollTop());
		var leftlocation = parseInt(treeholder.scrollLeft());
		var nodeid = node.data("nodeid");
		var home = tree.data("home");
		var depth = node.data("depth");
		var collectionid = node.data("collectionid");
		var reloadurl = "";
		var appnavtab = $("#appnavtab").data("openmodule");
		if (prefix == undefined || prefix == "") {
			//Asset Module
			reloadurl =
				home +
				"/views/modules/asset/editors/viewfilescategory/" +
				nodeid +
				"/" +
				node.data("categorynameesc") +
				".html";
			prefix = reloadurl;
		} else {
			var customprefix = tree.data("customurlprefix");
			if (customprefix) {
				reloadurl = customprefix;
			} else {
				reloadurl = prefix;
				reloadurl = reloadurl + "?nodeID=" + nodeid;
			}
		}

		var resultsdiv = tree.closest(".assetresults");
		if (!resultsdiv) {
			resultsdiv = $("#resultsdiv");
		}
		var hitssessionid = resultsdiv.data("hitssessionid");
		if (hitssessionid) {
			reloadurl = reloadurl + "?hitssessionid=" + hitssessionid;
		}

		var options = tree.cleandata();

		//includeeditcontext
		if (
			options["includeeditcontext"] === undefined ||
			options["includeeditcontext"] === true
		) {
			var editdiv = tree.closest(".editdiv"); //This is used for lightbox tree opening
			if (editdiv.length > 0) {
				var otherdata = editdiv.cleandata();
				options = {
					...otherdata,
					...options,
				};
			} else {
				//console.warn("No editdiv found for includeeditcontext");
			}
		}

		options["nodeID"] = nodeid;
		options["treetoplocation"] = toplocation;
		options["treeleftlocation"] = leftlocation;
		options["depth"] = depth;
		options["categoryid"] = nodeid;
		options["rootcategory"] = tree.data("rootnodeid");
		options["hitssessionid"] = hitssessionid;

		if (collectionid) {
			options.collectionid = collectionid;
		}
		var searchchildren = tree.data("searchchildren");
		if (appnavtab == "asset") {
			//for now
			searchchildren = true;
		}
		options.searchchildren = searchchildren;

		if (inOptions["oemaxlevel"]) {
			options.oemaxlevel = inOptions["oemaxlevel"];
		}

		//jQuery.get(prefix + nodeid + postfix,
		jQuery.get(prefix, 
			{
				...options
			}, function (data) {
			//data = $(data);

			var targetdiv = tree.data("targetdivinner");
			var onpage;
			if (targetdiv) {
				var cell = jQuery("#" + targetdiv);
				onpage = cell;
				cell.html(data);
			} else {
				targetdiv = tree.data("targetdiv");
				if (targetdiv) {
					var cell = jQuery("#" + targetdiv);
					onpage = cell.parent();
					cell.replaceWith(data);
				}
			}

			cell = findClosest(onpage, "#" + targetdiv);

			$(window).trigger("setPageTitle", [cell]);

			if (
				typeof global_updateurl !== "undefined" &&
				global_updateurl == false
			) {
				//globaly disabled updateurl
			} else {
				//Update Address Bar
				if (tree.data("updateaddressbar")) {
					history.pushState($("#application").html(), null, reloadurl);
				}
			}

			$(window).trigger("resize");
		});
	};

	var treeTop = $(".cat-current");
	if (treeTop.length) {
		$("div#treeholder").scrollTop(parseInt(treeTop.offset().top));
	}

	//need to init this with the tree
	lQuery("div#treeholder").livequery(function () {
		var treeholder = $(this);
		var top = treeholder.data("treetoplocation");
		if (top) {
			var left = treeholder.data("treeleftlocation");
			var catcontent = $("div#categoriescontent");
			catcontent.scrollTop(parseInt(top));
			catcontent.scrollLeft(parseInt(left));
		}
	});

	lQuery("#treeholder input").livequery("click", function (event) {
		event.stopPropagation();
	});

	lQuery("#treeholder input").livequery("keyup", function (event) {
		var input = $(this);
		var node = input.closest(".noderow");
		var tree = input.closest(".emtree");
		var value = input.val();
		//console.log("childnode",node);
		var nodeid = node.data("nodeid");
		if (event.keyCode == 13) {
			//13 represents Enter key
			var action = input.data("action");
			if (action != "create") {
				action = "rename";
			}
			var rootid = tree.data("treename") + "root";
			var link =
				tree.data("home") +
				"/components/emtree/savenode.html?action=" +
				action +
				"&treename=" +
				tree.data("treename") +
				"&" +
				rootid +
				"=" +
				tree.data("rootnodeid") +
				"&depth=" +
				node.data("depth");

			var targetdiv = tree.closest("#treeholder");

			if (action == "rename" && nodeid != undefined) {
				link = link + "&nodeID=" + nodeid;
				link = link + "&adding=true";

				targetdiv = node;
			} else {
				node = node.parent(".noderow");
				nodeid = node.data("nodeid");
				if (nodeid != undefined) {
					link = link + "&parentNodeID=" + nodeid;
				}
				var currentnodeid = tree.data("currentnodeid");
				if (currentnodeid) {
					link = link + "&currentnodeID=" + currentnodeid;
				}
			}
			//tree.closest("#treeholder").load(link, {edittext: value}, function() {
			var options = tree.data();
			options["edittext"] = value;
			$.get(link, 
					{
						...options
					}, function (data) {
				targetdiv.replaceWith(data);
				//Reload tree in case it moved order
				//repaintEmTree(tree);
			});
		} else if (event.keyCode === 27) {
			//esc
			input.closest(".createnodetree").hide();
		}
	});

	getNode = function (clickedon) {
		var clickedon = $(clickedon);
		var contextmenu = $(clickedon.closest(".treecontext"));
		var node = contextmenu.data("selectednoderow");
		if (!node) {
			node = $(clickedon).closest(".noderow");
		}
		contextmenu.hide();
		return node;
	};
	lQuery(".treecontext #nodeproperties").livequery("click", function (event) {
		event.stopPropagation();
		var node = getNode(this);
		var tree = node.closest(".emtree");
		var nodeid = node.data("nodeid");
		var link =
			tree.data("home") +
			"/views/modules/category/editors/data/editdialog.html?categoryid=" +
			nodeid +
			"&id=" +
			nodeid +
			"&viewid=categorygeneral";
		$(this).attr("href", link);
		$(this).data("dialogid", "categoryproperties");
		$(this).emDialog();
		return false;
	});

	lQuery(".treedesktopdownload").livequery("click", function (event) {
		event.stopPropagation();
		var node = getNode(this);
		var categoryid = node.data("nodeid");
		if (categoryid == null) {
			categoryid = $(this).data("categoryid");
		}
		listCategoryAssets($(this), event, categoryid);
	});

	lQuery(".treecontext #addmedia, .cat-uploadfromtree").livequery(
		"click",
		function (event) {
			event.stopPropagation();
			var node = getNode(this);
			var nodeid = node.data("nodeid");
			var tree = node.closest(".emtree");

			var collectionid = node.data("collectionid");
			var postfix = "";

			//clear other entities on Upload Form
			var options = [];
			//debugger;
			var customurladdmedia = tree.data("customurladdmedia");
			if (customurladdmedia) {
				var url = customurladdmedia;
				options["oemaxlevel"] = tree.data("uploadmaxlevel");
				gotopage(tree, node, url, options);
			} else {
				var url =
					tree.data("home") +
					"/views/modules/asset/editors/assetupload/index.html";
				//options["oemaxlevel"] = $(this).data("oemaxlevel");
				options["oemaxlevel"] = tree.data("uploadmaxlevel");
				options["updateurl"] = "false";
				gotopage(tree, node, url, options);
			}
			$(".treerow").removeClass("cat-current").addClass("categorydroparea");
			$("#" + nodeid + "_row > .treerow")
				.addClass("cat-current")
				.removeClass("categorydroparea");

			return false;
		}
	);

	lQuery(".addtomodule").livequery("click", function (event) {
		event.stopPropagation();

		var link = $(this);
		var node = getNode(this);
		var nodeid = node.data("nodeid");
		var tree = node.closest(".emtree");

		link.data("copyingcategoryid", nodeid);

		link.emDialog();

		return false;
	});

	lQuery(".treecontext #renamenode").livequery("click", function (event) {
		event.stopPropagation();
		var node = getNode(this);
		var tree = node.closest(".emtree");
		var nodeid = node.data("nodeid");
		var link =
			tree.data("home") +
			"/components/emtree/rename.html?treename=" +
			tree.data("treename") +
			"&nodeID=" +
			nodeid +
			"&depth=" +
			node.data("depth");
		node.find("> .treerow").load(link, function () {
			node.find("input").select().focus();
		});
		return false;
	});
	lQuery(".treecontext #deletenode").livequery("click", function (event) {
		event.stopPropagation();
		var node = getNode(this);
		var tree = node.closest(".emtree");
		var nodeid = node.data("nodeid");
		var agree = confirm("Are you sure you want to delete?");
		if (agree) {
			//console.log("removing",node, nodeid);
			var link =
				tree.data("home") +
				"/components/emtree/delete.html?treename=" +
				tree.data("treename") +
				"&nodeID=" +
				nodeid +
				"&depth=" +
				node.data("depth");
			var options = tree.data();
			$.get(link, 
					{
						...options
					}, function (data) {
				//tree.closest("#treeholder").replaceWith(data);
				//Reload tree in case it moved order
				repaintEmTree(tree);
			});
		}
		return false;
	});
	lQuery(".treecontext #createnode").livequery("click", function (event) {
		event.stopPropagation();
		var node = getNode(this);
		var tree = node.closest(".emtree");
		var link =
			tree.data("home") +
			"/components/emtree/create.html?treename=" +
			tree.data("treename") +
			"&depth=" +
			node.data("depth");
		$.get(link, function (data) {
			node.append(data);
			var theinput = $("#treeaddnodeinput");
			if (theinput.length > 0) {
				theinput.focus({ preventScroll: false });
				//theinput.select();
				//theinput.focus();
			}
			$(document).trigger("domchanged");
		});
		return false;
	});

	lQuery(".createfoldertree").livequery("click", function (event) {
		event.stopPropagation();
		var link = $(this);

		var tree = $("#" + link.data("tree"));

		var node = tree.find(".rootnoderow");

		var link =
			tree.data("home") +
			"/components/emtree/create.html?treename=" +
			tree.data("treename") +
			"&depth=" +
			node.data("depth");
		$.get(link, function (data) {
			node.append(data);
			var theinput = node.find("input");
			theinput.focus({ preventScroll: false });
			//theinput.select();
			theinput.focus();
			$(document).trigger("domchanged");
		});
		return false;
	});

	lQuery(".treecontext #createcollection").livequery("click", function (event) {
		event.stopPropagation();
		var node = getNode(this);
		var nodeid = node.data("nodeid");

		var tree = node.closest(".emtree");
		var link =
			tree.data("home") +
			"/views/modules/librarycollection/createcollection.html";

		var catoptions = node.data();

		link =
			link +
			"?oemaxlevel=3&field=rootcategory&rootcategory.value=" +
			catoptions.nodeid +
			"&field=name&name.value=" +
			catoptions.categoryname;

		var targetdiv = "application";

		$.get(link, function (data) {
			//var cell = jQuery("#" + targetdiv);
			//cell.replaceWith(data);

			customToast("Collection Created");
		});
		return false;
	});
	
	
	lQuery(".treecontext #togglefeatured").livequery("click", function (event) {
			event.stopPropagation();
			var node = getNode(this);
			var nodeid = node.data("nodeid");
			var catoptions = node.data();
			var tree = node.closest(".emtree");
			var link =
				tree.data("home") +
				"/components/emtree/togglefeatured.html";

			link = link + "?categoryid=" + catoptions.nodeid;
			
							
			var targetdiv = "application";

			$.get(link, function (data) {
				//var cell = jQuery("#" + targetdiv);
				//cell.replaceWith(data);
				if (node.data("isfeatured")){
					node.data("isfeatured", false);
					customToast("Category Removed from Featured");
				}
				else {
					node.data("isfeatured", true);
					customToast("Category Marked as Featured");
				}
				
			});
			return false;
		});

	lQuery(".treecontext #downloadnode").livequery("click", function (event) {
		event.stopPropagation();
		var node = getNode(this);
		var nodeid = node.data("nodeid");
		var catname = node.data("categorynameesc");

		var tree = node.closest(".emtree");

		var link =
			tree.data("home") +
			"/views/modules/asset/downloads/bycategory/" +
			nodeid +
			"/" +
			catname +
			".zip";
		window.location.href = link;
		return false;
	});

	function getPosition(e) {
		var posx = 0;
		var posy = 0;

		if (!e) var e = window.event;

		if (e.clientX || e.clientY) {
			posx = e.clientX;
			posy = e.clientY;
		} else if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		}

		return {
			x: posx,
			y: posy,
		};
	}

	var contextmenu = function (item, e) {
		var noderow = item;
		//var noderow = $(this); // LI is the think that has context .find("> .noderow");
		$(".categorydroparea").removeClass("selected");
		noderow.find("> .categorydroparea").addClass("selected");
		var emtreediv = noderow.closest(".emtree");
		var treename = emtreediv.data("treename");
		var contextMenu = $("#" + treename + "contextMenu");
		if (contextMenu.length > 0) {
			e.preventDefault();
			var pos = getPosition(e);
			var xPos = pos.x;
			if (xPos < 16) {
				xPos = xPos + 16;
			}
			var yPos = pos.y;

			contextMenu.data("selectednoderow", noderow);
			var iscollection = noderow.data("collectionid");
			$("#" + treename + "contextMenu #createcollection").show();
			if (iscollection != null && iscollection != "") {
				$("#" + treename + "contextMenu #createcollection").hide();
			}
			var isfeatured = noderow.data("isfeatured");
			var menuitem = $("#" + treename + "contextMenu #togglefeatured");
			if(isfeatured){
				menuitem.text(menuitem.data("removefeatured"));
            }
			else {
				menuitem.text(menuitem.data("addfeatured"));
			}

			contextMenu.css({
				display: "block",
				left: xPos,
				top: yPos,
			});
			e.stopPropagation();
			return false;
		}
	};

	$("body").on("contextmenu", ".noderow", function (e) {
		contextmenu($(this), e);
	});
	lQuery(".cat-menu").livequery("click", function (e) {
		contextmenu($(this).closest(".noderow"), e);
	});

	lQuery("body").livequery("click", function () {
		var $contextMenu = $(".treecontext");
		if ($contextMenu.length > 0) {
			$contextMenu.hide();
			$(".categorydroparea").removeClass("selected");
		}
	});

	$(document).keydown(function (e) {
		switch (e.which) {
			case 27: // esc
				var $contextMenu = $(".treecontext");
				if ($contextMenu.length) {
					$contextMenu.hide();
					$(".categorydroparea").removeClass("selected");
					e.preventDefault();
				}
				break;
			default:
				return; // exit this handler for other keys
		}
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

	function repaintEmTree(tree) {
		var home = tree.data("home");
		var link = home + "/components/emtree/tree.html";
		var options = tree.data();
		options["treename"] = tree.data("treename"); //why?
		$.get(link, 
				{
					...options
				}, function (data) {
			tree.closest("#treeholder").replaceWith(data);
			$(document).trigger("domchanged");
		});
	}
});
