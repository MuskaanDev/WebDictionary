chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received:", message);  // Debugging line

    if (message.action === "showTooltip") {
        console.log("Showing tooltip for:", message.word);  // Debugging line

        // Remove existing tooltip if any
        const existingTooltip = document.querySelector(".tooltip");
        if (existingTooltip) {
            existingTooltip.remove();
        }

        // Create a new tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = `${message.word}: ${message.definition}`;

        // Add basic styling for the tooltip
        tooltip.style.position = "absolute";
        tooltip.style.backgroundColor = "#333";
        tooltip.style.color = "#fff";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.padding = "5px";
        tooltip.style.borderRadius = "3px";
        tooltip.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.1)";
        tooltip.style.zIndex = "1000";
        tooltip.style.maxWidth = "300px";
        tooltip.style.zIndex = "1000";

        document.body.appendChild(tooltip);

        // Position the tooltip near the selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
            tooltip.style.left = `${rect.left + window.scrollX}px`;
        }

        // Remove the tooltip after 10 seconds
        setTimeout(() => {
            tooltip.remove();
        }, 10000);

        // Send response to acknowledge receipt of message
        sendResponse({status: "tooltip shown"});
    }
    return true;  // Keep the message channel open for sendResponse
});
