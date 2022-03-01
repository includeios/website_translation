const PANNEL_ID = 'website-translate-options-pannel';
// 生成选择是否同步滚动的浮窗
const pannel = document.createElement('div');
pannel.id = PANNEL_ID;
pannel.innerHTML = `<div>是否开启滚动同步</div>
<div>
  <button id="open" type="button" style="background: #999">开启</button>
  <button id="close" type="button">关闭</button>
</div>`;
pannel.setAttribute('style', `position: fixed;
    top: 24px;
    right: 24px;
    z-index: 10000;
    font-size: 14px;
    background-color: #fafafa;
    border: 1px solid #eaeefb;
    padding: 12px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    border-radius: 4px;`);
document.body.appendChild(pannel);

// 监听浮窗中的按钮点击，同步isAsyncScroll状态
const openButton = document.querySelector(`#${PANNEL_ID} #open`);
const closeButton = document.querySelector(`#${PANNEL_ID} #close`)
document.querySelectorAll(`#${PANNEL_ID} button`).forEach(domItem => {
  domItem.addEventListener('click', function (event) {
    if (event.target.innerHTML.includes('开启')) {
      chrome.storage.local.set({ isAsyncScroll: true });
      openButton.setAttribute('style', 'background: #999');
      closeButton.setAttribute('style', 'background: none');
    } else {
      chrome.storage.local.set({ isAsyncScroll: false });
      closeButton.setAttribute('style', 'background: #999');
      openButton.setAttribute('style', 'background: none');
    }
  });
});

// 判断当前是否聚焦在新打开的屏幕中
document.addEventListener('mouseenter', () => {
  chrome.storage.local.set({
    isFocusedOriginalPage: false,
  });
});

// 监听页面滚动，实时记录当前页面的滚动高度
document.addEventListener('scroll', () => {
  chrome.storage.local.set({
    translatScrollTop: document.documentElement.scrollTop,
  });
}, { passive: true });

// requestAnimationFrame 实时更新页面的滚动。
// 之所以用requestAnimationFrame而不是监听chrome.storage的变化，是因为chrome对于storage的变化做了优化处理，
// 不会实时的触发onchange的监听，导致两边滚动不能流畅的同步
async function handleAsyncScroll() {
  const {
    isFocusedOriginalPage,
    isAsyncScroll,
    originalScrollTop,
  } = await chrome.storage.local.get([
    'isFocusedOriginalPage',
    'isAsyncScroll',
    'originalScrollTop',
  ]);
  // 当聚焦在原来的屏幕中且开启了实时同步
  if (isFocusedOriginalPage && isAsyncScroll) {
    document.documentElement.scrollTop = originalScrollTop;
  }
  window.requestAnimationFrame(handleAsyncScroll);
}
window.requestAnimationFrame(handleAsyncScroll);