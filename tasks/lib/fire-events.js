var event,
    name = arguments[1];
if (document.createEvent) {
  event = document.createEvent('HTMLEvents');
  event.initEvent(name, true, true);
  event.eventName = name;
  arguments[0].dispatchEvent(event);
} else {
  event = document.createEventObject();
  event.eventType = name;
  event.eventName = name;
  arguments[0].fireEvent('on' + name, event);
}
