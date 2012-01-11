var megaplaya = false;
var search_visible = true;
var keyboard_disabled = false;

$(window).resize(redraw);
$(document).ready(function() {
  load_player();
  redraw();
});

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
    alert('uh oh');
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
}

// VHX Megaplaya scaffolding
function load_player()
{
  $('#player').flash({
    swf: 'http://vhx.tv/embed/megaplaya',
    width: '100%;',
    height: '100%',
    allowFullScreen: true,
    allowScriptAccess: "always"
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

function megaplaya_call(method) {
  // "pause" => megaplaya.api_pause();
  (megaplaya["api_" + method])();
}

function megaplaya_addListeners() {
  var events = ['onVideoFinish', 'onVideoLoad', 'onError', 'onPause', 'onPlay', 'onFullscreen', 'onPlaybarShow', 'onPlaybarHide', 'onKeyboardDown'];

  $.each(events, function(index, value) {
    megaplaya.api_addListener(value, "function() { megaplaya_callback('" + value + "', arguments); }")
  });
}

function megaplaya_callback(event_name, args) {

  // TODO just look for and call functions like "#{event_name}_callback" if defined
  // all megaplaya apps could work like this, and the above scaffolding be builtin

  switch (event_name) {
    case 'onVideoLoad':
      var video = megaplaya.api_getCurrentVideo();
      // megaplaya.api_growl(video.word + ': '+video.definition);

      var escaped_word = encodeURIComponent(video.word).replace('%20','+'); // they are nicer <3
      $('#word_txt').html('<a href="http://www.urbandictionary.com/define.php?term=' + video.word + '" target="_blank">' +  + '</a>');
      printBrackets(video.definition, $('#definition_txt').empty());

      show_definition(video.word, video.definition);

      var hide_delay = video.definition.length * 40;
      if (hide_delay < 4000)
        hide_delay = 4000;

      if (hide_delay > 8000)
        hide_delay = 8000;

      // set next word button
      $('#next_word').html(urls[video.index + 1].word);

      setTimeout(function() {
        redraw();
        hide_definition();
      }, hide_delay);

      track_pageview("/" + escaped_word);

      debug(video);


    default:
      debug("Unhandled megaplaya event: ", event_name, args);
      break;
  }
}

function next_definition()
{
  megaplaya.api_nextVideo();
}

function show_definition(word, def)
{
  $('#word_overlay, #word_overlay .word, #word_overlay .definition').show();
  $('#word_overlay .word').text(word);
  printBrackets(def, $('#word_overlay .definition').empty());

  $('#word_overlay .wrap')[0].style.marginTop = '0';
  var pos = (($(window).height() - 75) / 2 - $('#word_overlay .wrap').height() / 2);
  $('#word_overlay .wrap')[0].style.marginTop =  ($('#word_overlay .wrap').height() > $(window).height() - 75 ? '50' : pos)  + 'px';

  $('#word_overlay .word, #word_overlay .definition').hide();
  $('#word_overlay')[0].style.top = "75px";
  $('#word_overlay').height($(window).height() - 75);
  $('#word_overlay').width($(window).width());
  $('#word_overlay').fadeIn(400);

  $('#word_overlay .word').delay(500).fadeIn(400);
  $('#word_overlay .definition').delay(2000).fadeIn(400);

  //megaplaya.api_pause();
  //megaplaya.api_setVolume(0);
}

function hide_definition()
{
  $('#word_overlay').fadeOut(400)

  //megaplaya.api_setVolume(1);
  //megaplaya.api_seek(0);
  setTimeout(function() {
    $('#word_overlay')[0].style.top = $(window).height() + "px";
  }, 500)
}

// Urban Dictionary data loaders
function load_urban_videos() {
  var url = 'http://www.urbandictionary.com/iphone/search/videos?callback=load_urban_videos_callback&random=1';
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  document.documentElement.firstChild.appendChild(script);
}

var urls = false;
function load_urban_videos_callback(resp) {
  debug(">> load_urban_videos_callback() - adding listeners", resp);

  urls = $.map(resp.videos, function (entry, i) {
    entry.index = i;
    entry.url = "http://youtube.com/watch?v=" + entry.youtube_id;
    return entry;
  });
  debug(">> callback(): loading "+urls.length+" videos...");

  // 1st: show word, hide other controls
  $('#overlay').show();
  $('#sidebar').hide();

  // 2nd: show definition slideout
  $('#overlay').fadeOut('slow');
  // TODO...

  // 3rd: hide controls
  var hide_controls_timer = setTimeout(function() {

    // TODO slide sidebar left

    $('#player').show();
    $('#player').css('z-index', 10);
  }, 3000);

  urls = shuffle(urls);
  return megaplaya.api_playQueue(urls);
}
