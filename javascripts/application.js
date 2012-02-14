function reset_globals() {
  window.megaplaya = false;
  window.keyboard_disabled = false;
  window.is_mobile = /iphone|ipad|ipod|android|mobile/i.exec(navigator.userAgent) != undefined;
  window.current_video_index = 0;
  window.hide_timeout = false;
  window.api_host = "www.urbandictionary.com";
  window.videos_api_url = 'http://' + api_host + '/iphone/search/videos';
  window.urban_current_word = false; // ghetto shimmy, FIXME
  window.video_urls = false;
  window.permalink = new Permalink(window.location);
}

reset_globals();

function document_ready() {
  load_player();

  if (!jQuery.browser.mozilla)
    $(document.body).addClass("crop");

  $('#more_info_btn').click(function () {
    $('#video_info_text').toggle();
    if ($('#video_info_text').is(":visible")) {
      this.innerHTML = "Hide info";
      track_event('hide_more_info');
    }
    else {
      this.innerHTML = "More info";
      track_event('show_more_info');
    }
  });

  $('#voting .vote').click(function () {
    var defid = megaplaya_call("getCurrentVideo").defid,
      direction = $(this).attr('rel');
    send_vote(defid, direction);

    // skip to next definition on thumbs down
    if (this.id == 'vote_down') {
      next_definition();
    }
  });

  $('#suggest_video').click(function () {
    show_suggest_overlay();
    track_event('show_suggest_video');
  });

  $('#suggest_overlay').click(function () {
    hide_suggest_overlay();
  });

  $('#word_overlay').click(function () {
    hide_definition();
  });

  $('#make_video').click(function (e) {
    e.stopPropagation();
    $("#suggest_overlay .wrap").toggle();
    track_event('show_make_video');
  });
  redraw();

  $(window).bind('hashchange', permalink.hashchange);
}

$(window).resize(redraw);

function redraw() {
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
}

// Helpers
function debug(string) {
  try {
    if (arguments.length > 1) {
      console.log(arguments);
    }
    else {
      console.log(string);
    }
  } catch (e) {

  }
}

// VHX Megaplaya scaffolding
function load_player() {
  if (!is_mobile) {
    $('#player').flash({
      'swf': 'http://vhx.tv/embed/megaplaya',
      'width': '100%;',
      'height': '100%',
      'wmode': 'transparent',
      'allowFullScreen': true,
      'allowScriptAccess': 'always'
    });
  }
  else {
    megaplaya_loaded();
  }
}

function megaplaya_loaded() {
  if (!is_mobile) {
    debug(">> megaplaya_loaded()");
    megaplaya = $('#player').children()[0];
    megaplaya_call("setColor", "e86222");
    megaplaya_addListeners();
  }

  load_videos(permalink.get());
}

function megaplaya_addListeners() {
  var events = ['onVideoFinish', 'onVideoLoad', 'onError', 'onPause', 'onPlay', 'onFullscreen', 'onPlaybarShow', 'onPlaybarHide', 'onKeyboardDown'];

  $.each(events, function (index, value) {
    megaplaya.api_addListener(value, "function() { megaplaya_callback('" + value + "', arguments); }");
  });
}

function megaplaya_call(method, arg1, arg2) {
  if (is_mobile) {
    switch (method) {
      case "playQueue":
        current_video_index = 0;
        megaplaya_onvideoload();
        break;

      case "getCurrentVideo":
        return video_urls[current_video_index];
        break;

      case "nextVideo":
        $('#player').html("");
        current_video_index++;
        megaplaya_onvideoload();
        break;
    }
  }

  // If megaplaya is loaded
  if (megaplaya) {
    if (arg1 != undefined) {
      return (megaplaya["api_" + method])(arg1);
    }
    else if (arg2 != undefined) {
      return (megaplaya["api_" + method])(arg1, arg2);
    }
    else {
      return (megaplaya["api_" + method])();
    }
  }

  return false;
}

function megaplaya_callback(event_name, args) {

  switch (event_name) {
    case 'onVideoLoad':
      megaplaya_onvideoload(args);
      break;
    default:
      // debug("Unhandled megaplaya event: ", event_name, args);
      break;
  }
}


// Called on every video load
function megaplaya_onvideoload(args) {
  $(".vote_img").removeClass("on");

  var video = megaplaya_call("getCurrentVideo"),
    word = video.word,
    escaped_word = permalink.encode(word);

  $('#word_txt').html('<a href="http://www.urbandictionary.com/define.php?term=' + escaped_word + '" target="_blank">' + video.word + '</a>');
  printBrackets(video.definition, $('#definition_txt').empty());

  $('#example_txt').html(video.example);
  printBrackets(video.example, $('#example_txt').empty());

  if (hide_timeout) {
    clearTimeout(hide_timeout);
    hide_timeout = false;
  }

  var hide_delay = video.definition.length * 40;
  if (hide_delay < 4000) {
    hide_delay = 4000;
  }
  else if (hide_delay > 8000) {
    hide_delay = 8000;
  }

  // Load things
  permalink.set(escaped_word); //  + "-" + video.id
  show_definition(video.word, video.definition);
  load_next_word(video_urls);

  // Hide definition overlay
  hide_timeout = setTimeout(function () {
    redraw();
    hide_definition();
  }, hide_delay);

  // Load metadata for this video & definition
  fetch_video_info(video.url);
  fetch_vote_counts(video.defid);

  track_pageview("/" + escaped_word);
}

function load_next_word(video_urls) {
  var video = megaplaya_call("getCurrentVideo"),
    next_word = video_urls[video.index + 1] ? video_urls[video.index + 1].word : false;
  if (next_word) {
    debug("Showing #next_definition: " + next_word);
    $('#next_word').html('<a href="/#' + permalink.encode(next_word) + '">' + next_word + '</a>');
    $('#next_definition').fadeIn(250);
  }
  else {
    // debug("No #next_definition available, can't show");
    $('#next_definition').hide();
  }
}

function fetch_video_info(video_url) {
  $.ajax({
    type: "GET",
    url: "http://api.vhx.tv/info.json?url=" + encodeURIComponent(video_url),
    dataType: 'jsonp',
    success: function (data) {
      var vid = data.video;
      // debug("fetch_video_info() => ", vid);
      megaplaya_call("growl", "<p>You're watching <span class='title'>" + vid.title + "</span></p>");

      var pp = '<p class="title">' + vid.title + '</p>';
      pp += '<a href="' + vid.url + '" target="_blank">' + vid.url + '</a></p>';
      pp += '<p class="desc">' + vid.description + '</p>';
      $('#video_info_text').html(pp);
    },
    error: function () {
      alert("Error fetching data")
    }
  });
}

function fetch_vote_counts(defid) {
  var url = 'http://' + api_host + '/uncacheable.php?ids=' + defid;
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'jsonp',
    success: function (data) {
      var thumbs = data.thumbs[0];
      if (thumbs) {
        $('#vote_up .vote_count').html(thumbs.thumbs_up);
        $('#vote_down .vote_count').html(thumbs.thumbs_down);
      }
      else {
        debug("fetch_vote_counts: no thumbs data! aborting", data)
      }
    },
    error: function () {
      alert("Error fetching vote counts")
    }
  });
}

function next_definition() {
  megaplaya_call("nextVideo");
}

function show_definition(word, def) {
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

  redraw();
}

function hide_definition() {
  // show video once the definition is hidden (mobile-only)
  if (is_mobile) {
    $('#player').html('<object width="100%" height="100%"><param name="movie" value="http://www.youtube.com/v/' + video_urls[current_video_index].youtube_id + '?version=3"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/' + video_urls[current_video_index].youtube_id + '?version=3" type="application/x-shockwave-flash" width="100%" height="100%" allowscriptaccess="always" allowfullscreen="true"></embed></object>')
  }

  $('#word_overlay').fadeOut(400);
  $(document.body).delay(410).removeClass("crop");

  setTimeout(function () {
    $('#word_overlay')[0].style.top = $(window).height() + "px";
  }, 500)
}

function show_suggest_overlay() {
  megaplaya_call("pause");
  document.body.scrollTop = 0;
  $('#suggest_overlay').fadeIn(200);

  $('#suggest_overlay .wrap')[0].style.display = '';
  $('#suggest_overlay .wrap')[1].style.display = 'none';
  // set data in overlay
  var vid = megaplaya_call("getCurrentVideo");
  $('#suggest_def').text(vid.word);
  $('#add_video_frame')[0].src = "http://www.urbandictionary.com/video.php?layout=tv&defid=" + vid.defid + "&word=" + encodeURIComponent(vid.word);

  redraw();
}

function hide_suggest_overlay() {
  megaplaya_call("play");
  $('#suggest_overlay').fadeOut(200);

  setTimeout(redraw, 250);
}

function send_vote(defid, direction) {
  var url = "http://" + api_host + "/thumbs.php?defid=" + defid + "&direction=" + direction;
  $.ajax({
    type: "GET",
    url: url,
    dataType: 'jsonp',
    success: function (data) {
      if (data.status == 'saved') {
        var field = '#vote_' + direction + ' .vote_count',
          number_text = $(field).text();

        // Only light up the icon for upvotes; downvotes skip the video
        if (direction == 'up') {
          $("#vote_" + direction + " .vote_img").addClass("on");
        }

        if (number_text == undefined || number_text == '') {
          $(field).html(1);
        }
        else {
          $(field).html(parseInt(number_text) + 1);
        }
      }
      else {
        if (data.status == "duplicate") {
          debug("send_vote() error: duplicate vote");
        }
        else {
          debug("send_vote() error: unhandled status => " + data.status);
        }

        // if dupe, still turn the like btn on anyway.
        if (direction == 'up') {
          $("#vote_" + direction + " .vote_img").addClass("on");
        }

        track_event("send_vote_" + direction);
      }
    },
    error: function () {
      debug("send_vote: error fetching vote data");
      track_event("send_vote_error");
    }
  });
}

function parse_videos_from_response(resp, offset) {
  return $.map(resp.videos, function (entry, i) {
    entry.index = i + (offset > 0 ? offset : 0);
    entry.url = "http://youtube.com/watch?v=" + entry.youtube_id;
    return entry;
  });
}

function load_videos(word) {
  if (word) {
    urban_current_word = word.split("-");
    debug("Loading videos for word: " + urban_current_word);

    $.ajax({
      type: "GET",
      url: videos_api_url + '?word=' + encodeURIComponent(urban_current_word[0]),
      dataType: 'jsonp',
      success: load_videos_callback
    });
  }
  else {
    urban_current_word = false;

    $.ajax({
      type: "GET",
      url: videos_api_url + '?random=1',
      dataType: 'jsonp',
      success: load_videos_callback
    });
  }
}

// Replaces the current playlist
function load_videos_callback(resp) {

  debug("load_videos_callback()", resp);
  video_urls = parse_videos_from_response(resp);

  // only one video plz
  if (urban_current_word && video_urls.length > 0) {
    video_urls = [video_urls[0]];
  }

  if (video_urls.length == 0) {
    alert("Error, no videos found!");
    return false;
  }
  else {
    // If we're loading videos for a specific word, append other words
    if (urban_current_word) {
      $.ajax({
        type: "GET",
        url: videos_api_url + '?random=1',
        dataType: 'jsonp',
        success: append_videos_callback
      });
    }

    return megaplaya_call("playQueue", video_urls);
  }
}

// Add to the current playlist rather than replacing
function append_videos_callback(resp) {
  new_urls = parse_videos_from_response(resp, 1);
  debug("append_videos_callback(): " + new_urls.length + ' new urls');

  video_urls = video_urls.concat(new_urls);
  megaplaya_call("loadQueue", video_urls);
  megaplaya_call("setQueueAt", 0);

  if (!$('#next_definition').is(':visible')) {
    load_next_word(video_urls);
  }
}