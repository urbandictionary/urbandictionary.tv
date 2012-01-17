// Work
var megaplaya = false;
var keyboard_disabled = false;

$(document).ready(function() {

  load_player();

  $('#more_info_btn').click(function(){
    $('#video_info_text').toggle();
    if ($('#video_info_text').is(":visible"))
      this.innerHTML = "Hide info";
    else
      this.innerHTML = "More info";

  });

  $('#voting .vote').click(function(){
    var defid = megaplaya.api_getCurrentVideo().defid,
     direction = $(this).attr('rel');
    send_vote(defid, direction);

    // skip to next definition on thumbs down
    if(this.id == 'vote_down') {
      next_definition();
    }
  });

  $('#suggest_video').click(function(){
    show_suggest_overlay();
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
    alert('uh oh, error in debug()');
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
  var video = megaplaya.api_getCurrentVideo(),
      word = video.word,
      escaped_word = Permalink.encode(word);

  $('#word_txt').html('<a href="http://www.urbandictionary.com/define.php?term=' + escaped_word + '" target="_blank">' + video.word + '</a>');
  printBrackets(video.definition, $('#definition_txt').empty());

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
  Permalink.set(escaped_word);
  show_definition(video.word, video.definition);

  // Set next word button
  var next_word = urls[video.index + 1] ? urls[video.index + 1].word : false;
  if (next_word) {
    $('#next_word').html('<a href="/#' + Permalink.encode(next_word) + '">' + next_word + '</a>');
    $('#next_definition').fadeIn(250);
  }

  // Hid eth ov
  hide_timeout = setTimeout(function() {
    redraw();
    hide_definition();
  }, hide_delay);

  fetch_video_info(video.url);
  fetch_vote_counts(video.defid);

  // debug("Current entry =>", video);
  track_pageview("/" + escaped_word);
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
  $.ajax({
    type: 'GET',
    url: 'http://www.urbandictionary.com/uncacheable.php?ids=' + defid,
    dataType: 'jsonp',
    success: function(data){
      debug("fetch_vote_counts() success data=>", data);
      var thumbs = data.thumbs[0];
      if(thumbs) {
        $('#vote_up .vote_count').html(thumbs.thumbs_up);
        $('#vote_down .vote_count').html(thumbs.thumbs_down);
      }
      else {
        debug("fetch_vote_counts: no thumbs data, aborting")
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
  var url = "http://www.urbandictionary.com/thumbs.php?defid=" + defid + "&direction=" + direction;
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
          // if dupe, still turn the like btn on anyway.
          //$("#vote_" + direction + " .vote_img").addClass("on");
        }
        debug("Bad status from vote: " + data.status);
      }
    },
    error: function(){ debug("Error fetching data") }
  });
}

// Urban Dictionary data loaders
function inject_script(url) {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  document.documentElement.firstChild.appendChild(script);
}

function parse_videos_from_response(resp) {
  urls = $.map(resp.videos, function (entry, i) {
    entry.index = i;
    entry.url = "http://youtube.com/watch?v=" + entry.youtube_id;
    return entry;
  });
  return urls;
}

var videos_api_url = 'http://www.urbandictionary.com/iphone/search/videos',
    urban_current_word = false; // ghetto shimmy, FIXME

function load_videos(word) {
  if (word) {
    urban_current_word = word;
    debug("Loading for word: " + word);
    inject_script(videos_api_url + '?callback=load_videos_callback&word=' + encodeURIComponent(word));
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
  new_urls = parse_videos_from_response(resp);
  debug("append_videos_callback():" + new_urls.length + ' new urls');

  // FIXME

  // TODO what is the megaplaya API called for this?
  // do we have an appendToQueue() call now...?
  // urls = megaplaya.api_getQueue();
  // debug(urls.length + ' existing urls');
  // return megaplaya.api_loadQueue(urls + new_urls);
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

