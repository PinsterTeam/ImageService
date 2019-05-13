const TokenProvider = require('./TokenProvider');
const fetch = require('node-fetch');

function handleErrors(error) {
    console.error('Api level error: ', error);
    throw error;
}

function handleResponse(response) {
    if (!response.ok) {
        console.warn('Response was not successful.', response);
        throw Error(`Error: ${response.status}. statusText: ${response.statusText}. Url: ${response.url}`);
    }
    return response;
}

function extractJson(response) {
    console.debug(`Request to url: '${response.url}' Status: ${response.status}`);
    return response.json().then(json => {
        return json;
    });
}


module.exports = class ApiClient {
    constructor(params = {}) {
        this.pinsterApiUrl = params.pinsterApiUrl || process.env.PINSTER_API_URL;
        this.tokenProvider = params.tokenProvider ? params.tokenProvider : new TokenProvider();
    }

    async get(pathOrUrl, tokenParams = {}) {
        const url = this.pathToUrl(pathOrUrl);

        return fetch(url, {
            headers: await this.buildAuthHeader(tokenParams)
        }).catch(handleErrors)
            .then(handleResponse)
            .then(extractJson);
    }

    async post(pathOrUrl, body = {}, tokenParams = {}) {
        const url = this.pathToUrl(pathOrUrl);

        return fetch(url, {
            headers: await this.buildAuthHeader(tokenParams),
            method: 'POST',
            body: JSON.stringify(body)
        }).catch(handleErrors)
            .then(handleResponse)
            .then(extractJson);
    }

    async buildAuthHeader(tokenParams) {
        return {
            Authorization: 'Bearer ' + await this.tokenProvider.generate(tokenParams),
            'content-type': 'application/json'
        };
    }

    pathToUrl(rawPath) {
        let path = rawPath;

        if (path.includes(this.pinsterApiUrl)) {
            return path;
        }
        return `${this.pinsterApiUrl}${path}`;
    }
};

