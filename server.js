const express = require('express');
const app = express();

const ejs = require('ejs');

// const sampleProjectsData = require('./sample');

const hackadayService = require('./hackaday-service');

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const perPage = 10;
    const page = 1;

    hackadayService.getDataForIndex(page, perPage).then(data => {
        res.render('pages/index', data)
    }).catch(err => console.error(err));
});

app.get('/project/:projectId', (req, res) => {
    const projectId = req.params.projectId;
    if (projectId) {
        hackadayService.getDataForProject(projectId).then((data) => {
            console.log(data);
            res.render('pages/project', data);
        }).catch(err => console.error(err));
    }
});

app.get('/rest/v1/projects', (req, response) => {
    const perPage = req.query.perPage || 10;
    const page = req.query.page || 1;

    hackadayService.getPage(page, perPage)
        .then((res) => {
            if(res.projects) {
                ejs.renderFile('./views/partials/project-list.ejs', res, null, function(err, str) {
                    if(err) {
                        console.error(err);
                    }
                    response.send(str);
                });
            }
        })
        .catch((err) => console.error(err));

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`)
});
