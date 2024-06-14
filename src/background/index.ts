let extensionTabId = null


const createTab = () => {
    chrome.tabs.create({ url: "tabs/index.html" }).then(tab => {
        extensionTabId = tab.id
    })
}

chrome.action.onClicked.addListener(() => {
    if (extensionTabId) {
        chrome.tabs.get(extensionTabId, (tab) => {
            if (tab) {
                chrome.tabs.update(extensionTabId, { active: true })
            } else {
                createTab()
            }
        }
        )
    } else {
        createTab()
    }

})