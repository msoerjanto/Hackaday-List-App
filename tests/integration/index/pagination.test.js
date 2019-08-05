module.exports = {
    'By default, going to index with no params will use default values': function (browser) {
        browser
            .url(browser.launch_url)
            .waitForElementVisible('.project-entry')
            .waitForElementVisible('#pagination')
            .waitForElementVisible('#current');
        browser.expect.elements('.project-entry').count.to.equal(10);
        browser.expect.element('#current').text.to.equal('1');
    },
    'Index page renders right amount of elements based on query params': function (browser) {
        var perPage = 5;
        browser
            .url(browser.launch_url + '?perPage=' + perPage)
            .waitForElementVisible('.project-entry');
        browser.expect.elements('.project-entry').count.to.equal(perPage);
    },
    'Pagination is highlighting the appropriate page based on the page queried': function (browser) {
        var page = '5';
        browser
            .url(browser.launch_url + '?page=' + page)
            .waitForElementVisible('#current');
        browser.expect.element('#current').text.to.equal(page);
    },
    'Clicking a rendered page that is not the current page should bring us to that page': function(browser) {
      var targetPage = '2';
      browser
          .url(browser.launch_url)
          .waitForElementVisible('#page-' + targetPage);
      // click the second page
      browser.click('css selector','#page-' + targetPage, function () {
          console.log('button was clicked');
          browser
              .pause(10000)
              .waitForElementVisible('#current');
          browser.getText('css selector', '#current', function (result) {
             this.assert.equal(result.value, targetPage);
          });
      });
    },
    after: function(browser) {
        browser.end();
    }
};
