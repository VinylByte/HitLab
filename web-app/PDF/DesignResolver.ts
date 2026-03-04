export interface HardDesignPreset {
    id: string;
    name: string;
    description: string;
    selectable?: boolean;
    background?: import("./interfaces").BackgroundConfig;
    frontBackground?: import("./interfaces").BackgroundConfig;
    backBackground?: import("./interfaces").BackgroundConfig;
    includes?: string[];
}

const isLeafDesign = (design: HardDesignPreset): boolean =>
    Boolean(design.background || design.frontBackground || design.backBackground);

const expandDesignById = (
    id: string,
    designById: Map<string, HardDesignPreset>,
    output: HardDesignPreset[],
    visitedPath: Set<string>
) => {
    const design = designById.get(id);
    if (!design) {
        return;
    }

    if (visitedPath.has(id)) {
        return;
    }

    const nextVisitedPath = new Set(visitedPath);
    nextVisitedPath.add(id);

    if (isLeafDesign(design)) {
        output.push(design);
    }

    for (const childId of design.includes ?? []) {
        expandDesignById(childId, designById, output, nextVisitedPath);
    }
};

export const resolveDesignSelection = (
    selectedDesignIds: string[],
    designs: HardDesignPreset[]
): HardDesignPreset[] => {
    const expanded: HardDesignPreset[] = [];
    const designById = new Map(designs.map(design => [design.id, design]));

    for (const selectedId of selectedDesignIds) {
        expandDesignById(selectedId, designById, expanded, new Set<string>());
    }

    return expanded;
};

export const getSelectableDesigns = (designs: HardDesignPreset[]): HardDesignPreset[] =>
    designs.filter(design => design.selectable !== false);
