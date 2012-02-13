function printBrackets(string, element) {
  function onInsideBracket(string) {
    var href = "http://www.urbandictionary.com/define.php?term=" + encodeURIComponent(string);
    var anchor = $("<a>").attr("href", href).attr('target', '_blank').text(string);
    element.append(anchor);
  }

  function onOutsideBracket(string) {
    element.append($("<span>").text(string).html().replace(/\n/g, "<br/>"));
  }

  if (string) {
    string = string.replace(/\[word\]/g, "[");
    string = string.replace(/\[\/word\]/g, "]");

    var splitByOpen = string.split("[");
    if (splitByOpen[0] != "") {
      onOutsideBracket(splitByOpen[0]);
    }

    for (var i = 1; i < splitByOpen.length; i++) {
      var splitByClose = splitByOpen[i].split("]");
      onInsideBracket(splitByClose[0]);

      if (splitByClose[1] != "") {
        onOutsideBracket(splitByClose[1]);
      }
    }
  }
}