var WWW = 'http://www.urbandictionary.com';

describe("Application", function () {
  describe("bugs", function () {
    describe("in the app", function () {
      it("double encodes the word in Permalink.set on line 224");
      it("doesn't pass the video URL to the VHX API, so the growl doesn't show");
      it("doesn't HTML escape the video title in the growl");
      it("splits the current word by spaces on line 446");
    });

    describe("in the tests", function () {
      it("doesn't reset the HTML fixtures on every spec");
      it("doesn't test when is_mobile is false");
      it("doesn't reset all the globals in the app");
    });
  });

  beforeEach(function () {
    spyOn($, 'ajax');
    spyOn(window, 'alert');
    spyOn(Permalink, 'set');
    spyOn(Permalink, 'get');

    window.current_video_index = 0;
    window.is_mobile = false;

    window.urls = [];
    window.video_urls = false;

    window.track_pageview = jasmine.createSpy();
    window.track_event = jasmine.createSpy();

    $("#fixtures").html($("#original_fixtures").text());

    window.megaplaya = {
      api_getCurrentVideo: jasmine.createSpy(),
      api_addListener: jasmine.createSpy(),
      api_playQueue: jasmine.createSpy(),
      api_nextVideo: jasmine.createSpy()
    };
  });

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

  describe("voting", function () {
    beforeEach(function () {
      window.is_mobile = true;
      document_ready();

      video_urls = [
        {
          "defid": 1,
          "definition": "Minus distinctio aperiam facere. In veniam quia sed error.",
          "example": "Word Omnis error placeat nulla. Omnis natus sed beatae.",
          "id": 1,
          "word": "yeah yeah",
          "youtube_id": "5154daf9e73"
        }
      ];
    });

    it("sends an up-vote", function () {
      $("#voting .vote[rel='up']").click();

      AjaxSpy.callSuccess(
        WWW + '/thumbs.php?defid=1&direction=up',
        {'status': 'saved'}
      );

      expect($("#vote_up .vote_count")).toHaveText(1);
      expect($("#vote_up .vote_img")).toHaveClass("on");
    });

    it("sends an up-vote and adds one to the existing HTML", function () {
      $("#voting .vote[rel='up']").click();
      $("#vote_up .vote_count").html(50);

      AjaxSpy.callSuccess(
        WWW + '/thumbs.php?defid=1&direction=up',
        {'status': 'saved'}
      );

      expect($("#vote_up .vote_count")).toHaveText(51);
    });

    it("sends an up-vote which is a duplicate, but sets the CSS class anyway", function () {
      $("#voting .vote[rel='up']").click();

      AjaxSpy.callSuccess(
        WWW + '/thumbs.php?defid=1&direction=up',
        {'status': 'duplicate'}
      );

      expect($("#vote_up .vote_img")).toHaveClass("on");
    });

    xit("sends a down-vote and skips to the next video", function () {
      $("#voting .vote[rel='down']").click();

      AjaxSpy.callSuccess(
        WWW + '/thumbs.php?defid=1&direction=up',
        {}
      );
    });
  });
});