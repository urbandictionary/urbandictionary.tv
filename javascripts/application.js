// Work
var megaplaya = false;
var keyboard_disabled = false;

$(document).ready(function() {

  load_player();

  // would be chill to do this using History API
  // even chiller with backbone.js + it's app.router
  if(window.location.hash){
    debug("window.location has a hash");
    // TODO trigger hashchange event
  }

  $('#video_info_button').click(function(){
    alert($('#video_info_text').text());
  });

  $('#voting a').click(function(){
    var defid = megaplaya.api_getCurrentVideo().defid,
        direction = $(this).attr('rel');
    send_vote(defid, direction);

    // skip to next definition on thumbs down
    if(this.id == 'vote_down') {
      next_definition();
    }
  });

  $('#suggest_video').click(function(){
    $('#suggest_overlay').show();
  });

  $('#suggest_overlay').click(function(){
    $('#suggest_overlay').fadeOut(250);
  });

  redraw();
});

$(window).bind('hashchange', function() {
  debug("hash was changed!");
});

$(window).resize(redraw);

function redraw()
{
  var min_height = 500;
  $('#player').height(min_height);

  if ($(window).height() > min_height + 75 + $('#bottom').height()) {
    $('#player').height($(window).height() - $('#bottom').height() - 115);
  }

  // FIXME genercize for .overlay
  $('#word_overlay .wrap')[0].style.marginTop = '0';
  var pos = (($(window).height() - 75) / 2 - $('#word_overlay .wrap').height() / 2);
  $('#word_overlay .wrap')[0].style.marginTop =  ($('#word_overlay .wrap').height() > $(window).height() - 75 ? '50' : pos)  + 'px';

  $('.overlay')[0].style.top = "75px";
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


function redraw()
{
  var min_height = 500;
  $('#player').height(min_height);

  if ($(window).height() > min_height + 75 + $('#bottom').height()) {
    $('#player').height($(window).height() - $('#bottom').height() - 115);
  }

  if ($(window).height() < $('#player').height() + 75)
    $('#player').height($(window).height() - 75);

  $('#word_overlay').height($(window).height() - 75);
  $('#word_overlay').width($(window).width());
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
  //megaplaya.api_setColor('ffc652');
  megaplaya.api_setColor('e86222');
  megaplaya_addListeners();
  load_urban_videos();
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
      escaped_word = encodeURIComponent(video.word).replace('%20','+'); // they are nicer <3

  $('#word_txt').html('<a href="http://www.urbandictionary.com/define.php?term=' + escaped_word + '" target="_blank">' + video.word + '</a>');
  printBrackets(video.definition, $('#definition_txt').empty());

  if (hide_timeout) {
    clearTimeout(hide_timeout);
    hide_timeout = false;
  }

  show_definition(video.word, video.definition);

  var hide_delay = video.definition.length * 40;
  if (hide_delay < 4000)
    hide_delay = 4000;

  if (hide_delay > 8000)
    hide_delay = 8000;

  // set next word button
  $('#next_word').html(urls[video.index + 1].word);
  $('#next_definition').fadeIn(250);

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
      var pp = '<p>Title: ' + vid.title;
      pp += '<p>URL: ' + vid.url;
      pp += '<p>' + vid.description;
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
  $('.vote_count').html('');
}

function show_definition(word, def)
{
  $(document.body).addClass("crop");

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
  $(document.body).delay(400).removeClass("crop");

  setTimeout(function() {
    $('#word_overlay')[0].style.top = $(window).height() + "px";
  }, 500)
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
        if(number_text == undefined || number_text == '') {
          $(field).html(1);
        }
        else {
          $(field).html(parseInt(number_text) + 1);
        }
      }
      else {
        alert("Bad status from vote: " + data.status);
      }
    },
    error: function(){ alert("Error fetching data") }
  });
}

// Urban Dictionary data loaders
function load_urban_videos() {
  var url = 'http://www.urbandictionary.com/iphone/search/videos?callback=load_urban_videos_callback&random=1';
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  document.documentElement.firstChild.appendChild(script);
}

// var urls = false;
// function load_urban_videos_callback(resp) {
//   debug(">> load_urban_videos_callback() - adding listeners", resp);
//
//   urls = $.map(resp.videos, function (entry, i) {
//     entry.index = i;
//     entry.url = "http://youtube.com/watch?v=" + entry.youtube_id;
//     return entry;
//   });
// }

var urls = false;
function load_urban_videos_callback(resp) {
  urls = $.map(resp.videos, function (entry, i) {
    entry.index = i;
    entry.url = "http://youtube.com/watch?v=" + entry.youtube_id;
    return entry;
  });
  debug(">> callback(): loading " + urls.length + " videos...");

  urls = shuffle(urls);
  return megaplaya.api_playQueue(urls);
}