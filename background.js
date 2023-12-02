console.log("Background script loaded!");

const HTMLDomEvents = ["abort", "afterprint", "animationend", "animationiteration", "animationstart", "beforeprint", "beforeunload", "blur", "canplay", "canplaythrough", "change", "click", "contextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "ended", "error", "focus", "focusin", "focusout", "fullscreenchange", "fullscreenerror", "hashchange", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "message", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "offline", "online", "open", "pagehide", "pageshow", "paste", "pause", "play", "playing", "popstate", "progress", "ratechange", "resize", "reset", "scroll", "search", "seeked", "seeking", "select", "show", "stalled", "storage", "submit", "suspend", "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitionend", "unload", "volumechange", "waiting", "wheel"];

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