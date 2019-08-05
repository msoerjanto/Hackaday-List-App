module.exports = {
    'Project entry is loaded' : function (browser) {
        browser
            .url(browser.launch_url)
            .waitForElementVisible('.project-entry');
    },
    after: function (browser) {
        browser.end();
    }
};
