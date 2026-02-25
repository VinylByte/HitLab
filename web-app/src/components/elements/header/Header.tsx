import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Button,
    Image,
    Link
} from "@heroui/react";

import { Link as RouterLink, useLocation } from "react-router";

import VinylLogo from "../../../assets/VinylByteLogo.svg";
import { Pages } from "../../pages/Settings";

const Links = Pages.map((page) => ({ name: page.name, to: page.to }))


export default function HeaderNav() {
    const currentHref = useLocation().pathname;
    return (
        <Navbar isBordered classNames={{
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
            <NavbarBrand as={RouterLink} to="/" className="flex items-center">
                <Image src={VinylLogo} alt="VinylByte Logo" className="w-10 h-10 mr-2" />
                <p className="font-bold text-inherit text-xl">HitLab</p>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                {
                    Links.map((link) => (
                        <NavbarItem isActive={currentHref === link.to} key={link.to}>
                            <Link as={RouterLink} to={link.to} color={currentHref === link.to ? "primary" : "foreground"}>
                                {link.name}
                            </Link>
                        </NavbarItem>
                    ))
                }
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <Link as={RouterLink} to="/login">Login</Link>
                </NavbarItem>
                <NavbarItem>
                    <Button as={RouterLink} color="primary" to={"/signup"} variant="flat">
                        Sign Up
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
