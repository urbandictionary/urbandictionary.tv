var view = {};

view.redraw = function() {
  var min_height = 500;
  $('#player').height(min_height);

  if ($(window).height() > min_height + 75 + $('#bottom').height()) {
    $('#player').height($(window).height() - $('#bottom').height() - 115);
  }

  if ($(window).height() < $('#player').height() + 75) {
    $('#player').height($(window).height() - 75);
  }

  if ($('.overlay').is(":visible") && !jQuery.browser.mozilla) {
    $(document.body).addClass("crop");
  }
  else {
    $(document.body).removeClass("crop");
  }

  $('.overlay').css("top", "75px");
  $('.overlay').height($(window).height() - 75);
  $('.overlay').width($(window).width());
};

view.showDefinitionOverlay = function(word, def) {
  if (!jQuery.browser.mozilla)
    $(document.body).addClass("crop");

  document.body.scrollTop = 0;

  $('#word_overlay, #word_overlay .word, #word_overlay .definition').show();
  $('#word_overlay .word').text(word);
  printBrackets(def, $('#word_overlay .definition').empty());

  $('#word_overlay .wrap')[0].style.marginTop = '0';
  var pos = (($(window).height() - 75) / 2 - $('#word_overlay .wrap').height() / 2);
  $('#word_overlay .wrap')[0].style.marginTop = ($('#word_overlay .wrap').height() > $(window).height() - 75 ? '50' : pos) + 'px';

  $('#word_overlay .word, #word_overlay .definition').hide();
  $('#word_overlay')[0].style.top = "75px";

  $('#word_overlay').fadeIn(400);

  $('#word_overlay .word').delay(500).fadeIn(400);
  $('#word_overlay .definition').delay(2000).fadeIn(400);

  view.redraw();
};

view.hideDefinitionOverlay = function() {
  // show video once the definition is hidden (mobile-only)
  if (is_mobile) {
    $('#player').html('<object width="100%" height="100%"><param name="movie" value="http://www.youtube.com/v/' + video_urls[current_video_index].youtube_id + '?version=3"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/' + video_urls[current_video_index].youtube_id + '?version=3" type="application/x-shockwave-flash" width="100%" height="100%" allowscriptaccess="always" allowfullscreen="true"></embed></object>')
  }

  $('#word_overlay').fadeOut(400);
  $(document.body).delay(410).removeClass("crop");

  setTimeout(function () {
    $('#word_overlay')[0].style.top = $(window).height() + "px";
  }, 500)
};

view.showSuggestOverlay = function() {
  megaplaya_call("pause");
  document.body.scrollTop = 0;
  $('#suggest_overlay').fadeIn(200);

  $('#suggest_overlay .wrap')[0].style.display = '';
  $('#suggest_overlay .wrap')[1].style.display = 'none';
  // set data in overlay
  var vid = megaplaya_call("getCurrentVideo");
  $('#suggest_def').text(vid.word);
  $('#add_video_frame')[0].src = "http://www.urbandictionary.com/video.php?layout=tv&defid=" + vid.defid + "&word=" + encodeURIComponent(vid.word);

  view.redraw();
};

view.hideSuggestOverlay = function() {
  megaplaya_call("play");
  $('#suggest_overlay').fadeOut(200);

  setTimeout(view.redraw, 250);
};