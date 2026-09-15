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

const REQUEST_TYPE_LABELS: Record<string, string> = {
  access: 'access the personal data we hold about you',
  correction: 'correct your personal data',
  erasure: 'erase your personal data',
  withdraw: 'withdraw your consent',
  nomination: 'register a nominee for your data',
  grievance: 'raise a grievance',
}

interface DpRequestVerificationEmailProps {
  siteName: string
  requestType: string
  reference: string
  verificationUrl: string
  responseDays: number
}

export const DpRequestVerificationEmail = ({
  siteName,
  requestType,
  reference,
  verificationUrl,
  responseDays,
}: DpRequestVerificationEmailProps) => {
  const intent = REQUEST_TYPE_LABELS[requestType] ?? 'process your request'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Confirm your request to {siteName} — reference {reference}</Preview>
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
          <Heading style={h1}>Confirm your request</Heading>
          <Text style={text}>
            We received a request to {intent} at {siteName}, reference{' '}
            <strong>{reference}</strong>. To make sure this request came from
            you and not someone else using your email address, please confirm
            it using the button below.
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button style={button} href={verificationUrl}>
              Confirm this request
            </Button>
          </Section>
          <Text style={smallNote}>
            If the button doesn't work, copy and paste this link into your browser:
            <br />
            <Link href={verificationUrl} style={link}>{verificationUrl}</Link>
          </Text>
          <Text style={text}>
            This link expires in 48 hours. Once confirmed, we will respond to
            reference {reference} within {responseDays} days, as required
            under the Digital Personal Data Protection Act, 2023.
          </Text>
          <Hr style={divider} />
          <Text style={footerText}>
            If you did not make this request, you can safely ignore this
            email — no action will be taken and nothing will change.
          </Text>
          <Text style={brandFooter}>
            Sourced from the Nilgiris · The Nilgiri Root
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default DpRequestVerificationEmail
