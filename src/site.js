(function ($) {
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000);
        return false;
      }
    }
  });

  var setCanvasSize = function (canvasDiv, canvasId) {
    var size = Math.round((canvasDiv.width() / 100)) * 100;
    var canvas = document.getElementById(canvasId);
    canvas.width = size;
    canvas.height = size;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  $("#generateBtn").on("click", function () {
    if ($("#dungeonMap")[0].hasAttribute('hidden')) {
      $("#dungeonMap").removeAttr('hidden');
    }

    $(".navbar-nav").find('*').removeAttr("hidden");
    setCanvasSize($("#canvasDiv"), "mapArea");

    if ($("#plainMap").val() === 'true') {
      $("#canvasDivPlain").show();
      setCanvasSize($("#canvasDivPlain"), "mapAreaPlain");
    } else {
      $("#canvasDivPlain").hide();
      $("#download_map_plain").hide();
    }

    Dungeon.drawDungeonOneCanvas('mapArea', 'dungeonSize', 'roomDensity', 'roomSize',
      'trapPercent', 'corridor', 'deadEnd', 'roamingPercent', 'mapAreaPlain', 'plainMap');
    $('html, body').animate({
      scrollTop: ($("#dungeonMap").offset().top)
    }, 1000);

    if ($("#dungeonDetails")[0].hasAttribute('hidden')) {
      $("#dungeonDetails").removeAttr('hidden');
    }
  });
})(jQuery); 