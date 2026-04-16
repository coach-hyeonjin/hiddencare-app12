const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, name, gym_name, phone } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        error: '이메일, 비밀번호, 이름은 필수입니다.',
      })
    }

    const { error } = await supabase
      .from('admin_signup_requests')
      .insert([
        {
          email,
          password,
          name,
          gym_name,
          phone,
          status: 'pending',
        },
      ])

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: '서버 오류' })
  }
}
