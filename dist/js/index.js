$(function(){
  let maskCanvas;
  const $canvas = $('#canvas');
  const $htmlCanvas = $('#html-canvas');
  const $canvasContainer = $('#canvas-container');


  /**
   * By Ken Fyrstenberg Nilsen
   *
   * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
   *
   * If image and context are only arguments rectangle will equal canvas
   */
  function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
      x = y = 0;
      w = ctx.canvas.width;
      h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
      ih = img.height,
      r = Math.min(w / iw, h / ih),
      nw = iw * r,   // new prop. width
      nh = ih * r,   // new prop. height
      cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
  }


  const $box = $('<div id="box" hidden />');
  $canvasContainer.append($box);
  window.drawBox = function drawBox(item, dimension) {
    if (!dimension) {
      $box.prop('hidden', true);

      return;
    }

    const dppx = ('devicePixelRatio' in window) ? window.devicePixelRatio : 1;

    $box.prop('hidden', false);
    $box.css({
      left: dimension.x / dppx + 'px',
      top: dimension.y / dppx + 'px',
      width: dimension.w / dppx + 'px',
      height: dimension.h / dppx + 'px'
    });
  };

  maskCanvas = null;

  const url = 'img/dog-phrase2.png';
  const img = new Image();
  img.src = url;

  img.onload = function readPixels() {
    window.URL.revokeObjectURL(url);

    maskCanvas = document.createElement('canvas');
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;

    const ctx = maskCanvas.getContext('2d');
    //drawImageProp(ctx, img, 0, 0, img.width, img.height);
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const imageData = ctx.getImageData(
      0, 0, maskCanvas.width, maskCanvas.height);
    const newImageData = ctx.createImageData(imageData);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const tone = imageData.data[i] +
        imageData.data[i + 1] +
        imageData.data[i + 2];
      const alpha = imageData.data[i + 3];

      if (alpha < 128 || tone > 128 * 3) {
        // Area not to draw
        newImageData.data[i] =
          newImageData.data[i + 1] =
            newImageData.data[i + 2] = 255;
        newImageData.data[i + 3] = 0;
      } else {
        // Area to draw
        newImageData.data[i] =
          newImageData.data[i + 1] =
            newImageData.data[i + 2] = 0;
        newImageData.data[i + 3] = 255;
      }
    }

    ctx.putImageData(newImageData, 0, 0);
    //console.log(maskCanvas);
    run();
  };

  const run = function run() {


    $('#search-control').on('keyup',function() {
      $('#search-control').trigger('highlight.clear');
      const query = $(this).val().trim();
      if (query.length > 0){
        $('#html-canvas').find('span, a').each((i, el)=>{
          if ($(el).text().includes(query)){
            $(el).addClass('highlighted');
          }
        });
      }



    });
    $('#search-control').on('highlight.clear',function() {
      $('#html-canvas').find('span.highlighted, a.highlighted').removeClass('highlighted');
    });



    const devicePixelRatio = 1; //('devicePixelRatio' in window) ? window.devicePixelRatio : 1;

    // Set the width and height
    const width = $('#canvas-container').width();
    const height = Math.floor(width * 0.65);
    let pixelWidth = width;
    let pixelHeight = height;

    if (devicePixelRatio !== 1) {
      $canvas.css({'width': width + 'px', 'height': height + 'px'});

      pixelWidth *= devicePixelRatio;
      pixelHeight *= devicePixelRatio;
    } else {
      $canvas.css({'width': '', 'height': '' });
    }

    $canvas.attr('width', pixelWidth);
    $canvas.attr('height', pixelHeight);

    $htmlCanvas.css({'width': pixelWidth + 'px', 'height': pixelHeight + 'px'});

    // Set the options object
    let options = {
      gridSize: 8,
      weightFactor: function (size) {
        return Math.pow(size, 2.3) * $('#canvas').width() / 1024;
      },
      fontFamily: 'Times, serif',
      color: function (word, weight) {
        return (weight === 4) ? '#efedaf' : '#ffffff';
      },
      rotateRatio: 0.5,
      rotationSteps: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      list: (function generateLoveList() {
        let nums = [4, 3, 3, 3, 3, 2, 2, 2, 2];
        // This list of the word "Love" in language of the world was taken from
        // the Language links of entry "Love" in English Wikipedia, with duplicate
        // spelling removed.
        const words = ('Liebe @Liebe, Lufu @Lufu,حب,Aimor @Aimor,Amor @Amor,Heyran @Heyran,ভালোবাসা,Каханне,Любоў,Любов,བརྩེ་དུང་།,' +
        'Ljubav,Karantez,Юрату,Láska,Amore,Cariad,Kærlighed,Armastus,Αγάπη,Amo,Amol,Maitasun,' +
        'عشق,Pyar,Amour,Leafde,Gràdh,愛,爱,પ્રેમ,사랑,Սեր,Ihunanya,Cinta,ᑕᑯᑦᓱᒍᓱᑉᐳᖅ,Ást,אהבה,' +
        'ಪ್ರೀತಿ,სიყვარული,Махаббат,Pendo,Сүйүү,Mīlestība,Meilė,Leefde,Bolingo,Szerelem,' +
        'Љубов,സ്നേഹം,Imħabba,प्रेम,Ái,Хайр,အချစ်,Tlazohtiliztli,Liefde,माया,मतिना,' +
        'Kjærlighet,Kjærleik,ପ୍ରେମ,Sevgi,ਪਿਆਰ,پیار,Miłość,Leevde,Dragoste,' +
        'Khuyay,Любовь,Таптал,Dashuria,Amuri,ආදරය,Ljubezen,Jaceyl,خۆشەویستی,Љубав,Rakkaus,' +
        'Kärlek,Pag-ibig,காதல்,ప్రేమ,ความรัก,Ишқ,Aşk,محبت,Tình').split(',');


        return nums.reduce((arr, weight) =>{
          arr.push(...words.map((string) =>{
            const parts = string.split(' ');
            if (parts.length > 1){
              return [parts[0], weight, parts[1]];
            } else {
              return [string, weight];
            }
          }));
          return arr;
        }, []);
      })(),
      shape: 'square'
      // click: function(item, dimension, event){
      //   console.log(item);
      //   if (item[2]){
      //     $(`a[href="${item[2]}"]`)[0].click();
      //   }
      //
      // }
    };
    // console.log(options);

    // Set devicePixelRatio options
    if (devicePixelRatio !== 1) {
      if (!('gridSize' in options)) {
        options.gridSize = 8;
      }
      options.gridSize *= devicePixelRatio;

      if (options.origin) {
        if (typeof options.origin[0] == 'number')
          options.origin[0] *= devicePixelRatio;
        if (typeof options.origin[1] == 'number')
          options.origin[1] *= devicePixelRatio;
      }

      if (!('weightFactor' in options)) {
        options.weightFactor = 1;
      }
      if (typeof options.weightFactor == 'function') {
        const origWeightFactor = options.weightFactor;
        options.weightFactor =
          function weightFactorDevicePixelRatioWrap() {
            return origWeightFactor.apply(this, arguments) * devicePixelRatio;
          };
      } else {
        options.weightFactor *= devicePixelRatio;
      }
    }
    // console.log(maskCanvas);
    if (maskCanvas) {
      options.clearCanvas = false;

      /* Determine bgPixel by creating
       another canvas and fill the specified background color. */
      const bctx = document.createElement('canvas').getContext('2d');

      bctx.fillStyle = options.backgroundColor || '#fff';
      bctx.fillRect(0, 0, 1, 1);
      const bgPixel = bctx.getImageData(0, 0, 1, 1).data;

      let maskCanvasScaled =
        document.createElement('canvas');
      maskCanvasScaled.width = $canvas[0].width;
      maskCanvasScaled.height = $canvas[0].height;
      let ctx = maskCanvasScaled.getContext('2d');

      ctx.drawImage(maskCanvas,
        0, 0, maskCanvas.width, maskCanvas.height,
        0, 0, maskCanvasScaled.width, maskCanvasScaled.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newImageData = ctx.createImageData(imageData);
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > 128) {
          newImageData.data[i] = bgPixel[0];
          newImageData.data[i + 1] = bgPixel[1];
          newImageData.data[i + 2] = bgPixel[2];
          newImageData.data[i + 3] = bgPixel[3];
        } else {
          // This color must not be the same w/ the bgPixel.
          newImageData.data[i] = bgPixel[0];
          newImageData.data[i + 1] = bgPixel[1];
          newImageData.data[i + 2] = bgPixel[2];
          newImageData.data[i + 3] = bgPixel[3] ? (bgPixel[3] - 1) : 0;
        }
      }

      ctx.putImageData(newImageData, 0, 0);

      ctx = $canvas[0].getContext('2d');
      ctx.drawImage(maskCanvasScaled, 0, 0);
    }

    // Always manually clean up the html output
    if (!options.clearCanvas) {
      $htmlCanvas.empty();
      $htmlCanvas.css('background-color', options.backgroundColor || '#fff');
    }

    // All set, call the WordCloud()
    // Order matters here because the HTML canvas might by
    // set to display: none.
    WordCloud([$canvas[0], $htmlCanvas[0]], options);
    // $canvas.addClass('hide');
    // $htmlCanvas.removeClass('hide');
  };


});