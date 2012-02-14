var WWW = 'http://www.urbandictionary.com';

$.pluck = function(list, attribute) {
  return $.map(list, function(item) {
    return item[attribute];
  });
};

var AjaxSpy = {
  allUrls: function () {
    return $.map($.ajax.argsForCall, function (args) {
      return args[0].url;
    });
  },

  find: function(url) {
    expect($.ajax).toHaveBeenCalled();

    var list = $.grep($.ajax.argsForCall, function (args) {
      return args[0].url == url;
    });

    expect(list.length).toEqual(1);
    var matchedArgs = list[0];
    return matchedArgs[0];
  }
};

function resetAppGlobals() {
  reset_globals();
  window.is_mobile = false;
}

function resetSpies() {
  window.track_pageview = jasmine.createSpy();
  window.track_event = jasmine.createSpy();

  window.megaplaya = jasmine.createSpyObj('megaplaya', ['api_getCurrentVideo', 'api_addListener', 'api_playQueue', 'api_nextVideo', 'api_loadQueue', 'api_setQueueAt']);
}

function copyFixtures() {
  $("#fixtures").html($("#original_fixtures").text());
}

beforeEach(function () {
  spyOn($, 'ajax');
  spyOn(window, 'alert');
});

function spyOnPermalink() {
  spyOn(permalink, 'set');
  spyOn(permalink, 'get');
}

beforeEach(function() {
  window.DOUCHEBAG = {
    defid: 1072230,
    definition: "Someone who has surpassed the levels of jerk and asshole, however not yet reached fucker or motherfucker. Not to be confuzed with [douche].",
    example: "Rob:He kept hitting on my girlfriend at the party, he just wouldnt leave her alone!!\r\nSam: God, what a douchebag.",
    id: 1410,
    word: "douchebag",
    youtube_id: "qqXi8WmQ_WM"
  };

  window.JOCKEYBRAWL = {
    defid: 6006390,
    definition: "A total clusterfuck with an added element of the ridiculous.",
    example: "Work was a total jockeybrawl today. An entire semi full of chickens tipped over on the jobsite.",
    id: 1672,
    word: "jockeybrawl",
    youtube_id: "lujax6gMAqU"
  };

  window.CYBERHOBO = {
    defid: 964771,
    definition: "A cyberhobo works and travels around like a [regular hobo], but rides around for free on the net instead of hopping trains.",
    example: "The [dot commer] turned cyberhobo when the bubble burst.",
    id: 30017,
    word: "cyberhobo",
    youtube_id: "y-D_5Pnl0Nc"
  };
});
