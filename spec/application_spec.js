describe("Application", function() {
  beforeEach(function() {
    jasmine.Ajax.useMock();

    window.urls = [];
    window.track_pageview = function() {};
    window.megaplaya = {
      api_getCurrentVideo: function() {
        return {definition: "the bird [is the word]", word: "the word", example: "everybody knows the [bird] is the word"};
      },
      api_addListener: function() {
      }
    };
  });

  describe("megaplaya_onvideoload", function() {
    beforeEach(function() {
      megaplaya_callback('onVideoLoad');
    });

    it("prints the word and links to urbandic", function() {
      expect($("#word_txt a")).toHaveText("the word");
      expect($("#word_txt a")).toHaveAttr("href", "http://www.urbandictionary.com/define.php?term=the+word");
    });
  
    it("prints the definition and example, and links brackets to urbandic in a new window", function() {
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

  describe("megaplaya_loaded", function() {
    xit("loads words from urbandictionary.com", function() {
      window.is_mobile = true;
      megaplaya_loaded();
      
      spyOn(window, "alert");
      expect(window.alert).toHaveBeenCalledWith("Error, no videos found!");
    });
  });
});