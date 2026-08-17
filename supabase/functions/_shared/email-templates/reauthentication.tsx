/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import {
  brandFooter,
  codeStyle,
  container,
  divider,
  footerText,
  h1,
  logo,
  logoSection,
  main,
  text,
} from './_styles.ts'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://gmuprayrdyghdmvrxrss.supabase.co/storage/v1/object/public/email-assets/logo.png"
            alt="The Nilgiri Root"
            width="72"
            height="72"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Confirm it's you</Heading>
        <Text style={text}>
          Use the verification code below to confirm your identity. This code
          will expire shortly.
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Hr style={divider} />
        <Text style={footerText}>
          If you didn't request this code, you can safely ignore this email.
        </Text>
        <Text style={brandFooter}>
          Sourced from the Nilgiris · The Nilgiri Root
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
