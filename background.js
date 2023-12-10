console.log("Background script loaded!");

const HTMLDomEvents = ["abort", "afterprint", "animationend", "animationiteration", "animationstart", "beforeprint", "beforeunload", "blur", "canplay", "canplaythrough", "change", "click", "contextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "ended", "error", "focus", "focusin", "focusout", "fullscreenchange", "fullscreenerror", "hashchange", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "message", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "offline", "online", "open", "pagehide", "pageshow", "paste", "pause", "play", "playing", "popstate", "progress", "ratechange", "resize", "reset", "scroll", "search", "seeked", "seeking", "select", "show", "stalled", "storage", "submit", "suspend", "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitionend", "unload", "volumechange", "waiting", "wheel"];
const HTMLTags = ["a", "a2", "abbr", "acronym", "address", "animate", "animatemotion", "animatetransform", "applet", "area", "article", "aside", "audio", "audio2", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "content", "custom tags", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "head", "header", "hgroup", "hr", "html", "i", "iframe", "iframe2", "image", "image2", "image3", "img", "img2", "input", "input2", "input3", "input4", "ins", "kbd", "keygen", "label", "legend", "li", "link", "listing", "main", "map", "mark", "marquee", "menu", "menuitem", "meta", "meter", "multicol", "nav", "nextid", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section", "select", "set", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "video2", "wbr", "xmp"];

function checkLink(link) {
  let linkHref = link.match(/href=".*?"/g);
  if (linkHref) {
    if (linkHref[0].includes("javascript:") || linkHref[0].includes("style=")) {
      return true;
    } else {
      for (let i = 0; i < HTMLDomEvents.length; i++) {
        if (linkHref[0].includes(("on" + HTMLDomEvents[i]))) {
          return true;
        }
      }
      for (let i = 0; i < HTMLTags.length; i++) {
        if (linkHref[0].includes(("<" + HTMLTags[i] + "/>"))) {
          return true;
        }
        if (linkHref[0].includes(("<" + HTMLTags[i]))) {
          let openTag = linkHref[0].substring(linkHref[0].indexOf("<" + HTMLTags[i]));
          if (openTag.includes("/>")) {
            return true;
          }
        }
      }
      if (linkHref[0].includes(".js")) {
        return true;
      }
    }
  }
  
  let embeddedLinks = link.match(/<\s*(?:iframe|script).*?src\s*=\s*["'](.*?)["']/);
  if (embeddedLinks) {
    for (let i = 1; i < embeddedLinks.length; i++) {
      if (checkLink("href=\"" + embeddedLinks[i] + "\"")) {
        return true;
      }
    }
  }
  return false;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  let xssFound = false;
  let xssLinks = [];

  if (request.links) {
    for (let i = 0; i < request.links.length; i++) {
      if (checkLink(request.links[i])) {
        xssFound = true;
        xssLinks.push(request.links[i]);
        break;
      }
    }
  }

  sendResponse({xssFound: xssFound, xssLinks: xssLinks});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // if the page has loaded, send message to content script
  if (changeInfo.status == "complete") {
    chrome.tabs.sendMessage(tabId, {message: "pageLoaded"}, function(response) {
      if (response) {
        console.log(response.message);
      }
    });
  }
});