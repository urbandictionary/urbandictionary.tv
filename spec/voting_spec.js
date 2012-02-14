describe("voting", function () {
  beforeEach(resetAppGlobals);
  beforeEach(copyFixtures);
  beforeEach(resetSpies);
  beforeEach(spyOnPermalink);

  beforeEach(function () {
    window.is_mobile = true;
    documentReady();

    video_urls = [
      {
        "defid": 1,
        "definition": "Minus distinctio aperiam facere.",
        "example": "Word Omnis error placeat nulla.",
        "id": 1,
        "word": "yeah yeah",
        "youtube_id": "5154daf9e73"
      },
      {
        "defid": 2,
        "definition": "In veniam quia sed error.",
        "example": "Omnis natus sed beatae.",
        "id": 2,
        "word": "no no",
        "youtube_id": "47231987"
      },
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

  it("sends a down-vote which is a duplicate, but doesn't set the CSS class", function () {
    $("#voting .vote[rel='down']").click();

    AjaxSpy.callSuccess(
      WWW + '/thumbs.php?defid=1&direction=down',
      {'status': 'duplicate'}
    );

    expect($("#vote_down .vote_img")).not.toHaveClass("on");
  });

  it("sends a down-vote and skips to the next video", function () {
    $("#voting .vote[rel='down']").click();

    AjaxSpy.callSuccess(
      WWW + '/thumbs.php?defid=1&direction=down',
      {'status': 'saved'}
    );

    expect($("#vote_up .vote_img")).not.toHaveClass("on");
    expect($("#vote_down .vote_img")).not.toHaveClass("on");

    expect(current_video_index).toEqual(1);
  });
});
