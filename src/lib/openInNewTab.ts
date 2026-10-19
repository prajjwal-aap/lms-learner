/**
 * Opens a tab synchronously (inside the click, so popup blockers allow it) and points it at a URL
 * that is fetched afterwards — e.g. short-lived signed download links. Falls back to the current tab.
 */
export async function openInNewTab(getUrl: () => Promise<string>): Promise<void> {
  const tab = window.open("about:blank", "_blank");
  try {
    const url = await getUrl();
    if (tab) {
      tab.opener = null;
      tab.location.href = url;
    } else {
      window.location.href = url;
    }
  } catch (e) {
    tab?.close();
    throw e;
  }
}
