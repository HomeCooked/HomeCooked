exports.config = {
          capabilities: {
                  // You can use other browsers
                  // like firefox, phantoms, safari, IE (-_-)
                  'browserName': 'chrome'
          },
          framework: 'jasmine2',
          specs: [
                   // We are going to make this file in a minute
                'e2e/alphaTests.spec.js'
          ],



          jasmineNodeOpts: {
                  showColors: true,
                 defaultTimeoutInterval: 30000,
                isVerbose: true,
          },
        allScriptsTimeout: 20000,
          onPrepare: function(){
                browser.driver.get('http://localhost:8100');
        }
};