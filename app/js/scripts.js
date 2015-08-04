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

    //~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~   попап    ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
    $('.js-close').on('click', function(){
        var target = $(this).data('target');
        $('.'+target).fadeOut();

        //TweenMax.to(parent, 1, { ease:  Sine.easeIn, left: '100%'  });
    });

    $('.js-popup-open').on('click', function(e){
        e.preventDefault();
        var target = $(this).data('target');
        //TweenMax.to('.'+target, 1, { ease:  Sine.easeOut, left: '0%'  });
        $('.'+target).fadeIn();
    });

});