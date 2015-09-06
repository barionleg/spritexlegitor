editor.buttons = {

    bind: function () {
        $("button").each(function (idx, $button) {
            if ($button.id.substr(0, 4) == 'btn_') {
                if (editor.buttons[$button.id.substr(4)] !== undefined) {
                    $($button).bind('click', editor.buttons[$button.id.substr(4)]);

                } else {
                    $($button).bind('click', editor.buttons.unknown);
                }
            }
        })

    },

    about: function () {
        $("#mod_about").fadeToggle();
    },

    help: function () {
        $("#mod_help").fadeToggle();
    },

    data:  function () {
        if (!$("#mod_data").is(":visible")) {
            editor.configShow("opt_raw");
            editor.dataShow();
        }
        $("#mod_data").fadeToggle();
    },

    data_load: function() {
        if (editor.dataImport()) {
            editor.init();
        }
    },

    options: function () {
        editor.configShow("mod_options");
        $("#mod_options").fadeToggle();
    },

    opt_ok: function () {
        editor.configRead("mod_options");
        editor.configSave();
        editor.init();
        $("#mod_options").fadeOut();
    },

    opt_reset: function () {
        if (confirm("Are you sure you want to revert default options?")) {
            $("#mod_options").fadeOut();
            editor.configReset();
        };
    },

    clear: function () {
        if (confirm("Are you sure you want to erase all sprite data?")) {
            editor.spriteClear();
            editor.editorUpdateContent();
            editor.previewUpdate();
        }
    },
    crop: function () {
        if (confirm("Are you sure you want to erase all invisible area?")) {
            editor.spriteCrop();
            editor.editorUpdateContent();
            editor.previewUpdate();
        }
    },
    unknown: function () {
        alert("Button '" + this.id + "' not ready yet!");
    },

    width_dec: editor.widthDec,
    width_inc: editor.widthInc,
    height_dec: editor.heightDec,
    height_inc: editor.heightInc,

    fx_shl: editor.spriteFx.shl,
    fx_shr: editor.spriteFx.shr,
    fx_shu: editor.spriteFx.shu,
    fx_shd: editor.spriteFx.shd,
    fx_flipv: editor.spriteFx.flipV,
    fx_fliph: editor.spriteFx.flipH,

    mask_clear: editor.maskClear,
    mask_all: editor.maskAll,
    mask_auto: editor.maskAuto,
    mask_outline: editor.maskOutline,

};
