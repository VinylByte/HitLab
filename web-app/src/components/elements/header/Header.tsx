import { useMemo, useState } from "react";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Image,
    Link,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarMenu,
    NavbarMenuItem,
    NavbarItem,
    Button,
    Image,
    Link,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
} from "@heroui/react";
import { Center } from "@mantine/core";
import { IconLogin, IconLogout, IconUser } from "@tabler/icons-react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

import VinylLogo from "../../../assets/VinylByteLogo.svg";
import { Pages, ProtectedPages, MOBILE_BREAKPOINT } from "../../pages/Settings";
import { Burger, Center } from "@mantine/core";
import { IconLogin, IconLogout, IconUser, IconMoon, IconSun } from "@tabler/icons-react";
import { useSession } from "../../../hooks/useSession";
import { useAppTheme } from "../../../hooks/useAppTheme";
import supabase from "../../../supabase";
import { useMediaQuery } from "@mantine/hooks";

export default function HeaderNav() {
    const currentHref = useLocation().pathname;
    const navigate = useNavigate();
    const [expandedNav, setExpandedNav] = useState(false);
    const session = useSession();
    const { theme, toggleTheme } = useAppTheme();
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

    const Links = useMemo(() => {
        let pages = Pages.map(page => ({ name: page.name, to: page.to, location: page.location }));
        if (session) {
            pages = pages.concat(
                ProtectedPages.map(page => ({
                    name: page.name,
                    to: page.to,
                    location: page.location,
                }))
            );
        }
        pages = pages.filter(page => page.location === "header");
        return pages;
    }, [session]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/", { replace: true });
    };

    return (
        <Navbar
            isBordered
            onMenuOpenChange={setExpandedNav}
            isMenuOpen={expandedNav}
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
            <Burger opened={expanded_nav} onClick={()=>setExpanded_nav(!expanded_nav)}/>
            <NavbarBrand
                as={RouterLink}
                to="/"
                onClick={() => setExpandedNav(false)}
                className="flex items-center"
            >
                <Image src={VinylLogo} alt="VinylByte Logo" className="w-10 h-10 mr-2" />
                {!isMobile && <p className="font-bold text-inherit text-xl">HitLab</p>}
            </NavbarBrand>
            <NavbarMenu>
                {links.map(item => (
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
                            onClick={() => setExpandedNav(false)}
                        >
                            <Center w="100vw">{item.name}</Center>
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                {links.map(link => (
                    <NavbarItem isActive={currentHref === link.to} key={link.to}>
                        <Link
                            as={RouterLink}
                            to={link.to}
                            color={currentHref === link.to ? "primary" : "foreground"}
                            className="w-30 h-15"
                        >
                            <Center w="100%">
                                <p className="text-md">{link.name}</p>
                            </Center>
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>
            <NavbarContent justify="end">
                {!session && (
                    <NavbarItem>
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={toggleTheme}
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
                    </Button>
                </NavbarItem>
                )}
                <NavbarItem>
                    {session ? (
                        <Dropdown>
                            <DropdownTrigger>
                                <Avatar src={session.user.user_metadata.avatar_url} className="hover:cursor-pointer hover:transition-transform hover:scale-95"/>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Static Actions">
                                <DropdownItem startContent={theme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />} key="theme-toggle" onClick={toggleTheme}>Theme ändern</DropdownItem>
                                <DropdownItem startContent={<IconUser />} key="account" showDivider>Account</DropdownItem>
                                <DropdownItem onClick={() => handleLogout()} startContent={<IconLogout />} key="logout" className="text-danger" color="danger">
                                    Logout
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    ) : (
                        <Button
                            startContent={<IconLogin />}
                            as={RouterLink}
                            color="primary"
                            to="/login"
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
