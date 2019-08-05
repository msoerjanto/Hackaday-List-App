var WEBDRIVER_CONFIGURATION = {
    start_process: true,
    cli_args: [
        "--verbose"
    ],
    server_path: "node_modules/.bin/chromedriver",
    port: 9515
};

var CHROME_CONFIGURATION = {
    desiredCapabilities: {
        browserName: "chrome",
        chromeOptions: {
            args : ["--no-sandbox"]
        }
    }
};

var DEFAULT_CONFIGURATION = {
    launch_url: "http://localhost:8080",
    desiredCapabilities: CHROME_CONFIGURATION
};

var ENVIRONMENTS = {
    default: DEFAULT_CONFIGURATION
};

module.exports = {
    src_folders: ['tests'],
    test_settings: ENVIRONMENTS,
    webdriver:WEBDRIVER_CONFIGURATION
};
