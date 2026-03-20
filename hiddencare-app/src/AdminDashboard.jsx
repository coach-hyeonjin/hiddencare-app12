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

const emptyWorkoutItem = {
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
  items: [{ ...emptyWorkoutItem }],
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

function formatDate(value) {
  return value || '-'
}

function getTotalSetCount(items = []) {
  return items.reduce((sum, item) => sum + (item.sets?.length || 0), 0)
}

function normalizeSets(sets = []) {
  return sets
    .filter((setRow) => setRow.kg !== '' || setRow.reps !== '')
    .map((setRow) => ({
      kg: String(setRow.kg ?? ''),
      reps: String(setRow.reps ?? ''),
    }))
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
    () => members.find((member) => member.id === selectedMemberId) || null,
    [members, selectedMemberId],
  )

  const filteredExercises = useMemo(() => {
    const keyword = exerciseSearch.trim().toLowerCase()
    if (!keyword) return exercises

    return exercises.filter((exercise) => {
      const brandName = exercise.brands?.name || ''
      return (
        exercise.name.toLowerCase().includes(keyword) ||
        (exercise.body_part || '').toLowerCase().includes(keyword) ||
        (exercise.category || '').toLowerCase().includes(keyword) ||
        brandName.toLowerCase().includes(keyword)
      )
    })
  }, [exerciseSearch, exercises])

  const memberStats = useMemo(() => {
    return members.map((member) => {
      const memberWorkouts = workouts.filter((workout) => workout.member_id === member.id)
      const ptCount = memberWorkouts.filter((workout) => workout.workout_type === 'pt').length
      const personalCount = memberWorkouts.filter(
        (workout) => workout.workout_type === 'personal',
      ).length
      const remainingSessions = Math.max(
        Number(member.total_sessions || 0) - Number(member.used_sessions || 0),
        0,
      )

      return {
        ...member,
        ptCount,
        personalCount,
        remainingSessions,
      }
    })
  }, [members, workouts])

  const monthlyStats = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7)
    const monthWorkouts = workouts.filter((workout) =>
      (workout.workout_date || '').startsWith(monthKey),
    )

    return {
      ptCount: monthWorkouts.filter((workout) => workout.workout_type === 'pt').length,
      personalCount: monthWorkouts.filter((workout) => workout.workout_type === 'personal').length,
      remainingSessions: members.reduce(
        (sum, member) =>
          sum +
          Math.max(
            Number(member.total_sessions || 0) - Number(member.used_sessions || 0),
            0,
          ),
        0,
      ),
    }
  }, [workouts, members])

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    const found = manuals.find((manual) => manual.target_role === manualTarget)
    if (found) {
      setManualForm({
        title: found.title || '',
        content: found.content || '',
      })
    } else {
      setManualForm({ title: '', content: '' })
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
    const { data } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
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

    let itemMap = {}
    const workoutIds = workoutData.map((workout) => workout.id)

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

    const collapsed = {}
    workoutData.forEach((workout) => {
      collapsed[workout.id] = true
    })

    setWorkouts(workoutData)
    setWorkoutItemsMap(itemMap)
    setCollapsedWorkouts(collapsed)
  }

  const loadDietLogs = async () => {
    const { data } = await supabase
      .from('diet_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      const collapsed = {}
      data.forEach((diet) => {
        collapsed[diet.id] = true
      })
      setDietLogs(data)
      setCollapsedDiets(collapsed)
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

  const recalcMemberUsedSessions = async (memberId) => {
    const ptCount = workouts.filter(
      (workout) => workout.member_id === memberId && workout.workout_type === 'pt',
    ).length

    const freshPtCount = ptCount
    await supabase.from('members').update({ used_sessions: freshPtCount }).eq('id', memberId)
    await loadMembers()
  }

  const resetMemberForm = () => {
    setMemberForm(emptyMemberForm)
    setEditingMemberId(null)
  }

  const handleMemberSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const payload = {
      name: memberForm.name?.trim() || '',
      goal: memberForm.goal?.trim() || '',
      total_sessions: Number(memberForm.total_sessions) || 0,
      used_sessions: Number(memberForm.used_sessions) || 0,
      start_date: memberForm.start_date ? memberForm.start_date : null,
      end_date: memberForm.end_date ? memberForm.end_date : null,
      memo: memberForm.memo?.trim() || '',
      access_code: (memberForm.access_code || randomCode()).trim().toUpperCase(),
    }

    if (!payload.name) {
      setMessage('회원 이름을 입력해주세요.')
      return
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

    resetMemberForm()
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
    if (!window.confirm('회원을 삭제할까요?')) return
    await supabase.from('members').delete().eq('id', memberId)
    if (selectedMemberId === memberId) {
      setSelectedMemberId('')
      resetMemberForm()
      setRoutineForm({ title: '루틴', content: '' })
    }
    await loadAll()
    setMessage('회원이 삭제되었습니다.')
  }

  const copyMemberLink = async (member) => {
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
      title: routineForm.title?.trim() || '루틴',
      content: routineForm.content?.trim() || '',
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

  const handleRoutineDelete = async () => {
    if (!selectedMemberId) {
      setMessage('삭제할 회원을 먼저 선택해주세요.')
      return
    }
    if (!window.confirm('이 회원의 루틴을 삭제할까요?')) return

    await supabase.from('member_routines').delete().eq('member_id', selectedMemberId)
    setRoutineForm({ title: '루틴', content: '' })
    setMessage('루틴이 삭제되었습니다.')
  }

  const resetWorkoutForm = () => {
    setWorkoutForm(emptyWorkoutForm)
  }

  const updateWorkoutItemSelect = (itemIndex, exerciseId) => {
    const found = exercises.find((exercise) => String(exercise.id) === String(exerciseId))
    setWorkoutForm((prev) => {
      const nextItems = [...prev.items]
      nextItems[itemIndex] = {
        ...nextItems[itemIndex],
        exercise_id: found?.id || '',
        exercise_name_snapshot: found?.name || nextItems[itemIndex].exercise_name_snapshot,
      }
      return { ...prev, items: nextItems }
    })
  }

  const updateWorkoutItemName = (itemIndex, value) => {
    setWorkoutForm((prev) => {
      const nextItems = [...prev.items]
      nextItems[itemIndex] = {
        ...nextItems[itemIndex],
        exercise_name_snapshot: value,
      }
      return { ...prev, items: nextItems }
    })
  }

  const addWorkoutItem = () => {
    setWorkoutForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyWorkoutItem }],
    }))
  }

  const removeWorkoutItem = (itemIndex) => {
    setWorkoutForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== itemIndex),
    }))
  }

  const addSet = (itemIndex) => {
    setWorkoutForm((prev) => {
      const nextItems = [...prev.items]
      nextItems[itemIndex] = {
        ...nextItems[itemIndex],
        sets: [...nextItems[itemIndex].sets, { kg: '', reps: '' }],
      }
      return { ...prev, items: nextItems }
    })
  }

  const removeSet = (itemIndex, setIndex) => {
    setWorkoutForm((prev) => {
      const nextItems = [...prev.items]
      nextItems[itemIndex] = {
        ...nextItems[itemIndex],
        sets: nextItems[itemIndex].sets.filter((_, idx) => idx !== setIndex),
      }
      return { ...prev, items: nextItems }
    })
  }

  const updateSetValue = (itemIndex, setIndex, field, value) => {
    setWorkoutForm((prev) => {
      const nextItems = [...prev.items]
      const nextSets = [...nextItems[itemIndex].sets]
      nextSets[setIndex] = {
        ...nextSets[setIndex],
        [field]: value,
      }
      nextItems[itemIndex] = {
        ...nextItems[itemIndex],
        sets: nextSets,
      }
      return { ...prev, items: nextItems }
    })
  }

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault()

    if (!workoutForm.member_id) {
      setMessage('회원을 선택해주세요.')
      return
    }

    const cleanedItems = workoutForm.items
      .filter((item) => item.exercise_name_snapshot?.trim())
      .map((item, index) => ({
        workout_id: workoutForm.id || null,
        exercise_id: item.exercise_id || null,
        exercise_name_snapshot: item.exercise_name_snapshot.trim(),
        sort_order: index,
        sets: normalizeSets(item.sets),
      }))

    if (cleanedItems.length === 0) {
      setMessage('최소 1개의 운동을 입력해주세요.')
      return
    }

    const payload = {
      member_id: workoutForm.member_id,
      workout_date: workoutForm.workout_date,
      workout_type: workoutForm.workout_type,
      good: workoutForm.good?.trim() || '',
      improve: workoutForm.improve?.trim() || '',
      created_by: profile?.id || null,
    }

    let targetWorkoutId = workoutForm.id

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
        setMessage(error?.message || '운동 기록 저장에 실패했습니다.')
        return
      }
      targetWorkoutId = data.id
    }

    await supabase.from('workout_items').insert(
      cleanedItems.map((item) => ({
        ...item,
        workout_id: targetWorkoutId,
      })),
    )

    await loadWorkouts()

    if (workoutForm.workout_type === 'pt') {
      const { data: freshWorkouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('member_id', workoutForm.member_id)

      const freshPtCount = (freshWorkouts || []).filter(
        (workout) => workout.workout_type === 'pt',
      ).length

      await supabase
        .from('members')
        .update({ used_sessions: freshPtCount })
        .eq('id', workoutForm.member_id)

      await loadMembers()
    }

    setMessage(workoutForm.id ? '운동 기록이 수정되었습니다.' : '운동 기록이 저장되었습니다.')
    resetWorkoutForm()
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
      items:
        items.length > 0
          ? items.map((item) => ({
              exercise_id: item.exercise_id || '',
              exercise_name_snapshot: item.exercise_name_snapshot || '',
              sets:
                Array.isArray(item.sets) && item.sets.length > 0
                  ? item.sets
                  : [{ kg: '', reps: '' }],
            }))
          : [{ ...emptyWorkoutItem }],
    })
    setActiveTab('기록작성')
  }

  const handleWorkoutDelete = async (workout) => {
    if (!window.confirm('이 운동 기록을 삭제할까요?')) return

    await supabase.from('workouts').delete().eq('id', workout.id)
    await loadWorkouts()

    if (workout.workout_type === 'pt') {
      const { data: freshWorkouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('member_id', workout.member_id)

      const freshPtCount = (freshWorkouts || []).filter(
        (item) => item.workout_type === 'pt',
      ).length

      await supabase
        .from('members')
        .update({ used_sessions: freshPtCount })
        .eq('id', workout.member_id)

      await loadMembers()
    }

    setMessage('운동 기록이 삭제되었습니다.')
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
    setMessage('브랜드가 삭제되었습니다.')
  }

  const handleExerciseSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: exerciseForm.name?.trim() || '',
      body_part: exerciseForm.body_part?.trim() || '',
      category: exerciseForm.category?.trim() || '',
      brand_id: exerciseForm.brand_id || null,
    }

    if (!payload.name) {
      setMessage('운동명을 입력해주세요.')
      return
    }

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
    setMessage('운동이 삭제되었습니다.')
  }

  const handleDietFeedbackSave = async (dietId, feedback) => {
    await supabase.from('diet_logs').update({ coach_feedback: feedback }).eq('id', dietId)
    await loadDietLogs()
    setMessage('식단 피드백이 저장되었습니다.')
  }

  const handleDietDelete = async (dietId) => {
    if (!window.confirm('식단 기록을 삭제할까요?')) return
    await supabase.from('diet_logs').delete().eq('id', dietId)
    await loadDietLogs()
    setMessage('식단 기록이 삭제되었습니다.')
  }

  const handleManualSave = async () => {
    const payload = {
      target_role: manualTarget,
      title: manualForm.title?.trim() || '',
      content: manualForm.content?.trim() || '',
    }

    const existing = manuals.find((manual) => manual.target_role === manualTarget)

    if (existing?.id) {
      await supabase.from('app_manuals').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('app_manuals').insert(payload)
    }

    await loadManuals()
    setMessage('사용방법이 저장되었습니다.')
  }

  const handleManualDelete = async () => {
    const existing = manuals.find((manual) => manual.target_role === manualTarget)
    if (!existing?.id) return
    if (!window.confirm('이 사용방법을 삭제할까요?')) return

    await supabase.from('app_manuals').delete().eq('id', existing.id)
    await loadManuals()
    setManualForm({ title: '', content: '' })
    setMessage('사용방법이 삭제되었습니다.')
  }

  const displayedDietLogs = dietMemberFilter
    ? dietLogs.filter((diet) => diet.member_id === dietMemberFilter)
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
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, total_sessions: e.target.value })
                    }
                  />
                </label>

                <label className="field">
                  <span>사용 세션</span>
                  <input
                    type="number"
                    value={memberForm.used_sessions}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, used_sessions: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="field">
                  <span>시작일</span>
                  <input
                    type="date"
                    value={memberForm.start_date}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, start_date: e.target.value })
                    }
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
                      setMemberForm({
                        ...memberForm,
                        access_code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() =>
                      setMemberForm((prev) => ({
                        ...prev,
                        access_code: randomCode(),
                      }))
                    }
                  >
                    생성
                  </button>
                </div>
              </label>

              <div className="inline-actions wrap">
                <button className="primary-btn" type="submit">
                  {editingMemberId ? '회원 수정' : '회원 추가'}
                </button>
                <button type="button" className="secondary-btn" onClick={resetMemberForm}>
                  초기화
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <h2>회원 목록</h2>
            <div className="list-stack">
              {memberStats.map((member) => {
                const isSelected = selectedMemberId === member.id

                return (
                  <div
                    key={member.id}
                    className={`list-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedMemberId(member.id)}
                  >
                    <div className="list-card-top">
                      <strong>{member.name}</strong>
                      <span className="pill">남은 {member.remainingSessions}회</span>
                    </div>

                    <div className="compact-text">
                      목표: {member.goal || '-'} / Access: {member.access_code}
                    </div>

                    <div className="compact-text">
                      PT {member.ptCount}회 / 개인운동 {member.personalCount}회
                    </div>

                    <div className="inline-actions wrap">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMemberEdit(member)
                        }}
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyMemberLink(member)
                        }}
                      >
                        링크 복사
                      </button>

                      <button
                        type="button"
                        className="danger-btn"
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
                  <p>
                    <strong>기간:</strong> {formatDate(selectedMember.start_date)} ~{' '}
                    {formatDate(selectedMember.end_date)}
                  </p>
                  <p><strong>메모:</strong> {selectedMember.memo || '-'}</p>
                  <p>
                    <strong>회원 링크:</strong> {window.location.origin}?member={selectedMember.id}
                  </p>
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

                  <div className="inline-actions wrap">
                    <button className="primary-btn" type="button" onClick={handleRoutineSave}>
                      루틴 저장
                    </button>
                    <button className="danger-btn" type="button" onClick={handleRoutineDelete}>
                      루틴 삭제
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}

      {activeTab === '기록작성' && (
        <div className="two-col">
          <section className="card">
            <h2>운동 기록 작성 / 수정</h2>

            <form className="stack-gap" onSubmit={handleWorkoutSubmit}>
              <div className="grid-2">
                <label className="field">
                  <span>회원 선택</span>
                  <select
                    value={workoutForm.member_id}
                    onChange={(e) =>
                      setWorkoutForm({ ...workoutForm, member_id: e.target.value })
                    }
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
                    onChange={(e) =>
                      setWorkoutForm({ ...workoutForm, workout_date: e.target.value })
                    }
                  />
                </label>
              </div>

              <label className="field">
                <span>기록 타입</span>
                <select
                  value={workoutForm.workout_type}
                  onChange={(e) =>
                    setWorkoutForm({ ...workoutForm, workout_type: e.target.value })
                  }
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
                      <span>운동DB 선택</span>
                      <select
                        value={item.exercise_id}
                        onChange={(e) => updateWorkoutItemSelect(itemIndex, e.target.value)}
                      >
                        <option value="">선택 안함</option>
                        {exercises.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            [{exercise.brands?.name || '브랜드없음'}] {exercise.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>운동명 직접 입력</span>
                      <input
                        value={item.exercise_name_snapshot}
                        onChange={(e) => updateWorkoutItemName(itemIndex, e.target.value)}
                        placeholder="예: 힙쓰러스트, 밴드 워크, 스쿼트"
                      />
                    </label>

                    <div className="stack-gap">
                      {item.sets.map((setRow, setIndex) => (
                        <div className="set-row" key={setIndex}>
                          <input
                            placeholder="kg"
                            value={setRow.kg}
                            onChange={(e) =>
                              updateSetValue(itemIndex, setIndex, 'kg', e.target.value)
                            }
                          />
                          <input
                            placeholder="reps"
                            value={setRow.reps}
                            onChange={(e) =>
                              updateSetValue(itemIndex, setIndex, 'reps', e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => removeSet(itemIndex, setIndex)}
                            disabled={item.sets.length === 1}
                          >
                            세트 삭제
                          </button>
                        </div>
                      ))}
                    </div>

                    <button type="button" className="secondary-btn" onClick={() => addSet(itemIndex)}>
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

              <div className="inline-actions wrap">
                <button className="primary-btn" type="submit">
                  {workoutForm.id ? '운동 기록 수정' : '운동 기록 저장'}
                </button>
                <button type="button" className="secondary-btn" onClick={resetWorkoutForm}>
                  작성 초기화
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <h2>운동 기록 목록</h2>

            <div className="list-stack">
              {workouts.map((workout) => {
                const member = members.find((item) => item.id === workout.member_id)
                const items = workoutItemsMap[workout.id] || []
                const collapsed = collapsedWorkouts[workout.id] ?? true

                return (
                  <div key={workout.id} className="list-card">
                    <div className="list-card-top">
                      <strong>
                        {member?.name || '회원없음'} / {workout.workout_type === 'pt' ? 'PT' : '개인운동'}
                      </strong>
                      <span className="pill">{workout.workout_date}</span>
                    </div>

                    <div className="compact-text">
                      간략히보기: 운동 {items.length}개 / 총세트 {getTotalSetCount(items)}세트
                    </div>

                    <div className="inline-actions wrap">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() =>
                          setCollapsedWorkouts((prev) => ({
                            ...prev,
                            [workout.id]: !collapsed,
                          }))
                        }
                      >
                        {collapsed ? '상세히보기' : '간략히보기'}
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleWorkoutEdit(workout)}
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handleWorkoutDelete(workout)}
                      >
                        삭제
                      </button>
                    </div>

                    {!collapsed ? (
                      <div className="detail-box">
                        {items.map((item) => (
                          <div key={item.id} className="record-item-box">
                            <strong>{item.exercise_name_snapshot}</strong>
                            <ul className="set-list">
                              {(item.sets || []).map((setRow, idx) => (
                                <li key={idx}>
                                  {idx + 1}세트 - {setRow.kg || '-'}kg / {setRow.reps || '-'}회
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

              <div className="inline-actions wrap">
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
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        setEditingBrandId(brand.id)
                        setBrandForm({ name: brand.name })
                      }}
                    >
                      수정
                    </button>

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleBrandDelete(brand.id)}
                    >
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
                  onChange={(e) =>
                    setExerciseForm({ ...exerciseForm, name: e.target.value })
                  }
                />
              </label>

              <div className="grid-3">
                <label className="field">
                  <span>부위</span>
                  <input
                    value={exerciseForm.body_part}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, body_part: e.target.value })
                    }
                  />
                </label>

                <label className="field">
                  <span>카테고리</span>
                  <input
                    value={exerciseForm.category}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, category: e.target.value })
                    }
                  />
                </label>

                <label className="field">
                  <span>브랜드</span>
                  <select
                    value={exerciseForm.brand_id}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, brand_id: e.target.value })
                    }
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

              <div className="inline-actions wrap">
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
                placeholder="운동명 / 브랜드 / 부위"
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
                      type="button"
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

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleExerciseDelete(exercise.id)}
                    >
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
            <h2>식단 기록</h2>
            <select
              value={dietMemberFilter}
              onChange={(e) => setDietMemberFilter(e.target.value)}
            >
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
              const collapsed = collapsedDiets[diet.id] ?? true
              const member = members.find((item) => item.id === diet.member_id)

              return (
                <DietAdminCard
                  key={diet.id}
                  diet={diet}
                  memberName={member?.name || '회원없음'}
                  collapsed={collapsed}
                  onToggle={() =>
                    setCollapsedDiets((prev) => ({
                      ...prev,
                      [diet.id]: !collapsed,
                    }))
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
        <div className="stack-gap">
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

          <div className="card">
            <h2>회원별 통계</h2>
            <div className="list-stack">
              {memberStats.map((member) => (
                <div key={member.id} className="list-card">
                  <div className="list-card-top">
                    <strong>{member.name}</strong>
                    <span className="pill">남은 {member.remainingSessions}회</span>
                  </div>
                  <div className="compact-text">
                    PT {member.ptCount}회 / 개인운동 {member.personalCount}회 / 총 세션 {member.total_sessions || 0}회
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === '사용방법' && (
        <div className="card">
          <div className="section-head">
            <h2>사용방법 관리</h2>
            <select
              value={manualTarget}
              onChange={(e) => setManualTarget(e.target.value)}
            >
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

            <div className="inline-actions wrap">
              <button className="primary-btn" type="button" onClick={handleManualSave}>
                저장
              </button>
              <button className="danger-btn" type="button" onClick={handleManualDelete}>
                삭제
              </button>
            </div>
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
        간략히보기: {diet.meal_type} / {diet.content.slice(0, 30)}
        {diet.content.length > 30 ? '...' : ''}
      </div>

      <div className="inline-actions wrap">
        <button type="button" className="secondary-btn" onClick={onToggle}>
          {collapsed ? '상세히보기' : '간략히보기'}
        </button>

        <button type="button" className="danger-btn" onClick={() => onDelete(diet.id)}>
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

          <button type="button" className="primary-btn" onClick={() => onSave(diet.id, feedback)}>
            피드백 저장
          </button>
        </div>
      ) : null}
    </div>
  )
}
