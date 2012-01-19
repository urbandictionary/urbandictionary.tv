describe("urbandictionary.tv", function() {
  it("megaplaya_onvideoload", function() {
    window.urls = [];
    window.track_pageview = function() {};
    window.megaplaya = {
      api_getCurrentVideo: function() {
        return {definition: "the bird [is the word]", word: "the word", example: "everybody knows the [bird] is the word"};
      }
    };
    
    megaplaya_onvideoload();
    
    expect($("#word_txt a")).toHaveText("the word");
    expect($("#word_txt a")).toHaveAttr("href", "http://www.urbandictionary.com/define.php?term=the+word");
    
    expect($("#definition_txt")).toHaveText("the bird is the word");
    expect($("#definition_txt a")).toHaveText("is the word");
    
    expect($("#example_txt")).toHaveText("everybody knows the bird is the word");
    expect($("#example_txt a")).toHaveText("bird");
  });
});