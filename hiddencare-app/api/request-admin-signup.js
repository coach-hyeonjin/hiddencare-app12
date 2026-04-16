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

    const { email, password, name, gym_name, phone } = req.body || {}

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

    const response = await fetch(
      `${supabaseUrl}/rest/v1/admin_signup_requests`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      }
    )

    const text = await response.text()

    let result = null
    try {
      result = text ? JSON.parse(text) : null
    } catch {
      result = text
    }

    if (!response.ok) {
      console.error('request-admin-signup REST insert error:', result)
      return res.status(response.status).json({
        error: '가입신청 저장 실패',
        details: result,
      })
    }

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    console.error('request-admin-signup unexpected error:', err)
    return res.status(500).json({
      error: err?.message || '서버 오류',
    })
  }
}
