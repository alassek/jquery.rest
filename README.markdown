## jQuery.rest ##

A plugin to ease AJAX interaction with RESTful APIs such as Rails

### Accepted Parameters ###

There are four public jQuery methods created by this plugin:

    jQuery.create
    jQuery.read
    jQuery.update
    jQuery.destroy

Each function accepts 1-4 parameters:

    url [, data [, success [, error ] ] ]

* `url`: (string) The url of the resource, which can include a dynamically populated value surrounded by {braces}
* `data`: (hash | string) The data to post to the resource, also used to populate dynamic values.
  * In GET requests, data will be added to the url as query-string parameters
* `success`: (function) The success callback
* `error`: (function) The error callback

In addition to these parameters, you can simply pass a standard jQuery.Ajax options object instead as the only parameter.

### Breaking change: success, error callback parameters ###

Both `success` and `error` callbacks are passed a `headers` object whose key-value pairs correspond to the HTTP Response headers.

* `success`
  * `data`: The reponse data for the request
  * `headers`
  * `xhr`
* `error`
  * `xhr`
  * `headers`

In addition to being passed to the callbacks, this parsed object is attached directly to the `xhr` as well.

``` javascript
var xhr = $.read('/tasks.json');
xhr.responseHeaders
// => Object {
// =>   Connection: "close",
// =>   Content-Length: "543",
// =>   Content-Type: "application/json;charset=utf-8"
// => }
```

This was inspired by the [GitHub][gh] API which makes use of custom HTTP response headers and the fact that `xhr.getAllReponseHeaders()` is next to useless.
  [gh]: http://developer.github.com/

### Example ###

Create a new 'task' record with a success callback

``` javascript
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
```

Read an existing 'account' object and add it to the page (this callback is making some assumptions about your controller -- YMMV)

``` javascript
$.read(
  '/accounts/2486',
  function (response) {
    $('ul#accounts').append(response);
  }
);
// => [GET] /accounts/2486
```

Update an existing 'task' record with ID 54

``` javascript
$.update(
  '/tasks/54',
  { description: 'lunch tomorrow after 1pm' }
);
// => [PUT] /tasks/54
// => authenticity_token: K06+3rRMlMuSoG60+Uw6UIo6UsZBbtIIPu2GaMbjf9s=
// => description: lunch tomorrow after 1pm
```

Update a nested 'task' record using dynamic IDs

``` javascript
$.update(
  '/accounts/{account_id}/tasks/{id}',
  { id: 54, account_id: 11387, description: 'lunch tomorrow after 1pm' }
);
// => [PUT] /accounts/11387/tasks/54
// => authenticity_token: K06+3rRMlMuSoG60+Uw6UIo6UsZBbtIIPu2GaMbjf9s=
// => description: lunch tomorrow after 1pm
```

Delete a 'task' object with ID 54

``` javascript
$.destroy('/tasks/54')
// => [DELETE] /tasks/54
```

Delete a 'task' object using alternate syntax

``` javascript
$.destroy({
  url: '/tasks/54',
  success: function (response) {
    alert('successfully deleted task.');
  }
});
// => [DELETE] /tasks/54
```

### Using $.Deferred ###

jQuery.rest helpers all support the new jQuery.Deferred syntax:

``` javascript
$.read('/tasks/{id}.json', { id: 34 }).then(function (task) { /* do something with task */ });
```

### Setting Content-Type header ###

jQuery.rest will look for a content-type setting in three places:

1. `options.contentType` if you're using the alternate syntax
2. or else `$.restSetup.contentType`
3. or else it will look for a `json` or `xml` extension on the url resource.

If all three of those sources fail, it will use the browser's default.

### Setting csrf token & method parameter ###

There is a global object called $.restSetup that you can modify in your application's Javascript startup to match your environment.

`$.restSetup.csrfParam` and `$.restSetup.csrfToken` define how the authenticity token is formatted. By default they are loaded from
meta tags named `csrf-param` and `csrf-token`. Set them manually if you are unable to follow this convention.

PUT and DELETE verbs are used by default, but if you need to tunnel them through the POST method instead: `$.restSetup.useMethodOverride = true;`

`$.restSetup.methodParam` can be changed if you pass back the REST method differently. Defaults to `_method`.

Example:

``` javascript
$.extend($.restSetup, {
  useMethodOverride: true,
  methodParam: 'action',
  csrfParam: '_csrf',
  csrfToken: encodeURIComponent(AUTH_TOKEN)
});
```

**-- or --**

    <meta name="csrf-param" content="_csrf" />
    <meta name="csrf-token" content="K06+3rRMlMuSoG60+Uw6UIo6UsZBbtIIPu2GaMbjf9s=" />

``` javascript
$.destroy('/tasks/54');
// => [POST] /tasks/54
// => action: delete
// => _csrf: K06+3rRMlMuSoG60+Uw6UIo6UsZBbtIIPu2GaMbjf9s=
```

### Customize HTTP verbs ###

By default, jQuery.rest conforms to Rails' HTTP verbs: POST to create, PUT to update, DELETE to destroy.

Not all RESTful APIs behave this way, and some argue that this isn't actually REST. If you need to override the methods being used, you can customize `$.restSetup.verbs`.

```javascript
$.restSetup.verbs.update = 'PATCH';
$.update(
  '/accounts/{account_id}/tasks/{id}',
  { id: 54, account_id: 11387, description: 'lunch tomorrow after 1pm' }
);
// => [PATCH] /accounts/11387/tasks/54
// => authenticity_token: K06+3rRMlMuSoG60+Uw6UIo6UsZBbtIIPu2GaMbjf9s=
// => description: lunch tomorrow after 1pm
```

(`$.read` will of course always use GET, but the others can be changed to anything you desire.)