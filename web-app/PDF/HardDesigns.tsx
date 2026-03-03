import type { BackgroundConfig } from "./interfaces";

export interface HardDesignPreset {
    name: string;
    description: string;
    background?: BackgroundConfig;
    frontBackground?: BackgroundConfig;
    backBackground?: BackgroundConfig;
}

export const DESIGNS: HardDesignPreset[] = [
    {
        name: "Hitster Blue",
        description: "Hitster-Rückseitendesign mit einem blauen Farbverlauf auf der Vorderseite.",
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
        name: "Hitster Green",
        description: "Hitster-Rückseitendesign mit einem grünen Farbverlauf auf der Vorderseite.",
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
        name: "Hitster Yellow",
        description: "Hitster-Rückseitendesign mit einem gelben Farbverlauf auf der Vorderseite.",
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
        name: "Hitster Purple",
        description: "Hitster-Rückseitendesign mit einem lila Farbverlauf auf der Vorderseite.",
        backBackground: {
            type: "image",
            url: "/PDFDesigns/HitsterBackground.png",
        },
        frontBackground: {
            type: "gradient",
            css: "linear-gradient(90deg,rgba(180, 58, 174, 1) 0%, rgba(252, 176, 69, 1) 100%);",
        },
    },
];
