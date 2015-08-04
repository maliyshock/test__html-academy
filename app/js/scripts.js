$('document').ready(function(){

  $('.js-close').on('click', function () {
    var target = $(this).data('target');
    $(this).parents('.'+target).fadeOut();
  });

  $('.landing__popup').on('click', function(e){
    $(this).fadeOut();
  });


    var mySwiper = new Swiper('.swiper-container', {
        direction: 'horizontal',
        loop: true,
        //autoplay: 5000,
        // Navigation arrows
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev'
    });

});