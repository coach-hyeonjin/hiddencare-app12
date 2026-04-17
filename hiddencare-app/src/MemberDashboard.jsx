import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import logo from './assets/logo.png'

const TABS = [
  '내정보',
  '성장현황',
  '건강정보',
  '운동기록',
  '개인운동입력',
  '식단',
  '식단플래너',
  '루틴',
  '프로그램',
  '코치스케줄',
  '공지사항',
  '제휴업체',
  '병의원·약국 소개',
  '문의사항',
  '사용방법',
]

const createEmptyPersonalSet = () => ({ kg: '', reps: '' })

const createEmptyPersonalSubExercise = () => ({
  exercise_id: '',
  exercise_name_snapshot: '',
  equipment_name_snapshot: '',
  performed_name: '',
  exercise_search: '',
  sets: [createEmptyPersonalSet()],
})

const emptyPersonalItem = {
  exercise_id: '',
  exercise_name_snapshot: '',
  equipment_name_snapshot: '',
  performed_name: '',
  exercise_search: '',

  entry_type: 'strength', // strength / cardio / care / stretching / pain_only
  cardio_minutes: '',
  care_minutes: '',
  stretch_minutes: '',
  stretch_reps: '',

  sets: [createEmptyPersonalSet()],

  training_method: 'normal',
  method_note: '',
  sub_exercises: [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()],
  collapsed: false,
}
const emptyPainLog = {
  pain_type: '운동중',
  body_part: '',
  movement_name: '',
  pain_timing: '',
  pain_score: '',
  pain_note: '',
}
const emptyPersonalForm = {
  id: null,
  workout_date: new Date().toISOString().slice(0, 10),
  good: '',
  improve: '',
  pain_enabled: false,
  pain_logs: [{ ...emptyPainLog }],
  items: [{ ...emptyPersonalItem, sub_exercises: [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()] }],
}

const emptyDietForm = {
  id: null,
  log_date: new Date().toISOString().slice(0, 10),
  meal_type: '아침',
  meal_time: '',
  content: '',
  carb_g: '',
  protein_g: '',
  fat_g: '',
  product_brand: '',
  product_name: '',
  meal_category: '일반식',
  hunger_level: 0,
  member_note: '',
}

const emptyHealthForm = {
  id: null,
  record_date: new Date().toISOString().slice(0, 10),
  sex: 'male',
  age: '',
  height_cm: '',
  weight_kg: '',
  body_fat_percent: '',
  skeletal_muscle_mass: '',
  body_fat_mass: '',
  visceral_fat_level: '',
  visceral_fat_area: '',
  whr: '',
  bmr: '',
  activity_factor: '1.375',
  recommended_kcal: '',
  inbody_score: '',
  medical_history: '',
  member_note: '',
  inbody_image_url: '',
}
const emptyInquiryForm = {
  name: '',
  phone: '',
  content: '',
  is_private: false,
}
const emptyPartnerUsageForm = {
  partner_id: '',
  note: '',
}
function getTotalSetCount(items = []) {
  return items.reduce((sum, item) => {
    // 유산소 / 케어는 세트 없음
    if (item.entry_type === 'cardio' || item.entry_type === 'care') {
      return sum
    }

    // 슈퍼세트는 sub_exercises 기준
    if (item.training_method === 'superset') {
      const subTotal = (item.sub_exercises || []).reduce((subSum, sub) => {
        return subSum + ((sub.sets || []).length || 0)
      }, 0)

      return sum + subTotal
    }

    // 일반 / 드롭세트
    return sum + ((item.sets || []).length || 0)
  }, 0)
}
function normalizeSets(sets = []) {
  return sets
    .filter((setRow) => setRow.kg !== '' || setRow.reps !== '')
    .map((setRow) => ({
      kg: String(setRow.kg ?? ''),
      reps: String(setRow.reps ?? ''),
    }))
}

function getMonthKey(dateString) {
  return (dateString || '').slice(0, 7)
}

function formatDate(value) {
  return value || '-'
}

function textIncludes(value, keyword) {
  return String(value || '').toLowerCase().includes(String(keyword || '').toLowerCase())
}
function maskMemberName(name) {
  const text = String(name || '').trim()

  if (!text) return '회원'
  if (text.length === 1) return text
  if (text.length === 2) return `${text[0]}*`
  return `${text[0]}*${text[text.length - 1]}`
}
function safeJsonParse(value, fallback) {
  try {
    if (!value) return fallback
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function normalizeRoutineData(row) {
  const parsed =
    row?.routine_data && typeof row.routine_data === 'object'
      ? row.routine_data
      : safeJsonParse(row?.routine_data, null)

  if (parsed && Array.isArray(parsed.weeks)) {
    return {
      id: row?.id || null,
      title: parsed.title || row?.title || '루틴',
      weeks: parsed.weeks.map((week, weekIndex) => ({
        week_number: week.week_number || weekIndex + 1,
        days: (week.days || []).map((day) => ({
          day_of_week: day.day_of_week || '월',
          items:
            Array.isArray(day.items) && day.items.length
              ? day.items.map((item) => ({
                  exercise_id: item.exercise_id || '',
                  exercise_name_snapshot: item.exercise_name_snapshot || '',
                  duration_minutes: item.duration_minutes || '',
                  memo: item.memo || '',
                  sets:
                    Array.isArray(item.sets) && item.sets.length
                      ? item.sets.map((setRow) => ({
                          kg: setRow.kg ?? '',
                          reps: setRow.reps ?? '',
                        }))
                      : [{ kg: '', reps: '' }],
                }))
              : [],
        })),
      })),
    }
  }

  return {
    id: row?.id || null,
    title: row?.title || '루틴',
    weeks: [],
  }
}

function isCardioExercise(exercise) {
  const category = String(exercise?.category || '').trim()
  const bodyPart = String(exercise?.body_part || '').trim()
  return category === '유산소' || bodyPart === '유산소'
}
function calcBmr({ sex, age, heightCm, weightKg, manualBmr }) {
  if (manualBmr && Number(manualBmr) > 0) {
    return Math.round(Number(manualBmr))
  }

  if (!sex || !age || !heightCm || !weightKg) return ''

  const base =
    10 * Number(weightKg) +
    6.25 * Number(heightCm) -
    5 * Number(age)

  return Math.round(sex === 'male' ? base + 5 : base - 161)
}

function calcRecommendedKcal({ bmr, activityFactor }) {
  if (!bmr || !activityFactor) return ''
  return Math.round(Number(bmr) * Number(activityFactor))
}
function playMemberAlertSound() {
  try {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTAAAAAA////AAAA////AAAA////AAAA////AAAA'
    )
    audio.play().catch(() => {})
  } catch (error) {
    console.error('회원 알림음 재생 실패:', error)
  }
}
function getLevelTone(levelName = '') {
  const name = String(levelName || '').trim()

  if (name.includes('그린')) {
    return {
      key: 'green',
      label: 'GREEN TIER',
      className: 'tier-green',
    }
  }
  if (name.includes('실버')) {
    return {
      key: 'silver',
      label: 'SILVER TIER',
      className: 'tier-silver',
    }
  }
  if (name.includes('골드')) {
    return {
      key: 'gold',
      label: 'GOLD TIER',
      className: 'tier-gold',
    }
  }
  if (name.includes('플래티넘')) {
    return {
      key: 'platinum',
      label: 'PLATINUM TIER',
      className: 'tier-platinum',
    }
  }
  if (name.includes('다이아')) {
    return {
      key: 'diamond',
      label: 'DIAMOND TIER',
      className: 'tier-diamond',
    }
  }
  if (name.includes('블랙')) {
    return {
      key: 'black',
      label: 'BLACK TIER',
      className: 'tier-black',
    }
  }
  if (name.includes('인피니티')) {
    return {
      key: 'infinity',
      label: 'INFINITY TIER',
      className: 'tier-infinity',
    }
  }

  return {
    key: 'default',
    label: 'MEMBER TIER',
    className: 'tier-default',
  }
}

function getLevelBadgeClass(levelName = '') {
  return `member-tier-badge ${getLevelTone(levelName).className}`
}

function getLevelSubLabel(levelName = '') {
  return getLevelTone(levelName).label
}
function getLevelCardClass(levelName = '') {
  const name = String(levelName || '').trim()

  if (name.includes('그린')) return 'tier-green'
  if (name.includes('실버')) return 'tier-silver'
  if (name.includes('골드')) return 'tier-gold'
  if (name.includes('플래티넘')) return 'tier-platinum'
  if (name.includes('다이아')) return 'tier-diamond'
  if (name.includes('블랙')) return 'tier-black'
  if (name.includes('인피니티')) return 'tier-infinity'

  return 'tier-default'
}
function getLevelColorClass(levelName = '') {
  const name = String(levelName || '').trim()

  if (name.includes('그린')) return 'tier-green'
  if (name.includes('실버')) return 'tier-silver'
  if (name.includes('골드')) return 'tier-gold'
  if (name.includes('플래티넘')) return 'tier-platinum'
  if (name.includes('다이아')) return 'tier-diamond'
  if (name.includes('블랙')) return 'tier-black'
  if (name.includes('인피니티')) return 'tier-infinity'

  return 'tier-default'
}
function getXpLogIcon(sourceType) {
  if (sourceType === 'pt_workout') return '🏋️'
  if (sourceType === 'personal_workout') return '🔥'
  if (sourceType === 'diet') return '🥗'
  return '✨'
}
function getXpProgress(growthSummary, levelSettings = []) {
  const currentXp = Number(growthSummary?.totalXp || 0)

  if (!Array.isArray(levelSettings) || levelSettings.length === 0) {
    return { percent: 0, current: currentXp, next: currentXp }
  }

  const sorted = [...levelSettings].sort(
    (a, b) => Number(a.min_xp || 0) - Number(b.min_xp || 0)
  )

  let currentLevel = sorted[0]
  let nextLevel = null

  for (let i = 0; i < sorted.length; i++) {
    if (currentXp >= Number(sorted[i].min_xp || 0)) {
      currentLevel = sorted[i]
      nextLevel = sorted[i + 1] || null
    }
  }

  if (!nextLevel) {
    return {
      percent: 100,
      current: currentXp,
      next: currentXp,
    }
  }

  const currentMin = Number(currentLevel.min_xp || 0)
  const nextMin = Number(nextLevel.min_xp || 0)

  const progress = currentXp - currentMin
  const range = nextMin - currentMin
  const percent = range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 0

  return {
    percent,
    current: currentXp,
    next: nextMin,
  }
}
export default function MemberDashboard({ member, accessCode, onLogout }) {
  const [activeTab, setActiveTab] = useState('내정보')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [memberInfo, setMemberInfo] = useState(member)

  const [workouts, setWorkouts] = useState([])
  const [workoutItemsMap, setWorkoutItemsMap] = useState({})
  const [collapsedWorkouts, setCollapsedWorkouts] = useState({})
  const [workoutSearch, setWorkoutSearch] = useState('')
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState('all')

  const [exercises, setExercises] = useState([])
  const [personalForm, setPersonalForm] = useState(emptyPersonalForm)

  const [dietLogs, setDietLogs] = useState([])
  const [memberLevel, setMemberLevel] = useState(null)
const [memberXpLogs, setMemberXpLogs] = useState([])
const [memberLevelSettings, setMemberLevelSettings] = useState([])
const [memberLevelRanking, setMemberLevelRanking] = useState([])
  const [memberStats, setMemberStats] = useState([])
  const [memberXpSettings, setMemberXpSettings] = useState([])
const [growthOpenSections, setGrowthOpenSections] = useState({
  summary: true,
  levelTable: false,
  xpGuide: false,
  xpLogs: false,
  ranking: false,
  activityRanking: false,
  participationRanking: false,
})
  
  const [collapsedDiets, setCollapsedDiets] = useState({})
  const [dietForm, setDietForm] = useState(emptyDietForm)
  const [dietSearch, setDietSearch] = useState('')
  const [dietMealFilter, setDietMealFilter] = useState('all')

  const [mealPlans, setMealPlans] = useState([])
const [mealPlanMonth, setMealPlanMonth] = useState(new Date().toISOString().slice(0, 7))
const [collapsedMealPlans, setCollapsedMealPlans] = useState({})
  const [mealPlanProfile, setMealPlanProfile] = useState(null)
  const [selectedMealPlanDate, setSelectedMealPlanDate] = useState('')
  const [mealCheckDrafts, setMealCheckDrafts] = useState({})
const [savingMealCheckKey, setSavingMealCheckKey] = useState('')
  const [healthLogs, setHealthLogs] = useState([])
  const [collapsedHealthLogs, setCollapsedHealthLogs] = useState({})
  const [healthForm, setHealthForm] = useState(emptyHealthForm)

  const [routine, setRoutine] = useState(null)
const [selectedRoutineWeek, setSelectedRoutineWeek] = useState(0)
const [collapsedRoutineDays, setCollapsedRoutineDays] = useState({})
const [manual, setManual] = useState(null)

  const [programs, setPrograms] = useState([])
  const [currentProgram, setCurrentProgram] = useState(null)
  const [programSearch, setProgramSearch] = useState('')
const [expandedMemberProgramId, setExpandedMemberProgramId] = useState(null)
  
  const [coaches, setCoaches] = useState([])
  const [coachSchedules, setCoachSchedules] = useState([])
  const [coachScheduleSlotsMap, setCoachScheduleSlotsMap] = useState({})
  const [collapsedSchedules, setCollapsedSchedules] = useState({})
  const [scheduleMonth, setScheduleMonth] = useState(new Date().toISOString().slice(0, 7))

  const [notices, setNotices] = useState([])
  const [collapsedNotices, setCollapsedNotices] = useState({})
  const [noticeSearch, setNoticeSearch] = useState('')
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState('all')

  const [inquiries, setInquiries] = useState([])
  const [collapsedInquiries, setCollapsedInquiries] = useState({})
  const [inquiryForm, setInquiryForm] = useState(emptyInquiryForm)
    const [partners, setPartners] = useState([])
  const [partnerUsages, setPartnerUsages] = useState([])
  const [partnerSearch, setPartnerSearch] = useState('')
  const [partnerCategoryFilter, setPartnerCategoryFilter] = useState('all')
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [partnerUsageForm, setPartnerUsageForm] = useState(emptyPartnerUsageForm)
    const [medicalPartners, setMedicalPartners] = useState([])
  const [medicalPartnerSearch, setMedicalPartnerSearch] = useState('')
  const [medicalPartnerCategoryFilter, setMedicalPartnerCategoryFilter] = useState('all')
  const [selectedMedicalPartnerId, setSelectedMedicalPartnerId] = useState('')
const [memberAlertSettings, setMemberAlertSettings] = useState({
  inquiryAnswer: true,
  notice: true,
  workout: true,
  sound: true,
  popup: true,
})

const [memberAlerts, setMemberAlerts] = useState([])
const [unreadMemberNoticeCount, setUnreadMemberNoticeCount] = useState(0)
const [unreadMemberInquiryCount, setUnreadMemberInquiryCount] = useState(0)
const [unreadMemberWorkoutCount, setUnreadMemberWorkoutCount] = useState(0)
  const [collapsedMemberAlertBar, setCollapsedMemberAlertBar] = useState(false)
  const [memberAlertTab, setMemberAlertTab] = useState('settings')
const [memberAlertSearch, setMemberAlertSearch] = useState('')
   const currentAdminId = memberInfo?.admin_id || member?.admin_id || null
  const currentGymId = memberInfo?.gym_id || member?.gym_id || null
const calculatedBmr = useMemo(() => {
  return calcBmr({
    sex: healthForm.sex,
    age: healthForm.age,
    heightCm: healthForm.height_cm,
    weightKg: healthForm.weight_kg,
    manualBmr: healthForm.bmr,
  })
}, [
  healthForm.sex,
  healthForm.age,
  healthForm.height_cm,
  healthForm.weight_kg,
  healthForm.bmr,
])

const calculatedRecommendedKcal = useMemo(() => {
  return calcRecommendedKcal({
    bmr: calculatedBmr,
    activityFactor: healthForm.activity_factor,
  })
}, [calculatedBmr, healthForm.activity_factor])
  const stats = useMemo(() => {
    const ptCount = workouts.filter((workout) => workout.workout_type === 'pt').length
    const personalCount = workouts.filter((workout) => workout.workout_type === 'personal').length
    const remainingSessions = Math.max(
      Number(memberInfo?.total_sessions || 0) - Number(memberInfo?.used_sessions || 0),
      0,
    )

    return {
      ptCount,
      personalCount,
      remainingSessions,
    }
  }, [workouts, memberInfo])

  const progressPercent = useMemo(() => {
    const total = Number(memberInfo?.total_sessions || 0)
    const used = Number(memberInfo?.used_sessions || 0)
    if (!total) return 0
    return Math.min(Math.round((used / total) * 100), 100)
  }, [memberInfo])

  const filteredSchedules = useMemo(() => {
    return coachSchedules.filter((schedule) => getMonthKey(schedule.schedule_date) === scheduleMonth)
  }, [coachSchedules, scheduleMonth])

  const workoutCards = useMemo(() => {
  return workouts
    .map((workout) => {
      const items = workoutItemsMap[workout.id] || []

      const searchText = [
        workout.workout_type,
        workout.workout_date,
        workout.good,
        workout.improve,
        ...items.map((item) => item.exercise_name_snapshot || ''),
        ...items.flatMap((item) =>
          Array.isArray(item.sub_exercises)
            ? item.sub_exercises.map((sub) => sub.exercise_name_snapshot || '')
            : []
        ),
        ...items.map((item) => (item.is_cardio ? `유산소 ${item.cardio_minutes || ''}` : '')),
        ...items.map((item) => item.training_method || ''),
        ...items.map((item) => item.method_note || ''),
      ].join(' ')

      return {
        ...workout,
        items,
        searchText,
      }
    })
    .filter((workout) => {
      const matchesKeyword = !workoutSearch.trim() || textIncludes(workout.searchText, workoutSearch)
      const matchesType = workoutTypeFilter === 'all' || workout.workout_type === workoutTypeFilter
      return matchesKeyword && matchesType
    })
}, [workouts, workoutItemsMap, workoutSearch, workoutTypeFilter])

  const displayedDietLogs = useMemo(() => {
    return dietLogs.filter((diet) => {
      const matchesMeal = dietMealFilter === 'all' || diet.meal_type === dietMealFilter
      const matchesKeyword =
        !dietSearch.trim() ||
        textIncludes(diet.content, dietSearch) ||
        textIncludes(diet.product_brand, dietSearch) ||
        textIncludes(diet.product_name, dietSearch) ||
        textIncludes(diet.member_note, dietSearch) ||
        textIncludes(diet.coach_feedback, dietSearch) ||
        textIncludes(diet.meal_type, dietSearch) ||
        textIncludes(diet.meal_category, dietSearch)

      return matchesMeal && matchesKeyword
    })
  }, [dietLogs, dietMealFilter, dietSearch])
const mealPlanPurposeInfo = useMemo(() => {
  const goalType = String(mealPlanProfile?.goal_type || '').trim()

  const goalMap = {
    diet: {
      label: '체지방 감량',
      reason:
        '체지방을 줄이고 몸을 더 가볍게 만들기 위해 총 섭취 열량을 조절하고, 단백질을 충분히 확보하는 식단입니다.',
    },
    recomposition: {
      label: '체형 개선',
      reason:
        '체지방은 줄이고 몸의 균형과 라인을 더 좋게 만들기 위해, 과하지 않은 열량과 안정적인 단백질 섭취를 맞추는 식단입니다.',
    },
    maintenance: {
      label: '유지',
      reason:
        '현재 몸 상태를 안정적으로 유지하기 위해 과식이나 부족함 없이, 일정한 열량과 균형 잡힌 식사를 이어가는 식단입니다.',
    },
    muscle_gain: {
      label: '근비대',
      reason:
        '근육량을 늘리고 운동 후 회복을 돕기 위해 단백질과 총 섭취 열량을 충분히 확보하는 식단입니다.',
    },
    bulk: {
      label: '벌크업',
      reason:
        '체중과 근육량 증가를 목표로, 전체 섭취 열량과 탄수화물 비중을 높여 몸을 키우기 위한 식단입니다.',
    },
  }

  const current = goalMap[goalType] || {
    label: '맞춤 식단',
    reason: '현재 회원님 상태와 목표에 맞춰 코치가 설정한 맞춤 식단입니다.',
  }

  return {
    label: current.label,
    reason: current.reason,
    targetKcal: Number(mealPlanProfile?.target_kcal || 0),
    mealsPerDay: Number(mealPlanProfile?.meals_per_day || 0),
  }
}, [mealPlanProfile])
const mealPlanCalendarData = useMemo(() => {
  const [year, month] = String(mealPlanMonth || '').split('-').map(Number)

  if (!year || !month) {
    return {
      days: [],
      blanks: [],
    }
  }

  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const planMap = new Map(
    (mealPlans || []).map((plan) => [plan.plan_date, plan])
  )

  const blanks = Array.from({ length: firstDay }, (_, index) => `blank-${index}`)

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return {
      date,
      day,
      plan: planMap.get(date) || null,
    }
  })

  return { days, blanks }
}, [mealPlans, mealPlanMonth])

const selectedMealPlan = useMemo(() => {
  if (!selectedMealPlanDate) return null
  return mealPlans.find((plan) => plan.plan_date === selectedMealPlanDate) || null
}, [mealPlans, selectedMealPlanDate])

const getMealPlanProgress = (plan) => {
  const meals = Array.isArray(plan?.meals_json) ? plan.meals_json : []
  const checks = Array.isArray(plan?.checked_slots) ? plan.checked_slots : []

  const total = meals.length
  const doneCount = checks.filter((item) => item.status === 'done').length
  const skippedCount = checks.filter((item) => item.status === 'skipped').length
  const pendingCount = Math.max(total - doneCount - skippedCount, 0)
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return {
    total,
    doneCount,
    skippedCount,
    pendingCount,
    percent,
  }
}

const selectedMealPlanProgress = useMemo(() => {
  return selectedMealPlan ? getMealPlanProgress(selectedMealPlan) : null
}, [selectedMealPlan])

const todayMealPlan = useMemo(() => {
  const today = new Date().toISOString().slice(0, 10)
  return mealPlans.find((plan) => plan.plan_date === today) || mealPlans[0] || null
}, [mealPlans])

const todayMealPlanProgress = useMemo(() => {
  return todayMealPlan ? getMealPlanProgress(todayMealPlan) : null
}, [todayMealPlan])
const todayMealSlots = useMemo(() => {
  return Array.isArray(todayMealPlan?.meals_json) ? todayMealPlan.meals_json : []
}, [todayMealPlan])
  
const monthlyMealPlanProgress = useMemo(() => {
  const plans = Array.isArray(mealPlans) ? mealPlans : []

  if (plans.length === 0) {
    return {
      total: 0,
      doneCount: 0,
      skippedCount: 0,
      pendingCount: 0,
      percent: 0,
    }
  }

  const merged = plans.reduce(
    (acc, plan) => {
      const progress = getMealPlanProgress(plan)
      acc.total += progress.total
      acc.doneCount += progress.doneCount
      acc.skippedCount += progress.skippedCount
      acc.pendingCount += progress.pendingCount
      return acc
    },
    {
      total: 0,
      doneCount: 0,
      skippedCount: 0,
      pendingCount: 0,
    }
  )

  return {
    ...merged,
    percent: merged.total > 0 ? Math.round((merged.doneCount / merged.total) * 100) : 0,
  }
}, [mealPlans])
  const getMealCheckEntry = (plan, slot) => {
  const logs = Array.isArray(plan?.checked_slots) ? plan.checked_slots : []
  return logs.find((item) => item.slot === slot) || null
}

const getMealCheckStatusText = (status) => {
  if (status === 'done') return '완료'
  if (status === 'skipped') return '못 먹음'
  return '미체크'
}
const getMealFoodItems = (meal) => {
  if (Array.isArray(meal?.food_items) && meal.food_items.length > 0) {
    return meal.food_items
  }

  if (Array.isArray(meal?.items) && meal.items.length > 0) {
    return meal.items
  }

  return []
}

const getMealFoodItemName = (item) => {
  if (typeof item === 'string') return item

  return (
    item?.food_name ||
    item?.name ||
    item?.display_name ||
    item?.label ||
    item?.food ||
    item?.title ||
    '음식'
  )
}

const getMealFoodItemAmount = (item) => {
  if (typeof item === 'string') return ''

  return (
    item?.grams ??
    item?.amount_g ??
    item?.amount ??
    item?.serving_g ??
    item?.weight_g ??
    item?.quantity ??
    ''
  )
}

const getMealDisplaySummary = (meal) => {
  return meal?.menu || '-'
}
  

 const getTodayMealCoachComment = (plan, profile) => {
  const mealType = String(plan?.meal_type || 'normal')
  const currentMealPattern = String(profile?.current_meal_pattern || 'mixed')
  const adaptationStrategy = String(profile?.adaptation_strategy || 'gradual')
  const dietMode = String(profile?.diet_mode || 'balanced')
  const lateNightFrequency = Number(profile?.late_night_meal_frequency_per_week || 0)
  const deliveryFrequency = Number(profile?.delivery_food_frequency_per_week || 0)
  const snackFrequency = Number(profile?.snack_frequency_per_week || 0)

  let title = '오늘 식단 안내'
  let mainText = '오늘은 안내된 식단 흐름에 맞춰 식사를 진행해주세요.'
  const tips = []

  if (mealType === 'free') {
    title = '오늘은 자유식 운영일입니다.'
    mainText = '먹고 싶은 음식을 드셔도 괜찮지만, 과식하지 않도록 양과 속도를 조절해주세요.'
    tips.push('배가 부르기 전 80% 정도에서 마무리해주세요.')
    tips.push('단백질이 들어간 메뉴를 먼저 선택하면 흐름이 덜 무너집니다.')
  } else if (mealType === 'general') {
    title = '오늘은 일반식 허용일입니다.'
    mainText = '일반식을 드셔도 되지만, 단백질이 포함된 식사를 우선으로 골라주세요.'
    tips.push('밥·면만 먹기보다 고기, 계란, 생선, 두부가 함께 있는 구성을 선택해주세요.')
    tips.push('튀김·빵·디저트는 한 번에 겹치지 않게 조절해주세요.')
  } else {
    title = '오늘은 식단 기준을 맞추는 날입니다.'
    mainText = '오늘은 설계된 식단 구성과 순서를 최대한 맞추는 데 집중해주세요.'
    tips.push('끼니를 건너뛰지 말고 정해진 흐름대로 드시는 것이 중요합니다.')
    tips.push('대체 음식이 필요하면 비슷한 탄수화물·단백질 구성으로 바꿔주세요.')
  }

  if (currentMealPattern === 'outside_often') {
    tips.push('외식이 잦은 편이라 메뉴 선택만 잘해도 식단 유지가 훨씬 쉬워집니다.')
  } else if (currentMealPattern === 'late_heavy') {
    tips.push('저녁 늦게 많이 먹는 습관이 있다면 밤에는 양보다 소화 부담을 먼저 줄여주세요.')
  } else if (currentMealPattern === 'mixed') {
    tips.push('현재 식습관이 일정하지 않을 수 있어, 완벽함보다 지속 가능성을 우선으로 진행합니다.')
  }

  if (adaptationStrategy === 'gradual') {
    tips.push('지금은 한 번에 확 바꾸기보다, 지킬 수 있는 수준으로 천천히 맞춰가는 단계입니다.')
  } else if (adaptationStrategy === 'fast') {
    tips.push('초반 적응 속도를 높이는 단계라 식사 흐름을 놓치지 않는 것이 중요합니다.')
  }

  if (dietMode === 'aggressive') {
    tips.push('현재는 비교적 강도 있는 감량 흐름이라 군것질과 추가 간식을 특히 조심해주세요.')
  } else if (dietMode === 'relaxed') {
    tips.push('현재는 무리하지 않는 식단 흐름이므로, 대신 꾸준히 지키는 것이 가장 중요합니다.')
  }

  if (lateNightFrequency >= 3) {
    tips.push('야식 빈도가 있는 편이라 저녁 이후에는 가볍고 단순한 선택이 더 유리합니다.')
  }

  if (deliveryFrequency >= 3) {
    tips.push('배달 음식 빈도가 있다면 소스·사이드 추가를 줄이는 것만으로도 흐름이 좋아집니다.')
  }

  if (snackFrequency >= 4) {
    tips.push('간식이 잦다면 배고픔 때문에 먹는지, 습관 때문에 먹는지 먼저 구분해보세요.')
  }

  return {
    title,
    mainText,
    tips: tips.slice(0, 4),
  }
} 
const updateMealCheckDraft = (planId, slot, value) => {
  const key = `${planId}-${slot}`
  setMealCheckDrafts((prev) => ({
    ...prev,
    [key]: value,
  }))
}

const handleMealCheckSave = async (plan, meal, status) => {
  const slot = meal.slot || '식사'
  const key = `${plan.id}-${slot}`
  const reason = String(mealCheckDrafts[key] || '').trim()

  if (status === 'skipped' && !reason) {
    alert('못 먹은 이유를 입력해주세요.')
    return
  }

  setSavingMealCheckKey(key)

  const currentLogs = Array.isArray(plan.checked_slots) ? [...plan.checked_slots] : []
  const filteredLogs = currentLogs.filter((item) => item.slot !== slot)

  const nextEntry = {
    slot,
    status,
    reason: status === 'skipped' ? reason : '',
    checked_at: new Date().toISOString(),
  }

  const nextLogs = [...filteredLogs, nextEntry]

  const allSlots = Array.isArray(plan.meals_json)
    ? plan.meals_json.map((item) => item.slot || '식사')
    : []

  const isChecked =
    allSlots.length > 0 &&
    allSlots.every((slotName) =>
      nextLogs.some((log) => log.slot === slotName && log.status === 'done')
    )

  const { error } = await supabase
    .from('member_meal_plans')
    .update({
      checked_slots: nextLogs,
      is_checked: isChecked,
    })
    .eq('id', plan.id)

  setSavingMealCheckKey('')

  if (error) {
    console.error('식단 체크 저장 실패:', error)
    alert('식단 체크 저장 실패')
    return
  }

  setMealPlans((prev) =>
    prev.map((item) =>
      item.id === plan.id
        ? {
            ...item,
            checked_slots: nextLogs,
            is_checked: isChecked,
          }
        : item
    )
  )

  setMealCheckDrafts((prev) => ({
    ...prev,
    [key]: status === 'skipped' ? reason : '',
  }))
}

  
 const visiblePrograms = useMemo(() => {
  return (programs || [])
    .filter((program) => program.is_visible_to_members !== false)
    .sort((a, b) => {
      const orderDiff = Number(a.display_order || 0) - Number(b.display_order || 0)
      if (orderDiff !== 0) return orderDiff
      return String(a.name || '').localeCompare(String(b.name || ''), 'ko-KR')
    })
}, [programs])

const filteredPrograms = useMemo(() => {
  const keyword = String(programSearch || '').trim().toLowerCase()

  return visiblePrograms.filter((program) => {
    if (!keyword) return true

    return (
      String(program.name || '').toLowerCase().includes(keyword) ||
      String(program.description || '').toLowerCase().includes(keyword) ||
      String(program.price || '').toLowerCase().includes(keyword) ||
      String(program.session_count || '').toLowerCase().includes(keyword)
    )
  })
}, [visiblePrograms, programSearch])

const featuredPrograms = useMemo(() => {
  return visiblePrograms.filter(
    (program) => program.is_recommended || program.is_popular
  )
}, [visiblePrograms])
  const filteredPartners = useMemo(() => {
    return partners
      .filter((partner) => {
        const matchesKeyword =
          !partnerSearch.trim() ||
          textIncludes(partner.name, partnerSearch) ||
          textIncludes(partner.category, partnerSearch) ||
          textIncludes(partner.description, partnerSearch) ||
          textIncludes(partner.benefit, partnerSearch) ||
          textIncludes(partner.address, partnerSearch)

        const matchesCategory =
          partnerCategoryFilter === 'all' || partner.category === partnerCategoryFilter

        return partner.is_active && matchesKeyword && matchesCategory
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko-KR'))
  }, [partners, partnerSearch, partnerCategoryFilter])
    const filteredMedicalPartners = useMemo(() => {
    return medicalPartners
      .filter((item) => {
        const matchesKeyword =
          !medicalPartnerSearch.trim() ||
          textIncludes(item.name, medicalPartnerSearch) ||
          textIncludes(item.category, medicalPartnerSearch) ||
          textIncludes(item.place_type, medicalPartnerSearch) ||
          textIncludes(item.short_description, medicalPartnerSearch) ||
          textIncludes(item.recommended_for, medicalPartnerSearch) ||
          textIncludes(item.address, medicalPartnerSearch)

        const matchesCategory =
          medicalPartnerCategoryFilter === 'all' || item.category === medicalPartnerCategoryFilter

        return item.is_active && matchesKeyword && matchesCategory
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko-KR'))
  }, [medicalPartners, medicalPartnerSearch, medicalPartnerCategoryFilter])
  const selectedPartner = useMemo(
    () => partners.find((partner) => partner.id === selectedPartnerId) || null,
    [partners, selectedPartnerId],
  )
  const selectedMedicalPartner = useMemo(
    () => medicalPartners.find((item) => item.id === selectedMedicalPartnerId) || null,
    [medicalPartners, selectedMedicalPartnerId],
  )
  const selectedPartnerUsageSummary = useMemo(() => {
    if (!selectedPartner) {
      return {
        approvedCountThisMonth: 0,
        extraLimit: 0,
        totalLimit: 0,
        remainingCount: 0,
        recentUsedAt: '',
      }
    }

    const nowMonth = new Date().toISOString().slice(0, 7)

    const approvedRows = partnerUsages.filter(
      (usage) =>
        usage.partner_id === selectedPartner.id &&
        usage.status === 'approved' &&
        String(usage.requested_at || usage.approved_at || '').slice(0, 7) === nowMonth,
    )

    const recentApproved = partnerUsages
      .filter((usage) => usage.partner_id === selectedPartner.id && usage.status === 'approved')
      .sort((a, b) =>
        String(b.approved_at || b.requested_at || '').localeCompare(
          String(a.approved_at || a.requested_at || ''),
        ),
      )[0]

    const extraLimit = Number(selectedPartner.member_extra_limit || 0)
    const baseLimit = Number(selectedPartner.monthly_limit || 0)
    const totalLimit = baseLimit + extraLimit
    const approvedCountThisMonth = approvedRows.length
    const remainingCount =
      totalLimit > 0 ? Math.max(totalLimit - approvedCountThisMonth, 0) : 0

    return {
      approvedCountThisMonth,
      extraLimit,
      totalLimit,
      remainingCount,
      recentUsedAt: recentApproved?.approved_at || recentApproved?.requested_at || '',
    }
  }, [selectedPartner, partnerUsages])
  const currentRoutineWeek = useMemo(() => {
  return routine?.weeks?.[selectedRoutineWeek] || null
}, [routine, selectedRoutineWeek])
  const toggleRoutineDay = (weekNumber, dayName, dayIndex) => {
  const key = `${weekNumber}-${dayName}-${dayIndex}`

  setCollapsedRoutineDays((prev) => {
    const next = {
      ...prev,
      [key]: !(prev[key] ?? true),
    }

    console.log('toggleRoutineDay', key, 'before:', prev[key], 'after:', next[key])
    return next
  })
}
  const publishedNotices = useMemo(() => {
    return notices
      .filter((notice) => notice.is_published)
      .filter((notice) => {
        const matchesCategory = noticeCategoryFilter === 'all' || notice.category === noticeCategoryFilter
        const matchesKeyword =
          !noticeSearch.trim() ||
          textIncludes(notice.title, noticeSearch) ||
          textIncludes(notice.content, noticeSearch) ||
          textIncludes(notice.category, noticeSearch)

        return matchesCategory && matchesKeyword
      })
  }, [notices, noticeCategoryFilter, noticeSearch])
const growthSummary = useMemo(() => {
  const totalXp = Number(memberLevel?.total_xp || 0)
  const levelNo = Number(memberLevel?.level_no || 1)
  const levelName = memberLevel?.level_name || '히든 그린 Ⅰ'
  const weeklyScore = Number(memberLevel?.weekly_score || 0)
  const streakDays = Number(memberLevel?.streak_days || 0)
  const lastActivityDate = memberLevel?.last_activity_date || '-'

  const sortedLevels = [...memberLevelSettings].sort(
    (a, b) => Number(a.min_xp || 0) - Number(b.min_xp || 0)
  )

  const currentLevel =
    sortedLevels.find((item) => Number(item.level_no || 0) === levelNo) || null

  const nextLevel =
    sortedLevels.find((item) => Number(item.min_xp || 0) > totalXp) || null

  const currentMinXp = Number(currentLevel?.min_xp || 0)
  const nextMinXp = Number(nextLevel?.min_xp || totalXp)
  const progressMax = nextLevel ? Math.max(nextMinXp - currentMinXp, 1) : 1
  const progressValue = nextLevel
    ? Math.min(Math.max(totalXp - currentMinXp, 0), progressMax)
    : progressMax

  const progressPercent = nextLevel
    ? Math.min(100, Math.round((progressValue / progressMax) * 100))
    : 100

  return {
    totalXp,
    levelNo,
    levelName,
    weeklyScore,
    streakDays,
    lastActivityDate,
    nextLevel,
    nextLevelDiff: nextLevel ? Math.max(nextMinXp - totalXp, 0) : 0,
    progressPercent,
  }
}, [memberLevel, memberLevelSettings])
  const myLevelRankInfo = useMemo(() => {
  const myId = String(memberInfo?.id || member?.id || '')

  if (!myId || !Array.isArray(memberLevelRanking) || memberLevelRanking.length === 0) {
    return {
      myRank: null,
      myRankItem: null,
      topTenRanking: [],
    }
  }

  const sorted = [...memberLevelRanking].sort((a, b) => {
    const xpDiff = Number(b.total_xp || 0) - Number(a.total_xp || 0)
    if (xpDiff !== 0) return xpDiff
    return String(a.members?.name || '').localeCompare(String(b.members?.name || ''), 'ko-KR')
  })

  const myIndex = sorted.findIndex(
    (item) => String(item.member_id) === myId
  )

  return {
    myRank: myIndex >= 0 ? myIndex + 1 : null,
    myRankItem: myIndex >= 0 ? sorted[myIndex] : null,
    topTenRanking: sorted.slice(0, 10),
  }
}, [memberLevelRanking, memberInfo?.id, member?.id])
 const activityRankingData = useMemo(() => {
  const totalRanking = [...(memberStats || [])]
    .filter((row) => Number(row.totalActivity || 0) > 0)
    .sort((a, b) => {
      const aTotal = Number(a.totalActivity || 0)
      const bTotal = Number(b.totalActivity || 0)

      if (bTotal !== aTotal) return bTotal - aTotal

      return String(a.name || '').localeCompare(String(b.name || ''), 'ko-KR')
    })

  return {
    totalRanking,
  }
}, [memberStats])

const myActivityRankInfo = useMemo(() => {
  const myId = String(memberInfo?.id || member?.id || '')

  if (
    !myId ||
    !Array.isArray(activityRankingData.totalRanking) ||
    activityRankingData.totalRanking.length === 0
  ) {
    return {
      myRank: null,
      myRankItem: null,
      topTenRanking: [],
    }
  }

  const sorted = [...activityRankingData.totalRanking]
  const myIndex = sorted.findIndex((item) => String(item.id) === myId)

  return {
    myRank: myIndex >= 0 ? myIndex + 1 : null,
    myRankItem: myIndex >= 0 ? sorted[myIndex] : null,
    topTenRanking: sorted.slice(0, 10),
  }
}, [activityRankingData.totalRanking, memberInfo?.id, member?.id])
  const participationRankingData = useMemo(() => {
  const totalRanking = [...(memberStats || [])]
    .map((row) => {
      const ptCount = Number(row.ptCount || 0)
      const personalCount = Number(row.personalCount || 0)
      const participationScore = ptCount * 2 + personalCount

      return {
        ...row,
        participationScore,
      }
    })
    .filter((row) => Number(row.participationScore || 0) > 0)
    .sort((a, b) => {
      const scoreDiff = Number(b.participationScore || 0) - Number(a.participationScore || 0)
      if (scoreDiff !== 0) return scoreDiff

      const ptDiff = Number(b.ptCount || 0) - Number(a.ptCount || 0)
      if (ptDiff !== 0) return ptDiff

      return String(a.name || '').localeCompare(String(b.name || ''), 'ko-KR')
    })

  return {
    totalRanking,
  }
}, [memberStats])

const myParticipationRankInfo = useMemo(() => {
  const myId = String(memberInfo?.id || member?.id || '')

  if (
    !myId ||
    !Array.isArray(participationRankingData.totalRanking) ||
    participationRankingData.totalRanking.length === 0
  ) {
    return {
      myRank: null,
      myRankItem: null,
      topTenRanking: [],
    }
  }

  const sorted = [...participationRankingData.totalRanking]
  const myIndex = sorted.findIndex((item) => String(item.id) === myId)

  return {
    myRank: myIndex >= 0 ? myIndex + 1 : null,
    myRankItem: myIndex >= 0 ? sorted[myIndex] : null,
    topTenRanking: sorted.slice(0, 10),
  }
}, [participationRankingData.totalRanking, memberInfo?.id, member?.id])
  const xpProgress = getXpProgress(growthSummary, memberLevelSettings)
  useEffect(() => {
    loadAll()
 }, [member?.id, mealPlanMonth])
  useEffect(() => {
  if (todayMealPlan?.plan_date) {
    setSelectedMealPlanDate(todayMealPlan.plan_date)
    return
  }

  if (mealPlans.length > 0) {
    setSelectedMealPlanDate(mealPlans[0].plan_date)
    return
  }

  setSelectedMealPlanDate('')
}, [todayMealPlan, mealPlans])
useEffect(() => {
  const latestNotice = notices[0]
  const storageKey = `member_last_notice_${member?.id || 'default'}`

  if (!latestNotice?.id) return

  const savedNoticeId = localStorage.getItem(storageKey)

  if (!savedNoticeId) {
    localStorage.setItem(storageKey, latestNotice.id)
    return
  }

  if (savedNoticeId !== latestNotice.id && memberAlertSettings.notice) {
    setUnreadMemberNoticeCount((prev) => prev + 1)

    const nextAlert = {
      id: `member-notice-${latestNotice.id}`,
      type: 'notice',
      text: `새 공지사항이 등록되었습니다. (${latestNotice.title || '제목 없음'})`,
      createdAt: Date.now(),
    }

    setMemberAlerts((prev) => [nextAlert, ...prev].slice(0, 20))

    if (memberAlertSettings.popup) {
      setMessage(`📢 새 공지사항이 등록되었습니다. (${latestNotice.title || '제목 없음'})`)
    }

    if (memberAlertSettings.sound) {
      playMemberAlertSound()
    }

    localStorage.setItem(storageKey, latestNotice.id)
  }
}, [notices, memberAlertSettings, member?.id])
  useEffect(() => {
  const answeredInquiry = inquiries.find((item) => String(item.answer || '').trim().length > 0)
  const storageKey = `member_last_answered_inquiry_${member?.id || 'default'}`

  if (!answeredInquiry?.id) return

  const savedInquiryId = localStorage.getItem(storageKey)

  if (!savedInquiryId) {
    localStorage.setItem(storageKey, answeredInquiry.id)
    return
  }

  if (savedInquiryId !== answeredInquiry.id && memberAlertSettings.inquiryAnswer) {
    setUnreadMemberInquiryCount((prev) => prev + 1)

    const nextAlert = {
      id: `member-inquiry-${answeredInquiry.id}`,
      type: 'inquiry',
      text: '문의에 답변이 등록되었습니다.',
      createdAt: Date.now(),
    }

    setMemberAlerts((prev) => [nextAlert, ...prev].slice(0, 20))

    if (memberAlertSettings.popup) {
      setMessage('📩 문의에 답변이 등록되었습니다.')
    }

    if (memberAlertSettings.sound) {
      playMemberAlertSound()
    }

    localStorage.setItem(storageKey, answeredInquiry.id)
  }
}, [inquiries, memberAlertSettings, member?.id])
  useEffect(() => {
  const latestWorkout = workouts[0]
  const storageKey = `member_last_workout_${member?.id || 'default'}`

  if (!latestWorkout?.id) return

  const savedWorkoutId = localStorage.getItem(storageKey)

  if (!savedWorkoutId) {
    localStorage.setItem(storageKey, latestWorkout.id)
    return
  }

  if (savedWorkoutId !== latestWorkout.id && memberAlertSettings.workout) {
    setUnreadMemberWorkoutCount((prev) => prev + 1)

    const nextAlert = {
      id: `member-workout-${latestWorkout.id}`,
      type: 'workout',
      text: `새 운동기록이 등록되었습니다. (${latestWorkout.workout_date || '-'})`,
      createdAt: Date.now(),
    }

    setMemberAlerts((prev) => [nextAlert, ...prev].slice(0, 20))

    if (memberAlertSettings.popup) {
      setMessage(`🏋️ 새 운동기록이 등록되었습니다. (${latestWorkout.workout_date || '-'})`)
    }

    if (memberAlertSettings.sound) {
      playMemberAlertSound()
    }

    localStorage.setItem(storageKey, latestWorkout.id)
  }
}, [workouts, memberAlertSettings, member?.id])
  useEffect(() => {
  const interval = setInterval(() => {
    loadNotices()
    loadInquiries()
    loadWorkouts()
    loadPartnerUsages()
  }, 10000)

  return () => clearInterval(interval)
}, [member?.id, currentAdminId])
  useEffect(() => {
  const saved = localStorage.getItem(`member_alert_settings_${member?.id || 'default'}`)
  if (saved) {
    try {
      setMemberAlertSettings(JSON.parse(saved))
    } catch (error) {
      console.error('회원 알림 설정 불러오기 실패:', error)
    }
  }
}, [member?.id])
  useEffect(() => {
    setInquiryForm((prev) => ({
      ...prev,
      name: memberInfo?.name || '',
    }))
  }, [memberInfo?.name])
const toggleGrowthSection = (key) => {
  setGrowthOpenSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}
 const loadMemberStats = async () => {
  try {
    const memberId = memberInfo?.id || member?.id || null

    if (!memberId) {
      setMemberStats([])
      return
    }

    const { data: memberRow, error: memberError } = await supabase
      .from('members')
      .select('id, admin_id')
      .eq('id', memberId)
      .maybeSingle()

    if (memberError) {
      console.error('활동랭킹용 회원 admin_id 조회 실패:', memberError)
      setMemberStats([])
      return
    }

    const adminId = memberRow?.admin_id || null
    console.log('활동랭킹 실제 adminId', adminId)

    if (!adminId) {
      setMemberStats([])
      return
    }

    const { data, error } = await supabase.rpc('get_member_activity_ranking', {
      p_admin_id: adminId,
    })

    console.log('활동랭킹 RPC data', data)
    console.log('활동랭킹 RPC error', error)

    if (error) {
      console.error('활동랭킹 RPC 조회 실패:', error)
      setMemberStats([])
      return
    }

    const stats = (data || []).map((row) => ({
      id: row.member_id,
      name: row.member_name || '회원',
      ptCount: Number(row.pt_count || 0),
      personalCount: Number(row.personal_count || 0),
      totalActivity: Number(row.total_activity || 0),
      remainingSessions: Number(row.remaining_sessions || 0),
    }))

    setMemberStats(stats)
  } catch (error) {
    console.error('회원 활동랭킹 조회 실패:', error)
    setMemberStats([])
  }
}

 const loadAll = async () => {
  setLoading(true)
  setMessage('')

  try {
    const loadedMember = await loadMemberInfo()
    const adminId = loadedMember?.admin_id || member?.admin_id || null

    await Promise.all([
      loadExercises(adminId),
      loadWorkouts(),
      loadDietLogs(),
      loadMealPlans(),
      loadMealPlanProfile(),
      loadHealthLogs(),
      loadRoutine(),
      loadManual(),
      loadPrograms(adminId),
      loadPartners(adminId),
      loadMedicalPartners(adminId),
      loadPartnerUsages(),
      loadCoaches(adminId),
      loadCoachSchedules(adminId),
      loadNotices(adminId),
      loadInquiries(),
      loadMemberLevel(loadedMember),
      loadMemberXpLogs(loadedMember),
      loadMemberLevelSettings(adminId),
      loadMemberLevelRanking(adminId),
      loadMemberXpSettings(adminId),
    ])

    await loadMemberStats()
  } catch (error) {
    console.error('loadAll 전체 오류:', error)
    setMessage(error?.message || '데이터 불러오기 중 오류가 발생했습니다.')
  } finally {
    setLoading(false)
  }
}

  const loadMemberInfo = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*, programs(id, name, price, session_count, description, is_vip, is_active)')
      .eq('id', member.id)
      .maybeSingle()

    if (error) throw error

    if (data) {
      setMemberInfo(data)
      setCurrentProgram(data.programs || null)
      localStorage.setItem(
        'hiddencare_member_session_v1',
        JSON.stringify({
          member: data,
          accessCode,
        }),
      )
    }

    return data || null
  }

const loadExercises = async (adminIdParam = null) => {
  const adminId = adminIdParam || currentAdminId || memberInfo?.admin_id || member?.admin_id || null

  if (!adminId) {
    setExercises([])
    return
  }

  const { data, error } = await supabase
    .from('exercises')
    .select('*, brands(id, name)')
    .eq('admin_id', adminId)
    .order('created_at', { ascending: false })

  console.log('loadExercises adminId:', adminId)
  console.log('loadExercises error:', error)
  console.log('loadExercises data:', data)

  if (error) {
    console.error('운동DB 불러오기 실패:', error)
    setExercises([])
    return
  }

  setExercises(data || [])
}

  const loadWorkouts = async () => {
    const { data: workoutData } = await supabase
      .from('workouts')
      .select('*')
      .eq('member_id', member.id)
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
      .eq('member_id', member.id)
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
const loadMemberLevel = async (targetMember = null) => {
  const memberId = targetMember?.id || member?.id

if (!memberId) {
  setMemberLevel(null)
  return
}

  const { data, error } = await supabase
    .from('member_levels')
    .select('*')
   .eq('member_id', memberId)
    .maybeSingle()

  if (error) {
    console.error('member_levels 불러오기 실패:', error)
    return
  }

  setMemberLevel(data || null)
}

const loadMemberXpLogs = async (targetMember = null) => {
  const memberId = targetMember?.id || member?.id

if (!memberId) {
  setMemberXpLogs([])
  return
}

  const { data, error } = await supabase
    .from('member_xp_logs')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('member_xp_logs 불러오기 실패:', error)
    return
  }

  setMemberXpLogs(data || [])
}

const loadMemberLevelSettings = async (targetAdminId = null) => {
  const adminId = targetAdminId || currentAdminId || memberInfo?.admin_id || member?.admin_id || null

  if (!adminId) {
    setMemberLevelSettings([])
    return
  }

  const { data, error } = await supabase
    .from('member_level_settings')
    .select('*')
    .eq('admin_id', adminId)
    .eq('is_active', true)
    .order('level_no', { ascending: true })

  if (error) {
    console.error('member_level_settings 불러오기 실패:', error)
    return
  }

  setMemberLevelSettings(data || [])
}

const loadMemberLevelRanking = async (targetAdminId = null) => {
  const adminId = targetAdminId || currentAdminId || memberInfo?.admin_id || member?.admin_id || null

  if (!adminId) {
    setMemberLevelRanking([])
    return
  }

  const { data, error } = await supabase
    .from('member_levels')
    .select('*, members(id, name)')
    .eq('admin_id', adminId)
    .order('total_xp', { ascending: false })
    

  if (error) {
    console.error('member_levels 랭킹 불러오기 실패:', error)
    return
  }

  setMemberLevelRanking(data || [])
}
  const loadMemberXpSettings = async (targetAdminId = null) => {
  const adminId = targetAdminId || currentAdminId || memberInfo?.admin_id || member?.admin_id || null

  if (!adminId) {
    setMemberXpSettings([])
    return
  }

  const { data, error } = await supabase
    .from('member_xp_settings')
    .select('*')
    .eq('admin_id', adminId)
    .eq('is_active', true)
    .order('xp', { ascending: false })

  if (error) {
    console.error('member_xp_settings 불러오기 실패:', error)
    return
  }

  setMemberXpSettings(data || [])
}
  const loadHealthLogs = async () => {
    const { data } = await supabase
      .from('member_health_logs')
      .select('*')
      .eq('member_id', member.id)
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      const collapsed = {}
      data.forEach((item) => {
        collapsed[item.id] = true
      })
      setHealthLogs(data)
      setCollapsedHealthLogs(collapsed)
    }
  }
  const loadMealPlanProfile = async () => {
  const { data, error } = await supabase
    .from('member_nutrition_profiles')
    .select('*')
    .eq('member_id', member.id)
    .maybeSingle()

  if (error) {
    console.error('회원 식단 프로필 불러오기 실패:', error)
    return
  }

  setMealPlanProfile(data || null)
}
const loadMealPlans = async () => {
  const [year, month] = String(mealPlanMonth || '').split('-').map(Number)

  if (!year || !month) {
    setMealPlans([])
    return
  }

  const lastDay = new Date(year, month, 0).getDate()

  const { data, error } = await supabase
    .from('member_meal_plans')
    .select('*')
    .eq('member_id', member.id)
    .gte('plan_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lte('plan_date', `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`)
    .order('plan_date', { ascending: true })

  if (error) {
    console.error('회원 식단 플랜 불러오기 실패:', error)
    return
  }

  const collapsed = {}
  ;(data || []).forEach((item) => {
    collapsed[item.id] = true
  })

  setMealPlans(data || [])
  setCollapsedMealPlans(collapsed)
}
 const loadRoutine = async () => {
  const { data } = await supabase
    .from('member_routines')
    .select('*')
    .eq('member_id', member.id)
    .maybeSingle()

  const nextRoutine = data ? normalizeRoutineData(data) : null
  setRoutine(nextRoutine)
  setSelectedRoutineWeek(0)
}

  const loadManual = async () => {
    const { data } = await supabase
      .from('app_manuals')
      .select('*')
      .eq('target_role', 'member')
      .maybeSingle()

    setManual(data || null)
  }

  const loadPrograms = async (adminIdParam = null) => {
    const adminId = adminIdParam || currentAdminId || member?.admin_id || null

    if (!adminId) {
      setPrograms([])
      return
    }

    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('admin_id', adminId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (data) setPrograms(data)
  }
  const loadPartners = async (adminIdParam = null) => {
    const adminId = adminIdParam || currentAdminId || member?.admin_id || null

    if (!adminId) {
      setPartners([])
      setSelectedPartnerId('')
      return
    }

    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('admin_id', adminId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('제휴업체 불러오기 실패:', error)
      setMessage(`제휴업체 불러오기 실패: ${error.message}`)
      return
    }

    const rows = data || []
    setPartners(rows)

    if (!selectedPartnerId && rows[0]) {
      setSelectedPartnerId(rows[0].id)
    }
  }
  const loadMedicalPartners = async (adminIdParam = null) => {
    const adminId = adminIdParam || currentAdminId || member?.admin_id || null

    if (!adminId) {
      setMedicalPartners([])
      setSelectedMedicalPartnerId('')
      return
    }

    const { data, error } = await supabase
      .from('medical_partners')
      .select('*')
      .eq('admin_id', adminId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('병의원·약국 소개 불러오기 실패:', error)
      setMessage(`병의원·약국 소개 불러오기 실패: ${error.message}`)
      return
    }

    const rows = data || []
    setMedicalPartners(rows)

    if (!selectedMedicalPartnerId && rows[0]) {
      setSelectedMedicalPartnerId(rows[0].id)
    }
  }
  const loadPartnerUsages = async () => {
    const { data, error } = await supabase
      .from('partner_usage')
      .select('*')
      .eq('member_id', member.id)
      .order('requested_at', { ascending: false })

    if (error) {
      console.error('제휴 사용기록 불러오기 실패:', error)
      setMessage(`제휴 사용기록 불러오기 실패: ${error.message}`)
      return
    }

    setPartnerUsages(data || [])
  }
  const loadCoaches = async (adminIdParam = null) => {
    const adminId = adminIdParam || currentAdminId || member?.admin_id || null

    if (!adminId) {
      setCoaches([])
      return
    }

    const { data } = await supabase
      .from('coaches')
      .select('*')
      .eq('admin_id', adminId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (data) setCoaches(data)
  }

  const loadCoachSchedules = async (adminIdParam = null) => {
    const adminId = adminIdParam || currentAdminId || member?.admin_id || null

    if (!adminId) {
      setCoachSchedules([])
      setCoachScheduleSlotsMap({})
      return
    }

    const { data: scheduleData } = await supabase
      .from('coach_schedules')
      .select('*')
      .eq('admin_id', adminId)
      .order('schedule_date', { ascending: false })

    if (!scheduleData) return

    let slotMap = {}
    const scheduleIds = scheduleData.map((schedule) => schedule.id)

    if (scheduleIds.length > 0) {
      const { data: slotData } = await supabase
        .from('coach_schedule_slots')
        .select('*')
        .in('schedule_id', scheduleIds)
        .order('slot_time', { ascending: true })

      slotMap = (slotData || []).reduce((acc, slot) => {
        if (!acc[slot.schedule_id]) acc[slot.schedule_id] = []
        acc[slot.schedule_id].push(slot)
        return acc
      }, {})
    }

    const collapsed = {}
    scheduleData.forEach((schedule) => {
      collapsed[schedule.id] = true
    })

    setCoachSchedules(scheduleData)
    setCoachScheduleSlotsMap(slotMap)
    setCollapsedSchedules(collapsed)
  }

  const loadNotices = async (adminIdParam = null) => {
    const adminId = adminIdParam || currentAdminId || member?.admin_id || null

    if (!adminId) {
      setNotices([])
      return
    }

    const { data } = await supabase
      .from('notices')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })

    if (data) {
      const collapsed = {}
      data.forEach((notice) => {
        collapsed[notice.id] = true
      })
      setNotices(data)
      setCollapsedNotices(collapsed)
    }
  }

  const loadInquiries = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })

    if (data) {
      const collapsed = {}
      data.forEach((item) => {
        collapsed[item.id] = true
      })
      setInquiries(data)
      setCollapsedInquiries(collapsed)
    }
  }
const updateMemberAlertSetting = (key, value) => {
  setMemberAlertSettings((prev) => {
    const next = { ...prev, [key]: value }
    localStorage.setItem(`member_alert_settings_${member?.id || 'default'}`, JSON.stringify(next))
    return next
  })
}

const removeMemberAlert = (alertId) => {
  setMemberAlerts((prev) => prev.filter((item) => item.id !== alertId))
}

const clearMemberAlerts = () => {
  setMemberAlerts([])
  setUnreadMemberNoticeCount(0)
  setUnreadMemberInquiryCount(0)
  setUnreadMemberWorkoutCount(0)
}
  const resetPersonalForm = () => {
    setPersonalForm(emptyPersonalForm)
  }

  const resetDietForm = () => {
    setDietForm(emptyDietForm)
  }

  const resetHealthForm = () => {
    setHealthForm(emptyHealthForm)
  }

  const resetInquiryForm = () => {
    setInquiryForm({
      name: memberInfo?.name || '',
      phone: '',
      content: '',
      is_private: false,
    })
  }

const addPainLog = () => {
  setPersonalForm((prev) => ({
    ...prev,
    pain_enabled: true,
    pain_logs: [...(prev.pain_logs || []), { ...emptyPainLog }],
  }))
}

const updatePainLog = (index, field, value) => {
  setPersonalForm((prev) => {
    const nextPainLogs = [...(prev.pain_logs || [])]

    nextPainLogs[index] = {
      ...(nextPainLogs[index] || { ...emptyPainLog }),
      [field]: value,
    }

    return {
      ...prev,
      pain_logs: nextPainLogs,
    }
  })
}

const updatePainLogValue = (index, field, value) => {
  updatePainLog(index, field, value)
}
  
const removePainLog = (index) => {
  setPersonalForm((prev) => {
    const currentPainLogs = [...(prev.pain_logs || [])]
    const nextPainLogs = currentPainLogs.filter((_, idx) => idx !== index)

    return {
      ...prev,
      pain_logs: nextPainLogs.length > 0 ? nextPainLogs : [{ ...emptyPainLog }],
      pain_enabled: nextPainLogs.length > 0 ? prev.pain_enabled : false,
    }
  })
}

  
  const updatePersonalItemField = (itemIndex, field, value) => {
  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    nextItems[itemIndex] = {
      ...nextItems[itemIndex],
      [field]: value,
    }
    return { ...prev, items: nextItems }
  })
}

const updatePersonalEntryType = (itemIndex, entryType) => {
  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]
    const isPainOnly = entryType === 'pain_only'

    nextItems[itemIndex] = {
      ...currentItem,
      entry_type: entryType,
      is_cardio: entryType === 'cardio',
      cardio_minutes: entryType === 'cardio' ? currentItem.cardio_minutes || '' : '',
      care_minutes: entryType === 'care' ? currentItem.care_minutes || '' : '',
      stretch_minutes: entryType === 'stretching' ? currentItem.stretch_minutes || '' : '',
      stretch_reps: entryType === 'stretching' ? currentItem.stretch_reps || '' : '',
      training_method: entryType === 'strength' ? currentItem.training_method || 'normal' : 'normal',
      sets:
        entryType === 'strength'
          ? currentItem.sets?.length
            ? currentItem.sets
            : [createEmptyPersonalSet()]
          : [createEmptyPersonalSet()],
      sub_exercises:
        entryType === 'strength' && currentItem.training_method === 'superset'
          ? currentItem.sub_exercises?.length
            ? currentItem.sub_exercises
            : [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()]
          : [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()],
      exercise_id: isPainOnly ? '' : currentItem.exercise_id,
      exercise_name_snapshot: isPainOnly ? '' : currentItem.exercise_name_snapshot,
      equipment_name_snapshot: isPainOnly ? '' : currentItem.equipment_name_snapshot,
      performed_name: isPainOnly ? '' : currentItem.performed_name,
      method_note: isPainOnly ? '' : currentItem.method_note,
    }

    return {
      ...prev,
      pain_enabled: isPainOnly ? true : prev.pain_enabled,
      pain_logs:
        isPainOnly
          ? (prev.pain_logs?.length ? prev.pain_logs : [{ ...emptyPainLog }])
          : prev.pain_logs,
      items: nextItems,
    }
  })
}
const updatePersonalTrainingMethod = (itemIndex, method) => {
  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

    nextItems[itemIndex] = {
      ...currentItem,
      training_method: method,
      sets: currentItem.sets?.length ? currentItem.sets : [createEmptyPersonalSet()],
      sub_exercises:
        method === 'superset'
          ? currentItem.sub_exercises?.length
            ? currentItem.sub_exercises
            : [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()]
          : [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()],
    }

    return { ...prev, items: nextItems }
  })
}

const updatePersonalItemSelect = (itemIndex, exerciseId) => {
  const found = exercises.find((exercise) => String(exercise.id) === String(exerciseId))

  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

   nextItems[itemIndex] = {
  ...currentItem,
  exercise_id: found?.id || '',
  exercise_name_snapshot: found?.name || '',
  equipment_name_snapshot: found?.name || '',
  performed_name: currentItem.performed_name || found?.name || '',
  exercise_search: '',
}

    return { ...prev, items: nextItems }
  })
}

const updatePersonalItemName = (itemIndex, value) => {
  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    nextItems[itemIndex] = {
      ...nextItems[itemIndex],
      performed_name: value,
    }
    return { ...prev, items: nextItems }
  })
}

const updatePersonalSubExerciseSelect = (itemIndex, subIndex, exerciseId) => {
  const found = exercises.find((exercise) => String(exercise.id) === String(exerciseId))

  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]
    const nextSubs = [...(currentItem.sub_exercises || [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()])]

   nextSubs[subIndex] = {
  ...nextSubs[subIndex],
  exercise_id: found?.id || '',
  exercise_name_snapshot: found?.name || '',
  equipment_name_snapshot: found?.name || '',
  performed_name: nextSubs[subIndex].performed_name || found?.name || '',
  exercise_search: '',
}

    nextItems[itemIndex] = {
      ...currentItem,
      sub_exercises: nextSubs,
    }

    return { ...prev, items: nextItems }
  })
}

const updatePersonalSubExerciseName = (itemIndex, subIndex, value) => {
  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]
    const nextSubs = [...(currentItem.sub_exercises || [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()])]

    nextSubs[subIndex] = {
      ...nextSubs[subIndex],
      performed_name: value,
    }

    nextItems[itemIndex] = {
      ...currentItem,
      sub_exercises: nextSubs,
    }

    return { ...prev, items: nextItems }
  })
}



const addPersonalItem = () => {
  setPersonalForm((prev) => ({
    ...prev,
    items: [
      ...prev.items,
      {
        ...emptyPersonalItem,
        sub_exercises: [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()],
      },
    ],
  }))
}

const removePersonalItem = (itemIndex) => {
  setPersonalForm((prev) => ({
    ...prev,
    items:
      prev.items.length === 1
        ? [{ ...emptyPersonalItem, sub_exercises: [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()] }]
        : prev.items.filter((_, idx) => idx !== itemIndex),
  }))
}

const addSet = (itemIndex, subIndex = null) => {
  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

    if (currentItem.training_method === 'superset' && subIndex !== null) {
      const nextSubs = [...currentItem.sub_exercises]
      nextSubs[subIndex] = {
        ...nextSubs[subIndex],
        sets: [...(nextSubs[subIndex].sets || []), createEmptyPersonalSet()],
      }

      nextItems[itemIndex] = {
        ...currentItem,
        sub_exercises: nextSubs,
      }
    } else {
      nextItems[itemIndex] = {
        ...currentItem,
        sets: [...(currentItem.sets || []), createEmptyPersonalSet()],
      }
    }

    return { ...prev, items: nextItems }
  })
}

const removeSet = (itemIndex, setIndex, subIndex = null) => {
  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

    if (currentItem.training_method === 'superset' && subIndex !== null) {
      const nextSubs = [...currentItem.sub_exercises]
      const currentSets = nextSubs[subIndex].sets || [createEmptyPersonalSet()]

      nextSubs[subIndex] = {
        ...nextSubs[subIndex],
        sets:
          currentSets.length === 1
            ? [createEmptyPersonalSet()]
            : currentSets.filter((_, idx) => idx !== setIndex),
      }

      nextItems[itemIndex] = {
        ...currentItem,
        sub_exercises: nextSubs,
      }
    } else {
      const currentSets = currentItem.sets || [createEmptyPersonalSet()]
      nextItems[itemIndex] = {
        ...currentItem,
        sets:
          currentSets.length === 1
            ? [createEmptyPersonalSet()]
            : currentSets.filter((_, idx) => idx !== setIndex),
      }
    }

    return { ...prev, items: nextItems }
  })
}

const updateSetValue = (itemIndex, setIndex, field, value, subIndex = null) => {
  setPersonalForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

    if (currentItem.training_method === 'superset' && subIndex !== null) {
      const nextSubs = [...currentItem.sub_exercises]
      const nextSets = [...(nextSubs[subIndex].sets || [])]

      nextSets[setIndex] = {
        ...nextSets[setIndex],
        [field]: value,
      }

      nextSubs[subIndex] = {
        ...nextSubs[subIndex],
        sets: nextSets,
      }

      nextItems[itemIndex] = {
        ...currentItem,
        sub_exercises: nextSubs,
      }
    } else {
      const nextSets = [...(currentItem.sets || [])]
      nextSets[setIndex] = {
        ...nextSets[setIndex],
        [field]: value,
      }

      nextItems[itemIndex] = {
        ...currentItem,
        sets: nextSets,
      }
    }

    return { ...prev, items: nextItems }
  })
}

const handlePersonalSubmit = async (e) => {
  e.preventDefault()

  const hasPainOnlyItem = personalForm.items.some((item) => item.entry_type === 'pain_only')

  const cleanedItems = personalForm.items
    .filter((item) => {
      if (item.entry_type === 'pain_only') return false
      if (item.entry_type === 'cardio') {
        return (item.performed_name || item.equipment_name_snapshot || '').trim()
      }
      if (item.entry_type === 'care') {
        return (item.performed_name || item.equipment_name_snapshot || '').trim()
      }
      if (item.entry_type === 'stretching') {
        return (item.performed_name || item.equipment_name_snapshot || '').trim()
      }
      if (item.training_method === 'superset') {
        return (item.sub_exercises || []).some(
          (sub) =>
            (sub.performed_name || sub.exercise_name_snapshot || sub.equipment_name_snapshot || '').trim(),
        )
      }
      return (item.performed_name || item.exercise_name_snapshot || item.equipment_name_snapshot || '').trim()
    })
    .map((item, index) => ({
      exercise_id: item.exercise_id || null,
      exercise_name_snapshot:
        item.training_method === 'superset'
          ? ''
          : (item.performed_name || item.exercise_name_snapshot || item.equipment_name_snapshot || '').trim(),
      equipment_name_snapshot: item.equipment_name_snapshot?.trim() || '',
      performed_name: item.performed_name?.trim() || '',
      sort_order: index,
      entry_type: item.entry_type || 'strength',
      is_cardio: item.entry_type === 'cardio',
      cardio_minutes: item.entry_type === 'cardio' ? Number(item.cardio_minutes || 0) : null,
      care_minutes: item.entry_type === 'care' ? Number(item.care_minutes || 0) : null,
      stretch_minutes: item.entry_type === 'stretching' ? Number(item.stretch_minutes || 0) : null,
      stretch_reps: item.entry_type === 'stretching' ? Number(item.stretch_reps || 0) : null,
      sets: item.entry_type === 'strength' ? normalizeSets(item.sets || []) : [],
      training_method: item.entry_type === 'strength' ? item.training_method || 'normal' : 'normal',
      method_note: item.method_note?.trim() || '',
      sub_exercises:
        item.entry_type === 'strength' && item.training_method === 'superset'
          ? (item.sub_exercises || [])
              .filter(
                (sub) =>
                  (sub.performed_name || sub.exercise_name_snapshot || sub.equipment_name_snapshot || '').trim(),
              )
              .map((sub) => ({
                exercise_id: sub.exercise_id || null,
                exercise_name_snapshot:
                  (sub.performed_name || sub.exercise_name_snapshot || sub.equipment_name_snapshot || '').trim(),
                equipment_name_snapshot: sub.equipment_name_snapshot?.trim() || '',
                performed_name: sub.performed_name?.trim() || '',
                sets: normalizeSets(sub.sets || []),
              }))
          : [],
    }))

  if (
    cleanedItems.length === 0 &&
    !(personalForm.pain_enabled && (personalForm.pain_logs || []).length > 0) &&
    !hasPainOnlyItem
  ) {
    setMessage('최소 1개의 운동 또는 통증기록을 입력해주세요.')
    return
  }

  const cleanedPainLogs = personalForm.pain_enabled
    ? (personalForm.pain_logs || [])
        .filter(
          (log) =>
            log?.body_part?.trim() ||
            log?.movement_name?.trim() ||
            log?.pain_timing?.trim() ||
            String(log?.pain_score ?? '').trim() ||
            log?.pain_note?.trim(),
        )
        .map((log) => ({
          pain_type: log?.pain_type || '운동중',
          body_part: log?.body_part?.trim() || '',
          movement_name: log?.movement_name?.trim() || '',
          pain_timing: log?.pain_timing?.trim() || '',
          pain_score:
            log?.pain_score === '' || log?.pain_score === null || log?.pain_score === undefined
              ? null
              : Number(log.pain_score),
          pain_note: log?.pain_note?.trim() || '',
        }))
    : []

  const payload = {
    member_id: member.id,
    workout_date: personalForm.workout_date,
    workout_type: 'personal',
    good: personalForm.good?.trim() || '',
    improve: personalForm.improve?.trim() || '',
    pain_enabled: !!personalForm.pain_enabled,
    pain_logs: cleanedPainLogs,
    created_by: null,
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  try {
    let workoutId = personalForm.id

    if (personalForm.id) {
      const { error: updateError } = await supabase
        .from('workouts')
        .update(payload)
        .eq('id', personalForm.id)

      if (updateError) {
        console.error('개인운동 수정 실패:', updateError)
        setMessage(`개인운동 수정 실패: ${updateError.message}`)
        return
      }

      const { error: deleteItemsError } = await supabase
        .from('workout_items')
        .delete()
        .eq('workout_id', personalForm.id)

      if (deleteItemsError) {
        console.error('기존 운동 상세 삭제 실패:', deleteItemsError)
        setMessage(`기존 운동 상세 삭제 실패: ${deleteItemsError.message}`)
        return
      }
    } else {
      const { data: insertedWorkout, error: insertError } = await supabase
        .from('workouts')
        .insert(payload)
        .select()
        .single()

      if (insertError) {
        console.error('개인운동 저장 실패:', insertError)
        setMessage(`개인운동 저장 실패: ${insertError.message}`)
        return
      }

      if (!insertedWorkout?.id) {
        console.error('개인운동 저장 실패: workout id 없음', insertedWorkout)
        setMessage('개인운동 저장에 실패했습니다. 다시 시도해주세요.')
        return
      }

      workoutId = insertedWorkout.id
    }

    if (cleanedItems.length > 0) {
      const { error: insertItemsError } = await supabase
        .from('workout_items')
        .insert(
          cleanedItems.map((item) => ({
            ...item,
            workout_id: workoutId,
            admin_id: currentAdminId || null,
            gym_id: currentGymId || null,
          })),
        )

      if (insertItemsError) {
        console.error('운동 상세 저장 실패:', insertItemsError)
        setMessage(`운동 상세 저장 실패: ${insertItemsError.message}`)
        return
      }
    }

    if (!personalForm.id) {
      try {
        await applyMemberXp({
          memberId: member.id,
          sourceType: 'personal_workout',
          sourceId: workoutId,
          sourceDate: personalForm.workout_date,
          note: '회원 개인운동 입력',
        })
      } catch (xpError) {
        console.error('개인운동 XP 처리 실패:', xpError)
      }
    }

    setMessage(personalForm.id ? '개인운동이 수정되었습니다.' : '개인운동이 저장되었습니다.')
    resetPersonalForm()
    await loadWorkouts()
    setActiveTab('운동기록')
  } catch (error) {
    console.error('handlePersonalSubmit 오류:', error)
    setMessage(error instanceof Error ? error.message : '개인운동 저장 중 오류가 발생했습니다.')
  }
}

  const handlePersonalEdit = (workout) => {
  const items = workoutItemsMap[workout.id] || []

  setPersonalForm({
    id: workout.id,
    workout_date: workout.workout_date,
    good: workout.good || '',
    improve: workout.improve || '',
    pain_enabled: !!workout.pain_enabled,
    pain_logs:
      Array.isArray(workout.pain_logs) && workout.pain_logs.length > 0
        ? workout.pain_logs.map((log) => ({
            pain_type: log?.pain_type || '운동중',
            body_part: log?.body_part || '',
            movement_name: log?.movement_name || '',
            pain_timing: log?.pain_timing || '',
            pain_score: log?.pain_score ?? '',
            pain_note: log?.pain_note || '',
          }))
        : [{ ...emptyPainLog }],
   items:
  items.length > 0
    ? items.map((item) => ({
        exercise_id: item.exercise_id || '',
        exercise_name_snapshot: item.exercise_name_snapshot || '',
        equipment_name_snapshot: item.equipment_name_snapshot || item.exercise_name_snapshot || '',
        performed_name: item.performed_name || item.exercise_name_snapshot || '',
        exercise_search: '',
        entry_type: item.entry_type || (item.is_cardio ? 'cardio' : 'strength'),
            cardio_minutes: item.cardio_minutes || '',
            care_minutes: item.care_minutes || '',
            sets:
              item.entry_type !== 'cardio' &&
              item.entry_type !== 'care' &&
              Array.isArray(item.sets) &&
              item.sets.length > 0
                ? item.sets
                : [createEmptyPersonalSet()],
            training_method: item.training_method || 'normal',
            method_note: item.method_note || '',
            sub_exercises:
  item.training_method === 'superset' && Array.isArray(item.sub_exercises) && item.sub_exercises.length > 0
    ? item.sub_exercises.map((sub) => ({
        exercise_id: sub.exercise_id || '',
        exercise_name_snapshot: sub.exercise_name_snapshot || '',
        equipment_name_snapshot: sub.equipment_name_snapshot || sub.exercise_name_snapshot || '',
        performed_name: sub.performed_name || sub.exercise_name_snapshot || '',
        exercise_search: '',
        sets:
          Array.isArray(sub.sets) && sub.sets.length > 0
            ? sub.sets
            : [createEmptyPersonalSet()],
      }))
                : [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()],
            collapsed: false,
          }))
        : [{ ...emptyPersonalItem, sub_exercises: [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()] }],
  })

  setActiveTab('개인운동입력')
}

  const handlePersonalDelete = async (workoutId) => {
    if (!window.confirm('개인운동 기록을 삭제할까요?')) return
    await supabase.from('workouts').delete().eq('id', workoutId)
    await loadWorkouts()
    setMessage('개인운동 기록이 삭제되었습니다.')
  }

  const handleDietSubmit = async (e) => {
  e.preventDefault()

  const payload = {
    member_id: member.id,
    log_date: dietForm.log_date,
    meal_type: dietForm.meal_type?.trim() || '아침',
    meal_time: dietForm.meal_time || null,
    content: dietForm.content?.trim() || '',
    carb_g: Number(dietForm.carb_g) || 0,
    protein_g: Number(dietForm.protein_g) || 0,
    fat_g: Number(dietForm.fat_g) || 0,
    product_brand: dietForm.product_brand?.trim() || '',
    product_name: dietForm.product_name?.trim() || '',
    meal_category: dietForm.meal_category?.trim() || '일반식',
    hunger_level: Number(dietForm.hunger_level) || 0,
    member_note: dietForm.member_note?.trim() || '',
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  if (!payload.content) {
    setMessage('식단 내용을 입력해주세요.')
    return
  }

  try {
    if (dietForm.id) {
      const { error: updateError } = await supabase
        .from('diet_logs')
        .update(payload)
        .eq('id', dietForm.id)

      if (updateError) {
        setMessage(`식단 수정 실패: ${updateError.message}`)
        return
      }

      setMessage('식단이 수정되었습니다.')
    } else {
      const { data, error } = await supabase
        .from('diet_logs')
        .insert(payload)
        .select()
        .single()

      if (error) {
        setMessage(`식단 저장 실패: ${error.message}`)
        return
      }

      try {
        await applyMemberXp({
          memberId: member.id,
          sourceType: 'diet',
          sourceId: data.id,
          sourceDate: dietForm.log_date,
          note: '회원 식단 입력',
        })
      } catch (xpError) {
        console.error('식단 XP 처리 실패:', xpError)
      }

      setMessage('식단이 저장되었습니다.')
    }

    resetDietForm()
    await loadDietLogs()
  } catch (error) {
    console.error('handleDietSubmit 오류:', error)
    setMessage(error instanceof Error ? error.message : '식단 저장 중 오류가 발생했습니다.')
  }
}
  const handleDietEdit = (diet) => {
    setDietForm({
      id: diet.id,
      log_date: diet.log_date || new Date().toISOString().slice(0, 10),
      meal_type: diet.meal_type || '아침',
      meal_time: diet.meal_time || '',
      content: diet.content || '',
      carb_g: diet.carb_g || '',
      protein_g: diet.protein_g || '',
      fat_g: diet.fat_g || '',
      product_brand: diet.product_brand || '',
      product_name: diet.product_name || '',
      meal_category: diet.meal_category || '일반식',
      hunger_level: diet.hunger_level || 0,
      member_note: diet.member_note || '',
    })
    setActiveTab('식단')
  }

  const handleDietDelete = async (dietId) => {
    if (!window.confirm('식단 기록을 삭제할까요?')) return
    await supabase.from('diet_logs').delete().eq('id', dietId)
    await loadDietLogs()
    setMessage('식단 기록이 삭제되었습니다.')
  }
const getWeekKey = (dateString) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''

  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = temp.getUTCDay() || 7
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7)

  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

const applyMemberXp = async ({
  memberId,
  sourceType,
  sourceId,
  sourceDate,
  note = '',
  forceXp = null,
}) => {
  if (!memberId || !sourceType || !sourceDate) return { ok: false, reason: 'missing_required' }

  const adminId = currentAdminId || memberInfo?.admin_id || member?.admin_id || null
  const gymId = currentGymId || memberInfo?.gym_id || member?.gym_id || null

  const { data: ruleRows, error: ruleError } = await supabase
    .from('member_xp_settings')
    .select('*')
    .eq('admin_id', adminId)
    .eq('rule_code', sourceType)
    .eq('is_active', true)

  if (ruleError) {
    console.error('member_xp_settings 조회 실패:', ruleError)
    return { ok: false, reason: 'rule_fetch_failed', error: ruleError }
  }

  const rule = (ruleRows || [])[0] || null

  if (!rule && forceXp === null) {
    return { ok: false, reason: 'rule_not_found' }
  }

  const xpValue = forceXp !== null ? Number(forceXp || 0) : Number(rule?.xp || 0)
  if (xpValue <= 0) return { ok: false, reason: 'invalid_xp' }

  const weekKey = getWeekKey(sourceDate)
  const monthKey = String(sourceDate).slice(0, 7)

  if (sourceId) {
    const { data: existingLog } = await supabase
      .from('member_xp_logs')
      .select('id')
      .eq('member_id', memberId)
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .maybeSingle()

    if (existingLog?.id) {
      return { ok: false, reason: 'already_exists' }
    }
  }

  if (rule && Number(rule.daily_limit || 0) > 0) {
    const { count } = await supabase
      .from('member_xp_logs')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('source_type', sourceType)
      .eq('source_date', sourceDate)

    if (Number(count || 0) >= Number(rule.daily_limit || 0)) {
      return { ok: false, reason: 'daily_limit_reached' }
    }
  }

  const { error: insertLogError } = await supabase.from('member_xp_logs').insert({
    member_id: memberId,
    admin_id: adminId,
    gym_id: gymId,
    source_type: sourceType,
    source_id: sourceId || null,
    source_date: sourceDate,
    week_key: weekKey,
    month_key: monthKey,
    xp: xpValue,
    note,
    is_valid: true,
  })

  if (insertLogError) {
    console.error('member_xp_logs insert 실패:', insertLogError)
    return { ok: false, reason: 'log_insert_failed', error: insertLogError }
  }

  const { data: currentLevelRow, error: levelFetchError } = await supabase
    .from('member_levels')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle()

  if (levelFetchError) {
    console.error('member_levels 조회 실패:', levelFetchError)
    return { ok: false, reason: 'level_fetch_failed', error: levelFetchError }
  }

  const nextTotalXp = Number(currentLevelRow?.total_xp || 0) + xpValue
  const nextWeeklyScore = Number(currentLevelRow?.weekly_score || 0) + xpValue
  const nextMonthlyScore = Number(currentLevelRow?.monthly_score || 0) + xpValue

  const { data: levelRows, error: levelSettingError } = await supabase
    .from('member_level_settings')
    .select('*')
    .eq('admin_id', adminId)
    .eq('is_active', true)
    .order('min_xp', { ascending: true })

  if (levelSettingError) {
    console.error('member_level_settings 조회 실패:', levelSettingError)
    return { ok: false, reason: 'level_setting_fetch_failed', error: levelSettingError }
  }

  const matchedLevel =
    (levelRows || [])
      .filter((item) => nextTotalXp >= Number(item.min_xp || 0))
      .slice(-1)[0] || null

  const { error: levelUpdateError } = await supabase
  .from('member_levels')
  .upsert(
    {
      member_id: memberId,
      admin_id: adminId,
      gym_id: gymId,
      total_xp: nextTotalXp,
      weekly_score: nextWeeklyScore,
      monthly_score: nextMonthlyScore,
      level_no: Number(matchedLevel?.level_no || currentLevelRow?.level_no || 1),
      level_key: matchedLevel?.level_key || currentLevelRow?.level_key || 'hidden_green_1',
      level_name: matchedLevel?.level_name || currentLevelRow?.level_name || '히든 그린 Ⅰ',
      streak_days: Number(currentLevelRow?.streak_days || 0),
      last_activity_date: sourceDate,
      last_xp_applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'member_id' },
  )

if (levelUpdateError) {
  console.error('member_levels 업데이트 실패:', levelUpdateError)
  return { ok: false, reason: 'level_update_failed', error: levelUpdateError }
}

return { ok: true, xp: xpValue }
}
  const handleHealthSubmit = async (e) => {
  e.preventDefault()

  const finalBmr = calcBmr({
    sex: healthForm.sex,
    age: healthForm.age,
    heightCm: healthForm.height_cm,
    weightKg: healthForm.weight_kg,
    manualBmr: healthForm.bmr,
  })

  const finalRecommendedKcal = calcRecommendedKcal({
    bmr: finalBmr,
    activityFactor: healthForm.activity_factor,
  })

  const payload = {
    member_id: member.id,
    record_date: healthForm.record_date,
    sex: healthForm.sex || null,
    age: Number(healthForm.age) || null,
    height_cm: Number(healthForm.height_cm) || null,
    weight_kg: Number(healthForm.weight_kg) || null,
    body_fat_percent: Number(healthForm.body_fat_percent) || null,
    skeletal_muscle_mass: Number(healthForm.skeletal_muscle_mass) || null,
    body_fat_mass: Number(healthForm.body_fat_mass) || null,
    visceral_fat_level: Number(healthForm.visceral_fat_level) || null,
    visceral_fat_area: Number(healthForm.visceral_fat_area) || null,
    whr: Number(healthForm.whr) || null,
    bmr: finalBmr ? Number(finalBmr) : null,
    activity_factor: Number(healthForm.activity_factor) || null,
    recommended_kcal: finalRecommendedKcal ? Number(finalRecommendedKcal) : null,
    inbody_score: Number(healthForm.inbody_score) || null,
    medical_history: healthForm.medical_history?.trim() || '',
    member_note: healthForm.member_note?.trim() || '',
    inbody_image_url: healthForm.inbody_image_url?.trim() || '',
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  if (healthForm.id) {
    await supabase.from('member_health_logs').update(payload).eq('id', healthForm.id)
    setMessage('건강정보가 수정되었습니다.')
  } else {
    await supabase.from('member_health_logs').insert(payload)
    setMessage('건강정보가 저장되었습니다.')
  }

  resetHealthForm()
  await loadHealthLogs()
}

  const handleHealthEdit = (health) => {
  setHealthForm({
    id: health.id,
    record_date: health.record_date || new Date().toISOString().slice(0, 10),
    sex: health.sex || 'male',
    age: health.age || '',
    height_cm: health.height_cm || '',
    weight_kg: health.weight_kg || '',
    body_fat_percent: health.body_fat_percent || '',
    skeletal_muscle_mass: health.skeletal_muscle_mass || '',
    body_fat_mass: health.body_fat_mass || '',
    visceral_fat_level: health.visceral_fat_level || '',
    visceral_fat_area: health.visceral_fat_area || '',
    whr: health.whr || '',
    bmr: health.bmr || '',
    activity_factor: health.activity_factor || '1.375',
    recommended_kcal: health.recommended_kcal || '',
    inbody_score: health.inbody_score || '',
    medical_history: health.medical_history || '',
    member_note: health.member_note || '',
    inbody_image_url: health.inbody_image_url || '',
  })
  setActiveTab('건강정보')
}
  const handleHealthDelete = async (healthId) => {
    if (!window.confirm('건강정보 기록을 삭제할까요?')) return
    await supabase.from('member_health_logs').delete().eq('id', healthId)
    await loadHealthLogs()
    setMessage('건강정보 기록이 삭제되었습니다.')
  }

  const handleInquirySubmit = async (e) => {
    e.preventDefault()

    const payload = {
      member_id: member.id,
      name: inquiryForm.name?.trim() || memberInfo?.name || '',
      phone: inquiryForm.phone?.trim() || '',
      content: inquiryForm.content?.trim() || '',
      is_private: !!inquiryForm.is_private,
      admin_id: currentAdminId || null,
      gym_id: currentGymId || null,
    }

    if (!payload.content) {
      setMessage('문의 내용을 입력해주세요.')
      return
    }

    const { error } = await supabase.from('inquiries').insert(payload)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('문의사항이 등록되었습니다.')
    resetInquiryForm()
    await loadInquiries()
  }

  const handleInquiryDelete = async (inquiryId) => {
    if (!window.confirm('문의사항을 삭제할까요?')) return
    await supabase.from('inquiries').delete().eq('id', inquiryId)
    await loadInquiries()
    setMessage('문의사항이 삭제되었습니다.')
  }
  const handlePartnerUsageSubmit = async () => {
    if (!selectedPartner) {
      setMessage('제휴업체를 선택해주세요.')
      return
    }

    const pendingExists = partnerUsages.some(
      (usage) => usage.partner_id === selectedPartner.id && usage.status === 'pending',
    )

    if (pendingExists) {
      setMessage('이미 사용 요청이 접수된 제휴업체입니다. 관리자 승인을 기다려주세요.')
      return
    }

    const totalLimit = Number(selectedPartnerUsageSummary.totalLimit || 0)
    const approvedCount = Number(selectedPartnerUsageSummary.approvedCountThisMonth || 0)

    if (totalLimit > 0 && approvedCount >= totalLimit) {
      setMessage('이번 달 사용 가능한 횟수를 모두 사용했습니다.')
      return
    }

    const payload = {
      member_id: member.id,
      partner_id: selectedPartner.id,
      status: selectedPartner.approval_required ? 'pending' : 'approved',
      requested_at: new Date().toISOString(),
      approved_at: selectedPartner.approval_required ? null : new Date().toISOString(),
      note: partnerUsageForm.note?.trim() || '',
    }

    const { error } = await supabase.from('partner_usage').insert(payload)

    if (error) {
      setMessage(`제휴 사용 요청 실패: ${error.message}`)
      return
    }

    setMessage(
      selectedPartner.approval_required
        ? '제휴 사용 요청이 등록되었습니다. 관리자 승인을 기다려주세요.'
        : '제휴 사용이 바로 등록되었습니다.',
    )

    setPartnerUsageForm(emptyPartnerUsageForm)
    await loadPartnerUsages()
  }
  

const filteredMemberAlerts = memberAlerts.filter((alert) =>
  String(alert.text || '')
    .toLowerCase()
    .includes(String(memberAlertSearch || '').trim().toLowerCase())
)
  if (loading) {
    return <div className="loading-card">데이터 불러오는 중...</div>
  }

  return (
    <div className="dashboard-shell">
      <div className="admin-alert-bar collapsible-alert-bar alert-panel-modern">
  <button
    type="button"
    className="alert-collapse-toggle alert-modern-toggle"
    onClick={() => setCollapsedMemberAlertBar((prev) => !prev)}
  >
    <div className="alert-collapse-left alert-modern-left">
      <strong>🔔 알림</strong>
      <span>
        공지 {unreadMemberNoticeCount}건 / 문의 {unreadMemberInquiryCount}건 / 운동 {unreadMemberWorkoutCount}건
      </span>
    </div>

    <span className={`alert-collapse-arrow ${collapsedMemberAlertBar ? 'collapsed' : 'open'}`}>
      ▾
    </span>
  </button>

  {!collapsedMemberAlertBar && (
    <div className="alert-modern-body">
      <div className="alert-modern-tabs">
        <button
          type="button"
          className={`alert-modern-tab ${memberAlertTab === 'settings' ? 'active' : ''}`}
          onClick={() => setMemberAlertTab('settings')}
        >
          알림설정
        </button>
        <button
          type="button"
          className={`alert-modern-tab ${memberAlertTab === 'list' ? 'active' : ''}`}
          onClick={() => setMemberAlertTab('list')}
        >
          알림내역
        </button>
      </div>

      {memberAlertTab === 'settings' && (
        <div className="alert-modern-settings">
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={memberAlertSettings.notice}
              onChange={(e) => updateMemberAlertSetting('notice', e.target.checked)}
            />
            <span>공지 알림</span>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={memberAlertSettings.inquiryAnswer}
              onChange={(e) => updateMemberAlertSetting('inquiryAnswer', e.target.checked)}
            />
            <span>문의 답변 알림</span>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={memberAlertSettings.workout}
              onChange={(e) => updateMemberAlertSetting('workout', e.target.checked)}
            />
            <span>운동기록 알림</span>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={memberAlertSettings.sound}
              onChange={(e) => updateMemberAlertSetting('sound', e.target.checked)}
            />
            <span>소리</span>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={memberAlertSettings.popup}
              onChange={(e) => updateMemberAlertSetting('popup', e.target.checked)}
            />
            <span>팝업</span>
          </label>

          <button type="button" className="secondary-btn" onClick={clearMemberAlerts}>
            알림 초기화
          </button>
        </div>
      )}

      {memberAlertTab === 'list' && (
        <div className="alert-modern-list-wrap">
          <input
            type="text"
            placeholder="알림 내용 검색"
            value={memberAlertSearch}
            onChange={(e) => setMemberAlertSearch(e.target.value)}
            className="alert-modern-search"
          />

          {filteredMemberAlerts.length === 0 ? (
            <div className="workout-list-empty">표시할 알림이 없습니다.</div>
          ) : (
            <div className="admin-alert-list">
              {filteredMemberAlerts.map((alert) => (
                <div key={alert.id} className={`admin-alert-item ${alert.type}`}>
                  <span>{alert.text}</span>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => removeMemberAlert(alert.id)}
                  >
                    닫기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )}
</div>
      <header className="topbar">
        <div className="topbar-brand">
          <img src={logo} alt="숨바꼭질케어 로고" className="topbar-logo small" />
          <div>
            <div className="brand-mark">숨바꼭질케어</div>
            <h1 className="page-title">{memberInfo?.name} 회원 화면</h1>
            <p className="sub-text">access code 인증 완료</p>
          </div>
        </div>

        <button className="secondary-btn" onClick={onLogout}>
          나가기
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

     {activeTab === '내정보' && (
  <div className="member-home-page">
    <section className="member-home-hero">
      <div className="member-home-hero-left">
        <div className="member-home-badge">MY DASHBOARD</div>
        <h2>내 정보</h2>
        <p className="member-home-hero-text">
          내 목표, 이용 기간, 세션 진행 현황을 한눈에 보고
          현재 운동 진행 상태까지 편하게 확인할 수 있습니다.
        </p>

        <div className="member-home-profile-card">
          <div className="member-home-profile-top">
            <div>
              <span>회원명</span>
              <strong>{memberInfo?.name || '-'}</strong>
            </div>
            <div className="member-home-goal-pill">
              {memberInfo?.goal || '목표 미설정'}
            </div>
          </div>

          <div className="member-home-info-grid">
            <div className="member-home-info-item">
              <span>시작일</span>
              <strong>{memberInfo?.start_date || '-'}</strong>
            </div>
            <div className="member-home-info-item">
              <span>종료일</span>
              <strong>{memberInfo?.end_date || '-'}</strong>
            </div>
            <div className="member-home-info-item full">
              <span>회원 메모</span>
              <strong>{memberInfo?.memo || '초기 상태 회원입니다.'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="member-home-hero-right">
        <div className="member-home-progress-card">
          <span>세션 진행 현황</span>
          <strong>{progressPercent}%</strong>
          <p>
            총 {memberInfo?.total_sessions || 0}회 중 {memberInfo?.used_sessions || 0}회 사용
          </p>

          <div className="member-home-progress-bar">
            <div
              className="member-home-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="member-home-progress-meta">
            <div>
              <span>총 세션</span>
              <strong>{memberInfo?.total_sessions || 0}회</strong>
            </div>
            <div>
              <span>사용 세션</span>
              <strong>{memberInfo?.used_sessions || 0}회</strong>
            </div>
            <div>
              <span>남은 세션</span>
              <strong>{stats.remainingSessions}회</strong>
            </div>
          </div>
        </div>

        <div className="member-home-mini-card">
          <span>현재 이용 상태</span>
          <strong>
            {stats.remainingSessions > 0 ? '진행 중' : '세션 소진'}
          </strong>
          <p>
            남은 세션 {stats.remainingSessions}회 /
            PT {stats.ptCount}회 /
            개인운동 {stats.personalCount}회
          </p>
        </div>
      </div>
    </section>

    <section className="member-home-summary-grid">
      <div className="member-home-summary-card">
        <span>내 PT 횟수</span>
        <strong>{stats.ptCount}</strong>
        <p>지금까지 등록된 PT 운동 기록 횟수입니다.</p>
      </div>

      <div className="member-home-summary-card">
        <span>내 개인운동 횟수</span>
        <strong>{stats.personalCount}</strong>
        <p>직접 입력한 개인운동 기록 횟수입니다.</p>
      </div>

      <div className="member-home-summary-card highlight">
        <span>남은 세션</span>
        <strong>{stats.remainingSessions}</strong>
        <p>현재 이용 가능한 잔여 세션입니다.</p>
      </div>
    </section>
  </div>
)}
{activeTab === '성장현황' && (
  <div className="stack-gap">
    <section className="growth-hero-card">
      <div className="growth-hero-top">
        <div>
          <div className="growth-hero-badge">MY GROWTH</div>
          <h2>성장현황</h2>
          <p className="growth-hero-text">
            현재 레벨, 누적 XP, 주간 점수, 최근 활동 흐름을 한눈에 확인할 수 있습니다.
          </p>
        </div>

        <div className="growth-hero-side">
          <div className={`growth-hero-mini growth-hero-tier ${getLevelCardClass(growthSummary.levelName)}`}>
            <span>현재 레벨</span>
            <strong className="growth-hero-tier-title">
              {growthSummary.levelName}
            </strong>
            <div className="growth-hero-tier-sub">
              {getLevelSubLabel(growthSummary.levelName)}
            </div>
            <p>Lv.{growthSummary.levelNo}</p>
          </div>

          <div className="growth-hero-mini">
            <span>누적 XP</span>
            <strong>{growthSummary.totalXp}</strong>
            <p>이번 주 {growthSummary.weeklyScore}점</p>
          </div>
        </div>
      </div>
    </section>
    
<details className="member-guide-card">
  <summary className="member-guide-summary">
    🌱 성장현황 이렇게 보시면 됩니다
  </summary>

  <div className="member-guide-grid">
    <div className="member-guide-item">
      <strong>현재 레벨 / XP 확인</strong>
      <span>→ 지금 내 운동 참여 흐름을 볼 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>다음 레벨까지 확인</strong>
      <span>→ 얼마나 더 기록하면 되는지 알 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>XP 획득 기준 확인</strong>
      <span>→ 어떤 활동이 점수로 반영되는지 볼 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>👉 이렇게 사용하세요</strong>
      <span>→ 운동 기록이나 식단 기록 후 가볍게 확인해보세요</span>
    </div>
  </div>
</details>
    
    <section className="card growth-accordion-card">
      <button
        type="button"
        className="growth-section-toggle"
        onClick={() => toggleGrowthSection('summary')}
      >
        <span>1. 내 성장 요약</span>
        <strong>{growthOpenSections.summary ? '−' : '+'}</strong>
      </button>

      {growthOpenSections.summary && (
        <div className="stack-gap">
          <div className="growth-summary-grid">
            <div className={`growth-card growth-card-tier ${getLevelCardClass(growthSummary.levelName)}`}>
              <span>현재 레벨</span>
              <strong className="growth-level-inline growth-level-inline-light">
                {growthSummary.levelName}
              </strong>
              <div className="growth-tier-chip">
                {getLevelSubLabel(growthSummary.levelName)}
              </div>
              <div className="compact-text growth-tier-text">
                Lv.{growthSummary.levelNo} · 현재까지 누적 XP {growthSummary.totalXp}점
              </div>
            </div>

            <div className="growth-card">
              <span>이번 주 점수</span>
              <strong>{growthSummary.weeklyScore}점</strong>
              <div className="compact-text">
                연속 활동 {growthSummary.streakDays}일
              </div>
            </div>

            <div className="growth-card">
              <span>다음 레벨까지</span>
              <strong>
                {growthSummary.nextLevel ? `${growthSummary.nextLevelDiff} XP 남음` : '최고 레벨'}
              </strong>
              <div className="compact-text">
                {growthSummary.nextLevel
                  ? `다음 단계: Lv.${growthSummary.nextLevel.level_no} · ${growthSummary.nextLevel.level_name}`
                  : '이미 최고 단계입니다.'}
              </div>
            </div>

            <div className="growth-card">
              <span>최근 활동일</span>
              <strong>{growthSummary.lastActivityDate}</strong>
              <div className="compact-text">
                마지막 XP 반영 기준
              </div>
            </div>
          </div>

          <section className="growth-progress-card">
            <div className="section-head">
              <div>
                <h3>레벨 진행도</h3>
                <p className="sub-text">
                  다음 단계까지 얼마나 남았는지 확인할 수 있습니다.
                </p>
              </div>
              <div className="pill pill-violet">
                진행도 {xpProgress.percent}%
              </div>
            </div>

            <div className="progress-wrap">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${xpProgress.percent}%` }}
                />
              </div>
              <div className="compact-text">
                {growthSummary.nextLevel
                  ? `${growthSummary.nextLevel.level_name}까지 ${growthSummary.nextLevelDiff} XP 남았습니다. (${xpProgress.current} / ${xpProgress.next} XP)`
                  : '최고 레벨에 도달했습니다.'}
              </div>
            </div>
          </section>
        </div>
      )}
    </section>

    <section className="card growth-accordion-card">
      <button
        type="button"
        className="growth-section-toggle"
        onClick={() => toggleGrowthSection('levelTable')}
      >
        <span>2. 레벨 등급표</span>
        <strong>{growthOpenSections.levelTable ? '−' : '+'}</strong>
      </button>

      {growthOpenSections.levelTable && (
        <div className="list-stack">
          {memberLevelSettings.length ? (
            memberLevelSettings.map((item) => (
              <div
                key={item.id}
                className={`activity-rank-item ${getLevelCardClass(item.level_name)}`}
              >
                <div className="list-card-top">
                  <div className="growth-level-list-head">
                    <strong className="growth-level-list-title">
                      Lv.{item.level_no} · {item.level_name}
                    </strong>
                    <div className="growth-tier-chip">
                      {getLevelSubLabel(item.level_name)}
                    </div>
                  </div>

                  <span className="activity-rank-score score-total growth-tier-score">
                    최소 {Number(item.min_xp || 0)} XP
                  </span>
                </div>

                <div className="compact-text">
                  {item.description || '설명이 없습니다.'}
                </div>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">레벨 등급표가 없습니다.</div>
          )}
        </div>
      )}
    </section>

    <section className="card growth-accordion-card">
      <button
        type="button"
        className="growth-section-toggle"
        onClick={() => toggleGrowthSection('xpGuide')}
      >
        <span>3. XP 획득 기준</span>
        <strong>{growthOpenSections.xpGuide ? '−' : '+'}</strong>
      </button>

      {growthOpenSections.xpGuide && (
        <div className="list-stack">
          {memberXpSettings.length ? (
            memberXpSettings.map((rule) => {
              const label =
                rule.rule_code === 'pt_workout'
                  ? '🏋️ PT 운동기록'
                  : rule.rule_code === 'personal_workout'
                  ? '🔥 개인운동기록'
                  : rule.rule_code === 'diet'
                  ? '🥗 식단기록'
                  : `✨ ${rule.rule_name}`

              return (
                <div key={rule.id} className="activity-rank-item">
                  <div className="list-card-top">
                    <strong>{label}</strong>
                    <span className="activity-rank-score score-weighted">
                      {Number(rule.xp || 0)} XP
                    </span>
                  </div>
                  <div className="compact-text">
                    하루 최대 {Number(rule.daily_limit || 0)}회 인정
                    {rule.min_items ? ` / 최소 운동 ${rule.min_items}개` : ''}
                    {rule.min_sets ? ` / 최소 세트 ${rule.min_sets}개` : ''}
                    {rule.min_cardio_minutes ? ` / 최소 유산소 ${rule.min_cardio_minutes}분` : ''}
                  </div>
                  <div className="compact-text" style={{ marginTop: '6px' }}>
                    {rule.description || '활동 기록 시 XP가 적립됩니다.'}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="workout-list-empty">XP 획득 기준이 없습니다.</div>
          )}
        </div>
      )}
    </section>

    <section className="card growth-accordion-card">
      <button
        type="button"
        className="growth-section-toggle"
        onClick={() => toggleGrowthSection('xpLogs')}
      >
        <span>4. 최근 XP 로그</span>
        <strong>{growthOpenSections.xpLogs ? '−' : '+'}</strong>
      </button>

      {growthOpenSections.xpLogs && (
        <div className="list-stack">
          {memberXpLogs.length ? (
            memberXpLogs.slice(0, 10).map((log) => {
              const logTypeClass =
                log.source_type === 'pt_workout'
                  ? 'pt'
                  : log.source_type === 'personal_workout'
                  ? 'personal'
                  : log.source_type === 'diet'
                  ? 'diet'
                  : ''

              const logTypeLabel =
                log.source_type === 'pt_workout'
                  ? 'PT 운동'
                  : log.source_type === 'personal_workout'
                  ? '개인운동'
                  : log.source_type === 'diet'
                  ? '식단'
                  : log.source_type || '-'

              return (
                <div key={log.id} className={`activity-rank-item growth-log-card ${logTypeClass}`}>
                  <div className="list-card-top">
                    <strong>{getXpLogIcon(log.source_type)} {logTypeLabel}</strong>
                    <span className="activity-rank-score score-weighted">
                      +{log.xp} XP
                    </span>
                  </div>
                  <div className="compact-text">
                    날짜 {log.source_date || '-'} / 메모 {log.note || '-'}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="workout-list-empty">아직 XP 로그가 없습니다.</div>
          )}
        </div>
      )}
    </section>

   <section className="card growth-accordion-card">
  <button
    type="button"
    className="growth-section-toggle"
    onClick={() => toggleGrowthSection('ranking')}
  >
    <span>5. 전체 XP 랭킹 TOP 10</span>
    <strong>{growthOpenSections.ranking ? '−' : '+'}</strong>
  </button>

  {growthOpenSections.ranking && (
    <div className="list-stack">
      {myLevelRankInfo.myRankItem && (
        <div className="activity-rank-item growth-rank-self my-rank-card">
          <div className="list-card-top">
            <strong>
              내 순위 · {myLevelRankInfo.myRank}위 · {maskMemberName(myLevelRankInfo.myRankItem.members?.name || '회원')}
            </strong>
            <span className="activity-rank-score score-total">
              Lv.{myLevelRankInfo.myRankItem.level_no} · {myLevelRankInfo.myRankItem.level_name}
            </span>
          </div>
          <div className="compact-text">
            누적 XP {Number(myLevelRankInfo.myRankItem.total_xp || 0)}점 / 주간 {Number(myLevelRankInfo.myRankItem.weekly_score || 0)}점
          </div>
        </div>
      )}

      {myLevelRankInfo.topTenRanking.length ? (
        myLevelRankInfo.topTenRanking.map((item, index) => {
          const isMe = item.member_id === member?.id

          return (
            <div
              key={item.id}
              className={`activity-rank-item ${
                isMe ? 'growth-rank-self' : ''
              } ${
                index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
              }`}
            >
              <div className="list-card-top">
                <strong>
                  {index + 1}위 · {maskMemberName(item.members?.name || '회원')}
                </strong>
                <span className="activity-rank-score score-total">
                  Lv.{item.level_no} · {item.level_name}
                </span>
              </div>
              <div className="compact-text">
                누적 XP {Number(item.total_xp || 0)}점 / 주간 {Number(item.weekly_score || 0)}점
                {isMe ? ' / 내 순위' : ''}
              </div>
            </div>
          )
        })
      ) : (
        <div className="workout-list-empty">XP 랭킹 데이터가 없습니다.</div>
      )}
    </div>
  )}
</section>

<section className="card growth-accordion-card">
  <button
    type="button"
    className="growth-section-toggle"
    onClick={() => toggleGrowthSection('activityRanking')}
  >
    <span>6. 전체 활동 랭킹 TOP 10</span>
    <strong>{growthOpenSections.activityRanking ? '−' : '+'}</strong>
  </button>

  {growthOpenSections.activityRanking && (
    <div className="list-stack">
      <div className="compact-text">
        이번 달 기준 전체 활동횟수 순위입니다. 이름은 마스킹 처리되어 표시됩니다.
      </div>

      {myActivityRankInfo.myRankItem && (
        <div className="activity-rank-item growth-rank-self my-rank-card">
          <div className="list-card-top">
            <strong>
              내 순위 · {myActivityRankInfo.myRank}위 · {maskMemberName(myActivityRankInfo.myRankItem.name || '회원')}
            </strong>
            <span className="activity-rank-score score-total">
              총 {Number(myActivityRankInfo.myRankItem.totalActivity || 0)}회
            </span>
          </div>
          <div className="compact-text">
            PT {Number(myActivityRankInfo.myRankItem.ptCount || 0)}회 / 개인운동 {Number(myActivityRankInfo.myRankItem.personalCount || 0)}회 / 남은 세션 {Number(myActivityRankInfo.myRankItem.remainingSessions || 0)}회
          </div>
        </div>
      )}

      {myActivityRankInfo.topTenRanking.length ? (
        myActivityRankInfo.topTenRanking.map((item, index) => {
          const isMe = String(item.id) === String(member?.id || memberInfo?.id || '')

          return (
            <div
              key={item.id}
              className={`activity-rank-item activity-rank-card ${
                isMe ? 'growth-rank-self' : ''
              } ${
                index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
              }`}
            >
              <div className="list-card-top">
                <strong>
                  {index + 1}위 · {maskMemberName(item.name || '회원')}
                </strong>
                <span className="activity-rank-score score-total">
                  총 {Number(item.totalActivity || 0)}회
                </span>
              </div>
              <div className="compact-text">
                PT {Number(item.ptCount || 0)}회 / 개인운동 {Number(item.personalCount || 0)}회 / 남은 세션 {Number(item.remainingSessions || 0)}회
                {isMe ? ' / 내 순위' : ''}
              </div>
            </div>
          )
        })
      ) : (
        <div className="workout-list-empty">이번 달 활동 랭킹 데이터가 없습니다.</div>
      )}
    </div>
  )}
</section>
    <section className="card growth-accordion-card">
  <button
    type="button"
    className="growth-section-toggle"
    onClick={() => toggleGrowthSection('participationRanking')}
  >
    <span>7. 참여 점수 랭킹 TOP 10</span>
    <strong>{growthOpenSections.participationRanking ? '−' : '+'}</strong>
  </button>

  {growthOpenSections.participationRanking && (
    <div className="list-stack">
      <div className="compact-text">
        PT 1회 = 2점 / 개인운동 1회 = 1점 기준입니다. 이름은 가운데 마스킹 처리되어 표시됩니다.
      </div>

      {myParticipationRankInfo.myRankItem && (
        <div className="activity-rank-item growth-rank-self my-rank-card">
          <div className="list-card-top">
            <strong>
              내 순위 · {myParticipationRankInfo.myRank}위 · {maskMemberName(myParticipationRankInfo.myRankItem.name || '회원')}
            </strong>
            <span className="activity-rank-score score-total">
              총 {Number(myParticipationRankInfo.myRankItem.participationScore || 0)}점
            </span>
          </div>
          <div className="compact-text">
            PT {Number(myParticipationRankInfo.myRankItem.ptCount || 0)}회 / 개인운동 {Number(myParticipationRankInfo.myRankItem.personalCount || 0)}회 / 총 활동 {Number(myParticipationRankInfo.myRankItem.totalActivity || 0)}회
          </div>
        </div>
      )}

      {myParticipationRankInfo.topTenRanking.length ? (
        myParticipationRankInfo.topTenRanking.map((item, index) => {
          const isMe = String(item.id) === String(member?.id || memberInfo?.id || '')

          return (
            <div
              key={item.id}
              className={`activity-rank-item activity-rank-card ${
                isMe ? 'growth-rank-self' : ''
              } ${
                index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
              }`}
            >
              <div className="list-card-top">
                <strong>
                  {index + 1}위 · {maskMemberName(item.name || '회원')}
                </strong>
                <span className="activity-rank-score score-total">
                  총 {Number(item.participationScore || 0)}점
                </span>
              </div>
              <div className="compact-text">
                PT {Number(item.ptCount || 0)}회 / 개인운동 {Number(item.personalCount || 0)}회 / 총 활동 {Number(item.totalActivity || 0)}회
                {isMe ? ' / 내 순위' : ''}
              </div>
            </div>
          )
        })
      ) : (
        <div className="workout-list-empty">참여 점수 랭킹 데이터가 없습니다.</div>
      )}
    </div>
  )}
</section>
  </div>
)}
      {activeTab === '건강정보' && (
  <div className="member-health-page">
    <section className="member-health-hero">
      <div className="member-health-hero-left">
        <div className="member-health-badge">BODY CHECK</div>
        <h2>건강정보</h2>
        <p className="member-health-hero-text">
          체중, 체지방, 골격근량, 활동량, 병력사항까지 한 번에 정리하고
          이전 기록과 비교하면서 내 몸 상태를 편하게 확인할 수 있습니다.
        </p>
      </div>

      <div className="member-health-hero-right">
        <div className="member-health-hero-mini">
          <span>현재 입력 상태</span>
          <strong>{healthForm.id ? '기록 수정 중' : '새 기록 작성'}</strong>
          <p>
            {healthForm.id
              ? '기존 건강정보를 수정하고 있어요.'
              : '새로운 건강정보를 입력해보세요.'}
          </p>
        </div>

        <div className="member-health-hero-mini">
          <span>기준 날짜</span>
          <strong>{healthForm.record_date || '-'}</strong>
          <p>
            체중 {healthForm.weight_kg || '-'}kg / 권장열량 {calculatedRecommendedKcal || '-'}kcal
          </p>
        </div>
      </div>
    </section>
    
<details className="member-guide-card">
  <summary className="member-guide-summary">
    🧾 건강기록 이렇게 사용합니다
  </summary>

  <div className="member-guide-grid">
    <div className="member-guide-item">
      <strong>체중 / 체지방 입력</strong>
      <span>→ 내 몸 변화 기록이 차곡차곡 쌓여요</span>
    </div>

    <div className="member-guide-item">
      <strong>이전 기록과 비교</strong>
      <span>→ 몸 상태가 어떻게 바뀌는지 보기 쉬워져요</span>
    </div>

    <div className="member-guide-item">
      <strong>권장 섭취열량 확인</strong>
      <span>→ 식단을 맞출 때 참고하기 좋아요</span>
    </div>

    <div className="member-guide-item">
      <strong>👉 이렇게 사용하세요</strong>
      <span>→ 2주~4주 간격으로 꾸준히 남겨보세요</span>
    </div>
  </div>
</details>
    
    <section className="member-health-summary-grid">
      <div className="member-health-summary-card">
        <span>현재 체중</span>
        <strong>{healthForm.weight_kg || '-'}</strong>
        <p>kg 기준 입력값</p>
      </div>

      <div className="member-health-summary-card">
        <span>체지방률</span>
        <strong>{healthForm.body_fat_percent || '-'}</strong>
        <p>% 기준 입력값</p>
      </div>

      <div className="member-health-summary-card">
        <span>골격근량</span>
        <strong>{healthForm.skeletal_muscle_mass || '-'}</strong>
        <p>kg 기준 입력값</p>
      </div>

      <div className="member-health-summary-card highlight">
        <span>권장 섭취열량</span>
        <strong>{calculatedRecommendedKcal || '-'}</strong>
        <p>활동계수 반영 자동 계산</p>
      </div>
    </section>

    <div className="two-col member-health-layout">
      <section className="card member-health-form-card">
        <div className="member-health-section-head">
          <div>
            <div className="member-health-section-label">WRITE HEALTH</div>
            <h2>건강정보 입력 / 수정</h2>
            <p className="sub-text">
              기본 신체 정보, 체성분 수치, 활동 정보, 병력 및 메모를 나눠서 기록합니다.
            </p>
          </div>
        </div>

        <form className="stack-gap" onSubmit={handleHealthSubmit}>
          <div className="member-health-block">
            <div className="member-health-block-title">기본 정보</div>

            <label className="field">
              <span>기록일</span>
              <input
                type="date"
                value={healthForm.record_date}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, record_date: e.target.value })
                }
              />
            </label>

            <div className="grid-2">
              <label className="field">
                <span>성별</span>
                <select
                  value={healthForm.sex}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, sex: e.target.value })
                  }
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </label>

              <label className="field">
                <span>나이</span>
                <input
                  type="number"
                  value={healthForm.age}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, age: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>키(cm)</span>
                <input
                  type="number"
                  value={healthForm.height_cm}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, height_cm: e.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>체중(kg)</span>
                <input
                  type="number"
                  value={healthForm.weight_kg}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, weight_kg: e.target.value })
                  }
                />
              </label>
            </div>
          </div>

          <div className="member-health-block">
            <div className="member-health-block-title">체성분 정보</div>

            <div className="grid-2">
              <label className="field">
                <span>체지방률(%)</span>
                <input
                  type="number"
                  value={healthForm.body_fat_percent}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, body_fat_percent: e.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>골격근량(kg)</span>
                <input
                  type="number"
                  value={healthForm.skeletal_muscle_mass}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, skeletal_muscle_mass: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>체지방량(kg)</span>
                <input
                  type="number"
                  value={healthForm.body_fat_mass}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, body_fat_mass: e.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>인바디점수</span>
                <input
                  type="number"
                  value={healthForm.inbody_score}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, inbody_score: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>내장지방레벨</span>
                <input
                  type="number"
                  value={healthForm.visceral_fat_level}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, visceral_fat_level: e.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>내장지방면적(cm²)</span>
                <input
                  type="number"
                  value={healthForm.visceral_fat_area}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, visceral_fat_area: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>WHR(허리엉덩이비율)</span>
                <input
                  type="number"
                  step="0.01"
                  value={healthForm.whr}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, whr: e.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>활동계수</span>
                <select
                  value={healthForm.activity_factor}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, activity_factor: e.target.value })
                  }
                >
                  <option value="1.2">좌식 / 거의 운동 안함</option>
                  <option value="1.375">가벼운 활동 / 주 1~3회</option>
                  <option value="1.55">보통 활동 / 주 3~5회</option>
                  <option value="1.725">높은 활동 / 주 6~7회</option>
                  <option value="1.9">매우 높은 활동</option>
                </select>
              </label>
            </div>
          </div>

          <div className="member-health-block">
            <div className="member-health-block-title">대사량 / 메모</div>

            <div className="grid-2">
              <label className="field">
                <span>기초대사량(kcal)</span>
                <input
                  type="number"
                  value={healthForm.bmr}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, bmr: e.target.value })
                  }
                  placeholder="비워두면 자동 계산"
                />
              </label>

              <label className="field">
                <span>하루 권장 섭취열량(kcal)</span>
                <input
                  type="number"
                  value={calculatedRecommendedKcal}
                  readOnly
                />
              </label>
            </div>

            <label className="field">
              <span>병력사항</span>
              <textarea
                rows="4"
                value={healthForm.medical_history}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, medical_history: e.target.value })
                }
              />
            </label>

            <label className="field">
              <span>개인 메모</span>
              <textarea
                rows="4"
                value={healthForm.member_note}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, member_note: e.target.value })
                }
              />
            </label>

            <label className="field">
              <span>인바디 이미지 URL</span>
              <input
                value={healthForm.inbody_image_url}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, inbody_image_url: e.target.value })
                }
                placeholder="이미지 링크를 넣어주세요"
              />
            </label>
          </div>

          <div className="inline-actions wrap">
            <button className="primary-btn" type="submit">
              {healthForm.id ? '건강정보 수정' : '건강정보 저장'}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={resetHealthForm}
            >
              초기화
            </button>
          </div>
        </form>
      </section>

      <section className="card member-health-list-card">
        <div className="member-health-section-head">
          <div>
            <div className="member-health-section-label">MY BODY LOG</div>
            <h2>내 건강정보 기록</h2>
            <p className="sub-text">
              저장된 건강정보를 날짜별로 확인하고, 필요하면 수정하거나 삭제할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="list-stack">
          {healthLogs.length === 0 ? (
            <div className="empty-box">저장된 건강정보 기록이 없습니다.</div>
          ) : (
            healthLogs.map((health) => {
              const isCollapsed = collapsedHealthLogs[health.id] ?? true

              return (
                <div key={health.id} className="member-health-record-card">
                  <div className="member-health-record-head">
                    <div>
                      <h3>{health.record_date || '-'}</h3>
                      <p>
                        간략히보기: 키 {health.height_cm || '-'} / 체중 {health.weight_kg || '-'} /
                        체지방 {health.body_fat_percent || '-'} / 골격근 {health.skeletal_muscle_mass || '-'} /
                        BMR {health.bmr || '-'} / 권장열량 {health.recommended_kcal || '-'}
                      </p>
                    </div>

                    <div className="member-health-record-pill">
                      체중 {health.weight_kg || '-'}kg
                    </div>
                  </div>

                  <div className="inline-actions wrap">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        setCollapsedHealthLogs((prev) => ({
                          ...prev,
                          [health.id]: !isCollapsed,
                        }))
                      }
                    >
                      {isCollapsed ? '상세보기' : '간략히보기'}
                    </button>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleHealthEdit(health)}
                    >
                      수정
                    </button>

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleHealthDelete(health.id)}
                    >
                      삭제
                    </button>
                  </div>

                  {!isCollapsed && (
                    <div className="member-health-record-body">
                      <div className="member-health-record-grid">
                        <div className="detail-box">
                          <p><strong>성별:</strong> {health.sex === 'female' ? '여성' : '남성'}</p>
                          <p><strong>나이:</strong> {health.age || '-'}</p>
                          <p><strong>키:</strong> {health.height_cm || '-'} cm</p>
                          <p><strong>체중:</strong> {health.weight_kg || '-'} kg</p>
                        </div>

                        <div className="detail-box">
                          <p><strong>체지방률:</strong> {health.body_fat_percent || '-'} %</p>
                          <p><strong>골격근량:</strong> {health.skeletal_muscle_mass || '-'} kg</p>
                          <p><strong>체지방량:</strong> {health.body_fat_mass || '-'} kg</p>
                          <p><strong>인바디점수:</strong> {health.inbody_score || '-'}</p>
                        </div>

                        <div className="detail-box">
                          <p><strong>내장지방레벨:</strong> {health.visceral_fat_level || '-'}</p>
                          <p><strong>내장지방면적:</strong> {health.visceral_fat_area || '-'} cm²</p>
                          <p><strong>WHR:</strong> {health.whr || '-'}</p>
                          <p><strong>활동계수:</strong> {health.activity_factor || '-'}</p>
                        </div>

                        <div className="detail-box">
                          <p><strong>기초대사량:</strong> {health.bmr || '-'} kcal</p>
                          <p><strong>권장 섭취열량:</strong> {health.recommended_kcal || '-'} kcal</p>
                          <p><strong>병력사항:</strong> {health.medical_history || '-'}</p>
                          <p><strong>개인 메모:</strong> {health.member_note || '-'}</p>
                        </div>
                      </div>

                      {health.inbody_image_url ? (
                        <div className="member-health-image-link">
                          <a
                            href={health.inbody_image_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            인바디 이미지 보기
                          </a>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  </div>
)}

      {activeTab === '운동기록' && (
  <div className="member-workout-page">
    <section className="member-workout-hero">
      <div className="member-workout-hero-left">
        <div className="member-workout-badge">WORKOUT LOG</div>
        <h2>운동기록</h2>
        <p className="member-workout-hero-text">
          PT 기록과 개인운동 기록을 날짜별로 확인하고,
          운동 수, 세트 수, 통증 기록까지 한눈에 정리해서 볼 수 있습니다.
        </p>
      </div>

      <div className="member-workout-hero-right">
        <div className="member-workout-hero-mini">
          <span>현재 기록 수</span>
          <strong>{workoutCards.length}</strong>
          <p>검색과 필터가 반영된 운동기록 개수입니다.</p>
        </div>

        <div className="member-workout-hero-mini">
          <span>현재 필터</span>
          <strong>
            {workoutTypeFilter === 'all'
              ? '전체'
              : workoutTypeFilter === 'pt'
              ? 'PT'
              : '개인운동'}
          </strong>
          <p>{workoutSearch?.trim() ? `검색어: ${workoutSearch}` : '검색어 없음'}</p>
        </div>
      </div>
    </section>

    <section className="member-workout-summary-grid">
      <div className="member-workout-summary-card">
        <span>PT 기록 수</span>
        <strong>{stats.ptCount}</strong>
        <p>등록된 PT 운동기록 횟수입니다.</p>
      </div>

      <div className="member-workout-summary-card">
        <span>개인운동 기록 수</span>
        <strong>{stats.personalCount}</strong>
        <p>직접 작성한 개인운동 기록 횟수입니다.</p>
      </div>

      <div className="member-workout-summary-card highlight">
        <span>남은 세션</span>
        <strong>{stats.remainingSessions}</strong>
        <p>현재 이용 가능한 잔여 세션입니다.</p>
      </div>
    </section>

    <section className="card member-workout-list-wrap">
      <div className="member-workout-section-head">
        <div>
          <div className="member-workout-section-label">FILTER WORKOUT</div>
          <h2>운동기록 목록</h2>
          <p className="sub-text">
            날짜, 운동명, 잘한점, 보완점을 검색하고 타입별로 운동기록을 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="member-workout-filter-grid">
        <input
          placeholder="날짜 / 운동명 / 잘한점 / 보완점 검색"
          value={workoutSearch}
          onChange={(e) => setWorkoutSearch(e.target.value)}
        />

        <select
          value={workoutTypeFilter}
          onChange={(e) => setWorkoutTypeFilter(e.target.value)}
        >
          <option value="all">전체 타입</option>
          <option value="pt">PT</option>
          <option value="personal">개인운동</option>
        </select>
      </div>

      <div className="list-stack">
        {workoutCards.length === 0 ? (
          <div className="empty-box">조건에 맞는 운동기록이 없습니다.</div>
        ) : (
          workoutCards.map((workout) => {
            const collapsed = collapsedWorkouts[workout.id] ?? true
            const isPersonal = workout.workout_type === 'personal'

            return (
              <div key={workout.id} className="member-workout-record-card">
                <div className="member-workout-record-head">
                  <div>
                    <div className="member-workout-record-topline">
                      <span className={`member-workout-type-pill ${isPersonal ? 'personal' : 'pt'}`}>
                        {isPersonal ? '개인운동' : 'PT 기록'}
                      </span>
                      <span className="member-workout-date-pill">{workout.workout_date}</span>
                    </div>

                    <h3>
                      운동 {workout.items.length}개 / 총세트 {getTotalSetCount(workout.items)}세트
                    </h3>

                    <p>
                      {workout.good?.trim()
                        ? `잘한점: ${workout.good}`
                        : '잘한점 기록 없음'}
                      {' · '}
                      {workout.improve?.trim()
                        ? `보완점: ${workout.improve}`
                        : '보완점 기록 없음'}
                    </p>

                    {workout?.pain_enabled && (workout?.pain_logs?.length || 0) > 0 ? (
                      <div className="member-workout-pain-line">
                        통증기록:{' '}
                        {workout.pain_logs
                          ?.filter((log) => log?.body_part || log?.pain_score !== null)
                          ?.map((log) => `${log?.body_part || '부위미입력'} ${log?.pain_score ?? '-'}점`)
                          ?.join(' / ')}
                      </div>
                    ) : null}
                  </div>
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

                  {isPersonal ? (
                    <>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handlePersonalEdit(workout)}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handlePersonalDelete(workout.id)}
                      >
                        삭제
                      </button>
                    </>
                  ) : null}
                </div>

                {!collapsed && (
                  <div className="member-workout-record-body">
                    <div className="member-workout-item-list">
                      {workout.items.map((item, itemIndex) => (
                        <div key={item.id || itemIndex} className="member-workout-item-card">
                          <div className="member-workout-item-head">
                           <strong>
  {item.training_method === 'superset'
    ? `슈퍼세트 ${itemIndex + 1}`
    : item.performed_name || item.equipment_name_snapshot || item.exercise_name_snapshot || `운동 ${itemIndex + 1}`}
</strong>

                            <span className="pill">
  {item.entry_type === 'cardio'
    ? '유산소'
    : item.entry_type === 'care'
    ? '케어'
    : item.training_method === 'superset'
    ? '슈퍼세트'
    : item.training_method === 'dropset'
    ? '드롭세트'
    : '근력운동'}
</span>
                          </div>

                          {item.entry_type === 'cardio' ? (
  <div className="detail-box">
    <p><strong>사용 기구:</strong> {item.equipment_name_snapshot || '-'}</p>
    <p><strong>실제 수행 운동:</strong> {item.performed_name || '-'}</p>
    <p><strong>유산소 시간:</strong> {item.cardio_minutes || 0}분</p>
    {item.method_note ? <p><strong>메모:</strong> {item.method_note}</p> : null}
  </div>
) : item.entry_type === 'care' ? (
  <div className="detail-box">
    <p><strong>케어 항목:</strong> {item.equipment_name_snapshot || '-'}</p>
    <p><strong>실제 수행 내용:</strong> {item.performed_name || '-'}</p>
    <p><strong>케어 시간:</strong> {item.care_minutes || 0}분</p>
    {item.method_note ? <p><strong>메모:</strong> {item.method_note}</p> : null}
  </div>
) : item.training_method === 'superset' ? (
  <div className="member-workout-sub-grid">
    {(item.sub_exercises || []).map((sub, subIndex) => (
      <div key={subIndex} className="detail-box">
        <p>
          <strong>{subIndex === 0 ? '운동 A' : '운동 B'}:</strong>{' '}
          {sub.performed_name || sub.equipment_name_snapshot || sub.exercise_name_snapshot || '-'}
        </p>

        {(sub.sets || []).length > 0 ? (
          <ul className="set-list">
            {(sub.sets || []).map((setRow, idx) => (
              <li key={idx}>
                {idx + 1}세트 - {setRow.kg || '-'}kg / {setRow.reps || '-'}회
              </li>
            ))}
          </ul>
        ) : (
          <div className="compact-text">세트 정보 없음</div>
        )}
      </div>
    ))}

    {item.method_note ? (
      <div className="detail-box">
        <p><strong>메모:</strong> {item.method_note}</p>
      </div>
    ) : null}
  </div>
) : (
  <>
    <div className="detail-box">
      <p><strong>사용 기구:</strong> {item.equipment_name_snapshot || '-'}</p>
      <p><strong>실제 수행 운동:</strong> {item.performed_name || '-'}</p>
    </div>

    {(item.sets || []).length > 0 ? (
      <ul className="set-list">
        {(item.sets || []).map((setRow, idx) => (
          <li key={idx}>
            {idx + 1}세트 - {setRow.kg || '-'}kg / {setRow.reps || '-'}회
          </li>
        ))}
      </ul>
    ) : (
      <div className="compact-text">세트 정보 없음</div>
    )}

    {item.method_note ? (
      <div className="detail-box">
        <p><strong>메모:</strong> {item.method_note}</p>
      </div>
    ) : null}
  </>
)}
                        </div>
                      ))}
                    </div>

                    <div className="member-workout-feedback-grid">
                      <div className="detail-box">
                        <p><strong>잘한점</strong></p>
                        <p>{workout.good || '-'}</p>
                      </div>

                      <div className="detail-box">
                        <p><strong>보완점</strong></p>
                        <p>{workout.improve || '-'}</p>
                      </div>
                    </div>

                    {workout?.pain_enabled && (workout?.pain_logs?.length || 0) > 0 ? (
                      <div className="detail-box member-workout-pain-detail">
                        <p><strong>[통증 기록]</strong></p>

                        {(workout.pain_logs || []).map((log, index) => (
                          <div key={index} className="compact-text">
                            {index + 1}. [{log?.pain_type || '-'}] {log?.body_part || '-'} /{' '}
                            {log?.movement_name || '-'} / {log?.pain_timing || '-'} / VAS{' '}
                            {log?.pain_score ?? '-'} / {log?.pain_note || '-'}
                          </div>
                        ))}

                        <div style={{ height: '8px' }} />

                        <p><strong>VAS 기준</strong></p>
                        <div className="compact-text">0: 통증 없음</div>
                        <div className="compact-text">1~2: 거의 신경 쓰이지 않는 통증</div>
                        <div className="compact-text">3~4: 움직일 때 불편하지만 운동 가능</div>
                        <div className="compact-text">5~6: 운동 시 집중이 흐트러질 정도</div>
                        <div className="compact-text">7~8: 운동 수행이 어려움</div>
                        <div className="compact-text">9: 일상생활에서도 지속적인 통증</div>
                        <div className="compact-text">10: 견디기 힘든 극심한 통증</div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  </div>
)}

      {activeTab === '개인운동입력' && (
  <div className="member-personal-page">
    <section className="member-personal-hero">
      <div className="member-personal-hero-left">
        <div className="member-personal-badge">WRITE PERSONAL WORKOUT</div>
        <h2>개인운동 입력 / 수정</h2>
        <p className="member-personal-hero-text">
          운동 종류, 세트, 유산소 시간, 훈련방식, 통증 기록까지
          보기 쉽게 정리해서 입력할 수 있는 개인운동 작성 화면입니다.
        </p>
      </div>

      <div className="member-personal-hero-right">
        <div className="member-personal-hero-mini">
          <span>현재 상태</span>
          <strong>{personalForm.id ? '기록 수정 중' : '새 기록 작성'}</strong>
          <p>
            {personalForm.id
              ? '기존 운동기록을 수정하고 있습니다.'
              : '새로운 개인운동을 입력해보세요.'}
          </p>
        </div>

        <div className="member-personal-hero-mini">
          <span>작성 날짜</span>
          <strong>{personalForm.workout_date || '-'}</strong>
          <p>입력된 운동 수 {personalForm.items?.length || 0}개</p>
        </div>
      </div>
    </section>

<details className="member-guide-card">
  <summary className="member-guide-summary">
    🏋️ 개인운동기록 이렇게 남기세요
  </summary>

  <div className="member-guide-grid">
    <div className="member-guide-item">
      <strong>운동 추가</strong>
      <span>→ 오늘 혼자 한 운동을 직접 기록할 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>세트 / 시간 입력</strong>
      <span>→ 근력운동, 유산소, 케어를 나눠 남길 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>통증기록 활용</strong>
      <span>→ 불편했던 부위가 있다면 같이 남길 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>👉 이렇게 사용하세요</strong>
      <span>→ 운동 끝난 직후 바로 기록하면 가장 편해요</span>
    </div>
  </div>
</details>

    
    <section className="member-personal-summary-grid">
      <div className="member-personal-summary-card">
        <span>입력 운동 수</span>
        <strong>{personalForm.items?.length || 0}</strong>
        <p>현재 작성 중인 운동 카드 수</p>
      </div>

      <div className="member-personal-summary-card">
        <span>통증기록 사용</span>
        <strong>{personalForm.pain_enabled ? 'ON' : 'OFF'}</strong>
        <p>이번 운동의 통증 기록 여부</p>
      </div>

      <div className="member-personal-summary-card highlight">
        <span>작성 모드</span>
        <strong>{personalForm.id ? 'EDIT' : 'NEW'}</strong>
        <p>{personalForm.id ? '기존 기록 수정' : '새 기록 저장'}</p>
      </div>
    </section>

    <section className="card member-personal-form-wrap">
      <div className="member-personal-section-head">
        <div>
          <div className="member-personal-section-label">PERSONAL WORKOUT FORM</div>
          <h2>개인운동 작성</h2>
          <p className="sub-text">
            날짜를 선택하고 운동별로 세트, 유산소, 훈련방식, 통증기록을 나눠서 입력하세요.
          </p>
        </div>
      </div>

      <form className="stack-gap" onSubmit={handlePersonalSubmit}>
        <label className="field">
          <span>날짜</span>
          <input
            type="date"
            value={personalForm.workout_date}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, workout_date: e.target.value })
            }
          />
        </label>

                <div className="list-stack">
          {personalForm.items.map((item, itemIndex) => (
            <div key={itemIndex} className="member-personal-item-card">
              <div className="member-personal-item-head">
                <div>
                  <h3>운동 {itemIndex + 1}</h3>
                  <p>
                    간략히보기:{' '}
                    {item.entry_type === 'cardio'
  ? `유산소 / ${item.cardio_minutes || 0}분`
  : item.entry_type === 'care'
  ? `케어 / ${item.care_minutes || 0}분`
  : item.entry_type === 'stretching'
  ? `스트레칭 / ${item.stretch_minutes || 0}분 / ${item.stretch_reps || 0}회`
  : item.entry_type === 'pain_only'
  ? '통증기록'
  : item.training_method === 'superset'
  ? '슈퍼세트'
  : item.training_method === 'dropset'
  ? '드롭세트'
  : item.performed_name || item.equipment_name_snapshot || '근력운동'}
                  </p>
                </div>

                <div className="inline-actions wrap">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => togglePersonalItemCollapse(itemIndex)}
                  >
                    {item.collapsed ? '상세히보기' : '간략히보기'}
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => removePersonalItem(itemIndex)}
                    disabled={personalForm.items.length === 1}
                  >
                    운동 삭제
                  </button>
                </div>
              </div>

              {!item.collapsed && (
                <div className="member-personal-item-body">
                  <label className="field">
                    <span>기록 종류</span>
                    <select
  value={item.entry_type || 'strength'}
  onChange={(e) => updatePersonalEntryType(itemIndex, e.target.value)}
>
  <option value="strength">근력운동</option>
  <option value="cardio">유산소</option>
  <option value="care">케어</option>
  <option value="stretching">스트레칭</option>
  <option value="pain_only">통증기록만</option>
</select>
                  </label>

                  {item.entry_type === 'strength' ? (
                    <>
                      <label className="field">
                        <span>훈련 방식</span>
                        <select
                          value={item.training_method || 'normal'}
                          onChange={(e) => updatePersonalTrainingMethod(itemIndex, e.target.value)}
                        >
                          <option value="normal">일반운동</option>
                          <option value="superset">슈퍼세트</option>
                          <option value="dropset">드롭세트</option>
                        </select>
                      </label>

                      <div className="detail-box">
                        <p>
                          <strong>
                            {item.training_method === 'superset'
                              ? '슈퍼세트 안내'
                              : item.training_method === 'dropset'
                              ? '드롭세트 안내'
                              : '일반운동 안내'}
                          </strong>
                        </p>
                        <div className="compact-text">
                          {item.training_method === 'superset'
                            ? '슈퍼세트는 두 가지 운동을 쉬는 시간 없이 바로 이어서 진행하는 방식입니다.'
                            : item.training_method === 'dropset'
                            ? '드롭세트는 같은 운동에서 무게를 낮추며 연속으로 진행하는 방식입니다.'
                            : '일반운동은 한 가지 운동을 세트별로 진행하는 가장 기본적인 방식입니다.'}
                        </div>
                      </div>
                    </>
                  ) : item.entry_type === 'cardio' ? (
  <div className="detail-box">
    <p><strong>유산소 안내</strong></p>
    <div className="compact-text">
      걷기, 러닝, 사이클처럼 시간을 중심으로 기록하는 운동입니다.
    </div>
  </div>
) : item.entry_type === 'stretching' ? (
  <div className="detail-box">
    <p><strong>스트레칭 안내</strong></p>
    <div className="compact-text">
      스트레칭은 시간과 횟수를 함께 기록하는 항목입니다.
    </div>
  </div>
) : item.entry_type === 'pain_only' ? (
  <div className="detail-box">
    <p><strong>통증기록 안내</strong></p>
    <div className="compact-text">
      운동 입력 없이 통증 상태만 기록하는 항목입니다.
    </div>
  </div>
) : (
  <div className="detail-box">
    <p><strong>케어 안내</strong></p>
    <div className="compact-text">
      스포츠마사지, 컨디셔닝처럼 케어 시간을 기록하는 항목입니다.
    </div>
  </div>
)}

                  {item.entry_type !== 'pain_only' && (
  <>
    <label className="field">
      <span>{item.entry_type === 'care' ? '케어 항목 검색' : '사용 기구 / 종목 검색'}</span>
      <input
        type="text"
        value={item.exercise_search || ''}
        onChange={(e) => updatePersonalItemField(itemIndex, 'exercise_search', e.target.value)}
        placeholder={
          item.entry_type === 'care'
            ? '예: 케어, 마사지, 스트레칭'
            : '예: 가슴, 등, 하체, 유산소'
        }
      />
    </label>

    <label className="field">
      <span>{item.entry_type === 'care' ? '케어 항목 선택' : '사용 기구 / 종목 선택'}</span>
      <select
        value={item.exercise_id}
        onChange={(e) => updatePersonalItemSelect(itemIndex, e.target.value)}
      >
        <option value="">선택 안함</option>
        {exercises
          .filter((exercise) => {
            const keyword = String(item.exercise_search || '').trim().toLowerCase()

            if (!keyword) return true

            const name = String(exercise.name || '').toLowerCase()
            const bodyPart = String(exercise.body_part || '').toLowerCase()
            const category = String(exercise.category || '').toLowerCase()
            const brand = String(exercise.brands?.name || '').toLowerCase()
            const guide = String(exercise.guide_text || '').toLowerCase()

            return (
              name.includes(keyword) ||
              bodyPart.includes(keyword) ||
              category.includes(keyword) ||
              brand.includes(keyword) ||
              guide.includes(keyword)
            )
          })
          .map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              [{exercise.body_part || '기타'} / {exercise.category || '분류없음'} / {exercise.brands?.name || '브랜드없음'}] {exercise.name}
            </option>
          ))}
      </select>
    </label>

    <label className="field">
      <span>{item.entry_type === 'care' ? '선택된 케어 항목명' : '선택된 기구명 / 종목명'}</span>
      <input
        value={item.equipment_name_snapshot || ''}
        readOnly
        placeholder="운동DB에서 선택한 항목명이 표시됩니다."
      />
    </label>

    <label className="field">
      <span>실제 수행 운동명</span>
      <input
        value={item.performed_name || ''}
        onChange={(e) => updatePersonalItemName(itemIndex, e.target.value)}
        placeholder={
          item.entry_type === 'care'
            ? '예: 우측 어깨 스포츠마사지, 고관절 컨디셔닝'
            : item.entry_type === 'cardio'
            ? '예: 트레드밀 걷기, 수영, 싸이클'
            : item.entry_type === 'stretching'
            ? '예: 햄스트링 스트레칭, 고관절 스트레칭'
            : '예: 벤치프레스, 밴드 워크, 스쿼트'
        }
      />
    </label>

    <label className="field">
      <span>추가 메모</span>
      <input
        value={item.method_note || ''}
        onChange={(e) => updatePersonalItemField(itemIndex, 'method_note', e.target.value)}
        placeholder={
          item.entry_type === 'strength'
            ? '예: 한 가지 운동을 세트별로 안정적으로 진행했습니다.'
            : item.entry_type === 'cardio'
            ? '예: 경사도 5, 속도 5.5로 진행'
            : item.entry_type === 'stretching'
            ? '예: 좌우 각각 30초씩 진행'
            : '예: 어깨 주변 긴장 완화 위주로 진행했습니다.'
        }
      />
    </label>

    {item.entry_type === 'cardio' ? (
      <label className="field">
        <span>유산소 시간(분)</span>
        <input
          type="number"
          value={item.cardio_minutes || ''}
          onChange={(e) => updatePersonalItemField(itemIndex, 'cardio_minutes', e.target.value)}
          placeholder="예: 20"
        />
      </label>
    ) : item.entry_type === 'care' ? (
      <label className="field">
        <span>케어 시간(분)</span>
        <input
          type="number"
          value={item.care_minutes || ''}
          onChange={(e) => updatePersonalItemField(itemIndex, 'care_minutes', e.target.value)}
          placeholder="예: 15"
        />
      </label>
    ) : item.entry_type === 'stretching' ? (
      <div className="form-row">
        <label className="field">
          <span>스트레칭 시간(분)</span>
          <input
            type="number"
            value={item.stretch_minutes || ''}
            onChange={(e) => updatePersonalItemField(itemIndex, 'stretch_minutes', e.target.value)}
            placeholder="예: 10"
          />
        </label>

        <label className="field">
          <span>반복 횟수</span>
          <input
            type="number"
            value={item.stretch_reps || ''}
            onChange={(e) => updatePersonalItemField(itemIndex, 'stretch_reps', e.target.value)}
            placeholder="예: 12"
          />
        </label>
      </div>
    ) : item.training_method === 'superset' ? (
      <div className="member-personal-sub-grid">
        {[0, 1].map((subIndex) => {
          const sub =
            item.sub_exercises?.[subIndex] || createEmptyPersonalSubExercise()

          return (
            <div key={subIndex} className="member-personal-sub-card">
              <div className="member-personal-sub-title">
                {subIndex === 0 ? '운동 A' : '운동 B'}
              </div>

              <label className="field">
                <span>사용 기구 검색</span>
                <input
                  type="text"
                  value={sub.exercise_search || ''}
                  onChange={(e) =>
                    setPersonalForm((prev) => {
                      const nextItems = [...prev.items]
                      const currentItem = nextItems[itemIndex]
                      const nextSubs = [...(currentItem.sub_exercises || [createEmptyPersonalSubExercise(), createEmptyPersonalSubExercise()])]

                      nextSubs[subIndex] = {
                        ...nextSubs[subIndex],
                        exercise_search: e.target.value,
                      }

                      nextItems[itemIndex] = {
                        ...currentItem,
                        sub_exercises: nextSubs,
                      }

                      return { ...prev, items: nextItems }
                    })
                  }
                  placeholder="예: 등, 가슴, 하체, 케어"
                />
              </label>

              <label className="field">
                <span>사용 기구 선택</span>
                <select
                  value={sub.exercise_id}
                  onChange={(e) =>
                    updatePersonalSubExerciseSelect(itemIndex, subIndex, e.target.value)
                  }
                >
                  <option value="">선택 안함</option>
                  {exercises
                    .filter((exercise) => {
                      const keyword = String(sub.exercise_search || '').trim().toLowerCase()

                      if (!keyword) return true

                      const name = String(exercise.name || '').toLowerCase()
                      const bodyPart = String(exercise.body_part || '').toLowerCase()
                      const category = String(exercise.category || '').toLowerCase()
                      const brand = String(exercise.brands?.name || '').toLowerCase()
                      const guide = String(exercise.guide_text || '').toLowerCase()

                      return (
                        name.includes(keyword) ||
                        bodyPart.includes(keyword) ||
                        category.includes(keyword) ||
                        brand.includes(keyword) ||
                        guide.includes(keyword)
                      )
                    })
                    .map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        [{exercise.body_part || '기타'} / {exercise.category || '분류없음'} / {exercise.brands?.name || '브랜드없음'}] {exercise.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className="field">
                <span>실제 수행 운동명</span>
                <input
                  value={sub.performed_name || ''}
                  onChange={(e) =>
                    updatePersonalSubExerciseName(itemIndex, subIndex, e.target.value)
                  }
                  placeholder={subIndex === 0 ? '예: 랫풀다운' : '예: 시티드로우'}
                />
              </label>

              <div className="stack-gap">
                {(sub.sets || []).map((setRow, setIndex) => (
                  <div className="set-row" key={setIndex}>
                    <input
                      placeholder="kg"
                      value={setRow.kg}
                      onChange={(e) =>
                        updateSetValue(itemIndex, setIndex, 'kg', e.target.value, subIndex)
                      }
                    />
                    <input
                      placeholder="reps"
                      value={setRow.reps}
                      onChange={(e) =>
                        updateSetValue(itemIndex, setIndex, 'reps', e.target.value, subIndex)
                      }
                    />
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => removeSet(itemIndex, setIndex, subIndex)}
                      disabled={(sub.sets || []).length === 1}
                    >
                      세트 삭제
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => addSet(itemIndex, subIndex)}
                >
                  세트 추가
                </button>
              </div>
            </div>
          )
        })}
      </div>
    ) : (
      <div className="stack-gap">
        {(item.sets || []).map((setRow, setIndex) => (
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
              onClick={() => removeSet(itemIndex, setIndex)}
              disabled={(item.sets || []).length === 1}
            >
              세트 삭제
            </button>
          </div>
        ))}

        <button
          type="button"
          className="secondary-btn"
          onClick={() => addSet(itemIndex)}
        >
          세트 추가
        </button>
      </div>
    )}
  </>
)}
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="secondary-btn member-personal-add-btn" onClick={addPersonalItem}>
          운동 추가
        </button>

        <div className="member-personal-feedback-grid">
          <label className="field">
            <span>잘한점</span>
            <textarea
              rows="4"
              value={personalForm.good}
              onChange={(e) => setPersonalForm({ ...personalForm, good: e.target.value })}
            />
          </label>

          <label className="field">
            <span>보완점</span>
            <textarea
              rows="4"
              value={personalForm.improve}
              onChange={(e) => setPersonalForm({ ...personalForm, improve: e.target.value })}
            />
          </label>
        </div>

        <div className="member-personal-pain-wrap">
          <div className="list-card-top">
            <strong>통증 기록</strong>
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={!!personalForm.pain_enabled}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    pain_enabled: e.target.checked,
                    pain_logs: e.target.checked
                      ? prev.pain_logs?.length
                        ? prev.pain_logs
                        : [{ ...emptyPainLog }]
                      : [{ ...emptyPainLog }],
                  }))
                }
              />
              <span>이번 운동에 통증 기록하기</span>
            </label>
          </div>

          {personalForm.pain_enabled ? (
            <div className="stack-gap">
              <div className="detail-box">
                <strong>VAS 기준</strong>
                <div className="compact-text">0: 통증 없음</div>
                <div className="compact-text">1~2: 거의 신경 쓰이지 않는 통증</div>
                <div className="compact-text">3~4: 움직일 때 불편하지만 운동 가능</div>
                <div className="compact-text">5~6: 운동 시 집중이 흐트러질 정도</div>
                <div className="compact-text">7~8: 운동 수행이 어려움</div>
                <div className="compact-text">9: 일상생활에서도 지속적인 통증</div>
                <div className="compact-text">10: 견디기 힘든 극심한 통증</div>
              </div>

              {(personalForm.pain_logs || []).map((painLog, painIndex) => (
                <div key={painIndex} className="member-personal-pain-card">
                  <div className="list-card-top">
                    <strong>통증 {painIndex + 1}</strong>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => removePainLog(painIndex)}
                      disabled={(personalForm.pain_logs || []).length === 1}
                    >
                      삭제
                    </button>
                  </div>

                  <div className="grid-2">
                    <label className="field">
                      <span>통증 유형</span>
                      <select
                        value={painLog?.pain_type || '운동중'}
                        onChange={(e) => updatePainLogValue(painIndex, 'pain_type', e.target.value)}
                      >
                        <option value="운동중">운동중</option>
                        <option value="운동후">운동후</option>
                        <option value="상시">상시</option>
                      </select>
                    </label>

                    <label className="field">
                      <span>부위</span>
                      <input
                        value={painLog?.body_part || ''}
                        onChange={(e) => updatePainLogValue(painIndex, 'body_part', e.target.value)}
                        placeholder="예: 어깨, 허리, 무릎"
                      />
                    </label>
                  </div>

                  <div className="grid-2">
                    <label className="field">
                      <span>동작명</span>
                      <input
                        value={painLog?.movement_name || ''}
                        onChange={(e) =>
                          updatePainLogValue(painIndex, 'movement_name', e.target.value)
                        }
                        placeholder="예: 벤치프레스, 스쿼트"
                      />
                    </label>

                    <label className="field">
                      <span>통증이 느껴진 시점</span>
                      <input
                        value={painLog?.pain_timing || ''}
                        onChange={(e) => updatePainLogValue(painIndex, 'pain_timing', e.target.value)}
                        placeholder="예: 하강 시, 올라올 때, 걷는 중"
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span>VAS 점수 (0~10)</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={painLog?.pain_score ?? ''}
                      onChange={(e) => updatePainLogValue(painIndex, 'pain_score', e.target.value)}
                      placeholder="0~10"
                    />
                  </label>

                  <label className="field">
                    <span>메모</span>
                    <textarea
                      rows="3"
                      value={painLog?.pain_note || ''}
                      onChange={(e) => updatePainLogValue(painIndex, 'pain_note', e.target.value)}
                      placeholder="예: 찌르는 느낌, 뻐근함, 특정 각도에서 심해짐"
                    />
                  </label>
                </div>
              ))}

              <button type="button" className="secondary-btn" onClick={addPainLog}>
                통증 기록 추가
              </button>
            </div>
          ) : null}
        </div>

        <div className="inline-actions wrap">
          <button className="primary-btn" type="submit">
            {personalForm.id ? '개인운동 수정' : '개인운동 저장'}
          </button>
          <button type="button" className="secondary-btn" onClick={resetPersonalForm}>
            초기화
          </button>
        </div>
      </form>
    </section>
  </div>
)}

           {activeTab === '식단' && (
        <div className="member-diet-page">
          <section className="member-diet-hero">
            <div className="member-diet-hero-left">
              <div className="member-diet-badge">MEAL TRACKER</div>
              <h2>식단 기록</h2>
              <p className="member-diet-hero-text">
                단순히 먹은 것만 적는 화면이 아니라,
                식사 시간, 영양 구성, 배고픔 정도, 메모까지 함께 남기는 기록 공간입니다.
              </p>
            </div>

            <div className="member-diet-hero-right">
              <div className="member-diet-hero-mini">
                <span>이번 입력 상태</span>
                <strong>{dietForm.id ? '수정 중' : '새 기록 작성'}</strong>
                <p>{dietForm.id ? '기존 식단 기록을 수정하고 있어요.' : '새로운 식단 기록을 남겨보세요.'}</p>
              </div>

              <div className="member-diet-hero-mini">
                <span>현재 식사 설정</span>
                <strong>{dietForm.meal_type || '아침'} / {dietForm.meal_category || '일반식'}</strong>
                <p>날짜 {dietForm.log_date || '-'}</p>
              </div>
            </div>
          </section>


<details className="member-guide-card">
  <summary className="member-guide-summary">
    🍽 식단기록 이렇게 하면 됩니다
  </summary>

  <div className="member-guide-grid">
    <div className="member-guide-item">
      <strong>먹은 내용 입력</strong>
      <span>→ 어떤 식사를 했는지 간단히 남길 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>식사 시간 / 유형 선택</strong>
      <span>→ 아침, 점심, 저녁, 간식 구분이 쉬워져요</span>
    </div>

    <div className="member-guide-item">
      <strong>배고픔 / 메모 작성</strong>
      <span>→ 식사 전후 느낌도 함께 기록할 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>👉 이렇게 사용하세요</strong>
      <span>→ 식사할 때마다 짧게 남기는 습관을 들여보세요</span>
    </div>
  </div>
</details>
          
          <div className="two-col member-diet-layout">
            <section className="card member-diet-form-card">
              <div className="member-diet-section-head">
                <div>
                  <div className="member-diet-section-label">WRITE MEAL</div>
                  <h2>식단 입력 / 수정</h2>
                  <p className="sub-text">
                    식사 기본 정보, 영양 정보, 제품 정보, 개인 메모를 나눠서 기록할 수 있습니다.
                  </p>
                </div>
              </div>

              <form className="stack-gap" onSubmit={handleDietSubmit}>
                <div className="member-diet-chip-row">
                  {['아침', '점심', '저녁', '간식'].map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      className={`member-diet-chip ${dietForm.meal_type === meal ? 'active' : ''}`}
                      onClick={() => setDietForm({ ...dietForm, meal_type: meal })}
                    >
                      {meal}
                    </button>
                  ))}
                </div>

                <div className="member-diet-block">
                  <div className="member-diet-block-title">기본 정보</div>

                  <div className="grid-2">
                    <label className="field">
                      <span>날짜</span>
                      <input
                        type="date"
                        value={dietForm.log_date}
                        onChange={(e) => setDietForm({ ...dietForm, log_date: e.target.value })}
                      />
                    </label>

                    <label className="field">
                      <span>먹은 시간</span>
                      <input
                        type="time"
                        value={dietForm.meal_time}
                        onChange={(e) => setDietForm({ ...dietForm, meal_time: e.target.value })}
                      />
                    </label>
                  </div>

                  <div className="grid-2">
                    <label className="field">
                      <span>식사 종류</span>
                      <select
                        value={dietForm.meal_type}
                        onChange={(e) => setDietForm({ ...dietForm, meal_type: e.target.value })}
                      >
                        <option value="아침">아침</option>
                        <option value="점심">점심</option>
                        <option value="저녁">저녁</option>
                        <option value="간식">간식</option>
                      </select>
                    </label>

                    <label className="field">
                      <span>식사 유형</span>
                      <select
                        value={dietForm.meal_category}
                        onChange={(e) => setDietForm({ ...dietForm, meal_category: e.target.value })}
                      >
                        <option value="일반식">일반식</option>
                        <option value="집밥">집밥</option>
                        <option value="외식">외식</option>
                        <option value="제품">제품</option>
                      </select>
                    </label>
                  </div>

                  <label className="field">
                    <span>먹은 내용</span>
                    <textarea
                      rows="5"
                      value={dietForm.content}
                      onChange={(e) => setDietForm({ ...dietForm, content: e.target.value })}
                      placeholder="예: 현미밥 1공기, 닭가슴살 150g, 계란 2개, 김치 조금"
                    />
                  </label>
                </div>

                <div className="member-diet-block">
                  <div className="member-diet-block-title">영양 정보</div>

                  <div className="grid-3">
                    <label className="field">
                      <span>탄수화물(g)</span>
                      <input
                        type="number"
                        value={dietForm.carb_g}
                        onChange={(e) => setDietForm({ ...dietForm, carb_g: e.target.value })}
                        placeholder="예: 45"
                      />
                    </label>

                    <label className="field">
                      <span>단백질(g)</span>
                      <input
                        type="number"
                        value={dietForm.protein_g}
                        onChange={(e) => setDietForm({ ...dietForm, protein_g: e.target.value })}
                        placeholder="예: 30"
                      />
                    </label>

                    <label className="field">
                      <span>지방(g)</span>
                      <input
                        type="number"
                        value={dietForm.fat_g}
                        onChange={(e) => setDietForm({ ...dietForm, fat_g: e.target.value })}
                        placeholder="예: 12"
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span>배고픔 정도</span>
                    <div className="member-diet-hunger-box">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={dietForm.hunger_level}
                        onChange={(e) => setDietForm({ ...dietForm, hunger_level: e.target.value })}
                      />
                      <div className="member-diet-hunger-meta">
                        <strong>{dietForm.hunger_level || 0}점</strong>
                        <span>
                          {Number(dietForm.hunger_level || 0) <= 3
                            ? '배고픔이 크지 않았어요'
                            : Number(dietForm.hunger_level || 0) <= 7
                            ? '적당히 배고픈 상태였어요'
                            : '배고픔이 큰 상태였어요'}
                        </span>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="member-diet-block">
                  <div className="member-diet-block-title">제품 / 추가 정보</div>

                  <div className="grid-2">
                    <label className="field">
                      <span>제품 브랜드</span>
                      <input
                        value={dietForm.product_brand}
                        onChange={(e) => setDietForm({ ...dietForm, product_brand: e.target.value })}
                        placeholder="예: 랭킹닭컴, 오트밀 브랜드명"
                      />
                    </label>

                    <label className="field">
                      <span>제품 이름</span>
                      <input
                        value={dietForm.product_name}
                        onChange={(e) => setDietForm({ ...dietForm, product_name: e.target.value })}
                        placeholder="예: 닭가슴살 볶음밥, 프로틴 음료"
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span>개인 메모</span>
                    <textarea
                      rows="4"
                      value={dietForm.member_note}
                      onChange={(e) => setDietForm({ ...dietForm, member_note: e.target.value })}
                      placeholder="예: 운동 전이라 가볍게 먹음 / 저녁 늦게 먹어서 양 조절함"
                    />
                  </label>
                </div>

                <div className="inline-actions wrap">
                  <button className="primary-btn" type="submit">
                    {dietForm.id ? '식단 수정' : '식단 저장'}
                  </button>

                  <button type="button" className="secondary-btn" onClick={resetDietForm}>
                    초기화
                  </button>
                </div>
              </form>
            </section>

            <section className="card member-diet-log-card">
              <div className="member-diet-section-head">
                <div>
                  <div className="member-diet-section-label">MY MEAL LOG</div>
                  <h2>내 식단 기록</h2>
                  <p className="sub-text">
                    날짜, 식사 종류, 식단 내용, 코치 피드백까지 한눈에 확인할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="stack-gap">
                <input
                  value={dietSearch}
                  onChange={(e) => setDietSearch(e.target.value)}
                  placeholder="내용 / 제품명 / 피드백 검색"
                />

                <select value={dietMealFilter} onChange={(e) => setDietMealFilter(e.target.value)}>
                  <option value="all">전체 식사</option>
                  <option value="아침">아침</option>
                  <option value="점심">점심</option>
                  <option value="저녁">저녁</option>
                  <option value="간식">간식</option>
                </select>
              </div>

              <div className="list-stack">
                {displayedDietLogs.map((diet) => {
                  const collapsed = collapsedDiets[diet.id] ?? true
                  const macroTotal =
                    Number(diet.carb_g || 0) +
                    Number(diet.protein_g || 0) +
                    Number(diet.fat_g || 0)

                  return (
                    <div key={diet.id} className="member-diet-log-item">
                      <div className="member-diet-log-top">
                        <div>
                          <div className="member-diet-log-title-row">
                            <strong>{diet.meal_type}</strong>
                            <span className="pill">{diet.log_date}</span>
                            {diet.meal_category ? (
                              <span className="pill pill-blue">{diet.meal_category}</span>
                            ) : null}
                          </div>

                          <div className="member-diet-log-summary">
                            {diet.meal_time || '-'} · {diet.content?.slice(0, 42) || ''}
                            {diet.content?.length > 42 ? '...' : ''}
                          </div>
                        </div>

                        <div className="member-diet-log-right">
                          <div className="member-diet-mini-chip">
                            배고픔 {diet.hunger_level || 0}
                          </div>
                          <div className="member-diet-mini-chip soft">
                            영양합계 {macroTotal}g
                          </div>
                        </div>
                      </div>

                      <div className="inline-actions wrap">
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() =>
                            setCollapsedDiets((prev) => ({
                              ...prev,
                              [diet.id]: !collapsed,
                            }))
                          }
                        >
                          {collapsed ? '상세히보기' : '간략히보기'}
                        </button>

                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => handleDietEdit(diet)}
                        >
                          수정
                        </button>

                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => handleDietDelete(diet.id)}
                        >
                          삭제
                        </button>
                      </div>

                      {!collapsed ? (
                        <div className="member-diet-detail-box">
                          <div className="member-diet-detail-grid">
                            <div className="member-diet-detail-card">
                              <span>식사 시간</span>
                              <strong>{diet.meal_time || '-'}</strong>
                            </div>

                            <div className="member-diet-detail-card">
                              <span>식사 유형</span>
                              <strong>{diet.meal_category || '-'}</strong>
                            </div>

                            <div className="member-diet-detail-card">
                              <span>배고픔 정도</span>
                              <strong>{diet.hunger_level || 0}점</strong>
                            </div>

                            <div className="member-diet-detail-card">
                              <span>브랜드 / 제품</span>
                              <strong>
                                {diet.product_brand || '-'} / {diet.product_name || '-'}
                              </strong>
                            </div>
                          </div>

                          <div className="member-diet-content-box">
                            <span>먹은 내용</span>
                            <p>{diet.content || '-'}</p>
                          </div>

                          <div className="member-diet-macro-grid">
                            <div className="member-diet-macro-card carb">
                              <span>탄수화물</span>
                              <strong>{diet.carb_g || 0}g</strong>
                            </div>
                            <div className="member-diet-macro-card protein">
                              <span>단백질</span>
                              <strong>{diet.protein_g || 0}g</strong>
                            </div>
                            <div className="member-diet-macro-card fat">
                              <span>지방</span>
                              <strong>{diet.fat_g || 0}g</strong>
                            </div>
                          </div>

                          <div className="member-diet-content-box">
                            <span>개인 메모</span>
                            <p>{diet.member_note || '-'}</p>
                          </div>

                          <div className="member-diet-feedback-box">
                            <span>코치 피드백</span>
                            <p>{diet.coach_feedback || '아직 피드백이 없습니다.'}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}

                {displayedDietLogs.length === 0 ? (
                  <div className="workout-list-empty">등록된 식단 기록이 없습니다.</div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      )}
{activeTab === '식단플래너' && (
  <div className="member-diet-page">
    <section className="member-diet-hero">
      <div className="member-diet-hero-left">
        <div className="member-diet-badge">MY MEAL PLAN</div>
        <h2>식단 플래너</h2>
        <p className="member-diet-hero-text">
          코치가 설정한 월간 식단 계획을 날짜별로 확인할 수 있는 공간입니다.
          오늘 어떤 식단으로 먹어야 하는지 바로 확인해보세요.
        </p>
      </div>

      <div className="member-diet-hero-right">
        <div className="member-diet-hero-mini">
          <span>조회 월</span>
          <strong>{mealPlanMonth || '-'}</strong>
          <p>현재 보고 있는 월간 식단입니다.</p>
        </div>

        <div className="member-diet-hero-mini">
          <span>식단 수</span>
          <strong>{mealPlans.length}일</strong>
          <p>해당 월에 생성된 식단 기록 수입니다.</p>
        </div>
      </div>
    </section>

<details className="member-guide-card">
  <summary className="member-guide-summary">
    📅 식단플래너 이렇게 보시면 됩니다
  </summary>

  <div className="member-guide-grid">
    <div className="member-guide-item">
      <strong>오늘 식단 확인</strong>
      <span>→ 오늘 어떤 식사로 먹으면 되는지 볼 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>왜 이 식단인지 확인</strong>
      <span>→ 현재 식단 목적과 이유를 이해할 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>끼니별 구성 보기</strong>
      <span>→ 하루 식사 흐름을 한눈에 보기 쉬워져요</span>
    </div>

    <div className="member-guide-item">
      <strong>👉 이렇게 사용하세요</strong>
      <span>→ 식사 전에 먼저 열어보고 그대로 따라가 보세요</span>
    </div>
  </div>
</details>
    
    <div className="two-col member-diet-layout" style={{ marginBottom: '20px' }}>
      <section className="card member-diet-log-card">
        <div className="member-diet-section-head">
          <div>
            <div className="member-diet-section-label">WHY THIS PLAN</div>
            <h2>왜 이 식단을 하나요?</h2>
            <p className="sub-text">
              코치가 설정한 현재 식단 목적과 이유를 안내하는 영역입니다.
            </p>
          </div>
        </div>

        <div className="member-diet-detail-box">
          <div className="member-diet-detail-grid">
            <div className="member-diet-detail-card">
              <span>현재 목적</span>
              <strong>{mealPlanPurposeInfo.label}</strong>
            </div>

            <div className="member-diet-detail-card">
              <span>하루 목표 열량</span>
              <strong>{mealPlanPurposeInfo.targetKcal || 0} kcal</strong>
            </div>

            <div className="member-diet-detail-card">
              <span>식사 횟수</span>
              <strong>{mealPlanPurposeInfo.mealsPerDay || 0}끼</strong>
            </div>
          </div>

          <div className="member-diet-content-box">
            <span>식단 목적 설명</span>
            <p>{mealPlanPurposeInfo.reason}</p>
          </div>
        </div>
      </section>

      <section className="card member-today-meal-card">
  <div className="list-card-top">
    <div>
      <div className="member-diet-section-label">TODAY MEAL</div>
      <h2>오늘 식단</h2>
      <p className="sub-text">
        오늘 날짜 기준 식단과 끼니별 구성, 진행 상태를 바로 확인할 수 있습니다.
      </p>
    {todayMealPlan ? (
  <div className="detail-box">
    {(() => {
      const coachComment = getTodayMealCoachComment(todayMealPlan, mealPlanProfile)

      return (
        <>
          <strong>{coachComment.title}</strong>
          <p style={{ marginTop: '6px' }}>{coachComment.mainText}</p>

          <div className="stack-gap" style={{ marginTop: '10px' }}>
            {coachComment.tips.map((tip, index) => (
              <div key={index} className="compact-text">
                - {tip}
              </div>
            ))}
          </div>
        </>
      )
    })()}
  </div>
) : null}
    </div>

    <div className="inline-actions wrap">
      <span className="status-pill">
        {todayMealPlan?.plan_date || '-'}
      </span>
      <span className="status-pill">
  {todayMealPlan?.day_type || '-'}
</span>

<span className="status-pill">
  {todayMealPlan?.meal_type === 'free'
    ? '자유식'
    : todayMealPlan?.meal_type === 'general'
    ? '일반식'
    : '정밀식'}
</span>
    </div>
  </div>

  {!todayMealPlan ? (
    <div className="workout-list-empty">오늘 확인할 식단이 없습니다.</div>
  ) : (
    <div className="stack-gap">
      <div className="member-today-meal-summary-grid">
        <div className="detail-box">
          <span>오늘 총 열량</span>
          <strong>{Number(todayMealPlan.total_kcal || 0)} kcal</strong>
        </div>

        <div className="detail-box">
          <span>탄수화물</span>
          <strong>{Number(todayMealPlan.total_carbs_g || 0)} g</strong>
        </div>

        <div className="detail-box">
          <span>단백질</span>
          <strong>{Number(todayMealPlan.total_protein_g || 0)} g</strong>
        </div>

        <div className="detail-box">
          <span>지방</span>
          <strong>{Number(todayMealPlan.total_fat_g || 0)} g</strong>
        </div>
      </div>

      {todayMealPlanProgress ? (
        <div className="detail-box">
          <p><strong>오늘 식단 진행률</strong></p>
          <p>
            완료 {todayMealPlanProgress.doneCount} / 못 먹음 {todayMealPlanProgress.skippedCount} / 미체크 {todayMealPlanProgress.pendingCount}
          </p>
          <p>진행률 {todayMealPlanProgress.percent}%</p>
        </div>
      ) : null}

      <div className="list-stack">
        {todayMealSlots.length === 0 ? (
          <div className="workout-list-empty">오늘 식단 끼니 정보가 없습니다.</div>
        ) : (
          todayMealSlots.map((meal, index) => {
            const checkEntry = getMealCheckEntry(todayMealPlan, meal.slot || '식사')
            const foodItems = getMealFoodItems(meal)

            return (
              <div
                key={`${meal.slot || '식사'}-${index}`}
                className="detail-box member-today-meal-slot-card"
              >
                <div className="list-card-top">
                  <strong>{meal.slot || `식사 ${index + 1}`}</strong>
                  <span className="status-pill">
                    {getMealCheckStatusText(checkEntry?.status)}
                  </span>
                </div>
<div className="compact-text" style={{ marginBottom: '8px' }}>
  {meal.menu || '-'}
</div>
                <div className="compact-text">
                  시간: {meal.time || '-'}
                </div>

                <div className="compact-text">
                  kcal {Number(meal.kcal || 0)} / 탄 {Number(meal.carbs_g || 0)}g / 단 {Number(meal.protein_g || 0)}g / 지 {Number(meal.fat_g || 0)}g
                </div>

                {foodItems.length > 0 ? (
                  <div className="member-meal-food-item-list">
                    {foodItems.map((item, itemIndex) => (
                      <div
                        key={`${item.name || 'food'}-${itemIndex}`}
                        className="member-meal-food-item"
                      >
                        <strong>{getMealFoodItemName(item)}</strong>
<span>
  {getMealFoodItemAmount(item) !== '' ? `${Number(getMealFoodItemAmount(item))}g` : '-'}
</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="compact-text">{meal.menu || '-'}</div>
                )}

                {Array.isArray(meal.alternatives) && meal.alternatives.length > 0 ? (
                  <div className="compact-text">
                    <strong>대체 음식:</strong> {meal.alternatives.join(' / ')}
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )}
</section>
    </div>
    
    <section className="meal-progress-dashboard-card">
  <div className="meal-planner-card-label">MEAL PROGRESS</div>

  <div className="meal-progress-dashboard-top">
    <div>
      <h3>식단 달성률 그래프</h3>
      <p className="meal-planner-card-sub">
        먹었어요 체크 기준으로 오늘 식단과 이번 달 전체 식단 달성률을 한눈에 보여줍니다.
      </p>
    </div>

    <div className="meal-progress-dashboard-badge">
      이번 달 평균 {monthlyMealPlanProgress.percent}%
    </div>
  </div>

  <div className="meal-progress-dashboard-grid">
    <div className="meal-progress-stat-card">
      <span>오늘 달성률</span>
      <strong>{todayMealPlanProgress?.percent || 0}%</strong>

      <div className="meal-progress-bar">
        <div
          className="meal-progress-fill"
          style={{ width: `${todayMealPlanProgress?.percent || 0}%` }}
        />
      </div>

      <p>
        완료 {todayMealPlanProgress?.doneCount || 0} / 총 {todayMealPlanProgress?.total || 0}끼
      </p>
    </div>

    <div className="meal-progress-stat-card">
      <span>이번 달 평균 달성률</span>
      <strong>{monthlyMealPlanProgress.percent}%</strong>

      <div className="meal-progress-bar">
        <div
          className="meal-progress-fill"
          style={{ width: `${monthlyMealPlanProgress.percent}%` }}
        />
      </div>

      <p>
        완료 {monthlyMealPlanProgress.doneCount} / 총 {monthlyMealPlanProgress.total}끼
      </p>
    </div>

    <div className="meal-progress-stat-card">
      <span>못 먹음</span>
      <strong>{monthlyMealPlanProgress.skippedCount}</strong>
      <p>이번 달 누적 못 먹음 체크 수</p>
    </div>

    <div className="meal-progress-stat-card">
      <span>미체크</span>
      <strong>{monthlyMealPlanProgress.pendingCount}</strong>
      <p>아직 체크되지 않은 식단 수</p>
    </div>
  </div>
</section>
    <div className="card">
      <div className="member-diet-section-head">
        <div>
          <div className="member-diet-section-label">MONTHLY MEAL PLAN</div>
          <h2>월별 식단 보기</h2>
          <p className="sub-text">
            날짜별로 아침, 점심, 저녁, 간식 메뉴를 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="inline-actions wrap" style={{ marginBottom: '16px' }}>
        <input
          type="month"
          value={mealPlanMonth}
          onChange={(e) => setMealPlanMonth(e.target.value)}
        />

        <button
          type="button"
          className="secondary-btn"
          onClick={loadMealPlans}
        >
          조회
        </button>
      </div>

      <div className="list-stack">
  {mealPlans.length === 0 ? (
    <div className="workout-list-empty">해당 월에 등록된 식단 계획이 없습니다.</div>
  ) : (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div
            key={day}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#667085',
              textAlign: 'center',
              paddingBottom: '6px',
            }}
          >
            {day}
          </div>
        ))}

        {mealPlanCalendarData.blanks.map((blank) => (
          <div key={blank} />
        ))}

        {mealPlanCalendarData.days.map((item) => {
          const isSelected = selectedMealPlanDate === item.date
          const plan = item.plan

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => setSelectedMealPlanDate(item.date)}
              style={{
                minHeight: '108px',
                borderRadius: '16px',
                border: isSelected ? '2px solid #6366f1' : '1px solid #d9e1f2',
                background: plan ? '#ffffff' : '#f8fafc',
                padding: '10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
                {item.day}
              </div>

              {plan ? (
  <>
    <div style={{ fontSize: '11px', marginBottom: '6px', color: '#4f46e5', fontWeight: 700 }}>
      {plan.day_type}
    </div>
    <div style={{ fontSize: '11px', color: '#667085', marginBottom: '4px' }}>
      {Array.isArray(plan.meals_json) ? plan.meals_json.length : 0}끼
    </div>
    <div style={{ fontSize: '11px', color: '#667085', marginBottom: '4px' }}>
      {plan.total_kcal || 0} kcal
    </div>
    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
      완료 {getMealPlanProgress(plan).doneCount}/{getMealPlanProgress(plan).total}
    </div>
  </>
) : (
                <div style={{ fontSize: '11px', color: '#98a2b3' }}>식단 없음</div>
              )}
            </button>
          )
        })}
      </div>

      <div className="card" style={{ padding: '18px' }}>
        {!selectedMealPlan ? (
          <div className="workout-list-empty">선택한 날짜의 식단이 없습니다.</div>
        ) : (
          <>
            <div className="member-diet-section-head" style={{ marginBottom: '12px' }}>
              <div>
                <div className="member-diet-section-label">SELECTED DAY</div>
                <h2>{selectedMealPlan.plan_date} 식단</h2>
                <p className="sub-text">
                  선택한 날짜의 상세 식단입니다.
                </p>
              </div>
            </div>

            <div className="member-diet-detail-grid" style={{ marginBottom: '14px' }}>
              <div className="member-diet-detail-card">
                <span>유형</span>
                <strong>{selectedMealPlan.day_type}</strong>
              </div>

              <div className="member-diet-detail-card">
                <span>하루 열량</span>
                <strong>{selectedMealPlan.total_kcal || 0} kcal</strong>
              </div>

              <div className="member-diet-detail-card">
                <span>탄수화물</span>
                <strong>{selectedMealPlan.total_carbs_g || 0} g</strong>
              </div>

              <div className="member-diet-detail-card">
                <span>단백질</span>
                <strong>{selectedMealPlan.total_protein_g || 0} g</strong>
              </div>

              <div className="member-diet-detail-card">
                <span>지방</span>
                <strong>{selectedMealPlan.total_fat_g || 0} g</strong>
              </div>

              <div className="member-diet-detail-card">
                <span>식사 수</span>
                <strong>{Array.isArray(selectedMealPlan.meals_json) ? selectedMealPlan.meals_json.length : 0}끼</strong>
              </div>
              <div className="member-diet-detail-card">
  <span>수행률</span>
  <strong>{selectedMealPlanProgress?.percent || 0}%</strong>
</div>
              <div className="member-diet-detail-card">
  <span>완료 / 못 먹음 / 미체크</span>
  <strong>
    {selectedMealPlanProgress?.doneCount || 0} / {selectedMealPlanProgress?.skippedCount || 0} / {selectedMealPlanProgress?.pendingCount || 0}
  </strong>
</div>
            </div>

           <div className="member-diet-content-box">
  <span>식단 상세 / 완료 체크</span>

  {Array.isArray(selectedMealPlan.meals_json) && selectedMealPlan.meals_json.length > 0 ? (
    selectedMealPlan.meals_json.map((meal, index) => {
      const slot = meal.slot || `식사 ${index + 1}`
      const checkEntry = getMealCheckEntry(selectedMealPlan, slot)
      const draftKey = `${selectedMealPlan.id}-${slot}`
      const draftReason =
        mealCheckDrafts[draftKey] ?? checkEntry?.reason ?? ''

      return (
        <div
          key={index}
          className="detail-box"
          style={{ marginTop: '12px' }}
        >
          <div className="compact-text" style={{ marginBottom: '8px' }}>
  <strong>{slot}</strong>: {getMealDisplaySummary(meal)}
</div>

<div className="compact-text" style={{ marginBottom: '8px' }}>
  kcal {Number(meal.kcal || 0)} / 탄 {Number(meal.carbs_g || 0)}g / 단 {Number(meal.protein_g || 0)}g / 지 {Number(meal.fat_g || 0)}g
</div>

{getMealFoodItems(meal).length > 0 ? (
  <div className="member-meal-food-item-list" style={{ marginBottom: '10px' }}>
    {getMealFoodItems(meal).map((item, itemIndex) => (
      <div
        key={`${item.name || 'food'}-${itemIndex}`}
        className="member-meal-food-item"
      >
       <strong>{getMealFoodItemName(item)}</strong>
<span>
  {getMealFoodItemAmount(item) !== '' ? `${Number(getMealFoodItemAmount(item))}g` : '-'}
</span>
      </div>
    ))}
  </div>
) : null}
          <div className="inline-actions wrap" style={{ marginBottom: '8px' }}>
            <span className="pill">
              {getMealCheckStatusText(checkEntry?.status)}
            </span>

            <button
              type="button"
              className="primary-btn"
              onClick={() => handleMealCheckSave(selectedMealPlan, meal, 'done')}
              disabled={savingMealCheckKey === draftKey}
            >
              먹었어요
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => handleMealCheckSave(selectedMealPlan, meal, 'skipped')}
              disabled={savingMealCheckKey === draftKey}
            >
              못 먹었어요
            </button>
          </div>

          <label className="field">
            <span>못 먹은 이유</span>
            <textarea
              rows="2"
              value={draftReason}
              onChange={(e) => updateMealCheckDraft(selectedMealPlan.id, slot, e.target.value)}
              placeholder="예: 외식 일정이 있었어요 / 시간이 없었어요 / 속이 불편했어요"
            />
          </label>

          {checkEntry?.status === 'skipped' && checkEntry?.reason ? (
            <div className="compact-text" style={{ marginTop: '6px' }}>
              저장된 이유: {checkEntry.reason}
            </div>
          ) : null}
        </div>
      )
    })
  ) : (
    <p>등록된 식단이 없습니다.</p>
  )}
</div>
          </>
        )}
      </div>
    </>
  )}
</div>
    </div>
  </div>
)}
            {activeTab === '루틴' && (
        <div className="member-routine-page">
          <section className="member-routine-hero">
            <div className="member-routine-hero-left">
              <div className="member-routine-badge">MY ROUTINE</div>
              <h2>루틴</h2>
              <p className="member-routine-hero-text">
                주차별 운동 계획을 한눈에 보고,
                필요한 날만 열어서 운동명, 시간, 세트 정보를 편하게 확인할 수 있습니다.
              </p>
            </div>

            <div className="member-routine-hero-right">
              <div className="member-routine-hero-mini">
                <span>현재 루틴</span>
                <strong>{routine?.title || '루틴'}</strong>
                <p>회원님 전용 주차별 운동 계획입니다.</p>
              </div>

              <div className="member-routine-hero-mini">
                <span>선택 주차</span>
                <strong>
                  {currentRoutineWeek ? `${currentRoutineWeek.week_number}주차` : '선택 없음'}
                </strong>
                <p>
                  {currentRoutineWeek
                    ? `${(currentRoutineWeek.days || []).length}개 요일 구성`
                    : '표시할 주차가 없습니다.'}
                </p>
              </div>
            </div>
          </section>

<details className="member-guide-card">
  <summary className="member-guide-summary">
    📆 루틴 이렇게 확인하세요
  </summary>

  <div className="member-guide-grid">
    <div className="member-guide-item">
      <strong>주차 선택</strong>
      <span>→ 지금 해야 할 주차 루틴을 볼 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>요일별 확인</strong>
      <span>→ 오늘 해야 할 운동만 바로 찾을 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>운동 상세 보기</strong>
      <span>→ 세트 수와 운동 구성을 자세히 확인할 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>👉 이렇게 사용하세요</strong>
      <span>→ 운동 시작 전에 오늘 루틴부터 먼저 열어보세요</span>
    </div>
  </div>
</details>

          
          <section className="card member-routine-main-card">
            {!routine ? (
              <div className="workout-list-empty">등록된 루틴이 없습니다.</div>
            ) : (
              <div className="stack-gap">
                <div className="member-routine-title-box">
                  <div className="member-routine-title-label">ROUTINE TITLE</div>
                  <strong>{routine.title || '루틴'}</strong>
                </div>

                <div className="member-routine-week-tabs">
                  {(routine.weeks || []).map((week, index) => (
                    <button
                      key={index}
                      type="button"
                      className={index === selectedRoutineWeek ? 'primary-btn' : 'secondary-btn'}
                      onClick={() => setSelectedRoutineWeek(index)}
                    >
                      {week.week_number}주차
                    </button>
                  ))}
                </div>

                {!currentRoutineWeek ? (
                  <div className="workout-list-empty">선택된 주차가 없습니다.</div>
                ) : (
                  <div className="member-routine-week-card">
                    <div className="member-routine-week-head">
                      <div>
                        <div className="member-routine-week-label">ROUTINE WEEK</div>
                        <strong>{currentRoutineWeek.week_number}주차</strong>
                      </div>

                      <span className="pill pill-blue">
                        {(currentRoutineWeek.days || []).length}개 요일
                      </span>
                    </div>

                    <div className="list-stack" style={{ marginTop: '16px' }}>
                      {(currentRoutineWeek.days || []).map((day, dayIndex) => {
                        const routineDayKey = `${currentRoutineWeek.week_number}-${day.day_of_week}-${dayIndex}`
                        const isCollapsed =
                          typeof collapsedRoutineDays[routineDayKey] === 'boolean'
                            ? collapsedRoutineDays[routineDayKey]
                            : true

                        const itemCount = (day.items || []).length
                        const totalSets = (day.items || []).reduce(
                          (sum, item) => sum + ((item.sets || []).length || 0),
                          0,
                        )

                        return (
                          <div key={routineDayKey} className="member-routine-day-card">
                            <button
                              type="button"
                              className="member-routine-day-toggle"
                              onClick={() =>
                                toggleRoutineDay(
                                  currentRoutineWeek.week_number,
                                  day.day_of_week,
                                  dayIndex,
                                )
                              }
                            >
                              <div className="member-routine-day-left">
                                <div className="member-routine-day-title-row">
                                  <strong>{day.day_of_week}요일</strong>
                                  <span className="pill">{itemCount}개 운동</span>
                                  <span className="pill pill-violet">총 {totalSets}세트</span>
                                </div>

                                <div className="member-routine-day-meta">
                                  {itemCount === 0
                                    ? '등록된 운동이 없습니다.'
                                    : `눌러서 ${day.day_of_week}요일 루틴을 확인하세요.`}
                                </div>
                              </div>

                              <span className={`member-routine-day-arrow ${!isCollapsed ? 'open' : ''}`}>
                                ▾
                              </span>
                            </button>

                            {!isCollapsed && (
                              <div className="member-routine-day-body">
                                {(day.items || []).length === 0 ? (
                                  <div className="workout-list-empty">등록된 운동이 없습니다.</div>
                                ) : (
                                  <div className="list-stack">
                                    {(day.items || []).map((item, itemIndex) => (
                                      <div key={itemIndex} className="member-routine-item-card">
                                        <div className="member-routine-item-head">
                                          <div>
                                            <div className="member-routine-item-label">
                                              EXERCISE {itemIndex + 1}
                                            </div>
                                            <strong>
                                              {item.exercise_name_snapshot || `운동 ${itemIndex + 1}`}
                                            </strong>
                                          </div>

                                          <div className="member-routine-item-badges">
                                            {item.duration_minutes ? (
                                              <span className="pill pill-blue">
                                                {item.duration_minutes}분
                                              </span>
                                            ) : null}

                                            <span className="pill pill-green">
                                              {(item.sets || []).length}세트
                                            </span>
                                          </div>
                                        </div>

                                        {item.memo ? (
                                          <div className="member-routine-note-box">
                                            <span>코칭 메모</span>
                                            <p>{item.memo}</p>
                                          </div>
                                        ) : null}

                                        {(item.sets || []).length > 0 ? (
                                          <div className="member-routine-set-grid">
                                            {(item.sets || []).map((setRow, setIndex) => (
                                              <div key={setIndex} className="member-routine-set-card">
                                                <span>{setIndex + 1}세트</span>
                                                <strong>
                                                  {setRow.kg || '-'}kg / {setRow.reps || '-'}회
                                                </strong>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="compact-text">세트 정보 없음</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === '프로그램' && (
  <div className="member-program-page menu-style-page">
    <section className="member-program-hero">
      <div className="member-program-hero-left">
        <div className="member-program-badge">MY PROGRAM</div>
        <h2>프로그램</h2>
        <p className="member-program-hero-text">
          현재 이용 중인 프로그램과 전체 프로그램 정보를 한눈에 확인할 수 있습니다.
          메뉴판처럼 가격, 횟수, 유형, 설명을 보기 쉽게 정리했습니다.
        </p>
      </div>

      <div className="member-program-hero-right">
        <div className="member-program-hero-mini">
          <span>현재 이용 상태</span>
          <strong>{currentProgram ? '이용 중' : '미등록'}</strong>
          <p>
            {currentProgram
              ? `${currentProgram.name || '-'} 프로그램 이용 중`
              : '현재 연결된 프로그램이 없습니다.'}
          </p>
        </div>

        <div className="member-program-hero-mini">
          <span>전체 프로그램 수</span>
          <strong>{filteredPrograms.length}</strong>
          <p>{programSearch?.trim() ? `검색어: ${programSearch}` : '전체 프로그램 표시 중'}</p>
        </div>
      </div>
    </section>

    <section className="member-program-summary-grid">
      <div className="member-program-summary-card">
        <span>현재 프로그램</span>
        <strong>{currentProgram?.name || '-'}</strong>
        <p>회원에게 현재 연결된 프로그램</p>
      </div>

      <div className="member-program-summary-card">
        <span>현재 횟수</span>
        <strong>
          {currentProgram?.session_count ? `${currentProgram.session_count}회` : '-'}
        </strong>
        <p>회차 기준</p>
      </div>

      <div className="member-program-summary-card highlight">
        <span>현재 유형</span>
        <strong>{currentProgram ? (currentProgram.is_vip ? 'VIP' : '일반') : '-'}</strong>
        <p>프로그램 분류</p>
      </div>
    </section>
{featuredPrograms.length > 0 && (
  <section className="card member-program-featured-card">
    <div className="member-program-section-head">
      <div>
        <div className="member-program-section-label">FEATURED PROGRAMS</div>
        <h2>추천 / 인기 프로그램</h2>
        <p className="sub-text">
          운영자가 추천하거나 인기 표시한 프로그램을 먼저 보여드립니다.
        </p>
      </div>
    </div>

    <div className="member-program-featured-grid">
      {featuredPrograms.map((program) => (
        <div key={program.id} className="member-program-featured-item">
          <div className="member-program-menu-chip-row">
            {program.is_recommended ? (
              <span className="member-program-menu-chip vip">추천</span>
            ) : null}
            {program.is_popular ? (
              <span className="member-program-menu-chip normal">인기</span>
            ) : null}
            {currentProgram?.id === program.id ? (
              <span className="member-program-menu-chip active">이용중</span>
            ) : null}
          </div>

          <div className="member-program-featured-top">
            <div>
              <h3>{program.name}</h3>
              <p>{program.session_count || 0}회 프로그램</p>
            </div>
            <strong>{Number(program.price || 0).toLocaleString()}원</strong>
          </div>

          <div className="member-program-menu-description-box compact">
  <div className="member-program-menu-description-label">설명</div>

  <p className={expandedMemberProgramId === program.id ? 'expanded' : ''}>
    {program.description || '설명이 등록되지 않았습니다.'}
  </p>

  {program.description && String(program.description).length > 40 ? (
    <button
      type="button"
      className="member-program-desc-toggle"
      onClick={() =>
        setExpandedMemberProgramId((prev) =>
          prev === program.id ? null : program.id
        )
      }
    >
      {expandedMemberProgramId === program.id ? '접기' : '더보기'}
    </button>
  ) : null}
</div>
        </div>
      ))}
    </div>
  </section>
)}
    <div className="member-program-layout menu-style-layout">
      <section className="card member-program-current-card menu-current-card">
        <div className="member-program-section-head">
          <div>
            <div className="member-program-section-label">CURRENT PROGRAM</div>
            <h2>현재 이용 중인 프로그램</h2>
            <p className="sub-text">
              현재 연결된 프로그램을 대표 카드 형태로 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {currentProgram ? (
          <div className="member-program-current-box menu-current-box">
            <div className="member-program-current-top">
              <div className="member-program-current-title-wrap">
                <div className="member-program-menu-chip active">현재 이용중</div>
                <h3>{currentProgram.name}</h3>
                <p className="member-program-current-price">
                  {Number(currentProgram.price || 0).toLocaleString()}원
                </p>
              </div>

              <div className="member-program-current-side">
                <span className="member-program-type-pill strong">
                  {currentProgram.is_vip ? 'VIP' : '일반'}
                </span>
                <span className="member-program-session-pill">
                  {currentProgram.session_count || 0}회
                </span>
              </div>
            </div>

            <div className="member-program-menu-info-grid">
              <div className="member-program-menu-info-card">
                <span>프로그램명</span>
                <strong>{currentProgram.name}</strong>
              </div>

              <div className="member-program-menu-info-card">
                <span>가격</span>
                <strong>{Number(currentProgram.price || 0).toLocaleString()}원</strong>
              </div>

              <div className="member-program-menu-info-card">
                <span>횟수</span>
                <strong>{currentProgram.session_count || '-'}회</strong>
              </div>

              <div className="member-program-menu-info-card">
                <span>유형</span>
                <strong>{currentProgram.is_vip ? 'VIP' : '일반'}</strong>
              </div>
            </div>

            <div className="member-program-menu-description-box">
  <div className="member-program-menu-description-label">프로그램 설명</div>

  <p className={expandedMemberProgramId === currentProgram.id ? 'expanded' : ''}>
    {currentProgram.description || '설명이 등록되지 않았습니다.'}
  </p>

  {currentProgram.description && String(currentProgram.description).length > 40 ? (
    <button
      type="button"
      className="member-program-desc-toggle"
      onClick={() =>
        setExpandedMemberProgramId((prev) =>
          prev === currentProgram.id ? null : currentProgram.id
        )
      }
    >
      {expandedMemberProgramId === currentProgram.id ? '접기' : '더보기'}
    </button>
  ) : null}
</div>
          </div>
        ) : (
          <div className="empty-box member-program-empty-menu">
            현재 연결된 프로그램이 없습니다.
          </div>
        )}
      </section>

      <section className="card member-program-list-card menu-list-card">
        <div className="member-program-section-head">
          <div>
            <div className="member-program-section-label">ALL PROGRAMS</div>
            <h2>전체 프로그램 메뉴</h2>
            <p className="sub-text">
              가격표처럼 프로그램을 한눈에 비교하고 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="member-program-search-row menu-search-row">
          <input
            value={programSearch}
            onChange={(e) => setProgramSearch(e.target.value)}
            placeholder="프로그램명 / 설명 / 가격 / 횟수 검색"
          />
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="empty-box">조건에 맞는 프로그램이 없습니다.</div>
        ) : (
          <div className="member-program-menu-grid">
            {filteredPrograms.map((program) => {
              const isCurrentProgram = currentProgram?.id === program.id

              return (
                <div
                  key={program.id}
                  className={`member-program-record-card menu-record-card ${
                    isCurrentProgram ? 'current' : ''
                  }`}
                >
                  <div className="member-program-record-head menu-record-head">
                    <div className="member-program-record-title-wrap">
                      <div className="member-program-menu-chip-row">
                        {isCurrentProgram ? (
                          <span className="member-program-menu-chip active">이용중</span>
                        ) : null}
                        <span className={`member-program-menu-chip ${program.is_vip ? 'vip' : 'normal'}`}>
                          {program.is_vip ? 'VIP' : '일반'}
                        </span>
                      </div>

                      <h3>{program.name}</h3>
                      <p className="member-program-record-subline">
                        {program.session_count || 0}회 프로그램
                      </p>
                    </div>

                    <div className="member-program-record-price-box">
                      <strong>{Number(program.price || 0).toLocaleString()}원</strong>
                      <span>{program.session_count || 0}회</span>
                    </div>
                  </div>

                  <div className="member-program-menu-meta">
                    <div className="member-program-menu-meta-item">
                      <span>유형</span>
                      <strong>{program.is_vip ? 'VIP' : '일반'}</strong>
                    </div>

                    <div className="member-program-menu-meta-item">
                      <span>횟수</span>
                      <strong>{program.session_count || 0}회</strong>
                    </div>

                    <div className="member-program-menu-meta-item">
                      <span>가격</span>
                      <strong>{Number(program.price || 0).toLocaleString()}원</strong>
                    </div>
                  </div>

                  <div className="member-program-menu-description-box compact">
  <div className="member-program-menu-description-label">설명</div>

  <p className={expandedMemberProgramId === program.id ? 'expanded' : ''}>
    {program.description || '설명이 등록되지 않았습니다.'}
  </p>

  {program.description && String(program.description).length > 40 ? (
    <button
      type="button"
      className="member-program-desc-toggle"
      onClick={() =>
        setExpandedMemberProgramId((prev) =>
          prev === program.id ? null : program.id
        )
      }
    >
      {expandedMemberProgramId === program.id ? '접기' : '더보기'}
    </button>
  ) : null}
</div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  </div>
)}


      {activeTab === '코치스케줄' && (
  <div className="member-schedule-page">
    <section className="member-schedule-hero">
      <div className="member-schedule-hero-left">
        <div className="member-schedule-badge">COACH SCHEDULE</div>
        <h2>코치스케줄</h2>
        <p className="member-schedule-hero-text">
          월별 코치 근무 일정과 가능한 시간대를 한눈에 확인할 수 있습니다.
          필요한 날의 스케줄을 접고 펼치면서 보기 쉽게 정리했습니다.
        </p>
      </div>

      <div className="member-schedule-hero-right">
        <div className="member-schedule-hero-mini">
          <span>선택 월</span>
          <strong>{scheduleMonth || '-'}</strong>
          <p>현재 조회 중인 코치 스케줄 월입니다.</p>
        </div>

        <div className="member-schedule-hero-mini">
          <span>표시 스케줄 수</span>
          <strong>{filteredSchedules.length}</strong>
          <p>선택한 월 기준 스케줄 개수입니다.</p>
        </div>
      </div>
    </section>

    <section className="member-schedule-summary-grid">
      <div className="member-schedule-summary-card">
        <span>전체 스케줄</span>
        <strong>{filteredSchedules.length}</strong>
        <p>현재 월에 등록된 일정 수</p>
      </div>

      <div className="member-schedule-summary-card">
        <span>근무 일정</span>
        <strong>{filteredSchedules.filter((item) => item.is_working).length}</strong>
        <p>근무로 등록된 일정 수</p>
      </div>

      <div className="member-schedule-summary-card highlight">
        <span>휴무 일정</span>
        <strong>{filteredSchedules.filter((item) => !item.is_working).length}</strong>
        <p>휴무로 등록된 일정 수</p>
      </div>
    </section>

    <section className="card member-schedule-list-card">
      <div className="member-schedule-section-head">
        <div>
          <div className="member-schedule-section-label">MONTHLY SCHEDULE</div>
          <h2>코치 스케줄</h2>
          <p className="sub-text">
            월을 선택하면 해당 월 코치 스케줄과 가능시간을 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="member-schedule-filter-row">
        <input
          type="month"
          value={scheduleMonth}
          onChange={(e) => setScheduleMonth(e.target.value)}
        />
      </div>

      <div className="list-stack">
        {filteredSchedules.length === 0 ? (
          <div className="empty-box">선택한 월의 스케줄이 없습니다.</div>
        ) : (
          filteredSchedules.map((schedule) => {
            const coach = coaches.find((item) => item.id === schedule.coach_id)
            const collapsed = collapsedSchedules[schedule.id] ?? true
            const slots = coachScheduleSlotsMap[schedule.id] || []

            return (
              <div key={schedule.id} className="member-schedule-record-card">
                <div className="member-schedule-record-head">
                  <div>
                    <div className="member-schedule-record-topline">
                      <span className="member-schedule-coach-pill">{coach?.name || '코치'}</span>
                      <span className="member-schedule-date-pill">{schedule.schedule_date}</span>
                    </div>

                    <h3>
                      {schedule.is_working
                        ? `${schedule.work_start || '-'} ~ ${schedule.work_end || '-'}`
                        : '휴무'}
                    </h3>

                    <p>
                      가능시간 {slots.length}개
                      {schedule.memo ? ` · 메모 있음` : ''}
                    </p>
                  </div>

                  <span className={`member-schedule-status-pill ${schedule.is_working ? 'working' : 'off'}`}>
                    {schedule.is_working ? '근무' : '휴무'}
                    {schedule.is_weekend_work ? ' / 주말근무' : ''}
                  </span>
                </div>

                <div className="inline-actions wrap">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() =>
                      setCollapsedSchedules((prev) => ({
                        ...prev,
                        [schedule.id]: !collapsed,
                      }))
                    }
                  >
                    {collapsed ? '상세히보기' : '간략히보기'}
                  </button>
                </div>

                {!collapsed ? (
                  <div className="member-schedule-record-body">
                    <div className="member-schedule-detail-grid">
                      <div className="detail-box">
                        <p><strong>코치:</strong> {coach?.name || '-'}</p>
                        <p><strong>근무상태:</strong> {schedule.is_working ? '근무' : '휴무'}</p>
                        <p><strong>주말근무:</strong> {schedule.is_weekend_work ? '예' : '아니오'}</p>
                      </div>

                      <div className="detail-box">
                        <p><strong>근무시간:</strong> {schedule.work_start || '-'} ~ {schedule.work_end || '-'}</p>
                        <p><strong>메모:</strong> {schedule.memo || '-'}</p>
                      </div>

                      <div className="detail-box member-schedule-detail-full">
                        <p><strong>가능시간:</strong></p>
                        <p>
                          {slots.length > 0
                            ? slots.map((slot) => slot.slot_time).join(', ')
                            : '없음'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </section>
  </div>
)}

      {activeTab === '공지사항' && (
  <div className="member-notice-page">
    <section className="member-notice-hero">
      <div className="member-notice-hero-left">
        <div className="member-notice-badge">NOTICE & EVENT</div>
        <h2>공지사항</h2>
        <p className="member-notice-hero-text">
          공지, 이벤트, 운동영상 안내를 카테고리별로 확인할 수 있습니다.
          필요한 공지를 접고 펼치면서 편하게 읽을 수 있도록 구성했습니다.
        </p>
      </div>

      <div className="member-notice-hero-right">
        <div className="member-notice-hero-mini">
          <span>표시 공지 수</span>
          <strong>{publishedNotices.length}</strong>
          <p>검색과 카테고리 필터가 반영된 결과입니다.</p>
        </div>

        <div className="member-notice-hero-mini">
          <span>현재 카테고리</span>
          <strong>{noticeCategoryFilter === 'all' ? '전체' : noticeCategoryFilter}</strong>
          <p>{noticeSearch?.trim() ? `검색어: ${noticeSearch}` : '검색어 없음'}</p>
        </div>
      </div>
    </section>

    <section className="member-notice-summary-grid">
      <div className="member-notice-summary-card">
        <span>전체 표시</span>
        <strong>{publishedNotices.length}</strong>
        <p>현재 화면에 보이는 공지 수</p>
      </div>

      <div className="member-notice-summary-card">
        <span>공지</span>
        <strong>{publishedNotices.filter((item) => item.category === '공지').length}</strong>
        <p>공지 카테고리 수</p>
      </div>

      <div className="member-notice-summary-card highlight">
        <span>이벤트/운동영상</span>
        <strong>
          {
            publishedNotices.filter(
              (item) => item.category === '이벤트' || item.category === '운동영상'
            ).length
          }
        </strong>
        <p>이벤트와 운동영상 안내 수</p>
      </div>
    </section>

    <section className="card member-notice-list-card">
      <div className="member-notice-section-head">
        <div>
          <div className="member-notice-section-label">SEARCH NOTICE</div>
          <h2>공지 / 이벤트</h2>
          <p className="sub-text">
            제목, 내용, 카테고리로 검색하고 카테고리별로 공지를 구분해서 볼 수 있습니다.
          </p>
        </div>
      </div>

      <div className="member-notice-filter-grid">
        <input
          value={noticeSearch}
          onChange={(e) => setNoticeSearch(e.target.value)}
          placeholder="제목 / 내용 / 카테고리 검색"
        />

        <select
          value={noticeCategoryFilter}
          onChange={(e) => setNoticeCategoryFilter(e.target.value)}
        >
          <option value="all">전체 카테고리</option>
          <option value="공지">공지</option>
          <option value="이벤트">이벤트</option>
          <option value="운동영상">운동영상</option>
        </select>
      </div>

      <div className="list-stack">
        {publishedNotices.length === 0 ? (
          <div className="empty-box">조건에 맞는 공지가 없습니다.</div>
        ) : (
          publishedNotices.map((notice) => {
            const collapsed = collapsedNotices[notice.id] ?? true

            return (
              <div key={notice.id} className="member-notice-record-card">
                <div className="member-notice-record-head">
                  <div>
                    <div className="member-notice-record-topline">
                      <span className="member-notice-category-pill">{notice.category || '-'}</span>
                    </div>

                    <h3>{notice.title}</h3>

                    <p>
                      간략히보기: {notice.content?.slice(0, 60) || ''}
                      {notice.content?.length > 60 ? '...' : ''}
                    </p>
                  </div>
                </div>

                <div className="inline-actions wrap">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() =>
                      setCollapsedNotices((prev) => ({
                        ...prev,
                        [notice.id]: !collapsed,
                      }))
                    }
                  >
                    {collapsed ? '상세히보기' : '간략히보기'}
                  </button>
                </div>

                {!collapsed ? (
                  <div className="member-notice-record-body">
                    <div className="member-notice-detail-grid">
                      <div className="detail-box member-notice-detail-full">
                        <p><strong>내용:</strong> {notice.content || '-'}</p>
                      </div>

                      <div className="detail-box">
                        <p><strong>이미지 URL:</strong> {notice.image_url || '-'}</p>
                        <p><strong>영상 URL:</strong> {notice.video_url || '-'}</p>
                      </div>

                      <div className="detail-box">
                        <p><strong>기간:</strong> {formatDate(notice.starts_at)} ~ {formatDate(notice.ends_at)}</p>
                        <p><strong>카테고리:</strong> {notice.category || '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </section>
  </div>
)}
      {activeTab === '제휴업체' && (
  <div className="member-partner-page">
    <section className="member-partner-hero">
      <div className="member-partner-hero-left">
        <div className="member-partner-badge">PARTNER BENEFIT</div>
        <h2>제휴업체</h2>
        <p className="member-partner-hero-text">
          이용 가능한 제휴업체와 혜택을 한눈에 보고,
          상세 내용 확인과 혜택 사용 요청까지 편하게 할 수 있습니다.
        </p>
      </div>

      <div className="member-partner-hero-right">
        <div className="member-partner-hero-mini">
          <span>검색 결과</span>
          <strong>{filteredPartners.length}</strong>
          <p>현재 조건에 맞는 제휴업체 수입니다.</p>
        </div>

        <div className="member-partner-hero-mini">
          <span>선택 업체</span>
          <strong>{selectedPartner?.name || '-'}</strong>
          <p>{selectedPartner ? '상세 정보 확인 가능' : '업체를 먼저 선택해주세요.'}</p>
        </div>
      </div>
    </section>

    <section className="member-partner-summary-grid">
      <div className="member-partner-summary-card">
        <span>전체 표시</span>
        <strong>{filteredPartners.length}</strong>
        <p>현재 화면에 보이는 제휴업체 수</p>
      </div>

      <div className="member-partner-summary-card">
        <span>선택 카테고리</span>
        <strong>{partnerCategoryFilter === 'all' ? '전체' : partnerCategoryFilter}</strong>
        <p>현재 필터 기준</p>
      </div>

      <div className="member-partner-summary-card highlight">
        <span>내 인증코드</span>
        <strong>{accessCode || '-'}</strong>
        <p>제휴 사용 시 확인용 코드</p>
      </div>
    </section>

    <div className="member-partner-layout">
      <section className="card member-partner-list-card">
        <div className="member-partner-section-head">
          <div>
            <div className="member-partner-section-label">SEARCH PARTNER</div>
            <h2>제휴업체 목록</h2>
            <p className="sub-text">
              업체명, 카테고리, 혜택, 주소 기준으로 검색해서 상세보기를 할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="member-partner-filter-grid">
          <input
            placeholder="업체명 / 카테고리 / 혜택 / 주소 검색"
            value={partnerSearch}
            onChange={(e) => setPartnerSearch(e.target.value)}
          />

          <select
            value={partnerCategoryFilter}
            onChange={(e) => setPartnerCategoryFilter(e.target.value)}
          >
            <option value="all">전체 카테고리</option>
            <option value="카페">카페</option>
            <option value="병원">병원</option>
            <option value="마사지">마사지</option>
            <option value="식당">식당</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className="list-stack">
          {filteredPartners.length === 0 ? (
            <div className="empty-box">이용 가능한 제휴업체가 없습니다.</div>
          ) : (
            filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className={`member-partner-record-card ${selectedPartnerId === partner.id ? 'selected' : ''}`}
              >
                <div className="member-partner-record-head">
                  <div>
                    <h3>{partner.name || '-'}</h3>
                    <p>
                      {partner.category || '-'} / {partner.phone || '-'}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setSelectedPartnerId(partner.id)}
                  >
                    자세히보기
                  </button>
                </div>

                <div className="detail-box">
                  <p>
                    <strong>혜택:</strong>{' '}
                    {(partner.benefit || '').slice(0, 80)}
                    {(partner.benefit || '').length > 80 ? '...' : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card member-partner-detail-card">
        <div className="member-partner-section-head">
          <div>
            <div className="member-partner-section-label">PARTNER DETAIL</div>
            <h2>{selectedPartner?.name || '제휴업체 상세'}</h2>
            <p className="sub-text">
              선택한 제휴업체의 혜택, 사용 조건, 사용 기록을 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {selectedPartner ? (
          <div className="stack-gap">
            <div className="member-partner-detail-grid">
              <div className="detail-box">
                <p><strong>카테고리:</strong> {selectedPartner.category || '-'}</p>
                <p><strong>한줄 소개:</strong> {selectedPartner.description || '-'}</p>
                <p><strong>혜택:</strong> {selectedPartner.benefit || '-'}</p>
                <p><strong>사용 조건:</strong> {selectedPartner.usage_condition || '-'}</p>
              </div>

              <div className="detail-box">
                <p><strong>사용 방법:</strong> {selectedPartner.usage_guide || '-'}</p>
                <p><strong>주의사항:</strong> {selectedPartner.caution || '-'}</p>
                <p><strong>주소:</strong> {selectedPartner.address || '-'}</p>
                <p><strong>연락처:</strong> {selectedPartner.phone || '-'}</p>
              </div>

              <div className="detail-box">
                <p><strong>운영시간:</strong> {selectedPartner.business_hours || '-'}</p>
                <p><strong>내 인증코드:</strong> {accessCode || '-'}</p>
                <p><strong>승인 방식:</strong> {selectedPartner.approval_required ? '관리자 승인 필요' : '즉시 사용 처리'}</p>
                <p><strong>최근 사용일:</strong> {selectedPartnerUsageSummary.recentUsedAt ? String(selectedPartnerUsageSummary.recentUsedAt).slice(0, 10) : '-'}</p>
              </div>

              <div className="detail-box">
                <p><strong>이번 달 사용:</strong> {selectedPartnerUsageSummary.approvedCountThisMonth}회</p>
                <p><strong>기본 가능 횟수:</strong> {selectedPartner.monthly_limit ?? 0}회</p>
                <p><strong>추가 혜택 횟수:</strong> {selectedPartnerUsageSummary.extraLimit}회</p>
                <p><strong>이번 달 총 가능 횟수:</strong> {selectedPartnerUsageSummary.totalLimit}회</p>
                <p><strong>남은 횟수:</strong> {selectedPartnerUsageSummary.remainingCount}회</p>
              </div>
            </div>

            <div className="member-partner-request-box">
              <h3>제휴 혜택 사용 요청</h3>

              <label className="field">
                <span>메모 (선택)</span>
                <textarea
                  rows="3"
                  value={partnerUsageForm.note}
                  onChange={(e) =>
                    setPartnerUsageForm({ ...partnerUsageForm, note: e.target.value })
                  }
                  placeholder="예: 3월 혜택 사용 요청"
                />
              </label>

              <div className="inline-actions wrap">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handlePartnerUsageSubmit}
                >
                  혜택 사용 요청
                </button>
              </div>
            </div>

            <div className="member-partner-history-box">
              <h3>내 제휴 사용 기록</h3>

              <div className="list-stack">
                {partnerUsages.filter((usage) => usage.partner_id === selectedPartner.id).length === 0 ? (
                  <div className="empty-box">아직 이 업체 사용 기록이 없습니다.</div>
                ) : null}

                {partnerUsages
                  .filter((usage) => usage.partner_id === selectedPartner.id)
                  .map((usage) => (
                    <div key={usage.id} className="member-partner-history-card">
                      <div className="member-partner-history-head">
                        <strong>{String(usage.requested_at || '').slice(0, 10) || '-'}</strong>
                        <span className="member-partner-status-pill">
                          {usage.status === 'approved'
                            ? '승인완료'
                            : usage.status === 'rejected'
                            ? '반려'
                            : '승인대기'}
                        </span>
                      </div>

                      <div className="detail-box">
                        <p><strong>요청일시:</strong> {usage.requested_at || '-'}</p>
                        <p><strong>승인일시:</strong> {usage.approved_at || '-'}</p>
                        <p><strong>메모:</strong> {usage.note || '-'}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-box">왼쪽에서 제휴업체를 선택해주세요.</div>
        )}
      </section>
    </div>
  </div>
)}
            {activeTab === '병의원·약국 소개' && (
  <div className="member-medical-page">
    <section className="member-medical-hero">
      <div className="member-medical-hero-left">
        <div className="member-medical-badge">MEDICAL GUIDE</div>
        <h2>병의원·약국 소개</h2>
        <p className="member-medical-hero-text">
          운동 중 통증, 검사, 처방 상담이 필요할 때 참고할 수 있는 병의원·약국 정보를
          보기 쉽게 정리한 안내 화면입니다.
        </p>
      </div>

      <div className="member-medical-hero-right">
        <div className="member-medical-hero-mini">
          <span>검색 결과</span>
          <strong>{filteredMedicalPartners.length}</strong>
          <p>현재 조건에 맞는 안내 수입니다.</p>
        </div>

        <div className="member-medical-hero-mini">
          <span>선택 항목</span>
          <strong>{selectedMedicalPartner?.name || '-'}</strong>
          <p>{selectedMedicalPartner ? '상세 안내 확인 가능' : '항목을 먼저 선택해주세요.'}</p>
        </div>
      </div>
    </section>

    <section className="member-medical-summary-grid">
      <div className="member-medical-summary-card">
        <span>전체 표시</span>
        <strong>{filteredMedicalPartners.length}</strong>
        <p>현재 화면에 보이는 안내 수</p>
      </div>

      <div className="member-medical-summary-card">
        <span>선택 카테고리</span>
        <strong>{medicalPartnerCategoryFilter === 'all' ? '전체' : medicalPartnerCategoryFilter}</strong>
        <p>현재 필터 기준</p>
      </div>

      <div className="member-medical-summary-card highlight">
        <span>상세 상태</span>
        <strong>{selectedMedicalPartner ? '선택됨' : '미선택'}</strong>
        <p>오른쪽 상세안내 표시 여부</p>
      </div>
    </section>

    <div className="member-medical-layout">
      <section className="card member-medical-list-card">
        <div className="member-medical-section-head">
          <div>
            <div className="member-medical-section-label">SEARCH MEDICAL</div>
            <h2>병의원·약국 목록</h2>
            <p className="sub-text">
              이름, 카테고리, 주소 기준으로 검색해서 항목을 선택할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="member-medical-filter-grid">
          <label className="field">
            <span>검색</span>
            <input
              value={medicalPartnerSearch}
              onChange={(e) => setMedicalPartnerSearch(e.target.value)}
              placeholder="이름, 카테고리, 주소 검색"
            />
          </label>

          <label className="field">
            <span>카테고리</span>
            <select
              value={medicalPartnerCategoryFilter}
              onChange={(e) => setMedicalPartnerCategoryFilter(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="정형외과">정형외과</option>
              <option value="재활의학과">재활의학과</option>
              <option value="한의원">한의원</option>
              <option value="약국">약국</option>
              <option value="영상검사">영상검사</option>
              <option value="기타">기타</option>
            </select>
          </label>
        </div>

        <div className="list-stack">
          {filteredMedicalPartners.length === 0 ? (
            <div className="empty-box">안내 가능한 병의원·약국 정보가 없습니다.</div>
          ) : (
            filteredMedicalPartners.map((item) => (
              <div
                key={item.id}
                className={`member-medical-record-card ${selectedMedicalPartnerId === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedMedicalPartnerId(item.id)}
              >
                <div className="member-medical-record-head">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.place_type} · {item.category}</p>
                  </div>
                  <span className="member-medical-type-pill">안내</span>
                </div>

                <div className="detail-box">
                  <p>{item.short_description || '-'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card member-medical-detail-card">
        <div className="member-medical-section-head">
          <div>
            <div className="member-medical-section-label">MEDICAL DETAIL</div>
            <h2>상세 안내</h2>
            <p className="sub-text">회원님의 상태에 따라 참고용으로 확인해주세요.</p>
          </div>
        </div>

        {selectedMedicalPartner ? (
          <div className="member-medical-detail-grid">
            <div className="detail-box">
              <p><strong>이름:</strong> {selectedMedicalPartner.name || '-'}</p>
              <p><strong>구분:</strong> {selectedMedicalPartner.place_type || '-'}</p>
              <p><strong>카테고리:</strong> {selectedMedicalPartner.category || '-'}</p>
              <p><strong>한줄 소개:</strong> {selectedMedicalPartner.short_description || '-'}</p>
            </div>

            <div className="detail-box">
              <p><strong>추천 이유:</strong> {selectedMedicalPartner.recommend_reason || '-'}</p>
              <p><strong>이런 분께 추천:</strong> {selectedMedicalPartner.recommended_for || '-'}</p>
              <p><strong>주의사항:</strong> {selectedMedicalPartner.caution || '-'}</p>
            </div>

            <div className="detail-box">
              <p><strong>주소:</strong> {selectedMedicalPartner.address || '-'}</p>
              <p><strong>전화번호:</strong> {selectedMedicalPartner.phone || '-'}</p>
              <p><strong>운영/진료 시간:</strong> {selectedMedicalPartner.business_hours || '-'}</p>
            </div>

            <div className="detail-box">
              <p><strong>주차 안내:</strong> {selectedMedicalPartner.parking_info || '-'}</p>
              <p><strong>예약 방법:</strong> {selectedMedicalPartner.reservation_guide || '-'}</p>
            </div>
          </div>
        ) : (
          <div className="empty-box">왼쪽에서 병의원·약국 항목을 선택해주세요.</div>
        )}
      </section>
    </div>
  </div>
)}
      {activeTab === '문의사항' && (
  <div className="member-inquiry-page">
    <section className="member-inquiry-hero">
      <div className="member-inquiry-hero-left">
        <div className="member-inquiry-badge">INQUIRY</div>
        <h2>문의사항</h2>
        <p className="member-inquiry-hero-text">
          문의를 바로 작성하고, 내가 남긴 문의 내역과 답변 상태를 함께 확인할 수 있습니다.
          모바일에서도 입력하기 쉽게 구성했습니다.
        </p>
      </div>

      <div className="member-inquiry-hero-right">
        <div className="member-inquiry-hero-mini">
          <span>등록 문의 수</span>
          <strong>{inquiries.length}</strong>
          <p>지금까지 등록된 전체 문의 수입니다.</p>
        </div>

        <div className="member-inquiry-hero-mini">
          <span>답변 완료</span>
          <strong>{inquiries.filter((item) => item.answer).length}</strong>
          <p>답변이 등록된 문의 수입니다.</p>
        </div>
      </div>
    </section>

<details className="member-guide-card">
  <summary className="member-guide-summary">
    💬 문의는 이렇게 남기면 됩니다
  </summary>

  <div className="member-guide-grid">
    <div className="member-guide-item">
      <strong>문의 작성</strong>
      <span>→ 궁금한 점이나 어려운 점을 직접 남길 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>답변 상태 확인</strong>
      <span>→ 답변대기인지 답변완료인지 바로 볼 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>내 문의내역 다시 보기</strong>
      <span>→ 이전에 남긴 문의도 확인할 수 있어요</span>
    </div>

    <div className="member-guide-item">
      <strong>👉 이렇게 사용하세요</strong>
      <span>→ 혼자 해결하기 어려운 내용은 여기서 바로 남겨보세요</span>
    </div>
  </div>
</details>


    
    <section className="member-inquiry-summary-grid">
      <div className="member-inquiry-summary-card">
        <span>전체 문의</span>
        <strong>{inquiries.length}</strong>
        <p>내가 등록한 문의 전체 수</p>
      </div>

      <div className="member-inquiry-summary-card">
        <span>답변 대기</span>
        <strong>{inquiries.filter((item) => !item.answer).length}</strong>
        <p>아직 답변이 없는 문의 수</p>
      </div>

      <div className="member-inquiry-summary-card highlight">
        <span>답변 완료</span>
        <strong>{inquiries.filter((item) => item.answer).length}</strong>
        <p>답변이 등록된 문의 수</p>
      </div>
    </section>

    <div className="member-inquiry-layout">
      <section className="card member-inquiry-form-card">
        <div className="member-inquiry-section-head">
          <div>
            <div className="member-inquiry-section-label">WRITE INQUIRY</div>
            <h2>문의 작성</h2>
            <p className="sub-text">
              이름, 연락처, 문의 내용을 입력하고 코치님만 보기 여부를 선택할 수 있습니다.
            </p>
          </div>
        </div>

        <form className="stack-gap" onSubmit={handleInquirySubmit}>
          <label className="field">
            <span>이름</span>
            <input
              value={inquiryForm.name}
              onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
            />
          </label>

          <label className="field">
            <span>연락처</span>
            <input
              value={inquiryForm.phone}
              onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
              placeholder="연락 가능한 번호"
            />
          </label>

          <label className="field">
            <span>문의 내용</span>
            <textarea
              rows="8"
              value={inquiryForm.content}
              onChange={(e) => setInquiryForm({ ...inquiryForm, content: e.target.value })}
              placeholder="문의하실 내용을 적어주세요."
            />
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={!!inquiryForm.is_private}
              onChange={(e) => setInquiryForm({ ...inquiryForm, is_private: e.target.checked })}
            />
            <span>코치님만 보이게</span>
          </label>

          <div className="inline-actions wrap">
            <button className="primary-btn" type="submit">
              문의 등록
            </button>
            <button type="button" className="secondary-btn" onClick={resetInquiryForm}>
              초기화
            </button>
          </div>
        </form>
      </section>

      <section className="card member-inquiry-list-card">
        <div className="member-inquiry-section-head">
          <div>
            <div className="member-inquiry-section-label">MY INQUIRIES</div>
            <h2>내 문의내역</h2>
            <p className="sub-text">
              문의별 답변 여부를 확인하고, 필요하면 상세보기 또는 삭제를 할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="list-stack">
          {inquiries.length === 0 ? (
            <div className="empty-box">등록된 문의가 없습니다.</div>
          ) : (
            inquiries.map((item) => {
              const collapsed = collapsedInquiries[item.id] ?? true

              return (
                <div key={item.id} className="member-inquiry-record-card">
                  <div className="member-inquiry-record-head">
                    <div>
                      <div className="member-inquiry-record-topline">
                        <span className="member-inquiry-date-pill">
                          {item.created_at?.slice(0, 10) || '문의내역'}
                        </span>
                      </div>

                      <h3>{item.answer ? '답변완료 문의' : '답변대기 문의'}</h3>

                      <p>
                        간략히보기: {(item.content || '').slice(0, 50)}
                        {(item.content || '').length > 50 ? '...' : ''}
                      </p>

                      <p>
                        {item.is_private ? '코치님만 보기 문의' : '일반 문의'} /{' '}
                        {item.is_secret_reply ? '비밀답변' : '일반답변'}
                      </p>
                    </div>

                    <span className={`member-inquiry-status-pill ${item.answer ? 'done' : 'wait'}`}>
                      {item.answer ? '답변완료' : '답변대기'}
                    </span>
                  </div>

                  <div className="inline-actions wrap">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        setCollapsedInquiries((prev) => ({
                          ...prev,
                          [item.id]: !collapsed,
                        }))
                      }
                    >
                      {collapsed ? '상세히보기' : '간략히보기'}
                    </button>

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleInquiryDelete(item.id)}
                    >
                      삭제
                    </button>
                  </div>

                  {!collapsed ? (
                    <div className="member-inquiry-detail-grid">
                      <div className="detail-box">
                        <p><strong>이름:</strong> {item.name || '-'}</p>
                        <p><strong>연락처:</strong> {item.phone || '-'}</p>
                        <p><strong>문의유형:</strong> {item.is_private ? '코치님만 보기' : '일반 문의'}</p>
                      </div>

                      <div className="detail-box">
                        <p><strong>답변유형:</strong> {item.is_secret_reply ? '비밀답변' : '일반답변'}</p>
                        <p><strong>답변:</strong> {item.answer || '아직 답변이 없습니다.'}</p>
                      </div>

                      <div className="detail-box member-inquiry-detail-full">
                        <p><strong>문의 내용:</strong> {item.content || '-'}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  </div>
)}
{activeTab === '사용방법' && (
  <div className="member-manual-page">
    <section className="member-manual-hero">
      <div className="member-manual-hero-left">
        <div className="member-manual-badge">USER GUIDE</div>
        <h2>{manual?.title || '사용방법'}</h2>
        <p className="member-manual-hero-text">
          회원 화면에서 각 탭을 어떻게 활용하면 되는지 한 번에 확인할 수 있는 안내 화면입니다.
        </p>
      </div>

      <div className="member-manual-hero-right">
        <div className="member-manual-hero-mini">
          <span>안내 상태</span>
          <strong>{manual?.content ? '등록됨' : '미등록'}</strong>
          <p>{manual?.content ? '현재 사용방법 안내가 등록되어 있습니다.' : '아직 등록된 사용방법이 없습니다.'}</p>
        </div>

        <div className="member-manual-hero-mini">
          <span>문서 제목</span>
          <strong>{manual?.title || '사용방법'}</strong>
          <p>관리자가 작성한 회원 안내 문서입니다.</p>
        </div>
      </div>
    </section>

    <section className="member-manual-summary-grid">
      <div className="member-manual-summary-card">
        <span>제목</span>
        <strong>{manual?.title || '-'}</strong>
        <p>현재 표시 중인 안내 문서 제목</p>
      </div>

      <div className="member-manual-summary-card highlight">
        <span>안내 상태</span>
        <strong>{manual?.content ? '사용 가능' : '비어 있음'}</strong>
        <p>등록 여부 기준</p>
      </div>
    </section>

    <section className="card member-manual-content-card">
      <div className="member-manual-section-head">
        <div>
          <div className="member-manual-section-label">MANUAL CONTENT</div>
          <h2>{manual?.title || '사용방법'}</h2>
          <p className="sub-text">
            아래 내용을 읽고 회원 화면을 이용해주세요.
          </p>
        </div>
      </div>

      <div className="member-manual-pre-wrap">
        <pre className="pre-text">{manual?.content || '아직 등록된 사용방법이 없습니다.'}</pre>
      </div>
    </section>
  </div>
)}
      </div>
  )
}   
