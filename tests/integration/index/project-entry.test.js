module.exports = {
    'Project entry should load' : function (browser) {
        browser
            .url(browser.launch_url)
            .waitForElementVisible('.project-entry');
    },
    'User modal should not be rendered by default': function(browser) {
        browser.expect.element('.user-modal').to.be.not.present;
    },
    after: function (browser) {
        browser.end();
    }
};
