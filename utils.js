/*!
*
* Util functions used in calculator.js and its HTML
* template delivery.
* 
*/

/* Cookie-related */
// Deletes the cookies and return the count
function deleteCookies(cookieList){
    deleted = 0;

    $.each(cookieList, function(key, val) {
        $.cookie(key, null);
        deleted++;
    });
    
    return deleted;
}

// 1. Loads cookies that aren't set to default values.
// 2. Returns the cookies loaded and their values in the
// form {'name1':'value1', 'name2':'value2'...}
function loadCookies(cookie_value_arr, attrs){
    var cur_cookies = {};

    $.each(cookie_value_arr, function(key, val) {
        if ( $.cookie(key) == null ) {
            $.cookie( key, val,  attrs);
            cur_cookies[key] = val;
        }
        else{
            cur_cookies[key] = $.cookie(key);
        }
    });
    
    return cur_cookies;
}

/* Configuration button related */
function syncConfigButtons(cookie_value_arr){

    $.each(cookie_value_arr, function(key, val) {
        // HACK: to see if "log" button text could be changed based on config button update
        // Will remove this to a different method down the road
        if (key == 'logbase'){
            var t = (val == '10') ? 'Log' : 'ln';
            $("button[value='log']").text(t).width(70).height(48);
        }
        
        if ( $.cookie(key) != val ) {
            s = '#' + key;
            var parent = $(s);
            $('.cb-enable',parent).removeClass('selected');
            $(".cb-disable", s).addClass('selected');
        }
    });

}
