import AWS from 'aws-sdk'

// AWS Lambda handler for the "Send Inquiry" form.
// This version sends an email via Amazon SES and does NOT use a database.
// Configure these environment variables on the Lambda:
// - INQUIRY_TO_EMAIL   (required)  – where to send the inquiry
// - INQUIRY_FROM_EMAIL (optional)  – verified SES sender; defaults to INQUIRY_TO_EMAIL
// - FRONTEND_ORIGIN    (optional)  – your frontend origin for CORS

const ses = new AWS.SES({ region: process.env.AWS_REGION || 'us-east-1' })

export const handler = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || {}
    const { name, email, phone, company, service, message } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({ error: 'Name, email, and message are required' }),
      }
    }

    const id = `inq-${Date.now()}`

    const toEmail = process.env.INQUIRY_TO_EMAIL
    const fromEmail = process.env.INQUIRY_FROM_EMAIL || toEmail

    if (!toEmail) {
      console.error('INQUIRY_TO_EMAIL is not configured on the Lambda')
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({ error: 'Inquiry email destination not configured' }),
      }
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

    console.log('New inquiry received', payload)

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

    const params = {
      Source: fromEmail,
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: textBody },
        },
      },
    }

    await ses.sendEmail(params).promise()

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        // CORS: allow the S3 / CloudFront origin
        'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify({ id, message: 'Inquiry received' }),
    }
  } catch (err) {
    console.error('Failed to handle inquiry', err)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

