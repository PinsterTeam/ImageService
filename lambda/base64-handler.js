module.exports = class Base64Handler {
    static pruneBase64String(base64Image) {
        return base64Image.substr(base64Image.indexOf(',') + 1)
    }

    static getMimeType(base64Image) {
        let mimeRegex = /data:([^/]+)\/([^;]+);/;
        let matches = mimeRegex.exec(base64Image);
        return {
            mime: matches[1],
            ext: matches[2]
        };
    }
};
