// Will be obfuscated to assets/inject.js

; (function (xhr) {
    var XHR = XMLHttpRequest.prototype

    var open = XHR.open
    var send = XHR.send

    XHR.open = function (method, url) {
        this._method = method
        this._url = url
        return open.apply(this, arguments)
    }

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            window.postMessage({ type: 'xhr', endpoint: {} ,data: this.response, url: this._url, args:{} }, '*') // send to content script
        })
        return send.apply(this, arguments)
    }
})(XMLHttpRequest)

const { fetch: origFetch } = window
window.fetch = async (...args) => {
    const response = await origFetch(...args)
    if (!response.headers.get('content-type').includes("json")) return response
    response
        .clone()
        .json() // maybe json(), text(), blob()
        .then((data) => {
            window.postMessage({ type: 'fetch', data: data, endpoint: args[1], url: args[0], args }, '*') // send to content script
        })
        .catch((err) => console.error(err))
    return response
}

