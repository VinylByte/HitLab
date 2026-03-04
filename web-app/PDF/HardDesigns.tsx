import type { HardDesignPreset } from "./DesignResolver";

export const DESIGNS: HardDesignPreset[] = [
    {
        id: "like-hitster",
        name: "Like-Hitster",
        description: "Enthält alle Like-Hitster-Designs und wechselt diese pro Karte ab.",
        includes: ["like-hitster-blue", "like-hitster-green", "like-hitster-yellow", "like-hitster-purple", "like-hitster-red", "like-hitster-teal"],
    },
    {
        id: "like-hitster-blue",
        name: "Like-Hitster Blue",
        description: "Like-Hitster-Rückseitendesign mit einem blauen Farbverlauf auf der Vorderseite.",
        selectable: false,
        backBackground: {
            type: "image",
            url: "/PDFDesigns/HitsterBackground.png",
        },
        frontBackground: {
            type: "gradient",
            css: "linear-gradient(90deg,rgba(42, 144, 155, 1) 0%, rgba(83, 124, 237, 1) 100%);",
        },
    },
    {
        id: "like-hitster-green",
        name: "Like-Hitster Green",
        description: "Like-Hitster-Rückseitendesign mit einem grünen Farbverlauf auf der Vorderseite.",
        selectable: false,
        backBackground: {
            type: "image",
            url: "/PDFDesigns/HitsterBackground.png",
        },
        frontBackground: {
            type: "gradient",
            css: "linear-gradient(0deg,rgba(34, 195, 147, 1) 0%, rgba(166, 253, 45, 1) 100%);",
        },
    },
    {
        id: "like-hitster-yellow",
        name: "Like-Hitster Yellow",
        description: "Like-Hitster-Rückseitendesign mit einem gelben Farbverlauf auf der Vorderseite.",
        selectable: false,
        backBackground: {
            type: "image",
            url: "/PDFDesigns/HitsterBackground.png",
        },
        frontBackground: {
            type: "gradient",
            css: "linear-gradient(0deg,rgba(195, 187, 34, 1) 0%, rgba(253, 187, 45, 1) 100%);",
        },
    },
    {
        id: "like-hitster-purple",
        name: "Like-Hitster Purple",
        description: "Like-Hitster-Rückseitendesign mit einem lila Farbverlauf auf der Vorderseite.",
        selectable: false,
        backBackground: {
            type: "image",
            url: "/PDFDesigns/HitsterBackground.png",
        },
        frontBackground: {
            type: "gradient",
            css: "linear-gradient(90deg,rgba(180, 58, 174, 1) 0%, rgba(252, 176, 69, 1) 100%);",
        },
    },
    {
        id: "like-hitster-red",
        name: "Like-Hitster Red",
        description: "Like-Hitster-Rückseitendesign mit einem roten Farbverlauf auf der Vorderseite.",
        selectable: false,
        backBackground: {
            type: "image",
            url: "/PDFDesigns/HitsterBackground.png",
        },
        frontBackground: {
            type: "gradient",
            css: "background: linear-gradient(90deg,rgba(191, 0, 0, 1) 0%, rgba(237, 221, 83, 1) 100%);",
        },
    },
    {
        id: "like-hitster-teal",
        name: "Like-Hitster Teal",
        description: "Like-Hitster-Rückseitendesign mit einem teal Farbverlauf auf der Vorderseite.",
        selectable: false,
        backBackground: {
            type: "image",
            url: "/PDFDesigns/HitsterBackground.png",
        },
        frontBackground: {
            type: "gradient",
            css: "linear-gradient(90deg,rgba(0, 191, 159, 1) 0%, rgba(83, 150, 237, 1) 100%);",
        },
    },
];
