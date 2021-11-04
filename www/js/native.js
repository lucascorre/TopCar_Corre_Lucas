window.addEventListener("batterystatus", onBatteryStatus, false);

function onBatteryStatus(status) {
    alert("Level: " + status.level + " isPlugged: " + status.isPlugged);
}

document.addEventListener("offline", onOffline, false);

function onOffline() {
    alert("You are Disconnected");
}

const openInAppBrowserOptions = "location=yes,zoom=false";

const openInAppBrowser = (link) => {
  cordova.InAppBrowser.open(link, "_blank", openInAppBrowserOptions);
};

const deviceReady = () => {
  window.addEventListener("batterystatus", onBatteryStatus, false);
  window.addEventListener("offline", onOffline, false);
};
