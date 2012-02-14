describe("Application", function () {
  beforeEach(resetAppGlobals);
  beforeEach(copyFixtures);
  beforeEach(resetSpies);
  beforeEach(spyOnPermalink);

  describe("megaplaya_onvideoload", function () {
    beforeEach(function () {
      megaplaya.api_getCurrentVideo.andReturn(CYBERHOBO);
      megaplaya_callback('onVideoLoad');
    });

    it("prints the word and links to urbandic", function () {
      expect($("#word_txt a")).toHaveText("cyberhobo");
      expect($("#word_txt a")).toHaveAttr("href", WWW + "/define.php?term=cyberhobo");
    });

    it("prints the definition and example, and links brackets to urbandic in a new window", function () {
      expect($("#definition_txt")).toHaveText(/A cyberhobo works/);
      expect($("#definition_txt a")).toHaveText("regular hobo");
      expect($("#definition_txt a")).toHaveAttr("href", WWW + "/define.php?term=regular%20hobo");
      expect($("#definition_txt a")).toHaveAttr("target", "_blank");

      expect($("#example_txt")).toHaveText(/The dot commer turned cyberhobo/);
      expect($("#example_txt a")).toHaveText("dot commer");
      expect($("#example_txt a")).toHaveAttr("href", WWW + "/define.php?term=dot%20commer");
      expect($("#example_txt a")).toHaveAttr("target", "_blank");
    });

    it("sets the permalink", function () {
      expect(permalink.set).toHaveBeenCalledWith("cyberhobo");
    });

    it("fetches video info from VHX and fetches thumbs from UD", function () {
      expect(AjaxSpy.allUrls()).toEqual([
        'http://api.vhx.tv/info.json?url=undefined',
        WWW + '/uncacheable.php?ids=964771'
      ]);
    });

    it("shows the vote counts", function () {
      AjaxSpy.find(WWW + '/uncacheable.php?ids=964771').success({thumbs: [ {thumbs_up: 5, thumbs_down: 8} ]});

      expect($('#vote_up .vote_count')).toHaveText(5);
      expect($('#vote_down .vote_count')).toHaveText(8);
    });
  });

  describe("megaplaya_loaded", function () {
    beforeEach(function() {
      window.is_mobile = true;
    });

    describe("with a word in the permalink", function () {
      it("adds one video for that word to the playlist, plus other random videos", function () {
        permalink.get.andReturn("douche bag");
        documentReady();

        AjaxSpy.find(WWW + '/iphone/search/videos?word=douche%20bag').success({videos: [DOUCHEBAG]});

        expect(video_urls).toEqual([
          {
            defid: DOUCHEBAG.defid,
            definition: DOUCHEBAG.definition,
            example: DOUCHEBAG.example,
            id: DOUCHEBAG.id,
            word: DOUCHEBAG.word,
            youtube_id: DOUCHEBAG.youtube_id,
            index: 0,
            url: "http://youtube.com/watch?v=qqXi8WmQ_WM"
          }
        ]);

        AjaxSpy.find(WWW + '/iphone/search/videos?random=1').success({videos: [CYBERHOBO]});

        expect($.pluck(video_urls, 'id')).toEqual([DOUCHEBAG.id, CYBERHOBO.id]);

        expect(megaplaya.api_loadQueue).toHaveBeenCalledWith(video_urls);
        expect(megaplaya.api_setQueueAt).toHaveBeenCalledWith(0);
      });
    });

    describe("with no word in the permalink", function () {
      beforeEach(function () {
        documentReady();
      });

      it("shows an error if the API returns zero videos", function () {
        AjaxSpy.find(WWW + '/iphone/search/videos?random=1').success({videos: []});
        expect(window.alert).toHaveBeenCalledWith("Error, no videos found!");
      });

      it("adds videos to the queue when they are returned by the API", function () {
        AjaxSpy.find(WWW + '/iphone/search/videos?random=1').success({videos: [JOCKEYBRAWL, CYBERHOBO]});
        expect(megaplaya.api_playQueue).toHaveBeenCalledWith([JOCKEYBRAWL, CYBERHOBO]);
      });
    });
  });

  describe("document ready", function() {
    it("adds flash to the page", function() {
      jQuery.fn.flash = jasmine.createSpy();

      window.is_mobile = false;
      documentReady();

      expect(jQuery.fn.flash).toHaveBeenCalled();
      expect(jQuery.fn.flash.mostRecentCall.object).toEqual($('#player'));
      expect(jQuery.fn.flash.mostRecentCall.args[0].swf).toEqual('http://vhx.tv/embed/megaplaya');
    })
  })
});