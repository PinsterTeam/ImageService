module.exports = class Base64Handler {
    static getBuffer(prunedBase64String) {
        return Buffer.from(prunedBase64String, 'base64');
    }

    static pruneBase64String(base64Image) {
        return base64Image.substr(base64Image.indexOf(',') + 1)
    }

    static getMimeType(base64Image) {
        let mimeRegex = /data:([^/]+)\/([^;]+);/;
        let matches = mimeRegex.exec(base64Image);
        return {
            type: matches[1],
            subtype: matches[2]
        };
    }
};
