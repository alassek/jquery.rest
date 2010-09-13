## jQuery.rest ##

A plugin to ease AJAX interaction with RESTful APIs such as Rails

### Accepted Parameters ###

There are four public jQuery methods created by this plugin:

    jQuery.create
    jQuery.read
    jQuery.update
    jQuery.destroy

Each function accepts 1-4 parameters:

    URL [, data ] [, success ] [, failure ]

    URL: The url of the resource, which can include a dynamically populated value surrounded by {braces}
    data: (optional) The data to post to the resource, also used to populate dynamic values.
          In GET requests, data will be added to the url as query-string parameters
    success: (optional) The success callback
    failure: (optional) The failure callback

In addition to these parameters, you can simply pass a standard jQuery.Ajax options object instead as the only parameter.

### Example ###

Create a new 'task' record with a success callback

    $.create(
      '/tasks',
      { description: 'follow up after meeting' },
      function (reponse) {
        alert('successfully added task.');
      }
    );
    // => [POST] /tasks
    // => authenticity_token: K06+3rRMlMuSoG60+Uw6UIo6UsZBbtIIPu2GaMbjf9s=
    // => description: follow up after meeting
    
Read an existing 'account' object and add it to the page (this callback is making some assumptions about your controller -- YMMV)

    $.read(
      '/accounts/2486',
      function (response) {
        $('ul#accounts').append(response);
      }
    );    
    // => [GET] /accounts/2486

Update an existing 'task' record with ID 54

    $.update(
      '/tasks/54',
      { description: 'lunch tomorrow after 1pm' }
    );    
    // => [POST] /tasks/54
    // => authenticity_token: K06+3rRMlMuSoG60+Uw6UIo6UsZBbtIIPu2GaMbjf9s=
    // => _method: update
    // => description: lunch tomorrow after 1pm

Update a nested 'task' record using dynamic IDs

    $.update(
      '/accounts/{account_id}/tasks/{id}',
      { id: 54, account_id: 11387, description: 'lunch tomorrow after 1pm' }
    );    
    // => [POST] /accounts/11387/tasks/54
    // => authenticity_token: K06+3rRMlMuSoG60+Uw6UIo6UsZBbtIIPu2GaMbjf9s=
    // => _method: update
    // => description: lunch tomorrow after 1pm

Delete a 'task' object with ID 54

    $.destroy('/tasks/54')
    
    // => [POST] /tasks/54
    // => _method: delete
    
Delete a 'task' object using alternate syntax

    $.destroy({
      url: '/tasks/54',
      success: function (response) {
        alert('successfully deleted task.');
      }
    });
    // => [POST] /tasks/54
    // => _method: delete

### Setting csrf token & method parameter ###

There is a global object called $.restSetup that you can modify in your application's Javascript startup to match your environment.

`$.restSetup.csrf` is an object that contains the token to be passed back to the server for `POST` requests. Either set `$.restSetup.csrf.authenticity_token`
however you like, or you can replace `$.restSetup.csrf` entirely with your own name-value pair. The csrf object will be added to all non-GET requests.

`$.restSetup.methodParam` can be changed if you pass back the REST method differently. Defaults to `_method`.