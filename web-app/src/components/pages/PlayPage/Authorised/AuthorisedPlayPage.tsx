import { Accordion, AccordionItem, Button, Alert, Select, SelectItem } from "@heroui/react";
import QRScannerModal from "./QRScanner/QRScannerElement";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MOBILE_BREAKPOINT } from "../../../../lib/constants";
import PlayerElement from "./Player/PlayerElement";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { IconScan } from "@tabler/icons-react";
import { Center, Group, NumberInput, Paper, Stack, Text } from "@mantine/core";

type GameMode = "full" | "timed" | "middle";

type ModeParams = {
    startAtSeconds: number;
    playDurationSeconds: number;
};

type PlayerModeOptions = {
    startAtSeconds: number;
    playDurationSeconds: number | null;
    startAtMiddle: boolean;
};

type ModeNumberField = {
    key: keyof ModeParams;
    queryKey: string;
    label: string;
    min: number;
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
            playDurationSeconds: null,
            startAtMiddle: false,
        }),
    },
    {
        key: "timed",
        label: "Zeitfenster",
        fields: [
            {
                key: "startAtSeconds",
                queryKey: "startAt",
                label: "Start bei (Sek.)",
                min: 0,
                step: 5,
                fallback: 0,
                sanitize: value => Math.max(0, value),
            },
            {
                key: "playDurationSeconds",
                queryKey: "playDuration",
                label: "Abspieldauer (Sek.)",
                min: 1,
                step: 5,
                fallback: 30,
                sanitize: value => Math.max(1, value),
            },
        ],
        toPlayerOptions: params => ({
            startAtSeconds: Math.max(0, params.startAtSeconds),
            playDurationSeconds: Math.max(1, params.playDurationSeconds),
            startAtMiddle: false,
        }),
    },
    {
        key: "middle",
        label: "Songmitte",
        fields: [],
        toPlayerOptions: () => ({
            startAtSeconds: 0,
            playDurationSeconds: null,
            startAtMiddle: true,
        }),
    },
];

const DEFAULT_MODE_PARAMS: ModeParams = {
    startAtSeconds: 0,
    playDurationSeconds: 30,
};

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

    const { currentTrackId: currentTrackIdFromPath } = useParams();
    const [searchParams] = useSearchParams();

    const [gameMode, setGameMode] = useState<GameMode>(() =>
        parseGameMode(searchParams.get("mode"))
    );
    const [modeParams, setModeParams] = useState<ModeParams>(() => parseModeParams(searchParams));

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

    const activePlayerOptions = useMemo(
        () => activeMode.toPlayerOptions(modeParams),
        [activeMode, modeParams]
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
                {currentTrackId ? (
                    <>
                        <Paper
                            p={isMobile ? "sm" : "md"}
                            mx="auto"
                            mt="md"
                            w={isMobile ? "88%" : "68%"}
                            maw={560}
                        >
                            <Stack gap="sm">
                                <Accordion
                                    variant="splitted"
                                    selectionMode="single"
                                    defaultExpandedKeys={["game-mode"]}
                                >
                                    <AccordionItem
                                        key="game-mode"
                                        aria-label="Spielmodus"
                                        title={
                                            <Group>
                                                Spielmodus{" "}
                                                <Text c={"dimmed"}>Aktiv: {activeMode.label}</Text>
                                            </Group>
                                        }
                                    >
                                        <Stack gap="sm">
                                            <Select
                                                aria-label="Spielmodus"
                                                selectedKeys={new Set([gameMode])}
                                                onSelectionChange={keys => {
                                                    const selectedKey =
                                                        keys instanceof Set
                                                            ? Array.from(keys)[0]
                                                            : keys;
                                                    const selectedMode = String(selectedKey ?? "");
                                                    if (isGameMode(selectedMode)) {
                                                        setGameMode(selectedMode);
                                                    }
                                                }}
                                                disallowEmptySelection
                                            >
                                                {MODE_DEFINITIONS.map(mode => (
                                                    <SelectItem key={mode.key}>
                                                        {mode.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                            {activeMode.fields.length > 0 && (
                                                <Group grow>
                                                    {activeMode.fields.map(field => (
                                                        <NumberInput
                                                            key={field.key}
                                                            label={field.label}
                                                            min={field.min}
                                                            step={field.step}
                                                            value={modeParams[field.key]}
                                                            onChange={value => {
                                                                const numericValue =
                                                                    typeof value === "number"
                                                                        ? value
                                                                        : field.fallback;
                                                                setModeParams(prev => ({
                                                                    ...prev,
                                                                    [field.key]: field.sanitize(
                                                                        Math.floor(numericValue)
                                                                    ),
                                                                }));
                                                            }}
                                                        />
                                                    ))}
                                                </Group>
                                            )}
                                        </Stack>
                                    </AccordionItem>
                                </Accordion>
                            </Stack>
                        </Paper>
                        <PlayerElement
                            currentTrackId={currentTrackId}
                            onError={onPlayerError}
                            startAtSeconds={activePlayerOptions.startAtSeconds}
                            playDurationSeconds={activePlayerOptions.playDurationSeconds}
                            startAtMiddle={activePlayerOptions.startAtMiddle}
                        />
                    </>
                ) : (
                    <Center style={{ flex: 1, width: "100%", minHeight: "70vh" }}>
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
