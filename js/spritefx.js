editor.spriteFx = {

    shl: function () {
        var x, y, cs, cm;
        for (y = 0; y < editor.config.height; y++) {
            cs = 0;
            cm = 0;
            if (editor.config.wrap) {
                cs = editor.sprite[0][y];
                cm = editor.mask[0][y];
            };
            for (x = 0; x < (editor.config.width * 4) - 1; x++) {
                editor.sprite[x][y] = editor.sprite[x + 1][y];
                editor.mask[x][y] = editor.mask[x + 1][y];
            }
            editor.sprite[(editor.config.width * 4) - 1][y] = cs;
            editor.mask[(editor.config.width * 4) - 1][y] = cm;
        }
        editor.editorUpdateContent();
        editor.previewUpdate();
        editor.spriteSave();
    },

    shr: function () {
        var x, y, cs, cm;
        for (y = 0; y < editor.config.height; y++) {
            cs = 0;
            cm = 0;
            if (editor.config.wrap) {
                cs = editor.sprite[(editor.config.width * 4) - 1][y];
                cm = editor.mask[(editor.config.width * 4) - 1][y];
            };
            for (x = (editor.config.width * 4)-1; x > 0; x--) {
                editor.sprite[x][y] = editor.sprite[x - 1][y];
                editor.mask[x][y] = editor.mask[x - 1][y];
            }
            editor.sprite[0][y] = cs;
            editor.mask[0][y] = cm;
        }
        editor.editorUpdateContent();
        editor.previewUpdate();
        editor.spriteSave();

    },

    shu: function () {
        var x, y, cs, cm;
        for (x = 0; x < editor.config.width * 4; x++) {
            cs = 0;
            cm = 0;
            if (editor.config.wrap) {
                cs = editor.sprite[x][0];
                cm = editor.mask[x][0];
            };
            for (y = 0; y < (editor.config.height - 1); y++) {
                editor.sprite[x][y] = editor.sprite[x][y + 1];
                editor.mask[x][y] = editor.mask[x][y + 1];
            }
            editor.sprite[x][editor.config.height - 1] = cs;
            editor.mask[x][editor.config.height - 1] = cm;
        }
        editor.editorUpdateContent();
        editor.previewUpdate();
        editor.spriteSave();
    },

    shd: function () {
        var x, y, cs, cm;
        for (x = 0; x < editor.config.width * 4; x++) {
            cs = 0;
            cm = 0;
            if (editor.config.wrap) {
                cs = editor.sprite[x][editor.config.height - 1];
                cm = editor.mask[x][editor.config.height - 1];
            };
            for (y = editor.config.height-1; y > 0; y--) {
                editor.sprite[x][y] = editor.sprite[x][y - 1];
                editor.mask[x][y] = editor.mask[x][y - 1];
            }
            editor.sprite[x][0] = cs;
            editor.mask[x][0] = cm;
        }
        editor.editorUpdateContent();
        editor.previewUpdate();
        editor.spriteSave();

    },

    flipV: function () {
        var x, y, cs, cm;
        for (x = 0; x < editor.config.width * 4; x++) {
            for (y = 0; y < Math.floor(editor.config.height / 2); y++) {
                swap = editor.config.height - y -1;
                cs = editor.sprite[x][y];
                cm = editor.mask[x][y];
                editor.sprite[x][y] = editor.sprite[x][swap];
                editor.mask[x][y] = editor.mask[x][swap];
                editor.sprite[x][swap] = cs;
                editor.mask[x][swap] = cm;
            }
        }
        editor.editorUpdateContent();
        editor.previewUpdate();
        editor.spriteSave();
    },

    flipH: function () {
        var x, y, cs, cm;
        for (y = 0; y < editor.config.height; y++) {
            for (x = 0; x < editor.config.width * 2; x++) {
                swap = (editor.config.width*4) - x - 1;
                cs = editor.sprite[x][y];
                cm = editor.mask[x][y];
                editor.sprite[x][y] = editor.sprite[swap][y];
                editor.mask[x][y] = editor.mask[swap][y];
                editor.sprite[swap][y] = cs;
                editor.mask[swap][y] = cm;
            }
        }
        editor.editorUpdateContent();
        editor.previewUpdate();
        editor.spriteSave();
    },
};
