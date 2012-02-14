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

$.ajaxSetup({
  type: 'GET',
  dataType: 'jsonp'
});

function addClickListeners() {
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
    var defid = megaplaya_call("getCurrentVideo").defid;
    var direction = $(this).attr('rel');
    sendVote(defid, direction);

    if (this.id == 'vote_down') {
      nextDefinition();
    }
  });

  $('#suggest_video').click(function () {
    view.showSuggestOverlay();
    track_event('show_suggest_video');
  });

  $('#suggest_overlay').click(function () {
    view.hideSuggestOverlay();
  });

  $('#word_overlay').click(function () {
    view.hideDefinition();
  });

  $('#make_video').click(function (e) {
    e.stopPropagation();
    $("#suggest_overlay .wrap").toggle();
    track_event('show_make_video');
  });

  $('#next_definition').click(nextDefinition);
}

function addWindowListeners() {
  $(window).on('hashchange', $.proxy(permalink.hashchange, permalink));
  $(window).resize(view.redraw);
}

function document_ready() {
  loadPlayer();

  if (!jQuery.browser.mozilla)
    $(document.body).addClass("crop");

  addClickListeners();
  addWindowListeners();

  view.redraw();
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
function loadPlayer() {
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

  loadVideos(permalink.get());
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
  view.showDefinition(video.word, video.definition);
  loadNextWord(video_urls);

  // Hide definition overlay
  hide_timeout = setTimeout(function () {
    view.redraw();
    view.hideDefinition();
  }, hide_delay);

  // Load metadata for this video & definition
  fetchVideoInfo(video.url);
  fetchVoteCounts(video.defid);

  track_pageview("/" + escaped_word);
}

function loadNextWord(video_urls) {
  var video = megaplaya_call("getCurrentVideo");
  var next_word = video_urls[video.index + 1] ? video_urls[video.index + 1].word : false;

  if (next_word) {
    debug("Showing #next_definition: " + next_word);
    $('#next_word').html('<a href="/#' + permalink.encode(next_word) + '">' + next_word + '</a>');
    $('#next_definition').fadeIn(250);
  }
  else {
    $('#next_definition').hide();
  }
}

function fetchVideoInfo(video_url) {
  $.ajax({
    url: "http://api.vhx.tv/info.json?url=" + encodeURIComponent(video_url),
    success: function (data) {
      var vid = data.video;
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

function fetchVoteCounts(defid) {
  var successCallback = function (data) {
    var thumbs = data.thumbs[0];
    if (thumbs) {
      $('#vote_up .vote_count').html(thumbs.thumbs_up);
      $('#vote_down .vote_count').html(thumbs.thumbs_down);
    }
    else {
      debug("fetchVoteCounts: no thumbs data! aborting", data)
    }
  };

  $.ajax({
    url: 'http://' + api_host + '/uncacheable.php?ids=' + defid,
    success: successCallback,
    error: function () {
      alert("Error fetching vote counts")
    }
  });
}

function nextDefinition() {
  megaplaya_call("nextVideo");
}

function sendVote(defid, direction) {
  var successCallback = function (data) {
    if (data.status == 'saved') {
      if (direction == 'up') {
        $("#vote_up .vote_img").addClass("on");
      }

      var element = $('#vote_' + direction + ' .vote_count');
      var current = (parseInt(element.text()) || 0);
      element.text(current + 1);
    } else {
      if (direction == 'up') {
        $("#vote_up .vote_img").addClass("on");
      }

      track_event("send_vote_" + direction);
    }
  };

  $.ajax({
    url: "http://" + api_host + "/thumbs.php?defid=" + defid + "&direction=" + direction,
    success: successCallback,
    error: function () {
      debug("sendVote: error fetching vote data");
      track_event("send_vote_error");
    }
  });
}

function videosFromResponse(response) {
  return $.map(response.videos, function (entry, index) {
    entry.index = index;
    entry.url = "http://youtube.com/watch?v=" + entry.youtube_id;
    return entry;
  });
}

function loadVideos(word) {
  var successCallback = function(response) {
    video_urls = videosFromResponse(response);

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
        $.ajax({url: videos_api_url + '?random=1', success: appendVideosCallback});
      }

      return megaplaya_call("playQueue", video_urls);
    }
  };

  if (word) {
    urban_current_word = word.split("-");

    $.ajax({
      url: videos_api_url + '?word=' + encodeURIComponent(urban_current_word[0]),
      success: successCallback
    });
  }
  else {
    urban_current_word = false;

    $.ajax({
      url: videos_api_url + '?random=1',
      success: successCallback
    });
  }
}

// Add to the current playlist rather than replacing
function appendVideosCallback(response) {
  video_urls = video_urls.concat(videosFromResponse(response));

  megaplaya_call("loadQueue", video_urls);
  megaplaya_call("setQueueAt", 0);

  if (!$('#next_definition').is(':visible')) {
    loadNextWord(video_urls);
  }
}