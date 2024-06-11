chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "getWordMeaning",
        title: "Get Meaning",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "getWordMeaning") {
        fetchDefinition(info.selectionText, tab.id);
    }
});

function fetchDefinition(word, tabId) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0 && data[0].meanings) {
                const meanings = data[0].meanings;
                const definitions = meanings.map(meaning => {
                    return `${meaning.partOfSpeech}: ${meaning.definitions.map(def => def.definition).join(", ")}`;
                }).join("\n");

                chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    files: ['content.js']
                }, () => {
                    chrome.tabs.sendMessage(tabId, { action: "showTooltip", word: data[0].word, definition: definitions }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError.message);
                        } else if (response && response.status === "tooltip shown") {
                            console.log("Tooltip shown successfully");
                        } else {
                            console.log("Message sent successfully:", response);
                        }
                    });
                });
            } else {
                console.error("Error: Invalid definition data received");
            }
        })
        .catch(error => console.error('Error:', error));
}
