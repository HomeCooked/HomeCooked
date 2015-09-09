var path = require('path');

var login = function (username, password) {


    /**
     * [selectWindow Focus the browser to the index window. Implementation by http://stackoverflow.com/questions/21700162/protractor-e2e-testing-error-object-object-object-has-no-method-getwindowha]
     * @param  {[Object]} index [Is the index of the window. E.g., 0=browser, 1=FBpopup]
     * @return {[!webdriver.promise.Promise.<void>]}       [Promise resolved when the index window is focused.]
     */
    this.selectWindow = function (index) {

        // wait for handels[index] to exists
        browser.driver.wait(function () {
            return browser.driver.getAllWindowHandles().then(function (handles) {
                /**
                 * Assume that handles.length >= 1 and index >=0.
                 * So when i call selectWindow(index) i return
                 * true if handles contains that window.
                 */
                if (handles.length > index) {
                    return true;
                }
            });
        });

        // here i know that the requested window exists

        // switch to the window
        return browser.driver.getAllWindowHandles().then(function (handles) {
            return browser.driver.switchTo().window(handles[index]);
        });
    };
    var zipcode = element(by.model('vm.zipcode'));
    browser.ignoreSynchronization = false;
    zipcode.sendKeys('94114');
    var button = element(by.css('button'));
    button.click();
    var step3 = element.all(by.repeater('step in steps')).get(2).click()
    var closeTutorialButton = element(by.css('[ng-click="tutorialDone()"]'))
    closeTutorialButton.click()
    //click on login

    var signUpButton = element(by.css('[ng-click="menuVm.login()"]'));
    signUpButton.click();

    var connectWithFacebookButton = element(by.css('.ion-social-facebook'));
    connectWithFacebookButton.click();

    //fill in and submit fbook login form
    browser.ignoreSynchronization = true;
    this.selectWindow(1);
    browser.sleep(2000);
    var facebookEmailInput = element(by.id('email'))
    facebookEmailInput.sendKeys(username);

    var facebookPasswordInput = element(by.id('pass'))
    facebookPasswordInput.sendKeys(password)

    var facebookSubmitButton = element(by.id('u_0_2'));
    facebookSubmitButton.click();

    this.selectWindow(0)

    browser.ignoreSynchronization = false
    browser.sleep(5000)
    browser.waitForAngular()

}


describe('login and enroll', function () {
    it('should log in and get the correct User name from the settings menu', function () {

        login('lucagnome@gmail.com', 'Altdog66#');

        browser.get('http://localhost:8100/#/settings/');
        browser.sleep(2000)
        // grab header with name to compare to my name
        var headerWithName = element.all(by.css('.ng-binding')).get(0);
        expect(headerWithName.getText()).toContain('Lucas Noah');

    });

    it('should be able to create a new chef and recieve back the chef enrolled message', function () {
        browser.get('http://localhost:8100/#/enroll/')
        browser.waitForAngular();

        var firstName = element(by.model('vm.form.first_name'));
        firstName.clear();
        firstName.sendKeys('lucas');
        var lastName = element(by.model('vm.form.last_name'));
        lastName.clear();
        lastName.sendKeys('noah');

        var dob = element(by.model('vm.form.dob'));
        dob.sendKeys('06271985');
        var email = element(by.model('vm.form.email'));
        email.clear();
        email.sendKeys('lucas.bird.noah@gmail.com');
        var phoneNumber = element(by.model('vm.form.phone_number'));
        phoneNumber.clear()
        phoneNumber.sendKeys('17064248120');
        var ssn = element(by.model('vm.form.ssn'));
        ssn.clear();
        ssn.sendKeys('427531822');
        var addressLine1 = element(by.model('vm.form.address.line1'));
        addressLine1.sendKeys('860 mead ave');
        var addressLine2 = element(by.model('vm.form.address.line2'));
        addressLine2.sendKeys(' ');
        var addressCity = element(by.model('vm.form.address.city'));
        addressCity.sendKeys('Oakland')
        var addressZipcode = element(by.model('vm.form.address.zipcode'));
        addressZipcode.sendKeys('94607');
        //browser.pause()
        //var addressState = element(by.model('vm.form.address.state'));
        //addressState.sendKeys('CA');
        var cardNumber = element(by.model('vm.form.card.number'));
        actions = browser.actions();
        actions.mouseMove(cardNumber);
        actions.click();
        //actions.clear();
        actions.sendKeys('4266 1500 1103 5148');
        var cardExpiry = element(by.model('vm.form.card.expiry'));
        actions.mouseMove(cardExpiry)
        actions.click()
        actions.sendKeys('0917');
        var cardCvc = element(by.model('vm.form.card.cvc'));
        actions.mouseMove(cardCvc)
        actions.click()
        actions.sendKeys('863');
        var cardName = element(by.model('vm.form.card.cardholder_name'));
        actions.mouseMove(cardName)
        actions.click()
        actions.sendKeys('lucas b noah');

        actions.perform();
        var addPhotoButton = element(by.model('pictureData'));
        var fileToUpload = 'tinyimage.jpg',
            absolutePath = path.resolve(__dirname, fileToUpload);
        addPhotoButton.sendKeys(absolutePath);
        var cropButton = element(by.css('[ng-click="crop()"]'));
        cropButton.click();
        browser.sleep(5000);
        //browser.pause();
        var enrollButton = element(by.xpath('/html/body/ion-nav-view/ion-side-menus/ion-pane/ion-nav-view/ion-view/ion-content/div[1]/form/div'));

        var secondActions = browser.actions();
        secondActions.mouseMove(enrollButton)
        secondActions.click();
        secondActions.perform();

        browser.sleep(12000);
        var confirmationAnswer = element(by.xpath('/html/body/div[4]/div/div[1]/h3'));
        expect(confirmationAnswer.getText()).toContain("You're enrolled!");
    })

});

describe('activate the chef.', function () {
    it('should grab the admin page, login and activate the chef.', function () {
            browser.ignoreSynchronization = true;
            browser.get('http://127.0.0.1:8000/admin/chefs/chef/');
            var username = element(by.id('id_username'));
            username.sendKeys('admin');
            var password = element(by.id('id_password'));
            password.sendKeys('password');
            var submit = $('input[type="submit"]')
            submit.click();
            browser.sleep(6000);
            var chefs = $('th a');
            chefs.click();
            browser.sleep(3000);
            var isActive = element(by.id('id_is_active'));
            isActive.click();
            var saveButton = element(by.buttonText('Save'));
            saveButton.click()
            browser.sleep(3000);
            chefs.click();
            browser.sleep(300)
            expect(isActive.getAttribute('checked')).toBe('true');




        }
    )
})


