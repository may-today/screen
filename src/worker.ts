let timer: NodeJS.Timer | number = -1;
self.onmessage = function (e) {
  "interval:start" === e.data.command
    ? startTimer()
    : "interval:stop" === e.data.command && stopTimer();
};
const startTimer = function () {
  stopTimer();
  timer = setInterval(function () {
    self.postMessage("interval");
  }, 100);
};
const stopTimer = () => {
  clearInterval(timer);
  timer = -1;
};
