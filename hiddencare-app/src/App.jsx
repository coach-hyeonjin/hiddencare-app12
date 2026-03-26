import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import AdminDashboard from './AdminDashboard'
import MemberDashboard from './MemberDashboard'
import logo from './assets/logo.png'

const MEMBER_STORAGE_KEY = 'hiddencare_member_session_v1'
const ADMIN_ROLES = ['admin', 'super_admin']

function BrandHeader({ large = false }) {
  return (
    <div className={`brand-header ${large ? 'large' : ''}`}>
      <img
        src={logo}
        alt="숨바꼭질케어 로고"
        className={`brand-logo ${large ? 'large' : ''}`}
      />
      <div className="brand-header-text">
        <div className="brand-mark">숨바꼭질케어</div>
        {large ? (
          <div className="brand-caption">회원 관리 · 운동 기록 · 식단 기록</div>
        ) : null}
      </div>
    </div>
  )
}

function withTimeout(promise, ms = 4000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms),
    ),
  ])
}

async function fetchProfileByUserId(userId) {
  if (!userId) return null

  try {
    const { data, error } = await withTimeout(
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      4000,
    )

    if (error || !data) return null

    return {
      ...data,
      role: data.role || 'member',
      gym_id: data.gym_id || null,
      is_super_admin: data.role === 'super_admin',
    }
  } catch {
    return null
  }
}

async function verifyMemberAccess(memberId, accessCode) {
  if (!memberId || !accessCode) return null

  try {
    const { data, error } = await withTimeout(
      supabase.rpc('get_member_by_code', {
        member_uuid: memberId,
        code: accessCode.trim(),
      }),
      4000,
    )

    if (error || !data || data.length === 0) return null
    return data[0]
  } catch {
    return null
  }
}

function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setMessage('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setMessage(error.message || '로그인에 실패했습니다.')
        setLoading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      if (!userId) {
        setMessage('사용자 정보를 불러오지 못했습니다.')
        setLoading(false)
        return
      }

      const profile = await fetchProfileByUserId(userId)

      if (!profile || !ADMIN_ROLES.includes(profile.role)) {
        await supabase.auth.signOut()
        setMessage('관리자 계정만 접근할 수 있습니다.')
        setLoading(false)
        return
      }

      onLogin(profile)
    } catch {
      setMessage('로그인 중 오류가 발생했습니다.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-card auth-card-large">
      <BrandHeader large />
      <h1>관리자 로그인</h1>
      <p className="sub-text">Supabase 관리자 계정으로 로그인하세요.</p>

      <form onSubmit={handleLogin} className="stack-gap">
        <label className="field">
          <span>이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@email.com"
          />
        </label>

        <label className="field">
          <span>비밀번호</span>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? '숨김' : '보기'}
            </button>
          </div>
        </label>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '관리자 로그인'}
        </button>

        <button type="button" className="secondary-btn" onClick={onBack}>
          돌아가기
        </button>

        {message ? <div className="message error">{message}</div> : null}
      </form>
    </div>
  )
}

function MemberAccess({ initialMemberId, initialAccessCode, onSuccess, onBack }) {
  const [memberId, setMemberId] = useState(initialMemberId || '')
  const [accessCode, setAccessCode] = useState(initialAccessCode || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAccess = async (e) => {
    e.preventDefault()

    if (!memberId.trim() || !accessCode.trim()) {
      setMessage('회원 ID와 access code를 입력해주세요.')
      return
    }

    setLoading(true)
    setMessage('')

    const member = await verifyMemberAccess(memberId.trim(), accessCode.trim())

    if (!member) {
      setMessage('회원 확인에 실패했습니다. ID 또는 access code를 다시 확인해주세요.')
      setLoading(false)
      return
    }

    const sessionData = {
      member,
      accessCode: accessCode.trim().toUpperCase(),
      savedAt: new Date().toISOString(),
    }

    localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(sessionData))
    onSuccess(sessionData)
    setLoading(false)
  }

  return (
    <div className="auth-card auth-card-large">
      <BrandHeader large />
      <h1>회원 입장</h1>
      <p className="sub-text">회원 링크의 member 값과 access code를 입력하세요.</p>

      <form onSubmit={handleAccess} className="stack-gap">
        <label className="field">
          <span>회원 ID</span>
          <input
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="URL의 ?member= 뒤 값"
          />
        </label>

        <label className="field">
          <span>Access Code</span>
          <input
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            placeholder="예: HC2026A1"
          />
        </label>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? '확인 중...' : '회원 입장'}
        </button>

        <button type="button" className="secondary-btn" onClick={onBack}>
          돌아가기
        </button>

        {message ? <div className="message error">{message}</div> : null}
      </form>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('home')
  const [adminProfile, setAdminProfile] = useState(null)
  const [memberSession, setMemberSession] = useState(null)

  const entryParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      memberId: params.get('member') || '',
      accessCode: (params.get('code') || '').toUpperCase(),
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const fallbackTimer = setTimeout(() => {
      if (!mounted) return
      setLoading(false)
      setMode(entryParams.memberId ? 'member-access' : 'home')
    }, 4000)

    const restore = async () => {
      try {
        const savedMember = localStorage.getItem(MEMBER_STORAGE_KEY)

        if (savedMember) {
          try {
            const parsed = JSON.parse(savedMember)
            const savedMemberId = parsed?.member?.id
            const savedAccessCode = parsed?.accessCode

            if (savedMemberId && savedAccessCode) {
              const verifiedMember = await verifyMemberAccess(savedMemberId, savedAccessCode)

              if (verifiedMember && mounted) {
                const restoredSession = {
                  ...parsed,
                  member: verifiedMember,
                  accessCode: savedAccessCode,
                }

                localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(restoredSession))
                clearTimeout(fallbackTimer)
                setMemberSession(restoredSession)
                setMode('member')
                setLoading(false)
                return
              }
            }

            localStorage.removeItem(MEMBER_STORAGE_KEY)
          } catch {
            localStorage.removeItem(MEMBER_STORAGE_KEY)
          }
        }

        try {
          const { data, error } = await withTimeout(supabase.auth.getSession(), 4000)

          if (!error && data?.session?.user) {
            const profile = await fetchProfileByUserId(data.session.user.id)

            if (profile && ADMIN_ROLES.includes(profile.role) && mounted) {
              clearTimeout(fallbackTimer)
              setAdminProfile(profile)
              setMode('admin')
              setLoading(false)
              return
            }
          }
        } catch {
          // 그냥 홈으로 넘김
        }

        if (entryParams.memberId && entryParams.accessCode) {
          const verifiedMember = await verifyMemberAccess(
            entryParams.memberId,
            entryParams.accessCode,
          )

          if (verifiedMember && mounted) {
            const sessionData = {
              member: verifiedMember,
              accessCode: entryParams.accessCode,
              savedAt: new Date().toISOString(),
            }

            localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(sessionData))
            clearTimeout(fallbackTimer)
            setMemberSession(sessionData)
            setMode('member')
            setLoading(false)
            return
          }
        }

        if (mounted) {
          clearTimeout(fallbackTimer)
          setMode(entryParams.memberId ? 'member-access' : 'home')
          setLoading(false)
        }
      } catch {
        if (mounted) {
          clearTimeout(fallbackTimer)
          setMode(entryParams.memberId ? 'member-access' : 'home')
          setLoading(false)
        }
      }
    }

    restore()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT') {
        setAdminProfile(null)
        if (!memberSession) {
          setMode(entryParams.memberId ? 'member-access' : 'home')
        }
        return
      }

      if (session?.user) {
        const profile = await fetchProfileByUserId(session.user.id)
        if (profile && ADMIN_ROLES.includes(profile.role)) {
          setAdminProfile(profile)
          setMode('admin')
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
  }, [entryParams.memberId, entryParams.accessCode])

  const handleAdminLogout = async () => {
    await supabase.auth.signOut()
    setAdminProfile(null)
    setMode(entryParams.memberId ? 'member-access' : 'home')
  }

  const handleMemberLogout = () => {
    localStorage.removeItem(MEMBER_STORAGE_KEY)
    setMemberSession(null)
    setMode(entryParams.memberId ? 'member-access' : 'home')
  }

  if (loading) {
    return (
      <div className="app-shell center-screen">
        <div className="loading-card">로딩 중...</div>
      </div>
    )
  }

  if (mode === 'admin' && adminProfile) {
    return (
      <div className="app-shell">
        <AdminDashboard
  profile={adminProfile}
  currentAdminId={adminProfile?.id || null}
  currentGymId={adminProfile?.gym_id || null}
  onLogout={handleAdminLogout}
/>
      </div>
    )
  }

  if (mode === 'member' && memberSession) {
    return (
      <div className="app-shell">
        <MemberDashboard
  member={memberSession.member}
  accessCode={memberSession.accessCode}
  currentAdminId={memberSession.member?.admin_id || null}
  currentGymId={memberSession.member?.gym_id || null}
  onLogout={handleMemberLogout}
/>
      </div>
    )
  }

  if (mode === 'admin-login') {
    return (
      <div className="app-shell center-screen">
        <AdminLogin
          onLogin={(profile) => {
            setAdminProfile(profile)
            setMode('admin')
          }}
          onBack={() => setMode('home')}
        />
      </div>
    )
  }

  if (mode === 'member-access') {
    return (
      <div className="app-shell center-screen">
        <MemberAccess
          initialMemberId={entryParams.memberId}
          initialAccessCode={entryParams.accessCode}
          onSuccess={(sessionData) => {
            setMemberSession(sessionData)
            setMode('member')
          }}
          onBack={() => setMode('home')}
        />
      </div>
    )
  }

  return (
    <div className="app-shell center-screen">
      <div className="choice-grid">
        <div className="auth-card auth-card-large">
          <BrandHeader large />
          <h1>시작하기</h1>
          <p className="sub-text">관리자 또는 회원으로 입장할 수 있습니다.</p>

          <div className="stack-gap">
            <button className="primary-btn" onClick={() => setMode('admin-login')}>
              관리자 입장
            </button>
            <button className="secondary-btn" onClick={() => setMode('member-access')}>
              회원 입장
            </button>
          </div>
        </div>

        <div className="info-card">
          <h2>입장 방식</h2>
          <ul className="info-list">
            <li>관리자: 이메일 / 비밀번호 로그인</li>
            <li>회원: URL의 member 값 + access code</li>
            <li>회원 세션 / 관리자 세션 자동 복원</li>
            <li>향후 super_admin / gym_id 확장 대응 구조</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
