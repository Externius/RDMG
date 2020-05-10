(function ($) {
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  $("#generateBtn").on("click", function () {
    if ($("#dungeonMap")[0].hasAttribute('hidden')){
      $("#dungeonMap").removeAttr('hidden');
    }

    $(".navbar-nav").find('*').removeAttr("hidden");
    Dungeon.drawDungeonOneCanvas('mapArea', 'dungeonSize', 'roomDensity', 'roomSize', 'trapPercent', 'corridor', 'deadEnd', 'roamingPercent');

    if ($("#dungeonDetails")[0].hasAttribute('hidden')){
      $("#dungeonDetails").removeAttr('hidden');
    }
  });
})(jQuery); 