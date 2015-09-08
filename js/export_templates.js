editor.export_templates = {
    "Action!": {
        export_template:    "byte array sprite_data = [ ##S## ]\n" +
                            "byte array mask_data = [ ##M## ]\n" +
                            "byte width = ##BW##\n" +
                            "byte height = ##H##",
        export_data_prefix: "$",
        export_data_separator: " ",
        export_row_separator: "\n",
        export_CR: true
    },
    "C - complex": {
        export_template:    "byte width = ##BW##,\n" +
                            "     height = ##H##; \n" +
                            "byte colors[4] = { ##C## };\n" +
                            "byte sprite[##BL##] = { ##S## };\n" +
                            "byte mask[##BL##] = { ##M## };\n",
        export_data_prefix: "0x",
        export_data_separator: ", ",
        export_row_separator: "\n",
        export_CR: true
    },
    "C - simple": {
        export_template:    "char unsigned width = ##BW##,\n" +
                            "              height = ##H##; \n" +
                            "const char unsigned data[] = { ##S## };",
        export_data_prefix: "0x",
        export_data_separator: ", ",
        export_row_separator: "\n",
        export_CR: true
    },
    "C - custom": {
        export_template:    "byte sprite[] = { ##BW##, ##H##, \n" +
                            "##S## ,\n" +
                            "##M## };",
        export_data_prefix: "0x",
        export_data_separator: ", ",
        export_row_separator: "\n",
        export_CR: true
    },
    "MASM": {
        export_template:    "sprite_data\n" +
                            "\tdta ##S##\n" +
                            "mask_data\n" +
                            "\tdta ##M##",
        export_data_prefix: "$",
        export_data_separator: ",",
        export_row_separator: "\n",
        export_CR: false
    },
    "RAW Octets": {
        export_template:    "##S##\n" +
                            "##M##\n",
        export_data_prefix: "",
        export_data_separator: "",
        export_row_separator: "\n",
        export_CR: false
    }
}
