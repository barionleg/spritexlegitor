var default_config = {
    version: "0.91 beta",
    width: 16,
    height: 32,
    max_width: 64,
    max_height: 48,
    colors: [0, 41, 202, 136],
    selected_color: 1,
    hex_mode: true,
    pal_mode: true,
    mask_mode: false,
    mask_vis: true,
    wrap: true,
    pixel_width: 2,
    export_mode: 4,
    export_template: "byte width = ##W##,\n     height = ##H##; \nbyte colors[] = { ##C## };\nbyte sprite[] = { ##S## }; \nbyte mask[] = { ##M## };\n",
    export_data_prefix: "0x",
    export_data_separator: ", ",
    export_row_separator: "\n",
    export_CR: true,
    raw_sprite: true,
    raw_mask: true,
    raw_colors: true,
    raw_options: true,
    previewX: 390,
    previewY: 120,
    preview_cell_size: 2,
    editor_cell_size: 10,
    config_exportables : [
    "hex_mode" , "pal_mode", "mask_mode", "mask_vis", "pixel_width"
    ],
};


