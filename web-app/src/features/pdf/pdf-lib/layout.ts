import {
    A4_HEIGHT,
    A4_WIDTH,
    CARD_HEIGHT,
    CARD_WIDTH,
    CARDS_PER_ROW_DOUBLE,
    CARDS_PER_ROW_ONE,
    DOUBLE_SIDED_COLUMN_GAP,
    DOUBLE_SIDED_ROW_GAP,
    ONE_SIDED_COLUMN_GAP,
    ONE_SIDED_ROW_GAP,
    ROWS_PER_PAGE_DOUBLE,
    ROWS_PER_PAGE_ONE,
} from "./constants";

export const getDoubleSidedGridBounds = () => {
    const gridWidth =
        CARDS_PER_ROW_DOUBLE * CARD_WIDTH +
        (CARDS_PER_ROW_DOUBLE - 1) * DOUBLE_SIDED_COLUMN_GAP;
    const gridHeight =
        ROWS_PER_PAGE_DOUBLE * CARD_HEIGHT +
        (ROWS_PER_PAGE_DOUBLE - 1) * DOUBLE_SIDED_ROW_GAP;

    const left = (A4_WIDTH - gridWidth) / 2;
    const top = A4_HEIGHT - (A4_HEIGHT - gridHeight) / 2;

    return { left, top, gridWidth, gridHeight };
};

export const getOneSidedGridBounds = () => {
    const gridWidth =
        CARDS_PER_ROW_ONE * CARD_WIDTH +
        (CARDS_PER_ROW_ONE - 1) * ONE_SIDED_COLUMN_GAP;
    const gridHeight =
        ROWS_PER_PAGE_ONE * (CARD_HEIGHT * 2) +
        (ROWS_PER_PAGE_ONE - 1) * ONE_SIDED_ROW_GAP;

    const left = (A4_WIDTH - gridWidth) / 2;
    const top = A4_HEIGHT - (A4_HEIGHT - gridHeight) / 2;

    return { left, top, gridWidth, gridHeight };
};
