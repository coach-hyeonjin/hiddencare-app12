import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'

const TABS = ['회원', '기록작성', '운동DB', '식단', '통계', '사용방법']

const emptyMemberForm = {
  name: '',
  goal: '',
  total_sessions: 20,
  used_sessions: 0,
  start_date: '',
  end_date: '',
  memo: '',
  access_code: '',
}

const emptyRecordItem = {
  exercise_id: '',
  exercise_name_snapshot: '',
  sets: [{ kg: '', reps: '' }],
}

const emptyWorkoutForm = {
  id: null,
  member_id: '',
  workout_date: new Date().toISOString().slice(0, 10),
  workout_type: 'pt',
  good: '',
  improve: '',
  items: [{ ...emptyRecordItem }],
}

const emptyBrandForm = { name: '' }
const emptyExerciseForm = {
  name: '',
  body_part: '',
  category: '',
  brand_id: '',
}

function randomCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

function totalSetCount(items = []) {
  return items.reduce((sum, item) => sum + (item.sets?.length || 0), 0)
}

function formatDate(date) {
  if (!date) return '-'
  return date
}

export default function AdminDashboard({ profile, onLogout }) {
  const [activeTab, setActiveTab] = useState('회원')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [members, setMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [memberForm, setMemberForm] = useState(emptyMemberForm)
  const [editingMemberId, setEditingMemberId] = useState(null)

  const [workouts, setWorkouts] = useState([])
  const [workoutItemsMap, setWorkoutItemsMap] = useState({})
  const [collapsedWorkouts, setCollapsedWorkouts] = useState({})
  const [workoutForm, setWorkoutForm] = useState(emptyWorkoutForm)

  const [brands, setBrands] = useState([])
  const [brandForm, setBrandForm] = useState(emptyBrandForm)
  const [editingBrandId, setEditingBrandId] = useState(null)

  const [exercises, setExercises] = useState([])
  const [exerciseForm, setExerciseForm] = useState(emptyExerciseForm)
  const [editingExerciseId, setEditingExerciseId] = useState(null)
  const [exerciseSearch, setExerciseSearch] = useState('')

  const [dietLogs, setDietLogs] = useState([])
  const [collapsedDiets, setCollapsedDiets] = useState({})
  const [dietMemberFilter, setDietMemberFilter] = useState('')

  const [routineForm, setRoutineForm] = useState({ title: '루틴', content: '' })
  const [manualTarget, setManualTarget] = useState('member')
  const [manualForm, setManualForm] = useState({ title: '', content: '' })
  const [manuals, setManuals] = useState([])

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId) || null,
    [members, selectedMemberId],
  )

  const filteredExercises = useMemo(() => {
    const keyword = exerciseSearch.trim().toLowerCase()
    if (!keyword) return exercises

    return exercises.filter((ex) => {
      const brandName = ex.brands?.name || ''
      return (
        ex.name.toLowerCase().includes(keyword) ||
        (ex.body_part || '').toLowerCase().includes(keyword) ||
        (ex.category || '').toLowerCase().includes(keyword) ||
        brandName.toLowerCase().includes(keyword)
      )
    })
  }, [exerciseSearch, exercises])

  const monthlyStats = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7)
    const monthWorkouts = workouts.filter((w) => (w.workout_date || '').startsWith(month))
    const ptCount = monthWorkouts.filter((w) => w.workout_type === 'pt').length
    const personalCount = monthWorkouts.filter((w) => w.workout_type === 'personal').length
    const remainingSessions = members.reduce(
      (sum, m) => sum + Math.max((m.total_sessions || 0) - (m.used_sessions || 0), 0),
      0,
    )

    return { ptCount, personalCount, remainingSessions }
  }, [workouts, members])

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    const found = manuals.find((m) => m.target_role === manualTarget)
    if (found) {
      setManualForm({ title: found.title || '', content: found.content || '' })
    }
  }, [manualTarget, manuals])

  useEffect(() => {
    if (!selectedMemberId) {
      setRoutineForm({ title: '루틴', content: '' })
      return
    }
    loadRoutine(selectedMemberId)
  }, [selectedMemberId])

  const loadAll = async () => {
    setLoading(true)
    setMessage('')

    await Promise.all([
      loadMembers(),
      loadBrands(),
      loadExercises(),
      loadWorkouts(),
      loadDietLogs(),
      loadManuals(),
    ])

    setLoading(false)
  }

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMembers(data)
      if (!selectedMemberId && data[0]) setSelectedMemberId(data[0].id)
    }
  }

  const loadBrands = async () => {
    const { data } = await supabase.from('brands').select('*').order('name', { ascending: true })
    if (data) setBrands(data)
  }

  const loadExercises = async () => {
    const { data } = await supabase
      .from('exercises')
      .select('*, brands(id, name)')
      .order('created_at', { ascending: false })

    if (data) setExercises(data)
  }

  const loadWorkouts = async () => {
    const { data: workoutData } = await supabase
      .from('workouts')
      .select('*')
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (!workoutData) return

    const workoutIds = workoutData.map((w) => w.id)
    let itemMap = {}

    if (workoutIds.length > 0) {
      const { data: itemData } = await supabase
        .from('workout_items')
        .select('*')
        .in('workout_id', workoutIds)
        .order('sort_order', { ascending: true })

      itemMap = (itemData || []).reduce((acc, item) => {
        if (!acc[item.workout_id]) acc[item.workout_id] = []
        acc[item.workout_id].push(item)
        return acc
      }, {})
    }

    setWorkouts(workoutData)
    setWorkoutItemsMap(itemMap)
    const defaultCollapse = {}
    workoutData.forEach((w) => {
      defaultCollapse[w.id] = true
    })
    setCollapsedWorkouts(defaultCollapse)
  }

  const loadDietLogs = async () => {
    const { data } = await supabase
      .from('diet_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      setDietLogs(data)
      const defaultCollapse = {}
      data.forEach((d) => {
        defaultCollapse[d.id] = true
      })
      setCollapsedDiets(defaultCollapse)
    }
  }

  const loadRoutine = async (memberId) => {
    const { data } = await supabase
      .from('member_routines')
      .select('*')
      .eq('member_id', memberId)
      .maybeSingle()

    if (data) {
      setRoutineForm({
        title: data.title || '루틴',
        content: data.content || '',
      })
    } else {
      setRoutineForm({ title: '루틴', content: '' })
    }
  }

  const loadManuals = async () => {
    const { data } = await supabase.from('app_manuals').select('*').order('target_role')
    if (data) setManuals(data)
  }

  const recalcMemberUsage = async (memberId) => {
    const { data: ptData } = await supabase
      .from('workouts')
      .select('id', { count: 'exact' })
      .eq('member_id', memberId)
      .eq('workout_type', 'pt')

    const count = ptData?.length || 0
    await supabase
      .from('members')
      .update({ used_sessions: count })
      .eq('id', memberId)

    await loadMembers()
  }

  const handleMemberSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const payload = {
      ...memberForm,
      total_sessions: Number(memberForm.total_sessions) || 0,
      used_sessions: Number(memberForm.used_sessions) || 0,
      access_code: memberForm.access_code || randomCode(),
    }

    if (editingMemberId) {
      const { error } = await supabase.from('members').update(payload).eq('id', editingMemberId)
      if (error) {
        setMessage(error.message)
        return
      }
      setMessage('회원 정보가 수정되었습니다.')
    } else {
      const { error } = await supabase.from('members').insert(payload)
      if (error) {
        setMessage(error.message)
        return
      }
      setMessage('회원이 추가되었습니다.')
    }

    setMemberForm(emptyMemberForm)
    setEditingMemberId(null)
    await loadMembers()
  }

  const handleMemberEdit = (member) => {
    setEditingMemberId(member.id)
    setSelectedMemberId(member.id)
    setMemberForm({
      name: member.name || '',
      goal: member.goal || '',
      total_sessions: member.total_sessions || 0,
      used_sessions: member.used_sessions || 0,
      start_date: member.start_date || '',
      end_date: member.end_date || '',
      memo: member.memo || '',
      access_code: member.access_code || '',
    })
  }

  const handleMemberDelete = async (memberId) => {
    if (!window.confirm('회원 데이터를 삭제할까요?')) return
    await supabase.from('members').delete().eq('id', memberId)
    await loadAll()
    setSelectedMemberId('')
  }

  const copyAccessCode = async (member) => {
    const text = `${window.location.origin}?member=${member.id}\nAccess Code: ${member.access_code}`
    try {
      await navigator.clipboard.writeText(text)
      setMessage('회원 링크와 access code가 복사되었습니다.')
    } catch {
      setMessage('복사에 실패했습니다.')
    }
  }

  const handleRoutineSave = async () => {
    if (!selectedMemberId) {
      setMessage('루틴을 저장할 회원을 먼저 선택해주세요.')
      return
    }

    const payload = {
      member_id: selectedMemberId,
      title: routineForm.title || '루틴',
      content: routineForm.content || '',
    }

    const { data: existing } = await supabase
      .from('member_routines')
      .select('id')
      .eq('member_id', selectedMemberId)
      .maybeSingle()

    if (existing?.id) {
      await supabase.from('member_routines').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('member_routines').insert(payload)
    }

    setMessage('루틴이 저장되었습니다.')
    await loadRoutine(selectedMemberId)
  }

  const updateWorkoutItemExercise = (index, exerciseId) => {
    const found = exercises.find((ex) => String(ex.id) === String(exerciseId))
    setWorkoutForm((prev) => {
      const nextItems = [...prev.items]
      nextItems[index] = {
        ...nextItems[index],
        exercise_id: found?.id || '',
        exercise_name_snapshot: found?.name || '',
      }
      return { ...prev, items: nextItems }
    })
  }

  const addWorkoutItem = () => {
    setWorkoutForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyRecordItem }],
    }))
  }

  const removeWorkoutItem = (index) => {
    setWorkoutForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const addSetRow = (itemIndex) => {
    setWorkoutForm((prev) => {
      const nextItems = [...prev.items]
      nextItems[itemIndex] = {
        ...nextItems[itemIndex],
        sets: [...nextItems[itemIndex].sets, { kg: '', reps: '' }],
      }
      return { ...prev, items: nextItems }
    })
  }

  const removeSetRow = (itemIndex, setIndex) => {
    setWorkoutForm((prev) => {
      const nextItems = [...prev.items]
      nextItems[itemIndex] = {
        ...nextItems[itemIndex],
        sets: nextItems[itemIndex].sets.filter((_, i) => i !== setIndex),
      }
      return { ...prev, items: nextItems }
    })
  }

  const updateSetValue = (itemIndex, setIndex, field, value) => {
    setWorkoutForm((prev) => {
      const nextItems = [...prev.items]
      const nextSets = [...nextItems[itemIndex].sets]
      nextSets[setIndex] = { ...nextSets[setIndex], [field]: value }
      nextItems[itemIndex] = { ...nextItems[itemIndex], sets: nextSets }
      return { ...prev, items: nextItems }
    })
  }

  const resetWorkoutForm = () => {
    setWorkoutForm(emptyWorkoutForm)
  }

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault()

    if (!workoutForm.member_id) {
      setMessage('회원을 선택해주세요.')
      return
    }

    const cleanedItems = workoutForm.items
      .filter((item) => item.exercise_name_snapshot)
      .map((item, index) => ({
        exercise_id: item.exercise_id || null,
        exercise_name_snapshot: item.exercise_name_snapshot,
        sort_order: index,
        sets: item.sets.filter((set) => set.kg !== '' || set.reps !== ''),
      }))

    if (cleanedItems.length === 0) {
      setMessage('최소 1개의 운동을 입력해주세요.')
      return
    }

    const payload = {
      member_id: workoutForm.member_id,
      workout_date: workoutForm.workout_date,
      workout_type: workoutForm.workout_type,
      good: workoutForm.good,
      improve: workoutForm.improve,
      created_by: profile.id,
    }

    let workoutId = workoutForm.id

    if (workoutForm.id) {
      const { error } = await supabase.from('workouts').update(payload).eq('id', workoutForm.id)
      if (error) {
        setMessage(error.message)
        return
      }

      await supabase.from('workout_items').delete().eq('workout_id', workoutForm.id)
    } else {
      const { data, error } = await supabase.from('workouts').insert(payload).select().single()
      if (error || !data) {
        setMessage(error?.message || '기록 저장 실패')
        return
      }
      workoutId = data.id
    }

    const insertItems = cleanedItems.map((item) => ({
      ...item,
      workout_id: workoutId,
    }))

    const { error: itemError } = await supabase.from('workout_items').insert(insertItems)
    if (itemError) {
      setMessage(itemError.message)
      return
    }

    if (workoutForm.workout_type === 'pt') {
      await recalcMemberUsage(workoutForm.member_id)
    }

    setMessage(workoutForm.id ? 'PT 기록이 수정되었습니다.' : 'PT 기록이 저장되었습니다.')
    resetWorkoutForm()
    await loadWorkouts()
  }

  const handleWorkoutEdit = (workout) => {
    const items = workoutItemsMap[workout.id] || []
    setWorkoutForm({
      id: workout.id,
      member_id: workout.member_id,
      workout_date: workout.workout_date,
      workout_type: workout.workout_type,
      good: workout.good || '',
      improve: workout.improve || '',
      items: items.length
        ? items.map((item) => ({
            exercise_id: item.exercise_id || '',
            exercise_name_snapshot: item.exercise_name_snapshot || '',
            sets: Array.isArray(item.sets) && item.sets.length ? item.sets : [{ kg: '', reps: '' }],
          }))
        : [{ ...emptyRecordItem }],
    })
    setActiveTab('기록작성')
  }

  const handleWorkoutDelete = async (workout) => {
    if (!window.confirm('기록을 삭제할까요?')) return
    await supabase.from('workouts').delete().eq('id', workout.id)
    if (workout.workout_type === 'pt') {
      await recalcMemberUsage(workout.member_id)
    }
    await loadWorkouts()
    setMessage('기록이 삭제되었습니다.')
  }

  const handleBrandSubmit = async (e) => {
    e.preventDefault()
    if (!brandForm.name.trim()) return

    if (editingBrandId) {
      await supabase.from('brands').update({ name: brandForm.name.trim() }).eq('id', editingBrandId)
      setMessage('브랜드가 수정되었습니다.')
    } else {
      await supabase.from('brands').insert({ name: brandForm.name.trim() })
      setMessage('브랜드가 추가되었습니다.')
    }

    setBrandForm(emptyBrandForm)
    setEditingBrandId(null)
    await loadBrands()
  }

  const handleBrandDelete = async (brandId) => {
    if (!window.confirm('브랜드를 삭제할까요?')) return
    await supabase.from('brands').delete().eq('id', brandId)
    await loadBrands()
    await loadExercises()
  }

  const handleExerciseSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: exerciseForm.name.trim(),
      body_part: exerciseForm.body_part.trim(),
      category: exerciseForm.category.trim(),
      brand_id: exerciseForm.brand_id || null,
    }

    if (!payload.name) return

    if (editingExerciseId) {
      await supabase.from('exercises').update(payload).eq('id', editingExerciseId)
      setMessage('운동이 수정되었습니다.')
    } else {
      await supabase.from('exercises').insert(payload)
      setMessage('운동이 추가되었습니다.')
    }

    setExerciseForm(emptyExerciseForm)
    setEditingExerciseId(null)
    await loadExercises()
  }

  const handleExerciseDelete = async (exerciseId) => {
    if (!window.confirm('운동을 삭제할까요?')) return
    await supabase.from('exercises').delete().eq('id', exerciseId)
    await loadExercises()
  }

  const handleDietFeedbackSave = async (dietId, feedback) => {
    await supabase
      .from('diet_logs')
      .update({ coach_feedback: feedback })
      .eq('id', dietId)

    await loadDietLogs()
    setMessage('식단 피드백이 저장되었습니다.')
  }

  const handleDietDelete = async (dietId) => {
    if (!window.confirm('식단 기록을 삭제할까요?')) return
    await supabase.from('diet_logs').delete().eq('id', dietId)
    await loadDietLogs()
  }

  const handleManualSave = async () => {
    const existing = manuals.find((m) => m.target_role === manualTarget)
    if (existing?.id) {
      await supabase
        .from('app_manuals')
        .update({
          title: manualForm.title,
          content: manualForm.content,
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('app_manuals').insert({
        target_role: manualTarget,
        title: manualForm.title,
        content: manualForm.content,
      })
    }

    await loadManuals()
    setMessage('사용방법이 저장되었습니다.')
  }

  const displayedDietLogs = dietMemberFilter
    ? dietLogs.filter((d) => d.member_id === dietMemberFilter)
    : dietLogs

  if (loading) {
    return <div className="loading-card">데이터 불러오는 중...</div>
  }

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <div className="brand-mark">숨바꼭질케어</div>
          <h1 className="page-title">관리자 대시보드</h1>
          <p className="sub-text">{profile?.name || '관리자'}님으로 로그인됨</p>
        </div>
        <button className="secondary-btn" onClick={onLogout}>
          로그아웃
        </button>
      </header>

      <nav className="tab-row">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {message ? <div className="message success">{message}</div> : null}

      {activeTab === '회원' && (
        <div className="two-col">
          <section className="card">
            <h2>회원 등록 / 수정</h2>
            <form className="stack-gap" onSubmit={handleMemberSubmit}>
              <label className="field">
                <span>이름</span>
                <input
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                />
              </label>

              <label className="field">
                <span>목표</span>
                <input
                  value={memberForm.goal}
                  onChange={(e) => setMemberForm({ ...memberForm, goal: e.target.value })}
                />
              </label>

              <div className="grid-2">
                <label className="field">
                  <span>총 세션</span>
                  <input
                    type="number"
                    value={memberForm.total_sessions}
                    onChange={(e) => setMemberForm({ ...memberForm, total_sessions: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>사용 세션</span>
                  <input
                    type="number"
                    value={memberForm.used_sessions}
                    onChange={(e) => setMemberForm({ ...memberForm, used_sessions: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="field">
                  <span>시작일</span>
                  <input
                    type="date"
                    value={memberForm.start_date}
                    onChange={(e) => setMemberForm({ ...memberForm, start_date: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>종료일</span>
                  <input
                    type="date"
                    value={memberForm.end_date}
                    onChange={(e) => setMemberForm({ ...memberForm, end_date: e.target.value })}
                  />
                </label>
              </div>

              <label className="field">
                <span>메모</span>
                <textarea
                  rows="4"
                  value={memberForm.memo}
                  onChange={(e) => setMemberForm({ ...memberForm, memo: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Access Code</span>
                <div className="inline-actions">
                  <input
                    value={memberForm.access_code}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, access_code: e.target.value.toUpperCase() })
                    }
                  />
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() =>
                      setMemberForm((prev) => ({ ...prev, access_code: randomCode() }))
                    }
                  >
                    생성
                  </button>
                </div>
              </label>

              <div className="inline-actions">
                <button className="primary-btn" type="submit">
                  {editingMemberId ? '회원 수정' : '회원 추가'}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setEditingMemberId(null)
                    setMemberForm(emptyMemberForm)
                  }}
                >
                  초기화
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <h2>회원 목록</h2>
            <div className="list-stack">
              {members.map((member) => {
                const selected = selectedMemberId === member.id
                return (
                  <div
                    key={member.id}
                    className={`list-card ${selected ? 'selected' : ''}`}
                    onClick={() => setSelectedMemberId(member.id)}
                  >
                    <div className="list-card-top">
                      <strong>{member.name}</strong>
                      <span className="pill">
                        남은 {Math.max((member.total_sessions || 0) - (member.used_sessions || 0), 0)}회
                      </span>
                    </div>
                    <div className="compact-text">
                      목표: {member.goal || '-'} / Access: {member.access_code}
                    </div>
                    <div className="inline-actions wrap">
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMemberEdit(member)
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyAccessCode(member)
                        }}
                      >
                        링크 복사
                      </button>
                      <button
                        className="danger-btn"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMemberDelete(member.id)
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedMember ? (
              <div className="sub-card">
                <h3>선택 회원 상세 / 루틴 관리</h3>
                <div className="detail-box">
                  <p><strong>이름:</strong> {selectedMember.name}</p>
                  <p><strong>목표:</strong> {selectedMember.goal || '-'}</p>
                  <p><strong>기간:</strong> {formatDate(selectedMember.start_date)} ~ {formatDate(selectedMember.end_date)}</p>
                  <p><strong>메모:</strong> {selectedMember.memo || '-'}</p>
                  <p><strong>회원 링크:</strong> {window.location.origin}?member={selectedMember.id}</p>
                </div>

                <div className="stack-gap">
                  <label className="field">
                    <span>루틴 제목</span>
                    <input
                      value={routineForm.title}
                      onChange={(e) => setRoutineForm({ ...routineForm, title: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>루틴 내용</span>
                    <textarea
                      rows="6"
                      value={routineForm.content}
                      onChange={(e) => setRoutineForm({ ...routineForm, content: e.target.value })}
                    />
                  </label>
                  <button className="primary-btn" onClick={handleRoutineSave}>
                    루틴 저장
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}

      {activeTab === '기록작성' && (
        <div className="two-col">
          <section className="card">
            <h2>PT 기록 작성 / 수정</h2>
            <form className="stack-gap" onSubmit={handleWorkoutSubmit}>
              <div className="grid-2">
                <label className="field">
                  <span>회원 선택</span>
                  <select
                    value={workoutForm.member_id}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, member_id: e.target.value })}
                  >
                    <option value="">회원 선택</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>날짜</span>
                  <input
                    type="date"
                    value={workoutForm.workout_date}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, workout_date: e.target.value })}
                  />
                </label>
              </div>

              <label className="field">
                <span>기록 타입</span>
                <select
                  value={workoutForm.workout_type}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, workout_type: e.target.value })}
                >
                  <option value="pt">PT</option>
                  <option value="personal">개인운동</option>
                </select>
              </label>

              <div className="stack-gap">
                {workoutForm.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="sub-card">
                    <div className="list-card-top">
                      <strong>운동 {itemIndex + 1}</strong>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => removeWorkoutItem(itemIndex)}
                        disabled={workoutForm.items.length === 1}
                      >
                        운동 삭제
                      </button>
                    </div>

                    <label className="field">
                      <span>운동 선택</span>
                      <select
                        value={item.exercise_id}
                        onChange={(e) => updateWorkoutItemExercise(itemIndex, e.target.value)}
                      >
                        <option value="">운동 선택</option>
                        {exercises.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            [{exercise.brands?.name || '브랜드없음'}] {exercise.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="stack-gap">
                      {item.sets.map((setRow, setIndex) => (
                        <div className="set-row" key={setIndex}>
                          <input
                            placeholder="kg"
                            value={setRow.kg}
                            onChange={(e) => updateSetValue(itemIndex, setIndex, 'kg', e.target.value)}
                          />
                          <input
                            placeholder="reps"
                            value={setRow.reps}
                            onChange={(e) => updateSetValue(itemIndex, setIndex, 'reps', e.target.value)}
                          />
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => removeSetRow(itemIndex, setIndex)}
                            disabled={item.sets.length === 1}
                          >
                            세트 삭제
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => addSetRow(itemIndex)}
                    >
                      세트 추가
                    </button>
                  </div>
                ))}

                <button type="button" className="secondary-btn" onClick={addWorkoutItem}>
                  운동 추가
                </button>
              </div>

              <label className="field">
                <span>잘한점</span>
                <textarea
                  rows="3"
                  value={workoutForm.good}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, good: e.target.value })}
                />
              </label>

              <label className="field">
                <span>보완점</span>
                <textarea
                  rows="3"
                  value={workoutForm.improve}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, improve: e.target.value })}
                />
              </label>

              <div className="inline-actions">
                <button className="primary-btn" type="submit">
                  {workoutForm.id ? '기록 수정' : '기록 저장'}
                </button>
                <button type="button" className="secondary-btn" onClick={resetWorkoutForm}>
                  작성 취소
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <h2>기록 목록</h2>
            <div className="list-stack">
              {workouts.map((workout) => {
                const member = members.find((m) => m.id === workout.member_id)
                const items = workoutItemsMap[workout.id] || []
                const collapsed = collapsedWorkouts[workout.id] ?? true

                return (
                  <div key={workout.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{member?.name || '회원없음'} / {workout.workout_type === 'pt' ? 'PT' : '개인운동'}</strong>
                      <span className="pill">{workout.workout_date}</span>
                    </div>

                    <div className="compact-text">
                      간추려보기: 날짜 {workout.workout_date} / 운동 {items.length}개 / 총세트 {totalSetCount(items)}세트
                    </div>

                    <div className="inline-actions wrap">
                      <button
                        className="secondary-btn"
                        onClick={() =>
                          setCollapsedWorkouts((prev) => ({ ...prev, [workout.id]: !collapsed }))
                        }
                      >
                        {collapsed ? '상세히보기' : '간추려보기'}
                      </button>
                      <button className="secondary-btn" onClick={() => handleWorkoutEdit(workout)}>
                        수정
                      </button>
                      <button className="danger-btn" onClick={() => handleWorkoutDelete(workout)}>
                        삭제
                      </button>
                    </div>

                    {!collapsed ? (
                      <div className="detail-box">
                        {items.map((item) => (
                          <div key={item.id} className="record-item-box">
                            <strong>{item.exercise_name_snapshot}</strong>
                            <ul className="set-list">
                              {(item.sets || []).map((setRow, index) => (
                                <li key={index}>
                                  {index + 1}세트 - {setRow.kg || '-'}kg / {setRow.reps || '-'}회
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <p><strong>잘한점:</strong> {workout.good || '-'}</p>
                        <p><strong>보완점:</strong> {workout.improve || '-'}</p>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {activeTab === '운동DB' && (
        <div className="two-col">
          <section className="card">
            <h2>브랜드 관리</h2>
            <form className="stack-gap" onSubmit={handleBrandSubmit}>
              <label className="field">
                <span>브랜드명</span>
                <input
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ name: e.target.value })}
                />
              </label>

              <div className="inline-actions">
                <button className="primary-btn" type="submit">
                  {editingBrandId ? '브랜드 수정' : '브랜드 추가'}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setBrandForm(emptyBrandForm)
                    setEditingBrandId(null)
                  }}
                >
                  초기화
                </button>
              </div>
            </form>

            <div className="list-stack">
              {brands.map((brand) => (
                <div key={brand.id} className="list-card">
                  <div className="list-card-top">
                    <strong>{brand.name}</strong>
                  </div>
                  <div className="inline-actions wrap">
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        setEditingBrandId(brand.id)
                        setBrandForm({ name: brand.name })
                      }}
                    >
                      수정
                    </button>
                    <button className="danger-btn" onClick={() => handleBrandDelete(brand.id)}>
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>운동 관리</h2>
            <form className="stack-gap" onSubmit={handleExerciseSubmit}>
              <label className="field">
                <span>운동명</span>
                <input
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                />
              </label>

              <div className="grid-3">
                <label className="field">
                  <span>부위</span>
                  <input
                    value={exerciseForm.body_part}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, body_part: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>카테고리</span>
                  <input
                    value={exerciseForm.category}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, category: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>브랜드</span>
                  <select
                    value={exerciseForm.brand_id}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, brand_id: e.target.value })}
                  >
                    <option value="">선택 안함</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="inline-actions">
                <button className="primary-btn" type="submit">
                  {editingExerciseId ? '운동 수정' : '운동 추가'}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setEditingExerciseId(null)
                    setExerciseForm(emptyExerciseForm)
                  }}
                >
                  초기화
                </button>
              </div>
            </form>

            <label className="field">
              <span>검색</span>
              <input
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="운동명 / 부위 / 브랜드 검색"
              />
            </label>

            <div className="list-stack">
              {filteredExercises.map((exercise) => (
                <div key={exercise.id} className="list-card">
                  <div className="list-card-top">
                    <strong>{exercise.name}</strong>
                    <span className="pill">{exercise.brands?.name || '브랜드없음'}</span>
                  </div>
                  <div className="compact-text">
                    {exercise.body_part || '-'} / {exercise.category || '-'}
                  </div>
                  <div className="inline-actions wrap">
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        setEditingExerciseId(exercise.id)
                        setExerciseForm({
                          name: exercise.name || '',
                          body_part: exercise.body_part || '',
                          category: exercise.category || '',
                          brand_id: exercise.brand_id || '',
                        })
                      }}
                    >
                      수정
                    </button>
                    <button className="danger-btn" onClick={() => handleExerciseDelete(exercise.id)}>
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === '식단' && (
        <div className="card">
          <div className="section-head">
            <h2>식단 기록 확인</h2>
            <select value={dietMemberFilter} onChange={(e) => setDietMemberFilter(e.target.value)}>
              <option value="">전체 회원</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="list-stack">
            {displayedDietLogs.map((diet) => {
              const member = members.find((m) => m.id === diet.member_id)
              const collapsed = collapsedDiets[diet.id] ?? true

              return (
                <DietAdminCard
                  key={diet.id}
                  diet={diet}
                  memberName={member?.name || '회원없음'}
                  collapsed={collapsed}
                  onToggle={() =>
                    setCollapsedDiets((prev) => ({ ...prev, [diet.id]: !collapsed }))
                  }
                  onSave={handleDietFeedbackSave}
                  onDelete={handleDietDelete}
                />
              )
            })}
          </div>
        </div>
      )}

      {activeTab === '통계' && (
        <div className="stats-grid">
          <div className="stat-card">
            <span>이번달 PT 수</span>
            <strong>{monthlyStats.ptCount}</strong>
          </div>
          <div className="stat-card">
            <span>이번달 개인운동 수</span>
            <strong>{monthlyStats.personalCount}</strong>
          </div>
          <div className="stat-card">
            <span>전체 남은 세션</span>
            <strong>{monthlyStats.remainingSessions}</strong>
          </div>
        </div>
      )}

      {activeTab === '사용방법' && (
        <div className="card">
          <div className="section-head">
            <h2>사용방법 관리</h2>
            <select value={manualTarget} onChange={(e) => setManualTarget(e.target.value)}>
              <option value="member">회원용</option>
              <option value="admin">관리자용</option>
            </select>
          </div>

          <div className="stack-gap">
            <label className="field">
              <span>제목</span>
              <input
                value={manualForm.title}
                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
              />
            </label>
            <label className="field">
              <span>내용</span>
              <textarea
                rows="10"
                value={manualForm.content}
                onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
              />
            </label>
            <button className="primary-btn" onClick={handleManualSave}>
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DietAdminCard({ diet, memberName, collapsed, onToggle, onSave, onDelete }) {
  const [feedback, setFeedback] = useState(diet.coach_feedback || '')

  useEffect(() => {
    setFeedback(diet.coach_feedback || '')
  }, [diet.coach_feedback])

  return (
    <div className="list-card">
      <div className="list-card-top">
        <strong>{memberName}</strong>
        <span className="pill">{diet.log_date}</span>
      </div>
      <div className="compact-text">
        간추려보기: {diet.meal_type} / {diet.content.slice(0, 30)}{diet.content.length > 30 ? '...' : ''}
      </div>

      <div className="inline-actions wrap">
        <button className="secondary-btn" onClick={onToggle}>
          {collapsed ? '상세히보기' : '간추려보기'}
        </button>
        <button className="danger-btn" onClick={() => onDelete(diet.id)}>
          삭제
        </button>
      </div>

      {!collapsed ? (
        <div className="detail-box stack-gap">
          <p><strong>식단 종류:</strong> {diet.meal_type}</p>
          <p><strong>내용:</strong> {diet.content}</p>
          <label className="field">
            <span>관리자 피드백</span>
            <textarea
              rows="4"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </label>
          <button className="primary-btn" onClick={() => onSave(diet.id, feedback)}>
            피드백 저장
          </button>
        </div>
      ) : null}
    </div>
  )
}
