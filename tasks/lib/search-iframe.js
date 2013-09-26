var type = arguments[0],
    value = arguments[1],
    iframes,
    iframe;

if(type === 'index'){
	iframes = document.getElementsByTagName('iframe') || [];
	iframe = iframes[Number(value)-1];
} else if(type === 'relative') {
	iframe = window.parent;
}

if(!iframe) {
	throw new Error("iframe element was not found");
}

return iframe;
