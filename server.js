const express = require('express')
const app = express();

const sampleProjectsData = require('./sample')

const hackadayService = require('./hackaday-service')

// set the view engine to ejs
app.set('view engine', 'ejs');



app.get('/', (req, res) => {
    const projects = sampleProjectsData.projects;

    res.render('pages/index', {
        projects
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)

    // console.log('Calling the hackaday api...');
    // hackadayService.getProjects().then((res) => {
    //     console.log(res);
    // }).catch((err) => {
    //     console.log(err);
    // })
});
