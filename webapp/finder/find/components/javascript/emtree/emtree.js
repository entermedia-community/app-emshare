$(document).ready(function() 
{ 
	//Open and close the tree
	lQuery('.emtree-widget ul li div .cat-arrow').livequery('click', function(event){
			event.stopPropagation();
			var tree = $(this).closest(".emtree");
			var node = $(this).closest('.noderow');
			var nodeid = node.data('nodeid');
			var depth = node.data('depth');
			tree.find('ul li div').removeClass('selected');
			
			var home = $(this).closest(".emtree").data("home");
			
			if ( $(this).find('.cat-arrow').hasClass('down') )
			{
				$(this).find('.cat-arrow').removeClass('down');				
			}
			else 
			{ 
				//Open it. add a UL
				$(this).find('.cat-arrow').addClass('down');				
			}
			
			tree.find(nodeid + "_add").remove();
			node.load(home + "/components/emtree/tree.html?toggle=true&tree-name=" + tree.data("treename") + "&nodeID=" + nodeid + "&depth=" + depth, 
				function()
				{
					$(window).trigger( "resize" ) 
				});
	});

	//Select a node
	lQuery('.emtree-widget ul li div .cat-name').livequery('click', function(event) 
	{
		event.stopPropagation();
		//console.log('selected');
		$('.emtree ul li div').removeClass('selected cat-current');
        var tree = $(this).closest(".emtree");
        var treename = tree.data("treename");
		var node = $(this).closest('.noderow');
		$("div:first",node).addClass('cat-current');
		var nodeid = node.data('nodeid');	
		
        var prefix = tree.data("url-prefix");
        var postfix = tree.data("url-postfix");
		var targetdiv = tree.data("targetdiv");
		var maxlevel = tree.data("maxlevelclick");
		if(maxlevel ==  undefined || maxlevel == "" )
		{
			maxlevel = 2;
		}
		
		if (treename != undefined && treename.startsWith("dialog"))  //Dialog Tree
		{
			var home = tree.data("home");
			tree.find(nodeid + "_add").remove();
			var depth = node.data('depth');	
			//really needed?
			//node.load(home + "/components/emtree/tree.html?toggle=true&tree-name=" + tree.data("treename") + "&nodeID=" + nodeid + "&depth=" + depth);
        }
        else {  //Regular Tree
            gotopage(tree, node, maxlevel, prefix, postfix, null);
        }
		var event = $.Event( "emtreeselect" );
		event.tree = tree;
		event.nodeid = nodeid;
		$(document).trigger(event);
	});
	
    gotopage = function(tree, node, maxlevel, prefix, inOptions)
	{
    	//postfix not used
    	
		var treeholder = $("div#categoriescontent");
		var toplocation =  parseInt( treeholder.scrollTop() );
		var leftlocation =  parseInt( treeholder.scrollLeft() );
		var nodeid = node.data('nodeid');
		var home = tree.data("home");
        var depth = node.data('depth');
        var collectionid = node.data("collectionid")
        var reloadurl = '';
		var appnavtab = $("#appnavtab").data("openmodule");
        if( prefix == undefined || prefix == "" )
		{
        	//debugger;
			// Always load Assets Layout if not prefix
			if( collectionid != undefined && collectionid != "")
            {
            	if( appnavtab == "asset")
            	{
	            	reloadurl = home + "/views/modules/asset/showcategory.html";
                }
                else
                {
                	reloadurl = home + "/views/modules/librarycollection/media/showcategory.html";                
                	//reloadurl = home + "/views/modules/asset/showcategory.html";
                }
                
                
            	prefix = home + "/views/modules/librarycollection/media/showcategory.html";
            	//prefix = home + "/views/modules/asset/showcategory.html";
                //maxlevel = 2;
            }
            else 
            {
                //Asset Module
                reloadurl = home + "/views/modules/asset/showcategory.html";
                prefix = home + "/views/modules/asset/showcategory.html";
            }
        }
        else {
        	var customprefix= tree.data('customurlprefix');
    		if(customprefix)
    		{
    			reloadurl = customprefix;
    		}
    		else {
    			reloadurl = prefix;
    		}
        }

		reloadurl = reloadurl + "?nodeID="+ nodeid;
		
		if( collectionid )
		{
			reloadurl = reloadurl + "&collectionid=" + collectionid; 
		}
		
		var hitssessionid = $('#resultsdiv').data('hitssessionid');
		if( hitssessionid )
		{
			reloadurl = reloadurl + "&hitssessionid=" + hitssessionid;
		}
		
		var options =  tree.data();
		
		options['tree-name'] = tree.data("treename");
		options['nodeID'] = nodeid;
		options['treetoplocation'] = toplocation;
		options['treeleftlocation'] = leftlocation;
		options['depth'] = depth;
		options['categoryid'] = nodeid;
		
		if(collectionid)
		{
			options.collectionid = collectionid;						
		}	
		var searchchildren = tree.data("searchchildren");
		if( appnavtab == "asset")  //for now
        {
			searchchildren = true;
        }
		options.searchchildren = searchchildren; 
		
		if(inOptions["clearotherentities"]) {
			options.clearotherentities = true;
			reloadurl = reloadurl + "&clearotherentities=true";
		}
				
		//jQuery.get(prefix + nodeid + postfix,
		jQuery.get(prefix, options,	
				function(data) 
				{
					var targetdivinner = tree.data("targetdivinner");
					if( targetdivinner)
					{
						var cell = jQuery("#" + targetdivinner); 
						cell.html(data);
					}
					else
					{
						var targetdiv = tree.data("targetdiv");
						if( targetdiv)
						{
							var cell = jQuery("#" + targetdiv); 
							cell.replaceWith(data);
						}
					}
					
					if (typeof global_updateurl !== "undefined" && global_updateurl == false) {
						//globaly disabled updateurl
					}
					else {
						//Update Address Bar
						if(tree.data("updateaddressbar")) {
							history.pushState($("#application").html(), null, reloadurl);
						}
					}
					
					$(window).trigger( "resize" );
				}
        );
        
	}
	
/*	
	$(".emtree-widget .delete").livequery('click', function(event) {
			event.stopPropagation();

			var id = $(this).data('parent');
			
			var agree=confirm("Are you sure you want to delete?");
			if (agree)
			{
				var tree = $(this).closest(".emtree");
				var home = tree.data("home");

				$.get(home + "/components/emtree/deletecategory.html", {
					categoryid: id,
					'tree-name': tree.data("treename"),
					} ,function () {
						tree.find("#" + id + "_row").hide( 'fast', function(){
							repaintEmTree(tree); 
						} );
						
					});
			} else {
				return false;
			}
	} );
*/			
	//need to init this with the tree
	lQuery("div#treeholder").livequery( function()
	{	
		var treeholder = $(this);
		var top = treeholder.data("treetoplocation");
		if( top )
		{
			var left = treeholder.data("treeleftlocation");
			var catcontent = $("div#categoriescontent");
			catcontent.scrollTop(parseInt(top));
			catcontent.scrollLeft(parseInt(left));
		}
	});

	lQuery('#treeholder input').livequery('click', function(event)
	{
		event.stopPropagation();
	});

	lQuery("#treeholder input").livequery('keyup', function(event) 
	{
       	var input = $(this);
       	var node = input.closest(".noderow");
       	var tree = input.closest(".emtree");
       	var value = input.val();
       	//console.log("childnode",node);
       	var nodeid = node.data('nodeid');
		if( event.keyCode == 13 ) 	{
	       	//13 represents Enter key
			var action = input.data("action");
			if (action != "create") {
				action = "rename";
			}
			var rootid = tree.data("treename")+"root";
			var link = tree.data("home") + "/components/emtree/savenode.html?action=" + action + "&tree-name=" + tree.data("treename") + "&"+rootid+"="+tree.data("rootnodeid")+"&depth=" + node.data('depth');
			
			var targetdiv = tree.closest("#treeholder");
			
			if(action == "rename" && nodeid != undefined)
			{
				link = link + "&nodeID=" + nodeid;
				link = link + "&adding=true";
				
				targetdiv = node;
			}
			else
			{
				node = node.parent(".noderow");
				nodeid = node.data("nodeid");
				//console.log("Dont want to save",node);
				if(nodeid != undefined)
				{
					link = link + "&parentNodeID=" + nodeid;
				}	
			}
			//tree.closest("#treeholder").load(link, {edittext: value}, function() {
			var options = tree.data();
			options["edittext"] = value;
			$.get(link, options,	function(data) {	
				targetdiv.replaceWith(data);
				//Reload tree in case it moved order
				//repaintEmTree(tree);
			});
	  	}
		else if( event.keyCode === 27 ) //esc 
	  	{
			input.closest(".createnodetree").hide();
	  		
	  	}
	});

	getNode = function(clickedon)
	{
		var clickedon = $(clickedon);
        var contextmenu = $(clickedon.closest(".treecontext"));
        var node = contextmenu.data("selectednoderow");
        if (!node) {
             var node = $(clickedon).closest(".noderow");   
        }
        contextmenu.hide();
		return node;
	}
	lQuery(".treecontext #nodeproperties").livequery('click', function(event) 
	{
				event.stopPropagation();
				var node = getNode(this);
				var tree = node.closest(".emtree");
				var nodeid = node.data('nodeid');
				var link = tree.data("home") + "/views/modules/category/edit/editdialog.html?categoryid=" + nodeid + "&id=" + nodeid + "&viewid=categorygeneral&viewpath=category/categorygeneral";
				$(this).attr('href',link);
				emdialog($(this), event);
				//document.location = link;
				return false;
	} );

	lQuery(".treedesktopdownload").livequery('click', function(event) 
	{
				event.stopPropagation();
				var node = getNode(this);
				var categoryid = node.data('nodeid');
				if (categoryid == null) {
					categoryid = $(this).data("categoryid");
				}
				listCategoryAssets($(this), event, categoryid);
				
	});	
	
	lQuery(".treecontext #addmedia, .cat-uploadfromtree").livequery('click', function(event) 
	{
				event.stopPropagation();
				var node = getNode(this);
				var nodeid = node.data('nodeid');
				var tree = node.closest(".emtree");
				var maxlevel = 2;
				
				//http://localhost:8080/assets/emshare/components/createmedia/upload/index.html?collectionid=AVgCmUw-cmJZ6_qmM-9u
				//var url = tree.data("home") + "/components/createmedia/upload/index.html?";
				
				var collectionid = node.data("collectionid");
				var postfix = "";
				
				//clear other entities on Upload Form
				var options = [];
				options["clearotherentities"] = "true"
				
				
				var customurladdmedia = tree.data("customurladdmedia");
				if (customurladdmedia) {
					var url = customurladdmedia;
                    var maxlevel = 1;
					gotopage(tree,node,maxlevel,url, options);
				}
				else {

					var url = tree.data("home") + "/views/modules/asset/add/start.html";
                    var maxlevel = 1;
					gotopage(tree,node,maxlevel,url, options);
					
				}
				$(".treerow").removeClass("cat-current");
				$("#"+nodeid+"_row > .treerow").addClass("cat-current");
				
						
				return false;
	} );

	lQuery(".treecontext #renamenode").livequery('click', function(event) {
				event.stopPropagation();
				var node = getNode(this);
				var tree = node.closest(".emtree");
				var nodeid = node.data('nodeid');
				var link = tree.data("home") + "/components/emtree/rename.html?tree-name=" + tree.data("treename") + "&nodeID=" + nodeid + "&depth=" +  node.data('depth'); 
				node.find("> .categorydroparea").load(link , function()
				{
					node.find("input").select().focus();
				});
				return false;
	} );
	lQuery(".treecontext #deletenode").livequery('click', function(event) {
		event.stopPropagation();
		var node = getNode(this);
		var tree = node.closest(".emtree");
		var nodeid = node.data('nodeid');
		var agree=confirm("Are you sure you want to delete?");
		if (agree)
		{
			//console.log("removing",node, nodeid);
			var link = tree.data("home") + "/components/emtree/delete.html?tree-name=" + tree.data("treename") + "&nodeID=" + nodeid + "&depth=" +  node.data('depth'); 
			var options = tree.data();
			$.get(link, options,	function(data) {	
				//tree.closest("#treeholder").replaceWith(data);
				//Reload tree in case it moved order
				repaintEmTree(tree);
			});
		}	
		return false;
	} );
	lQuery(".treecontext #createnode").livequery('click', function(event) { 
		event.stopPropagation();
		var node = getNode(this);
		var tree = node.closest(".emtree");
		var link = tree.data("home") + "/components/emtree/create.html?tree-name=" + tree.data("treename") + "&depth=" +  node.data('depth'); 
		$.get(link, function(data) {
		    node.append(data);
		    var theinput = node.find("input");
			theinput.focus({preventScroll:false});
			//theinput.select();
			theinput.focus();
			$(document).trigger("domchanged");
		});
		return false;
	} );

	lQuery(".treecontext #createcollection").livequery('click', function(event) 
	{
		event.stopPropagation();
		var node = getNode(this);
		var nodeid = node.data('nodeid');
		
		var tree = node.closest(".emtree");
		var link = tree.data("home") + "/views/modules/librarycollection/createcollection.html"
		
		var catoptions = node.data();
				
		link = link + "?oemaxlevel=3&searchtype=librarycollection&field=rootcategory&rootcategory.value="+catoptions.nodeid+"&field=name&name.value="+catoptions.categoryname;
	
		var targetdiv = "application";
		
		$.get(link,  function(data) {
			var cell = jQuery("#" + targetdiv); 
			cell.replaceWith(data);
			
		    //node.append(data);
		    var theinput = node.find("input");
			theinput.focus({preventScroll:false});
			//theinput.select();
			//theinput.focus();
			$(document).trigger("domchanged");
		});
		return false;
	} );

	
function getPosition(e) {
  var posx = 0;
  var posy = 0;

  if (!e) var e = window.event;

  if (e.clientX || e.clientY) {
   /* posx = e.clientX + document.body.scrollLeft + 
                       document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + 
                       document.documentElement.scrollTop;
                       */
	  posx = e.clientX;
	  posy = e.clientY;
  }
  else if (e.pageX || e.pageY) {
	    posx = e.pageX;
	    posy = e.pageY;
	  } 

  return {
    x: posx,
    y: posy
  }
}

  var contextmenu = function(item, e){
	  	var noderow = item;
	  //var noderow = $(this); // LI is the think that has context .find("> .noderow");
		$(".categorydroparea").removeClass('selected');
		noderow.find("> .categorydroparea").addClass('selected'); //Keep it highlighted
		var emtreediv = noderow.closest(".emtree");
		
		console.log(noderow);
		
		var treename = emtreediv.data("treename"); 
		var contextMenu = $( "#" + treename + "contextMenu");
		if( contextMenu.length > 0 )
		{
			e.preventDefault();
			
			var pos = getPosition(e);
			var xPos = pos.x;
			if( xPos < 150 )
			{
				xPos = xPos + 150;
			}
			var yPos = pos.y - 10;
			
			contextMenu.data("selectednoderow",noderow);
			var iscollection = noderow.data("collectionid");
			$("#" + treename + "contextMenu #createcollection").show();
			if(iscollection != null && iscollection != "") {
				$("#" + treename + "contextMenu #createcollection").hide();
			}
			
			contextMenu.css({
			  display: "block",
			      left: xPos,
			      top: yPos
			    });
			e.stopPropagation();
			return false;
		}	
  }
	
	
  $("body").on("contextmenu", ".noderow", function(e) {
	  contextmenu($(this), e);
  });
  lQuery('.cat-menu').livequery('click', function(e) {
	  contextmenu($(this).closest(".noderow"), e);
  });
		  
  lQuery('body').livequery('click', function () {
     	var $contextMenu = $(".treecontext");
     	$contextMenu.hide();
     	$(".categorydroparea").removeClass('selected');     	
    });
  
  $(document).keydown(function(e) {
	    switch(e.which) {
	        case 27: // esc
	        	var $contextMenu = $(".treecontext");
	         	$contextMenu.hide();
	         	$(".categorydroparea").removeClass('selected');
	        break;
	        default: return; // exit this handler for other keys
	    }
	    e.preventDefault();
  });

	//end document ready
	
});

repaintEmTree = function (tree) {
	var home = tree.data("home");
	
//	<div id="${treename}tree" class="emtree emtree-widget" data-home="$siteroot$apphome" data-treename="$treename" data-rootnodeid="$rootcategory.getId()"
//		data-editable="$editable" data-url-prefix="$!prefix" data-url-postfix="$!postfix" data-targetdiv="$!targetdiv"
//		>
/*	var options = { 
			"tree-name": tree.data("treename"),
			"url-prefix":tree.data("url-prefix"),
			"url-postfix":tree.data("url-postfix"),
			"targetdiv":tree.data("targetdiv"),
			"maxlevelclick":tree.data("maxlevelclick")
		};
*/

	var link = home +  "/components/emtree/tree.html";
	var options = tree.data();
	options["tree-name"] = tree.data("treename"); //why?
	$.get(link, options, function(data) {
		console.log("tree repainted");
		tree.closest("#treeholder").replaceWith(data);
		$(document).trigger("domchanged");
	});
}
