$(document).ready(function () {
  // function contrastColor(hex) {
  //   if (hex.indexOf("#") === 0) {
  //     hex = hex.slice(1);
  //   }
  //   if (hex.length === 3) {
  //     hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  //   }
  //   if (hex.length !== 6) {
  //     throw new Error("Invalid HEX color.");
  //   }
  //   var r = parseInt(hex.slice(0, 2), 16),
  //     g = parseInt(hex.slice(2, 4), 16),
  //     b = parseInt(hex.slice(4, 6), 16);
  //   return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#444444" : "#FFFFFF";
  // }
  // lQuery("form#themeeditor").livequery("submit", function (e) {
  //   e.preventDefault();
  //   var form = $(this);
  //   var hoverList = [
  //     "th",
  //     "td",
  //     "nav-btn",
  //     "nav-btn-active",
  //     "tab-btn",
  //     "tab-btn-active",
  //     "btn",
  //     "btn-sec",
  //     "btn-acc",
  //     "btn-cta",
  //   ];
  //   hoverList.forEach(function (inp) {
  //     var bg = $("input.color-picker." + inp).val();
  //     if (bg && bg.length === 7) {
  //       $("input.color-picker." + inp + "-hover").val(lightenHex(bg, 10));
  //     }
  //   });
  //   var td = $("input.td").val();
  //   if (td && td.length === 7) {
  //     $("input.td-stripe").val(lightenHex(td, -5));
  //   }
  //   ["sidebar", "navbar-primary", "navbar-secondary"].forEach(function (inp) {
  //     var bg = $("input." + inp).val();
  //     if (bg && bg.length === 7) {
  //       $("input." + inp + "-text").val(contrastColor(bg));
  //     }
  //   });
  //   form.get(0).submit();
  // });
});
