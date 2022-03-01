document.addEventListener('scroll', () => {
  chrome.storage.local.set({
    originalScrollTop: document.documentElement.scrollTop,
  });
}, { passive: true });

document.addEventListener('mouseenter', () => {
  chrome.storage.local.set({
    isFocusedOriginalPage: true,
  });
});

async function handleSyncScroll() {
  const {
    isFocusedOriginalPage,
    isAsyncScroll,
    translatScrollTop,
  } = await chrome.storage.local.get([
    'isFocusedOriginalPage',
    'isAsyncScroll',
    'translatScrollTop',
  ]);
  if (!isFocusedOriginalPage && isAsyncScroll) {
    document.documentElement.scrollTop = translatScrollTop;
  }
  window.requestAnimationFrame(handleSyncScroll);
}
window.requestAnimationFrame(handleSyncScroll);