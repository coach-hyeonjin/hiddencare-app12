const https = require('https')

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)

    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        protocol: parsedUrl.protocol,
        port: parsedUrl.port || 443,
        headers,
      },
      (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          let parsed = null

          try {
            parsed = data ? JSON.parse(data) : null
          } catch {
            parsed = data
          }

          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: parsed,
          })
        })
      }
    )

    req.on('error', (err) => {
      reject(err)
    })

    req.write(body)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return res.status(500).json({ error: 'SUPABASE_URL 환경변수가 없습니다.' })
    }

    if (!serviceRoleKey) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다.' })
    }

    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}

    const { email, password, name, gym_name, phone } = body

    if (!email || !password || !name) {
      return res.status(400).json({
        error: '이메일, 비밀번호, 이름은 필수입니다.',
      })
    }

    const payload = {
      email: String(email).trim(),
      password: String(password),
      name: String(name).trim(),
      gym_name: gym_name ? String(gym_name).trim() : null,
      phone: phone ? String(phone).trim() : null,
      status: 'pending',
    }

    const response = await postJson(
      `${supabaseUrl}/rest/v1/admin_signup_requests`,
      {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: 'return=representation',
      },
      JSON.stringify(payload)
    )

    if (!response.ok) {
      console.error('request-admin-signup REST insert error:', response.data)
      return res.status(response.status || 500).json({
        error: '가입신청 저장 실패',
        details: response.data,
      })
    }

    return res.status(200).json({
      success: true,
      data: response.data,
    })
  } catch (err) {
    console.error('request-admin-signup unexpected error:', err)
    return res.status(500).json({
      error: err?.message || '서버 오류',
    })
  }
}
