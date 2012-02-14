describe("Application", function () {
  beforeEach(resetAppGlobals);
  beforeEach(copyFixtures);
  beforeEach(resetSpies);
  beforeEach(spyOnPermalink);

  describe("megaplaya_onvideoload", function () {
    beforeEach(function () {
      megaplaya.api_getCurrentVideo.andReturn({
        definition: "the bird [is the word]",
        word: "the word",
        example: "everybody knows the [bird] is the word",
        defid: 1,
        id: 1,
        youtube_id: "5154daf9e73"
      });

      megaplaya_callback('onVideoLoad');
    });

    it("prints the word and links to urbandic", function () {
      expect($("#word_txt a")).toHaveText("the word");
      expect($("#word_txt a")).toHaveAttr("href", WWW + "/define.php?term=the+word");
    });

    it("prints the definition and example, and links brackets to urbandic in a new window", function () {
      expect($("#definition_txt")).toHaveText("the bird is the word");
      expect($("#definition_txt a")).toHaveText("is the word");
      expect($("#definition_txt a")).toHaveAttr("href", WWW + "/define.php?term=is%20the%20word");
      expect($("#definition_txt a")).toHaveAttr("target", "_blank");

      expect($("#example_txt")).toHaveText("everybody knows the bird is the word");
      expect($("#example_txt a")).toHaveText("bird");
      expect($("#example_txt a")).toHaveAttr("href", WWW + "/define.php?term=bird");
      expect($("#example_txt a")).toHaveAttr("target", "_blank");
    });

    it("sets the permalink", function () {
      expect(Permalink.set).toHaveBeenCalledWith("the+word");
    });

    it("fetches video info from VHX and fetches thumbs from UD", function () {
      expect(AjaxSpy.allUrls()).toEqual([
        'http://api.vhx.tv/info.json?url=undefined',
        WWW + '/uncacheable.php?ids=1'
      ]);
    });

    it("shows the vote counts", function () {
      AjaxSpy.callSuccess(
        WWW + '/uncacheable.php?ids=1',
        {thumbs: [
          {thumbs_up: 5, thumbs_down: 8}
        ]}
      );

      expect($('#vote_up .vote_count')).toHaveText(5);
      expect($('#vote_down .vote_count')).toHaveText(8);
    });
  });

  describe("megaplaya_loaded", function () {
    describe("with a word in the Permalink", function () {
      it("appends to the playlist", function () {
        window.is_mobile = true;
        Permalink.get.andReturn("a word");
        megaplaya_loaded();

        var videos = [
          {
            "defid": 1,
            "definition": "Minus distinctio aperiam facere. In veniam quia sed error.",
            "example": "Word Omnis error placeat nulla. Omnis natus sed beatae.",
            "id": 1,
            "word": "yeah yeah",
            "youtube_id": "5154daf9e73"
          }
        ];

        AjaxSpy.callSuccess(
          WWW + '/iphone/search/videos?word=a%20word',
          {videos: videos}
        );
      });
    });

    describe("with no word in the Permalink", function () {
      beforeEach(function () {
        window.is_mobile = true;
        megaplaya_loaded();
      });

      it("shows an error if the API returns zero videos", function () {
        AjaxSpy.callSuccess(
          WWW + '/iphone/search/videos?random=1',
          {videos: []}
        );

        expect(window.alert).toHaveBeenCalledWith("Error, no videos found!");
      });

      it("adds videos to the queue when they are returned by the API", function () {
        var videos = [
          {
            "defid": 1,
            "definition": "Minus distinctio aperiam facere. In veniam quia sed error.",
            "example": "Word Omnis error placeat nulla. Omnis natus sed beatae.",
            "id": 1,
            "word": "yeah yeah",
            "youtube_id": "5154daf9e73"
          }
        ];

        AjaxSpy.callSuccess(
          WWW + '/iphone/search/videos?random=1',
          {videos: videos}
        );

        expect(megaplaya.api_playQueue).toHaveBeenCalledWith(videos);
      });
    });
  });
});