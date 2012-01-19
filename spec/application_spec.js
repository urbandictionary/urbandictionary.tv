describe("megaplaya_onvideoload", function() {
  beforeEach(function() {
    window.urls = [];
    window.track_pageview = function() {};
    window.megaplaya = {
      api_getCurrentVideo: function() {
        return {definition: "the bird [is the word]", word: "the word", example: "everybody knows the [bird] is the word"};
      }
    };

    megaplaya_onvideoload();
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