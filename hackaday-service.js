const https = require('https');

const protocol = 'https://';
const domain = 'api.hackaday.io/v1';
const apiKey = '0b4gG8fRy7sDTlkk';

function generateUrl(params, path) {
    return protocol + domain + path + params;
}

function getProjects() {
    const path = '/projects';
    const params = `?api_key=${apiKey}`;
    // return new pending promise
    return new Promise((resolve, reject) => {
        // select http or https module, depending on reqested url
        const url = generateUrl(params, path);
        console.log(`Calling Hackaday API with url: ${url}`);
        const request = https.get(url, (response) => {
            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to call API: ' + response.statusCode));
            }
            // temporary data holder
            const body = [];
            // on every content chunk, push it to the data array
            response.on('data', (chunk) => body.push(chunk));
            // we are done, resolve promise with those joined chunks
            response.on('end', () => resolve(body.join('')));
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    });
}

module.exports = {
    getProjects
};
