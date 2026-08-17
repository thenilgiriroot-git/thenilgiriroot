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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for {siteName}</Preview>
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
        <Heading style={h1}>Confirm your email change</Heading>
        <Text style={text}>
          You've requested to change the email address on your {siteName}
          account from{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button style={button} href={confirmationUrl}>
            Confirm Email Change
          </Button>
        </Section>
        <Text style={smallNote}>
          If the button doesn't work, copy and paste this link into your browser:
          <br />
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Hr style={divider} />
        <Text style={footerText}>
          If you didn't request this change, please secure your account
          immediately by resetting your password.
        </Text>
        <Text style={brandFooter}>
          Sourced from the Nilgiris · The Nilgiri Root
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
