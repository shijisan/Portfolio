const screenshotCache = {};

export function checkLastScreenshotTime(projectName) {
  const lastScreenshotTime = screenshotCache[projectName];
  return lastScreenshotTime ? new Date(lastScreenshotTime) : null;
}

export function updateScreenshotTime(projectName) {
  screenshotCache[projectName] = new Date().toISOString(); 
}
