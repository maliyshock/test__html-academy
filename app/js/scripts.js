$('document').ready(function(){

  $('.js-close').on('click', function () {
    var target = $(this).data('target');
    $(this).parents('.'+target).fadeOut();
  });

  $('.landing__popup').on('click', function(e){
    $(this).fadeOut();
  });

  $('.registration--popup').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
  });


  $('.js-early-reg').on('click', function (e) {
    e.preventDefault();
    $('.js-registration-popup').fadeIn();
  });

  /*костыль для полноэкранногго видео*/
  var video = $('.js-video'),
      k=1075/1920;

  chSize();

  $( window ).resize( function (){
      chSize();
    }
  );

  function chSize ( )
  {
    var w = $( document ).width(),
        h = $( document ).height(),
        lte = (h/w > k);

    if (lte){
      video.css( 'width', h / k );
      video.css( 'height','auto' );
    }
    else{
      video.css( 'width','auto');
      video.css( 'height', w * k );
    }
  } //chsize

  $('.js-registration').on('click', function(){
    $('.error').fadeIn();
  });

  $('.error').on('mouseenter', function () {
    $(this).fadeOut();
  });


  $(document).on('imgLoad', function () {
    //слайдер
    var autoplay = false;
    var bullets = false;


    // подсчёт количества слайдов
    var length = $(".js-frame").size();



    // ширина одного сдайжа
    var frameWrapperWidth =  $('#js-first-slide').width();

    // путь до родительского контейнера слайдов
    var frameWrapper = $(".js-frame-wrapper");

    // текущее состояние
    var position = 0;

    var backward = $(".js-backward");
    var forward = $(".js-forward");

    // функция проверки кнопок на крайние значения
    var toggleDisable = function (btn, isDisable) {
      if (isDisable) {
        btn.addClass("disabled");
      } else {
        btn.removeClass("disabled");
      }
    };

    // фактори для возврата функцией самой себя
    function intervals(value) {
      return function () {
        if (value == length - 1) {
          value = 0;
        }
        else {
          value = value + 1;
        }
        animate(value);
      }
    }

    function animate(value) {
      // анимируем слайд
      frameWrapper.animate({left: -value * frameWrapperWidth + 'px'}, 300);

      //проверка на крайние значения чтобы заблокировать кнопки для пользователя
      toggleDisable(forward, value == length - 1);
      toggleDisable(backward, value == 0);

      $("#js-rotator .bullet").removeClass("current");
      $("#js-rotator .bullet").eq(value).addClass("current");

      position = value;
    }


    //если существуют булеты
    if (bullets)
    {
      $(".navigate a").remove();
      for (var i=0 ; i<length ; i++ )
      {
        if (i==0)
        {
          $(".navigate").append("<a href='#' class='bullet current'></a>");
        }
        else
        {
          $(".navigate").append("<a href='#' class='bullet'></a>");
        }
      }

      $("#rotator .bullet").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearInterval(interval);

        position = $(this).index();

        $("#rotator .bullet").removeClass("current");
        $(this).addClass("current");

        animate(position);
      });
    }

    // задаём ширину родительского контейнера для слайдов
    $("#js-rotator .js-frame-wrapper").width(frameWrapperWidth * length);

    // по клику анимируем слайды
    $(".js-rotator-button").on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearInterval(interval);

      if (($(this).hasClass("js-forward")) && (position < length - 1)) {
        position = position + 1;
        animate(position);
      }

      if (($(this).hasClass("js-backward")) && (position > 0)) {
        position = position - 1;
        animate(position);
      }
    });

    // в случае если включен автоплей
    if (autoplay == true) {
      var interval;

      // останавливаем слайдер при хувере
      $("#rotator, #rotator .bullet").hover(function () {
        clearInterval(interval);
      }, function () {
        clearInterval(interval);
        interval = setInterval(function(){
          intervals(position)();
        }, 5000);
      });


      interval = setInterval(function(){
        intervals(position)();
      }, 5000);
    }


    $('.js-frame').on('click', function(e){
      e.preventDefault();
      e.stopPropagation();

      var src = $(this).attr('src');

      $('.js-screens-popup').fadeIn();
      $('.js-screens-popup .popup__inner').find('.popup__img').remove();
      $('.js-screens-popup .popup__inner').append('<img src="'+src+'" class="popup__img" />')
    });



    $('.js-info').on('click', function(e){
        e.preventDefault();
        e.stopPropagation();

      $('.js-popup-info').fadeIn();
    });

    $('.landing').on('click', function(){
      $('.js-popup-info').fadeOut();
    });


    function addBg(){
      $('body').addClass('bg');
    }

    Modernizr.load({
      test: Modernizr.video,
      nope: addBg()
    });


  }); //onimgload
});