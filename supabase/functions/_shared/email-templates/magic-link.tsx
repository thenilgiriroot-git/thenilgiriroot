/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import {
  brandFooter,
  button,
  container,
  divider,
  footerText,
  h1,
  link,
  logo,
  logoSection,
  main,
  smallNote,
  text,
} from './_styles.ts'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your secure sign-in link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://gmuprayrdyghdmvrxrss.supabase.co/storage/v1/object/public/email-assets/logo.png"
            alt={siteName}
            width="72"
            height="72"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Your sign-in link</Heading>
        <Text style={text}>
          Tap the button below to sign in to {siteName}. For your security, this
          link will expire shortly and can only be used once.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button style={button} href={confirmationUrl}>
            Sign In
          </Button>
        </Section>
        <Text style={smallNote}>
          If the button doesn't work, copy and paste this link into your browser:
          <br />
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Hr style={divider} />
        <Text style={footerText}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
        <Text style={brandFooter}>
          Sourced from the Nilgiris · The Nilgiri Root
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
