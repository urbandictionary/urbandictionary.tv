$.select = function(list, callback) {
  var found = [];
  $.each(list, function (index, args) {
    if (callback(args)) {
      found.push(args);
    }
  });

  return found;
}

var AjaxSpy = {
  allUrls: function () {
    return $.map($.ajax.argsForCall, function (args) {
      return args[0].url;
    });
  },

  argsForUrl: function(url) {
    return $.select($.ajax.argsForCall, function (args) {
      return args[0].url == url;
    });
  },

  callSuccess: function (url, data) {
    expect($.ajax).toHaveBeenCalled();

    var list = this.argsForUrl(url);
    expect(list.length).toEqual(1);
    list[0][0].success(data);
  }
};

function resetAppGlobals() {
  window.current_video_index = 0;
  window.is_mobile = false;

  window.urls = [];
  window.video_urls = false;

  window.track_pageview = jasmine.createSpy();
  window.track_event = jasmine.createSpy();
}

function resetMegaplayaSpy() {
  window.megaplaya = {
    api_getCurrentVideo: jasmine.createSpy(),
    api_addListener: jasmine.createSpy(),
    api_playQueue: jasmine.createSpy(),
    api_nextVideo: jasmine.createSpy()
  };
}

function copyFixtures() {
  $("#fixtures").html($("#original_fixtures").text());
}
