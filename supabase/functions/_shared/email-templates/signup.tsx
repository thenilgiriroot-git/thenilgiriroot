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
  fontStack,
  footerText,
  h1,
  link,
  logo,
  logoSection,
  main,
  smallNote,
  text,
} from './_styles.ts'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email to join The Nilgiri Root</Preview>
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
        <Heading style={h1}>Welcome to The Nilgiri Root</Heading>
        <Text style={text}>
          Thank you for joining us — a community rooted in the pristine Nilgiri
          highlands. Please confirm your email{' '}
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>{' '}
          to activate your account.
        </Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button style={button} href={confirmationUrl}>
            Confirm Email
          </Button>
        </Section>
        <Text style={smallNote}>
          If the button doesn't work, copy and paste this link into your browser:
          <br />
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Hr style={divider} />
        <Text style={footerText}>
          If you didn't create an account with{' '}
          <Link href={siteUrl} style={link}>{siteName}</Link>, you can safely ignore
          this email.
        </Text>
        <Text style={brandFooter}>
          Sourced from the Nilgiris · The Nilgiri Root
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
