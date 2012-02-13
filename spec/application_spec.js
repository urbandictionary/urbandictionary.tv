describe("Application", function () {
  beforeEach(function () {
    spyOn($, 'ajax');
    spyOn(window, 'alert');
    spyOn(Permalink, 'set');
    spyOn(Permalink, 'get');

    window.urls = [];
    window.track_pageview = jasmine.createSpy();
    window.megaplaya = {
      api_getCurrentVideo:jasmine.createSpy(),
      api_addListener:jasmine.createSpy(),
      api_playQueue:jasmine.createSpy()
    };
  });

  describe("megaplaya_onvideoload", function () {
    beforeEach(function () {
      megaplaya.api_getCurrentVideo.andReturn({
        definition:"the bird [is the word]",
        word:"the word",
        example:"everybody knows the [bird] is the word"
      });

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

    it("sets the permalink", function () {
      expect(Permalink.set).toHaveBeenCalledWith("the+word");
    });

    it("double encodes the word in Permalink.set on line 224");
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