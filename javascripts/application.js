// Work
var megaplaya = false;
var keyboard_disabled = false;

$(document).ready(function() {

  load_player();

  $('#more_info_btn').click(function(){
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

  $('#voting .vote').click(function(){
    var defid = megaplaya.api_getCurrentVideo().defid,
                direction = $(this).attr('rel');
    send_vote(defid, direction);

    // skip to next definition on thumbs down
    if(this.id == 'vote_down') {
      $(".vote_img").removeClass("on"); // FIXME; the onvideoload() handler not resetting the down buton correctly
      next_definition();
    }
  });

  $('#suggest_video').click(function(){
    show_suggest_overlay();
    track_event('show_suggest_video');
  });

  $('#suggest_overlay').click(function(){
    hide_suggest_overlay();
  });

  $('#word_overlay').click(function(){
    hide_definition();
  });

  $('#make_video').click(function(e){
    e.stopPropagation();
    $("#suggest_overlay .wrap").toggle();
    track_event('show_make_video');
  });
  redraw();
});

$(window).resize(redraw);

function redraw()
{
  var min_height = 500;
  $('#player').height(min_height);

  if ($(window).height() > min_height + 75 + $('#bottom').height()) {
    $('#player').height($(window).height() - $('#bottom').height() - 115);
  }

  if ($(window).height() < $('#player').height() + 75) {
    $('#player').height($(window).height() - 75);
  }

  if ($('.overlay').is(":visible")) {
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
function debug(string)
{
  try {
    if(arguments.length > 1) {
      console.log(arguments);
    }
    else {
      console.log(string);
    }
  } catch(e) {

  }
}

function shuffle(v)
{
  for(var j, x, i = v.length; i; j = parseInt(Math.random() * i, 0), x = v[--i], v[i] = v[j], v[j] = x);
  return v;
}

// VHX Megaplaya scaffolding
function load_player()
{
  $('#player').flash({
    'swf': 'http://vhx.tv/embed/megaplaya',
    'width': '100%;',
    'height': '100%',
    'wmode': 'transparent',
    'allowFullScreen': true,
    'allowScriptAccess': 'always'
  });
}

function megaplaya_loaded()
{
  debug(">> megaplaya_loaded()");
  megaplaya = $('#player').children()[0];
  megaplaya.api_setColor('e86222');
  megaplaya_addListeners();
  load_videos(Permalink.get());
}

function megaplaya_addListeners() {
  var events = ['onVideoFinish', 'onVideoLoad', 'onError', 'onPause', 'onPlay', 'onFullscreen', 'onPlaybarShow', 'onPlaybarHide', 'onKeyboardDown'];

  $.each(events, function(index, value) {
    megaplaya.api_addListener(value, "function() { megaplaya_callback('" + value + "', arguments); }")

    // "pause" => megaplaya.api_pause();
    // function megaplaya_call(method) {
    //   (megaplaya["api_" + method])();
    // }
  });
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
var hide_timeout = false;
function megaplaya_onvideoload(args)
{
  $(".vote_img").removeClass("on");

  var video = megaplaya.api_getCurrentVideo(),
      word = video.word,
      escaped_word = Permalink.encode(word);

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
  Permalink.set(escaped_word); //  + "-" + video.id
  show_definition(video.word, video.definition);

  // Set next word button
  var next_word = video_urls[video.index + 1] ? video_urls[video.index + 1].word : false;
  if (next_word) {
    $('#next_word').html('<a href="/#' + Permalink.encode(next_word) + '">' + next_word + '</a>');
    $('#next_definition').fadeIn(250);
  }

  // Hide definition overlay
  hide_timeout = setTimeout(function() {
    redraw();
    hide_definition();
  }, hide_delay);

  // Load metadata for this video & definition
  debug("raw video object =>", video);
  fetch_video_info(video.url);
  fetch_vote_counts(video.defid);

  inject_socialmedia(video);

  // debug("Current entry =>", video);
  track_pageview("/" + escaped_word);
}

function inject_socialmedia(video) {
  debug("video", video);

  // TODO parse "template" / inject args
  // do we need to be re-injecting the tweet/g+ button each time?
  var html = '',
      server = window.location.protocol + '//' + window.location.host,
      url = server + '/' + Permalink.encode(video.word),
      word = video.word;

  // html += '<div class="twitter"><a href="https://twitter.com/share" class="twitter-share-button" data-text="I\'m learning about "' + word.replace(/'/g, '\'') + '" on urbandictionary.tv: ' + url + '" data-count="none">Tweet</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script></div>';

  html += '<div class="twitter"><iframe allowtransparency="true" frameborder="0" scrolling="no" src="//platform.twitter.com/widgets/tweet_button.html?count=none&url=http://urbandictionary.tv&text=I\'m watching "' + word.replace(/'/g, '\'') + '" on urbandictionary.tv" style="width:130px; height:20px;"></iframe></div>';
  html += '<div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?href=' + url + '&amp;send=false&amp;layout=button_count&amp;width=100&amp;show_faces=false&amp;action=like&amp;colorscheme=dark&amp;font=lucida+grande&amp;height=21&amp;appId=202084943139708" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100px; height:21px;" allowTransparency="true"></iframe></div>';

  // <div class="google">
  //   <script type="text/javascript" src="https://apis.google.com/js/plusone.js"></script>
  //   <div class="g-plusone" data-size="medium" data-annotation="none"></div>
  // </div>

  $('#socialmedia').html(html);
}

function fetch_video_info(video_url) {
  $.ajax({
    type: "GET",
    url: "http://api.vhx.tv/info.json?url=" + encodeURIComponent(video_url),
    dataType: 'jsonp',
    success: function(data){
      var vid = data.video;
      debug("Video metadata => ", vid);
      megaplaya.api_growl("<p>You're watching <span class='title'>" + vid.title + "</span></p>");
      var pp = '<p class="title">' + vid.title + '</p>';
      pp += '<a href="' + vid.url + '" target="_blank">' + vid.url + '</a></p>';
      pp += '<p class="desc">' + vid.description + '</p>';
      $('#video_info_text').html(pp);
    },
    error: function(){ alert("Error fetching data") }
  });
}

function fetch_vote_counts(defid) {
  var url = 'http://' + api_host + '/uncacheable.php?ids=' + defid;
  debug("fetch_vote_counts() url=", url);
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'jsonp',
    success: function(data){
      debug("fetch_vote_counts() success data=>", data);
      var thumbs = data.thumbs[0];
      if(thumbs) {
        $('#vote_up .vote_count').html(thumbs.thumbs_up);
        $('#vote_down .vote_count').html(thumbs.thumbs_down);
      }
      else {
        debug("fetch_vote_counts: no thumbs data! aborting", data)
      }
    },
    error: function(){ alert("Error fetching vote counts") }
  });
}

function next_definition()
{
  megaplaya.api_nextVideo();
 // $('.vote_count').html('');

  // TODO if we're running low on videos, load more
}

function show_definition(word, def)
{
  $(document.body).addClass("crop");
  document.body.scrollTop = 0;

  $('#word_overlay, #word_overlay .word, #word_overlay .definition').show();
  $('#word_overlay .word').text(word);
  printBrackets(def, $('#word_overlay .definition').empty());

  $('#word_overlay .wrap')[0].style.marginTop = '0';
  var pos = (($(window).height() - 75) / 2 - $('#word_overlay .wrap').height() / 2);
  $('#word_overlay .wrap')[0].style.marginTop =  ($('#word_overlay .wrap').height() > $(window).height() - 75 ? '50' : pos)  + 'px';

  $('#word_overlay .word, #word_overlay .definition').hide();
  $('#word_overlay')[0].style.top = "75px";

  $('#word_overlay').fadeIn(400);

  $('#word_overlay .word').delay(500).fadeIn(400);
  $('#word_overlay .definition').delay(2000).fadeIn(400);

  redraw();
}

function hide_definition()
{
  // TODO: Add getDuration hook to megaplaya
  //if (megaplaya.api_getDuration() < 8000)
  //  megaplaya.api_seek(0);

  $('#word_overlay').fadeOut(400)
  $(document.body).delay(410).removeClass("crop");

  setTimeout(function() {
    $('#word_overlay')[0].style.top = $(window).height() + "px";
  }, 500)
}

function show_suggest_overlay()
{
  megaplaya.api_pause();
  document.body.scrollTop = 0;
  $('#suggest_overlay').fadeIn(200);

  $('#suggest_overlay .wrap')[0].style.display = '';
  $('#suggest_overlay .wrap')[1].style.display = 'none';
  // set data in overlay
  var vid = megaplaya.api_getCurrentVideo();
  $('#suggest_def').text(vid.word);
  $('#add_video_frame')[0].src = "http://www.urbandictionary.com/video.php?layout=tv&defid=" + vid.defid + "&word=" + encodeURIComponent(vid.word);

  redraw();
}

function hide_suggest_overlay()
{
  megaplaya.api_play();
  $('#suggest_overlay').fadeOut(200);

  setTimeout(redraw, 250);
}

function send_vote(defid, direction) {
  var url = "http://" + api_host + "/thumbs.php?defid=" + defid + "&direction=" + direction;
  debug("send_vote", url);
  $.ajax({
    type: "GET",
    url: url,
    dataType: 'jsonp',
    success: function(data){
      debug("Vote response =>", data);
      if (data.status == 'saved') {
        var field = '#vote_' + direction + ' .vote_count',
            number_text = $(field).text();

        $("#vote_" + direction + " .vote_img").addClass("on");

        if (number_text == undefined || number_text == '') {
          $(field).html(1);
        }
        else {
          $(field).html(parseInt(number_text) + 1);
        }
      }
      else {
        if (data.status == "duplicate") {
          debug("Duplicate vote");
        }
        else {
          debug("Unhandled vote error: " + data.status);
        }

        // if dupe, still turn the like btn on anyway.
        $("#vote_" + direction + " .vote_img").addClass("on");
        track_event("send_vote_" + direction);
      }
    },
    error: function(){
      debug("Error fetching data");
      track_event("send_vote_error");
    }
  });
}

// Urban Dictionary data loaders
function inject_script(url) {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  document.documentElement.firstChild.appendChild(script);
}

function parse_videos_from_response(resp, offset) {
  urls = $.map(resp.videos, function (entry, i) {
    entry.index = i + (offset > 0 ? offset : 0);
    entry.url = "http://youtube.com/watch?v=" + entry.youtube_id;
    return entry;
  });
  return urls;
}

var api_host = document.location.hostname == "staging.urbandictionary.tv" ? "staging.urbandictionary.com" : "www.urbandictionary.com";

var videos_api_url = 'http://' + api_host + '/iphone/search/videos',
    urban_current_word = false; // ghetto shimmy, FIXME

function load_videos(word) {
  if (word) {
    urban_current_word = word.split("-");
    debug("Loading for word: " + urban_current_word);
    inject_script(videos_api_url + '?callback=load_videos_callback&word=' + encodeURIComponent(urban_current_word[0])); //+ "&id=" + urban_current_word[1]);
  }
  else {
    urban_current_word = false;
    inject_script(videos_api_url + '?callback=load_videos_callback&random=1');
  }
}

// Replaces the current playlist
var video_urls = false;
function load_videos_callback(resp) {

  debug("load_videos_callback()", resp);
  video_urls = parse_videos_from_response(resp);

  // only one video plz
  if (urban_current_word) {
    video_urls = [video_urls[0]];
  }

  if (video_urls.length == 0) {
    alert("Error, no videos found!");
    return false;
  }
  else {
    debug(">> callback(): loading " + video_urls.length + " videos...");

    // If we're loading videos for a specific word, append other words
    if (urban_current_word) {
      debug("ADDING more words...");
      inject_script(videos_api_url + '?callback=append_videos_callback&random=1');
    }

    debug("Playing...");
    video_urls = shuffle(video_urls);
    return megaplaya.api_playQueue(video_urls);
  }
}

// Add to the current playlist rather than replacing
function append_videos_callback(resp) {
  new_urls = parse_videos_from_response(resp, 1);
  debug("append_videos_callback():" + new_urls.length + ' new urls');

  video_urls = video_urls.concat(new_urls);
  megaplaya.api_loadQueue(video_urls);
  megaplaya.api_setQueueAt(0);
}

// permalink/url/history router
permalink_disable_onchange = false;
var Permalink = {
  set: function(url){
    debug("Permalink.set()", url);
    permalink_skip_hashchange = true;
    window.location.hash = this.encode(url);
    return this.get();
  },

  get: function(){
    var hash = window.location.hash.replace(/^\#/, '')
    hash = decodeURIComponent(hash).replace(/\+/g, ' ');
    return hash;
  },

  encode: function(word){
    word = word.toLowerCase();
    return encodeURIComponent(word).replace(/\%20/g,'+').replace(/\%2B/g, '+');
  },

  hashchange: function(){
    debug("Permalink.hashchange()");
    if(permalink_skip_hashchange) {
      // debug("SKIPPING");
    }
    else {
      load_videos();
    }
    if(permalink_skip_hashchange) permalink_skip_hashchange = false;
  }
}

$(window).bind('hashchange', Permalink.hashchange);

