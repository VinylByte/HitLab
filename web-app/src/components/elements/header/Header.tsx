import { useState } from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    NavbarItem,
    Button,
    Image,
    Link,
} from "@heroui/react";

import { Link as RouterLink, useLocation, useNavigate } from "react-router";

import VinylLogo from "../../../assets/VinylByteLogo.svg";
import { Pages } from "../../pages/Settings";
import { Center } from "@mantine/core";
import { IconLogin, IconLogout } from "@tabler/icons-react";
import { useSession } from "../../../hooks/useSession";
import { supabase } from "../../../lib/supabase";

const Links = Pages.map(page => ({ name: page.name, to: page.to }));

export default function HeaderNav() {
    const currentHref = useLocation().pathname;
    const navigate = useNavigate();
    const [expanded_nav, setExpanded_nav] = useState(false);
    const session = useSession();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/", { replace: true });
    };

    return (
        <Navbar
            isBordered
            onMenuOpenChange={setExpanded_nav}
            isMenuOpen={expanded_nav}
            classNames={{
                item: [
                    "flex",
                    "relative",
                    "h-full",
                    "items-center",
                    "data-[active=true]:after:content-['']",
                    "data-[active=true]:after:absolute",
                    "data-[active=true]:after:bottom-0",
                    "data-[active=true]:after:left-0",
                    "data-[active=true]:after:right-0",
                    "data-[active=true]:after:h-[2px]",
                    "data-[active=true]:after:rounded-[2px]",
                    "data-[active=true]:after:bg-primary",
                ],
            }}
        >
            <NavbarMenuToggle
                aria-label={expanded_nav ? "Close menu" : "Open menu"}
                className="sm:hidden"
            />
            <NavbarBrand
                as={RouterLink}
                to="/"
                onClick={() => setExpanded_nav(false)}
                className="flex items-center"
            >
                <Image src={VinylLogo} alt="VinylByte Logo" className="w-10 h-10 mr-2" />
                <p className="font-bold text-inherit text-xl">HitLab</p>
            </NavbarBrand>
            <NavbarMenu>
                {Links.map(item => (
                    <NavbarMenuItem
                        key={`${item.name}-${item.to}`}
                        isActive={currentHref === item.to}
                        className="pt-2 pb-2"
                    >
                        <Link
                            as={RouterLink}
                            className="w-full"
                            to={item.to}
                            size="lg"
                            color={currentHref === item.to ? "primary" : "foreground"}
                            onClick={() => setExpanded_nav(false)}
                        >
                            <Center w={"100vw"}>{item.name}</Center>
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                {Links.map(link => (
                    <NavbarItem isActive={currentHref === link.to} key={link.to}>
                        <Link
                            as={RouterLink}
                            to={link.to}
                            color={currentHref === link.to ? "primary" : "foreground"}
                            className="w-30 h-15"
                        >
                            <Center w={"100%"}>
                                <p className="text-md">{link.name}</p>
                            </Center>
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem>
                    {session ? (
                        <Button
                            startContent={<IconLogout />}
                            color="danger"
                            variant="flat"
                            onPress={handleLogout}
                        >
                            <p className="text-md">Logout</p>
                        </Button>
                    ) : (
                        <Button
                            startContent={<IconLogin />}
                            as={RouterLink}
                            color="primary"
                            to={"/login"}
                            variant="flat"
                        >
                            <p className="text-md">Login</p>
                        </Button>
                    )}
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
