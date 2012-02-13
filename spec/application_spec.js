describe("Application", function () {
  beforeEach(function () {
    spyOn($, 'ajax');
    spyOn(window, 'alert');
    spyOn(Permalink, 'set');
    spyOn(Permalink, 'get');

    window.urls = [];
    window.track_pageview = function () {
    };
    window.megaplaya = {
      api_getCurrentVideo:function () {
        return {definition:"the bird [is the word]", word:"the word", example:"everybody knows the [bird] is the word"};
      },
      api_addListener:function () {
      },
      api_playQueue:jasmine.createSpy()
    };
  });

  describe("megaplaya_onvideoload", function () {
    beforeEach(function () {
      megaplaya_callback('onVideoLoad');
    });

    it("prints the word and links to urbandic", function () {
      expect($("#word_txt a")).toHaveText("the word");
      expect($("#word_txt a")).toHaveAttr("href", "http://www.urbandictionary.com/define.php?term=the+word");
    });

    it("prints the definition and example, and links brackets to urbandic in a new window", function () {
      expect($("#definition_txt")).toHaveText("the bird is the word");
      expect($("#definition_txt a")).toHaveText("is the word");
      expect($("#definition_txt a")).toHaveAttr("href", "http://www.urbandictionary.com/define.php?term=is%20the%20word");
      expect($("#definition_txt a")).toHaveAttr("target", "_blank");

      expect($("#example_txt")).toHaveText("everybody knows the bird is the word");
      expect($("#example_txt a")).toHaveText("bird");
      expect($("#example_txt a")).toHaveAttr("href", "http://www.urbandictionary.com/define.php?term=bird");
      expect($("#example_txt a")).toHaveAttr("target", "_blank");
    });
  });

  describe("megaplaya_loaded", function () {
    it("shows an error if the API returns zero videos", function () {
      window.is_mobile = true;
      megaplaya_loaded();

      expect($.ajax).toHaveBeenCalled();
      $.ajax.mostRecentCall.args[0].success({videos:[]});

      expect(window.alert).toHaveBeenCalledWith("Error, no videos found!");
    });

    it("adds videos to the queue when they are returned by the API", function () {
      window.is_mobile = true;
      megaplaya_loaded();

      var videos = [
        {
          "defid":1,
          "definition":"Minus distinctio aperiam facere. In veniam quia sed error.",
          "example":"Word Omnis error placeat nulla. Omnis natus sed beatae.",
          "id":1,
          "word":"yeah yeah",
          "youtube_id":"5154daf9e73"
        }
      ];

      expect($.ajax).toHaveBeenCalled();
      $.ajax.mostRecentCall.args[0].success({ "videos":videos });

      expect(megaplaya.api_playQueue).toHaveBeenCalledWith(videos);
    });
  });
});