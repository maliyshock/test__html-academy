$(document).on('zagruzicb', function () {

  //fix bootstrap
  $('.js-close').on('click', function () {
    var target = $(this).data('dismiss');
    $(this).parents('.' + target).fadeOut();
  });

  // глбальные переменные
    var baseurl = graphitusConfig['urlToElastic'];
    var base = graphitusConfig['base'];
    var dashboard = window.location.search.substring(window.location.search.indexOf('?id=') + 4);
    var scrolled;
    var permalink = $('#permalink').attr('href');


    window.graphX = 0;
    window.graphY = 0;
    window.guidesCount = 3;
    window.baseOffsetLinesY = 0;
    window.offsetLinesY = 0;

    window.linkOnClickAttr = $('.wrapper_item .cud').attr('onclick');
    window.widthOfWrapperItem = $('.wrapper_item').width();

  //фикс скрола для FF
  $(document).on('scroll', function () {
    scroll();
  });

  function scroll() {
    scrolled = $(window).scrollTop();
  }

  // считаем координаты по GraphPlace
  $(".wrapper_item .GraphPlace").on("mousemove", function (e) {

    graphX = (e.offsetX || e.clientX - $(e.target).offset().left);

    if (scrolled) {
      graphY = (e.offsetY || e.clientY - $(e.target).offset().top + scrolled);
    }
    else {
      graphY = (e.offsetY || e.clientY - $(e.target).offset().top);
    }

    coordSys = $(this).parent().parent();

    $(".guide-x").css("top", graphY);
    $(".guide-y").css("left", graphX);
  });

  $('input, button').on('focus', function () {
    if (!($(this).parents('popupMessage'))) {
      $(".guide-x").fadeOut();
      $(".guide-y").fadeOut();
      $('.GraphPlace').addClass('none')
    }

  });

  var Helpers = {
    Graph: function (id) {
      this.id = id;
      var Exemplar = this,
          JQthis = $(this),
          linkId = $('#'+id).find('.cud').attr('id'),
          Pie = false,
          CanvasWithImg,
          imgWidth,
          imgHeight,
          CanvasHeight,
          CanvasWidth,
          BaseCanvasId,
          afterTarget,
          graphicStart,
          Img,                    //объект img
          Title,
          imgSrc,
          y0st = 25,
          x0st = 635,
          secondsOnPixel,
          curTime,
          timeInterval,
          massiv = [],            // массив значений координат отметок
          startGraphicInTime,
          timeValue;


      // сет и гет канвас
      this.SetCanvas = function (ctx) {
        CanvasWithImg = ctx;
      };

      this.GetCanvas = function () {
        return CanvasWithImg;

      };


      //-----------------------------------------------------
      //                     где же график?
      //-----------------------------------------------------
      // создаём конвас объект и запихиваем в него картинку, предварительно закодировав её
      this.graphCanvas = function (url, outputFormat, idCurrentCanvas) {
        console.log('graphCanvas');
        var canvas = document.getElementById(idCurrentCanvas);
        var ctx = canvas.getContext('2d'),
            img = new Image(imgWidth, imgHeight);
            img.crossOrigin = 'Anonymous';

            $(img).load(function () {
                  var dataURL;
                  canvas.height = imgHeight;
                  canvas.width = imgWidth;


                  // это в закодированном виде картинка, но почему-то нигде не используется почему-то
                  dataURL = canvas.toDataURL(outputFormat);

                  ctx.drawImage(img, 0, 0);

                  Exemplar.SetCanvas(ctx);

                  JQthis.trigger('drawLitleCanvas');
                  canvas = null;
              });

          img.src = url;
      };



      // определяем начальные координаты
      this.whereGraphicIsStart = function () {
      console.log('whereGraphicIsStart');

        //отступы по вертикали
        var y0 = Exemplar.vertical(x0st, 1, imgHeight);

        var y1 = Exemplar.vertical(x0st, -1, imgHeight) + 1;


        //горизонтальные отступы
        var x0 = Exemplar.horizontal(y0st, 1, imgWidth);

        var x1 = Exemplar.horizontal(y0st, -1, imgWidth) + 1;


        var height = y1 - y0;
        var width = x1 - x0;


        return {'x0': x0, 'y0': y0, 'height': height, 'width': width};

      };


      // возвращает цвет rgb по точке
      this.imageData = function (x, y, width, height) {
        var result = Exemplar.GetCanvas().getImageData(x, y, width, height).data;

        //console.log(result);

        return result;

      };


      // проходимся по горизонтальной оси, дабы найти точки пересечения с графиком
      this.horizontal = function (y0st, step, extremeValue) {
        var i = 0, value;

        //если идём в противоположную сторону
        if (step < 0) {
          i = extremeValue;
        }

        do {
          i = i + step;
          var currentPositionX = Exemplar.imageData(i, y0st, 1, 1);

          value = i;

        }
        while ((currentPositionX[0] == currentPositionX[1]) && (currentPositionX[1] == currentPositionX[2]));

        return value;

      };


      // проходимся по вертикальной оси, дабы найти точки пересечения с графиком
      this.vertical = function (x0st, step, extremeValue) {

        var i = 0, value;

        //если идём в противоположную сторону
        if (step < 0) {
          i = extremeValue;
        }

        do {
          i = i + step;

          var currentPositionY = Exemplar.imageData(x0st, i, 1, 1);

          value = i;


        }
        while ((currentPositionY[0] == currentPositionY[1]) && (currentPositionY[1] == currentPositionY[2]));


        return value;

      };

      // разбиваем урл и находим переменные и значения отвечающие за время
      function timeBack(afterTarget) {
        //парсим каждый урл
        var massiv = afterTarget.split('&');

        var Summary = {};
        for (var piece in massiv) {
          var keyValue = massiv[piece].split('=');
          Summary[keyValue[0]] = decodeURIComponent(keyValue[1]);
        }

        var timeBack = /([-0-9]+)([\w]+)/.exec(Summary['from']);
        return timeBack;
      };


      this.getCurrentTime = function () {
        // берём значение
        var timeValueMeasures = timeBack(afterTarget)[1];

        // определяем минуты или часы. не забываем что значение отричательное
        timeValue = timeBack(afterTarget)[2];


        // проверка на часы или минуты. задаём значение в секундах
        // полученное значение является велечиной сдвига от текущего времени до начала координат, т.е. временнной диапазон графика
        if (timeBack(afterTarget)[2] == 'minutes') {
          timeInterval = timeValueMeasures * 1000 * 60;
        }
        else {
          timeInterval = timeValueMeasures * 1000 * 60 * 60;
        }

        curTime = new Date();
        curTime = Date.parse(curTime);

        secondsOnPixel = Math.abs(timeInterval / graphicStart['width']);
        startGraphicInTime = curTime + timeInterval;
      };

      this.utcTime = function (miliseconds) {
        var time = new Date(miliseconds);
        var getUTCDate = time.toString();
        return getUTCDate;
      };


      //**временная функция, трансформирует координаты в значения по времени
      this.TransformCoordsToTime = function (value1, value2) {

        Exemplar.getCurrentTime();


        var x1InTime = startGraphicInTime + value1 * secondsOnPixel;
        var x2InTime = startGraphicInTime + value2 * secondsOnPixel;


        return [x1InTime, x2InTime];

      };


      //**временная функция, трансформирует время в пикселы
      this.TransformTimeToCoords = function (value1, value2) {

        Exemplar.getCurrentTime();

        var x1InPixel = (value1 - startGraphicInTime) / secondsOnPixel;
        var x2InPixel = (value2 - startGraphicInTime) / secondsOnPixel;

        return [x1InPixel, x2InPixel];
      };


//функция отвечает за выделение в области графика
      var objectDuraFct = function (obj) {
        var res = {};
        var i = 0;
        var monitor = obj.siblings('.guidesMonitor');
        var duraOffsetX2;
        var startFromRight;
        var curItem = $("#" + id);

        res.selectionX1 = null;
        res.selectionX2 = null;


        var render = function (left) {
          i++;
          monitor.append("<div style='left:" + left + "px;' class='selection selection" + i + "'><div class='otrezokX1'></div><div class='otrezokX2'></div></div>");
        };

        var changeRender = function (width, right, left) {
          monitor.find(".selection" + i).css({
            'width': width,
            'right': right,
            'left': left,
            'display': 'block'
          })
        };

        res.onMouseDown = function (e) {
          e.preventDefault();
          e.stopPropagation();

          obj.on('mousemove', res.onMouseMove);

          //определили первую координату
          res.selectionX1 = (e.offsetX || e.clientX - $(e.target).offset().left);
          render(res.selectionX1);
        };

        res.onMouseMove = function (e) {


          if (res.selectionX1) {
            duraOffsetX2 = (e.offsetX || e.clientX - $(e.target).offset().left);

            // ширина выделения
            var SelectionWidth = duraOffsetX2 - res.selectionX1;

            // ширина выделения по модулю
            var SelectionModuleWidth = Math.abs(SelectionWidth);


            //если выделяем в обратную сторону справа налево
            if (SelectionWidth + res.selectionX1 < res.selectionX1) {

              // определяем откуда начинается рендер
              startFromRight = graphicStart['width'] - res.selectionX1;

              //инвертируем координаты в пространстве
              res.selectionX2 = graphicStart['width'] - startFromRight;


              changeRender(SelectionModuleWidth + 'px', startFromRight + 'px', 'auto');
            }

            //если выделяем как обычно слева направа, то всё заебись
            else {
              res.selectionX2 = SelectionModuleWidth + res.selectionX1;


              changeRender(SelectionModuleWidth + 'px', 'auto', res.selectionX1 + 'px');
            }
          }

        };

        res.onMouseUp = function (e) {
          e.preventDefault();
          e.stopPropagation();
          var curItem = $('#' + id);

          obj.off('mousemove', res.onMouseMove);

          if (startFromRight) {
            massiv.push({selectionX1: res.selectionX2, selectionX2: duraOffsetX2});
          }
          else {
            massiv.push({selectionX1: res.selectionX1, selectionX2: res.selectionX2});
          }


          // показать добавить коммент?
          showPopup(massiv[i - 1]['selectionX2'], id, 'popupMessage');
        };

        curItem.find('.js-addCommentSelection').on('click', function () {
          massiv[i - 1]['comment'] = curItem.find('.popupMessage textarea').val();

          var cordsInTime = Exemplar.TransformCoordsToTime(massiv[i - 1]['selectionX1'], massiv[i - 1]['selectionX2']);

          Exemplar.AddSection(baseurl, 'test/', dashboard, Title, id, afterTarget, permalink, curTime, cordsInTime[0], cordsInTime[1], i, massiv[i - 1]['comment']);

          $(this).parents('.popupMessage').fadeOut();
        });


        obj.on('mousedown', res.onMouseDown);
        obj.on('mouseup', res.onMouseUp);
        return res;
      };

      var addSelection = function () {

      };


      // показать окошко с формой
      var showPopup = function (startCoord, idWhereRender, whatShow) {
        $('#' + idWhereRender).find('.' + whatShow).css({'left': startCoord + 'px'}).fadeIn();
      };


      //-----------------------------------------------------
      //                     функции работы с базой
      //-----------------------------------------------------

      this.AddSection = function (baseurl, base, dashboard, title, curItem, target, permalink, curTime, offsetX1, offsetX2, i, comment) {
        $.ajax({
          type: "POST",
          url: baseurl + base + dashboard,
          data: JSON.stringify({
            "title": title,
            "curItem": curItem,
            "target": target,
            "permalink": permalink,
            "offsetX1": offsetX1,
            "offsetX2": offsetX2,
            "sectionNumber": i,
            "comment": comment
          }),
          crossDomain: true,
          dataType: 'json',
          success: function (data) {
          }
        });
      };//add section

      this.draw = function (data) {
      };

      this.leftSideIsExist = function (data, timeFrom) {
        for (var key in data['hits']['hits']) {
          var val = data['hits']['hits'][key]['_source']['offsetX1'];
          if (val > timeFrom) {
            data['hits']['hits'][key]['_source']['leftsideExist'] = true;
          }
          else {
            data['hits']['hits'][key]['_source']['leftsideExist'] = false;
          }
        }
        return data;
      };


      this.draw = function (data) {
        var curItem = $("#" + Exemplar['id']);
        var guidesMonitor = curItem.find('.guidesMonitor');
        var selection = guidesMonitor.find('.selection');

        for (var key in data['hits']['hits']) {
          guidesMonitor.append("<div class='selection selection" + key + "'>" +
          "<div class='comment'></div>" +
          "<div class='otrezokX1'></div>" +
          "<div class='otrezokX2'></div>" +
          "</div>");


          var position = Exemplar.TransformTimeToCoords(data['hits']['hits'][key]['_source']['offsetX1'], data['hits']['hits'][key]['_source']['offsetX2']);

          var left = position[0];
          var right = position[1];
          var width = right - left;


          guidesMonitor.find('.selection' + key).css({"left": left + 'px', "width": width + "px"});
          guidesMonitor.find('.selection' + key + ' .comment').html('<p>' + data['hits']['hits'][key]['_source']['comment'] + '</p>');
          guidesMonitor.css({"display": "block"})
        }


      };

      this.GetSection = function (baseurl, base, dashboard, curTime, timeFrom, curItem) {
        console.log();

        $.ajax({
          type: "POST",
          url: baseurl + base + dashboard + '/_search',
          crossDomain: true,
          data: JSON.stringify({

            "query": {
              "filtered": {
                "query": {
                  "match": {"curItem": curItem}
                },
                "filter": {
                  "or": [{
                    "range": {
                      "offsetX1": {
                        "gt": timeFrom,
                        "lt": curTime
                      }
                    }
                  },
                    {
                      "range": {
                        "offsetX2": {
                          "gt": timeFrom,
                          "lt": curTime
                        }
                      }
                    }
                  ]
                }
              }
            }

          }),
          success: function (data) {

            var dataWithLeftSide = Exemplar.leftSideIsExist(data, timeFrom);
            Exemplar.draw(dataWithLeftSide);
            console.log(data);

          }
        });
      }; //get section


      // доработать - выовод всех отрезков со всех дашбордов за время
      this.GetAllSections = function (baseurl, base, curTime, timeFrom) {

        $.ajax({
          type: "POST",
          url: baseurl + base + '/_search',
          crossDomain: true,
          data: JSON.stringify({

            "query": {
              "filter": {
                "or": [{
                  "range": {
                    "offsetX1": {
                      "gt": timeFrom,
                      "lt": curTime
                    }
                  }
                },
                  {
                    "range": {
                      "offsetX2": {
                        "gt": timeFrom,
                        "lt": curTime
                      }
                    }
                  }
                ]
              }
            }

          }),
          success: function (data) {

            var dataWithLeftSide = Exemplar.leftSideIsExist(data, timeFrom);
            Exemplar.draw(dataWithLeftSide);
            console.log(data);

          }
        });
      }; //GetAllSections



      this.UpdateSection = function (offsetX1, offsetY1, offsetX2, offsetY2, timeFrom, timeTo, baseurl, base, dashboard, id) {
        $.ajax({
          type: "POST",
          url: "http://192.168.20.68:9200/test/type1/",
          data: JSON.stringify({
            "id": "5",
            "offsetX1": 35,
            "offsetY1": 65,
            "offsetX2": 115,
            "offsetY2": 21
          }),
          crossDomain: true,
          dataType: 'json',
          success: function (data) {
          }
        });
      }; //Update

      this.DelSection = function (baseurl, base) {
        $.ajax({
          type: "DELETE",
          url: baseurl + base,
          data: JSON.stringify({
            //"_id" : id
          }),
          crossDomain: true,
          dataType: 'json',
          success: function (data) {
          }
        });
      };//DelSection


      Init = function (id) {
        var curItem = $("#" + id);

        Img = curItem.find('.img-rounded');

        //определяем тайтул
        Title = curItem.find('.graphtitle').text();

        //определяем базовый холст
        BaseCanvasId = curItem.find('.img-rounded').siblings('canvas').attr('id');

        // определяем путь картинки
        imgSrc = Img.attr('src');
        afterTarget = imgSrc.substring(imgSrc.indexOf('?target=') + 8);

        if (imgSrc.indexOf('graphType=pie') == -1) {

          var graphPlace = curItem.find('.GraphPlace');

          $(document).on('imgLoad', function () {

            //проверка на то действительно пришла ли картинка или это пиздёшь?
            if ( (Img.width()>0) && (Img.height()>0) )
            {
              console.log('Начни хуячить!');
              imgWidth = Img.width();
              imgHeight = Img.height();
              Exemplar.graphCanvas(imgSrc, 'image/png', BaseCanvasId);
            }

          });



            JQthis.on("drawLitleCanvas", function () {
            console.log('drawLitleCanvas');

            //подсчёт координат начал графика
            graphicStart = Exemplar.whereGraphicIsStart(CanvasWithImg);
              console.log(graphicStart);

            if ($("." + id + "GraphPlace").length < 1) {

              //рендер графика
              curItem.find('.GraphPlace').css({
                'width': graphicStart["width"] + 'px',
                'height': graphicStart["height"] + 'px',
                'left': graphicStart["x0"] + 'px',
                'top': graphicStart["y0"] + 'px'
              }).addClass(id + 'GraphPlace');

              //создаём дубликат
              graphPlace.after("<div class='guidesMonitor' style='width:" + graphicStart['width'] + "px; height:" + graphicStart['height'] + "px;   left:" + graphicStart['x0'] + "px; top:" + graphicStart['y0'] + "px;' class='GraphPlace " + id + "GraphPlace'><div class='guide-x dn'></div><div class='guide-y dn'></div> </div>");

              //показываем что можно работать
              curItem.addClass('already');
              //Exemplar.DelSection(baseurl, 'test/');



              Exemplar.getCurrentTime();


              Exemplar.GetSection(baseurl, 'test/', dashboard, curTime, startGraphicInTime, id);
              //Exemplar.timeFunc();

              $('#'+id+' .js-show-all-on-all').on('click', function () {
                console.log(curTime);
                console.log(startGraphicInTime);

                Exemplar.GetAllSections(baseurl, 'test',  curTime, startGraphicInTime);
              });

              //определяем выделение
              objectDuraFct(graphPlace);
            }
          });
        }
      };

      Init(id);

      //return this;

    }// graph


  };//helpers


  $('.wrapper_item').each(function () {
    var id = $(this).attr('id');
    var item = new Helpers.Graph(id);

  });


//on zagruzilosb
}).keydown(function (e) {

  function showLines(direction, offsetValue) {

    $(".guide-y").remove();

    // основная позиция - не меняется
    $(".wrapper_item .guidesMonitor").append('<div style="left:' + graphX + 'px;" class="guide-y"></div>');
    if (!($(".guide-x").is(':visible') )) {
      $(".guide-x").fadeIn();
    }

    // базовое смещение в 30%
    baseOffsetLinesY = widthOfWrapperItem / 3;

    // ограничение слева
    if ((baseOffsetLinesY + offsetLinesY) < 20) {
      if (e.keyCode == 39) {
        offsetLinesY = offsetLinesY + offsetValue;
      }
      else {
        offsetLinesY = offsetLinesY;
      }
    }
    else {
      offsetLinesY = offsetLinesY + offsetValue * direction;
    }


    for (var i = 1; i < guidesCount; i++) {
      var distance = baseOffsetLinesY * i + offsetLinesY * i;

      //вправо
      $(".wrapper_item .guidesMonitor").append('<div style="left:' + graphX + 'px; margin-left:' + ( distance) + 'px" class="guide-y"></div>');

      //влево
      $(".wrapper_item .guidesMonitor").append('<div style="left:' + graphX + 'px; margin-left:' + (-distance) + 'px" class="guide-y"></div>');
    }

    guidesCount = Math.round(widthOfWrapperItem / (baseOffsetLinesY + offsetLinesY));

  }

  function checkMonVisibility(obj) {
    if (!(obj.is(':visible') )) {
      obj.removeClass('none');
    }
  }

  function checkVisibility(obj) {
    if ((obj.is(':visible') )) {
      return true;
    }
    else {
      return false;
    }
  }

  function checkFocus(obj) {
    if (( obj.is(':focus') )) {
      return true;
    }
    else {
      return false;
    }
  }


  switch (e.keyCode) {

    //S - show
    case 83:
      $(".guide-x").fadeToggle();
      $(".guide-y").fadeToggle();
      $('.GraphPlace').toggleClass('none');

      var link = $('.wrapper_item .cud');

      if (!( $('.GraphPlace').hasClass('none'))) {
        link.attr('onclick', '');
      }
      else {
        link.attr('onclick', linkOnClickAttr)
      }
      break;

    // ESC
    case 27:
      if (guidesCount > 1) {
        $(".guide-y").remove();
        guidesCount = 1;
        $(".wrapper_item .guidesMonitor").append('<div style="left:' + graphX + 'px;" class="guide-y"></div>');
      }
      else if (guidesCount == 1) {
        if (( $(".guide-x").is(':visible') ) && ( $(".guide-x").is(':visible') )) {
          $(".guide-x").fadeOut();
          $(".guide-y").fadeOut();
          $('.guidesMonitor').addClass('none')
        }

      }
      break;

    // влево
    case 37:
      if (checkVisibility($(".guide-y"))) {
        showLines(-1, 10);
        checkMonVisibility($('.guidesMonitor'));
      }
      break;

    // вправо
    case 39:

      if (checkVisibility($(".guide-y"))) {
        showLines(1, 10);
        checkMonVisibility($('.guidesMonitor'));
      }
      break;

    // вверх
    case 38:
      if (checkVisibility($(".guide-y"))) {
        e.preventDefault();
        showLines(1, 1);
        checkMonVisibility($('.guidesMonitor'));
      }
      break;

    //вниз
    case 40:
      if (checkVisibility($(".guide-y"))) {
        e.preventDefault();
        showLines(-1, 1);
        checkMonVisibility($('.guidesMonitor'));
      }
      break;

    default :
      break;
  }


});//on zagruzilosb

