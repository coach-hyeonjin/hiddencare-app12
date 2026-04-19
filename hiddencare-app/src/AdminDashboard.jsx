import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import logo from './assets/logo.png'

const TABS = [
  '회원',
  '회원상세',
  '기록작성',
  '운동DB',
  '식단',
  '식단설정',
  '통계',
  '활동랭킹',
  '회원레벨설정',
  '운영대시보드',
  '코치관리',
  '리포트',
  '나만의 매니저',
  '코치스케줄',
  '매출기록',
  '세일즈일지',
  '프로그램',
  '공지사항',
  '사용방법',
  '제휴업체',
  '병의원·약국 소개',
  '문의사항',
]

const emptyMemberForm = {
  name: '',
  goal: '',
  total_sessions: 20,
  used_sessions: 0,
  start_date: '',
  end_date: '',
  memo: '',
  access_code: '',
  current_program_id: '',
}

const createEmptySet = () => ({ kg: '', reps: '' })

const createEmptySubExercise = () => ({
  exercise_id: '',
  exercise_name_snapshot: '',
  equipment_name_snapshot: '',
  performed_name: '',
  sets: [createEmptySet()],
})

const createDefaultRoutineDays = () => [
  { day_of_week: '월', items: [] },
  { day_of_week: '화', items: [] },
  { day_of_week: '수', items: [] },
  { day_of_week: '목', items: [] },
  { day_of_week: '금', items: [] },
  { day_of_week: '토', items: [] },
  { day_of_week: '일', items: [] },
]

const createEmptyRoutineWeek = (weekNumber = 1) => ({
  week_number: weekNumber,
  days: createDefaultRoutineDays(),
})

const emptyRoutineForm = {
  title: '',
  weeks: [createEmptyRoutineWeek(1)],
}

const emptyWorkoutItem = {
  exercise_id: '',
  exercise_name_snapshot: '',
  equipment_name_snapshot: '',
  performed_name: '',

  entry_type: 'strength', // strength | cardio | care | stretching | pain_only
  is_cardio: false,
  cardio_minutes: '',
  care_minutes: '',
  stretch_minutes: '',
  stretch_reps: '',

  sets: [createEmptySet()],
  training_method: 'normal', // normal | superset | dropset
  method_note: '',
  sub_exercises: [createEmptySubExercise(), createEmptySubExercise()],
  collapsed: false,
}
const emptyPainLog = {
  pain_type: 'existing',
  body_part: '',
  movement_name: '',
  pain_score: 0,
  pain_timing: '',
  pain_note: '',
}

const getPainScoreLabel = (score) => {
  const value = Number(score || 0)

  if (value <= 2) return '문제 없음'
  if (value <= 4) return '주의'
  if (value <= 6) return '조절 필요'
  if (value <= 8) return '중단 고려'
  return '운동 중단 필요'
}
const emptyWorkoutForm = {
  id: null,
  member_id: '',
  workout_date: new Date().toISOString().slice(0, 10),
  workout_type: 'pt',
  good: '',
  improve: '',
items: [{ ...emptyWorkoutItem, sub_exercises: [createEmptySubExercise(), createEmptySubExercise()] }],
  pain_enabled: false,
pain_logs: [],
}

const emptyBrandForm = { name: '' }

const emptyExerciseForm = {
  name: '',
  body_part: '',
  category: '',
  brand_id: '',
  guide_text: '',
}

const defaultBulkExerciseText = `뉴텍|시티드 디클라인 체스트 프레스|가슴|머신
뉴텍|시티드 체스트 프레스|가슴|머신
뉴텍|펙덱 플라이|가슴|머신`

const timeSlotOptions = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
]

const emptyProgramForm = {
  id: null,
  name: '',
  price: '',
  session_count: '',
  description: '',
  is_vip: false,
  is_active: true,
  is_recommended: false,
  is_popular: false,
  is_visible_to_members: true,
  display_order: 0,
}

const emptyNoticeForm = {
  id: null,
  title: '',
  content: '',
  category: '공지',
  image_url: '',
  video_url: '',
  is_published: true,
  starts_at: '',
  ends_at: '',
}
const emptyPartnerForm = {
  id: null,
  name: '',
  category: '카페',
  description: '',
  benefit: '',
  usage_condition: '',
  usage_guide: '',
  caution: '',
  address: '',
  phone: '',
  business_hours: '',
  manager_name: '',
  manager_phone: '',
  monthly_limit: 1,
  vip_extra_limit: 0,
  approval_required: true,
  is_active: true,
}
const emptyMedicalPartnerForm = {
  id: null,
  name: '',
  category: '정형외과',
  place_type: '병원',
  short_description: '',
  recommend_reason: '',
  recommended_for: '',
  address: '',
  phone: '',
  business_hours: '',
  parking_info: '',
  reservation_guide: '',
  caution: '',
  manager_name: '',
  manager_phone: '',
  is_active: true,
}

const emptyFoodMasterForm = {
  name: '',
  aliases: '',
  category_major: 'protein',
  category_minor: 'animal_protein',
  source_type: 'animal',
  kcal_per_100g: '',
  carbs_per_100g: '',
  protein_per_100g: '',
  fat_per_100g: '',
  saturated_fat_per_100g: '',
  unsaturated_fat_per_100g: '',
  sugar_per_100g: '',
  fiber_per_100g: '',
  sodium_mg_per_100g: '',
  typical_portion_g: '',
  tags: '',
  note: '',
}


const emptySaleForm = {
  id: null,
  member_id: '',
  program_id: '',
  sale_date: new Date().toISOString().slice(0, 10),
  amount: '',
  payment_method: '카드',
  installment_months: 0,
  cash_receipt_issued: false,
  purchased_session_count: 0,
  service_session_count: 0,
  is_vip: false,
  memo: '',
}

const emptySalesLogForm = {
  id: null,
  log_date: new Date().toISOString().slice(0, 10),
  activity_time: '12:00',
  coach_name: '',
  lead_name: '',
  phone: '',
  age_group: '',
  gender: '',
  member_type: '신규',
  source_channel: '',
  ot_reason: '',
  contact_reason: '',
  main_need: '',
  pain_point: '',
  consultation_flow: '',
  consultation_method: [],
  sales_method: [],
  reaction_summary: '',
  emotion_status: '보통',
  current_stage: '첫접점',
  sales_result: '진행중',
  proposal_product: '',
  proposal_price: '',
  conversion_score: 'middle',
  fail_reason: '',
  follow_up_action: '',
  next_contact_date: '',
  expected_close_date: '',
  greeted_to: '',
  greeting_count: 0,
  greeted_three_plus: false,
  ot_count: 0,
  diary: '',
}
const emptyCoachConditionForm = {
  id: null,
  coach_id: '',
  check_month: new Date().toISOString().slice(0, 7),

  condition_checks: [],
  fatigue_checks: [],
  stress_checks: [],
  focus_checks: [],

  condition_score: 3,
  fatigue_score: 1,
  stress_score: 1,
  focus_score: 3,

  lead_actions: [],
  retention_actions: [],
  sales_actions: [],
  growth_actions: [],

  performance_score: 0,
  performance_level: '',
  status_level: '',

  monthly_goal_revenue: '',
  monthly_goal_new_leads: '',
  monthly_goal_retention: '',
  monthly_goal_content: '',

  condition_note: '',
  fatigue_note: '',
  stress_note: '',
  focus_note: '',
  burnout_note: '',
  today_comment: '',

  support_needed: '',
  issue_note: '',
}
const emptyCoachGoalForm = {
  coach_id: '',
  goal_month: new Date().toISOString().slice(0, 7),
  monthly_goal_revenue: '',
  monthly_goal_new_leads: '',
  monthly_goal_retention: '',
  monthly_goal_content: '',
  support_needed: '',
  issue_note: '',
}
const emptyCoachReviewForm = {
  id: null,
  coach_id: '',
  review_month: new Date().toISOString().slice(0, 7),
  revenue_score: 0,
  activity_score: 0,
  sales_score: 0,
  attitude_score: 0,
  total_score: 0,
  manager_comment: '',
}
const salesMemberTypeOptions = ['신규', '기존회원', '휴면회원', '지인소개', '워크인']
const salesSourceOptions = ['워크인', '블로그', '인스타', '지인소개', '회원소개', '재문의', '전화문의', '기타']
const salesOtReasonOptions = ['체형교정', '통증관리', '다이어트', '근력증가', '재활운동', '운동배우기', '기구사용법', '라인관리', '기타']
const salesConsultationMethodOptions = ['센터소개', '목표질문', '체형평가', '움직임평가', '인바디', '간단운동체험', '통증체크', '프로그램설명', '가격안내']
const salesMethodOptions = ['친근한인사', '불편부위질문', '운동목적질문', '공감위주대화', '체형평가중심', '통증해결중심', '운동시연중심', '후기사례설명', '필요성먼저설명', '장기플랜제안', '단기체험제안', '이벤트안내', '기록관리차별점설명']
const salesStageOptions = ['첫접점', '상담진행', 'OT진행', '제안완료', '고민중', '결제완료', '이탈']
const salesResultOptions = [
  { value: '진행중', label: '진행중' },
  { value: '후속관리', label: '후속관리' },
  { value: '결제완료', label: '결제완료' },
  { value: '이탈', label: '이탈' },
]
const salesEmotionOptions = ['적극적', '보통', '고민많음', '반신반의', '가격민감', '의지낮음']
const salesConversionOptions = [
  { value: 'high', label: '높음' },
  { value: 'middle', label: '중간' },
  { value: 'low', label: '낮음' },
]
const salesFailReasonOptions = ['가격부담', '시간부족', '거리문제', '필요성부족', '비교중', '보호자/배우자상의', '운동의지부족', '기타']
const CONDITION_CHECKLIST = [
  '오늘 몸이 가볍고 무난하다',
  '수업할 체력은 충분한 편이다',
  '움직일 때 몸이 덜 무겁다',
  '전반적으로 몸 상태가 괜찮다',
]

const FATIGUE_CHECKLIST = [
  '몸이 무겁다',
  '잠을 자도 피로가 남아 있다',
  '평소보다 체력이 떨어진다',
  '수업만 해도 쉽게 지친다',
  '오늘은 무리하면 더 퍼질 것 같다',
]

const STRESS_CHECKLIST = [
  '생각이 많고 머리가 복잡하다',
  '회원 응대가 조금 버겁다',
  '압박감이나 부담감이 있다',
  '예민하거나 감정 소모가 크다',
  '오늘은 운영 흐름이 걱정된다',
]

const FOCUS_CHECKLIST = [
  '수업 집중이 잘 된다',
  '코칭 흐름이 자연스럽다',
  '해야 할 우선순위가 보인다',
  '말이나 설명이 비교적 잘 나온다',
]

const PERFORMANCE_ACTION_SECTIONS = [
  {
    key: 'lead_actions',
    title: '신규 유입 행동',
    items: [
      '먼저 인사하거나 대화를 열었다',
      '상담으로 연결했다',
      'OT 또는 체험을 제안했다',
      '신규 유입 관련 행동을 1회 이상 했다',
    ],
  },
  {
    key: 'retention_actions',
    title: '기존 회원 관리 행동',
    items: [
      '수업 후 피드백을 전달했다',
      '다음 방향이나 과제를 안내했다',
      '미방문/이탈 가능 회원을 체크했다',
      '회원 상태를 기록하거나 정리했다',
    ],
  },
  {
    key: 'sales_actions',
    title: '전환 / 재등록 행동',
    items: [
      '가격 또는 구성 설명을 했다',
      '결제/재등록 제안을 했다',
      '후속 연락 또는 후속 일정을 잡았다',
      '보류 이유를 확인하고 남겼다',
    ],
  },
  {
    key: 'growth_actions',
    title: '브랜딩 / 운영 행동',
    items: [
      '후기 요청 또는 후기 관리를 했다',
      '콘텐츠 업로드/기획을 했다',
      '제휴/소개 관련 행동을 했다',
      '오늘 운영을 돌아보고 메모를 남겼다',
    ],
  },
]
const COACH_LEVEL_META = {
  top: {
    label: '최상',
    description: '컨디션과 집중도가 좋고, 피로와 스트레스가 안정적입니다.',
    colorClass: 'good',
  },
  stable: {
    label: '안정',
    description: '전반적으로 무난한 상태입니다. 현재 루틴 유지가 좋습니다.',
    colorClass: 'good',
  },
  caution: {
    label: '주의',
    description: '피로 또는 스트레스가 올라오고 있습니다. 일정 조절이 필요할 수 있습니다.',
    colorClass: 'warn',
  },
  risk: {
    label: '위험',
    description: '회복이 우선인 상태입니다. 무리한 일정은 줄이는 것이 좋습니다.',
    colorClass: 'danger',
  },
}

const PERFORMANCE_LEVEL_META = [
  { min: 0, max: 39, label: '매우 부족' },
  { min: 40, max: 59, label: '기본' },
  { min: 60, max: 79, label: '양호' },
  { min: 80, max: 100, label: '고성과' },
]
const BURNOUT_RELIEF_GUIDE = [
  '오늘은 좀 어떠셨나요?',
  '최근 들어 수업, 상담, 회원 응대가 평소보다 버겁게 느껴졌다면 가볍게 체크해보세요.',
  '지금 상태를 확인하는 용도이며, 무조건 번아웃이라고 단정하는 것은 아닙니다.',
]

const BURNOUT_RECOVERY_CHECKLIST = [
  '오늘은 수업할 때 덜 버거웠다',
  '회원 응대 부담이 조금 덜했다',
  '코칭이 어제보다 조금 자연스럽게 나왔다',
  '끝나고 과하게 지치는 느낌이 덜했다',
  '오늘은 내가 부족하다는 압박이 조금 덜했다',
  '퇴근 후 회복할 여유가 조금 있었다',
]

const BURNOUT_RESPONSE_CHECKLIST = [
  '혼자 끌고 가지 말고 팀장님께 지금 상태를 짧게라도 공유해보기',
  '가장 버거운 수업/회원 유형 1가지만 적어보기',
  '오늘 꼭 해야 할 일 1~2개만 정해서 마무리하기',
  '잘하려고 하기보다 덜 소모되는 방향으로 운영하기',
]

function getPercentFromChecks(checkedCount = 0, totalCount = 1) {
  if (!totalCount) return 0
  return Math.round((checkedCount / totalCount) * 100)
}

function getBurnoutRecoveryCount(checks = []) {
  return Array.isArray(checks) ? checks.length : 0
}

function getBurnoutSignalPercent(checks = []) {
  return getPercentFromChecks(checks.length, 5)
}

function getBurnoutRecoveryPercent(checks = []) {
  return getPercentFromChecks(checks.length, BURNOUT_RECOVERY_CHECKLIST.length)
}

function getBurnoutSignalText(checks = []) {
  const percent = getBurnoutSignalPercent(checks)

  if (percent <= 20) {
    return '현재는 번아웃보다는 일반 피로 수준에 가깝습니다.'
  }
  if (percent <= 40) {
    return '운영 피로가 누적되기 시작하는 상태입니다.'
  }
  if (percent <= 60) {
    return '번아웃 위험도가 올라온 상태입니다. 운영 강도 조절이 필요합니다.'
  }
  return '번아웃 가능성이 높은 상태입니다. 지금은 회복과 조정이 우선입니다.'
}

function getBurnoutLeaderMessage(checks = []) {
  const percent = getBurnoutSignalPercent(checks)

  if (percent <= 20) {
    return '아직 완전히 무너진 상태는 아닙니다. 지금부터 수면, 식사, 회복 루틴을 먼저 챙겨보세요.'
  }
  if (percent <= 40) {
    return '요즘 조금 지치는 느낌이 있을 수 있어요. 어떤 수업이나 어떤 상황에서 유독 에너지가 빠지는지 한번 정리해보세요.'
  }
  if (percent <= 60) {
    return '지금은 억지로 버티기보다, 오늘 해야 할 일의 우선순위를 줄이고 덜 소모되는 방식으로 운영하는 게 좋습니다.'
  }
  return '지금은 의지로 버티는 것보다 조정이 필요한 시점입니다. 혼자 끌고 가지 말고 팀장님께 현재 상태를 짧게라도 공유해보세요.'
}

function getBurnoutRecoveryComment(checks = []) {
  const percent = getBurnoutRecoveryPercent(checks)

  if (percent === 0) {
    return '오늘 번아웃 회복은 체크해보셨나요? 아직 체크 전이라면, 어제보다 조금 덜 버거웠는지만 가볍게 봐주세요.'
  }
  if (percent <= 34) {
    return '아직 회복 체감이 크지 않을 수 있습니다. 더 안 무너지게 유지하는 것만으로도 충분히 의미 있습니다.'
  }
  if (percent <= 67) {
    return '조금씩 회복 흐름이 보이고 있습니다. 지금 방식이 아주 나쁘지 않다는 뜻입니다.'
  }
  return '회복 흐름이 분명히 보입니다. 무리해서 다시 끌어올리기보다 현재 리듬을 조금 더 유지해보세요.'
}

function getBurnoutRecoveryLeaderMessage(checks = []) {
  const percent = getBurnoutRecoveryPercent(checks)

  if (percent === 0) {
    return '크게 좋아지지 않았어도 괜찮아요. 오늘은 어제보다 조금 덜 힘들었는지부터 확인해보면 됩니다.'
  }
  if (percent <= 34) {
    return '회복이 아직 선명하지 않아도 이상한 건 아닙니다. 번아웃은 하루 만에 좋아지지 않으니, 더 무너지지 않는 흐름을 먼저 만드세요.'
  }
  if (percent <= 67) {
    return '지금 조금씩 좋아지고 있는 흐름은 맞아요. 다만 갑자기 원래처럼 다 하려고 하면 다시 지칠 수 있습니다.'
  }
  return '좋습니다. 현재 조절 방식이 맞고 있을 가능성이 큽니다. 지금 흐름을 급하게 깨지 않는 게 더 중요합니다.'
}

function randomCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

function getSimpleStatus(value) {
  if (Number(value) >= 80) return '좋음'
  if (Number(value) >= 60) return '보통'
  if (Number(value) >= 40) return '저하'
  return '관리 필요'
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

function getMonthKey(dateString) {
  return (dateString || '').slice(0, 7)
}

function textIncludes(value, keyword) {
  return String(value || '').toLowerCase().includes(String(keyword || '').toLowerCase())
}

function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) return
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const csv = rows.map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
function playAdminAlertSound() {
  try {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTAAAAAA////AAAA////AAAA////AAAA////AAAA'
    )
    audio.play().catch(() => {})
  } catch (error) {
    console.error('알림음 재생 실패:', error)
  }
}
function getRiceGuide(riceAmount) {
  const riceG = Number(riceAmount || 0)

  if (!riceG) {
    return {
      rice_g: 0,
      hetbahn_large_count: 0,
      carbs_g: 0,
      kcal: 0,
      summary: '밥량 정보 없음',
    }
  }

  const carbsPer100g = 31
  const kcalPer100g = 130
  const hetbahnLargeG = 300

  const carbsG = Math.round((riceG * carbsPer100g) / 100)
  const kcal = Math.round((riceG * kcalPer100g) / 100)
  const hetbahnLargeCount = Math.round((riceG / hetbahnLargeG) * 10) / 10

  return {
    rice_g: riceG,
    hetbahn_large_count: hetbahnLargeCount,
    carbs_g: carbsG,
    kcal,
    summary: `현재 기준 밥량 ${riceG}g · 햇반 큰공기 약 ${hetbahnLargeCount}개 · 탄수화물 약 ${carbsG}g · 약 ${kcal}kcal`,
  }
}

function getMealCarbDistribution({
  mealSlots = [],
  targetCarbs = 0,
  usualRiceAmountG = 0,
  largestMealSlot = '저녁',
  mealStartMode = 'current',
  goalType = 'diet',
  isTrainingDay = false,
}) {
  const safeSlots = Array.isArray(mealSlots) ? mealSlots : []
  if (!safeSlots.length) return []

  const riceGuide = getRiceGuide(usualRiceAmountG)
  const baselineLargestCarbs = Number(riceGuide.carbs_g || 0)

  const weights = safeSlots.map((slot) => {
    if (slot === largestMealSlot) return 1
    if (slot === '야식') return 0.55
    if (slot === '저녁') return 0.8
    if (slot === '점심') return 0.75
    if (slot === '아침') return 0.6
    return 0.7
  })

  let baseline = safeSlots.map((slot, index) => ({
    slot,
    carbs: Math.round(baselineLargestCarbs * weights[index]),
  }))

  const baselineTotal = baseline.reduce((sum, item) => sum + Number(item.carbs || 0), 0)
  if (!baselineTotal) {
    const evenCarbs = Math.round(Number(targetCarbs || 0) / safeSlots.length)
    return safeSlots.map((slot) => ({
      slot,
      carbs: evenCarbs,
      baseline_rice_g: 0,
      adjusted_rice_g: 0,
      carb_distribution_reason: 'fallback_even_distribution',
    }))
  }

  let startRatio = 1
  if (mealStartMode === 'slightly_reduce') startRatio = 0.9
  if (mealStartMode === 'aggressive_reduce') startRatio = 0.8

  if (mealStartMode === 'cycle') {
    if (goalType === 'diet') {
      startRatio = isTrainingDay ? 0.95 : 0.8
    } else if (goalType === 'bulk' || goalType === 'muscle_gain') {
      startRatio = isTrainingDay ? 1.08 : 0.95
    } else {
      startRatio = isTrainingDay ? 1 : 0.92
    }
  }

  baseline = baseline.map((item) => ({
    ...item,
    carbs: Math.round(item.carbs * startRatio),
  }))

  const adjustedTotal = baseline.reduce((sum, item) => sum + Number(item.carbs || 0), 0)
  const scale = adjustedTotal > 0 ? Number(targetCarbs || 0) / adjustedTotal : 1

  const result = baseline.map((item) => {
    const finalCarbs = Math.max(0, Math.round(item.carbs * scale))
    const adjustedRiceG = Math.round((finalCarbs / 31) * 100)

    return {
      slot: item.slot,
      carbs: finalCarbs,
      baseline_rice_g: item.slot === largestMealSlot ? Number(usualRiceAmountG || 0) : Math.round((item.carbs / 31) * 100),
      adjusted_rice_g: adjustedRiceG,
      carb_distribution_reason: `${goalType}_${mealStartMode}_${item.slot === largestMealSlot ? 'largest' : 'normal'}`,
    }
  })

  const diff = Number(targetCarbs || 0) - result.reduce((sum, item) => sum + Number(item.carbs || 0), 0)
  if (result.length > 0 && diff !== 0) {
    result[result.length - 1].carbs += diff
    result[result.length - 1].adjusted_rice_g = Math.round((result[result.length - 1].carbs / 31) * 100)
  }

  return result
}

const MANAGER_THOUGHT_CARDS = [
  {
    title: '오늘의 한마디',
    text: '회원 한 명의 인생을 바꿀 수 있는 강력한 하루를 만들어보세요.',
    tag: '#작은변화가_브랜드가된다',
  },
  {
    title: '기회는 준비된 사람의 것',
    text: '지금 이 루틴이, 3개월 후 당신의 매출을 만든다.',
    tag: '#꾸준함이_무기다',
  },
  {
    title: '기록은 자산이다',
    text: '오늘의 콘텐츠 1개가 미래의 회원 1명을 만든다.',
    tag: '#기록이_브랜딩된다',
  },
  {
    title: '성장은 선택이다',
    text: '당신의 다음 레벨은 오늘의 선택으로 결정된다.',
    tag: '#성장하는_트레이너',
  },
]

const MANAGER_TASKS = [
  {
    category: '긴급',
    title: '이탈 위험 회원 3명 연락하기',
    description: '7일 이상 미출석 회원이 있어요. 지금 한 마디가 돌아오게 할 수 있어요.',
    due: '오늘 18:00',
    action: '시작하기',
    actionKey: 'go_members',
  },
  {
    category: '매출',
    title: '재등록 제안 대상 2명에게 제안하기',
    description: '회원들이 변화는 느끼고 있어요. 타이밍을 놓치지 마세요.',
    due: '오늘 20:00',
    action: '시작하기',
    actionKey: 'go_sales',
  },
  {
    category: '마케팅',
    title: '블로그 글 1개 발행하기',
    description: '초보자를 위한 루틴, 통증관리, 저강도 운동 주제가 반응 좋을 수 있어요.',
    due: '오늘 23:59',
    action: '시작하기',
    actionKey: 'log_blog',
  },
  {
    category: '콘텐츠',
    title: '릴스 1개 업로드하기',
    description: '회원 운동 후기나 관리 포인트 짧은 영상이 브랜드를 만듭니다.',
    due: '내일 12:00',
    action: '시작하기',
    actionKey: 'log_reel',
  },
  {
    category: '성장',
    title: 'VIP 회원 1:1 피드백 제공하기',
    description: '고객은 특별함을 기억해요. 관계가 매출을 만듭니다.',
    due: '내일 18:00',
    action: '시작하기',
    actionKey: 'go_member_detail',
  },
  {
    category: '루틴',
    title: '이번 주 운동 프로그램 점검하기',
    description: '회원 반응을 보고 루틴을 조정해보세요. 디테일이 차이를 만듭니다.',
    due: 'D-2',
    action: '시작하기',
    actionKey: 'go_member_detail',
  },
]

const MANAGER_INSIGHTS = [
  {
    title: 'AI 매니저의 코멘트',
    text: '지금은 관리보다 흐름을 만드는 시기예요. 회원들에게 메시지를 주고, 콘텐츠로 당신의 철학을 보여주세요.',
  },
  {
    title: '회원 관리 인사이트',
    text: '이탈 위험 회원이 보여요. 이 중 2명은 식단 기록도 멈췄어요. 지금 관심을 보여줄 타이밍입니다.',
  },
  {
    title: '매출 인사이트',
    text: '이번 달 목표 대비 매출 흐름이 아쉬워요. 재등록 2건만 더 성사되면 분위기를 바꿀 수 있어요.',
  },
  {
    title: '마케팅 인사이트',
    text: '블로그와 릴스는 단순 홍보가 아니라 신뢰를 쌓는 도구예요. 실력은 알려져야 자산이 됩니다.',
  },
  {
    title: '오늘의 추천 행동',
    text: '회원 후기 콘텐츠 하나를 만들어보세요. 진짜 이야기가 가장 강한 광고가 됩니다.',
  },
]

const MANAGER_SCORE_CARDS = [
  { label: '매출', value: '4,320,000원', sub: '목표 5,000,000원', percent: 86 },
  { label: '재등록률', value: '46%', sub: '목표 60%', percent: 80 },
  { label: '신규 OT', value: '12명', sub: '목표 20명', percent: 58 },
  { label: '콘텐츠 발행', value: '6개', sub: '목표 12개', percent: 50 },
]

const MANAGER_MISSIONS = [
  { title: '블로그 4개 발행', progress: '2 / 4', reward: '+200XP' },
  { title: '재등록 3건 달성', progress: '1 / 3', reward: '+300XP' },
  { title: '릴스 4개 업로드', progress: '1 / 4', reward: '+200XP' },
  { title: '이탈률 10% 이하 유지', progress: '진행중', reward: '+500XP' },
]

const MANAGER_ROADMAP = [
  {
    step: '지금 (1개월)',
    title: '관리 루틴 만들기',
    text: '회원 이탈을 막고, 기본 운영 습관을 단단하게 만드는 시기입니다.',
  },
  {
    step: '다음 (2~3개월)',
    title: '매출 흐름 만들기',
    text: '재등록과 신규 흐름을 함께 잡아 안정적인 매출 구조를 만듭니다.',
  },
  {
    step: '그다음 (3~6개월)',
    title: '브랜드 만들기',
    text: '콘텐츠와 스토리로 당신을 알리고, 기억에 남는 코치가 되어야 합니다.',
  },
  {
    step: '미래 (6개월+)',
    title: '시스템 만들기',
    text: '당신만의 방식으로 자동화와 확장 가능성을 만들어야 합니다.',
  },
  {
    step: '최종 목표',
    title: '자유로운 트레이너',
    text: '지속 성장하는 브랜드를 갖고, 시간과 수익의 여유를 함께 만듭니다.',
  },
]
const TRAINER_LEVELS = [
  { key: 'beginner_3', name: '초보 트레이너 3급', minXp: 0, description: '기록 습관과 기본 운영 감각을 만드는 단계입니다.' },
  { key: 'beginner_2', name: '초보 트레이너 2급', minXp: 80, description: '기본 회원 관리와 실행 습관이 자리를 잡기 시작한 단계입니다.' },
  { key: 'beginner_1', name: '초보 트레이너 1급', minXp: 160, description: '수업 외에도 콘텐츠와 운영 흐름을 보기 시작한 단계입니다.' },

  { key: 'intermediate_3', name: '중급 트레이너 3급', minXp: 260, description: '회원 유지와 재등록 흐름을 함께 관리하기 시작한 단계입니다.' },
  { key: 'intermediate_2', name: '중급 트레이너 2급', minXp: 380, description: '매출과 실행 로그가 함께 쌓이며 운영 감각이 커지는 단계입니다.' },
  { key: 'intermediate_1', name: '중급 트레이너 1급', minXp: 520, description: '회원관리, 콘텐츠, 운영 흐름을 연결해서 보는 단계입니다.' },

  { key: 'advanced_3', name: '상급 트레이너 3급', minXp: 700, description: '브랜딩과 운영 성과가 눈에 띄게 쌓이기 시작한 단계입니다.' },
  { key: 'advanced_2', name: '상급 트레이너 2급', minXp: 900, description: '반복 가능한 운영 패턴과 콘텐츠 자산이 생기는 단계입니다.' },
  { key: 'advanced_1', name: '상급 트레이너 1급', minXp: 1150, description: '회원관리, 매출, 브랜드가 안정적으로 연결되는 단계입니다.' },

  { key: 'master_3', name: '마스터 트레이너 3급', minXp: 1450, description: '시스템과 방향을 스스로 설계할 수 있는 단계입니다.' },
  { key: 'master_2', name: '마스터 트레이너 2급', minXp: 1800, description: '운영, 콘텐츠, 회원관리의 밸런스가 높은 수준으로 올라온 단계입니다.' },
  { key: 'master_1', name: '마스터 트레이너 1급', minXp: 2200, description: '창업 또는 독립 운영을 준비해볼 수 있는 수준입니다.' },

  { key: 'director', name: '대표 트레이너', minXp: 2700, description: '창업을 시도하거나 팀/브랜드를 이끌 준비가 된 단계입니다.' },
]
export default function AdminDashboard({ profile, currentAdminId, currentGymId, onLogout }) {
  const [activeTab, setActiveTab] = useState('회원')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
    const [adminSignupRequests, setAdminSignupRequests] = useState([])
  const [adminSignupLoading, setAdminSignupLoading] = useState(false)
  const [approvedSignupRequests, setApprovedSignupRequests] = useState([])
const [rejectedSignupRequests, setRejectedSignupRequests] = useState([])
const [adminAccounts, setAdminAccounts] = useState([])
const [adminActionLogs, setAdminActionLogs] = useState([])
  const [selectedStatsMonth, setSelectedStatsMonth] = useState(
  new Date().toISOString().slice(0, 7)
)

  const [members, setMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [memberForm, setMemberForm] = useState(emptyMemberForm)
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [memberSearch, setMemberSearch] = useState('')
  const [memberDetailSearch, setMemberDetailSearch] = useState('')
  const [memberDetailGuideOpen, setMemberDetailGuideOpen] = useState(false)
  const [memberProgramFilter, setMemberProgramFilter] = useState('')
  const [memberStatusFilter, setMemberStatusFilter] = useState('all')
  const [collapsedMembers, setCollapsedMembers] = useState({})
 



  const [memberHealthLogs, setMemberHealthLogs] = useState([])
  const [collapsedHealthLogs, setCollapsedHealthLogs] = useState({})
  const [adminNotes, setAdminNotes] = useState([])
  const [adminNoteInput, setAdminNoteInput] = useState('')

  const [workouts, setWorkouts] = useState([])
  const [workoutItemsMap, setWorkoutItemsMap] = useState({})
  const [collapsedWorkouts, setCollapsedWorkouts] = useState({})
  const [workoutForm, setWorkoutForm] = useState(emptyWorkoutForm)
  const [workoutSearch, setWorkoutSearch] = useState('')
  const [workoutMemberFilter, setWorkoutMemberFilter] = useState('')
 const [memberDropdown, setMemberDropdown] = useState({
  type: '',
  keyword: '',
})

const filteredMemberOptions = useMemo(() => {
  const keyword = String(memberDropdown.keyword || '').trim().toLowerCase()

  if (!keyword) return members

  return members.filter((member) =>
    String(member.name || '').toLowerCase().includes(keyword)
  )
}, [members, memberDropdown.keyword])

const openMemberDropdown = (type) => {
  setMemberDropdown({
    type,
    keyword: '',
  })
}

const closeMemberDropdown = () => {
  setMemberDropdown({
    type: '',
    keyword: '',
  })
}

const isMemberDropdownOpen = (type) => {
  return memberDropdown.type === type
}

  
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState('all')
  const [workoutDateFilter, setWorkoutDateFilter] = useState('')
  const [recordGuideOpen, setRecordGuideOpen] = useState(false)
const [exerciseSearchDropdown, setExerciseSearchDropdown] = useState({
  openType: '',
  itemIndex: null,
  subIndex: null,
  keyword: '',
})
  
  const [brands, setBrands] = useState([])
  const [brandForm, setBrandForm] = useState(emptyBrandForm)
  const [editingBrandId, setEditingBrandId] = useState(null)

  const [exercises, setExercises] = useState([])
  const [exerciseForm, setExerciseForm] = useState(emptyExerciseForm)
  const [editingExerciseId, setEditingExerciseId] = useState(null)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [exerciseDbGuideOpen, setExerciseDbGuideOpen] = useState(false)
  const [exerciseBodyPartFilter, setExerciseBodyPartFilter] = useState('')
const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState('')
const [exerciseBrandFilter, setExerciseBrandFilter] = useState('')
  const [collapsedExercises, setCollapsedExercises] = useState({})
  const [bulkExerciseText, setBulkExerciseText] = useState(defaultBulkExerciseText)
  const [showBulkInput, setShowBulkInput] = useState(false)
  const visibleTabs = useMemo(() => {
  const nextTabs = [...TABS]

  if (profile?.is_super_admin) {
    nextTabs.push('가입신청관리')
  }

  return nextTabs
}, [profile?.is_super_admin])
const filteredExerciseOptions = useMemo(() => {
  const keyword = String(exerciseSearchDropdown.keyword || '').trim().toLowerCase()

  if (!keyword) return exercises

  return exercises.filter((exercise) => {
    const name = String(exercise.name || '').toLowerCase()
    const bodyPart = String(exercise.body_part || '').toLowerCase()
    const category = String(exercise.category || '').toLowerCase()
    const brandName = String(exercise.brands?.name || '').toLowerCase()
    const guide = String(exercise.guide_text || '').toLowerCase()

    return (
      name.includes(keyword) ||
      bodyPart.includes(keyword) ||
      category.includes(keyword) ||
      brandName.includes(keyword) ||
      guide.includes(keyword)
    )
  })
}, [exercises, exerciseSearchDropdown.keyword])

const openExerciseDropdown = (openType, itemIndex, subIndex = null) => {
  setExerciseSearchDropdown({
    openType,
    itemIndex,
    subIndex,
    keyword: '',
  })
}

const closeExerciseDropdown = () => {
  setExerciseSearchDropdown({
    openType: '',
    itemIndex: null,
    subIndex: null,
    keyword: '',
  })
}

const isExerciseDropdownOpen = (openType, itemIndex, subIndex = null) => {
  return (
    exerciseSearchDropdown.openType === openType &&
    exerciseSearchDropdown.itemIndex === itemIndex &&
    exerciseSearchDropdown.subIndex === subIndex
  )
}
  const [dietLogs, setDietLogs] = useState([])
  const [collapsedDiets, setCollapsedDiets] = useState({})
  const [dietMemberFilter, setDietMemberFilter] = useState('')
  const [dietSearch, setDietSearch] = useState('')
  
const emptyMealPlanForm = {
  member_id: '',
  goal_type: 'diet',
  meals_per_day: 3,
  meal_slots: ['아침', '점심', '저녁'],
  activity_level: 'light',
  training_days_per_week: 3,
  training_time: 'evening',
  use_training_rest_split: true,
  target_kcal: '',
  target_carbs_g: '',
  target_protein_g: '',
  target_fat_g: '',
  excluded_foods: '',
  preferred_foods: '',
  allergies: '',
  notes: '',
    diet_mode: 'balanced',
  adaptation_strategy: 'gradual',
  current_meal_pattern: 'mixed',
  snack_frequency_per_week: 0,
  bread_frequency_per_week: 0,
  junk_food_frequency_per_week: 0,
  delivery_food_frequency_per_week: 0,
  late_night_meal_frequency_per_week: 0,
  allowed_general_meals_per_week: 3,
  allowed_free_meals_per_week: 1,
  allowed_snacks_per_week: 2,
  allowed_bread_per_week: 2,
  allowed_dessert_per_week: 1,
  meal_structure_mode: 'structured',
    usual_rice_amount_g: 300,
  largest_meal_slot: '저녁',
  meal_rice_map: {
  아침: 300,
  점심: 300,
  저녁: 300,
},
  meal_start_mode: 'current',
  rice_amount_source: 'preset',
  usual_rice_amount_custom_g: '',
    alcohol_frequency_per_week: 0,
  allowed_alcohol_per_week: 1,
}

const [mealPlanForm, setMealPlanForm] = useState(emptyMealPlanForm)
  const [mealPlanRecommendation, setMealPlanRecommendation] = useState(null)
const [selectedPlanStyle, setSelectedPlanStyle] = useState('')
const [mealPlanMonth, setMealPlanMonth] = useState(new Date().toISOString().slice(0, 7))
const [memberNutritionProfiles, setMemberNutritionProfiles] = useState([])
const [memberMealPlans, setMemberMealPlans] = useState([])
  const [foodMaster, setFoodMaster] = useState([])
  const [foodMasterSearch, setFoodMasterSearch] = useState('')
  const [foodMasterForm, setFoodMasterForm] = useState(emptyFoodMasterForm)
const [savingFoodMaster, setSavingFoodMaster] = useState(false)
  const [editingFoodMasterId, setEditingFoodMasterId] = useState(null)
const [foodMasterSubmittingMode, setFoodMasterSubmittingMode] = useState('create')
  const [showFoodMasterPanel, setShowFoodMasterPanel] = useState(false)
  const [showAllFoodMaster, setShowAllFoodMaster] = useState(false)
const [foodMasterLoaded, setFoodMasterLoaded] = useState(false)
  const [mealComplianceMonth, setMealComplianceMonth] = useState(new Date().toISOString().slice(0, 7))
const [memberMealCompliancePlans, setMemberMealCompliancePlans] = useState([])
  const [mealPlanViewMonth, setMealPlanViewMonth] = useState(new Date().toISOString().slice(0, 7))
const [editingMealPlanId, setEditingMealPlanId] = useState(null)
  const [mealPlannerAdminSections, setMealPlannerAdminSections] = useState({
  generator: true,
  guide: true,
  monthlyRecords: true,
  compliance: false,
})
const [mealPlanEditMeals, setMealPlanEditMeals] = useState([])
  const [activityRankingOpenSections, setActivityRankingOpenSections] = useState({
  summary: true,
  pt: true,
  personal: false,
  total: false,
  weighted: false,
  level: false,
  weeklyXp: false,
  xpLogs: false,
})

const toggleActivityRankingSection = (key) => {
  setActivityRankingOpenSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}
  const [coachManageOpenSections, setCoachManageOpenSections] = useState({
  filters: true,
  input: false,
  checklist: false,
  burnout: false,
  performance: false,
  result: true,
  goals: false,
  records: true,
})

const toggleCoachManageSection = (key) => {
  setCoachManageOpenSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}

const [reportOpenSections, setReportOpenSections] = useState({
  filters: true,
  actions: true,
  summary: true,
  goals: false,
  alerts: false,
  compare: false,
  reviewForm: false,
  reviewList: true,
})

const toggleReportSection = (key) => {
  setReportOpenSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}
  const [memberLevelOpenSections, setMemberLevelOpenSections] = useState({
  levelSummary: true,
  xpSummary: true,
})

const toggleMemberLevelSection = (key) => {
  setMemberLevelOpenSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}
const [salesRecordOpenSections, setSalesRecordOpenSections] = useState({
  filters: true,
  form: true,
  summary: true,
  list: true,
})

const toggleSalesRecordSection = (key) => {
  setSalesRecordOpenSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}

const [salesLogOpenSections, setSalesLogOpenSections] = useState({
  basic: true,
  need: false,
  consultation: false,
  salesMethod: false,
  result: false,
  followup: false,
  legacy: false,
  list: true,
})

const toggleSalesLogSection = (key) => {
  setSalesLogOpenSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}
const [collapsedMemberLevels, setCollapsedMemberLevels] = useState({})
const [collapsedMemberXpRules, setCollapsedMemberXpRules] = useState({})
const [managerOpenSections, setManagerOpenSections] = useState({
  career: false,
  nextLevel: false,
  startup: false,
  xpLogs: false,
  trainerGrowth: false,
  levelSettings: false,
  todayTasks: false,
  managerComment: false,
  flowSummary: false,
  actionLog: false,
})

const toggleManagerSection = (key) => {
  setManagerOpenSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}
 const emptyRoutineItem = {
  exercise_id: '',
  exercise_name_snapshot: '',
  duration_minutes: '',
  memo: '',
  sets: [{ kg: '', reps: '' }],
}

const ROUTINE_DAYS = ['월', '화', '수', '목', '금', '토', '일']

const createEmptyRoutineSet = () => ({ kg: '', reps: '' })

const createEmptyRoutineItem = () => ({
  exercise_id: '',
  exercise_name_snapshot: '',
  duration_minutes: '',
  memo: '',
  sets: [createEmptyRoutineSet()],
})

const createEmptyRoutineDay = (dayOfWeek = '월') => ({
  day_of_week: dayOfWeek,
  items: [createEmptyRoutineItem()],
})

const createEmptyRoutineWeek = (weekNumber = 1) => ({
  week_number: weekNumber,
  days: ROUTINE_DAYS.map((day) => createEmptyRoutineDay(day)),
})

const emptyRoutineForm = {
  title: '루틴',
  weeks: [createEmptyRoutineWeek(1)],
}

const [routineForm, setRoutineForm] = useState(emptyRoutineForm)
  const [collapsedRoutineDays, setCollapsedRoutineDays] = useState({})
  const [selectedRoutineWeek, setSelectedRoutineWeek] = useState(0)
  const [manualTarget, setManualTarget] = useState('member')
  const [manualForm, setManualForm] = useState({ title: '', content: '' })
  const [manuals, setManuals] = useState([])

  const [coaches, setCoaches] = useState([])
  const [selectedCoachId, setSelectedCoachId] = useState('')
  const [scheduleMonth, setScheduleMonth] = useState(new Date().toISOString().slice(0, 7))
  const [scheduleForm, setScheduleForm] = useState({
    schedule_date: new Date().toISOString().slice(0, 10),
    is_working: true,
    is_weekend_work: false,
    work_start: '09:00',
    work_end: '18:00',
    memo: '',
    selectedSlots: ['10:00', '11:00', '14:00', '15:00'],
  })
  const [coachSchedules, setCoachSchedules] = useState([])
  const [coachScheduleSlotsMap, setCoachScheduleSlotsMap] = useState({})
  const [collapsedSchedules, setCollapsedSchedules] = useState({})

  const [programs, setPrograms] = useState([])
  const [programForm, setProgramForm] = useState(emptyProgramForm)
  const [editingProgramId, setEditingProgramId] = useState(null)
  const [programSearch, setProgramSearch] = useState('')
  const [expandedProgramId, setExpandedProgramId] = useState(null)

  const [salesRecords, setSalesRecords] = useState([])
  const [saleForm, setSaleForm] = useState(emptySaleForm)
  const [editingSaleId, setEditingSaleId] = useState(null)
  const [saleMonth, setSaleMonth] = useState(new Date().toISOString().slice(0, 7))
  const [saleSearch, setSaleSearch] = useState('')
  const [salePaymentFilter, setSalePaymentFilter] = useState('all')
  const [collapsedSales, setCollapsedSales] = useState({})
  const [salesSummary, setSalesSummary] = useState(null)

  const [salesLogs, setSalesLogs] = useState([])
  const [salesLogForm, setSalesLogForm] = useState(emptySalesLogForm)
  const [editingSalesLogId, setEditingSalesLogId] = useState(null)
  const [collapsedSalesLogs, setCollapsedSalesLogs] = useState({})
  const [salesLogSearch, setSalesLogSearch] = useState('')
  const [salesLogMonth, setSalesLogMonth] = useState(new Date().toISOString().slice(0, 7))
  const [salesLogStageFilter, setSalesLogStageFilter] = useState('all')
const [salesLogResultFilter, setSalesLogResultFilter] = useState('all')
const [salesLogConversionFilter, setSalesLogConversionFilter] = useState('all')
const [coachConditions, setCoachConditions] = useState([])
const [coachConditionForm, setCoachConditionForm] = useState(emptyCoachConditionForm)
  const [coachGoalForm, setCoachGoalForm] = useState(emptyCoachGoalForm)
const [editingCoachConditionId, setEditingCoachConditionId] = useState(null)
const [coachConditionMonth, setCoachConditionMonth] = useState(new Date().toISOString().slice(0, 7))
const [coachConditionCoachFilter, setCoachConditionCoachFilter] = useState('')
  const [burnoutRecoveryChecks, setBurnoutRecoveryChecks] = useState([])

const [coachReviews, setCoachReviews] = useState([])
const [coachReviewForm, setCoachReviewForm] = useState(emptyCoachReviewForm)
const [editingCoachReviewId, setEditingCoachReviewId] = useState(null)
const [coachReviewMonth, setCoachReviewMonth] = useState(new Date().toISOString().slice(0, 7))
const [coachReviewCoachFilter, setCoachReviewCoachFilter] = useState('')
  const [collapsedCoachConditions, setCollapsedCoachConditions] = useState({})
  const [burnoutSignalChecks, setBurnoutSignalChecks] = useState([])
  const [showCoachDetail, setShowCoachDetail] = useState(false)
  const [notices, setNotices] = useState([])
  const [noticeForm, setNoticeForm] = useState(emptyNoticeForm)
  const [editingNoticeId, setEditingNoticeId] = useState(null)
  const [collapsedNotices, setCollapsedNotices] = useState({})
  const [noticeMonthFilter, setNoticeMonthFilter] = useState('')
  const [noticeSearch, setNoticeSearch] = useState('')
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState('all')
 const [partners, setPartners] = useState([])
  const [partnerCategories, setPartnerCategories] = useState([])
  const [partnerForm, setPartnerForm] = useState(emptyPartnerForm)
  const [partnerCategoryCustom, setPartnerCategoryCustom] = useState('')
  const [editingPartnerId, setEditingPartnerId] = useState(null)
  const [partnerSearch, setPartnerSearch] = useState('')
  const [partnerCategoryFilter, setPartnerCategoryFilter] = useState('all')
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [partnerUsages, setPartnerUsages] = useState([])
  const [collapsedPartnerDetail, setCollapsedPartnerDetail] = useState(true)
const [partnerUsageStatusFilter, setPartnerUsageStatusFilter] = useState('pending')
    const [medicalPartners, setMedicalPartners] = useState([])
  const [medicalPartnerCategories, setMedicalPartnerCategories] = useState([])
  const [medicalPartnerForm, setMedicalPartnerForm] = useState(emptyMedicalPartnerForm)
  const [editingMedicalPartnerId, setEditingMedicalPartnerId] = useState(null)
  const [medicalPartnerSearch, setMedicalPartnerSearch] = useState('')
  const [medicalPartnerCategoryFilter, setMedicalPartnerCategoryFilter] = useState('all')
  const [selectedMedicalPartnerId, setSelectedMedicalPartnerId] = useState('')
  const [collapsedMedicalPartnerDetail, setCollapsedMedicalPartnerDetail] = useState(true)
 const [inquiries, setInquiries] = useState([])
const [collapsedInquiries, setCollapsedInquiries] = useState({})
const [inquirySearch, setInquirySearch] = useState('')
const [inquiryDateFilter, setInquiryDateFilter] = useState('')
const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all')
  const [adminAlertSettings, setAdminAlertSettings] = useState({
  inquiry: true,
  notice: true,
  workout: true,
  diet: true,
  sound: true,
  popup: true,
})

const [adminAlerts, setAdminAlerts] = useState([])
const [unreadInquiryCount, setUnreadInquiryCount] = useState(0)
const [unreadNoticeCount, setUnreadNoticeCount] = useState(0)
  const [unreadWorkoutCount, setUnreadWorkoutCount] = useState(0)
const [unreadDietCount, setUnreadDietCount] = useState(0)
  const [collapsedAdminAlertBar, setCollapsedAdminAlertBar] = useState(false)
  const [adminAlertTab, setAdminAlertTab] = useState('settings')
const [adminAlertSearch, setAdminAlertSearch] = useState('')
  const [managerActionLogs, setManagerActionLogs] = useState([])
  const [managerTaskChecks, setManagerTaskChecks] = useState([])
  const [managerGoalSettings, setManagerGoalSettings] = useState(null)
  const emptyCareerProfileForm = {
  career_years: 0,
  total_blog_posts: 0,
  total_instagram_posts: 0,
  total_blog_reviewnote_campaigns: 0,
  total_instagram_campaigns: 0,
  total_classes: 0,
  total_consultations: 0,
  total_certifications: 0,
  total_collaborations: 0,
  memo: '',
}

const [careerProfileForm, setCareerProfileForm] = useState(emptyCareerProfileForm)
const [careerProfileId, setCareerProfileId] = useState(null)
const [trainerLevelSettings, setTrainerLevelSettings] = useState([])
  const [memberLevels, setMemberLevels] = useState([])
const [memberXpLogs, setMemberXpLogs] = useState([])
const [memberLevelSettings, setMemberLevelSettings] = useState([])
const [memberXpSettings, setMemberXpSettings] = useState([])

const [selectedXpMemberId, setSelectedXpMemberId] = useState('')
  const [managerActionForm, setManagerActionForm] = useState({
    action_date: new Date().toISOString().slice(0, 10),
    action_type: 'blog_post',
    channel: '',
    title: '',
    description: '',
    link: '',
    status: 'done',
  })
const [editingManagerActionId, setEditingManagerActionId] = useState(null)



const handleMealPlanGenerate = async () => {
  const member = members.find((m) => m.id === mealPlanForm.member_id)

  if (!member) {
    alert('회원 선택')
    return
  }

  const { data: healthData, error: healthError } = await supabase
    .from('member_health_logs')
    .select('*')
    .eq('member_id', member.id)
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)

  if (healthError) {
    console.error('건강정보 불러오기 실패:', healthError)
    alert('건강정보 불러오기 실패')
    return
  }

  const health = Array.isArray(healthData) ? healthData[0] : null

  if (!health) {
    alert('해당 회원 건강정보 없음')
    return
  }

  const goalType = String(mealPlanForm.goal_type || 'diet')
  const weight = Number(health.weight_kg || 0)
  const height = Number(health.height_cm || 0)
  const age = Number(health.age || 0)
  const sex = String(health.sex || '').toLowerCase()
  const bodyFatPercent = Number(health.body_fat_percent || 0)
  const skeletalMuscleMass = Number(health.skeletal_muscle_mass || 0)

  if (!weight) {
    alert('체중 데이터 없음')
    return
  }

    const calculatedTargets = calculateMealTargetsFromHealth({
    goalType,
    health,
    mealPlanForm,
  })

  const activityFactor = calculatedTargets.activityFactor
  const bmr = calculatedTargets.bmr
  const tdee = calculatedTargets.tdee
  const goalAdjustmentKcal = calculatedTargets.goalAdjustmentKcal
  const targetKcal = calculatedTargets.targetKcal
  const targetProtein = calculatedTargets.targetProtein
  const targetFat = calculatedTargets.targetFat
  const targetCarbs = calculatedTargets.targetCarbs

  const proteinRule = calculatedTargets.proteinRule
  const fatRule = calculatedTargets.fatRule
  const carbRule = calculatedTargets.carbRule
  const bmrSource = calculatedTargets.bmr_source

  const mealsPerDay = Number(mealPlanForm.meals_per_day || 3)
 const mealSlots = getLifestyleMealSlots(mealPlanForm)

    const usualRiceAmountG =
    mealPlanForm.rice_amount_source === 'custom'
      ? Number(mealPlanForm.usual_rice_amount_custom_g || 0)
      : Number(mealPlanForm.usual_rice_amount_g || 0)
const normalizedMealRiceMap = mealSlots.reduce((acc, slot) => {
  const fallbackValue = usualRiceAmountG
  const slotValue = Number(mealPlanForm.meal_rice_map?.[slot] ?? fallbackValue)

  acc[slot] = slotValue
  return acc
}, {})
  const riceGuide = getRiceGuide(usualRiceAmountG)
  
  const sodiumLimitMg = Number(calculatedTargets.sodiumTargetMg || 2000)
const saturatedFatLimitG = Math.round((targetKcal * 0.1) / 9)

  const calcPayload = {
    member_id: mealPlanForm.member_id,
    health_log_id: health.id || null,
    admin_id: currentAdminId || null,
    goal_type: goalType,
    calculation_version: 'v2_food_engine',
    sex: health.sex || null,
    age: age || null,
    height_cm: height || null,
    weight_kg: weight || null,
    body_fat_percent: bodyFatPercent || null,
    skeletal_muscle_mass: skeletalMuscleMass || null,
    bmr_used: bmr,
    activity_factor_used: activityFactor,
    tdee,
    goal_adjustment_kcal: goalAdjustmentKcal,
    target_kcal: targetKcal,
    target_carbs_g: targetCarbs,
    target_protein_g: targetProtein,
    target_fat_g: targetFat,
     bmr_source: bmrSource,
    protein_rule: proteinRule,
    fat_rule: fatRule,
    carb_rule: carbRule,
    sodium_limit_mg: sodiumLimitMg,
    saturated_fat_limit_g: saturatedFatLimitG,
    meals_per_day: mealsPerDay,
    training_days_per_week: Number(mealPlanForm.training_days_per_week || 3),
    training_time: mealPlanForm.training_time || 'evening',
    activity_level: mealPlanForm.activity_level || 'light',
    inputs_json: {
      mealPlanForm,
      latestHealth: health,
                riceGuide,
       eatingBaseline: {
        usual_rice_amount_g: usualRiceAmountG,
        largest_meal_slot: mealPlanForm.largest_meal_slot || '저녁',
       meal_rice_map: normalizedMealRiceMap,
        meal_start_mode: mealPlanForm.meal_start_mode || 'current',
      },
    },
    result_json: {
      bmr,
      activityFactor,
      tdee,
      targetKcal,
      targetProtein,
      targetFat,
      targetCarbs,
      sodiumLimitMg,
      saturatedFatLimitG,
          diet_mode: mealPlanForm.diet_mode || 'balanced',
    adaptation_strategy: mealPlanForm.adaptation_strategy || 'gradual',
    current_meal_pattern: mealPlanForm.current_meal_pattern || 'mixed',
    snack_frequency_per_week: Number(mealPlanForm.snack_frequency_per_week || 0),
    bread_frequency_per_week: Number(mealPlanForm.bread_frequency_per_week || 0),
    junk_food_frequency_per_week: Number(mealPlanForm.junk_food_frequency_per_week || 0),
    delivery_food_frequency_per_week: Number(mealPlanForm.delivery_food_frequency_per_week || 0),
    late_night_meal_frequency_per_week: Number(mealPlanForm.late_night_meal_frequency_per_week || 0),
    allowed_general_meals_per_week: Number(mealPlanForm.allowed_general_meals_per_week || 0),
    allowed_free_meals_per_week: Number(mealPlanForm.allowed_free_meals_per_week || 0),
    allowed_snacks_per_week: Number(mealPlanForm.allowed_snacks_per_week || 0),
    allowed_bread_per_week: Number(mealPlanForm.allowed_bread_per_week || 0),
    allowed_dessert_per_week: Number(mealPlanForm.allowed_dessert_per_week || 0),
    meal_structure_mode: mealPlanForm.meal_structure_mode || 'structured',
          usual_rice_amount_g: usualRiceAmountG,
      
    largest_meal_slot: mealPlanForm.largest_meal_slot || '저녁',
      meal_rice_map: normalizedMealRiceMap,
    meal_start_mode: mealPlanForm.meal_start_mode || 'current',
    rice_carbs_g: riceGuide.carbs_g,
    rice_kcal: riceGuide.kcal,
      alcohol_frequency_per_week: Number(mealPlanForm.alcohol_frequency_per_week || 0),
    allowed_alcohol_per_week: Number(mealPlanForm.allowed_alcohol_per_week || 0),
    },
  }

  const { data: calcInsert, error: calcError } = await supabase
    .from('member_nutrition_calculations')
    .insert(calcPayload)
    .select('id')
    .single()

  if (calcError) {
    console.error('member_nutrition_calculations 저장 실패:', calcError)
  }

  const calculationId = calcInsert?.id || null

 setMealPlanForm((prev) => ({
  ...prev,
  meal_slots: mealSlots,
  target_kcal: targetKcal,
  target_protein_g: targetProtein,
  target_fat_g: targetFat,
  target_carbs_g: targetCarbs,
  target_sodium_mg: sodiumLimitMg,
}))
  const recommendation = buildPlanStyleRecommendation({
    mealPlanForm: {
      ...mealPlanForm,
      target_kcal: targetKcal,
      target_carbs_g: targetCarbs,
      target_protein_g: targetProtein,
      target_fat_g: targetFat,
    },
    targetKcal,
    goalType,
  })

 setMealPlanRecommendation({
  ...recommendation,
  sex,
  age,
  height_cm: height,
  weight_kg: weight,
  body_fat_percent: bodyFatPercent,
  bmr,
  tdee,
})
  setSelectedPlanStyle(recommendation.recommended_key || '')
  if (calculationId) {
  const { error: profileUpdateError } = await supabase
    .from('member_nutrition_profiles')
    .upsert(
      {
        member_id: mealPlanForm.member_id,
        admin_id: currentAdminId || null,
        goal_type: goalType,
        meals_per_day: mealsPerDay,
        meal_slots: mealSlots,
         meal_rice_map: normalizedMealRiceMap,
        activity_level: mealPlanForm.activity_level || 'light',
        training_days_per_week: Number(mealPlanForm.training_days_per_week || 3),
        training_time: mealPlanForm.training_time || 'evening',
        use_training_rest_split: !!mealPlanForm.use_training_rest_split,
        target_kcal: targetKcal,
        target_carbs_g: targetCarbs,
        target_protein_g: targetProtein,
        target_fat_g: targetFat,
        target_sodium_mg: sodiumLimitMg,
        excluded_foods: normalizeCommaTextToArray(mealPlanForm.excluded_foods),
        preferred_foods: normalizeCommaTextToArray(mealPlanForm.preferred_foods),
        allergies: normalizeCommaTextToArray(mealPlanForm.allergies),
        notes: mealPlanForm.notes || '',
        calculation_version: 'v2_food_engine',
        recommendation_version: 'v2_food_engine',
        diet_mode: mealPlanForm.diet_mode || 'balanced',
        adaptation_strategy: mealPlanForm.adaptation_strategy || 'gradual',
        current_meal_pattern: mealPlanForm.current_meal_pattern || 'mixed',
        snack_frequency_per_week: Number(mealPlanForm.snack_frequency_per_week || 0),
        bread_frequency_per_week: Number(mealPlanForm.bread_frequency_per_week || 0),
        junk_food_frequency_per_week: Number(mealPlanForm.junk_food_frequency_per_week || 0),
        delivery_food_frequency_per_week: Number(mealPlanForm.delivery_food_frequency_per_week || 0),
        late_night_meal_frequency_per_week: Number(mealPlanForm.late_night_meal_frequency_per_week || 0),
        allowed_general_meals_per_week: Number(mealPlanForm.allowed_general_meals_per_week || 0),
        allowed_free_meals_per_week: Number(mealPlanForm.allowed_free_meals_per_week || 0),
        allowed_snacks_per_week: Number(mealPlanForm.allowed_snacks_per_week || 0),
        allowed_bread_per_week: Number(mealPlanForm.allowed_bread_per_week || 0),
        allowed_dessert_per_week: Number(mealPlanForm.allowed_dessert_per_week || 0),
        meal_structure_mode: mealPlanForm.meal_structure_mode || 'structured',
                usual_rice_amount_g: usualRiceAmountG,
        largest_meal_slot: mealPlanForm.largest_meal_slot || '저녁',
         
        meal_start_mode: mealPlanForm.meal_start_mode || 'current',
        rice_amount_source: mealPlanForm.rice_amount_source || 'preset',
        alcohol_frequency_per_week: Number(mealPlanForm.alcohol_frequency_per_week || 0),
        allowed_alcohol_per_week: Number(mealPlanForm.allowed_alcohol_per_week || 0),
        last_calculation_id: calculationId,
      },
      { onConflict: 'member_id' }
    )

  if (profileUpdateError) {
    console.error('식단 프로필 동기화 실패:', profileUpdateError)
  }

  alert('자동 계산 완료')

  let foods = Array.isArray(foodMaster) ? foodMaster : []
  if (!foods.length) {
    foods = await loadFoodMaster()
  }

  const { preferredSet, blockedSet } = getPreferredBlockedSet(mealPlanForm, foods)
  const planStyleKey =
    selectedPlanStyle ||
    mealPlanForm.recommended_plan_style ||
    recommendation?.recommended_key ||
    'mixed'

  const planStyleEngine = getPlanStyleEngine(planStyleKey)
  const adjustedTargetKcal = getAdjustedTargetKcalByPlanStyle(targetKcal, planStyleKey)
  const selectedMonth = String(mealPlanViewMonth || new Date().toISOString().slice(0, 7))
  const [selectedYear, selectedMonthNumber] = selectedMonth.split('-').map(Number)
  const daysInMonth = new Date(selectedYear, selectedMonthNumber, 0).getDate()

  const framework = buildMonthlyDietFramework({
    daysInMonth,
    trainingDaysPerWeek: Number(mealPlanForm.training_days_per_week || 3),
    allowedGeneralMeals: Number(mealPlanForm.allowed_general_meals_per_week || 0),
    allowedFreeMeals: Number(mealPlanForm.allowed_free_meals_per_week || 0),
  })

  const mealPlans = []

  for (let i = 0; i < daysInMonth; i += 1) {
    const dayInfo = framework[i]
    const dateString = `${selectedMonth}-${String(i + 1).padStart(2, '0')}`

    const adjusted = getLifestyleAdjustedDayPlan({
      mealPlanForm,
      isTrainingDay: dayInfo.dayType === 'training',
      dayType: dayInfo.dayType,
      baseKcal: targetKcal,
      totalCarbs: targetCarbs,
      totalProtein: targetProtein,
      totalFat: targetFat,
    })

    const slotCount = Math.max(1, mealSlots.length)

    const carbBase = Math.floor(Number(adjusted.carbs || 0) / slotCount)
    const proteinBase = Math.floor(Number(adjusted.protein || 0) / slotCount)
    const fatBase = Math.floor(Number(adjusted.fat || 0) / slotCount)

    let carbRemainder = Number(adjusted.carbs || 0) - carbBase * slotCount
    let proteinRemainder = Number(adjusted.protein || 0) - proteinBase * slotCount
    let fatRemainder = Number(adjusted.fat || 0) - fatBase * slotCount

    const dayMeals = []
    let recentUsedIds = []
    let slotUsedNames = []
    let preferredIncludedCount = 0

    for (let slotIndex = 0; slotIndex < mealSlots.length; slotIndex += 1) {
      const slot = mealSlots[slotIndex]

      const perMealCarbs = carbBase + (carbRemainder > 0 ? 1 : 0)
      const perMealProtein = proteinBase + (proteinRemainder > 0 ? 1 : 0)
      const perMealFat = fatBase + (fatRemainder > 0 ? 1 : 0)

      if (carbRemainder > 0) carbRemainder -= 1
      if (proteinRemainder > 0) proteinRemainder -= 1
      if (fatRemainder > 0) fatRemainder -= 1

      const meal = buildSingleMealPlan({
        foods,
        goalType,
        slot,
        dayType: dayInfo.dayType,
        mealType: dayInfo.mealType,
        mealPlanForm,
        dateString,
        preferredSet,
        blockedSet,
        targetCarbs: perMealCarbs,
        targetProtein: perMealProtein,
        targetFat: perMealFat,
        targetKcal: Math.round(Number(adjusted.kcal || 0) / slotCount),
        offset: slotIndex,
        recentUsedIds,
        slotUsedNames,
        preferredIncludedCount,
      
      })

      recentUsedIds = Array.isArray(meal?.nextUsedIds) ? meal.nextUsedIds : recentUsedIds
      slotUsedNames = Array.isArray(meal?.nextSlotUsedNames) ? meal.nextSlotUsedNames : slotUsedNames
      preferredIncludedCount = Number(meal?.nextPreferredIncludedCount || preferredIncludedCount)

      dayMeals.push({
        slot,
       food_items: Array.isArray(meal?.items) ? meal.items : [],
menu: meal?.menu || buildMealMenuLabel(meal?.items || [], slot),
        guide_text: meal?.guide_text || '',
        kcal: Number(meal?.kcal || 0),
        carbs_g: Number(meal?.carbs_g || 0),
        protein_g: Number(meal?.protein_g || 0),
        fat_g: Number(meal?.fat_g || 0),
        sodium_mg: Number(meal?.sodium_mg || 0),
        target_kcal: Math.round(Number(adjusted.kcal || 0) / slotCount),
        target_carbs_g: perMealCarbs,
        target_protein_g: perMealProtein,
        target_fat_g: perMealFat,
      })
    }

    const totalKcal = dayMeals.reduce((sum, meal) => sum + Number(meal.kcal || 0), 0)
    const totalCarbs = dayMeals.reduce((sum, meal) => sum + Number(meal.carbs_g || 0), 0)
    const totalProtein = dayMeals.reduce((sum, meal) => sum + Number(meal.protein_g || 0), 0)
    const totalFat = dayMeals.reduce((sum, meal) => sum + Number(meal.fat_g || 0), 0)
    const totalSodium = dayMeals.reduce((sum, meal) => sum + Number(meal.sodium_mg || 0), 0)

    mealPlans.push({
      date: dateString,
      dayType: dayInfo.dayType,
      mealType: dayInfo.mealType,
      meals: dayMeals,
      target_kcal: Number(adjusted.kcal || 0),
      target_carbs_g: Number(adjusted.carbs || 0),
      target_protein_g: Number(adjusted.protein || 0),
      target_fat_g: Number(adjusted.fat || 0),
      total_kcal: totalKcal,
      total_carbs_g: totalCarbs,
      total_protein_g: totalProtein,
      total_fat_g: totalFat,
      total_sodium_mg: totalSodium,
      kcal_gap: totalKcal - Number(adjusted.kcal || 0),
      carbs_gap: totalCarbs - Number(adjusted.carbs || 0),
      protein_gap: totalProtein - Number(adjusted.protein || 0),
      fat_gap: totalFat - Number(adjusted.fat || 0),
    })
  }

  const monthStart = `${selectedMonth}-01`
  const monthEnd = `${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`

  const { error: deleteExistingError } = await supabase
    .from('member_meal_plans')
    .delete()
    .eq('member_id', mealPlanForm.member_id)
    .gte('plan_date', monthStart)
    .lte('plan_date', monthEnd)

  if (deleteExistingError) {
    console.error('기존 월간 식단 삭제 실패:', deleteExistingError)
    alert('기존 월간 식단 삭제 실패')
    return
  }

  const rows = mealPlans.map((plan) => ({
    member_id: mealPlanForm.member_id,
    admin_id: currentAdminId || null,
    plan_date: plan.date,
   day_type: plan.dayType,
    meals_json: plan.meals,
    total_kcal: plan.total_kcal,
    total_carbs_g: plan.total_carbs_g,
    total_protein_g: plan.total_protein_g,
    total_fat_g: plan.total_fat_g,
    generation_version: 'v4_target_based_system',
  }))

  const { error: insertError } = await supabase
  .from('member_meal_plans')
  .upsert(rows, { onConflict: 'member_id,plan_date' })

  if (insertError) {
  console.error('식단 저장 실패 상세:', {
    message: insertError.message,
    details: insertError.details,
    hint: insertError.hint,
    code: insertError.code,
    rows,
  })
  alert(`식단 저장 실패: ${insertError.message || '알 수 없는 오류'}`)
  return
}

    const { data: planData, error: loadError } = await supabase
    .from('member_meal_plans')
    .select('*')
    .eq('member_id', mealPlanForm.member_id)
    .gte('plan_date', monthStart)
    .lte('plan_date', monthEnd)
    .order('plan_date', { ascending: true })

  if (loadError) {
    console.error('생성 후 식단 목록 불러오기 실패:', loadError)
    alert('생성은 되었지만 목록 불러오기 실패')
    return
  }

  setMemberMealPlans(planData || [])
  console.log('✅ 월간 식단 생성 완료:', planData)
  alert('월간 식단 생성 + 저장 완료')
}
}
  const roundToNearest = (value, unit = 5) => {
  const numeric = Number(value || 0)
  if (!numeric) return 0
  return Math.round(numeric / unit) * unit
}

const getSafeNumber = (value) => {
  const numeric = Number(value || 0)
  return Number.isFinite(numeric) ? numeric : 0
}

const calculateBmrFromHealth = ({ weight, height, age, sex, bodyFatPercent, skeletalMuscleMass, healthBmr }) => {
  const directBmr = Math.round(getSafeNumber(healthBmr))
  if (directBmr > 0) {
    return {
      bmr: directBmr,
      bmr_source: 'health_log_bmr',
    }
  }

  const normalizedSex = String(sex || '').toLowerCase()
  const safeWeight = getSafeNumber(weight)
  const safeHeight = getSafeNumber(height)
  const safeAge = getSafeNumber(age)
  const safeBodyFatPercent = getSafeNumber(bodyFatPercent)
  const safeSkeletalMuscleMass = getSafeNumber(skeletalMuscleMass)

  if (safeWeight > 0 && safeBodyFatPercent > 0 && safeBodyFatPercent < 60) {
    const leanMass = safeWeight * (1 - safeBodyFatPercent / 100)
    const bmr = Math.round(370 + 21.6 * leanMass)

    return {
      bmr,
      bmr_source: 'katch_mcardle_body_fat',
    }
  }

  if (safeWeight > 0 && safeHeight > 0 && safeAge > 0 && (normalizedSex === 'male' || normalizedSex === 'female')) {
    const base = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge
    const bmr = Math.round(normalizedSex === 'male' ? base + 5 : base - 161)

    return {
      bmr,
      bmr_source: 'mifflin_st_jeor',
    }
  }

  if (safeWeight > 0 && safeSkeletalMuscleMass > 0) {
    const bmr = Math.round(370 + safeSkeletalMuscleMass * 21.6)

    return {
      bmr,
      bmr_source: 'skeletal_muscle_estimate',
    }
  }

  return {
    bmr: Math.round(safeWeight * 24),
    bmr_source: 'weight_fallback',
  }
}
const calculateSodiumTargetByGoal = ({ goalType = '', mealPlanForm = {} }) => {
  const junkFreq = Number(mealPlanForm?.junk_food_frequency_per_week || 0)
  const deliveryFreq = Number(mealPlanForm?.delivery_food_frequency_per_week || 0)
  const lateNightFreq = Number(mealPlanForm?.late_night_meal_frequency_per_week || 0)
  const alcoholFreq = Number(mealPlanForm?.alcohol_frequency_per_week || 0)

  const baseMap = {
    diet: 1800,
    recomposition: 2000,
    maintenance: 2000,
    muscle_gain: 2300,
    bulk: 2500,
  }

  let sodiumTargetMg = Number(baseMap[goalType] || 2000)

  const highSodiumLifestyleScore = junkFreq + deliveryFreq + lateNightFreq + alcoholFreq

  if (goalType === 'diet' || goalType === 'recomposition') {
    if (highSodiumLifestyleScore >= 5) sodiumTargetMg = Math.max(1600, sodiumTargetMg - 200)
  }

  if (goalType === 'muscle_gain' || goalType === 'bulk') {
    if (highSodiumLifestyleScore === 0) sodiumTargetMg += 100
  }

  return Math.round(sodiumTargetMg)
}

const isHighSodiumFoodItem = (item = {}) => {
  const name = String(
    item?.food_name ||
    item?.name ||
    item?.display_name ||
    item?.label ||
    ''
  ).trim()

  const sodiumMg = Number(item?.sodium_mg || 0)
  const sodiumPer100g = Number(item?.sodium_mg_per_100g || 0)

  if (sodiumMg >= 300) return true
  if (sodiumPer100g >= 500) return true

  return (
    name.includes('김치') ||
    name.includes('장아찌') ||
    name.includes('젓갈') ||
    name.includes('햄') ||
    name.includes('소시지') ||
    name.includes('베이컨') ||
    name.includes('국') ||
    name.includes('찌개') ||
    name.includes('라면') ||
    name.includes('소스')
  )
}
const calculateMealTargetsFromHealth = ({
  goalType,
  health,
  mealPlanForm,
}) => {
  const weight = getSafeNumber(health?.weight_kg)
  const height = getSafeNumber(health?.height_cm)
  const age = getSafeNumber(health?.age)
  const sex = String(health?.sex || '').toLowerCase()
  const bodyFatPercent = getSafeNumber(health?.body_fat_percent)
  const skeletalMuscleMass = getSafeNumber(health?.skeletal_muscle_mass)

  const defaultActivityFactor = getActivityFactorByLevel(mealPlanForm?.activity_level)
  const activityFactor =
    getSafeNumber(health?.activity_factor) > 0
      ? getSafeNumber(health?.activity_factor)
      : defaultActivityFactor

  const { bmr, bmr_source } = calculateBmrFromHealth({
    weight,
    height,
    age,
    sex,
    bodyFatPercent,
    skeletalMuscleMass,
    healthBmr: health?.bmr,
  })

  const tdee = Math.round(bmr * activityFactor)

  const goalAdjustmentPercentMap = {
    diet: -0.15,
    recomposition: -0.08,
    maintenance: 0,
    muscle_gain: 0.1,
    bulk: 0.15,
  }

  const proteinMultiplierMap = {
    diet: bodyFatPercent >= 30 ? 1.8 : 2.0,
    recomposition: 2.0,
    maintenance: 1.7,
    muscle_gain: 1.9,
    bulk: 1.8,
  }

  const fatMultiplierMap = {
    diet: 0.7,
    recomposition: 0.75,
    maintenance: 0.8,
    muscle_gain: 0.85,
    bulk: 0.9,
  }

  const goalAdjustmentPercent = Number(goalAdjustmentPercentMap[goalType] || 0)
  const goalAdjustmentKcal = Math.round(tdee * goalAdjustmentPercent)
  const targetKcal = Math.max(1200, Math.round(tdee * (1 + goalAdjustmentPercent)))

  const targetProtein = Math.max(
    60,
    roundToNearest(weight * Number(proteinMultiplierMap[goalType] || 1.8), 5)
  )

  const baseTargetFat = roundToNearest(weight * Number(fatMultiplierMap[goalType] || 0.8), 5)

  const targetFat =
    goalType === 'muscle_gain' || goalType === 'bulk'
      ? Math.max(60, baseTargetFat)
      : Math.max(35, baseTargetFat)

  const targetCarbs = Math.max(
    0,
    roundToNearest((targetKcal - targetProtein * 4 - targetFat * 9) / 4, 5)
  )
const sodiumTargetMg = calculateSodiumTargetByGoal({
  goalType,
  mealPlanForm,
})
  return {
    weight,
    height,
    age,
    sex,
    bodyFatPercent,
    skeletalMuscleMass,
    activityFactor,
    bmr,
    bmr_source,
    tdee,
    goalAdjustmentPercent,
    goalAdjustmentKcal,
    targetKcal,
    targetProtein,
    targetFat,
    targetCarbs,
    proteinRule: `${goalType} 기준 체중 x ${proteinMultiplierMap[goalType] || 1.8}g`,
    fatRule: `${goalType} 기준 체중 x ${fatMultiplierMap[goalType] || 0.8}g`,
    carbRule: '총열량에서 단백질/지방 제외 후 탄수화물 배분',
sodiumTargetMg,
  }
}

const getMealPrimaryItems = (items = []) => {
  const rows = Array.isArray(items) ? items : []
  return rows
    .filter((item) => Number(item?.grams || 0) > 0)
    .sort((a, b) => Number(b?.grams || 0) - Number(a?.grams || 0))
}

const getMealItemDisplayName = (item = {}) => {
  return String(
    item?.display_name ||
    item?.name ||
    item?.food_name ||
    item?.exercise_name_snapshot ||
    ''
  ).trim()
}

const buildMealCompositionText = (items = []) => {
  const primaryItems = getMealPrimaryItems(items).slice(0, 4)

  if (!primaryItems.length) return ''

  return primaryItems
    .map((item) => {
      const name = getMealItemDisplayName(item)
      const grams = roundToNearest(item?.grams || 0, 5)
      return grams > 0 ? `${name} ${grams}g` : name
    })
    .filter(Boolean)
    .join(' + ')
}
  const getMealItemRoleLabel = (item = {}) => {
  const major = String(item?.category_major || '').trim()
  const normalizedName = normalizeMenuFoodName(
    String(
      item?.food_name ||
      item?.name ||
      item?.display_name ||
      item?.label ||
      ''
    ).trim()
  )

  if (major === 'carb') return '탄수화물'
  if (major === 'vegetable') return '채소'
  if (major === 'fruit') return '과일'
  if (major === 'protein') return '단백질'
  if (major === 'fat') return '지방'
  if (major === 'dairy') return '유제품'

  if (['밥', '빵', '오트밀', '파스타'].includes(normalizedName)) return '탄수화물'
  if (['닭가슴살', '닭다리살', '참치', '소고기'].includes(normalizedName)) return '단백질'
  if (normalizedName === '연어') return '단백질+지방'
  if (['아보카도', '올리브오일', '치즈', '파마산치즈', '모짜렐라치즈', '페스토', '크림소스', '토마토소스'].includes(normalizedName)) return '지방'
  if (normalizedName === '샐러드') return '채소'

  return '재료'
}

const formatMealItemsWithRole = (items = []) => {
  const rows = Array.isArray(items) ? items : []

  return rows
    .map((item) => {
      if (typeof item === 'string') return item

      const name =
        item.food_name ||
        item.name ||
        item.display_name ||
        item.label ||
        item.food ||
        item.title ||
        ''

      const amount =
        item.grams ??
        item.amount_g ??
        item.amount ??
        item.serving_g ??
        item.weight_g ??
        item.quantity ??
        ''

      const role = getMealItemRoleLabel(item)

      if (name && amount) return `- ${name} ${amount}g (${role})`
      if (name) return `- ${name} (${role})`
      return ''
    })
    .filter(Boolean)
}

const formatMealMacroSummary = (meal = {}) => {
  return `한 끼 총 영양: ${meal.kcal || 0}kcal · 탄수화물 ${meal.carbs_g || 0}g · 단백질 ${meal.protein_g || 0}g · 지방 ${meal.fat_g || 0}g`
}

const formatMealTargetSummary = (meal = {}) => {
  const targetCarbs = Number(meal?.target_carbs_g || 0)
  const targetProtein = Number(meal?.target_protein_g || 0)
  const targetFat = Number(meal?.target_fat_g || 0)
  const targetSodium = Number(meal?.target_sodium_mg || 0)

  if (!targetCarbs && !targetProtein && !targetFat && !targetSodium) return ''

  return `내 몸 기준 한 끼 목표: 탄수화물 ${targetCarbs}g · 단백질 ${targetProtein}g · 지방 ${targetFat}g · 나트륨 ${targetSodium}mg`
}

const formatMealTargetDiffSummary = (meal = {}) => {
  const carbDiff = Number(meal?.carbs_g || 0) - Number(meal?.target_carbs_g || 0)
  const proteinDiff = Number(meal?.protein_g || 0) - Number(meal?.target_protein_g || 0)
  const fatDiff = Number(meal?.fat_g || 0) - Number(meal?.target_fat_g || 0)
  const sodiumDiff = Number(meal?.sodium_mg || 0) - Number(meal?.target_sodium_mg || 0)

  const toStatusText = (label, value, unit = 'g') => {
    const rounded = Math.round(value)

    if (rounded === 0) return `${label} 적정`
    if (rounded < 0) return `${label} ${Math.abs(rounded)}${unit} 적음`
    return `${label} ${rounded}${unit} 많음`
  }

  return `한 끼 목표 대비: ${[
    toStatusText('탄수화물', carbDiff, 'g'),
    toStatusText('단백질', proteinDiff, 'g'),
    toStatusText('지방', fatDiff, 'g'),
    toStatusText('나트륨', sodiumDiff, 'mg'),
  ].join(' · ')}`
}
  const formatMealFeedbackSummary = (meal = {}) => {
  const items = Array.isArray(meal?.food_items) ? meal.food_items : []

  const carbDiff = Number(meal?.carbs_g || 0) - Number(meal?.target_carbs_g || 0)
  const proteinDiff = Number(meal?.protein_g || 0) - Number(meal?.target_protein_g || 0)
  const fatDiff = Number(meal?.fat_g || 0) - Number(meal?.target_fat_g || 0)
  const sodiumDiff = Number(meal?.sodium_mg || 0) - Number(meal?.target_sodium_mg || 0)

  const roleCounts = items.reduce(
    (acc, item) => {
      const role = getMealItemRoleLabel(item)

      if (role.includes('탄수화물')) acc.carb += 1
      if (role.includes('단백질')) acc.protein += 1
      if (role.includes('지방')) acc.fat += 1
      if (role.includes('채소')) acc.vegetable += 1
      if (isHighSodiumFoodItem(item)) acc.highSodium += 1

      return acc
    },
    {
      carb: 0,
      protein: 0,
      fat: 0,
      vegetable: 0,
      highSodium: 0,
    }
  )

  const reasons = []
  const suggestions = []
  const calculationExplain = []

  const carbMain = items.filter((item) => getMealItemRoleLabel(item).includes('탄수화물'))
  const proteinMain = items.filter((item) => getMealItemRoleLabel(item).includes('단백질'))
  const fatMain = items.filter((item) => getMealItemRoleLabel(item).includes('지방'))
  const sodiumMain = items.filter((item) => isHighSodiumFoodItem(item))

  if (carbMain.length > 0) {
    calculationExplain.push(`탄수화물은 ${carbMain.map((item) => getMealItemDisplayName(item)).join(', ')} 중심으로 계산됩니다.`)
  }
  if (proteinMain.length > 0) {
    calculationExplain.push(`단백질은 ${proteinMain.map((item) => getMealItemDisplayName(item)).join(', ')} 중심으로 계산됩니다.`)
  }
  if (fatMain.length > 0) {
    calculationExplain.push(`지방은 ${fatMain.map((item) => getMealItemDisplayName(item)).join(', ')} 중심으로 계산됩니다.`)
  }
  if (sodiumMain.length > 0) {
    calculationExplain.push(`나트륨은 ${sodiumMain.map((item) => getMealItemDisplayName(item)).join(', ')} 영향이 큰 편입니다.`)
  }

  if (Math.round(carbDiff) < 0) {
    reasons.push('탄수화물 재료는 들어가 있지만 전체 양이 목표보다 적게 계산됩니다.')
    suggestions.push(`밥이나 고구마를 ${Math.abs(Math.round(carbDiff))}g 안팎 더 보완할 수 있습니다.`)
  } else if (Math.round(carbDiff) > 0) {
    reasons.push('탄수화물 재료 비중이 높아 목표보다 조금 많게 계산됩니다.')
    suggestions.push('다음 끼니에서는 밥, 빵, 면류 양을 조금 줄여 균형을 맞추면 좋습니다.')
  }

  if (Math.round(proteinDiff) < 0) {
    reasons.push('단백질 재료 총량이 목표보다 적게 계산됩니다.')
    suggestions.push(`닭가슴살, 연어, 소고기, 계란 등을 ${Math.abs(Math.round(proteinDiff))}g 안팎 더 보완할 수 있습니다.`)
  } else if (Math.round(proteinDiff) > 0) {
    reasons.push('단백질 비중이 높아 목표보다 충분하거나 조금 많게 계산됩니다.')
    suggestions.push('현재 식사는 단백질이 충분한 편이라 다음 끼니는 유지해도 좋습니다.')
  }

  if (Math.round(fatDiff) < 0) {
    reasons.push('지방 재료가 적거나 양이 작아 목표보다 적게 계산됩니다.')
    suggestions.push(`아보카도, 견과류, 치즈, 올리브오일 등을 ${Math.abs(Math.round(fatDiff))}g 안팎 보완할 수 있습니다.`)
  } else if (Math.round(fatDiff) > 0) {
    reasons.push('지방 재료 비중이 높아 목표보다 조금 많게 계산됩니다.')
    suggestions.push('다음 끼니에서는 견과류, 치즈, 오일류 양을 조금 줄여도 좋습니다.')
  }

  if (Math.round(sodiumDiff) > 0) {
    reasons.push('김치, 소스, 가공 반찬 등으로 인해 나트륨이 목표보다 높게 계산됩니다.')
    suggestions.push(`나트륨은 ${Math.round(sodiumDiff)}mg 정도 높은 편이라 김치, 국물, 소스 양을 줄이면 좋습니다.`)
  } else if (Math.round(sodiumDiff) < 0) {
    reasons.push('나트륨은 목표보다 낮거나 적정 범위로 계산됩니다.')
    suggestions.push('현재 식사는 나트륨 관리 측면에서 무난한 편입니다.')
  }

  if (!reasons.length) {
    reasons.push('탄수화물, 단백질, 지방, 나트륨 구성이 전체적으로 목표에 가깝습니다.')
  }

  if (!suggestions.length) {
    suggestions.push('현재 식사 구성을 그대로 유지해도 좋습니다.')
  }

  const coachFeedback = (() => {
    const 부족 = []
    const 초과 = []

    if (Math.round(carbDiff) < 0) 부족.push('탄수화물')
    if (Math.round(proteinDiff) < 0) 부족.push('단백질')
    if (Math.round(fatDiff) < 0) 부족.push('지방')

    if (Math.round(carbDiff) > 0) 초과.push('탄수화물')
    if (Math.round(proteinDiff) > 0) 초과.push('단백질')
    if (Math.round(fatDiff) > 0) 초과.push('지방')
    if (Math.round(sodiumDiff) > 0) 초과.push('나트륨')

    if (!부족.length && !초과.length) {
      return '현재 식사는 목표와 거의 맞아서 그대로 진행해도 좋습니다.'
    }

    if (부족.length && !초과.length) {
      return `현재 식사는 ${부족.join(', ')} 보완이 필요한 편입니다. 다음 끼니에서 해당 재료를 조금 더 채워주세요.`
    }

    if (!부족.length && 초과.length) {
      return `현재 식사는 ${초과.join(', ')} 비중이 높은 편입니다. 다음 끼니에서 양을 가볍게 조절하면 좋습니다.`
    }

    return `현재 식사는 ${부족.join(', ')}은 보완이 필요하고, ${초과.join(', ')}은 조절이 필요합니다.`
  })()

  return [
    '이 수치는 이렇게 계산돼요',
    ...calculationExplain.map((text) => `- ${text}`),
    '',
    '왜 이렇게 나왔나요?',
    ...reasons.map((text) => `- ${text}`),
    '',
    '보완하면 좋아요',
    ...suggestions.map((text) => `- ${text}`),
    '',
    '코치 피드백',
    `- ${coachFeedback}`,
  ].join('\n')
}

  
const getMealFatItems = (items = []) => {
  const rows = Array.isArray(items) ? items : []

  return rows.filter((item) => {
    const category = String(item?.category_major || '').trim()
    const name = String(item?.name || '').trim().toLowerCase()

    if (category === 'fat') return true

    return (
      name.includes('연어') ||
      name.includes('고등어') ||
      name.includes('계란') ||
      name.includes('치즈') ||
      name.includes('닭다리살') ||
      name.includes('소고기')
    )
  })
}

const buildMealFatDetailText = (items = []) => {
  const fatItems = getMealFatItems(items)

  if (!fatItems.length) return ''

  return fatItems
    .map((item) => {
      const name = String(item?.name || '').trim()
      const grams = Math.round(Number(item?.grams || 0))
      const fat = Math.round(Number(item?.fat_g || 0))
      return `${name} ${grams}g (지방 약 ${fat}g)`
    })
    .join(', ')
}

const getMealFatTotalFromFatItems = (items = []) => {
  return getMealFatItems(items).reduce((sum, item) => {
    return sum + Number(item?.fat_g || 0)
  }, 0)
}

const buildMealCookingGuide = ({ items = [], slot = '', menuTitle = '' }) => {
  const names = (Array.isArray(items) ? items : []).map((item) =>
    normalizeMenuFoodName(String(item?.name || '').trim())
  )

  const structureType = getMealStructureType(items, slot)

  const proteinName =
    names.find((name) => ['닭가슴살', '닭다리살', '연어', '참치', '소고기', '계란', '그릭요거트'].includes(name)) || ''

  const fatNames = getMealFatItems(items).map((item) =>
    normalizeMenuFoodName(String(item?.name || '').trim())
  )

  const mainFatName = fatNames[0] || ''
  const secondFatName = fatNames[1] || ''

  if (structureType === 'pasta_meal') {
    if (menuTitle.includes('알리오 올리오')) {
      return [
        '파스타면은 삶아서 물기를 뺀 뒤 준비',
        proteinName ? `${proteinName}은 따로 익혀 메인 단백질로 준비` : '',
        '마늘 향을 살리고 올리브오일로 가볍게 볶아 면과 함께 섞어서 섭취',
      ].filter(Boolean).join(' / ')
    }

    if (menuTitle.includes('오일 파스타')) {
      return [
        '파스타면은 삶아서 준비',
        proteinName ? `${proteinName}은 먼저 익혀서 준비` : '',
        '오일 베이스로 가볍게 볶아 파스타 형태로 섭취',
      ].filter(Boolean).join(' / ')
    }

    if (menuTitle.includes('치즈 파스타')) {
      return [
        '파스타면은 삶아서 준비',
        proteinName ? `${proteinName}은 먼저 익혀서 준비` : '',
        '치즈는 과하지 않게 넣어 풍미만 더하고 면과 함께 섞어서 섭취',
      ].filter(Boolean).join(' / ')
    }

    if (menuTitle.includes('토마토 파스타')) {
      return [
        '파스타면은 삶아서 준비',
        proteinName ? `${proteinName}은 먼저 익혀서 준비` : '',
        '토마토소스를 더해 면과 가볍게 섞어 한 끼 식사로 섭취',
      ].filter(Boolean).join(' / ')
    }

    if (menuTitle.includes('볼로네제')) {
      return [
        '파스타면은 삶아서 준비',
        '소고기는 먼저 익혀서 토마토소스와 함께 볶아 소스처럼 준비',
        '면과 소스를 함께 섞어 볼로네제 형태로 섭취',
      ].join(' / ')
    }

    if (menuTitle.includes('페스토')) {
      return [
        '파스타면은 삶아서 준비',
        proteinName ? `${proteinName}은 먼저 익혀서 준비` : '',
        '페스토를 과하지 않게 넣고 면과 함께 섞어 풍미를 살려 섭취',
      ].filter(Boolean).join(' / ')
    }

    if (menuTitle.includes('단백질 파스타')) {
      return [
        '파스타면은 삶아서 준비',
        proteinName ? `${proteinName}은 익혀서 단백질 재료로 사용` : '',
        '면과 단백질 재료를 함께 섞어 한 끼 식사 형태로 섭취',
      ].filter(Boolean).join(' / ')
    }

    return '파스타면은 삶아서 준비하고, 단백질 재료와 함께 섞어 한 끼 식사 형태로 섭취'
  }

  if (menuTitle.includes('덮밥')) {
    const parts = []

    if (proteinName) {
      parts.push(`${proteinName}은 굽거나 익혀서 메인 단백질로 준비`)
    }

    parts.push('밥 위에 단백질과 곁들임 재료를 올려 덮밥 형태로 구성')

    if (mainFatName === '아보카도') {
      parts.push('아보카도는 슬라이스해서 마지막에 올려 함께 섭취')
    } else if (mainFatName === '올리브오일') {
      parts.push('올리브오일은 조리 후 또는 채소 위에 소량만 추가')
    } else if (isNutLikeFatName(mainFatName)) {
      parts.push('견과류는 소량만 곁들여 식감과 지방을 보완')
    } else if (mainFatName === '치즈') {
      parts.push('치즈는 과하지 않게 소량만 추가해 풍미를 보완')
    }

    return parts.join(' / ')
  }

  if (menuTitle.includes('플레이트')) {
    const parts = []

    if (proteinName) {
      parts.push(`${proteinName}은 굽거나 익혀서 메인 단백질로 준비`)
    }

    parts.push('밥과 단백질, 채소를 접시에 나눠 담아 플레이트 형태로 구성')

    if (mainFatName === '올리브오일') {
      parts.push('올리브오일은 샐러드 또는 채소 위에 소량만 추가')
    } else if (mainFatName === '아보카도') {
      parts.push('아보카도는 슬라이스해서 곁들여 섭취')
    }

    return parts.join(' / ')
  }

  if (menuTitle.includes('샐러드')) {
    const parts = []

    if (proteinName) {
      parts.push(`${proteinName}은 굽거나 익혀서 샐러드 위에 올려 사용`)
    }

    parts.push('채소와 메인 단백질을 함께 담아 샐러드 형태로 구성')

    if (mainFatName === '아보카도') {
      parts.push('아보카도는 슬라이스해서 토핑처럼 올려 함께 섭취')
    } else if (mainFatName === '올리브오일') {
      parts.push('올리브오일은 드레싱처럼 소량만 둘러서 섭취')
    } else if (isNutLikeFatName(mainFatName) || isNutLikeFatName(secondFatName)) {
      parts.push('견과류는 토핑처럼 소량만 올려 식감과 지방을 보완')
    }

    return parts.join(' / ')
  }

  if (menuTitle.includes('토스트')) {
    const parts = ['빵은 가볍게 구워서 사용']

    if (mainFatName && isNutButterLikeFatName(mainFatName)) {
      parts.push(`${mainFatName}는 빵에 얇게 바르고 과하지 않게 섭취`)
    } else if (mainFatName === '아보카도') {
      parts.push('아보카도는 으깨거나 슬라이스해서 빵 위에 올려 섭취')
    }

    if (proteinName && proteinName !== '그릭요거트') {
      parts.push(`${proteinName}은 곁들이거나 함께 올려 섭취`)
    }

    return parts.join(' / ')
  }

  if (menuTitle.includes('견과볼') || menuTitle.includes('그릭요거트') || menuTitle.includes('오트밀')) {
    const parts = []

    if (names.includes('그릭요거트')) {
      parts.push('요거트에 과일과 견과류를 넣어 볼 형태로 섞어서 섭취')
    } else if (names.includes('오트밀')) {
      parts.push('오트밀에 토핑을 올려 볼 형태로 섭취')
    } else {
      parts.push('한 그릇에 담아 가볍게 섭취')
    }

    if (mainFatName && isNutButterLikeFatName(mainFatName)) {
      parts.push(`${mainFatName}는 소량만 추가해서 지방을 보완`)
    } else if (mainFatName && isNutLikeFatName(mainFatName)) {
      parts.push('견과류는 토핑처럼 올려 식감과 지방을 보완')
    }

    return parts.join(' / ')
  }

  if (structureType === 'rice_meal') {
    return '밥과 메인 단백질을 함께 한 끼 식사 형태로 구성'
  }

  if (structureType === 'salad_meal') {
    return '채소와 단백질을 함께 담아 샐러드 형태로 섭취'
  }

  if (structureType === 'bowl_meal') {
    return '한 그릇에 담아 볼 형태로 섭취'
  }

  if (structureType === 'bread_meal') {
    return '빵과 곁들임 재료를 함께 구성해 섭취'
  }

  return slot === '간식' || slot === '오전간식' || slot === '야식'
    ? '간식 형태로 가볍게 구성해서 섭취'
    : '한 끼 식사 형태로 준비해서 섭취'
}

const getMealStructureType = (items = [], slot = '') => {
  const rows = Array.isArray(items) ? items : []
  const names = rows.map((item) => normalizeMenuFoodName(String(item?.name || '').trim()))
  const rawNames = rows.map((item) => String(item?.name || '').trim())

  const hasPasta = rawNames.some((name) => name.includes('파스타')) || names.some((name) => name.includes('파스타'))
  const hasRice = names.some((name) => name === '밥' || name.includes('덮밥'))
  const hasBread = names.some((name) => name === '빵' || name.includes('토스트'))
  const hasOat = names.some((name) => name === '오트밀')
  const hasYogurt = names.some((name) => name === '그릭요거트')
  const hasSalad = names.some((name) => name === '샐러드' || name.includes('채소'))
  const isSnackLike = ['간식', '오전간식', '야식'].includes(slot)

  if (hasPasta) return 'pasta_meal'
  if (hasRice) return 'rice_meal'
  if (hasBread) return 'bread_meal'
  if (hasOat || hasYogurt) return 'bowl_meal'
  if (hasSalad) return 'salad_meal'
  if (isSnackLike) return 'snack_meal'

  return 'general_meal'
}

const getAllowedFatFoodNamesByStructure = (structureType = '') => {
    const map = {
    rice_meal: ['아보카도', '올리브오일', '아몬드', '호두', '치즈'],
      pasta_meal: ['올리브오일', '치즈', '토마토소스', '페스토', '크림소스', '파마산치즈', '모짜렐라치즈'],
    bread_meal: ['아보카도', '땅콩버터', '아몬드버터', '치즈'],
    bowl_meal: ['아몬드', '호두', '캐슈넛', '피스타치오', '땅콩버터', '아몬드버터'],
    salad_meal: ['아보카도', '올리브오일', '아몬드', '호두', '치즈'],
    snack_meal: ['아몬드', '호두', '캐슈넛', '피스타치오', '땅콩버터', '아몬드버터', '치즈'],
    general_meal: ['아보카도', '올리브오일', '아몬드', '호두', '치즈'],
  }

  return map[structureType] || map.general_meal
}

  const normalizePastaSauceName = (rawName = '') => {
  const name = String(rawName || '').trim()

  if (!name) return ''

  if (name.includes('볼로네제')) return '토마토소스'
  if (name.includes('토마토소스') || name.includes('토마토 파스타소스')) return '토마토소스'
  if (name.includes('페스토')) return '페스토'
  if (name.includes('크림소스') || name.includes('화이트소스') || name.includes('크림')) return '크림소스'
  if (name.includes('파마산')) return '파마산치즈'
  if (name.includes('모짜렐라')) return '모짜렐라치즈'
  if (name.includes('치즈')) return '치즈'
  if (name.includes('올리브오일')) return '올리브오일'

  return ''
}

const getPastaExtraPriorityName = (rawName = '') => {
  const normalized = normalizePastaSauceName(rawName)

  if (normalized === '파마산치즈' || normalized === '모짜렐라치즈') return '치즈'
  if (normalized === '토마토소스') return '토마토소스'
  if (normalized === '페스토') return '페스토'
  if (normalized === '크림소스') return '크림소스'
  if (normalized === '치즈') return '치즈'
  if (normalized === '올리브오일') return '올리브오일'

  return ''
}
const applyPastaMinimumFat = ({
  items = [],
  foods = [],
  slot = '',
  dateString = '',
}) => {
  const nextItems = Array.isArray(items) ? [...items] : []
  const structureType = getMealStructureType(nextItems, slot)

  if (structureType !== 'pasta_meal') {
    return nextItems
  }

  const hasPastaSauceOrFat = nextItems.some((item) => {
    const normalizedItemName = normalizeMenuFoodName(String(item?.name || '').trim())
    return (
      normalizedItemName === '올리브오일' ||
      normalizedItemName === '토마토소스' ||
      normalizedItemName === '페스토' ||
      normalizedItemName === '크림소스' ||
      normalizedItemName === '파마산치즈' ||
      normalizedItemName === '모짜렐라치즈' ||
      normalizedItemName === '치즈'
    )
  })

  if (hasPastaSauceOrFat) {
    return nextItems
  }

  const allowedNames = ['올리브오일', '치즈', '토마토소스', '페스토', '크림소스', '파마산치즈', '모짜렐라치즈']

  const pastaExtraCandidates = (Array.isArray(foods) ? [...foods] : [])
    .filter((food) => {
      const normalizedName = normalizeMenuFoodName(String(food?.name || '').trim())
      return allowedNames.includes(normalizedName)
    })
    .sort((a, b) => {
      const priority = ['올리브오일', '치즈', '토마토소스', '페스토', '크림소스']

      const aPriority = getPastaExtraPriorityName(String(a?.name || '').trim())
      const bPriority = getPastaExtraPriorityName(String(b?.name || '').trim())

      const aIndex = priority.indexOf(aPriority)
      const bIndex = priority.indexOf(bPriority)

      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
    })

  if (!pastaExtraCandidates.length) {
    return nextItems
  }

  const slotSeedMap = {
    아침: 0,
    점심: 1,
    저녁: 2,
    간식: 3,
    오전간식: 4,
    야식: 5,
    운동후: 6,
  }

  const daySeed = Number(String(dateString || '').slice(-2) || 0)
  const slotSeed = Number(slotSeedMap[slot] || 0)
  const rotateIndex = (daySeed + slotSeed) % pastaExtraCandidates.length

  const pastaExtraFood = pastaExtraCandidates[rotateIndex]
  const normalizedSelectedName = normalizeMenuFoodName(String(pastaExtraFood?.name || '').trim())

  const defaultGrams =
    normalizedSelectedName === '올리브오일'
      ? 10
      : (
          normalizedSelectedName === '치즈' ||
          normalizedSelectedName === '파마산치즈' ||
          normalizedSelectedName === '모짜렐라치즈'
        )
        ? 20
        : Number(pastaExtraFood?.typical_portion_g || 20)

  nextItems.push(buildMealFoodItem(pastaExtraFood, defaultGrams))
  return nextItems
}
  
const normalizeMenuFoodName = (rawName = '') => {
  const name = String(rawName || '').trim()

  if (!name) return ''

  if (name.includes('고단백요거트')) return '그릭요거트'
  if (name.includes('샐러드채소')) return '샐러드'
  if (name.includes('구운계란') || name.includes('계란노른자')) return '계란'
  if (name.includes('백미밥') || name.includes('현미밥')) return '밥'
  if (name.includes('파스타면') || name.includes('스파게티면') || name.includes('펜네')) return '파스타'

  if (name.includes('올리브오일')) return '올리브오일'
  if (name.includes('볼로네제')) return '토마토소스'
  if (name.includes('토마토소스') || name.includes('토마토 파스타소스')) return '토마토소스'
  if (name.includes('페스토')) return '페스토'
  if (name.includes('크림소스') || name.includes('화이트소스') || name.includes('크림')) return '크림소스'
  if (name.includes('파마산')) return '파마산치즈'
  if (name.includes('모짜렐라')) return '모짜렐라치즈'

  if (name.includes('아몬드버터')) return '아몬드버터'
  if (name.includes('땅콩버터')) return '땅콩버터'
  if (name.includes('아보카도')) return '아보카도'

  if (
    name.includes('닭가슴살') ||
    name.includes('닭안심') ||
    name.includes('닭안심살') ||
    name.includes('치킨브레스트')
  ) return '닭가슴살'

  if (name.includes('닭다리살')) return '닭다리살'
  if (name.includes('연어')) return '연어'
  if (name.includes('참치살') || name.includes('참치캔') || name.includes('물참치') || name.includes('참치')) return '참치'
  if (name.includes('소고기 우둔') || name.includes('소고기')) return '소고기'

  if (name.includes('치즈')) return '치즈'
  if (name.includes('아몬드')) return '아몬드'
  if (name.includes('호두')) return '호두'
  if (name.includes('캐슈')) return '캐슈넛'
  if (name.includes('피스타치오')) return '피스타치오'

  if (name.includes('오트밀')) return '오트밀'
  if (name.includes('바나나')) return '바나나'
  if (name.includes('사과')) return '사과'
  if (name.includes('블루베리')) return '블루베리'

  if (name.includes('통밀식빵') || name.includes('베이글') || name.includes('토스트')) return '빵'

  return name
}

const isNutLikeFatName = (name = '') => {
  const value = String(name || '').trim()
  return ['아몬드', '호두', '캐슈넛', '피스타치오'].includes(value)
}

const isNutButterLikeFatName = (name = '') => {
  const value = String(name || '').trim()
  return ['땅콩버터', '아몬드버터'].includes(value)
}

const getPrimaryMealItemsForNaming = (items = [], slot = '') => {
  const rows = getMealPrimaryItems(items)
  const structureType = getMealStructureType(rows, slot)

  const proteinItem =
    rows.find((item) => String(item?.category_major || '').trim() === 'protein') ||
    rows.find((item) => String(item?.category_major || '').trim() === 'dairy') ||
    rows[0] ||
    null

  const carbItem = rows.find((item) => String(item?.category_major || '').trim() === 'carb') || null
  const fruitItem = rows.find((item) => String(item?.category_major || '').trim() === 'fruit') || null
  const fatItem = getMealFatItems(rows)[0] || null
  const secondFatItem = getMealFatItems(rows)[1] || null

  return {
    rows,
    structureType,
    proteinName: normalizeMenuFoodName(getMealItemDisplayName(proteinItem)),
    carbName: normalizeMenuFoodName(getMealItemDisplayName(carbItem)),
    fruitName: normalizeMenuFoodName(getMealItemDisplayName(fruitItem)),
    fatName: normalizeMenuFoodName(getMealItemDisplayName(fatItem)),
    secondFatName: normalizeMenuFoodName(getMealItemDisplayName(secondFatItem)),
    hasSalad: rows.some((item) => normalizeMenuFoodName(getMealItemDisplayName(item)) === '샐러드'),
    hasRice: rows.some((item) => normalizeMenuFoodName(getMealItemDisplayName(item)) === '밥'),
    hasYogurt: rows.some((item) => normalizeMenuFoodName(getMealItemDisplayName(item)) === '그릭요거트'),
    hasOatmeal: rows.some((item) => normalizeMenuFoodName(getMealItemDisplayName(item)) === '오트밀'),
    hasBread: rows.some((item) => normalizeMenuFoodName(getMealItemDisplayName(item)) === '빵'),
  }
}

const getPastaMenuTitle = ({
  proteinName = '',
  fatName = '',
  secondFatName = '',
}) => {
  const fatNames = [fatName, secondFatName].filter(Boolean)

  if (proteinName === '닭가슴살' && fatNames.includes('올리브오일')) {
    return '닭가슴살 알리오 올리오'
  }

  if (proteinName === '연어' && fatNames.includes('올리브오일')) {
    return '연어 오일 파스타'
  }

  if (proteinName === '참치' && fatNames.includes('올리브오일')) {
    return '참치 오일 파스타'
  }

  if (proteinName === '소고기' && fatNames.includes('올리브오일')) {
    return '소고기 오일 파스타'
  }

  if (proteinName === '닭가슴살' && fatNames.includes('치즈')) {
    return '닭가슴살 치즈 파스타'
  }

  if (proteinName === '연어' && fatNames.includes('치즈')) {
    return '연어 치즈 파스타'
  }

  if (proteinName === '참치' && fatNames.includes('치즈')) {
    return '참치 치즈 파스타'
  }

  if (proteinName === '소고기' && fatNames.includes('치즈')) {
    return '소고기 치즈 파스타'
  }

  if (proteinName === '닭가슴살' && fatNames.includes('토마토소스')) {
    return '닭가슴살 토마토 파스타'
  }

  if (proteinName === '소고기' && fatNames.includes('토마토소스')) {
    return '소고기 볼로네제 파스타'
  }

  if (proteinName === '참치' && fatNames.includes('토마토소스')) {
    return '참치 토마토 파스타'
  }

  if (proteinName === '연어' && fatNames.includes('토마토소스')) {
    return '연어 토마토 파스타'
  }

  if (proteinName === '닭가슴살' && fatNames.includes('페스토')) {
    return '닭가슴살 페스토 파스타'
  }

  if (proteinName === '연어' && fatNames.includes('페스토')) {
    return '연어 페스토 파스타'
  }

  if (proteinName === '참치' && fatNames.includes('페스토')) {
    return '참치 페스토 파스타'
  }

  if (proteinName === '소고기' && fatNames.includes('페스토')) {
    return '소고기 페스토 파스타'
  }
  if (proteinName === '닭가슴살' && fatNames.includes('크림소스')) {
    return '닭가슴살 크림 파스타'
  }

  if (proteinName === '연어' && fatNames.includes('크림소스')) {
    return '연어 크림 파스타'
  }

  if (proteinName === '소고기' && fatNames.includes('크림소스')) {
    return '소고기 크림 파스타'
  }

  if (proteinName === '닭가슴살' && fatNames.includes('파마산치즈')) {
    return '닭가슴살 파마산 파스타'
  }

  if (proteinName === '소고기' && fatNames.includes('파마산치즈')) {
    return '소고기 파마산 파스타'
  }

  if (proteinName === '연어' && fatNames.includes('모짜렐라치즈')) {
    return '연어 치즈 파스타'
  }
  if (proteinName === '소고기') return '소고기 단백질 파스타'
  if (proteinName === '참치') return '참치 단백질 파스타'
  if (proteinName === '연어') return '연어 단백질 파스타'
  if (proteinName === '닭가슴살') return '닭가슴살 단백질 파스타'
  if (proteinName === '닭다리살') return '닭다리살 단백질 파스타'

  return '단백질 파스타'
}

const getMealReasonText = ({ menuTitle = '', slot = '' }) => {
    if (menuTitle.includes('알리오 올리오')) {
    return '과한 소스 없이 깔끔하게 먹으면서 단백질까지 챙기기 좋은 파스타입니다.'
  }

  if (menuTitle.includes('오일 파스타')) {
    return '좋은 지방과 단백질을 함께 확보해 포만감과 에너지 유지에 유리한 파스타입니다.'
  }

  if (menuTitle.includes('치즈 파스타')) {
    return '풍미와 만족감을 높이면서 단백질을 함께 확보하는 파스타입니다.'
  }

  if (menuTitle.includes('토마토 파스타')) {
    return '상대적으로 부담이 적고 깔끔하게 먹기 좋은 파스타 구성입니다.'
  }

  if (menuTitle.includes('볼로네제')) {
    return '벌크나 유지 단계에서 탄수와 단백질을 함께 확보하기 좋은 파스타입니다.'
  }

  if (menuTitle.includes('페스토')) {
    return '풍미와 지방을 함께 챙기면서 식사 만족감을 높이기 좋은 파스타입니다.'
  }

  if (menuTitle.includes('단백질 파스타')) {
    return '파스타를 먹더라도 단백질 비중을 높여 한 끼 식사로 활용하기 좋은 구성입니다.'
  }

  if (menuTitle.includes('덮밥')) {
    return '한 그릇 식사처럼 이해하기 쉬운 구조로 맞춘 식사입니다.'
  }

  if (menuTitle.includes('플레이트')) {
    return '탄수·단백질·지방을 나눠 담아 조절하기 쉬운 식사입니다.'
  }

  if (menuTitle.includes('샐러드')) {
    return '포만감과 지방 보완을 함께 고려한 샐러드형 식사입니다.'
  }

  if (menuTitle.includes('견과볼') || menuTitle.includes('그릭요거트') || menuTitle.includes('오트밀')) {
    return '간식이나 가벼운 끼니로 소화 부담을 줄인 구성입니다.'
  }

  return slot === '간식' || slot === '오전간식' || slot === '야식'
    ? '가볍게 섭취하면서도 필요한 영양을 보완하는 구성입니다.'
    : '한 끼 식사로 이해하기 쉽고 실행하기 좋은 구성입니다.'
}
  
const getMealMenuTitleByItems = (items = [], slot = '') => {
  const rows = getMealPrimaryItems(items)

  if (!rows.length) {
    return slot === '간식' || slot === '오전간식' || slot === '야식'
      ? '간식 구성'
      : '맞춤 식사 구성'
  }

  const {
    structureType,
    proteinName,
    carbName,
    fruitName,
    fatName,
    secondFatName,
    hasSalad,
    hasRice,
    hasYogurt,
    hasOatmeal,
    hasBread,
  } = getPrimaryMealItemsForNaming(rows, slot)

  const snackLike = ['간식', '오전간식', '야식'].includes(slot)

  if (structureType === 'pasta_meal') {
    return getPastaMenuTitle({
      proteinName,
      fatName,
      secondFatName,
    })
  }

  if (structureType === 'rice_meal') {
    if (fatName === '아보카도' && proteinName) return `${proteinName} 아보카도 덮밥`
    if (fatName === '올리브오일' && proteinName) return `${proteinName} 올리브오일 플레이트`
    if (fatName === '치즈' && proteinName) return `${proteinName} 치즈 덮밥`
    if (isNutLikeFatName(fatName) && proteinName) return `${proteinName} 견과볼`
    if (proteinName) return `${proteinName} 밥 식사`
  }

  if (structureType === 'salad_meal') {
    if (proteinName && fatName === '아보카도') return `${proteinName} 아보카도 샐러드`
    if (proteinName && fatName === '올리브오일') return `${proteinName} 올리브오일 샐러드`
    if (proteinName && fatName === '치즈') return `${proteinName} 치즈 샐러드`
    if (proteinName) return `${proteinName} 샐러드 플레이트`
  }

  if (structureType === 'bread_meal') {
    if (proteinName && fatName) return `${proteinName} ${fatName} 토스트`
    if (fatName) return `${fatName} 토스트`
    return '토스트 식사'
  }

  if (structureType === 'bowl_meal') {
    if (hasYogurt && fruitName && isNutLikeFatName(fatName)) {
      return `그릭요거트 ${fruitName} 견과볼`
    }

    if (hasYogurt && isNutButterLikeFatName(fatName)) {
      return `그릭요거트 ${fatName} 볼`
    }

    if (hasOatmeal && isNutButterLikeFatName(fatName) && fruitName) {
      return `${fatName} ${fruitName} 오트밀볼`
    }

    if (hasOatmeal && isNutLikeFatName(fatName)) {
      return `오트밀 견과볼`
    }

    if (hasYogurt) return '그릭요거트 볼'
    if (hasOatmeal) return '오트밀 볼'
  }

  if (snackLike) {
    if (hasYogurt && isNutLikeFatName(fatName)) return '그릭요거트 견과볼'
    if (fruitName && isNutButterLikeFatName(fatName)) return `${fruitName} ${fatName} 간식`
    if (proteinName && fatName) return `${proteinName} ${fatName} 간식`
    if (proteinName) return `${proteinName} 간식`
  }

  if (proteinName && fatName && secondFatName) {
    return `${proteinName} ${fatName} ${secondFatName} 식사`
  }

  if (proteinName && fatName) {
    return `${proteinName} ${fatName} 식사`
  }

  if (proteinName && hasRice) {
    return `${proteinName} 밥 식사`
  }

  if (proteinName) return `${proteinName} 식사`
  if (carbName) return `${carbName} 식사`

  const firstName = normalizeMenuFoodName(getMealItemDisplayName(rows[0]))
  return firstName ? `${firstName} 구성` : '맞춤 식사 구성'
}
const buildMealMenuLabel = (items = [], slot = '') => {
  const title = getMealMenuTitleByItems(items, slot)
  const composition = buildMealCompositionText(items)

  if (!composition) return title
  return `${title} (${composition})`
}
  
const buildMealGuideTextFromItems = ({ items = [], slot = '', mealType = 'normal', targetKcal = 0 }) => {
  const menuTitle = getMealMenuTitleByItems(items, slot)
  const cookingGuide = buildMealCookingGuide({ items, slot, menuTitle })
  const reasonText = getMealReasonText({ menuTitle, slot })

  return [
    `섭취 방법: ${cookingGuide}`,
    `설명: ${reasonText}`,
  ].filter(Boolean).join('\n')
}
const handleMealPlanSave = async () => {
  if (!mealPlanForm.member_id) {
    alert('회원 선택')
    return
  }

  let foods = Array.isArray(foodMaster) ? foodMaster : []
  if (!foods.length) {
    foods = await loadFoodMaster()
  }

  const preferredFoodIds = resolveFoodIdsByText(mealPlanForm.preferred_foods, foods)
  const excludedFoodIds = resolveFoodIdsByText(mealPlanForm.excluded_foods, foods)
  const allergyFoodIds = resolveFoodIdsByText(mealPlanForm.allergies, foods)
  const finalMealSlots = getLifestyleMealSlots(mealPlanForm)
    const normalizedMealRiceMap = finalMealSlots.reduce((acc, slot) => {
  const fallbackValue =
    mealPlanForm.rice_amount_source === 'custom'
      ? Number(mealPlanForm.usual_rice_amount_custom_g || 0)
      : Number(mealPlanForm.usual_rice_amount_g || 300)

  const slotValue = Number(mealPlanForm.meal_rice_map?.[slot] ?? fallbackValue)

  acc[slot] = slotValue
  return acc
}, {})
  const payload = {
    member_id: mealPlanForm.member_id,
    admin_id: currentAdminId || null,
    goal_type: mealPlanForm.goal_type,
    meals_per_day: Number(mealPlanForm.meals_per_day || 3),
   meal_slots: finalMealSlots,
     meal_rice_map: normalizedMealRiceMap,
    activity_level: mealPlanForm.activity_level || 'light',
    training_days_per_week: Number(mealPlanForm.training_days_per_week || 3),
    training_time: mealPlanForm.training_time || 'evening',
    use_training_rest_split: !!mealPlanForm.use_training_rest_split,
    target_kcal: Number(mealPlanForm.target_kcal || 0),
    target_carbs_g: Number(mealPlanForm.target_carbs_g || 0),
    target_protein_g: Number(mealPlanForm.target_protein_g || 0),
    target_fat_g: Number(mealPlanForm.target_fat_g || 0),
    excluded_foods: normalizeCommaTextToArray(mealPlanForm.excluded_foods),
    preferred_foods: normalizeCommaTextToArray(mealPlanForm.preferred_foods),
    allergies: normalizeCommaTextToArray(mealPlanForm.allergies),
    preferred_food_ids: preferredFoodIds,
    excluded_food_ids: excludedFoodIds,
    allergy_food_ids: allergyFoodIds,
    notes: mealPlanForm.notes || '',
    calculation_version: 'v2_food_engine',
    recommendation_version: 'v2_food_engine',
        diet_mode: mealPlanForm.diet_mode || 'balanced',
    adaptation_strategy: mealPlanForm.adaptation_strategy || 'gradual',
    current_meal_pattern: mealPlanForm.current_meal_pattern || 'mixed',
    snack_frequency_per_week: Number(mealPlanForm.snack_frequency_per_week || 0),
    bread_frequency_per_week: Number(mealPlanForm.bread_frequency_per_week || 0),
    junk_food_frequency_per_week: Number(mealPlanForm.junk_food_frequency_per_week || 0),
    delivery_food_frequency_per_week: Number(mealPlanForm.delivery_food_frequency_per_week || 0),
    late_night_meal_frequency_per_week: Number(mealPlanForm.late_night_meal_frequency_per_week || 0),
    allowed_general_meals_per_week: Number(mealPlanForm.allowed_general_meals_per_week || 0),
    allowed_free_meals_per_week: Number(mealPlanForm.allowed_free_meals_per_week || 0),
    allowed_snacks_per_week: Number(mealPlanForm.allowed_snacks_per_week || 0),
    allowed_bread_per_week: Number(mealPlanForm.allowed_bread_per_week || 0),
    allowed_dessert_per_week: Number(mealPlanForm.allowed_dessert_per_week || 0),
    meal_structure_mode: mealPlanForm.meal_structure_mode || 'structured',
        alcohol_frequency_per_week: Number(mealPlanForm.alcohol_frequency_per_week || 0),
    allowed_alcohol_per_week: Number(mealPlanForm.allowed_alcohol_per_week || 0),
  }

  const { error } = await supabase
    .from('member_nutrition_profiles')
    .upsert(payload, { onConflict: 'member_id' })

  if (error) {
    console.error('식단 설정 저장 실패:', error)
    alert('식단 설정 저장 실패')
    return
  }

  const preferenceRows = [
    ...preferredFoodIds.map((foodId) => ({
      member_id: mealPlanForm.member_id,
      food_id: foodId,
      preference_type: 'preferred',
      priority_score: 3,
      admin_id: currentAdminId || null,
    })),
    ...excludedFoodIds.map((foodId) => ({
      member_id: mealPlanForm.member_id,
      food_id: foodId,
      preference_type: 'excluded',
      priority_score: 5,
      admin_id: currentAdminId || null,
    })),
    ...allergyFoodIds.map((foodId) => ({
      member_id: mealPlanForm.member_id,
      food_id: foodId,
      preference_type: 'allergy',
      priority_score: 5,
      admin_id: currentAdminId || null,
    })),
  ]

  const { error: deletePreferenceError } = await supabase
    .from('member_food_preferences')
    .delete()
    .eq('member_id', mealPlanForm.member_id)

  if (deletePreferenceError) {
    console.error('기존 member_food_preferences 삭제 실패:', deletePreferenceError)
  }

  if (preferenceRows.length > 0) {
    const { error: insertPreferenceError } = await supabase
      .from('member_food_preferences')
      .insert(preferenceRows)

    if (insertPreferenceError) {
      console.error('member_food_preferences 저장 실패:', insertPreferenceError)
    }
  }

  alert('식단 설정 저장 완료')
}
  
const buildMealSlotsByCount = (count) => {
  const mealSlotsMap = {
    2: ['점심', '저녁'],
    3: ['아침', '점심', '저녁'],
    4: ['아침', '점심', '간식', '저녁'],
    5: ['아침', '오전간식', '점심', '운동후', '저녁'],
  }

  return mealSlotsMap[Number(count) || 3] || ['아침', '점심', '저녁']
}

const FOOD_MASTER_STARTER_ITEMS = [
  {
    name: '현미밥',
    aliases: ['현미', '현미쌀밥'],
    category_major: 'carb',
    category_minor: 'rice',
    source_type: 'plant',
    kcal_per_100g: 149,
    carbs_per_100g: 31,
    protein_per_100g: 3,
    fat_per_100g: 1,
    saturated_fat_per_100g: 0,
    unsaturated_fat_per_100g: 1,
    sugar_per_100g: 0,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 3,
    typical_portion_g: 210,
    tags: ['balanced', 'carb'],
    note: '기본 탄수화물 소스',
  },
  {
    name: '샐러드채소',
    aliases: ['샐러드', '믹스샐러드', '야채샐러드'],
    category_major: 'vegetable',
    category_minor: 'salad',
    source_type: 'plant',
    kcal_per_100g: 20,
    carbs_per_100g: 3,
    protein_per_100g: 1,
    fat_per_100g: 0,
    saturated_fat_per_100g: 0,
    unsaturated_fat_per_100g: 0,
    sugar_per_100g: 1,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 20,
    typical_portion_g: 100,
    tags: ['diet', 'vegetable'],
    note: '샐러드용 채소 묶음 대표명',
  },
  {
    name: '아몬드',
    aliases: ['구운아몬드', '생아몬드'],
    category_major: 'fat',
    category_minor: 'nut',
    source_type: 'plant',
    kcal_per_100g: 579,
    carbs_per_100g: 22,
    protein_per_100g: 21,
    fat_per_100g: 50,
    saturated_fat_per_100g: 4,
    unsaturated_fat_per_100g: 44,
    sugar_per_100g: 4,
    fiber_per_100g: 12,
    sodium_mg_per_100g: 1,
    typical_portion_g: 20,
    tags: ['fat', 'snack'],
    note: '간식/지방 보완용',
  },
    {
    name: '아보카도',
    aliases: ['생아보카도', '아보카도슬라이스'],
    category_major: 'fat',
    category_minor: 'fruit_fat',
    source_type: 'plant',
    kcal_per_100g: 160,
    carbs_per_100g: 9,
    protein_per_100g: 2,
    fat_per_100g: 15,
    saturated_fat_per_100g: 2,
    unsaturated_fat_per_100g: 13,
    sugar_per_100g: 1,
    fiber_per_100g: 7,
    sodium_mg_per_100g: 7,
    typical_portion_g: 50,
    tags: ['fat', 'balanced'],
    note: '볼/샐러드/덮밥에 넣기 좋은 지방 성분',
  },
  {
    name: '호두',
    aliases: ['생호두', '구운호두'],
    category_major: 'fat',
    category_minor: 'nut',
    source_type: 'plant',
    kcal_per_100g: 654,
    carbs_per_100g: 14,
    protein_per_100g: 15,
    fat_per_100g: 65,
    saturated_fat_per_100g: 6,
    unsaturated_fat_per_100g: 59,
    sugar_per_100g: 3,
    fiber_per_100g: 7,
    sodium_mg_per_100g: 2,
    typical_portion_g: 15,
    tags: ['fat', 'snack'],
    note: '간식/요거트 토핑용 지방 성분',
  },
  {
    name: '캐슈넛',
    aliases: ['생캐슈넛', '구운캐슈넛'],
    category_major: 'fat',
    category_minor: 'nut',
    source_type: 'plant',
    kcal_per_100g: 553,
    carbs_per_100g: 30,
    protein_per_100g: 18,
    fat_per_100g: 44,
    saturated_fat_per_100g: 8,
    unsaturated_fat_per_100g: 36,
    sugar_per_100g: 6,
    fiber_per_100g: 3,
    sodium_mg_per_100g: 12,
    typical_portion_g: 15,
    tags: ['fat', 'snack'],
    note: '간식/토핑용 지방 성분',
  },
  {
    name: '피스타치오',
    aliases: ['구운피스타치오'],
    category_major: 'fat',
    category_minor: 'nut',
    source_type: 'plant',
    kcal_per_100g: 562,
    carbs_per_100g: 28,
    protein_per_100g: 20,
    fat_per_100g: 45,
    saturated_fat_per_100g: 6,
    unsaturated_fat_per_100g: 39,
    sugar_per_100g: 8,
    fiber_per_100g: 10,
    sodium_mg_per_100g: 1,
    typical_portion_g: 15,
    tags: ['fat', 'snack'],
    note: '간식/요거트 토핑용 지방 성분',
  },
  {
    name: '땅콩버터',
    aliases: ['피넛버터', '무가당땅콩버터'],
    category_major: 'fat',
    category_minor: 'nut_butter',
    source_type: 'plant',
    kcal_per_100g: 588,
    carbs_per_100g: 20,
    protein_per_100g: 25,
    fat_per_100g: 50,
    saturated_fat_per_100g: 10,
    unsaturated_fat_per_100g: 40,
    sugar_per_100g: 9,
    fiber_per_100g: 6,
    sodium_mg_per_100g: 17,
    typical_portion_g: 15,
    tags: ['fat', 'snack'],
    note: '과일/토스트/오트밀에 넣는 지방 성분',
  },
  {
    name: '아몬드버터',
    aliases: ['무가당아몬드버터'],
    category_major: 'fat',
    category_minor: 'nut_butter',
    source_type: 'plant',
    kcal_per_100g: 614,
    carbs_per_100g: 19,
    protein_per_100g: 21,
    fat_per_100g: 56,
    saturated_fat_per_100g: 5,
    unsaturated_fat_per_100g: 51,
    sugar_per_100g: 4,
    fiber_per_100g: 10,
    sodium_mg_per_100g: 2,
    typical_portion_g: 15,
    tags: ['fat', 'snack'],
    note: '요거트/토스트에 넣는 지방 성분',
  },
  {
    name: '올리브오일',
    aliases: ['엑스트라버진올리브오일', '올리브유'],
    category_major: 'fat',
    category_minor: 'oil',
    source_type: 'plant',
    kcal_per_100g: 884,
    carbs_per_100g: 0,
    protein_per_100g: 0,
    fat_per_100g: 100,
    saturated_fat_per_100g: 14,
    unsaturated_fat_per_100g: 86,
    sugar_per_100g: 0,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 0,
    typical_portion_g: 5,
    tags: ['fat', 'balanced'],
    note: '샐러드/플레이트에 추가하는 지방 성분',
  },
  {
    name: '치즈',
    aliases: ['체다치즈', '모짜렐라치즈'],
    category_major: 'fat',
    category_minor: 'cheese',
    source_type: 'animal',
    kcal_per_100g: 402,
    carbs_per_100g: 1,
    protein_per_100g: 25,
    fat_per_100g: 33,
    saturated_fat_per_100g: 19,
    unsaturated_fat_per_100g: 14,
    sugar_per_100g: 1,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 621,
    typical_portion_g: 20,
    tags: ['fat', 'mixed'],
    note: '오믈렛/샐러드/토스트용 지방 성분',
  },
  {
    name: '블루베리',
    aliases: ['냉동블루베리'],
    category_major: 'fruit',
    category_minor: 'berry',
    source_type: 'plant',
    kcal_per_100g: 57,
    carbs_per_100g: 14,
    protein_per_100g: 1,
    fat_per_100g: 0,
    saturated_fat_per_100g: 0,
    unsaturated_fat_per_100g: 0,
    sugar_per_100g: 10,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 1,
    typical_portion_g: 80,
    tags: ['fruit', 'diet'],
    note: '요거트/간식 조합용',
  },
  {
    name: '우유',
    aliases: ['흰우유', '일반우유'],
    category_major: 'dairy',
    category_minor: 'milk',
    source_type: 'animal',
    kcal_per_100g: 61,
    carbs_per_100g: 5,
    protein_per_100g: 3,
    fat_per_100g: 3,
    saturated_fat_per_100g: 2,
    unsaturated_fat_per_100g: 1,
    sugar_per_100g: 5,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 43,
    typical_portion_g: 200,
    tags: ['dairy', 'balanced'],
    note: '간식/야식/운동후 조합용',
  },
  {
    name: '참치',
    aliases: ['참치캔', '물참치'],
    category_major: 'protein',
    category_minor: 'fish_protein',
    source_type: 'animal',
    kcal_per_100g: 132,
    carbs_per_100g: 0,
    protein_per_100g: 29,
    fat_per_100g: 1,
    saturated_fat_per_100g: 0,
    unsaturated_fat_per_100g: 1,
    sugar_per_100g: 0,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 300,
    typical_portion_g: 100,
    tags: ['high_protein', 'diet'],
    note: '물참치 기준 시작값',
  },
  {
    name: '현미떡',
    aliases: ['현미가래떡', '현미떡국떡'],
    category_major: 'carb',
    category_minor: 'rice_cake',
    source_type: 'plant',
    kcal_per_100g: 227,
    carbs_per_100g: 50,
    protein_per_100g: 4,
    fat_per_100g: 1,
    saturated_fat_per_100g: 0,
    unsaturated_fat_per_100g: 1,
    sugar_per_100g: 0,
    fiber_per_100g: 1,
    sodium_mg_per_100g: 5,
    typical_portion_g: 100,
    tags: ['carb', 'snack'],
    note: '간식/운동후 탄수화물용',
  },
  {
    name: '아스파라거스',
    aliases: ['아스파라거스구이'],
    category_major: 'vegetable',
    category_minor: 'green_vegetable',
    source_type: 'plant',
    kcal_per_100g: 20,
    carbs_per_100g: 4,
    protein_per_100g: 2,
    fat_per_100g: 0,
    saturated_fat_per_100g: 0,
    unsaturated_fat_per_100g: 0,
    sugar_per_100g: 2,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 2,
    typical_portion_g: 80,
    tags: ['vegetable', 'diet'],
    note: '저녁/점심 채소용',
  },
    {
    name: '닭가슴살볼',
    aliases: ['닭가슴살볼큐브', '닭가슴살 큐브'],
    category_major: 'protein',
    category_minor: 'processed_protein',
    source_type: 'animal',
    kcal_per_100g: 145,
    carbs_per_100g: 6,
    protein_per_100g: 23,
    fat_per_100g: 3,
    saturated_fat_per_100g: 1,
    unsaturated_fat_per_100g: 2,
    sugar_per_100g: 2,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 420,
    typical_portion_g: 100,
    tags: ['high_protein', 'convenience'],
    note: '편의점/간편식 단백질용',
  },
  {
    name: '구운계란',
    aliases: ['훈제계란', '반숙란'],
    category_major: 'protein',
    category_minor: 'egg',
    source_type: 'animal',
    kcal_per_100g: 155,
    carbs_per_100g: 1,
    protein_per_100g: 13,
    fat_per_100g: 11,
    saturated_fat_per_100g: 3,
    unsaturated_fat_per_100g: 8,
    sugar_per_100g: 1,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 124,
    typical_portion_g: 50,
    tags: ['high_protein', 'convenience'],
    note: '편의점 간식/보조식',
  },
  {
    name: '닭가슴살소시지',
    aliases: ['닭가슴살핫바', '닭소시지'],
    category_major: 'protein',
    category_minor: 'processed_protein',
    source_type: 'animal',
    kcal_per_100g: 165,
    carbs_per_100g: 8,
    protein_per_100g: 21,
    fat_per_100g: 5,
    saturated_fat_per_100g: 1,
    unsaturated_fat_per_100g: 4,
    sugar_per_100g: 2,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 520,
    typical_portion_g: 100,
    tags: ['high_protein', 'convenience'],
    note: '편의점 단백질 간편식',
  },
  {
    name: '삼각김밥',
    aliases: ['참치삼각김밥', '김밥주먹밥'],
    category_major: 'carb',
    category_minor: 'rice_snack',
    source_type: 'mixed',
    kcal_per_100g: 180,
    carbs_per_100g: 32,
    protein_per_100g: 5,
    fat_per_100g: 4,
    saturated_fat_per_100g: 1,
    unsaturated_fat_per_100g: 3,
    sugar_per_100g: 2,
    fiber_per_100g: 1,
    sodium_mg_per_100g: 320,
    typical_portion_g: 110,
    tags: ['convenience', 'carb'],
    note: '간편 탄수화물 대체용',
  },
  {
    name: '통밀식빵',
    aliases: ['통밀빵', '식빵'],
    category_major: 'carb',
    category_minor: 'bread',
    source_type: 'plant',
    kcal_per_100g: 247,
    carbs_per_100g: 41,
    protein_per_100g: 12,
    fat_per_100g: 4,
    saturated_fat_per_100g: 1,
    unsaturated_fat_per_100g: 3,
    sugar_per_100g: 5,
    fiber_per_100g: 6,
    sodium_mg_per_100g: 430,
    typical_portion_g: 60,
    tags: ['balanced', 'bread'],
    note: '아침/간식용 탄수화물',
  },
  {
    name: '베이글',
    aliases: ['플레인베이글'],
    category_major: 'carb',
    category_minor: 'bread',
    source_type: 'plant',
    kcal_per_100g: 270,
    carbs_per_100g: 53,
    protein_per_100g: 10,
    fat_per_100g: 2,
    saturated_fat_per_100g: 0,
    unsaturated_fat_per_100g: 2,
    sugar_per_100g: 6,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 430,
    typical_portion_g: 100,
    tags: ['carb', 'bread'],
    note: '운동전후/아침용',
  },
  {
    name: '고단백요거트',
    aliases: ['프로틴요거트', '고단백 그릭요거트'],
    category_major: 'dairy',
    category_minor: 'high_protein_yogurt',
    source_type: 'animal',
    kcal_per_100g: 95,
    carbs_per_100g: 6,
    protein_per_100g: 10,
    fat_per_100g: 3,
    saturated_fat_per_100g: 2,
    unsaturated_fat_per_100g: 1,
    sugar_per_100g: 5,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 60,
    typical_portion_g: 150,
    tags: ['high_protein', 'convenience'],
    note: '편의점/간식용 유제품',
  },
  {
    name: '두유',
    aliases: ['무가당두유', '검은콩두유'],
    category_major: 'dairy',
    category_minor: 'soy_milk',
    source_type: 'plant',
    kcal_per_100g: 45,
    carbs_per_100g: 3,
    protein_per_100g: 3,
    fat_per_100g: 2,
    saturated_fat_per_100g: 0,
    unsaturated_fat_per_100g: 2,
    sugar_per_100g: 2,
    fiber_per_100g: 1,
    sodium_mg_per_100g: 50,
    typical_portion_g: 190,
    tags: ['balanced', 'convenience'],
    note: '간식/야식용 음료',
  },
  {
    name: '샌드위치',
    aliases: ['닭가슴살샌드위치', '햄샌드위치'],
    category_major: 'mixed',
    category_minor: 'sandwich',
    source_type: 'mixed',
    kcal_per_100g: 230,
    carbs_per_100g: 27,
    protein_per_100g: 11,
    fat_per_100g: 8,
    saturated_fat_per_100g: 2,
    unsaturated_fat_per_100g: 6,
    sugar_per_100g: 5,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 480,
    typical_portion_g: 180,
    tags: ['convenience', 'mixed'],
    note: '편의점/외부 식사용',
  },
  {
    name: '샐러드도시락',
    aliases: ['도시락샐러드', '닭가슴살샐러드'],
    category_major: 'mixed',
    category_minor: 'salad_box',
    source_type: 'mixed',
    kcal_per_100g: 110,
    carbs_per_100g: 8,
    protein_per_100g: 9,
    fat_per_100g: 4,
    saturated_fat_per_100g: 1,
    unsaturated_fat_per_100g: 3,
    sugar_per_100g: 3,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 220,
    typical_portion_g: 220,
    tags: ['diet', 'convenience'],
    note: '가벼운 일반식 대체용',
  },
  {
    name: '제육볶음',
    aliases: ['제육', '제육정식'],
    category_major: 'mixed',
    category_minor: 'korean_meal',
    source_type: 'mixed',
    kcal_per_100g: 195,
    carbs_per_100g: 10,
    protein_per_100g: 14,
    fat_per_100g: 11,
    saturated_fat_per_100g: 3,
    unsaturated_fat_per_100g: 8,
    sugar_per_100g: 5,
    fiber_per_100g: 1,
    sodium_mg_per_100g: 480,
    typical_portion_g: 180,
    tags: ['general', 'eating_out'],
    note: '일반식/외식 대표 메뉴',
  },
  {
    name: '생선구이',
    aliases: ['고등어구이', '연어구이정식'],
    category_major: 'mixed',
    category_minor: 'korean_meal',
    source_type: 'mixed',
    kcal_per_100g: 170,
    carbs_per_100g: 4,
    protein_per_100g: 18,
    fat_per_100g: 8,
    saturated_fat_per_100g: 2,
    unsaturated_fat_per_100g: 6,
    sugar_per_100g: 1,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 220,
    typical_portion_g: 180,
    tags: ['general', 'balanced'],
    note: '한식 일반식용',
  },
  {
    name: '비빔밥',
    aliases: ['야채비빔밥', '불고기비빔밥'],
    category_major: 'mixed',
    category_minor: 'korean_rice_meal',
    source_type: 'mixed',
    kcal_per_100g: 160,
    carbs_per_100g: 24,
    protein_per_100g: 6,
    fat_per_100g: 4,
    saturated_fat_per_100g: 1,
    unsaturated_fat_per_100g: 3,
    sugar_per_100g: 3,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 240,
    typical_portion_g: 250,
    tags: ['general', 'eating_out'],
    note: '일반식/외식용 밥 메뉴',
  },
  {
    name: '국밥',
    aliases: ['돼지국밥', '소고기국밥'],
    category_major: 'mixed',
    category_minor: 'soup_meal',
    source_type: 'mixed',
    kcal_per_100g: 135,
    carbs_per_100g: 14,
    protein_per_100g: 8,
    fat_per_100g: 5,
    saturated_fat_per_100g: 2,
    unsaturated_fat_per_100g: 3,
    sugar_per_100g: 1,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 520,
    typical_portion_g: 300,
    tags: ['general', 'eating_out'],
    note: '외식형 일반식 대표 메뉴',
  },
  {
    name: '김밥',
    aliases: ['참치김밥', '야채김밥'],
    category_major: 'mixed',
    category_minor: 'rice_roll',
    source_type: 'mixed',
    kcal_per_100g: 180,
    carbs_per_100g: 28,
    protein_per_100g: 6,
    fat_per_100g: 5,
    saturated_fat_per_100g: 1,
    unsaturated_fat_per_100g: 4,
    sugar_per_100g: 3,
    fiber_per_100g: 1,
    sodium_mg_per_100g: 300,
    typical_portion_g: 220,
    tags: ['general', 'convenience'],
    note: '현실 일반식/간편식 대표 메뉴',
  },
  {
    name: '파스타',
    aliases: ['토마토파스타', '오일파스타'],
    category_major: 'mixed',
    category_minor: 'western_meal',
    source_type: 'mixed',
    kcal_per_100g: 185,
    carbs_per_100g: 26,
    protein_per_100g: 7,
    fat_per_100g: 5,
    saturated_fat_per_100g: 1,
    unsaturated_fat_per_100g: 4,
    sugar_per_100g: 4,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 280,
    typical_portion_g: 220,
    tags: ['general', 'eating_out'],
    note: '외식용 서양식 대표 메뉴',
  },
  {
    name: '햄버거',
    aliases: ['버거', '치즈버거'],
    category_major: 'mixed',
    category_minor: 'fast_food',
    source_type: 'mixed',
    kcal_per_100g: 295,
    carbs_per_100g: 28,
    protein_per_100g: 13,
    fat_per_100g: 14,
    saturated_fat_per_100g: 5,
    unsaturated_fat_per_100g: 9,
    sugar_per_100g: 6,
    fiber_per_100g: 1,
    sodium_mg_per_100g: 480,
    typical_portion_g: 180,
    tags: ['free', 'eating_out'],
    note: '자유식/외식 대표 메뉴',
  },
  {
    name: '피자',
    aliases: ['치즈피자', '콤비네이션피자'],
    category_major: 'mixed',
    category_minor: 'fast_food',
    source_type: 'mixed',
    kcal_per_100g: 266,
    carbs_per_100g: 33,
    protein_per_100g: 11,
    fat_per_100g: 10,
    saturated_fat_per_100g: 4,
    unsaturated_fat_per_100g: 6,
    sugar_per_100g: 4,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 540,
    typical_portion_g: 200,
    tags: ['free', 'eating_out'],
    note: '자유식 대표 메뉴',
  },
  {
    name: '떡볶이',
    aliases: ['매운떡볶이', '컵떡볶이'],
    category_major: 'mixed',
    category_minor: 'snack_meal',
    source_type: 'mixed',
    kcal_per_100g: 210,
    carbs_per_100g: 36,
    protein_per_100g: 4,
    fat_per_100g: 5,
    saturated_fat_per_100g: 1,
    unsaturated_fat_per_100g: 4,
    sugar_per_100g: 8,
    fiber_per_100g: 1,
    sodium_mg_per_100g: 430,
    typical_portion_g: 200,
    tags: ['free', 'snack'],
    note: '자유식/간식 대표 메뉴',
  },
  {
    name: '아이스크림',
    aliases: ['컵아이스크림', '바닐라아이스크림'],
    category_major: 'mixed',
    category_minor: 'dessert',
    source_type: 'mixed',
    kcal_per_100g: 205,
    carbs_per_100g: 24,
    protein_per_100g: 4,
    fat_per_100g: 10,
    saturated_fat_per_100g: 6,
    unsaturated_fat_per_100g: 4,
    sugar_per_100g: 21,
    fiber_per_100g: 0,
    sodium_mg_per_100g: 80,
    typical_portion_g: 120,
    tags: ['free', 'dessert'],
    note: '자유식 디저트용',
  },
  {
    name: '라면',
    aliases: ['봉지라면', '컵라면'],
    category_major: 'mixed',
    category_minor: 'noodle_meal',
    source_type: 'mixed',
    kcal_per_100g: 445,
    carbs_per_100g: 60,
    protein_per_100g: 10,
    fat_per_100g: 17,
    saturated_fat_per_100g: 8,
    unsaturated_fat_per_100g: 9,
    sugar_per_100g: 3,
    fiber_per_100g: 2,
    sodium_mg_per_100g: 1700,
    typical_portion_g: 120,
    tags: ['free', 'convenience'],
    note: '자유식/편의식 대표 메뉴',
  },
]
  
const loadFoodMaster = async () => {
  const { data, error } = await supabase
    .from('food_master')
    .select('*')
    .eq('is_active', true)
    .order('category_major', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('food_master 불러오기 실패:', error)
    setFoodMaster([])
    setFoodMasterLoaded(false)
    return []
  }

  setFoodMaster(data || [])
  setFoodMasterLoaded(true)
  return data || []
}
const handleFoodMasterSave = async () => {
  const name = String(foodMasterForm.name || '').trim()

  if (!name) {
    alert('음식명을 입력해주세요.')
    return
  }

  setSavingFoodMaster(true)

  const payload = {
    name,
    category_major: String(foodMasterForm.category_major || 'protein').trim(),
    category_minor: String(foodMasterForm.category_minor || '').trim() || null,
    source_type: String(foodMasterForm.source_type || '').trim() || null,
    kcal_per_100g: Number(foodMasterForm.kcal_per_100g || 0),
    carbs_per_100g: Number(foodMasterForm.carbs_per_100g || 0),
    protein_per_100g: Number(foodMasterForm.protein_per_100g || 0),
    fat_per_100g: Number(foodMasterForm.fat_per_100g || 0),
    saturated_fat_per_100g: Number(foodMasterForm.saturated_fat_per_100g || 0),
    unsaturated_fat_per_100g: Number(foodMasterForm.unsaturated_fat_per_100g || 0),
    sugar_per_100g: Number(foodMasterForm.sugar_per_100g || 0),
    fiber_per_100g: Number(foodMasterForm.fiber_per_100g || 0),
    sodium_mg_per_100g: Number(foodMasterForm.sodium_mg_per_100g || 0),
    typical_portion_g: Number(foodMasterForm.typical_portion_g || 0),
    tags: String(foodMasterForm.tags || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    aliases: String(foodMasterForm.aliases || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    note: String(foodMasterForm.note || '').trim(),
    is_active: true,
    is_common: true,
  }

  let error = null

  if (editingFoodMasterId) {
    const response = await supabase
      .from('food_master')
      .update(payload)
      .eq('id', editingFoodMasterId)

    error = response.error
  } else {
    const response = await supabase
      .from('food_master')
      .upsert(payload, { onConflict: 'name_normalized' })

    error = response.error
  }

  setSavingFoodMaster(false)

  if (error) {
    console.error('food_master 저장 실패:', error)
    alert('food_master 저장 실패')
    return
  }

  await loadFoodMaster()
  handleFoodMasterCancelEdit()
  alert(editingFoodMasterId ? '음식 수정 완료' : '음식 등록 완료')
}

 const handleFoodMasterSeedInsert = async () => {
  const confirmed = window.confirm(
    'food_master에 기본 음식 1차 리스트를 등록할까요? 이미 있는 이름은 업데이트됩니다.'
  )

  if (!confirmed) return

  setSavingFoodMaster(true)

  const payload = FOOD_MASTER_STARTER_ITEMS.map((item) => ({
    name: item.name,
    category_major: String(item.category_major || '').trim(),
    category_minor: String(item.category_minor || '').trim() || null,
    source_type: String(item.source_type || '').trim() || null,
    kcal_per_100g: Number(item.kcal_per_100g || 0),
    carbs_per_100g: Number(item.carbs_per_100g || 0),
    protein_per_100g: Number(item.protein_per_100g || 0),
    fat_per_100g: Number(item.fat_per_100g || 0),
    saturated_fat_per_100g: Number(item.saturated_fat_per_100g || 0),
    unsaturated_fat_per_100g: Number(item.unsaturated_fat_per_100g || 0),
    sugar_per_100g: Number(item.sugar_per_100g || 0),
    fiber_per_100g: Number(item.fiber_per_100g || 0),
    sodium_mg_per_100g: Number(item.sodium_mg_per_100g || 0),
    typical_portion_g: Number(item.typical_portion_g || 0),
    tags: Array.isArray(item.tags) ? item.tags : [],
    aliases: Array.isArray(item.aliases) ? item.aliases : [],
    note: String(item.note || '').trim(),
    is_active: true,
    is_common: true,
  }))

  const { error } = await supabase
    .from('food_master')
    .upsert(payload, { onConflict: 'name_normalized' })

  setSavingFoodMaster(false)

  if (error) {
    console.error('food_master 기본 음식 등록 실패:', error)
    alert(`food_master 기본 음식 등록 실패: ${error.message}`)
    return
  }

  await loadFoodMaster()
  alert('food_master 기본 음식 1차 등록 완료')
} 
  
  const handleFoodMasterDeactivate = async (food) => {
  if (!food?.id) return

  const confirmed = window.confirm(`${food.name} 음식을 비활성화할까요?`)
  if (!confirmed) return

  const { error } = await supabase
    .from('food_master')
    .update({ is_active: false })
    .eq('id', food.id)

  if (error) {
    console.error('food_master 비활성화 실패:', error)
    alert('food_master 비활성화 실패')
    return
  }

  if (editingFoodMasterId === food.id) {
    handleFoodMasterCancelEdit()
  }

  await loadFoodMaster()
  alert('음식 비활성화 완료')
}
const loadMemberMealPlanProfile = async (memberId) => {
  if (!memberId) return

  const { data, error } = await supabase
    .from('member_nutrition_profiles')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle()

  if (error) {
    console.error('식단 설정 불러오기 실패:', error)
    return
  }

  if (!data) {
    setMealPlanForm((prev) => ({
      ...emptyMealPlanForm,
      member_id: memberId,
    }))
    return
  }

  setMealPlanForm({
    member_id: data.member_id || '',
    goal_type: data.goal_type || 'diet',
    meals_per_day: Number(data.meals_per_day || 3),
   meal_slots: getLifestyleMealSlots({
  ...data,
  meals_per_day: Number(data.meals_per_day || 3),
}),
    activity_level: data.activity_level || 'light',
    training_days_per_week: Number(data.training_days_per_week || 3),
    training_time: data.training_time || 'evening',
    use_training_rest_split: !!data.use_training_rest_split,
    target_kcal: data.target_kcal || '',
    target_carbs_g: data.target_carbs_g || '',
    target_protein_g: data.target_protein_g || '',
    target_fat_g: data.target_fat_g || '',
    excluded_foods: Array.isArray(data.excluded_foods) ? data.excluded_foods.join(', ') : '',
    preferred_foods: Array.isArray(data.preferred_foods) ? data.preferred_foods.join(', ') : '',
    allergies: Array.isArray(data.allergies) ? data.allergies.join(', ') : '',
    notes: data.notes || '',
          diet_mode: data?.diet_mode || 'balanced',
      adaptation_strategy: data?.adaptation_strategy || 'gradual',
      current_meal_pattern: data?.current_meal_pattern || 'mixed',
      snack_frequency_per_week: Number(data?.snack_frequency_per_week || 0),
      bread_frequency_per_week: Number(data?.bread_frequency_per_week || 0),
      junk_food_frequency_per_week: Number(data?.junk_food_frequency_per_week || 0),
      delivery_food_frequency_per_week: Number(data?.delivery_food_frequency_per_week || 0),
      late_night_meal_frequency_per_week: Number(data?.late_night_meal_frequency_per_week || 0),
      allowed_general_meals_per_week: Number(data?.allowed_general_meals_per_week || 0),
      allowed_free_meals_per_week: Number(data?.allowed_free_meals_per_week || 0),
      allowed_snacks_per_week: Number(data?.allowed_snacks_per_week || 0),
      allowed_bread_per_week: Number(data?.allowed_bread_per_week || 0),
      allowed_dessert_per_week: Number(data?.allowed_dessert_per_week || 0),
      meal_structure_mode: data?.meal_structure_mode || 'structured',
          alcohol_frequency_per_week: Number(data?.alcohol_frequency_per_week || 0),
      allowed_alcohol_per_week: Number(data?.allowed_alcohol_per_week || 0),
          usual_rice_amount_g: Number(data?.usual_rice_amount_g || 300),
      largest_meal_slot: data?.largest_meal_slot || '저녁',
          meal_rice_map: (() => {
  const lifestyleSlots = getLifestyleMealSlots({
    ...data,
    meals_per_day: Number(data?.meals_per_day || 3),
  })

  const fallbackValue = Number(data?.usual_rice_amount_g || 300)
  const sourceMap =
    data?.meal_rice_map && typeof data.meal_rice_map === 'object'
      ? data.meal_rice_map
      : {}

  return lifestyleSlots.reduce((acc, slot) => {
    acc[slot] = Number(sourceMap?.[slot] ?? fallbackValue)
    return acc
  }, {})
})(),
      meal_start_mode: data?.meal_start_mode || 'current',
      rice_amount_source: data?.rice_amount_source || 'preset',
      usual_rice_amount_custom_g:
        data?.rice_amount_source === 'custom'
          ? String(data?.usual_rice_amount_g || '')
          : '',
  })
}
  
const normalizeCommaTextToArray = (value) => {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
  const normalizeHighRiceSlots = (value, mealSlots = []) => {
  const source = Array.isArray(value) ? value : []
  const allowedSlots = Array.isArray(mealSlots) ? mealSlots : []

  const normalized = source
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((item) => allowedSlots.includes(item))

  return [...new Set(normalized)]
}

const getFoodSearchTokens = (food) => {
  const aliases = Array.isArray(food?.aliases) ? food.aliases : []
  return [food?.name, ...aliases]
    .map((item) => String(item || '').trim().toLowerCase())
    .filter(Boolean)
}

const resolveFoodIdsByText = (textValue, foods = []) => {
  const keywords = normalizeCommaTextToArray(textValue).map((item) => item.toLowerCase())

  if (!keywords.length || !Array.isArray(foods) || foods.length === 0) return []

  const ids = foods
    .filter((food) => {
      const tokens = getFoodSearchTokens(food)
      return keywords.some((keyword) =>
        tokens.some((token) => token.includes(keyword) || keyword.includes(token))
      )
    })
    .map((food) => food.id)

  return [...new Set(ids)]
}

const getActivityFactorByLevel = (activityLevel = 'light') => {
  const map = {
    low: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
    very_high: 1.9,
  }

  return Number(map[activityLevel] || 1.375)
}

const clampNumber = (value, min, max) => {
  return Math.min(Math.max(Number(value || 0), min), max)
}

const getRotationSeed = (dateString, slot, offset = 0) => {
  const day = Number(String(dateString || '').slice(-2)) || 1

  const slotOffsetMap = {
    아침: 0,
    오전간식: 1,
    점심: 2,
    운동후: 3,
    간식: 4,
    저녁: 5,
  }

  return day + Number(slotOffsetMap[slot] || 0) + offset
}

const getFoodTagScore = (food, goalType) => {
  const tags = Array.isArray(food?.tags) ? food.tags.map((tag) => String(tag).toLowerCase()) : []
  const goalTagMap = {
    diet: ['diet', 'low_fat', 'high_protein'],
    recomposition: ['diet', 'balanced', 'high_protein'],
    maintenance: ['balanced', 'high_protein'],
    muscle_gain: ['high_protein', 'post_workout'],
    bulk: ['high_protein', 'balanced'],
  }

  const targetTags = goalTagMap[goalType] || []
  return tags.filter((tag) => targetTags.includes(tag)).length
}

const getPreferredBlockedSet = (form, foods = []) => {
  const preferredIds = resolveFoodIdsByText(form.preferred_foods, foods)
  const excludedIds = resolveFoodIdsByText(form.excluded_foods, foods)
  const allergyIds = resolveFoodIdsByText(form.allergies, foods)

  return {
    preferredSet: new Set(preferredIds),
    blockedSet: new Set([...excludedIds, ...allergyIds]),
  }
}
const getPreferredFoodsByCategories = ({
  foods = [],
  preferredSet = new Set(),
  blockedSet = new Set(),
  categories = [],
}) => {
  return (Array.isArray(foods) ? foods : []).filter((food) => {
    const category = String(food?.category_major || '').trim()
    return categories.includes(category) && preferredSet.has(food.id) && !blockedSet.has(food.id)
  })
}

const pickPreferredFoodFirst = ({
  foods = [],
  preferredSet = new Set(),
  blockedSet = new Set(),
  categories = [],
  usedIds = new Set(),
  recentUsedIds = [],
  slotUsedNames = [],
  goalType = 'diet',
  dateString = '',
  slot = '',
  offset = 0,
}) => {
  const candidates = getPreferredFoodsByCategories({
    foods,
    preferredSet,
    blockedSet,
    categories,
  }).filter((food) => !usedIds.has(food.id))

  if (!candidates.length) return null

  const sorted = sortFoodsForPick(
    candidates,
    preferredSet,
    goalType,
    dateString,
    slot,
    offset,
    recentUsedIds,
    slotUsedNames
  )

  return sorted[0] || null
}
  
const getMealCategoryConfig = (slot, goalType, dayType) => {
  if (slot === '운동후') {
    return {
      carbCategories: ['carb', 'fruit'],
      proteinCategories: ['protein', 'dairy'],
      extraCategories: [],
    }
  }

  if (slot === '오전간식') {
    return {
      carbCategories: ['fruit'],
      proteinCategories: ['protein', 'dairy'],
      extraCategories: ['fat'],
    }
  }

  if (slot === '간식') {
    return {
      carbCategories: ['fruit', 'carb'],
      proteinCategories: ['protein', 'dairy'],
      extraCategories: ['fat'],
    }
  }

  if (slot === '아침') {
    return {
      carbCategories: ['carb', 'fruit'],
      proteinCategories: ['protein', 'dairy'],
      extraCategories: ['fat'],
    }
  }

  if (slot === '저녁' && (goalType === 'diet' || goalType === 'recomposition') && dayType === 'rest') {
    return {
      carbCategories: ['carb'],
      proteinCategories: ['protein', 'dairy'],
      extraCategories: ['vegetable'],
      lightCarb: true,
    }
  }

  return {
    carbCategories: ['carb'],
    proteinCategories: ['protein', 'dairy'],
    extraCategories: ['vegetable'],
  }
}

const getFoodsByCategories = (foods, categories = [], blockedSet = new Set()) => {
  return (Array.isArray(foods) ? foods : []).filter((food) => {
    const category = String(food?.category_major || '').trim()
    return categories.includes(category) && !blockedSet.has(food.id)
  })
}

const sortFoodsForPick = (
  foods,
  preferredSet,
  goalType,
  dateString,
  slot,
  offset = 0,
  recentUsedIds = [],
  slotUsedNames = []
) => {
  const seed = getRotationSeed(dateString, slot, offset)
  const recentSet = new Set(recentUsedIds || [])
  const slotNameSet = new Set((slotUsedNames || []).map((item) => String(item || '').trim()))

  return [...foods].sort((a, b) => {
    const getScore = (food) => {
      let score = 0

      if (preferredSet.has(food.id)) score += 6

      score += getFoodTagScore(food, goalType) * 2

      if (recentSet.has(food.id)) score -= 6

      if (slotNameSet.has(String(food.name || '').trim())) score -= 8

      const category = String(food?.category_major || '').trim()
      const minor = String(food?.category_minor || '').trim()

      if (goalType === 'diet' || goalType === 'recomposition') {
        if (category === 'protein' && Number(food.fat_per_100g || 0) <= 5) score += 2
        if (minor === 'unsaturated_fat') score += 1
      }

      if (goalType === 'muscle_gain' || goalType === 'bulk') {
        if (category === 'protein' && Number(food.protein_per_100g || 0) >= 18) score += 2
        if (category === 'carb') score += 1
      }

      const nameSeed = (seed + String(food.name || '').length) % 5
      score += nameSeed * 0.01

      return score
    }

    const scoreA = getScore(a)
    const scoreB = getScore(b)

    if (scoreA !== scoreB) return scoreB - scoreA

    return String(a.name || '').localeCompare(String(b.name || ''), 'ko-KR')
  })
}

const pickFood = ({
  foods = [],
  preferredSet = new Set(),
  blockedSet = new Set(),
  categories = [],
  goalType = 'diet',
  dateString = '',
  slot = '',
  offset = 0,
  usedIds = new Set(),
  recentUsedIds = [],
  slotUsedNames = [],
}) => {
  const candidates = getFoodsByCategories(foods, categories, blockedSet).filter(
    (food) => !usedIds.has(food.id)
  )

  if (!candidates.length) return null

  const sorted = sortFoodsForPick(
    candidates,
    preferredSet,
    goalType,
    dateString,
    slot,
    offset,
    recentUsedIds,
    slotUsedNames
  )

  if (!sorted.length) return null

  const topScoreFoods = sorted.slice(0, Math.min(3, sorted.length))

  const rotationIndex = getRotationSeed(dateString, slot, offset) % topScoreFoods.length
  return topScoreFoods[rotationIndex] || topScoreFoods[0] || null
}

const calcPortionByMacro = ({
  food,
  macroKey,
  targetGrams,
  fallbackGrams = 100,
  minGrams = 50,
  maxGrams = 300,
}) => {
  const macroPer100g = Number(food?.[macroKey] || 0)

  if (macroPer100g <= 0 || targetGrams <= 0) {
    return clampNumber(food?.typical_portion_g || fallbackGrams, minGrams, maxGrams)
  }

  const calculated = (targetGrams / macroPer100g) * 100
  return clampNumber(calculated, minGrams, maxGrams)
}

const buildMealFoodItem = (food, grams) => {
  const safeGrams = Math.round(Number(grams || 0))

  return {
    food_id: food.id,
    name: food.name,
    category_major: String(food?.category_major || '').trim(),
    category_minor: String(food?.category_minor || '').trim(),
    source_type: String(food?.source_type || '').trim(),
    grams: safeGrams,
    kcal: Math.round((Number(food.kcal_per_100g || 0) * safeGrams) / 100),
    carbs_g: Math.round((Number(food.carbs_per_100g || 0) * safeGrams) / 100),
    protein_g: Math.round((Number(food.protein_per_100g || 0) * safeGrams) / 100),
    fat_g: Math.round((Number(food.fat_per_100g || 0) * safeGrams) / 100),
    sodium_mg: Math.round((Number(food.sodium_mg_per_100g || 0) * safeGrams) / 100),
  }
}

const sumMealItems = (items = []) => {
  return items.reduce(
    (acc, item) => {
      acc.kcal += Number(item.kcal || 0)
      acc.carbs_g += Number(item.carbs_g || 0)
      acc.protein_g += Number(item.protein_g || 0)
      acc.fat_g += Number(item.fat_g || 0)
      acc.sodium_mg += Number(item.sodium_mg || 0)
      return acc
    },
    {
      kcal: 0,
      carbs_g: 0,
      protein_g: 0,
      fat_g: 0,
      sodium_mg: 0,
    }
  )
}

const formatMealMenu = (items = []) => {
  return items
    .map((item) => `${item.name} ${item.grams}g`)
    .join(' · ')
}
const generateDayType = (index, trainingDays) => {
  return index < trainingDays ? 'training' : 'rest'
}

const distributeSpecialMeals = (totalDays, count) => {
  const result = new Set()
  if (count <= 0) return result

  const gap = Math.floor(totalDays / count)

  for (let i = 0; i < count; i++) {
    result.add(i * gap)
  }

  return result
}

const buildMonthlyDietFramework = ({
  daysInMonth,
  trainingDaysPerWeek,
  allowedGeneralMeals,
  allowedFreeMeals,
}) => {
  const trainingDays = Math.round((trainingDaysPerWeek / 7) * daysInMonth)

  const generalMealDays = distributeSpecialMeals(daysInMonth, allowedGeneralMeals)
  const freeMealDays = distributeSpecialMeals(daysInMonth, allowedFreeMeals)

  const framework = []

  for (let i = 0; i < daysInMonth; i++) {
    let type = 'normal'

    if (freeMealDays.has(i)) type = 'free'
    else if (generalMealDays.has(i)) type = 'general'

    framework.push({
      dayIndex: i,
      dayType: generateDayType(i, trainingDays),
      mealType: type,
    })
  }

  return framework
}
  const MEAL_TEMPLATE_LIBRARY = {
  아침: [
    {
      name: '오트밀 요거트 바나나 아침',
      foods: ['오트밀', '그릭요거트', '바나나'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '현미밥 닭가슴살 김치 아침',
      foods: ['현미밥', '닭가슴살', '김치'],
      goalTypes: ['diet', 'recomposition', 'maintenance', 'muscle_gain'],
    },
    {
      name: '백미밥 계란 김치 아침',
      foods: ['백미밥', '계란', '김치'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '고구마 계란 방울토마토 아침',
      foods: ['고구마', '계란', '방울토마토'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '현미밥 연어 김치 아침',
      foods: ['현미밥', '연어', '김치'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '그릭요거트 사과 견과 아침',
      foods: ['그릭요거트', '사과', '아몬드'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '백미밥 닭다리살 김치 아침',
      foods: ['백미밥', '닭다리살', '김치'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '오트밀 프로틴 바나나 아침',
      foods: ['오트밀', '프로틴파우더', '바나나'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '백미밥 소고기 김치 아침',
      foods: ['백미밥', '소고기', '김치'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '고구마 그릭요거트 블루베리 아침',
      foods: ['고구마', '그릭요거트', '블루베리'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '현미밥 계란 나물반찬 아침',
      foods: ['현미밥', '계란', '나물반찬'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '백미밥 참치 김치 아침',
      foods: ['백미밥', '참치', '김치'],
      goalTypes: ['maintenance', 'muscle_gain'],
    },
  ],

  점심: [
    {
      name: '현미밥 닭가슴살 브로콜리 점심',
      foods: ['현미밥', '닭가슴살', '브로콜리'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '백미밥 소고기 나물반찬 점심',
      foods: ['백미밥', '소고기', '나물반찬'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '현미밥 연어 방울토마토 점심',
      foods: ['현미밥', '연어', '방울토마토'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '고구마 닭가슴살 브로콜리 점심',
      foods: ['고구마', '닭가슴살', '브로콜리'],
      goalTypes: ['diet', 'recomposition'],
    },
    {
      name: '백미밥 닭다리살 파프리카 점심',
      foods: ['백미밥', '닭다리살', '파프리카'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '현미밥 계란 나물반찬 점심',
      foods: ['현미밥', '계란', '나물반찬'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '백미밥 연어 아스파라거스 점심',
      foods: ['백미밥', '연어', '아스파라거스'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '백미밥 소불고기 김치 점심',
      foods: ['백미밥', '소고기', '김치'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '고구마 참치 브로콜리 점심',
      foods: ['고구마', '참치', '브로콜리'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '현미밥 닭가슴살 김치 점심',
      foods: ['현미밥', '닭가슴살', '김치'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '백미밥 계란 브로콜리 점심',
      foods: ['백미밥', '계란', '브로콜리'],
      goalTypes: ['maintenance'],
    },
    {
      name: '백미밥 닭가슴살 나물반찬 점심',
      foods: ['백미밥', '닭가슴살', '나물반찬'],
      goalTypes: ['diet', 'recomposition', 'maintenance', 'muscle_gain'],
    },
    {
      name: '현미밥 소고기 브로콜리 점심',
      foods: ['현미밥', '소고기', '브로콜리'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '백미밥 연어 김치 점심',
      foods: ['백미밥', '연어', '김치'],
      goalTypes: ['maintenance'],
    },
  ],

  저녁: [
    {
      name: '현미밥 닭가슴살 샐러드 저녁',
      foods: ['현미밥', '닭가슴살', '샐러드채소'],
      goalTypes: ['diet', 'recomposition'],
    },
    {
      name: '고구마 연어 브로콜리 저녁',
      foods: ['고구마', '연어', '브로콜리'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '현미밥 소고기 아스파라거스 저녁',
      foods: ['현미밥', '소고기', '아스파라거스'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '백미밥 닭다리살 파프리카 저녁',
      foods: ['백미밥', '닭다리살', '파프리카'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '고구마 계란 방울토마토 저녁',
      foods: ['고구마', '계란', '방울토마토'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '현미밥 연어 샐러드 저녁',
      foods: ['현미밥', '연어', '샐러드채소'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '백미밥 닭가슴살 김치 저녁',
      foods: ['백미밥', '닭가슴살', '김치'],
      goalTypes: ['maintenance', 'muscle_gain'],
    },
    {
      name: '현미밥 계란 브로콜리 저녁',
      foods: ['현미밥', '계란', '브로콜리'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '백미밥 소고기 김치 저녁',
      foods: ['백미밥', '소고기', '김치'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '고구마 닭가슴살 파프리카 저녁',
      foods: ['고구마', '닭가슴살', '파프리카'],
      goalTypes: ['diet', 'recomposition'],
    },
    {
      name: '현미밥 참치 샐러드 저녁',
      foods: ['현미밥', '참치', '샐러드채소'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '백미밥 연어 브로콜리 저녁',
      foods: ['백미밥', '연어', '브로콜리'],
      goalTypes: ['maintenance', 'muscle_gain'],
    },
  ],

  간식: [
    {
      name: '그릭요거트 바나나 간식',
      foods: ['그릭요거트', '바나나'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '고구마 계란 간식',
      foods: ['고구마', '계란'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '사과 계란 간식',
      foods: ['사과', '계란'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '그릭요거트 블루베리 간식',
      foods: ['그릭요거트', '블루베리'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '프로틴 바나나 간식',
      foods: ['프로틴파우더', '바나나'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '현미떡 계란 간식',
      foods: ['현미떡', '계란'],
      goalTypes: ['maintenance', 'muscle_gain'],
    },
    {
      name: '아몬드 사과 간식',
      foods: ['아몬드', '사과'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '고구마 그릭요거트 간식',
      foods: ['고구마', '그릭요거트'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '바나나 우유 간식',
      foods: ['바나나', '우유'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '프로틴 우유 간식',
      foods: ['프로틴파우더', '우유'],
      goalTypes: ['muscle_gain', 'bulk'],
    },
  ],

  오전간식: [
    {
      name: '요거트 바나나 오전간식',
      foods: ['그릭요거트', '바나나'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '사과 계란 오전간식',
      foods: ['사과', '계란'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '고구마 계란 오전간식',
      foods: ['고구마', '계란'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '블루베리 요거트 오전간식',
      foods: ['블루베리', '그릭요거트'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '프로틴 바나나 오전간식',
      foods: ['프로틴파우더', '바나나'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '아몬드 사과 오전간식',
      foods: ['아몬드', '사과'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
  ],

  운동후: [
    {
      name: '프로틴 바나나 운동후',
      foods: ['프로틴파우더', '바나나'],
      goalTypes: ['diet', 'recomposition', 'maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '백미밥 닭가슴살 운동후',
      foods: ['백미밥', '닭가슴살'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '고구마 닭가슴살 운동후',
      foods: ['고구마', '닭가슴살'],
      goalTypes: ['diet', 'recomposition', 'maintenance', 'muscle_gain'],
    },
    {
      name: '백미밥 연어 운동후',
      foods: ['백미밥', '연어'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '현미밥 소고기 운동후',
      foods: ['현미밥', '소고기'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '프로틴 우유 바나나 운동후',
      foods: ['프로틴파우더', '우유', '바나나'],
      goalTypes: ['muscle_gain', 'bulk'],
    },
    {
      name: '현미밥 닭다리살 운동후',
      foods: ['현미밥', '닭다리살'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '고구마 계란 운동후',
      foods: ['고구마', '계란'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
  ],

  야식: [
    {
      name: '그릭요거트 바나나 야식',
      foods: ['그릭요거트', '바나나'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '사과 그릭요거트 야식',
      foods: ['사과', '그릭요거트'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '고구마 계란 야식',
      foods: ['고구마', '계란'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '프로틴 바나나 야식',
      foods: ['프로틴파우더', '바나나'],
      goalTypes: ['muscle_gain', 'bulk'],
    },
    {
      name: '우유 바나나 야식',
      foods: ['우유', '바나나'],
      goalTypes: ['maintenance', 'muscle_gain', 'bulk'],
    },
    {
      name: '그릭요거트 블루베리 야식',
      foods: ['그릭요거트', '블루베리'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '계란 방울토마토 야식',
      foods: ['계란', '방울토마토'],
      goalTypes: ['diet', 'recomposition', 'maintenance'],
    },
    {
      name: '프로틴 우유 야식',
      foods: ['프로틴파우더', '우유'],
      goalTypes: ['muscle_gain', 'bulk'],
    },
  ],
}
const FAT_MENU_TEMPLATE_LIBRARY = {
  아침: [
    { name: '닭가슴살 아보카도 현미볼', foods: ['현미밥', '닭가슴살', '아보카도'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '연어 아보카도 아침볼', foods: ['현미밥', '연어', '아보카도'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '그릭요거트 블루베리 아몬드볼', foods: ['고단백요거트', '블루베리', '아몬드'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '그릭요거트 호두 과일볼', foods: ['고단백요거트', '블루베리', '호두'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '오트밀 땅콩버터 바나나볼', foods: ['오트밀', '땅콩버터', '바나나'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '오트밀 아몬드버터 블루베리볼', foods: ['오트밀', '아몬드버터', '블루베리'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '계란 아보카도 토스트', foods: ['통밀식빵', '구운계란', '아보카도'], goalTypes: ['maintenance', 'muscle_gain'] },
    { name: '치즈 오믈렛 아침', foods: ['구운계란', '치즈'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
  ],
  점심: [
    { name: '연어 아보카도 덮밥', foods: ['백미밥', '연어', '아보카도'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '닭가슴살 아보카도 플레이트', foods: ['현미밥', '닭가슴살', '아보카도', '샐러드채소'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '연어 올리브오일 샐러드볼', foods: ['연어', '샐러드채소', '올리브오일'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '닭다리살 아보카도 덮밥', foods: ['백미밥', '닭다리살', '아보카도'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '소고기 치즈 플레이트', foods: ['백미밥', '소고기', '치즈'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '참치 아보카도 볼', foods: ['현미밥', '참치', '아보카도'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '연어 견과 샐러드', foods: ['연어', '샐러드채소', '호두'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '닭가슴살 올리브오일 샐러드', foods: ['닭가슴살', '샐러드채소', '올리브오일'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
  ],
  저녁: [
    { name: '닭다리살 샐러드 플레이트', foods: ['닭다리살', '샐러드채소', '아보카도'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '연어 아보카도 플레이트', foods: ['연어', '샐러드채소', '아보카도'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '닭가슴살 올리브오일 샐러드 저녁', foods: ['닭가슴살', '샐러드채소', '올리브오일'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '소고기 아보카도 저녁볼', foods: ['현미밥', '소고기', '아보카도'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '연어 치즈 샐러드', foods: ['연어', '샐러드채소', '치즈'], goalTypes: ['maintenance', 'muscle_gain'] },
    { name: '참치 아보카도 저녁볼', foods: ['현미밥', '참치', '아보카도'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '닭가슴살 아몬드 샐러드', foods: ['닭가슴살', '샐러드채소', '아몬드'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '연어 올리브오일 채소볼', foods: ['연어', '샐러드채소', '올리브오일'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
  ],
  간식: [
    { name: '그릭요거트 블루베리 아몬드 간식', foods: ['고단백요거트', '블루베리', '아몬드'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '그릭요거트 블루베리 호두 간식', foods: ['고단백요거트', '블루베리', '호두'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '사과 땅콩버터 간식', foods: ['사과', '땅콩버터'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '바나나 땅콩버터 간식', foods: ['바나나', '땅콩버터'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '고구마 아몬드 간식', foods: ['고구마', '아몬드'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '오트밀 견과 간식볼', foods: ['오트밀', '아몬드', '호두'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '치즈 계란 간식', foods: ['치즈', '구운계란'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '요거트 아몬드버터 볼', foods: ['고단백요거트', '아몬드버터'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
  ],
  오전간식: [
    { name: '요거트 아몬드 오전간식', foods: ['고단백요거트', '아몬드'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '요거트 호두 오전간식', foods: ['고단백요거트', '호두'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '사과 땅콩버터 오전간식', foods: ['사과', '땅콩버터'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '바나나 아몬드버터 오전간식', foods: ['바나나', '아몬드버터'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '고구마 견과 오전간식', foods: ['고구마', '아몬드'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '치즈 계란 오전간식', foods: ['치즈', '구운계란'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
  ],
  운동후: [
    { name: '연어 아보카도 운동후볼', foods: ['백미밥', '연어', '아보카도'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '닭가슴살 올리브오일 운동후볼', foods: ['백미밥', '닭가슴살', '올리브오일'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '프로틴 땅콩버터 바나나 운동후', foods: ['프로틴파우더', '땅콩버터', '바나나'], goalTypes: ['muscle_gain', 'bulk'] },
    { name: '백미밥 치즈 계란 운동후', foods: ['백미밥', '구운계란', '치즈'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '닭다리살 아보카도 운동후덮밥', foods: ['백미밥', '닭다리살', '아보카도'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '연어 견과 운동후볼', foods: ['백미밥', '연어', '아몬드'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
  ],
  야식: [
    { name: '그릭요거트 호두 야식', foods: ['고단백요거트', '호두'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '그릭요거트 아몬드 야식', foods: ['고단백요거트', '아몬드'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '계란 아보카도 야식', foods: ['구운계란', '아보카도'], goalTypes: ['diet', 'recomposition', 'maintenance'] },
    { name: '우유 땅콩버터 야식', foods: ['우유', '땅콩버터'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '치즈 계란 야식', foods: ['치즈', '구운계란'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
    { name: '요거트 아몬드버터 야식', foods: ['고단백요거트', '아몬드버터'], goalTypes: ['maintenance', 'muscle_gain', 'bulk'] },
  ],
}
const findFoodByTemplateName = (foods = [], rawName = '') => {
  const target = String(rawName || '').trim().toLowerCase()
  if (!target) return null

  return (Array.isArray(foods) ? foods : []).find((food) => {
    const name = String(food?.name || '').trim().toLowerCase()
    const aliases = Array.isArray(food?.aliases)
      ? food.aliases.map((item) => String(item || '').trim().toLowerCase())
      : []

    return name === target || aliases.includes(target)
  }) || null
}

const getTemplateCandidatesBySlot = (slot = '') => {
  const baseTemplates = Array.isArray(MEAL_TEMPLATE_LIBRARY?.[slot])
    ? MEAL_TEMPLATE_LIBRARY[slot]
    : []

  const fatTemplates = Array.isArray(FAT_MENU_TEMPLATE_LIBRARY?.[slot])
    ? FAT_MENU_TEMPLATE_LIBRARY[slot]
    : []

  return [...fatTemplates, ...baseTemplates]
}

const isTemplateAllowedForGoal = (template, goalType = 'diet') => {
  const goalTypes = Array.isArray(template?.goalTypes) ? template.goalTypes : []

  if (!goalTypes.length) return true

  return goalTypes.includes(goalType)
}
  
const getTemplateGoalScore = ({
  template,
  foods = [],
  goalType = 'diet',
  slot = '',
}) => {
  const templateFoods = Array.isArray(template?.foods) ? template.foods : []

  const matchedFoods = templateFoods
    .map((foodName) => findFoodByTemplateName(foods, foodName))
    .filter(Boolean)

  if (!matchedFoods.length) return 0

  const names = matchedFoods.map((food) =>
    String(food?.name || '').trim().toLowerCase()
  )

  const categoryCounts = matchedFoods.reduce(
    (acc, food) => {
      const major = String(food?.category_major || '').trim()
      acc[major] = (acc[major] || 0) + 1
      return acc
    },
    {}
  )

  let score = 0

  const carbCount = Number(categoryCounts.carb || 0)
  const proteinCount = Number(categoryCounts.protein || 0)
  const dairyCount = Number(categoryCounts.dairy || 0)
  const fruitCount = Number(categoryCounts.fruit || 0)
  const vegetableCount = Number(categoryCounts.vegetable || 0)
  const mixedCount = Number(categoryCounts.mixed || 0)

  const hasRice = names.some((name) => name.includes('밥'))
  const hasSweetPotato = names.some((name) => name.includes('고구마'))
  const hasOatmeal = names.some((name) => name.includes('오트밀'))
  const hasBread = names.some((name) => name.includes('식빵') || name.includes('베이글'))
  const hasChicken = names.some((name) => name.includes('닭'))
  const hasBeef = names.some((name) => name.includes('소고기'))
  const hasSalmon = names.some((name) => name.includes('연어'))
  const hasEgg = names.some((name) => name.includes('계란'))
  const hasYogurt = names.some((name) => name.includes('요거트'))
  const hasMilk = names.some((name) => name.includes('우유'))
  const hasPowder =
    names.some((name) => name.includes('프로틴')) ||
    names.some((name) => name.includes('파우더'))
  const hasVegetable = vegetableCount > 0
  const hasFruit = fruitCount > 0
  const hasMixedMeal = mixedCount > 0

  if (goalType === 'bulk' || goalType === 'muscle_gain') {
    score += carbCount * 3
    score += proteinCount * 3
    score += dairyCount
    if (hasRice) score += 3
    if (hasSweetPotato) score += 2
    if (hasOatmeal) score += 2
    if (hasBread) score += 2
    if (hasChicken || hasBeef || hasSalmon) score += 3
    if (slot === '운동후' && hasPowder) score += 3
    if (slot === '야식' && hasPowder) score -= 2
    if (hasFruit && slot !== '운동후') score += 1
  } else if (goalType === 'diet' || goalType === 'recomposition') {
    score += proteinCount * 3
    score += vegetableCount * 2
    score += fruitCount
    if (hasChicken || hasSalmon || hasEgg || hasYogurt) score += 3
    if (hasRice) score -= slot === '저녁' || slot === '야식' ? 2 : 0
    if (hasSweetPotato || hasOatmeal) score += 2
    if (hasPowder && ['아침', '점심', '저녁'].includes(slot)) score -= 4
    if (slot === '야식' && hasYogurt) score += 2
    if (slot === '야식' && hasFruit) score += 1
  } else if (goalType === 'maintenance') {
    score += proteinCount * 2
    score += carbCount * 2
    if (hasRice || hasSweetPotato || hasOatmeal || hasBread) score += 2
    if (hasChicken || hasSalmon || hasEgg) score += 2
    if (hasVegetable) score += 1
  } else {
    score += proteinCount * 2
    score += carbCount * 2
  }

  if (slot === '아침') {
    if (hasOatmeal || hasYogurt || hasEgg || hasFruit) score += 3
    if (hasBeef) score -= 1
    if (hasMixedMeal) score -= 1
    if (hasPowder) score -= goalType === 'bulk' || goalType === 'muscle_gain' ? 0 : 2
  }

  if (slot === '점심') {
    if (hasRice || hasMixedMeal) score += 3
    if (hasChicken || hasBeef || hasSalmon) score += 2
    if (hasVegetable) score += 1
    if (hasYogurt && !hasRice && !hasMixedMeal) score -= 2
    if (hasPowder) score -= 3
  }

  if (slot === '저녁') {
    if (goalType === 'diet' || goalType === 'recomposition') {
      if (hasSweetPotato || hasVegetable || hasChicken || hasSalmon) score += 3
      if (hasRice) score -= 1
      if (hasBread) score -= 2
      if (hasMixedMeal) score -= 2
    } else {
      if (hasRice || hasSweetPotato) score += 2
      if (hasChicken || hasBeef || hasSalmon) score += 2
    }

    if (hasPowder) score -= 4
  }

  if (slot === '간식' || slot === '오전간식') {
    if (hasYogurt || hasFruit || hasEgg || hasMilk) score += 3
    if (hasRice || hasMixedMeal) score -= 4
    if (hasBeef) score -= 2
  }

  if (slot === '운동후') {
    if (hasPowder) score += 2
    if (hasRice || hasSweetPotato || hasBread || hasFruit) score += 3
    if (hasChicken || hasBeef || hasSalmon || hasMilk) score += 2
  }

  if (slot === '야식') {
    if (hasRice) score -= 3
    if (hasBeef) score -= 3
    if (hasMixedMeal) score -= 4
    if (hasYogurt || hasEgg || hasFruit || hasMilk) score += 3
    if (hasSweetPotato) score += 1
  }

  const templateName = String(template?.name || '')
  if (templateName.includes('점심') && slot === '점심') score += 1
  if (templateName.includes('저녁') && slot === '저녁') score += 1
  if (templateName.includes('아침') && slot === '아침') score += 1
  if (templateName.includes('간식') && (slot === '간식' || slot === '오전간식')) score += 1
  if (templateName.includes('운동후') && slot === '운동후') score += 2
  if (templateName.includes('야식') && slot === '야식') score += 2

  return score
}
  
const pickMealTemplate = ({
  slot = '',
  foods = [],
  blockedSet = new Set(),
  dateString = '',
  goalType = 'diet',
}) => {
  const templates = getTemplateCandidatesBySlot(slot)

  if (!templates.length) return null

  const availableTemplates = templates.filter((template) => {
    if (!isTemplateAllowedForGoal(template, goalType)) {
      return false
    }

    const templateFoods = Array.isArray(template?.foods) ? template.foods : []

    if (!templateFoods.length) return false

    const isValid = templateFoods.every((foodName) => {
      const matchedFood = findFoodByTemplateName(foods, foodName)
      return matchedFood && !blockedSet.has(matchedFood.id)
    })

    if (!isValid) return false

    const templateName = String(template?.name || '').toLowerCase()

    if (goalType === 'diet') {
      return !(
        templateName.includes('버거') ||
        templateName.includes('피자') ||
        templateName.includes('파스타') ||
        templateName.includes('튀김')
      )
    }

    if (goalType === 'bulk' || goalType === 'muscle_gain') {
      return (
        templateName.includes('밥') ||
        templateName.includes('파스타') ||
        templateName.includes('베이글') ||
        templateName.includes('식빵') ||
        templateName.includes('덮밥')
      )
    }

    if (goalType === 'maintenance') {
      return true
    }

    return true
  })

  if (!availableTemplates.length) return null

  const scoredTemplates = availableTemplates
    .map((template, index) => ({
      template,
      index,
      score: getTemplateGoalScore({
        template,
        foods,
        goalType,
        slot,
      }),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score
      return a.index - b.index
    })

  const topTemplates = scoredTemplates.slice(0, Math.min(3, scoredTemplates.length))
  const seed = (Number(String(dateString || '').slice(-2)) || 1) % topTemplates.length

  return topTemplates[seed]?.template || topTemplates[0]?.template || null
}

const buildMealPlanFromTemplate = ({
  template,
  foods = [],
  targetCarbs = 0,
  targetProtein = 0,
  targetFat = 0,
  targetKcal = 0,
}) => {
  if (!template || !Array.isArray(template.foods) || template.foods.length === 0) {
    return null
  }

  const matchedFoods = template.foods
    .map((foodName) => findFoodByTemplateName(foods, foodName))
    .filter(Boolean)

  if (!matchedFoods.length) return null

  const isHighCalorieTarget = Number(targetKcal || 0) >= 700

  const getCategoryMaxGrams = (category) => {
    if (category === 'carb') return isHighCalorieTarget ? 420 : 300
    if (category === 'protein') return isHighCalorieTarget ? 280 : 220
    if (category === 'dairy') return isHighCalorieTarget ? 300 : 240
    if (category === 'fat') return 50
    if (category === 'fruit') return isHighCalorieTarget ? 250 : 180
    if (category === 'vegetable') return 180
    return isHighCalorieTarget ? 280 : 220
  }

  const draftItems = matchedFoods.map((food) => {
    const category = String(food?.category_major || '').trim()
    let grams = Number(food?.typical_portion_g || 100)

    if (category === 'carb') {
      grams = calcPortionByMacro({
        food,
        macroKey: 'carbs_per_100g',
        targetGrams: Math.max(
          15,
          Math.round(Number(targetCarbs || 0) / Math.max(matchedFoods.length, 1)) *
            (isHighCalorieTarget ? 1.8 : 1.4)
        ),
        fallbackGrams: food?.typical_portion_g || 150,
        minGrams: isHighCalorieTarget ? 100 : 60,
        maxGrams: getCategoryMaxGrams(category),
      })
    } else if (category === 'protein' || category === 'dairy') {
      grams = calcPortionByMacro({
        food,
        macroKey: 'protein_per_100g',
        targetGrams: Math.max(
          12,
          Math.round(Number(targetProtein || 0) / Math.max(matchedFoods.length, 1)) *
            (isHighCalorieTarget ? 1.55 : 1.35)
        ),
        fallbackGrams: food?.typical_portion_g || 140,
        minGrams: category === 'dairy' ? 100 : 90,
        maxGrams: getCategoryMaxGrams(category),
      })
    } else if (category === 'fat') {
      grams = calcPortionByMacro({
        food,
        macroKey: 'fat_per_100g',
        targetGrams: Math.max(
          5,
          Math.round(Number(targetFat || 0) / Math.max(matchedFoods.length, 1)) * 1.25
        ),
        fallbackGrams: food?.typical_portion_g || 20,
        minGrams: 10,
        maxGrams: getCategoryMaxGrams(category),
      })
    } else if (category === 'fruit') {
      grams = clampNumber(food?.typical_portion_g || 120, 80, getCategoryMaxGrams(category))
    } else if (category === 'vegetable') {
      grams = clampNumber(food?.typical_portion_g || 100, 70, getCategoryMaxGrams(category))
    } else {
      grams = clampNumber(food?.typical_portion_g || 120, 80, getCategoryMaxGrams(category))
    }

    return {
      food,
      category,
      grams: Math.round(grams),
    }
  })

  const materializeItems = (items) =>
    items.map(({ food, grams, category }) => ({
      ...buildMealFoodItem(food, grams),
      category_major: category,
    }))

  let workingDraftItems = [...draftItems]
  let adjustedFoodItems = materializeItems(workingDraftItems)
  let summary = sumMealItems(adjustedFoodItems)

  if (Number(targetKcal || 0) > 0 && adjustedFoodItems.length > 0) {
    const lowerBound = Number(targetKcal) * 0.92
    const upperBound = Number(targetKcal) * 1.08

    let guard = 0

    while ((summary.kcal < lowerBound || summary.kcal > upperBound) && guard < 12) {
      guard += 1
      const ratio = Number(targetKcal) / Math.max(1, Number(summary.kcal || 0))

      workingDraftItems = workingDraftItems.map((draft) => {
        const nextGrams = clampNumber(
          Math.round(Number(draft.grams || 0) * ratio),
          draft.category === 'fat' ? 10 : 60,
          getCategoryMaxGrams(draft.category)
        )

        return {
          ...draft,
          grams: nextGrams,
        }
      })

      adjustedFoodItems = materializeItems(workingDraftItems)
      summary = sumMealItems(adjustedFoodItems)
    }

    if (summary.kcal < lowerBound) {
      let fillGuard = 0

      while (summary.kcal < lowerBound && fillGuard < 20) {
        fillGuard += 1

        workingDraftItems = workingDraftItems.map((draft) => {
          const maxGrams = getCategoryMaxGrams(draft.category)
          let addGrams = 0

          if (draft.category === 'carb') {
            addGrams = isHighCalorieTarget ? 35 : 20
          } else if (draft.category === 'protein') {
            addGrams = isHighCalorieTarget ? 25 : 15
          } else if (draft.category === 'dairy') {
            addGrams = isHighCalorieTarget ? 30 : 20
          } else if (draft.category === 'fat') {
            addGrams = 5
          } else if (draft.category === 'fruit') {
            addGrams = 20
          }

          if (addGrams <= 0) return draft

          return {
            ...draft,
            grams: clampNumber(
              Number(draft.grams || 0) + addGrams,
              draft.category === 'fat' ? 10 : 60,
              maxGrams
            ),
          }
        })

        adjustedFoodItems = materializeItems(workingDraftItems)
        summary = sumMealItems(adjustedFoodItems)
      }
    }
  }

  return {
    items: adjustedFoodItems,
    menu: template.name || formatMealMenu(adjustedFoodItems),
    guide_text: '',
    meal_detail_type: 'template',
    kcal: Math.round(summary.kcal),
    carbs_g: Math.round(summary.carbs_g),
    protein_g: Math.round(summary.protein_g),
    fat_g: Math.round(summary.fat_g),
    sodium_mg: Math.round(summary.sodium_mg),
  }
}
const GENERAL_MEAL_GUIDE_MAP = {
  balanced: {
    label: '균형 식사',
    description: '탄수화물, 단백질, 지방을 균형 있게 구성한 일반 식사입니다.',
    guide: [
      '탄수화물: 밥/고구마/빵 중 1',
      '단백질: 고기/생선/계란 중 1',
      '채소 1~2종 포함',
    ],
    examples: [
      '백미밥 + 닭가슴살 + 브로콜리',
      '고구마 + 계란 + 샐러드',
    ],
    caution: [
      '튀김류 과다 섭취 주의',
      '소스 과다 사용 주의',
    ],
  },

  eating_out: {
    label: '외식형 식사',
    description: '외식 환경에서도 지킬 수 있는 식사 가이드입니다.',
    guide: [
      '단백질 위주 선택',
      '밥/면은 70~80%만 섭취',
    ],
    examples: [
      '제육볶음 + 밥 반공기',
      '회덮밥 (밥 절반)',
    ],
    caution: [
      '국물 섭취 최소화',
      '튀김류는 주 1~2회 제한',
    ],
  },

  simple: {
    label: '간편식',
    description: '빠르게 먹을 수 있는 간단한 식사입니다.',
    guide: [
      '단백질 포함 필수',
      '당류 과다 주의',
    ],
    examples: [
      '프로틴쉐이크 + 바나나',
      '그릭요거트 + 과일',
    ],
    caution: [
      '간편식만 반복 금지',
    ],
  },

  diet: {
    label: '다이어트 식단',
    description: '체지방 감량 중심 식단입니다.',
    guide: [
      '고단백 유지',
      '저지방 구성',
    ],
    examples: [
      '닭가슴살 + 샐러드',
      '연어 + 채소',
    ],
    caution: [
      '탄수 너무 낮추지 말 것',
    ],
  },

  social: {
    label: '회식/술자리',
    description: '사회적 식사 상황 대응 가이드입니다.',
    guide: [
      '단백질 먼저 섭취',
      '술은 천천히',
    ],
    examples: [
      '삼겹살 + 채소 위주',
      '회 + 소주 소량',
    ],
    caution: [
      '안주 폭식 주의',
    ],
  },
}
const getGeneralMealDetailType = ({
  mealPlanForm,
  slot,
  dateString,
}) => {
  const currentMealPattern = String(mealPlanForm?.current_meal_pattern || 'mixed')
  const mealStructureMode = String(mealPlanForm?.meal_structure_mode || 'structured')
  const alcoholFrequency = Number(mealPlanForm?.alcohol_frequency_per_week || 0)
  const deliveryFrequency = Number(mealPlanForm?.delivery_food_frequency_per_week || 0)
  const snackFrequency = Number(mealPlanForm?.snack_frequency_per_week || 0)
  const goalType = String(mealPlanForm?.goal_type || 'diet')

  if (alcoholFrequency >= 1 && (slot === '저녁' || slot === '야식')) {
    return 'social'
  }

  if (mealStructureMode === 'performance') {
    return 'balanced'
  }

  if (currentMealPattern === 'general_heavy') {
    return 'eating_out'
  }

  if (deliveryFrequency >= 3 || snackFrequency >= 5) {
    return 'simple'
  }

  if (goalType === 'diet' || goalType === 'recomposition') {
    return 'diet'
  }

  const day = Number(String(dateString || '').slice(-2)) || 1
  return day % 2 === 0 ? 'balanced' : 'eating_out'
}

const buildGeneralMealGuideText = ({
  mealPlanForm,
  slot,
  dateString,
  targetKcal = 0,
  targetCarbs = 0,
  targetProtein = 0,
  targetFat = 0,
}) => {
  const detailType = getGeneralMealDetailType({
    mealPlanForm,
    slot,
    dateString,
  })

  const detail = GENERAL_MEAL_GUIDE_MAP[detailType] || GENERAL_MEAL_GUIDE_MAP.balanced

  const text = [
    `${detail.label}`,
    '',
    `${detail.description}`,
    '',
    `권장 목표`,
    `- 약 ${Math.round(Number(targetKcal || 0))} kcal 내외`,
    `- 탄수 ${Math.round(Number(targetCarbs || 0))}g / 단백질 ${Math.round(Number(targetProtein || 0))}g / 지방 ${Math.round(Number(targetFat || 0))}g`,
    '',
    `구성 가이드`,
    ...detail.guide.map((item) => `- ${item}`),
    '',
    `예시 메뉴`,
    ...detail.examples.map((item) => `- ${item}`),
    '',
    `주의사항`,
    ...detail.caution.map((item) => `- ${item}`),
  ].join('\n')

  return {
    detailType,
    label: detail.label,
    text,
  }
}

const buildFreeMealGuideText = ({
  targetKcal = 0,
}) => {
  const text = [
    '자유식 · 유연형',
    '',
    '먹고 싶은 음식을 선택할 수 있는 끼니입니다.',
    '',
    '권장 기준',
    `- 약 ${Math.round(Number(targetKcal || 0))} kcal 내외에서 마무리`,
    '- 과식하지 않기',
    '- 다음 끼니는 원래 식단으로 바로 복귀',
    '',
    '주의사항',
    '- 자유식이라고 폭식까지 허용하는 것은 아님',
    '- 디저트, 음료, 튀김을 한 끼에 모두 겹치지 않기',
  ].join('\n')

  return {
    label: '자유식 · 유연형',
    text,
  }
}
  
const buildSingleMealPlan = ({
  foods,
  goalType,
  slot,
  dayType,
  mealType,
  mealStyleType,
  mealPlanForm,
  dateString,
  preferredSet,
  blockedSet,
  targetCarbs,
  targetProtein,
  targetFat,
  targetKcal,
  offset = 0,
  recentUsedIds = [],
  slotUsedNames = [],
  preferredIncludedCount = 0,
}) => {
  const currentMealType = mealType || 'normal'
  const normalizedMealStyleType = String(mealStyleType || '').trim() || (
    currentMealType === 'free'
      ? 'eating_out'
      : currentMealType === 'general'
      ? 'general'
      : 'diet'
  )

  const isDietStyle = normalizedMealStyleType === 'diet'
  const isGeneralStyle = normalizedMealStyleType === 'general'
  const isEatingOutStyle = normalizedMealStyleType === 'eating_out'

  if (currentMealType === 'free') {
  const freeTemplate = pickMealTemplate({
    slot,
    foods: Array.isArray(foods) ? foods : [],
    blockedSet,
    dateString,
    goalType,
  })

  if (freeTemplate) {
    const templateMeal = buildMealPlanFromTemplate({
      template: freeTemplate,
      foods: Array.isArray(foods) ? foods : [],
      targetCarbs,
      targetProtein,
      targetFat,
      targetKcal,
    })

    if (templateMeal) {
      const nextUsedIds = [
        ...recentUsedIds,
        ...(templateMeal.items || []).map((item) => item.food_id).filter(Boolean),
      ].slice(-8)

      const nextSlotUsedNames = [
        ...slotUsedNames,
        ...(templateMeal.items || []).map((item) => item.name).filter(Boolean),
      ].slice(-8)

      const hasPreferredInMeal = (templateMeal.items || []).some((item) =>
        preferredSet.has(item.food_id)
      )

      const nextPreferredIncludedCount =
        preferredIncludedCount + (hasPreferredInMeal ? 1 : 0)

      return {
        items: templateMeal.items || [],
          menu: buildMealMenuLabel(templateMeal.items || [], slot),
        guide_text: buildMealGuideTextFromItems({
          items: templateMeal.items || [],
          slot,
          mealType: 'free',
          targetKcal,
        }),
        kcal: Number(templateMeal.kcal || 0),
        carbs_g: Number(templateMeal.carbs_g || 0),
        protein_g: Number(templateMeal.protein_g || 0),
        fat_g: Number(templateMeal.fat_g || 0),
        sodium_mg: Number(templateMeal.sodium_mg || 0),
        isFreeMeal: true,
        meal_detail_type: 'free',
        nextUsedIds,
        nextSlotUsedNames,
        nextPreferredIncludedCount,
      }
    }
  }

  const freeGuide = buildFreeMealGuideText({
    targetKcal,
  })

  return {
    items: [],
    menu: freeGuide.label,
    guide_text: freeGuide.text,
    kcal: Number(targetKcal || 0),
    carbs_g: Number(targetCarbs || 0),
    protein_g: Number(targetProtein || 0),
    fat_g: Number(targetFat || 0),
    sodium_mg: 0,
    isFreeMeal: true,
    meal_detail_type: 'free',
    nextUsedIds: recentUsedIds,
    nextSlotUsedNames: slotUsedNames,
    nextPreferredIncludedCount: preferredIncludedCount,
  }
}

  if (currentMealType === 'general') {
  const generalTemplate = pickMealTemplate({
    slot,
    foods: Array.isArray(foods) ? foods : [],
    blockedSet,
    dateString,
    goalType,
  })

  if (generalTemplate) {
    const templateMeal = buildMealPlanFromTemplate({
      template: generalTemplate,
      foods: Array.isArray(foods) ? foods : [],
      targetCarbs,
      targetProtein,
      targetFat,
      targetKcal,
    })

    if (templateMeal) {
      const nextUsedIds = [
        ...recentUsedIds,
        ...(templateMeal.items || []).map((item) => item.food_id).filter(Boolean),
      ].slice(-8)

      const nextSlotUsedNames = [
        ...slotUsedNames,
        ...(templateMeal.items || []).map((item) => item.name).filter(Boolean),
      ].slice(-8)

      const hasPreferredInMeal = (templateMeal.items || []).some((item) =>
        preferredSet.has(item.food_id)
      )

      const nextPreferredIncludedCount =
        preferredIncludedCount + (hasPreferredInMeal ? 1 : 0)

      const generalGuide = buildGeneralMealGuideText({
        mealPlanForm,
        slot,
        dateString,
        targetKcal,
        targetCarbs,
        targetProtein,
        targetFat,
      })

      return {
        items: templateMeal.items || [],
       menu: buildMealMenuLabel(templateMeal.items || [], slot),
        guide_text: buildMealGuideTextFromItems({
          items: templateMeal.items || [],
          slot,
          mealType: 'general',
          targetKcal,
        }),
        kcal: Number(templateMeal.kcal || 0),
        carbs_g: Number(templateMeal.carbs_g || 0),
        protein_g: Number(templateMeal.protein_g || 0),
        fat_g: Number(templateMeal.fat_g || 0),
        sodium_mg: Number(templateMeal.sodium_mg || 0),
        isGeneralMeal: true,
        meal_detail_type: generalGuide.detailType,
        nextUsedIds,
        nextSlotUsedNames,
        nextPreferredIncludedCount,
      }
    }
  }

  const generalGuide = buildGeneralMealGuideText({
    mealPlanForm,
    slot,
    dateString,
    targetKcal,
    targetCarbs,
    targetProtein,
    targetFat,
  })

  return {
    items: [],
    menu: generalGuide.label,
    guide_text: generalGuide.text,
    kcal: Number(targetKcal || 0),
    carbs_g: Number(targetCarbs || 0),
    protein_g: Number(targetProtein || 0),
    fat_g: Number(targetFat || 0),
    sodium_mg: 0,
    isGeneralMeal: true,
    meal_detail_type: generalGuide.detailType,
    nextUsedIds: recentUsedIds,
    nextSlotUsedNames: slotUsedNames,
    nextPreferredIncludedCount: preferredIncludedCount,
  }
}
if (currentMealType === 'alcohol') {
  const alcoholTemplate = pickMealTemplate({
    slot,
    foods: Array.isArray(foods) ? foods : [],
    blockedSet,
    dateString,
    goalType,
  })

  if (alcoholTemplate) {
    const templateMeal = buildMealPlanFromTemplate({
      template: alcoholTemplate,
      foods: Array.isArray(foods) ? foods : [],
      targetCarbs,
      targetProtein,
      targetFat,
      targetKcal,
    })

    if (templateMeal) {
      const nextUsedIds = [
        ...recentUsedIds,
        ...(templateMeal.items || []).map((item) => item.food_id).filter(Boolean),
      ].slice(-8)

      const nextSlotUsedNames = [
        ...slotUsedNames,
        ...(templateMeal.items || []).map((item) => item.name).filter(Boolean),
      ].slice(-8)

      const hasPreferredInMeal = (templateMeal.items || []).some((item) =>
        preferredSet.has(item.food_id)
      )

      const nextPreferredIncludedCount =
        preferredIncludedCount + (hasPreferredInMeal ? 1 : 0)

      return {
        items: templateMeal.items || [],
        menu: buildMealMenuLabel(templateMeal.items || [], slot),
        guide_text: buildMealGuideTextFromItems({
          items: templateMeal.items || [],
          slot,
          mealType: 'alcohol',
          targetKcal,
        }),
        kcal: Number(templateMeal.kcal || 0),
        carbs_g: Number(templateMeal.carbs_g || 0),
        protein_g: Number(templateMeal.protein_g || 0),
        fat_g: Number(templateMeal.fat_g || 0),
        sodium_mg: Number(templateMeal.sodium_mg || 0),
        isAlcoholMeal: true,
        meal_detail_type: 'alcohol',
        nextUsedIds,
        nextSlotUsedNames,
        nextPreferredIncludedCount,
      }
    }
  }

  return {
    items: [],
    menu: '음주 예정',
    guide_text:
      '음주 시 안주는 단백질 위주(육류/생선) 선택, 튀김/탄수화물 과다 섭취 주의. 다음날 식단 복귀.',
    kcal: Number(targetKcal || 0),
    carbs_g: Number(targetCarbs || 0),
    protein_g: Number(targetProtein || 0),
    fat_g: Number(targetFat || 0),
    sodium_mg: 0,
    isAlcoholMeal: true,
    meal_detail_type: 'alcohol',
    nextUsedIds: recentUsedIds,
    nextSlotUsedNames: slotUsedNames,
    nextPreferredIncludedCount: preferredIncludedCount,
  }
}
  const styleFilteredFoods = (Array.isArray(foods) ? foods : []).filter((food) => {
    const major = String(food?.category_major || '').trim()
    const sourceType = String(food?.source_type || '').trim()
    const kcalPer100g = Number(food?.kcal_per_100g || 0)

    if (blockedSet.has(food.id)) return false

    if (isDietStyle) {
      return (
        ['carb', 'protein', 'vegetable', 'fruit', 'dairy', 'fat'].includes(major) &&
        kcalPer100g <= 400
      )
    }

    if (isGeneralStyle) {
      return ['carb', 'protein', 'vegetable', 'fruit', 'dairy', 'fat', 'mixed'].includes(major)
    }

    if (isEatingOutStyle) {
      return sourceType === 'mixed' || major === 'mixed' || ['carb', 'protein'].includes(major)
    }

    return true
  })

  const selectedTemplate = pickMealTemplate({
    slot,
    foods: styleFilteredFoods,
    blockedSet,
    dateString,
     goalType,
  })

  if (selectedTemplate) {
    const templateMeal = buildMealPlanFromTemplate({
      template: selectedTemplate,
      foods: styleFilteredFoods,
      targetCarbs,
      targetProtein,
      targetFat,
      targetKcal,
    })

    if (templateMeal) {
                          let templateItems = Array.isArray(templateMeal.items) ? [...templateMeal.items] : []
      let templateSummary = sumMealItems(templateItems)

      const currentFat = Number(templateSummary.fat_g || 0)
      const fatGap = Math.max(0, Number(targetFat || 0) - currentFat)

    if (fatGap >= 5) {
  const structureType = getMealStructureType(templateItems, slot)
  const allowedFatNames = getAllowedFatFoodNamesByStructure(structureType)

  let fatCandidates = styleFilteredFoods.filter((food) => {
    const category = String(food?.category_major || '').trim()
    const normalizedName = normalizeMenuFoodName(String(food?.name || '').trim())

    if (category !== 'fat') return false
    return allowedFatNames.includes(normalizedName)
  })

  if (structureType === 'pasta_meal') {
    const hasPastaFatAlready = templateItems.some((item) => {
      const normalizedItemName = normalizeMenuFoodName(String(item?.name || '').trim())
      return ['올리브오일', '치즈', '토마토소스', '페스토'].includes(normalizedItemName)
    })

    if (!hasPastaFatAlready) {
      fatCandidates = [...fatCandidates].sort((a, b) => {
        const aName = normalizeMenuFoodName(String(a?.name || '').trim())
        const bName = normalizeMenuFoodName(String(b?.name || '').trim())

        const score = (name) => {
          if (name === '올리브오일') return 100
          if (name === '치즈') return 80
          if (name === '토마토소스') return 60
          if (name === '페스토') return 40
          return 0
        }

        return score(bName) - score(aName)
      })
    }
  }

  let remainingFatGap = fatGap
  let fatAddCount = 0

  while (remainingFatGap >= 4 && fatCandidates.length > 0 && fatAddCount < 2) {
    const selectedFatFood = fatCandidates[0]
    if (!selectedFatFood) break

    const fatPer100g = Number(selectedFatFood.fat_per_100g || 0)
    const typicalPortionG = Number(selectedFatFood.typical_portion_g || 0)

    if (!fatPer100g || !typicalPortionG) break

    const needGramByFat = (remainingFatGap / fatPer100g) * 100
    const addGrams = Math.max(
      typicalPortionG,
      roundToNearest(Math.min(needGramByFat, typicalPortionG * 2), 5)
    )

    const addedItem = buildMealFoodItem(selectedFatFood, addGrams)

    templateItems.push(addedItem)

    const addedFat = Number(addedItem.fat_g || 0)
    remainingFatGap -= addedFat
    fatAddCount += 1

    if (structureType === 'pasta_meal') {
      fatCandidates = fatCandidates.filter(
        (food) => food?.id !== selectedFatFood?.id
      )
    } else {
      break
    }
  }

  templateSummary = sumMealItems(templateItems)
}

                 templateItems = applyPastaMinimumFat({
        items: templateItems,
        foods: styleFilteredFoods,
        slot,
        dateString,
      })
      templateSummary = sumMealItems(templateItems)
      const nextUsedIds = [
        ...recentUsedIds,
        ...templateItems.map((item) => item.food_id).filter(Boolean),
      ].slice(-8)

      const nextSlotUsedNames = [
        ...slotUsedNames,
        ...templateItems.map((item) => item.name).filter(Boolean),
      ].slice(-8)

     const hasPreferredInMeal = templateItems.some((item) =>
  preferredSet.has(item.food_id)
)

      const nextPreferredIncludedCount =
        preferredIncludedCount + (hasPreferredInMeal ? 1 : 0)

                 return {
        items: templateItems,
        menu: buildMealMenuLabel(templateItems, slot),
        guide_text:
          templateMeal.guide_text ||
          buildMealGuideTextFromItems({
            items: templateItems,
            slot,
            mealType: currentMealType,
            targetKcal,
          }),
        meal_detail_type: templateMeal.meal_detail_type || 'template',
        kcal: Number(templateSummary.kcal || 0),
        carbs_g: Number(templateSummary.carbs_g || 0),
        protein_g: Number(templateSummary.protein_g || 0),
        fat_g: Number(templateSummary.fat_g || 0),
        sodium_mg: Number(templateSummary.sodium_mg || 0),
        nextUsedIds,
        nextSlotUsedNames,
        nextPreferredIncludedCount,
      }
    }
  }

  const isLateNightSlot = slot === '야식'
  const isMainMealSlot = ['아침', '점심', '저녁'].includes(slot)

  const filteredFoodsForSlot = styleFilteredFoods.filter((food) => {
    const name = String(food?.name || '').trim().toLowerCase()
    const aliases = Array.isArray(food?.aliases)
      ? food.aliases.map((item) => String(item || '').trim().toLowerCase())
      : []
    const tokens = [name, ...aliases]

    const isProteinPowderLike =
      tokens.some((token) => token.includes('프로틴')) ||
      tokens.some((token) => token.includes('protein')) ||
      tokens.some((token) => token.includes('파우더')) ||
      tokens.some((token) => token.includes('쉐이크')) ||
      tokens.some((token) => token.includes('shake'))

    if (isMainMealSlot && isProteinPowderLike) {
      return false
    }

    if (isLateNightSlot && String(food?.category_major || '').trim() === 'vegetable') {
      return false
    }

    return true
  })

  const config = getMealCategoryConfig(slot, goalType, dayType)

  const usedIds = new Set()
  const shouldForcePreferred = preferredSet.size > 0 && preferredIncludedCount < 1

  let carbFood = null
  let proteinFood = null
  let extraFood = null

  if (shouldForcePreferred) {
    proteinFood = pickPreferredFoodFirst({
      foods: filteredFoodsForSlot,
      preferredSet,
      blockedSet,
      categories: config.proteinCategories,
      goalType,
      dateString,
      slot,
      offset,
      usedIds,
      recentUsedIds,
      slotUsedNames,
    })

    if (!proteinFood) {
      carbFood = pickPreferredFoodFirst({
        foods: filteredFoodsForSlot,
        preferredSet,
        blockedSet,
        categories: config.carbCategories,
        goalType,
        dateString,
        slot,
        offset,
        usedIds,
        recentUsedIds,
        slotUsedNames,
      })
    }

    if (!proteinFood && !carbFood) {
      extraFood = pickPreferredFoodFirst({
        foods: filteredFoodsForSlot,
        preferredSet,
        blockedSet,
        categories: config.extraCategories || [],
        goalType,
        dateString,
        slot,
        offset,
        usedIds,
        recentUsedIds,
        slotUsedNames,
      })
    }
  }

  if (carbFood) usedIds.add(carbFood.id)
  if (proteinFood) usedIds.add(proteinFood.id)
  if (extraFood) usedIds.add(extraFood.id)

  if (!carbFood) {
    carbFood = pickFood({
      foods: filteredFoodsForSlot,
      preferredSet,
      blockedSet,
      categories: config.carbCategories,
      goalType,
      dateString,
      slot,
      offset,
      usedIds,
      recentUsedIds,
      slotUsedNames,
    })
    if (carbFood) usedIds.add(carbFood.id)
  }

  if (!proteinFood) {
    proteinFood = pickFood({
      foods: filteredFoodsForSlot,
      preferredSet,
      blockedSet,
      categories: config.proteinCategories,
      goalType,
      dateString,
      slot,
      offset: offset + 1,
      usedIds,
      recentUsedIds,
      slotUsedNames,
    })
    if (proteinFood) usedIds.add(proteinFood.id)
  }

  if (!extraFood) {
    extraFood = pickFood({
      foods: filteredFoodsForSlot,
      preferredSet,
      blockedSet,
      categories: config.extraCategories || [],
      goalType,
      dateString,
      slot,
      offset: offset + 2,
      usedIds,
      recentUsedIds,
      slotUsedNames,
    })
  }

  const mealItems = []

  if (carbFood) {
    const carbTarget =
      slot === '저녁' && config.lightCarb
        ? Math.max(15, Math.round(targetCarbs * 0.6))
        : targetCarbs

    const grams = calcPortionByMacro({
      food: carbFood,
      macroKey: 'carbs_per_100g',
      targetGrams: carbTarget,
      fallbackGrams: carbFood.typical_portion_g || 120,
      minGrams: 60,
      maxGrams: 260,
    })

    mealItems.push(buildMealFoodItem(carbFood, grams))
  }

  if (proteinFood) {
    const grams = calcPortionByMacro({
      food: proteinFood,
      macroKey: 'protein_per_100g',
      targetGrams: targetProtein,
      fallbackGrams: proteinFood.typical_portion_g || 120,
      minGrams: 70,
      maxGrams: 220,
    })

    mealItems.push(buildMealFoodItem(proteinFood, grams))
  }

  if (extraFood) {
    const category = String(extraFood.category_major || '').trim()
    let grams = extraFood.typical_portion_g || 100

    if (category === 'fat') {
      grams = calcPortionByMacro({
        food: extraFood,
        macroKey: 'fat_per_100g',
        targetGrams: Math.max(5, targetFat * 0.6),
        fallbackGrams: extraFood.typical_portion_g || 15,
        minGrams: 10,
        maxGrams: 40,
      })
    }

    if (category === 'vegetable') {
      grams = 100
    }

    mealItems.push(buildMealFoodItem(extraFood, grams))
  }

  let adjustedMealItems = [...mealItems]
  let summary = sumMealItems(adjustedMealItems)

   adjustedMealItems = applyPastaMinimumFat({
    items: adjustedMealItems,
    foods: filteredFoodsForSlot,
    slot,
    dateString,
  })
  summary = sumMealItems(adjustedMealItems)
  
  if (Number(targetKcal || 0) > 0 && adjustedMealItems.length > 0) {
    const lowerBound = Number(targetKcal) * 0.92
    const upperBound = Number(targetKcal) * 1.08

    let guard = 0

    while ((summary.kcal < lowerBound || summary.kcal > upperBound) && guard < 12) {
      guard += 1

      const ratio = Number(targetKcal) / Math.max(1, Number(summary.kcal || 0))

      adjustedMealItems = adjustedMealItems.map((item) => {
        const nextGrams = clampNumber(
          Math.round(Number(item.grams || 0) * ratio),
          40,
          260
        )

        return {
          ...item,
          grams: nextGrams,
          kcal: Math.round((Number(item.kcal || 0) / Math.max(1, Number(item.grams || 1))) * nextGrams),
          carbs_g: Math.round((Number(item.carbs_g || 0) / Math.max(1, Number(item.grams || 1))) * nextGrams),
          protein_g: Math.round((Number(item.protein_g || 0) / Math.max(1, Number(item.grams || 1))) * nextGrams),
          fat_g: Math.round((Number(item.fat_g || 0) / Math.max(1, Number(item.grams || 1))) * nextGrams),
          sodium_mg: Math.round((Number(item.sodium_mg || 0) / Math.max(1, Number(item.grams || 1))) * nextGrams),
        }
      })

      summary = sumMealItems(adjustedMealItems)
    }
  }

  const nextUsedIds = [
    ...recentUsedIds,
    ...adjustedMealItems.map((item) => item.food_id).filter(Boolean),
  ].slice(-8)

  const nextSlotUsedNames = [
    ...slotUsedNames,
    ...adjustedMealItems.map((item) => item.name).filter(Boolean),
  ].slice(-8)

  const hasPreferredInMeal = adjustedMealItems.some((item) => preferredSet.has(item.food_id))
  const nextPreferredIncludedCount = preferredIncludedCount + (hasPreferredInMeal ? 1 : 0)

  return {
    items: adjustedMealItems,
    menu: buildMealMenuLabel(adjustedMealItems, slot),
    guide_text: buildMealGuideTextFromItems({
      items: adjustedMealItems,
      slot,
      mealType: currentMealType,
      targetKcal,
    }),
    kcal: Math.round(summary.kcal),
    carbs_g: Math.round(summary.carbs_g),
    protein_g: Math.round(summary.protein_g),
    fat_g: Math.round(summary.fat_g),
    sodium_mg: Math.round(summary.sodium_mg),
    nextUsedIds,
    nextSlotUsedNames,
    nextPreferredIncludedCount,
  }
}

const getRotatingMealExample = (
  goalType,
  slot,
  dayType,
  mealStyleType,
  dateString,
  preferences = {},
  foods = [],
  target = {},
  recentUsedIds = [],
  slotUsedNames = [],
  preferredIncludedCount = 0
) => {
  const preferredSet = preferences.preferredSet || new Set()
  const blockedSet = preferences.blockedSet || new Set()

  return buildSingleMealPlan({
    foods,
    goalType,
    slot,
    dayType,
     mealStyleType,
    dateString,
    preferredSet,
    blockedSet,
    targetCarbs: Number(target.carbs_g || 0),
    targetProtein: Number(target.protein_g || 0),
    targetFat: Number(target.fat_g || 0),
    offset: 0,
    recentUsedIds,
    slotUsedNames,
    preferredIncludedCount,
  })
}

const getMealAlternatives = (
  goalType,
  slot,
  dayType,
  mealStyleType,
  dateString,
  count = 2,
  preferences = {},
  foods = [],
  target = {},
  recentUsedIds = [],
  slotUsedNames = []
) => {
  const preferredSet = preferences.preferredSet || new Set()
  const blockedSet = preferences.blockedSet || new Set()

  const result = []

  for (let i = 1; i <= count; i += 1) {
    const alt = buildSingleMealPlan({
  foods,
  goalType,
  slot,
  dayType,
  mealStyleType,
  dateString,
      preferredSet,
      blockedSet,
      targetCarbs: Number(target.carbs_g || 0),
      targetProtein: Number(target.protein_g || 0),
      targetFat: Number(target.fat_g || 0),
      offset: i + 2,
      recentUsedIds,
      slotUsedNames,
    })

    if (alt?.menu && !result.includes(alt.menu)) {
      result.push(alt.menu)
    }
  }

  return result
}
const getLifestyleMealSlots = (form) => {
  const mealsPerDay = Number(form?.meals_per_day || 3)
  const baseSlots = buildMealSlotsByCount(mealsPerDay)

  const mealStructureMode = String(form?.meal_structure_mode || 'structured')
  const snackFrequency = Number(form?.snack_frequency_per_week || 0)
  const lateNightFrequency = Number(form?.late_night_meal_frequency_per_week || 0)

  let nextSlots = [...baseSlots]

  // 4끼 기본 슬롯(아침/점심/간식/저녁)처럼 이미 간식이 포함된 경우는 유지
  const hasBaseSnackSlot = baseSlots.includes('간식')

  // structured가 아니고, 간식 빈도가 충분할 때만 간식 추가
  if (!hasBaseSnackSlot) {
    if (mealStructureMode !== 'structured' && snackFrequency >= 3) {
      if (!nextSlots.includes('간식')) {
        const dinnerIndex = nextSlots.indexOf('저녁')

        if (dinnerIndex >= 0) {
          nextSlots.splice(dinnerIndex, 0, '간식')
        } else {
          nextSlots.push('간식')
        }
      }
    } else {
      nextSlots = nextSlots.filter((slot) => slot !== '간식')
    }
  }

  // 야식은 조건 만족 시에만 추가, 아니면 제거
  if (lateNightFrequency >= 3) {
    if (!nextSlots.includes('야식')) {
      nextSlots.push('야식')
    }
  } else {
    nextSlots = nextSlots.filter((slot) => slot !== '야식')
  }

  // 중복 제거
  nextSlots = [...new Set(nextSlots)]

  return nextSlots
}

const getLifestyleAdjustedDayPlan = ({
  mealPlanForm,
  isTrainingDay,
  dayType,
  baseKcal,
  totalCarbs,
  totalProtein,
  totalFat,
}) => {
  const dietMode = String(mealPlanForm?.diet_mode || 'balanced')
  const adaptationStrategy = String(mealPlanForm?.adaptation_strategy || 'gradual')
  const currentMealPattern = String(mealPlanForm?.current_meal_pattern || 'mixed')
  const mealStructureMode = String(mealPlanForm?.meal_structure_mode || 'structured')

  let kcal = Number(baseKcal || 0)
  let carbs = Number(totalCarbs || 0)
  let protein = Number(totalProtein || 0)
  let fat = Number(totalFat || 0)

  if (dietMode === 'aggressive') {
    kcal = Math.round(kcal * 0.9)
    carbs = Math.round(carbs * 0.88)
    fat = Math.round(fat * 0.92)
  } else if (dietMode === 'relaxed') {
    kcal = Math.round(kcal * 1.05)
    carbs = Math.round(carbs * 1.05)
    fat = Math.round(fat * 1.05)
  }

  if (adaptationStrategy === 'gradual') {
    kcal = Math.round(kcal * 0.97)
  } else if (adaptationStrategy === 'fast') {
    kcal = Math.round(kcal * 0.93)
    carbs = Math.round(carbs * 0.95)
  }

  if (currentMealPattern === 'mixed') {
    // 유지
  } else if (currentMealPattern === 'outside_often') {
    fat = Math.round(fat * 0.95)
    carbs = Math.round(carbs * 0.97)
  } else if (currentMealPattern === 'late_heavy') {
    carbs = Math.round(carbs * 0.95)
    fat = Math.round(fat * 0.95)
    protein = Math.round(protein * 1.03)
  }

  if (mealStructureMode !== 'structured') {
    carbs = Math.round(carbs * 0.98)
  }

  if (dayType === 'general') {
    kcal = Math.round(kcal * 1.08)
    carbs = Math.round(carbs * 1.08)
    fat = Math.round(fat * 1.08)
  }

  if (dayType === 'free') {
    kcal = Math.round(kcal * 1.15)
    carbs = Math.round(carbs * 1.1)
    fat = Math.round(fat * 1.15)
  }

  if (dayType === 'alcohol') {
    kcal = Math.round(kcal * 1.1)
    carbs = Math.round(carbs * 0.85)
    fat = Math.round(fat * 0.92)
    protein = Math.round(protein * 1.05)
  }

  if (dayType === 'refeed') {
    carbs = Math.round(carbs * 1.2)
    fat = Math.round(fat * 0.9)
  }

  if (isTrainingDay && dayType === 'diet') {
    carbs = Math.round(carbs * 1.05)
  }

  if (!isTrainingDay && dayType === 'diet') {
    carbs = Math.round(carbs * 0.95)
    fat = Math.round(fat * 1.03)
  }

  kcal = Math.max(0, kcal)
  carbs = Math.max(0, carbs)
  protein = Math.max(0, protein)
  fat = Math.max(0, fat)

  return {
    kcal,
    carbs,
    protein,
    fat,
  }
}

  const PLAN_STYLE_META = {
  adaptive: {
    key: 'adaptive',
    label: '적응형 · 일반식 + 식단식',
    summary: '식단 초보자나 적응이 필요한 회원에게 맞는 방식입니다.',
  },
  mixed: {
    key: 'mixed',
    label: '혼합형 · 일반식 + 식단식 + 외식',
    summary: '현실적인 지속 가능성을 우선하는 기본 추천 방식입니다.',
  },
  maintenance: {
    key: 'maintenance',
    label: '유지형 · 일반식 + 외식',
    summary: '체중 유지와 건강 관리를 중심으로 하는 방식입니다.',
  },
  strict: {
    key: 'strict',
    label: '집중형 · 식단식 중심',
    summary: '감량 집중, 바디프로필, 통제 강도가 높은 방식입니다.',
  },
  bulk: {
    key: 'bulk',
    label: '벌크업형 · 근성장 집중',
    summary: '충분한 열량과 탄수화물을 확보하는 기본 벌크업 방식입니다.',
  },
  clean_bulk: {
    key: 'clean_bulk',
    label: '클린 벌크형 · 깔끔한 증량',
    summary: '지방 증가를 너무 크게 가져가지 않으면서 깔끔하게 증량하는 방식입니다.',
  },
  bodybuilding: {
    key: 'bodybuilding',
    label: '보디빌딩형 · 반복 식단 중심',
    summary: '메뉴 다양성보다 반복 가능성과 챙겨먹기 편한 구성에 집중하는 방식입니다.',
  },
  contest_prep: {
    key: 'contest_prep',
    label: '대회준비형 · 초정밀 식단',
    summary: '식단 통제 강도와 반복성을 최대로 높이는 대회 준비용 방식입니다.',
  },
}
  
const buildPlanStyleRecommendation = ({
  mealPlanForm,
  targetKcal = 0,
  goalType = 'diet',
}) => {
  const currentMealPattern = String(mealPlanForm?.current_meal_pattern || 'mixed')
  const mealStructureMode = String(mealPlanForm?.meal_structure_mode || 'structured')
  const adaptationStrategy = String(mealPlanForm?.adaptation_strategy || 'gradual')
 const dietMode = String(mealPlanForm?.diet_mode || 'balanced')
  const snackFrequency = Number(mealPlanForm?.snack_frequency_per_week || 0)
  const breadFrequency = Number(mealPlanForm?.bread_frequency_per_week || 0)
  const junkFrequency = Number(mealPlanForm?.junk_food_frequency_per_week || 0)
  const deliveryFrequency = Number(mealPlanForm?.delivery_food_frequency_per_week || 0)
  const lateNightFrequency = Number(mealPlanForm?.late_night_meal_frequency_per_week || 0)
  const alcoholFrequency = Number(mealPlanForm?.alcohol_frequency_per_week || 0)

  const allowedGeneralMeals = Number(mealPlanForm?.allowed_general_meals_per_week || 0)
  const allowedFreeMeals = Number(mealPlanForm?.allowed_free_meals_per_week || 0)

  const reasons = []
  let recommendedKey = 'mixed'

if (
  adaptationStrategy === 'contest_prep' ||
  dietMode === 'contest' ||
  (
    mealStructureMode === 'structured' &&
    currentMealPattern === 'diet_ready' &&
    allowedGeneralMeals <= 1 &&
    allowedFreeMeals <= 1
  )
) {
  recommendedKey = 'contest_prep'
  reasons.push('대회 준비처럼 식단 통제 강도와 반복성이 매우 높은 상태입니다.')
} else if (
  goalType === 'bulk' &&
  mealStructureMode === 'structured' &&
  currentMealPattern === 'diet_ready'
) {
  recommendedKey = 'bodybuilding'
  reasons.push('벌크업이지만 반복 가능하고 챙겨먹기 쉬운 보디빌딩식 흐름이 더 적합합니다.')
} else if (
  (goalType === 'bulk' || goalType === 'muscle_gain') &&
  Number(targetKcal || 0) >= 2800
) {
  recommendedKey = 'bulk'
  reasons.push('목표 열량이 높고 근성장 목적 비중이 큽니다.')
} else if (
  (goalType === 'bulk' || goalType === 'muscle_gain') &&
  currentMealPattern !== 'general_heavy'
) {
  recommendedKey = 'clean_bulk'
  reasons.push('증량 목표이지만 너무 무거운 외식형보다 깔끔한 증량 흐름이 더 적합합니다.')
} else if (
  goalType === 'maintenance' &&
  (currentMealPattern === 'general_heavy' || deliveryFrequency >= 3 || alcoholFrequency >= 1)
) {
  recommendedKey = 'maintenance'
  reasons.push('체중 유지 목표이며 일반식과 외식 중심 패턴이 뚜렷합니다.')
} else if (
  currentMealPattern === 'general_heavy' ||
  snackFrequency >= 4 ||
  breadFrequency >= 3 ||
  junkFrequency >= 3 ||
  deliveryFrequency >= 3 ||
  lateNightFrequency >= 3 ||
  alcoholFrequency >= 1
) {
  recommendedKey = 'mixed'
  reasons.push('현재 식습관상 일반식과 외식을 완전히 배제하기 어렵습니다.')
} else {
  recommendedKey = 'adaptive'
  reasons.push('식단 적응을 시작하는 단계로 보는 것이 가장 자연스럽습니다.')
}

  if (mealStructureMode === 'performance') {
    reasons.push('운동 수행을 고려해 너무 빡빡한 식단보다 지속 가능한 구성이 유리합니다.')
  }

  if (goalType === 'diet' || goalType === 'recomposition') {
    reasons.push('감량/체형개선 목표라 하더라도 생활패턴을 함께 반영해야 유지율이 올라갑니다.')
  }

  const recommendedMeta = PLAN_STYLE_META[recommendedKey] || PLAN_STYLE_META.mixed

  return {
    recommended_key: recommendedMeta.key,
    recommended_label: recommendedMeta.label,
    summary: recommendedMeta.summary,
    reasons,
    alternatives: Object.values(PLAN_STYLE_META),
  }
}
  
const getRandomDays = (totalDays, count) => {
  const days = Array.from({ length: totalDays }, (_, i) => i)
  const result = []

  while (result.length < count && days.length > 0) {
    const idx = Math.floor(Math.random() * days.length)
    result.push(days.splice(idx, 1)[0])
  }

  return result
}  
  const PLAN_STYLE_ENGINE = {
  adaptive: {
    mealRatio: {
      diet: 0.55,
      general: 0.35,
      eating_out: 0.1,
    },
    kcalOffset: 0,
    label: '적응형 · 일반식 + 식단식',
  },
  mixed: {
    mealRatio: {
      diet: 0.45,
      general: 0.35,
      eating_out: 0.2,
    },
    kcalOffset: 0,
    label: '혼합형 · 일반식 + 식단식 + 외식',
  },
  maintenance: {
    mealRatio: {
      diet: 0.2,
      general: 0.5,
      eating_out: 0.3,
    },
    kcalOffset: 0,
    label: '유지형 · 일반식 + 외식',
  },
  strict: {
    mealRatio: {
      diet: 0.85,
      general: 0.1,
      eating_out: 0.05,
    },
    kcalOffset: -0.03,
    label: '집중형 · 식단식 중심',
  },
  bulk: {
    mealRatio: {
      diet: 0.6,
      general: 0.25,
      eating_out: 0.15,
    },
    kcalOffset: 0.08,
    label: '벌크업형 · 근성장 집중',
  },
  clean_bulk: {
    mealRatio: {
      diet: 0.72,
      general: 0.2,
      eating_out: 0.08,
    },
    kcalOffset: 0.06,
    label: '클린 벌크형 · 깔끔한 증량',
  },
  bodybuilding: {
    mealRatio: {
      diet: 0.88,
      general: 0.08,
      eating_out: 0.04,
    },
    kcalOffset: 0.08,
    label: '보디빌딩형 · 반복 식단 중심',
  },
  contest_prep: {
    mealRatio: {
      diet: 0.95,
      general: 0.04,
      eating_out: 0.01,
    },
    kcalOffset: -0.08,
    label: '대회준비형 · 초정밀 식단',
  },
}
const pickMealStyleType = (ratioConfig = {}) => {
  const dietWeight = Number(ratioConfig.diet || 0)
  const generalWeight = Number(ratioConfig.general || 0)
  const eatingOutWeight = Number(ratioConfig.eating_out || 0)

  const total = dietWeight + generalWeight + eatingOutWeight

  if (total <= 0) return 'diet'

  const randomPoint = Math.random() * total

  if (randomPoint < dietWeight) return 'diet'
  if (randomPoint < dietWeight + generalWeight) return 'general'

  return 'eating_out'
}

const getPlanStyleEngine = (planStyleKey = 'mixed') => {
  return PLAN_STYLE_ENGINE[planStyleKey] || PLAN_STYLE_ENGINE.mixed
}

const getAdjustedTargetKcalByPlanStyle = (baseKcal = 0, planStyleKey = 'mixed') => {
  const engine = getPlanStyleEngine(planStyleKey)
  const offset = Number(engine?.kcalOffset || 0)

  return Math.round(Number(baseKcal || 0) * (1 + offset))
}
const formatRiceGuideText = ({
  adjustedRiceG = 0,
  targetCarbsG = 0,
  largestMealSlot = '',
  currentSlot = '',
  mealStartMode = 'current',
}) => {
  const riceG = Number(adjustedRiceG || 0)
  const carbsG = Number(targetCarbsG || 0)

  if (!riceG && !carbsG) return ''

  const modeLabel =
    mealStartMode === 'slightly_reduce'
      ? '조금 줄여 시작'
      : mealStartMode === 'aggressive_reduce'
      ? '많이 줄여 시작'
      : mealStartMode === 'cycle'
      ? '사이클 조절'
      : '평소 식사량 기준'

  const slotComment =
    largestMealSlot && currentSlot === largestMealSlot
      ? '가장 많이 먹는 끼니 기준으로 반영했습니다.'
      : '끼니별 분배 기준으로 반영했습니다.'

  return `밥 약 ${riceG}g 기준 / 탄수화물 약 ${carbsG}g / ${modeLabel}. ${slotComment}`
}

const formatMealMenuWithRice = ({
  mealResult,
  slot,
  adjustedRiceG = 0,
}) => {
  const baseMenu =
    mealResult?.menu || buildMealMenuLabel(mealResult?.items || [], slot)

  const riceG = Number(adjustedRiceG || 0)
  if (!riceG) return baseMenu

  return `${baseMenu} (밥 약 ${riceG}g 기준)`
}

  const adjustFoodItemsByRiceTarget = ({
  items = [],
  adjustedRiceG = 0,
  slotTarget = {},
}) => {
  const safeItems = Array.isArray(items) ? items : []
  if (!safeItems.length) return []

  const riceG = Number(adjustedRiceG || 0)
  const targetCarbs = Number(slotTarget?.carbs_g || 0)

  return safeItems.map((item, index) => {
    const nextItem = { ...item }
    const itemName = String(
      item?.name ||
      item?.food_name ||
      item?.label ||
      item?.menu ||
      ''
    ).toLowerCase()

    const currentAmount =
      Number(
        item?.amount_g ??
        item?.grams ??
        item?.serving_g ??
        item?.portion_g ??
        0
      ) || 0

    const isCarbSource =
      itemName.includes('밥') ||
      itemName.includes('현미') ||
      itemName.includes('쌀') ||
      itemName.includes('고구마') ||
      itemName.includes('감자') ||
      itemName.includes('오트') ||
      itemName.includes('식빵') ||
      itemName.includes('베이글') ||
      itemName.includes('바나나')

    if (index === 0 && riceG > 0 && (isCarbSource || safeItems.length === 1)) {
      nextItem.amount_g = riceG
      nextItem.adjusted_by_rice_engine = true
      return nextItem
    }

    if (isCarbSource && riceG > 0) {
      nextItem.amount_g = riceG
      nextItem.adjusted_by_rice_engine = true
      return nextItem
    }

    if (!currentAmount && targetCarbs > 0 && index === 0) {
      nextItem.amount_g = Math.round(riceG || targetCarbs * 3.2)
      nextItem.adjusted_by_rice_engine = true
      return nextItem
    }

    return nextItem
  })
}
  const getEffectiveStartingRiceAmount = ({
  usualRiceAmountG = 0,
  mealStartMode = 'current',
  goalType = 'diet',
  isTrainingDay = false,
  dayNumber = 1,
}) => {
  const baseRice = Number(usualRiceAmountG || 0)

  if (!baseRice) return 0

  if (mealStartMode === 'current') {
    if (goalType === 'diet' || goalType === 'recomposition') {
      if (dayNumber <= 7) return baseRice
      if (dayNumber <= 14) return Math.round(baseRice * 0.92)
      if (dayNumber <= 21) return Math.round(baseRice * 0.85)
      return Math.round(baseRice * 0.78)
    }

    if (goalType === 'maintenance') {
      return baseRice
    }

    if (goalType === 'muscle_gain' || goalType === 'bulk') {
      if (dayNumber <= 7) return baseRice
      if (dayNumber <= 14) return Math.round(baseRice * 1.03)
      return Math.round(baseRice * 1.05)
    }

    return baseRice
  }

  if (mealStartMode === 'slightly_reduce') {
    if (goalType === 'diet' || goalType === 'recomposition') {
      if (dayNumber <= 7) return Math.round(baseRice * 0.92)
      if (dayNumber <= 14) return Math.round(baseRice * 0.86)
      return Math.round(baseRice * 0.8)
    }

    return Math.round(baseRice * 0.95)
  }

  if (mealStartMode === 'aggressive_reduce') {
    if (goalType === 'diet' || goalType === 'recomposition') {
      if (dayNumber <= 7) return Math.round(baseRice * 0.85)
      if (dayNumber <= 14) return Math.round(baseRice * 0.78)
      return Math.round(baseRice * 0.72)
    }

    return Math.round(baseRice * 0.85)
  }

  if (mealStartMode === 'cycle') {
    if (goalType === 'diet' || goalType === 'recomposition') {
      return isTrainingDay
        ? Math.round(baseRice * 0.95)
        : Math.round(baseRice * 0.8)
    }

    if (goalType === 'muscle_gain' || goalType === 'bulk') {
      return isTrainingDay
        ? Math.round(baseRice * 1.08)
        : Math.round(baseRice * 0.95)
    }

    return isTrainingDay
      ? baseRice
      : Math.round(baseRice * 0.92)
  }

  return baseRice
}
const calculateMealMacros = (foodItems = []) => {
  const rows = Array.isArray(foodItems) ? foodItems : []

  return rows.reduce(
    (acc, item) => {
      const grams = Number(item?.grams || item?.amount_g || item?.weight_g || 0)

      const directKcal = Number(item?.kcal || 0)
      const directCarbs = Number(item?.carbs_g || 0)
      const directProtein = Number(item?.protein_g || 0)
      const directFat = Number(item?.fat_g || 0)
      const directSodium = Number(item?.sodium_mg || 0)

      const hasDirectMacros =
        directKcal > 0 ||
        directCarbs > 0 ||
        directProtein > 0 ||
        directFat > 0 ||
        directSodium > 0

      if (hasDirectMacros) {
        acc.kcal += directKcal
        acc.carbs_g += directCarbs
        acc.protein_g += directProtein
        acc.fat_g += directFat
        acc.sodium_mg += directSodium
        return acc
      }

      const ratio = grams / 100

      acc.kcal += Number(item?.kcal_per_100g || 0) * ratio
      acc.carbs_g += Number(item?.carbs_per_100g || 0) * ratio
      acc.protein_g += Number(item?.protein_per_100g || 0) * ratio
      acc.fat_g += Number(item?.fat_per_100g || 0) * ratio
      acc.sodium_mg += Number(item?.sodium_mg_per_100g || 0) * ratio

      return acc
    },
    {
      kcal: 0,
      carbs_g: 0,
      protein_g: 0,
      fat_g: 0,
      sodium_mg: 0,
    }
  )
}
  
const buildMealPlanDayRow = ({
  date,
  dayNumber,
  mealPlanForm,
  foods,
  preferredSet,
  blockedSet,
  generationMealSlots,
  trainingDays,
  planStyleEngine,
  adjustedTargetKcal,
  generalMealDaySet,
  freeMealDaySet,
  alcoholDaySet,
  latestCalculationId,
  usual_rice_amount_g,
   largest_meal_slot,
  high_rice_slots,
  meal_start_mode,
  currentAdminId,
}) => {
  const dayIndex = new Date(date).getDay()

  const isTrainingDay =
    trainingDays >= 5
      ? ![0].includes(dayIndex)
      : trainingDays >= 3
      ? [1, 3, 5].includes(dayIndex)
      : [2, 4].includes(dayIndex)

  let dayType = 'diet'
  const currentDayIndex = dayNumber - 1

  if (generalMealDaySet.has(currentDayIndex)) {
    dayType = 'general'
  }

  if (freeMealDaySet.has(currentDayIndex)) {
    dayType = 'free'
  }

  if (alcoholDaySet.has(currentDayIndex)) {
    dayType = 'alcohol'
  }

  const baseCarbs = Number(mealPlanForm.target_carbs_g || 0)
  const baseProtein = Number(mealPlanForm.target_protein_g || 0)
  const baseFat = Number(mealPlanForm.target_fat_g || 0)
const baseSodium = Number(mealPlanForm.target_sodium_mg || 0)
  const slotCount = Math.max(generationMealSlots.length, 1)

let dayRecentUsedIds = []
let daySlotUsedNames = []
let dayPreferredIncludedCount = 0

const mealStyleType = pickMealStyleType(planStyleEngine.mealRatio)

const effectiveTargetKcal = isTrainingDay
  ? adjustedTargetKcal
  : Math.round(adjustedTargetKcal * 0.95)

const adjustedDayPlan = getLifestyleAdjustedDayPlan({
  mealPlanForm,
  isTrainingDay,
  dayType,
  baseKcal: effectiveTargetKcal,
  totalCarbs: baseCarbs,
  totalProtein: baseProtein,
  totalFat: baseFat,
})
const effectiveStartingRiceAmount = getEffectiveStartingRiceAmount({
  usualRiceAmountG: usual_rice_amount_g,
  mealStartMode: meal_start_mode || 'current',
  goalType: mealPlanForm.goal_type || 'diet',
  isTrainingDay,
  dayNumber,
})

const normalizedHighRiceSlots = normalizeHighRiceSlots(
  high_rice_slots,
  generationMealSlots
)

const fixedHighRiceCarbs = getRiceGuide(effectiveStartingRiceAmount).carbs_g

let carbDistribution = getMealCarbDistribution({
  mealSlots: generationMealSlots,
  targetCarbs: adjustedDayPlan.carbs,
  usualRiceAmountG: effectiveStartingRiceAmount,
  largestMealSlot: largest_meal_slot || '저녁',
  mealStartMode: meal_start_mode || 'current',
  goalType: mealPlanForm.goal_type || 'diet',
  isTrainingDay,
})

if (
  meal_start_mode === 'current' &&
  normalizedHighRiceSlots.length > 0 &&
  fixedHighRiceCarbs > 0
) {
  const slotCount = Math.max(generationMealSlots.length, 1)
  const existingMap = new Map(
    (Array.isArray(carbDistribution) ? carbDistribution : []).map((item) => [
      item.slot,
      Number(item.carbs || 0),
    ])
  )

  let remainingCarbs = Number(adjustedDayPlan.carbs || 0)

  normalizedHighRiceSlots.forEach((slot) => {
    remainingCarbs -= fixedHighRiceCarbs
  })

  const nonHighSlots = generationMealSlots.filter(
    (slot) => !normalizedHighRiceSlots.includes(slot)
  )

  const safeRemainingCarbs =
    nonHighSlots.length > 0 ? Math.max(0, remainingCarbs) : Number(adjustedDayPlan.carbs || 0)

  const fallbackPerSlot =
    nonHighSlots.length > 0
      ? Math.floor(safeRemainingCarbs / nonHighSlots.length)
      : 0

  let remainder =
    nonHighSlots.length > 0
      ? safeRemainingCarbs - fallbackPerSlot * nonHighSlots.length
      : 0

  carbDistribution = generationMealSlots.map((slot) => {
    if (normalizedHighRiceSlots.includes(slot)) {
      return {
        slot,
        carbs: fixedHighRiceCarbs,
        adjusted_rice_g: effectiveStartingRiceAmount,
        is_fixed_high_rice: true,
      }
    }

    const baseCarbs =
      existingMap.has(slot) && nonHighSlots.length === 0
        ? Number(existingMap.get(slot) || 0)
        : fallbackPerSlot + (remainder > 0 ? 1 : 0)

    if (remainder > 0) remainder -= 1

    return {
      slot,
      carbs: Math.max(0, Math.round(baseCarbs)),
      adjusted_rice_g: null,
      is_fixed_high_rice: false,
    }
  })
}

    const mealsJson = generationMealSlots.map((slot) => {
    const carbRow =
      carbDistribution.find((item) => item.slot === slot) || null
    const isFixedHighRiceSlot = !!carbRow?.is_fixed_high_rice
    const appliedRiceAmountG = isFixedHighRiceSlot
      ? Number(carbRow?.adjusted_rice_g || effectiveStartingRiceAmount || 0)
      : Number(carbRow?.adjusted_rice_g || 0)
   const slotTarget = {
  carbs_g: Number(carbRow?.carbs || 0),
  protein_g: Math.round(adjustedDayPlan.protein / slotCount),
  fat_g: Math.round(adjustedDayPlan.fat / slotCount),
  sodium_mg: slotCount > 0 ? Math.round(baseSodium / slotCount) : 0,
}
    const mealResult = getRotatingMealExample(
      mealPlanForm.goal_type,
      slot,
      dayType,
      mealStyleType,
      date,
      { preferredSet, blockedSet },
      foods,
      slotTarget,
      dayRecentUsedIds,
      daySlotUsedNames,
      dayPreferredIncludedCount
    )

    dayRecentUsedIds = Array.isArray(mealResult?.nextUsedIds)
      ? mealResult.nextUsedIds
      : dayRecentUsedIds

    daySlotUsedNames = Array.isArray(mealResult?.nextSlotUsedNames)
      ? mealResult.nextSlotUsedNames
      : daySlotUsedNames

    dayPreferredIncludedCount = Number(
      mealResult?.nextPreferredIncludedCount || dayPreferredIncludedCount
    )

    const alternatives = getMealAlternatives(
      mealPlanForm.goal_type,
      slot,
      dayType,
      mealStyleType,
      date,
      2,
      { preferredSet, blockedSet },
      foods,
      slotTarget,
      dayRecentUsedIds,
      daySlotUsedNames
    )

    const adjustedFoodItems = adjustFoodItemsByRiceTarget({
      items: mealResult?.items || [],
      adjustedRiceG: carbRow?.adjusted_rice_g,
      slotTarget,
    })
      const actualMealMacros = calculateMealMacros(adjustedFoodItems)
    return {
      slot,
      meal_style_type: mealStyleType,
      meal_detail_type: mealResult?.meal_detail_type || '',
      guide_text:
        mealResult?.guide_text ||
        formatRiceGuideText({
          adjustedRiceG: carbRow?.adjusted_rice_g,
          targetCarbsG: slotTarget?.carbs_g,
          largestMealSlot: largest_meal_slot,
          currentSlot: slot,
          mealStartMode: meal_start_mode,
        }),
      time:
        slot === '아침'
          ? '08:00'
          : slot === '오전간식'
          ? '10:30'
          : slot === '점심'
          ? '12:30'
          : slot === '운동후'
          ? '16:30'
          : slot === '간식'
          ? '16:30'
          : slot === '야식'
          ? '21:30'
          : '19:30',
              menu: formatMealMenuWithRice({
        mealResult: {
          ...mealResult,
          items: adjustedFoodItems,
          menu: buildMealMenuLabel(adjustedFoodItems, slot),
        },
        slot,
        adjustedRiceG: carbRow?.adjusted_rice_g,
      }),
       
      alternatives,
            food_items: adjustedFoodItems,
carbs_g: Math.round(Number(actualMealMacros.carbs_g || 0)),
protein_g: Math.round(Number(actualMealMacros.protein_g || 0)),
fat_g: Math.round(Number(actualMealMacros.fat_g || 0)),
kcal: Math.round(Number(actualMealMacros.kcal || 0)),
sodium_mg: Math.round(Number(actualMealMacros.sodium_mg || 0)),
      baseline_rice_g: Number(carbRow?.baseline_rice_g || 0),
      adjusted_rice_g: Number(carbRow?.adjusted_rice_g || 0),
      carb_distribution_reason: carbRow?.carb_distribution_reason || '',
      target_carbs_g: Number(slotTarget.carbs_g || 0),
target_protein_g: Number(slotTarget.protein_g || 0),
target_fat_g: Number(slotTarget.fat_g || 0),
target_sodium_mg: Number(slotTarget.sodium_mg || 0),
  
    }
  })

  const rawDayTotals = mealsJson.reduce(
  (acc, meal) => {
    acc.kcal += Number(meal.kcal || 0)
    acc.carbs_g += Number(meal.carbs_g || 0)
    acc.protein_g += Number(meal.protein_g || 0)
    acc.fat_g += Number(meal.fat_g || 0)
    acc.sodium_mg += Number(meal.sodium_mg || 0)
    return acc
  },
  {
    kcal: 0,
    carbs_g: 0,
    protein_g: 0,
    fat_g: 0,
    sodium_mg: 0,
  }
)

const targetDayTotals = {
  kcal: Number(adjustedDayPlan?.kcal || adjustedTargetKcal || mealPlanForm.target_kcal || 0),
  carbs_g: Number(adjustedDayPlan?.carbs || mealPlanForm.target_carbs_g || 0),
  protein_g: Number(adjustedDayPlan?.protein || mealPlanForm.target_protein_g || 0),
  fat_g: Number(adjustedDayPlan?.fat || mealPlanForm.target_fat_g || 0),
  sodium_mg: Number(mealPlanForm.target_sodium_mg || 0),
}

const kcalRatio =
  rawDayTotals.kcal > 0 && targetDayTotals.kcal > 0
    ? targetDayTotals.kcal / rawDayTotals.kcal
    : 1

const carbsRatio =
  rawDayTotals.carbs_g > 0 && targetDayTotals.carbs_g > 0
    ? targetDayTotals.carbs_g / rawDayTotals.carbs_g
    : kcalRatio

const proteinRatio =
  rawDayTotals.protein_g > 0 && targetDayTotals.protein_g > 0
    ? targetDayTotals.protein_g / rawDayTotals.protein_g
    : kcalRatio

const fatRatio =
  rawDayTotals.fat_g > 0 && targetDayTotals.fat_g > 0
    ? targetDayTotals.fat_g / rawDayTotals.fat_g
    : kcalRatio

const correctedMealsJson = mealsJson.map((meal) => {
  const correctedCarbs = Math.max(0, Math.round(Number(meal.carbs_g || 0) * carbsRatio))
  const correctedProtein = Math.max(0, Math.round(Number(meal.protein_g || 0) * proteinRatio))
  const correctedFat = Math.max(0, Math.round(Number(meal.fat_g || 0) * fatRatio))
  const correctedKcal = Math.max(
    0,
    Math.round(
      Number(meal.kcal || 0) * kcalRatio
    )
  )

  return {
    ...meal,
    carbs_g: correctedCarbs,
    protein_g: correctedProtein,
    fat_g: correctedFat,
    kcal: correctedKcal,
  }
})

const actualDayTotals = correctedMealsJson.reduce(
  (acc, meal) => {
    acc.kcal += Number(meal.kcal || 0)
    acc.carbs_g += Number(meal.carbs_g || 0)
    acc.protein_g += Number(meal.protein_g || 0)
    acc.fat_g += Number(meal.fat_g || 0)
    acc.sodium_mg += Number(meal.sodium_mg || 0)
    return acc
  },
  {
    kcal: 0,
    carbs_g: 0,
    protein_g: 0,
    fat_g: 0,
    sodium_mg: 0,
  }
)

const mealsSummaryJson = correctedMealsJson.map((meal) => ({
  slot: meal.slot,
 menu: meal.menu,
applied_rice_g: meal.applied_rice_g || null,
is_high_rice_slot: meal.is_high_rice_slot || false,
  guide_text: meal.guide_text || '',
  meal_detail_type: meal.meal_detail_type || '',
  kcal: meal.kcal,
  carbs_g: meal.carbs_g,
  protein_g: meal.protein_g,
  fat_g: meal.fat_g,
  sodium_mg: meal.sodium_mg,
}))
  return {
    member_id: mealPlanForm.member_id,
    admin_id: currentAdminId || null,
    plan_date: date,
    day_type: dayType,
    total_kcal: Math.round(actualDayTotals.kcal),
total_carbs_g: Math.round(actualDayTotals.carbs_g),
total_protein_g: Math.round(actualDayTotals.protein_g),
total_fat_g: Math.round(actualDayTotals.fat_g),
   meals_json: correctedMealsJson,
    meals_summary_json: mealsSummaryJson,
    coach_memo: mealPlanForm.notes || '',
    checked_slots: [],
    is_checked: false,
    calculation_id: latestCalculationId,
    generation_version: 'v2_food_engine',
  }
}
  
const handleMealPlanMonthGenerate = async () => {
  if (!mealPlanForm.member_id) {
    alert('회원 선택')
    return
  }

  if (!mealPlanForm.target_kcal) {
    alert('먼저 자동 계산을 해주세요')
    return
  }

  let foods = Array.isArray(foodMaster) ? foodMaster : []
  if (!foods.length) {
    foods = await loadFoodMaster()
  }

  if (!foods.length) {
    alert('food_master 데이터가 없습니다.')
    return
  }

  const [year, month] = String(mealPlanMonth || '').split('-').map(Number)

  if (!year || !month) {
    alert('생성 월 확인')
    return
  }

  const daysInMonth = new Date(year, month, 0).getDate()
const generalMealDays = getRandomDays(daysInMonth, Number(mealPlanForm.allowed_general_meals_per_week || 0))
const freeMealDays = getRandomDays(daysInMonth, Number(mealPlanForm.allowed_free_meals_per_week || 0))
const snackDays = getRandomDays(daysInMonth, Number(mealPlanForm.allowed_snacks_per_week || 0))
const alcoholDays = getRandomDays(daysInMonth, Number(mealPlanForm.allowed_alcohol_per_week || 0))

 const alcoholDaySet = new Set(alcoholDays)
const generalMealDaySet = new Set(generalMealDays)
const freeMealDaySet = new Set(freeMealDays)
  
  const mealSlots = buildMealSlotsByCount(mealPlanForm.meals_per_day)
  const trainingDays = Number(mealPlanForm.training_days_per_week || 3)
  const planStyleKey =
    selectedPlanStyle ||
    mealPlanForm.recommended_plan_style ||
    mealPlanRecommendation?.recommended_key ||
    'mixed'

  const planStyleEngine = getPlanStyleEngine(planStyleKey)
  const adjustedTargetKcal = getAdjustedTargetKcalByPlanStyle(
    Number(mealPlanForm.target_kcal || 0),
    planStyleKey
  )
  const { preferredSet, blockedSet } = getPreferredBlockedSet(mealPlanForm, foods)

  let latestCalculationId = null
  const { data: latestCalculation } = await supabase
    .from('member_nutrition_calculations')
    .select('id')
    .eq('member_id', mealPlanForm.member_id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (Array.isArray(latestCalculation) && latestCalculation[0]?.id) {
    latestCalculationId = latestCalculation[0].id
  }

  const rows = []
const generationMealSlots = getLifestyleMealSlots(mealPlanForm)
  const normalizedHighRiceSlots = normalizeHighRiceSlots(
    mealPlanForm.high_rice_slots,
    generationMealSlots
  )
  for (let day = 1; day <= daysInMonth; day += 1) {
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const row = buildMealPlanDayRow({
    date,
    dayNumber: day,
    mealPlanForm,
    foods,
    preferredSet,
    blockedSet,
    generationMealSlots,
    trainingDays,
    planStyleEngine,
    adjustedTargetKcal,
    generalMealDaySet,
    freeMealDaySet,
    alcoholDaySet,
    latestCalculationId,
    currentAdminId,
      usual_rice_amount_g:
    mealPlanForm.rice_amount_source === 'custom'
      ? Number(mealPlanForm.usual_rice_amount_custom_g || 0)
      : Number(mealPlanForm.usual_rice_amount_g || 0),

  largest_meal_slot: mealPlanForm.largest_meal_slot || '저녁',
       high_rice_slots: normalizedHighRiceSlots,
  meal_start_mode: mealPlanForm.meal_start_mode || 'current',
  })

  rows.push(row)
}

  const { error } = await supabase
    .from('member_meal_plans')
    .upsert(rows, { onConflict: 'member_id,plan_date' })

 if (error) {
  console.error('월간 식단 생성 실패:', error)
  alert(`월간 식단 생성 실패: ${error.message}`)
  return
}

  const { error: profileVersionError } = await supabase
    .from('member_nutrition_profiles')
    .update({
      recommendation_version: 'v2_food_engine',
    })
    .eq('member_id', mealPlanForm.member_id)

  if (profileVersionError) {
    console.error('recommendation_version 업데이트 실패:', profileVersionError)
  }

  const { data: planData, error: loadError } = await supabase
    .from('member_meal_plans')
    .select('*')
    .eq('member_id', mealPlanForm.member_id)
    .gte('plan_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lte('plan_date', `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`)
    .order('plan_date', { ascending: true })

  if (loadError) {
    console.error('생성 후 식단 목록 불러오기 실패:', loadError)
    alert('생성은 되었지만 목록 불러오기 실패')
    return
  }

  setMemberMealPlans(planData || [])
  alert('월간 식단 생성 완료')
}
  
  useEffect(() => {
  if (!mealPlanForm.member_id) return
  loadMemberMealPlanProfile(mealPlanForm.member_id)
}, [mealPlanForm.member_id])

useEffect(() => {
  loadFoodMaster()
}, [])
  
useEffect(() => {
  if (!mealPlanForm.member_id || !mealPlanViewMonth) return
  loadMealPlansByMonth(mealPlanForm.member_id, mealPlanViewMonth)
}, [mealPlanForm.member_id, mealPlanViewMonth])
  
useEffect(() => {
  setMealPlanForm((prev) => {
    const nextMealSlots = getLifestyleMealSlots({
      ...prev,
      meals_per_day: Number(prev.meals_per_day || 3),
    })

    return {
      ...prev,
      meal_slots: nextMealSlots,
      high_rice_slots: normalizeHighRiceSlots(prev.high_rice_slots, nextMealSlots),
    }
  })
}, [mealPlanForm.meals_per_day])
  
  const loadMealPlansByMonth = async (memberId, monthValue) => {
  if (!memberId || !monthValue) {
    setMemberMealPlans([])
    return
  }

  const [year, month] = String(monthValue).split('-').map(Number)
  if (!year || !month) {
    setMemberMealPlans([])
    return
  }

  const lastDay = new Date(year, month, 0).getDate()

  const { data, error } = await supabase
    .from('member_meal_plans')
    .select('*')
    .eq('member_id', memberId)
    .gte('plan_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lte('plan_date', `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`)
    .order('plan_date', { ascending: true })

  if (error) {
    console.error('월별 식단 불러오기 실패:', error)
    alert('월별 식단 불러오기 실패')
    return
  }

  setMemberMealPlans(data || [])
}
const loadMealComplianceByMonth = async (memberId, monthValue) => {
  if (!memberId || !monthValue) {
    setMemberMealCompliancePlans([])
    return
  }

  const [year, month] = String(monthValue).split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()

  const { data, error } = await supabase
    .from('member_meal_plans')
    .select('*')
    .eq('member_id', memberId)
    .gte('plan_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lte('plan_date', `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`)
    .order('plan_date', { ascending: true })

  if (error) {
    console.error('회원 식단 수행률 불러오기 실패:', error)
    alert('회원 식단 수행률 불러오기 실패')
    return
  }

  setMemberMealCompliancePlans(data || [])
}
  useEffect(() => {
  if (!mealPlanForm.member_id || !mealComplianceMonth) return
  loadMealComplianceByMonth(mealPlanForm.member_id, mealComplianceMonth)
}, [mealPlanForm.member_id, mealComplianceMonth])

  
  const getAdminMealPlanProgress = (plan) => {
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
const getMealDayTypeLabel = (dayType = '') => {
  const value = String(dayType || '').trim()

  const labelMap = {
    diet: '기본 식단일',
    general: '일반식 허용일',
    free: '자유식 허용일',
    alcohol: '음주 허용일',
    training: '훈련일',
    rest: '휴식일',
  }

  return labelMap[value] || value || '-'
}
  
const handleMealPlanDelete = async (planId) => {
  if (!window.confirm('이 날짜 식단을 삭제할까요?')) return

  const { error } = await supabase
    .from('member_meal_plans')
    .delete()
    .eq('id', planId)

  if (error) {
    console.error('식단 삭제 실패:', error)
    alert('식단 삭제 실패')
    return
  }

  setMemberMealPlans((prev) => prev.filter((item) => item.id !== planId))
}

const handleMealPlanDeleteMonth = async () => {
  if (!mealPlanForm.member_id || !mealPlanViewMonth) {
    alert('회원과 조회 월을 확인해주세요')
    return
  }

  if (!window.confirm(`${mealPlanViewMonth} 월 식단을 전체 삭제할까요?`)) return

  const [year, month] = String(mealPlanViewMonth).split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()

  const { error } = await supabase
    .from('member_meal_plans')
    .delete()
    .eq('member_id', mealPlanForm.member_id)
    .gte('plan_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lte('plan_date', `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`)

  if (error) {
    console.error('월 전체 식단 삭제 실패:', error)
    alert('월 전체 식단 삭제 실패')
    return
  }

  setMemberMealPlans([])
  alert('월 전체 식단 삭제 완료')
}

const handleMealPlanEditStart = (plan) => {
  setEditingMealPlanId(plan.id)
  setMealPlanEditMeals(
    Array.isArray(plan.meals_json)
      ? plan.meals_json.map((meal) => ({
          ...meal,
          slot: meal.slot || '',
          menu: meal.menu || '',
        }))
      : []
  )
}

const updateMealPlanEditMeal = (index, value) => {
  setMealPlanEditMeals((prev) =>
    prev.map((meal, idx) =>
      idx === index
        ? { ...meal, menu: value }
        : meal
    )
  )
}

const handleMealPlanEditCancel = () => {
  setEditingMealPlanId(null)
  setMealPlanEditMeals([])
}
const toggleMealPlannerAdminSection = (key) => {
  setMealPlannerAdminSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}
const handleMealPlanUpdate = async (plan) => {
  const nextMeals = Array.isArray(mealPlanEditMeals) ? mealPlanEditMeals : []

  const { error } = await supabase
    .from('member_meal_plans')
    .update({
      meals_json: nextMeals,
    })
    .eq('id', plan.id)

  if (error) {
    console.error('식단 수정 저장 실패:', error)
    alert('식단 수정 저장 실패')
    return
  }

  setMemberMealPlans((prev) =>
    prev.map((item) =>
      item.id === plan.id
        ? { ...item, meals_json: nextMeals }
        : item
    )
  )

  setEditingMealPlanId(null)
  setMealPlanEditMeals([])
  alert('식단 수정 저장 완료')
}
  const filteredFoodMaster = useMemo(() => {
  const keyword = String(foodMasterSearch || '').trim().toLowerCase()

  const rows = Array.isArray(foodMaster) ? foodMaster : []

  if (!keyword) {
  return []
}

  return rows.filter((food) => {
    const aliases = Array.isArray(food.aliases) ? food.aliases.join(' ') : ''
    const tags = Array.isArray(food.tags) ? food.tags.join(' ') : ''

    const searchText = [
      food.name,
      food.category_major,
      food.category_minor,
      aliases,
      tags,
      food.note,
    ]
      .map((item) => String(item || '').toLowerCase())
      .join(' ')

    return searchText.includes(keyword)
  })
}, [foodMaster, foodMasterSearch])

  const splitCommaWords = (value) => {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const getLastCommaKeyword = (value) => {
  const parts = String(value || '').split(',')
  return String(parts[parts.length - 1] || '').trim().toLowerCase()
}

const getFoodSuggestionScore = (food, keyword) => {
  if (!keyword) return 0

  const name = String(food?.name || '').toLowerCase()
  const aliases = Array.isArray(food?.aliases)
    ? food.aliases.map((item) => String(item || '').toLowerCase())
    : []

  let score = 0

  if (name === keyword) score += 100
  if (name.startsWith(keyword)) score += 50
  if (name.includes(keyword)) score += 25

  aliases.forEach((alias) => {
    if (alias === keyword) score += 80
    else if (alias.startsWith(keyword)) score += 40
    else if (alias.includes(keyword)) score += 20
  })

  return score
}

const getFoodSuggestionsForInput = (rawValue, foods = []) => {
  const keyword = getLastCommaKeyword(rawValue)

  if (!keyword) return []

  const selectedWords = splitCommaWords(rawValue)
    .slice(0, -1)
    .map((item) => item.toLowerCase())

  const selectedSet = new Set(selectedWords)

  return (Array.isArray(foods) ? foods : [])
    .map((food) => ({
      food,
      score: getFoodSuggestionScore(food, keyword),
    }))
    .filter(({ food, score }) => {
      if (score <= 0) return false
      return !selectedSet.has(String(food?.name || '').toLowerCase())
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score
      return String(a.food?.name || '').localeCompare(String(b.food?.name || ''), 'ko-KR')
    })
    .slice(0, 8)
    .map(({ food }) => food)
}

const replaceLastCommaWord = (rawValue, nextWord) => {
  const parts = String(rawValue || '').split(',')

  if (parts.length === 0) return nextWord

  parts[parts.length - 1] = nextWord

  return parts
    .map((item) => String(item || '').trim())
    .filter((item, index, arr) => !(item === '' && index < arr.length - 1))
    .join(', ')
}

const applyFoodSuggestionToField = (fieldName, foodName) => {
  setMealPlanForm((prev) => ({
    ...prev,
    [fieldName]: replaceLastCommaWord(prev[fieldName], foodName),
  }))
}
const handleFoodMasterFormChange = (field, value) => {
  setFoodMasterForm((prev) => ({
    ...prev,
    [field]: value,
  }))
}
  const handleFoodMasterEditStart = (food) => {
  setEditingFoodMasterId(food.id)
  setFoodMasterSubmittingMode('edit')
  setShowFoodMasterPanel(true)

  setFoodMasterForm({
    name: food.name || '',
    aliases: Array.isArray(food.aliases) ? food.aliases.join(', ') : '',
    category_major: food.category_major || 'protein',
    category_minor: food.category_minor || '',
    source_type: food.source_type || 'animal',
    kcal_per_100g: food.kcal_per_100g || '',
    carbs_per_100g: food.carbs_per_100g || '',
    protein_per_100g: food.protein_per_100g || '',
    fat_per_100g: food.fat_per_100g || '',
    saturated_fat_per_100g: food.saturated_fat_per_100g || '',
    unsaturated_fat_per_100g: food.unsaturated_fat_per_100g || '',
    sugar_per_100g: food.sugar_per_100g || '',
    fiber_per_100g: food.fiber_per_100g || '',
    sodium_mg_per_100g: food.sodium_mg_per_100g || '',
    typical_portion_g: food.typical_portion_g || '',
    tags: Array.isArray(food.tags) ? food.tags.join(', ') : '',
    note: food.note || '',
  })
}
  const handleFoodMasterCancelEdit = () => {
  setEditingFoodMasterId(null)
  setFoodMasterSubmittingMode('create')
  setFoodMasterForm(emptyFoodMasterForm)
}
  
  const preferredFoodSuggestions = useMemo(() => {
  return getFoodSuggestionsForInput(mealPlanForm.preferred_foods, foodMaster)
}, [mealPlanForm.preferred_foods, foodMaster])

const excludedFoodSuggestions = useMemo(() => {
  return getFoodSuggestionsForInput(mealPlanForm.excluded_foods, foodMaster)
}, [mealPlanForm.excluded_foods, foodMaster])

const allergyFoodSuggestions = useMemo(() => {
  return getFoodSuggestionsForInput(mealPlanForm.allergies, foodMaster)
}, [mealPlanForm.allergies, foodMaster])
  
const managerScoreCards = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)

    const monthlySales = salesRecords.filter(
      (item) => (item.sale_date || '').slice(0, 7) === currentMonth
    )

    const totalSales = monthlySales.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    )

    const salesGoal = Number(managerGoalSettings?.sales_goal || 5000000)

    const endingMembers = members.filter((member) => {
      const remaining =
        Number(member.total_sessions || 0) - Number(member.used_sessions || 0)
      return remaining > 0 && remaining <= 5
    })

    const monthlyOtCount = salesLogs.filter((item) => {
      const isCurrentMonth = (item.log_date || '').slice(0, 7) === currentMonth
      return isCurrentMonth && !!item.ot_reason
    }).length

    const monthlyContentCount = managerActionLogs.filter((item) => {
      const isCurrentMonth = (item.action_date || '').slice(0, 7) === currentMonth
      return (
        isCurrentMonth &&
        ['blog_post', 'reel_upload', 'marketing_post', 'webapp_promo'].includes(item.action_type)
      )
    }).length

    const reofferGoal = Number(managerGoalSettings?.reoffer_goal || 3)
    const contentGoal =
      Number(managerGoalSettings?.blog_goal || 4) +
      Number(managerGoalSettings?.reel_goal || 4)

    return [
      {
        label: '매출',
        value: `${totalSales.toLocaleString()}원`,
        sub: `목표 ${salesGoal.toLocaleString()}원`,
        percent: salesGoal > 0 ? Math.min(100, Math.round((totalSales / salesGoal) * 100)) : 0,
      },
      {
        label: '재등록 후보',
        value: `${endingMembers.length}명`,
        sub: `목표 ${reofferGoal}명 제안`,
        percent: reofferGoal > 0
          ? Math.min(100, Math.round((endingMembers.length / reofferGoal) * 100))
          : 0,
      },
      {
        label: '신규 OT',
        value: `${monthlyOtCount}명`,
        sub: '이번 달 OT 기록 기준',
        percent: Math.min(100, monthlyOtCount * 10),
      },
      {
        label: '콘텐츠 발행',
        value: `${monthlyContentCount}개`,
        sub: `목표 ${contentGoal}개`,
        percent: contentGoal > 0
          ? Math.min(100, Math.round((monthlyContentCount / contentGoal) * 100))
          : 0,
      },
    ]
  }, [salesRecords, members, salesLogs, managerActionLogs, managerGoalSettings])

  const managerMissions = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)

    const blogCount = managerActionLogs.filter(
      (item) =>
        (item.action_date || '').slice(0, 7) === currentMonth &&
        item.action_type === 'blog_post'
    ).length

    const reelCount = managerActionLogs.filter(
      (item) =>
        (item.action_date || '').slice(0, 7) === currentMonth &&
        item.action_type === 'reel_upload'
    ).length

    const promoCount = managerActionLogs.filter(
      (item) =>
        (item.action_date || '').slice(0, 7) === currentMonth &&
        item.action_type === 'webapp_promo'
    ).length

    const reviewCount = managerActionLogs.filter(
      (item) =>
        (item.action_date || '').slice(0, 7) === currentMonth &&
        item.action_type === 'review_uploaded'
    ).length

    return [
      {
        title: '블로그 발행',
        progress: `${blogCount} / ${Number(managerGoalSettings?.blog_goal || 4)}`,
        reward: '+200XP',
      },
      {
        title: '릴스 업로드',
        progress: `${reelCount} / ${Number(managerGoalSettings?.reel_goal || 4)}`,
        reward: '+200XP',
      },
      {
        title: '웹앱 홍보 실행',
        progress: `${promoCount} / ${Number(managerGoalSettings?.promo_goal || 3)}`,
        reward: '+250XP',
      },
      {
        title: '후기 업로드 확보',
        progress: `${reviewCount} / ${Number(managerGoalSettings?.review_goal || 2)}`,
        reward: '+300XP',
      },
    ]
  }, [managerActionLogs, managerGoalSettings])
  const managerTasks = useMemo(() => {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const riskMembers = members.filter((member) => {
    const memberWorkouts = workouts.filter((workout) => workout.member_id === member.id)

    if (memberWorkouts.length === 0) return true

    const latestWorkoutDate = memberWorkouts
      .map((workout) => workout.workout_date)
      .filter(Boolean)
      .sort()
      .reverse()[0]

    if (!latestWorkoutDate) return true

    const diffDays = Math.floor(
      (today - new Date(latestWorkoutDate)) / (1000 * 60 * 60 * 24)
    )

    return diffDays >= 7
  })

  const reofferMembers = members.filter((member) => {
    const remaining =
      Number(member.total_sessions || 0) - Number(member.used_sessions || 0)

    return remaining > 0 && remaining <= 5
  })

  const dietRiskMembers = members.filter((member) => {
    const memberDietLogs = dietLogs.filter((diet) => diet.member_id === member.id)

    if (memberDietLogs.length === 0) return true

    const latestDietDate = memberDietLogs
      .map((diet) => diet.log_date)
      .filter(Boolean)
      .sort()
      .reverse()[0]

    if (!latestDietDate) return true

    const diffDays = Math.floor(
      (today - new Date(latestDietDate)) / (1000 * 60 * 60 * 24)
    )

    return diffDays >= 5
  })

  const pendingInquiries = inquiries.filter((item) => {
    const status = item.status || ''
    return status !== 'answered' && status !== 'done'
  })

  return [
    {
      category: '긴급',
      title: `이탈 위험 회원 ${riskMembers.length}명 연락하기`,
      description: '7일 이상 운동기록이 없는 회원부터 먼저 확인해보세요.',
      due: '오늘',
      action: '시작하기',
      actionKey: 'go_members',
    },
    {
      category: '매출',
      title: `재등록 제안 대상 ${reofferMembers.length}명 확인하기`,
      description: '잔여 세션이 적은 회원부터 재등록 흐름을 잡아야 합니다.',
      due: '오늘',
      action: '시작하기',
      actionKey: 'go_sales',
    },
    {
      category: '식단',
      title: `식단 기록 점검 대상 ${dietRiskMembers.length}명 확인하기`,
      description: '식단 로그가 끊긴 회원은 생활관리 연결이 약해졌을 가능성이 큽니다.',
      due: '오늘',
      action: '시작하기',
      actionKey: 'go_diet',
    },
    {
      category: '문의',
      title: `미답변 문의 ${pendingInquiries.length}건 확인하기`,
      description: '응답이 늦어질수록 상담 전환률이 떨어질 수 있습니다.',
      due: '오늘',
      action: '시작하기',
      actionKey: 'go_inquiries',
    },
    {
      category: '마케팅',
      title: '블로그 글 1개 발행하기',
      description: '실행 로그 입력으로 바로 이동해서 오늘 콘텐츠를 기록하세요.',
      due: '오늘',
      action: '시작하기',
      actionKey: 'log_blog',
    },
    {
      category: '콘텐츠',
      title: '릴스 1개 업로드하기',
      description: '오늘 올릴 릴스를 실행 로그에 바로 기록하세요.',
      due: '오늘',
      action: '시작하기',
      actionKey: 'log_reel',
    },
  ]
}, [members, workouts, dietLogs, inquiries])
  const managerInsights = useMemo(() => {
  const currentMonth = new Date().toISOString().slice(0, 7)

  const monthlySales = salesRecords.filter(
    (item) => (item.sale_date || '').slice(0, 7) === currentMonth
  )

  const totalSales = monthlySales.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )

  const salesGoal = Number(managerGoalSettings?.sales_goal || 5000000)

  const riskMembers = members.filter((member) => {
    const memberWorkouts = workouts.filter((workout) => workout.member_id === member.id)

    if (memberWorkouts.length === 0) return true

    const latestWorkoutDate = memberWorkouts
      .map((workout) => workout.workout_date)
      .filter(Boolean)
      .sort()
      .reverse()[0]

    if (!latestWorkoutDate) return true

    const diffDays = Math.floor(
      (new Date() - new Date(latestWorkoutDate)) / (1000 * 60 * 60 * 24)
    )

    return diffDays >= 7
  })

  const dietRiskMembers = members.filter((member) => {
    const memberDietLogs = dietLogs.filter((diet) => diet.member_id === member.id)

    if (memberDietLogs.length === 0) return true

    const latestDietDate = memberDietLogs
      .map((diet) => diet.log_date)
      .filter(Boolean)
      .sort()
      .reverse()[0]

    if (!latestDietDate) return true

    const diffDays = Math.floor(
      (new Date() - new Date(latestDietDate)) / (1000 * 60 * 60 * 24)
    )

    return diffDays >= 5
  })

  const monthlyContentCount = managerActionLogs.filter(
    (item) =>
      (item.action_date || '').slice(0, 7) === currentMonth &&
      ['blog_post', 'reel_upload', 'marketing_post', 'webapp_promo'].includes(item.action_type)
  ).length

  const reofferMembers = members.filter((member) => {
    const remaining =
      Number(member.total_sessions || 0) - Number(member.used_sessions || 0)

    return remaining > 0 && remaining <= 5
  })

  const pendingInquiries = inquiries.filter((item) => {
    const status = item.status || ''
    return status !== 'answered' && status !== 'done'
  })

  return [
    {
      title: 'AI 매니저 코멘트',
      text:
        riskMembers.length >= 3
          ? `지금은 신규보다 기존 회원 관리가 먼저입니다. 이탈 위험 회원이 ${riskMembers.length}명 보여요.`
          : '지금은 관리보다 흐름을 만드는 시기예요. 회원에게 메시지를 주고 콘텐츠로 당신의 철학을 보여주세요.',
    },
    {
      title: '회원 관리 인사이트',
      text:
        dietRiskMembers.length >= 3
          ? `식단 기록이 끊긴 회원이 ${dietRiskMembers.length}명 있습니다. 운동보다 생활관리 연결부터 다시 잡아야 합니다.`
          : `이탈 위험 회원이 ${riskMembers.length}명 보여요. 지금 관심을 보여줄 타이밍입니다.`,
    },
    {
      title: '매출 인사이트',
      text:
        totalSales < salesGoal * 0.5
          ? `이번 달 매출은 목표 대비 아직 약합니다. 재등록 후보 ${reofferMembers.length}명부터 우선 접촉하세요.`
          : `이번 달 매출 흐름은 나쁘지 않습니다. 재등록 후보 ${reofferMembers.length}명만 잘 연결해도 분위기를 더 끌어올릴 수 있어요.`,
    },
    {
      title: '마케팅 인사이트',
      text:
        monthlyContentCount === 0
          ? '이번 달 콘텐츠 실행 로그가 아직 없습니다. 실력이 있어도 노출이 멈추면 기회가 줄어듭니다.'
          : `이번 달 콘텐츠 실행 로그가 ${monthlyContentCount}개 있습니다. 이제는 양보다 반응 좋은 주제를 반복하는 게 중요합니다.`,
    },
    {
      title: '오늘의 추천 행동',
      text:
        pendingInquiries.length > 0
          ? `미답변 문의 ${pendingInquiries.length}건부터 먼저 확인하세요. 응답 속도가 전환률에 직접 영향을 줍니다.`
          : monthlyContentCount === 0
          ? '오늘은 블로그나 릴스 중 하나를 꼭 올려보세요. 실행 로그 1개가 흐름을 바꾸기 시작합니다.'
          : '오늘은 회원 후기나 피드백 콘텐츠 하나를 정리해보세요. 진짜 사례가 가장 강한 광고입니다.',
    },
  ]
}, [members, workouts, dietLogs, inquiries, salesRecords, managerGoalSettings, managerActionLogs])
 const todayTaskDate = new Date().toISOString().slice(0, 10)

const completedTaskKeysToday = useMemo(() => {
  return managerTaskChecks
    .filter(
      (item) =>
        item.task_date === todayTaskDate &&
        item.is_completed === true
    )
    .map((item) => item.task_key)
}, [managerTaskChecks, todayTaskDate])
  
 const DEFAULT_TRAINER_LEVELS = [
  { key: 'beginner_3', name: '초보 트레이너 3급', minXp: 0, description: '기록 습관과 기본 운영 감각을 만드는 단계입니다.' },
  { key: 'beginner_2', name: '초보 트레이너 2급', minXp: 500, description: '기본 회원 관리와 실행 습관이 자리를 잡기 시작한 단계입니다.' },
  { key: 'beginner_1', name: '초보 트레이너 1급', minXp: 1000, description: '수업 외에도 콘텐츠와 운영 흐름을 보기 시작한 단계입니다.' },

  { key: 'intermediate_3', name: '중급 트레이너 3급', minXp: 2000, description: '회원 유지와 재등록 흐름을 함께 관리하기 시작한 단계입니다.' },
  { key: 'intermediate_2', name: '중급 트레이너 2급', minXp: 4000, description: '매출과 실행 로그가 함께 쌓이며 운영 감각이 커지는 단계입니다.' },
  { key: 'intermediate_1', name: '중급 트레이너 1급', minXp: 7000, description: '회원관리, 콘텐츠, 운영 흐름을 연결해서 보는 단계입니다.' },

  { key: 'master_3', name: '마스터 트레이너 3급', minXp: 12000, description: '브랜딩과 운영 성과가 눈에 띄게 쌓이기 시작한 단계입니다.' },
  { key: 'master_2', name: '마스터 트레이너 2급', minXp: 20000, description: '반복 가능한 운영 패턴과 콘텐츠 자산이 생기는 단계입니다.' },
  { key: 'master_1', name: '마스터 트레이너 1급', minXp: 30000, description: '창업 또는 독립 운영을 준비해볼 수 있는 수준입니다.' },

  { key: 'director', name: '대표 트레이너', minXp: 50000, description: '창업을 시도하거나 팀/브랜드를 이끌 준비가 된 단계입니다.' },
]
  const trainerLevels = useMemo(() => {
  if (!trainerLevelSettings.length) {
    return DEFAULT_TRAINER_LEVELS
  }

  return DEFAULT_TRAINER_LEVELS.map((defaultLevel) => {
    const matched = trainerLevelSettings.find(
      (item) => item.level_key === defaultLevel.key
    )

    if (!matched) return defaultLevel

    return {
      ...defaultLevel,
      name: matched.level_name || defaultLevel.name,
      minXp: Number(matched.min_xp ?? defaultLevel.minXp),
      description: matched.description || defaultLevel.description,
    }
  }).sort((a, b) => a.minXp - b.minXp)
}, [trainerLevelSettings])
  const trainerLevelSummary = useMemo(() => {
  const currentMonth = new Date().toISOString().slice(0, 7)

  const careerXp =
    Number(careerProfileForm.career_years || 0) * 120 +
    Number(careerProfileForm.total_blog_posts || 0) * 2 +
    Number(careerProfileForm.total_instagram_posts || 0) * 1 +
    Number(careerProfileForm.total_blog_reviewnote_campaigns || 0) * 15 +
    Number(careerProfileForm.total_instagram_campaigns || 0) * 15 +
    Math.floor(Number(careerProfileForm.total_classes || 0) / 100) * 30 +
    Math.floor(Number(careerProfileForm.total_consultations || 0) / 50) * 20 +
    Number(careerProfileForm.total_certifications || 0) * 25 +
    Number(careerProfileForm.total_collaborations || 0) * 20

  const actionXp = managerActionLogs.reduce((sum, log) => {
    const actionMap = {
      blog_post: 20,
      reel_upload: 20,
      webapp_promo: 25,
      review_uploaded: 30,
      marketing_post: 15,
    }

    return sum + Number(actionMap[log.action_type] || 0)
  }, 0)

  const taskXp =
    managerTaskChecks.filter((item) => item.is_completed === true).length * 10

  const currentMonthActionXp = managerActionLogs
    .filter((log) => (log.action_date || '').slice(0, 7) === currentMonth)
    .reduce((sum, log) => {
      const actionMap = {
        blog_post: 20,
        reel_upload: 20,
        webapp_promo: 25,
        review_uploaded: 30,
        marketing_post: 15,
      }

      return sum + Number(actionMap[log.action_type] || 0)
    }, 0)

  const totalXp = careerXp + actionXp + taskXp

  let currentLevel = trainerLevels[0]
  let nextLevel = null

  for (let i = 0; i < trainerLevels.length; i += 1) {
  const level = trainerLevels[i]
  const next = trainerLevels[i + 1] || null

    if (totalXp >= level.minXp) {
      currentLevel = level
      nextLevel = next
    }
  }

  const currentLevelBaseXp = currentLevel.minXp
  const nextLevelXp = nextLevel ? nextLevel.minXp : currentLevel.minXp
  const progressRange = Math.max(1, nextLevelXp - currentLevelBaseXp)
  const progressValue = nextLevel
    ? totalXp - currentLevelBaseXp
    : progressRange

  const progressPercent = nextLevel
    ? Math.min(100, Math.round((progressValue / progressRange) * 100))
    : 100

  const xpToNextLevel = nextLevel
    ? Math.max(0, nextLevel.minXp - totalXp)
    : 0

  return {
    totalXp,
    careerXp,
    actionXp,
    taskXp,
    currentMonthActionXp,
    currentLevel,
    nextLevel,
    progressPercent,
    xpToNextLevel,
  }
}, [careerProfileForm, managerActionLogs, managerTaskChecks, trainerLevels])
  const startupReadiness = useMemo(() => {
  const careerYears = Number(careerProfileForm.career_years || 0)
  const blog = Number(careerProfileForm.total_blog_posts || 0)
  const insta = Number(careerProfileForm.total_instagram_posts || 0)
  const classes = Number(careerProfileForm.total_classes || 0)
  const consult = Number(careerProfileForm.total_consultations || 0)
  const cert = Number(careerProfileForm.total_certifications || 0)
  const collab = Number(careerProfileForm.total_collaborations || 0)
  const actions = managerActionLogs.length
  const tasks = managerTaskChecks.filter(t => t.is_completed).length

  const score =
    careerYears * 5 +
    blog * 0.2 +
    insta * 0.1 +
    classes * 0.01 +
    consult * 0.02 +
    cert * 3 +
    collab * 2 +
    actions * 1 +
    tasks * 1

  const percent = Math.min(100, Math.round(score))

  const strengths = []
  const 부족 = []

  if (classes >= 3000) strengths.push('수업 경험')
  else 부족.push('수업 경험')

  if (blog >= 30) strengths.push('블로그')
  else 부족.push('블로그')

  if (insta >= 100) strengths.push('인스타')
  else 부족.push('인스타')

  if (consult >= 200) strengths.push('상담 경험')
  else 부족.push('상담 경험')

  if (cert >= 3) strengths.push('전문성')
  else 부족.push('자격증')

  let message = ''
  if (percent >= 80) {
    message = '창업을 시도해도 좋은 단계입니다.'
  } else if (percent >= 60) {
    message = '운영 구조를 조금 더 다듬으면 창업 가능합니다.'
  } else {
    message = '아직은 경험을 더 쌓는 것이 중요합니다.'
  }

  return {
    percent,
    strengths,
    부족,
    message,
  }
}, [careerProfileForm, managerActionLogs, managerTaskChecks])
  const recentXpLogs = useMemo(() => {
  const actionTypeLabelMap = {
    blog_post: '블로그 발행',
    reel_upload: '릴스 업로드',
    webapp_promo: '웹앱 홍보',
    review_uploaded: '후기 업로드',
    marketing_post: '마케팅 글 작성',
  }

  const actionXpMap = {
    blog_post: 20,
    reel_upload: 20,
    webapp_promo: 25,
    review_uploaded: 30,
    marketing_post: 15,
  }

  const actionLogs = (managerActionLogs || []).map((log) => ({
    id: `action-${log.id}`,
    date: log.action_date || log.created_at || '',
    title: actionTypeLabelMap[log.action_type] || '실행 로그',
    xp: Number(actionXpMap[log.action_type] || 0),
    description: log.title || log.description || log.channel || '-',
    sourceType: 'action',
  }))

  const taskLogs = (managerTaskChecks || [])
    .filter((item) => item.is_completed === true)
    .map((item) => ({
      id: `task-${item.id}`,
      date: item.task_date || item.completed_at || '',
      title: '과제 완료',
      xp: 10,
      description: item.memo || item.task_key || '-',
      sourceType: 'task',
    }))

  return [...actionLogs, ...taskLogs]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 10)
}, [managerActionLogs, managerTaskChecks])
  const trainerLevelRoadmap = useMemo(() => {
  return trainerLevels.map((level, index) => {
  const nextLevel = trainerLevels[index + 1] || null
    const isCurrent = level.key === trainerLevelSummary.currentLevel.key
    const isPassed = trainerLevelSummary.totalXp >= level.minXp
    const xpNeeded = Math.max(0, level.minXp - trainerLevelSummary.totalXp)

    return {
      ...level,
      nextLevelName: nextLevel ? nextLevel.name : null,
      isCurrent,
      isPassed,
      xpNeeded,
    }
  })
}, [trainerLevelSummary, trainerLevels])
  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) || null,
    [members, selectedMemberId],
  )
  const trimmedMemberDetailSearch = String(memberDetailSearch || '').trim().toLowerCase()

const filteredMemberDetailMembers = members.filter((member) => {
  if (!trimmedMemberDetailSearch) return false

  return (
    String(member.name || '').toLowerCase().includes(trimmedMemberDetailSearch) ||
    String(member.goal || '').toLowerCase().includes(trimmedMemberDetailSearch) ||
    String(member.programs?.name || '').toLowerCase().includes(trimmedMemberDetailSearch)
  )
})

  

const currentRoutineWeek = useMemo(
  () => routineForm?.weeks?.[selectedRoutineWeek] || null,
  [routineForm?.weeks, selectedRoutineWeek],
)

const addRoutineWeek = () => {
  setRoutineForm((prev) => {
    const currentWeeks = Array.isArray(prev?.weeks) ? [...prev.weeks] : []

    const nextWeekNumber =
      currentWeeks.length > 0
        ? Math.max(...currentWeeks.map((week) => Number(week.week_number || 0))) + 1
        : 1

    return {
      ...prev,
      weeks: [...currentWeeks, createEmptyRoutineWeek(nextWeekNumber)],
    }
  })
}

const removeRoutineWeek = (weekIndex) => {
  setRoutineForm((prev) => {
    const currentWeeks = Array.isArray(prev?.weeks) ? [...prev.weeks] : []

    if (currentWeeks.length <= 1) {
      return {
        ...prev,
        weeks: [createEmptyRoutineWeek(1)],
      }
    }

    currentWeeks.splice(weekIndex, 1)

    const normalizedWeeks = currentWeeks.map((week, index) => ({
      ...week,
      week_number: index + 1,
    }))

    return {
      ...prev,
      weeks: normalizedWeeks,
    }
  })

  setSelectedRoutineWeek((prev) => {
    if (prev <= 0) return 0
    return prev - 1
  })
}

const addRoutineItem = (weekIndex, dayIndex) => {
  setRoutineForm((prev) => {
    const currentWeeks = Array.isArray(prev?.weeks) ? [...prev.weeks] : []
    const targetWeek = {
      ...(currentWeeks[weekIndex] || createEmptyRoutineWeek(weekIndex + 1)),
    }

    const currentDays = Array.isArray(targetWeek.days) ? [...targetWeek.days] : []
    const targetDay = {
      ...(currentDays[dayIndex] || { day_of_week: '월', items: [] }),
    }

    const currentItems = Array.isArray(targetDay.items) ? [...targetDay.items] : []

    currentItems.push({
      exercise_id: '',
      exercise_name_snapshot: '',
      duration_minutes: '',
      memo: '',
      sets: [createEmptySet()],
    })

    targetDay.items = currentItems
    currentDays[dayIndex] = targetDay
    targetWeek.days = currentDays
    currentWeeks[weekIndex] = targetWeek

    return {
      ...prev,
      weeks: currentWeeks,
    }
  })
}

const removeRoutineItem = (weekIndex, dayIndex, itemIndex) => {
  setRoutineForm((prev) => {
    const currentWeeks = Array.isArray(prev?.weeks) ? [...prev.weeks] : []
    const targetWeek = {
      ...(currentWeeks[weekIndex] || createEmptyRoutineWeek(weekIndex + 1)),
    }

    const currentDays = Array.isArray(targetWeek.days) ? [...targetWeek.days] : []
    const targetDay = {
      ...(currentDays[dayIndex] || { day_of_week: '월', items: [] }),
    }

    const currentItems = Array.isArray(targetDay.items) ? [...targetDay.items] : []
    currentItems.splice(itemIndex, 1)

    targetDay.items = currentItems
    currentDays[dayIndex] = targetDay
    targetWeek.days = currentDays
    currentWeeks[weekIndex] = targetWeek

    return {
      ...prev,
      weeks: currentWeeks,
    }
  })
}

const updateRoutineItemField = (weekIndex, dayIndex, itemIndex, field, value) => {
  setRoutineForm((prev) => {
    const currentWeeks = Array.isArray(prev?.weeks) ? [...prev.weeks] : []
    const targetWeek = {
      ...(currentWeeks[weekIndex] || createEmptyRoutineWeek(weekIndex + 1)),
    }

    const currentDays = Array.isArray(targetWeek.days) ? [...targetWeek.days] : []
    const targetDay = {
      ...(currentDays[dayIndex] || { day_of_week: '월', items: [] }),
    }

    const currentItems = Array.isArray(targetDay.items) ? [...targetDay.items] : []
    const targetItem = {
      ...(currentItems[itemIndex] || {
        exercise_id: '',
        exercise_name_snapshot: '',
        duration_minutes: '',
        memo: '',
        sets: [createEmptySet()],
      }),
      [field]: value,
    }

    currentItems[itemIndex] = targetItem
    targetDay.items = currentItems
    currentDays[dayIndex] = targetDay
    targetWeek.days = currentDays
    currentWeeks[weekIndex] = targetWeek

    return {
      ...prev,
      weeks: currentWeeks,
    }
  })
}

const updateRoutineItemSelect = (weekIndex, dayIndex, itemIndex, exerciseId) => {
  const selectedExercise = exercises.find(
    (exercise) => String(exercise.id) === String(exerciseId)
  )

  setRoutineForm((prev) => {
    const currentWeeks = Array.isArray(prev?.weeks) ? [...prev.weeks] : []
    const targetWeek = {
      ...(currentWeeks[weekIndex] || createEmptyRoutineWeek(weekIndex + 1)),
    }

    const currentDays = Array.isArray(targetWeek.days) ? [...targetWeek.days] : []
    const targetDay = {
      ...(currentDays[dayIndex] || { day_of_week: '월', items: [] }),
    }

    const currentItems = Array.isArray(targetDay.items) ? [...targetDay.items] : []
    const targetItem = {
      ...(currentItems[itemIndex] || {
        exercise_id: '',
        exercise_name_snapshot: '',
        duration_minutes: '',
        memo: '',
        sets: [createEmptySet()],
      }),
      exercise_id: exerciseId,
      exercise_name_snapshot: selectedExercise?.name || '',
    }

    currentItems[itemIndex] = targetItem
    targetDay.items = currentItems
    currentDays[dayIndex] = targetDay
    targetWeek.days = currentDays
    currentWeeks[weekIndex] = targetWeek

    return {
      ...prev,
      weeks: currentWeeks,
    }
  })
}

const addRoutineSet = (weekIndex, dayIndex, itemIndex) => {
  setRoutineForm((prev) => {
    const currentWeeks = Array.isArray(prev?.weeks) ? [...prev.weeks] : []
    const targetWeek = {
      ...(currentWeeks[weekIndex] || createEmptyRoutineWeek(weekIndex + 1)),
    }

    const currentDays = Array.isArray(targetWeek.days) ? [...targetWeek.days] : []
    const targetDay = {
      ...(currentDays[dayIndex] || { day_of_week: '월', items: [] }),
    }

    const currentItems = Array.isArray(targetDay.items) ? [...targetDay.items] : []
    const targetItem = {
      ...(currentItems[itemIndex] || {
        exercise_id: '',
        exercise_name_snapshot: '',
        duration_minutes: '',
        memo: '',
        sets: [createEmptySet()],
      }),
    }

    const currentSets = Array.isArray(targetItem.sets) ? [...targetItem.sets] : []
    currentSets.push(createEmptySet())
    targetItem.sets = currentSets

    currentItems[itemIndex] = targetItem
    targetDay.items = currentItems
    currentDays[dayIndex] = targetDay
    targetWeek.days = currentDays
    currentWeeks[weekIndex] = targetWeek

    return {
      ...prev,
      weeks: currentWeeks,
    }
  })
}

const updateRoutineSetValue = (
  weekIndex,
  dayIndex,
  itemIndex,
  setIndex,
  field,
  value
) => {
  setRoutineForm((prev) => {
    const currentWeeks = Array.isArray(prev?.weeks) ? [...prev.weeks] : []
    const targetWeek = {
      ...(currentWeeks[weekIndex] || createEmptyRoutineWeek(weekIndex + 1)),
    }

    const currentDays = Array.isArray(targetWeek.days) ? [...targetWeek.days] : []
    const targetDay = {
      ...(currentDays[dayIndex] || { day_of_week: '월', items: [] }),
    }

    const currentItems = Array.isArray(targetDay.items) ? [...targetDay.items] : []
    const targetItem = {
      ...(currentItems[itemIndex] || {
        exercise_id: '',
        exercise_name_snapshot: '',
        duration_minutes: '',
        memo: '',
        sets: [createEmptySet()],
      }),
    }

    const currentSets = Array.isArray(targetItem.sets) ? [...targetItem.sets] : []
    const targetSet = {
      ...(currentSets[setIndex] || createEmptySet()),
      [field]: value,
    }

    currentSets[setIndex] = targetSet
    targetItem.sets = currentSets

    currentItems[itemIndex] = targetItem
    targetDay.items = currentItems
    currentDays[dayIndex] = targetDay
    targetWeek.days = currentDays
    currentWeeks[weekIndex] = targetWeek

    return {
      ...prev,
      weeks: currentWeeks,
    }
  })
}

const removeRoutineSet = (weekIndex, dayIndex, itemIndex, setIndex) => {
  setRoutineForm((prev) => {
    const currentWeeks = Array.isArray(prev?.weeks) ? [...prev.weeks] : []
    const targetWeek = {
      ...(currentWeeks[weekIndex] || createEmptyRoutineWeek(weekIndex + 1)),
    }

    const currentDays = Array.isArray(targetWeek.days) ? [...targetWeek.days] : []
    const targetDay = {
      ...(currentDays[dayIndex] || { day_of_week: '월', items: [] }),
    }

    const currentItems = Array.isArray(targetDay.items) ? [...targetDay.items] : []
    const targetItem = {
      ...(currentItems[itemIndex] || {
        exercise_id: '',
        exercise_name_snapshot: '',
        duration_minutes: '',
        memo: '',
        sets: [createEmptySet()],
      }),
    }

    let currentSets = Array.isArray(targetItem.sets) ? [...targetItem.sets] : []
    currentSets.splice(setIndex, 1)

    if (currentSets.length === 0) {
      currentSets = [createEmptySet()]
    }

    targetItem.sets = currentSets
    currentItems[itemIndex] = targetItem
    targetDay.items = currentItems
    currentDays[dayIndex] = targetDay
    targetWeek.days = currentDays
    currentWeeks[weekIndex] = targetWeek

    return {
      ...prev,
      weeks: currentWeeks,
    }
  })
}

const toggleRoutineDayCollapse = (weekNumber, dayOfWeek) => {
  const key = `${weekNumber}-${dayOfWeek}`

  setCollapsedRoutineDays((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}

const selectedPartner = useMemo(
    () => partners.find((partner) => partner.id === selectedPartnerId) || null,
    [partners, selectedPartnerId],
  )
  const selectedMedicalPartner = useMemo(
  () => medicalPartners.find((item) => item.id === selectedMedicalPartnerId) || null,
  [medicalPartners, selectedMedicalPartnerId],
)
  const getPositiveScoreByCheckCount = (count) => {
  if (count <= 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  if (count === 4) return 4
  return 5
}

const getNegativeScoreByCheckCount = (count) => {
  if (count === 0) return 1
  if (count <= 2) return 2
  if (count === 3) return 3
  if (count === 4) return 4
  return 5
}

const getPerformanceLevel = (score) => {
  return PERFORMANCE_LEVEL_META.find((item) => score >= item.min && score <= item.max)?.label || '기본'
}

const getCoachStatusLevelKey = ({ conditionScore, fatigueScore, stressScore, focusScore }) => {
  const positive = Number(conditionScore || 0) + Number(focusScore || 0)
  const negative = Number(fatigueScore || 0) + Number(stressScore || 0)
  const diff = positive - negative

  if (diff >= 4) return 'top'
  if (diff >= 1) return 'stable'
  if (diff >= -2) return 'caution'
  return 'risk'
}

const getCoachStatusText = ({
  conditionScore,
  fatigueScore,
  stressScore,
  focusScore,
  performanceScore,
}) => {
  const levelKey = getCoachStatusLevelKey({
    conditionScore,
    fatigueScore,
    stressScore,
    focusScore,
  })

  const base = COACH_LEVEL_META[levelKey]?.description || ''
  const performanceLevel = getPerformanceLevel(performanceScore)

  return `${base} / 성과 행동 수준은 ${performanceLevel}입니다.`
}

const calculateCoachConditionScores = (form) => {
  const conditionPercent = getPercentFromChecks(
    (form.condition_checks || []).length,
    CONDITION_CHECKLIST.length
  )

  const fatiguePercent = getPercentFromChecks(
    (form.fatigue_checks || []).length,
    FATIGUE_CHECKLIST.length
  )

  const stressPercent = getPercentFromChecks(
    (form.stress_checks || []).length,
    STRESS_CHECKLIST.length
  )

  const focusPercent = getPercentFromChecks(
    (form.focus_checks || []).length,
    FOCUS_CHECKLIST.length
  )

  const performanceCheckedCount =
    (form.lead_actions || []).length +
    (form.retention_actions || []).length +
    (form.sales_actions || []).length +
    (form.growth_actions || []).length

  const performanceTotalCount = PERFORMANCE_ACTION_SECTIONS.reduce(
    (sum, section) => sum + section.items.length,
    0
  )

  const performancePercent = getPercentFromChecks(
    performanceCheckedCount,
    performanceTotalCount
  )

  const conditionScore = Math.round(conditionPercent / 20) || 1
  const fatigueScore = Math.round(fatiguePercent / 20) || 1
  const stressScore = Math.round(stressPercent / 20) || 1
  const focusScore = Math.round(focusPercent / 20) || 1
  const performanceScore = performancePercent

  const burnoutPercent = getBurnoutSignalPercent(burnoutSignalChecks)
  const finalPercent = Math.round(
    conditionPercent * 0.3 +
    focusPercent * 0.2 +
    (100 - burnoutPercent) * 0.3 +
    performancePercent * 0.2
  )

  let statusLevel = 'stable'
  if (burnoutPercent >= 60 || finalPercent < 40) {
    statusLevel = 'risk'
  } else if (burnoutPercent >= 40 || finalPercent < 60) {
    statusLevel = 'caution'
  } else if (finalPercent >= 80) {
    statusLevel = 'top'
  }

  const performanceLevel =
    performancePercent >= 80
      ? '고성과'
      : performancePercent >= 60
      ? '양호'
      : performancePercent >= 40
      ? '기본'
      : '매우 부족'

  return {
    conditionScore,
    fatigueScore,
    stressScore,
    focusScore,
    performanceScore,
    statusLevel,
    performanceLevel,
    conditionPercent,
    fatiguePercent,
    stressPercent,
    focusPercent,
    burnoutPercent,
    finalPercent,
  }
}

const toggleChecklistItem = (field, item) => {
  setCoachConditionForm((prev) => {
    const current = Array.isArray(prev[field]) ? prev[field] : []
    const exists = current.includes(item)

    const next = exists
      ? current.filter((value) => value !== item)
      : [...current, item]

    const nextForm = {
      ...prev,
      [field]: next,
    }

    const scores = calculateCoachConditionScores(nextForm)

    return {
      ...nextForm,
      condition_score: scores.conditionScore,
      fatigue_score: scores.fatigueScore,
      stress_score: scores.stressScore,
      focus_score: scores.focusScore,
      performance_score: scores.performanceScore,
      performance_level: scores.performanceLevel,
      status_level: scores.statusLevel,
    }
  })
}
  const toggleBurnoutSignalItem = (item) => {
  setBurnoutSignalChecks((prev) =>
    prev.includes(item)
      ? prev.filter((v) => v !== item)
      : [...prev, item]
  )
}

const getBurnoutSignalText = (checks = []) => {
  const count = checks.length

  if (count <= 1) return '현재는 번아웃보다는 일반 피로 수준입니다.'
  if (count <= 3) return '피로 누적이 시작된 상태입니다.'
  return '번아웃 가능성이 높은 상태입니다. 회복 체크를 확인하세요.'
}
  const toggleBurnoutRecoveryItem = (item) => {
  setBurnoutRecoveryChecks((prev) =>
    prev.includes(item)
      ? prev.filter((v) => v !== item)
      : [...prev, item]
  )
}
  const toggleCoachConditionCollapse = (id) => {
  setCollapsedCoachConditions((prev) => ({
    ...prev,
    [id]: !prev[id],
  }))
}
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
    const memberWorkouts = workouts.filter(
      (workout) =>
        workout.member_id === member.id &&
        (workout.workout_date || '').slice(0, 7) === selectedStatsMonth
    )

    const ptCount = memberWorkouts.filter((workout) => workout.workout_type === 'pt').length
    const personalCount = memberWorkouts.filter((workout) => workout.workout_type === 'personal').length
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
}, [members, workouts, selectedStatsMonth])

 const filteredMemberStats = useMemo(() => {
  return memberStats
    .filter((member) => {
      const matchesKeyword =
        !memberSearch.trim() ||
        textIncludes(member.name, memberSearch) ||
        textIncludes(member.goal, memberSearch) ||
        textIncludes(member.access_code, memberSearch) ||
        textIncludes(member.programs?.name, memberSearch) ||
        textIncludes(member.memo, memberSearch)

      const matchesProgram = !memberProgramFilter || member.current_program_id === memberProgramFilter
      const matchesStatus =
        memberStatusFilter === 'all' ||
        (memberStatusFilter === 'remaining' && member.remainingSessions > 0) ||
        (memberStatusFilter === 'ended' && member.remainingSessions <= 0)

      return matchesKeyword && matchesProgram && matchesStatus
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko-KR'))
}, [memberStats, memberSearch, memberProgramFilter, memberStatusFilter])
const totalMemberCount = Array.isArray(members) ? members.length : 0
const visibleMemberCount = Array.isArray(filteredMemberStats) ? filteredMemberStats.length : 0
  const filteredMemberDetails = useMemo(() => {
    return memberStats.filter((member) => {
      return (
        !memberDetailSearch.trim() ||
        textIncludes(member.name, memberDetailSearch) ||
        textIncludes(member.goal, memberDetailSearch) ||
        textIncludes(member.access_code, memberDetailSearch) ||
        textIncludes(member.programs?.name, memberDetailSearch) ||
        textIncludes(member.memo, memberDetailSearch)
      )
    })
  }, [memberStats, memberDetailSearch])
const activityRankingData = useMemo(() => {
  const levelMap = (memberLevels || []).reduce((acc, row) => {
    acc[row.member_id] = row
    return acc
  }, {})

  const monthMembers = memberStats.map((member) => {
    const totalActivity = Number(member.ptCount || 0) + Number(member.personalCount || 0)
    const weightedScore = Number(member.ptCount || 0) * 2 + Number(member.personalCount || 0)
    const levelInfo = levelMap[member.id] || null

    return {
      ...member,
      totalActivity,
      weightedScore,
      totalXp: Number(levelInfo?.total_xp || 0),
      levelNo: Number(levelInfo?.level_no || 1),
      levelName: levelInfo?.level_name || '생알',
      weeklyScore: Number(levelInfo?.weekly_score || 0),
      streakDays: Number(levelInfo?.streak_days || 0),
      lastActivityDate: levelInfo?.last_activity_date || '',
    }
  })

  const ptRanking = [...monthMembers]
    .filter((member) => member.ptCount > 0)
    .sort((a, b) => {
      if (b.ptCount !== a.ptCount) return b.ptCount - a.ptCount
      return (a.name || '').localeCompare(b.name || '', 'ko-KR')
    })

  const personalRanking = [...monthMembers]
    .filter((member) => member.personalCount > 0)
    .sort((a, b) => {
      if (b.personalCount !== a.personalCount) return b.personalCount - a.personalCount
      return (a.name || '').localeCompare(b.name || '', 'ko-KR')
    })

  const totalRanking = [...monthMembers]
    .filter((member) => member.totalActivity > 0)
    .sort((a, b) => {
      if (b.totalActivity !== a.totalActivity) return b.totalActivity - a.totalActivity
      return (a.name || '').localeCompare(b.name || '', 'ko-KR')
    })

  const weightedRanking = [...monthMembers]
    .filter((member) => member.weightedScore > 0)
    .sort((a, b) => {
      if (b.weightedScore !== a.weightedScore) return b.weightedScore - a.weightedScore
      return (a.name || '').localeCompare(b.name || '', 'ko-KR')
    })

  const levelRanking = [...monthMembers]
    .filter((member) => member.totalXp > 0)
    .sort((a, b) => {
      if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp
      if (b.levelNo !== a.levelNo) return b.levelNo - a.levelNo
      return (a.name || '').localeCompare(b.name || '', 'ko-KR')
    })

  const weeklyXpRanking = [...monthMembers]
    .filter((member) => member.weeklyScore > 0)
    .sort((a, b) => {
      if (b.weeklyScore !== a.weeklyScore) return b.weeklyScore - a.weeklyScore
      return (a.name || '').localeCompare(b.name || '', 'ko-KR')
    })

  return {
    ptRanking,
    personalRanking,
    totalRanking,
    weightedRanking,
    levelRanking,
    weeklyXpRanking,
    topPtMember: ptRanking[0] || null,
    topPersonalMember: personalRanking[0] || null,
    topTotalMember: totalRanking[0] || null,
    topWeightedMember: weightedRanking[0] || null,
    topLevelMember: levelRanking[0] || null,
    topWeeklyXpMember: weeklyXpRanking[0] || null,
  }
}, [memberStats, memberLevels])
 const monthlyStats = useMemo(() => {
  const monthKey = selectedStatsMonth

  const monthWorkouts = workouts.filter(
    (workout) => (workout.workout_date || '').slice(0, 7) === monthKey
  )

  return {
    ptCount: monthWorkouts.filter((workout) => workout.workout_type === 'pt').length,
    personalCount: monthWorkouts.filter((workout) => workout.workout_type === 'personal').length,
    remainingSessions: members.reduce(
      (sum, member) =>
        sum + Math.max(Number(member.total_sessions || 0) - Number(member.used_sessions || 0), 0),
      0,
    ),
  }
}, [workouts, members, selectedStatsMonth])

  const filteredSchedules = useMemo(() => {
    return coachSchedules.filter((schedule) => getMonthKey(schedule.schedule_date) === scheduleMonth)
  }, [coachSchedules, scheduleMonth])

  const workoutCards = useMemo(() => {
    return workouts
      .map((workout) => {
        const member = members.find((item) => item.id === workout.member_id)
        const items = workoutItemsMap[workout.id] || []
        const exerciseNames = [
  ...items.map((item) => item.exercise_name_snapshot || ''),
  ...items.flatMap((item) =>
    Array.isArray(item.sub_exercises)
      ? item.sub_exercises.map((sub) => sub.exercise_name_snapshot || '')
      : []
  ),
  ...items.map((item) => item.method_note || ''),
  ...items.map((item) => item.training_method || ''),
].join(' ')
         return {
        ...workout,
        member,
        items,
        searchText: [
          member?.name || '',
          workout.workout_type || '',
          workout.good || '',
          workout.improve || '',
          exerciseNames,
          workout.workout_date || '',
        ].join(' '),
      }
    })
    .filter((workout) => {
      const matchesKeyword = !workoutSearch.trim() || textIncludes(workout.searchText, workoutSearch)
      const matchesMember = !workoutMemberFilter || workout.member_id === workoutMemberFilter
      const matchesType = workoutTypeFilter === 'all' || workout.workout_type === workoutTypeFilter
      return matchesKeyword && matchesMember && matchesType
    })
}, [workouts, members, workoutItemsMap, workoutSearch, workoutMemberFilter, workoutTypeFilter])
const groupedWorkoutCards = useMemo(() => {
  const filteredByDate = workoutCards.filter((workout) => {
    return !workoutDateFilter || workout.workout_date === workoutDateFilter
  })

  const grouped = filteredByDate.reduce((acc, workout) => {
    const key = workout.workout_date || '날짜 없음'
    if (!acc[key]) acc[key] = []
    acc[key].push(workout)
    return acc
  }, {})

  return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))
}, [workoutCards, workoutDateFilter])
  const displayedDietLogs = useMemo(() => {
    return dietLogs.filter((diet) => {
      const member = members.find((item) => item.id === diet.member_id)
      const matchesMember = !dietMemberFilter || diet.member_id === dietMemberFilter
      const matchesKeyword =
        !dietSearch.trim() ||
        textIncludes(diet.content, dietSearch) ||
        textIncludes(diet.member_note, dietSearch) ||
        textIncludes(diet.coach_feedback, dietSearch) ||
        textIncludes(diet.meal_type, dietSearch) ||
        textIncludes(diet.product_brand, dietSearch) ||
        textIncludes(diet.product_name, dietSearch) ||
        textIncludes(member?.name, dietSearch)

      return matchesMember && matchesKeyword
    })
  }, [dietLogs, dietMemberFilter, dietSearch, members])

  const filteredSales = useMemo(() => {
    return salesRecords
      .filter((sale) => getMonthKey(sale.sale_date) === saleMonth)
      .filter((sale) => {
        const matchesPayment = salePaymentFilter === 'all' || sale.payment_method === salePaymentFilter
        const matchesKeyword =
          !saleSearch.trim() ||
          textIncludes(sale.members?.name, saleSearch) ||
          textIncludes(sale.programs?.name, saleSearch) ||
          textIncludes(sale.payment_method, saleSearch) ||
          textIncludes(sale.memo, saleSearch) ||
          textIncludes(sale.sale_date, saleSearch) ||
          textIncludes(sale.amount, saleSearch)
        return matchesPayment && matchesKeyword
      })
  }, [salesRecords, saleMonth, saleSearch, salePaymentFilter])

 const salesStatsExtended = useMemo(() => {
  const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0)
  const totalCount = filteredSales.length
  const vipCount = filteredSales.filter((sale) => sale.is_vip).length
  const vipRatio = totalCount > 0 ? Math.round((vipCount / totalCount) * 100) : 0

  const cashSales = filteredSales
    .filter((sale) => sale.payment_method === '현금')
    .reduce((sum, sale) => sum + Number(sale.amount || 0), 0)

  const cardSales = filteredSales
    .filter((sale) => sale.payment_method === '카드')
    .reduce((sum, sale) => sum + Number(sale.amount || 0), 0)

  const transferSales = filteredSales
    .filter((sale) => sale.payment_method === '이체')
    .reduce((sum, sale) => sum + Number(sale.amount || 0), 0)

  const installmentSales = filteredSales
    .filter((sale) => sale.payment_method === '할부')
    .reduce((sum, sale) => sum + Number(sale.amount || 0), 0)

  const programTotals = filteredSales.reduce((acc, sale) => {
    const key = sale.programs?.name || '미지정'
    acc[key] = (acc[key] || 0) + Number(sale.amount || 0)
    return acc
  }, {})

  const chartSource = Object.entries(programTotals)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  return {
    totalSales,
    totalCount,
    vipCount,
    vipRatio,
    cashSales,
    cardSales,
    transferSales,
    installmentSales,
    chartSource,
  }
}, [filteredSales])

  const filteredSalesLogs = useMemo(() => {
  return salesLogs
    .filter((log) => {
      const matchesMonth = !salesLogMonth || getMonthKey(log.log_date) === salesLogMonth
      const matchesStage = salesLogStageFilter === 'all' || (log.current_stage || '') === salesLogStageFilter
      const matchesResult = salesLogResultFilter === 'all' || (log.sales_result || '') === salesLogResultFilter
      const matchesConversion =
        salesLogConversionFilter === 'all' || (log.conversion_score || '') === salesLogConversionFilter

      const matchesKeyword =
        !salesLogSearch.trim() ||
        textIncludes(log.lead_name, salesLogSearch) ||
        textIncludes(log.phone, salesLogSearch) ||
        textIncludes(log.main_need, salesLogSearch) ||
        textIncludes(log.source_channel, salesLogSearch) ||
        textIncludes(log.current_stage, salesLogSearch) ||
        textIncludes(log.sales_result, salesLogSearch) ||
        textIncludes(log.coach_name, salesLogSearch) ||
        textIncludes(log.diary, salesLogSearch) ||
        textIncludes(log.follow_up_action, salesLogSearch)

      return matchesMonth && matchesStage && matchesResult && matchesConversion && matchesKeyword
    })
    .sort((a, b) => {
      const aKey = `${a.log_date || ''} ${a.activity_time || '00:00'}`
      const bKey = `${b.log_date || ''} ${b.activity_time || '00:00'}`
      return bKey.localeCompare(aKey)
    })
}, [
  salesLogs,
  salesLogMonth,
  salesLogSearch,
  salesLogStageFilter,
  salesLogResultFilter,
  salesLogConversionFilter,
])

const groupedSalesLogs = useMemo(() => {
  const grouped = filteredSalesLogs.reduce((acc, log) => {
    const key = log.log_date || '날짜 없음'
    if (!acc[key]) acc[key] = []
    acc[key].push(log)
    return acc
  }, {})

  return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))
}, [filteredSalesLogs])

const salesLogSummary = useMemo(() => {
  return {
    total: filteredSalesLogs.length,
    high: filteredSalesLogs.filter((log) => log.conversion_score === 'high').length,
    closed: filteredSalesLogs.filter((log) => log.sales_result === '결제완료').length,
    followup: filteredSalesLogs.filter((log) => log.sales_result === '후속관리').length,
    lost: filteredSalesLogs.filter((log) => log.sales_result === '이탈').length,
  }
}, [filteredSalesLogs])
const filteredCoachConditions = useMemo(() => {
  return coachConditions.filter((item) => {
    const matchesMonth = !coachConditionMonth || item.check_month === coachConditionMonth
    const matchesCoach = !coachConditionCoachFilter || item.coach_id === coachConditionCoachFilter
    return matchesMonth && matchesCoach
  })
}, [coachConditions, coachConditionMonth, coachConditionCoachFilter])

const coachConditionSummary = useMemo(() => {
  if (!filteredCoachConditions.length) {
    return {
      avgCondition: 0,
      avgFatigue: 0,
      avgFocus: 0,
      avgStress: 0,
    }
  }

  const total = filteredCoachConditions.length

  return {
    avgCondition: filteredCoachConditions.reduce((sum, item) => sum + Number(item.condition_score || 0), 0) / total,
    avgFatigue: filteredCoachConditions.reduce((sum, item) => sum + Number(item.fatigue_score || 0), 0) / total,
    avgFocus: filteredCoachConditions.reduce((sum, item) => sum + Number(item.focus_score || 0), 0) / total,
    avgStress: filteredCoachConditions.reduce((sum, item) => sum + Number(item.stress_score || 0), 0) / total,
  }
}, [filteredCoachConditions])
  const burnoutSummary = useMemo(() => {
  if (!filteredCoachConditions.length) return {
    avgSignal: 0,
    avgRecovery: 0,
  }

  const totalSignal = filteredCoachConditions.reduce(
    (sum, item) => sum + (item.burnout_signal_count || 0),
    0
  )

  const totalRecovery = filteredCoachConditions.reduce(
    (sum, item) => sum + (item.burnout_recovery_count || 0),
    0
  )

  return {
    avgSignal: totalSignal / filteredCoachConditions.length,
    avgRecovery: totalRecovery / filteredCoachConditions.length,
  }
}, [filteredCoachConditions])
  const dashboardOverview = useMemo(() => {
  const now = new Date()
  const todayKey = now.toISOString().slice(0, 10)
  const currentMonthKey = now.toISOString().slice(0, 7)

  const startOfWeek = new Date(now)
  const day = startOfWeek.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const toDate = (value) => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const sumAmount = (rows = []) =>
    rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)

  const currentDaySales = salesRecords.filter((sale) => sale.sale_date === todayKey)

  const currentWeekSales = salesRecords.filter((sale) => {
    const saleDate = toDate(sale.sale_date)
    return saleDate && saleDate >= startOfWeek
  })

  const currentMonthSales = salesRecords.filter((sale) => {
    const saleDate = toDate(sale.sale_date)
    return saleDate && saleDate >= startOfMonth
  })

  const previousMonthSales = salesRecords.filter((sale) => {
    const saleDate = toDate(sale.sale_date)
    return saleDate && saleDate >= previousMonthStart && saleDate <= previousMonthEnd
  })

  const currentMonthWorkouts = workouts.filter(
    (workout) => (workout.workout_date || '').slice(0, 7) === currentMonthKey
  )

  const ptCount = currentMonthWorkouts.filter(
    (workout) => workout.workout_type === 'pt'
  ).length

  const personalCount = currentMonthWorkouts.filter(
    (workout) => workout.workout_type === 'personal'
  ).length

  const remainingSessionTotal = members.reduce(
    (sum, member) =>
      sum + Math.max(Number(member.total_sessions || 0) - Number(member.used_sessions || 0), 0),
    0
  )

  const endingMembers = members
    .map((member) => ({
      ...member,
      remainingSessions: Math.max(
        Number(member.total_sessions || 0) - Number(member.used_sessions || 0),
        0
      ),
    }))
    .filter((member) => member.remainingSessions <= 5)
    .sort((a, b) => a.remainingSessions - b.remainingSessions)
    .slice(0, 5)

  const memberWorkoutCountMap = currentMonthWorkouts.reduce((acc, workout) => {
    acc[workout.member_id] = (acc[workout.member_id] || 0) + 1
    return acc
  }, {})

  const activeMembers = members
    .map((member) => ({
      ...member,
      workoutCount: memberWorkoutCountMap[member.id] || 0,
    }))
    .filter((member) => member.workoutCount > 0)
    .sort((a, b) => b.workoutCount - a.workoutCount)
    .slice(0, 5)

  const paymentBreakdownMap = salesRecords.reduce((acc, sale) => {
    const key = sale.payment_method || '기타'
    acc[key] = (acc[key] || 0) + Number(sale.amount || 0)
    return acc
  }, {})

  const paymentBreakdown = Object.entries(paymentBreakdownMap)
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)

  const programMap = currentMonthSales.reduce((acc, sale) => {
    const key = sale.programs?.name || '미지정'
    acc[key] = (acc[key] || 0) + Number(sale.amount || 0)
    return acc
  }, {})

  const topPrograms = Object.entries(programMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const riskCoaches = filteredCoachConditions
    .filter((item) => item.status_level === 'risk')
    .map((item) => ({
      ...item,
      coachName: item.coaches?.name || '이름 없음',
    }))

  const cautionCoaches = filteredCoachConditions
    .filter((item) => item.status_level === 'caution')
    .map((item) => ({
      ...item,
      coachName: item.coaches?.name || '이름 없음',
    }))

  const topCoachReviews = coachReviews
    .filter((item) => !coachReviewMonth || item.review_month === coachReviewMonth)
    .map((item) => ({
      ...item,
      coachName: coaches.find((coach) => coach.id === item.coach_id)?.name || '이름 없음',
    }))
    .sort((a, b) => Number(b.total_score || 0) - Number(a.total_score || 0))
    .slice(0, 5)

  const recentSales = [...salesRecords]
    .sort((a, b) => `${b.sale_date || ''}`.localeCompare(`${a.sale_date || ''}`))
    .slice(0, 5)

  const recentSalesLogs = [...filteredSalesLogs].slice(0, 5)

  const recentInquiries = [...inquiries]
    .sort((a, b) => `${b.created_at || b.inquiry_date || ''}`.localeCompare(`${a.created_at || a.inquiry_date || ''}`))
    .slice(0, 5)

  const recentNotices = [...notices]
    .sort((a, b) => `${b.created_at || b.starts_at || ''}`.localeCompare(`${a.created_at || a.starts_at || ''}`))
    .slice(0, 5)

  const monthSalesAmount = sumAmount(currentMonthSales)
  const previousMonthSalesAmount = sumAmount(previousMonthSales)

  const monthRevenueChangeRate =
    previousMonthSalesAmount > 0
      ? Math.round(((monthSalesAmount - previousMonthSalesAmount) / previousMonthSalesAmount) * 100)
      : monthSalesAmount > 0
      ? 100
      : 0

  return {
    todaySalesAmount: sumAmount(currentDaySales),
    todaySalesCount: currentDaySales.length,

    weekSalesAmount: sumAmount(currentWeekSales),
    weekSalesCount: currentWeekSales.length,

    monthSalesAmount,
    monthSalesCount: currentMonthSales.length,
    monthRevenueChangeRate,

    ptCount,
    personalCount,
    remainingSessionTotal,

    pendingInquiries: inquiries.filter((item) => item.status !== 'answered').length,
    unreadInquiryCount,
    unreadNoticeCount,

    riskCoachCount: riskCoaches.length,
    cautionCoachCount: cautionCoaches.length,

    paymentBreakdown,
    topPrograms,
    endingMembers,
    activeMembers,
    riskCoaches,
    cautionCoaches,
    topCoachReviews,
    recentSales,
    recentSalesLogs,
    recentInquiries,
    recentNotices,
  }
}, [
  salesRecords,
  workouts,
  members,
  filteredCoachConditions,
  coachReviews,
  coachReviewMonth,
  coaches,
  filteredSalesLogs,
  inquiries,
  notices,
  unreadInquiryCount,
  unreadNoticeCount,
])
  const coachAlertList = useMemo(() => {
  return filteredCoachConditions
    .map((item) => {
      const coachName = item.coaches?.name || '이름 없음'
      const fatigue = Number(item.fatigue_score || 0)
      const stress = Number(item.stress_score || 0)
      const focus = Number(item.focus_score || 0)
      const performance = Number(item.performance_score || 0)

      const reasons = []

      if (fatigue >= 4) reasons.push('피로도 높음')
      if (stress >= 4) reasons.push('스트레스 높음')
      if (focus <= 2) reasons.push('집중도 낮음')
      if (performance <= 5) reasons.push('성과 행동 부족')

      return {
        ...item,
        coachName,
        reasons,
        isAlert: reasons.length > 0,
      }
    })
    .filter((item) => item.isAlert)
}, [filteredCoachConditions])
const uniqueAlertCoaches = useMemo(() => {
  return [...new Map(coachAlertList.map((item) => [item.coach_id, item])).values()]
}, [coachAlertList])
const coachDashboardSummary = useMemo(() => {
  const avgPerformance =
    filteredCoachConditions.length > 0
      ? filteredCoachConditions.reduce((sum, item) => sum + Number(item.performance_score || 0), 0) /
        filteredCoachConditions.length
      : 0

  const statusKey = getCoachStatusLevelKey({
    conditionScore: coachConditionSummary.avgCondition,
    fatigueScore: coachConditionSummary.avgFatigue,
    stressScore: coachConditionSummary.avgStress,
    focusScore: coachConditionSummary.avgFocus,
  })

  return {
    avgPerformance,
    statusKey,
    statusLabel: COACH_LEVEL_META[statusKey]?.label || '-',
    statusText: getCoachStatusText({
      conditionScore: coachConditionSummary.avgCondition,
      fatigueScore: coachConditionSummary.avgFatigue,
      stressScore: coachConditionSummary.avgStress,
      focusScore: coachConditionSummary.avgFocus,
      performanceScore: avgPerformance,
    }),
  }
}, [filteredCoachConditions, coachConditionSummary])

const coachGoalSummary = useMemo(() => {
  if (!filteredCoachConditions.length) {
    return {
      revenueGoalAvg: 0,
      newLeadGoalAvg: 0,
      retentionGoalAvg: 0,
      contentGoalAvg: 0,
    }
  }

  const latestGoal = [...filteredCoachConditions]
    .filter(
      (item) =>
        Number(item.monthly_goal_revenue || 0) > 0 ||
        Number(item.monthly_goal_new_leads || 0) > 0 ||
        Number(item.monthly_goal_retention || 0) > 0 ||
        Number(item.monthly_goal_content || 0) > 0
    )
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0]

  if (!latestGoal) {
    return {
      revenueGoalAvg: 0,
      newLeadGoalAvg: 0,
      retentionGoalAvg: 0,
      contentGoalAvg: 0,
    }
  }

  return {
    revenueGoalAvg: Number(latestGoal.monthly_goal_revenue || 0),
    newLeadGoalAvg: Number(latestGoal.monthly_goal_new_leads || 0),
    retentionGoalAvg: Number(latestGoal.monthly_goal_retention || 0),
    contentGoalAvg: Number(latestGoal.monthly_goal_content || 0),
  }
}, [filteredCoachConditions])
  const coachActualSummary = useMemo(() => {
  return {
    actualRevenue: Number(salesStatsExtended?.totalSales || 0),
    actualLeadCount: Number(salesLogSummary?.total || 0),
    actualClosedCount: Number(salesLogSummary?.closed || 0),
    actualFollowupCount: Number(salesLogSummary?.followup || 0),
    actualLostCount: Number(salesLogSummary?.lost || 0),
  }
}, [salesStatsExtended, salesLogSummary])
  const filteredCoachReviews = useMemo(() => {
  return coachReviews.filter((item) => {
    const matchesMonth = !coachReviewMonth || item.review_month === coachReviewMonth
    const matchesCoach = !coachReviewCoachFilter || item.coach_id === coachReviewCoachFilter
    return matchesMonth && matchesCoach
  })
}, [coachReviews, coachReviewMonth, coachReviewCoachFilter])
  const filteredPrograms = useMemo(() => {
  return programs
    .filter((p) => {
      return (
        !programSearch.trim() ||
        textIncludes(p.name, programSearch)
      )
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko-KR'))
}, [programs, programSearch])
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

      return matchesKeyword && matchesCategory
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

      return matchesKeyword && matchesCategory
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko-KR'))
}, [medicalPartners, medicalPartnerSearch, medicalPartnerCategoryFilter])
const filteredNotices = useMemo(() => {
  return notices.filter((notice) => {
    const monthSource = getMonthKey(notice.starts_at || notice.created_at || '')
    const matchesMonth = !noticeMonthFilter || monthSource === noticeMonthFilter
    const matchesCategory = noticeCategoryFilter === 'all' || notice.category === noticeCategoryFilter
    const matchesKeyword =
      !noticeSearch.trim() ||
      textIncludes(notice.title, noticeSearch) ||
      textIncludes(notice.content, noticeSearch) ||
      textIncludes(notice.category, noticeSearch)

    return matchesMonth && matchesCategory && matchesKeyword
  })
}, [notices, noticeMonthFilter, noticeCategoryFilter, noticeSearch])
  const filteredInquiries = useMemo(() => {
  return inquiries.filter((item) => {
    const createdDate = (item.created_at || '').slice(0, 10)

    const matchesKeyword =
      !inquirySearch.trim() ||
      textIncludes(item.name, inquirySearch) ||
      textIncludes(item.phone, inquirySearch) ||
      textIncludes(item.content, inquirySearch) ||
      textIncludes(item.answer, inquirySearch)

    const matchesDate =
      !inquiryDateFilter || createdDate === inquiryDateFilter

    const answerText = String(item.answer || '').trim()
    const isAnswered = answerText.length > 0

    const matchesStatus =
      inquiryStatusFilter === 'all' ||
      (inquiryStatusFilter === 'pending' && !isAnswered) ||
      (inquiryStatusFilter === 'answered' && isAnswered) ||
      (inquiryStatusFilter === 'private' && !!item.is_private)

    return matchesKeyword && matchesDate && matchesStatus
  })
}, [inquiries, inquirySearch, inquiryDateFilter, inquiryStatusFilter])
  useEffect(() => {
    loadAll()
  }, [])
useEffect(() => {
  const latestInquiry = inquiries[0]
  const latestNotice = notices[0]
const latestWorkout = workouts[0]
const latestDiet = dietLogs[0]

const savedWorkoutId = localStorage.getItem(`admin_last_workout_${currentAdminId || 'default'}`)
const savedDietId = localStorage.getItem(`admin_last_diet_${currentAdminId || 'default'}`)
  const savedInquiryId = localStorage.getItem(`admin_last_inquiry_${currentAdminId || 'default'}`)
  const savedNoticeId = localStorage.getItem(`admin_last_notice_${currentAdminId || 'default'}`)

  if (latestInquiry?.id) {
    if (!savedInquiryId) {
      localStorage.setItem(`admin_last_inquiry_${currentAdminId || 'default'}`, latestInquiry.id)
    } else if (savedInquiryId !== latestInquiry.id && adminAlertSettings.inquiry) {
      setUnreadInquiryCount((prev) => prev + 1)

      const nextAlert = {
        id: `inquiry-${latestInquiry.id}`,
        type: 'inquiry',
        text: `새 문의가 등록되었습니다. (${latestInquiry.name || '익명'})`,
        createdAt: Date.now(),
      }

      setAdminAlerts((prev) => [nextAlert, ...prev].slice(0, 20))

      if (adminAlertSettings.popup) {
        setMessage(`📩 새 문의가 들어왔습니다. (${latestInquiry.name || '익명'})`)
      }

      if (adminAlertSettings.sound) {
        playAdminAlertSound()
      }

      localStorage.setItem(`admin_last_inquiry_${currentAdminId || 'default'}`, latestInquiry.id)
    }
  }

  if (latestNotice?.id) {
    if (!savedNoticeId) {
      localStorage.setItem(`admin_last_notice_${currentAdminId || 'default'}`, latestNotice.id)
   } else if (savedNoticeId !== latestNotice.id && adminAlertSettings.notice) {
      setUnreadNoticeCount((prev) => prev + 1)

      const nextAlert = {
        id: `notice-${latestNotice.id}`,
        type: 'notice',
        text: `새 공지사항이 등록되었습니다. (${latestNotice.title || '제목 없음'})`,
        createdAt: Date.now(),
      }

      setAdminAlerts((prev) => [nextAlert, ...prev].slice(0, 20))

      if (adminAlertSettings.popup) {
        setMessage(`📢 새 공지사항이 등록되었습니다. (${latestNotice.title || '제목 없음'})`)
      }

      if (adminAlertSettings.sound) {
        playAdminAlertSound()
      }

      localStorage.setItem(`admin_last_notice_${currentAdminId || 'default'}`, latestNotice.id)
    }
  }
  if (latestWorkout?.id) {
  if (!savedWorkoutId) {
    localStorage.setItem(`admin_last_workout_${currentAdminId || 'default'}`, latestWorkout.id)
  } else if (savedWorkoutId !== latestWorkout.id && adminAlertSettings.workout) {
    setUnreadWorkoutCount((prev) => prev + 1)

    const nextAlert = {
      id: `workout-${latestWorkout.id}`,
      type: 'workout',
      text: `새 운동기록이 등록되었습니다. (${latestWorkout.member_name || latestWorkout.member_id || '회원'})`,
      createdAt: Date.now(),
    }

    setAdminAlerts((prev) => [nextAlert, ...prev].slice(0, 20))

    if (adminAlertSettings.popup) {
      setMessage(`🏋️ 새 운동기록이 등록되었습니다.`)
    }

    if (adminAlertSettings.sound) {
      playAdminAlertSound()
    }

    localStorage.setItem(`admin_last_workout_${currentAdminId || 'default'}`, latestWorkout.id)
  }
}

if (latestDiet?.id) {
  if (!savedDietId) {
    localStorage.setItem(`admin_last_diet_${currentAdminId || 'default'}`, latestDiet.id)
  } else if (savedDietId !== latestDiet.id && adminAlertSettings.diet) {
    setUnreadDietCount((prev) => prev + 1)

    const nextAlert = {
      id: `diet-${latestDiet.id}`,
      type: 'diet',
      text: `새 식단기록이 등록되었습니다. (${latestDiet.member_name || latestDiet.member_id || '회원'})`,
      createdAt: Date.now(),
    }

    setAdminAlerts((prev) => [nextAlert, ...prev].slice(0, 20))

    if (adminAlertSettings.popup) {
      setMessage(`🍽️ 새 식단기록이 등록되었습니다.`)
    }

    if (adminAlertSettings.sound) {
      playAdminAlertSound()
    }

    localStorage.setItem(`admin_last_diet_${currentAdminId || 'default'}`, latestDiet.id)
  }
}
}, [inquiries, notices, workouts, dietLogs, adminAlertSettings, currentAdminId])

  
  useEffect(() => {
  const interval = setInterval(() => {
   loadInquiries()
loadNotices()
loadWorkouts()
loadDietLogs()
  }, 10000)

  return () => clearInterval(interval)
}, [currentAdminId])
  useEffect(() => {
  const saved = localStorage.getItem(`admin_alert_settings_${currentAdminId || 'default'}`)
  if (saved) {
    try {
      setAdminAlertSettings(JSON.parse(saved))
    } catch (error) {
      console.error('알림 설정 불러오기 실패:', error)
    }
  }
}, [currentAdminId])
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
    setRoutineForm(emptyRoutineForm)
    setSelectedRoutineWeek(0)
    setAdminNotes([])
    setMemberHealthLogs([])
    setAdminNoteInput('')
    return
  }

  loadRoutine(selectedMemberId)
  loadAdminNotes(selectedMemberId)
  loadHealthLogs(selectedMemberId)
}, [selectedMemberId])

  useEffect(() => {
    loadSalesSummary(saleMonth)
  }, [saleMonth])

const loadAdminSignupRequests = async () => {
  if (!profile?.is_super_admin) {
    setAdminSignupRequests([])
    return
  }

  setAdminSignupLoading(true)

  const { data, error } = await supabase
    .from('admin_signup_requests')
    .select('*')
    .eq('status', 'pending')
    

  if (error) {
    console.error('가입신청 목록 불러오기 실패:', error)
    setMessage(`가입신청 목록 불러오기 실패: ${error.message}`)
    setAdminSignupLoading(false)
    return
  }

  setAdminSignupRequests(data || [])
  setAdminSignupLoading(false)
}

const loadApprovedSignupRequests = async () => {
  if (!profile?.is_super_admin) {
    setApprovedSignupRequests([])
    return
  }

  const { data, error } = await supabase
    .from('admin_signup_requests')
    .select('*')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })

  if (error) {
    console.error('승인 내역 불러오기 실패:', error)
    setMessage(`승인 내역 불러오기 실패: ${error.message}`)
    return
  }

  setApprovedSignupRequests(data || [])
}

const loadRejectedSignupRequests = async () => {
  if (!profile?.is_super_admin) {
    setRejectedSignupRequests([])
    return
  }

  const { data, error } = await supabase
    .from('admin_signup_requests')
    .select('*')
    .eq('status', 'rejected')
    .order('rejected_at', { ascending: false })

  if (error) {
    console.error('거절 내역 불러오기 실패:', error)
    setMessage(`거절 내역 불러오기 실패: ${error.message}`)
    return
  }

  setRejectedSignupRequests(data || [])
}

const loadAdminAccounts = async () => {
  if (!profile?.is_super_admin) {
    setAdminAccounts([])
    return
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, account_status, approved_at, approved_by')
    .in('role', ['admin', 'super_admin'])
    .order('approved_at', { ascending: false })

  if (error) {
    console.error('관리자 계정 불러오기 실패:', error)
    setMessage(`관리자 계정 불러오기 실패: ${error.message}`)
    return
  }

  setAdminAccounts(data || [])
}

const loadAdminActionLogs = async () => {
  if (!profile?.is_super_admin) {
    setAdminActionLogs([])
    return
  }

  const { data, error } = await supabase
    .from('admin_account_action_logs')
    .select('*')
    .order('action_at', { ascending: false })

  if (error) {
    console.error('관리자 작업 이력 불러오기 실패:', error)
    setMessage(`관리자 작업 이력 불러오기 실패: ${error.message}`)
    return
  }

  setAdminActionLogs(data || [])
}

  
const handleApproveSignup = async (request) => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.access_token) {
      alert('로그인 세션을 확인할 수 없습니다. 다시 로그인해주세요.')
      return
    }

    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-admin-signup`

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        request_id: request.id,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('관리자 승인 함수 호출 실패:', result)
      alert(`승인 실패: ${result.error || '알 수 없는 오류'}`)
      return
    }

    if (result?.error) {
      console.error('관리자 승인 처리 실패:', result.error)
      alert(`승인 실패: ${result.error}`)
      return
    }

    setMessage('관리자 승인 및 계정 생성이 완료되었습니다.')
    await loadAdminSignupRequests()
  } catch (err) {
    console.error('handleApproveSignup 오류:', err)
    alert('승인 처리 중 오류가 발생했습니다.')
  }
}

const handleRejectSignup = async (request) => {
  const confirmOk = window.confirm('이 가입신청을 거절하시겠습니까?')
  if (!confirmOk) return

  const { error } = await supabase
    .from('admin_signup_requests')
    .update({ status: 'rejected' })
    .eq('id', request.id)

  if (error) {
    console.error('거절 실패:', error)
    setMessage(`거절 실패: ${error.message}`)
    return
  }

  setMessage('거절 처리되었습니다.')
  await loadAdminSignupRequests()
}

const callEdgeFunction = async (functionName, body) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    throw new Error('로그인 세션을 확인할 수 없습니다.')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result?.error || '알 수 없는 오류')
  }

  return result
}

const handleResetAdminPassword = async (admin) => {
  const confirmOk = window.confirm(`${admin.name || admin.email} 계정의 임시 비밀번호를 발급할까요?`)
  if (!confirmOk) return

  try {
    const result = await callEdgeFunction('reset-admin-password', {
      target_admin_id: admin.id,
    })

   alert(
  `임시 비밀번호 발급 완료\n\n이메일: ${admin.email}\n임시 비밀번호: ${result.temp_password}\n\n지금 복사해서 전달하세요.`
)

    await loadAdminActionLogs()
  } catch (error) {
    alert(`임시 비밀번호 발급 실패: ${error.message}`)
  }
}

const handleChangeAdminPassword = async (admin) => {
  const newPassword = prompt('새 비밀번호를 입력하세요')

  if (!newPassword) return

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data, error } = await supabase.functions.invoke('change-admin-password', {
    body: {
      target_admin_id: admin.id,
      new_password: newPassword,
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (error || data?.error) {
    alert('비밀번호 변경 실패')
    return
  }

  alert('비밀번호 변경 완료')
}

const handleDeactivateAdmin = async (admin) => {
  const confirmOk = window.confirm(`${admin.name || admin.email} 계정을 비활성화할까요?`)
  if (!confirmOk) return

  try {
    await callEdgeFunction('manage-admin-account', {
      target_admin_id: admin.id,
      action: 'deactivate',
      note: 'super_admin 수동 비활성화',
    })

    alert('관리자 계정이 비활성화되었습니다.')
    await loadAdminAccounts()
    await loadAdminActionLogs()
  } catch (error) {
    alert(`비활성화 실패: ${error.message}`)
  }
}

const handleDeleteAdmin = async (admin) => {
  const confirmOk = window.confirm(`${admin.name || admin.email} 계정을 완전히 삭제할까요?`)
  if (!confirmOk) return

  try {
    await callEdgeFunction('manage-admin-account', {
      target_admin_id: admin.id,
      action: 'delete',
      note: 'super_admin 수동 삭제',
    })

    alert('관리자 계정이 삭제되었습니다.')
    await loadAdminAccounts()
    await loadAdminActionLogs()
  } catch (error) {
    alert(`삭제 실패: ${error.message}`)
  }
}

  
  const loadAll = async () => {
  setLoading(true)
  setMessage('')

  try {
    const loaders = [
      ['loadMembers', () => loadMembers()],
      ['loadBrands', () => loadBrands()],
      ['loadExercises', () => loadExercises()],
      ['loadWorkouts', () => loadWorkouts()],
      ['loadDietLogs', () => loadDietLogs()],
      ['loadMemberLevels', () => loadMemberLevels()],
['loadMemberXpLogs', () => loadMemberXpLogs()],
['loadMemberLevelSettings', () => loadMemberLevelSettings()],
['loadMemberXpSettings', () => loadMemberXpSettings()],
      ['loadManuals', () => loadManuals()],
      ['loadCoaches', () => loadCoaches()],
      ['loadCoachSchedules', () => loadCoachSchedules()],
      ['loadCoachConditions', () => loadCoachConditions()],
['loadCoachReviews', () => loadCoachReviews()],
      ['loadPrograms', () => loadPrograms()],
      ['loadPartners', () => loadPartners()],
      ['loadMedicalPartners', () => loadMedicalPartners()],
      ['loadPartnerUsages', () => loadPartnerUsages()],
      ['loadSalesRecords', () => loadSalesRecords()],
      ['loadSalesLogs', () => loadSalesLogs()],
      ['loadSalesSummary', () => loadSalesSummary(saleMonth)],
      ['loadNotices', () => loadNotices()],
      ['loadCareerProfile', () => loadCareerProfile()],
      ['loadTrainerLevelSettings', () => loadTrainerLevelSettings()],
      ['loadInquiries', () => loadInquiries()],
            ['loadManagerActionLogs', () => loadManagerActionLogs()],
      ['loadManagerTaskChecks', () => loadManagerTaskChecks()],
      ['loadManagerGoalSettings', () => loadManagerGoalSettings()],
            ['loadAdminSignupRequests', () => loadAdminSignupRequests()],
      ['loadApprovedSignupRequests', () => loadApprovedSignupRequests()],
['loadRejectedSignupRequests', () => loadRejectedSignupRequests()],
['loadAdminAccounts', () => loadAdminAccounts()],
['loadAdminActionLogs', () => loadAdminActionLogs()],
    ]

    const results = await Promise.allSettled(
      loaders.map(([_, fn]) => fn())
    )

    const failed = results
      .map((result, index) => ({
        result,
        name: loaders[index][0],
      }))
      .filter((item) => item.result.status === 'rejected')

    if (failed.length > 0) {
      console.error('loadAll 실패 상세:', failed)
      setMessage('일부 데이터를 불러오지 못했습니다. 콘솔을 확인해주세요.')
    }
  } catch (error) {
    console.error('loadAll 전체 오류:', error)
    setMessage('데이터 불러오기 중 오류가 발생했습니다.')
  } finally {
    setLoading(false)
  }
}

 const loadMembers = async () => {
  if (!currentAdminId) {
    setMembers([])
    return
  }

  const { data, error } = await supabase
    .from('members')
    .select(`
      *,
      programs(id, name),
      member_levels(level_name, level_no, total_xp)
    `)
    .eq('admin_id', currentAdminId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('회원 불러오기 실패:', error)
    setMembers([])
    return
  }

  const normalizedMembers = Array.isArray(data)
    ? data.map((member) => ({
        ...member,
        member_levels: Array.isArray(member.member_levels)
          ? member.member_levels[0] || null
          : member.member_levels || null,
      }))
    : []

  setMembers(normalizedMembers)

  if (!selectedMemberId && normalizedMembers[0]) {
    setSelectedMemberId(normalizedMembers[0].id)
  }
}

  const loadHealthLogs = async (memberId) => {
    const { data } = await supabase
      .from('member_health_logs')
      .select('*')
      .eq('member_id', memberId)
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })

    const collapsed = {}
    ;(data || []).forEach((item) => {
      collapsed[item.id] = true
    })
    setMemberHealthLogs(data || [])
    setCollapsedHealthLogs(collapsed)
  }

  const loadAdminNotes = async (memberId) => {
    const { data } = await supabase
      .from('member_admin_notes')
      .select('*')
      .eq('member_id', memberId)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })

    setAdminNotes(data || [])
  }

const loadBrands = async () => {
  if (!currentAdminId) {
    setBrands([])
    return
  }

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('name', { ascending: true })

  console.log('loadBrands data:', data)
  console.log('loadBrands error:', error)

  if (error) {
    setMessage(`브랜드 목록 불러오기 실패: ${error.message}`)
    return
  }

  if (data) setBrands(data)
}

  const loadExercises = async () => {
  if (!currentAdminId) {
    setExercises([])
    return
  }

  const { data } = await supabase
    .from('exercises')
    .select('*, brands(id, name)')
    .eq('admin_id', currentAdminId)
    .order('body_part', { ascending: true })
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (data) {
    const collapsed = {}
    data.forEach((exercise) => {
      collapsed[exercise.id] = true
    })
    setExercises(data)
    setCollapsedExercises(collapsed)
  }
}

const loadWorkouts = async () => {
  if (!currentAdminId) {
    setWorkouts([])
    setWorkoutItemsMap({})
    setCollapsedWorkouts({})
    return
  }

  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('workout_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (workoutError) {
    console.error('운동 기록 불러오기 실패:', workoutError)
    return
  }

  const safeWorkoutData = Array.isArray(workoutData) ? workoutData : []

  let itemMap = {}
  const workoutIds = safeWorkoutData.map((workout) => workout.id)

  if (workoutIds.length > 0) {
    const { data: itemData, error: itemError } = await supabase
      .from('workout_items')
      .select('*')
      .in('workout_id', workoutIds)
      .order('sort_order', { ascending: true })

    if (itemError) {
      console.error('운동 상세항목 불러오기 실패:', itemError)
    }

    itemMap = (itemData || []).reduce((acc, item) => {
      if (!acc[item.workout_id]) acc[item.workout_id] = []
      acc[item.workout_id].push(item)
      return acc
    }, {})
  }

  setWorkouts(safeWorkoutData)
  setWorkoutItemsMap(itemMap)

  setCollapsedWorkouts((prev) => {
    const next = {}

    safeWorkoutData.forEach((workout) => {
      if (Object.prototype.hasOwnProperty.call(prev, workout.id)) {
        next[workout.id] = prev[workout.id]
      } else {
        next[workout.id] = true
      }
    })

    return next
  })
}

  const loadDietLogs = async () => {
  if (!currentAdminId) {
    setDietLogs([])
    return
  }

  const { data } = await supabase
    .from('diet_logs')
    .select('*')
    .eq('admin_id', currentAdminId)
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
const loadMemberLevels = async () => {
  if (!currentAdminId) {
    setMemberLevels([])
    return
  }

  const { data, error } = await supabase
    .from('member_levels')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('total_xp', { ascending: false })

  if (error) {
    console.error('member_levels 불러오기 실패:', error)
    setMessage(`회원 레벨 불러오기 실패: ${error.message}`)
    return
  }

  setMemberLevels(data || [])
}

const loadMemberXpLogs = async () => {
  if (!currentAdminId) {
    setMemberXpLogs([])
    return
  }

  const { data, error } = await supabase
    .from('member_xp_logs')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('member_xp_logs 불러오기 실패:', error)
    setMessage(`회원 XP 로그 불러오기 실패: ${error.message}`)
    return
  }

  setMemberXpLogs(data || [])
}

const loadMemberLevelSettings = async () => {
  if (!currentAdminId) {
    setMemberLevelSettings([])
    return
  }

  const { data, error } = await supabase
    .from('member_level_settings')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('level_no', { ascending: true })

  if (error) {
    console.error('member_level_settings 불러오기 실패:', error)
    setMessage(`회원 레벨 기준 불러오기 실패: ${error.message}`)
    return
  }

  setMemberLevelSettings(data || [])
}

const loadMemberXpSettings = async () => {
  if (!currentAdminId) {
    setMemberXpSettings([])
    return
  }

  const { data, error } = await supabase
    .from('member_xp_settings')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('rule_name', { ascending: true })

  if (error) {
    console.error('member_xp_settings 불러오기 실패:', error)
    setMessage(`회원 XP 기준 불러오기 실패: ${error.message}`)
    return
  }

  setMemberXpSettings(data || [])
}
  const loadRoutine = async (memberId) => {
  const { data, error } = await supabase
    .from('member_routines')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle()

  if (error || !data) {
    setRoutineForm(emptyRoutineForm)
    setSelectedRoutineWeek(0)
    return
  }

  if (data.routine_data && Array.isArray(data.routine_data.weeks)) {
    setRoutineForm({
      title: data.routine_data.title || data.title || '루틴',
      weeks: data.routine_data.weeks.map((week, weekIndex) => ({
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
              : [{ ...createEmptyRoutineItem() }],
        })),
      })),
    })
    setSelectedRoutineWeek(0)
    return
  }

  setRoutineForm(emptyRoutineForm)
  setSelectedRoutineWeek(0)
}

  const loadManuals = async () => {
    const { data } = await supabase.from('app_manuals').select('*').order('target_role')
    if (data) setManuals(data)
  }

  const loadCoaches = async () => {
  if (!currentAdminId) {
    setCoaches([])
    return
  }

  const { data } = await supabase
    .from('coaches')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('created_at', { ascending: true })

  if (data) {
    setCoaches(data)
    if (!selectedCoachId && data[0]) setSelectedCoachId(data[0].id)
  }
}

  const loadCoachSchedules = async () => {
  if (!currentAdminId) {
    setCoachSchedules([])
    setCoachScheduleSlotsMap({})
    return
  }

  const { data: scheduleData } = await supabase
    .from('coach_schedules')
    .select('*')
    .eq('admin_id', currentAdminId)
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

 const loadPrograms = async () => {
  if (!currentAdminId) {
    setPrograms([])
    return
  }

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('프로그램 불러오기 실패:', error)
    setMessage(`프로그램 불러오기 실패: ${error.message}`)
    return
  }

  setPrograms(data || [])
}

const loadPartners = async () => {
  if (!currentAdminId) {
    setPartners([])
    setSelectedPartnerId('')
    return
  }

  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('제휴업체 불러오기 실패:', error)
    setMessage(`제휴업체 불러오기 실패: ${error.message}`)
    return
  }

  const rows = data || []
  setPartners(rows)
  const uniqueCategories = [...new Set(rows.map((p) => p.category).filter(Boolean))]
setPartnerCategories(uniqueCategories)

  if (!selectedPartnerId && rows[0]) {
    setSelectedPartnerId(rows[0].id)
  }
}
  const loadMedicalPartners = async () => {
  if (!currentAdminId) {
    setMedicalPartners([])
    setMedicalPartnerCategories([])
    setSelectedMedicalPartnerId('')
    return
  }

  const { data, error } = await supabase
    .from('medical_partners')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('병의원·약국 소개 불러오기 실패:', error)
    setMessage(`병의원·약국 소개 불러오기 실패: ${error.message}`)
    return
  }

  const rows = data || []
  setMedicalPartners(rows)

  const uniqueCategories = [...new Set(rows.map((item) => item.category).filter(Boolean))]
  setMedicalPartnerCategories(uniqueCategories)

  if (!selectedMedicalPartnerId && rows[0]) {
    setSelectedMedicalPartnerId(rows[0].id)
  }
}
 const loadPartnerUsages = async () => {
  if (!currentAdminId) {
    setPartnerUsages([])
    return
  }

  const { data, error } = await supabase
    .from('partner_usage')
    .select(`
      *,
      members(id, name, access_code),
      partners(id, name)
    `)
    .order('requested_at', { ascending: false })

  if (error) {
    console.error('제휴 사용요청 불러오기 실패:', error)
    setMessage(`제휴 사용요청 불러오기 실패: ${error.message}`)
    return
  }

  setPartnerUsages(data || [])
}

 const loadSalesRecords = async () => {
  if (!currentAdminId) {
    setSalesRecords([])
    setCollapsedSales({})
    return []
  }

  const { data, error } = await supabase
    .from('sales_records')
    .select('*, members(id, name), programs(id, name)')
    .eq('admin_id', currentAdminId)
    .order('sale_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('매출 기록 불러오기 실패:', error)
    setMessage(`매출 기록 불러오기 실패: ${error.message}`)
    return []
  }

  const rows = data || []
  const collapsed = {}

  rows.forEach((sale) => {
    collapsed[sale.id] = true
  })

  setSalesRecords(rows)
  setCollapsedSales(collapsed)

  return rows
}
const loadSalesSummary = async (month) => {
  if (!currentAdminId) {
    setSalesSummary(null)
    return
  }

  const [year, monthNumber] = month.split('-').map(Number)
  const startDate = `${month}-01`

  const nextMonthDate = new Date(year, monthNumber, 1)
  const nextYear = nextMonthDate.getFullYear()
  const nextMonth = String(nextMonthDate.getMonth() + 1).padStart(2, '0')
  const endDate = `${nextYear}-${nextMonth}-01`

  const { data, error } = await supabase
    .from('sales_records')
    .select('*')
    .eq('admin_id', currentAdminId)
    .gte('sale_date', startDate)
    .lt('sale_date', endDate)

  if (error) {
    throw error
  }

  const rows = data || []

  const summary = {
  total_sales: rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
  total_count: rows.length,
  vip_sales_count: rows.filter((row) => row.is_vip).length,
  cash_sales: rows
    .filter((row) => row.payment_method === '현금')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0),
  card_sales: rows
    .filter((row) => row.payment_method === '카드')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0),
  transfer_sales: rows
    .filter((row) => row.payment_method === '이체')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0),
  installment_sales: rows
    .filter((row) => row.payment_method === '할부')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0),
}

  setSalesSummary(summary)
}
  const loadCoachConditions = async () => {
  if (!currentAdminId) {
    setCoachConditions([])
    return
  }

  const { data, error } = await supabase
    .from('coach_condition_logs')
    .select('*, coaches(id, name)')
    .eq('admin_id', currentAdminId)
    .order('check_month', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('코치 컨디션 불러오기 실패:', error)
    setMessage(`코치 컨디션 불러오기 실패: ${error.message}`)
    return
  }

  setCoachConditions(data || [])
}

const loadCoachReviews = async () => {
  if (!currentAdminId) {
    setCoachReviews([])
    return
  }

  const { data, error } = await supabase
    .from('coach_monthly_reviews')
    .select('*, coaches(id, name)')
    .eq('admin_id', currentAdminId)
    .order('review_month', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('코치 평가 불러오기 실패:', error)
    setMessage(`코치 평가 불러오기 실패: ${error.message}`)
    return
  }

  setCoachReviews(data || [])
}
 const loadSalesLogs = async () => {
   console.log('🔥 adminId 확인:', currentAdminId)
  if (!currentAdminId) {
    setSalesLogs([])
    setCollapsedSalesLogs({})
    return
  }

  const { data, error } = await supabase
    .from('sales_logs')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('log_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  if (data) {
    const collapsed = {}
    data.forEach((log) => {
      collapsed[log.id] = true
    })
    setSalesLogs(data)
    setCollapsedSalesLogs(collapsed)
  }
}

  const loadNotices = async () => {
  if (!currentAdminId) {
    setNotices([])
    return
  }

  const { data } = await supabase
    .from('notices')
    .select('*')
    .eq('admin_id', currentAdminId)
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
  if (!currentAdminId) {
    setInquiries([])
    setCollapsedInquiries({})
    return
  }

  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .eq('admin_id', currentAdminId)
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
  
const updateAdminAlertSetting = (key, value) => {
  setAdminAlertSettings((prev) => {
    const next = { ...prev, [key]: value }
    localStorage.setItem(
      `admin_alert_settings_${currentAdminId || 'default'}`,
      JSON.stringify(next)
    )
    return next
  })
}

const removeAdminAlert = (alertId) => {
  setAdminAlerts((prev) => prev.filter((item) => item.id !== alertId))
}

const clearAdminAlerts = () => {
  setAdminAlerts([])
  setUnreadInquiryCount(0)
  setUnreadNoticeCount(0)
}

const filteredAdminAlerts = adminAlerts.filter((alert) =>
  String(alert.text || '')
    .toLowerCase()
    .includes(String(adminAlertSearch || '').trim().toLowerCase())
)
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
  start_date: memberForm.start_date || null,
  end_date: memberForm.end_date || null,
  memo: memberForm.memo?.trim() || '',
  access_code: (memberForm.access_code || randomCode()).trim().toUpperCase(),
  current_program_id: memberForm.current_program_id || null,
  admin_id: currentAdminId || null,
  gym_id: currentGymId || null,
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
      current_program_id: member.current_program_id || '',
    })
  }

  const handleMemberDelete = async (memberId) => {
    if (!window.confirm('회원을 삭제할까요?')) return
    await supabase.from('members').delete().eq('id', memberId)
    if (selectedMemberId === memberId) {
      setSelectedMemberId('')
      resetMemberForm()
     setRoutineForm(emptyRoutineForm)
      setAdminNotes([])
      setMemberHealthLogs([])
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

  const handleAdminNoteSave = async () => {
    if (!selectedMemberId || !adminNoteInput.trim()) {
      setMessage('회원과 메모 내용을 확인해주세요.')
      return
    }

    const { error } = await supabase.from('member_admin_notes').insert({
      member_id: selectedMemberId,
      admin_id: currentAdminId || null,
      note: adminNoteInput.trim(),
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setAdminNoteInput('')
    await loadAdminNotes(selectedMemberId)
    setMessage('관리자 메모가 저장되었습니다.')
  }

  const handleAdminNoteDelete = async (noteId) => {
    if (!window.confirm('이 메모를 삭제할까요?')) return
    await supabase.from('member_admin_notes').delete().eq('id', noteId)
    await loadAdminNotes(selectedMemberId)
    setMessage('관리자 메모가 삭제되었습니다.')
  }

  const normalizeRoutineSets = (sets = []) => {
  return sets
    .filter((setRow) => setRow.kg !== '' || setRow.reps !== '')
    .map((setRow) => ({
      kg: String(setRow.kg ?? ''),
      reps: String(setRow.reps ?? ''),
    }))
}

const buildRoutinePayload = (form) => {
  const weeks = Array.isArray(form.weeks) ? form.weeks : []

  return {
    title: form.title || '',
    weeks: weeks.map((week, weekIndex) => ({
      week_number: week.week_number || weekIndex + 1,
      days: (week.days || []).map((day) => ({
        day_of_week: day.day_of_week,
        items: (day.items || []).map((item) => ({
          exercise_id: item.exercise_id || null,
          exercise_name_snapshot: item.exercise_name_snapshot || '',
          duration_minutes: item.duration_minutes || null,
          memo: item.memo || '',
          sets: (item.sets || []).map((setRow) => ({
            kg: setRow.kg || '',
            reps: setRow.reps || '',
          })),
        })),
      })),
    })),
  }
}

const buildRoutineContent = (form) => {
  const weeks = Array.isArray(form.weeks) ? form.weeks : []

  return weeks
    .map((week, weekIndex) => {
      const days = Array.isArray(week.days) ? week.days : []

      const dayText = days
        .map((day) => {
          const items = Array.isArray(day.items) ? day.items : []

          const itemText = items
            .map((item, itemIndex) => {
              const sets = Array.isArray(item.sets) ? item.sets : []

              const setText = sets
                .map((setRow, setIndex) => {
                  const kg = setRow.kg || '-'
                  const reps = setRow.reps || '-'
                  return `    - ${setIndex + 1}세트: ${kg}kg / ${reps}회`
                })
                .join('\n')

              return [
                `  ${itemIndex + 1}. ${item.exercise_name_snapshot || '운동명 없음'}`,
                item.duration_minutes ? `    - 시간: ${item.duration_minutes}분` : '',
                item.memo ? `    - 메모: ${item.memo}` : '',
                setText,
              ]
                .filter(Boolean)
                .join('\n')
            })
            .join('\n')

          return `${day.day_of_week}\n${itemText || '  - 운동 없음'}`
        })
        .join('\n\n')

      return `${week.week_number || weekIndex + 1}주차\n${dayText}`
    })
    .join('\n\n')
}

const handleRoutineSave = async () => {
  try {
    if (!selectedMemberId) {
      setMessage('루틴을 저장할 회원을 먼저 선택해주세요.')
      return
    }

    if (!routineForm || !Array.isArray(routineForm.weeks)) {
      setMessage('루틴 데이터 구조가 올바르지 않습니다.')
      return
    }

    const payloadData = buildRoutinePayload(routineForm)

    if (!payloadData || !Array.isArray(payloadData.weeks)) {
      setMessage('루틴 payload 생성에 실패했습니다.')
      return
    }

    const hasAnyItem = payloadData.weeks.some((week) =>
      (week.days || []).some((day) => (day.items || []).length > 0)
    )

    if (!hasAnyItem) {
      setMessage('최소 1개 이상의 루틴 운동을 입력해주세요.')
      return
    }

    const routineContent = buildRoutineContent(routineForm)

    const payload = {
      member_id: selectedMemberId,
      title: routineForm.title?.trim() || '루틴',
      content: routineContent,
      routine_data: payloadData,
      admin_id: currentAdminId || null,
      gym_id: currentGymId || null,
    }

    const { data: existingRoutine, error: existingError } = await supabase
      .from('member_routines')
      .select('id')
      .eq('member_id', selectedMemberId)
      .maybeSingle()

    if (existingError) {
      setMessage(`루틴 확인 실패: ${existingError.message}`)
      return
    }

    if (existingRoutine?.id) {
      const { error } = await supabase
        .from('member_routines')
        .update(payload)
        .eq('id', existingRoutine.id)

      if (error) {
        setMessage(`루틴 수정 실패: ${error.message}`)
        return
      }

      setMessage('루틴이 수정되었습니다.')
    } else {
      const { error } = await supabase
        .from('member_routines')
        .insert(payload)

      if (error) {
        setMessage(`루틴 저장 실패: ${error.message}`)
        return
      }

      setMessage('루틴이 저장되었습니다.')
    }
  } catch (error) {
    console.error('handleRoutineSave catch error:', error)
    setMessage(`루틴 저장 중 오류: ${error.message}`)
  }
}


  const handleRoutineDelete = async () => {
    if (!selectedMemberId) {
      setMessage('삭제할 회원을 먼저 선택해주세요.')
      return
    }
    if (!window.confirm('이 회원의 루틴을 삭제할까요?')) return

    await supabase.from('member_routines').delete().eq('member_id', selectedMemberId)
    setRoutineForm(emptyRoutineForm)
    setMessage('루틴이 삭제되었습니다.')
  }

  const resetWorkoutForm = () => {
  setWorkoutForm({
    ...emptyWorkoutForm,
    items: [{ ...emptyWorkoutItem, sub_exercises: [createEmptySubExercise(), createEmptySubExercise()] }],
  })
}
const addPainLog = () => {
  setWorkoutForm((prev) => ({
    ...prev,
    pain_enabled: true,
    pain_logs: [...(prev.pain_logs || []), { ...emptyPainLog }],
  }))
}

const updatePainLog = (index, field, value) => {
  setWorkoutForm((prev) => {
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

const removePainLog = (index) => {
  setWorkoutForm((prev) => {
    const currentPainLogs = [...(prev.pain_logs || [])]
    const nextPainLogs = currentPainLogs.filter((_, idx) => idx !== index)

    return {
      ...prev,
      pain_logs: nextPainLogs,
      pain_enabled: nextPainLogs.length > 0,
    }
  })
}
const updateWorkoutItemField = (itemIndex, field, value) => {
  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    nextItems[itemIndex] = {
      ...nextItems[itemIndex],
      [field]: value,
    }
    return { ...prev, items: nextItems }
  })
}

const toggleWorkoutItemCollapse = (itemIndex) => {
  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    nextItems[itemIndex] = {
      ...nextItems[itemIndex],
      collapsed: !nextItems[itemIndex].collapsed,
    }
    return { ...prev, items: nextItems }
  })
}
const updateWorkoutEntryType = (itemIndex, entryType) => {
  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

    const isPainOnly = entryType === 'pain_only'

    nextItems[itemIndex] = {
      ...currentItem,
      entry_type: entryType,
      is_cardio: entryType === 'cardio',
      training_method: entryType === 'strength' ? currentItem.training_method || 'normal' : 'normal',
      cardio_minutes: entryType === 'cardio' ? currentItem.cardio_minutes || '' : '',
      care_minutes: entryType === 'care' ? currentItem.care_minutes || '' : '',
      stretch_minutes: entryType === 'stretching' ? currentItem.stretch_minutes || '' : '',
      stretch_reps: entryType === 'stretching' ? currentItem.stretch_reps || '' : '',
      sets:
        entryType === 'strength'
          ? (currentItem.sets?.length ? currentItem.sets : [createEmptySet()])
          : [createEmptySet()],
      sub_exercises:
        entryType === 'strength' && currentItem.training_method === 'superset'
          ? currentItem.sub_exercises?.length
            ? currentItem.sub_exercises
            : [createEmptySubExercise(), createEmptySubExercise()]
          : [createEmptySubExercise(), createEmptySubExercise()],
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
const updateWorkoutTrainingMethod = (itemIndex, method) => {
  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

    nextItems[itemIndex] = {
      ...currentItem,
      entry_type: 'strength',
      is_cardio: false,
      cardio_minutes: '',
      care_minutes: '',
      training_method: method,
      sets: currentItem.sets?.length ? currentItem.sets : [createEmptySet()],
      sub_exercises:
        method === 'superset'
          ? currentItem.sub_exercises?.length
            ? currentItem.sub_exercises
            : [createEmptySubExercise(), createEmptySubExercise()]
          : [createEmptySubExercise(), createEmptySubExercise()],
    }

    return { ...prev, items: nextItems }
  })
}

const updateWorkoutItemSelect = (itemIndex, exerciseId) => {
  const found = exercises.find((exercise) => String(exercise.id) === String(exerciseId))
  const inferredEntryType = inferExerciseEntryType(found)

  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

    nextItems[itemIndex] = {
      ...currentItem,
      exercise_id: found?.id || '',
      equipment_name_snapshot: found?.name || '',
      performed_name: currentItem.performed_name || found?.name || '',
      exercise_name_snapshot: currentItem.performed_name || found?.name || '',
      entry_type: inferredEntryType,
      is_cardio: inferredEntryType === 'cardio',
      cardio_minutes: inferredEntryType === 'cardio' ? currentItem.cardio_minutes || '' : '',
      care_minutes: inferredEntryType === 'care' ? currentItem.care_minutes || '' : '',
      training_method: inferredEntryType === 'strength' ? currentItem.training_method || 'normal' : 'normal',
      sets:
        inferredEntryType === 'strength'
          ? currentItem.sets?.length
            ? currentItem.sets
            : [createEmptySet()]
          : [createEmptySet()],
    }

    return { ...prev, items: nextItems }
  })
}

const updateWorkoutItemName = (itemIndex, value) => {
  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    nextItems[itemIndex] = {
      ...nextItems[itemIndex],
      performed_name: value,
      exercise_name_snapshot: value,
    }
    return { ...prev, items: nextItems }
  })
}

const updateWorkoutSubExerciseSelect = (itemIndex, subIndex, exerciseId) => {
  const found = exercises.find((exercise) => String(exercise.id) === String(exerciseId))

  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]
    const nextSubs = [...(currentItem.sub_exercises || [createEmptySubExercise(), createEmptySubExercise()])]

    nextSubs[subIndex] = {
      ...nextSubs[subIndex],
      exercise_id: found?.id || '',
      equipment_name_snapshot: found?.name || '',
      performed_name: nextSubs[subIndex].performed_name || found?.name || '',
      exercise_name_snapshot: nextSubs[subIndex].performed_name || found?.name || '',
    }

    nextItems[itemIndex] = {
      ...currentItem,
      sub_exercises: nextSubs,
    }

    return { ...prev, items: nextItems }
  })
}

const updateWorkoutSubExerciseName = (itemIndex, subIndex, value) => {
  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]
    const nextSubs = [...(currentItem.sub_exercises || [createEmptySubExercise(), createEmptySubExercise()])]

    nextSubs[subIndex] = {
      ...nextSubs[subIndex],
      performed_name: value,
      exercise_name_snapshot: value,
    }

    nextItems[itemIndex] = {
      ...currentItem,
      sub_exercises: nextSubs,
    }

    return { ...prev, items: nextItems }
  })
}

const addWorkoutItem = () => {
  setWorkoutForm((prev) => ({
    ...prev,
    items: [
      ...prev.items,
      {
        ...emptyWorkoutItem,
        sub_exercises: [createEmptySubExercise(), createEmptySubExercise()],
      },
    ],
  }))
}

const removeWorkoutItem = (itemIndex) => {
  setWorkoutForm((prev) => ({
    ...prev,
    items:
      prev.items.length === 1
        ? [{ ...emptyWorkoutItem, sub_exercises: [createEmptySubExercise(), createEmptySubExercise()] }]
        : prev.items.filter((_, idx) => idx !== itemIndex),
  }))
}

const addSet = (itemIndex, subIndex = null) => {
  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

    if (currentItem.training_method === 'superset' && subIndex !== null) {
      const nextSubs = [...currentItem.sub_exercises]
      nextSubs[subIndex] = {
        ...nextSubs[subIndex],
        sets: [...(nextSubs[subIndex].sets || []), createEmptySet()],
      }

      nextItems[itemIndex] = {
        ...currentItem,
        sub_exercises: nextSubs,
      }
    } else {
      nextItems[itemIndex] = {
        ...currentItem,
        sets: [...(currentItem.sets || []), createEmptySet()],
      }
    }

    return { ...prev, items: nextItems }
  })
}

const removeSet = (itemIndex, setIndex, subIndex = null) => {
  setWorkoutForm((prev) => {
    const nextItems = [...prev.items]
    const currentItem = nextItems[itemIndex]

    if (currentItem.training_method === 'superset' && subIndex !== null) {
      const nextSubs = [...currentItem.sub_exercises]
      const currentSets = nextSubs[subIndex].sets || [createEmptySet()]

      nextSubs[subIndex] = {
        ...nextSubs[subIndex],
        sets:
          currentSets.length === 1
            ? [createEmptySet()]
            : currentSets.filter((_, idx) => idx !== setIndex),
      }

      nextItems[itemIndex] = {
        ...currentItem,
        sub_exercises: nextSubs,
      }
    } else {
      const currentSets = currentItem.sets || [createEmptySet()]
      nextItems[itemIndex] = {
        ...currentItem,
        sets:
          currentSets.length === 1
            ? [createEmptySet()]
            : currentSets.filter((_, idx) => idx !== setIndex),
      }
    }

    return { ...prev, items: nextItems }
  })
}

const updateSetValue = (itemIndex, setIndex, field, value, subIndex = null) => {
  setWorkoutForm((prev) => {
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

  const handleWorkoutSubmit = async (e) => {
  e.preventDefault()

  if (!workoutForm.member_id) {
    setMessage('회원을 선택해주세요.')
    return
  }

  const hasPainOnlyItem = workoutForm.items.some((item) => item.entry_type === 'pain_only')

  const cleanedItems = workoutForm.items
    .filter((item) => {
      if (item.entry_type === 'pain_only') {
        return false
      }

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
          (sub) => (sub.performed_name || sub.exercise_name_snapshot || sub.equipment_name_snapshot || '').trim(),
        )
      }

      return (item.performed_name || item.exercise_name_snapshot || item.equipment_name_snapshot || '').trim()
    })
    .map((item, index) => ({
      workout_id: workoutForm.id || null,
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
              .filter((sub) => (sub.performed_name || sub.exercise_name_snapshot || sub.equipment_name_snapshot || '').trim())
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

  if (cleanedItems.length === 0 && !(workoutForm.pain_enabled && (workoutForm.pain_logs || []).length > 0) && !hasPainOnlyItem) {
    setMessage('최소 1개의 운동 또는 통증기록을 입력해주세요.')
    return
  }

  const payload = {
    member_id: workoutForm.member_id,
    workout_date: workoutForm.workout_date,
    workout_type: workoutForm.workout_type,
    good: workoutForm.good?.trim() || '',
    improve: workoutForm.improve?.trim() || '',
    pain_enabled: !!workoutForm.pain_enabled,
    pain_logs: workoutForm.pain_enabled ? (workoutForm.pain_logs || []) : [],
    created_by: profile?.id || null,
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
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

  if (cleanedItems.length > 0) {
    await supabase.from('workout_items').insert(
      cleanedItems.map((item) => ({
        ...item,
        workout_id: targetWorkoutId,
      })),
    )
  }

  await loadWorkouts()

  if (!workoutForm.id && workoutForm.workout_type === 'pt') {
    await applyMemberXp({
      memberId: workoutForm.member_id,
      sourceType: 'pt_workout',
      sourceId: targetWorkoutId,
      sourceDate: workoutForm.workout_date,
      note: '관리자 PT 운동기록 저장',
    })
  }

  if (!workoutForm.id && workoutForm.workout_type === 'personal') {
    await applyMemberXp({
      memberId: workoutForm.member_id,
      sourceType: 'personal_workout',
      sourceId: targetWorkoutId,
      sourceDate: workoutForm.workout_date,
      note: '관리자 개인운동기록 저장',
    })
  }

  if (workoutForm.workout_type === 'pt') {
    const { data: freshWorkouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('member_id', workoutForm.member_id)

    const freshPtCount = (freshWorkouts || []).filter((workout) => workout.workout_type === 'pt').length

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
    pain_enabled: !!workout.pain_enabled,
    pain_logs: workout.pain_logs || [],
    items:
      items.length > 0
        ? items.map((item) => ({
            exercise_id: item.exercise_id || '',
            exercise_name_snapshot: item.exercise_name_snapshot || '',
            equipment_name_snapshot: item.equipment_name_snapshot || item.exercise_name_snapshot || '',
            performed_name: item.performed_name || item.exercise_name_snapshot || '',
            entry_type: item.entry_type || (item.is_cardio ? 'cardio' : 'strength'),
            is_cardio: !!item.is_cardio,
            cardio_minutes: item.cardio_minutes || '',
            care_minutes: item.care_minutes || '',
            stretch_minutes: item.stretch_minutes || '',
            stretch_reps: item.stretch_reps || '',
            sets:
              !item.is_cardio &&
              item.entry_type !== 'care' &&
              item.entry_type !== 'stretching' &&
              Array.isArray(item.sets) &&
              item.sets.length > 0
                ? item.sets
                : [createEmptySet()],
            training_method: item.training_method || 'normal',
            method_note: item.method_note || '',
            sub_exercises:
              item.training_method === 'superset' && Array.isArray(item.sub_exercises) && item.sub_exercises.length > 0
                ? item.sub_exercises.map((sub) => ({
                    exercise_id: sub.exercise_id || '',
                    exercise_name_snapshot: sub.exercise_name_snapshot || '',
                    equipment_name_snapshot: sub.equipment_name_snapshot || sub.exercise_name_snapshot || '',
                    performed_name: sub.performed_name || sub.exercise_name_snapshot || '',
                    sets: Array.isArray(sub.sets) && sub.sets.length > 0 ? sub.sets : [createEmptySet()],
                  }))
                : [createEmptySubExercise(), createEmptySubExercise()],
            collapsed: false,
          }))
        : [{ ...emptyWorkoutItem, sub_exercises: [createEmptySubExercise(), createEmptySubExercise()] }],
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

      const freshPtCount = (freshWorkouts || []).filter((item) => item.workout_type === 'pt').length

      await supabase.from('members').update({ used_sessions: freshPtCount }).eq('id', workout.member_id)
      await loadMembers()
    }

    setMessage('운동 기록이 삭제되었습니다.')
  }

  const handleBrandSubmit = async (e) => {
  e.preventDefault()
  setMessage('')

  const trimmedName = brandForm.name.trim()
  if (!trimmedName) {
    setMessage('브랜드명을 입력해주세요.')
    return
  }

  if (editingBrandId) {
    const { error } = await supabase
      .from('brands')
      .update({
        name: trimmedName,
      })
      .eq('id', editingBrandId)

    if (error) {
      console.error('브랜드 수정 error:', error)
      setMessage(`브랜드 수정 실패: ${error.message}`)
      return
    }

    setMessage('브랜드가 수정되었습니다.')
  } else {
    const { data, error } = await supabase
      .from('brands')
      .insert({
        name: trimmedName,
        admin_id: currentAdminId || null,
        gym_id: currentGymId || null,
      })
      .select()

    console.log('브랜드 추가 data:', data)
    console.log('브랜드 추가 error:', error)

    if (error) {
      setMessage(`브랜드 추가 실패: ${error.message}`)
      return
    }

    setMessage('브랜드가 추가되었습니다.')
  }

  setBrandForm({ name: '' })
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
    guide_text: exerciseForm.guide_text?.trim() || '',
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  if (!payload.name) {
    setMessage('운동명(기구명)을 입력해주세요.')
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
const handleDeleteAllExercises = async () => {
  const confirmed = window.confirm('운동 데이터를 전부 삭제할까요? 되돌릴 수 없습니다.')

  if (!confirmed) return

  try {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('gym_id', currentGymId)

    if (error) throw error

    setMessage('운동 데이터 전체삭제 완료')
    await loadAll()
  } catch (error) {
    console.error(error)
    setMessage('삭제 중 오류 발생')
  }
}
  const handleBulkExerciseInsert = async () => {
    const lines = bulkExerciseText.split('\n').map((line) => line.trim()).filter(Boolean)
    if (lines.length === 0) {
      setMessage('일괄 입력할 내용을 넣어주세요.')
      return
    }

    const brandMap = new Map(brands.map((brand) => [brand.name, brand.id]))
    const rowsToInsert = []

    for (const line of lines) {
      const [brandNameRaw, nameRaw, bodyPartRaw, categoryRaw] = line.split('|')
      const brandName = (brandNameRaw || '').trim()
      const name = (nameRaw || '').trim()
      const body_part = (bodyPartRaw || '').trim()
      const category = (categoryRaw || '').trim()
      if (!name) continue

      let brandId = null

      if (brandName) {
        if (!brandMap.has(brandName)) {
          const { data: newBrand, error } = await supabase
            .from('brands')
            .insert({
  name: brandName,
  admin_id: currentAdminId || null,
  gym_id: currentGymId || null,
})
            .select()
            .single()

          if (!error && newBrand) {
            brandMap.set(brandName, newBrand.id)
          }
        }
        brandId = brandMap.get(brandName) || null
      }

     rowsToInsert.push({
  name,
  body_part,
  category,
  brand_id: brandId,
  admin_id: currentAdminId || null,
  gym_id: currentGymId || null,
})
    }

    if (rowsToInsert.length === 0) {
      setMessage('입력 가능한 운동 데이터가 없습니다.')
      return
    }

    const { error } = await supabase.from('exercises').insert(rowsToInsert)
    if (error) {
      setMessage(error.message)
      return
    }

    await loadBrands()
    await loadExercises()
    setMessage(`${rowsToInsert.length}개의 운동이 일괄 등록되었습니다.`)
  }

  const handleDietFeedbackSave = async (dietId, payload) => {
    await supabase.from('diet_logs').update(payload).eq('id', dietId)
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

  const resetScheduleForm = () => {
    setScheduleForm({
      schedule_date: new Date().toISOString().slice(0, 10),
      is_working: true,
      is_weekend_work: false,
      work_start: '09:00',
      work_end: '18:00',
      memo: '',
      selectedSlots: ['10:00', '11:00', '14:00', '15:00'],
    })
  }

  const toggleScheduleSlot = (time) => {
    setScheduleForm((prev) => {
      const exists = prev.selectedSlots.includes(time)
      return {
        ...prev,
        selectedSlots: exists
          ? prev.selectedSlots.filter((slot) => slot !== time)
          : [...prev.selectedSlots, time].sort(),
      }
    })
  }

  const handleScheduleSave = async () => {
    if (!selectedCoachId) {
      setMessage('코치를 먼저 선택해주세요.')
      return
    }

    if (!scheduleForm.schedule_date) {
      setMessage('날짜를 선택해주세요.')
      return
    }

    const payload = {
  coach_id: selectedCoachId,
  schedule_date: scheduleForm.schedule_date,
  is_working: scheduleForm.is_working,
  is_weekend_work: scheduleForm.is_weekend_work,
  work_start: scheduleForm.is_working ? scheduleForm.work_start || null : null,
  work_end: scheduleForm.is_working ? scheduleForm.work_end || null : null,
  memo: scheduleForm.memo?.trim() || '',
  admin_id: currentAdminId || null,
  gym_id: currentGymId || null,
}

    const { data: existing } = await supabase
      .from('coach_schedules')
      .select('id')
      .eq('coach_id', selectedCoachId)
      .eq('schedule_date', scheduleForm.schedule_date)
      .maybeSingle()

    let scheduleId = existing?.id || null

    if (scheduleId) {
      await supabase.from('coach_schedules').update(payload).eq('id', scheduleId)
      await supabase.from('coach_schedule_slots').delete().eq('schedule_id', scheduleId)
    } else {
      const { data } = await supabase.from('coach_schedules').insert(payload).select().single()
      scheduleId = data.id
    }

    if (scheduleForm.is_working && scheduleForm.selectedSlots.length > 0) {
      await supabase.from('coach_schedule_slots').insert(
        scheduleForm.selectedSlots.map((slot) => ({
          schedule_id: scheduleId,
          slot_time: slot,
          is_available: true,
          note: '',
        })),
      )
    }

    await loadCoachSchedules()
    setMessage('코치 스케줄이 저장되었습니다.')
    resetScheduleForm()
  }

  const handleScheduleEdit = (schedule) => {
    const slots = coachScheduleSlotsMap[schedule.id] || []
    setSelectedCoachId(schedule.coach_id)
    setScheduleForm({
      schedule_date: schedule.schedule_date,
      is_working: schedule.is_working,
      is_weekend_work: schedule.is_weekend_work,
      work_start: schedule.work_start || '09:00',
      work_end: schedule.work_end || '18:00',
      memo: schedule.memo || '',
      selectedSlots: slots.filter((slot) => slot.is_available).map((slot) => slot.slot_time),
    })
    setActiveTab('코치스케줄')
  }

  const handleScheduleDelete = async (scheduleId) => {
    if (!window.confirm('이 스케줄을 삭제할까요?')) return
    await supabase.from('coach_schedules').delete().eq('id', scheduleId)
    await loadCoachSchedules()
    setMessage('코치 스케줄이 삭제되었습니다.')
  }

  const resetProgramForm = () => {
    setProgramForm(emptyProgramForm)
    setEditingProgramId(null)
  }

  
  const handleProgramSubmit = async (e) => {
  e.preventDefault()

  const payload = {
    name: programForm.name?.trim() || '',
    price: Number(programForm.price) || 0,
    session_count: Number(programForm.session_count) || 0,
    description: programForm.description?.trim() || '',
    is_vip: !!programForm.is_vip,
    is_active: !!programForm.is_active,
    is_recommended: !!programForm.is_recommended,
    is_popular: !!programForm.is_popular,
    is_visible_to_members: programForm.is_visible_to_members !== false,
    display_order: Number(programForm.display_order || 0),
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  if (!payload.name) {
    setMessage('프로그램명을 입력해주세요.')
    return
  }

  const query = editingProgramId
    ? supabase.from('programs').update(payload).eq('id', editingProgramId)
    : supabase.from('programs').insert(payload)

  const { error } = await query

  if (error) {
    console.error('프로그램 저장 실패:', error)
    setMessage(`프로그램 저장 실패: ${error.message}`)
    return
  }

  setMessage(editingProgramId ? '프로그램이 수정되었습니다.' : '프로그램이 추가되었습니다.')
  resetProgramForm()
  await loadPrograms()
  await loadMembers()
}
const handlePartnerSubmit = async (e) => {
  e.preventDefault()
  setMessage('')

  const payload = {
    name: partnerForm.name?.trim() || '',
    category: partnerForm.category || '카페',
    description: partnerForm.description?.trim() || '',
    benefit: partnerForm.benefit?.trim() || '',
    usage_condition: partnerForm.usage_condition?.trim() || '',
    usage_guide: partnerForm.usage_guide?.trim() || '',
    caution: partnerForm.caution?.trim() || '',
    address: partnerForm.address?.trim() || '',
    phone: partnerForm.phone?.trim() || '',
    business_hours: partnerForm.business_hours?.trim() || '',
    manager_name: partnerForm.manager_name?.trim() || '',
    manager_phone: partnerForm.manager_phone?.trim() || '',
    monthly_limit: Number(partnerForm.monthly_limit) || 0,
    vip_extra_limit: Number(partnerForm.vip_extra_limit) || 0,
    approval_required: !!partnerForm.approval_required,
    is_active: !!partnerForm.is_active,
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  if (!payload.name) {
    setMessage('제휴업체명을 입력해주세요.')
    return
  }

  if (editingPartnerId) {
    const { error } = await supabase
      .from('partners')
      .update(payload)
      .eq('id', editingPartnerId)

    if (error) {
      setMessage(`제휴업체 수정 실패: ${error.message}`)
      return
    }

    setMessage('제휴업체가 수정되었습니다.')
  } else {
    const { error } = await supabase
      .from('partners')
      .insert(payload)

    if (error) {
      setMessage(`제휴업체 추가 실패: ${error.message}`)
      return
    }

    setMessage('제휴업체가 추가되었습니다.')
  }

  setPartnerForm(emptyPartnerForm)
  setEditingPartnerId(null)
  await loadPartners()
}
  const handleProgramEdit = (program) => {
  setEditingProgramId(program.id)
  setProgramForm({
    id: program.id,
    name: program.name || '',
    price: program.price || '',
    session_count: program.session_count || '',
    description: program.description || '',
    is_vip: !!program.is_vip,
    is_active: !!program.is_active,
    is_recommended: !!program.is_recommended,
    is_popular: !!program.is_popular,
    is_visible_to_members: program.is_visible_to_members !== false,
    display_order: program.display_order ?? 0,
  })
}
  const handleMedicalPartnerSubmit = async (e) => {
  e.preventDefault()

  const payload = {
    name: medicalPartnerForm.name?.trim() || '',
    category: medicalPartnerForm.category?.trim() || '',
    place_type: medicalPartnerForm.place_type?.trim() || '',
    short_description: medicalPartnerForm.short_description?.trim() || '',
    recommend_reason: medicalPartnerForm.recommend_reason?.trim() || '',
    recommended_for: medicalPartnerForm.recommended_for?.trim() || '',
    address: medicalPartnerForm.address?.trim() || '',
    phone: medicalPartnerForm.phone?.trim() || '',
    business_hours: medicalPartnerForm.business_hours?.trim() || '',
    parking_info: medicalPartnerForm.parking_info?.trim() || '',
    reservation_guide: medicalPartnerForm.reservation_guide?.trim() || '',
    caution: medicalPartnerForm.caution?.trim() || '',
    manager_name: medicalPartnerForm.manager_name?.trim() || '',
    manager_phone: medicalPartnerForm.manager_phone?.trim() || '',
    is_active: !!medicalPartnerForm.is_active,
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  if (!payload.name) {
    setMessage('병의원/약국 이름을 입력해주세요.')
    return
  }

  if (!payload.category) {
    setMessage('카테고리를 선택해주세요.')
    return
  }

  if (editingMedicalPartnerId) {
    const { error } = await supabase
      .from('medical_partners')
      .update(payload)
      .eq('id', editingMedicalPartnerId)

    if (error) {
      setMessage(`병의원·약국 소개 수정 실패: ${error.message}`)
      return
    }

    setMessage('병의원·약국 소개가 수정되었습니다.')
  } else {
    const { error } = await supabase
      .from('medical_partners')
      .insert(payload)

    if (error) {
      setMessage(`병의원·약국 소개 추가 실패: ${error.message}`)
      return
    }

    setMessage('병의원·약국 소개가 추가되었습니다.')
  }

  setMedicalPartnerForm(emptyMedicalPartnerForm)
  setEditingMedicalPartnerId(null)
  await loadMedicalPartners()
}
const handlePartnerEdit = (partner) => {
  setEditingPartnerId(partner.id)
  setSelectedPartnerId(partner.id)
  setPartnerForm({
    id: partner.id,
    name: partner.name || '',
    category: ['카페', '병원', '마사지', '식당', '기타'].includes(partner.category)
  ? partner.category
  : '기타',
    description: partner.description || '',
    benefit: partner.benefit || '',
    usage_condition: partner.usage_condition || '',
    usage_guide: partner.usage_guide || '',
    caution: partner.caution || '',
    address: partner.address || '',
    phone: partner.phone || '',
    business_hours: partner.business_hours || '',
    manager_name: partner.manager_name || '',
    manager_phone: partner.manager_phone || '',
    monthly_limit: partner.monthly_limit || 0,
    vip_extra_limit: partner.vip_extra_limit || 0,
    approval_required: !!partner.approval_required,
    is_active: !!partner.is_active,
  })
  setPartnerCategoryCustom(
  ['카페', '병원', '마사지', '식당', '기타'].includes(partner.category)
    ? ''
    : partner.category || ''
)
  setCollapsedPartnerDetail(false)
  setActiveTab('제휴업체')
}
  const handleMedicalPartnerEdit = (item) => {
  setEditingMedicalPartnerId(item.id)
  setSelectedMedicalPartnerId(item.id)
  setMedicalPartnerForm({
    id: item.id,
    name: item.name || '',
    category: item.category || '정형외과',
    place_type: item.place_type || '병원',
    short_description: item.short_description || '',
    recommend_reason: item.recommend_reason || '',
    recommended_for: item.recommended_for || '',
    address: item.address || '',
    phone: item.phone || '',
    business_hours: item.business_hours || '',
    parking_info: item.parking_info || '',
    reservation_guide: item.reservation_guide || '',
    caution: item.caution || '',
    manager_name: item.manager_name || '',
    manager_phone: item.manager_phone || '',
    is_active: !!item.is_active,
  })
  setCollapsedMedicalPartnerDetail(false)
  setActiveTab('병의원·약국 소개')
}

const handleMedicalPartnerDelete = async (id) => {
  if (!window.confirm('병의원·약국 소개 항목을 삭제할까요?')) return

  const { error } = await supabase
    .from('medical_partners')
    .delete()
    .eq('id', id)

  if (error) {
    setMessage(`병의원·약국 소개 삭제 실패: ${error.message}`)
    return
  }

  if (selectedMedicalPartnerId === id) {
    setSelectedMedicalPartnerId('')
    setCollapsedMedicalPartnerDetail(true)
  }

  setMessage('병의원·약국 소개 항목이 삭제되었습니다.')
  await loadMedicalPartners()
}
  const handleProgramDelete = async (programId) => {
    if (!window.confirm('프로그램을 삭제할까요?')) return
    await supabase.from('programs').delete().eq('id', programId)
    await loadPrograms()
    setMessage('프로그램이 삭제되었습니다.')
  }
const handlePartnerDelete = async (partnerId) => {
  if (!window.confirm('제휴업체를 삭제할까요?')) return

  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', partnerId)

  if (error) {
    setMessage(`제휴업체 삭제 실패: ${error.message}`)
    return
  }

  if (selectedPartnerId === partnerId) {
  setSelectedPartnerId('')
  setCollapsedPartnerDetail(true)
}

  setMessage('제휴업체가 삭제되었습니다.')
  await loadPartners()
}
  const handlePartnerUsageApprove = async (usageId) => {
  const { error } = await supabase
    .from('partner_usage')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
    .eq('id', usageId)

  if (error) {
    setMessage(`승인 처리 실패: ${error.message}`)
    return
  }

  setMessage('제휴 사용 요청이 승인되었습니다.')
  await loadPartnerUsages()
}

const handlePartnerUsageReject = async (usageId) => {
  const { error } = await supabase
    .from('partner_usage')
    .update({
      status: 'rejected',
    })
    .eq('id', usageId)

  if (error) {
    setMessage(`반려 처리 실패: ${error.message}`)
    return
  }

  setMessage('제휴 사용 요청이 반려되었습니다.')
  await loadPartnerUsages()
}
  const resetSaleForm = () => {
    setSaleForm(emptySaleForm)
    setEditingSaleId(null)
  }

  const handleSaleSubmit = async (e) => {
  e.preventDefault()

  const payload = {
    member_id: saleForm.member_id || null,
    program_id: saleForm.program_id || null,
    sale_date: saleForm.sale_date,
    amount: Number(saleForm.amount) || 0,
    payment_method: saleForm.payment_method,
    installment_months: Number(saleForm.installment_months) || 0,
    cash_receipt_issued: !!saleForm.cash_receipt_issued,
    purchased_session_count: Number(saleForm.purchased_session_count) || 0,
    service_session_count: Number(saleForm.service_session_count) || 0,
    is_vip: !!saleForm.is_vip,
    memo: saleForm.memo?.trim() || '',
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  if (!payload.sale_date) {
    setMessage('결제일을 입력해주세요.')
    return
  }

  const targetMonth = String(payload.sale_date).slice(0, 7)

  if (editingSaleId) {
  const { error } = await supabase
    .from('sales_records')
    .update(payload)
    .eq('id', editingSaleId)

  if (error) {
    console.error('매출 기록 수정 실패:', error)
    setMessage(`매출 기록 수정 실패: ${error.message}`)
    return
  }

  setMessage('매출 기록이 수정되었습니다.')
} else {
  const { data: insertedSale, error } = await supabase
    .from('sales_records')
    .insert(payload)
    .select('*, members(id, name), programs(id, name)')
    .single()

  if (error) {
    console.error('매출 기록 저장 실패:', error)
    setMessage(`매출 기록 저장 실패: ${error.message}`)
    return
  }

  let nextSales = [insertedSale, ...salesRecords]

  nextSales.sort((a, b) => {
    const dateCompare = String(b.sale_date || '').localeCompare(String(a.sale_date || ''))
    if (dateCompare !== 0) return dateCompare
    return String(b.created_at || '').localeCompare(String(a.created_at || ''))
  })

  const nextCollapsed = {}
  nextSales.forEach((sale) => {
    nextCollapsed[sale.id] = true
  })

  setSalesRecords(nextSales)
  setCollapsedSales(nextCollapsed)

  let finalMessage = '매출 기록이 저장되었습니다.'

  if (payload.member_id) {
    const saleBonusRule = getSaleBonusRule(payload.purchased_session_count)

    if (saleBonusRule) {
      const saleXpResult = await applyMemberXp({
  memberId: payload.member_id,
  sourceType: `sale_bonus_${saleBonusRule.minSessions}`,
  sourceId: insertedSale.id,
  sourceDate: payload.sale_date,
  note: `${saleBonusRule.label} 지급`,
})

      console.log('매출 보너스 XP 결과:', saleXpResult)

      if (!saleXpResult?.ok) {
        finalMessage = `매출은 저장됐지만 XP 반영 실패: ${saleXpResult?.reason || 'unknown'}`
      }

      if (saleXpResult?.ok && isDiamondOrHigherMember(payload.member_id)) {
        const extraXp = getBenefitExtraXp(payload.member_id, saleBonusRule.xp)

        if (extraXp > 0) {
         const diamondXpResult = await applyMemberXp({
  memberId: payload.member_id,
  sourceType: 'sale_diamond_bonus',
  sourceId: insertedSale.id,
  sourceDate: payload.sale_date,
  note: `다이아 이상 등록 추가 보너스`,
})

          console.log('다이아 추가 XP 결과:', diamondXpResult)

          if (!diamondXpResult?.ok) {
            finalMessage = `매출은 저장됐지만 다이아 추가 XP 반영 실패: ${diamondXpResult?.reason || 'unknown'}`
          }
        }
      }
    }
  }

  setMessage(finalMessage)
}
  resetSaleForm()

await loadSalesRecords()
await loadSalesSummary(targetMonth)
await loadMemberLevels()
await loadMemberXpLogs()
}

  const handleSaleEdit = (sale) => {
    setEditingSaleId(sale.id)
    setSaleForm({
      id: sale.id,
      member_id: sale.member_id || '',
      program_id: sale.program_id || '',
      sale_date: sale.sale_date,
      amount: sale.amount || '',
      payment_method: sale.payment_method || '카드',
      installment_months: sale.installment_months || 0,
      cash_receipt_issued: !!sale.cash_receipt_issued,
      purchased_session_count: sale.purchased_session_count || 0,
      service_session_count: sale.service_session_count || 0,
      is_vip: !!sale.is_vip,
      memo: sale.memo || '',
    })
  }
const handleBackfillPastSalesXp = async () => {
  const ok = window.confirm(
    '이전 매출 기록들의 XP를 일괄 반영할까요?\n이미 반영된 건 중복 지급되지 않습니다.'
  )
  if (!ok) return

  setMessage('이전 매출 XP 반영 중입니다...')

  try {
    let query = supabase
      .from('sales_records')
      .select('*')
      .order('sale_date', { ascending: false })

    if (currentGymId) {
      query = query.eq('gym_id', currentGymId)
    } else if (currentAdminId) {
      query = query.eq('admin_id', currentAdminId)
    }

    const { data: sales, error } = await query

    if (error) {
      console.error('이전 매출 조회 실패:', error)
      setMessage(`이전 매출 조회 실패: ${error.message}`)
      return
    }

    if (!sales?.length) {
      setMessage('반영할 이전 매출 기록이 없습니다.')
      return
    }

    let checkedCount = 0
    let saleXpAppliedCount = 0
    let benefitXpAppliedCount = 0
    let skippedCount = 0
    let failedCount = 0

    for (const sale of sales) {
      checkedCount += 1

      if (!sale.member_id || !sale.sale_date) {
        skippedCount += 1
        continue
      }

      const saleBonusRule = getSaleBonusRule(sale.purchased_session_count)

      if (!saleBonusRule) {
        skippedCount += 1
        continue
      }

      const saleXpResult = await applyMemberXp({
        memberId: sale.member_id,
        sourceType: `sale_bonus_${saleBonusRule.minSessions}`,
        sourceId: sale.id,
        sourceDate: sale.sale_date,
        note: `${saleBonusRule.label} 지급`,
        forceXp: saleBonusRule.xp,
      })

      if (saleXpResult?.ok) {
        saleXpAppliedCount += 1
      } else if (saleXpResult?.reason !== 'already_exists') {
        failedCount += 1
      }

      const extraXp = getBenefitExtraXp(sale.member_id, saleBonusRule.xp)

      if (extraXp > 0) {
        const benefitXpResult = await applyMemberXp({
          memberId: sale.member_id,
          sourceType: 'sale_diamond_bonus',
          sourceId: sale.id,
          sourceDate: sale.sale_date,
          note: `혜택 등급 등록 추가 보너스 +${extraXp}XP`,
          forceXp: extraXp,
        })

        if (benefitXpResult?.ok) {
          benefitXpAppliedCount += 1
        } else if (benefitXpResult?.reason !== 'already_exists') {
          failedCount += 1
        }
      }
    }

    await loadMemberLevels()
    await loadMemberXpLogs()

    setMessage(
      `이전 매출 XP 반영 완료 · 확인 ${checkedCount}건 / 기본 XP ${saleXpAppliedCount}건 / 추가 XP ${benefitXpAppliedCount}건 / 건너뜀 ${skippedCount}건 / 실패 ${failedCount}건`
    )
  } catch (error) {
    console.error('이전 매출 XP 반영 실패:', error)
    setMessage(`이전 매출 XP 반영 실패: ${error.message}`)
  }
}
  const handleSaleDelete = async (saleId) => {
  if (!window.confirm('매출 기록을 삭제할까요?')) return

  const targetSale = salesRecords.find((sale) => sale.id === saleId)

  const { error } = await supabase
    .from('sales_records')
    .delete()
    .eq('id', saleId)

  if (error) {
    console.error('매출 기록 삭제 실패:', error)
    setMessage(`매출 기록 삭제 실패: ${error.message}`)
    return
  }

  if (targetSale?.member_id) {
    const { error: xpDeleteError } = await supabase
      .from('member_xp_logs')
      .delete()
      .eq('member_id', targetSale.member_id)
      .eq('source_id', saleId)
      .in('source_type', [
        'sale_bonus_10',
        'sale_bonus_20',
        'sale_bonus_30',
        'sale_bonus_50',
        'sale_diamond_bonus',
      ])

    if (xpDeleteError) {
      console.error('매출 XP 로그 삭제 실패:', xpDeleteError)
      setMessage(`매출은 삭제됐지만 XP 로그 삭제 실패: ${xpDeleteError.message}`)
      return
    }

    await recalcMemberLevelFromLogs(targetSale.member_id)
  }

  await loadSalesRecords()
  await loadSalesSummary(saleMonth)
  await loadMemberLevels()
  await loadMemberXpLogs()

  setMessage('매출 기록과 연결된 XP가 삭제되었습니다.')
}
const toggleSalesArrayValue = (field, value) => {
  setSalesLogForm((prev) => {
    const current = Array.isArray(prev[field]) ? prev[field] : []
    const exists = current.includes(value)

    return {
      ...prev,
      [field]: exists ? current.filter((item) => item !== value) : [...current, value],
    }
  })
}
  const resetSalesLogForm = () => {
    setSalesLogForm(emptySalesLogForm)
    setEditingSalesLogId(null)
  }

  const handleSalesLogSubmit = async (e) => {
  e.preventDefault()

  const payload = {
    log_date: salesLogForm.log_date || null,
    activity_time: salesLogForm.activity_time || null,
    coach_name: salesLogForm.coach_name?.trim() || '',
    lead_name: salesLogForm.lead_name?.trim() || '',
    phone: salesLogForm.phone?.trim() || '',
    age_group: salesLogForm.age_group?.trim() || '',
    gender: salesLogForm.gender || '',
    member_type: salesLogForm.member_type || '신규',
    source_channel: salesLogForm.source_channel || '',
    ot_reason: salesLogForm.ot_reason || '',
    contact_reason: salesLogForm.contact_reason?.trim() || '',
    main_need: salesLogForm.main_need?.trim() || '',
    pain_point: salesLogForm.pain_point?.trim() || '',
    consultation_flow: salesLogForm.consultation_flow?.trim() || '',
    consultation_method: Array.isArray(salesLogForm.consultation_method)
      ? salesLogForm.consultation_method
      : [],
    sales_method: Array.isArray(salesLogForm.sales_method) ? salesLogForm.sales_method : [],
    reaction_summary: salesLogForm.reaction_summary?.trim() || '',
    emotion_status: salesLogForm.emotion_status || '보통',
    current_stage: salesLogForm.current_stage || '첫접점',
   sales_result: salesLogForm.sales_result || '진행중',
    proposal_product: salesLogForm.proposal_product?.trim() || '',
    proposal_price: salesLogForm.proposal_price?.trim() || '',
    conversion_score: salesLogForm.conversion_score || 'middle',
    fail_reason: salesLogForm.fail_reason || '',
    follow_up_action: salesLogForm.follow_up_action?.trim() || '',
    next_contact_date: salesLogForm.next_contact_date || null,
    expected_close_date: salesLogForm.expected_close_date || null,
    greeted_to: salesLogForm.greeted_to?.trim() || '',
    greeting_count: Number(salesLogForm.greeting_count) || 0,
    greeted_three_plus: !!salesLogForm.greeted_three_plus,
    ot_count: Number(salesLogForm.ot_count) || 0,
    diary: salesLogForm.diary?.trim() || '',
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  if (!payload.lead_name) {
    setMessage('상담 대상 이름을 입력해주세요.')
    return
  }

  if (editingSalesLogId) {
    const { error } = await supabase.from('sales_logs').update(payload).eq('id', editingSalesLogId)
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage('세일즈 일지가 수정되었습니다.')
  } else {
    const { error } = await supabase.from('sales_logs').insert(payload)
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage('세일즈 일지가 저장되었습니다.')
  }

  resetSalesLogForm()
  await loadSalesLogs()
}

  const handleSalesLogEdit = (log) => {
  setEditingSalesLogId(log.id)
  setSalesLogForm({
    id: log.id,
    log_date: log.log_date || new Date().toISOString().slice(0, 10),
    activity_time: log.activity_time || '12:00',
    coach_name: log.coach_name || '',
    lead_name: log.lead_name || '',
    phone: log.phone || '',
    age_group: log.age_group || '',
    gender: log.gender || '',
    member_type: log.member_type || '신규',
    source_channel: log.source_channel || '',
    ot_reason: log.ot_reason || '',
    contact_reason: log.contact_reason || '',
    main_need: log.main_need || '',
    pain_point: log.pain_point || '',
    consultation_flow: log.consultation_flow || '',
    consultation_method: Array.isArray(log.consultation_method) ? log.consultation_method : [],
    sales_method: Array.isArray(log.sales_method) ? log.sales_method : [],
    reaction_summary: log.reaction_summary || '',
    emotion_status: log.emotion_status || '보통',
    current_stage: log.current_stage || '첫접점',
    sales_result: log.sales_result || '진행중',
    proposal_product: log.proposal_product || '',
    proposal_price: log.proposal_price || '',
    conversion_score: log.conversion_score || 'middle',
    fail_reason: log.fail_reason || '',
    follow_up_action: log.follow_up_action || '',
    next_contact_date: log.next_contact_date || '',
    expected_close_date: log.expected_close_date || '',
    greeted_to: log.greeted_to || '',
    greeting_count: log.greeting_count || 0,
    greeted_three_plus: !!log.greeted_three_plus,
    ot_count: log.ot_count || 0,
    diary: log.diary || '',
  })
  setActiveTab('세일즈일지')
}

  const handleSalesLogDelete = async (logId) => {
    if (!window.confirm('세일즈 일지를 삭제할까요?')) return

    const { error } = await supabase.from('sales_logs').delete().eq('id', logId)
    if (error) {
      setMessage(error.message)
      return
    }

    await loadSalesLogs()
    setMessage('세일즈 일지가 삭제되었습니다.')
  }
  
const resetCoachConditionForm = () => {
  setCoachConditionForm(emptyCoachConditionForm)
  setEditingCoachConditionId(null)
}
const handleCoachGoalSave = async () => {
  if (!coachGoalForm.coach_id || !coachGoalForm.goal_month) {
    setMessage('코치와 기준 월을 먼저 선택해주세요.')
    return
  }

  const payload = {
    coach_id: coachGoalForm.coach_id,
    check_month: coachGoalForm.goal_month,
    monthly_goal_revenue: Number(coachGoalForm.monthly_goal_revenue || 0),
    monthly_goal_new_leads: Number(coachGoalForm.monthly_goal_new_leads || 0),
    monthly_goal_retention: Number(coachGoalForm.monthly_goal_retention || 0),
    monthly_goal_content: Number(coachGoalForm.monthly_goal_content || 0),
    support_needed: coachGoalForm.support_needed?.trim() || '',
    issue_note: coachGoalForm.issue_note?.trim() || '',
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  const { data: existingGoal, error: fetchError } = await supabase
    .from('coach_condition_logs')
    .select('id')
    .eq('coach_id', coachGoalForm.coach_id)
    .eq('check_month', coachGoalForm.goal_month)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    setMessage(`월 목표 조회 실패: ${fetchError.message}`)
    return
  }

  let error = null

  if (existingGoal?.id) {
    const { error: updateError } = await supabase
      .from('coach_condition_logs')
      .update(payload)
      .eq('id', existingGoal.id)
    error = updateError
  } else {
    const { error: insertError } = await supabase
      .from('coach_condition_logs')
      .insert({
        ...payload,
        condition_checks: [],
        fatigue_checks: [],
        stress_checks: [],
        focus_checks: [],
        lead_actions: [],
        retention_actions: [],
        sales_actions: [],
        growth_actions: [],
        condition_score: 0,
        fatigue_score: 0,
        stress_score: 0,
        focus_score: 0,
        performance_score: 0,
        performance_level: '',
        status_level: '',
        burnout_signal_checks: [],
        burnout_recovery_checks: [],
        burnout_signal_count: 0,
        burnout_recovery_count: 0,
        burnout_recovery_comment: '',
      })
    error = insertError
  }

  if (error) {
    setMessage(`월 목표 저장 실패: ${error.message}`)
    return
  }

  setMessage('이번 달 목표가 저장되었습니다.')
  await loadCoachConditions()
}
const handleCoachConditionSubmit = async (e) => {
  if (e?.preventDefault) e.preventDefault()

  if (!coachConditionForm.coach_id) {
    setMessage('코치를 선택해주세요.')
    return
  }

  const scores = calculateCoachConditionScores(coachConditionForm)

  const payload = {
    coach_id: coachConditionForm.coach_id,
    check_month: coachConditionForm.check_month,
      burnout_signal_checks: burnoutSignalChecks,
  burnout_recovery_checks: burnoutRecoveryChecks,
  burnout_signal_count: burnoutSignalChecks.length,
  burnout_recovery_count: burnoutRecoveryChecks.length,
  burnout_recovery_comment: getBurnoutRecoveryComment(burnoutRecoveryChecks),

    condition_checks: coachConditionForm.condition_checks || [],
    fatigue_checks: coachConditionForm.fatigue_checks || [],
    stress_checks: coachConditionForm.stress_checks || [],
    focus_checks: coachConditionForm.focus_checks || [],

    lead_actions: coachConditionForm.lead_actions || [],
    retention_actions: coachConditionForm.retention_actions || [],
    sales_actions: coachConditionForm.sales_actions || [],
    growth_actions: coachConditionForm.growth_actions || [],

    condition_score: scores.conditionScore,
    fatigue_score: scores.fatigueScore,
    focus_score: scores.focusScore,
    stress_score: scores.stressScore,
    performance_score: scores.performanceScore,
    performance_level: scores.performanceLevel,
    status_level: scores.statusLevel,



   condition_note: coachConditionForm.condition_note?.trim() || '',
    fatigue_note: coachConditionForm.fatigue_note?.trim() || '',
    stress_note: coachConditionForm.stress_note?.trim() || '',
    focus_note: coachConditionForm.focus_note?.trim() || '',
    burnout_note: coachConditionForm.burnout_note?.trim() || '',
    today_comment: coachConditionForm.today_comment?.trim() || '',

    support_needed: coachConditionForm.support_needed?.trim() || '',
    issue_note: coachConditionForm.issue_note?.trim() || '',
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  let error = null
  if (editingCoachConditionId) {
    const { error: updateError } = await supabase
      .from('coach_condition_logs')
      .update(payload)
      .eq('id', editingCoachConditionId)
    error = updateError
  } else {
    const { error: insertError } = await supabase
      .from('coach_condition_logs')
      .insert(payload)
    error = insertError
  }

  if (error) {
    console.error('코치 컨디션 저장 실패:', error)
    setMessage(`코치 컨디션 저장 실패: ${error.message}`)
    return
  }

  await loadCoachConditions()
  resetCoachConditionForm()
  setMessage('코치관리 기록이 저장되었습니다.')
}

const handleCoachConditionEdit = (item) => {
  setBurnoutSignalChecks(item.burnout_signal_checks || [])
setBurnoutRecoveryChecks(item.burnout_recovery_checks || [])
  setCoachConditionForm({
    id: item.id,
    coach_id: item.coach_id || '',
    check_month: item.check_month || new Date().toISOString().slice(0, 7),

    condition_checks: item.condition_checks || [],
    fatigue_checks: item.fatigue_checks || [],
    stress_checks: item.stress_checks || [],
    focus_checks: item.focus_checks || [],

    condition_score: item.condition_score ?? 3,
    fatigue_score: item.fatigue_score ?? 1,
    focus_score: item.focus_score ?? 3,
    stress_score: item.stress_score ?? 1,

    lead_actions: item.lead_actions || [],
    retention_actions: item.retention_actions || [],
    sales_actions: item.sales_actions || [],
    growth_actions: item.growth_actions || [],

    performance_score: item.performance_score ?? 0,
    performance_level: item.performance_level || '',
    status_level: item.status_level || '',

    
    condition_note: item.condition_note || '',
    fatigue_note: item.fatigue_note || '',
    stress_note: item.stress_note || '',
    focus_note: item.focus_note || '',
    burnout_note: item.burnout_note || '',
    today_comment: item.today_comment || '',

    support_needed: item.support_needed || '',
    issue_note: item.issue_note || '',
  })

  setEditingCoachConditionId(item.id)
  setActiveTab('코치관리')
}

const handleCoachConditionDelete = async (id) => {
  if (!window.confirm('이 코치 컨디션 기록을 삭제할까요?')) return

  const { error } = await supabase
    .from('coach_condition_logs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('코치 컨디션 삭제 실패:', error)
    setMessage(`코치 컨디션 삭제 실패: ${error.message}`)
    return
  }

  await loadCoachConditions()
  setMessage('코치 컨디션이 삭제되었습니다.')
}

const resetCoachReviewForm = () => {
  setCoachReviewForm(emptyCoachReviewForm)
  setEditingCoachReviewId(null)
}

const handleCoachReviewSubmit = async (e) => {
  e.preventDefault()

  if (!coachReviewForm.coach_id) {
    setMessage('코치를 선택해주세요.')
    return
  }

  const totalScore =
    (Number(coachReviewForm.revenue_score) || 0) +
    (Number(coachReviewForm.activity_score) || 0) +
    (Number(coachReviewForm.sales_score) || 0) +
    (Number(coachReviewForm.attitude_score) || 0)

  const payload = {
    coach_id: coachReviewForm.coach_id,
    review_month: coachReviewForm.review_month,
    revenue_score: Number(coachReviewForm.revenue_score) || 0,
    activity_score: Number(coachReviewForm.activity_score) || 0,
    sales_score: Number(coachReviewForm.sales_score) || 0,
    attitude_score: Number(coachReviewForm.attitude_score) || 0,
    total_score: totalScore,
    manager_comment: coachReviewForm.manager_comment?.trim() || '',
    admin_id: currentAdminId || null,
    gym_id: currentGymId || null,
  }

  let error = null

  if (editingCoachReviewId) {
    const { error: updateError } = await supabase
      .from('coach_monthly_reviews')
      .update(payload)
      .eq('id', editingCoachReviewId)
    error = updateError
  } else {
    const { error: insertError } = await supabase
      .from('coach_monthly_reviews')
      .insert(payload)
    error = insertError
  }

  if (error) {
    console.error('코치 평가 저장 실패:', error)
    setMessage(`코치 평가 저장 실패: ${error.message}`)
    return
  }

  await loadCoachReviews()
  resetCoachReviewForm()
  setMessage('코치 평가가 저장되었습니다.')
}

const handleCoachReviewEdit = (item) => {
  setCoachReviewForm({
    id: item.id,
    coach_id: item.coach_id || '',
    review_month: item.review_month || new Date().toISOString().slice(0, 7),
    revenue_score: item.revenue_score ?? 0,
    activity_score: item.activity_score ?? 0,
    sales_score: item.sales_score ?? 0,
    attitude_score: item.attitude_score ?? 0,
    total_score: item.total_score ?? 0,
    manager_comment: item.manager_comment || '',
  })
  setEditingCoachReviewId(item.id)
  setActiveTab('리포트')
}

const handleCoachReviewDelete = async (id) => {
  if (!window.confirm('이 코치 평가를 삭제할까요?')) return

  const { error } = await supabase
    .from('coach_monthly_reviews')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('코치 평가 삭제 실패:', error)
    setMessage(`코치 평가 삭제 실패: ${error.message}`)
    return
  }

  await loadCoachReviews()
  setMessage('코치 평가가 삭제되었습니다.')
}
 const getCoachConditionAutoFeedback = () => {
  if (!filteredCoachConditions.length) {
    return '이번 달 코치 컨디션 기록이 없습니다. 최소 월 1회 이상 입력해 주세요.'
  }

  const avgCondition = Number(coachConditionSummary.avgCondition || 0)
  const avgFatigue = Number(coachConditionSummary.avgFatigue || 0)
  const avgStress = Number(coachConditionSummary.avgStress || 0)
  const avgFocus = Number(coachConditionSummary.avgFocus || 0)
  const avgPerformance = Number(coachDashboardSummary.avgPerformance || 0)
  const alertCount = uniqueAlertCoaches.length

  if (avgFatigue >= 4 && avgFocus <= 2.5) {
    return '피로도가 높고 집중도가 낮습니다. 수업 분산, 휴식 조정, 스케줄 재배치가 우선입니다.'
  }

  if (avgStress >= 4 && avgPerformance <= 6) {
    return '스트레스가 높고 실행 점수가 낮습니다. 운영 부담이 누적된 상태라 역할 분배와 업무 정리가 필요합니다.'
  }

  if (avgCondition >= 4 && avgPerformance >= 10) {
    return '컨디션과 실행력이 모두 안정적입니다. 현재 운영 흐름은 유지해도 좋습니다.'
  }

  if (alertCount >= 2) {
    return '주의 필요 코치가 여러 명 있습니다. 개별 코치 상태를 먼저 확인하고 원인별로 대응하세요.'
  }

  if (avgPerformance <= 5) {
    return '성과 행동 점수가 낮습니다. 상담 제안, 재등록 제안, 콘텐츠 업로드 행동을 늘릴 필요가 있습니다.'
  }

  if (avgCondition < 3 && avgFatigue >= 3) {
    return '회복 상태가 충분하지 않습니다. 강한 압박보다 루틴 안정화가 먼저입니다.'
  }

  return '전반적으로 보통 수준입니다. 피로도, 스트레스, 실행 행동을 함께 보면서 관리하세요.'
}

const getSalesAutoFeedback = () => {
  const total = Number(salesStatsExtended.totalSales || 0)
  const count = Number(salesStatsExtended.totalCount || 0)
  const vip = Number(salesStatsExtended.vipCount || 0)
  const followup = Number(salesLogSummary?.followup || 0)
  const closed = Number(salesLogSummary?.closed || 0)
  const lost = Number(salesLogSummary?.lost || 0)

  if (count === 0) {
    return '이번 달 등록된 매출 기록이 없습니다. 매출기록 입력부터 먼저 점검해 주세요.'
  }

  if (total >= 3000000 && closed >= 3) {
    return '매출과 전환 흐름이 모두 안정적입니다. 현재 제안 흐름을 유지하면서 재등록 관리에 집중하세요.'
  }

  if (followup > closed) {
    return '결제완료보다 후속관리 대상이 더 많습니다. 신규 유입보다 보류 고객 재접촉이 우선입니다.'
  }

  if (vip >= 3) {
    return 'VIP 전환 흐름이 좋습니다. 장기 등록 고객 관리와 후기 확보까지 연결하면 좋습니다.'
  }

  if (lost >= 3) {
    return '이탈 고객이 누적되고 있습니다. 가격, 시간, 필요성 부족 중 어떤 이유가 많은지 먼저 확인하세요.'
  }

  if (total < 1000000) {
    return '이번 달은 신규 등록/재등록 전환 전략 점검이 필요합니다. 상담 흐름과 제안 방식을 다시 보세요.'
  }

  return '현재 매출 흐름은 보통 수준입니다. 결제수단, 프로그램 구성, 후속관리 전환율을 함께 보세요.'
}
  const resetNoticeForm = () => {
    setNoticeForm(emptyNoticeForm)
    setEditingNoticeId(null)
  }

  const handleNoticeSubmit = async (e) => {
    e.preventDefault()

    const payload = {
  title: noticeForm.title?.trim() || '',
  content: noticeForm.content?.trim() || '',
  category: noticeForm.category,
  image_url: noticeForm.image_url?.trim() || '',
  video_url: noticeForm.video_url?.trim() || '',
  is_published: !!noticeForm.is_published,
  starts_at: noticeForm.starts_at || null,
  ends_at: noticeForm.ends_at || null,
  created_by: profile?.id || null,
  admin_id: currentAdminId || null,
  gym_id: currentGymId || null,
}

    if (!payload.title) {
      setMessage('공지 제목을 입력해주세요.')
      return
    }

    if (editingNoticeId) {
      await supabase.from('notices').update(payload).eq('id', editingNoticeId)
      setMessage('공지사항이 수정되었습니다.')
    } else {
      await supabase.from('notices').insert(payload)
      setMessage('공지사항이 등록되었습니다.')
    }

    resetNoticeForm()
    await loadNotices()
  }

  const handleNoticeEdit = (notice) => {
    setEditingNoticeId(notice.id)
    setNoticeForm({
      id: notice.id,
      title: notice.title || '',
      content: notice.content || '',
      category: notice.category || '공지',
      image_url: notice.image_url || '',
      video_url: notice.video_url || '',
      is_published: !!notice.is_published,
      starts_at: notice.starts_at || '',
      ends_at: notice.ends_at || '',
    })
  }

  const handleNoticeDelete = async (noticeId) => {
    if (!window.confirm('공지사항을 삭제할까요?')) return
    await supabase.from('notices').delete().eq('id', noticeId)
    await loadNotices()
    setMessage('공지사항이 삭제되었습니다.')
  }

   const loadManagerActionLogs = async () => {
  const targetGymId = currentGymId || currentAdminId

  if (!targetGymId) {
    setManagerActionLogs([])
    return
  }

  const { data, error } = await supabase
    .from('manager_action_logs')
    .select('*')
    .eq('gym_id', targetGymId)
    .order('created_at', { ascending: false })

  console.log('loadManagerActionLogs targetGymId:', targetGymId)
  console.log('loadManagerActionLogs data:', data)
  console.log('loadManagerActionLogs error:', error)

  if (error) {
    console.error('manager_action_logs 불러오기 실패:', error)
    setManagerActionLogs([])
    return
  }

  setManagerActionLogs(data || [])
}

  const loadManagerTaskChecks = async () => {
  const targetGymId = currentGymId || currentAdminId

  if (!targetGymId) {
    setManagerTaskChecks([])
    return
  }

  const { data, error } = await supabase
    .from('manager_task_checks')
    .select('*')
    .eq('gym_id', targetGymId)

  if (error) {
    console.error('manager_task_checks 불러오기 실패:', error)
    return
  }

  setManagerTaskChecks(data || [])
}
const loadCareerProfile = async () => {
  if (!currentAdminId) {
    setCareerProfileForm(emptyCareerProfileForm)
    setCareerProfileId(null)
    return
  }

  const { data, error } = await supabase
    .from('trainer_career_profiles')
    .select('*')
    .eq('admin_id', currentAdminId)
    .maybeSingle()

  if (error) {
    console.error('trainer_career_profiles 불러오기 실패:', error)
    return
  }

  if (!data) {
    setCareerProfileForm(emptyCareerProfileForm)
    setCareerProfileId(null)
    return
  }

  setCareerProfileId(data.id)
  setCareerProfileForm({
    career_years: Number(data.career_years || 0),
    total_blog_posts: Number(data.total_blog_posts || 0),
    total_instagram_posts: Number(data.total_instagram_posts || 0),
    total_blog_reviewnote_campaigns: Number(data.total_blog_reviewnote_campaigns || 0),
    total_instagram_campaigns: Number(data.total_instagram_campaigns || 0),
    total_classes: Number(data.total_classes || 0),
    total_consultations: Number(data.total_consultations || 0),
    total_certifications: Number(data.total_certifications || 0),
    total_collaborations: Number(data.total_collaborations || 0),
    memo: data.memo || '',
  })
}
  const loadTrainerLevelSettings = async () => {
  if (!currentAdminId) {
    setTrainerLevelSettings([])
    return
  }

  const { data, error } = await supabase
    .from('trainer_level_settings')
    .select('*')
    .eq('admin_id', currentAdminId)
    .order('min_xp', { ascending: true })

  if (error) {
    console.error('trainer_level_settings 불러오기 실패:', error)
    return
  }

  setTrainerLevelSettings(data || [])
}
  const loadManagerGoalSettings = async () => {
    if (!currentGymId) {
      setManagerGoalSettings(null)
      return
    }

    const monthKey = new Date().toISOString().slice(0, 7)

    const { data, error } = await supabase
      .from('manager_goal_settings')
      .select('*')
      .eq('gym_id', currentGymId)
      .eq('target_month', monthKey)
      .maybeSingle()

    if (error) {
      console.error('manager_goal_settings 불러오기 실패:', error)
      return
    }

    setManagerGoalSettings(data || null)
  }

 const handleManagerActionSave = async () => {
  const targetGymId = currentGymId || currentAdminId

  if (!targetGymId) {
    setMessage('gym_id를 찾을 수 없습니다.')
    console.error('targetGymId 없음', { currentGymId, currentAdminId })
    return
  }

  const payload = {
    gym_id: targetGymId,
    admin_id: currentAdminId,
    action_date: managerActionForm.action_date,
    action_type: managerActionForm.action_type,
    channel: managerActionForm.channel,
    title: managerActionForm.title,
    description: managerActionForm.description,
    link: managerActionForm.link,
    status: managerActionForm.status,
  }

  console.log('handleManagerActionSave targetGymId:', targetGymId)
  console.log('manager payload:', payload)

  let response

if (editingManagerActionId) {
  response = await supabase
    .from('manager_action_logs')
    .update(payload)
    .eq('id', editingManagerActionId)
    .select()
} else {
  response = await supabase
    .from('manager_action_logs')
    .insert(payload)
    .select()
}

const { data, error } = response

  console.log('manager insert data:', data)
  console.log('manager insert error:', error)

  if (error) {
    console.error('manager_action_logs 저장 실패:', error)
    setMessage(`매니저 실행 로그 저장 실패: ${error.message}`)
    return
  }

  setMessage('매니저 실행 로그가 저장되었습니다.')

  setManagerActionForm({
    action_date: new Date().toISOString().slice(0, 10),
    action_type: 'blog_post',
    channel: '',
    title: '',
    description: '',
    link: '',
    status: 'done',
  })
setEditingManagerActionId(null)
  await loadManagerActionLogs()
}
  const handleCareerProfileSave = async () => {
  const targetGymId = currentGymId || currentAdminId

  if (!currentAdminId) {
    setMessage('관리자 정보를 찾을 수 없습니다.')
    return
  }

  const payload = {
    gym_id: targetGymId,
    admin_id: currentAdminId,
    career_years: Number(careerProfileForm.career_years || 0),
    total_blog_posts: Number(careerProfileForm.total_blog_posts || 0),
    total_instagram_posts: Number(careerProfileForm.total_instagram_posts || 0),
    total_blog_reviewnote_campaigns: Number(careerProfileForm.total_blog_reviewnote_campaigns || 0),
    total_instagram_campaigns: Number(careerProfileForm.total_instagram_campaigns || 0),
    total_classes: Number(careerProfileForm.total_classes || 0),
    total_consultations: Number(careerProfileForm.total_consultations || 0),
    total_certifications: Number(careerProfileForm.total_certifications || 0),
    total_collaborations: Number(careerProfileForm.total_collaborations || 0),
    memo: careerProfileForm.memo || '',
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('trainer_career_profiles')
    .upsert(payload, { onConflict: 'admin_id' })
    .select()
    .single()

  if (error) {
    console.error('trainer_career_profiles 저장 실패:', error)
    setMessage(`경력 프로필 저장 실패: ${error.message}`)
    return
  }

  setCareerProfileId(data.id)
  setMessage('트레이너 경력 프로필이 저장되었습니다.')
  await loadCareerProfile()
}
  const handleTrainerLevelSettingSave = async (level) => {
  if (!currentAdminId) {
    setMessage('관리자 정보를 찾을 수 없습니다.')
    return
  }

  const payload = {
    admin_id: currentAdminId,
    level_key: level.key,
    level_name: level.name,
    min_xp: Number(level.minXp || 0),
    description: level.description || '',
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('trainer_level_settings')
    .upsert(payload, { onConflict: 'admin_id,level_key' })

  if (error) {
    console.error('trainer_level_settings 저장 실패:', error)
    setMessage(`레벨 기준 저장 실패: ${error.message}`)
    return
  }

  setMessage(`${level.name} 기준이 저장되었습니다.`)
  await loadTrainerLevelSettings()
}
const handleMemberLevelSettingSave = async (level) => {
  if (!currentAdminId) {
    setMessage('관리자 정보를 찾을 수 없습니다.')
    return
  }

  const payload = {
    admin_id: currentAdminId,
    gym_id: currentGymId || null,
    level_no: Number(level.level_no || 0),
    level_key: level.level_key || '',
    level_name: level.level_name || '',
    min_xp: Number(level.min_xp || 0),
    description: level.description || '',
    icon_type: level.icon_type || 'egg',
    sort_order: Number(level.sort_order || level.level_no || 0),
    is_active: level.is_active !== false,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('member_level_settings')
    .upsert(payload, { onConflict: 'admin_id,level_key' })

  if (error) {
    console.error('member_level_settings 저장 실패:', error)
    setMessage(`회원 레벨 기준 저장 실패: ${error.message}`)
    return
  }

  setMessage(`${level.level_name} 기준이 저장되었습니다.`)
  await loadMemberLevelSettings()
}

const handleMemberXpSettingSave = async (rule) => {
  if (!currentAdminId) {
    setMessage('관리자 정보를 찾을 수 없습니다.')
    return
  }

  const payload = {
    admin_id: currentAdminId,
    gym_id: currentGymId || null,
    rule_code: rule.rule_code || '',
    rule_name: rule.rule_name || '',
    xp: Number(rule.xp || 0),
    daily_limit: Number(rule.daily_limit || 0),
    weekly_limit:
      rule.weekly_limit === null || rule.weekly_limit === ''
        ? null
        : Number(rule.weekly_limit),
    monthly_limit:
      rule.monthly_limit === null || rule.monthly_limit === ''
        ? null
        : Number(rule.monthly_limit),
    min_items:
      rule.min_items === null || rule.min_items === ''
        ? null
        : Number(rule.min_items),
    min_sets:
      rule.min_sets === null || rule.min_sets === ''
        ? null
        : Number(rule.min_sets),
    min_cardio_minutes:
      rule.min_cardio_minutes === null || rule.min_cardio_minutes === ''
        ? null
        : Number(rule.min_cardio_minutes),
    is_active: rule.is_active !== false,
    description: rule.description || '',
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('member_xp_settings')
    .upsert(payload, { onConflict: 'admin_id,rule_code' })

  if (error) {
    console.error('member_xp_settings 저장 실패:', error)
    setMessage(`회원 XP 기준 저장 실패: ${error.message}`)
    return
  }

  setMessage(`${rule.rule_name} 기준이 저장되었습니다.`)
  await loadMemberXpSettings()
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

  const memberRow = members.find((item) => item.id === memberId)
  const adminId = memberRow?.admin_id || currentAdminId || null
  const gymId = memberRow?.gym_id || currentGymId || null

  const rule = memberXpSettings.find((item) => item.rule_code === sourceType && item.is_active !== false)

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

  const matchedLevel =
    [...memberLevelSettings]
      .filter((item) => item.is_active !== false)
      .sort((a, b) => Number(a.min_xp || 0) - Number(b.min_xp || 0))
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

  await loadMemberLevels()
  await loadMemberXpLogs()

  return { ok: true, xp: xpValue }
}
  const SALE_XP_BONUS_RULES = [
  { minSessions: 50, xp: 800, label: '50회 등록 보너스' },
  { minSessions: 30, xp: 450, label: '30회 등록 보너스' },
  { minSessions: 20, xp: 250, label: '20회 등록 보너스' },
  { minSessions: 10, xp: 100, label: '10회 등록 보너스' },
]

const BENEFIT_TIER_KEYWORDS = ['플래티넘', '다이아', '블랙', '인피니티']

const getSaleBonusRule = (sessionCount = 0) => {
  const count = Number(sessionCount || 0)
  return SALE_XP_BONUS_RULES.find((rule) => count >= rule.minSessions) || null
}
const getXpRuleValue = (ruleCode) => {
  const rule = memberXpSettings.find(
    (item) => item.rule_code === ruleCode && item.is_active !== false
  )
  return Number(rule?.xp || 0)
}

const getSaleBonusPreviewText = (sessionCount = 0) => {
  const count = Number(sessionCount || 0)

  if (count >= 50) {
    return `50회 등록 보너스 +${getXpRuleValue('sale_bonus_50')}XP`
  }
  if (count >= 30) {
    return `30회 등록 보너스 +${getXpRuleValue('sale_bonus_30')}XP`
  }
  if (count >= 20) {
    return `20회 등록 보너스 +${getXpRuleValue('sale_bonus_20')}XP`
  }
  if (count >= 10) {
    return `10회 등록 보너스 +${getXpRuleValue('sale_bonus_10')}XP`
  }

  return '10회부터 등록 보너스 XP가 지급됩니다.'
}

const getBenefitPreviewText = (memberId, sessionCount = 0) => {
  if (!memberId) {
    return '플래티넘 / 다이아 / 블랙 / 인피니티 회원은 등급에 따라 등록 보너스 XP가 추가 지급됩니다.'
  }

  const saleBonusRule = getSaleBonusRule(sessionCount)
  if (!saleBonusRule) {
    return '플래티넘 / 다이아 / 블랙 / 인피니티 회원은 등급에 따라 등록 보너스 XP가 추가 지급됩니다.'
  }

  const extraXp = getBenefitExtraXp(memberId, saleBonusRule.xp)

  if (extraXp > 0) {
    return `현재 선택 회원은 등급 추가 보너스 +${extraXp}XP 대상입니다.`
  }

  return '현재 선택 회원은 추가 등급 보너스 대상이 아닙니다.'
}
const isBenefitTierMember = (memberId) => {
  const levelRow = memberLevels.find((item) => item.member_id === memberId)
  const levelName = String(levelRow?.level_name || '')
  return BENEFIT_TIER_KEYWORDS.some((keyword) => levelName.includes(keyword))
}

const getBenefitExtraXpRate = (memberId) => {
  const levelRow = memberLevels.find((item) => item.member_id === memberId)
  const levelName = String(levelRow?.level_name || '')

  if (levelName.includes('인피니티')) return 0.4
  if (levelName.includes('블랙')) return 0.3
  if (levelName.includes('다이아')) return 0.2
  if (levelName.includes('플래티넘')) return 0.1
  return 0
}

const getBenefitExtraXp = (memberId, baseXp = 0) => {
  const rate = getBenefitExtraXpRate(memberId)
  return Math.round(Number(baseXp || 0) * rate)
}
 
  const recalcMemberLevelFromLogs = async (memberId) => {
  if (!memberId) return

  const memberRow = members.find((item) => item.id === memberId)
  const adminId = memberRow?.admin_id || currentAdminId || null
  const gymId = memberRow?.gym_id || currentGymId || null

  const { data: logs, error: logsError } = await supabase
    .from('member_xp_logs')
    .select('*')
    .eq('member_id', memberId)
    .eq('is_valid', true)

  if (logsError) {
    console.error('member_xp_logs 재조회 실패:', logsError)
    return
  }

  const rows = logs || []
  const totalXp = rows.reduce((sum, row) => sum + Number(row.xp || 0), 0)

  const today = new Date().toISOString().slice(0, 10)
  const currentWeekKey = getWeekKey(today)
  const currentMonthKey = today.slice(0, 7)

  const weeklyScore = rows
    .filter((row) => row.week_key === currentWeekKey)
    .reduce((sum, row) => sum + Number(row.xp || 0), 0)

  const monthlyScore = rows
    .filter((row) => row.month_key === currentMonthKey)
    .reduce((sum, row) => sum + Number(row.xp || 0), 0)

  const lastActivityDate = rows
    .map((row) => row.source_date || '')
    .filter(Boolean)
    .sort()
    .reverse()[0] || null

  const matchedLevel =
    [...memberLevelSettings]
      .filter((item) => item.is_active !== false)
      .sort((a, b) => Number(a.min_xp || 0) - Number(b.min_xp || 0))
      .filter((item) => totalXp >= Number(item.min_xp || 0))
      .slice(-1)[0] || null

  const { error: upsertError } = await supabase
    .from('member_levels')
    .upsert(
      {
        member_id: memberId,
        admin_id: adminId,
        gym_id: gymId,
        total_xp: totalXp,
        weekly_score: weeklyScore,
        monthly_score: monthlyScore,
        level_no: Number(matchedLevel?.level_no || 1),
        level_key: matchedLevel?.level_key || 'hidden_green_1',
level_name: matchedLevel?.level_name || '히든 그린 Ⅰ',
        streak_days: 0,
        last_activity_date: lastActivityDate,
        last_xp_applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'member_id' },
    )

  if (upsertError) {
    console.error('member_levels 재계산 실패:', upsertError)
  }
}

const rebuildSalesXpByMonth = async (targetMonth) => {
  if (!currentAdminId || !targetMonth) return

  const monthXpLogTypes = [
    'sale_bonus_10',
    'sale_bonus_20',
    'sale_bonus_30',
    'sale_bonus_50',
    'sale_diamond_bonus',
  ]

  const [year, month] = targetMonth.split('-').map(Number)
  const startDate = `${targetMonth}-01`
  const nextMonthDate = new Date(year, month, 1)
  const endDate = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`

  // 1) 삭제 전에, 이 달 매출 XP 로그가 걸려 있던 회원 전체 확보
  const { data: existingMonthXpLogs, error: existingMonthXpLogsError } = await supabase
    .from('member_xp_logs')
    .select('member_id, source_id, source_type, month_key')
    .eq('admin_id', currentAdminId)
    .eq('month_key', targetMonth)
    .in('source_type', monthXpLogTypes)

  if (existingMonthXpLogsError) {
    console.error('기존 월 매출 XP 로그 조회 실패:', existingMonthXpLogsError)
    setMessage(`기존 월 매출 XP 로그 조회 실패: ${existingMonthXpLogsError.message}`)
    return
  }

  const affectedMemberIdsFromOldLogs = [
    ...new Set((existingMonthXpLogs || []).map((row) => row.member_id).filter(Boolean)),
  ]

  // 2) 이 달의 매출 XP 로그 전체 삭제
  const { error: deleteMonthXpError } = await supabase
    .from('member_xp_logs')
    .delete()
    .eq('admin_id', currentAdminId)
    .eq('month_key', targetMonth)
    .in('source_type', monthXpLogTypes)

  if (deleteMonthXpError) {
    console.error('월 매출 XP 로그 초기화 실패:', deleteMonthXpError)
    setMessage(`월 매출 XP 로그 초기화 실패: ${deleteMonthXpError.message}`)
    return
  }

  // 3) 현재 남아 있는 이 달 매출 다시 조회
  const { data: salesRows, error: salesError } = await supabase
    .from('sales_records')
    .select('*')
    .eq('admin_id', currentAdminId)
    .gte('sale_date', startDate)
    .lt('sale_date', endDate)

  if (salesError) {
    console.error('매출 재조회 실패:', salesError)
    setMessage(`매출 재조회 실패: ${salesError.message}`)
    return
  }

  const monthRows = salesRows || []

  // 4) 현재 남아 있는 매출 기준으로 XP 다시 적립
  for (const sale of monthRows) {
    if (!sale.member_id) continue

    const saleBonusRule = getSaleBonusRule(sale.purchased_session_count)
    if (!saleBonusRule) continue

    await applyMemberXp({
  memberId: sale.member_id,
  sourceType: `sale_bonus_${saleBonusRule.minSessions}`,
  sourceId: sale.id,
  sourceDate: sale.sale_date,
  note: `${saleBonusRule.label} 재정산 지급`,
})

    if (isBenefitTierMember(sale.member_id)) {
  const extraXp = getBenefitExtraXp(sale.member_id, saleBonusRule.xp)

  if (extraXp > 0) {
    await applyMemberXp({
  memberId: sale.member_id,
  sourceType: 'sale_diamond_bonus',
  sourceId: sale.id,
  sourceDate: sale.sale_date,
  note: `플래티넘 이상 추가 보너스 재정산 +${extraXp}XP`,
  forceXp: extraXp,
})
  }
}
  }

  // 5) 삭제 전 로그 회원 + 현재 매출 회원 둘 다 재계산
  const memberIdsFromCurrentSales = [
    ...new Set(monthRows.map((row) => row.member_id).filter(Boolean)),
  ]

  const allAffectedMemberIds = [
    ...new Set([...affectedMemberIdsFromOldLogs, ...memberIdsFromCurrentSales]),
  ]

  for (const memberId of allAffectedMemberIds) {
    await recalcMemberLevelFromLogs(memberId)
  }

  await loadSalesRecords()
  await loadSalesSummary(targetMonth)
  await loadMemberLevels()
  await loadMemberXpLogs()

  setMessage(`${targetMonth} 매출 XP 재정산이 완료되었습니다.`)
}
  const rebuildAllSalesXp = async () => {
  if (!currentAdminId) return

  const ok = window.confirm(
    '전체 기간 매출 XP를 새 기준으로 다시 계산할까요?\n기존 매출 XP 로그를 지우고 현재 설정 기준으로 다시 적립합니다.'
  )
  if (!ok) return

  setMessage('전체 기간 매출 XP 재정산 중입니다...')

  const saleXpTypes = [
    'sale_bonus_10',
    'sale_bonus_20',
    'sale_bonus_30',
    'sale_bonus_50',
    'sale_diamond_bonus',
  ]

  try {
    // 1) 기존 매출 XP 로그가 걸려 있던 회원 확보
    const { data: oldXpLogs, error: oldXpLogsError } = await supabase
      .from('member_xp_logs')
      .select('member_id')
      .eq('admin_id', currentAdminId)
      .in('source_type', saleXpTypes)

    if (oldXpLogsError) {
      console.error('기존 매출 XP 로그 조회 실패:', oldXpLogsError)
      setMessage(`기존 매출 XP 로그 조회 실패: ${oldXpLogsError.message}`)
      return
    }

    const oldMemberIds = [...new Set((oldXpLogs || []).map((row) => row.member_id).filter(Boolean))]

    // 2) 기존 매출 XP 로그 전체 삭제
    const { error: deleteXpError } = await supabase
      .from('member_xp_logs')
      .delete()
      .eq('admin_id', currentAdminId)
      .in('source_type', saleXpTypes)

    if (deleteXpError) {
      console.error('전체 매출 XP 로그 삭제 실패:', deleteXpError)
      setMessage(`전체 매출 XP 로그 삭제 실패: ${deleteXpError.message}`)
      return
    }

    // 3) 현재 남아 있는 매출 전체 조회
    const { data: salesRows, error: salesError } = await supabase
      .from('sales_records')
      .select('*')
      .eq('admin_id', currentAdminId)
      .order('sale_date', { ascending: true })

    if (salesError) {
      console.error('매출 전체 재조회 실패:', salesError)
      setMessage(`매출 전체 재조회 실패: ${salesError.message}`)
      return
    }

    const sales = salesRows || []
    let appliedBaseCount = 0
    let appliedBenefitCount = 0

    for (const sale of sales) {
      if (!sale.member_id || !sale.sale_date) continue

      const saleBonusRule = getSaleBonusRule(sale.purchased_session_count)
      if (!saleBonusRule) continue

      const saleXpResult = await applyMemberXp({
        memberId: sale.member_id,
        sourceType: `sale_bonus_${saleBonusRule.minSessions}`,
        sourceId: sale.id,
        sourceDate: sale.sale_date,
        note: `${saleBonusRule.label} 전체 재정산 지급`,
      })

      if (saleXpResult?.ok) {
        appliedBaseCount += 1
      }

      if (isBenefitTierMember(sale.member_id)) {
        const extraXp = getBenefitExtraXp(sale.member_id, saleBonusRule.xp)

        if (extraXp > 0) {
          const benefitXpResult = await applyMemberXp({
            memberId: sale.member_id,
            sourceType: 'sale_diamond_bonus',
            sourceId: sale.id,
            sourceDate: sale.sale_date,
            note: `플래티넘 이상 추가 보너스 전체 재정산 +${extraXp}XP`,
            forceXp: extraXp,
          })

          if (benefitXpResult?.ok) {
            appliedBenefitCount += 1
          }
        }
      }
    }

    // 4) 삭제 전 걸려 있던 회원 + 현재 매출 회원 레벨 재계산
    const currentMemberIds = [...new Set(sales.map((row) => row.member_id).filter(Boolean))]
    const allAffectedMemberIds = [...new Set([...oldMemberIds, ...currentMemberIds])]

    for (const memberId of allAffectedMemberIds) {
      await recalcMemberLevelFromLogs(memberId)
    }

    await loadSalesRecords()
    await loadSalesSummary(saleMonth)
    await loadMemberLevels()
    await loadMemberXpLogs()

    setMessage(
      `전체 기간 매출 XP 재정산 완료 · 기본 XP ${appliedBaseCount}건 / 추가 XP ${appliedBenefitCount}건`
    )
  } catch (error) {
    console.error('전체 기간 매출 XP 재정산 실패:', error)
    setMessage(`전체 기간 매출 XP 재정산 실패: ${error.message}`)
  }
}
  const forceRefreshSingleMemberXp = async (memberId) => {
  if (!memberId || !currentAdminId) return

  const targetXpTypes = [
    'pt_workout',
    'personal_workout',
    'diet_log',
    'streak_bonus',
    'weekly_bonus',
    'sale_bonus_10',
    'sale_bonus_20',
    'sale_bonus_30',
    'sale_bonus_50',
    'sale_diamond_bonus',
  ]

  // 1) 기존 XP 로그 삭제
  const { error: deleteXpError } = await supabase
    .from('member_xp_logs')
    .delete()
    .eq('member_id', memberId)
    .eq('admin_id', currentAdminId)
    .in('source_type', targetXpTypes)

  if (deleteXpError) {
    console.error('회원 XP 로그 삭제 실패:', deleteXpError)
    setMessage(`회원 XP 로그 삭제 실패: ${deleteXpError.message}`)
    return
  }

  // 2) 매출 재조회 후 XP 재적립
  const { data: salesRows, error: salesError } = await supabase
    .from('sales_records')
    .select('*')
    .eq('member_id', memberId)
    .eq('admin_id', currentAdminId)
    .order('sale_date', { ascending: true })

  if (salesError) {
    console.error('회원 매출 재조회 실패:', salesError)
    setMessage(`회원 매출 재조회 실패: ${salesError.message}`)
    return
  }

  for (const sale of salesRows || []) {
    if (!sale.member_id || !sale.sale_date) continue

    const saleBonusRule = getSaleBonusRule(sale.purchased_session_count)
    if (!saleBonusRule) continue

    await applyMemberXp({
      memberId: sale.member_id,
      sourceType: `sale_bonus_${saleBonusRule.minSessions}`,
      sourceId: sale.id,
      sourceDate: sale.sale_date,
      note: `${saleBonusRule.label} 재정산 지급`,
    })

    if (isBenefitTierMember(sale.member_id)) {
      const extraXp = getBenefitExtraXp(sale.member_id, saleBonusRule.xp)

      if (extraXp > 0) {
        await applyMemberXp({
          memberId: sale.member_id,
          sourceType: 'sale_diamond_bonus',
          sourceId: sale.id,
          sourceDate: sale.sale_date,
          note: `플래티넘 이상 추가 보너스 재정산 +${extraXp}XP`,
          forceXp: extraXp,
        })
      }
    }
  }

  // 3) 운동기록 재조회 후 XP 재적립 (PT + 개인운동)
  const { data: workoutRows, error: workoutError } = await supabase
    .from('workouts')
    .select('*')
    .eq('member_id', memberId)
    .eq('admin_id', currentAdminId)
    .order('workout_date', { ascending: true })

  if (workoutError) {
    console.error('회원 운동기록 재조회 실패:', workoutError)
    setMessage(`회원 운동기록 재조회 실패: ${workoutError.message}`)
    return
  }

  for (const workout of workoutRows || []) {
    if (!workout.id || !workout.workout_date) continue

    if (workout.workout_type === 'pt') {
      await applyMemberXp({
        memberId,
        sourceType: 'pt_workout',
        sourceId: workout.id,
        sourceDate: workout.workout_date,
        note: '관리자 PT 운동기록 재정산',
      })
    }

    if (workout.workout_type === 'personal') {
      await applyMemberXp({
        memberId,
        sourceType: 'personal_workout',
        sourceId: workout.id,
        sourceDate: workout.workout_date,
        note: '관리자 개인운동기록 재정산',
      })
    }
  }

  // 4) 식단기록 재조회 후 XP 재적립
  const { data: dietRows, error: dietError } = await supabase
    .from('diet_logs')
    .select('*')
    .eq('member_id', memberId)
    .eq('admin_id', currentAdminId)
    .order('created_at', { ascending: true })

  if (dietError) {
    console.error('회원 식단기록 재조회 실패:', dietError)
    setMessage(`회원 식단기록 재조회 실패: ${dietError.message}`)
    return
  }

  for (const diet of dietRows || []) {
    const dietDate = diet.log_date || diet.created_at?.slice(0, 10)
    if (!diet.id || !dietDate) continue

    await applyMemberXp({
      memberId,
      sourceType: 'diet_log',
      sourceId: diet.id,
      sourceDate: dietDate,
      note: '식단기록 재정산',
    })
  }

  // 5) 연속활동 보너스 / 주간 꾸준함 보너스 재계산
  const allActivityDates = [
    ...(workoutRows || []).map((row) => row.workout_date).filter(Boolean),
    ...(dietRows || []).map((row) => row.log_date || row.created_at?.slice(0, 10)).filter(Boolean),
  ]

  const uniqueDates = [...new Set(allActivityDates)].sort()

  // 연속활동 보너스: 3일 연속 달성일에 1회 지급
  let streakCount = 1
  for (let i = 0; i < uniqueDates.length; i += 1) {
    if (i === 0) {
      streakCount = 1
    } else {
      const prev = new Date(uniqueDates[i - 1])
      const curr = new Date(uniqueDates[i])
      const diffDays = Math.round((curr - prev) / 86400000)

      if (diffDays === 1) {
        streakCount += 1
      } else {
        streakCount = 1
      }
    }

    if (streakCount >= 3) {
      await applyMemberXp({
        memberId,
        sourceType: 'streak_bonus',
        sourceId: `streak-${memberId}-${uniqueDates[i]}`,
        sourceDate: uniqueDates[i],
        note: `연속활동 보너스 재정산 (${streakCount}일 연속)`,
      })
    }
  }

  // 주간 꾸준함 보너스: 같은 주에 활동일 3일 이상이면 1회 지급
  const weekMap = {}
  for (const date of uniqueDates) {
    const weekKey = getWeekKey(date)
    if (!weekMap[weekKey]) weekMap[weekKey] = []
    weekMap[weekKey].push(date)
  }

  for (const [weekKey, dates] of Object.entries(weekMap)) {
    const weekDates = [...new Set(dates)].sort()
    if (weekDates.length >= 3) {
      await applyMemberXp({
        memberId,
        sourceType: 'weekly_bonus',
        sourceId: `weekly-${memberId}-${weekKey}`,
        sourceDate: weekDates[weekDates.length - 1],
        note: `주간 꾸준함 보너스 재정산 (${weekDates.length}일 활동)`,
      })
    }
  }

  // 6) 레벨 재계산
  await recalcMemberLevelFromLogs(memberId)

  // 7) UI 갱신
  await loadMemberLevels()
  await loadMemberXpLogs()

  setMessage('선택 회원 XP 재계산 완료')
}
  const forceRefreshAllMembersXp = async () => {
  if (!currentAdminId) return

  const ok = window.confirm(
    '전체 회원 XP를 현재 기준으로 다시 계산할까요?\n기존 운동/식단/보너스/매출 XP를 지우고 다시 적립합니다.'
  )
  if (!ok) return

  setMessage('전체 회원 XP 재계산 중입니다...')

  try {
    const memberIds = [...new Set(members.map((member) => member.id).filter(Boolean))]

    for (const memberId of memberIds) {
      await forceRefreshSingleMemberXp(memberId)
    }

    await loadMemberLevels()
    await loadMemberXpLogs()

    setMessage('전체 회원 XP 재계산 완료')
  } catch (error) {
    console.error('전체 회원 XP 재계산 실패:', error)
    setMessage(`전체 회원 XP 재계산 실패: ${error.message}`)
  }
}
  const handleManagerActionEdit = (log) => {
  setEditingManagerActionId(log.id)

  setManagerActionForm({
    action_date: log.action_date || '',
    action_type: log.action_type || 'blog_post',
    channel: log.channel || '',
    title: log.title || '',
    description: log.description || '',
    link: log.link || '',
    status: log.status || 'done',
  })

  window.scrollTo({ top: 0, behavior: 'smooth' })
}
  const handleManagerTaskAction = (task) => {
  if (task.actionKey === 'go_members') {
    setActiveTab('회원')
    return
  }

  if (task.actionKey === 'go_sales') {
    setActiveTab('매출기록')
    return
  }
  if (task.actionKey === 'go_diet') {
    setActiveTab('식단')
    return
  }

  if (task.actionKey === 'go_inquiries') {
    setActiveTab('문의사항')
    return
  }
  if (task.actionKey === 'go_member_detail') {
    setActiveTab('회원상세')
    return
  }

  if (task.actionKey === 'log_blog') {
    setManagerActionForm((prev) => ({
      ...prev,
      action_type: 'blog_post',
    }))

    const target = document.getElementById('manager-action-form')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return
  }

  if (task.actionKey === 'log_reel') {
    setManagerActionForm((prev) => ({
      ...prev,
      action_type: 'reel_upload',
    }))

    const target = document.getElementById('manager-action-form')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return
  }
}
  const handleManagerTaskComplete = async (task) => {
    const confirmComplete = window.confirm('이 과제를 완료 처리하시겠습니까?')
  if (!confirmComplete) return

  const targetGymId = currentGymId || currentAdminId

  if (!targetGymId) {
    setMessage('과제 완료 저장에 필요한 gym_id를 찾을 수 없습니다.')
    return
  }

  const existingTask = managerTaskChecks.find(
    (item) =>
      item.task_key === task.actionKey &&
      item.task_date === todayTaskDate
  )

  let response

  if (existingTask) {
    response = await supabase
      .from('manager_task_checks')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        memo: task.title,
      })
      .eq('id', existingTask.id)
      .select()
  } else {
    response = await supabase
      .from('manager_task_checks')
      .insert({
        gym_id: targetGymId,
        admin_id: currentAdminId,
        task_key: task.actionKey,
        task_date: todayTaskDate,
        is_completed: true,
        completed_at: new Date().toISOString(),
        memo: task.title,
      })
      .select()
  }

  const { error } = response

  if (error) {
    console.error('과제 완료 저장 실패:', error)
    setMessage(`과제 완료 저장 실패: ${error.message}`)
    return
  }

  setMessage(`"${task.title}" 완료 처리되었습니다.`)
  await loadManagerTaskChecks()
}
  const handleManagerTaskUncomplete = async (task) => {
  const confirmUndo = window.confirm('이 과제의 완료 상태를 해제하시겠습니까?')
  if (!confirmUndo) return

  const existingTask = managerTaskChecks.find(
    (item) =>
      item.task_key === task.actionKey &&
      item.task_date === todayTaskDate
  )

  if (!existingTask) {
    setMessage('완료 상태를 찾지 못했습니다.')
    return
  }

  const { error } = await supabase
    .from('manager_task_checks')
    .update({
      is_completed: false,
      completed_at: null,
    })
    .eq('id', existingTask.id)

  if (error) {
    console.error('과제 완료 해제 실패:', error)
    setMessage(`과제 완료 해제 실패: ${error.message}`)
    return
  }

  setMessage(`"${task.title}" 완료 해제되었습니다.`)
  await loadManagerTaskChecks()
}
  if (loading) {
    return <div className="loading-card">데이터 불러오는 중...</div>
  }
const TRAINING_METHOD_META = {
  normal: {
    label: '일반운동',
    description: '한 가지 운동을 세트별로 진행하는 가장 기본적인 방식입니다.',
    placeholder: '예: 한 가지 운동을 세트별로 안정적으로 진행했습니다.',
  },
  superset: {
    label: '슈퍼세트',
    description: 'A운동 후 쉬지 않고 B운동을 바로 이어서 진행하는 방식입니다.',
    placeholder: '예: 슈퍼세트를 진행했습니다. A운동 후 휴식 없이 B운동을 바로 이어서 수행했습니다.',
  },
  dropset: {
    label: '드롭세트',
    description: '같은 운동에서 중량을 낮춰가며 연속적으로 수행하는 방식입니다.',
    placeholder: '예: 드롭세트로 진행했습니다. 마지막 세트에서 중량을 낮춰 연속 반복했습니다.',
  },
}

const ENTRY_TYPE_META = {
  strength: {
    label: '근력운동',
    description: '세트/중량/횟수 중심으로 기록하는 일반 웨이트 운동입니다.',
  },
  cardio: {
    label: '유산소',
    description: '걷기, 러닝, 사이클처럼 시간 중심으로 기록하는 유산소 운동입니다.',
  },
  care: {
    label: '케어',
    description: '마사지, 컨디셔닝처럼 케어 시간을 기록하는 항목입니다.',
  },
  stretching: {
    label: '스트레칭',
    description: '스트레칭은 시간과 횟수를 함께 기록하는 항목입니다.',
  },
  pain_only: {
    label: '통증기록',
    description: '운동 입력 없이 통증 상태만 바로 기록하는 항목입니다.',
  },
}

const CARE_KEYWORDS = ['마사지', '컨디셔닝', '스트레칭', '모션패시브', '케어']
const CARDIO_KEYWORDS = ['러닝', '런닝', '사이클', '자전거', '걷기', '트레드밀', '유산소', '수영']

const inferExerciseEntryType = (exercise) => {
  const name = String(exercise?.name || '').toLowerCase()
  const category = String(exercise?.category || '').toLowerCase()
  const guide = String(exercise?.guide_text || '').toLowerCase()

  if (CARE_KEYWORDS.some((keyword) => name.includes(keyword) || category.includes(keyword) || guide.includes(keyword))) {
    return 'care'
  }

  if (category.includes('유산소') || CARDIO_KEYWORDS.some((keyword) => name.includes(keyword) || category.includes(keyword))) {
    return 'cardio'
  }

  return 'strength'
}

const getTrainingMethodMeta = (method) => TRAINING_METHOD_META[method] || TRAINING_METHOD_META.normal
const getEntryTypeMeta = (entryType) => ENTRY_TYPE_META[entryType] || ENTRY_TYPE_META.strength

const getWorkoutSummaryText = (item) => {
  if (item.entry_type === 'care') {
    return `케어 / ${Number(item.care_minutes || 0)}분`
  }

  if (item.entry_type === 'cardio' || item.is_cardio) {
    return `유산소 / ${Number(item.cardio_minutes || 0)}분`
  }

  if (item.training_method === 'superset') {
    return '슈퍼세트'
  }

  if (item.training_method === 'dropset') {
    return `${item.performed_name || item.exercise_name_snapshot || '드롭세트'}`
  }

  return item.performed_name || item.exercise_name_snapshot || item.equipment_name_snapshot || '일반운동'
}

const exerciseBodyPartOptions = Array.from(
  new Set(exercises.map((exercise) => String(exercise.body_part || '').trim()).filter(Boolean)),
)

const exerciseCategoryOptions = Array.from(
  new Set(exercises.map((exercise) => String(exercise.category || '').trim()).filter(Boolean)),
)

const filteredExercisesAdvanced = exercises.filter((exercise) => {
  const keyword = String(exerciseSearch || '').trim().toLowerCase()
  const bodyMatch = !exerciseBodyPartFilter || String(exercise.body_part || '') === exerciseBodyPartFilter
  const categoryMatch = !exerciseCategoryFilter || String(exercise.category || '') === exerciseCategoryFilter
  const brandMatch = !exerciseBrandFilter || String(exercise.brand_id || '') === String(exerciseBrandFilter)

  const keywordMatch =
    !keyword ||
    String(exercise.name || '').toLowerCase().includes(keyword) ||
    String(exercise.body_part || '').toLowerCase().includes(keyword) ||
    String(exercise.category || '').toLowerCase().includes(keyword) ||
    String(exercise.brands?.name || '').toLowerCase().includes(keyword) ||
    String(exercise.guide_text || '').toLowerCase().includes(keyword)

  return bodyMatch && categoryMatch && brandMatch && keywordMatch
})
  return (
    <div className="dashboard-shell">
      <div className="admin-alert-bar collapsible-alert-bar alert-panel-modern">
  <button
    type="button"
    className="alert-collapse-toggle alert-modern-toggle"
    onClick={() => setCollapsedAdminAlertBar((prev) => !prev)}
  >
    <div className="alert-collapse-left alert-modern-left">
      <strong>🔔 알림</strong>
      <span>문의 {unreadInquiryCount}건 / 공지 {unreadNoticeCount}건</span>
    </div>

    <span className={`alert-collapse-arrow ${collapsedAdminAlertBar ? 'collapsed' : 'open'}`}>
      ▾
    </span>
  </button>

  {!collapsedAdminAlertBar && (
    <div className="alert-modern-body">
      <div className="alert-modern-tabs">
        <button
          type="button"
          className={`alert-modern-tab ${adminAlertTab === 'settings' ? 'active' : ''}`}
          onClick={() => setAdminAlertTab('settings')}
        >
          알림설정
        </button>
        <button
          type="button"
          className={`alert-modern-tab ${adminAlertTab === 'list' ? 'active' : ''}`}
          onClick={() => setAdminAlertTab('list')}
        >
          알림내역
        </button>
      </div>

      {adminAlertTab === 'settings' && (
        <div className="alert-modern-settings">
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={adminAlertSettings.inquiry}
              onChange={(e) => updateAdminAlertSetting('inquiry', e.target.checked)}
            />
            <span>문의 알림</span>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={adminAlertSettings.notice}
              onChange={(e) => updateAdminAlertSetting('notice', e.target.checked)}
            />
            <span>공지 알림</span>
          </label>
<label className="checkbox-line">
  <input
    type="checkbox"
    checked={adminAlertSettings.workout}
    onChange={(e) => updateAdminAlertSetting('workout', e.target.checked)}
  />
  <span>운동기록 알림</span>
</label>

<label className="checkbox-line">
  <input
    type="checkbox"
    checked={adminAlertSettings.diet}
    onChange={(e) => updateAdminAlertSetting('diet', e.target.checked)}
  />
  <span>식단기록 알림</span>
</label>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={adminAlertSettings.sound}
              onChange={(e) => updateAdminAlertSetting('sound', e.target.checked)}
            />
            <span>소리</span>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={adminAlertSettings.popup}
              onChange={(e) => updateAdminAlertSetting('popup', e.target.checked)}
            />
            <span>팝업</span>
          </label>

          <button type="button" className="secondary-btn" onClick={clearAdminAlerts}>
            알림 초기화
          </button>
        </div>
      )}

      {adminAlertTab === 'list' && (
        <div className="alert-modern-list-wrap">
          <input
            type="text"
            placeholder="알림 내용 검색"
            value={adminAlertSearch}
            onChange={(e) => setAdminAlertSearch(e.target.value)}
            className="alert-modern-search"
          />

          {filteredAdminAlerts.length === 0 ? (
            <div className="workout-list-empty">표시할 알림이 없습니다.</div>
          ) : (
            <div className="admin-alert-list">
              {filteredAdminAlerts.map((alert) => (
                <div key={alert.id} className={`admin-alert-item ${alert.type}`}>
                  <span>{alert.text}</span>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => removeAdminAlert(alert.id)}
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
            <h1 className="page-title">관리자 대시보드</h1>
            <p className="sub-text">{profile?.name || '관리자'}님으로 로그인됨</p>
          </div>
        </div>
        <button className="secondary-btn" onClick={onLogout}>
          로그아웃
        </button>
      </header>

      <div className="dashboard-layout">
  <aside className="dashboard-sidebar">
    <div className="dashboard-sidebar-scroll">
      <nav className="side-tab-list">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            className={`side-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  </aside>

  <section className="dashboard-main">
    <div className="dashboard-main-scroll">
      {message ? <div className="message success">{message}</div> : null}
      
            {activeTab === '가입신청관리' && profile?.is_super_admin && (
        <div className="card">
          <div className="section-head">
            <h2>가입신청관리</h2>
            <p className="sub-text">
              최고관리자만 볼 수 있는 관리자 가입신청 관리 탭입니다.
            </p>
          </div>

          <div className="detail-box" style={{ marginBottom: '16px' }}>
            <p><strong>조회 대상:</strong> pending 상태 가입신청</p>
            <p><strong>현재 건수:</strong> {adminSignupRequests.length}건</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={loadAdminSignupRequests}
              disabled={adminSignupLoading}
            >
              {adminSignupLoading ? '불러오는 중...' : '가입신청 새로고침'}
            </button>
          </div>

          {adminSignupLoading ? (
            <div className="workout-list-empty">가입신청 목록 불러오는 중...</div>
          ) : adminSignupRequests.length === 0 ? (
            <div className="workout-list-empty">대기 중인 가입신청이 없습니다.</div>
          ) : (
            <div className="list-stack">
              {adminSignupRequests.map((request) => (
                <div key={request.id} className="detail-box">
                  <div className="list-card-top" style={{ marginBottom: '10px' }}>
                    <strong>{request.name || '이름 없음'}</strong>
                    <span className="status-pill status-pill-pending">
                      {request.status || 'pending'}
                    </span>
                  </div>

                  <div className="compact-text"><strong>이메일:</strong> {request.email || '-'}</div>
                  <div className="compact-text"><strong>센터명:</strong> {request.gym_name || '-'}</div>
                  <div className="compact-text"><strong>연락처:</strong> {request.phone || '-'}</div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
  <button
    type="button"
    className="primary-btn"
    onClick={() => handleApproveSignup(request)}
  >
    승인
  </button>

  <button
    type="button"
    className="danger-btn"
    onClick={() => handleRejectSignup(request)}
  >
    거절
  </button>
</div>
                  <div className="compact-text"><strong>신청일:</strong> -</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

{activeTab === '가입신청관리' ? (
  <div className="admin-manage-page">
    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <div className="admin-section-badge">SIGNUP REQUESTS</div>
          <h3>가입신청관리</h3>
          <p>대기 중인 관리자 가입신청을 승인하거나 거절할 수 있습니다.</p>
        </div>
        <div className="admin-section-stats">
          <div className="admin-stat-box">
            <span className="admin-stat-label">대기 건수</span>
            <strong>{(adminSignupRequests || []).length}건</strong>
          </div>
        </div>
      </div>

      {(adminSignupRequests || []).length === 0 ? (
        <div className="admin-empty-box">대기 중인 가입신청이 없습니다.</div>
      ) : (
        <div className="admin-grid-list">
          {adminSignupRequests.map((request) => (
            <article key={request.id} className="admin-info-card pending-card">
              <div className="admin-info-card-top">
                <div>
                  <h4>{request.name || '이름 없음'}</h4>
                  <p>{request.email || '-'}</p>
                </div>
                <span className="status-badge pending">pending</span>
              </div>

              <div className="admin-info-meta">
                <div><span>센터명</span><strong>{request.gym_name || '-'}</strong></div>
                <div><span>연락처</span><strong>{request.phone || '-'}</strong></div>
                <div><span>신청일</span><strong>{request.requested_at || '-'}</strong></div>
              </div>

              <div className="admin-action-row">
                <button
  type="button"
  className="action-btn primary"
  onClick={() => handleResetAdminPassword(admin)}
>
  임시 비밀번호 발급
</button>

<button
  type="button"
  className="action-btn purple"
  onClick={() => handleChangeAdminPassword(admin)}
>
  비밀번호 변경
</button>
                <button
                  type="button"
                  className="action-btn primary"
                  onClick={() => handleApproveSignup(request)}
                >
                  승인
                </button>
                <button
                  type="button"
                  className="action-btn danger"
                  onClick={() => handleRejectSignup(request)}
                >
                  거절
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>

    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <div className="admin-section-badge">APPROVED HISTORY</div>
          <h3>가입승인내역</h3>
          <p>승인 완료된 관리자 신청 내역입니다.</p>
        </div>
        <div className="admin-section-stats">
          <div className="admin-stat-box">
            <span className="admin-stat-label">총 승인</span>
            <strong>{(approvedSignupRequests || []).length}건</strong>
          </div>
        </div>
      </div>

      {(approvedSignupRequests || []).length === 0 ? (
        <div className="admin-empty-box">승인 내역이 없습니다.</div>
      ) : (
        <div className="admin-grid-list">
          {approvedSignupRequests.map((item) => (
            <article key={item.id} className="admin-info-card approved-card">
              <div className="admin-info-card-top">
                <div>
                  <h4>{item.name || '이름 없음'}</h4>
                  <p>{item.email || '-'}</p>
                </div>
                <span className="status-badge approved">approved</span>
              </div>

              <div className="admin-info-meta">
                <div><span>센터명</span><strong>{item.gym_name || '-'}</strong></div>
                <div><span>연락처</span><strong>{item.phone || '-'}</strong></div>
                <div><span>승인일</span><strong>{item.approved_at || '-'}</strong></div>
                <div><span>승인자</span><strong>{item.approved_by || '-'}</strong></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>

    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <div className="admin-section-badge">REJECTED HISTORY</div>
          <h3>가입거절내역</h3>
          <p>거절 처리된 관리자 신청 내역입니다.</p>
        </div>
        <div className="admin-section-stats">
          <div className="admin-stat-box">
            <span className="admin-stat-label">총 거절</span>
            <strong>{(rejectedSignupRequests || []).length}건</strong>
          </div>
        </div>
      </div>

      {(rejectedSignupRequests || []).length === 0 ? (
        <div className="admin-empty-box">거절 내역이 없습니다.</div>
      ) : (
        <div className="admin-grid-list">
          {rejectedSignupRequests.map((item) => (
            <article key={item.id} className="admin-info-card rejected-card">
              <div className="admin-info-card-top">
                <div>
                  <h4>{item.name || '이름 없음'}</h4>
                  <p>{item.email || '-'}</p>
                </div>
                <span className="status-badge rejected">rejected</span>
              </div>

              <div className="admin-info-meta">
                <div><span>센터명</span><strong>{item.gym_name || '-'}</strong></div>
                <div><span>연락처</span><strong>{item.phone || '-'}</strong></div>
                <div><span>거절일</span><strong>{item.rejected_at || '-'}</strong></div>
                <div><span>거절자</span><strong>{item.rejected_by || '-'}</strong></div>
                <div className="full-row"><span>사유</span><strong>{item.reject_reason || '-'}</strong></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>

    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <div className="admin-section-badge">ADMIN ACCOUNTS</div>
          <h3>관리자계정관리</h3>
          <p>관리자 계정 상태를 관리하고 비밀번호 재발급/삭제를 처리합니다.</p>
        </div>
        <div className="admin-section-stats">
          <div className="admin-stat-box">
            <span className="admin-stat-label">전체 계정</span>
            <strong>{(adminAccounts || []).length}명</strong>
          </div>
        </div>
      </div>

      {(adminAccounts || []).length === 0 ? (
        <div className="admin-empty-box">관리자 계정이 없습니다.</div>
      ) : (
        <div className="admin-grid-list">
          {adminAccounts.map((admin) => (
            <article key={admin.id} className="admin-info-card account-card">
              <div className="admin-info-card-top">
                <div>
                  <h4>{admin.name || '이름 없음'}</h4>
                  <p>{admin.email || '-'}</p>
                </div>
                <span
                  className={`status-badge ${
                    admin.account_status === 'active'
                      ? 'approved'
                      : admin.account_status === 'inactive'
                      ? 'pending'
                      : 'deleted'
                  }`}
                >
                  {admin.account_status || '-'}
                </span>
              </div>

              <div className="admin-info-meta">
                <div><span>권한</span><strong>{admin.role || '-'}</strong></div>
                <div><span>상태</span><strong>{admin.account_status || '-'}</strong></div>
                <div><span>승인일</span><strong>{admin.approved_at || '-'}</strong></div>
              </div>

            {admin.role === 'admin' ? (
  <div className="admin-action-row">
    <button
      type="button"
      className="action-btn primary"
      onClick={() => handleResetAdminPassword(admin)}
    >
      임시 비밀번호 발급
    </button>

    <button
      type="button"
      className="action-btn purple"
      onClick={() => handleChangeAdminPassword(admin)}
    >
      비밀번호 변경
    </button>

    <button
      type="button"
      className="action-btn neutral"
      onClick={() => handleDeactivateAdmin(admin)}
    >
      비활성화
    </button>

    <button
      type="button"
      className="action-btn danger"
      onClick={() => handleDeleteAdmin(admin)}
    >
      삭제
    </button>
  </div>
) : null}
            </article>
          ))}
        </div>
      )}
    </section>

    <section className="admin-section-card">
      <div className="admin-section-head">
        <div>
          <div className="admin-section-badge">ACTION LOGS</div>
          <h3>관리자 작업이력</h3>
          <p>승인, 거절, 비밀번호 발급, 비활성화, 삭제 등의 이력을 확인합니다.</p>
        </div>
        <div className="admin-section-stats">
          <div className="admin-stat-box">
            <span className="admin-stat-label">기록 수</span>
            <strong>{(adminActionLogs || []).length}건</strong>
          </div>
        </div>
      </div>

      {(adminActionLogs || []).length === 0 ? (
        <div className="admin-empty-box">작업 이력이 없습니다.</div>
      ) : (
        <div className="admin-log-list">
          {adminActionLogs.map((log) => (
            <article key={log.id} className="admin-log-card">
              <div className="admin-log-top">
                <strong>{log.action_type}</strong>
                <span>{log.action_at || '-'}</span>
              </div>
              <div className="admin-log-body">
                <div>대상 이름: {log.target_name || '-'}</div>
                <div>대상 이메일: {log.target_email || '-'}</div>
                <div>작업자: {log.action_by || '-'}</div>
                <div>메모: {log.note || '-'}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  </div>
) : null}
      
     {activeTab === '회원' && (
  <div className="member-page-modern">
    <div className="member-page-hero">
      <div className="member-page-hero-left">
        <div className="member-page-badge">MEMBER MANAGEMENT</div>
        <h2>회원 관리</h2>
        <p className="member-page-hero-text">
          신규 회원 등록, 기존 회원 수정, 프로그램 연결, 세션 현황 확인까지
          한 화면에서 정리하는 회원 관리 영역입니다.
        </p>
      </div>

      <div className="member-page-hero-right">
        <div className="member-page-hero-mini">
          <span>전체 회원</span>
          <strong>{totalMemberCount}명</strong>
          <p>현재 등록된 전체 회원 수입니다.</p>
        </div>

        <div className="member-page-hero-mini">
          <span>현재 표시</span>
          <strong>{visibleMemberCount}명</strong>
          <p>검색 / 필터 조건에 맞는 회원 수입니다.</p>
        </div>
      </div>
    </div>

    <div className="member-page-grid">
      <section className="card member-form-card-modern">
        <div className="member-card-head">
          <div>
            <div className="member-card-label">MEMBER FORM</div>
            <h3>{editingMemberId ? '회원 수정' : '회원 등록 / 수정'}</h3>
            <p className="sub-text">
              기본 정보, 프로그램, 세션, 기간, 회원 메모를 입력하는 영역입니다.
            </p>
          </div>
        </div>

        <form className="stack-gap" onSubmit={handleMemberSubmit}>
          <div className="member-form-block">
            <div className="member-form-block-title">기본 정보</div>

            <div className="grid-2">
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
            </div>

            <label className="field">
              <span>현재 프로그램</span>
              <select
                value={memberForm.current_program_id}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, current_program_id: e.target.value })
                }
              >
                <option value="">선택 안함</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="member-form-block">
            <div className="member-form-block-title">세션 / 기간</div>

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
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, end_date: e.target.value })
                  }
                />
              </label>
            </div>
          </div>

          <div className="member-form-block">
            <div className="member-form-block-title">메모 / 접속</div>

            <label className="field">
              <span>회원 메모(회원에게 보임)</span>
              <textarea
                rows="4"
                value={memberForm.memo}
                onChange={(e) => setMemberForm({ ...memberForm, memo: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Access Code</span>
              <div className="inline-actions member-access-row">
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
                    setMemberForm((prev) => ({ ...prev, access_code: randomCode() }))
                  }
                >
                  생성
                </button>
              </div>
            </label>
          </div>

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

      <section className="card member-list-card-modern">
        <div className="member-card-head">
          <div>
            <div className="member-card-label">MEMBER LIST</div>
            <h3>회원 목록</h3>
            <p className="sub-text">
              회원 검색, 프로그램 필터, 잔여 세션 상태를 함께 확인할 수 있습니다.
            </p>
          </div>

          <div className="member-count-badges">
            <span className="count-badge">총 {totalMemberCount}명</span>
            <span className="count-badge soft">현재 표시 {visibleMemberCount}명</span>
          </div>
        </div>

        <div className="member-list-modern-toolbar">
          <input
            placeholder="이름 / 목표 / 프로그램 검색"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
          />

          <div className="member-list-filter-row">
            <select
              value={memberProgramFilter}
              onChange={(e) => setMemberProgramFilter(e.target.value)}
            >
              <option value="">전체 프로그램</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={memberStatusFilter}
              onChange={(e) => setMemberStatusFilter(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="remaining">잔여 있음</option>
              <option value="ended">소진</option>
            </select>
          </div>
        </div>

        <div className="list-stack">
          {filteredMemberStats.length === 0 ? (
            <div className="workout-list-empty">검색 결과가 없습니다.</div>
          ) : null}

          {filteredMemberStats.map((member) => {
  const isSelected = selectedMemberId === member.id
  const remainingSessions = Number(member.remainingSessions || 0)
  const statusClass =
    remainingSessions <= 0
      ? 'pill-red'
      : remainingSessions <= 5
      ? 'pill-amber'
      : 'pill-green'

  const isCollapsed = collapsedMembers[member.id] ?? true

  return (
    <div
      key={member.id}
      className={`member-list-modern-card member-list-collapsible-card ${isSelected ? 'selected' : ''}`}
    >
      <div className="member-list-modern-top">
        <button
          type="button"
          className="member-list-name-button"
          onClick={() => {
            setCollapsedMembers((prev) => ({
              ...prev,
              [member.id]: !isCollapsed,
            }))
          }}
        >
          <div className="member-list-modern-name">
            <strong>{member.name}</strong>
            <span className={`pill ${statusClass}`}>
              남은 {remainingSessions}회
            </span>
          </div>
          <span className="member-collapse-mark">{isCollapsed ? '+' : '−'}</span>
        </button>

        <div className="member-list-modern-program">
          {member.programs?.name || '프로그램 없음'}
        </div>
      </div>

      {!isCollapsed && (
        <div className="member-list-modern-grid">
          <div className="member-mini-info">
            <span>목표</span>
            <strong>{member.goal || '-'}</strong>
          </div>

          <div className="member-mini-info">
            <span>Access</span>
            <strong>{member.access_code || '-'}</strong>
          </div>

          <div className="member-mini-info">
            <span>PT 수업</span>
            <strong>{member.ptCount}회</strong>
          </div>

          <div className="member-mini-info">
            <span>개인운동</span>
            <strong>{member.personalCount}회</strong>
          </div>
        </div>
      )}

      <div className="inline-actions wrap member-card-actions">
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
      </section>
    </div>
  </div>
)}
 
{activeTab === '회원상세' && (
  <div className="stack-gap">
    <div className="card member-detail-search-card">
      <div className="section-head">
        <div>
          <h2>회원 상세</h2>
          <p className="sub-text">
            회원을 검색해서 바로 상세정보와 루틴을 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="stack-gap">
        <input
          placeholder="회원명 / 목표 / 프로그램 검색"
          value={memberDetailSearch}
          onChange={(e) => setMemberDetailSearch(e.target.value)}
        />

        <div className="list-stack member-detail-search-results">
          {!trimmedMemberDetailSearch ? (
            <div className="workout-list-empty">
              회원명 / 목표 / 프로그램명을 입력하면 검색 결과가 표시됩니다.
            </div>
          ) : filteredMemberDetailMembers.length === 0 ? (
            <div className="workout-list-empty">검색 결과가 없습니다.</div>
          ) : (
            filteredMemberDetailMembers.slice(0, 8).map((member) => (
              <button
                key={member.id}
                type="button"
                className={`member-detail-search-item ${selectedMemberId === member.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedMemberId(member.id)
                  setMemberDetailSearch(member.name || '')
                }}
              >
                <div>
                  <strong>{member.name || '-'}</strong>

                  <div className="member-level-inline">
                    <span className="member-level-badge">
                      {member.member_levels?.level_name || '등급 없음'}
                    </span>
                    <span className="member-level-xp">
                      Lv.{member.member_levels?.level_no || 0}
                    </span>
                    <span className="member-level-totalxp">
                      XP {member.member_levels?.total_xp || 0}
                    </span>
                  </div>

                  <div className="compact-text">
                    목표: {member.goal || '-'} / 프로그램: {member.programs?.name || '프로그램 없음'}
                  </div>
                </div>

                <span className="pill">
                  남은{' '}
                  {Math.max(
                    Number(member.total_sessions || 0) - Number(member.used_sessions || 0),
                    0
                  )}
                  회
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>


<div className="member-detail-guide-toggle-wrap">
  <button
    type="button"
    className="member-detail-guide-toggle"
    onClick={() => setMemberDetailGuideOpen((prev) => !prev)}
  >
    <div>
      <div className="member-detail-guide-badge">GUIDE</div>
      <h3>회원상세 사용방법</h3>
      <p className="sub-text">
        회원 검색부터 루틴 관리, 메모 확인까지 필요한 흐름만 짧게 정리했습니다.
      </p>
    </div>

    <span className="member-detail-guide-toggle-mark">
      {memberDetailGuideOpen ? '−' : '+'}
    </span>
  </button>
</div>

{memberDetailGuideOpen && (
  <section className="member-detail-guide-card">
    <div className="member-detail-guide-head">
      <div className="member-detail-guide-head-badge">처음 사용자 안내</div>
      <h3>회원상세는 이렇게 보면 됩니다</h3>
      <p>
        검색하고, 선택하고, 루틴과 메모를 확인하는 흐름만 빠르게 볼 수 있게 정리했습니다.
      </p>
    </div>

    <div className="member-detail-guide-grid">
      <div className="member-detail-guide-item">
        <div className="member-detail-guide-no">1</div>
        <div>
          <strong>회원 검색</strong>
          <p>회원명, 목표, 프로그램명으로 먼저 검색합니다.</p>
          <span>이렇게 하면 → 원하는 회원을 빠르게 찾을 수 있습니다.</span>
        </div>
      </div>

      <div className="member-detail-guide-item">
        <div className="member-detail-guide-no">2</div>
        <div>
          <strong>회원 선택</strong>
          <p>검색 결과에서 해당 회원을 누릅니다.</p>
          <span>이렇게 하면 → 회원 기본정보와 루틴 관리 화면이 열립니다.</span>
        </div>
      </div>

      <div className="member-detail-guide-item">
        <div className="member-detail-guide-no">3</div>
        <div>
          <strong>루틴 확인 / 수정</strong>
          <p>주차와 요일을 열어서 운동, 세트, 메모를 수정합니다.</p>
          <span>이렇게 하면 → 회원별 주차 루틴을 한 화면에서 관리할 수 있습니다.</span>
        </div>
      </div>

      <div className="member-detail-guide-item">
        <div className="member-detail-guide-no">4</div>
        <div>
          <strong>메모와 건강정보 확인</strong>
          <p>아래에서 비공개 메모와 건강기록을 함께 봅니다.</p>
          <span>이렇게 하면 → 수업 방향과 관리 포인트를 이어서 확인할 수 있습니다.</span>
        </div>
      </div>
    </div>
  </section>
)}
    
    {selectedMember ? (
      <div className="card">
        <div className="sub-card member-detail-modern-card">
          <div className="member-hero-card">
            <div className="member-hero-top">
              <div>
                <div className="member-hero-badge">MEMBER DETAIL</div>
                <h3>선택 회원 상세 / 루틴 관리</h3>
                <p className="member-hero-subtext">
                  회원 기본 정보와 주차별 루틴을 한 화면에서 정리하는 영역입니다.
                </p>
              </div>

              <div className="member-hero-program">
                {selectedMember.programs?.name || '프로그램 없음'}
              </div>
            </div>

            <div className="member-hero-grid">
              <div className="member-hero-item">
                <span>회원명</span>
                <strong>{selectedMember.name}</strong>
              </div>

              <div className="member-hero-item">
                <span>회원 등급</span>
                <strong>{selectedMember.member_levels?.level_name || '등급 없음'}</strong>
                <div className="compact-text">
                  Lv.{selectedMember.member_levels?.level_no || 0} / XP {selectedMember.member_levels?.total_xp || 0}
                </div>
              </div>

              <div className="member-hero-item">
                <span>목표</span>
                <strong>{selectedMember.goal || '-'}</strong>
              </div>

              <div className="member-hero-item">
                <span>기간</span>
                <strong>
                  {formatDate(selectedMember.start_date)} ~ {formatDate(selectedMember.end_date)}
                </strong>
              </div>

              <div className="member-hero-item">
                <span>회원 링크</span>
                <strong className="member-hero-link member-hero-link-break">
                  {window.location.origin}?member={selectedMember.id}
                </strong>
              </div>
            </div>

            <div className="member-hero-note">
              <span>회원 메모</span>
              <p>{selectedMember.memo || '-'}</p>
            </div>
          </div>

          <div className="routine-shell">
            <div className="routine-shell-top">
              <div>
                <h4>루틴 편집</h4>
                <p className="sub-text">
                  주차를 선택하고, 요일별 운동을 접고 펼치면서 관리할 수 있습니다.
                </p>
              </div>
            </div>

            <label className="field">
              <span>루틴 제목</span>
              <input
                value={routineForm.title}
                onChange={(e) =>
                  setRoutineForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </label>

            <div className="inline-actions wrap routine-week-tabs">
              {(routineForm.weeks || []).map((week, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === selectedRoutineWeek ? 'primary-btn' : 'secondary-btn'}
                  onClick={() => setSelectedRoutineWeek(index)}
                >
                  {week.week_number}주차
                </button>
              ))}

              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  const nextIndex = Array.isArray(routineForm.weeks) ? routineForm.weeks.length : 0
                  addRoutineWeek()
                  setSelectedRoutineWeek(nextIndex)
                }}
              >
                + 주차 추가
              </button>
            </div>

            <div className="list-stack">
              {(() => {
                const currentWeek = currentRoutineWeek

                if (!currentWeek) {
                  return <div className="compact-text">선택된 주차가 없습니다.</div>
                }

                return (
                  <div className="routine-week-card">
                    <div className="routine-week-card-top">
                      <div>
                        <div className="routine-week-label">ROUTINE WEEK</div>
                        <strong>{currentWeek.week_number}주차</strong>
                      </div>

                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => {
                          removeRoutineWeek(selectedRoutineWeek)
                          setSelectedRoutineWeek(0)
                        }}
                      >
                        주차 삭제
                      </button>
                    </div>

                    <div className="list-stack" style={{ marginTop: '16px' }}>
                      {(currentWeek.days || []).map((day, dayIndex) => {
                        const dayKey = `${currentWeek.week_number}-${day.day_of_week}`
                        const isCollapsed = collapsedRoutineDays[dayKey] ?? true
                        const itemCount = Array.isArray(day.items) ? day.items.length : 0

                        return (
                          <div
                            key={`${currentWeek.week_number}-${day.day_of_week}`}
                            className="routine-day-card"
                          >
                            <button
                              type="button"
                              className="routine-day-toggle"
                              onClick={() =>
                                toggleRoutineDayCollapse(
                                  currentWeek.week_number,
                                  day.day_of_week
                                )
                              }
                            >
                              <div className="routine-day-left">
                                <div className="routine-day-title-row">
                                  <strong>{day.day_of_week}요일</strong>
                                  <span className="pill">운동 {itemCount}개</span>
                                </div>
                                <div className="routine-day-meta">
                                  요일별 루틴을 눌러 열고 닫을 수 있습니다.
                                </div>
                              </div>

                              <span className={`routine-day-arrow ${!isCollapsed ? 'open' : ''}`}>
                                ▾
                              </span>
                            </button>

                            {!isCollapsed && (
                              <div className="routine-day-body">
                                <div className="inline-actions wrap" style={{ marginBottom: '12px' }}>
                                  <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => addRoutineItem(selectedRoutineWeek, dayIndex)}
                                  >
                                    운동 추가
                                  </button>
                                </div>

                                <div className="list-stack">
                                  {(day.items || []).map((item, itemIndex) => (
                                    <div key={itemIndex} className="routine-exercise-card">
                                      <div className="routine-exercise-head">
                                        <div>
                                          <div className="routine-exercise-label">
                                            EXERCISE {itemIndex + 1}
                                          </div>
                                          <strong>운동 {itemIndex + 1}</strong>
                                        </div>

                                        <button
                                          type="button"
                                          className="danger-btn"
                                          onClick={() =>
                                            removeRoutineItem(selectedRoutineWeek, dayIndex, itemIndex)
                                          }
                                        >
                                          운동 삭제
                                        </button>
                                      </div>

                                      <div className="grid-2" style={{ marginTop: '12px' }}>
                                        <label className="field">
                                          <span>운동 선택</span>
                                          <select
                                            value={String(item.exercise_id || '')}
                                            onChange={(e) =>
                                              updateRoutineItemSelect(
                                                selectedRoutineWeek,
                                                dayIndex,
                                                itemIndex,
                                                e.target.value
                                              )
                                            }
                                          >
                                            <option value="">운동DB에서 선택</option>
                                            {exercises.map((exercise) => (
                                              <option key={exercise.id} value={String(exercise.id)}>
                                                [{exercise.body_part || '-'}] {exercise.name}
                                              </option>
                                            ))}
                                          </select>
                                        </label>

                                        <label className="field">
                                          <span>운동명 직접입력</span>
                                          <input
                                            value={item.exercise_name_snapshot || ''}
                                            onChange={(e) =>
                                              updateRoutineItemField(
                                                selectedRoutineWeek,
                                                dayIndex,
                                                itemIndex,
                                                'exercise_name_snapshot',
                                                e.target.value
                                              )
                                            }
                                            placeholder="예: 레그프레스, 햄스트링 스트레칭"
                                          />
                                        </label>
                                      </div>

                                      <div className="grid-2">
                                        <label className="field">
                                          <span>시간(분)</span>
                                          <input
                                            type="number"
                                            min="0"
                                            value={item.duration_minutes || ''}
                                            onChange={(e) =>
                                              updateRoutineItemField(
                                                selectedRoutineWeek,
                                                dayIndex,
                                                itemIndex,
                                                'duration_minutes',
                                                e.target.value
                                              )
                                            }
                                            placeholder="선택 입력"
                                          />
                                        </label>

                                        <label className="field">
                                          <span>메모 / 코칭포인트</span>
                                          <input
                                            value={item.memo || ''}
                                            onChange={(e) =>
                                              updateRoutineItemField(
                                                selectedRoutineWeek,
                                                dayIndex,
                                                itemIndex,
                                                'memo',
                                                e.target.value
                                              )
                                            }
                                            placeholder="예: 천천히 내려가기 / 호흡 유지"
                                          />
                                        </label>
                                      </div>

                                      <div className="stack-gap">
                                        <div className="inline-actions wrap">
                                          <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={() =>
                                              addRoutineSet(selectedRoutineWeek, dayIndex, itemIndex)
                                            }
                                          >
                                            세트 추가
                                          </button>
                                        </div>

                                        {(item.sets || []).map((setRow, setIndex) => (
                                          <div key={setIndex} className="set-row routine-set-row">
                                            <input
                                              placeholder="중량(kg)"
                                              value={setRow.kg}
                                              onChange={(e) =>
                                                updateRoutineSetValue(
                                                  selectedRoutineWeek,
                                                  dayIndex,
                                                  itemIndex,
                                                  setIndex,
                                                  'kg',
                                                  e.target.value
                                                )
                                              }
                                            />
                                            <input
                                              placeholder="횟수(reps)"
                                              value={setRow.reps}
                                              onChange={(e) =>
                                                updateRoutineSetValue(
                                                  selectedRoutineWeek,
                                                  dayIndex,
                                                  itemIndex,
                                                  setIndex,
                                                  'reps',
                                                  e.target.value
                                                )
                                              }
                                            />
                                            <button
                                              type="button"
                                              className="danger-btn"
                                              onClick={() =>
                                                removeRoutineSet(
                                                  selectedRoutineWeek,
                                                  dayIndex,
                                                  itemIndex,
                                                  setIndex
                                                )
                                              }
                                            >
                                              삭제
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="inline-actions wrap" style={{ marginTop: '18px' }}>
                      <button className="primary-btn" type="button" onClick={handleRoutineSave}>
                        루틴 저장
                      </button>
                      <button className="danger-btn" type="button" onClick={handleRoutineDelete}>
                        루틴 삭제
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        <div className="sub-card">
          <h3>관리자 전용 메모</h3>

          <label className="field">
            <span>비공개 메모 입력</span>
            <textarea
              rows="4"
              value={adminNoteInput}
              onChange={(e) => setAdminNoteInput(e.target.value)}
            />
          </label>

          <button className="primary-btn" type="button" onClick={handleAdminNoteSave}>
            메모 저장
          </button>

          <div className="list-stack">
            {adminNotes.map((note) => (
              <div key={note.id} className="list-card">
                <div className="compact-text">{note.note}</div>
                <div className="compact-text">
                  수정일: {note.updated_at?.slice(0, 10) || '-'}
                </div>
                <button
                  className="danger-btn"
                  type="button"
                  onClick={() => handleAdminNoteDelete(note.id)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sub-card">
          <h3>회원 건강정보</h3>

          <div className="list-stack">
            {memberHealthLogs.length === 0 ? (
              <div className="compact-text">등록된 건강정보가 없습니다.</div>
            ) : null}

            {memberHealthLogs.map((health) => {
              const collapsed = collapsedHealthLogs[health.id] ?? true

              return (
                <div key={health.id} className="list-card">
                  <div className="list-card-top">
                    <strong>{health.record_date}</strong>
                    <span className="pill">
                      체중 {health.weight_kg || '-'}kg
                    </span>
                  </div>

                  <div className="compact-text">
                    간략히보기: 키 {health.height_cm || '-'} / 체지방 {health.body_fat_percent || '-'} / 골격근 {health.skeletal_muscle_mass || '-'} / BMR {health.bmr || '-'} / 권장열량 {health.recommended_kcal || '-'}
                  </div>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() =>
                      setCollapsedHealthLogs((prev) => ({
                        ...prev,
                        [health.id]: !collapsed,
                      }))
                    }
                  >
                    {collapsed ? '상세히보기' : '간략히보기'}
                  </button>

                  {!collapsed && (
                    <div className="detail-box">
                      <p><strong>성별:</strong> {health.sex === 'female' ? '여성' : health.sex === 'male' ? '남성' : '-'}</p>
                      <p><strong>나이:</strong> {health.age || '-'}</p>
                      <p><strong>키:</strong> {health.height_cm || '-'}</p>
                      <p><strong>체중:</strong> {health.weight_kg || '-'}</p>
                      <p><strong>체지방률:</strong> {health.body_fat_percent || '-'}</p>
                      <p><strong>골격근량:</strong> {health.skeletal_muscle_mass || '-'}</p>
                      <p><strong>체지방량:</strong> {health.body_fat_mass || '-'}</p>
                      <p><strong>내장지방레벨:</strong> {health.visceral_fat_level || '-'}</p>
                      <p><strong>내장지방면적:</strong> {health.visceral_fat_area || '-'}</p>
                      <p><strong>WHR:</strong> {health.whr || '-'}</p>
                      <p><strong>기초대사량:</strong> {health.bmr || '-'}</p>
                      <p><strong>하루 권장 섭취열량:</strong> {health.recommended_kcal || '-'}</p>
                      <p><strong>인바디점수:</strong> {health.inbody_score || '-'}</p>
                      <p><strong>병력사항:</strong> {health.medical_history || '-'}</p>
                      <p><strong>회원 메모:</strong> {health.member_note || '-'}</p>
                      <p><strong>인바디 이미지 URL:</strong> {health.inbody_image_url || '-'}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    ) : (
      <div className="card">
        <div className="workout-list-empty">검색해서 회원을 먼저 선택해주세요.</div>
      </div>
    )}
  </div>
)}


     {activeTab === '나만의 매니저' && (
  <div className="manager-page">
    <section className="manager-hero">
      <div className="manager-hero-left">
        <div className="manager-badge">MY MANAGER</div>
        <h2>나만의 매니저</h2>
        <p className="manager-hero-text">
          회원관리, 매출, 콘텐츠, 브랜딩, 방향성까지
          지금의 나를 움직이게 만드는 운영 코치 탭입니다.
        </p>
      </div>

      <div className="manager-hero-right">
        <div className="manager-level-card">
          <span>현재 포지션</span>
          <strong>{trainerLevelSummary.currentLevel.name}</strong>

          <p style={{ marginBottom: '10px' }}>
            {trainerLevelSummary.currentLevel.description}
          </p>

          <div className="compact-text" style={{ marginBottom: '6px' }}>
            총 XP: {trainerLevelSummary.totalXp.toLocaleString()}
          </div>

          <div className="compact-text" style={{ marginBottom: '6px' }}>
            누적 커리어 XP: {trainerLevelSummary.careerXp.toLocaleString()} /
            실행 XP: {trainerLevelSummary.actionXp.toLocaleString()} /
            과제 XP: {trainerLevelSummary.taskXp.toLocaleString()}
          </div>

          <div className="compact-text" style={{ marginBottom: '12px' }}>
            이번 달 실행 XP: {trainerLevelSummary.currentMonthActionXp.toLocaleString()}
          </div>

          <div className="manager-progress">
            <div
              className="manager-progress-fill"
              style={{ width: `${trainerLevelSummary.progressPercent}%` }}
            />
          </div>

          <div className="manager-progress-text" style={{ marginTop: '8px' }}>
            {trainerLevelSummary.nextLevel
              ? `다음 레벨 ${trainerLevelSummary.nextLevel.name}까지 ${trainerLevelSummary.xpToNextLevel}XP 남음`
              : '최고 레벨입니다.'}
          </div>
        </div>
      </div>
    </section>
    <details className="tab-usage-guide-card manager-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE MY MANAGER</div>
          <strong>나만의 매니저는 내 운영 방향을 잡는 탭입니다</strong>
          <p>
            지금 등급이 어디인지 보는 화면이 아니라,
            내 실행력, 성장 방향, 우선 과제, 장기 구조를 스스로 관리하는 개인 운영 탭입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>현재 포지션 확인 → 지금 내가 어디쯤인지 봅니다</strong>
              <p>
                총 XP, 커리어 XP, 실행 XP, 과제 XP를 같이 보면
                경험은 쌓였는지, 실행이 부족한지, 지금 막혀 있는 구간이 어디인지 보입니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>다음 레벨 목표 / 오늘의 우선 과제 확인 → 바로 실행으로 연결합니다</strong>
              <p>
                막연히 열심히 하는 대신,
                다음 레벨에 필요한 행동과 오늘 당장 해야 할 과제를 먼저 고르는 기준으로 씁니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>실행 로그 / XP 로그 보기 → 말이 아니라 기록으로 남깁니다</strong>
              <p>
                블로그, 릴스, 후기, 홍보 같은 실행을 기록하면
                내 성장이 느낌이 아니라 누적으로 보이고, 어떤 행동이 실제로 쌓이는지 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>창업 준비도 / 흐름 요약 보기 → 장기 방향을 정리합니다</strong>
              <p>
                이번 달 흐름과 장기 성장 단계를 같이 보면
                지금은 회원관리 강화가 필요한지, 콘텐츠 확장이 필요한지, 브랜딩 구조를 잡을 시기인지 구분할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            운영대시보드에서 매출이 흔들리고, 리포트에서 후속관리 부족이 보이는데,
            나만의 매니저에서 오늘의 우선 과제가 콘텐츠보다 회원관리/후속관리 쪽이라면 지금 달은 브랜딩보다 전환과 유지 구조를 먼저 잡는 게 맞습니다.
          </p>
        </div>
      </div>
    </details>
    <section className="manager-section manager-collapsible-section">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('career')}
      >
        <div>
          <h3>누적 커리어 입력</h3>
          <p className="sub-text">
            지금까지 해온 기록을 직접 입력해두면, 이후 XP/등급 계산에 반영됩니다.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.career ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.career && (
        <div className="manager-collapsible-body">
          <div className="stack-gap">
            <div className="grid-2">
              <label className="field">
                <span>트레이너 경력(년차)</span>
                <input
                  type="number"
                  min="0"
                  value={careerProfileForm.career_years}
                  onChange={(e) =>
                    setCareerProfileForm((prev) => ({
                      ...prev,
                      career_years: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>누적 블로그 수</span>
                <input
                  type="number"
                  min="0"
                  value={careerProfileForm.total_blog_posts}
                  onChange={(e) =>
                    setCareerProfileForm((prev) => ({
                      ...prev,
                      total_blog_posts: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>인스타 게시물 수</span>
                <input
                  type="number"
                  min="0"
                  value={careerProfileForm.total_instagram_posts}
                  onChange={(e) =>
                    setCareerProfileForm((prev) => ({
                      ...prev,
                      total_instagram_posts: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>리뷰노트 블로그 체험단 수</span>
                <input
                  type="number"
                  min="0"
                  value={careerProfileForm.total_blog_reviewnote_campaigns}
                  onChange={(e) =>
                    setCareerProfileForm((prev) => ({
                      ...prev,
                      total_blog_reviewnote_campaigns: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>인스타 체험단 수</span>
                <input
                  type="number"
                  min="0"
                  value={careerProfileForm.total_instagram_campaigns}
                  onChange={(e) =>
                    setCareerProfileForm((prev) => ({
                      ...prev,
                      total_instagram_campaigns: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>총 수업 수</span>
                <input
                  type="number"
                  min="0"
                  value={careerProfileForm.total_classes}
                  onChange={(e) =>
                    setCareerProfileForm((prev) => ({
                      ...prev,
                      total_classes: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>총 상담 수</span>
                <input
                  type="number"
                  min="0"
                  value={careerProfileForm.total_consultations}
                  onChange={(e) =>
                    setCareerProfileForm((prev) => ({
                      ...prev,
                      total_consultations: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>자격증 수</span>
                <input
                  type="number"
                  min="0"
                  value={careerProfileForm.total_certifications}
                  onChange={(e) =>
                    setCareerProfileForm((prev) => ({
                      ...prev,
                      total_certifications: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>협업 경험 수</span>
                <input
                  type="number"
                  min="0"
                  value={careerProfileForm.total_collaborations}
                  onChange={(e) =>
                    setCareerProfileForm((prev) => ({
                      ...prev,
                      total_collaborations: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>프로필 저장 상태</span>
                <input
                  value={careerProfileId ? '저장된 프로필 있음' : '아직 저장 전'}
                  disabled
                />
              </label>
            </div>

            <label className="field">
              <span>메모</span>
              <textarea
                rows="4"
                value={careerProfileForm.memo}
                onChange={(e) =>
                  setCareerProfileForm((prev) => ({
                    ...prev,
                    memo: e.target.value,
                  }))
                }
                placeholder="예: 2022년부터 트레이너 활동 / 리뷰노트 블로그 체험단 경험 있음 / 수업 방식 특징"
              />
            </label>

            <div className="inline-actions wrap">
              <button
                type="button"
                className="primary-btn"
                onClick={handleCareerProfileSave}
              >
                누적 커리어 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="manager-section manager-collapsible-section">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('nextLevel')}
      >
        <div>
          <h3>다음 레벨 목표</h3>
          <p className="sub-text">
            현재 레벨에서 다음 단계로 가기 위해 얼마나 더 필요한지 보여주는 구간입니다.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.nextLevel ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.nextLevel && (
        <div className="manager-collapsible-body">
          {trainerLevelSummary.nextLevel ? (
            <div className="detail-box">
              <p>
                다음 레벨: <strong>{trainerLevelSummary.nextLevel.name}</strong>
              </p>
              <p>
                남은 XP: <strong>{trainerLevelSummary.xpToNextLevel.toLocaleString()} XP</strong>
              </p>

              <div className="manager-progress" style={{ marginTop: '12px' }}>
                <div
                  className="manager-progress-fill"
                  style={{ width: `${trainerLevelSummary.progressPercent}%` }}
                />
              </div>

              <div className="manager-progress-text" style={{ marginTop: '8px' }}>
                현재 진행률 {trainerLevelSummary.progressPercent}%
              </div>

              <div className="compact-text" style={{ marginTop: '12px' }}>
                추천 행동 예시:
                <br />• 블로그 추가 작성
                <br />• 수업 기록 누적
                <br />• 후기/체험단 경험 정리
                <br />• 실행 로그와 과제 완료 누적
              </div>
            </div>
          ) : (
            <div className="detail-box">
              <p><strong>최고 레벨입니다.</strong></p>
              <p>현재 단계에서는 창업 또는 브랜드 운영 확장을 준비해볼 수 있습니다.</p>
            </div>
          )}
        </div>
      )}
    </section>

    <section className="manager-section manager-collapsible-section">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('startup')}
      >
        <div>
          <h3>창업 준비도</h3>
          <p className="sub-text">
            현재 데이터를 기반으로 창업 가능 수준을 분석합니다.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.startup ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.startup && (
        <div className="manager-collapsible-body">
          <div className="detail-box">
            <p>
              준비도: <strong>{startupReadiness.percent}%</strong>
            </p>

            <div className="manager-progress" style={{ marginTop: '10px' }}>
              <div
                className="manager-progress-fill"
                style={{ width: `${startupReadiness.percent}%` }}
              />
            </div>

            <div className="compact-text" style={{ marginTop: '10px' }}>
              강점: {startupReadiness.strengths.join(', ') || '없음'}
            </div>

            <div className="compact-text">
              보완 필요: {startupReadiness.부족.join(', ') || '없음'}
            </div>

            <div style={{ marginTop: '12px', fontWeight: '600' }}>
              {startupReadiness.message}
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="manager-section manager-collapsible-section">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('xpLogs')}
      >
        <div>
          <h3>최근 XP 적립 로그</h3>
          <p className="sub-text">
            어떤 행동이 성장 경험치로 반영됐는지 최근 기록 기준으로 보여줍니다.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.xpLogs ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.xpLogs && (
        <div className="manager-collapsible-body">
          <div className="list-stack">
            {recentXpLogs.length === 0 ? (
              <div className="workout-list-empty">아직 반영된 XP 로그가 없습니다.</div>
            ) : null}

            {recentXpLogs.map((log) => (
              <div key={log.id} className="list-card">
                <div className="list-card-top">
                  <strong>{log.title}</strong>
                  <span className="pill">+{log.xp}XP</span>
                </div>

                <div className="compact-text" style={{ marginBottom: '6px' }}>
                  날짜: {log.date || '-'}
                </div>

                <div className="compact-text">
                  내용: {log.description || '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>

    <section className="manager-section manager-collapsible-section">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('trainerGrowth')}
      >
        <div>
          <h3>트레이너 성장 단계</h3>
          <p className="sub-text">
            현재 위치와 다음 단계까지의 흐름을 한눈에 볼 수 있는 레벨 로드맵입니다.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.trainerGrowth ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.trainerGrowth && (
        <div className="manager-collapsible-body">
          <div className="list-stack">
            {trainerLevelRoadmap.map((level) => (
              <div
                key={level.key}
                className={`list-card trainer-level-roadmap-card ${
                  level.isCurrent ? 'current-level' : level.isPassed ? 'passed-level' : ''
                }`}
              >
                <div className="list-card-top">
                  <strong>{level.name}</strong>
                  <span className="pill">
                    {level.isCurrent
                      ? '현재 레벨'
                      : level.isPassed
                      ? '달성'
                      : `${level.xpNeeded}XP 남음`}
                  </span>
                </div>

                <div className="compact-text" style={{ marginBottom: '6px' }}>
                  기준 XP: {level.minXp.toLocaleString()}
                </div>

                <div className="compact-text" style={{ marginBottom: '6px' }}>
                  {level.description}
                </div>

                {level.isCurrent ? (
                  <div className="compact-text">
                    다음 단계:{' '}
                    {trainerLevelSummary.nextLevel
                      ? trainerLevelSummary.nextLevel.name
                      : '최고 레벨'}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>

    <section className="manager-thought-grid">
      {MANAGER_THOUGHT_CARDS.map((card) => (
        <article key={card.title} className="manager-thought-card">
          <div className="manager-card-label">{card.title}</div>
          <p>{card.text}</p>
          <span>{card.tag}</span>
        </article>
      ))}
    </section>

    <section className="manager-section manager-collapsible-section">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('levelSettings')}
      >
        <div>
          <h3>레벨 기준 설정</h3>
          <p className="sub-text">
            각 단계의 이름, 최소 XP, 설명을 직접 수정하고 저장할 수 있습니다.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.levelSettings ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.levelSettings && (
        <div className="manager-collapsible-body">
          <div className="list-stack">
            {trainerLevels.map((level) => (
              <div key={level.key} className="list-card">
                <div className="grid-2">
                  <label className="field">
                    <span>레벨 이름</span>
                    <input
                      value={level.name}
                      onChange={(e) =>
                        setTrainerLevelSettings((prev) => {
                          const hasCustom = prev.some((item) => item.level_key === level.key)
                          if (!hasCustom) {
                            return [
                              ...prev,
                              {
                                level_key: level.key,
                                level_name: e.target.value,
                                min_xp: level.minXp,
                                description: level.description,
                                admin_id: currentAdminId,
                              },
                            ]
                          }

                          return prev.map((item) =>
                            item.level_key === level.key
                              ? { ...item, level_name: e.target.value }
                              : item
                          )
                        })
                      }
                    />
                  </label>

                  <label className="field">
                    <span>최소 XP</span>
                    <input
                      type="number"
                      min="0"
                      value={level.minXp}
                      onChange={(e) =>
                        setTrainerLevelSettings((prev) => {
                          const hasCustom = prev.some((item) => item.level_key === level.key)
                          if (!hasCustom) {
                            return [
                              ...prev,
                              {
                                level_key: level.key,
                                level_name: level.name,
                                min_xp: e.target.value,
                                description: level.description,
                                admin_id: currentAdminId,
                              },
                            ]
                          }

                          return prev.map((item) =>
                            item.level_key === level.key
                              ? { ...item, min_xp: e.target.value }
                              : item
                          )
                        })
                      }
                    />
                  </label>
                </div>

                <label className="field">
                  <span>설명</span>
                  <textarea
                    rows="3"
                    value={level.description}
                    onChange={(e) =>
                      setTrainerLevelSettings((prev) => {
                        const hasCustom = prev.some((item) => item.level_key === level.key)
                        if (!hasCustom) {
                          return [
                            ...prev,
                            {
                              level_key: level.key,
                              level_name: level.name,
                              min_xp: level.minXp,
                              description: e.target.value,
                              admin_id: currentAdminId,
                            },
                          ]
                        }

                        return prev.map((item) =>
                          item.level_key === level.key
                            ? { ...item, description: e.target.value }
                            : item
                        )
                      })
                    }
                  />
                </label>

                <div className="inline-actions wrap">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() =>
                      handleTrainerLevelSettingSave({
                        key: level.key,
                        name: level.name,
                        minXp: level.minXp,
                        description: level.description,
                      })
                    }
                  >
                    이 레벨 기준 저장
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>

    <section className="manager-section manager-collapsible-section">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('todayTasks')}
      >
        <div>
          <h3>오늘의 우선 과제</h3>
          <p className="sub-text">
            지금 해야 할 일을 먼저 정리하고, 실행 중심으로 움직여보세요.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.todayTasks ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.todayTasks && (
        <div className="manager-collapsible-body">
          <div className="manager-task-grid">
            {managerTasks.map((task, index) => (
              <article key={`${task.title}-${index}`} className="manager-task-card">
                <div className="manager-task-top">
                  <span className={`manager-task-badge category-${task.category}`}>
                    {task.category}
                  </span>
                  <span className="manager-task-due">{task.due}</span>
                </div>

                <h4>{task.title}</h4>
                <p>{task.description}</p>

                <div className="manager-task-bottom">
                  <div className="inline-actions wrap">
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => handleManagerTaskAction(task)}
                    >
                      {task.action}
                    </button>

                    {completedTaskKeysToday.includes(task.actionKey) ? (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleManagerTaskUncomplete(task)}
                      >
                        완료 해제
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleManagerTaskComplete(task)}
                      >
                        완료
                      </button>
                    )}
                  </div>

                  {completedTaskKeysToday.includes(task.actionKey) ? (
                    <div className="compact-text" style={{ marginTop: '8px' }}>
                      오늘 완료 처리된 과제입니다. 잘못 눌렀다면 완료 해제를 누르세요.
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>

    <section className="manager-section manager-collapsible-section">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('managerComment')}
      >
        <div>
          <h3>매니저 코멘트</h3>
          <p className="sub-text">
            식상한 응원이 아니라, 지금 필요한 방향을 생각하게 만드는 코멘트입니다.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.managerComment ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.managerComment && (
        <div className="manager-collapsible-body">
          <div className="manager-insight-grid">
            {managerInsights.map((item, index) => (
              <article key={`${item.title}-${index}`} className="manager-insight-card">
                <div className="manager-card-label">{item.title}</div>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>

    <section className="manager-section manager-collapsible-section">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('flowSummary')}
      >
        <div>
          <h3>이번 흐름 요약</h3>
          <p className="sub-text">
            숫자는 완벽한 정답이 아니라, 지금 어디에 힘을 써야 하는지 보여주는 힌트입니다.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.flowSummary ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.flowSummary && (
        <div className="manager-collapsible-body">
          <div className="manager-score-grid">
            {managerScoreCards.map((card) => (
              <article key={card.label} className="manager-score-card">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <div className="manager-score-sub">{card.sub}</div>

                <div className="manager-progress">
                  <div
                    className="manager-progress-fill"
                    style={{ width: `${card.percent}%` }}
                  />
                </div>

                <div className="manager-progress-text">{card.percent}%</div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>

    <div className="manager-bottom-grid">
      <section className="manager-section">
        <div className="section-head">
          <div>
            <h3>레벨업 미션</h3>
            <p className="sub-text">
              단기 실행이 쌓여서 장기 성장 구조가 만들어집니다.
            </p>
          </div>
        </div>

        <div className="manager-mission-list">
          {managerMissions.map((mission, index) => (
            <article key={`${mission.title}-${index}`} className="manager-mission-card">
              <div>
                <strong>{mission.title}</strong>
                <p>{mission.progress}</p>
              </div>
              <span className="manager-reward">{mission.reward}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="manager-section">
        <div className="section-head">
          <div>
            <h3>앞으로의 방향</h3>
            <p className="sub-text">
              지금 해야 할 것과 앞으로 만들어야 할 구조를 같이 봅니다.
            </p>
          </div>
        </div>

        <div className="manager-roadmap-list">
          {MANAGER_ROADMAP.map((item, index) => (
            <article key={`${item.step}-${index}`} className="manager-roadmap-card">
              <div className="manager-roadmap-step">{item.step}</div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>

    <section className="manager-section manager-collapsible-section" id="manager-action-form">
      <button
        type="button"
        className="manager-toggle-btn"
        onClick={() => toggleManagerSection('actionLog')}
      >
        <div>
          <h3>실행 로그 입력</h3>
          <p className="sub-text">
            블로그, 릴스, 후기, 웹앱 홍보처럼 직접 실행한 행동을 기록하면
            레벨업 미션과 콘텐츠 수치에 반영됩니다.
          </p>
        </div>
        <span className={`manager-toggle-arrow ${managerOpenSections.actionLog ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {managerOpenSections.actionLog && (
        <div className="manager-collapsible-body">
          <div className="manager-log-form">
            <div className="grid-2">
              <label className="field">
                <span>날짜</span>
                <input
                  type="date"
                  value={managerActionForm.action_date}
                  onChange={(e) =>
                    setManagerActionForm((prev) => ({
                      ...prev,
                      action_date: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>실행 종류</span>
                <select
                  value={managerActionForm.action_type}
                  onChange={(e) =>
                    setManagerActionForm((prev) => ({
                      ...prev,
                      action_type: e.target.value,
                    }))
                  }
                >
                  <option value="blog_post">블로그 발행</option>
                  <option value="reel_upload">릴스 업로드</option>
                  <option value="webapp_promo">웹앱 홍보</option>
                  <option value="review_uploaded">후기 업로드</option>
                  <option value="marketing_post">마케팅 글 작성</option>
                </select>
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>채널</span>
                <input
                  value={managerActionForm.channel}
                  onChange={(e) =>
                    setManagerActionForm((prev) => ({
                      ...prev,
                      channel: e.target.value,
                    }))
                  }
                  placeholder="예: 인스타그램 / 블로그 / 스레드"
                />
              </label>

              <label className="field">
                <span>제목</span>
                <input
                  value={managerActionForm.title}
                  onChange={(e) =>
                    setManagerActionForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="예: 광주 화정동 저강도 PT 글 업로드"
                />
              </label>
            </div>

            <label className="field">
              <span>설명</span>
              <textarea
                rows="3"
                value={managerActionForm.description}
                onChange={(e) =>
                  setManagerActionForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="예: 부모님 PT 관련 블로그 작성 / 후기 기반 릴스 업로드"
              />
            </label>

            <label className="field">
              <span>링크</span>
              <input
                value={managerActionForm.link}
                onChange={(e) =>
                  setManagerActionForm((prev) => ({
                    ...prev,
                    link: e.target.value,
                  }))
                }
                placeholder="예: 게시글 링크나 릴스 링크"
              />
            </label>

            <div className="inline-actions wrap">
              <button
                type="button"
                className="primary-btn"
                onClick={handleManagerActionSave}
              >
                {editingManagerActionId ? '수정 완료' : '실행 로그 저장'}
              </button>
            </div>
          </div>

          <div className="list-stack">
            {managerActionLogs.length === 0 ? (
              <div className="workout-list-empty">
                아직 기록된 실행 로그가 없습니다.
              </div>
            ) : null}

            {managerActionLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="list-card">
                <div className="list-card-top">
                  <strong>{log.title || '제목 없음'}</strong>

                  <div className="inline-actions wrap">
                    <span className="pill">{log.action_date || '-'}</span>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleManagerActionEdit(log)}
                    >
                      수정
                    </button>

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleManagerActionDelete(log.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>

                <div className="compact-text">
                  종류: {log.action_type || '-'} / 채널: {log.channel || '-'}
                </div>

                <div className="compact-text">
                  설명: {log.description || '-'}
                </div>

                <div className="compact-text">
                  링크: {log.link || '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  </div>
)}
      
     {activeTab === '기록작성' && (
  <div className="record-page-modern">
    <div className="record-page-hero">
      <div className="record-page-hero-left">
        <div className="record-page-badge">WORKOUT LOG</div>
        <h2>운동 기록 관리</h2>
        <p className="record-page-hero-text">
          회원별 운동 기록 작성, 기구 선택, 실제 수행 운동명 입력, 유산소/케어 시간 기록까지
          한 화면에서 관리하는 영역입니다.
        </p>
      </div>

      <div className="record-page-hero-right">
        <div className="record-page-hero-mini">
          <span>오늘 선택 날짜</span>
          <strong>{workoutForm.workout_date || '-'}</strong>
          <p>현재 작성 중인 운동 기록 날짜입니다.</p>
        </div>

        <div className="record-page-hero-mini">
          <span>운동 개수</span>
          <strong>{workoutForm.items?.length || 0}개</strong>
          <p>현재 입력 중인 운동 카드 수입니다.</p>
        </div>
      </div>
    </div>
<div className="record-guide-toggle-wrap">
  <button
    type="button"
    className="record-guide-toggle"
    onClick={() => setRecordGuideOpen((prev) => !prev)}
  >
    <div>
      <div className="record-guide-badge">GUIDE</div>
      <h3>기록작성 사용방법</h3>
      <p className="sub-text">
        처음 사용하는 사람도 아래 4가지만 보면 기록 작성부터 저장까지 바로 할 수 있습니다.
      </p>
    </div>

    <span className="record-guide-toggle-mark">
      {recordGuideOpen ? '−' : '+'}
    </span>
  </button>
</div>

{recordGuideOpen && (
  <section className="record-guide-card">
    <div className="record-guide-head">
      <div className="record-guide-head-badge">처음 사용자 안내</div>
      <h3>운동 기록은 이렇게 하면 됩니다</h3>
      <p>
        설명을 길게 읽지 않아도 되도록, 실제 입력 순서와 결과만 짧게 묶었습니다.
      </p>
    </div>

    <div className="record-guide-grid">
      <div className="record-guide-item">
        <div className="record-guide-no">1</div>
        <div>
          <strong>회원 선택</strong>
          <p>어느 회원 기록인지 먼저 고릅니다.</p>
          <span>이렇게 하면 → 해당 회원 기준으로 오늘 운동 기록이 연결됩니다.</span>
        </div>
      </div>

      <div className="record-guide-item">
        <div className="record-guide-no">2</div>
        <div>
          <strong>날짜 / 기록 타입 선택</strong>
          <p>PT인지 개인운동인지, 어떤 날짜 기록인지 정합니다.</p>
          <span>이렇게 하면 → 저장되는 운동 기록 기준이 정확히 잡힙니다.</span>
        </div>
      </div>

      <div className="record-guide-item">
        <div className="record-guide-no">3</div>
        <div>
          <strong>운동 종류와 세트/시간 입력</strong>
          <p>근력운동, 유산소, 케어 중 맞는 유형으로 기록합니다.</p>
          <span>이렇게 하면 → 실제 수행한 운동 내용이 보기 쉽게 정리됩니다.</span>
        </div>
      </div>

      <div className="record-guide-item">
        <div className="record-guide-no">4</div>
        <div>
          <strong>저장 후 목록에서 확인</strong>
          <p>저장한 뒤 오른쪽 목록에서 날짜별로 다시 확인합니다.</p>
          <span>이렇게 하면 → 수정, 삭제, 통증 기록 확인까지 바로 이어집니다.</span>
        </div>
      </div>
    </div>
  </section>
)}
    <div className="two-col">
      <section className="card record-form-card-modern">
        <div className="record-card-head">
          <div>
            <div className="record-card-label">WRITE LOG</div>
            <h3>운동 기록 작성 / 수정</h3>
            <p className="sub-text">
              회원 선택, 운동 입력, 유형 선택, 세트/시간 기록, 통증 기록까지 순서대로 작성합니다.
            </p>
          </div>
        </div>

        <form className="stack-gap" onSubmit={handleWorkoutSubmit}>
          <div className="record-top-grid">
           
            
            <label className="field">
  <span>회원 선택</span>

  <button
    type="button"
    className="exercise-search-trigger"
    onClick={() =>
      isMemberDropdownOpen('form')
        ? closeMemberDropdown()
        : openMemberDropdown('form')
    }
  >
    <span>
      {members.find((m) => m.id === workoutForm.member_id)?.name || '회원 선택'}
    </span>
    <strong>⌄</strong>
  </button>

  {isMemberDropdownOpen('form') && (
    <div className="exercise-search-dropdown">
      <input
        type="text"
        placeholder="회원 검색"
        value={memberDropdown.keyword}
        onChange={(e) =>
          setMemberDropdown((prev) => ({
            ...prev,
            keyword: e.target.value,
          }))
        }
      />

      <div className="exercise-search-dropdown-list">
        {filteredMemberOptions.map((member) => (
          <button
            key={member.id}
            type="button"
            className="exercise-search-dropdown-item"
            onClick={() => {
              setWorkoutForm((prev) => ({
                ...prev,
                member_id: member.id,
              }))
              closeMemberDropdown()
            }}
          >
            {member.name}
          </button>
        ))}
      </div>
    </div>
  )}
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
          </div>

          <div className="stack-gap">
            {workoutForm.items.map((item, itemIndex) => (
              <div key={itemIndex} className="record-exercise-card">
                <div className="record-exercise-head">
                  <strong>운동 {itemIndex + 1}</strong>
                  <div className="inline-actions wrap">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => toggleWorkoutItemCollapse(itemIndex)}
                    >
                      {item.collapsed ? '상세히보기' : '간략히보기'}
                    </button>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => removeWorkoutItem(itemIndex)}
                      disabled={workoutForm.items.length === 1}
                    >
                      운동 삭제
                    </button>
                  </div>
                </div>

                <div className="record-exercise-summary">
                  간략히보기: {getWorkoutSummaryText(item)}
                </div>

                {!item.collapsed && (
                  <div className="stack-gap record-exercise-body">
                    <label className="field">
                      <span>기록 종류</span>
                      <select
  value={item.entry_type || 'strength'}
  onChange={(e) => updateWorkoutEntryType(itemIndex, e.target.value)}
>
  <option value="strength">근력운동</option>
  <option value="cardio">유산소</option>
  <option value="care">케어</option>
  <option value="stretching">스트레칭</option>
  <option value="pain_only">통증기록</option>
</select>
                    </label>

                    <div className="detail-box">
                      <p>
                        <strong>{getEntryTypeMeta(item.entry_type).label} 안내</strong>
                      </p>
                      <div className="compact-text">
                        {getEntryTypeMeta(item.entry_type).description}
                      </div>
                    </div>

                    {item.entry_type === 'strength' ? (
                      <>
                        <label className="field">
                          <span>훈련 방식</span>
                          <select
                            value={item.training_method || 'normal'}
                            onChange={(e) => updateWorkoutTrainingMethod(itemIndex, e.target.value)}
                          >
                            <option value="normal">일반운동</option>
                            <option value="superset">슈퍼세트</option>
                            <option value="dropset">드롭세트</option>
                          </select>
                        </label>

                        <div className="detail-box">
                          <p>
                            <strong>{getTrainingMethodMeta(item.training_method).label} 안내</strong>
                          </p>
                          <div className="compact-text">
                            {getTrainingMethodMeta(item.training_method).description}
                          </div>
                        </div>

                        <label className="field">
                          <span>추가 메모</span>
                          <input
                            value={item.method_note || ''}
                            onChange={(e) => updateWorkoutItemField(itemIndex, 'method_note', e.target.value)}
                            placeholder={getTrainingMethodMeta(item.training_method).placeholder}
                          />
                        </label>

                        {item.training_method === 'superset' ? (
                          <div className="stack-gap">
                            {[0, 1].map((subIndex) => {
                              const sub = item.sub_exercises?.[subIndex] || createEmptySubExercise()

                              return (
                                <div key={subIndex} className="detail-box">
                                  <div className="list-card-top">
                                    <strong>{subIndex === 0 ? '운동 A' : '운동 B'}</strong>
                                  </div>

                                  <label className="field">
  <span>사용 기구 선택</span>

  <button
    type="button"
    className="exercise-search-trigger"
    onClick={() =>
      isExerciseDropdownOpen('sub', itemIndex, subIndex)
        ? closeExerciseDropdown()
        : openExerciseDropdown('sub', itemIndex, subIndex)
    }
  >
    <span>
      {sub.exercise_id
        ? sub.exercise_name_snapshot || sub.equipment_name_snapshot || '선택됨'
        : '선택 안함'}
    </span>
    <strong>⌄</strong>
  </button>

  {isExerciseDropdownOpen('sub', itemIndex, subIndex) ? (
    <div className="exercise-search-dropdown">
      <input
        type="text"
        placeholder="운동명 검색"
        value={exerciseSearchDropdown.keyword}
        onChange={(e) =>
          setExerciseSearchDropdown((prev) => ({
            ...prev,
            keyword: e.target.value,
          }))
        }
      />

      <div className="exercise-search-dropdown-list">
        <button
          type="button"
          className={`exercise-search-dropdown-item ${sub.exercise_id === '' ? 'active' : ''}`}
          onClick={() => {
            updateWorkoutSubExerciseSelect(itemIndex, subIndex, '')
            closeExerciseDropdown()
          }}
        >
          선택 안함
        </button>

        {filteredExerciseOptions.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            className={`exercise-search-dropdown-item ${sub.exercise_id === exercise.id ? 'active' : ''}`}
            onClick={() => {
              updateWorkoutSubExerciseSelect(itemIndex, subIndex, exercise.id)
              closeExerciseDropdown()
            }}
          >
            [{exercise.body_part || '-'} / {exercise.category || '-'} / {exercise.brands?.name || '브랜드없음'}] {exercise.name}
          </button>
        ))}
      </div>
    </div>
  ) : null}
</label>

                                  <label className="field">
                                    <span>선택된 기구명</span>
                                    <input
                                      value={sub.equipment_name_snapshot || ''}
                                      readOnly
                                      placeholder="운동DB에서 선택한 기구명이 표시됩니다."
                                    />
                                  </label>

                                  <label className="field">
                                    <span>실제 수행 운동명</span>
                                    <input
                                      value={sub.performed_name || ''}
                                      onChange={(e) =>
                                        updateWorkoutSubExerciseName(itemIndex, subIndex, e.target.value)
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

                        ) : item.entry_type === 'stretching' ? (
  <>
    <label className="field">
      <span>스트레칭 이름</span>
      <input
        value={item.performed_name || ''}
        onChange={(e) => updateWorkoutItemName(itemIndex, e.target.value)}
        placeholder="예: 햄스트링 스트레칭 / 고관절 스트레칭"
      />
    </label>

    <div className="form-row">
      <label className="field">
        <span>시간(분)</span>
        <input
          type="number"
          min="0"
          value={item.stretch_minutes || ''}
          onChange={(e) => updateWorkoutItemField(itemIndex, 'stretch_minutes', e.target.value)}
          placeholder="예: 10"
        />
      </label>

      <label className="field">
        <span>횟수</span>
        <input
          type="number"
          min="0"
          value={item.stretch_reps || ''}
          onChange={(e) => updateWorkoutItemField(itemIndex, 'stretch_reps', e.target.value)}
          placeholder="예: 12"
        />
      </label>
    </div>

    <label className="field">
      <span>추가 메모</span>
      <input
        value={item.method_note || ''}
        onChange={(e) => updateWorkoutItemField(itemIndex, 'method_note', e.target.value)}
        placeholder="예: 좌우 각각 30초씩 / 3세트"
      />
    </label>
  </>
) : item.entry_type === 'pain_only' ? (
  <div className="detail-box">
    <p>
      <strong>통증기록 모드</strong>
    </p>
    <div className="compact-text">
      아래 통증 기록 카드에서 통증 상태만 바로 작성하면 됩니다.
    </div>
    <div className="compact-text">
      이 모드에서는 운동명, 기구명, 세트 입력 없이 통증 기록만 저장할 수 있습니다.
    </div>
  </div>
                        ) : (
                          <>
                           <label className="field">
  <span>사용 기구 선택</span>

  <button
    type="button"
    className="exercise-search-trigger"
    onClick={() =>
      isExerciseDropdownOpen('main', itemIndex)
        ? closeExerciseDropdown()
        : openExerciseDropdown('main', itemIndex)
    }
  >
    <span>
      {item.exercise_id
        ? item.exercise_name_snapshot || item.equipment_name_snapshot || '선택됨'
        : '선택 안함'}
    </span>
    <strong>⌄</strong>
  </button>

  {isExerciseDropdownOpen('main', itemIndex) ? (
    <div className="exercise-search-dropdown">
      <input
        type="text"
        placeholder="운동명 검색"
        value={exerciseSearchDropdown.keyword}
        onChange={(e) =>
          setExerciseSearchDropdown((prev) => ({
            ...prev,
            keyword: e.target.value,
          }))
        }
      />

      <div className="exercise-search-dropdown-list">
        <button
          type="button"
          className={`exercise-search-dropdown-item ${item.exercise_id === '' ? 'active' : ''}`}
          onClick={() => {
            updateWorkoutItemSelect(itemIndex, '')
            closeExerciseDropdown()
          }}
        >
          선택 안함
        </button>

        {filteredExerciseOptions.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            className={`exercise-search-dropdown-item ${item.exercise_id === exercise.id ? 'active' : ''}`}
            onClick={() => {
              updateWorkoutItemSelect(itemIndex, exercise.id)
              closeExerciseDropdown()
            }}
          >
            [{exercise.body_part || '-'} / {exercise.category || '-'} / {exercise.brands?.name || '브랜드없음'}] {exercise.name}
          </button>
        ))}
      </div>
    </div>
  ) : null}
</label>

                            <label className="field">
                              <span>선택된 기구명</span>
                              <input
                                value={item.equipment_name_snapshot || ''}
                                readOnly
                                placeholder="운동DB에서 선택한 기구명이 표시됩니다."
                              />
                            </label>

                            <label className="field">
                              <span>실제 수행 운동명</span>
                              <input
                                value={item.performed_name || ''}
                                onChange={(e) => updateWorkoutItemName(itemIndex, e.target.value)}
                                placeholder="예: 힙쓰러스트, 밴드 워크, 스쿼트"
                              />
                            </label>

                            <div className="stack-gap">
                              {(item.sets || []).map((setRow, setIndex) => (
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
                          </>
                        )}
                      </>
                    ) : item.entry_type === 'cardio' ? (
                      <>
                        <label className="field">
  <span>사용 기구 / 종목 선택</span>

  <button
    type="button"
    className="exercise-search-trigger"
    onClick={() =>
      isExerciseDropdownOpen('cardio', itemIndex)
        ? closeExerciseDropdown()
        : openExerciseDropdown('cardio', itemIndex)
    }
  >
    <span>
      {item.exercise_id
        ? item.exercise_name_snapshot || item.equipment_name_snapshot || '선택됨'
        : '선택 안함'}
    </span>
    <strong>⌄</strong>
  </button>

  {isExerciseDropdownOpen('cardio', itemIndex) ? (
    <div className="exercise-search-dropdown">
      <input
        type="text"
        placeholder="유산소 종목 검색"
        value={exerciseSearchDropdown.keyword}
        onChange={(e) =>
          setExerciseSearchDropdown((prev) => ({
            ...prev,
            keyword: e.target.value,
          }))
        }
      />

      <div className="exercise-search-dropdown-list">
        <button
          type="button"
          className={`exercise-search-dropdown-item ${item.exercise_id === '' ? 'active' : ''}`}
          onClick={() => {
            updateWorkoutItemSelect(itemIndex, '')
            closeExerciseDropdown()
          }}
        >
          선택 안함
        </button>

        {filteredExerciseOptions.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            className={`exercise-search-dropdown-item ${item.exercise_id === exercise.id ? 'active' : ''}`}
            onClick={() => {
              updateWorkoutItemSelect(itemIndex, exercise.id)
              closeExerciseDropdown()
            }}
          >
            [{exercise.body_part || '-'} / {exercise.category || '-'} / {exercise.brands?.name || '브랜드없음'}] {exercise.name}
          </button>
        ))}
      </div>
    </div>
  ) : null}
</label>
                        <label className="field">
                          <span>선택된 기구명 / 종목명</span>
                          <input
                            value={item.equipment_name_snapshot || ''}
                            readOnly
                            placeholder="운동DB에서 선택한 항목이 표시됩니다."
                          />
                        </label>

                        <label className="field">
                          <span>실제 수행 운동명</span>
                          <input
                            value={item.performed_name || ''}
                            onChange={(e) => updateWorkoutItemName(itemIndex, e.target.value)}
                            placeholder="예: 트레드밀 걷기, 수영, 싸이클"
                          />
                        </label>

                        <label className="field">
                          <span>유산소 시간(분)</span>
                          <input
                            type="number"
                            value={item.cardio_minutes || ''}
                            onChange={(e) => updateWorkoutItemField(itemIndex, 'cardio_minutes', e.target.value)}
                            placeholder="예: 20"
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="field">
  <span>케어 항목 선택</span>

  <button
    type="button"
    className="exercise-search-trigger"
    onClick={() =>
      isExerciseDropdownOpen('care', itemIndex)
        ? closeExerciseDropdown()
        : openExerciseDropdown('care', itemIndex)
    }
  >
    <span>
      {item.exercise_id
        ? item.exercise_name_snapshot || item.equipment_name_snapshot || '선택됨'
        : '선택 안함'}
    </span>
    <strong>⌄</strong>
  </button>

  {isExerciseDropdownOpen('care', itemIndex) ? (
    <div className="exercise-search-dropdown">
      <input
        type="text"
        placeholder="케어 항목 검색"
        value={exerciseSearchDropdown.keyword}
        onChange={(e) =>
          setExerciseSearchDropdown((prev) => ({
            ...prev,
            keyword: e.target.value,
          }))
        }
      />

      <div className="exercise-search-dropdown-list">
        <button
          type="button"
          className={`exercise-search-dropdown-item ${item.exercise_id === '' ? 'active' : ''}`}
          onClick={() => {
            updateWorkoutItemSelect(itemIndex, '')
            closeExerciseDropdown()
          }}
        >
          선택 안함
        </button>

        {filteredExerciseOptions.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            className={`exercise-search-dropdown-item ${item.exercise_id === exercise.id ? 'active' : ''}`}
            onClick={() => {
              updateWorkoutItemSelect(itemIndex, exercise.id)
              closeExerciseDropdown()
            }}
          >
            [{exercise.body_part || '-'} / {exercise.category || '-'} / {exercise.brands?.name || '브랜드없음'}] {exercise.name}
          </button>
        ))}
      </div>
    </div>
  ) : null}
</label>

                        <label className="field">
                          <span>선택된 케어 항목명</span>
                          <input
                            value={item.equipment_name_snapshot || ''}
                            readOnly
                            placeholder="운동DB에서 선택한 케어 항목이 표시됩니다."
                          />
                        </label>

                        <label className="field">
                          <span>실제 진행 내용</span>
                          <input
                            value={item.performed_name || ''}
                            onChange={(e) => updateWorkoutItemName(itemIndex, e.target.value)}
                            placeholder="예: 우측 어깨 스포츠마사지, 고관절 컨디셔닝"
                          />
                        </label>

                        <label className="field">
                          <span>케어 시간(분)</span>
                          <input
                            type="number"
                            value={item.care_minutes || ''}
                            onChange={(e) => updateWorkoutItemField(itemIndex, 'care_minutes', e.target.value)}
                            placeholder="예: 15"
                          />
                        </label>

                        <label className="field">
                          <span>케어 메모</span>
                          <input
                            value={item.method_note || ''}
                            onChange={(e) => updateWorkoutItemField(itemIndex, 'method_note', e.target.value)}
                            placeholder="예: 어깨 주변 긴장 완화 위주로 진행했습니다."
                          />
                        </label>
                      </>
                    )}
                  </div>
                )}
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

          <div className="record-pain-card">
            <div className="record-card-head">
              <div>
                <div className="record-card-label">PAIN LOG</div>
                <h3>통증 기록</h3>
                <p className="sub-text">
                  재활 회원이거나 평소 통증이 있는 경우, 또는 운동 중 새 통증이 생긴 경우만 기록합니다.
                </p>
              </div>
            </div>

            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={!!workoutForm.pain_enabled}
                onChange={(e) =>
                  setWorkoutForm((prev) => ({
                    ...prev,
                    pain_enabled: e.target.checked,
                    pain_logs:
                      e.target.checked
                        ? (prev.pain_logs?.length ? prev.pain_logs : [{ ...emptyPainLog }])
                        : [],
                  }))
                }
              />
              <span>오늘 통증 상태를 기록합니다</span>
            </label>

            {workoutForm.pain_enabled && (
              <div className="stack-gap" style={{ marginTop: '14px' }}>
                {(workoutForm.pain_logs || []).map((pain, index) => (
                  <div key={index} className="detail-box">
                    <div className="list-card-top">
                      <strong>통증 기록 {index + 1}</strong>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => removePainLog(index)}
                      >
                        삭제
                      </button>
                    </div>

                    <div className="form-row" style={{ marginTop: '12px' }}>
                      <label className="field">
                        <span>구분</span>
                        <select
                          value={pain.pain_type || 'existing'}
                          onChange={(e) => updatePainLog(index, 'pain_type', e.target.value)}
                        >
                          <option value="rehab">재활 회원 관리 중</option>
                          <option value="existing">평소 통증이 있어 기록</option>
                          <option value="new">운동 중 새 불편감 발생</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>부위</span>
                        <select
                          value={pain.body_part || ''}
                          onChange={(e) => updatePainLog(index, 'body_part', e.target.value)}
                        >
                          <option value="">선택</option>
                          <option value="목">목</option>
                          <option value="어깨">어깨</option>
                          <option value="팔꿈치">팔꿈치</option>
                          <option value="손목">손목</option>
                          <option value="등">등</option>
                          <option value="허리">허리</option>
                          <option value="고관절">고관절</option>
                          <option value="무릎">무릎</option>
                          <option value="발목">발목</option>
                          <option value="기타">기타</option>
                        </select>
                      </label>
                    </div>

                    <div className="form-row">
                      <label className="field">
                        <span>어떤 움직임에서</span>
                        <input
                          placeholder="예: 스쿼트 하강 / 팔 옆으로 들기 / 걷기"
                          value={pain.movement_name || ''}
                          onChange={(e) => updatePainLog(index, 'movement_name', e.target.value)}
                        />
                      </label>

                      <label className="field">
                        <span>언제 아픈지</span>
                        <select
                          value={pain.pain_timing || ''}
                          onChange={(e) => updatePainLog(index, 'pain_timing', e.target.value)}
                        >
                          <option value="">선택</option>
                          <option value="평상시">평상시</option>
                          <option value="운동 전">운동 전</option>
                          <option value="운동 중">운동 중</option>
                          <option value="운동 후">운동 후</option>
                        </select>
                      </label>
                    </div>

                    <label className="field">
                      <span>통증 점수 (VAS 0~10)</span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={pain.pain_score ?? 0}
                        onChange={(e) => updatePainLog(index, 'pain_score', Number(e.target.value))}
                      />
                      <div className="compact-text">
                        현재 점수: {pain.pain_score ?? 0}점 / {getPainScoreLabel(pain.pain_score)}
                      </div>
                      <div className="compact-text">
                        0~2 문제 없음 / 3~4 주의 / 5~6 조절 필요 / 7 이상 중단 고려
                      </div>
                    </label>

                    <label className="field">
                      <span>메모</span>
                      <textarea
                        rows="3"
                        placeholder="예: 끝범위에서 찝힘 / 당김 / 저림 / 뻐근함"
                        value={pain.pain_note || ''}
                        onChange={(e) => updatePainLog(index, 'pain_note', e.target.value)}
                      />
                    </label>
                  </div>
                ))}

                <button type="button" className="secondary-btn" onClick={addPainLog}>
                  통증 기록 추가
                </button>
              </div>
            )}
          </div>

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

      <section className="card record-list-card-modern">
        <div className="record-card-head">
          <div>
            <div className="record-card-label">LOG LIST</div>
            <h3>운동 기록 목록</h3>
            <p className="sub-text">
              날짜별로 저장된 운동 기록을 확인하고 수정 / 삭제할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="stack-gap">
          <div className="workout-filter-grid">
           <label className="field">
  <span>회원 검색</span>

  <button
    type="button"
    className="exercise-search-trigger"
    onClick={() =>
      isMemberDropdownOpen('list')
        ? closeMemberDropdown()
        : openMemberDropdown('list')
    }
  >
    <span>
      {members.find((m) => m.id === workoutMemberFilter)?.name || '전체 회원'}
    </span>
    <strong>⌄</strong>
  </button>

  {isMemberDropdownOpen('list') && (
    <div className="exercise-search-dropdown">
      <input
        type="text"
        placeholder="회원 검색"
        value={memberDropdown.keyword}
        onChange={(e) =>
          setMemberDropdown((prev) => ({
            ...prev,
            keyword: e.target.value,
          }))
        }
      />

      <div className="exercise-search-dropdown-list">
        <button
          type="button"
          className="exercise-search-dropdown-item"
          onClick={() => {
            setWorkoutMemberFilter('')
            closeMemberDropdown()
          }}
        >
          전체 회원
        </button>

        {filteredMemberOptions.map((member) => (
          <button
            key={member.id}
            type="button"
            className="exercise-search-dropdown-item"
            onClick={() => {
              setWorkoutMemberFilter(member.id)
              closeMemberDropdown()
            }}
          >
            {member.name}
          </button>
        ))}
      </div>
    </div>
  )}
</label>

            <label className="field">
              <span>기록 타입</span>
              <select value={workoutTypeFilter} onChange={(e) => setWorkoutTypeFilter(e.target.value)}>
                <option value="all">전체 타입</option>
                <option value="pt">PT</option>
                <option value="personal">개인운동</option>
              </select>
            </label>
          </div>

          <div className="workout-filter-grid">
            <label className="field">
              <span>운동기록 검색</span>
              <input
                placeholder="회원명 / 운동명 / 잘한점 / 보완점 검색"
                value={workoutSearch}
                onChange={(e) => setWorkoutSearch(e.target.value)}
              />
            </label>

            <label className="field">
              <span>날짜 찾기</span>
              <input
                type="date"
                value={workoutDateFilter}
                onChange={(e) => setWorkoutDateFilter(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="list-stack">
          {groupedWorkoutCards.length === 0 ? (
            <div className="workout-list-empty">검색 결과가 없습니다.</div>
          ) : null}

          {groupedWorkoutCards.map(([date, workoutsByDate]) => (
            <div key={date} className="workout-group">
              <div className="workout-group-head">
                <h3>{date}</h3>
                <span className="pill">{workoutsByDate.length}개 기록</span>
              </div>

              <div className="list-stack">
                {workoutsByDate.map((workout) => {
                  const collapsed = collapsedWorkouts[workout.id] ?? true
                  return (
                    <div key={workout.id} className="list-card workout-list-card">
                      <div className="list-card-top">
                        <strong>
                          {workout.member?.name || '회원없음'} / {workout.workout_type === 'pt' ? 'PT' : '개인운동'}
                        </strong>
                        <span className="pill workout-date-chip">{workout.workout_date}</span>
                      </div>

                      <div className="compact-text">
                        간략히보기: 운동 {workout.items.length}개 / 총세트 {getTotalSetCount(workout.items)}세트
                      </div>

                      {workout?.pain_enabled && (workout?.pain_logs?.length || 0) > 0 ? (
                        <div className="compact-text">
                          통증기록:{' '}
                          {workout.pain_logs
                            ?.filter((log) => log?.body_part || log?.pain_score !== null)
                            ?.map((log) => `${log?.body_part || '부위미입력'} ${log?.pain_score ?? '-'}점`)
                            ?.join(' / ')}
                        </div>
                      ) : null}

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
                          <div className="workout-detail-items">
                            {workout.items.map((item, itemIndex) => (
                              <div key={item.id || itemIndex} className="record-item-box">
                                <div className="list-card-top">
                                  <strong>
                                    {item.entry_type === 'care'
                                      ? `${item.performed_name || item.equipment_name_snapshot || `케어 ${itemIndex + 1}`}`
                                      : item.training_method === 'superset'
                                      ? `슈퍼세트 ${itemIndex + 1}`
                                      : item.training_method === 'dropset'
                                      ? `${item.performed_name || item.exercise_name_snapshot || `운동 ${itemIndex + 1}`} (드롭세트)`
                                      : item.performed_name || item.exercise_name_snapshot || `운동 ${itemIndex + 1}`}
                                  </strong>

                                  <span className="pill">
                                    {item.entry_type === 'care'
                                      ? '케어'
                                      : item.entry_type === 'cardio'
                                      ? '유산소'
                                      : item.training_method === 'superset'
                                      ? '슈퍼세트'
                                      : item.training_method === 'dropset'
                                      ? '드롭세트'
                                      : '근력운동'}
                                  </span>
                                </div>

                                {item.equipment_name_snapshot ? (
                                  <div className="compact-text">
                                    사용 기구: {item.equipment_name_snapshot}
                                  </div>
                                ) : null}

                                {item.entry_type === 'cardio' ? (
                                  <div className="compact-text">유산소 {item.cardio_minutes || 0}분</div>
                                ) : item.entry_type === 'care' ? (
                                  <div className="compact-text">케어 {item.care_minutes || 0}분</div>
                                ) : item.training_method === 'superset' ? (
                                  <div className="stack-gap" style={{ marginTop: '8px' }}>
                                    {(item.sub_exercises || []).map((sub, subIndex) => (
                                      <div key={subIndex} className="detail-box">
                                        <p>
                                          <strong>{subIndex === 0 ? '운동 A' : '운동 B'}:</strong>{' '}
                                          {sub.performed_name || sub.exercise_name_snapshot || '-'}
                                        </p>

                                        {sub.equipment_name_snapshot ? (
                                          <div className="compact-text">
                                            사용 기구: {sub.equipment_name_snapshot}
                                          </div>
                                        ) : null}

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
                                      <div className="compact-text">메모: {item.method_note}</div>
                                    ) : null}
                                  </div>
                                ) : (
                                  <>
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
                                      <div className="compact-text">메모: {item.method_note}</div>
                                    ) : null}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="workout-detail-summary">
                            <p><strong>잘한점:</strong> {workout.good || '-'}</p>
                            <p><strong>보완점:</strong> {workout.improve || '-'}</p>

                            {workout?.pain_enabled && (workout?.pain_logs?.length || 0) > 0 ? (
                              <div className="detail-box">
                                <p><strong>[통증 기록]</strong></p>

                                {(workout.pain_logs || []).map((log, index) => (
                                  <div key={index} className="compact-text">
                                    {index + 1}. [{log?.pain_type || '-'}] {log?.body_part || '-'} /{' '}
                                    {log?.movement_name || '-'} / {log?.pain_timing || '-'} / VAS{' '}
                                    {log?.pain_score ?? '-'} / {log?.pain_note || '-'}
                                  </div>
                                ))}

                                <div style={{ height: '8px' }} />

                                <p><strong>VAS 기준:</strong></p>
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
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
)}
      {activeTab === '운동DB' && (
  <div className="exercise-db-page">

    <div className="exercise-db-guide-toggle-wrap">
      <button
        type="button"
        className="exercise-db-guide-toggle"
        onClick={() => setExerciseDbGuideOpen((prev) => !prev)}
      >
        <div>
          <div className="exercise-db-guide-badge">GUIDE</div>
          <h3>운동DB 사용방법</h3>
          <p className="sub-text">
            브랜드 등록부터 운동DB 관리까지 핵심 흐름만 빠르게 확인할 수 있습니다.
          </p>
        </div>

        <span className="exercise-db-guide-toggle-mark">
          {exerciseDbGuideOpen ? '−' : '+'}
        </span>
      </button>
    </div>

    {exerciseDbGuideOpen && (
      <div className="exercise-db-guide-card">
        <div className="exercise-db-guide-head">
          <div className="exercise-db-guide-head-badge">처음 사용자 안내</div>
          <h3>운동DB는 이렇게 사용합니다</h3>
          <p>브랜드 → 운동 등록 → 필터 검색 흐름만 보면 됩니다.</p>
        </div>

        <div className="exercise-db-guide-grid">
          <div className="exercise-db-guide-item">
            <div className="exercise-db-guide-no">1</div>
            <div>
              <strong>브랜드 등록</strong>
              <p>센터에서 사용하는 머신 브랜드를 먼저 등록합니다.</p>
              <span>이렇게 하면 → 운동 등록 시 브랜드 선택이 가능합니다.</span>
            </div>
          </div>

          <div className="exercise-db-guide-item">
            <div className="exercise-db-guide-no">2</div>
            <div>
              <strong>운동 등록</strong>
              <p>기구명, 부위, 분류, 설명을 입력합니다.</p>
              <span>이렇게 하면 → 회원 기록 작성에서 선택 가능합니다.</span>
            </div>
          </div>

          <div className="exercise-db-guide-item">
            <div className="exercise-db-guide-no">3</div>
            <div>
              <strong>일괄 입력</strong>
              <p>여러 운동을 한 번에 등록할 수 있습니다.</p>
              <span>이렇게 하면 → 초기 세팅 시간을 줄일 수 있습니다.</span>
            </div>
          </div>

          <div className="exercise-db-guide-item">
            <div className="exercise-db-guide-no">4</div>
            <div>
              <strong>필터 / 검색</strong>
              <p>부위, 분류, 브랜드 기준으로 찾습니다.</p>
              <span>이렇게 하면 → 필요한 운동을 빠르게 찾을 수 있습니다.</span>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="two-col">
    <section className="card brand-card">
      <div className="brand-hero">
        <div>
          <div className="brand-badge">BRAND MANAGE</div>
          <h2>브랜드 관리</h2>
          <p className="sub-text">
            센터에서 사용하는 머신 브랜드를 등록하고 관리하는 영역입니다.
          </p>
        </div>
      </div>

      <form className="stack-gap brand-form" onSubmit={handleBrandSubmit}>
        <label className="field">
          <span>브랜드명</span>
          <input
            value={brandForm.name}
            onChange={(e) => setBrandForm({ name: e.target.value })}
            placeholder="예: 뉴텍, 라이프피트니스"
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

      <div className="brand-list">
        {brands.map((brand) => (
          <div key={brand.id} className="brand-item">
            <div className="brand-item-left">
              <strong>{brand.name}</strong>
            </div>

            <div className="brand-item-actions">
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

    <section className="card exercise-db-card">
      <div className="section-head">
        <div>
          <h2>운동 관리</h2>
          <p className="sub-text">
            기구명, 부위, 머신타입, 브랜드, 설명까지 정리해서 회원과 관리자 모두 쉽게 찾을 수 있게 만드는 영역입니다.
          </p>
        </div>

        <div className="exercise-top-actions">
  <button
    type="button"
    className="danger-btn"
    onClick={handleDeleteAllExercises}
  >
    전체삭제
  </button>

  <button
    type="button"
    className="secondary-btn"
    onClick={() => setShowBulkInput((prev) => !prev)}
  >
    {showBulkInput ? '개별 입력만 보기' : '일괄 입력 열기'}
  </button>
</div>
      </div>

      <form className="stack-gap" onSubmit={handleExerciseSubmit}>
        <label className="field">
          <span>기구명 / 운동DB 이름</span>
          <input
            value={exerciseForm.name}
            onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
            placeholder="예: 시티드 체스트 프레스, 스포츠 마사지(컨디셔닝)"
          />
        </label>

       <div className="exercise-filter-grid">
          <label className="field">
            <span>부위</span>
            <input
              value={exerciseForm.body_part}
              onChange={(e) => setExerciseForm({ ...exerciseForm, body_part: e.target.value })}
              placeholder="예: 가슴, 등, 하체, 어깨, 케어"
            />
          </label>

          <label className="field">
            <span>머신타입 / 분류</span>
            <input
              value={exerciseForm.category}
              onChange={(e) => setExerciseForm({ ...exerciseForm, category: e.target.value })}
              placeholder="예: 플레이트머신, 핀머신, 프리웨이트, 기타웨이트, 케어"
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

        <label className="field">
          <span>설명 / 안내문</span>
          <textarea
            rows="3"
            value={exerciseForm.guide_text || ''}
            onChange={(e) => setExerciseForm({ ...exerciseForm, guide_text: e.target.value })}
            placeholder="예: 가슴 전면을 자극하는 플레이트 머신입니다. 케어 항목이면 어떤 방식인지 같이 적어주세요."
          />
        </label>

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

      {showBulkInput ? (
        <div className="sub-card">
          <h3>운동DB 일괄 입력</h3>
          <p className="sub-text">형식: 브랜드|운동명|부위|카테고리</p>
          <label className="field">
            <span>여러 줄 입력</span>
            <textarea
              rows="8"
              value={bulkExerciseText}
              onChange={(e) => setBulkExerciseText(e.target.value)}
            />
          </label>
          <button type="button" className="primary-btn" onClick={handleBulkExerciseInsert}>
            일괄 등록
          </button>
        </div>
      ) : null}

     <div className="stack-gap exercise-filter-box">
  <div className="exercise-filter-grid">
          <label className="field">
            <span>부위 필터</span>
            <select
              value={exerciseBodyPartFilter}
              onChange={(e) => setExerciseBodyPartFilter(e.target.value)}
            >
              <option value="">전체 부위</option>
              {exerciseBodyPartOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>머신타입 / 분류 필터</span>
            <select
              value={exerciseCategoryFilter}
              onChange={(e) => setExerciseCategoryFilter(e.target.value)}
            >
              <option value="">전체 분류</option>
              {exerciseCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>브랜드 필터</span>
            <select
              value={exerciseBrandFilter}
              onChange={(e) => setExerciseBrandFilter(e.target.value)}
            >
              <option value="">전체 브랜드</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>검색</span>
          <input
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
            placeholder="기구명 / 브랜드 / 부위 / 머신타입 / 설명 검색"
          />
        </label>
      </div>

      <div className="list-stack">
        {filteredExercisesAdvanced.length === 0 ? (
          <div className="workout-list-empty">검색 결과가 없습니다.</div>
        ) : null}

        {filteredExercisesAdvanced.map((exercise) => {
          const collapsed = collapsedExercises[exercise.id] ?? true
          const inferredType = inferExerciseEntryType(exercise)

          return (
           <div key={exercise.id} className="list-card exercise-list-card">
              <div className="list-card-top">
                <strong>{exercise.name}</strong>
                <div className="inline-actions wrap">
                  <span className="pill">{exercise.brands?.name || '브랜드없음'}</span>
                  <span className="pill">
                    {inferredType === 'care'
                      ? '케어'
                      : inferredType === 'cardio'
                      ? '유산소'
                      : '근력운동'}
                  </span>
                </div>
              </div>

              <div className="compact-text">
                간략히보기: {exercise.body_part || '-'} / {exercise.category || '-'}
              </div>

              <div className="inline-actions wrap">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setCollapsedExercises((prev) => ({
                      ...prev,
                      [exercise.id]: !collapsed,
                    }))
                  }
                >
                  {collapsed ? '상세히보기' : '간략히보기'}
                </button>

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
                      guide_text: exercise.guide_text || '',
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

              {!collapsed ? (
                <div className="detail-box">
                  <p><strong>기구명:</strong> {exercise.name}</p>
                  <p><strong>브랜드:</strong> {exercise.brands?.name || '-'}</p>
                  <p><strong>부위:</strong> {exercise.body_part || '-'}</p>
                  <p><strong>머신타입 / 분류:</strong> {exercise.category || '-'}</p>
                  <p><strong>기록 타입 판단:</strong> {getEntryTypeMeta(inferredType).label}</p>
                  <p><strong>설명:</strong> {exercise.guide_text || '-'}</p>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
     </section>
  </div>
  </div>
)}

      {activeTab === '식단' && (
        <div className="card">
          <div className="section-head">
            <h2>식단 기록</h2>
            <select value={dietMemberFilter} onChange={(e) => setDietMemberFilter(e.target.value)}>
              <option value="">전체 회원</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <span>검색</span>
            <input
              value={dietSearch}
              onChange={(e) => setDietSearch(e.target.value)}
              placeholder="내용 / 제품명 / 회원명 / 피드백 검색"
            />
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
{activeTab === '식단설정' && (
  <div className="card meal-planner-admin-page">
    <section className="meal-planner-admin-hero">
      <div className="meal-planner-admin-hero-left">
        <div className="meal-planner-admin-badge">MEAL PLANNER ADMIN</div>
        <h2>식단 설정</h2>
        <p className="meal-planner-admin-hero-text">
          회원 목표에 맞는 식단을 자동 계산하고, 월간 식단 생성부터 기록 확인,
          수행률 체크까지 한 화면에서 관리하는 식단 운영 영역입니다.
        </p>
      </div>

      <div className="meal-planner-admin-hero-right">
        <div className="meal-planner-admin-mini">
          <span>현재 회원</span>
          <strong>
            {members.find((m) => m.id === mealPlanForm.member_id)?.name || '회원 선택'}
          </strong>
          <p>현재 식단 설정 대상 회원입니다.</p>
        </div>

        <div className="meal-planner-admin-mini">
          <span>목표</span>
          <strong>{mealPlanForm.goal_type || '-'}</strong>
          <p>현재 설정된 식단 목표입니다.</p>
        </div>

        <div className="meal-planner-admin-mini">
          <span>식사 횟수</span>
          <strong>{mealPlanForm.meals_per_day || 0}끼</strong>
          <p>하루 기준 식사 슬롯 수입니다.</p>
        </div>

        <div className="meal-planner-admin-mini">
          <span>조회 월</span>
          <strong>{mealPlanViewMonth || '-'}</strong>
          <p>월별 식단 기록 확인 기준 월입니다.</p>
        </div>
      </div>
    </section>

    <div className="stack-gap">
      <div className="meal-planner-admin-toggle-wrap">
        <button
          type="button"
          className="meal-planner-admin-toggle"
          onClick={() => toggleMealPlannerAdminSection('generator')}
        >
          <div>
            <div className="meal-planner-admin-badge soft">GENERATOR</div>
            <h3>식단 생성 / 자동 계산</h3>
            <p className="sub-text">
              회원 목표에 맞춰 자동 계산하고 월간 식단을 생성하는 영역입니다.
            </p>
          </div>

          <span className="meal-planner-admin-toggle-mark">
            {mealPlannerAdminSections.generator ? '−' : '+'}
          </span>
        </button>
      </div>

      {mealPlannerAdminSections.generator && (
        <>
<div className="meal-planner-admin-toggle-wrap" style={{ marginBottom: '14px' }}>
  <button
    type="button"
    className="meal-planner-admin-toggle"
    onClick={() => toggleMealPlannerAdminSection('guide')}
  >
    <div>
      <div className="meal-planner-admin-badge soft">GUIDE</div>
      <h3>식단설정 사용방법</h3>
      <p className="sub-text">
        처음 사용하는 사람도 순서대로 따라 하면 식단 설정부터 월간 식단 생성까지 진행할 수 있습니다.
      </p>
    </div>

    <span className="meal-planner-admin-toggle-mark">
      {mealPlannerAdminSections.guide ? '−' : '+'}
    </span>
  </button>
</div>

{mealPlannerAdminSections.guide && (
  <div className="meal-setting-guide-card simple">
    <div className="meal-setting-guide-head">
      <div className="meal-setting-guide-badge">처음 사용자 안내</div>
      <h3>식단설정은 이렇게 하면 됩니다</h3>
      <p>
        처음에는 아래 4가지만 보면 됩니다. 입력하면 무엇이 바뀌는지 같이 안내합니다.
      </p>
    </div>

    <div className="meal-setting-guide-simple-grid">
      <div className="meal-setting-guide-simple-item">
        <div className="meal-setting-guide-simple-no">1</div>
        <div>
          <strong>회원 선택</strong>
          <p>식단을 설정할 회원을 고릅니다.</p>
          <span>이렇게 하면 → 해당 회원 기준으로 식단 설정, 계산 결과, 월간 식단이 연결됩니다.</span>
        </div>
      </div>

      <div className="meal-setting-guide-simple-item">
        <div className="meal-setting-guide-simple-no">2</div>
        <div>
          <strong>목표 / 식사 횟수 / 활동량 입력</strong>
          <p>기본 목표와 생활 정보를 입력합니다.</p>
          <span>이렇게 하면 → 자동 계산에 필요한 열량과 탄단지 기준이 잡힙니다.</span>
        </div>
      </div>

      <div className="meal-setting-guide-simple-item">
        <div className="meal-setting-guide-simple-no">3</div>
        <div>
          <strong>못 먹는 음식 / 선호 음식 / 생활패턴 입력</strong>
          <p>회원 취향과 현실 식습관을 반영합니다.</p>
          <span>이렇게 하면 → 너무 빡빡하지 않고 실제로 유지 가능한 식단으로 바뀝니다.</span>
        </div>
      </div>

      <div className="meal-setting-guide-simple-item">
        <div className="meal-setting-guide-simple-no">4</div>
        <div>
          <strong>자동 계산 → 저장 → 월간 식단 생성</strong>
          <p>버튼은 이 순서대로 누르면 됩니다.</p>
          <span>이렇게 하면 → 계산 결과가 저장되고, 선택한 월 기준으로 한 달 식단이 생성됩니다.</span>
        </div>
      </div>
    </div>

    <div className="meal-setting-guide-result-box">
      <strong>처음 사용하는 분은 이렇게만 기억하세요</strong>
      <p>
        회원 선택 → 기본 입력 → 음식/생활패턴 입력 → 자동 계산 → 식단 설정 저장 → 월간 식단 생성
      </p>
    </div>
  </div>
)}

<div className="meal-form-section-title">
  <strong>필수 입력</strong>
  <p>자동 계산과 기본 식단 생성을 위해 꼭 필요한 항목입니다.</p>
</div>
        
          <div className="grid-2">
            <label className="field">
  <span>회원 선택</span>

  <button
    type="button"
    className="exercise-search-trigger"
    onClick={() =>
      isMemberDropdownOpen('meal')
        ? closeMemberDropdown()
        : openMemberDropdown('meal')
    }
  >
    <span>
      {members.find((m) => m.id === mealPlanForm.member_id)?.name || '회원 선택'}
    </span>
    <strong>⌄</strong>
  </button>

  {isMemberDropdownOpen('meal') && (
    <div className="exercise-search-dropdown">
      <input
        type="text"
        placeholder="회원 검색"
        value={memberDropdown.keyword}
        onChange={(e) =>
          setMemberDropdown((prev) => ({
            ...prev,
            keyword: e.target.value,
          }))
        }
      />

      <div className="exercise-search-dropdown-list">
        {filteredMemberOptions.map((member) => (
          <button
            key={member.id}
            type="button"
            className="exercise-search-dropdown-item"
            onClick={() => {
              setMealPlanForm((prev) => ({
                ...prev,
                member_id: member.id,
              }))
              closeMemberDropdown()
            }}
          >
            {member.name}
          </button>
        ))}
      </div>
    </div>
  )}
</label>

            <label className="field">
              <span>목표</span>
              <select
                value={mealPlanForm.goal_type}
                onChange={(e) =>
                  setMealPlanForm((prev) => ({
                    ...prev,
                    goal_type: e.target.value,
                  }))
                }
              >
                <option value="diet">체지방 감량</option>
                <option value="recomposition">체형 개선</option>
                <option value="maintenance">유지</option>
                <option value="muscle_gain">근비대</option>
                <option value="bulk">벌크업</option>
              </select>
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>식사 횟수</span>
              <select
                value={mealPlanForm.meals_per_day}
                onChange={(e) =>
                  setMealPlanForm((prev) => ({
                    ...prev,
                    meals_per_day: Number(e.target.value),
                  }))
                }
              >
                <option value={2}>2끼</option>
                <option value={3}>3끼</option>
                <option value={4}>4끼</option>
                <option value={5}>5끼</option>
              </select>
            </label>

            <label className="field">
              <span>식단 생성 월</span>
              <input
                type="month"
                value={mealPlanMonth}
                onChange={(e) => setMealPlanMonth(e.target.value)}
              />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>활동량</span>
              <select
                value={mealPlanForm.activity_level}
                onChange={(e) =>
                  setMealPlanForm((prev) => ({
                    ...prev,
                    activity_level: e.target.value,
                  }))
                }
              >
                <option value="low">낮음</option>
                <option value="light">가벼운 활동</option>
                <option value="moderate">보통</option>
                <option value="high">높음</option>
                <option value="very_high">매우 높음</option>
              </select>
            </label>

            <label className="field">
              <span>주간 운동일 수</span>
              <input
                type="number"
                min="0"
                max="7"
                value={mealPlanForm.training_days_per_week}
                onChange={(e) =>
                  setMealPlanForm((prev) => ({
                    ...prev,
                    training_days_per_week: e.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span>운동 시간대</span>
              <select
                value={mealPlanForm.training_time}
                onChange={(e) =>
                  setMealPlanForm((prev) => ({
                    ...prev,
                    training_time: e.target.value,
                  }))
                }
              >
                <option value="morning">오전</option>
                <option value="afternoon">오후</option>
                <option value="evening">저녁</option>
                <option value="night">밤</option>
              </select>
            </label>

            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={!!mealPlanForm.use_training_rest_split}
                onChange={(e) =>
                  setMealPlanForm((prev) => ({
                    ...prev,
                    use_training_rest_split: e.target.checked,
                  }))
                }
              />
              <span>훈련일 / 휴식일 식단 분리</span>
            </label>
          </div>

<div className="meal-form-section-title">
  <strong>선택 입력</strong>
  <p>회원 취향과 제외 음식까지 반영해서 식단을 더 현실적으로 만듭니다.</p>
</div>
          
          <label className="field">
            <span>못 먹는 음식 (쉼표로 구분)</span>
            <input
              value={mealPlanForm.excluded_foods}
              onChange={(e) =>
                setMealPlanForm((prev) => ({
                  ...prev,
                  excluded_foods: e.target.value,
                }))
              }
              placeholder="예: 우유, 견과류, 갑각류"
            />
            {excludedFoodSuggestions.length > 0 ? (
  <div className="meal-food-suggestion-wrap">
    <div className="meal-food-suggestion-title">추천 음식</div>
    <div className="meal-food-suggestion-list">
      {excludedFoodSuggestions.map((food) => (
        <button
          key={food.id}
          type="button"
          className="meal-food-suggestion-btn"
          onClick={() => applyFoodSuggestionToField('excluded_foods', food.name)}
        >
          <strong>{food.name}</strong>
          <span>
            {Array.isArray(food.aliases) && food.aliases.length > 0
              ? food.aliases.slice(0, 3).join(', ')
              : '대표명'}
          </span>
        </button>
      ))}
    </div>
  </div>
) : null}
          </label>

          <label className="field">
  <span>선호 음식 (쉼표로 구분)</span>
  <input
    value={mealPlanForm.preferred_foods}
    onChange={(e) =>
      setMealPlanForm((prev) => ({
        ...prev,
        preferred_foods: e.target.value,
      }))
    }
    placeholder="예: 닭가슴살, 연어, 고구마"
  />

  {preferredFoodSuggestions.length > 0 ? (
    <div className="meal-food-suggestion-wrap">
      <div className="meal-food-suggestion-title">추천 음식</div>
      <div className="meal-food-suggestion-list">
        {preferredFoodSuggestions.map((food) => (
          <button
            key={food.id}
            type="button"
            className="meal-food-suggestion-btn"
            onClick={() => applyFoodSuggestionToField('preferred_foods', food.name)}
          >
            <strong>{food.name}</strong>
            <span>
              {Array.isArray(food.aliases) && food.aliases.length > 0
                ? food.aliases.slice(0, 3).join(', ')
                : '대표명'}
            </span>
          </button>
        ))}
      </div>
    </div>
  ) : null}
</label>

          <label className="field">
            <span>알레르기 / 절대 제외 음식 (쉼표로 구분)</span>
            <input
              value={mealPlanForm.allergies}
              onChange={(e) =>
                setMealPlanForm((prev) => ({
                  ...prev,
                  allergies: e.target.value,
                }))
              }
              placeholder="예: 우유, 견과류, 갑각류"
            />
            {allergyFoodSuggestions.length > 0 ? (
  <div className="meal-food-suggestion-wrap">
    <div className="meal-food-suggestion-title">추천 음식</div>
    <div className="meal-food-suggestion-list">
      {allergyFoodSuggestions.map((food) => (
        <button
          key={food.id}
          type="button"
          className="meal-food-suggestion-btn"
          onClick={() => applyFoodSuggestionToField('allergies', food.name)}
        >
          <strong>{food.name}</strong>
          <span>
            {Array.isArray(food.aliases) && food.aliases.length > 0
              ? food.aliases.slice(0, 3).join(', ')
              : '대표명'}
          </span>
        </button>
      ))}
    </div>
  </div>
) : null}
          </label>
<div className="sub-card meal-food-db-card">
  <button
    type="button"
    className="meal-food-db-toggle"
    onClick={() => setShowFoodMasterPanel((prev) => !prev)}
  >
    <div>
      <strong>음식 DB 보기</strong>
      <p className="sub-text">
        입력할 음식명을 검색해서 시스템이 인식하는 대표명과 별칭을 빠르게 확인할 수 있습니다.
      </p>
    </div>
    <span className="status-pill">
      {showFoodMasterPanel ? '닫기' : '열기'}
    </span>
  </button>

  <div className="meal-food-db-summary">
    <div className="detail-chip">등록 음식 {Array.isArray(foodMaster) ? foodMaster.length : 0}개</div>
    <div className="detail-chip">검색 결과 {filteredFoodMaster.length}개</div>
    <div className="detail-chip">기본은 접힘</div>
  </div>

  <div className="meal-food-db-actions">
    <button
      type="button"
      className="secondary-btn"
      onClick={() => setShowAllFoodMaster((prev) => !prev)}
    >
      {showAllFoodMaster ? '전체 접기' : '전체 보기'}
    </button>
  </div>

  {showFoodMasterPanel ? (
    <div className="stack-gap">
      <div className="sub-card meal-food-register-card">
        <div className="list-card-top">
          <div>
            <strong>음식 수기 등록</strong>
            <p className="sub-text">
              새 음식을 직접 등록하면 자동 추천과 식단 반영 후보에 바로 포함됩니다.
            </p>
          </div>
          <span className="status-pill">food_master 등록</span>
        </div>

        <div className="grid-2">
          <label className="field">
            <span>음식명</span>
            <input
              value={foodMasterForm.name}
              onChange={(e) => handleFoodMasterFormChange('name', e.target.value)}
              placeholder="예: 닭봉, 소고기 안심"
            />
          </label>

          <label className="field">
            <span>aliases (쉼표 구분)</span>
            <input
              value={foodMasterForm.aliases}
              onChange={(e) => handleFoodMasterFormChange('aliases', e.target.value)}
              placeholder="예: 치킨윙, 닭봉구이"
            />
          </label>
        </div>

        <div className="grid-3">
          <label className="field">
            <span>대분류</span>
            <select
              value={foodMasterForm.category_major}
              onChange={(e) => handleFoodMasterFormChange('category_major', e.target.value)}
            >
              <option value="carb">carb</option>
              <option value="protein">protein</option>
              <option value="fat">fat</option>
              <option value="vegetable">vegetable</option>
              <option value="fruit">fruit</option>
              <option value="dairy">dairy</option>
              <option value="mixed">mixed</option>
            </select>
          </label>

          <label className="field">
            <span>소분류</span>
            <input
              value={foodMasterForm.category_minor}
              onChange={(e) => handleFoodMasterFormChange('category_minor', e.target.value)}
              placeholder="예: animal_protein"
            />
          </label>

          <label className="field">
            <span>원천</span>
            <select
              value={foodMasterForm.source_type}
              onChange={(e) => handleFoodMasterFormChange('source_type', e.target.value)}
            >
              <option value="animal">animal</option>
              <option value="plant">plant</option>
              <option value="mixed">mixed</option>
            </select>
          </label>
        </div>

        <div className="grid-4">
          <label className="field">
            <span>kcal</span>
            <input
              type="number"
              value={foodMasterForm.kcal_per_100g}
              onChange={(e) => handleFoodMasterFormChange('kcal_per_100g', e.target.value)}
              placeholder="100g 기준"
            />
          </label>

          <label className="field">
            <span>탄수화물</span>
            <input
              type="number"
              value={foodMasterForm.carbs_per_100g}
              onChange={(e) => handleFoodMasterFormChange('carbs_per_100g', e.target.value)}
              placeholder="g"
            />
          </label>

          <label className="field">
            <span>단백질</span>
            <input
              type="number"
              value={foodMasterForm.protein_per_100g}
              onChange={(e) => handleFoodMasterFormChange('protein_per_100g', e.target.value)}
              placeholder="g"
            />
          </label>

          <label className="field">
            <span>지방</span>
            <input
              type="number"
              value={foodMasterForm.fat_per_100g}
              onChange={(e) => handleFoodMasterFormChange('fat_per_100g', e.target.value)}
              placeholder="g"
            />
          </label>
        </div>

        <div className="grid-4">
          <label className="field">
            <span>포화지방</span>
            <input
              type="number"
              value={foodMasterForm.saturated_fat_per_100g}
              onChange={(e) => handleFoodMasterFormChange('saturated_fat_per_100g', e.target.value)}
              placeholder="g"
            />
          </label>

          <label className="field">
            <span>불포화지방</span>
            <input
              type="number"
              value={foodMasterForm.unsaturated_fat_per_100g}
              onChange={(e) => handleFoodMasterFormChange('unsaturated_fat_per_100g', e.target.value)}
              placeholder="g"
            />
          </label>

          <label className="field">
            <span>당류</span>
            <input
              type="number"
              value={foodMasterForm.sugar_per_100g}
              onChange={(e) => handleFoodMasterFormChange('sugar_per_100g', e.target.value)}
              placeholder="g"
            />
          </label>

          <label className="field">
            <span>식이섬유</span>
            <input
              type="number"
              value={foodMasterForm.fiber_per_100g}
              onChange={(e) => handleFoodMasterFormChange('fiber_per_100g', e.target.value)}
              placeholder="g"
            />
          </label>
        </div>

        <div className="grid-3">
          <label className="field">
            <span>나트륨</span>
            <input
              type="number"
              value={foodMasterForm.sodium_mg_per_100g}
              onChange={(e) => handleFoodMasterFormChange('sodium_mg_per_100g', e.target.value)}
              placeholder="mg"
            />
          </label>

          <label className="field">
            <span>1회 섭취량</span>
            <input
              type="number"
              value={foodMasterForm.typical_portion_g}
              onChange={(e) => handleFoodMasterFormChange('typical_portion_g', e.target.value)}
              placeholder="g"
            />
          </label>

          <label className="field">
            <span>tags (쉼표 구분)</span>
            <input
              value={foodMasterForm.tags}
              onChange={(e) => handleFoodMasterFormChange('tags', e.target.value)}
              placeholder="예: high_protein, diet"
            />
          </label>
        </div>

        <label className="field">
          <span>메모</span>
          <textarea
            rows={2}
            value={foodMasterForm.note}
            onChange={(e) => handleFoodMasterFormChange('note', e.target.value)}
            placeholder="예: 감량용으로 자주 사용, 간편식 대체용"
          />
        </label>

        <div className="meal-food-register-actions">
  <button
    type="button"
    className="primary-btn"
    onClick={handleFoodMasterSave}
    disabled={savingFoodMaster}
  >
    {savingFoodMaster
      ? '저장 중...'
      : editingFoodMasterId
      ? '수정 저장'
      : '음식 등록'}
  </button>

<button
  type="button"
  className="secondary-btn"
  onClick={handleFoodMasterSeedInsert}
  disabled={savingFoodMaster}
>
  기본 음식 1차 등록
</button>
          
  {editingFoodMasterId ? (
    <button
      type="button"
      className="secondary-btn"
      onClick={handleFoodMasterCancelEdit}
      disabled={savingFoodMaster}
    >
      취소
    </button>
  ) : null}
</div>
      </div>

      <label className="field">
        <span>음식 검색</span>
        <input
          placeholder="예: 닭다리살, 연어, 소고기, 서브웨이"
          value={foodMasterSearch}
          onChange={(e) => setFoodMasterSearch(e.target.value)}
        />
      </label>

      <div className="compact-text">
        ※ 선호 음식 / 제외 음식 / 알레르기 입력칸에는 아래 대표명이나 별칭을 쓰면 더 정확하게 인식됩니다.
      </div>

      {(() => {
        const displayFoods = foodMasterSearch.trim() ? filteredFoodMaster : foodMaster

        if (!foodMasterSearch.trim() && !showAllFoodMaster) {
          return (
            <div className="workout-list-empty">
              검색어를 입력하거나 전체 보기를 누르면 음식 목록이 표시됩니다.
            </div>
          )
        }

        if (!displayFoods || displayFoods.length === 0) {
          return (
            <div className="workout-list-empty">검색 결과가 없습니다.</div>
          )
        }

        return (
          <div className="list-stack">
            {displayFoods.slice(0, showAllFoodMaster ? 100 : 10).map((food) => (
              <div key={food.id} className="detail-box meal-food-db-item">
                
               <div className="list-card-top">
  <strong>{food.name}</strong>

  <div className="inline-actions wrap">
    <span className="status-pill">
      {food.category_major || '-'}
    </span>

    <button
      type="button"
      className="secondary-btn"
      onClick={() => handleFoodMasterEditStart(food)}
    >
      수정
    </button>

    <button
      type="button"
      className="danger-btn"
      onClick={() => handleFoodMasterDeactivate(food)}
    >
      비활성화
    </button>
  </div>
</div>

                <div className="compact-text">
                  {food.category_minor || '-'} / {food.source_type || '-'}
                </div>

                <div className="compact-text">
                  <strong>aliases:</strong>{' '}
                  {Array.isArray(food.aliases) && food.aliases.length > 0
                    ? food.aliases.join(', ')
                    : '-'}
                </div>

                <div className="compact-text">
                  <strong>100g 기준:</strong>{' '}
                  kcal {Number(food.kcal_per_100g || 0)} / 탄 {Number(food.carbs_per_100g || 0)}g / 단 {Number(food.protein_per_100g || 0)}g / 지 {Number(food.fat_per_100g || 0)}g / 나트륨 {Number(food.sodium_mg_per_100g || 0)}mg
                </div>

                {food.note ? (
                  <div className="compact-text">
                    <strong>메모:</strong> {food.note}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  ) : null}
</div>
          <label className="field">
  <span>코치 메모</span>
  <textarea
    rows="4"
    value={mealPlanForm.notes}
    onChange={(e) =>
      setMealPlanForm((prev) => ({
        ...prev,
        notes: e.target.value,
      }))
    }
    placeholder="예: 저녁 늦게 먹는 패턴 / 주말 외식 많음 / 단백질 보충 필요"
  />
</label>

<div className="meal-form-section-title">
  <strong>고급 설정</strong>
  <p>식단 운영 강도, 생활습관, 허용 범위를 세밀하게 조정하는 영역입니다.</p>
</div>
          
<div className="meal-section-card">
  <div className="list-card-top">
    <div>
      <strong>식단 운영 강도 / 생활습관 설정</strong>
      <p className="sub-text">
        회원의 현재 식습관과 현실적인 허용 범위를 함께 설정해서 무리하지 않는 식단을 설계합니다.
      </p>
    </div>
    <span className="status-pill">LIFESTYLE</span>
  </div>

  <div className="grid-3">
    <label className="field">
      <span>식단 강도</span>
      <select
        value={mealPlanForm.diet_mode}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            diet_mode: e.target.value,
          }))
        }
      >
        <option value="light">light · 느슨한 관리</option>
        <option value="balanced">balanced · 균형형</option>
        <option value="strict">strict · 엄격한 관리</option>
        <option value="contest">contest · 대회 준비형</option>
      </select>
    </label>

    <label className="field">
      <span>적응 전략</span>
      <select
        value={mealPlanForm.adaptation_strategy}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            adaptation_strategy: e.target.value,
          }))
        }
      >
        <option value="gradual">gradual · 점진 전환</option>
        <option value="fast_track">fast_track · 빠른 전환</option>
        <option value="maintenance_focus">maintenance_focus · 유지 중심</option>
        <option value="contest_prep">contest_prep · 대회 준비</option>
      </select>
    </label>

    <label className="field">
      <span>식사 구조</span>
      <select
        value={mealPlanForm.meal_structure_mode}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            meal_structure_mode: e.target.value,
          }))
        }
      >
        <option value="structured">structured · 식단식 중심</option>
        <option value="flexible">flexible · 일반식 혼합</option>
        <option value="performance">performance · 운동 중심</option>
      </select>
    </label>
  </div>

  <div className="grid-3">
    <label className="field">
      <span>현재 식습관</span>
      <select
        value={mealPlanForm.current_meal_pattern}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            current_meal_pattern: e.target.value,
          }))
        }
      >
        <option value="general_heavy">general_heavy · 일반식 위주</option>
        <option value="mixed">mixed · 일반식+식단식 반반</option>
        <option value="diet_ready">diet_ready · 이미 식단 적응</option>
      </select>
    </label>

    <label className="field">
      <span>주간 간식 빈도</span>
      <input
        type="number"
        min="0"
        max="14"
        value={mealPlanForm.snack_frequency_per_week}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            snack_frequency_per_week: e.target.value,
          }))
        }
      />
    </label>

    <label className="field">
      <span>주간 빵/밀가루 빈도</span>
      <input
        type="number"
        min="0"
        max="14"
        value={mealPlanForm.bread_frequency_per_week}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            bread_frequency_per_week: e.target.value,
          }))
        }
      />
    </label>
  </div>

  <div className="grid-3">
    <label className="field">
      <span>주간 과자/정크 빈도</span>
      <input
        type="number"
        min="0"
        max="14"
        value={mealPlanForm.junk_food_frequency_per_week}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            junk_food_frequency_per_week: e.target.value,
          }))
        }
      />
    </label>

    <label className="field">
      <span>주간 배달/외식 빈도</span>
      <input
        type="number"
        min="0"
        max="14"
        value={mealPlanForm.delivery_food_frequency_per_week}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            delivery_food_frequency_per_week: e.target.value,
          }))
        }
      />
    </label>

    <label className="field">
      <span>주간 야식 빈도</span>
      <input
        type="number"
        min="0"
        max="14"
        value={mealPlanForm.late_night_meal_frequency_per_week}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            late_night_meal_frequency_per_week: e.target.value,
          }))
        }
      />
    </label>

    <label className="field">
  <span>주간 음주 빈도</span>
  <input
    type="number"
    min="0"
    max="14"
    value={mealPlanForm.alcohol_frequency_per_week}
    onChange={(e) =>
      setMealPlanForm((prev) => ({
        ...prev,
        alcohol_frequency_per_week: e.target.value,
      }))
    }
  />
</label>
  </div>

  <div className="grid-5">
  <label className="field">
    <span>허용 일반식/주</span>
    <input
      type="number"
      min="0"
      max="14"
      value={mealPlanForm.allowed_general_meals_per_week}
      onChange={(e) =>
        setMealPlanForm((prev) => ({
          ...prev,
          allowed_general_meals_per_week: e.target.value,
        }))
      }
    />
  </label>

  <label className="field">
    <span>허용 자유식/주</span>
    <input
      type="number"
      min="0"
      max="14"
      value={mealPlanForm.allowed_free_meals_per_week}
      onChange={(e) =>
        setMealPlanForm((prev) => ({
          ...prev,
          allowed_free_meals_per_week: e.target.value,
        }))
      }
    />
  </label>

  <label className="field">
    <span>허용 간식/주</span>
    <input
      type="number"
      min="0"
      max="14"
      value={mealPlanForm.allowed_snacks_per_week}
      onChange={(e) =>
        setMealPlanForm((prev) => ({
          ...prev,
          allowed_snacks_per_week: e.target.value,
        }))
      }
    />
  </label>

  <label className="field">
    <span>허용 빵/주</span>
    <input
      type="number"
      min="0"
      max="14"
      value={mealPlanForm.allowed_bread_per_week}
      onChange={(e) =>
        setMealPlanForm((prev) => ({
          ...prev,
          allowed_bread_per_week: e.target.value,
        }))
      }
    />
  </label>

  <label className="field">
    <span>허용 디저트/주</span>
    <input
      type="number"
      min="0"
      max="14"
      value={mealPlanForm.allowed_dessert_per_week}
      onChange={(e) =>
        setMealPlanForm((prev) => ({
          ...prev,
          allowed_dessert_per_week: e.target.value,
        }))
      }
    />
  </label>
</div>

<div className="grid-1">
  <label className="field">
    <span>허용 음주/주</span>
    <input
      type="number"
      min="0"
      max="14"
      value={mealPlanForm.allowed_alcohol_per_week}
      onChange={(e) =>
        setMealPlanForm((prev) => ({
          ...prev,
          allowed_alcohol_per_week: e.target.value,
        }))
      }
    />
  </label>
</div>
</div>

<div className="meal-form-section-title">
  <strong>현실 식사 패턴 설정</strong>
  <p>회원이 실제 먹던 밥량과 가장 많이 먹는 끼니를 기준으로 식단 시작점을 맞춥니다.</p>
</div>

<div className="grid-3">
  <label className="field">
    <span>평소 한 끼 밥량</span>
    <select
      value={mealPlanForm.rice_amount_source === 'custom' ? 'custom' : String(mealPlanForm.usual_rice_amount_g || 300)}
      onChange={(e) => {
        const value = e.target.value
        if (value === 'custom') {
          setMealPlanForm((prev) => ({
            ...prev,
            rice_amount_source: 'custom',
          }))
          return
        }

        setMealPlanForm((prev) => ({
          ...prev,
          rice_amount_source: 'preset',
          usual_rice_amount_g: Number(value),
        }))
      }}
    >
      <option value="150">150g</option>
      <option value="210">210g</option>
      <option value="300">300g</option>
      <option value="450">450g</option>
      <option value="600">600g</option>
      <option value="custom">직접입력</option>
    </select>
  </label>

 <label className="field">
  <span>가장 많이 먹는 끼니</span>
  <select
    value={mealPlanForm.largest_meal_slot}
    onChange={(e) =>
      setMealPlanForm((prev) => ({
        ...prev,
        largest_meal_slot: e.target.value,
      }))
    }
  >
    <option value="아침">아침</option>
    <option value="점심">점심</option>
    <option value="저녁">저녁</option>
    <option value="야식">야식</option>
  </select>
</label>
          <div className="grid-1">
  <label className="field">
    <span>끼니별 밥량 직접 설정(g)</span>

    <div className="list-stack" style={{ marginTop: '8px' }}>
      {getLifestyleMealSlots(mealPlanForm).map((slot) => {
        const currentValue =
          mealPlanForm.meal_rice_map?.[slot] ??
          (mealPlanForm.rice_amount_source === 'custom'
            ? Number(mealPlanForm.usual_rice_amount_custom_g || 0)
            : Number(mealPlanForm.usual_rice_amount_g || 300))

        return (
          <div
            key={slot}
            className="inline-actions wrap"
            style={{ justifyContent: 'space-between', gap: '8px' }}
          >
            <strong style={{ minWidth: '52px' }}>{slot}</strong>

            <input
              type="number"
              min="0"
              step="10"
              value={currentValue}
              onChange={(e) =>
                setMealPlanForm((prev) => ({
                  ...prev,
                  meal_rice_map: {
                    ...(prev.meal_rice_map || {}),
                    [slot]: Number(e.target.value || 0),
                  },
                }))
              }
              style={{ maxWidth: '140px' }}
            />

            <span className="compact-text">g</span>
          </div>
        )
      })}
    </div>

      <div className="compact-text" style={{ marginTop: '8px' }}>
      현재 설정:
      {' '}
      {getLifestyleMealSlots(mealPlanForm)
        .map((slot) => `${slot} ${mealPlanForm.meal_rice_map?.[slot] ?? 0}g`)
        .join(' / ')}
    </div>
  </label>
</div>
</div>

{mealPlanForm.rice_amount_source === 'custom' && (
  <div className="grid-1">
    <label className="field">
      <span>직접입력 밥량(g)</span>
      <input
        type="number"
        min="0"
        value={mealPlanForm.usual_rice_amount_custom_g}
        onChange={(e) =>
          setMealPlanForm((prev) => ({
            ...prev,
            usual_rice_amount_custom_g: e.target.value,
          }))
        }
      />
    </label>
  </div>
)}

<div className="sub-card">
  <div className="compact-text">
    {getRiceGuide(
      mealPlanForm.rice_amount_source === 'custom'
        ? mealPlanForm.usual_rice_amount_custom_g
        : mealPlanForm.usual_rice_amount_g
    ).summary}
  </div>
</div>
          
<div className="meal-form-section-title">
  <strong>실행 단계</strong>
  <p>처음이면 자동 계산 → 식단 설정 저장 → 월간 식단 생성 순서로 진행하면 됩니다.</p>
</div>
          
<div className="meal-action-bar">
  <button className="primary-btn" type="button" onClick={handleMealPlanGenerate}>
    자동 계산
  </button>

  <button className="secondary-btn" type="button" onClick={handleMealPlanSave}>
    식단 설정 저장
  </button>

  <button className="primary-btn" type="button" onClick={handleMealPlanMonthGenerate}>
  월간 식단 생성
</button>
</div>
          
                    {(mealPlanForm.target_kcal ||
  mealPlanForm.target_carbs_g ||
  mealPlanForm.target_protein_g ||
  mealPlanForm.target_fat_g) ? (
  <>
   <div className="detail-box">
  <p><strong>자동 계산 결과</strong></p>

  <p>하루 목표 열량: {mealPlanForm.target_kcal || 0} kcal</p>
  <p>탄수화물: {mealPlanForm.target_carbs_g || 0} g</p>
  <p>단백질: {mealPlanForm.target_protein_g || 0} g</p>
  <p>지방: {mealPlanForm.target_fat_g || 0} g</p>
  <p>식사 슬롯: {(mealPlanForm.meal_slots || []).join(' / ')}</p>

  {mealPlanRecommendation ? (
    <>
      <hr style={{ margin: '12px 0' }} />

      <p><strong>자동 계산 검증 정보</strong></p>
      <p>성별: {mealPlanRecommendation.sex || '-'}</p>
      <p>나이: {mealPlanRecommendation.age || 0}세</p>
      <p>키: {mealPlanRecommendation.height_cm || 0} cm</p>
      <p>체중: {mealPlanRecommendation.weight_kg || 0} kg</p>
      <p>체지방률: {mealPlanRecommendation.body_fat_percent || 0}%</p>
      <p>BMR: {mealPlanRecommendation.bmr || 0} kcal</p>
      <p>TDEE: {mealPlanRecommendation.tdee || 0} kcal</p>
    </>
  ) : null}
</div>
            {mealPlanRecommendation ? (
            <div className="detail-box" style={{ marginTop: '12px' }}>
              <p><strong>추천 식단 운영 방식</strong></p>
              <p>{mealPlanRecommendation.recommended_label}</p>
              <p className="compact-text">{mealPlanRecommendation.summary}</p>

              <div className="compact-text" style={{ marginTop: '8px', marginBottom: '10px' }}>
                {Array.isArray(mealPlanRecommendation.reasons) &&
                mealPlanRecommendation.reasons.length > 0
                  ? mealPlanRecommendation.reasons.map((reason, index) => (
                      <div key={`plan-reason-${index}`}>- {reason}</div>
                    ))
                  : null}
              </div>

<div className="detail-box" style={{ marginBottom: '10px' }}>
  <p><strong>운영 방식 상태 구분</strong></p>
  <p>
    AI 추천값:{' '}
    <strong>
      {PLAN_STYLE_META[mealPlanRecommendation.recommended_key]?.label ||
        mealPlanRecommendation.recommended_label ||
        '-'}
    </strong>
  </p>
  <p>
    현재 선택값:{' '}
    <strong>
      {PLAN_STYLE_META[selectedPlanStyle]?.label || selectedPlanStyle || '선택 안됨'}
    </strong>
  </p>
  <p>
    현재 적용값:{' '}
    <strong>
      {PLAN_STYLE_META[mealPlanForm.recommended_plan_style]?.label ||
        mealPlanForm.recommended_plan_style ||
        '적용 안됨'}
    </strong>
  </p>
</div>
              
              <label className="field" style={{ marginBottom: '10px' }}>
                <span>추천 식단 방식</span>
                <select
                  value={selectedPlanStyle || ''}
                  onChange={(e) => setSelectedPlanStyle(e.target.value)}
                >
                  <option value="">선택</option>
                  {Array.isArray(mealPlanRecommendation.alternatives)
                    ? mealPlanRecommendation.alternatives.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))
                    : null}
                </select>
              </label>

              <div className="inline-actions wrap">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
  const nextPlanStyle =
    selectedPlanStyle || mealPlanRecommendation?.recommended_key || ''

  setMealPlanForm((prev) => ({
    ...prev,
    recommended_plan_style: nextPlanStyle,
  }))

  alert('추천 식단 방식이 적용되었습니다.')
}}
                >
                  추천 방식 적용
                </button>

                <div className="compact-text">
                  추천 방식을 적용한 뒤 월간 식단 생성을 진행하면 됩니다.
                </div>
                {mealPlanForm.recommended_plan_style ? (
  <div className="compact-text" style={{ marginTop: '8px' }}>
    현재 적용 방식:{' '}
    <strong>
      {PLAN_STYLE_META[mealPlanForm.recommended_plan_style]?.label ||
        mealPlanForm.recommended_plan_style}
    </strong>
  </div>
) : null}
              </div>
            </div>
        
         ) : null}
        </>
      ) : null}
    </>
  )}

      <div className="list-stack">
        <div className="meal-planner-admin-toggle-wrap">
          <button
            type="button"
            className="meal-planner-admin-toggle"
            onClick={() => toggleMealPlannerAdminSection('monthlyRecords')}
          >
            <div>
              <div className="meal-planner-admin-badge soft">MONTHLY RECORDS</div>
              <h3>월별 식단 기록 보기</h3>
              <p className="sub-text">
                선택한 회원의 월별 식단 기록을 조회하고 수정/삭제할 수 있습니다.
              </p>
            </div>

            <span className="meal-planner-admin-toggle-mark">
              {mealPlannerAdminSections.monthlyRecords ? '−' : '+'}
            </span>
          </button>
        </div>

        {mealPlannerAdminSections.monthlyRecords && (
  <div className="meal-section-card">
            <div className="inline-actions wrap" style={{ marginBottom: '16px' }}>
              <input
                type="month"
                value={mealPlanViewMonth}
                onChange={(e) => setMealPlanViewMonth(e.target.value)}
              />

              <button
                type="button"
                className="secondary-btn"
                onClick={() => loadMealPlansByMonth(mealPlanForm.member_id, mealPlanViewMonth)}
              >
                조회
              </button>

              <button
                type="button"
                className="danger-btn"
                onClick={handleMealPlanDeleteMonth}
              >
                월 전체 삭제
              </button>
            </div>

            {memberMealPlans.length === 0 ? (
              <div className="workout-list-empty">해당 월 식단 기록이 없습니다.</div>
            ) : (
              memberMealPlans.map((plan) => {
  const meals = Array.isArray(plan.meals_json) ? plan.meals_json : []
  const hasGeneralMeal = meals.some((meal) => String(meal.menu || '').includes('일반식'))
  const hasFreeMeal = meals.some((meal) => String(meal.menu || '').includes('자유식'))

  const specialMealLabel = hasFreeMeal
    ? '자유식 포함'
    : hasGeneralMeal
    ? '일반식 포함'
    : ''

  return (
                <div key={plan.id} className="list-card">
                  <div className="list-card-top">
                    <strong>{plan.plan_date}</strong>
                   <div className="inline-actions wrap">
 <span className="pill">{getMealDayTypeLabel(plan.day_type)}</span>
  {specialMealLabel ? <span className="pill soft">{specialMealLabel}</span> : null}

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleMealPlanEditStart(plan)}
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handleMealPlanDelete(plan.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="compact-text" style={{ marginBottom: '8px' }}>
                    총 {plan.total_kcal || 0} kcal / 탄 {plan.total_carbs_g || 0} / 단 {plan.total_protein_g || 0} / 지 {plan.total_fat_g || 0}
                  </div>

                                    <div className="compact-text" style={{ marginBottom: '10px' }}>
                    식사 수: {Array.isArray(plan.meals_json) ? plan.meals_json.length : 0}끼
                  </div>

                  {editingMealPlanId === plan.id ? (
                    <div className="detail-box">
                      {mealPlanEditMeals.map((meal, index) => {
                        const mealDetailTypeLabelMap = {
                          balanced: '균형형',
                          diet: '다이어트형',
                          eating_out: '외식형',
                          simple: '간편형',
                          social: '회식형',
                          free: '자유식형',
                        }

                        const detailLabel =
                          mealDetailTypeLabelMap[String(meal.meal_detail_type || '').trim()] || ''

                        return (
                          <div key={index} className="detail-box" style={{ marginBottom: '12px' }}>
                            <div className="list-card-top" style={{ marginBottom: '8px' }}>
                              <strong>{meal.slot || `식사 ${index + 1}`}</strong>
                              <div className="inline-actions wrap">
                                {meal.menu ? <span className="pill">{meal.menu}</span> : null}
                                {detailLabel ? <span className="pill soft">{detailLabel}</span> : null}
                              </div>
                            </div>

                            <label className="field" style={{ marginBottom: '8px' }}>
                              <span>표시 문구</span>
                              <textarea
                                rows="2"
                                value={meal.menu || ''}
                                onChange={(e) => updateMealPlanEditMeal(index, e.target.value)}
                              />
                            </label>

                            {meal.guide_text ? (
                              <div
                                className="compact-text"
                                style={{
                                  whiteSpace: 'pre-line',
                                  lineHeight: 1.6,
                                  padding: '10px',
                                  borderRadius: '12px',
                                  background: 'rgba(255,255,255,0.04)',
                                }}
                              >
                                {meal.guide_text}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}

                      <div className="inline-actions wrap" style={{ marginTop: '10px' }}>
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => handleMealPlanUpdate(plan)}
                        >
                          수정 저장
                        </button>

                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={handleMealPlanEditCancel}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : Array.isArray(plan.meals_json) && plan.meals_json.length > 0 ? (
                    <div className="detail-box">
                      {plan.meals_json.map((meal, index) => {
                        const isSpecialMeal = !!meal.guide_text
                        const mealDetailTypeLabelMap = {
                          balanced: '균형형',
                          diet: '다이어트형',
                          eating_out: '외식형',
                          simple: '간편형',
                          social: '회식형',
                          free: '자유식형',
                        }

                        const detailLabel =
                          mealDetailTypeLabelMap[String(meal.meal_detail_type || '').trim()] || ''

                        return (
                          <div
                            key={index}
                            className="detail-box"
                            style={{ marginBottom: '10px', padding: '12px' }}
                          >
                            <div
  className="list-card-top"
  style={{ marginBottom: meal.guide_text ? '10px' : '6px' }}
>
  <strong>{meal.slot || `식사 ${index + 1}`}</strong>

  <div className="inline-actions wrap">
    {meal.menu ? <span className="pill">{meal.menu}</span> : null}
    {detailLabel ? <span className="pill soft">{detailLabel}</span> : null}
  </div>
</div>

<div className="meal-day-card">
  <div className="meal-day-card-top">
    <div>
     <strong>{meal.slot || `식사 ${index + 1}`}</strong>
      <div className="compact-text" style={{ marginTop: '4px' }}>
        {detailLabel || (isSpecialMeal ? '특수 식사' : '기본 식사')}
      </div>
    </div>

    <div className="meal-day-card-pills">
      {meal.menu ? <span className="pill">{meal.menu}</span> : null}
      {isSpecialMeal ? <span className="pill soft">가이드형</span> : null}
    </div>
  </div>

 <div className="detail-box" style={{ marginTop: '10px' }}>
  <p>
    <strong>메뉴</strong> {meal.menu || '-'}
  </p>

  <>
    <p className="compact-text" style={{ marginTop: '8px', lineHeight: 1.7 }}>
      <strong>구성 재료</strong>
    </p>

    <div className="compact-text" style={{ marginTop: '4px', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
      {Array.isArray(meal.food_items) && meal.food_items.length > 0
        ? formatMealItemsWithRole(meal.food_items).join('\n')
        : '-'}
    </div>

    <p className="compact-text" style={{ marginTop: '10px', lineHeight: 1.7 }}>
      <strong>한 끼 총 영양</strong>
    </p>
    <div className="compact-text" style={{ marginTop: '4px', lineHeight: 1.7 }}>
      {formatMealMacroSummary(meal)}
    </div>

    <p className="compact-text" style={{ marginTop: '10px', lineHeight: 1.7 }}>
      <strong>내 몸 기준 한 끼 목표</strong>
    </p>
    <div className="compact-text" style={{ marginTop: '4px', lineHeight: 1.7 }}>
      {formatMealTargetSummary(meal) || '한 끼 목표 정보 없음'}
    </div>

    <p className="compact-text" style={{ marginTop: '10px', lineHeight: 1.7 }}>
      <strong>한 끼 목표 대비</strong>
    </p>
    <div className="compact-text" style={{ marginTop: '4px', lineHeight: 1.7 }}>
      {formatMealTargetDiffSummary(meal)}
    </div>
    <p className="compact-text" style={{ marginTop: '10px', lineHeight: 1.7 }}>
  <strong>식사 해석</strong>
</p>
<div
  className="compact-text"
  style={{ marginTop: '4px', lineHeight: 1.7, whiteSpace: 'pre-line' }}
>
  {formatMealFeedbackSummary(meal)}
</div>
  </>

  <p
    className="compact-text"
    style={{ marginTop: '10px', whiteSpace: 'pre-line', lineHeight: 1.6 }}
  >
    <strong>가이드</strong>{' '}
    {meal.guide_text ||
      (isSpecialMeal
        ? '가이드 없음'
        : '식사 목적에 맞게 메뉴와 양을 조절해서 진행하세요.')}
  </p>
</div>
</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="compact-text">식단 내용이 없습니다.</div>
                  )}
                </div>
              )
             })
     )}
     </div>
          )}
      </div>
   

      <div className="list-stack" style={{ marginTop: '20px' }}>
        <div className="meal-planner-admin-toggle-wrap">
          <button
            type="button"
            className="meal-planner-admin-toggle"
            onClick={() => toggleMealPlannerAdminSection('compliance')}
          >
            <div>
              <div className="meal-planner-admin-badge soft">COMPLIANCE</div>
              <h3>회원 식단 수행률 보기</h3>
              <p className="sub-text">
                회원이 실제로 식단을 얼마나 지켰는지 월별로 확인하는 영역입니다.
              </p>
            </div>

            <span className="meal-planner-admin-toggle-mark">
              {mealPlannerAdminSections.compliance ? '−' : '+'}
            </span>
          </button>
        </div>

        {mealPlannerAdminSections.compliance && (
          <>
            <div className="inline-actions wrap" style={{ marginBottom: '16px' }}>
              <input
                type="month"
                value={mealComplianceMonth}
                onChange={(e) => setMealComplianceMonth(e.target.value)}
              />

              <button
                type="button"
                className="secondary-btn"
                onClick={() => loadMealComplianceByMonth(mealPlanForm.member_id, mealComplianceMonth)}
              >
                조회
              </button>
            </div>

            {memberMealCompliancePlans.length === 0 ? (
              <div className="workout-list-empty">해당 월 수행 기록이 없습니다.</div>
            ) : (
              <>
                <div className="detail-box">
                  <p>
                    <strong>월 평균 수행률:</strong>{' '}
                    {Math.round(
                      memberMealCompliancePlans.reduce(
                        (sum, plan) => sum + getAdminMealPlanProgress(plan).percent,
                        0
                      ) / Math.max(memberMealCompliancePlans.length, 1)
                    )}%
                  </p>
                </div>

                <div className="list-stack">
                  {memberMealCompliancePlans.map((plan) => {
                    const progress = getAdminMealPlanProgress(plan)

                    return (
                      <div key={plan.id} className="list-card">
                        <div className="list-card-top">
                          <strong>{plan.plan_date}</strong>
                          <span className="pill">{progress.percent}%</span>
                        </div>

                        <div className="compact-text">
                          완료 {progress.doneCount} / 못 먹음 {progress.skippedCount} / 미체크 {progress.pendingCount} / 총 {progress.total}끼
                        </div>

                        <div className="compact-text">
                         유형: {getMealDayTypeLabel(plan.day_type)} / 총 {plan.total_kcal || 0} kcal
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  </div>
)}
      {activeTab === '통계' && (
  <div className="stats-page-modern">
    <section className="stats-hero">
      <div className="stats-hero-left">
        <div className="stats-hero-badge">MONTHLY STATS OVERVIEW</div>
        <h2>월별 통계</h2>
        <p className="stats-hero-text">
          {selectedStatsMonth} 기준 PT 수업, 개인운동, 전체 잔여 세션과 회원별 활동 흐름을
          한 화면에서 빠르게 확인하는 통계 화면입니다.
        </p>

        <div className="stats-filter-row">
          <input
            type="month"
            value={selectedStatsMonth}
            onChange={(e) => setSelectedStatsMonth(e.target.value)}
          />
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setSelectedStatsMonth(new Date().toISOString().slice(0, 7))}
          >
            이번달
          </button>
        </div>
      </div>

      <div className="stats-hero-right">
        <div className="stats-hero-mini stats-pt">
          <span>{selectedStatsMonth} PT 수</span>
          <strong>{monthlyStats.ptCount}</strong>
          <p>기록 기준 월간 PT 수업 수</p>
        </div>

        <div className="stats-hero-mini stats-personal">
          <span>{selectedStatsMonth} 개인운동 수</span>
          <strong>{monthlyStats.personalCount}</strong>
          <p>회원 기록 기준 월간 개인운동 수</p>
        </div>

        <div className="stats-hero-mini stats-remaining">
          <span>전체 남은 세션</span>
          <strong>{monthlyStats.remainingSessions}</strong>
          <p>전체 회원 잔여 세션 합계</p>
        </div>

        <div className="stats-hero-mini stats-members">
          <span>통계 대상 회원</span>
          <strong>{memberStats.length}명</strong>
          <p>현재 집계에 포함된 회원 수</p>
        </div>
      </div>
    </section>
    <details className="tab-usage-guide-card stats-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE</div>
          <strong>통계를 왜 보고, 어떻게 활용해야 하는지</strong>
          <p>숫자 확인에서 끝나는 화면이 아니라 재등록, 연락, 관리 우선순위를 잡는 기준입니다.</p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>남은 세션 확인 → 재등록 타이밍 잡기</strong>
              <p>
                남은 세션이 5회 이하인 회원은 미리 체크해서
                재등록 상담, 다음 목표 제안, 일정 안내를 먼저 잡는 기준으로 씁니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>PT / 개인운동 비교 → 관리 집중도 판단</strong>
              <p>
                PT만 하고 개인운동이 거의 없으면 숙제 수행이 약한 회원일 수 있어서
                밴드 피드백, 루틴 점검, 출석 유도 메시지 대상으로 바로 잡아낼 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>월별 활동량 확인 → 이탈 조짐 미리 보기</strong>
              <p>
                지난달보다 수업 수나 운동 빈도가 줄어들면
                휴식 때문인지, 의욕 저하인지, 통증 때문인지 먼저 체크할 회원을 고를 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>회원별 숫자 비교 → 연락 우선순위 정리</strong>
              <p>
                회원별 통계에서 잔여 횟수와 활동량을 같이 보면
                누가 먼저 관리 대상인지 빠르게 정리할 수 있고,
                문자/상담/재등록 제안 순서를 잡기 쉬워집니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            남은 세션 3~5회 + 개인운동 거의 없음 + 이번 달 활동 감소 조합이면
            “재등록 안내 + 운동 지속 유도 + 상태 체크”를 같이 들어가는 회원으로 보면 됩니다.
          </p>
        </div>
      </div>
    </details>
    <div className="stats-summary-grid">
      <div className="stats-summary-card summary-blue">
        <span>이번 달 PT 수업</span>
        <strong>{monthlyStats.ptCount}</strong>
        <p>기록작성 기준 집계</p>
      </div>

      <div className="stats-summary-card summary-green">
        <span>이번 달 개인운동</span>
        <strong>{monthlyStats.personalCount}</strong>
        <p>회원 입력 기준 집계</p>
      </div>

      <div className="stats-summary-card summary-violet">
        <span>전체 남은 세션</span>
        <strong>{monthlyStats.remainingSessions}</strong>
        <p>전체 회원 기준</p>
      </div>

      <div className="stats-summary-card summary-amber">
        <span>회원별 통계 수</span>
        <strong>{memberStats.length}</strong>
        <p>현재 표시 회원 수</p>
      </div>
    </div>

    <section className="stats-panel-card">
      <div className="stats-panel-head">
        <div>
          <div className="stats-panel-label">MEMBER STATS</div>
          <h3>회원별 통계</h3>
          <p className="sub-text">
            회원별 PT 수업, 개인운동, 총 세션, 남은 세션을 빠르게 비교할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="list-stack">
        {memberStats.length ? (
          memberStats.map((member) => {
            const remainingSessions = Number(member.remainingSessions || 0)
            const remainingClass =
              remainingSessions <= 0
                ? 'pill-red'
                : remainingSessions <= 5
                ? 'pill-amber'
                : 'pill-green'

            return (
              <div key={member.id} className="stats-member-row">
                <div className="stats-member-row-left">
                  <strong>{member.name}</strong>
                  <div className="compact-text">
                    PT {member.ptCount}회 / 개인운동 {member.personalCount}회 / 총 세션 {member.total_sessions || 0}회
                  </div>
                </div>

                <span className={`pill ${remainingClass}`}>
                  남은 {remainingSessions}회
                </span>
              </div>
            )
          })
        ) : (
          <div className="workout-list-empty">회원별 통계 데이터가 없습니다.</div>
        )}
      </div>
    </section>
  </div>
)}
{activeTab === '운영대시보드' && (
  <div className="admin-section premium-dashboard-page">
    <div className="dashboard-hero">
      <div className="dashboard-hero-left">
        <div className="dashboard-hero-badge">OPERATION OVERVIEW</div>
        <h2>운영 대시보드</h2>
        <p className="dashboard-hero-text">
          코치 상태, 매출 흐름, 세일즈 전환, 회원 활동, 문의/공지까지
          지금 확인해야 할 운영 지표를 한 화면에서 빠르게 보는 요약 화면입니다.
        </p>
      </div>

      <div className="dashboard-hero-right">
        <div className="dashboard-hero-mini">
          <span>이번 달 핵심 매출</span>
          <strong>{Number(dashboardOverview.monthSalesAmount || 0).toLocaleString()}원</strong>
          <p>전월 대비 {dashboardOverview.monthRevenueChangeRate > 0 ? '+' : ''}{dashboardOverview.monthRevenueChangeRate || 0}%</p>
        </div>

        <div className="dashboard-hero-mini">
          <span>미답변 / 위험 체크</span>
          <strong>{dashboardOverview.pendingInquiries || 0}건 / {dashboardOverview.riskCoachCount || 0}명</strong>
          <p>문의 응답과 코치 일정 조정 우선 확인</p>
        </div>
      </div>
    </div>
    <details className="tab-usage-guide-card dashboard-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE THIS DASHBOARD</div>
          <strong>운영대시보드는 이렇게 보고, 이렇게 실무에 씁니다</strong>
          <p>
            숫자만 보는 화면이 아니라 지금 누구를 먼저 챙기고, 어떤 문제를 먼저 처리할지
            우선순위를 잡는 운영 요약판입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>상단 KPI 먼저 확인 → 오늘 우선순위가 잡힙니다</strong>
              <p>
                매출, 전월 대비, 남은 세션, 미답변 문의를 먼저 보면
                오늘이 매출 점검이 필요한 날인지, 재등록 관리가 필요한 날인지,
                응답 처리가 급한 날인지 바로 판단할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>세션 종료 임박 회원 확인 → 재등록 연락 타이밍을 잡습니다</strong>
              <p>
                남은 횟수가 적은 회원은 단순 조회용이 아니라
                상담 예약, 다음 프로그램 제안, 문자 발송 우선 대상자로 보는 영역입니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>위험 코치 / 미답변 문의 확인 → 문제를 먼저 막습니다</strong>
              <p>
                코치 상태가 위험이거나 문의가 쌓이면
                매출보다 먼저 일정 조정, 컨디션 체크, 답변 처리부터 해야
                운영 누수를 줄일 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>활동 회원 / 세일즈 흐름 확인 → 다음 액션을 정합니다</strong>
              <p>
                활동 많은 회원은 후기, 인증, 업셀 제안 대상으로,
                후속관리 리드는 재접촉 대상으로,
                최근 매출과 프로그램 매출은 어떤 상품을 더 밀지 판단하는 기준으로 씁니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            남은 세션 3~5회 회원이 많고, 전월 대비 매출이 떨어지며, 후속관리 리드가 쌓여 있으면
            오늘은 신규 홍보보다 재등록 연락, 상담 전환, 미답변 처리부터 먼저 잡는 날로 보면 됩니다.
          </p>
        </div>
      </div>
    </details>
    <div className="dashboard-kpi-grid">
      <div className="dashboard-kpi-card kpi-blue">
        <span>오늘 매출</span>
        <strong>{Number(dashboardOverview.todaySalesAmount || 0).toLocaleString()}원</strong>
        <div className="compact-text">
          오늘 결제 {dashboardOverview.todaySalesCount || 0}건
        </div>
      </div>

      <div className="dashboard-kpi-card kpi-green">
        <span>이번 주 매출</span>
        <strong>{Number(dashboardOverview.weekSalesAmount || 0).toLocaleString()}원</strong>
        <div className="compact-text">
          이번 주 결제 {dashboardOverview.weekSalesCount || 0}건
        </div>
      </div>

      <div className="dashboard-kpi-card kpi-violet">
        <span>이번 달 매출</span>
        <strong>{Number(dashboardOverview.monthSalesAmount || 0).toLocaleString()}원</strong>
        <div className="compact-text">
          이번 달 결제 {dashboardOverview.monthSalesCount || 0}건
        </div>
      </div>

      <div
        className={`dashboard-kpi-card ${
          Number(dashboardOverview.monthRevenueChangeRate || 0) > 0
            ? 'kpi-green'
            : Number(dashboardOverview.monthRevenueChangeRate || 0) < 0
            ? 'kpi-red'
            : 'kpi-amber'
        }`}
      >
        <span>전월 대비 매출</span>
        <strong>
          {dashboardOverview.monthRevenueChangeRate > 0 ? '+' : ''}
          {dashboardOverview.monthRevenueChangeRate || 0}%
        </strong>
        <div className="compact-text">이번 달 매출 증감률</div>
      </div>

      <div className="dashboard-kpi-card kpi-blue">
        <span>이번 달 PT 수업</span>
        <strong>{dashboardOverview.ptCount || 0}회</strong>
        <div className="compact-text">기록작성/운동기록 기준</div>
      </div>

      <div className="dashboard-kpi-card kpi-green">
        <span>이번 달 개인운동</span>
        <strong>{dashboardOverview.personalCount || 0}회</strong>
        <div className="compact-text">회원 입력 기준</div>
      </div>

      <div className="dashboard-kpi-card kpi-amber">
        <span>전체 남은 세션</span>
        <strong>{dashboardOverview.remainingSessionTotal || 0}회</strong>
        <div className="compact-text">전체 회원 잔여 세션 합계</div>
      </div>

      <div className="dashboard-kpi-card kpi-red">
        <span>미답변 문의</span>
        <strong>{dashboardOverview.pendingInquiries || 0}건</strong>
        <div className="compact-text">
          unread 문의 {dashboardOverview.unreadInquiryCount || 0}건 / unread 공지 {dashboardOverview.unreadNoticeCount || 0}건
        </div>
      </div>
    </div>

    <div className="dashboard-main-grid">
      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">COACH STATUS</div>
            <h3>코치 상태 요약</h3>
            <p className="sub-text">지금 바로 봐야 할 회복/주의/위험 흐름입니다.</p>
          </div>
        </div>

        <div className="dashboard-kpi-grid dashboard-kpi-grid-inside">
          <div className="dashboard-kpi-card kpi-amber">
            <span>번아웃 의심 평균</span>
            <strong>{Number(burnoutSummary.avgSignal || 0).toFixed(1)}</strong>
            <div className="compact-text">
              {burnoutSummary.avgSignal >= 3 ? '주의 필요' : '정상 범위'}
            </div>
          </div>

          <div className="dashboard-kpi-card kpi-blue">
            <span>회복 체크 평균</span>
            <strong>{Number(burnoutSummary.avgRecovery || 0).toFixed(1)}</strong>
            <div className="compact-text">
              {burnoutSummary.avgRecovery >= 3 ? '회복 중' : '관리 필요'}
            </div>
          </div>

          <div className="dashboard-kpi-card kpi-amber">
            <span>주의 코치</span>
            <strong>{dashboardOverview.cautionCoachCount || 0}명</strong>
            <div className="compact-text">컨디션/스트레스 확인 필요</div>
          </div>

          <div className="dashboard-kpi-card kpi-red">
            <span>위험 코치</span>
            <strong>{dashboardOverview.riskCoachCount || 0}명</strong>
            <div className="compact-text">즉시 일정 조정 검토</div>
          </div>
        </div>
      </section>

      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">SALES FLOW</div>
            <h3>세일즈 요약</h3>
            <p className="sub-text">현재 전환 흐름과 후속관리 상태입니다.</p>
          </div>
        </div>

        <div className="dashboard-kpi-grid dashboard-kpi-grid-inside">
          <div className="dashboard-kpi-card kpi-blue">
            <span>세일즈일지 전체</span>
            <strong>{salesLogSummary.total || 0}건</strong>
            <div className="compact-text">현재 필터 기준</div>
          </div>

          <div className="dashboard-kpi-card kpi-green">
            <span>결제완료</span>
            <strong>{salesLogSummary.closed || 0}건</strong>
            <div className="compact-text">신규 전환 완료</div>
          </div>

          <div className="dashboard-kpi-card kpi-amber">
            <span>후속관리</span>
            <strong>{salesLogSummary.followup || 0}건</strong>
            <div className="compact-text">재접촉 필요</div>
          </div>

          <div className="dashboard-kpi-card kpi-red">
            <span>이탈</span>
            <strong>{salesLogSummary.lost || 0}건</strong>
            <div className="compact-text">보류/이탈 확인</div>
          </div>
        </div>
      </section>
    </div>

    <div className="dashboard-main-grid">
      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">PAYMENT</div>
            <h3>결제수단별 매출</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.paymentBreakdown.length ? (
            dashboardOverview.paymentBreakdown.map((item) => (
              <div key={item.label} className="dashboard-list-row">
                <div>
                  <strong>{item.label}</strong>
                  <div className="compact-text">결제수단 기준 매출 집계</div>
                </div>
                <span className="pill pill-blue">{Number(item.amount || 0).toLocaleString()}원</span>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">매출 데이터가 없습니다.</div>
          )}
        </div>
      </section>

      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">PROGRAM REVENUE</div>
            <h3>이번 달 프로그램별 매출</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.topPrograms.length ? (
            dashboardOverview.topPrograms.map((item) => (
              <div key={item.name} className="dashboard-list-row">
                <div>
                  <strong>{item.name}</strong>
                  <div className="compact-text">이번 달 프로그램 매출</div>
                </div>
                <span className="pill pill-violet">{Number(item.amount || 0).toLocaleString()}원</span>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">프로그램 매출 데이터가 없습니다.</div>
          )}
        </div>
      </section>
    </div>

    <div className="dashboard-main-grid">
      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">SESSION ALERT</div>
            <h3>세션 종료 임박 회원</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.endingMembers.length ? (
            dashboardOverview.endingMembers.map((member) => (
              <div key={member.id} className="dashboard-list-row">
                <div>
  <strong>{member.name || '-'}</strong>

  <div className="member-level-inline">
    <span className="member-level-badge">
      {member.member_levels?.level_name || '등급 없음'}
    </span>
    <span className="member-level-xp">
      Lv.{member.member_levels?.level_no || 0}
    </span>
    <span className="member-level-totalxp">
      XP {member.member_levels?.total_xp || 0}
    </span>
  </div>

  <div className="compact-text">
    목표: {member.goal || '-'} / 프로그램: {member.programs?.name || '프로그램 없음'}
  </div>
</div>
                <span
                  className={`pill ${
                    Number(member.remainingSessions || 0) <= 5
                      ? 'pill-red'
                      : Number(member.remainingSessions || 0) <= 10
                      ? 'pill-amber'
                      : 'pill-blue'
                  }`}
                >
                  남은 {member.remainingSessions}회
                </span>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">종료 임박 회원이 없습니다.</div>
          )}
        </div>
      </section>

      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">ACTIVE MEMBERS</div>
            <h3>이번 달 활동 많은 회원</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.activeMembers.length ? (
            dashboardOverview.activeMembers.map((member) => (
              <div key={member.id} className="dashboard-list-row">
                <div>
                  <strong>{member.name}</strong>
                  <div className="compact-text">목표: {member.goal || '-'}</div>
                </div>
                <span className="pill pill-green">기록 {member.workoutCount}회</span>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">이번 달 운동기록이 없습니다.</div>
          )}
        </div>
      </section>
    </div>

    <div className="dashboard-main-grid">
      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">COACH RISK</div>
            <h3>위험 / 주의 코치</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.riskCoaches.length === 0 && dashboardOverview.cautionCoaches.length === 0 ? (
            <div className="workout-list-empty">주의 또는 위험 상태 코치가 없습니다.</div>
          ) : (
            <>
              {dashboardOverview.riskCoaches.map((item) => (
                <div key={`risk-${item.id}`} className="dashboard-list-row dashboard-list-row-danger">
                  <div>
                    <strong>{item.coachName}</strong>
                    <div className="compact-text">
                      컨디션 {item.condition_score || 0} / 피로 {item.fatigue_score || 0} / 스트레스 {item.stress_score || 0} / 집중도 {item.focus_score || 0}
                    </div>
                  </div>
                  <span className="pill pill-red">위험</span>
                </div>
              ))}

              {dashboardOverview.cautionCoaches.map((item) => (
                <div key={`caution-${item.id}`} className="dashboard-list-row dashboard-list-row-warn">
                  <div>
                    <strong>{item.coachName}</strong>
                    <div className="compact-text">
                      컨디션 {item.condition_score || 0} / 피로 {item.fatigue_score || 0} / 스트레스 {item.stress_score || 0} / 집중도 {item.focus_score || 0}
                    </div>
                  </div>
                  <span className="pill pill-amber">주의</span>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">TOP REVIEW</div>
            <h3>코치 리뷰 상위</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.topCoachReviews.length ? (
            dashboardOverview.topCoachReviews.map((item) => (
              <div key={item.id} className="dashboard-list-row">
                <div>
                  <strong>{item.coachName}</strong>
                  <div className="compact-text">
                    매출 {item.revenue_score || 0} / 활동 {item.activity_score || 0} / 세일즈 {item.sales_score || 0} / 태도 {item.attitude_score || 0}
                  </div>
                </div>
                <span className="pill pill-violet">총점 {Number(item.total_score || 0).toFixed(1)}</span>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">코치 리뷰 데이터가 없습니다.</div>
          )}
        </div>
      </section>
    </div>

    <div className="dashboard-main-grid">
      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">RECENT SALES</div>
            <h3>최근 매출</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.recentSales.length ? (
            dashboardOverview.recentSales.map((sale) => (
              <div key={sale.id} className="dashboard-list-row">
                <div>
                  <strong>{sale.members?.name || '회원명 없음'}</strong>
                  <div className="compact-text">
                    {sale.sale_date || '-'} / {sale.programs?.name || '프로그램 미지정'} / {sale.payment_method || '-'}
                  </div>
                </div>
                <span className="pill pill-blue">{Number(sale.amount || 0).toLocaleString()}원</span>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">최근 매출이 없습니다.</div>
          )}
        </div>
      </section>

      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">RECENT SALES LOG</div>
            <h3>최근 세일즈일지</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.recentSalesLogs.length ? (
            dashboardOverview.recentSalesLogs.map((log) => (
              <div key={log.id} className="dashboard-list-row">
                <div>
                  <strong>{log.lead_name || '리드명 없음'}</strong>
                  <div className="compact-text">
                    {log.log_date || '-'} / {log.coach_name || '-'} / {log.main_need || '-'} / 전환도 {log.conversion_score || '-'}
                  </div>
                </div>
                <span
                  className={`pill ${
                    log.sales_result === '결제완료'
                      ? 'pill-green'
                      : log.sales_result === '후속관리'
                      ? 'pill-amber'
                      : log.sales_result === '이탈'
                      ? 'pill-red'
                      : 'pill-blue'
                  }`}
                >
                  {log.sales_result || '진행중'}
                </span>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">세일즈일지가 없습니다.</div>
          )}
        </div>
      </section>
    </div>

    <div className="dashboard-main-grid">
      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">RECENT INQUIRY</div>
            <h3>최근 문의</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.recentInquiries.length ? (
            dashboardOverview.recentInquiries.map((item) => (
              <div key={item.id} className="dashboard-list-row">
                <div>
                  <strong>{item.title || item.member_name || '문의'}</strong>
                  <div className="compact-text">
                    {item.created_at || item.inquiry_date || '-'}
                  </div>
                </div>
                <span
                  className={`pill ${
                    item.status === 'answered' || item.status === '답변완료'
                      ? 'pill-green'
                      : item.status === 'pending' || item.status === '대기중'
                      ? 'pill-amber'
                      : 'pill-blue'
                  }`}
                >
                  {item.status || 'pending'}
                </span>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">문의 내역이 없습니다.</div>
          )}
        </div>
      </section>

      <section className="dashboard-panel-card">
        <div className="dashboard-panel-head">
          <div>
            <div className="dashboard-panel-label">RECENT NOTICE</div>
            <h3>최근 공지</h3>
          </div>
        </div>

        <div className="list-stack">
          {dashboardOverview.recentNotices.length ? (
            dashboardOverview.recentNotices.map((item) => (
              <div key={item.id} className="dashboard-list-row">
                <div>
                  <strong>{item.title || '공지'}</strong>
                  <div className="compact-text">
                    {item.starts_at || item.created_at || '-'}
                  </div>
                </div>
                <span className="pill pill-violet">{item.category || '공지'}</span>
              </div>
            ))
          ) : (
            <div className="workout-list-empty">공지 내역이 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  </div>
)}
{activeTab === '활동랭킹' && (
  <div className="activity-ranking-page">
    <section className="activity-ranking-hero">
      <div className="activity-ranking-hero-left">
        <div className="activity-ranking-badge">MEMBER ACTIVITY RANKING</div>
        <h2>회원 활동랭킹</h2>
       <p className="activity-ranking-hero-text">
  {selectedStatsMonth} 기준 활동량과 별도로, 누적 총 XP 기준 회원 랭킹까지 함께 보는 화면입니다.
  매출 보너스 XP를 포함한 전체 성장 순위를 확인할 수 있습니다.
</p>
        <div className="activity-ranking-filter-row">
          <input
            type="month"
            value={selectedStatsMonth}
            onChange={(e) => setSelectedStatsMonth(e.target.value)}
          />
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setSelectedStatsMonth(new Date().toISOString().slice(0, 7))}
          >
            이번달
          </button>
        </div>
      </div>

      <div className="activity-ranking-hero-right">
        <div className="activity-ranking-hero-mini top-pt">
          <span>{selectedStatsMonth} PT 1위</span>
          <strong>
            {activityRankingData.topPtMember
              ? `${activityRankingData.topPtMember.name} (${activityRankingData.topPtMember.ptCount}회)`
              : '-'}
          </strong>
          <p>PT 수업 기준 최다 참여 회원</p>
        </div>

        <div className="activity-ranking-hero-mini top-personal">
          <span>{selectedStatsMonth} 개인운동 1위</span>
          <strong>
            {activityRankingData.topPersonalMember
              ? `${activityRankingData.topPersonalMember.name} (${activityRankingData.topPersonalMember.personalCount}회)`
              : '-'}
          </strong>
          <p>개인운동 기준 최다 참여 회원</p>
        </div>

        <div className="activity-ranking-hero-mini top-total">
          <span>{selectedStatsMonth} 전체 활동 1위</span>
          <strong>
            {activityRankingData.topTotalMember
              ? `${activityRankingData.topTotalMember.name} (${activityRankingData.topTotalMember.totalActivity}회)`
              : '-'}
          </strong>
          <p>PT + 개인운동 합산 기준</p>
        </div>

        <div className="activity-ranking-hero-mini top-score">
  <span>총 XP 1위</span>
  <strong>
    {activityRankingData.topLevelMember
      ? `${activityRankingData.topLevelMember.name} (${activityRankingData.topLevelMember.totalXp}XP)`
      : '-'}
  </strong>
  <p>매출 보너스 포함 누적 XP 기준</p>
</div>
      </div>
    </section>
    <details className="tab-usage-guide-card activity-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO READ THIS</div>
          <strong>활동랭킹을 왜 보고, 어디에 써야 하는지</strong>
          <p>단순 순위표가 아니라 칭찬, 자극, 보상, 재참여 유도 기준으로 쓰는 화면입니다.</p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>상위권 확인 → 칭찬/동기부여에 활용</strong>
              <p>
                PT, 개인운동, 전체 활동 상위권 회원은
                공개 칭찬, 밴드 인증, 소소한 혜택 안내 대상으로 쓰기 좋습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>중간권 확인 → 상위권 도전 자극 주기</strong>
              <p>
                2~5위권 회원은 조금만 더 하면 올라갈 수 있는 구간이라
                “이번 주 2번만 더 하면 순위 올라간다” 같은 자극 메시지에 잘 반응합니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>하위권/이탈권 확인 → 다시 끌어올 회원 찾기</strong>
              <p>
                기존 등록 회원인데 랭킹에서 거의 보이지 않으면
                운동 흐름이 끊긴 회원일 가능성이 높아서 재참여 유도 연락 대상으로 활용할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>총 XP / 주간 XP 비교 → 꾸준함과 최근 흐름 분리해서 보기</strong>
              <p>
                총 XP는 누적 성장형 회원,
                주간 XP는 최근 불붙은 회원을 보는 지표라서
                장기 우수회원과 최근 반응 좋은 회원을 따로 관리할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            총 XP는 높은데 주간 XP가 갑자기 떨어지면 최근 페이스가 꺾인 회원일 수 있고,
            주간 XP가 급상승하면 후기 요청, 인증 유도, 다음 단계 제안 타이밍으로 보기 좋습니다.
          </p>
        </div>
      </div>
    </details>
    <div className="activity-ranking-summary-grid">
      <div className="activity-summary-card summary-pt">
        <span>이번 달 PT 수업 1위</span>
        <strong>
          {activityRankingData.topPtMember ? `${activityRankingData.topPtMember.ptCount}회` : '0회'}
        </strong>
        <p>{activityRankingData.topPtMember ? activityRankingData.topPtMember.name : '데이터 없음'}</p>
      </div>

      <div className="activity-summary-card summary-personal">
        <span>이번 달 개인운동 1위</span>
        <strong>
          {activityRankingData.topPersonalMember ? `${activityRankingData.topPersonalMember.personalCount}회` : '0회'}
        </strong>
        <p>{activityRankingData.topPersonalMember ? activityRankingData.topPersonalMember.name : '데이터 없음'}</p>
      </div>

      <div className="activity-summary-card summary-total">
        <span>이번 달 전체 활동 1위</span>
        <strong>
          {activityRankingData.topTotalMember ? `${activityRankingData.topTotalMember.totalActivity}회` : '0회'}
        </strong>
        <p>{activityRankingData.topTotalMember ? activityRankingData.topTotalMember.name : '데이터 없음'}</p>
      </div>

     <div className="activity-summary-card summary-score">
  <span>총 XP 1위</span>
  <strong>
    {activityRankingData.topLevelMember ? `${activityRankingData.topLevelMember.totalXp}XP` : '0XP'}
  </strong>
  <p>{activityRankingData.topLevelMember ? activityRankingData.topLevelMember.name : '데이터 없음'}</p>
</div>
    </div>

    <section className="activity-ranking-panel">
      <button
        type="button"
        className="activity-ranking-panel-toggle"
        onClick={() => toggleActivityRankingSection('summary')}
      >
        <span>1. 이번달 활동 요약</span>
        <strong>{activityRankingOpenSections.summary ? '−' : '+'}</strong>
      </button>

      {activityRankingOpenSections.summary && (
        <div className="activity-ranking-panel-body">
          <div className="activity-ranking-summary-grid inner">
            <div className="activity-summary-card summary-pt">
              <span>PT 수업 선두</span>
              <strong>
                {activityRankingData.topPtMember
                  ? `${activityRankingData.topPtMember.name} (${activityRankingData.topPtMember.ptCount}회)`
                  : '-'}
              </strong>
              <p>현재 월간 PT 랭킹 선두 회원</p>
            </div>

            <div className="activity-summary-card summary-personal">
              <span>개인운동 선두</span>
              <strong>
                {activityRankingData.topPersonalMember
                  ? `${activityRankingData.topPersonalMember.name} (${activityRankingData.topPersonalMember.personalCount}회)`
                  : '-'}
              </strong>
              <p>현재 월간 개인운동 랭킹 선두 회원</p>
            </div>

            <div className="activity-summary-card summary-total">
              <span>전체 활동 선두</span>
              <strong>
                {activityRankingData.topTotalMember
                  ? `${activityRankingData.topTotalMember.name} (${activityRankingData.topTotalMember.totalActivity}회)`
                  : '-'}
              </strong>
              <p>PT + 개인운동 합산 기준</p>
            </div>

            <div className="activity-summary-card summary-score">
  <span>총 XP 선두</span>
  <strong>
    {activityRankingData.topLevelMember
      ? `${activityRankingData.topLevelMember.name} (${activityRankingData.topLevelMember.totalXp}XP)`
      : '-'}
  </strong>
  <p>매출 보너스 포함 누적 XP 기준</p>
</div>
          </div>
        </div>
      )}
    </section>

    <section className="activity-ranking-panel">
      <button
        type="button"
        className="activity-ranking-panel-toggle"
        onClick={() => toggleActivityRankingSection('pt')}
      >
        <span>2. PT 수업 랭킹 TOP 10</span>
        <strong>{activityRankingOpenSections.pt ? '−' : '+'}</strong>
      </button>

      {activityRankingOpenSections.pt && (
        <div className="activity-ranking-panel-body">
          <div className="list-stack">
            {activityRankingData.ptRanking.length ? (
              activityRankingData.ptRanking.slice(0, 10).map((member, index) => (
                <div
                  key={member.id}
                  className={`activity-rank-item activity-rank-card ${
                    index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
                  }`}
                >
                  <div className="list-card-top">
                    <strong>
                      {index + 1}위 · {member.name}
                    </strong>
                    <span className="activity-rank-score score-pt">PT {member.ptCount}회</span>
                  </div>
                  <div className="compact-text">
                    개인운동 {member.personalCount}회 / 전체 활동 {member.totalActivity}회 / 남은 세션 {member.remainingSessions}회
                  </div>
                </div>
              ))
            ) : (
              <div className="workout-list-empty">이번 달 PT 기록이 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </section>

    <section className="activity-ranking-panel">
      <button
        type="button"
        className="activity-ranking-panel-toggle"
        onClick={() => toggleActivityRankingSection('personal')}
      >
        <span>3. 개인운동 랭킹 TOP 10</span>
        <strong>{activityRankingOpenSections.personal ? '−' : '+'}</strong>
      </button>

      {activityRankingOpenSections.personal && (
        <div className="activity-ranking-panel-body">
          <div className="list-stack">
            {activityRankingData.personalRanking.length ? (
              activityRankingData.personalRanking.slice(0, 10).map((member, index) => (
                <div
                  key={member.id}
                  className={`activity-rank-item activity-rank-card ${
                    index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
                  }`}
                >
                  <div className="list-card-top">
                    <strong>
                      {index + 1}위 · {member.name}
                    </strong>
                    <span className="activity-rank-score score-personal">개인운동 {member.personalCount}회</span>
                  </div>
                  <div className="compact-text">
                    PT {member.ptCount}회 / 전체 활동 {member.totalActivity}회 / 목표 {member.goal || '-'}
                  </div>
                </div>
              ))
            ) : (
              <div className="workout-list-empty">이번 달 개인운동 기록이 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </section>

    <section className="activity-ranking-panel">
      <button
        type="button"
        className="activity-ranking-panel-toggle"
        onClick={() => toggleActivityRankingSection('total')}
      >
        <span>4. 전체 활동 랭킹 TOP 10</span>
        <strong>{activityRankingOpenSections.total ? '−' : '+'}</strong>
      </button>

      {activityRankingOpenSections.total && (
        <div className="activity-ranking-panel-body">
          <div className="list-stack">
            {activityRankingData.totalRanking.length ? (
              activityRankingData.totalRanking.slice(0, 10).map((member, index) => (
                <div
                  key={member.id}
                  className={`activity-rank-item activity-rank-card ${
                    index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
                  }`}
                >
                  <div className="list-card-top">
                    <strong>
                      {index + 1}위 · {member.name}
                    </strong>
                    <span className="activity-rank-score score-total">총 {member.totalActivity}회</span>
                  </div>
                  <div className="compact-text">
                    PT {member.ptCount}회 / 개인운동 {member.personalCount}회 / 남은 세션 {member.remainingSessions}회
                  </div>
                </div>
              ))
            ) : (
              <div className="workout-list-empty">이번 달 활동 기록이 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </section>

    <section className="activity-ranking-panel">
      <button
        type="button"
        className="activity-ranking-panel-toggle"
        onClick={() => toggleActivityRankingSection('weighted')}
      >
        <span>5. 참여 점수 랭킹 TOP 10</span>
        <strong>{activityRankingOpenSections.weighted ? '−' : '+'}</strong>
      </button>

      {activityRankingOpenSections.weighted && (
        <div className="activity-ranking-panel-body">
          <div className="compact-text activity-ranking-guide-text">
            PT 1회 = 2점 / 개인운동 1회 = 1점 기준
          </div>

          <div className="list-stack">
            {activityRankingData.weightedRanking.length ? (
              activityRankingData.weightedRanking.slice(0, 10).map((member, index) => (
                <div
                  key={member.id}
                  className={`activity-rank-item activity-rank-card ${
                    index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
                  }`}
                >
                  <div className="list-card-top">
                    <strong>
                      {index + 1}위 · {member.name}
                    </strong>
                    <span className="activity-rank-score score-weighted">{member.weightedScore}점</span>
                  </div>
                  <div className="compact-text">
                    PT {member.ptCount}회 / 개인운동 {member.personalCount}회 / 총 활동 {member.totalActivity}회
                  </div>
                </div>
              ))
            ) : (
              <div className="workout-list-empty">이번 달 참여 점수 데이터가 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </section>

    <section className="activity-ranking-panel">
      <button
        type="button"
        className="activity-ranking-panel-toggle"
        onClick={() => toggleActivityRankingSection('level')}
      >
       <span>6. 총 XP 랭킹 TOP 10</span>
        <strong>{activityRankingOpenSections.level ? '−' : '+'}</strong>
      </button>

      {activityRankingOpenSections.level && (
        <div className="activity-ranking-panel-body">
          <div className="list-stack">
            {activityRankingData.levelRanking.length ? (
              activityRankingData.levelRanking.slice(0, 10).map((member, index) => (
                <div
                  key={member.id}
                  className={`activity-rank-item activity-rank-card ${
                    index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
                  }`}
                >
                  <div className="list-card-top">
                    <strong>
                      {index + 1}위 · {member.name}
                    </strong>
                    <span className="activity-rank-score score-weighted">
                      Lv.{member.levelNo} · {member.levelName}
                    </span>
                  </div>
                 <div className="compact-text">
  총 XP {member.totalXp}점 / 레벨 Lv.{member.levelNo} / 주간 점수 {member.weeklyScore}점
</div>
                </div>
              ))
            ) : (
              <div className="workout-list-empty">회원 레벨 데이터가 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </section>

    <section className="activity-ranking-panel">
      <button
        type="button"
        className="activity-ranking-panel-toggle"
        onClick={() => toggleActivityRankingSection('weeklyXp')}
      >
        <span>7. 주간 XP 랭킹 TOP 10</span>
        <strong>{activityRankingOpenSections.weeklyXp ? '−' : '+'}</strong>
      </button>

      {activityRankingOpenSections.weeklyXp && (
        <div className="activity-ranking-panel-body">
          <div className="list-stack">
            {activityRankingData.weeklyXpRanking.length ? (
              activityRankingData.weeklyXpRanking.slice(0, 10).map((member, index) => (
                <div
                  key={member.id}
                  className={`activity-rank-item activity-rank-card ${
                    index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
                  }`}
                >
                  <div className="list-card-top">
                    <strong>
                      {index + 1}위 · {member.name}
                    </strong>
                    <span className="activity-rank-score score-total">
                      주간 {member.weeklyScore}점
                    </span>
                  </div>
                  <div className="compact-text">
                    레벨 {member.levelName} / 누적 XP {member.totalXp}점 / 최근 활동일 {member.lastActivityDate || '-'}
                  </div>
                </div>
              ))
            ) : (
              <div className="workout-list-empty">주간 XP 데이터가 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </section>

    <section className="activity-ranking-panel">
      <button
        type="button"
        className="activity-ranking-panel-toggle"
        onClick={() => toggleActivityRankingSection('xpLogs')}
      >
        <span>8. 회원 XP 반영 로그</span>
        <strong>{activityRankingOpenSections.xpLogs ? '−' : '+'}</strong>
      </button>

      {activityRankingOpenSections.xpLogs && (
        <div className="activity-ranking-panel-body">
          <div className="section-head activity-ranking-log-head">
  <div>
    <p className="sub-text">최근 어떤 활동으로 XP가 반영됐는지 확인하는 영역입니다.</p>
  </div>

  <div className="inline-actions wrap">
    <div style={{ minWidth: '220px' }}>
      <select
        value={selectedXpMemberId}
        onChange={(e) => setSelectedXpMemberId(e.target.value)}
      >
        <option value="">전체 회원</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
    </div>

    <button
      type="button"
      className="secondary-btn"
      onClick={() => forceRefreshSingleMemberXp(selectedXpMemberId)}
      disabled={!selectedXpMemberId}
    >
      선택 회원 XP 재계산
    </button>
<button
  type="button"
  className="secondary-btn"
  onClick={forceRefreshAllMembersXp}
>
  전체 회원 XP 재계산
</button>
    <button
      type="button"
      className="danger-btn"
      onClick={() => hardResetSingleMemberXp(selectedXpMemberId)}
      disabled={!selectedXpMemberId}
    >
      선택 회원 XP 완전초기화
    </button>
  </div>
</div>

          <div className="list-stack">
            {memberXpLogs
              .filter((log) => !selectedXpMemberId || log.member_id === selectedXpMemberId)
              .slice(0, 20)
              .map((log) => {
                const targetMember = members.find((member) => member.id === log.member_id)

                return (
                  <div key={log.id} className="activity-rank-item activity-rank-card">
                    <div className="list-card-top">
                      <strong>{targetMember?.name || '회원'}</strong>
                      <span className="activity-rank-score score-weighted">{log.xp} XP</span>
                    </div>
                    <div className="compact-text">
                      유형: {log.source_type || '-'} / 날짜: {log.source_date || '-'} / 메모: {log.note || '-'}
                    </div>
                  </div>
                )
              })}

            {memberXpLogs.filter((log) => !selectedXpMemberId || log.member_id === selectedXpMemberId).length === 0 && (
              <div className="workout-list-empty">표시할 XP 로그가 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </section>
  </div>
)}
      {activeTab === '회원레벨설정' && (
  <div className="member-level-page">
    <section className="member-level-hero">
      <div className="member-level-hero-left">
        <div className="member-level-badge">MEMBER LEVEL SETTINGS</div>
        <h2>회원 레벨 기준 설정</h2>
        <p className="member-level-hero-text">
          회원 레벨 단계와 활동별 XP 기준을 보기 쉽게 정리하고, 필요한 항목만 펼쳐서 수정할 수 있는 설정 화면입니다.
        </p>
      </div>

      <div className="member-level-hero-right">
        <div className="member-level-hero-mini">
          <span>전체 레벨 수</span>
          <strong>{memberLevelSettings.length}개</strong>
          <p>현재 등록된 회원 레벨 단계</p>
        </div>

        <div className="member-level-hero-mini">
          <span>XP 규칙 수</span>
          <strong>{memberXpSettings.length}개</strong>
          <p>현재 등록된 XP 지급 규칙</p>
        </div>

        <div className="member-level-hero-mini">
          <span>시작 레벨 XP</span>
          <strong>{memberLevelSettings[0]?.min_xp || 0}</strong>
          <p>가장 첫 레벨 최소 XP</p>
        </div>

        <div className="member-level-hero-mini">
          <span>최고 레벨 XP</span>
          <strong>{memberLevelSettings[memberLevelSettings.length - 1]?.min_xp || 0}</strong>
          <p>최상위 레벨 최소 XP</p>
        </div>
      </div>
    </section>
    <details className="tab-usage-guide-card member-level-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE</div>
          <strong>회원 레벨 기준 설정은 이렇게 사용합니다</strong>
          <p>
            레벨 단계와 XP 규칙을 따로 정리해서, 회원 성장 기준과 보상 기준을 한 번에 맞추는 설정 화면입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>레벨 단계 확인 → 성장 구간이 정리됩니다</strong>
              <p>
                실버, 골드, 다이아처럼 회원 등급 구간을 먼저 확인하면
                회원이 어느 XP부터 다음 단계로 올라가는지 기준이 명확해집니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>최소 XP 수정 → 등급 상승 난이도가 바뀝니다</strong>
              <p>
                레벨별 최소 XP를 조정하면
                회원이 얼마나 자주 운동해야 다음 레벨로 가는지 성장 속도를 직접 조절할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>XP 규칙 수정 → 어떤 활동을 인정할지 정해집니다</strong>
              <p>
                PT, 개인운동, 유산소 같은 활동별 XP와 하루 최대 횟수를 설정하면
                어떤 행동에 보상을 줄지 운영 기준이 맞춰집니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>저장 → 회원 XP/레벨 운영 기준에 반영됩니다</strong>
              <p>
                항목별로 저장하면 이후 회원 랭킹, XP 누적, 레벨 표시 기준이
                지금 설정한 값 중심으로 맞춰지게 됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무에서 이렇게 보면 됩니다</strong>
          <p>
            레벨 단계는 “회원 성장 구간표”, XP 규칙은 “무슨 행동을 얼마나 인정할지”를 정하는 기준입니다.
            레벨은 너무 빠르게 오르지 않게, XP 규칙은 회원이 실제로 해주길 원하는 행동에 점수가 붙도록 잡는 게 핵심입니다.
          </p>
        </div>
      </div>
    </details>
    <div className="member-level-summary-grid">
      <div className="member-level-summary-card summary-blue">
        <span>회원 레벨 단계</span>
        <strong>{memberLevelSettings.length}</strong>
        <p>수정 가능한 레벨 수</p>
      </div>

      <div className="member-level-summary-card summary-green">
        <span>XP 규칙 항목</span>
        <strong>{memberXpSettings.length}</strong>
        <p>활동별 지급 규칙 수</p>
      </div>

      <div className="member-level-summary-card summary-violet">
        <span>첫 시작 XP</span>
        <strong>{memberLevelSettings[0]?.min_xp || 0}</strong>
        <p>시작 기준 XP</p>
      </div>

      <div className="member-level-summary-card summary-amber">
        <span>최고 레벨 XP</span>
        <strong>{memberLevelSettings[memberLevelSettings.length - 1]?.min_xp || 0}</strong>
        <p>최상위 기준 XP</p>
      </div>
    </div>

    <section className="member-level-panel">
      <button
        type="button"
        className="member-level-panel-toggle"
        onClick={() => toggleMemberLevelSection('levelSummary')}
      >
        <span>1. 회원 레벨 단계 설정</span>
        <strong>{memberLevelOpenSections.levelSummary ? '−' : '+'}</strong>
      </button>

      {memberLevelOpenSections.levelSummary && (
        <div className="member-level-panel-body">
          <div className="list-stack">
            {memberLevelSettings.map((level) => {
              const isCollapsed = collapsedMemberLevels[level.id] ?? true

              return (
                <div key={level.id} className="member-level-item-card">
                  <div className="list-card-top">
                    <button
                      type="button"
                      className="member-level-item-title-btn"
                      onClick={() =>
                        setCollapsedMemberLevels((prev) => ({
                          ...prev,
                          [level.id]: !isCollapsed,
                        }))
                      }
                    >
                      <span>
                        Lv.{level.level_no} · {level.level_name}
                      </span>
                      <strong>{isCollapsed ? '+' : '−'}</strong>
                    </button>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleMemberLevelSettingSave(level)}
                    >
                      저장
                    </button>
                  </div>

                  {isCollapsed ? (
                    <div className="compact-text member-level-collapsed-text">
                      최소 XP {level.min_xp || 0} / 설명 {level.description || '-'}
                    </div>
                  ) : (
                    <>
                      <div className="grid-2">
                        <label className="field">
                          <span>레벨명</span>
                          <input
                            value={level.level_name || ''}
                            onChange={(e) =>
                              setMemberLevelSettings((prev) =>
                                prev.map((item) =>
                                  item.id === level.id ? { ...item, level_name: e.target.value } : item
                                )
                              )
                            }
                          />
                        </label>

                        <label className="field">
                          <span>최소 XP</span>
                          <input
                            type="number"
                            value={level.min_xp || 0}
                            onChange={(e) =>
                              setMemberLevelSettings((prev) =>
                                prev.map((item) =>
                                  item.id === level.id ? { ...item, min_xp: e.target.value } : item
                                )
                              )
                            }
                          />
                        </label>
                      </div>

                      <label className="field">
                        <span>설명</span>
                        <input
                          value={level.description || ''}
                          onChange={(e) =>
                            setMemberLevelSettings((prev) =>
                              prev.map((item) =>
                                item.id === level.id ? { ...item, description: e.target.value } : item
                              )
                            )
                          }
                        />
                      </label>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>

    <section className="member-level-panel">
      <button
        type="button"
        className="member-level-panel-toggle"
        onClick={() => toggleMemberLevelSection('xpSummary')}
      >
        <span>2. 회원 XP 규칙 설정</span>
        <strong>{memberLevelOpenSections.xpSummary ? '−' : '+'}</strong>
      </button>

      {memberLevelOpenSections.xpSummary && (
        <div className="member-level-panel-body">
          <div className="list-stack">
            {memberXpSettings.map((rule) => {
              const isCollapsed = collapsedMemberXpRules[rule.id] ?? true

              return (
                <div key={rule.id} className="member-level-item-card">
                  <div className="list-card-top">
                    <button
                      type="button"
                      className="member-level-item-title-btn"
                      onClick={() =>
                        setCollapsedMemberXpRules((prev) => ({
                          ...prev,
                          [rule.id]: !isCollapsed,
                        }))
                      }
                    >
                      <span>{rule.rule_name}</span>
                      <strong>{isCollapsed ? '+' : '−'}</strong>
                    </button>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleMemberXpSettingSave(rule)}
                    >
                      저장
                    </button>
                  </div>

                  {isCollapsed ? (
                    <div className="compact-text member-level-collapsed-text">
                      XP {rule.xp || 0} / 하루 최대 {rule.daily_limit || 0}회 / 설명 {rule.description || '-'}
                    </div>
                  ) : (
                    <>
                      <div className="grid-2">
                        <label className="field">
                          <span>XP</span>
                          <input
                            type="number"
                            value={rule.xp || 0}
                            onChange={(e) =>
                              setMemberXpSettings((prev) =>
                                prev.map((item) =>
                                  item.id === rule.id ? { ...item, xp: e.target.value } : item
                                )
                              )
                            }
                          />
                        </label>

                        <label className="field">
                          <span>하루 최대 인정 횟수</span>
                          <input
                            type="number"
                            value={rule.daily_limit || 0}
                            onChange={(e) =>
                              setMemberXpSettings((prev) =>
                                prev.map((item) =>
                                  item.id === rule.id ? { ...item, daily_limit: e.target.value } : item
                                )
                              )
                            }
                          />
                        </label>
                      </div>

                      <div className="exercise-filter-grid">
                        <label className="field">
                          <span>최소 운동 개수</span>
                          <input
                            type="number"
                            value={rule.min_items ?? ''}
                            onChange={(e) =>
                              setMemberXpSettings((prev) =>
                                prev.map((item) =>
                                  item.id === rule.id ? { ...item, min_items: e.target.value } : item
                                )
                              )
                            }
                          />
                        </label>

                        <label className="field">
                          <span>최소 세트 수</span>
                          <input
                            type="number"
                            value={rule.min_sets ?? ''}
                            onChange={(e) =>
                              setMemberXpSettings((prev) =>
                                prev.map((item) =>
                                  item.id === rule.id ? { ...item, min_sets: e.target.value } : item
                                )
                              )
                            }
                          />
                        </label>

                        <label className="field">
                          <span>최소 유산소 시간</span>
                          <input
                            type="number"
                            value={rule.min_cardio_minutes ?? ''}
                            onChange={(e) =>
                              setMemberXpSettings((prev) =>
                                prev.map((item) =>
                                  item.id === rule.id ? { ...item, min_cardio_minutes: e.target.value } : item
                                )
                              )
                            }
                          />
                        </label>
                      </div>

                      <label className="field">
                        <span>설명</span>
                        <input
                          value={rule.description || ''}
                          onChange={(e) =>
                            setMemberXpSettings((prev) =>
                              prev.map((item) =>
                                item.id === rule.id ? { ...item, description: e.target.value } : item
                              )
                            )
                          }
                        />
                      </label>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  </div>
)}
      {activeTab === '매출기록' && (
  <div className="sales-page-modern">
    <section className="sales-hero">
      <div className="sales-hero-left">
        <div className="sales-hero-badge">SALES RECORD</div>
        <h2>매출기록</h2>
        <p className="sales-hero-text">
          월별 매출 흐름, 결제수단, VIP 비율, 프로그램별 매출을 먼저 보고
          필요한 입력과 목록만 펼쳐서 관리하는 화면입니다.
        </p>
      </div>

      <div className="sales-hero-right">
        <div className="sales-hero-mini">
          <span>{saleMonth} 총 매출</span>
          <strong>{Number(salesStatsExtended.totalSales || 0).toLocaleString()}</strong>
          <p>현재 필터 기준 매출 합계</p>
        </div>

        <div className="sales-hero-mini">
          <span>등록 건수</span>
          <strong>{Number(salesStatsExtended.totalCount || 0).toLocaleString()}</strong>
          <p>현재 필터 기준 결제 건수</p>
        </div>

        <div className="sales-hero-mini">
          <span>VIP 결제 수</span>
          <strong>{Number(salesStatsExtended.vipCount || 0).toLocaleString()}</strong>
          <p>VIP 결제 건수</p>
        </div>

        <div className="sales-hero-mini">
          <span>VIP 비율</span>
          <strong>{salesStatsExtended.vipRatio}%</strong>
          <p>전체 매출 중 VIP 비중</p>
        </div>
      </div>
    </section>
    <details className="tab-usage-guide-card sales-record-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE SALES RECORD</div>
          <strong>매출기록은 이렇게 보고, 이렇게 써야 합니다</strong>
          <p>
            금액 입력 화면이 아니라 월별 매출 흐름, 결제수단, VIP 비중, 프로그램별 매출을 보고 운영 판단까지 연결하는 탭입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>상단 숫자 먼저 확인 → 이번 달 매출 흐름을 먼저 읽습니다</strong>
              <p>
                총 매출, 등록 건수, VIP 결제 수, VIP 비율을 먼저 보면
                이번 달이 양은 괜찮은지, 고가 상품 비중이 괜찮은지 먼저 판단할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>입력 / 수정은 정확히 → 이후 통계와 XP에 반영됩니다</strong>
              <p>
                회원, 프로그램, 결제일, 결제방법, 구매 세션을 정확히 넣어야
                매출 통계, 프로그램 매출, 판매 흐름, XP 반영까지 같이 맞아집니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>월별 요약 보기 → 어떤 결제가 잘 나가는지 판단합니다</strong>
              <p>
                현금/카드/이체/할부 비중과 프로그램별 매출을 같이 보면
                어떤 상품과 어떤 결제 방식이 실제로 많이 나가는지 바로 보입니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>세일즈일지와 같이 보기 → 전환 구조까지 같이 해석합니다</strong>
              <p>
                매출이 떨어졌다고 바로 상품 문제로 보지 말고,
                세일즈일지의 후속관리·결제완료 흐름과 같이 봐야 원인을 더 정확히 잡을 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            등록 건수는 비슷한데 총 매출이 낮고 VIP 비율이 떨어졌다면,
            이번 달은 저가/짧은 세션 위주로 팔리고 있다는 뜻이니 프로그램 구성이나 업셀 제안을 다시 점검하면 됩니다.
          </p>
        </div>
      </div>
    </details>
    <div className="sales-summary-modern-grid">
      <div className="sales-summary-modern-card summary-blue">
        <span>총 매출</span>
        <strong>{Number(salesStatsExtended.totalSales || 0).toLocaleString()}</strong>
        <p>현재 필터 기준</p>
      </div>

      <div className="sales-summary-modern-card summary-green">
        <span>등록 건수</span>
        <strong>{Number(salesStatsExtended.totalCount || 0).toLocaleString()}</strong>
        <p>이번 달 결제 건수</p>
      </div>

      <div className="sales-summary-modern-card summary-violet">
        <span>VIP 결제 수</span>
        <strong>{Number(salesStatsExtended.vipCount || 0).toLocaleString()}</strong>
        <p>VIP 결제 건수</p>
      </div>

      <div className="sales-summary-modern-card summary-amber">
        <span>VIP 비율</span>
        <strong>{salesStatsExtended.vipRatio}%</strong>
        <p>현재 필터 기준</p>
      </div>
    </div>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesRecordSection('filters')}>
        <span>1. 검색 / 월간 필터</span>
        <strong>{salesRecordOpenSections.filters ? '−' : '+'}</strong>
      </button>

      {salesRecordOpenSections.filters && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>매출 검색 / 필터</h3>

            <div className="stack-gap">
              <input
                placeholder="매출 검색"
                value={saleSearch}
                onChange={(e) => setSaleSearch(e.target.value)}
              />

              <div className="grid-2">
                <input type="month" value={saleMonth} onChange={(e) => setSaleMonth(e.target.value)} />

                <select value={salePaymentFilter} onChange={(e) => setSalePaymentFilter(e.target.value)}>
                  <option value="all">전체 결제수단</option>
                  <option value="현금">현금</option>
                  <option value="카드">카드</option>
                  <option value="이체">이체</option>
                  <option value="할부">할부</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesRecordSection('form')}>
        <span>2. 매출 기록 입력 / 수정</span>
        <strong>{salesRecordOpenSections.form ? '−' : '+'}</strong>
      </button>

      {salesRecordOpenSections.form && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>매출 기록 입력 / 수정</h3>

            <form className="stack-gap" onSubmit={handleSaleSubmit}>
              <div className="grid-2">
                <label className="field">
                  <span>회원</span>
                  <select value={saleForm.member_id} onChange={(e) => setSaleForm({ ...saleForm, member_id: e.target.value })}>
                    <option value="">선택 안함</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <select
  value={saleForm.program_id}
  onChange={(e) => {
    const nextProgramId = e.target.value
    const matchedProgram = programs.find((program) => program.id === nextProgramId)

    setSaleForm((prev) => ({
      ...prev,
      program_id: nextProgramId,
      purchased_session_count: matchedProgram?.session_count || 0,
    }))
  }}
>
  <option value="">선택 안함</option>
  {programs.map((program) => (
    <option key={program.id} value={program.id}>
      {program.name}
    </option>
  ))}
</select>
                </label>
              </div>

              <div className="grid-2">
                <label className="field">
                  <span>결제일</span>
                  <input type="date" value={saleForm.sale_date} onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })} />
                </label>

                <label className="field">
                  <span>금액</span>
                  <input type="number" value={saleForm.amount} onChange={(e) => setSaleForm({ ...saleForm, amount: e.target.value })} />
                </label>
              </div>

              <div className="grid-2">
                <label className="field">
                  <span>결제방법</span>
                  <select value={saleForm.payment_method} onChange={(e) => setSaleForm({ ...saleForm, payment_method: e.target.value })}>
                    <option value="현금">현금</option>
                    <option value="카드">카드</option>
                    <option value="이체">이체</option>
                    <option value="할부">할부</option>
                  </select>
                </label>

                <label className="field">
                  <span>할부 개월수</span>
                  <input
                    type="number"
                    value={saleForm.installment_months}
                    onChange={(e) => setSaleForm({ ...saleForm, installment_months: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid-2">
               <label className="field">
  <span>구매 세션</span>
  <input
    type="number"
    value={saleForm.purchased_session_count}
    onChange={(e) => setSaleForm({ ...saleForm, purchased_session_count: e.target.value })}
  />
 <div className="compact-text">
  {getSaleBonusPreviewText(saleForm.purchased_session_count)}
</div>
<div className="compact-text">
  {getBenefitPreviewText(saleForm.member_id, saleForm.purchased_session_count)}
</div>
</label>

                <label className="field">
                  <span>서비스 세션</span>
                  <input
                    type="number"
                    value={saleForm.service_session_count}
                    onChange={(e) => setSaleForm({ ...saleForm, service_session_count: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={saleForm.cash_receipt_issued}
                    onChange={(e) => setSaleForm({ ...saleForm, cash_receipt_issued: e.target.checked })}
                  />
                  <span>현금영수증 발행</span>
                </label>

                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={saleForm.is_vip}
                    onChange={(e) => setSaleForm({ ...saleForm, is_vip: e.target.checked })}
                  />
                  <span>VIP</span>
                </label>
              </div>

              <label className="field">
                <span>메모</span>
                <textarea rows="4" value={saleForm.memo} onChange={(e) => setSaleForm({ ...saleForm, memo: e.target.value })} />
              </label>

              <div className="inline-actions wrap">
  <button className="primary-btn" type="submit">
    {editingSaleId ? '매출 수정' : '매출 저장'}
  </button>

  <button type="button" className="secondary-btn" onClick={resetSaleForm}>
    초기화
  </button>

  <button
    type="button"
    className="secondary-btn"
    onClick={handleBackfillPastSalesXp}
  >
    이전 매출 XP 일괄 반영
  </button>
</div>
            </form>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesRecordSection('summary')}>
        <span>3. 월별 매출 요약</span>
        <strong>{salesRecordOpenSections.summary ? '−' : '+'}</strong>
      </button>

      {salesRecordOpenSections.summary && (
        <div className="sales-panel-body">
          <section className="card">
            <div className="section-head">
  <h3>월별 매출 요약</h3>

  <div className="inline-actions wrap">
  <button
    type="button"
    className="secondary-btn"
    onClick={() => rebuildSalesXpByMonth(saleMonth)}
  >
    {saleMonth} 매출 XP 재정산
  </button>

  <button
    type="button"
    className="secondary-btn"
    onClick={rebuildAllSalesXp}
  >
    전체 매출 XP 재정산
  </button>

  <button
    type="button"
    className="secondary-btn"
    onClick={() =>
      downloadCsv(`sales_${saleMonth}.csv`, [
        ['날짜', '회원', '프로그램', '금액', '결제방법', 'VIP'],
        ...filteredSales.map((sale) => [
          sale.sale_date || '',
          sale.members?.name || '',
          sale.programs?.name || '',
          sale.amount || 0,
          sale.payment_method || '',
          sale.is_vip ? 'Y' : 'N',
        ]),
      ])
    }
  >
    CSV
  </button>
</div>
</div>

            <div className="stats-grid">
              <div className="stat-card">
                <span>총 매출</span>
                <strong>{Number(salesStatsExtended.totalSales || 0).toLocaleString()}</strong>
              </div>
              <div className="stat-card">
                <span>등록 건수</span>
                <strong>{Number(salesStatsExtended.totalCount || 0).toLocaleString()}</strong>
              </div>
              <div className="stat-card">
                <span>VIP 결제 수</span>
                <strong>{Number(salesStatsExtended.vipCount || 0).toLocaleString()}</strong>
              </div>
            </div>

            <div className="detail-box">
              <p><strong>현금:</strong> {Number(salesSummary?.cash_sales || 0).toLocaleString()}</p>
              <p><strong>카드:</strong> {Number(salesSummary?.card_sales || 0).toLocaleString()}</p>
              <p><strong>이체:</strong> {Number(salesSummary?.transfer_sales || 0).toLocaleString()}</p>
              <p><strong>할부:</strong> {Number(salesSummary?.installment_sales || 0).toLocaleString()}</p>
              <p><strong>VIP 비율:</strong> {salesStatsExtended.vipRatio}%</p>
              <p><strong>자동 피드백:</strong> {getSalesAutoFeedback()}</p>
            </div>

            <div className="sub-card">
              <h3>프로그램별 매출</h3>
              <MiniBarChart data={salesStatsExtended.chartSource} />
            </div>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesRecordSection('list')}>
        <span>4. 매출 목록</span>
        <strong>{salesRecordOpenSections.list ? '−' : '+'}</strong>
      </button>

      {salesRecordOpenSections.list && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>매출 목록</h3>

            <div className="list-stack">
              {filteredSales.map((sale) => {
                const collapsed = collapsedSales[sale.id] ?? true
                return (
                  <div key={sale.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{sale.members?.name || '회원없음'} / {sale.programs?.name || '프로그램없음'}</strong>
                      <span className="pill">{sale.sale_date}</span>
                    </div>

                    <div className="compact-text">
                      간략히보기: {Number(sale.amount || 0).toLocaleString()}원 / {sale.payment_method}
                    </div>

                    <div className="inline-actions wrap">
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={() =>
                          setCollapsedSales((prev) => ({
                            ...prev,
                            [sale.id]: !collapsed,
                          }))
                        }
                      >
                        {collapsed ? '상세히보기' : '간략히보기'}
                      </button>

                      <button className="secondary-btn" type="button" onClick={() => handleSaleEdit(sale)}>
                        수정
                      </button>

                      <button className="danger-btn" type="button" onClick={() => handleSaleDelete(sale.id)}>
                        삭제
                      </button>
                    </div>

                    {!collapsed ? (
                      <div className="detail-box">
                        <p><strong>구매 세션:</strong> {sale.purchased_session_count || 0}</p>
                        <p><strong>서비스 세션:</strong> {sale.service_session_count || 0}</p>
                        <p><strong>메모:</strong> {sale.memo || '-'}</p>
                        <p><strong>VIP:</strong> {sale.is_vip ? '예' : '아니오'}</p>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </section>
  </div>
)}
      {activeTab === '세일즈일지' && (
  <div className="sales-page-modern">
    <section className="sales-hero">
      <div className="sales-hero-left">
        <div className="sales-hero-badge">SALES LOG</div>
        <h2>세일즈일지</h2>
        <p className="sales-hero-text">
          상담 흐름, 전환 가능성, 후속관리, 결과를 한 번에 기록하되
          입력 섹션을 나눠서 필요한 부분만 펼쳐 작성할 수 있는 세일즈 일지 화면입니다.
        </p>
      </div>

      <div className="sales-hero-right">
        <div className="sales-hero-mini">
          <span>전체 리드</span>
          <strong>{salesLogSummary.total}</strong>
          <p>현재 필터 기준 전체 일지 수</p>
        </div>

        <div className="sales-hero-mini">
          <span>전환 높음</span>
          <strong>{salesLogSummary.high}</strong>
          <p>전환 가능성 높음</p>
        </div>

        <div className="sales-hero-mini">
          <span>결제완료</span>
          <strong>{salesLogSummary.closed}</strong>
          <p>실제 결제 완료 건수</p>
        </div>

        <div className="sales-hero-mini">
          <span>후속관리중</span>
          <strong>{salesLogSummary.followup}</strong>
          <p>다시 접촉이 필요한 리드</p>
        </div>
      </div>
    </section>
    <details className="tab-usage-guide-card sales-log-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE SALES LOG</div>
          <strong>세일즈일지는 기록보다 해석이 더 중요한 탭입니다</strong>
          <p>
            상담 내용을 적는 곳에서 끝나는 게 아니라,
            누가 전환 가능성이 높고 누가 다시 접촉이 필요한지 정리하는 리드 관리 탭입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>상단 요약 먼저 보기 → 리드 상태를 먼저 파악합니다</strong>
              <p>
                전체 리드, 전환 높음, 결제완료, 후속관리중 숫자를 먼저 보면
                지금 신규 유입보다 후속관리가 더 급한지 바로 판단할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>기본 정보와 니즈를 정확히 적기 → 상담 품질이 쌓입니다</strong>
              <p>
                날짜, 시간, 담당 코치, 리드명, 문제 포인트, 니즈를 남겨야
                다음 상담 때 맥락을 잃지 않고 이어갈 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>상담 흐름 / 세일즈 방식 / 결과를 남기기 → 전환 패턴이 보입니다</strong>
              <p>
                어떤 방식에서 반응이 좋았고 어디서 막혔는지를 남겨야
                개인 감이 아니라 실제 전환 패턴으로 세일즈를 개선할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>후속관리 대상으로 분류 → 매출기록과 이어집니다</strong>
              <p>
                여기서 후속관리중으로 남는 리드를 제때 다시 잡아야
                나중에 매출기록의 결제완료로 이어지므로, 세일즈일지는 매출 전 단계 핵심 탭입니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            결제완료는 적은데 후속관리중이 많다면, 유입이 없는 게 아니라 마무리 전환이 약한 상태일 수 있으니
            다시 연락할 기준일, 제안 멘트, 체험 후 팔로업 속도를 먼저 손보면 됩니다.
          </p>
        </div>
      </div>
    </details>
    <div className="sales-summary-modern-grid">
      <div className="sales-summary-modern-card summary-blue">
        <span>전체 리드</span>
        <strong>{salesLogSummary.total}</strong>
        <p>현재 필터 기준</p>
      </div>

      <div className="sales-summary-modern-card summary-green">
        <span>전환 높음</span>
        <strong>{salesLogSummary.high}</strong>
        <p>전환 가능성 높음</p>
      </div>

      <div className="sales-summary-modern-card summary-violet">
        <span>결제완료</span>
        <strong>{salesLogSummary.closed}</strong>
        <p>실제 결제 완료</p>
      </div>

      <div className="sales-summary-modern-card summary-amber">
        <span>후속관리중</span>
        <strong>{salesLogSummary.followup}</strong>
        <p>재접촉 필요</p>
      </div>
    </div>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesLogSection('basic')}>
        <span>1. 기본 정보</span>
        <strong>{salesLogOpenSections.basic ? '−' : '+'}</strong>
      </button>

      {salesLogOpenSections.basic && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>기본 정보</h3>

            <div className="grid-2">
              <label className="field">
                <span>날짜</span>
                <input
                  type="date"
                  value={salesLogForm.log_date}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, log_date: e.target.value })}
                />
              </label>

              <label className="field">
                <span>시간</span>
                <input
                  type="time"
                  value={salesLogForm.activity_time}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, activity_time: e.target.value })}
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>담당 코치</span>
                <input
                  value={salesLogForm.coach_name}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, coach_name: e.target.value })}
                  placeholder="예: 임현진"
                />
              </label>

              <label className="field">
                <span>상담 대상 이름</span>
                <input
                  value={salesLogForm.lead_name}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, lead_name: e.target.value })}
                  placeholder="예: 김OO"
                />
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>연락처</span>
                <input
                  value={salesLogForm.phone}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, phone: e.target.value })}
                  placeholder="010-0000-0000"
                />
              </label>

              <label className="field">
                <span>연령대</span>
                <input
                  value={salesLogForm.age_group}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, age_group: e.target.value })}
                  placeholder="예: 30대"
                />
              </label>
            </div>

            <div className="grid-3">
              <label className="field">
                <span>성별</span>
                <select
                  value={salesLogForm.gender}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, gender: e.target.value })}
                >
                  <option value="">선택</option>
                  <option value="여성">여성</option>
                  <option value="남성">남성</option>
                </select>
              </label>

              <label className="field">
                <span>구분</span>
                <select
                  value={salesLogForm.member_type}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, member_type: e.target.value })}
                >
                  {salesMemberTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>유입경로</span>
                <select
                  value={salesLogForm.source_channel}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, source_channel: e.target.value })}
                >
                  <option value="">선택</option>
                  {salesSourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesLogSection('need')}>
        <span>2. 유입 / 니즈</span>
        <strong>{salesLogOpenSections.need ? '−' : '+'}</strong>
      </button>

      {salesLogOpenSections.need && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>유입 / 니즈</h3>

            <div className="grid-2">
              <label className="field">
                <span>OT 진행 이유</span>
                <select
                  value={salesLogForm.ot_reason}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, ot_reason: e.target.value })}
                >
                  <option value="">선택</option>
                  {salesOtReasonOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>상담 시작 계기</span>
                <input
                  value={salesLogForm.contact_reason}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, contact_reason: e.target.value })}
                  placeholder="예: 코치가 먼저 인사 후 대화 시작"
                />
              </label>
            </div>

            <label className="field">
              <span>핵심 니즈</span>
              <input
                value={salesLogForm.main_need}
                onChange={(e) => setSalesLogForm({ ...salesLogForm, main_need: e.target.value })}
                placeholder="예: 어깨 통증 + 체형 스트레스"
              />
            </label>

            <label className="field">
              <span>불편부위 / 문제 포인트</span>
              <textarea
                rows="3"
                value={salesLogForm.pain_point}
                onChange={(e) => setSalesLogForm({ ...salesLogForm, pain_point: e.target.value })}
              />
            </label>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesLogSection('consultation')}>
        <span>3. 상담 / OT 진행</span>
        <strong>{salesLogOpenSections.consultation ? '−' : '+'}</strong>
      </button>

      {salesLogOpenSections.consultation && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>상담 / OT 진행</h3>

            <div className="check-grid">
              {salesConsultationMethodOptions.map((option) => (
                <label key={option} className="checkbox-chip">
                  <input
                    type="checkbox"
                    checked={salesLogForm.consultation_method.includes(option)}
                    onChange={() => toggleSalesArrayValue('consultation_method', option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <label className="field">
              <span>실제 진행 흐름</span>
              <textarea
                rows="4"
                value={salesLogForm.consultation_flow}
                onChange={(e) => setSalesLogForm({ ...salesLogForm, consultation_flow: e.target.value })}
                placeholder="예: 인사 → 니즈 질문 → 체형 평가 → 운동 체험 → 프로그램 설명"
              />
            </label>

            <div className="grid-2">
              <label className="field">
                <span>회원 반응</span>
                <input
                  value={salesLogForm.reaction_summary}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, reaction_summary: e.target.value })}
                  placeholder="예: 질문 많았고 통증개선 니즈 높음"
                />
              </label>

              <label className="field">
                <span>감정 상태</span>
                <select
                  value={salesLogForm.emotion_status}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, emotion_status: e.target.value })}
                >
                  {salesEmotionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesLogSection('salesMethod')}>
        <span>4. 세일즈 방식</span>
        <strong>{salesLogOpenSections.salesMethod ? '−' : '+'}</strong>
      </button>

      {salesLogOpenSections.salesMethod && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>세일즈 방식</h3>

            <div className="check-grid">
              {salesMethodOptions.map((option) => (
                <label key={option} className="checkbox-chip">
                  <input
                    type="checkbox"
                    checked={salesLogForm.sales_method.includes(option)}
                    onChange={() => toggleSalesArrayValue('sales_method', option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesLogSection('result')}>
        <span>5. 결과 / 전환</span>
        <strong>{salesLogOpenSections.result ? '−' : '+'}</strong>
      </button>

      {salesLogOpenSections.result && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>결과 / 전환</h3>

            <div className="grid-3">
              <label className="field">
                <span>현재 단계</span>
                <select
                  value={salesLogForm.current_stage}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, current_stage: e.target.value })}
                >
                  {salesStageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>세일즈 결과</span>
                <select
                  value={salesLogForm.sales_result}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, sales_result: e.target.value })}
                >
                  {salesResultOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>전환 가능성</span>
                <select
                  value={salesLogForm.conversion_score}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, conversion_score: e.target.value })}
                >
                  {salesConversionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>제안 상품</span>
                <input
                  value={salesLogForm.proposal_product}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, proposal_product: e.target.value })}
                  placeholder="예: PT 20회 / 체형교정 프로그램"
                />
              </label>

              <label className="field">
                <span>안내 가격</span>
                <input
                  value={salesLogForm.proposal_price}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, proposal_price: e.target.value })}
                  placeholder="예: 55만원"
                />
              </label>
            </div>

            <label className="field">
              <span>결제 실패 / 보류 이유</span>
              <select
                value={salesLogForm.fail_reason}
                onChange={(e) => setSalesLogForm({ ...salesLogForm, fail_reason: e.target.value })}
              >
                <option value="">선택</option>
                {salesFailReasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesLogSection('followup')}>
        <span>6. 후속 관리</span>
        <strong>{salesLogOpenSections.followup ? '−' : '+'}</strong>
      </button>

      {salesLogOpenSections.followup && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>후속 관리</h3>

            <div className="grid-2">
              <label className="field">
                <span>다음 연락일</span>
                <input
                  type="date"
                  value={salesLogForm.next_contact_date}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, next_contact_date: e.target.value })}
                />
              </label>

              <label className="field">
                <span>결제 예상일</span>
                <input
                  type="date"
                  value={salesLogForm.expected_close_date}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, expected_close_date: e.target.value })}
                />
              </label>
            </div>

            <label className="field">
              <span>후속 액션</span>
              <textarea
                rows="3"
                value={salesLogForm.follow_up_action}
                onChange={(e) => setSalesLogForm({ ...salesLogForm, follow_up_action: e.target.value })}
                placeholder="예: 내일 문자 발송 / 운동영상 전달 / 재상담 예약"
              />
            </label>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesLogSection('legacy')}>
        <span>7. 기존 일지 항목</span>
        <strong>{salesLogOpenSections.legacy ? '−' : '+'}</strong>
      </button>

      {salesLogOpenSections.legacy && (
        <div className="sales-panel-body">
          <section className="card">
            <h3>기존 일지 항목</h3>

            <div className="grid-2">
              <label className="field">
                <span>OT 진행 인원</span>
                <input
                  type="number"
                  value={salesLogForm.ot_count}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, ot_count: e.target.value })}
                />
              </label>

              <label className="field">
                <span>인사 횟수</span>
                <input
                  type="number"
                  value={salesLogForm.greeting_count}
                  onChange={(e) => setSalesLogForm({ ...salesLogForm, greeting_count: e.target.value })}
                />
              </label>
            </div>

            <label className="field">
              <span>누구에게 인사했는지</span>
              <textarea
                rows="3"
                value={salesLogForm.greeted_to}
                onChange={(e) => setSalesLogForm({ ...salesLogForm, greeted_to: e.target.value })}
                placeholder="예: 신규 상담 1명, 워크인 2명, 기존회원 3명"
              />
            </label>

            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={salesLogForm.greeted_three_plus}
                onChange={(e) => setSalesLogForm({ ...salesLogForm, greeted_three_plus: e.target.checked })}
              />
              <span>하루 3명 이상 인사함</span>
            </label>

            <label className="field">
              <span>세일즈 메모</span>
              <textarea
                rows="5"
                value={salesLogForm.diary}
                onChange={(e) => setSalesLogForm({ ...salesLogForm, diary: e.target.value })}
                placeholder="오늘 상담 흐름, 걸렸던 포인트, 다음에 보완할 점"
              />
            </label>

            <div className="inline-actions wrap">
              <button className="primary-btn" type="submit" onClick={handleSalesLogSubmit}>
                {editingSalesLogId ? '세일즈 일지 수정' : '세일즈 일지 저장'}
              </button>
              <button type="button" className="secondary-btn" onClick={resetSalesLogForm}>
                초기화
              </button>
            </div>
          </section>
        </div>
      )}
    </section>

    <section className="sales-panel-modern">
      <button type="button" className="sales-panel-toggle" onClick={() => toggleSalesLogSection('list')}>
        <span>8. 세일즈 일지 목록</span>
        <strong>{salesLogOpenSections.list ? '−' : '+'}</strong>
      </button>

      {salesLogOpenSections.list && (
        <div className="sales-panel-body">
          <section className="card">
            <div className="member-list-header">
              <h3>세일즈 일지 목록</h3>

              <div className="member-list-search-area">
                <input
                  placeholder="이름 / 연락처 / 니즈 / 메모 검색"
                  value={salesLogSearch}
                  onChange={(e) => setSalesLogSearch(e.target.value)}
                />

                <div className="member-list-filter-row">
                  <input
                    type="month"
                    value={salesLogMonth}
                    onChange={(e) => setSalesLogMonth(e.target.value)}
                  />

                  <select
                    value={salesLogStageFilter}
                    onChange={(e) => setSalesLogStageFilter(e.target.value)}
                  >
                    <option value="all">전체 단계</option>
                    {salesStageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="member-list-filter-row">
                  <select
                    value={salesLogResultFilter}
                    onChange={(e) => setSalesLogResultFilter(e.target.value)}
                  >
                    <option value="all">전체 결과</option>
                    {salesResultOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={salesLogConversionFilter}
                    onChange={(e) => setSalesLogConversionFilter(e.target.value)}
                  >
                    <option value="all">전체 가능성</option>
                    {salesConversionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid-4">
              <div className="mini-stat-card">
                <strong>{salesLogSummary.total}</strong>
                <span>전체 리드</span>
              </div>
              <div className="mini-stat-card">
                <strong>{salesLogSummary.high}</strong>
                <span>전환 높음</span>
              </div>
              <div className="mini-stat-card">
                <strong>{salesLogSummary.closed}</strong>
                <span>결제완료</span>
              </div>
              <div className="mini-stat-card">
                <strong>{salesLogSummary.followup}</strong>
                <span>후속관리중</span>
              </div>
            </div>

            <div className="list-stack">
              {groupedSalesLogs.length === 0 ? (
                <div className="workout-list-empty">세일즈 일지가 없습니다.</div>
              ) : null}

              {groupedSalesLogs.map(([date, logs]) => (
                <div key={date} className="sales-log-date-group">
                  <div className="sales-log-date-title">{date}</div>

                  <div className="list-stack">
                    {logs.map((log) => (
                      <div key={log.id} className="list-card">
                        <div className="list-card-head">
                          <div>
                            <strong>{log.activity_time || '시간없음'} · {log.lead_name || '이름없음'}</strong>
                            <p className="sub-text">
                              {log.phone || '-'} / {log.source_channel || '-'} / {log.coach_name || '-'}
                            </p>
                          </div>

                          <div className="inline-actions wrap">
                            <button
                              type="button"
                              className="secondary-btn"
                              onClick={() =>
                                setCollapsedSalesLogs((prev) => ({ ...prev, [log.id]: !prev[log.id] }))
                              }
                            >
                              {collapsedSalesLogs[log.id] ? '상세보기' : '간략보기'}
                            </button>
                            <button type="button" className="secondary-btn" onClick={() => handleSalesLogEdit(log)}>
                              수정
                            </button>
                            <button type="button" className="danger-btn" onClick={() => handleSalesLogDelete(log.id)}>
                              삭제
                            </button>
                          </div>
                        </div>

                        <p className="sub-text">
                          핵심니즈: {log.main_need || '-'} / 단계: {log.current_stage || '-'} / 결과: {log.sales_result || '-'} / 전환: {log.conversion_score || '-'}
                        </p>

                        {!collapsedSalesLogs[log.id] ? (
                          <div className="detail-box">
                            <p><strong>상담 계기:</strong> {log.contact_reason || '-'}</p>
                            <p><strong>OT 이유:</strong> {log.ot_reason || '-'}</p>
                            <p><strong>불편부위:</strong> {log.pain_point || '-'}</p>
                            <p><strong>회원 반응:</strong> {log.reaction_summary || '-'}</p>
                            <p><strong>감정 상태:</strong> {log.emotion_status || '-'}</p>
                            <p><strong>제안 상품:</strong> {log.proposal_product || '-'}</p>
                            <p><strong>안내 가격:</strong> {log.proposal_price || '-'}</p>
                            <p><strong>보류 이유:</strong> {log.fail_reason || '-'}</p>
                            <p><strong>다음 연락일:</strong> {log.next_contact_date || '-'}</p>
                            <p><strong>결제 예상일:</strong> {log.expected_close_date || '-'}</p>
                            <p><strong>후속 액션:</strong> {log.follow_up_action || '-'}</p>
                            <p><strong>진행 흐름:</strong> {log.consultation_flow || '-'}</p>
                            <p><strong>상담 방식:</strong> {Array.isArray(log.consultation_method) ? log.consultation_method.join(', ') : '-'}</p>
                            <p><strong>세일즈 방식:</strong> {Array.isArray(log.sales_method) ? log.sales_method.join(', ') : '-'}</p>
                            <p><strong>OT 인원:</strong> {log.ot_count || 0}</p>
                            <p><strong>인사 횟수:</strong> {log.greeting_count || 0}</p>
                            <p><strong>인사 대상:</strong> {log.greeted_to || '-'}</p>
                            <p><strong>메모:</strong> {log.diary || '-'}</p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  </div>
)}
      
{activeTab === '코치관리' && (
  <section className="coach-page-modern">
    <section className="coach-hero">
      <div className="coach-hero-left">
        <div className="coach-hero-badge">COACH MANAGEMENT</div>
        <h2>코치관리</h2>
        <p className="coach-hero-text">
          코치 상태 입력만 하는 화면이 아니라, 이번 달 코치 운영 상태를 먼저 보고
          필요한 기록만 펼쳐서 입력하는 관리 화면입니다.
        </p>
      </div>

      <div className="coach-hero-right">
        <div className="coach-hero-mini">
          <span>이번 달 기록 수</span>
          <strong>{filteredCoachConditions.length}</strong>
          <p>현재 선택 조건 기준 코치 기록 수</p>
        </div>

        <div className="coach-hero-mini">
          <span>평균 컨디션</span>
          <strong>{Number(coachConditionSummary.avgCondition || 0).toFixed(1)}</strong>
          <p>집중도 {Number(coachConditionSummary.avgFocus || 0).toFixed(1)} / 피로도 {Number(coachConditionSummary.avgFatigue || 0).toFixed(1)}</p>
        </div>

        <div className="coach-hero-mini">
          <span>평균 행동 점수</span>
          <strong>{Number(coachDashboardSummary.avgPerformance || 0).toFixed(1)}</strong>
          <p>현재 운영 레벨 {coachDashboardSummary.statusLabel || '-'}</p>
        </div>

        <div className="coach-hero-mini">
          <span>주의 필요 코치</span>
          <strong>{uniqueAlertCoaches.length}</strong>
          <p>피로도, 스트레스, 집중도, 행동 점수 기준</p>
        </div>
      </div>
    </section>
    <details className="tab-usage-guide-card coach-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE COACH MANAGEMENT</div>
          <strong>코치관리는 이렇게 보고, 이렇게 입력합니다</strong>
          <p>
            컨디션만 적는 화면이 아니라 이번 달 운영 상태를 먼저 보고,
            자기관리와 운영 관리를 연결해서 기록하는 탭입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>월간 필터 먼저 확인 → 이번 달 상태를 먼저 봅니다</strong>
              <p>
                평균 컨디션, 행동 점수, 주의 필요 코치를 먼저 보면
                지금 입력이 필요한 달인지, 이미 위험 신호가 있는지 먼저 판단할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>체크리스트 입력 → 감정이 아니라 기준으로 기록됩니다</strong>
              <p>
                컨디션, 피로도, 스트레스, 집중도를 체크하면
                막연한 기분 기록이 아니라 비교 가능한 운영 데이터로 남습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>번아웃 / 성과 행동 같이 보기 → 자기성찰이 현실화됩니다</strong>
              <p>
                힘든 이유와 실제 행동 점수를 같이 보면
                단순히 힘들다에서 끝나지 않고, 회복이 필요한지 실행력이 떨어진 건지 구분할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>자동 계산 결과 저장 → 운영대시보드 / 리포트와 연결됩니다</strong>
              <p>
                저장된 기록은 이후 주의 코치, 평균 상태, 월간 리포트 해석 기준이 되므로
                내 상태 기록이 곧 운영 판단 데이터가 됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            피로도와 스트레스가 높은데 행동 점수까지 낮으면,
            오늘은 세일즈 압박을 더 거는 날이 아니라 수업 밀도 조정, 회복, 우선순위 재정리가 먼저인 날로 보면 됩니다.
          </p>
        </div>
      </div>
    </details>
    <div className="coach-summary-modern-grid">
      <div className="coach-summary-modern-card summary-blue">
        <span>이번 달 기록 수</span>
        <strong>{filteredCoachConditions.length}</strong>
        <p>현재 조회된 코치 기록 수</p>
      </div>

      <div className="coach-summary-modern-card summary-green">
        <span>평균 컨디션</span>
        <strong>{Number(coachConditionSummary.avgCondition || 0).toFixed(1)}</strong>
        <p>집중도 {Number(coachConditionSummary.avgFocus || 0).toFixed(1)}</p>
      </div>

      <div className="coach-summary-modern-card summary-violet">
        <span>평균 행동 점수</span>
        <strong>{Number(coachDashboardSummary.avgPerformance || 0).toFixed(1)}</strong>
        <p>{coachDashboardSummary.statusLabel || '-'}</p>
      </div>

      <div className="coach-summary-modern-card summary-amber">
        <span>주의 필요 코치</span>
        <strong>{uniqueAlertCoaches.length}</strong>
        <p>우선 확인 대상</p>
      </div>
    </div>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleCoachManageSection('filters')}>
        <span>1. 월간 필터 / 자동 피드백</span>
        <strong>{coachManageOpenSections.filters ? '−' : '+'}</strong>
      </button>

      {coachManageOpenSections.filters && (
        <div className="coach-panel-body">
          <div className="report-grid">
            <div className="card">
              <h3>월간 필터</h3>
              <div className="form-row">
                <label className="field">
                  <span>기준 월</span>
                  <input
                    type="month"
                    value={coachConditionMonth}
                    onChange={(e) => setCoachConditionMonth(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>코치 선택</span>
                  <select
                    value={coachConditionCoachFilter}
                    onChange={(e) => setCoachConditionCoachFilter(e.target.value)}
                  >
                    <option value="">전체 코치</option>
                    {coaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="report-feedback-card">
                {getCoachConditionAutoFeedback()}
              </div>
            </div>

            <div className="card">
              <h3>주의 필요 코치</h3>
              {uniqueAlertCoaches.length === 0 ? (
                <div className="compact-text">현재 주의 필요 코치가 없습니다.</div>
              ) : (
                <div className="list-stack">
                  {uniqueAlertCoaches.map((item) => (
                    <div key={item.id} className="list-card">
                      <div className="list-card-top">
                        <strong>{item.coaches?.name || '이름 없음'}</strong>
                        <span className="pill">주의</span>
                      </div>
                      <div className="compact-text">{item.reasons.join(', ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleCoachManageSection('input')}>
        <span>2. 기본 입력 정보</span>
        <strong>{coachManageOpenSections.input ? '−' : '+'}</strong>
      </button>

      {coachManageOpenSections.input && (
        <div className="coach-panel-body">
          <div className="card">
            <h3>{editingCoachConditionId ? '코치 상태 수정' : '코치 상태 입력'}</h3>

            <div className="form-row">
              <label className="field">
                <span>코치</span>
                <select
                  value={coachConditionForm.coach_id}
                  onChange={(e) => {
                    const value = e.target.value

                    setCoachConditionForm((prev) => ({
                      ...prev,
                      coach_id: value,
                    }))

                    setCoachGoalForm((prev) => ({
                      ...prev,
                      coach_id: value,
                    }))
                  }}
                >
                  <option value="">코치 선택</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>기준 월</span>
                <input
                  type="month"
                  value={coachConditionForm.check_month}
                  onChange={(e) => {
                    const value = e.target.value

                    setCoachConditionForm((prev) => ({
                      ...prev,
                      check_month: value,
                    }))

                    setCoachGoalForm((prev) => ({
                      ...prev,
                      goal_month: value,
                    }))
                  }}
                />
              </label>
            </div>

            <div className="compact-text">
              숫자를 직접 입력하는 방식이 아니라, 아래 체크리스트를 선택하면 점수가 자동 계산됩니다.
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleCoachManageSection('checklist')}>
        <span>3. 상태 체크리스트</span>
        <strong>{coachManageOpenSections.checklist ? '−' : '+'}</strong>
      </button>

      {coachManageOpenSections.checklist && (
        <div className="coach-panel-body">
          <div className="card">
            <h3>상태 체크리스트</h3>

            <div className="stack-gap">
              <div className="stack-gap">
                <div>
                  <strong>컨디션</strong>
                  {CONDITION_CHECKLIST.map((item) => (
                    <label key={item} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={(coachConditionForm.condition_checks || []).includes(item)}
                        onChange={() => toggleChecklistItem('condition_checks', item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>

                <label className="field">
                  <span>왜 몸 상태가 이런지 적어주세요</span>
                  <textarea
                    rows="3"
                    placeholder="예: 감기 기운, 수면 부족, 몸살 느낌, 허리/목 불편함 등"
                    value={coachConditionForm.condition_note || ''}
                    onChange={(e) =>
                      setCoachConditionForm((prev) => ({
                        ...prev,
                        condition_note: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="stack-gap">
                <div>
                  <strong>피로도</strong>
                  {FATIGUE_CHECKLIST.map((item) => (
                    <label key={item} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={(coachConditionForm.fatigue_checks || []).includes(item)}
                        onChange={() => toggleChecklistItem('fatigue_checks', item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>

                <label className="field">
                  <span>피로한 이유를 적어주세요</span>
                  <textarea
                    rows="3"
                    placeholder="예: 수업이 몰림, 잠 부족, 회복 부족, 이동 많음 등"
                    value={coachConditionForm.fatigue_note || ''}
                    onChange={(e) =>
                      setCoachConditionForm((prev) => ({
                        ...prev,
                        fatigue_note: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="stack-gap">
                <div>
                  <strong>스트레스</strong>
                  {STRESS_CHECKLIST.map((item) => (
                    <label key={item} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={(coachConditionForm.stress_checks || []).includes(item)}
                        onChange={() => toggleChecklistItem('stress_checks', item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>

                <label className="field">
                  <span>스트레스 이유를 적어주세요</span>
                  <textarea
                    rows="3"
                    placeholder="예: 회원 응대, 세일즈 압박, 개인 일정, 운영 고민 등"
                    value={coachConditionForm.stress_note || ''}
                    onChange={(e) =>
                      setCoachConditionForm((prev) => ({
                        ...prev,
                        stress_note: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="stack-gap">
                <div>
                  <strong>집중도</strong>
                  {FOCUS_CHECKLIST.map((item) => (
                    <label key={item} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={(coachConditionForm.focus_checks || []).includes(item)}
                        onChange={() => toggleChecklistItem('focus_checks', item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>

                <label className="field">
                  <span>집중 상태에 영향을 준 이유</span>
                  <textarea
                    rows="3"
                    placeholder="예: 잠 부족, 머리가 복잡함, 컨디션 저하, 외부 일정 등"
                    value={coachConditionForm.focus_note || ''}
                    onChange={(e) =>
                      setCoachConditionForm((prev) => ({
                        ...prev,
                        focus_note: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleCoachManageSection('burnout')}>
        <span>4. 번아웃 체크</span>
        <strong>{coachManageOpenSections.burnout ? '−' : '+'}</strong>
      </button>

      {coachManageOpenSections.burnout && (
        <div className="coach-panel-body">
          <div className="card">
            <h3>번아웃 여부 확인</h3>
            <p className="sub-text">
              최근 상태가 단순 피로인지, 번아웃 신호인지 먼저 확인합니다.
            </p>

            <div className="checklist-grid">
              {[
                '수업 전부터 부담감이 느껴진다',
                '회원 응대가 버겁게 느껴진다',
                '코칭이 자연스럽게 나오지 않는다',
                '쉬어도 피로가 회복되지 않는다',
                '일 시작 전부터 지치는 느낌이 있다',
              ].map((item) => (
                <label key={item} className="check-chip">
                  <input
                    type="checkbox"
                    checked={burnoutSignalChecks.includes(item)}
                    onChange={() => toggleBurnoutSignalItem(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            <label className="field">
              <span>요즘 가장 힘든 일이나 버거운 상황</span>
              <textarea
                rows="4"
                placeholder="예: 회원 응대가 버겁다 / 세일즈 압박이 부담된다 / 수업은 많은데 회복 시간이 부족하다"
                value={coachConditionForm.burnout_note || ''}
                onChange={(e) =>
                  setCoachConditionForm((prev) => ({
                    ...prev,
                    burnout_note: e.target.value,
                  }))
                }
              />
            </label>

            <div className="detail-box" style={{ marginTop: '12px' }}>
              <p><strong>현재 상태:</strong> {getBurnoutSignalText(burnoutSignalChecks)}</p>
            </div>
          </div>

          {burnoutSignalChecks.length >= 2 && (
            <div className="card">
              <div className="section-head">
                <div>
                  <h3>번아웃 회복 체크</h3>
                  <p className="sub-text">
                    잘하고 있는데 피로가 쌓일 때 가볍게 확인하는 체크입니다.
                    번아웃이 아니라면 체크하지 않으셔도 됩니다 🙂
                  </p>
                </div>
              </div>

              <div className="detail-box">
                {BURNOUT_RELIEF_GUIDE.map((text) => (
                  <p key={text} className="compact-text">{text}</p>
                ))}
              </div>

              <div className="checklist-grid">
                {BURNOUT_RECOVERY_CHECKLIST.map((item) => (
                  <label key={item} className="check-chip">
                    <input
                      type="checkbox"
                      checked={burnoutRecoveryChecks.includes(item)}
                      onChange={() => toggleBurnoutRecoveryItem(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <div className="detail-box" style={{ marginTop: '12px' }}>
                <p><strong>현재 체크 수:</strong> {getBurnoutRecoveryCount(burnoutRecoveryChecks)}개</p>
                <p><strong>해석:</strong> {getBurnoutRecoveryComment(burnoutRecoveryChecks)}</p>
              </div>

              <div className="detail-box" style={{ marginTop: '12px' }}>
                <p><strong>조치 체크리스트</strong></p>
                {BURNOUT_RESPONSE_CHECKLIST.map((item) => (
                  <p key={item} className="compact-text">- {item}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleCoachManageSection('performance')}>
        <span>5. 성과 행동 체크</span>
        <strong>{coachManageOpenSections.performance ? '−' : '+'}</strong>
      </button>

      {coachManageOpenSections.performance && (
        <div className="coach-panel-body">
          <div className="card">
            <h3>성과 행동 체크리스트</h3>

            <div className="stack-gap">
              {PERFORMANCE_ACTION_SECTIONS.map((section) => (
                <div key={section.key} className="list-card">
                  <div className="list-card-top">
                    <strong>{section.title}</strong>
                    <span className="pill">{(coachConditionForm[section.key] || []).length}개</span>
                  </div>

                  {section.items.map((item) => (
                    <label key={item} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={(coachConditionForm[section.key] || []).includes(item)}
                        onChange={() => toggleChecklistItem(section.key, item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <label className="field">
              <span>오늘 전체 상태 한 줄 메모</span>
              <textarea
                rows="4"
                placeholder="예: 감기 기운 때문에 수업은 가능하지만 말 많이 하는 건 버거움 / 오늘은 무리하지 않고 유지가 목표"
                value={coachConditionForm.today_comment || ''}
                onChange={(e) =>
                  setCoachConditionForm((prev) => ({
                    ...prev,
                    today_comment: e.target.value,
                  }))
                }
              />
            </label>
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleCoachManageSection('result')}>
        <span>6. 자동 계산 결과</span>
        <strong>{coachManageOpenSections.result ? '−' : '+'}</strong>
      </button>

      {coachManageOpenSections.result && (
        <div className="coach-panel-body">
          <div className="report-grid">
            <div className="card">
              <h3>자동 계산 결과</h3>
              <p>컨디션: {coachConditionForm.condition_score}</p>
              <p>피로도: {coachConditionForm.fatigue_score}</p>
              <p>스트레스: {coachConditionForm.stress_score}</p>
              <p>집중도: {coachConditionForm.focus_score}</p>
              <p>성과 행동 점수: {coachConditionForm.performance_score}</p>
              <p>성과 행동 레벨: {coachConditionForm.performance_level || getPerformanceLevel(coachConditionForm.performance_score)}</p>
              <p>
                상태 레벨:{' '}
                {COACH_LEVEL_META[
                  coachConditionForm.status_level ||
                    getCoachStatusLevelKey({
                      conditionScore: coachConditionForm.condition_score,
                      fatigueScore: coachConditionForm.fatigue_score,
                      stressScore: coachConditionForm.stress_score,
                      focusScore: coachConditionForm.focus_score,
                    })
                ]?.label || '-'}
              </p>
              <p>
                자동 해석:{' '}
                {getCoachStatusText({
                  conditionScore: coachConditionForm.condition_score,
                  fatigueScore: coachConditionForm.fatigue_score,
                  stressScore: coachConditionForm.stress_score,
                  focusScore: coachConditionForm.focus_score,
                  performanceScore: coachConditionForm.performance_score,
                })}
              </p>
              <div className="compact-text">
                회복 안내: 번아웃이 아니라면 체크하지 않으셔도 됩니다. 피로가 올라오는 시기에만 가볍게 확인하세요.
              </div>
            </div>

            <div className="card">
              <h3>저장 액션</h3>
              <div className="inline-actions wrap">
                <button className="primary-btn" type="button" onClick={handleCoachConditionSubmit}>
                  {editingCoachConditionId ? '코치관리 수정 저장' : '코치관리 저장'}
                </button>
                <button className="secondary-btn" type="button" onClick={resetCoachConditionForm}>
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleCoachManageSection('goals')}>
        <span>7. 이번 달 목표 설정</span>
        <strong>{coachManageOpenSections.goals ? '−' : '+'}</strong>
      </button>

      {coachManageOpenSections.goals && (
        <div className="coach-panel-body">
          <div className="card">
            <h3>이번 달 목표 설정</h3>
            <p className="sub-text">
              이번 달 기준 목표만 따로 적어두는 영역입니다. 오늘 컨디션 기록과는 별도로 저장됩니다.
            </p>

            <div className="form-row">
              <input
                type="number"
                placeholder="월 매출 목표"
                value={coachGoalForm.monthly_goal_revenue}
                onChange={(e) =>
                  setCoachGoalForm((prev) => ({
                    ...prev,
                    monthly_goal_revenue: e.target.value,
                  }))
                }
              />
              <input
                type="number"
                placeholder="신규 상담 목표"
                value={coachGoalForm.monthly_goal_new_leads}
                onChange={(e) =>
                  setCoachGoalForm((prev) => ({
                    ...prev,
                    monthly_goal_new_leads: e.target.value,
                  }))
                }
              />
              <input
                type="number"
                placeholder="회원 유지 목표"
                value={coachGoalForm.monthly_goal_retention}
                onChange={(e) =>
                  setCoachGoalForm((prev) => ({
                    ...prev,
                    monthly_goal_retention: e.target.value,
                  }))
                }
              />
              <input
                type="number"
                placeholder="콘텐츠 업로드 목표"
                value={coachGoalForm.monthly_goal_content}
                onChange={(e) =>
                  setCoachGoalForm((prev) => ({
                    ...prev,
                    monthly_goal_content: e.target.value,
                  }))
                }
              />
            </div>

            <label className="field">
              <span>지원이 필요한 부분</span>
              <textarea
                rows="4"
                value={coachGoalForm.support_needed}
                onChange={(e) =>
                  setCoachGoalForm((prev) => ({
                    ...prev,
                    support_needed: e.target.value,
                  }))
                }
              />
            </label>

            <div className="inline-actions wrap">
              <button className="secondary-btn" type="button">
                이번 달 목표 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleCoachManageSection('records')}>
        <span>8. 저장된 코치 기록</span>
        <strong>{coachManageOpenSections.records ? '−' : '+'}</strong>
      </button>

      {coachManageOpenSections.records && (
        <div className="coach-panel-body">
          <div className="card">
            <div className="section-head">
              <h3>저장된 코치 기록</h3>
              <div className="compact-text">
                {coachConditionMonth || '전체 월'} / {coachConditionCoachFilter ? '선택 코치만' : '전체 코치'}
              </div>
            </div>

            {filteredCoachConditions.length === 0 ? (
              <div className="workout-list-empty">등록된 코치 기록이 없습니다.</div>
            ) : (
              <div className="list-stack">
                {filteredCoachConditions.map((item) => (
                  <div key={item.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{item.coaches?.name || '-'}</strong>
                      <span className="pill">{item.check_month || '-'}</span>
                    </div>

                    <div className="compact-text">
                      상태레벨 {COACH_LEVEL_META[item.status_level]?.label || '-'} / 행동점수 {item.performance_score || 0}점 / 행동레벨 {item.performance_level || '-'}
                    </div>

                    <div className="compact-text">
                      컨디션 {item.condition_score || 0} / 피로도 {item.fatigue_score || 0} / 스트레스 {item.stress_score || 0} / 집중도 {item.focus_score || 0}
                    </div>

                    <div className="inline-actions wrap" style={{ marginTop: '8px' }}>
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={() => toggleCoachConditionCollapse(item.id)}
                      >
                        {collapsedCoachConditions[item.id] ? '상세히 보기' : '간략히 보기'}
                      </button>
                    </div>

                    {!collapsedCoachConditions[item.id] && (
                      <>
                        <div className="compact-text">
                          자동 해석:{' '}
                          {getCoachStatusText({
                            conditionScore: item.condition_score,
                            fatigueScore: item.fatigue_score,
                            stressScore: item.stress_score,
                            focusScore: item.focus_score,
                            performanceScore: item.performance_score,
                          })}
                        </div>

                        <div className="compact-text">
                          안내: 번아웃이 아니라면 체크하지 않으셔도 됩니다. 피로가 올라오는 시기에만 가볍게 확인해주세요.
                        </div>

                        {item.condition_checks?.length ? (
                          <div className="compact-text">컨디션 체크: {item.condition_checks.join(', ')}</div>
                        ) : null}

                        {item.fatigue_checks?.length ? (
                          <div className="compact-text">피로 체크: {item.fatigue_checks.join(', ')}</div>
                        ) : null}

                        {item.stress_checks?.length ? (
                          <div className="compact-text">스트레스 체크: {item.stress_checks.join(', ')}</div>
                        ) : null}

                        {item.focus_checks?.length ? (
                          <div className="compact-text">집중도 체크: {item.focus_checks.join(', ')}</div>
                        ) : null}
                      </>
                    )}

                    <div className="inline-actions wrap">
                      <button className="secondary-btn" type="button" onClick={() => handleCoachConditionEdit(item)}>
                        수정
                      </button>
                      <button className="danger-btn" type="button" onClick={() => handleCoachConditionDelete(item.id)}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  </section>
)}
      {activeTab === '리포트' && (
  <section className="coach-page-modern">
    <section className="coach-hero">
      <div className="coach-hero-left">
        <div className="coach-hero-badge">MONTHLY REPORT</div>
        <h2>리포트</h2>
        <p className="coach-hero-text">
          평균값만 보는 화면이 아니라, 이번 달 코치 운영 상태와 평가를 같이 보고
          필요한 영역만 펼쳐서 확인하는 리포트 화면입니다.
        </p>
      </div>

      <div className="coach-hero-right">
        <div className="coach-hero-mini">
          <span>평균 컨디션</span>
          <strong>{Number(coachConditionSummary.avgCondition || 0).toFixed(1)}</strong>
          <p>집중도 {Number(coachConditionSummary.avgFocus || 0).toFixed(1)} / 피로도 {Number(coachConditionSummary.avgFatigue || 0).toFixed(1)}</p>
        </div>

        <div className="coach-hero-mini">
          <span>평균 행동 점수</span>
          <strong>{Number(coachDashboardSummary.avgPerformance || 0).toFixed(1)}</strong>
          <p>운영 레벨 {coachDashboardSummary.statusLabel || '-'}</p>
        </div>

        <div className="coach-hero-mini">
          <span>주의 필요 코치</span>
          <strong>{uniqueAlertCoaches.length}</strong>
          <p>주의 코치 우선 확인 필요</p>
        </div>

        <div className="coach-hero-mini">
          <span>평가 기록 수</span>
          <strong>{filteredCoachReviews.length}</strong>
          <p>이번 조건에 맞는 월간 평가 기록 수</p>
        </div>
      </div>
    </section>
    <details className="tab-usage-guide-card report-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO READ THIS REPORT</div>
          <strong>리포트는 결과를 읽고 다음 액션을 정하는 탭입니다</strong>
          <p>
            평균 숫자를 확인하는 데서 끝나는 화면이 아니라,
            코치 상태, 목표 대비 실제, 주의 대상, 다음 조치를 정하는 월간 해석 화면입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>평균값 확인 → 팀 전체 흐름을 먼저 읽습니다</strong>
              <p>
                평균 컨디션, 평균 행동 점수, 주의 코치 수를 먼저 보면
                이번 달이 전체적으로 안정적인지, 무너지는 구간인지 큰 흐름부터 판단할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>목표 vs 실제 비교 → 운영과 매출 연결 상태를 봅니다</strong>
              <p>
                목표 매출, 신규 상담, 유지 목표와 실제값을 비교하면
                문제의 원인이 컨디션인지, 세일즈인지, 후속관리 부족인지 더 정확히 볼 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>주의 필요 코치 / 비교 보기 → 누구를 먼저 챙길지 정합니다</strong>
              <p>
                전체 평균보다 개별 코치 상태가 무너진 사람이 있으면
                교육, 일정 조정, 피드백, 목표 재설정 우선순위를 바로 정할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>다음 액션 제안 활용 → 다음 달 운영 기준으로 넘깁니다</strong>
              <p>
                여기서 끝내지 말고, 코치관리의 목표 설정과 운영대시보드의 주의 흐름,
                매출기록/세일즈일지 후속관리까지 연결해서 실제 액션으로 바꿔야 합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            평균 상태는 무난한데 실제 결제 완료 수가 목표보다 낮고 후속관리가 많다면,
            문제는 컨디션보다 상담 전환 구조일 가능성이 높으니 세일즈 멘트, 후속관리 속도, 재접촉 루틴을 먼저 손보는 게 맞습니다.
          </p>
        </div>
      </div>
    </details>
    <div className="coach-summary-modern-grid">
      <div className="coach-summary-modern-card summary-blue">
        <span>평균 컨디션</span>
        <strong>{Number(coachConditionSummary.avgCondition || 0).toFixed(1)}</strong>
        <p>이번 달 평균 상태</p>
      </div>

      <div className="coach-summary-modern-card summary-green">
        <span>평균 행동 점수</span>
        <strong>{Number(coachDashboardSummary.avgPerformance || 0).toFixed(1)}</strong>
        <p>{coachDashboardSummary.statusLabel || '-'}</p>
      </div>

      <div className="coach-summary-modern-card summary-amber">
        <span>주의 필요 코치</span>
        <strong>{uniqueAlertCoaches.length}</strong>
        <p>우선 확인 필요</p>
      </div>

      <div className="coach-summary-modern-card summary-violet">
        <span>평가 기록 수</span>
        <strong>{filteredCoachReviews.length}</strong>
        <p>현재 필터 기준</p>
      </div>
    </div>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleReportSection('filters')}>
        <span>1. 리포트 필터</span>
        <strong>{reportOpenSections.filters ? '−' : '+'}</strong>
      </button>

      {reportOpenSections.filters && (
        <div className="coach-panel-body">
          <div className="report-grid">
            <div className="card">
              <h3>리포트 필터</h3>
              <div className="form-row">
                <label className="field">
                  <span>리포트 기준 월</span>
                  <input
                    type="month"
                    value={coachConditionMonth}
                    onChange={(e) => setCoachConditionMonth(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>코치 필터</span>
                  <select
                    value={coachConditionCoachFilter}
                    onChange={(e) => setCoachConditionCoachFilter(e.target.value)}
                  >
                    <option value="">전체 코치</option>
                    {coaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="report-feedback-card">
                {coachDashboardSummary.statusText || '-'}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleReportSection('actions')}>
        <span>2. 다음 액션 제안</span>
        <strong>{reportOpenSections.actions ? '−' : '+'}</strong>
      </button>

      {reportOpenSections.actions && (
        <div className="coach-panel-body">
          <div className="card">
            <h3>다음 액션 제안</h3>
            <div className="list-stack">
              <div className="report-feedback-card">{getCoachConditionAutoFeedback()}</div>
              <div className="report-feedback-card">{getSalesAutoFeedback()}</div>
              <div className="report-feedback-card">
                {coachAlertList.length >= 2
                  ? '주의 필요 코치가 여러 명이므로 전체 평균보다 개별 코치 상태를 먼저 확인하세요.'
                  : '현재는 평균 흐름과 개별 코치 상태를 같이 보는 정도면 충분합니다.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleReportSection('summary')}>
        <span>3. 월간 상태 요약</span>
        <strong>{reportOpenSections.summary ? '−' : '+'}</strong>
      </button>

      {reportOpenSections.summary && (
        <div className="coach-panel-body">
          <div className="report-grid">
            <div className="card">
              <h3>월간 상태 요약</h3>
              <p>평균 컨디션: {Number(coachConditionSummary.avgCondition || 0).toFixed(1)}</p>
              <p>평균 피로도: {Number(coachConditionSummary.avgFatigue || 0).toFixed(1)}</p>
              <p>평균 스트레스: {Number(coachConditionSummary.avgStress || 0).toFixed(1)}</p>
              <p>평균 집중도: {Number(coachConditionSummary.avgFocus || 0).toFixed(1)}</p>
              <p>평균 성과 행동 점수: {Number(coachDashboardSummary.avgPerformance || 0).toFixed(1)}</p>
              <p>현재 운영 레벨: {coachDashboardSummary.statusLabel || '-'}</p>
            </div>

            <div className="card">
              <h3>이번 달 목표 vs 실제</h3>
              <p><strong>목표 매출:</strong> {Math.round(coachGoalSummary.revenueGoalAvg || 0).toLocaleString()}원</p>
              <p><strong>실제 매출:</strong> {Number(coachActualSummary.actualRevenue || 0).toLocaleString()}원</p>

              <p><strong>목표 신규 상담:</strong> {Math.round(coachGoalSummary.newLeadGoalAvg || 0)}건</p>
              <p><strong>실제 신규 상담 기록 수:</strong> {Number(coachActualSummary.actualLeadCount || 0)}건</p>

              <p><strong>목표 회원 유지:</strong> {Math.round(coachGoalSummary.retentionGoalAvg || 0)}건</p>
              <p><strong>실제 결제 완료 수:</strong> {Number(coachActualSummary.actualClosedCount || 0)}건</p>

              <p><strong>목표 콘텐츠 업로드:</strong> {Math.round(coachGoalSummary.contentGoalAvg || 0)}건</p>
              <p className="compact-text">
                콘텐츠 실제값은 아직 별도 기록 구조가 없어서 자동 비교에서 제외했습니다.
              </p>

              <div className="detail-box">
                <p><strong>후속관리중:</strong> {Number(coachActualSummary.actualFollowupCount || 0)}건</p>
                <p><strong>이탈:</strong> {Number(coachActualSummary.actualLostCount || 0)}건</p>
                <p><strong>안내:</strong> 목표값은 이번 달 저장된 목표 기준이고, 실제값은 매출기록/세일즈일지 기준입니다.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleReportSection('alerts')}>
        <span>4. 주의 필요 코치</span>
        <strong>{reportOpenSections.alerts ? '−' : '+'}</strong>
      </button>

      {reportOpenSections.alerts && (
        <div className="coach-panel-body">
          <div className="card">
            <h3>주의 필요 코치</h3>
            {uniqueAlertCoaches.length === 0 ? (
              <div className="compact-text">현재 주의 필요 코치가 없습니다.</div>
            ) : (
              <div className="list-stack">
                {uniqueAlertCoaches.map((item) => (
                  <div key={item.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{item.coaches?.name || '이름 없음'}</strong>
                      <span className="pill">주의</span>
                    </div>
                    <div className="compact-text">{item.reasons.join(', ')}</div>
                    <div className="compact-text">
                      컨디션 {item.condition_score || 0} / 피로도 {item.fatigue_score || 0} / 스트레스 {item.stress_score || 0} / 집중도 {item.focus_score || 0}
                    </div>
                    <div className="compact-text">
                      행동 점수 {item.performance_score || 0} / 행동 레벨 {item.performance_level || '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleReportSection('compare')}>
        <span>5. 코치별 비교</span>
        <strong>{reportOpenSections.compare ? '−' : '+'}</strong>
      </button>

      {reportOpenSections.compare && (
        <div className="coach-panel-body">
          <div className="card">
            <h3>코치별 비교</h3>
            {filteredCoachConditions.length === 0 ? (
              <div className="workout-list-empty">비교할 코치 기록이 없습니다.</div>
            ) : (
              <div className="list-stack">
                {filteredCoachConditions.map((item) => (
                  <div key={item.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{item.coaches?.name || '-'}</strong>
                      <span className="pill">{item.check_month || '-'}</span>
                    </div>

                    <div className="compact-text">
                      상태레벨 {COACH_LEVEL_META[item.status_level]?.label || '-'} / 행동레벨 {item.performance_level || '-'}
                    </div>

                    <div className="compact-text">
                      컨디션 {item.condition_score || 0} / 피로도 {item.fatigue_score || 0} / 스트레스 {item.stress_score || 0} / 집중도 {item.focus_score || 0}
                    </div>

                    <div className="compact-text">
                      행동 점수 {item.performance_score || 0}점
                    </div>

                    <div className="compact-text">
                      자동 해석:{' '}
                      {getCoachStatusText({
                        conditionScore: item.condition_score,
                        fatigueScore: item.fatigue_score,
                        stressScore: item.stress_score,
                        focusScore: item.focus_score,
                        performanceScore: item.performance_score,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleReportSection('reviewForm')}>
        <span>6. 코치 평가 등록 / 수정</span>
        <strong>{reportOpenSections.reviewForm ? '−' : '+'}</strong>
      </button>

      {reportOpenSections.reviewForm && (
        <div className="coach-panel-body">
          <section className="card">
            <h3>{editingCoachReviewId ? '코치 평가 수정' : '코치 평가 등록'}</h3>

            <form className="stack-gap" onSubmit={handleCoachReviewSubmit}>
              <label className="field">
                <span>코치</span>
                <select
                  value={coachReviewForm.coach_id}
                  onChange={(e) =>
                    setCoachReviewForm((prev) => ({
                      ...prev,
                      coach_id: e.target.value,
                    }))
                  }
                >
                  <option value="">코치 선택</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>평가 월</span>
                <input
                  type="month"
                  value={coachReviewForm.review_month}
                  onChange={(e) =>
                    setCoachReviewForm((prev) => ({
                      ...prev,
                      review_month: e.target.value,
                    }))
                  }
                />
              </label>

              <div className="form-row">
                <label className="field">
                  <span>매출 점수</span>
                  <input
                    type="number"
                    value={coachReviewForm.revenue_score}
                    onChange={(e) =>
                      setCoachReviewForm((prev) => ({
                        ...prev,
                        revenue_score: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span>활동 점수</span>
                  <input
                    type="number"
                    value={coachReviewForm.activity_score}
                    onChange={(e) =>
                      setCoachReviewForm((prev) => ({
                        ...prev,
                        activity_score: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span>세일즈 점수</span>
                  <input
                    type="number"
                    value={coachReviewForm.sales_score}
                    onChange={(e) =>
                      setCoachReviewForm((prev) => ({
                        ...prev,
                        sales_score: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span>태도 점수</span>
                  <input
                    type="number"
                    value={coachReviewForm.attitude_score}
                    onChange={(e) =>
                      setCoachReviewForm((prev) => ({
                        ...prev,
                        attitude_score: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="detail-box">
                총점:{' '}
                {(Number(coachReviewForm.revenue_score) || 0) +
                  (Number(coachReviewForm.activity_score) || 0) +
                  (Number(coachReviewForm.sales_score) || 0) +
                  (Number(coachReviewForm.attitude_score) || 0)}
              </div>

              <label className="field">
                <span>관리자 코멘트</span>
                <textarea
                  rows="5"
                  value={coachReviewForm.manager_comment}
                  onChange={(e) =>
                    setCoachReviewForm((prev) => ({
                      ...prev,
                      manager_comment: e.target.value,
                    }))
                  }
                />
              </label>

              <div className="inline-actions wrap">
                <button className="primary-btn" type="submit">
                  {editingCoachReviewId ? '평가 수정 저장' : '평가 저장'}
                </button>
                <button className="secondary-btn" type="button" onClick={resetCoachReviewForm}>
                  초기화
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>

    <section className="coach-panel-modern">
      <button type="button" className="coach-panel-toggle" onClick={() => toggleReportSection('reviewList')}>
        <span>7. 코치 평가 목록</span>
        <strong>{reportOpenSections.reviewList ? '−' : '+'}</strong>
      </button>

      {reportOpenSections.reviewList && (
        <div className="coach-panel-body">
          <section className="card">
            <div className="section-head">
              <h3>코치 평가 목록</h3>
              <div className="inline-actions wrap">
                <input
                  type="month"
                  value={coachReviewMonth}
                  onChange={(e) => setCoachReviewMonth(e.target.value)}
                />
                <select
                  value={coachReviewCoachFilter}
                  onChange={(e) => setCoachReviewCoachFilter(e.target.value)}
                >
                  <option value="">전체 코치</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredCoachReviews.length === 0 ? (
              <div className="workout-list-empty">등록된 코치 평가가 없습니다.</div>
            ) : (
              <div className="list-stack">
                {filteredCoachReviews.map((item) => (
                  <div key={item.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{item.coaches?.name || '-'}</strong>
                      <span className="pill">{item.review_month || '-'}</span>
                    </div>

                    <div className="compact-text">
                      매출 {item.revenue_score || 0} / 활동 {item.activity_score || 0} / 세일즈 {item.sales_score || 0} / 태도 {item.attitude_score || 0}
                    </div>

                    <div className="compact-text">총점 {item.total_score || 0}</div>

                    <div className="compact-text">코멘트: {item.manager_comment || '-'}</div>

                    <div className="inline-actions wrap">
                      <button className="secondary-btn" type="button" onClick={() => handleCoachReviewEdit(item)}>
                        수정
                      </button>
                      <button className="danger-btn" type="button" onClick={() => handleCoachReviewDelete(item.id)}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  </section>
)}
{activeTab === '코치스케줄' && (
  <div className="two-col">
        <details className="tab-usage-guide-card schedule-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE COACH SCHEDULE</div>
          <strong>코치스케줄은 이렇게 보고, 이렇게 관리합니다</strong>
          <p>
            단순 근무표가 아니라 코치 배치, 예약 가능 시간, 운영 공백을 미리 막기 위한 기본 운영 탭입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>코치 / 기준 월 선택 → 운영 기준이 정리됩니다</strong>
              <p>
                먼저 코치와 기준 월을 잡아야
                누구의 어떤 달 스케줄을 관리하는지 헷갈리지 않고 수정할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>근무일 / 시간 / 가능 슬롯 입력 → 예약 가능한 구조가 만들어집니다</strong>
              <p>
                단순 출근시간만 적는 게 아니라 실제 가능한 시간 슬롯까지 선택해야
                예약 배치와 운영 동선이 현실적으로 맞아집니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>목록 확인 → 공백과 과밀 구간을 미리 봅니다</strong>
              <p>
                저장 후 목록에서 날짜별 근무/휴무와 가능 시간을 보면
                특정 코치에 수업이 몰릴지, 빈 시간대가 생길지 미리 판단할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>운영대시보드/코치관리와 같이 보기 → 실제 운영 조정이 쉬워집니다</strong>
              <p>
                코치 상태가 좋지 않은 달에는 스케줄까지 같이 봐야
                회복이 필요한 코치를 어디서 줄여야 할지 더 정확히 판단할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            특정 코치가 주의 필요 상태인데 주말 근무와 슬롯이 과하게 열려 있으면,
            스케줄 탭에서 먼저 시간대를 줄이고 다른 코치로 분산하는 식으로 운영 리스크를 줄이면 됩니다.
          </p>
        </div>
      </div>
    </details>
    <section className="card">
      <div className="section-head">
        <div>
          <h2>코치 스케줄 등록 / 수정</h2>
          <p className="sub-text">코치별 근무일정과 가능 시간을 관리합니다.</p>
        </div>
      </div>

      <div className="stack-gap">
        <label className="field">
          <span>코치 선택</span>
          <select
            value={selectedCoachId}
            onChange={(e) => setSelectedCoachId(e.target.value)}
          >
            <option value="">코치 선택</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid-2">
          <label className="field">
            <span>기준 월</span>
            <input
              type="month"
              value={scheduleMonth}
              onChange={(e) => setScheduleMonth(e.target.value)}
            />
          </label>

          <label className="field">
            <span>일정 날짜</span>
            <input
              type="date"
              value={scheduleForm.schedule_date}
              onChange={(e) =>
                setScheduleForm((prev) => ({
                  ...prev,
                  schedule_date: e.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="grid-2">
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={!!scheduleForm.is_working}
              onChange={(e) =>
                setScheduleForm((prev) => ({
                  ...prev,
                  is_working: e.target.checked,
                }))
              }
            />
            <span>근무일</span>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={!!scheduleForm.is_weekend_work}
              onChange={(e) =>
                setScheduleForm((prev) => ({
                  ...prev,
                  is_weekend_work: e.target.checked,
                }))
              }
            />
            <span>주말 근무</span>
          </label>
        </div>

        <div className="grid-2">
          <label className="field">
            <span>근무 시작</span>
            <input
              type="time"
              value={scheduleForm.work_start}
              onChange={(e) =>
                setScheduleForm((prev) => ({
                  ...prev,
                  work_start: e.target.value,
                }))
              }
            />
          </label>

          <label className="field">
            <span>근무 종료</span>
            <input
              type="time"
              value={scheduleForm.work_end}
              onChange={(e) =>
                setScheduleForm((prev) => ({
                  ...prev,
                  work_end: e.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="field">
          <span>가능 시간 선택</span>
          <div className="check-grid">
            {timeSlotOptions.map((slot) => (
              <label key={slot} className="checkbox-chip">
                <input
                  type="checkbox"
                  checked={(scheduleForm.selectedSlots || []).includes(slot)}
                  onChange={() =>
                    setScheduleForm((prev) => {
                      const current = Array.isArray(prev.selectedSlots) ? prev.selectedSlots : []
                      const exists = current.includes(slot)

                      return {
                        ...prev,
                        selectedSlots: exists
                          ? current.filter((value) => value !== slot)
                          : [...current, slot],
                      }
                    })
                  }
                />
                <span>{slot}</span>
              </label>
            ))}
          </div>
        </div>

       

        <div className="inline-actions wrap">
          <button
            type="button"
            className="primary-btn"
            onClick={handleScheduleSave}
            disabled={!selectedCoachId}
          >
            스케줄 저장
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() =>
              setScheduleForm({
                schedule_date: new Date().toISOString().slice(0, 10),
                is_working: true,
                is_weekend_work: false,
                work_start: '09:00',
                work_end: '18:00',
                memo: '',
                selectedSlots: ['10:00', '11:00', '14:00', '15:00'],
              })
            }
          >
            초기화
          </button>
        </div>
      </div>
    </section>

    <section className="card">
      <div className="member-list-header">
        <h2>코치 스케줄 목록</h2>

        <div className="member-list-search-area">
          <div className="member-list-filter-row">
            <input
              type="month"
              value={scheduleMonth}
              onChange={(e) => setScheduleMonth(e.target.value)}
            />

            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
            >
              <option value="">전체 코치</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="list-stack">
        {coachSchedules
          .filter((schedule) => !scheduleMonth || (schedule.schedule_date || '').slice(0, 7) === scheduleMonth)
          .filter((schedule) => !selectedCoachId || schedule.coach_id === selectedCoachId)
          .sort((a, b) => (b.schedule_date || '').localeCompare(a.schedule_date || ''))
          .length === 0 ? (
          <div className="workout-list-empty">등록된 코치 스케줄이 없습니다.</div>
        ) : null}

        {coachSchedules
          .filter((schedule) => !scheduleMonth || (schedule.schedule_date || '').slice(0, 7) === scheduleMonth)
          .filter((schedule) => !selectedCoachId || schedule.coach_id === selectedCoachId)
          .sort((a, b) => (b.schedule_date || '').localeCompare(a.schedule_date || ''))
          .map((schedule) => {
            const collapsed = collapsedSchedules[schedule.id] ?? true
            const coachName =
              coaches.find((coach) => coach.id === schedule.coach_id)?.name ||
              schedule.coaches?.name ||
              '코치없음'

            const slotList = coachScheduleSlotsMap[schedule.id] || []

            return (
              <div key={schedule.id} className="list-card">
                <div className="list-card-top">
                  <strong>{coachName}</strong>
                  <span className="pill">{schedule.schedule_date || '-'}</span>
                </div>

                <div className="compact-text">
                  간략히보기: {schedule.is_working ? '근무' : '휴무'} / {schedule.work_start || '-'} ~ {schedule.work_end || '-'}
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

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => handleScheduleEdit(schedule)}
                  >
                    수정
                  </button>

                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleScheduleDelete(schedule.id)}
                  >
                    삭제
                  </button>
                </div>

                {!collapsed && (
                  <div className="detail-box">
                    <p><strong>코치:</strong> {coachName}</p>
                    <p><strong>날짜:</strong> {schedule.schedule_date || '-'}</p>
                    <p><strong>근무 여부:</strong> {schedule.is_working ? '근무' : '휴무'}</p>
                    <p><strong>주말 근무:</strong> {schedule.is_weekend_work ? '예' : '아니오'}</p>
                    <p><strong>근무 시간:</strong> {schedule.work_start || '-'} ~ {schedule.work_end || '-'}</p>
                    <p><strong>가능 시간:</strong> {slotList.length ? slotList.join(', ') : '없음'}</p>
                    <p><strong>메모:</strong> {schedule.memo || '-'}</p>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </section>
  </div>
)}
     {activeTab === '프로그램' && (
  <div className="program-page-modern">
    <section className="program-hero">
      <div className="program-hero-left">
        <div className="program-hero-badge">PROGRAM MANAGEMENT</div>
        <h2>프로그램 관리</h2>
        <p className="program-hero-text">
          회원에게 연결할 프로그램을 등록하고, 가격·세션 수·설명을 정리해서
          한눈에 보기 쉽게 관리하는 화면입니다.
        </p>
      </div>

      <div className="program-hero-right">
        <div className="program-hero-mini">
          <span>전체 프로그램 수</span>
          <strong>{programs.length}</strong>
          <p>현재 등록된 전체 프로그램 수</p>
        </div>

        <div className="program-hero-mini">
          <span>검색 결과</span>
          <strong>
            {
              programs.filter((program) => {
                const keyword = programSearch.trim().toLowerCase()
                if (!keyword) return true

                return (
                  String(program.name || '').toLowerCase().includes(keyword) ||
                  String(program.description || '').toLowerCase().includes(keyword) ||
                  String(program.price || '').toLowerCase().includes(keyword) ||
                  String(program.session_count || '').toLowerCase().includes(keyword)
                )
              }).length
            }
          </strong>
          <p>현재 검색 조건에 맞는 프로그램 수</p>
        </div>
      </div>
    </section>
    <details className="tab-usage-guide-card program-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE PROGRAM MANAGEMENT</div>
          <strong>프로그램 관리는 상품표가 아니라 판매 기준표입니다</strong>
          <p>
            프로그램명과 가격만 적는 화면이 아니라,
            어떤 상품을 노출하고 추천하고 VIP로 운영할지 판매 구조를 정리하는 탭입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>기본 정보 입력 → 판매 단위가 정리됩니다</strong>
              <p>
                프로그램명, 가격, 세션 수를 먼저 정확히 잡아야
                회원 등록, 매출기록, 상담 제안에서 기준이 흔들리지 않습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>설명 / 옵션 설정 → 어떤 상품을 밀지 정합니다</strong>
              <p>
                VIP, 추천, 인기, 회원노출, 노출 순서를 조정하면
                실제 회원 화면과 상담 제안에서 어떤 상품을 먼저 보여줄지 결정됩니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>목록 확인 → 비활성/노출 상태를 함께 점검합니다</strong>
              <p>
                등록 후 목록에서 활성 여부와 배지를 같이 보면
                현재 어떤 상품이 실제 판매 구조 안에 들어와 있는지 빠르게 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>매출기록과 같이 보기 → 잘 팔리는 상품을 구분합니다</strong>
              <p>
                프로그램은 등록만 해두는 게 아니라,
                매출기록의 프로그램별 매출과 같이 봐야 실제로 어떤 상품이 잘 나가는지 판단할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            특정 프로그램을 추천/인기로 올려놨는데 실제 매출기록에서 거의 안 잡히면,
            상품명이 약한지, 설명이 약한지, 상담에서 제안이 안 되는지 다시 점검하면 됩니다.
          </p>
        </div>
      </div>
    </details>
    <div className="program-page-grid">
      <section className="card program-form-card-modern">
        <div className="program-card-head">
          <div>
            <div className="program-card-label">PROGRAM FORM</div>
            <h3>{editingProgramId ? '프로그램 수정' : '프로그램 등록'}</h3>
            <p className="sub-text">
              프로그램명, 가격, 세션 수, 설명, VIP 여부를 입력하는 영역입니다.
            </p>
          </div>
        </div>

        <form className="stack-gap" onSubmit={handleProgramSubmit}>
          <div className="program-form-block">
            <div className="program-form-block-title">기본 정보</div>

            <label className="field">
              <span>프로그램명</span>
              <input
                value={programForm.name}
                onChange={(e) =>
                  setProgramForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="예: 베이직 PT 20회 / 재활 PT / 웨딩 라인관리"
              />
            </label>

            <div className="grid-2">
              <label className="field">
                <span>가격</span>
                <input
                  type="number"
                  value={programForm.price}
                  onChange={(e) =>
                    setProgramForm((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  placeholder="예: 550000"
                />
              </label>

              <label className="field">
                <span>세션 수</span>
                <input
                  type="number"
                  value={programForm.session_count}
                  onChange={(e) =>
                    setProgramForm((prev) => ({
                      ...prev,
                      session_count: e.target.value,
                    }))
                  }
                  placeholder="예: 20"
                />
              </label>
            </div>
          </div>

          <div className="program-form-block">
            <div className="program-form-block-title">설명 / 옵션</div>

            <label className="field">
              <span>설명</span>
              <textarea
                rows="5"
                value={programForm.description}
                onChange={(e) =>
                  setProgramForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="예: 체형교정 + 기초근력 + 운동습관 형성 중심 프로그램"
              />
            </label>

            <div className="program-option-panel">
  <div className="program-option-panel-head">
    <strong>노출 / 판매 설정</strong>
    <span className="compact-text">회원 화면 표시와 추천 배지를 관리합니다.</span>
  </div>

  <div className="program-option-grid">
    <label className="checkbox-chip">
      <input
        type="checkbox"
        checked={!!programForm.is_vip}
        onChange={(e) =>
          setProgramForm((prev) => ({
            ...prev,
            is_vip: e.target.checked,
          }))
        }
      />
      <span>VIP 프로그램</span>
    </label>

    <label className="checkbox-chip">
      <input
        type="checkbox"
        checked={!!programForm.is_active}
        onChange={(e) =>
          setProgramForm((prev) => ({
            ...prev,
            is_active: e.target.checked,
          }))
        }
      />
      <span>활성화</span>
    </label>

    <label className="checkbox-chip">
      <input
        type="checkbox"
        checked={!!programForm.is_recommended}
        onChange={(e) =>
          setProgramForm((prev) => ({
            ...prev,
            is_recommended: e.target.checked,
          }))
        }
      />
      <span>추천 프로그램</span>
    </label>

    <label className="checkbox-chip">
      <input
        type="checkbox"
        checked={!!programForm.is_popular}
        onChange={(e) =>
          setProgramForm((prev) => ({
            ...prev,
            is_popular: e.target.checked,
          }))
        }
      />
      <span>인기 프로그램</span>
    </label>

    <label className="checkbox-chip">
      <input
        type="checkbox"
        checked={programForm.is_visible_to_members !== false}
        onChange={(e) =>
          setProgramForm((prev) => ({
            ...prev,
            is_visible_to_members: e.target.checked,
          }))
        }
      />
      <span>회원 화면 노출</span>
    </label>

    <label className="field program-order-field">
      <span>노출 순서</span>
      <input
        type="number"
        value={programForm.display_order ?? 0}
        onChange={(e) =>
          setProgramForm((prev) => ({
            ...prev,
            display_order: e.target.value,
          }))
        }
        placeholder="0"
      />
    </label>
  </div>
</div>
          </div>

          <div className="inline-actions wrap">
            <button className="primary-btn" type="submit">
              {editingProgramId ? '프로그램 수정 저장' : '프로그램 등록'}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setProgramForm(emptyProgramForm)
                setEditingProgramId(null)
              }}
            >
              초기화
            </button>
          </div>
        </form>
      </section>

      <section className="card program-list-card-modern">
        <div className="program-card-head">
          <div>
            <div className="program-card-label">PROGRAM LIST</div>
            <h3>프로그램 목록</h3>
            <p className="sub-text">
              등록된 프로그램을 검색하고 상태를 빠르게 확인하는 영역입니다.
            </p>
          </div>
        </div>

        <div className="program-list-toolbar">
          <input
            placeholder="프로그램명 / 설명 검색"
            value={programSearch}
            onChange={(e) => setProgramSearch(e.target.value)}
          />
        </div>

        <div className="list-stack">
          {programs
            .filter((program) => {
              const keyword = programSearch.trim().toLowerCase()
              if (!keyword) return true

              return (
                String(program.name || '').toLowerCase().includes(keyword) ||
                String(program.description || '').toLowerCase().includes(keyword) ||
                String(program.price || '').toLowerCase().includes(keyword) ||
                String(program.session_count || '').toLowerCase().includes(keyword)
              )
            })
            .length === 0 ? (
            <div className="workout-list-empty">등록된 프로그램이 없습니다.</div>
          ) : null}

          {programs
            .filter((program) => {
              const keyword = programSearch.trim().toLowerCase()
              if (!keyword) return true

              return (
                String(program.name || '').toLowerCase().includes(keyword) ||
                String(program.description || '').toLowerCase().includes(keyword) ||
                String(program.price || '').toLowerCase().includes(keyword) ||
                String(program.session_count || '').toLowerCase().includes(keyword)
              )
            })
            .map((program) => (
              <div key={program.id} className="program-list-modern-card">
  <div className="program-list-modern-top">
    <div className="program-list-modern-name">
      <strong>{program.name || '-'}</strong>
      <div className="compact-text">
        {Number(program.price || 0).toLocaleString()}원 / {program.session_count || 0}회
      </div>
    </div>

    <div className="inline-actions wrap">
      <span className={`pill ${program.is_active ? 'pill-green' : 'pill-amber'}`}>
        {program.is_active ? '활성' : '비활성'}
      </span>

      {program.is_vip ? <span className="pill pill-violet">VIP</span> : null}
      {program.is_recommended ? <span className="pill pill-blue">추천</span> : null}
      {program.is_popular ? <span className="pill pill-orange">인기</span> : null}
      {program.is_visible_to_members !== false ? (
        <span className="pill pill-green">회원노출</span>
      ) : (
        <span className="pill pill-dark">회원숨김</span>
      )}
      <span className="pill pill-soft">순서 {Number(program.display_order || 0)}</span>
    </div>
  </div>

  <div className="program-description-box">
  <p className={expandedProgramId === program.id ? 'expanded' : ''}>
    {program.description || '-'}
  </p>

  {program.description && String(program.description).length > 40 ? (
    <button
      type="button"
      className="program-desc-toggle"
      onClick={() =>
        setExpandedProgramId((prev) =>
          prev === program.id ? null : program.id
        )
      }
    >
      {expandedProgramId === program.id ? '접기' : '더보기'}
    </button>
  ) : null}
</div>

  

  <div className="inline-actions wrap">
    <button
      type="button"
      className="secondary-btn"
      onClick={() => handleProgramEdit(program)}
    >
      수정
    </button>

    <button
      type="button"
      className="danger-btn"
      onClick={() => handleProgramDelete(program.id)}
    >
      삭제
    </button>
  </div>
</div>
            ))}
        </div>
      </section>
    </div>
  </div>
)}
{activeTab === '공지사항' && (
  <div className="two-col">
    <details className="tab-usage-guide-card notice-usage-guide" open={false}>
      <summary className="tab-usage-guide-summary">
        <div>
          <div className="tab-usage-guide-badge">HOW TO USE NOTICE</div>
          <strong>공지사항은 회원 커뮤니케이션 기준을 정리하는 탭입니다</strong>
          <p>
            단순 공지 등록이 아니라 휴무, 이벤트, 안내, 소식을 회원 화면에 어떻게 전달할지 정리하는 기본 소통 탭입니다.
          </p>
        </div>
        <span className="tab-usage-guide-summary-icon">+</span>
      </summary>

      <div className="tab-usage-guide-body">
        <div className="tab-usage-guide-grid">
          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">1</span>
            <div>
              <strong>제목 / 카테고리 먼저 정리 → 공지 목적이 명확해집니다</strong>
              <p>
                공지, 이벤트, 안내, 소식 중 무엇인지 먼저 정리해야
                회원이 이 글을 왜 봐야 하는지 한눈에 이해하기 쉽습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">2</span>
            <div>
              <strong>내용은 짧고 핵심만 → 회원 행동으로 이어집니다</strong>
              <p>
                길게 쓰기보다 휴무일, 참여 방법, 대상, 기간처럼
                회원이 바로 알아야 할 정보 위주로 적어야 실제 확인률이 높습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">3</span>
            <div>
              <strong>노출 기간 / 게시 상태 확인 → 필요한 때만 보이게 합니다</strong>
              <p>
                항상 띄우는 것보다 필요한 기간만 노출해야
                회원 화면이 복잡해지지 않고 중요한 안내가 묻히지 않습니다.
              </p>
            </div>
          </div>

          <div className="tab-usage-guide-item">
            <span className="tab-usage-guide-step">4</span>
            <div>
              <strong>목록 확인 → 오래된 공지와 현재 공지를 구분합니다</strong>
              <p>
                등록 후 목록에서 날짜와 상태를 확인하면서
                지난 안내를 내리고 현재 필요한 공지만 유지하는 게 중요합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="tab-usage-guide-tip">
          <strong>실무 활용 예시</strong>
          <p>
            휴무 공지, 이벤트 공지, 신규 프로그램 공지가 동시에 많아지면 회원이 핵심을 못 볼 수 있으니
            기간 지난 공지는 내리고, 이번 주 행동과 직접 연결되는 공지부터 우선 노출하면 됩니다.
          </p>
        </div>
      </div>
    </details>
    
    <section className="card">
      <div className="section-head">
        <div>
          <h2>{editingNoticeId ? '공지사항 수정' : '공지사항 등록'}</h2>
          <p className="sub-text">회원 화면에 보여줄 공지와 소식을 등록합니다.</p>
        </div>
      </div>

      <form className="stack-gap" onSubmit={handleNoticeSubmit}>
        <label className="field">
          <span>제목</span>
          <input
            value={noticeForm.title}
            onChange={(e) =>
              setNoticeForm((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            placeholder="예: 4월 휴무 안내 / 이번달 이벤트"
          />
        </label>

        <div className="grid-2">
          <label className="field">
            <span>카테고리</span>
            <select
              value={noticeForm.category}
              onChange={(e) =>
                setNoticeForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
            >
              <option value="공지">공지</option>
              <option value="이벤트">이벤트</option>
              <option value="안내">안내</option>
              <option value="소식">소식</option>
            </select>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={!!noticeForm.is_published}
              onChange={(e) =>
                setNoticeForm((prev) => ({
                  ...prev,
                  is_published: e.target.checked,
                }))
              }
            />
            <span>게시 상태</span>
          </label>
        </div>

        <label className="field">
          <span>내용</span>
          <textarea
            rows="8"
            value={noticeForm.content}
            onChange={(e) =>
              setNoticeForm((prev) => ({
                ...prev,
                content: e.target.value,
              }))
            }
            placeholder="회원에게 보여줄 공지 내용을 입력하세요."
          />
        </label>

        <div className="grid-2">
          <label className="field">
            <span>이미지 URL</span>
            <input
              value={noticeForm.image_url}
              onChange={(e) =>
                setNoticeForm((prev) => ({
                  ...prev,
                  image_url: e.target.value,
                }))
              }
              placeholder="이미지 주소가 있으면 입력"
            />
          </label>

          <label className="field">
            <span>영상 URL</span>
            <input
              value={noticeForm.video_url}
              onChange={(e) =>
                setNoticeForm((prev) => ({
                  ...prev,
                  video_url: e.target.value,
                }))
              }
              placeholder="영상 주소가 있으면 입력"
            />
          </label>
        </div>

        <div className="grid-2">
          <label className="field">
            <span>노출 시작일</span>
            <input
              type="date"
              value={noticeForm.starts_at ? String(noticeForm.starts_at).slice(0, 10) : ''}
              onChange={(e) =>
                setNoticeForm((prev) => ({
                  ...prev,
                  starts_at: e.target.value,
                }))
              }
            />
          </label>

          <label className="field">
            <span>노출 종료일</span>
            <input
              type="date"
              value={noticeForm.ends_at ? String(noticeForm.ends_at).slice(0, 10) : ''}
              onChange={(e) =>
                setNoticeForm((prev) => ({
                  ...prev,
                  ends_at: e.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="inline-actions wrap">
          <button className="primary-btn" type="submit">
            {editingNoticeId ? '공지 수정 저장' : '공지 등록'}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setNoticeForm({
                id: null,
                title: '',
                content: '',
                category: '공지',
                image_url: '',
                video_url: '',
                is_published: true,
                starts_at: '',
                ends_at: '',
              })
              setEditingNoticeId(null)
            }}
          >
            초기화
          </button>
        </div>
      </form>
    </section>

    <section className="card">
      <div className="member-list-header">
        <h2>공지사항 목록</h2>

        <div className="member-list-search-area">
          <input
            placeholder="제목 / 내용 검색"
            value={noticeSearch}
            onChange={(e) => setNoticeSearch(e.target.value)}
          />

          <div className="member-list-filter-row">
            <input
              type="month"
              value={noticeMonthFilter}
              onChange={(e) => setNoticeMonthFilter(e.target.value)}
            />

            <select
              value={noticeCategoryFilter}
              onChange={(e) => setNoticeCategoryFilter(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="공지">공지</option>
              <option value="이벤트">이벤트</option>
              <option value="안내">안내</option>
              <option value="소식">소식</option>
            </select>
          </div>
        </div>
      </div>

      <div className="list-stack">
        {notices
          .filter((notice) =>
            !noticeMonthFilter
              ? true
              : ((notice.starts_at || notice.created_at || '').slice(0, 7) === noticeMonthFilter)
          )
          .filter((notice) =>
            noticeCategoryFilter === 'all' ? true : notice.category === noticeCategoryFilter
          )
          .filter((notice) => {
            const keyword = noticeSearch.trim().toLowerCase()
            if (!keyword) return true
            return (
              String(notice.title || '').toLowerCase().includes(keyword) ||
              String(notice.content || '').toLowerCase().includes(keyword) ||
              String(notice.category || '').toLowerCase().includes(keyword)
            )
          })
          .sort((a, b) =>
            String(b.starts_at || b.created_at || '').localeCompare(String(a.starts_at || a.created_at || ''))
          )
          .length === 0 ? (
          <div className="workout-list-empty">등록된 공지사항이 없습니다.</div>
        ) : null}

        {notices
          .filter((notice) =>
            !noticeMonthFilter
              ? true
              : ((notice.starts_at || notice.created_at || '').slice(0, 7) === noticeMonthFilter)
          )
          .filter((notice) =>
            noticeCategoryFilter === 'all' ? true : notice.category === noticeCategoryFilter
          )
          .filter((notice) => {
            const keyword = noticeSearch.trim().toLowerCase()
            if (!keyword) return true
            return (
              String(notice.title || '').toLowerCase().includes(keyword) ||
              String(notice.content || '').toLowerCase().includes(keyword) ||
              String(notice.category || '').toLowerCase().includes(keyword)
            )
          })
          .sort((a, b) =>
            String(b.starts_at || b.created_at || '').localeCompare(String(a.starts_at || a.created_at || ''))
          )
          .map((notice) => {
            const collapsed = collapsedNotices[notice.id] ?? true

            return (
              <div key={notice.id} className="list-card">
                <div className="list-card-top">
                  <div>
                    <strong>{notice.title || '(제목 없음)'}</strong>
                    <div className="compact-text">
                      {notice.category || '-'} / {notice.is_published ? '게시중' : '비공개'}
                    </div>
                  </div>

                  <span className="pill">
                    {(notice.starts_at || notice.created_at || '').slice(0, 10) || '-'}
                  </span>
                </div>

                <div className="compact-text">
                  {(notice.content || '').slice(0, 60)}
                  {(notice.content || '').length > 60 ? '...' : ''}
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

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => handleNoticeEdit(notice)}
                  >
                    수정
                  </button>

                  <button
                    type="button"
                    className="danger-btn"
                    onClick={async () => {
                      if (!window.confirm('공지사항을 삭제할까요?')) return
                      await supabase.from('notices').delete().eq('id', notice.id)
                      await loadNotices()
                    }}
                  >
                    삭제
                  </button>
                </div>

                {!collapsed && (
                  <div className="detail-box">
                    <p><strong>제목:</strong> {notice.title || '-'}</p>
                    <p><strong>카테고리:</strong> {notice.category || '-'}</p>
                    <p><strong>게시 상태:</strong> {notice.is_published ? '게시중' : '비공개'}</p>
                    <p><strong>노출 시작:</strong> {notice.starts_at ? String(notice.starts_at).slice(0, 10) : '-'}</p>
                    <p><strong>노출 종료:</strong> {notice.ends_at ? String(notice.ends_at).slice(0, 10) : '-'}</p>
                    <p><strong>이미지 URL:</strong> {notice.image_url || '-'}</p>
                    <p><strong>영상 URL:</strong> {notice.video_url || '-'}</p>
                    <p><strong>내용:</strong> {notice.content || '-'}</p>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </section>
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
              <input value={manualForm.title} onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })} />
            </label>

            <label className="field">
              <span>내용</span>
              <textarea rows="10" value={manualForm.content} onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })} />
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
      {activeTab === '제휴업체' && (
        <div className="stack-gap">
          <div className="card">
            <h2>{editingPartnerId ? '제휴업체 수정' : '제휴업체 등록'}</h2>

            <form className="stack-gap" onSubmit={handlePartnerSubmit}>
              <div className="grid-2">
                <label className="field">
                  <span>업체명</span>
                  <input
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                    placeholder="예: 화정카페"
                  />
                </label>

                <label className="field">
  <span>카테고리</span>

  <select
  value={partnerForm.category}
  onChange={(e) => setPartnerForm({ ...partnerForm, category: e.target.value })}
>
  <option value="">카테고리 선택</option>

  {partnerCategories.map((cat) => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}

  <option value="기타">직접 입력</option>
</select>

  {partnerForm.category === '기타' && (
    <input
      type="text"
      value={partnerCategoryCustom}
      onChange={(e) => setPartnerCategoryCustom(e.target.value)}
      placeholder="직접 카테고리 입력 (예: 필라테스, 한의원, 스포츠용품)"
    />
  )}
</label>
              </div>

              <label className="field">
                <span>한줄 소개</span>
                <input
                  value={partnerForm.description}
                  onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
                  placeholder="회원에게 보여질 간단 소개"
                />
              </label>

              <label className="field">
                <span>혜택 내용</span>
                <textarea
                  rows="3"
                  value={partnerForm.benefit}
                  onChange={(e) => setPartnerForm({ ...partnerForm, benefit: e.target.value })}
                  placeholder="예: PT 회원 음료 10% 할인"
                />
              </label>

              <label className="field">
                <span>사용 조건</span>
                <textarea
                  rows="3"
                  value={partnerForm.usage_condition}
                  onChange={(e) => setPartnerForm({ ...partnerForm, usage_condition: e.target.value })}
                  placeholder="예: PT 등록 회원만 / 월 2회 가능"
                />
              </label>

              <label className="field">
                <span>사용 방법</span>
                <textarea
                  rows="3"
                  value={partnerForm.usage_guide}
                  onChange={(e) => setPartnerForm({ ...partnerForm, usage_guide: e.target.value })}
                  placeholder="예: 직원에게 인증코드 제시 후 사용"
                />
              </label>

              <label className="field">
                <span>주의사항</span>
                <textarea
                  rows="3"
                  value={partnerForm.caution}
                  onChange={(e) => setPartnerForm({ ...partnerForm, caution: e.target.value })}
                  placeholder="예: 타 할인 중복 불가"
                />
              </label>

              <div className="grid-2">
                <label className="field">
                  <span>주소</span>
                  <input
                    value={partnerForm.address}
                    onChange={(e) => setPartnerForm({ ...partnerForm, address: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>연락처</span>
                  <input
                    value={partnerForm.phone}
                    onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="field">
                  <span>운영시간</span>
                  <input
                    value={partnerForm.business_hours}
                    onChange={(e) => setPartnerForm({ ...partnerForm, business_hours: e.target.value })}
                    placeholder="예: 09:00 - 22:00"
                  />
                </label>

                <label className="field">
                  <span>월 사용 가능 횟수</span>
                  <input
                    type="number"
                    value={partnerForm.monthly_limit}
                    onChange={(e) => setPartnerForm({ ...partnerForm, monthly_limit: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="field">
                  <span>담당자명</span>
                  <input
                    value={partnerForm.manager_name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, manager_name: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>담당자 연락처</span>
                  <input
                    value={partnerForm.manager_phone}
                    onChange={(e) => setPartnerForm({ ...partnerForm, manager_phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={partnerForm.approval_required}
                    onChange={(e) =>
                      setPartnerForm({ ...partnerForm, approval_required: e.target.checked })
                    }
                  />
                  <span>관리자 승인 필요</span>
                </label>

                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={partnerForm.is_active}
                    onChange={(e) =>
                      setPartnerForm({ ...partnerForm, is_active: e.target.checked })
                    }
                  />
                  <span>노출 활성화</span>
                </label>
              </div>

              <div className="inline-actions wrap">
                <button className="primary-btn" type="submit">
                  {editingPartnerId ? '수정 저장' : '업체 추가'}
                </button>

                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => {
                    setPartnerForm(emptyPartnerForm)
                    setEditingPartnerId(null)
                    setPartnerCategoryCustom('')
                  }}
                >
                  초기화
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="member-list-header">
              <h2>제휴업체 목록</h2>

              <div className="member-list-search-area">
                <input
                  placeholder="업체명 / 카테고리 / 혜택 / 주소 검색"
                  value={partnerSearch}
                  onChange={(e) => setPartnerSearch(e.target.value)}
                />

                <div className="member-list-filter-row">
                  <select
                    value={partnerCategoryFilter}
                    onChange={(e) => setPartnerCategoryFilter(e.target.value)}
                  >
                    <option value="all">전체</option>
                    <option value="카페">카페</option>
                    <option value="병원">병원</option>
                    <option value="마사지">마사지</option>
                    <option value="식당">식당</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="list-stack">
              {filteredPartners.length === 0 ? (
                <div className="workout-list-empty">등록된 제휴업체가 없습니다.</div>
              ) : null}

              {filteredPartners.map((partner) => (
                <div key={partner.id} className="list-card">
                  <div className="list-card-top">
                    <div>
                      <strong>{partner.name || '-'}</strong>
                      <div className="compact-text">
                        {partner.category || '-'} / {partner.phone || '-'}
                      </div>
                    </div>

                    <div className="inline-actions wrap">
                      <span className="pill">{partner.is_active ? '활성' : '비활성'}</span>
                      <button
  type="button"
  className="secondary-btn"
  onClick={() => {
    if (selectedPartnerId === partner.id) {
      setCollapsedPartnerDetail((prev) => !prev)
    } else {
      setSelectedPartnerId(partner.id)
      setCollapsedPartnerDetail(false)
    }
  }}
>
  {selectedPartnerId === partner.id && !collapsedPartnerDetail ? '상세 접기' : '상세보기'}
</button>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handlePartnerEdit(partner)}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handlePartnerDelete(partner.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="compact-text">
                    {(partner.benefit || '').slice(0, 60)}
                    {(partner.benefit || '').length > 60 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

                    {selectedPartner ? (
            <div className="card">
              <div className="list-card-top">
                <h2>제휴업체 상세</h2>

                <div className="inline-actions wrap">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setCollapsedPartnerDetail((prev) => !prev)}
                  >
                    {collapsedPartnerDetail ? '상세 펼치기' : '상세 접기'}
                  </button>
                </div>
              </div>

              {!collapsedPartnerDetail ? (
                <>
                  <div className="detail-box stack-gap">
                    <p><strong>업체명:</strong> {selectedPartner.name || '-'}</p>
                    <p><strong>카테고리:</strong> {selectedPartner.category || '-'}</p>
                    <p><strong>한줄 소개:</strong> {selectedPartner.description || '-'}</p>
                    <p><strong>혜택:</strong> {selectedPartner.benefit || '-'}</p>
                    <p><strong>사용 조건:</strong> {selectedPartner.usage_condition || '-'}</p>
                    <p><strong>사용 방법:</strong> {selectedPartner.usage_guide || '-'}</p>
                    <p><strong>주의사항:</strong> {selectedPartner.caution || '-'}</p>
                    <p><strong>주소:</strong> {selectedPartner.address || '-'}</p>
                    <p><strong>연락처:</strong> {selectedPartner.phone || '-'}</p>
                    <p><strong>운영시간:</strong> {selectedPartner.business_hours || '-'}</p>
                    <p><strong>담당자:</strong> {selectedPartner.manager_name || '-'} / {selectedPartner.manager_phone || '-'}</p>
                    <p><strong>월 사용 가능 횟수:</strong> {selectedPartner.monthly_limit ?? 0}회</p>
                    <p><strong>VIP 추가 횟수:</strong> {selectedPartner.vip_extra_limit ?? 0}회</p>
                    <p><strong>승인 필요:</strong> {selectedPartner.approval_required ? '예' : '아니오'}</p>
                    <p><strong>상태:</strong> {selectedPartner.is_active ? '활성' : '비활성'}</p>
                  </div>

                  <div className="sub-card stack-gap">
                    <div className="list-card-top">
                      <h3>제휴 사용 요청 목록</h3>

                      <select
                        value={partnerUsageStatusFilter}
                        onChange={(e) => setPartnerUsageStatusFilter(e.target.value)}
                      >
                        <option value="all">전체</option>
                        <option value="pending">승인대기</option>
                        <option value="approved">승인완료</option>
                        <option value="rejected">반려</option>
                      </select>
                    </div>

                    <div className="list-stack">
                      {partnerUsages
                        .filter((usage) => usage.partner_id === selectedPartner.id)
                        .filter((usage) =>
                          partnerUsageStatusFilter === 'all'
                            ? true
                            : usage.status === partnerUsageStatusFilter,
                        )
                        .length === 0 ? (
                        <div className="detail-box">
                          <p>해당 업체에 대한 사용 요청이 없습니다.</p>
                        </div>
                      ) : null}

                      {partnerUsages
                        .filter((usage) => usage.partner_id === selectedPartner.id)
                        .filter((usage) =>
                          partnerUsageStatusFilter === 'all'
                            ? true
                            : usage.status === partnerUsageStatusFilter,
                        )
                        .map((usage) => (
                          <div key={usage.id} className="list-card">
                            <div className="list-card-top">
                              <div>
                                <strong>{usage.members?.name || '회원없음'}</strong>
                                <div className="compact-text">
                                  요청일: {String(usage.requested_at || '').slice(0, 16).replace('T', ' ')}
                                </div>
                              </div>

                              <span className="pill">
                                {usage.status === 'approved'
                                  ? '승인완료'
                                  : usage.status === 'rejected'
                                  ? '반려'
                                  : '승인대기'}
                              </span>
                            </div>

                            <div className="compact-text">
                              Access Code: {usage.members?.access_code || '-'}
                            </div>
                            <div className="compact-text">
                              메모: {usage.note || '-'}
                            </div>
                            <div className="compact-text">
                              승인일: {usage.approved_at ? String(usage.approved_at).slice(0, 16).replace('T', ' ') : '-'}
                            </div>

                            <div className="inline-actions wrap">
                              {usage.status === 'pending' ? (
                                <>
                                  <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={() => handlePartnerUsageApprove(usage.id)}
                                  >
                                    승인
                                  </button>
                                  <button
                                    type="button"
                                    className="danger-btn"
                                    onClick={() => handlePartnerUsageReject(usage.id)}
                                  >
                                    반려
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
            {activeTab === '병의원·약국 소개' && (
        <div className="two-col">
          <section className="card">
            <div className="section-head">
              <div>
                <h2>{editingMedicalPartnerId ? '병의원·약국 소개 수정' : '병의원·약국 소개 등록'}</h2>
                <p className="sub-text">회원에게 보여줄 병의원/약국 안내 정보를 등록합니다.</p>
              </div>
            </div>

            <form className="stack-gap" onSubmit={handleMedicalPartnerSubmit}>
              <div className="grid-2">
                <label className="field">
                  <span>이름</span>
                  <input
                    value={medicalPartnerForm.name}
                    onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, name: e.target.value })}
                    placeholder="예: 화정정형외과 / 건강약국"
                  />
                </label>

                <label className="field">
                  <span>구분</span>
                  <select
                    value={medicalPartnerForm.place_type}
                    onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, place_type: e.target.value })}
                  >
                    <option value="병원">병원</option>
                    <option value="의원">의원</option>
                    <option value="한의원">한의원</option>
                    <option value="약국">약국</option>
                    <option value="검사센터">검사센터</option>
                    <option value="기타">기타</option>
                  </select>
                </label>
              </div>

              <div className="grid-2">
                <label className="field">
                  <span>카테고리</span>
                  <select
                    value={medicalPartnerForm.category}
                    onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, category: e.target.value })}
                  >
                    <option value="정형외과">정형외과</option>
                    <option value="재활의학과">재활의학과</option>
                    <option value="한의원">한의원</option>
                    <option value="약국">약국</option>
                    <option value="영상검사">영상검사</option>
                    <option value="기타">기타</option>
                  </select>
                </label>

                <label className="field">
                  <span>노출 여부</span>
                  <select
                    value={medicalPartnerForm.is_active ? 'Y' : 'N'}
                    onChange={(e) =>
                      setMedicalPartnerForm({
                        ...medicalPartnerForm,
                        is_active: e.target.value === 'Y',
                      })
                    }
                  >
                    <option value="Y">노출</option>
                    <option value="N">숨김</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>한줄 소개</span>
                <input
                  value={medicalPartnerForm.short_description}
                  onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, short_description: e.target.value })}
                  placeholder="예: 무릎/허리/어깨 통증 상담이 필요한 분께"
                />
              </label>

              <label className="field">
                <span>추천 이유</span>
                <textarea
                  rows="3"
                  value={medicalPartnerForm.recommend_reason}
                  onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, recommend_reason: e.target.value })}
                  placeholder="왜 이 병의원/약국을 안내하는지"
                />
              </label>

              <label className="field">
                <span>이런 분께 추천</span>
                <textarea
                  rows="3"
                  value={medicalPartnerForm.recommended_for}
                  onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, recommended_for: e.target.value })}
                  placeholder="예: 어깨 통증, 허리 통증, 검사 필요, 처방 상담 필요"
                />
              </label>

              <div className="grid-2">
                <label className="field">
                  <span>주소</span>
                  <input
                    value={medicalPartnerForm.address}
                    onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, address: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>전화번호</span>
                  <input
                    value={medicalPartnerForm.phone}
                    onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="field">
                  <span>운영/진료 시간</span>
                  <input
                    value={medicalPartnerForm.business_hours}
                    onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, business_hours: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>주차 안내</span>
                  <input
                    value={medicalPartnerForm.parking_info}
                    onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, parking_info: e.target.value })}
                  />
                </label>
              </div>

              <label className="field">
                <span>예약 방법</span>
                <textarea
                  rows="2"
                  value={medicalPartnerForm.reservation_guide}
                  onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, reservation_guide: e.target.value })}
                />
              </label>

              <label className="field">
                <span>주의사항</span>
                <textarea
                  rows="2"
                  value={medicalPartnerForm.caution}
                  onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, caution: e.target.value })}
                />
              </label>

              <div className="grid-2">
                <label className="field">
                  <span>담당자명</span>
                  <input
                    value={medicalPartnerForm.manager_name}
                    onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, manager_name: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>담당자 연락처</span>
                  <input
                    value={medicalPartnerForm.manager_phone}
                    onChange={(e) => setMedicalPartnerForm({ ...medicalPartnerForm, manager_phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="inline-actions wrap">
                <button type="submit" className="primary-btn">
                  {editingMedicalPartnerId ? '수정 저장' : '등록하기'}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setMedicalPartnerForm(emptyMedicalPartnerForm)
                    setEditingMedicalPartnerId(null)
                  }}
                >
                  초기화
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="section-head">
              <div>
                <h2>등록된 병의원·약국 소개</h2>
                <p className="sub-text">회원에게 보여줄 안내 목록입니다.</p>
              </div>
            </div>

            <div className="grid-2">
              <label className="field">
                <span>검색</span>
                <input
                  value={medicalPartnerSearch}
                  onChange={(e) => setMedicalPartnerSearch(e.target.value)}
                  placeholder="이름, 카테고리, 주소 검색"
                />
              </label>

              <label className="field">
                <span>카테고리 필터</span>
                <select
                  value={medicalPartnerCategoryFilter}
                  onChange={(e) => setMedicalPartnerCategoryFilter(e.target.value)}
                >
                  <option value="all">전체</option>
                  {medicalPartnerCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="list-stack">
              {filteredMedicalPartners.map((item) => (
                <div
                  key={item.id}
                  className={`list-card ${selectedMedicalPartnerId === item.id ? 'selected' : ''}`}
                >
                  <div className="list-card-top">
                    <div>
                      <strong>{item.name}</strong>
                      <div className="compact-text">
                        {item.place_type} · {item.category}
                      </div>
                      <div className="compact-text">{item.short_description || '-'}</div>
                    </div>

                    <div className="inline-actions wrap">
                      <span className="pill">{item.is_active ? '노출중' : '숨김'}</span>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                          setSelectedMedicalPartnerId(item.id)
                          setCollapsedMedicalPartnerDetail((prev) =>
                            selectedMedicalPartnerId === item.id ? !prev : false
                          )
                        }}
                      >
                        상세보기
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleMedicalPartnerEdit(item)}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handleMedicalPartnerDelete(item.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {selectedMedicalPartnerId === item.id && !collapsedMedicalPartnerDetail && (
                    <div className="detail-box">
                      <p><strong>추천 이유:</strong> {item.recommend_reason || '-'}</p>
                      <p><strong>이런 분께 추천:</strong> {item.recommended_for || '-'}</p>
                      <p><strong>주소:</strong> {item.address || '-'}</p>
                      <p><strong>전화번호:</strong> {item.phone || '-'}</p>
                      <p><strong>운영/진료 시간:</strong> {item.business_hours || '-'}</p>
                      <p><strong>주차 안내:</strong> {item.parking_info || '-'}</p>
                      <p><strong>예약 방법:</strong> {item.reservation_guide || '-'}</p>
                      <p><strong>주의사항:</strong> {item.caution || '-'}</p>
                    </div>
                  )}
                </div>
              ))}

              {filteredMedicalPartners.length === 0 && (
                <div className="list-card">
                  <p className="compact-text">등록된 병의원·약국 소개 항목이 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
     {activeTab === '문의사항' && (
  <div className="card">
    <div className="member-list-header">
      <h2>문의사항 목록</h2>

      <div className="member-list-search-area">
        <input
          placeholder="이름 / 연락처 / 문의내용 / 답변 검색"
          value={inquirySearch}
          onChange={(e) => setInquirySearch(e.target.value)}
        />

        <div className="member-list-filter-row">
          <input
            type="date"
            value={inquiryDateFilter}
            onChange={(e) => setInquiryDateFilter(e.target.value)}
          />

          <select
            value={inquiryStatusFilter}
            onChange={(e) => setInquiryStatusFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="pending">미답변</option>
            <option value="answered">답변완료</option>
            <option value="private">코치님만 보기</option>
          </select>
        </div>

        <div className="inline-actions wrap">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setInquirySearch('')
              setInquiryDateFilter('')
              setInquiryStatusFilter('all')
            }}
          >
            초기화
          </button>
        </div>
      </div>
    </div>

    <div className="list-stack">
      {filteredInquiries.length === 0 ? (
        <div className="workout-list-empty">조건에 맞는 문의가 없습니다.</div>
      ) : null}

      {filteredInquiries.map((item) => {
        const collapsed = collapsedInquiries[item.id] ?? true
        const isAnswered = String(item.answer || '').trim().length > 0

        return (
          <div key={item.id} className="list-card">
            <div className="list-card-top">
              <div>
                <strong>{item.name || '익명'}</strong>
                <div className="compact-text">{item.phone || '-'}</div>
              </div>

              <div className="inline-actions wrap">
                <span className="pill">{isAnswered ? '답변완료' : '미답변'}</span>
                <span className="pill">{(item.created_at || '').slice(0, 10)}</span>
              </div>
            </div>

            <div className="compact-text">
              {(item.content || '').slice(0, 50)}
              {(item.content || '').length > 50 ? '...' : ''}
            </div>

            <div className="compact-text">
              {item.is_private ? '코치님만 보기 문의' : '일반 문의'} / {item.is_secret_reply ? '비밀답변 설정' : '일반답변'}
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
                onClick={async () => {
                  if (!window.confirm('삭제할까요?')) return
                  await supabase.from('inquiries').delete().eq('id', item.id)
                  await loadInquiries()
                }}
              >
                삭제
              </button>
            </div>

            {!collapsed && (
              <div className="detail-box stack-gap">
                <p><strong>이름:</strong> {item.name || '-'}</p>
                <p><strong>연락처:</strong> {item.phone || '-'}</p>
                <p><strong>작성일:</strong> {(item.created_at || '').slice(0, 16).replace('T', ' ') || '-'}</p>
                <p><strong>내용:</strong> {item.content || '-'}</p>
                <p><strong>문의유형:</strong> {item.is_private ? '코치님만 보기' : '일반 문의'}</p>
                <p><strong>답변유형:</strong> {item.is_secret_reply ? '비밀답변' : '일반답변'}</p>
                <p><strong>답변상태:</strong> {isAnswered ? '답변완료' : '미답변'}</p>

                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={!!item.is_secret_reply}
                    onChange={async (e) => {
                      await supabase
                        .from('inquiries')
                        .update({ is_secret_reply: e.target.checked })
                        .eq('id', item.id)
                      await loadInquiries()
                    }}
                  />
                  <span>비밀답변으로 설정</span>
                </label>

                <label className="field">
                  <span>답변</span>
                  <textarea
                    rows="4"
                    defaultValue={item.answer || ''}
                    onBlur={async (e) => {
                      await supabase
                        .from('inquiries')
                        .update({ answer: e.target.value })
                        .eq('id', item.id)
                      await loadInquiries()
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        )
      })}
    </div>
  </div>
)}
        </div>
      </section>
    </div>
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
        간략히보기: {diet.meal_type || '식단'} / {diet.meal_time || '-'} / {diet.content?.slice(0, 24) || ''}
        {diet.content?.length > 24 ? '...' : ''}
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
        <DietFeedbackEditor
          diet={diet}
          feedback={feedback}
          setFeedback={setFeedback}
          onSave={onSave}
        />
      ) : null}
    </div>
  )
}

function DietFeedbackEditor({ diet, feedback, setFeedback, onSave }) {
  const [local, setLocal] = useState({
    meal_type: diet.meal_type || '식단',
    meal_time: diet.meal_time || '',
    carb_g: diet.carb_g || 0,
    protein_g: diet.protein_g || 0,
    fat_g: diet.fat_g || 0,
    product_brand: diet.product_brand || '',
    product_name: diet.product_name || '',
    meal_category: diet.meal_category || '일반식',
    hunger_level: diet.hunger_level || 0,
    member_note: diet.member_note || '',
    content: diet.content || '',
  })

  useEffect(() => {
    setLocal({
      meal_type: diet.meal_type || '식단',
      meal_time: diet.meal_time || '',
      carb_g: diet.carb_g || 0,
      protein_g: diet.protein_g || 0,
      fat_g: diet.fat_g || 0,
      product_brand: diet.product_brand || '',
      product_name: diet.product_name || '',
      meal_category: diet.meal_category || '일반식',
      hunger_level: diet.hunger_level || 0,
      member_note: diet.member_note || '',
      content: diet.content || '',
    })
  }, [diet])

  return (
    <div className="detail-box stack-gap">
      <p><strong>식단 종류:</strong> {local.meal_type}</p>
      <p><strong>시간:</strong> {local.meal_time || '-'}</p>
      <p><strong>내용:</strong> {local.content || '-'}</p>
      <p><strong>탄수/단백질/지방:</strong> {local.carb_g || 0}g / {local.protein_g || 0}g / {local.fat_g || 0}g</p>
      <p><strong>제품:</strong> {local.product_brand || '-'} / {local.product_name || '-'}</p>
      <p><strong>식사 유형:</strong> {local.meal_category || '-'}</p>
      <p><strong>배고픔 정도:</strong> {local.hunger_level || 0}</p>
      <p><strong>회원 메모:</strong> {local.member_note || '-'}</p>

      <label className="field">
        <span>코치 피드백</span>
        <textarea rows="4" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      </label>

      <button
        type="button"
        className="primary-btn"
        onClick={() =>
          onSave(diet.id, {
            coach_feedback: feedback,
          })
        }
      >
        피드백 저장
      </button>
    </div>
  )
}

function MiniBarChart({ data = [] }) {
  const maxValue = Math.max(...data.map((item) => Number(item.value || 0)), 0)

  return (
    <div className="mini-chart">
      {data.length === 0 ? <div className="compact-text">표시할 데이터가 없습니다.</div> : null}
      {data.map((item) => {
        const width = maxValue > 0 ? Math.max((Number(item.value || 0) / maxValue) * 100, 4) : 0
        return (
          <div key={item.label} className="mini-chart-row">
            <div className="mini-chart-label">{item.label}</div>
            <div className="mini-chart-bar-wrap">
              <div className="mini-chart-bar" style={{ width: `${width}%` }} />
            </div>
            <div className="mini-chart-value">{Number(item.value || 0).toLocaleString()}</div>
          </div>
        )
      })}
    </div>
  )
}
