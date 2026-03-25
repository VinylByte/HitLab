import {
    Button,
    Alert,
    Input,
    Select,
    Slider,
    SelectItem,
} from "@heroui/react";
import QRScannerModal from "./QRScanner/QRScannerElement";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../../../lib/constants";
import PlayerElement from "./Player/PlayerElement";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { IconCaretDown, IconCaretDownFilled, IconScan } from "@tabler/icons-react";
import { Center, Group, Paper, Stack, Text, Transition } from "@mantine/core";

type GameMode = "full" | "timed" | "middle" | "random";

type ModeParams = {
    startAtSeconds: number;
    endAtSeconds: number;
    middleMaxDurationSeconds: number;
    randomMinDistanceFromEndSeconds: number;
    randomMaxPlayDurationSeconds: number;
};

type PlayerModeOptions = {
    startAtSeconds: number;
    stopAtSeconds: number | null;
    startAtMiddle: boolean;
    startAtRandom: boolean;
    minDistanceFromEndSeconds: number;
    maxPlayDurationSeconds: number | null;
};

type ModeNumberField = {
    key: keyof ModeParams;
    queryKey: string;
    label: string;
    control: "input" | "slider" | "range-slider";
    rangeEndKey?: keyof ModeParams;
    renderInUi?: boolean;
    min: number;
    max?: number;
    step: number;
    fallback: number;
    sanitize: (value: number) => number;
};

type ModeDefinition = {
    key: GameMode;
    label: string;
    fields: ModeNumberField[];
    toPlayerOptions: (params: ModeParams) => PlayerModeOptions;
};

const MODE_DEFINITIONS: ModeDefinition[] = [
    {
        key: "full",
        label: "Ganzer Song",
        fields: [],
        toPlayerOptions: () => ({
            startAtSeconds: 0,
            stopAtSeconds: null,
            startAtMiddle: false,
            startAtRandom: false,
            minDistanceFromEndSeconds: 30,
            maxPlayDurationSeconds: null,
        }),
    },
    {
        key: "timed",
        label: "Zeitfenster",
        fields: [
            {
                key: "startAtSeconds",
                queryKey: "startAt",
                label: "Zeitfenster (Sek.)",
                control: "range-slider",
                rangeEndKey: "endAtSeconds",
                min: 0,
                max: 300,
                step: 1,
                fallback: 0,
                sanitize: value => Math.max(0, value),
            },
            {
                key: "endAtSeconds",
                queryKey: "endAt",
                label: "Ende bei (Sek.)",
                control: "slider",
                renderInUi: false,
                min: 1,
                max: 300,
                step: 1,
                fallback: 30,
                sanitize: value => Math.max(1, value),
            },
        ],
        toPlayerOptions: params => ({
            startAtSeconds: Math.max(0, params.startAtSeconds),
            stopAtSeconds: Math.max(Math.max(0, params.startAtSeconds) + 1, params.endAtSeconds),
            startAtMiddle: false,
            startAtRandom: false,
            minDistanceFromEndSeconds: 30,
            maxPlayDurationSeconds: null,
        }),
    },
    {
        key: "middle",
        label: "Songmitte",
        fields: [
            {
                key: "middleMaxDurationSeconds",
                queryKey: "middleMaxDuration",
                label: "Maximale Dauer (Sek.)",
                control: "input",
                min: 1,
                step: 1,
                fallback: 30,
                sanitize: value => Math.max(1, value),
            },
        ],
        toPlayerOptions: params => ({
            startAtSeconds: 0,
            stopAtSeconds: null,
            startAtMiddle: true,
            startAtRandom: false,
            minDistanceFromEndSeconds: 30,
            maxPlayDurationSeconds: Math.max(1, params.middleMaxDurationSeconds),
        }),
    },
    {
        key: "random",
        label: "Zufällig",
        fields: [
            {
                key: "randomMinDistanceFromEndSeconds",
                queryKey: "minDistanceFromEnd",
                label: "Mindestabstand zum Ende (Sek.)",
                control: "input",
                min: 0,
                step: 1,
                fallback: 30,
                sanitize: value => Math.max(0, value),
            },
            {
                key: "randomMaxPlayDurationSeconds",
                queryKey: "maxPlayDuration",
                label: "Maximale Dauer (Sek.)",
                control: "input",
                min: 0,
                step: 1,
                fallback: 30,
                sanitize: value => Math.max(0, value),
            },
        ],
        toPlayerOptions: params => ({
            startAtSeconds: 0,
            stopAtSeconds: null,
            startAtMiddle: false,
            startAtRandom: true,
            minDistanceFromEndSeconds: Math.max(0, params.randomMinDistanceFromEndSeconds),
            maxPlayDurationSeconds: Math.max(0, params.randomMaxPlayDurationSeconds),
        }),
    },
];

const DEFAULT_MODE_PARAMS: ModeParams = {
    startAtSeconds: 0,
    endAtSeconds: 30,
    middleMaxDurationSeconds: 30,
    randomMinDistanceFromEndSeconds: 30,
    randomMaxPlayDurationSeconds: 30,   
};

const MODE_PARAMS_SETTLE_DELAY_MS = 400;

const MODE_BY_KEY = MODE_DEFINITIONS.reduce<Record<GameMode, ModeDefinition>>(
    (acc, mode) => {
        acc[mode.key] = mode;
        return acc;
    },
    {} as Record<GameMode, ModeDefinition>
);

function parseGameMode(rawMode: string | null): GameMode {
    if (!rawMode) return "full";
    if (rawMode in MODE_BY_KEY) return rawMode as GameMode;
    return "full";
}

function isGameMode(value: string): value is GameMode {
    return value in MODE_BY_KEY;
}

function parseModeParams(searchParams: URLSearchParams): ModeParams {
    const parsed = { ...DEFAULT_MODE_PARAMS };

    for (const definition of MODE_DEFINITIONS) {
        for (const field of definition.fields) {
            const rawValue = searchParams.get(field.queryKey);
            if (!rawValue) continue;

            const numericValue = Number(rawValue);
            if (!Number.isFinite(numericValue)) continue;

            parsed[field.key] = field.sanitize(Math.floor(numericValue));
        }
    }

    return parsed;
}

function applyModeToSearchParams(
    searchParams: URLSearchParams,
    mode: GameMode,
    modeParams: ModeParams
) {
    searchParams.set("mode", mode);

    for (const definition of MODE_DEFINITIONS) {
        for (const field of definition.fields) {
            searchParams.delete(field.queryKey);
        }
    }

    const activeDefinition = MODE_BY_KEY[mode];
    for (const field of activeDefinition.fields) {
        const sanitizedValue = field.sanitize(modeParams[field.key]);
        searchParams.set(field.queryKey, String(sanitizedValue));
    }
}

function buildRedirectPathWithMode(result: string, mode: GameMode, modeParams: ModeParams): string {
    const scannedPath = result.replace(window.location.origin, "");
    const targetUrl = new URL(scannedPath, window.location.origin);
    applyModeToSearchParams(targetUrl.searchParams, mode, modeParams);

    const search = targetUrl.searchParams.toString();
    return `${targetUrl.pathname}${search ? `?${search}` : ""}${targetUrl.hash}`;
}

export default function AuthorisedPlayPage() {
    const [scannerOpen, setScannerOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const navigate = useNavigate();
    const location = useLocation();

    const [optionsOpen, setOptionsOpen] = useState(false);

    const { currentTrackId: currentTrackIdFromPath } = useParams();
    const [searchParams] = useSearchParams();

    const [gameMode, setGameMode] = useState<GameMode>(() =>
        parseGameMode(searchParams.get("mode"))
    );
    const [modeParams, setModeParams] = useState<ModeParams>(() => parseModeParams(searchParams));
    const [appliedModeParams, setAppliedModeParams] = useState<ModeParams>(() =>
        parseModeParams(searchParams)
    );

    const onScan = (result: string) => {
        setScannerOpen(false);
        setErrorMsg(null);
        navigate(buildRedirectPathWithMode(result, gameMode, modeParams));
    };

    const onPlayerError = useCallback((msg: string) => {
        setErrorMsg(msg);
    }, []);

    const currentTrackId = useMemo(() => {
        return (
            currentTrackIdFromPath ??
            searchParams.get("currentTrackId") ??
            searchParams.get("trackId")
        );
    }, [currentTrackIdFromPath, searchParams]);

    const activeMode = useMemo(() => MODE_BY_KEY[gameMode], [gameMode]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setAppliedModeParams(modeParams);
        }, MODE_PARAMS_SETTLE_DELAY_MS);

        return () => window.clearTimeout(timeoutId);
    }, [modeParams]);

    const activePlayerOptions = useMemo(
        () => activeMode.toPlayerOptions(appliedModeParams),
        [activeMode, appliedModeParams]
    );

    useEffect(() => {
        const nextParams = new URLSearchParams(location.search);
        applyModeToSearchParams(nextParams, gameMode, modeParams);

        const currentSearch = location.search.startsWith("?")
            ? location.search.slice(1)
            : location.search;
        const nextSearch = nextParams.toString();

        if (currentSearch === nextSearch) return;

        navigate(
            {
                pathname: location.pathname,
                search: nextSearch ? `?${nextSearch}` : "",
                hash: location.hash,
            },
            { replace: true }
        );
    }, [gameMode, location.hash, location.pathname, location.search, modeParams, navigate]);

    return (
        <div
            style={{
                minHeight: "90vh",
                overflowY: "auto",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <QRScannerModal onScan={onScan} isOpen={scannerOpen} onOpenChange={setScannerOpen} />
            <Stack h={"100%"} align="stretch" justify="center" style={{ width: "100%" }}>
                <Paper
                    p={isMobile ? "sm" : "md"}
                    mx="auto"
                    mt="md"
                    w={isMobile ? "88%" : "68%"}
                    maw={560}
                >
                    {" "}
                    <Stack gap="sm">
                        <Select
                            aria-label="Spielmodus"
                            selectedKeys={new Set([gameMode])}
                            onSelectionChange={keys => {
                                const selectedKey =
                                    keys instanceof Set ? Array.from(keys)[0] : keys;
                                const selectedMode = String(selectedKey ?? "");
                                if (isGameMode(selectedMode)) {
                                    setGameMode(selectedMode);
                                }
                            }}
                            disallowEmptySelection
                        >
                            {MODE_DEFINITIONS.map(mode => (
                                <SelectItem key={mode.key}>{mode.label}</SelectItem>
                            ))}
                        </Select>
                        {activeMode.fields.length > 0 && (
                            <Button
                                variant={"light"}
                                onPress={() => setOptionsOpen(!optionsOpen)}
                                endContent={
                                    optionsOpen ? (
                                        <IconCaretDownFilled
                                            size={16}
                                            style={{ transform: "rotate(180deg)" }}
                                        />
                                    ) : (
                                        <IconCaretDown size={16} />
                                    )
                                }
                            >
                                {optionsOpen ? <Text>Optionen</Text> : <Text>Optionen</Text>}
                            </Button>
                        )}
                        <Transition
                            mounted={optionsOpen}
                            transition="fade-down"
                            duration={200}
                            timingFunction="ease"
                        >
                            {styles => (
                                <div style={styles}>
                                    {activeMode.fields.length > 0 && (
                                        <Group grow>
                                            {activeMode.fields
                                                .filter(field => field.renderInUi !== false)
                                                .map(field =>
                                                    field.control === "range-slider" ? (
                                                        <Stack key={field.key} gap="xs">
                                                            <Slider
                                                                label={field.label}
                                                                minValue={field.min}
                                                                maxValue={
                                                                    field.max ??
                                                                    Math.max(
                                                                        field.min + 60,
                                                                        modeParams[field.key] + 30
                                                                    )
                                                                }
                                                                step={field.step}
                                                                value={[
                                                                    modeParams[field.key],
                                                                    Math.max(
                                                                        modeParams[field.key] + 1,
                                                                        modeParams[
                                                                            field.rangeEndKey ??
                                                                                "endAtSeconds"
                                                                        ]
                                                                    ),
                                                                ]}
                                                                onChange={value => {
                                                                    if (!Array.isArray(value))
                                                                        return;
                                                                    const start = field.sanitize(
                                                                        Math.floor(value[0])
                                                                    );
                                                                    const rangeEndKey =
                                                                        field.rangeEndKey ??
                                                                        "endAtSeconds";
                                                                    const end = Math.max(
                                                                        start + 1,
                                                                        Math.floor(value[1])
                                                                    );
                                                                    setModeParams(prev => ({
                                                                        ...prev,
                                                                        [field.key]: start,
                                                                        [rangeEndKey]: end,
                                                                    }));
                                                                }}
                                                                showTooltip={true}
                                                                formatOptions={{
                                                                    style: "unit",
                                                                    unit: "second",
                                                                }}
                                                            />
                                                            <Text size="sm" c="dimmed">
                                                                Start: {modeParams[field.key]}s,
                                                                Ende:{" "}
                                                                {
                                                                    modeParams[
                                                                        field.rangeEndKey ??
                                                                            "endAtSeconds"
                                                                    ]
                                                                }
                                                                s
                                                            </Text>
                                                        </Stack>
                                                    ) : field.control === "slider" ? (
                                                        <Stack key={field.key} gap="xs">
                                                            <Slider
                                                                label={field.label}
                                                                minValue={field.min}
                                                                maxValue={
                                                                    field.max ??
                                                                    Math.max(
                                                                        field.min + 60,
                                                                        modeParams[field.key] + 30
                                                                    )
                                                                }
                                                                step={field.step}
                                                                value={modeParams[field.key]}
                                                                onChange={value => {
                                                                    if (Array.isArray(value))
                                                                        return;
                                                                    const nextValue =
                                                                        field.sanitize(
                                                                            Math.floor(value)
                                                                        );
                                                                    setModeParams(prev => {
                                                                        const next = {
                                                                            ...prev,
                                                                            [field.key]: nextValue,
                                                                        };

                                                                        if (
                                                                            field.key ===
                                                                                "startAtSeconds" ||
                                                                            field.key ===
                                                                                "endAtSeconds"
                                                                        ) {
                                                                            next.endAtSeconds =
                                                                                Math.max(
                                                                                    next.startAtSeconds +
                                                                                        1,
                                                                                    next.endAtSeconds
                                                                                );
                                                                        }

                                                                        return next;
                                                                    });
                                                                }}
                                                                showTooltip={true}
                                                                formatOptions={{
                                                                    style: "unit",
                                                                    unit: "second",
                                                                }}
                                                            />
                                                            <Text size="sm" c="dimmed">
                                                                {modeParams[field.key]}s
                                                            </Text>
                                                        </Stack>
                                                    ) : (
                                                        <Input
                                                            key={field.key}
                                                            label={field.label}
                                                            type="number"
                                                            min={field.min}
                                                            step={field.step}
                                                            value={String(modeParams[field.key])}
                                                            onValueChange={value => {
                                                                const parsedValue =
                                                                    value.trim() === ""
                                                                        ? field.fallback
                                                                        : Number(value);
                                                                const numericValue =
                                                                    Number.isFinite(parsedValue)
                                                                        ? parsedValue
                                                                        : field.fallback;
                                                                setModeParams(prev => ({
                                                                    ...prev,
                                                                    [field.key]: field.sanitize(
                                                                        Math.floor(numericValue)
                                                                    ),
                                                                }));
                                                            }}
                                                        />
                                                    )
                                                )}
                                        </Group>
                                    )}
                                </div>
                            )}
                        </Transition>
                    </Stack>
                </Paper>
                {currentTrackId ? (
                    <PlayerElement
                        currentTrackId={currentTrackId}
                        onError={onPlayerError}
                        startAtSeconds={activePlayerOptions.startAtSeconds}
                        stopAtSeconds={activePlayerOptions.stopAtSeconds}
                        startAtMiddle={activePlayerOptions.startAtMiddle}
                        startAtRandom={activePlayerOptions.startAtRandom}
                        minDistanceFromEndSeconds={activePlayerOptions.minDistanceFromEndSeconds}
                        maxPlayDurationSeconds={activePlayerOptions.maxPlayDurationSeconds}
                    />
                ) : (
                    <Center
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            paddingTop: "0.5rem",
                        }}
                    >
                        <Stack align="center" gap="md" w="100%">
                            <Alert
                                variant="flat"
                                color="secondary"
                                className={
                                    isMobile
                                        ? "w-[88%] max-w-[520px] py-4 px-4 text-center"
                                        : "w-[68%] max-w-[560px] py-7 px-6 text-center"
                                }
                            >
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <IconScan size={22} />
                                        <Text fw={700} size={isMobile ? "md" : "lg"}>
                                            Bereit zum Starten?
                                        </Text>
                                    </div>
                                    <Text size={isMobile ? "sm" : "md"}>
                                        Scanne einen Song, damit das Spiel beginnen kann.
                                    </Text>
                                </div>
                            </Alert>
                            <Button
                                startContent={<IconScan size={20} />}
                                color="primary"
                                className={
                                    isMobile ? "w-[88%] max-w-[520px]" : "w-[68%] max-w-[560px]"
                                }
                                onPress={() => setScannerOpen(true)}
                            >
                                Song scannen
                            </Button>
                        </Stack>
                    </Center>
                )}
                {errorMsg && (
                    <Text c="red" ta="center" size="sm">
                        {errorMsg}
                    </Text>
                )}
                {currentTrackId && (
                    <Button
                        startContent={<IconScan size={20} />}
                        color="primary"
                        className={isMobile ? "w-6/8 mt-10 mx-auto" : "w-4/10 mt-10 mx-auto"}
                        onPress={() => setScannerOpen(true)}
                    >
                        Nächsten Song scannen
                    </Button>
                )}
            </Stack>
        </div>
    );
}
