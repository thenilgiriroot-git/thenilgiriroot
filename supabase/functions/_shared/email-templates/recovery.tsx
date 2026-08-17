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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
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
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset the password for your {siteName}
          account. Click the button below to choose a new one.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button style={button} href={confirmationUrl}>
            Reset Password
          </Button>
        </Section>
        <Text style={smallNote}>
          If the button doesn't work, copy and paste this link into your browser:
          <br />
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Hr style={divider} />
        <Text style={footerText}>
          If you didn't request a password reset, you can safely ignore this
          email — your password will not change.
        </Text>
        <Text style={brandFooter}>
          Sourced from the Nilgiris · The Nilgiri Root
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
