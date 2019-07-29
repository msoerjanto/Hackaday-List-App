const https = require('https');

const protocol = 'https://';
const domain = 'api.hackaday.io/v1';
const apiKey = '0b4gG8fRy7sDTlkk';

function generateUrl(params, path) {
    return protocol + domain + path + params;
}

function generateParams(params) {
    if(!params) {
        return '';
    }
    let queryParam = '?';
    params.forEach((param, index) => {
       queryParam += `${param.key}=${param.value}`;
       if (index < params.length - 1) {
           queryParam += '&';
       }
    });
    return queryParam;
}

async function getPage(page, perPage) {
    try {
        const projects = await getProjects(page, perPage);
        const userIds = projects.projects.map(project => project.owner_id);
        const usersList = await Promise.all(
            userIds.map(userId => getUser(userId))
        );
        const users = {};
        usersList.forEach(user => {
            users[user.id] = user;
        });
        console.log(users);
        return { ...projects, users }
    } catch (e) {
        console.error(e);
    }

}

function getUser(id) {
    const path = `/users/${id}`;
    const params = [{key: 'api_key', value: apiKey}];

    return get(path, params);
}

function getProjects(page, perPage) {
    const path = '/projects';
    const params = [{key: 'api_key', value: apiKey}];
    if (page) {
        params.push({ key: 'page', value: page})
    }
    if (perPage) {
        params.push({ key: 'per_page', value: perPage})
    }
    return get(path, params);
}

function get(path, params) {
    // return new pending promise
    return new Promise((resolve, reject) => {
        // select http or https module, depending on reqested url
        const url = generateUrl(generateParams(params), path);
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
            response.on('end', () => resolve(JSON.parse(body.join(''))));
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    });
}

module.exports = {
    getProjects,
    getUser,
    getPage
};
