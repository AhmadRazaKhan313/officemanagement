import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('=== INVITE API CALLED ===')
    console.log('Body:', body)
    console.log('API Key:', process.env.RESEND_API_KEY?.slice(0, 10) + '...')

    const { email, name, company_name, role, token } = body
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/Invite/${token}`

    console.log('Sending to:', email)
    console.log('Invite URL:', inviteUrl)

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      // to: email,
      to : "ahmadrazakhan130@gmail.com",  //for testing
      subject: `Invitation to join ${company_name}`,
      html: `
        <h2>You are invited!</h2>
        <p>Hi ${name}, you have been invited to join ${company_name} as ${role}.</p>
        <a href="${inviteUrl}">Accept Invitation</a>
        <p>This link expires in 7 days.</p>
      `
    })

    console.log('Resend data:', data)
    console.log('Resend error:', error)

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ success: true, data })

  } catch (err) {
    console.log('=== CATCH ERROR ===')
    console.log(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}