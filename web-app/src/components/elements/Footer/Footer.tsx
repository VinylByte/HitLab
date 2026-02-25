import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';
import { ActionIcon, Container, Group } from '@mantine/core';
import classes from './FooterSocial.module.css';
import { Image } from "@heroui/react";

import VinylLogo from "../../../assets/VinylByteLogo.svg";

import { SOCIALS } from '../../pages/Settings';


export function FooterSocial() {
  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Group>
            <Image src={VinylLogo} alt="VinylByte Logo" className="w-10 h-10 mr-2" />
            <p className="font-bold text-inherit text-xl">HitLab</p>
        </Group>
        <Group gap={0} className={classes.links} justify="flex-end" wrap="nowrap">
          {
            SOCIALS.map((social) => (
                <ActionIcon key={social.name} size="lg" color="gray" variant="subtle" aria-label={social.name} component="a"
                    href={social.url} target="_blank" rel="noopener noreferrer"
                >
                    {social.icon}
                </ActionIcon>
            ))

          }
        </Group>
      </Container>
    </div>
  );
}