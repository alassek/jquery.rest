/*
 * Copyright (c) 2011 Lyconic, LLC.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function($){

    // Change the values of this global object if your method parameter is different.
    $.restSetup = { methodParam: '_method' };

    // collect csrf param & token from meta tags if they haven't already been set
    $(document).ready(function(){
      $.restSetup.csrfParam = $.restSetup.csrfParam || $('meta[name=csrf-param]').attr('content');
      $.restSetup.csrfToken = $.restSetup.csrfToken || $('meta[name=csrf-token]').attr('content');
    });

    // jQuery doesn't provide a better way of intercepting the ajax settings object
    var _ajax = $.ajax, options, trim;

    function collect_options (url, data, success, error) {
      options = { dataType: 'json' };
      if (arguments.length === 1 && typeof arguments[0] !== "string") {
        options = $.extend(options, url);
        if ("url" in options)
        if ("data" in options) {
          fill_url(options.url, options.data);
        }
      } else {
        // shift arguments if data argument was omitted
        if ($.isFunction(data)) {
          error = success;
          success = data;
          data = null;
        }

        url = fill_url(url, data);

        options = $.extend(options, {
          url: url,
          data: data,
          contentType: "application/json",
          success: function (data, text, xhr) {
            if (success) success.call(options.context || options, data, get_headers(xhr), xhr);
          },
          error: function (xhr) {
            if (error) error.call(options.context || options, xhr, get_headers(xhr));
          }
        });
      }
    }

    function fill_url (url, data) {
      var key, u, val;
      for (key in data) {
        val = data[key];
        u = url.replace('{'+key+'}', val);
        if (u != url) {
          url = u;
          delete data[key];
        }
      }
      return url;
    }

    function get_headers(xhr) {
      var headers = {}, stringHeaders = xhr.getAllResponseHeaders();
      $.each(stringHeaders.split("\n"), function (i, header) {
        if (header.length) {
          var matches = header.match(/^([\w\-]+):(.*)/);
          if (matches.length === 3) headers[ matches[1] ] = trim.call(matches[2]);
        }
      });
      xhr.responseHeaders = headers;
      return headers;
    }

    // support JS < 1.8.1
    trim = String.prototype.trim || function () {
      return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    // public functions

    function ajax (settings) {
      settings.type = settings.type || "GET";

      if (typeof settings.data !== "string")
      if (settings.data != null) {
          settings.data = $.param(settings.data);
      }

      settings.data = settings.data || "";
      if ($.restSetup.csrfParam && $.restSetup.csrfToken)
      if (!/^(get)$/i.test(settings.type))
      if (!/(authenticity_token=)/i.test(settings.data)) {
          settings.data += (settings.data ? "&" : "") + $.restSetup.csrfParam + '=' + $.restSetup.csrfToken;
      }

      return _ajax.call(this, settings);
    }

    function read () {
      collect_options.apply(this, arguments);
      $.extend(options, { type: 'GET' })
      return $.ajax(options);
    }

    function create () {
      collect_options.apply(this, arguments);
      $.extend(options, { type: 'POST' });
      return $.ajax(options);
    }

    function update () {
      collect_options.apply(this, arguments);
      $.extend(options, {
        type: 'PUT',
        beforeSend: function (xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', 'PUT');
        }
      });
      return $.ajax(options);
    }

    function destroy () {
      collect_options.apply(this, arguments);
      $.extend(options, {
        type: 'DELETE',
        beforeSend: function (xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
        }
      });
      return $.ajax(options);
    }

    $.extend({
      ajax:    ajax,
      read:    read,
      create:  create,
      update:  update,
      destroy: destroy
    });

})(jQuery);

