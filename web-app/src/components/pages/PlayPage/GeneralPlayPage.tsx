import { Center, Loader } from "@mantine/core";
import { useSession } from "../../../hooks/useSession";
import AuthorisedPlayPage from "./Authorised/AuthorisedPlayPage";
import UnauthorisedPlayPage from "./Unauthorised/UnauthorisedPlayPage";



export default function GeneralPlayPage() {
    const session = useSession();
    if (session === undefined) {
        return (
            <></>
        );
    }
    return (
        <div>
            {session ? <AuthorisedPlayPage /> : <UnauthorisedPlayPage />}
        </div>
    );
}
