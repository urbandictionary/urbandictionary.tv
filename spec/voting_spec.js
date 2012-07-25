describe("voting", function () {
  beforeEach(resetAppGlobals);
  beforeEach(copyFixtures);
  beforeEach(resetSpies);
  beforeEach(spyOnPermalink);

  beforeEach(function () {
    window.is_mobile = true;
    documentReady();

    video_urls = [ DOUCHEBAG, JOCKEYBRAWL ];
  });

  it("sends an up-vote", function () {
    $("#voting .vote[rel='up']").click();

    findAjax('http://api.urbandictionary.com/v0/vote', {defid: DOUCHEBAG.defid, direction: 'up', key: API_KEY}).success({status: 'saved'});

    expect($("#vote_up .vote_count")).toHaveText(1);
    expect($("#vote_up .vote_img")).toHaveClass("on");
  });

  it("sends an up-vote and adds one to the existing HTML", function () {
    $("#voting .vote[rel='up']").click();
    $("#vote_up .vote_count").html(50);

    findAjax('http://api.urbandictionary.com/v0/vote', {defid: DOUCHEBAG.defid, direction: 'up', key: API_KEY}).success({status: 'saved'});

    expect($("#vote_up .vote_count")).toHaveText(51);
  });

  it("sends an up-vote which is a duplicate, but sets the CSS class anyway", function () {
    $("#voting .vote[rel='up']").click();

    findAjax('http://api.urbandictionary.com/v0/vote', {defid: DOUCHEBAG.defid, direction: 'up', key: API_KEY}).success({status: 'duplicate'});

    expect($("#vote_up .vote_img")).toHaveClass("on");
  });

  it("sends a down-vote which is a duplicate, but doesn't set the CSS class", function () {
    $("#voting .vote[rel='down']").click();

    findAjax('http://api.urbandictionary.com/v0/vote', {defid: DOUCHEBAG.defid, direction: 'down', key: API_KEY}).success({status: 'duplicate'});

    expect($("#vote_down .vote_img")).not.toHaveClass("on");
  });

  it("sends a down-vote and skips to the next video", function () {
    $("#voting .vote[rel='down']").click();

    findAjax('http://api.urbandictionary.com/v0/vote', {defid: DOUCHEBAG.defid, direction: 'down', key: API_KEY}).success({status: 'saved'});

    expect($("#vote_up .vote_img")).not.toHaveClass("on");
    expect($("#vote_down .vote_img")).not.toHaveClass("on");

    expect(current_video_index).toEqual(1);
  });
});
