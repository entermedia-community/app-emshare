//Finder
var uploadid = new Date().getTime();
var home = null;
var currentupload = 0;
var haderror = false;
var uploadid;

var allfiles = new Array();

// wait for the DOM to be loaded
$(document).ready(function () {
  if (apphome === undefined) {
    if (!siteroot) {
      siteroot = $("#application").data("siteroot");
    }
    apphome = siteroot + $("#application").data("apphome");
  }

  lQuery("#createmediapanel").livequery(function (e) {
    //reset array
    allfiles = new Array();
  });

  lQuery("#dialogmediaentity").livequery(function (e) {
    //reset array
    allfiles = new Array();
  });

  lQuery(".upload_field").livequery(function () {
    var inputfield = $(this);
    inputfield.val("");
    inputfield.initUpload();
  });

  lQuery(".upload_folder").livequery(function () {
    var inputfield = $(this);
    inputfield.val("");
    inputfield.initUpload();
  });

  jQuery(".upload_field").val("");

  var uplist = $(".up-files-list");

  $.each(uplist, function () {
    $(this).empty();
  });

  lQuery(".removefile").livequery("click", function (e) {
    e.preventDefault();
    var row = $(this).closest(".uploadprogressrow");
    var fileindex = $(row).data("fileindex");
    var uploadformarea = $(this).closest(".uploadformarea");
    // var upload_field = uploadformarea.find(".upload_field");
    allfiles.splice(fileindex, 1);
    filesPicked(null, null, uploadformarea);
    console.log(allfiles);
    $(row).remove();
  });

  lQuery(".clear-upload-list").livequery("click", function (e) {
    var uploadformarea = $(this).closest(".uploadformarea");
    allfiles = new Array();
    filesPicked(null, null, uploadformarea);
  });

  lQuery(".filePicker").livequery("click", function (e) {
    e.preventDefault();
    var form = $(this).closest(".uploadformarea");
    $(form).find(".upload_field").trigger("click");
  });

  lQuery(".folderPicker").livequery("click", function (e) {
    e.preventDefault();
    var form = $(this).closest(".uploadformarea");
    $(form).find(".upload_folder").trigger("click");
  });

  //Global Upload
  lQuery(".globalfilePicker").livequery("click", function (e) {
    e.preventDefault();
    var uploadarea = $(".globaluploadarea");
    if (uploadarea) {
      var categoryid = $(this).data("categoryid");
      if (categoryid) {
        $(uploadarea).find("#nodeid").val(categoryid);
      }
      var createentity = $(this).data("createentity");
      if (createentity) {
        $(uploadarea).find("#createentity").val(createentity);
      }
      var moduleid = $(this).data("moduleid");
      if (moduleid) {
        $(uploadarea).find("#entitytype").val(moduleid);
      }
      var uploadsourcepath = $(this).data("uploadsourcepath");
      if (uploadsourcepath) {
        $(uploadarea).find("#uploadsourcepath").val(uploadsourcepath);
      }
      $(uploadarea).find(".upload_field").trigger("click");
    }
  });

  lQuery(".globalfolderPicker").livequery("click", function (e) {
    e.preventDefault();
    var uploadarea = $(".globaluploadarea");
    if (uploadarea) {
      var categoryid = $(this).data("categoryid");
      if (categoryid) {
        $(uploadarea).find("#nodeid").val(categoryid);
      }
      $(uploadarea).find(".upload_folder").trigger("click");
    }
  });

  lQuery(".startbutton").livequery("click", function (e) {
    e.preventDefault();
    var uploadformarea = $(this).closest(".uploadformarea");
    if ($(this).prop("disabled")) {
      return;
    }
    var valid = $("#uploaddata").validate().form();
    if (!valid) {
      return;
    }

    $(this).text("Uploading");

    $(this).attr("disabled", "disabled");
    //$(this).prop('disabled', true);
    $(".viewassetsbtn").attr("disabled", "disabled");
    $(uploadformarea)
      .find(".upload_field")
      .triggerHandler("html5_upload.start");
  });

  lQuery(".drop-over").livequery(function () {
    var div = $(this);

    div.on("dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
      div.addClass("uploaddragenter");
    });
    div.on("dragenter", function (e) {
      e.preventDefault();
      e.stopPropagation();
      div.addClass("uploaddragenter");
    });
    div.on("dragleave", function (e) {
      div.removeClass("uploaddragenter");
    });
    div.on("drop", function (e) {
      if (e.originalEvent.dataTransfer) {
        if (e.originalEvent.dataTransfer.files.length) {
          e.preventDefault();
          e.stopPropagation();
          var categoryid = $(this).data("categoryid");
          if (categoryid) {
            var uploadformarea = $(".globaluploadarea");
            if (uploadformarea) {
              $(uploadformarea).find("#nodeid").val(categoryid);
            }
          }
          var uploadformarea = $(div).closest(".uploadformarea");
          $(".upload_field", uploadformarea).triggerHandler(
            "html5_upload.filesPicked",
            [e.originalEvent.dataTransfer.files]
          );
        }
      }
      div.removeClass("uploaddragenter");
    });
  });

  lQuery(".viewassetsbtn").livequery("click", function (e) {
    e.preventDefault();

    var btn = jQuery(this);
    var options = btn.data();
    var href = null;
    var collectionid = jQuery("#currentcollection").val();
    var nodeid = $("#nodeid").val();

    if (btn.data("entityupload")) {
      var tab_media = $("#tab_tab_media");
      var selector = tab_media.data("tabid");
      var container = $(selector);
      if(container.length > 0) {
	      container.data("sortby", "assetaddeddateDown");
	      tab_media.trigger("click");
	      return;
      }
    }
    
    var dialogassets = btn.closest("#dialogassetresultscontainer");
    if (dialogassets.length > 0)
    {
		autoreload(dialogassets);
		return;
	}

    if (href == null && collectionid) {
      href =
        apphome +
        "/views/modules/librarycollection/media/showcategory.html?collectionid=" +
        collectionid +
        "&clearfilters=true&sortby=assetaddeddateDown";
      if (nodeid) {
        href =
          apphome +
          "/views/modules/asset/viewfiles/" +
          nodeid +
          "/index.html?sortby=assetaddeddateDown";
      } else {
        var currentcollectionrootcategory = jQuery(
          "#currentcollectionrootcategory"
        ).val();
        if (currentcollectionrootcategory) {
          href = href + "&nodeID=" + currentcollectionrootcategory;
        }
      }
      options.oemaxlevel = btn.data("oemaxlevel");
    } else if (href == null && nodeid) {
      href =
        apphome +
        "/views/modules/asset/viewfiles/" +
        nodeid +
        "/index.html?sortby=assetaddeddateDown";
      options.oemaxlevel = btn.data("oemaxlevel");
    } else if (href == null) {
      href =
        apphome + "/views/modules/asset/index.html?sortby=assetaddeddateDown";
      options.oemaxlevel = 2;
    }
    //console.log(href);
    //document.location.href = href;
    var targetdiv = btn.data("targetdivinner");

    jQuery.ajax({
      url: href,
      async: false,
      data: options,
      success: function (data) {
        jQuery("#" + targetdiv).html(data);
        if (
          typeof global_updateurl !== "undefined" &&
          global_updateurl == false
        ) {
          //globaly disabled updateurl
        } else {
          //Update Address Bar
          history.pushState({}, null, href);
          window.scrollTo(0, 0);
        }
        jQuery(window).trigger("resize");
      },
    });
  });

  //Detect Youtube Link
  $("#uploaddescription").on("keyup", function () {
    var input = $("#uploaddescription");
    var inputtext = input.val();
    var targetdiv = input.data("targetdiv");
    var targeturl = apphome + "/collective/channel/addnewlink.html";
    delay(function () {
      var p =
        /(https:\/\/www\.(yotu\.be\/|youtube\.com)\/)(?:(?:.+\/)?(?:watch(?:\?v=|.+&v=))?(?:v=)?)([\w_-]{11})(&\.+)?/;
      if (inputtext.match(p)) {
        var videoURL = inputtext.match(p)[0];
        var videoID = inputtext.match(p)[3];
        var removelink = inputtext.replace(p, "");
        input.val(removelink);

        $("#" + targetdiv).load(targeturl + "?videoID=" + videoID);
      } else {
      }
    }, 500);
  });

  lQuery(".hideuploadarea").livequery("click", function (e) {
    e.preventDefault();
    $(".globaluploadarea").toggle();
  });
});

var delay = (function () {
  var timer = 0;
  return function (callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

function bytesToSize(bytes, precision) {
  var kilobyte = 1024;
  var megabyte = kilobyte * 1024;
  var gigabyte = megabyte * 1024;
  var terabyte = gigabyte * 1024;

  if (bytes >= 0 && bytes < kilobyte) {
    return bytes + " B";
  } else if (bytes >= kilobyte && bytes < megabyte) {
    return (bytes / kilobyte).toFixed(precision) + " KB";
  } else if (bytes >= megabyte && bytes < gigabyte) {
    return (bytes / megabyte).toFixed(precision) + " MB";
  } else if (bytes >= gigabyte && bytes < terabyte) {
    return (bytes / gigabyte).toFixed(precision) + " GB";
  } else if (bytes >= terabyte) {
    return (bytes / terabyte).toFixed(precision) + " TB";
  } else {
    return bytes + " B";
  }
}

$.fn.initUpload = function () {
  var inputfield = $(this);
  var uploadformarea = inputfield.closest(".uploadformarea");
  var autostart = false;
  inputfield.html5_upload({
    filesPicked: filesPicked,
    url: function (number) {
      var data = uploadformarea.find("#uploaddata");
      var url = data.attr("action");
      var str = data.serialize();
      return url + "?" + str;
      // return prompt(number + " url", "/");
    },
    autostart: autostart,
    //			         extraFields: function() {
    //			        	 return [];
    //			         },
    sendBoundary: window.FormData || $.browser.mozilla,
    headers: {
      "Access-Control-Allow-Credentials": "true",
    },
    onStart: function (event, total, files) {
      //$(".uploadinstructions").hide();
      //console.log("On start " + files.length );
      var completed = uploadformarea.find(".up-files-list-pending li").clone();
      uploadformarea.find(".up-files-list-pending").empty();

      uploadformarea.find("#up-files-list-completed").prepend(completed);
      uploadformarea.find("#completed-uploads").show();

      uploadformarea.find("#upload-start").hide();
      uploadformarea.find("#upload-completed").show();

      uploadformarea.show();

      var entityuploadPicker = uploadformarea.find(".entityuploadPicker");
      if (entityuploadPicker) {
        entityuploadPicker.hide();
        entityuploadPicker.parent().find(".hideonupload").hide();
        entityuploadPicker.next(".loadericon").css("display", "inline-block");
      }

      return true;
      //Loop over all the files. add rows
      //alert("start");
    },
    onStartOne: function (event, name, number, total) {
      //Set the currrent upload number?
      currentupload = number;
      return true;
    },
    onProgress: function (event, progress, name, number, total) {
      // console.log(progress, number);
    },
    //         genName: function(file, number, total) {
    //             return file;
    //         },
    //         setName: function(text) {
    //             $("#progress_report_name" + currentupload).text(text);
    //         },
    setStatus: function (text) {
      if (text == "Progress") {
        text = "Uploading";
      }
      uploadformarea.find(".progress_report_status" + currentupload).text(text);
    },
    setProgress: function (val) {
      uploadformarea
        .find(".progress_report_bar" + currentupload)
        .css("width", Math.ceil(val * 100) + "%");
    },
    onFinishOne: function (event, response, name, number, total) {
      uploadformarea
        .find(".progress_report_bar" + currentupload)
        .css("width", "100%");
    },
    onError: function (event, name, error) {
      alert("error while uploading file " + name);
      haderror = true;
    },
    onFinish: function (event, total) {
      $("body").append(
        '<div class="alert alert-success fader alert-save">Uploaded ' +
          total +
          " file" +
          (total > 1 ? "s" : "") +
          " successfully!</div>"
      );
      //do a search
      if (!haderror) {
        var startb = uploadformarea.find(".startbutton");
        var complete = startb.data("complete");

        $(startb).text(complete);
        $(startb).prop("disabled", "disabled");
        allfiles = new Array();

        var completed = uploadformarea.find(".up-files-list-completed li span");
        $.each(completed, function () {
          $(this).removeAttr("id");
        });

        uploadformarea.find(".filePicker").text("Pick More Files...");
        uploadformarea.find(".upload_field").removeAttr("disabled");

        var viewassets = uploadformarea.find(".viewassetsbtn");
        viewassets.removeAttr("disabled");

        if (viewassets.hasClass("autoclick")) {
          viewassets.trigger("click");
        }

        var form = $(startb.closest("form"));

        if (form.hasClass("autofinishaction")) {
          var finishaction = form.data("finishaction");
          form.attr("action", finishaction);
          //TODO remove the last file?
          //form.submit();

          var targetdiv = form.data("finishtargetdiv");
          form.ajaxSubmit({
            type: "get",
            target: "#" + $.escapeSelector(targetdiv),
          });
        }
        /*
		    				   //new ajaxautoreload
								var classes = uploadformarea.data("ajaxreloadtargets"); //assetresults, projectpage, sidebaralbums
								if(classes) 
								{
									var splitnames = classes.split(",");
									$.each(splitnames,function(index,classname)
									{
										$("." + classname).each(function(index,div)
										{
											if(!$(div).is(':hidden')) {
									  	 		autoreload($(div));
									  	 	}
										});
									});
								}*/

        /*
		    				   if(uploadformarea.data("onupload")=="reloadentity") {
		    					   var entityid=uploadformarea.data("entityid");
		    					   if(entityid) {
		    						   //Todo create a generic method
		    						   setTimeout(()=> {
		    							   $('a[data-entityid="'+entityid+'"].entity-tab-label').trigger("click");
		    						      }
		    						      ,2000);
		    						   
		    					   }
		    				   }
		    				   else if(uploadformarea.data("onupload")=="reloadcontainer") {
								   var container_ = uploadformarea.data("container");
								   var container = uploadformarea.closest("."+container_);
								   if(container.length >0) { 
		    					   var entityid=uploadformarea.data("entityid");
			    					   
		    					   }
		    				   }*/
        //$("#uploadsfinishedtrigger").trigger("submit");
        //$(".media_results_tab").data("tabloaded",false);
      }
    },
  });
};

function filesPicked(_, files, uploadformarea = null) {
  //merge them together
  if (!uploadformarea) {
    uploadformarea = $(this).closest(".uploadformarea");
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file.size > 0) {
        allfiles.push(file);
      }
    }
  }

  if (allfiles.length === 0) {
    uploadformarea.find(".clear-upload-list").hide();
    uploadformarea.find(".dropicon").show();
  } else {
    uploadformarea.find(".clear-upload-list").show();
    uploadformarea.find(".dropicon").hide();
  }

  files = allfiles;
  var inputbox = uploadformarea.find(".upload_field")[0];

  var upload_field = uploadformarea.find(".upload_field");
  upload_field.triggerHandler("html5_upload.setFiles", [allfiles]);

  //inputbox.count = allfiles.length;

  //$("#upload_field").setFiles( allfiles );

  //inline
  var uploadformareainline = $(this).closest(".uploadformareainline");
  uploadformareainline.find("#drop-area").hide();
  uploadformareainline.find("#completed-uploads").show();

  //Upload page
  uploadformarea.find(".uploadinstructionsafter").hide();
  var startb = uploadformarea.find(".startbutton");
  //$(startb).text("Upload");
  $(startb).prop("disabled", false);
  uploadformarea.find(".uploadinstructionsafter").show();
  uploadformarea.find(".showonselect").show();

  var regex = new RegExp("currentupload", "g");

  var uplist = uploadformarea.find(".up-files-list");

  $.each(uplist, function () {
    $(this).empty();
  });

  //return confirm("You are trying to upload " + total + " files. Are you sure?");
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (file.size > 0) {
      if (i < 101) {
        var html = uploadformarea.find(".progress_report_template").html();

        html = html.replace(regex, i);
        uploadformarea.find(".up-files-list-pending").append(html);

        //TODO: set the name and size of each row
        var name = file.name;
        if (file.webkitRelativePath) {
          name = file.webkitRelativePath;
        }

        uploadformarea.find(".progress_report_name" + i).text(name);
        var size = bytesToSize(file.size, 2);
        uploadformarea.find(".progress_report_size" + i).text(size);
      }
    }
  }
  //console.log("Picked " + files.length );
  if (upload_field.data("autostartupload") == true) {
    upload_field.triggerHandler("html5_upload.start");
  }
}
