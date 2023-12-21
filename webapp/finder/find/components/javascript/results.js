jQuery(document).ready(function (url, params) {
  var appdiv = $("#application");
  var siteroot = appdiv.data("siteroot") + appdiv.data("apphome");
  var componenthome = appdiv.data("siteroot") + appdiv.data("componenthome");

  var refreshdiv = function (targetdiv, url, params) {
    jQuery.ajax({
      url: url,
      async: false,
      data: params,
      success: function (data) {
        targetdiv.replaceWith(data);
      },
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
    });
  };

  $(".emlogo").click(function (e) {
    e.preventDefault();
    var href = $(this).attr("href");
    var url = window.location.href;
    if (href === url) {
      if (window.screenY > 0) {
        window.focus();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
      $("#emselectable").animate({ scrollTop: 0 }, 500);
    } else {
      window.location.href = href;
    }
  });

  lQuery(".formatDate").livequery(function () {
    var _this = $(this);
    _this.each(function () {
      var datetype = _this.data("datetype");
      var fDate = [];
      var dates = [];
      if (datetype === "betweendates") {
        dates = _this.text().split("-");
      } else {
        dates.push(_this.text());
      }
      dates.forEach(function (date) {
        var d = new Date(date).toDateString();
        if (d == "Invalid Date") {
          return;
        }
        var date = d.substring(4, 15);
        fDate.push(date);
      });
      _this.html(fDate.join(" &mdash; "));
    });
  });

  $(document).on("click", ".datepicker", function () {
    $(this).next().trigger("click");
  });

  lQuery("select#selectresultview").livequery(function () {
    var select = $(this);
    var resultsdiv = select.closest(".resultsdiv");
    if (!resultsdiv) {
      resultsdiv = select.closest("#resultsdiv");
    }

    select.on("change", function () {
      var options = resultsdiv.data();

      var componenthome = resultsdiv.data("componenthome");
      var moduleid = resultsdiv.data("moduleid");
      var originalhitsperpage = resultsdiv.data("hitsperpage");
      var targetdiv = resultsdiv.data("targetdiv");

      var oemaxlevel = select.data("oemaxlevel"); //could be custom

      if (oemaxlevel) {
        options.oemaxlevel = oemaxlevel;
      }

      if (moduleid == "asset") {
        if (originalhitsperpage) {
          href =
            componenthome +
            "/results/changeresultview.html?cache=false&hitsperpage=" +
            originalhitsperpage;
        } else {
          href = componenthome + "/results/changeresultview.html";
        }
      } else {
        href =
          siteroot +
          "/views/modules/" +
          moduleid +
          "/components/results/changeresultview.html";
      }

      options.resultviewtype = moduleid + "resultview";

      var resultviewselected = select.val();
      options.resultview = resultviewselected;
      if (resultviewselected == "stackedgallery") {
        options.page = "1";
        options.hitsperpage = 20;
      }

      $.get(href, options, function (data) {
        $("#" + targetdiv).replaceWith(data);
        $(window).trigger("resize");
      });
    });
  });

  lQuery(".hitsperpagechange").livequery(function () {
    var select = $(this);

    var resultsdiv = select.closest(".resultsdiv");
    if (!resultsdiv) {
      resultsdiv = select.closest("#resultsdiv");
    }

    var dropdownParent = select.data("dropdownparent");
    if (dropdownParent && $("#" + dropdownParent).length) {
      dropdownParent = $("#" + dropdownParent);
    } else {
      dropdownParent = $(this).parent();
    }
    var parent = select.parents(".modal-content");
    if (parent.length) {
      dropdownParent = parent;
    }

    select.select2({
      tags: true,
      dropdownParent: dropdownParent,
    });

    select.on("change", function () {
      var options = resultsdiv.data();

      var componenthome = resultsdiv.data("componenthome");
      var moduleid = resultsdiv.data("moduleid");
      var resultview = resultsdiv.data("resultview");
      var originalhitsperpage = resultsdiv.data("hitsperpage");
      var targetdiv = resultsdiv.data("targetdiv");

      var oemaxlevel = select.data("oemaxlevel"); //could be custom
      if (oemaxlevel) {
        options.oemaxlevel = oemaxlevel;
      }

      var href = "";
      if (moduleid == "asset") {
        if (originalhitsperpage) {
          href =
            componenthome +
            "/results/changehitsperpage.html?cache=false&hitsperpage=" +
            originalhitsperpage;
        } else {
          href = componenthome + "/results/changehitsperpage.html";
        }
      } else {
        href =
          siteroot +
          "/views/modules/" +
          moduleid +
          "/components/results/changehitsperpage.html";
      }

      // the selected option
      options.hitsperpage = select.val();

      $.get(href, options, function (data) {
        $("#" + targetdiv).replaceWith(data);
        $(window).trigger("resize");

        // should I call in a trigger?
        $(".select2simple").select2({
          minimumResultsForSearch: Infinity,
        });
      });
    });
  });

  lQuery("input#jumptopageresults").livequery(function () {
    var input = $(this);

    input.on("change", function () {
      var url = input.data("url");
      var targetdiv = input.data("targetdiv");
      var oemaxlevel = input.data("oemaxlevel");
      var page = input.val();

      var args = {
        hitssessionid: input.data("hitssessionid"),
        oemaxlevel: oemaxlevel,
      };
      url = url + page;
      $.get(url, args, function (data) {
        $("#" + targetdiv).html(data);
        history.pushState($("#application").html(), null, url);
        $(window).trigger("resize");
      });
    });
  });

  lQuery(".selectresultviewXX").livequery(function () {
    var select = $(this);
    select.on("click", function (e) {
      e.preventDefault();
      var href = select.attr("href");

      var args = {
        hitssessionid: select.data("hitssessionid"),
        searchtype: select.data("searchtype"),
        page: select.data("page"),
        showremoveselections: select.data("showremoveselections"),
      };

      var category = $("#resultsdiv").data("category");
      if (category) {
        args.category = category;
      }
      var collectionid = $("#resultsdiv").data("collectionid");
      if (collectionid) {
        args.collectionid = collectionid;
      }

      $.get(href, args, function (data) {
        $("#emresultscontent").replaceWith(data);
        $(window).trigger("resize");
      });
    });
  });

  lQuery(".filterschangesort").livequery("click", function (e) {
    // debugger;
    e.preventDefault();
    var sirtbyfield = $(this).data("sortbyfield");
    var dropdown = $("#" + sirtbyfield);
    var up = dropdown.data("sortup");
    var selected = dropdown.find(":selected");
    var id = selected.data("detailid");
    var icon = $(this).find("i");
    if (up) {
      selected.attr("value", id + "Down");
      icon.removeClass("fa-sort-alpha-down");
      icon.addClass("fa-sort-alpha-up");

      dropdown.data("sortup", false);
    } else {
      selected.attr("value", id + "Up");
      icon.removeClass("fa-sort-alpha-up");
      icon.addClass("fa-sort-alpha-down");

      dropdown.data("sortup", true);
    }

    selected.closest("form").submit();
    return false;
  });

  //clearfiltersearch

  lQuery(".clearfiltersearch").livequery("click", function (e) {
    // debugger;
    var box = $(this).parent().find(".inlinefiltersearch");
    if (box.length) {
      box.val("");
    }
    $(this).hide();
  });

  lQuery(".inlinefiltersearch").livequery("keydown", function (e) {
    if (e.which == 13) {
      $(".clearfiltersearch").show();
    }
  });

  lQuery("a.selectpage").livequery("click", function () {
    var resultsdiv = $(this).closest(".resultsdiv");
    if (!resultsdiv) {
      resultsdiv = $("#resultsdiv");
    }
    jQuery("input[name=pagetoggle]", resultsdiv).prop("checked", true);
    jQuery(".selectionbox", resultsdiv).prop("checked", true);
    $(".selectionbox", resultsdiv)
      .closest(".resultsassetcontainer")
      .addClass("emrowselected");
    $(".selectionbox", resultsdiv)
      .closest(".emboxthumb")
      .addClass("emrowselected");
    if (typeof refreshSelections != "undefined") {
      refreshSelections();
    }

    // $("#select-dropdown-open").click();
  });

  lQuery(".gallery-checkbox input").livequery("click", function () {
    if ($(this).is(":checked")) {
      $(this).closest(".emthumbbox").addClass("selected");
    } else {
      $(this).closest(".emthumbbox").removeClass("selected");
    }
  });

  lQuery(".moduleselectionbox").livequery("click", function (e) {
    e.stopPropagation();

    var dataid = $(this).data("dataid");
    var sessionid = $(this).data("hitssessionid");

    $.get(componenthome + "/moduleresults/selections/toggle.html", {
      dataid: dataid,
      hitssessionid: sessionid,
    });

    return;
  });

  autosubmitformtriggers = function (form) {
    if ($(form).hasClass("autosubmitform")) {
      $("select", form).on("select2:select", function () {
        if (!$(this).hasClass("cancelautosubmit")) {
          form.trigger("submit");
        }
      });
      $("select", form).on("select2:unselect", function () {
        if (!$(this).hasClass("cancelautosubmit")) {
          $("#filtersremoveterm", form).val($(this).data("searchfield"));
          form.trigger("submit");
        }
      });
      $("input[type=checkbox]", form).change(function () {
        if ($(this).hasClass("filtercheck")) {
          var fieldname = $(this).data("fieldname");
          var fieldtype = $(this).data("fieldtype");
          if (fieldtype == "boolean") {
            if ($("#filtersremoveterm", form).length) {
              $("#filtersremoveterm", form).val(fieldname);
            }
          }
          var boxes = $(".filtercheck" + fieldname + ":checkbox:checked", form);
          if (boxes.length == 0) {
            if ($("#filtersremoveterm", form).length) {
              $("#filtersremoveterm", form).val(fieldname);
            }
          }
        }
        form.trigger("submit");
      });
      $("input[type=radio]", form).change(function () {
        form.trigger("submit");
      });

      $("input[type=text]", form)
        .not(".datepicker")
        .change(function () {
          form.trigger("submit");
        });
    }
  };

  lQuery(".autosubmitform").livequery(function () {
    autosubmitformtriggers($(this));
  });

  $(".autosubmitform").on("submit", function () {
    var form = $(this);
    // Remove required from Filters Form
    if (form.hasClass("filterform")) {
      $(".required", form).each(function () {
        $(this).removeClass("required");
      });
    }
    if (form.valid()) {
      return true;
    }
    return false;
  });

  overlayResize = function () {
    var img = $("#hiddenoverlay #main-media");
    var avwidth = $(window).width();
    var wheight = $(window).height();
    var overlay = $("#hiddenoverlay");
    overlay.height(wheight);
    overlay.width(avwidth);
    var w = parseInt(img.data("width"));
    var h = parseInt(img.data("height"));

    $("#hiddenoverlay .playerarea").width(avwidth);

    var avheight = $(window).height() - 40;
    if (!isNaN(w) && w != "") {
      w = parseInt(w);

      var newh = Math.floor((avwidth * h) / w);
      var neww = Math.max(avwidth, Math.floor((avwidth * w) / h));
      img.width(avwidth);
      img.css("height", "auto");
      // Only if limited by height

      if (newh > avheight) {
        img.height(avheight);
        img.css("margin-top", "0px");
        // var neww2 = Math.floor( avheight * w / h );
        // img.width(neww2);
        img.css("width", "auto");
        img.css("height", avheight);
      } else {
        var remaining = avheight - newh;

        if (remaining > 0) {
          remaining = remaining / 2;
          img.css("margin-top", remaining + "px");
        } else {
          img.css("margin-top", "0px");
        }
      }
      // img.css("height", avheight);
    } else {
      /*
       * img.width(avwidth); //img.css("height", "auto");
       * img.css("height", avheight); img.css("margin-top","0px");
       */
    }
  };
  $(window).resize(function () {
    overlayResize(); // TODO: Add this to the shared
  });

  $.fn.exists = function () {
    return this.length !== 0;
  };

  getCurrentAssetId = function () {
    var mainmedia = $("#main-media-viewer");
    return mainmedia.data("assetid");
  };

  function enable(inData, inSpan) {
    if (inData == "") {
      $(inSpan).addClass("arrowdisabled");
      $(inSpan).data("enabled", "false");
      $(inSpan).attr("data-enabled", "false");
    } else {
      $(inSpan).addClass("arrowenabled");
      $(inSpan).data("enabled", "true");
      $(inSpan).attr("data-enabled", "true");
    }
  }
  disposevideos = function () {
    // Stop/Dispose Videos
    $(".video-js, .video-player").each(function () {
      if (this.id) {
        videojs(this.id).dispose();
      }
    });
  };
  hideOverlayDiv = function (inOverlay) {
    // debugger;
    disposevideos();
    stopautoscroll = false;
    $("body").css({ overflow: "auto" });
    inOverlay.hide();
    inOverlay.removeClass("show");
    if ($(".modal.behind").length) {
      adjustzindex($(".modal.behind"));
    }

    var reloadonclose = $("#resultsdiv").data("reloadresults");
    if (reloadonclose == undefined) {
      reloadonclose = false;
    }
    if (reloadonclose) {
      refreshresults();
    } else {
      //$(document).trigger("domchanged");
      //$(window).trigger( "resize" );
      // gridResize();
    }
    var lastscroll = getOverlay().data("lastscroll");
    // remove Asset #hash
    history.replaceState(null, null, " ");
    $(window).scrollTop(lastscroll);
  };

  showOverlayDiv = function (inOverlay) {
    stopautoscroll = true;
    $("body").css({ overflow: "hidden" });
    inOverlay.show();

    adjustzindex(inOverlay);

    inOverlay.addClass("show");
    var lastscroll = $(window).scrollTop();
    getOverlay().data("lastscroll", lastscroll);
  };

  showAsset = function (assetid, pagenum) {
    if (assetid) {
      var mainmedia = $("#main-media-viewer");
      var resultsdiv = $("#resultsdiv");
      if (!pagenum) {
        pagenum = mainmedia.data("pagenum");
        if (!pagenum) {
          pagenum = resultsdiv.data("pagenum");
        }
      }
      var hidden = getOverlay();

      // Not needed?
      var link = resultsdiv.data("assettemplate");
      if (link == null) {
        link = componenthome + "/mediaviewer/fullscreen/currentasset.html";
      }
      var hitssessionid = resultsdiv.data("hitssessionid");
      var params = {
        embed: true,
        assetid: assetid,
        hitssessionid: hitssessionid,
        oemaxlevel: 1,
      };
      if (pagenum != null) {
        params.pagenum = pagenum; // Do we use this for anything?
      }
      params.pageheight = $(window).height() - 100;

      var collectionid = $("#collectiontoplevel").data("collectionid");
      if (!collectionid) {
        collectionid = resultsdiv.data("collectionid");
        if (collectionid) {
          params.collectionid = collectionid;
        }
      }
      if (resultsdiv.data("previewonly") == true) {
        params.previewonly = "true";
      }

      window.location.hash = "asset-" + assetid;

      disposevideos();

      $.get(link, params, function (data) {
        showOverlayDiv(hidden);

        var container = $("#main-media-container");
        container.replaceWith(data);

        var div = $("#main-media-viewer");
        var id = div.data("previous");
        if (typeof id != "undefined" && id != "") {
          enable(id, ".goleftclick");
          enable(id, "#leftpage");
          var title = div.data("previousname");
          if (title) {
            $(".goleftclick").attr("title", title);
          } else {
            $(".goleftclick").attr("title", "<");
          }
        }
        id = div.data("next");
        if (typeof id != "undefined" && id != "") {
          enable(id, ".gorightclick");
          enable(id, "#rightpage");
          var title = div.data("nextname");
          if (title) {
            $(".gorightclick").attr("title", title);
          } else {
            $(".gorightclick").attr("title", ">");
          }
        }
        $(document).trigger("domchanged");
        $(window).trigger("resize");
        $(".gallery-thumb").removeClass("active-asset");

        if (assetid.indexOf("multiedit:") > -1) {
          /*
           * var link = $("#main-media-viewer").data("multieeditlink");
           * var mainmedia2 = $("#main-media-viewer");
           *
           * var options = mainmedia2.data(); mainmedia2.load(link,
           * options, function() { $(window).trigger("tabready"); });
           */
        } else {
          var escape = assetid.replace(/\//g, "\\/");
          $("#gallery-" + escape).addClass("active-asset");
        }
      });
      $(document).trigger("domchanged");
    }
  };
  initKeyBindings = function (hidden) {
    $(document).keydown(function (e) {
      if (hidden && !hidden.is(":visible")) {
        return;
      }
      var target = e.target;
      if ($(target).is("input") || $(target).is(".form-control")) {
        return;
      }
      switch (e.which) {
        case 37: // left
          var div = $("#main-media-viewer");
          var id = div.data("previous");
          if (id) {
            showAsset(id);
          }
          break;

        case 39: // right
          var div = $("#main-media-viewer");
          var id = div.data("next");
          if (id) {
            showAsset(id);
          }
          break;

        // TODO: background window.scrollTo the .masonry-grid-cell we
        // view, so we can reload hits

        case 27000: // esc  MOVED TO UI-COMPONENTS
          var ismodal = $("#modals, #inlineedit, .modal");
          if (ismodal.hasClass("show")) {
            // Close modal only
            closeemdialog(ismodal);
            e.stopPropagation();
            return;
          } else {
            hideOverlayDiv(getOverlay());
          }
          break;

        default:
          return; // exit this handler for other keys
      }
      e.preventDefault(); // prevent the default action (scroll / move
      // caret)
    });
  };

  getOverlay = function () {
    var hidden = $("#hiddenoverlay");
    if (hidden.length == 0) {
      var grid = $(".masonry-grid");
      var href = grid.data("viewertemplate");
      if (href == null) {
        href = componenthome + "/mediaviewer/fullscreen/index.html";
      }

      $.ajax({
        url: href,
        async: false,
        data: { oemaxlevel: 1 },
        success: function (data) {
          $("#application").append(data);
          hidden = $("#hiddenoverlay");
          initKeyBindings(hidden);
        },
      });
    }
    hidden = $("#hiddenoverlay");

    return hidden;
  };

  refreshresults = function () {
    var resultsdiv = $("#resultsdiv");
    if (resultsdiv.length) {
      var href = siteroot + "/views/search/index.html";
      var searchdata = resultsdiv.data();
      searchdata.oemaxlevel = 1;
      searchdata.cache = false;
      $.ajax({
        url: href,
        async: false,
        data: searchdata,
        success: function (data) {
          $("#filteredresults").html(data);
          $(window).trigger("resize");
        },
      });
    }
  };

  lQuery("#jumptoform .jumpto-left").livequery("click", function (e) {
    e.preventDefault();
    var input = $("#jumptoform #pagejumper");
    var current = input.val();
    current = parseInt(current);
    current--;
    if (current > 0) {
      input.val(current);
      $("#jumptoform").submit();
    } else {
      $("#jumptoform .jumpto-left").addClass("invisible");
    }

    $("#jumptoform .jumpto-right").removeClass("invisible");
  });

  lQuery("#jumptoform .jumpto-right").livequery("click", function (e) {
    e.preventDefault();
    var input = $("#jumptoform #pagejumper");
    var current = input.val();
    current = parseInt(current);
    current++;
    var totalpages = $("#jumptoform").data("totalpages");
    totalpages = parseInt(totalpages);
    if (current <= totalpages) {
      input.val(current);
      $("#jumptoform").submit();
    }
    if (current >= totalpages) {
      $("#jumptoform .jumpto-right").addClass("invisible");
    }
    $("#jumptoform .jumpto-left").removeClass("invisible");
  });

  lQuery(".goleftclick").livequery("click", function (e) {
    e.preventDefault();
    var div = $("#main-media-viewer");
    var id = div.data("previous");
    var enabled = $(this).data("enabled");
    if (id && enabled) {
      showAsset(id);
    }
  });

  lQuery(".gorightclick").livequery("click", function (e) {
    e.preventDefault();
    var div = $("#main-media-viewer");
    var id = div.data("next");
    var enabled = $(this).data("enabled");
    if (id && enabled) {
      showAsset(id);
    }
  });

  lQuery(".carousel-indicators li#leftpage").livequery("click", function (e) {
    e.preventDefault();
    var div = $("#main-media-viewer");
    var id = div.data("previouspage");
    if (id) {
      showAsset(id);
    }
  });
  lQuery(".carousel-indicators li#rightpage").livequery("click", function (e) {
    e.preventDefault();
    var div = $("#main-media-viewer");
    var id = div.data("nextpage");
    if (id) {
      showAsset(id);
    }
  });

  lQuery("#main-media").livequery("swipeleft", function () {
    var div = $("#main-media-viewer");
    var id = div.data("next");
    if (id) {
      showAsset(id);
    }
  });
  lQuery("#main-media").livequery("swiperight", function () {
    var div = $("#main-media-viewer");
    var id = div.data("previous");
    if (id) {
      showAsset(id);
    }
  });

  lQuery("a.stackedplayer").livequery("click", function (e) {
    e.preventDefault();
    var link = $(this);
    var assetid = link.data("assetid");
    var pagenum = link.data("pagenum");
    showAsset(assetid, pagenum);
    return false;
  });

  lQuery("a.stackedplayer", ".entity-media").livequery("click", function (e) {
    var modal = $(this).closest(".modal");
    if (modal.length) {
      //modal.modal("hide");
    }
  });
  lQuery(".stackedplayertableX tr td").livequery(function () {
    $(this).hover(
      function () {
        var row = $($(this).closest("tr"));
        var id = $(row).data("rowid");
        if (id != null) {
          row.addClass("emborderhover");
        }
      },
      function () {
        var row = $($(this).closest("tr"));
        row.removeClass("emborderhover");
      }
    );
  });

  // Select multiple assets with Shift+Mouse
  var isMouseDown = false;
  var currentCol;
  lQuery(".stackedplayertable td").livequery("mousedown", function (e) {
    isMouseDown = true;
    if (e.shiftKey) {
      var row = $(this).closest("tr");
      currentCol = row.data("rowid");
      if (currentCol) {
        // row.toggleClass("emrowselected");
        var isHighlighted = row.hasClass("emrowselected");
        var chkbox = row.find(".selectionbox");
        $(chkbox).prop("checked", true);
        $(chkbox).trigger("change");
      }
    }
    return false; // Prevent text selection
  });

  lQuery(".stackedplayertable td").livequery("mouseover", function (e) {
    if (isMouseDown && e.shiftKey) {
      // Mouse + Shift Key
      var row = $(this).closest("tr");
      var currentColDown = row.data("rowid");
      var isHighlighted = row.hasClass("emrowselected");
      if (currentColDown && !isHighlighted) {
        // row.toggleClass("emrowselected", isHighlighted);
        var chkbox = row.find(".selectionbox");
        $(chkbox).prop("checked", true);
        $(chkbox).trigger("change");
      }
    }
  });

  // .bind("selectstart", function () {
  // return false;
  // })

  $(window).mouseup(function () {
    isMouseDown = false;
  });

  // Select multiple assets with CTRL key
  var ctrlPressed = false;
  $(window)
    .keydown(function (evt) {
      if (evt.which == 17) {
        // ctrl
        ctrlPressed = true;
      }
    })
    .keyup(function (evt) {
      if (evt.which == 17) {
        // ctrl
        ctrlPressed = false;
      }
    });

  // Click on asset
  var selectStart = null;
  // Table clicking
  lQuery(".stackedplayertable td").livequery("click", function (e) {
    var clicked = $(this);
    if (clicked.attr("noclick") == "true") {
      return true;
    }
    if ($(e.target).is("input") || $(e.target).is("a")) {
      return true;
    }
    // click+ctrl
    if (ctrlPressed) {
      var chkbox = clicked.closest("tr").find(".selectionbox");
      if (chkbox) {
        var ischecked = $(chkbox).prop("checked");
        if (!ischecked || ischecked == "true") {
          $(chkbox).prop("checked", true);
        } else {
          $(chkbox).prop("checked", false);
        }
        $(chkbox).trigger("change");
      }
      return false;
    }
    // click+shift
    if (e.shiftKey) {
      if (selectStart == null) {
        selectStart = $(clicked).closest("tr");
      } else {
        var selectEnd = $(clicked).closest("tr");
        if (selectStart) {
          $(selectStart)
            .nextUntil($(selectEnd))
            .each(function () {
              var chkbox = $(this).find(".selectionbox");
              if (chkbox) {
                var ischecked = $(chkbox).prop("checked");
                if (!ischecked || ischecked == "true") {
                  $(chkbox).prop("checked", true);
                } else {
                  $(chkbox).prop("checked", false);
                }
                $(chkbox).trigger("change");
              }
            });
          selectStart = null;
          selectEnd = null;
        }
      }
      return false;
    }
    e.preventDefault();
    e.stopPropagation();

    var row = $(clicked.closest("tr"));
    var assetid = row.data("rowid");

    showAsset(assetid);
  });
  // Gallery clicking
  lQuery(".emgallery .emthumbimage").livequery("click", function (e) {
    var clicked = $(this);
    // click+ctrl
    if (ctrlPressed) {
      var chkbox = clicked.closest(".emboxthumb").find(".selectionbox");
      if (chkbox) {
        var ischecked = $(chkbox).prop("checked");
        if (!ischecked || ischecked == "true") {
          $(chkbox).prop("checked", true);
        } else {
          $(chkbox).prop("checked", false);
        }
        $(chkbox).trigger("change");
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // click+shift
    if (e.shiftKey) {
      if (selectStart == null) {
        selectStart = $(clicked).closest(".emboxthumb");
      } else {
        var selectEnd = $(clicked).closest(".emboxthumb");
        if (selectStart) {
          $(selectStart)
            .nextUntil($(selectEnd))
            .each(function () {
              var chkbox = $(this).find(".selectionbox");
              if (chkbox) {
                var ischecked = $(chkbox).prop("checked");
                if (!ischecked || ischecked == "true") {
                  $(chkbox).prop("checked", true);
                } else {
                  $(chkbox).prop("checked", false);
                }
                $(chkbox).trigger("change");
              }
            });
          selectStart = null;
          selectEnd = null;
        }
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // Selections

  lQuery("input.resultsselection.selectionbox").livequery(
    "change",
    function (e) {
      var clicked = $(this);
      var dataid = $(clicked).data("dataid");
      var resultsdiv = $(this).closest(".resultsdiv");
      if (!resultsdiv) {
        resultsdiv = $("#resultsdiv");
      }
      if (resultsdiv != null) {
        var options = resultsdiv.data();
        var componenthome = resultsdiv.data("componenthome");
        options["dataid"] = dataid;
        var targetdiv = resultsdiv.find("#resultsheader");

        refreshdiv(targetdiv, componenthome + "/results/toggle.html", options);

        if (typeof refreshSelections != "undefined") {
          refreshSelections();
        }
        var ischecked = $(clicked).prop("checked");
        if (ischecked == true) {
          $(clicked)
            .closest(".resultsassetcontainer")
            .addClass("emrowselected");
        } else {
          $(clicked)
            .closest(".resultsassetcontainer")
            .removeClass("emrowselected");
        }

        $(".assetproperties").trigger("click");
      }
    }
  );

  lQuery("a.deselectpage").livequery("click", function () {
    var resultsdiv = $(this).closest(".resultsdiv");
    if (!resultsdiv) {
      resultsdiv = $("#resultsdiv");
    }
    $("input[name=pagetoggle]", resultsdiv).prop("checked", false);
    $(".selectionbox", resultsdiv).prop("checked", false); // Not firing the page
    $(".selectionbox", resultsdiv)
      .closest(".resultsassetcontainer")
      .removeClass("emrowselected");
    $(".selectionbox", resultsdiv)
      .closest(".emboxthumb")
      .removeClass("emrowselected");
    if (typeof refreshSelections != "undefined") {
      refreshSelections();
    }
  });

  lQuery("input[name=pagetoggle]").livequery("click", function () {
    var input = $(this);
    var resultsdiv = $(this).closest(".resultsdiv");
    if (!resultsdiv) {
      resultsdiv = $("#resultsdiv");
    }
    //var hitssessionid = resultsdiv.data('hitssessionid');
    var options = resultsdiv.data();
    var componenthome = resultsdiv.data("componenthome");
    options.oemaxlevel = 1;

    var status = input.is(":checked");

    var targetdiv = resultsdiv.find("#resultsheader");
    if (status) {
      options.action = "page";
      refreshdiv(
        targetdiv,
        componenthome + "/results/togglepage.html",
        options
      );
      $(".selectionbox", resultsdiv).prop("checked", true);
    } else {
      options.action = "pagenone";
      refreshdiv(
        targetdiv,
        componenthome + "/results/togglepage.html",
        options
      );
      $(".selectionbox", resultsdiv).prop("checked", false);
    }
  });

  lQuery(".showasset").livequery("click", function (e) {
    var clicked = $(this);
    if (clicked.attr("noclick") == "true") {
      return true;
    }

    e.preventDefault();
    e.stopPropagation();

    var assetid = clicked.data("assetid");
    showAsset(assetid);
  });

  lQuery("a#multiedit-menu").livequery("click", function (e) {
    e.preventDefault();
    var link = $(this);
    var hitssessionid = link.data("hitssessionid");
    showAsset(hitssessionid, 1);
    return false;
  });

  lQuery("#hiddenoverlay .overlay-close").livequery("click", function (e) {
    e.preventDefault();
    hideOverlayDiv(getOverlay());
  });

  lQuery("#hiddenoverlay .overlay-popup span").livequery("click", function (e) {
    e.preventDefault();
    // editor/viewer/index.html?hitssessionid=${hits.getSessionId()}&assetid=${hit.id}
    var hitssessionid = $("#resultsdiv").data("hitssessionid");
    var href =
      home +
      "/views/modules/asset/editor/viewer/index.html?hitssessionid=" +
      hitssessionid +
      "&assetid=" +
      getCurrentAssetId();
    window.location = href;
  });

  lQuery(".tableresultsaddcolumn").livequery("change", function () {
    var selector = $(this);
    var targetdiv = selector.data("targetdiv");
    var selectedval = $(this).val();
    if (selectedval) {
      var link = selector.data("componenthome");
      var args = {
        addcolumn: selectedval,
        oemaxlevel: selector.data("oemaxlevel"),
      };

      // jQuery("#"+targetdiv).load(link);
      $.get(link, args, function (data) {
        $("#" + targetdiv).replaceWith(data);
        $(window).trigger("resize");
      });
    }
  });

  lQuery(".emshowbox").livequery(function () {
    var div = $(this);
    div.css("position", "relative");
    var box = div.data("showbox");
    // var box = JSON.parse(json);

    div.prepend("<canvas></canvas>");

    var canvas = $(div.find("canvas"));
    canvas.css("position", "absolute");

    var w = div.data("imagewidth");
    var h = div.data("imageheight");

    var image = $(div.find("img"));
    image.ready(function () {
      // console.log(image.height());
      // canvas.width(box[2]);
      // canvas.height(box[3]);
      //var w = 240; //box[2]+10;
      //var h = 240;//box[3]+10;

      canvas.attr({ width: w, height: h });
      var context = canvas[0].getContext("2d");
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = "#666";
      context.strokeRect(box[0], box[1], box[2], box[3]);
      context.strokeStyle = "#fff";
      context.strokeRect(box[0] - 1, box[1] - 1, box[2] + 1, box[3] + 1);
    });
    var container = div.data("centerbox");
    if (container) {
      var topbox = box[1];
      if (topbox > h / 2) {
        div.css("top", topbox + 5);
      }
    }
  });

  lQuery("select.addremovecolumns").livequery("change", function () {
    var selectedval = $(this).val();
    var resultsdiv = $(this).data("targetdiv");

    if (resultsdiv) {
      resultsdiv = $("#" + resultsdiv);
    } else {
      resultsdiv = $(this).closest("#resultsdiv");
    }

    var options = resultsdiv.data();
    var searchhome = resultsdiv.data("searchhome");
    $.get(
      searchhome +
        "/addremovecolumns.html?oemaxlevel=1&editheader=true&addcolumn=" +
        selectedval,
      options,
      function (data) {
        resultsdiv.html(data);
      }
    );
  });

  lQuery("th.sortable").livequery("click", function () {
    if ($(this).closest(".datamanagertable").lenght > 0) {
      return;
    }

    var id = $(this).data("sortby");
    var resultsdiv = "";
    var searchome = "";
    var options = "";
    var targetdiv = "";

    resultsdiv = $(this).closest(".resultsdiv");
    if (!resultsdiv.length) {
      resultsdiv = $(this).closest("#resultsdiv");
    }
    searchhome = resultsdiv.data("searchhome");
    targetdiv = resultsdiv.data("targetdiv");
    options = resultsdiv.data();
    targetdiv = $("#" + targetdiv);

    var link = searchhome + "/columnsort.html";

    if ($(this).hasClass("currentsort")) {
      if ($(this).hasClass("up")) {
        // $(resultsdiv).load( columnsort + '&sortby=' + id +
        // 'Down', options);

        options["sortby"] = id + "Down";
        $.get(link, options, function (data) {
          $(targetdiv).replaceWith(data);
        });
      } else {
        // $(resultsdiv).load( columnsort + '&sortby=' + id + 'Up',
        // options);
        options["sortby"] = id + "Up";
        $.get(link, options, function (data) {
          $(targetdiv).replaceWith(data);
        });
      }
    } else {
      $("th.sortable").removeClass("currentsort");
      $(this).addClass("currentsort");
      // $(resultsdiv).load( columnsort + '&sortby=' + id + 'Down',
      // options);
      options["sortby"] = id + "Down";
      $.get(link, options, function (data) {
        //$(targetdiv).replaceWith(data);
        $(targetdiv).replaceWith(data);
      });
    }
  });

  var hidemediaviewer = $("body").data("hidemediaviewer");
  if (!hidemediaviewer) {
    var hash = window.location.hash;

    if (hash && hash.startsWith("#asset-")) {
      var assetid = hash.substring(7, hash.length);
      if (assetid) {
        showAsset(assetid);
      }
    }
  }

  gridResize();

  // jQuery(".masonry-grid img.imagethumb:eq(10)").on('load', function() {

  // gridResize();

  // });
}); // document ready

document.addEventListener("touchmove", function (e) {
  checkScroll();
});
jQuery(window).on("scroll", function (e) {
  //console.log("main scroll");
  checkScroll();
});

jQuery(window).on("resize", function () {
  // gridResize();
});

// TODO: remove this. using ajax Used for modules
togglehits = function (action) {
  var data = $("#resultsdiv").data();
  data.oemaxlevel = 1;
  data.action = action;

  $.get(componenthome + "/moduleresults/selections/togglepage.html", data);
  if (action == "all" || action == "page") {
    $(".moduleselectionbox").attr("checked", "checked");
  } else {
    $(".moduleselectionbox").removeAttr("checked");
  }
  return false;
};
var stopautoscroll = false;
var gridcurrentpageviewport = 1;
var gridlastscroll = 0;
var gridscrolldirection = "down";

checkScroll = function () {
  var appdiv = $("#application");
  var siteroot = appdiv.data("siteroot") + appdiv.data("apphome");
  var componenthome = appdiv.data("siteroot") + appdiv.data("componenthome");

  var grid = getCurrentGrid();
  if (!grid) {
    return;
  }
  if (grid.data("singlepage") == true) {
    return;
  }

  var resultsdiv = $(grid).closest("#resultsdiv");
  var lastcheck = $(resultsdiv).data("lastscrollcheck");
  var currentscroll = 0;
  if (grid.closest(".modal").length) {
    //change to parent for multiple
    currentscroll = $(".modal").scrollTop();
  } else {
    currentscroll = $(window).scrollTop();
  }
  if (lastcheck == currentscroll) {
    //Dom events cause it to fire recursively
    return false;
  }
  $(resultsdiv).data("lastscrollcheck", currentscroll);
  if (stopautoscroll) {
    // ignore scrolls
    if (typeof getOverlay === "function" && getOverlay().is(":visible")) {
      var lastscroll = getOverlay().data("lastscroll");

      if (Math.abs(lastscroll - currentscroll) > 50) {
        $(window).scrollTop(lastscroll);
      }
    }
    return;
  }

  // No results?

  var gridcells = $(".masonry-grid-cell", resultsdiv);
  if (gridcells.length == 0) {
    //console.log("No grid found")

    return; //No results?
  }

  // are we near the end? Are there more pages?

  //  var page = parseInt(resultsdiv.data("pagenum"));
  /*   
    var nextpage = gridcurrentpageviewport;
    if(currentscroll>=gridlastscroll) {
    	scrolldirection = "down";
    	nextpage = nextpage+1
    }
    else
    {
    	scrolldirection = "up";
    	nextpage = nextpage-1;
    }
    
    gridlastscroll = currentscroll;
    
    
	var firstelementonpage = $(".masonry-grid-cell[data-positionnum='"+ (nextpage) +"']:first");
	if(firstelementonpage.length > 0) 
	{
		var elementviewport = elementvisibility(firstelementonpage);
		if(elementviewport[1]>'0.35') {
			gridcurrentpageviewport = nextpage;
			console.log(gridcurrentpageviewport + "-> " + elementviewport[1]);
			gridupdatepositions(grid, gridcurrentpageviewport);
		}
	}
	*/

  gridupdatepositions(grid);

  var page = parseInt(resultsdiv.data("pagenum"));
  if (isNaN(page)) {
    page = 1;
  }

  var total = parseInt(resultsdiv.data("totalpages"));
  if (isNaN(total)) {
    total = 1;
  }
  // console.log("checking scroll " + stopautoscroll + " page " + page + " of
  // " + total);
  if (page == total) {
    //Last page. dont load more
    //console.log("Last page, dont load more")
    return;
  }

  // console.log($(window).scrollTop() + " + " + (visibleHeight*2 + 500) +
  // ">=" + totalHeight);
  //	var visibleHeight = $(window).height();
  //	var totalHeight = $(document).height();
  //	var atbottom = ($(window).scrollTop() + (visibleHeight*2 + 500)) >= totalHeight ; // is the scrolltop plus the visible
  // equal to the total height?

  var lastcell = gridcells.last().get(0);
  if (!isInViewport(lastcell)) {
    //console.log("up top, dont load more yet")
    return; //not yet at bottom (-500px)
  }

  stopautoscroll = true;
  var session = resultsdiv.data("hitssessionid");
  page = page + 1;
  resultsdiv.data("pagenum", page);

  var stackedviewpath = resultsdiv.data("stackedviewpath");
  if (!stackedviewpath) {
    stackedviewpath = "stackedgallery.html";
  }
  var link = componenthome + "/results/" + stackedviewpath;
  var collectionid = $(resultsdiv).data("collectionid");
  var params = {
    hitssessionid: session,
    page: page,
    oemaxlevel: "1",
  };
  if (collectionid) {
    params.collectionid = collectionid;
  }

  console.log("Loading page: #" + page + " - " + link);

  $.ajax({
    url: link,
    xhrFields: {
      withCredentials: true,
    },
    cache: false,
    data: params,
    success: function (data) {
      var jdata = $(data);
      var code = $(".masonry-grid", jdata).html();
      //$(".masonry-grid",resultsdiv).append(code);
      $(grid).append(code);
      // $(resultsdiv).append(code);
      gridResize();

      stopautoscroll = false;
      // Once that is all done loading we can see if we need a second
      // page?
      // console.log( page + " Loaded get some more?" +
      // getOverlay().is(':hidden') );
      if (getOverlay().is(":hidden")) {
        checkScroll(); // Might need to load up two pages worth
      }
    },
  });
};

function gridupdatepositions(grid) {
  //console.log("Checking Old Position: " + oldposition);
  var resultsdiv = grid.closest(".resultsdiv");
  if (!resultsdiv) {
    resultsdiv = grid.closest(".resultsdiv");
  }

  var positionsDiv = resultsdiv.find(".resultspositions");
  console.log("positionsDiv:", positionsDiv);

  if (positionsDiv.length > 0) {
    var oldpage = grid.data("currentpagenum");

    $(".masonry-grid-cell", grid).each(function (index, cell) {
      var elementviewport = isInViewport(cell);
      if (elementviewport) {
        var pagenum = $(cell).data("pagenum");
        if (pagenum != oldpage) {
          grid.data("currentpagenum", pagenum);
          positionsDiv.data("currentpagenum", pagenum);
          //var currentscroll = $(window).scrollTop();

          //console.log("Firing dom event: ",oldpage, pagenum, $(window).scrollTop());
          var url = positionsDiv.data("url");
          //positionsDiv.data("currentpage",pagenum); //Where we are at
          var options = positionsDiv.data();
          replaceelement(url, positionsDiv, options);
        }
        return false;
      }
    });
  }
}

function isInViewport(cell) {
  const rect = cell.getBoundingClientRect();
  var isin =
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);
  return isin;
}

function getCurrentGrid() {
  var grid = $(".entitydialog").find(".masonry-grid");
  if (grid.length == 0) {
    grid = $(".masonry-grid"); //Mainscreen Grid
  }
  if (grid.length == 0) {
    return null;
  }

  return grid;
}
gridResize = function () {
  var grid = getCurrentGrid();
  if (!grid) {
    return;
  }

  var fixedheight = grid.data("maxheight");
  if (fixedheight == null || fixedheight.length == 0) {
    fixedheight = 200;
  }
  fixedheight = parseInt(fixedheight);

  var totalwidth = 0;
  var totalheight = fixedheight;
  var rownum = 0;
  var totalavailablew = grid.width();

  // Two loops, one to make rows and one to render cells
  var sofarusedw = 0;
  var sofarusedh = 0;

  var row = new Array();
  $(grid)
    .find(".masonry-grid-cell")
    .each(function () {
      var cell = $(this);
      var w = cell.data("width");
      var h = cell.data("height");
      w = parseInt(w);
      h = parseInt(h);
      if (w == 0) {
        w = fixedheight;
        h = fixedheight;
      }
      var a = w / h;
      cell.data("aspect", a);
      var neww = a * fixedheight;
      cell.data("targetw", Math.ceil(neww));
      var isover = sofarusedw + neww;
      if (isover > totalavailablew) {
        // Just to make a row
        // Process previously added cell
        var newheight = trimRowToFit(fixedheight, row, totalavailablew);
        totalheight = totalheight + newheight + 8;
        row = new Array();
        sofarusedw = 0;
        rownum = rownum + 1;
      }
      sofarusedw = sofarusedw + neww;
      row.push(cell);
      cell.data("rownum", rownum);
    });

  var makebox = grid.data("makebox");

  if (row.length > 0) {
    trimRowToFit(grid.data("maxheight"), row, totalavailablew);
    //if( makebox && makebox == true && rownum >= 3)
    {
      grid.css("height", totalheight + "px");
      //grid.css("overflow","hidden");
    }
  }

  checkScroll();
};

/**
 * A = W / H H = W / A W = A * H
 */
trimRowToFit = function (targetheight, row, totalavailablew) {
  var totalwidthused = 0;
  $.each(row, function () {
    var div = this;
    var usedw = div.data("targetw");
    totalwidthused = totalwidthused + usedw;
  });
  var existingaspect = targetheight / totalwidthused; // Existing aspec ratio
  var overwidth = totalwidthused - totalavailablew;
  var changeheight = existingaspect * overwidth;
  var fixedheight = targetheight - changeheight;
  if (fixedheight > targetheight * 1.7) {
    fixedheight = targetheight;
  }
  // The overwidth may not be able to be divided out evenly depending on
  // number of
  var totalwused = 0;
  $.each(row, function () {
    var div = this;
    // div.css("line-height",fixedheight + "px");
    div.css("height", fixedheight + "px");
    $("img.imagethumb", div).height(fixedheight);

    var a = div.data("aspect");
    var neww = fixedheight * a;

    neww = Math.round(neww); // make sure we dont round too high across lots
    // of widths
    div.css("width", neww + "px");

    totalwused = totalwused + neww;
  });

  if (totalwused != totalavailablew && fixedheight != targetheight) {
    // Deal
    // with
    // fraction
    // of a
    // pixel
    // We have a fraction of a pixel to add to last item
    var toadd = totalavailablew - totalwused;
    var div = row[row.length - 1];
    if (div) {
      var w = div.width();
      w = w + toadd;
      div.css("width", w + "px");
    }
  }

  return fixedheight;
};

function updateentities(element) {
  // get form fields as data
  var data = $(element)
    .serializeArray()
    .reduce(function (obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
  //or get data from element (<a>)
  if (data.constructor === Object && Object.keys(data).length === 0) {
    data = element.data();
  }
  if (data.id && data.searchtype) {
    var entitycontainerclass = "entity" + data.searchtype + data.id;
    $("." + entitycontainerclass).each(function () {
      $(this).trigger("reload");
    });
  }

  $(window).trigger("ajaxautoreload", {
    eventtype: "entitysave",
    moduleid: data.searchtype,
  });
}

lQuery(".entitycontainer").livequery(function (e) {
  // debugger;
  var entity = $(this);
  entity.on("reload", function (e) {
    var entityparent = entity.closest(".entitiescontainer");
    var entityreloadurl = entityparent.data("entityrenderurl");
    if (entityreloadurl != null) {
      var options = {};
      var targetdiv = entity.closest(".emgridcell");
      options = entity.data();
      $.ajax({
        url: entityreloadurl,
        data: options,
        success: function (data) {
          // debugger;
          console.log("reloading" + entity);
          targetdiv.replaceWith(data);
          $(window).trigger("resize");
        },
      });
    }
  });
});

lQuery("div.assetpreview").livequery("click", function (e) {
  e.preventDefault();
  $(".bottomtab").removeClass("tabselected");
  $(this).closest(".bottomtab").addClass("tabselected");
  var div = $("#main-media-viewer");
  var id = div.data("assetid");
  showAsset(id);
  saveProfileProperty("assetopentab", "viewpreview", function () {});
});

lQuery("a.assettab").livequery("click", function (e) {
  e.preventDefault();
  $(".bottomtab").removeClass("tabselected");
  $(".bottomtabactions a").removeClass("dropdown-current");
  $(this).closest(".bottomtab").addClass("tabselected");
  var div = $("#main-media-viewer");
  var options = div.data();

  options.pageheight = $(window).height() - 100;

  var assettab = $(this).data("assettab");

  var collectionid = $("#resultsdiv").data("collectionid");
  if (collectionid) {
    options.collectionid = collectionid;
  }

  if (assettab == "viewpreview") {
    var id = div.data("assetid");
    saveProfileProperty("assetopentab", assettab, function () {});
    showAsset(id);
  } else if (assettab == "multiedit") {
    var link = $(this).data("link");
    div.load(link, options, function () {
      // Update AssetID
      var assetid = $("#multieditpanel").data("assetid");
      $("#main-media-viewer").data("assetid", assetid);
      $(window).trigger("tabready");
    });
  } else {
    disposevideos();
    var link = $(this).data("link");
    div.load(link, options, function () {
      // console.log("triggered");
      $(window).trigger("tabready");
    });
    // save to profile only pewview, properties and media
    if (
      assettab == "viewproperties" ||
      assettab == "viewmedia" ||
      assettab == "viewdownloads" ||
      assettab == "viewtimeline" ||
      assettab == "viewclosedcaptions"
    ) {
      saveProfileProperty("assetopentab", assettab, function () {});
    }
    var assettabactions = $(this).data("assettabactions");
    if (assettabactions) {
      $(this).addClass("dropdown-current");
      var label = $(this).data("assettabname");
      if (label) {
        $(".bottomtabactionstext").text(label);
      }
      // saveProfileProperty("assetopentabactions",assettabactions,function(){});
    }
    var assettabtable = $(this).data("assettabtable");
    if (assettabtable) {
      $(this).addClass("dropdown-current");
      var label = $(this).data("assettabname");
      if (label) {
        $(".bottomtabactionstext").text(label);
      }
      // saveProfileProperty("assetopentabassettable",assettabtable,function(){});
    }
  }
});
