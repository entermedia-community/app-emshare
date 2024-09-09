jQuery(document).ready(function () {
  var siteroot = $("#application").data("siteroot");
  var mediadb = $("#application").data("mediadbappid");
  var apphome = $("#application").data("apphome");
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
    mediadb:
      window.location.protocol + "//" + window.location.host + "/" + mediadb,
  });

  ipcRenderer.on("set-local-root", (_, localRoot) => {
    $("#application").data("local-root", localRoot);
  });

  ipcRenderer.on("electron-log", (_, ...log) => {
    console.log(
      "%c --- Desktop Log --- ",
      "background: #000000; color: #bada55; font-style: italic"
    );
    if (Array.isArray(log)) {
      log.forEach((l) => {
        console.log(l);
      });
    } else {
      console.log(log);
    }
  });

  ipcRenderer.on("electron-error", (_, ...error) => {
    console.log(
      "%c --- Desktop Error --- ",
      "background: #000000; color: #ba5555; font-style: italic"
    );
    if (Array.isArray(error)) {
      error.forEach((l) => {
        console.error(l);
      });
    } else {
      console.error(error);
    }

    $("#application").append(
      '<div class="alert fader alert-error" role="alert">Desktop Error: Check log for details.</div>'
    );
  });

  function humanFileSize(bytes, htm = false) {
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
    if (htm) return `<b>${bytes.toFixed(1)}</b> ${units[u]}`;
    return bytes.toFixed(1) + units[u];
  }

  ipcRenderer.on("desktopReady", () => {
    lQuery("#relativeLocalRootPath").livequery(function () {
      $(this).val(
        $("#application").data("local-root") +
          $(this).data("modulename") +
          "/" +
          $(this).data("entityname") +
          "/"
      );
    });

    lQuery("#localRootPathInput").livequery(function () {
      $(this).val($("#application").data("local-root"));
    });

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
      var path = $(this).data("path") || $(this).data("localpath");
      if (!path) {
        path =
          $(this).parent().data("path") || $(this).parent().data("localpath");
      }
      if (path) {
        ipcRenderer.send("openFolder", { path });
      }
    });

    var fetchingWorkDir = false;
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
        $("#workDirEntity").trigger("change");
      }
      fetchingWorkDir = false;
    });
    lQuery("#workFolderInput").livequery(function () {
      if (fetchingWorkDir) {
        return;
      }
      var workDir = $(this).val();
      if (!workDir) {
        fetchingWorkDir = true;
        ipcRenderer.send("getWorkDir");
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
        var notifClass = "";
        if (tab === "pull") {
          notifClass = isDl ? "dl" : "";
        } else if (tab === "push") {
          notifClass += isUp || isExtra ? " up" : "";
        }
        console.log({ tab, notifClass });
        tree += `<div style="padding-left: ${padding}px;" class="pull-folder" id="folder-${index}">
        <a href="#"
          class="pullfetchfolder"
          data-tab="${tab}"
          data-categorypath="${path}">
          <i class="bi bi-folder mr-1"></i>
          <span class="mx-1 notif ${notifClass}">${name} <i class="bi bi-circle-fill"></i></span>
          <i class="fas fa-spinner fa-spin text-muted" style="display: none;"></i>
        </a>
      </div>`;
      });
      $("#fetchfolder").html("");
      $(".pullfoldertree").html(tree);
    });

    function fetchFolderFilesList(folder) {
      folder
        .closest(".pullfoldertree")
        .find(".pullfetchfolder")
        .removeClass("current");
      folder.addClass("current");
      var categorypath = folder.data("categorypath");
      var tab = folder.data("tab");
      refreshSync(categorypath, tab);
    }

    lQuery(".pullfetchfolder").livequery("click", function (e) {
      e.preventDefault();
      fetchFolderFilesList($(this));
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

      var mode = pendingPulls.data("mode");
      if (option.downloadCount > 0 && mode === "pull") {
        $("#folder-" + option.index)
          .find(".notif")
          .addClass("dl");
      }

      if (totalDownloadCount > 0 && mode === "pull") {
        pendingPulls.find(".pull-buttons").fadeIn();
      }

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

      if (option.uploadCount > 0 && mode === "push") {
        $("#folder-" + option.index)
          .find(".notif")
          .addClass("up");
      }

      if (totalUploadCount > 0 && mode === "push")
        pendingPulls.find(".push-buttons").fadeIn();
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
        var noUpWarning = pendingPulls.find(".no-up-warning");
        if (noUpWarning.length) noUpWarning.show();
        else pendingPulls.find(".no-upload").show();
      } else {
        pendingPulls.find(".no-upload").hide();
        pendingPulls.find(".no-up-warning").hide();
      }

      var id = pendingPulls.data("entityid");
      if (id) {
        $("#pushlocal-" + id)
          .removeClass("text-success")
          .addClass("text-accent");
        $("#pushlocal-" + id)
          .find("i")
          .attr("class", "bi bi-cloud-arrow-up");
      }
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
      var openedFolder = $(".pullfetchfolder").first();
      fetchFolderFilesList(openedFolder);
      $(".scan-changes").hide();
    }

    lQuery(".scan-changes").livequery("click", function (e) {
      e.preventDefault();
      scanChange();
    });

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

    lQuery("#immediate-download").livequery(function () {
      var categorypath = $(this).data("toplevelcategorypath");
      $(".pullfetchfolder").first().find(".fa-spinner").show();
      ipcRenderer.send("downloadAll", {
        categorypath: categorypath,
        scanOnly: false,
      });
      $(this).remove();
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

    lQuery("#immediate-scan").livequery(function () {
      // var categorypath = $(this).data("toplevelcategorypath");
      // ipcRenderer.send("openFolder", { path: categorypath });
      scanChange();
    });

    lQuery(".upload-push").livequery("click", function (e) {
      e.preventDefault();
      var entityId = $(this).data("entityid");
      var categorypath = $(this).data("categorypath");
      $(".scan-result").hide();
      ipcRenderer.send("uploadAll", {
        categorypath: categorypath,
        entityId: entityId,
      });
    });

    ipcRenderer.on("entity-upload-progress", (_, { id, index, loaded }) => {
      console.log({ id, loaded, index });
      var total = $(".up-count").text();
      $(".up-total").text(total);
      var sp = $(".upload-progress");
      var progress = parseInt(sp.data("progress"));
      if (!progress) progress = 0;
      $(".up-progress").text(humanFileSize(progress + loaded));
      sp.show();
    });

    ipcRenderer.on("entity-upload-next", (_, { index, size }) => {
      $(".pullfoldertree").find(".fa-spinner").hide();
      var folder = $("#folder-" + index);
      if (folder.length === 0) return;
      var sp = $(".upload-progress");
      var progress = parseInt(sp.data("progress"));
      if (!progress) progress = 0;
      progress += size;
      sp.data("progress", progress);
      $(".up-progress").text(humanFileSize(progress));
      folder.find(".fa-spinner").show();
    });

    ipcRenderer.on("upload-error", (_, { id, error }) => {
      var folder = $("#f-" + id);
      if (folder.length === 0) return;
      folder.find(".up-progress").css("width", "0%");
      folder
        .find(".fl")
        .attr("class", "fl fas fa-exclamation-circle text-danger");
      console.error(error);
    });

    ipcRenderer.on("entity-upload-complete", () => {
      $("#sidebarUserUploads").find(".status-circle").remove();
      $(".pullfoldertree").find(".fa-spinner").hide();
      // $(".push-buttons").fadeOut();
      $(".notif").removeClass("up");
      scanChange();
    });

    lQuery("#abortUpload").livequery("click", function (e) {
      e.preventDefault();
      ipcRenderer.send("abortUpload");
    });

    lQuery("#abortAutoUpload").livequery("click", function (e) {
      e.preventDefault();
      ipcRenderer.send("abortAutoUpload");
    });

    ipcRenderer.on("upload-aborted", () => {
      var formData = new FormData();
      formData.append("desktopimportstatus", "upload-aborted");
      formData.append("timestamp", new Date().toISOString());
      uploadInProgress = false;
      desktopImportStatusUpdater(formData);
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

    lQuery(".dir-picker").livequery("click", function (e) {
      e.preventDefault();
      window.postMessage({
        type: "dir-picker",
        targetDiv: $(this).data("target"),
        currentPath: $(this).prev().val(),
      });
    });

    ipcRenderer.on("dir-picked", (_, { targetDiv, path }) => {
      $("#" + targetDiv).val(path);
    });

    lQuery("#changeLocalDirve").livequery("click", function (e) {
      e.preventDefault();
      var selectedPath = $("#localRootPathInput").val();
      ipcRenderer.send("changeLocalDrive", selectedPath);
      closeemdialog($(this).closest(".modal"));
    });

    lQuery("#folderAbsPath").livequery("click", function (e) {
      e.preventDefault();
      window.postMessage({
        type: "select-dirs",
        currentPath: $("#folderAbsPath").val(),
      });
    });

    ipcRenderer.on("selected-dirs", (_, folders) => {
      if (folders.length === 0) return;
      var fileCount = folders.reduce((acc, f) => acc + f.stats.totalFiles, 0);
      var size = folders.reduce((acc, f) => acc + f.stats.totalSize, 0);
      $(".fl-stats").html(
        folders.length +
          " folders selected" +
          " &middot; " +
          fileCount +
          " files (<b>" +
          humanFileSize(size) +
          "</b>)"
      );
      var fp = $(".folder-picker");
      fp.find("input").remove();
      folders.forEach((f) => {
        fp.append(`
          <input type="hidden" name="localpath" value="${f.path}">
          <input type="hidden" name="name.value" value="${f.name}">
          <input type="hidden" name="localsubfoldercount" value="${f.stats.totalFolders}">
          <input type="hidden" name="localitemcount" value="${f.stats.totalFiles}">
          <input type="hidden" name="localtotalsize" value="${f.stats.totalSize}">
        `);
      });
      fp.addClass("picked");
      //test
      var test = fp.parent().serializeArray();
      console.log(test);
    });

    lQuery(".deleteAutoFolder").livequery("click", function () {
      if (
        confirm(
          "Are you sure you want to remove this folder from auto importer?"
        )
      ) {
        var delId = $(this).data("id");
        jQuery
          .ajax({
            method: "DELETE",
            url:
              getMediadb() + "/services/module/desktopsyncfolder/data/" + delId,
          })
          .done(function () {
            $("#wf-" + delId).remove();
          });
      }
    });

    lQuery("#selectedModule").livequery("change", function () {
      var moduleid = $(this).val();
      var data = {
        updateurl: "true",
        oemaxlevel: "4",
      };
      var nextpage = apphome + "/views/modules/" + moduleid + "/index.html";
      jQuery.ajax({
        url: nextpage,
        data: data,
        success: function (res) {
          $("#applicationcontent").replaceWith(res);
          $(window).trigger("resize");
        },
      });
    });

    function getCurrentWorkFolders() {
      var folders = [];
      $(".work-folder").each(function () {
        var id = $(this).data("id");
        var localPath = $(this).data("localpath");
        var categoryPath = $(this).data("categorypath");
        var entityId = $(this).data("entityid");
        folders.push({ id, localPath, categoryPath, entityId });
      });
      return folders;
    }
    var uploadInProgress = false;
    function desktopImportStatusUpdater(formData, callback = null) {
      var moduleid = $("#selectedModule").val();
      if (!moduleid) {
        console.log("No module selected");
        return;
      }
      jQuery
        .ajax({
          url:
            apphome +
            "/views/modules/" +
            moduleid +
            "/components/sidebars/localdrives/updatefolderstatus.html",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          "Content-Type": "multipart/form-data",
        })
        .done(function (res) {
          $("#syncFolderList").html(res);
          if (callback) callback();
        });
    }
    ipcRenderer.on("scan-completed", (_, ids) => {
      var formData = new FormData();
      ids.forEach((id) => {
        formData.append("id", id);
        var folder = $("#wf-" + id);
        folder.find();
      });
      formData.append("desktopimportstatus", "upload-started");
      formData.append("timestamp", new Date().toISOString());
      desktopImportStatusUpdater(formData);
    });

    function verifyAutoUploads() {
      var syncFolders = getCurrentWorkFolders();
      console.log({ syncFolders });
      var formData = new FormData();
      syncFolders.forEach((folder) => {
        formData.append("id", folder.id);
      });
      formData.append("desktopimportstatus", "scan-started");
      formData.append("timestamp", new Date().toISOString());

      console.log("verifyAutoUploads", syncFolders);
      uploadInProgress = true;
      desktopImportStatusUpdater(formData, () => {
        ipcRenderer.send("syncAllFolders", syncFolders);
      });
    }

    lQuery("#syncAllFolders").livequery("click", function () {
      if (uploadInProgress) return;
      verifyAutoUploads();
    });

    lQuery(".import-verify").livequery(function () {
      if ($(this).hasClass("verifynow")) {
        verifyAutoUploads();
      } else if (!uploadInProgress && $(this).hasClass("scan-started")) {
        verifyAutoUploads();
      }
    });

    function updateCounter(size, persist = false) {
      var counter = $(".upload-counter");
      var fileCount = parseInt(counter.data("fileCount"));
      if (isNaN(fileCount)) fileCount = 0;
      var uploadSize = parseInt(counter.data("uploadSize"));
      if (isNaN(uploadSize)) uploadSize = 0;
      uploadSize += size;
      if (persist) {
        fileCount++;
        counter.data("fileCount", fileCount);
        counter.data("uploadSize", uploadSize);
      }
      var readableSize = humanFileSize(uploadSize, true);
      counter.html(`<b>${fileCount}</b> files (${readableSize}) uploaded.`);
    }

    ipcRenderer.on("auto-upload-progress", (_, loaded) => {
      console.log("auto-upload-progress", loaded);
      updateCounter(loaded);
    });

    ipcRenderer.on("auto-upload-next", (_, { id, size }) => {
      console.log("auto-upload-next", id, size);
      $(".fl").attr("class", "fl fas fa-folder");
      $("#wf-" + id)
        .find(".fl")
        .attr("class", "fl fas fa-spinner fa-spin");
      updateCounter(size, true);
    });

    ipcRenderer.on("auto-upload-complete", () => {
      var syncFolders = getCurrentWorkFolders();
      var formData = new FormData();
      syncFolders.forEach((folder) => {
        formData.append("id", folder.id);
      });
      formData.append("desktopimportstatus", "upload-completed");
      formData.append("timestamp", new Date().toISOString());
      uploadInProgress = false;
      desktopImportStatusUpdater(formData);
    });

    ipcRenderer.on("auto-file-added", () => {
      verifyAutoUploads();
    });

    lQuery("#applicationmaincontent").livequery(function () {
      var watches = $(".auto-watch");
      var watchList = [];
      watches.each(function () {
        var id = $(this).data("id");
        var path = $(this).data("categorypath");
        if (path) {
          watchList.push({ id, path });
        }
      });
      ipcRenderer.send("watchFolders", watchList);
    });

    lQuery(".pending-pulls", function () {
      var toplevelcategorypath = $(this).data("toplevelcategorypath");
      var entityid = $(this).data("entityid");
      ipcRenderer.send("watchFolders", [
        {
          id: entityid,
          path: toplevelcategorypath,
        },
      ]);
    });

    ipcRenderer.on("file-added", (_, catPath) => {
      var pendingPulls = $(".pending-pulls");
      if (pendingPulls.length > 0) {
        var path = pendingPulls.data("toplevelcategorypath");
        if (catPath === path) {
          scanChange();
        }
      }
      var watches = $(".auto-watch");
      watches.each(function () {
        var path = $(this).data("categorypath");
        if (path == catPath) {
          var id = $(this).data("id");
          $("#pushlocal-" + id)
            .removeClass("text-accent")
            .addClass("text-success");
          $("#pushlocal-" + id)
            .find("i")
            .attr("class", "bi bi-cloud-arrow-up-fill");
        }
      });
    });
    ipcRenderer.on("file-removed", (_, catPath) => {
      var pendingPulls = $(".pending-pulls");
      if (pendingPulls.length > 0) {
        var path = pendingPulls.data("toplevelcategorypath");
        if (catPath === path) {
          scanChange();
        }
      }
    });
  });
});
function getMediadb() {
  var elem = $("#application");
  return elem.data("siteroot") + "/" + elem.data("mediadbappid");
}
