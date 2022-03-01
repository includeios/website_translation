// 默认开启同步滚动
chrome.storage.local.set({ isAsyncScroll: true });

chrome.action.onClicked.addListener(async (tab) => {
  const window = await chrome.windows.getCurrent();
  const originalTop = window.top;
  const originalLeft = window.left;
  const halfWidth = Math.floor(tab.width / 2);
  const halfHeight = Math.floor(tab.height / 2);

  // 屏幕是横屏or竖屏。横屏左右打开，竖屏上下打开
  const isVertical = window.width < window.height;
  const params = isVertical ? {
    width: window.width,
    height: halfHeight,
  } : {
    width: halfWidth,
    height: window.height,
  };

  // 更新当前窗口的尺寸
  chrome.windows.update(
    tab.windowId,
    params,
  );
  // 打开新窗口
  const newWindow = await chrome.windows.create({
    url: tab.url,
    top: isVertical ? halfHeight + originalTop : originalTop,
    left: isVertical ? originalLeft : halfWidth + originalLeft,
    focused: true,
    ...params,
  });

  const newTab = newWindow.tabs[0];
  // 由于有个网页加载过程，轮训查看新生成的tab url属性是否有值，有值后再做后续操作
  const interval = setInterval(() => {
    chrome.tabs.get(newTab.id, (tab) => {
      if (tab.url) {
        chrome.scripting.executeScript({
          target: { tabId: newTab.id },
          files: ['translate_page_script.js'],
        });
        clearInterval(interval);
      }
    });
  }, 1000);

  // 对原来窗口绑定script方法
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['original_page_script.js'],
  });
});