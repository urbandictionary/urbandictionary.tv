var API_ROOT = "http://api.urbandictionary.com/v0/";
var API_KEY = "af4302ea4b25374ec68cde5e117b0594";

function documentReady() {
  $.ajaxSetup({
    type: 'GET',
    dataType: 'jsonp'
  });

  loadPlayer();

  if (!jQuery.browser.mozilla)
    $(document.body).addClass("crop");

  addClickListeners();
  addWindowListeners();

  view.redraw();
}

function resetGlobals() {
  window.megaplaya = false;
  window.keyboard_disabled = false;
  window.is_mobile = /iphone|ipad|ipod|android|mobile/i.exec(navigator.userAgent) != undefined;
  window.current_video_index = 0;
  window.hide_timeout = false;
  window.urban_current_word = false; // ghetto shimmy, FIXME
  window.video_urls = false;
  window.permalink = new Permalink(window.location);
}

resetGlobals();

function addClickListeners() {
  $('#more_info_btn').click(view.toggleMoreInfo);
  $('#voting .vote').click(voteClicked);
  $('#suggest_video').click(view.showSuggestOverlay);
  $('#suggest_overlay').click(view.hideSuggestOverlay);
  $('#word_overlay').click(view.hideDefinitionOverlay);
  $('#next_definition').click(nextDefinition);

  $('#make_video').click(function (e) {
    e.stopPropagation();
    $("#suggest_overlay .wrap").toggle();
  });
}

function addWindowListeners() {
  $(window).on('hashchange', $.proxy(permalink.hashchange, permalink));
  $(window).resize(view.redraw);
}

window.debug = function() {
  console.log(arguments[0], arguments[1], arguments[2], arguments[3]);
};

// VHX Megaplaya scaffolding
function loadPlayer() {
  if (!is_mobile) {
    $('#player').flash({
      swf: 'http://vhx.tv/embed/megaplaya',
      width: '100%;',
      height: '100%',
      wmode: 'transparent',
      allowFullScreen: true,
      allowScriptAccess: 'always'
    });
  } else {
    megaplaya_loaded();
  }
}

function megaplaya_call(method, arg1, arg2) {
  if (is_mobile) {
    switch (method) {
      case "playQueue":
        current_video_index = 0;
        onVideoLoad();
        break;

      case "getCurrentVideo":
        return video_urls[current_video_index];
        break;

      case "nextVideo":
        $('#player').html("");
        current_video_index++;
        onVideoLoad();
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

function megaplaya_loaded() {
  if (!is_mobile) {
    megaplaya = $('#player').children()[0];
    megaplaya_call("setColor", "e86222");
    megaplaya.api_addListener("onVideoLoad", "function() { onVideoLoad(); }");
  }

  loadVideos(permalink.get());
}

function onVideoLoad() {
  $(".vote_img").removeClass("on");

  var video = megaplaya_call("getCurrentVideo");
  var word = video.word;
  var escaped_word = permalink.encode(word);

  $('#word_txt').html('<a href="http://www.urbandictionary.com/define.php?term=' + escaped_word + '" target="_blank">' + video.word + '</a>');
  printBrackets(video.definition, $('#definition_txt').empty());
  printBrackets(video.example, $('#example_txt').empty());

  if (hide_timeout) {
    clearTimeout(hide_timeout);
    hide_timeout = false;
  }

  var hide_delay = video.definition.length * 40;
  if (hide_delay < 4000) {
    hide_delay = 4000;
  } else if (hide_delay > 8000) {
    hide_delay = 8000;
  }

  // Load things
  permalink.set(escaped_word);
  view.showDefinitionOverlay(video.word, video.definition);
  loadNextWord(video_urls);

  // Hide definition overlay
  hide_timeout = setTimeout(function () {
    view.redraw();
    view.hideDefinitionOverlay();
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
    $('#next_word').html('<a href="/#' + permalink.encode(next_word) + '">' + next_word + '</a>');
    $('#next_definition').fadeIn(250);
  } else {
    $('#next_definition').hide();
  }
}

function fetchVideoInfo(video_url) {
  $.get("http://api.community.vhx.tv/info.json", {url: video_url}, function (data) {
    var video = data.video;
    megaplaya_call("growl", "<p>You're watching <span class='title'>" + video.title + "</span></p>");

    var pp = '<p class="title">' + video.title + '</p>';
    pp += '<a href="' + video.url + '" target="_blank">' + video.url + '</a></p>';
    pp += '<p class="desc">' + video.description + '</p>';
    $('#video_info_text').html(pp);
  });
}

function fetchVoteCounts(defid) {
  $.get(API_ROOT + 'uncacheable', {ids: defid, key: API_KEY}, function (data) {
    var thumbs = data.thumbs[0];
    if (thumbs) {
      $('#vote_up .vote_count').html(thumbs.thumbs_up);
      $('#vote_down .vote_count').html(thumbs.thumbs_down);
    }
  });
}

function nextDefinition() {
  megaplaya_call("nextVideo");
}

function voteClicked() {
  var data = {defid: megaplaya_call("getCurrentVideo").defid, direction: $(this).attr('rel'), key: API_KEY};

  $.get(API_ROOT + "vote", data, function (response) {
    if (data.direction == 'up') {
      $("#vote_up .vote_img").addClass("on");

      if (response.status == 'saved') {
        var element = $('#vote_' + data.direction + ' .vote_count');
        var current = (parseInt(element.text()) || 0);
        element.text(current + 1);
      }
    } else {
      nextDefinition();
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
  urban_current_word = word;

  var data = {key: API_KEY};
  if (word) {
    data.word = word;
  }

  $.get(API_ROOT + 'videos', data, function(response) {
    video_urls = videosFromResponse(response);

    if (video_urls.length == 0) {
      alert("Error, no videos found!");
    } else {
      if (word) {
        $.get(API_ROOT + 'videos', function(response) {
          video_urls = video_urls.concat(videosFromResponse(response));

          megaplaya_call("loadQueue", video_urls);
          megaplaya_call("setQueueAt", 0);

          if (!$('#next_definition').is(':visible')) {
            loadNextWord(video_urls);
          }
        });
      }

      megaplaya_call("playQueue", video_urls);
    }
  });
}
