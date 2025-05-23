$(document).ready(function () {
  // $(window).on("resize", function () {
  //   if ($(window).width() > 768) {
  //     if (confirm("Switch to desktop view?")) {
  //       window.location.reload();
  //     }
  //   }
  // });
  lQuery(".entity-tab.current-entity").livequery(function (e) {
    $(this).scrollLeft(0);
  });
});
