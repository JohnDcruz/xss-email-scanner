console.log("Content script loaded!");

function getLinks(links, emailContents) {
    chrome.runtime.sendMessage({links: links}, function(response) {
        if (response.xssFound) {
          for (let i = 0; i < response.xssLinks.length; i++) {
            let link = response.xssLinks[i];
            let linkText = link.substring(link.indexOf(">") + 1, link.indexOf("</a>"));
            let linkHref = link.match(/href=".*?"/g);
            let newLink = "<p style=\"color:red;\">(Malicious link detected: \"" + linkText + "\": " + linkHref + ")</p>";
            emailContents.innerHTML = emailContents.innerHTML.replace(link, newLink);
          }
        }
    });
}

// get message from background when page has loaded
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message == "pageLoaded") {
      if (document.URL.includes("mail.google.com")) {
        let emailContents = document.getElementsByClassName("gs");
    
        // if page hasn't loaded yet, try again every 100ms for 10 seconds
        if (emailContents.length == 0) {
            let count = 0;
            let interval = setInterval(function() {
                emailContents = document.getElementsByClassName("gs");
                if (emailContents.length > 0) {
                    clearInterval(interval);
                    getLinks(emailContents[0].innerHTML.match(/<a[^>]*>.*?<\/a>/g), emailContents[0]);
                }
                else if (count > 100) {
                    clearInterval(interval);
                }
                count++;
            }, 100);
        }
        else {
            getLinks(emailContents[0].innerHTML.match(/<a[^>]*>.*?<\/a>/g), emailContents[0]);
        }
      } else if (document.URL.includes("outlook.office.com")) {
        let emailContents = document.getElementById("UniqueMessageBody");
    
        // if page hasn't loaded yet, try again every 100ms for 10 seconds
        if (emailContents == null) {
            let count = 0;
            let interval = setInterval(function() {
                emailContents = document.getElementById("UniqueMessageBody");
                if (emailContents != null) {
                    clearInterval(interval);
                    getLinks(emailContents.innerHTML.match(/<a[^>]*>.*?<\/a>/g), emailContents);
                }
                else if (count > 100) {
                    clearInterval(interval);
                }
                count++;
            }, 100);
        }
        else {
            getLinks(emailContents.innerHTML.match(/<a[^>]*>.*?<\/a>/g), emailContents);
        }
      }
    }
  
    sendResponse({message: "Content script received message"});
});