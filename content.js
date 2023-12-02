console.log("Content script loaded!");

function getLinks(emailContents) {
    let links = emailContents[0].innerHTML.match(/<a[^>]*>.*?<\/a>/g);

    chrome.runtime.sendMessage({links: links}, function(response) {
        if (response.xssFound) {
          for (let i = 0; i < response.xssLinks.length; i++) {
            let link = response.xssLinks[i];
            // update the link text
            let newLink = "<p>Malicious link detected: " + link + "</p>";
            emailContents[0].innerHTML = emailContents[0].innerHTML.replace(link, newLink);
          }
        }
    });
}

if (document.URL.includes("mail.google.com")) {
    let emailContents = document.getElementsByClassName("gs");

    // if page hasn't loaded yet, try again every 100ms for 10 seconds
    if (emailContents.length == 0) {
        let count = 0;
        let interval = setInterval(function() {
            emailContents = document.getElementsByClassName("gs");
            if (emailContents.length > 0) {
                clearInterval(interval);
                getLinks(emailContents);
            }
            else if (count > 100) {
                clearInterval(interval);
            }
            count++;
        }, 100);
    }
    else {
        getLinks(emailContents);
    }
}