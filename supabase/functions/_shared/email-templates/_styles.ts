// Shared brand styles for The Nilgiri Root auth emails.
// Forest Green primary, Off-White surface, Playfair Display headings, Inter body.

export const fontStack =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

export const headingStack =
  "'Playfair Display', Georgia, 'Times New Roman', serif"

// Body background is always white per email guidelines.
export const main = {
  backgroundColor: '#ffffff',
  fontFamily: fontStack,
  margin: 0,
  padding: 0,
}

export const container = {
  backgroundColor: '#F5F4EE',
  border: '1px solid #E4E2D7',
  borderRadius: '12px',
  margin: '32px auto',
  maxWidth: '560px',
  padding: '40px 36px',
}

export const logoSection = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

export const logo = {
  display: 'block',
  margin: '0 auto',
  borderRadius: '12px',
}

export const h1 = {
  fontFamily: headingStack,
  fontSize: '26px',
  fontWeight: 600 as const,
  color: '#1F3A2E',
  textAlign: 'center' as const,
  margin: '0 0 18px',
  letterSpacing: '-0.01em',
}

export const text = {
  fontFamily: fontStack,
  fontSize: '15px',
  color: '#3F4A45',
  lineHeight: '1.65',
  margin: '0 0 18px',
}

export const link = {
  color: '#346556',
  textDecoration: 'underline',
}

export const button = {
  backgroundColor: '#346556',
  color: '#FFFFFF',
  fontFamily: fontStack,
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  letterSpacing: '0.02em',
}

export const smallNote = {
  fontFamily: fontStack,
  fontSize: '12px',
  color: '#6B7570',
  lineHeight: '1.5',
  margin: '20px 0 0',
  wordBreak: 'break-all' as const,
}

export const divider = {
  borderColor: '#E4E2D7',
  margin: '32px 0 20px',
}

export const footerText = {
  fontFamily: fontStack,
  fontSize: '13px',
  color: '#6B7570',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

export const brandFooter = {
  fontFamily: headingStack,
  fontSize: '12px',
  color: '#346556',
  textAlign: 'center' as const,
  margin: '20px 0 0',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
}

export const codeStyle = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: '28px',
  fontWeight: 700 as const,
  color: '#1F3A2E',
  backgroundColor: '#FFFFFF',
  border: '1px solid #E4E2D7',
  borderRadius: '8px',
  padding: '16px 20px',
  textAlign: 'center' as const,
  letterSpacing: '0.4em',
  margin: '0 0 24px',
}
