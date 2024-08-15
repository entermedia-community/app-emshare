jQuery(document).ready(function () {
  var siteroot = $("#application").data("siteroot");
  var mediadb = $("#application").data("mediadbappid");
  var downloadInProgress = {};
  const { ipcRenderer } = require("electron");

  var entermediakey = "";
  if (app && app.data("entermediakey") != null) {
    // app variable is from dom
    entermediakey = app.data("entermediakey");
  }

  var headers = { "X-tokentype": "entermedia", "X-token": entermediakey };

  ipcRenderer.send("setConnectionOptions", {
    headers: headers,
    key: entermediakey,
    mediadb: mediadb,
  });

  ipcRenderer.on("electron-log", (_, ...log) => {
    console.log(
      "%c --- Desktop Log Start --- ",
      "background: #000000; color: #bada55; font-style: italic"
    );
    if (log.length === 1) {
      console.log.apply(console, log[0]);
    } else {
      log.forEach((l) => {
        console.log.apply(console, l);
      });
    }
  });

  ipcRenderer.on("electron-error", (_, ...error) => {
    console.log(
      "%c --- Desktop Error Start --- ",
      "background: #000000; color: #ba5555; font-style: italic"
    );
    if (error.length === 1) {
      console.error.apply(console, error[0]);
    } else {
      error.forEach((l) => {
        console.error.apply(console, l);
      });
    }

    $("#application").append(
      '<div class="alert fader alert-error" role="alert">Desktop Error: Check log for details.</div>'
    );
  });

  function humanFileSize(bytes) {
    var thresh = 1000;
    if (Math.abs(bytes) < thresh) {
      return bytes + " B";
    }
    var units = ["kB", "MB", "GB", "TB"];
    var u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * 10) / 10 >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + units[u];
  }

  ipcRenderer.on("desktopReady", () => {
    function checkForPendingDownloads() {
      jQuery.ajax({
        dataType: "json",
        url:
          siteroot +
          "/" +
          mediadb +
          "/services/module/order/downloadorderitems?hitsperpage=10",

        success: function (json) {
          if (json.ordestatus == "complete") return;
          var items = json.orderitems;
          if (items.length == 0) {
            return;
          }
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (
              item.publishstatus.id == "readytopublish" ||
              item.publishstatus.id == "publishingexternal"
            ) {
              var file = {
                itemexportname: item.itemexportname,
                itemdownloadurl: item.itemdownloadurl,
              };
              var itemEl = $("#d-" + item.id);
              downloadMediaLocally(item.id, file, itemEl);
            }
          }
        },
      });
    }
    lQuery("#triggerpendingdownloads").livequery(checkForPendingDownloads);

    function showDownloadProgress(orderitemid) {
      $("#dl-" + orderitemid).show();
      $("#dl-" + orderitemid)
        .first()
        .show();
    }
    function hideDownloadProgress(orderitemid) {
      $("#dl-" + orderitemid).hide();
      $("#dl-" + orderitemid)
        .first()
        .hide();
    }
    function errorDownloadProgress(orderitemid) {
      $("#dl-" + orderitemid).css("background-color", "red");
      $("#dl-" + orderitemid)
        .first()
        .hide();
    }
    function successDownloadProgress(orderitemid) {
      $("#dl-" + orderitemid).css("background-color", "green");
      $("#dl-" + orderitemid)
        .first()
        .hide();
    }

    window.onbeforeunload = function () {
      for (var key in downloadInProgress) {
        if (downloadInProgress[key] != null) {
          return "Downloads are in progress. Are you sure you want to leave?";
        }
      }
    };

    function downloadMediaLocally(orderitemid, file, itemEl, retries = 0) {
      if (downloadInProgress[orderitemid]) return;
      if (retries > 3) {
        $.ajax({
          url:
            siteroot +
            "/" +
            mediadb +
            "/services/module/order/updateorderitemstatus?orderitemid=" +
            orderitemid +
            "&publishstatus=canceled",
          success: function () {
            autoreload($("#userdownloadlist"));
            showDownloadToast(orderitemid, "error", file.itemexportname);
          },
        });
        return;
      }

      downloadInProgress[orderitemid] = true;

      ipcRenderer.send("start-download", { orderitemid, file, headers });

      ipcRenderer.on(`download-started-${orderitemid}`, () => {
        var downloadStartDate = new Date().toISOString();
        $.ajax({
          url:
            siteroot +
            "/" +
            mediadb +
            "/services/module/order/updateorderitemstatus?orderitemid=" +
            orderitemid +
            "&publishstatus=publishingexternal" +
            "&downloadstartdate=" +
            (downloadStartDate ? downloadStartDate : new Date().toISOString()),
          success: function () {
            showDownloadToast(orderitemid, "downloading", file.itemexportname);
            autoreload($("#userdownloadlist"));
            showDownloadProgress(orderitemid);
          },
        });
      });

      ipcRenderer.on(`download-progress-${orderitemid}`, (event, progress) => {
        var percentComplete = Math.floor(
          (progress.loaded / progress.total) * 100
        );
        $("#dl-" + orderitemid).css("width", percentComplete + "%");
        $("#dtt-" + orderitemid).text(percentComplete + "%");
        $("#dlp-" + orderitemid).text(humanFileSize(progress.loaded) + " / ");
        var lastupdated = $("#userdownloadlist").data("lastupdated");
        if (lastupdated === undefined) {
          lastupdated = new Date();
          $("#userdownloadlist").data("lastupdated", lastupdated);
        }
        var diff = new Date().getTime() - lastupdated.getTime();
        if (diff > 5000) {
          $("#userdownloadlist").data("lastupdated", new Date());
          $.ajax({
            url:
              siteroot +
              "/" +
              mediadb +
              "/services/module/order/updateorderitemstatus?orderitemid=" +
              orderitemid +
              "&publishstatus=publishingexternal" +
              "&downloaditemdownloadedfilesize=" +
              progress.loaded,
            success: function () {
              autoreload($("#userdownloadlist"));
              $("#dl-" + orderitemid).css("width", percentComplete + "%");
              $("#dlp-" + orderitemid).text(
                humanFileSize(progress.loaded) + " / "
              );
              showDownloadProgress(orderitemid);
            },
          });
        }
      });

      ipcRenderer.on(`download-error-${orderitemid}`, () => {
        errorDownloadProgress(orderitemid);
        downloadInProgress[orderitemid] = null;
        downloadMediaLocally(orderitemid, file, itemEl, retries + 1);
      });

      ipcRenderer.on(`download-abort-${orderitemid}`, () => {
        hideDownloadProgress(orderitemid);
      });

      ipcRenderer.on(`download-finished-${orderitemid}`, (event, filePath) => {
        successDownloadProgress(orderitemid);
        $.ajax({
          url:
            siteroot +
            "/" +
            mediadb +
            "/services/module/order/updateorderitemstatus?orderitemid=" +
            orderitemid +
            "&publishstatus=complete" +
            "&publisheddate=" +
            new Date().toISOString(),
          success: function () {
            downloadInProgress[orderitemid] = null;
            showDownloadToast(orderitemid, "complete", file.itemexportname);
            autoreload($("#userdownloadlist"));
          },
        });
      });
    }

    lQuery(".abortdownloadorder").livequery("click", function (e) {
      // var orderid = $(this).data("orderid");
      var orderitemid = $(this).data("orderitemid");
      if (downloadInProgress[orderitemid]) {
        ipcRenderer.send("cancel-download", { orderitemid });
        downloadInProgress[orderitemid] = null;
      }

      $.ajax({
        url:
          siteroot +
          "/" +
          mediadb +
          "/services/module/order/updateorderitemstatus?orderitemid=" +
          orderitemid +
          "&publishstatus=canceled",
        success: function () {
          autoreload($("#userdownloadlist"));
          var toast = $("#dt-" + orderitemid);
          toast.toast("hide");
        },
      });
    });

    lQuery(".opendownloadedfile").livequery("click", function (e) {
      e.preventDefault();

      var itemexportname = $(this).data("itemexportname");
      var itemdownloadurl = $(this).data("itemdownloadurl");
      var file = {
        itemexportname: itemexportname,
        itemdownloadurl: itemdownloadurl,
      };
      console.log("EM: opening " + file);
      ipcRenderer.send("onOpenFile", file);
    });

    //Read Local
    lQuery(".readlocalpath").livequery("click", function (e) {
      e.preventDefault();
      var path = $(this).data("path");
      //sendReadDirRequest('/home/cristobal/Media/03/05/');

      ipcRenderer.send("readDir", { path });
    });

    function sendReadDirRequest(path) {
      ipcRenderer.send("readDir", {
        path,
        onScan: (fileList) => {
          console.log("Received files from main process:", fileList.files);
          console.log("Received folder from main process:", fileList.folders);
          // Handle the directory listing data here (e.g., display in a UI element)
        },
      });
    }

    var toastTypes = {
      downloading: {
        label: "Downloading",
        icon: "bi bi-download",
        color: "primary",
      },
      complete: {
        label: "Download Complete",
        icon: "bi bi-check-circle-fill",
        color: "success",
      },
      error: {
        label: "Download Error",
        icon: "bi bi-exclamation-triangle",
        color: "danger",
      },
    };
    function getToastTemplate(id, type, filename) {
      var template = "";
      template += '<div role="alert" id="dt-' + id + '" class="toast">';
      template += '<div class="toast-header">';
      template +=
        '<i class="' +
        toastTypes[type].icon +
        " text-" +
        toastTypes[type].color +
        '"></i>';
      template +=
        '<strong class="downloadToastLabel text-' +
        toastTypes[type].color +
        '">' +
        toastTypes[type].label +
        "</strong>";
      // template += '<a class="open">view</a>';
      template +=
        '<button type="button" class="close" data-dismiss="toast">hide</button>';
      template += "</div>";
      template += '<div class="toast-body">';
      var isdesktop = $("#application").data("desktop");
      if (type == "complete" && isdesktop) {
        template +=
          '<a href="#" class="opendownloadedfile" data-itemexportname="' +
          filename +
          '" title="Open File"><i class="bi bi-box-arrow-up-right"></i>&nbsp; ';
      }
      template += '<span class="toast-filename">' + filename + "</span>";
      if (type == "complete" && isdesktop) {
        template += "</a>";
      }
      if (type == "downloading")
        template += '<span class="dprog" id="dtt-' + id + '"></span>';
      template += "</div>";
      template += "</div>";
      return $(template);
    }

    function showDownloadToast(id, type, filename) {
      var check = $("#toastList");
      if (!check.length) {
        var div = $('<div id="toastList"></div>');
        $("body").append(div);
      }
      check = $("#dt-" + id);
      if (check.length) {
        check.remove();
      }

      var div = getToastTemplate(id, type, filename);
      $("#toastList").append(div);
      var toast = $("#dt-" + id);
      toast.toast({ autohide: true, delay: 15000 });
      toast.toast("show");
      toast.on("hidden.bs.toast", function () {
        toast.remove();
      });
    }

    lQuery(".open-folder").livequery("click", function () {
      var path = $(this).data("path");
      ipcRenderer.send("openFolder", { path });
    });

    ipcRenderer.send("getWorkDir");
    ipcRenderer.on("set-workDir", (_, { workDir, workDirEntity }) => {
      if (workDir) {
        $("#workFolderInput").val(workDir);
        $("#workFolderPicker").text("Change");
      } else {
        $("#workFolderPicker").text("Select");
      }
      if (workDirEntity) {
        $("#workDirEntity").val(workDirEntity);
      }
      if (workDir && workDirEntity) {
        $("#scanHotFoldersBtn").show();
        triggerHitScan();
      } else {
        $("#scanHotFoldersBtn").hide();
      }
    });

    ipcRenderer.on("extra-folders-found", (_, data) => {
      var tree = "";
      var tab = "";
      data.forEach(({ name, level, index, path, isExtra = false }) => {
        var padding = (level - 1) * 8;
        var isDl = false,
          isUp = false;
        var folder = $("#folder-" + index);
        if (folder.length) {
          isDl = folder.find(".notif").hasClass("dl");
          isUp = folder.find(".notif").hasClass("up");
          tab = folder.find(".pullfetchfolder").data("tab");
        }
        var notifClass = isDl ? "dl" : "";
        notifClass += isUp || isExtra ? " up" : "";
        tree += `<div style="padding-left: ${padding}px;" class="pull-folder" id="folder-${index}">
        <a href="#"
          class="pullfetchfolder"
          data-tab="${tab}"
          data-categorypath="${path}">
          <i class="bi bi-folder"></i>
          <span class="mx-1 notif ${notifClass}">${name} <i class="bi bi-circle-fill"></i></span>
          <i class="fas fa-spinner fa-spin text-muted" style="display: none;"></i>
        </a>
      </div>`;
      });
      $("#fetchfolder").html("");
      $(".pullfoldertree").html(tree);
    });

    lQuery(".pullfetchfolder").livequery("click", function (e) {
      e.preventDefault();
      var folder = $(this);
      folder
        .closest(".pullfoldertree")
        .find(".pullfetchfolder")
        .removeClass("current");
      folder.addClass("current");
      var categorypath = folder.data("categorypath");
      var tab = folder.data("tab");
      refreshSync(categorypath, tab);
    });

    function refreshSync(categorypath, tab) {
      ipcRenderer.send("fetchFiles", {
        categorypath: categorypath,
        tab: tab,
      });
    }

    ipcRenderer.on("files-fetched", (_, data) => {
      var tab = data["tab"] === "push" ? "import" : "export";
      $.ajax({
        type: "POST",
        url: apphome + "/components/desktop/" + tab + "/folder.html",
        data: JSON.stringify(data),
        contentType: "application/json",
        //dataType: "json",
        success: function (res) {
          $("#fetchfolder").html(res);
        },
        //handle error
        error: function (xhr, status, error) {
          console.log("error", xhr, status, error);
        },
      });
    });

    lQuery(".refresh-sync-push").livequery("click", function (e) {
      e.preventDefault();
      var entitydialog = $(this).closest(".entitydialog");
      if (entitydialog.length == 0) {
        return;
      }
      var categorypath = entitydialog.data("categorypath");
      refreshSyncPush(categorypath);
    });

    function refreshSyncPush(categorypath) {
      ipcRenderer.send("fetchFoldersPush", {
        categorypath: categorypath,
      });
    }

    ipcRenderer.on("files-fetched-push", (_, data) => {
      $.ajax({
        type: "POST",
        url: apphome + "/components/desktop/import/push.html",
        data: JSON.stringify(data),
        contentType: "application/json",
        //dataType: "json",
        success: function (res) {
          $("#tabimportcontent").html(res);
        },
        //handle error
        error: function (xhr, status, error) {
          console.log("error", xhr, status, error);
        },
      });
    });

    ipcRenderer.on("download-asset-complete", (_, { categorypath }) => {
      //TODO: update asset list
    });

    ipcRenderer.on("scan-progress", (_, option) => {
      var pendingPulls = $(".pending-pulls");
      pendingPulls.find(".no-download").hide();
      var totalDownloadSize = pendingPulls.data("totalDownloadSize");
      if (!totalDownloadSize) {
        totalDownloadSize = 0;
      }
      totalDownloadSize += option.downloadSize;
      pendingPulls.data("totalDownloadSize", totalDownloadSize);
      var totalDownloadCount = pendingPulls.data("totalDownloadCount");
      if (!totalDownloadCount) totalDownloadCount = 0;

      totalDownloadCount += option.downloadCount;
      pendingPulls.data("totalDownloadCount", totalDownloadCount);
      pendingPulls.find(".dl-count").text(totalDownloadCount);
      pendingPulls.find(".dl-size").text(humanFileSize(totalDownloadSize));
      if (option.downloadCount > 0)
        $("#folder-" + option.index)
          .find(".notif")
          .addClass("dl");

      if (totalDownloadCount > 0) pendingPulls.find(".pull-buttons").fadeIn();

      var totalUploadSize = pendingPulls.data("totalUploadSize");
      if (!totalUploadSize) totalUploadSize = 0;
      totalUploadSize += option.uploadSize;
      pendingPulls.data("totalUploadSize", totalUploadSize);
      var totalUploadCount = pendingPulls.data("totalUploadCount");
      if (!totalUploadCount) totalUploadCount = 0;

      totalUploadCount += option.uploadCount;
      pendingPulls.data("totalUploadCount", totalUploadCount);
      pendingPulls.find(".up-count").text(totalUploadCount);
      pendingPulls.find(".up-size").text(humanFileSize(totalUploadSize));

      if (option.uploadCount > 0)
        $("#folder-" + option.index)
          .find(".notif")
          .addClass("up");

      if (totalUploadCount > 0) pendingPulls.find(".push-buttons").fadeIn();
    });
    ipcRenderer.on("scan-complete", () => {
      $(".scan-changes")
        .find("span")
        .text("Scan for Changes")
        .prop("disabled", false);
      var pendingPulls = $(".pending-pulls");
      if (pendingPulls.data("totalDownloadCount") == 0) {
        pendingPulls.find(".no-download").show();
      } else {
        pendingPulls.find(".no-download").hide();
      }
      if (pendingPulls.data("totalUploadCount") == 0) {
        pendingPulls.find(".no-upload").show();
      } else {
        pendingPulls.find(".no-upload").hide();
      }
    });

    lQuery(".scan-changes").livequery("click", function (e) {
      e.preventDefault();
      scanChange();
    });

    function scanChange() {
      $(".notif").removeClass("dl up");
      $(".pending-pulls").data("totalDownloadSize", 0);
      $(".pending-pulls").data("totalDownloadCount", 0);
      $(".pending-pulls").data("totalUploadSize", 0);
      $(".pending-pulls").data("totalUploadCount", 0);
      $(".pending-pulls").find(".pull-buttons").fadeOut();
      $(".pending-pulls").find(".push-buttons").fadeOut();
      $(".scan-changes")
        .find("span")
        .text("Scanning...")
        .prop("disabled", true);
      var categorypath = $(".scan-changes").data("toplevelcategorypath");
      ipcRenderer.send("downloadAll", {
        categorypath: categorypath,
        scanOnly: true,
      });
      var openedFolder = $(".pullfetchfolder.current");
      if (openedFolder.length) {
        openedFolder.trigger("click");
      }
    }

    lQuery(".download-pull").livequery("click", function (e) {
      e.preventDefault();
      //var headers = { "X-tokentype": "entermedia", "X-token": entermediakey };
      var currentfolderdiv = $(this).closest("#currentfolder");
      if (!currentfolderdiv.length) {
        return;
      }
      var categorypath = currentfolderdiv.data("categorypath");

      $("#pullfiles li").each(function () {
        var item = $(this);
        var file = {
          itemexportname: categorypath + "/" + item.data("path"),
          itemdownloadurl: item.data("url"),
          categorypath: categorypath,
        };
        var assetid = item.data("id");
        ipcRenderer.send("fetchfilesdownload", { assetid, file, headers });
      });
    });

    lQuery(".download-pull-all").livequery("click", function (e) {
      e.preventDefault();
      var categorypath = $(this).data("toplevelcategorypath");
      $(".pullfetchfolder").first().find(".fa-spinner").show();
      ipcRenderer.send("downloadAll", {
        categorypath: categorypath,
        scanOnly: false,
      });
    });

    ipcRenderer.on("download-next", (_, { index }) => {
      $(".pull-folder").each(function () {
        var folder = $(this);
        var spinner = folder.find(".fa-spinner");
        if (folder.attr("id") == "folder-" + index) {
          spinner.show();
        } else {
          spinner.hide();
        }
      });
    });
    ipcRenderer.on("download-all-complete", () => {
      $(".pullfetchfolder").each(function () {
        $(this).find(".fa-spinner").hide();
      });
      scanChange();
    });

    lQuery(".remove-extra").livequery("click", function (e) {
      var count = $(this).data("count");
      if (
        confirm(
          "Are you sure you want to delete " +
            (count ? count : "all") +
            " extra file(s)?"
        )
      ) {
        var categorypath = $(this).data("categorypath");
        ipcRenderer.send("trashExtraFiles", {
          categorypath: categorypath,
        });
      }
    });

    ipcRenderer.on("trash-complete", () => {
      scanChange();
    });

    lQuery(".upload-push").livequery("click", function (e) {
      e.preventDefault();
      var categorypath = $(this).data("categorypath");
      ipcRenderer.send("uploadAll", {
        categorypath: categorypath,
      });
    });

    ipcRenderer.on("upload-next", (_, { index }) => {
      $(".pull-folder").each(function () {
        var folder = $(this);
        var spinner = folder.find(".fa-spinner");
        if (folder.attr("id") == "folder-" + index) {
          spinner.show();
        } else {
          spinner.hide();
        }
      });
    });

    ipcRenderer.on("upload-all-complete", () => {
      setTimeout(() => {
        $(".pullfetchfolder").each(function () {
          $(this).find(".fa-spinner").hide();
        });
        scanChange();
      }, 3000);
    });

    lQuery(".pull-individual").livequery("click", function (e) {
      e.preventDefault();
      var entitydialog = $(this).closest(".entitydialog");
      if (entitydialog.length == 0) {
        return;
      }
      var categorypath = entitydialog.data("categorypath");
      console.log("categorypath", categorypath);
      var item = $(this).closest("li");
      var file = {
        itemexportname: categorypath + "/" + item.data("path"),
        itemdownloadurl: item.data("url"),
        categorypath: categorypath,
      };
      var assetid = item.data("id");
      ipcRenderer.send("fetchfilesdownload", { assetid, file, headers });
    });

    function onHotScanDone(done = true) {
      if (done) {
        $("#scanHotFoldersBtn").prop("disabled", false);
        $("#scanHotFoldersBtn").find("span").text("Scan Hot Folders");
      } else {
        $("#scanHotFoldersBtn").prop("disabled", true);
        $("#scanHotFoldersBtn").find("span").text("Scanning...");
      }
    }

    lQuery("#workDirEntity").livequery("change", function () {
      var entityId = $(this).val();
      //TODO: reload actions conainer with all the entitiy data (required fields)
      ipcRenderer.send("setWorkDirEntity", { entityId });
    });

    lQuery("#scanHotFoldersBtn").livequery("click", triggerHitScan);
    function triggerHitScan() {
      var workDir = $("#workFolderInput").val();
      var workDirEntity = $("#workDirEntity").val();
      if (!workDir) {
        alert("Please select a work folder first!");
        return;
      }
      if (!workDirEntity) {
        alert("Please select an entity first!");
        return;
      }
      onHotScanDone(false);
      ipcRenderer.send("scanHotFolders", workDir);
    }

    lQuery("#importFolders").livequery("click", function (e) {
      e.preventDefault();
      var workDir = $("#workFolderInput").val();
      var workDirEntity = $("#workDirEntity").val();
      if (!workDir) {
        alert("Please select a work folder first!");
        return;
      }
      if (!workDirEntity) {
        alert("Please select an entity first!");
        return;
      }
      onHotScanDone(false);

      var selectedFolders = [];
      $.each($("work-folder inputs:checked"), function () {
        selectedFolders.push($(this).data("name"));
      });
      ipcRenderer.send("importHotFolders", {
        rootPath: workDir,
        selectedFolders: selectedFolders,
      });
    });

    lQuery("#workFolderPicker").livequery("click", function (e) {
      e.preventDefault();
      window.postMessage({
        type: "select-dirs",
        currentPath: $("#workFolderInput").val(),
      });
    });

    function folderHtm(
      path,
      name,
      stats = { totalFiles: 0, totalFolders: 0, totalSize: 0 },
      newFolders
    ) {
      var s = [];
      if (stats.totalFolders > 0) {
        s.push(
          `${stats.totalFolders} folder${stats.totalFolders > 1 ? "s" : ""}`
        );
      }
      if (stats.totalFiles > 0) {
        s.push(`${stats.totalFiles} file${stats.totalFiles > 1 ? "s" : ""}`);
      }
      var st = s.join(", ");
      if (!st) st = "No files";
      st += ` &middot; <b>${humanFileSize(stats.totalSize)}</b>`;

      var checkboxstatus = "";
      if (newFolders.includes(name)) {
        checkboxstatus = "checked";
      }

      return `<div class="work-folder" data-name="${name}">
      <label>
				<input type="checkbox" data-path="${path}" data-name="${name}" ${checkboxstatus} />
				<span class="mx-2"><i class="fas fa-folder"></i> ${name}</span>
      </label>
      <small>${st}</small>
			<button class="btn text-accent open-folder px-2" data-path="${path}">
				<i class="fas fa-eye"></i>
			</button>
    </div>`;
    }

    ipcRenderer.on(
      "selected-dirs",
      (
        _,
        {
          rootPath,
          folderTree,
          workDirEntity = null,
          newFolders,
          existingFolders,
        }
      ) => {
        $("#workFolderInput").val(rootPath);
        $("#workFolderPicker").text("Change");
        $("#scanHotFoldersBtn").prop("disabled", false);

        if (workDirEntity) {
          $("#workDirEntity").val(workDirEntity);
        }

        var workDirTree = $("#workDirTree");
        workDirTree.html("");
        var tree = "";
        var totalFiles = 0,
          totalSize = 0;
        for (const [dirName, stats] of Object.entries(folderTree)) {
          totalFiles += stats.totalFiles;
          totalSize += stats.totalSize;
          tree += folderHtm(rootPath, dirName, stats, newFolders);
        }
        workDirTree.html(tree);

        /*
      $.each(".working-folder input", function() {
		  var local = $(this);
		  
	  });*/

        $("#hotStats")
          .find(".count")
          .text(totalFiles + " files");
        $("#hotStats").find(".size").text(humanFileSize(totalSize));
        onHotScanDone();
      }
    );

    ipcRenderer.on("scan-hot-next", (_, { path }) => {
      console.log(path);
      $("#hotFolders")
        .children()
        .each(function () {
          var folder = $(this);
          var folderIcon = folder.find(".folder-icon");
          if (folder.data("path") == path) {
            folderIcon.addClass("loading");
          } else {
            folderIcon.removeClass("loading");
          }
        });
      $("#scanHotFoldersBtn").find("span").text("Scan Completed!");
      setTimeout(() => {
        onHotScanDone();
      }, 3000);
    });
    ipcRenderer.on("scan-hot-complete", () => {
      $("#scanHotFoldersBtn").find("span").text("Scan Completed!");
      setTimeout(() => {
        onHotScanDone();
      }, 3000);
      $(".folder-icon").removeClass("loading");
    });
  });
});

function getMediadb() {
  var elem = document.getElementById("application");
  return elem.getAttribute("data-mediadbappid");
}
