import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'


const region = process.env.AWS_REGION || 'us-east-1'
const sesClient = new SESClient({ region })

function corsHeaders() {
  const origin = process.env.FRONTEND_ORIGIN?.trim()
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
    
  } else {
    headers['Access-Control-Allow-Origin'] = '*'
  }
  return headers
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
    body: JSON.stringify(body),
  }
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: '',
    }
  }

  if (method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  try {
    const rawPath = event.rawPath || event.path || ''
    if (!rawPath.includes('/api/inquiries')) {
      return jsonResponse(404, { error: 'Not found' })
    }

    let body
    try {
      body =
        typeof event.body === 'string'
          ? JSON.parse(event.body || '{}')
          : event.body || {}
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON body' })
    }
    const { name, email, phone, company, service, message } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return jsonResponse(400, {
        error: 'Name, email, and message are required',
      })
    }

    const id = `inq-${Date.now()}`
    const toEmail = process.env.INQUIRY_TO_EMAIL
    const fromEmail = process.env.INQUIRY_FROM_EMAIL || toEmail

    if (!toEmail) {
      console.error('INQUIRY_TO_EMAIL is not configured on the Lambda')
      return jsonResponse(500, {
        error: 'Inquiry email destination not configured',
      })
    }

    const payload = {
      id,
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      service: service?.trim() || '',
      message: message.trim(),
      createdAt: new Date().toISOString(),
    }

    const subject = `New inquiry from ${payload.name}`
    const textBody =
      `New inquiry received:\n\n` +
      `Name: ${payload.name}\n` +
      `Email: ${payload.email}\n` +
      `Phone: ${payload.phone}\n` +
      `Company: ${payload.company}\n` +
      `Service: ${payload.service}\n\n` +
      `Message:\n${payload.message}\n\n` +
      `ID: ${payload.id}\n` +
      `Time: ${payload.createdAt}\n`

    // Optional: INQUIRY_REPLY_TO_INQUIRER=1 adds Reply-To (in sandbox the inquirer email must be verified in SES)
    const cmd = {
      Source: fromEmail,
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: textBody } },
      },
    }
    if (process.env.INQUIRY_REPLY_TO_INQUIRER === '1') {
      cmd.ReplyToAddresses = [payload.email]
    }

    const sendResult = await sesClient.send(new SendEmailCommand(cmd))

    console.log('Inquiry email sent via SES', {
      id: payload.id,
      sesMessageId: sendResult.MessageId,
      to: toEmail,
      from: fromEmail,
    })

    return jsonResponse(201, { id, message: 'Inquiry received' })
  } catch (err) {
    console.error('Failed to handle inquiry', err)

    const name = err?.name || ''
    const msg = String(err?.message || '')
    const sesRelated =
      name === 'MessageRejected' ||
      name === 'MailFromDomainNotVerifiedException' ||
      name === 'ConfigurationSetDoesNotExistException' ||
      /not verified|sandbox/i.test(msg)

    if (sesRelated) {
      return jsonResponse(502, {
        error:
          'Email could not be sent via Amazon SES. Verify INQUIRY_FROM_EMAIL and INQUIRY_TO_EMAIL in SES (same region as Lambda), move out of sandbox if needed, and attach ses:SendEmail to the Lambda role.',
      })
    }

    return jsonResponse(500, {
      error: 'Internal server error',
    })
  }
}
