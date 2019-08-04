require('dotenv').config({ silent: true });

const express = require('express');
const app = express();

const ejs = require('ejs');

// const sampleProjectsData = require('./sample');
// const sampleProjectData = require('./sample-project');

const hackadayService = require('./hackaday-service');

app.use(express.static(__dirname + '/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    // res.render('pages/index', sampleProjectsData);
    const perPage = 10;
    const page = 1;
    hackadayService.getDataForIndex(page, perPage).then(data => {
        res.render('pages/index', data)
    }).catch(err => console.error(err));
});

app.get('/project/:projectId', (req, res) => {
    // res.render('pages/project', sampleProjectData)
    const projectId = req.params.projectId;
    if (projectId) {
        hackadayService.getDataForProject(projectId).then((data) => {
            res.render('pages/project', data);
        }).catch(err => console.error(err));
    }
});

app.get('/rest/v1/projects', (req, response) => {
    const perPage = req.query.perPage || 10;
    const page = req.query.page || 1;

    hackadayService.getDataForIndex(page, perPage)
        .then((res) => {
            if(res.projects) {
                ejs.renderFile('./views/partials/index/project-list.ejs', res, null, function(err, str) {
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
