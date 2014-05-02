describe("Application", function () {
  beforeEach(resetAppGlobals);
  beforeEach(copyFixtures);
  beforeEach(resetSpies);
  beforeEach(spyOnPermalink);

  describe("when a video starts", function () {
    beforeEach(function () {
      video_urls = videosFromResponse({videos: [CYBERHOBO, DOUCHEBAG]});

      megaplaya.api_getCurrentVideo.andReturn(video_urls[0]);
      onVideoLoad();
    });

    it("prints the word and links to urbandic", function () {
      expect($("#word_txt a")).toHaveText("cyberhobo");
      expect($("#word_txt a")).toHaveAttr("href", "http://www.urbandictionary.com/define.php?term=cyberhobo");
    });

    it("prints the definition and example, and links brackets to urbandic in a new window", function () {
      expect($("#definition_txt")).toHaveText(/A cyberhobo works/);
      expect($("#definition_txt a")).toHaveText("regular hobo");
      expect($("#definition_txt a")).toHaveAttr("href", "http://www.urbandictionary.com/define.php?term=regular%20hobo");
      expect($("#definition_txt a")).toHaveAttr("target", "_blank");

      expect($("#example_txt")).toHaveText(/The dot commer turned cyberhobo/);
      expect($("#example_txt a")).toHaveText("dot commer");
      expect($("#example_txt a")).toHaveAttr("href", "http://www.urbandictionary.com/define.php?term=dot%20commer");
      expect($("#example_txt a")).toHaveAttr("target", "_blank");
    });

    it("shows a link to the next word", function() {
      expect($('#next_word')).toHaveText(DOUCHEBAG.word);
      expect($('#next_word a')).toHaveAttr("href", "/#douchebag");
    });

    it("sets the permalink", function () {
      expect(permalink.set).toHaveBeenCalledWith("cyberhobo");
    });

    it("shows the video info from VHX", function() {
      findAjax('http://api.community.vhx.tv/info.json', {url: 'http://youtube.com/watch?v=y-D_5Pnl0Nc'})
        .success({
          video: {
            description: "http://cyberhobo.com - what is a CyberHobo anyways?",
            title: "What is a CyberHobo",
            url: "http://www.youtube.com/watch?v=y-D_5Pnl0Nc"
          }
        }
      );

      expect(megaplaya.api_growl).toHaveBeenCalledWith("<p>You're watching <span class='title'>What is a CyberHobo</span></p>");
      expect($('#video_info_text')).toHaveText(/What is a CyberHobo/);
      expect($('#video_info_text')).toHaveText(/cyberhobo\.com/);
      expect($('#video_info_text a')).toHaveAttr("href", "http://www.youtube.com/watch?v=y-D_5Pnl0Nc");
      expect($('#video_info_text a')).toHaveText("http://www.youtube.com/watch?v=y-D_5Pnl0Nc");
    });

    it("shows the vote counts", function () {
      findAjax('http://api.urbandictionary.com/v0/uncacheable', {ids: 964771, key: API_KEY})
        .success({thumbs: [
          {thumbs_up: 5, thumbs_down: 8}
        ]});

      expect($('#vote_up .vote_count')).toHaveText(5);
      expect($('#vote_down .vote_count')).toHaveText(8);
    });
  });

  describe("when the app starts", function() {
    describe("mobile is true", function () {
      beforeEach(function() {
        window.is_mobile = true;
      });

      describe("with a word in the permalink", function () {
        it("adds all videos for that word to the playlist, then adds other random videos", function () {
          permalink.get.andReturn("douche bag");
          documentReady();

          var ajaxOptions = findAjax('http://api.urbandictionary.com/v0/videos', {word: 'douche bag', key: API_KEY});
          $.ajax.reset();
          ajaxOptions.success({videos: [DOUCHEBAG, JOCKEYBRAWL]});

          expect(video_urls[0]).toEqual({
            defid: DOUCHEBAG.defid,
            definition: DOUCHEBAG.definition,
            example: DOUCHEBAG.example,
            id: DOUCHEBAG.id,
            word: DOUCHEBAG.word,
            youtube_id: DOUCHEBAG.youtube_id,
            index: 0,
            url: "http://youtube.com/watch?v=qqXi8WmQ_WM"
          });

          findAjax('http://api.urbandictionary.com/v0/videos').success({videos: [CYBERHOBO]});

          expect($.pluck(video_urls, 'id')).toEqual([DOUCHEBAG.id, JOCKEYBRAWL.id, CYBERHOBO.id]);
          expect(megaplaya.api_loadQueue).toHaveBeenCalledWith(video_urls);
          expect(megaplaya.api_setQueueAt).toHaveBeenCalledWith(0);
        });
      });

      describe("with no word in the permalink", function () {
        beforeEach(function () {
          documentReady();
        });

        it("adds videos to the queue when they are returned by the API", function () {
          var ajaxOptions = findAjax('http://api.urbandictionary.com/v0/videos');
          expect(ajaxOptions.data.hasOwnProperty('word')).toBeFalsy();
          ajaxOptions.success({videos: [JOCKEYBRAWL, CYBERHOBO]});

          expect($.pluck(video_urls, 'id')).toEqual([JOCKEYBRAWL.id, CYBERHOBO.id]);
          expect(megaplaya.api_playQueue).toHaveBeenCalledWith([JOCKEYBRAWL, CYBERHOBO]);
        });

        it("shows an error if the API returns zero videos", function () {
          findAjax('http://api.urbandictionary.com/v0/videos').success({videos: []});
          expect(window.alert).toHaveBeenCalledWith("Error, no videos found!");
        });
      });
    });

    describe("mobile is false", function() {
      beforeEach(function() {
        window.is_mobile = false;
      });

      it("adds flash to the page", function() {
        jasmine.getEnv().currentSpec.spyOn($.fn, 'flash', true);
        documentReady();

        expect($.fn.flash).toHaveBeenCalled();
        expect($.fn.flash.mostRecentCall.object).toEqual($('#player'));
        expect($.fn.flash.mostRecentCall.args[0].swf).toEqual('http://vhx.tv/embed/megaplaya');
      });

      it("adds a listener for the megaplaya onVideoLoad event", function() {
        spyOn($.fn, 'children').andReturn([megaplaya]);

        megaplaya_loaded();
        expect(megaplaya.api_addListener).toHaveBeenCalled();
        expect(megaplaya.api_setColor).toHaveBeenCalledWith("e86222");

        var addListenerArgs = $.grep(megaplaya.api_addListener.argsForCall, function(args) {
          return args[0] == 'onVideoLoad';
        })[0];

        megaplaya.api_getCurrentVideo.andReturn(CYBERHOBO);
        eval('(' + addListenerArgs[1] + ')()');
        expect(megaplaya.api_getCurrentVideo).toHaveBeenCalled();
      });
    });
  });
});
