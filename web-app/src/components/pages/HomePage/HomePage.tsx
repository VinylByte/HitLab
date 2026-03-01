import { Stack } from "@mantine/core";
import { HeroHeader } from "./HeroHeader";
import { FaqPart } from "./FaqPart";


export default function HomePage() {
    return (
        <div className="home-page">
            <Stack w={"100%"}>
                <HeroHeader/>
                <FaqPart/>
            </Stack>
        </div>
    );
}
