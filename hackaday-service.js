const https = require('https');

const protocol = 'https://';
const domain = 'api.hackaday.io/v1';
const apiKey = '0b4gG8fRy7sDTlkk';

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                      Public Methods                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////

async function getDataForIndex(page, perPage) {
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
        return { ...projects, users }
    } catch (e) {
        console.error(e);
    }

}

async function getDataForProject(projectId) {
    try {
        const project = await getProject(projectId);
        const user = await getUser(project.owner_id);

        let recommendedProjects = [];
        let recommendedUsers = [];

        if (project.tags) {
            const projectTags = project.tags ? project.tags : [];
            const userTags = user.tags ? user.tags : [];
            const tags = projectTags.concat(userTags);
            const recommendedProjectIds = await getRecommendedByType(tags, 'projects', project.id);
            const recommendedUserIds = await getRecommendedByType(tags, 'users', user.id);

            recommendedProjects = await getByIds(recommendedProjectIds, 'projects');
            recommendedUsers = await getByIds(recommendedUserIds, 'users');

            console.log('--- recommended projects ---', recommendedProjects);
            console.log('---recommended users---', recommendedUsers);
        }

        return { project, user, recommendedProjects, recommendedUsers };
    } catch (e) {
        console.error(e);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////
//                              Helper Methods With Business Logic                             //
/////////////////////////////////////////////////////////////////////////////////////////////////

async function getRecommendedByType(tags, type, id) {
    let result;
    const path = type === 'projects' ? 'projects' : 'users';
    try {
        result = await Promise.all(
            tags.map(tag => getBySearchTerm(tag, type))
        );
    } catch (e) {
        console.error(e);
    }
    const parsedResult = result
        .map((res) => res[path])
        .reduce((res1, res2) => res1.concat(res2), [])
        .filter(elem => !!elem && elem.id !== id);

    return getRecommendedEntities(tags, parsedResult);
}

function getRecommendedEntities(tags, list) {
    // create a list of pairs
    const store = {};
    let mostSimilar = {key: null, value: 0 };
    let secondSimilar = { key: null, value: 0};
    let thirdSimilar = { key: null, value: 0 };
    list.forEach(entity => {
        const tagSet = new Set(entity.tags);
        if (store[entity.id] === undefined) {
            store[entity.id] = 0;
            if (entity.tags) {
                tags.forEach(tag => {
                    if (tagSet.has(tag)) {
                        store[entity.id]++;
                    }
                });
                if (store[entity.id] > mostSimilar.value) {
                    mostSimilar.key = entity.id;
                    mostSimilar.value = store[entity.id];
                } else if (store[entity.id] > secondSimilar.value) {
                    secondSimilar.key = entity.id;
                    secondSimilar.value = store[entity.id];
                } else if (store[entity.id] > thirdSimilar.value) {
                    thirdSimilar.key = entity.id;
                    thirdSimilar.value = store[entity.id];
                }
            }
        }
    });

    // Only return the 5 most similar items
    const result = [];
    if (mostSimilar.key) {
        result.push(mostSimilar.key);
    }
    if (secondSimilar.key) {
        result.push(secondSimilar.key);
    }
    if (thirdSimilar.key) {
        result.push(thirdSimilar.key);
    }
    return result;
}

function getByIds(ids, type) {
    const path = `/${type}/batch`;
    const params = [
        {key: 'api_key', value: apiKey},
        {key: 'ids', value: ids.join() }
    ];
    return get(path, params);
}

function getBySearchTerm(searchTerm, type) {
    const path = `/search/${type}`;
    const params = [
        {key: 'api_key', value: apiKey},
        {key: 'search_term', value: cleanSearchTerm(searchTerm) }
    ];
    return get(path, params)
}

function cleanSearchTerm(term) {
    let cleanString = '';
    for (let i = 0; i < term.length; i++) {
        if (term.charAt(i) === ' ') {
            cleanString += '+';
        } else {
            cleanString += term.charAt(i);
        }
    }
    return cleanString;
}

function getProject(id) {
    const path = `/projects/${id}`;
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

function getUser(id) {
    const path = `/users/${id}`;
    const params = [{key: 'api_key', value: apiKey}];

    return get(path, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                     HTTP Helper Methods                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////

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

module.exports = {
    getDataForProject,
    getDataForIndex
};
