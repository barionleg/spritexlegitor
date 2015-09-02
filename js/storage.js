var storage = {
    get: function (key) {
        var rVal;
        try {
            rVal = JSON.parse(localStorage.getItem(key));
        } catch (e) {
            rVal = null;
        }
        return rVal;
    },

    set: function (key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    },

    erase: function (key) {
        localStorage.removeItem(key);
    },

    clear: function () {
        localStorage.clear();
    }

};
