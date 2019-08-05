module.exports = {
    'Index page loads' : function (browser) {
        browser
            .url(browser.launch_url)
            .waitForElementVisible('body')
            .waitForElementVisible('footer')
            .end();
    }
};
