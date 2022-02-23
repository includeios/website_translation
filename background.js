function originalPageScroll() {
  document.addEventListener('scroll', () => {
    chrome.storage.local.set({
      is_focused_original_page: true,
      original_scroll_top: document.documentElement.scrollTop,
    });
  }, {passive: true});
  chrome.storage.onChanged.addListener(async function (changes) {
    const { is_focused_original_page } = await chrome.storage.local.get('is_focused_original_page');
    if (!is_focused_original_page) {
      document.documentElement.scrollTop = changes.translat_scroll_top.newValue;
    }
  });
}

function translatePageScroll() {
  document.addEventListener('scroll', () => {
    chrome.storage.local.set({
      is_focused_original_page: false,
      translat_scroll_top: document.documentElement.scrollTop,
    });
  }, {passive: true});
  chrome.storage.onChanged.addListener(async function (changes) {
    const { is_focused_original_page } = await chrome.storage.local.get('is_focused_original_page');
    if (is_focused_original_page) {
      document.documentElement.scrollTop = changes.original_scroll_top.newValue;
    }
  });
}

chrome.action.onClicked.addListener((tab) => {
  const halfWidth = Math.floor(tab.width / 2);

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: originalPageScroll,
  });

  chrome.windows.update(
    tab.windowId,
    { width: halfWidth },
  );
  chrome.windows.create({
    url: tab.url,
    width: halfWidth,
    left: halfWidth,
    top: 0,
    focused: true,
  }, (window) => {
    const newTab = window.tabs[0];
    // 由于有个网页加载过程，轮训查看新生成的tab url属性是否有值，有值后再做后续操作
    const interval = setInterval(() => {
      chrome.tabs.get(newTab.id, (tab) => {
        if (tab.url) {
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            func: translatePageScroll,
          });
          clearInterval(interval);
        }
      });
    }, 1000);
  });
});
