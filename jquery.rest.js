/*
 * Copyright (c) 2010 Lyconic, LLC. 
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
    
    // jQuery doesn't provide a better way of intercepting the ajax settings object
    var _ajax = $.ajax, options;
    
    function collect_options (url, data, callback, type) {
        options = { dataType: 'json' };
        if (arguments.length == 1) {
            options = $.extend(options, url);            
            if (options['url'] && options['data']) options.url = fill_url(options.url, options.data);
        } else {
            // shift arguments if data argument was omitted
            if ($.isFunction(data) || $.isArray(data)) {
                type = type || callback;
                callback = data;
                data = null;
            }
            
            var success, error;
            if ($.isArray(callback)) {
                success = callback[0];
                error = callback[1];
            } else {
                success = callback;
            }
            
            url = fill_url(url, data);
            
            options = $.extend(options, {
                url: url,
                data: data,
                success: success,
                error: error,
                dataType: type
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
    
    $.extend({
        ajax: function(settings) {
            settings.type = settings.type || "GET";
                
            if (typeof settings.data !== "string")
            if (settings.data !== undefined)
            if (settings.data !== null) {
                settings.data = $.param(settings.data);
            }
            
            settings.data = settings.data || "";
            
            if ("AUTH_TOKEN" in window)
            if (!/^(get)$/i.test(settings.type))
            if (!/(authenticity_token=)/i.test(settings.data)) {
                settings.data += (settings.data ? "&" : "") + "authenticity_token=" + encodeURIComponent(AUTH_TOKEN);
            }
            
            if (!/^(get|post)$/i.test(settings.type)) {
                settings.data += (settings.data ? "&" : "") + "_method=" + settings.type.toLowerCase();
                settings.type = "POST";
            }
            
            return _ajax.call(this, settings);
        },
        
        read: function() {
           collect_options.apply(this, arguments);
           return $.ajax(options);
        },
        
        create: function() {
           collect_options.apply(this, arguments);
           options = $.extend({ type: 'POST' }, options);
           return $.ajax(options);
        },
        
        update: function() {
            collect_options.apply(this, arguments);
            options = $.extend({ type: 'PUT' }, options);
            return $.ajax(options);
        },
        
        destroy: function() {
            collect_options.apply(this, arguments);
            options = $.extend({ type: 'DELETE' }, options);
            return $.ajax(options);
        }
    });
    
})(jQuery);