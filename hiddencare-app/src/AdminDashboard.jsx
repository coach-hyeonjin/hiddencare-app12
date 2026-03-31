import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import logo from './assets/logo.png'

const TABS = [
  '회원',
  '회원상세',
  '기록작성',
  '운동DB',
  '식단',
  '통계',
'운영대시보드',
'코치관리',
'리포트',
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

const emptyWorkoutItem = {
  exercise_id: '',
  exercise_name_snapshot: '',
  is_cardio: false,
  cardio_minutes: '',
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
  sales_result: 'pending',
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
  { value: 'pending', label: '진행중' },
  { value: 'consulted', label: '상담완료' },
  { value: 'proposal', label: '제안완료' },
  { value: 'followup', label: '후속관리중' },
  { value: 'closed', label: '결제완료' },
  { value: 'lost', label: '이탈' },
]
const salesEmotionOptions = ['적극적', '보통', '고민많음', '반신반의', '가격민감', '의지낮음']
const salesConversionOptions = [
  { value: 'high', label: '높음' },
  { value: 'middle', label: '중간' },
  { value: 'low', label: '낮음' },
]
const salesFailReasonOptions = ['가격부담', '시간부족', '거리문제', '필요성부족', '비교중', '보호자/배우자상의', '운동의지부족', '기타']
const CONDITION_CHECKLIST = [
  '아침에 일어났을 때 몸이 가볍다',
  '근육통이나 몸살 느낌이 거의 없다',
  '수업할 때 힘이 잘 들어간다',
  '하루 에너지가 무난하게 유지된다',
  '몸 상태가 전반적으로 편안하다',
]

const FATIGUE_CHECKLIST = [
  '몸이 무겁다',
  '수업 후 급격히 지친다',
  '잠을 자도 피로가 남는다',
  '허리나 하체 피로가 누적된다',
  '오후로 갈수록 체력이 확 떨어진다',
]

const STRESS_CHECKLIST = [
  '회원/업무 때문에 신경 쓸 일이 많다',
  '감정적으로 피곤하다',
  '생각이 많아 머리가 복잡하다',
  '압박감이 느껴진다',
  '짜증이나 예민함이 올라온다',
]

const FOCUS_CHECKLIST = [
  '수업 집중이 잘 된다',
  '코칭 흐름이 자연스럽다',
  '실수가 적다',
  '해야 할 우선순위가 잘 보인다',
  '업무 전환이 비교적 깔끔하다',
]

const PERFORMANCE_ACTION_SECTIONS = [
  {
    key: 'lead_actions',
    title: '신규 유입 행동',
    items: [
      '워크인 회원에게 먼저 인사/응대했다',
      '상담 또는 OT 제안을 했다',
      '블로그 글을 작성했다',
      'SNS 업로드(인스타/릴스/스레드)를 했다',
      '리뷰노트 체험단 모집을 진행했다',
      '회원/지인에게 소개 요청을 했다',
    ],
  },
  {
    key: 'retention_actions',
    title: '기존 회원 유지 행동',
    items: [
      '수업 후 피드백을 전달했다',
      '운동 영상 또는 과제를 전달했다',
      '미방문 회원에게 연락했다',
      '회원 상태를 기록했다',
      '다음 수업 방향을 안내했다',
    ],
  },
  {
    key: 'sales_actions',
    title: '전환 / 재등록 행동',
    items: [
      '상담을 진행했다',
      '프로그램 차별성을 설명했다',
      '가격/구성을 안내했다',
      '재등록 제안을 했다',
      '보류 이유를 기록했다',
    ],
  },
  {
    key: 'growth_actions',
    title: '브랜딩 / 확장 행동',
    items: [
      '후기를 요청하거나 관리했다',
      '제휴업체를 탐색했다',
      '제휴업체와 연락/미팅을 진행했다',
      '제휴업체를 실제 등록했다',
      '개인 브랜딩 콘텐츠를 기획했다',
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
  { min: 0, max: 5, label: '매우 부족' },
  { min: 6, max: 10, label: '기본' },
  { min: 11, max: 16, label: '양호' },
  { min: 17, max: 999, label: '고성과' },
]
const CHECK_GUIDE_TEXT = {
  condition: '컨디션은 "좋은 상태가 오늘 실제로 있었다"면 체크합니다. 없으면 체크 안 해도 됩니다.',
  fatigue: '피로도는 "오늘 실제로 피곤했던 느낌"이 있으면 체크합니다. 없으면 체크 안 해도 됩니다.',
  stress: '스트레스는 "오늘 업무/감정 부담이 실제로 느껴졌을 때"만 체크합니다. 없으면 체크 안 해도 됩니다.',
  focus: '집중도는 "오늘 일할 때 집중이 잘 됐다"면 체크합니다. 없으면 체크 안 해도 됩니다.',
}

const GOAL_GUIDE_ITEMS = [
  '이번 달 신규 상담을 몇 건 만들지 정합니다.',
  '회원 유지/재등록을 몇 건 챙길지 정합니다.',
  '블로그/SNS/후기/제휴 등 유입 행동 목표를 정합니다.',
  '숫자 목표를 적은 뒤, 아래 행동 가이드를 보고 실행합니다.',
]

const GOAL_ACTION_GUIDE = [
  '주 2회 이상 블로그 업로드',
  '주 2회 이상 SNS 업로드',
  '하루 3명 이상 상담 시도',
  '주 1회 이상 미방문 회원 연락',
  '주 1회 이상 재등록 제안',
  '월 1회 이상 제휴업체 연락 또는 미팅',
]

const REPORT_USAGE_GUIDE = [
  '평균 컨디션/피로도/스트레스/집중도를 먼저 봅니다.',
  '주의 필요 코치에 내가 포함되는지 확인합니다.',
  '이번 달 목표 평균을 보고 목표가 너무 높거나 낮은지 조정합니다.',
  '다음 액션 제안은 “이번 주 바로 실행할 것”으로 받아들이면 됩니다.',
]

const getConditionScoreLabel = (score, type) => {
  if (type === 'condition' || type === 'focus') {
    if (score >= 4) return '좋음'
    if (score === 3) return '보통'
    return '낮음'
  }

  if (score >= 4) return '높음'
  if (score === 3) return '보통'
  return '낮음'
}

const getConditionSummaryText = ({ conditionScore, fatigueScore, stressScore, focusScore }) => {
  if (conditionScore >= 4 && fatigueScore <= 2 && stressScore <= 2 && focusScore >= 4) {
    return '전반적으로 좋은 상태입니다. 현재 루틴을 유지해도 괜찮습니다.'
  }

  if (fatigueScore >= 4 && stressScore >= 4) {
    return '피로와 스트레스가 모두 높은 상태입니다. 일정 조절과 회복 확보가 먼저입니다.'
  }

  if (fatigueScore >= 4) {
    return '피로가 높은 상태입니다. 수업 수, 휴식 시간, 생활 리듬을 먼저 점검하세요.'
  }

  if (stressScore >= 4) {
    return '스트레스가 높은 상태입니다. 업무 부담과 감정 소모가 큰지 먼저 확인하세요.'
  }

  if (focusScore <= 2) {
    return '집중도가 낮은 상태입니다. 우선순위를 단순하게 정리하고 중요한 일부터 처리하세요.'
  }

  return '현재 상태는 보통 수준입니다. 관리 여부에 따라 좋아질 수도, 무너질 수도 있습니다.'
}

const getCoachRecordActionGuide = (item) => {
  const guides = []

  if (Number(item.fatigue_score || 0) >= 4) guides.push('휴식 시간과 수업 분배부터 점검')
  if (Number(item.stress_score || 0) >= 4) guides.push('업무 부담/감정 소모 원인 확인')
  if (Number(item.focus_score || 0) <= 2) guides.push('중요 업무 1~2개만 먼저 처리')
  if (Number(item.performance_score || 0) <= 5) guides.push('상담·재등록·콘텐츠 행동 추가')

  if (!guides.length) guides.push('현재 흐름 유지')

  return guides
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
export default function AdminDashboard({ profile, currentAdminId, currentGymId, onLogout }) {
  const [activeTab, setActiveTab] = useState('회원')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [members, setMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [memberForm, setMemberForm] = useState(emptyMemberForm)
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [memberSearch, setMemberSearch] = useState('')
  const [memberDetailSearch, setMemberDetailSearch] = useState('')
  const [memberProgramFilter, setMemberProgramFilter] = useState('')
  const [memberStatusFilter, setMemberStatusFilter] = useState('all')

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
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState('all')
  const [workoutDateFilter, setWorkoutDateFilter] = useState('')

  const [brands, setBrands] = useState([])
  const [brandForm, setBrandForm] = useState(emptyBrandForm)
  const [editingBrandId, setEditingBrandId] = useState(null)

  const [exercises, setExercises] = useState([])
  const [exerciseForm, setExerciseForm] = useState(emptyExerciseForm)
  const [editingExerciseId, setEditingExerciseId] = useState(null)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [collapsedExercises, setCollapsedExercises] = useState({})
  const [bulkExerciseText, setBulkExerciseText] = useState(defaultBulkExerciseText)
  const [showBulkInput, setShowBulkInput] = useState(false)

  const [dietLogs, setDietLogs] = useState([])
  const [collapsedDiets, setCollapsedDiets] = useState({})
  const [dietMemberFilter, setDietMemberFilter] = useState('')
  const [dietSearch, setDietSearch] = useState('')

  const [routineForm, setRoutineForm] = useState({ title: '루틴', content: '' })
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
const [editingCoachConditionId, setEditingCoachConditionId] = useState(null)
const [coachConditionMonth, setCoachConditionMonth] = useState(new Date().toISOString().slice(0, 7))
const [coachConditionCoachFilter, setCoachConditionCoachFilter] = useState('')

const [coachReviews, setCoachReviews] = useState([])
const [coachReviewForm, setCoachReviewForm] = useState(emptyCoachReviewForm)
const [editingCoachReviewId, setEditingCoachReviewId] = useState(null)
const [coachReviewMonth, setCoachReviewMonth] = useState(new Date().toISOString().slice(0, 7))
const [coachReviewCoachFilter, setCoachReviewCoachFilter] = useState('')
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
  sound: true,
  popup: true,
})

const [adminAlerts, setAdminAlerts] = useState([])
const [unreadInquiryCount, setUnreadInquiryCount] = useState(0)
const [unreadNoticeCount, setUnreadNoticeCount] = useState(0)
  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) || null,
    [members, selectedMemberId],
  )
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

const getCoachStatusText = ({ conditionScore, fatigueScore, stressScore, focusScore, performanceScore }) => {
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
  const conditionScore = getPositiveScoreByCheckCount((form.condition_checks || []).length)
  const fatigueScore = getNegativeScoreByCheckCount((form.fatigue_checks || []).length)
  const stressScore = getNegativeScoreByCheckCount((form.stress_checks || []).length)
  const focusScore = getPositiveScoreByCheckCount((form.focus_checks || []).length)

  const performanceScore =
    (form.lead_actions || []).length +
    (form.retention_actions || []).length +
    (form.sales_actions || []).length +
    (form.growth_actions || []).length

  const statusLevel = getCoachStatusLevelKey({
    conditionScore,
    fatigueScore,
    stressScore,
    focusScore,
  })

  const performanceLevel = getPerformanceLevel(performanceScore)

  return {
    conditionScore,
    fatigueScore,
    stressScore,
    focusScore,
    performanceScore,
    statusLevel,
    performanceLevel,
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
  }, [members, workouts])

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
          sum + Math.max(Number(member.total_sessions || 0) - Number(member.used_sessions || 0), 0),
        0,
      ),
    }
  }, [workouts, members])

  const filteredSchedules = useMemo(() => {
    return coachSchedules.filter((schedule) => getMonthKey(schedule.schedule_date) === scheduleMonth)
  }, [coachSchedules, scheduleMonth])

  const workoutCards = useMemo(() => {
    return workouts
      .map((workout) => {
        const member = members.find((item) => item.id === workout.member_id)
        const items = workoutItemsMap[workout.id] || []
        const exerciseNames = items.map((item) => item.exercise_name_snapshot).join(' ')
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
    closed: filteredSalesLogs.filter((log) => log.sales_result === 'closed').length,
    followup: filteredSalesLogs.filter((log) => log.sales_result === 'followup').length,
    lost: filteredSalesLogs.filter((log) => log.sales_result === 'lost').length,
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

  const total = filteredCoachConditions.length

  return {
    revenueGoalAvg:
      filteredCoachConditions.reduce((sum, item) => sum + Number(item.monthly_goal_revenue || 0), 0) / total,
    newLeadGoalAvg:
      filteredCoachConditions.reduce((sum, item) => sum + Number(item.monthly_goal_new_leads || 0), 0) / total,
    retentionGoalAvg:
      filteredCoachConditions.reduce((sum, item) => sum + Number(item.monthly_goal_retention || 0), 0) / total,
    contentGoalAvg:
      filteredCoachConditions.reduce((sum, item) => sum + Number(item.monthly_goal_content || 0), 0) / total,
  }
}, [filteredCoachConditions])
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
}, [inquiries, notices, adminAlertSettings, currentAdminId])
  useEffect(() => {
  const interval = setInterval(() => {
    loadInquiries()
    loadNotices()
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
      setRoutineForm({ title: '루틴', content: '' })
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
      ['loadInquiries', () => loadInquiries()],
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

  const { data } = await supabase
    .from('members')
    .select('*, programs(id, name)')
    .eq('admin_id', currentAdminId)
    .order('created_at', { ascending: false })

  if (data) {
    setMembers(data)
    if (!selectedMemberId && data[0]) setSelectedMemberId(data[0].id)
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
    .order('created_at', { ascending: false })

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
    return
  }

  const { data: workoutData } = await supabase
    .from('workouts')
    .select('*')
    .eq('admin_id', currentAdminId)
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
    return
  }

  const { data } = await supabase
    .from('sales_records')
    .select('*, members(id, name), programs(id, name)')
    .eq('admin_id', currentAdminId)
    .order('sale_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (data) {
    const collapsed = {}
    data.forEach((sale) => {
      collapsed[sale.id] = true
    })
    setSalesRecords(data)
    setCollapsedSales(collapsed)
  }
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
    localStorage.setItem(`admin_alert_settings_${currentAdminId || 'default'}`, JSON.stringify(next))
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
      setRoutineForm({ title: '루틴', content: '' })
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
    const isCardio = found?.category === '유산소'

    nextItems[itemIndex] = {
      ...nextItems[itemIndex],
      exercise_id: found?.id || '',
      exercise_name_snapshot: found?.name || nextItems[itemIndex].exercise_name_snapshot,
      is_cardio: !!isCardio,
      cardio_minutes: isCardio ? nextItems[itemIndex].cardio_minutes || '' : '',
      sets: isCardio ? [{ kg: '', reps: '' }] : nextItems[itemIndex].sets,
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
    nextSets[setIndex] = { ...nextSets[setIndex], [field]: value }
    nextItems[itemIndex] = { ...nextItems[itemIndex], sets: nextSets }
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
    is_cardio: !!item.is_cardio,
    cardio_minutes: item.is_cardio ? Number(item.cardio_minutes || 0) : null,
    sets: item.is_cardio ? [] : normalizeSets(item.sets),
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
      items:
  items.length > 0
    ? items.map((item) => ({
        exercise_id: item.exercise_id || '',
        exercise_name_snapshot: item.exercise_name_snapshot || '',
        is_cardio: !!item.is_cardio,
        cardio_minutes: item.cardio_minutes || '',
        sets:
          !item.is_cardio && Array.isArray(item.sets) && item.sets.length > 0
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
  admin_id: currentAdminId || null,
  gym_id: currentGymId || null,
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
  admin_id: currentAdminId || null,
  gym_id: currentGymId || null,
}

    if (!payload.name) {
      setMessage('프로그램명을 입력해주세요.')
      return
    }

    if (editingProgramId) {
      await supabase.from('programs').update(payload).eq('id', editingProgramId)
      setMessage('프로그램이 수정되었습니다.')
    } else {
      await supabase.from('programs').insert(payload)
      setMessage('프로그램이 추가되었습니다.')
    }

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

    if (editingSaleId) {
      await supabase.from('sales_records').update(payload).eq('id', editingSaleId)
      setMessage('매출 기록이 수정되었습니다.')
    } else {
      await supabase.from('sales_records').insert(payload)
      setMessage('매출 기록이 저장되었습니다.')
    }

    resetSaleForm()
    await loadSalesRecords()
    await loadSalesSummary(saleMonth)
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

  const handleSaleDelete = async (saleId) => {
    if (!window.confirm('매출 기록을 삭제할까요?')) return
    await supabase.from('sales_records').delete().eq('id', saleId)
    await loadSalesRecords()
    await loadSalesSummary(saleMonth)
    setMessage('매출 기록이 삭제되었습니다.')
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
    sales_result: salesLogForm.sales_result || 'pending',
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
    sales_result: log.sales_result || 'pending',
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

    monthly_goal_revenue: Number(coachConditionForm.monthly_goal_revenue || 0),
    monthly_goal_new_leads: Number(coachConditionForm.monthly_goal_new_leads || 0),
    monthly_goal_retention: Number(coachConditionForm.monthly_goal_retention || 0),
    monthly_goal_content: Number(coachConditionForm.monthly_goal_content || 0),

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

    monthly_goal_revenue: item.monthly_goal_revenue ?? '',
    monthly_goal_new_leads: item.monthly_goal_new_leads ?? '',
    monthly_goal_retention: item.monthly_goal_retention ?? '',
    monthly_goal_content: item.monthly_goal_content ?? '',

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
  if (!filteredCoachConditions.length) return '이번 달 코치 컨디션 기록이 없습니다.'
  if (coachConditionSummary.avgFatigue >= 4) return '코치 피로도가 높은 상태입니다. 스케줄 조정이 필요합니다.'
  if (coachConditionSummary.avgStress >= 4) return '업무 스트레스가 높은 상태입니다. 운영 점검이 필요합니다.'
  if (coachConditionSummary.avgCondition >= 4) return '전반적인 코치 컨디션은 안정적입니다.'
  return '코치 컨디션은 보통 수준입니다.'
}

const getSalesAutoFeedback = () => {
  const total = Number(salesStatsExtended.totalSales || 0)
  const count = Number(salesStatsExtended.totalCount || 0)
  const vip = Number(salesStatsExtended.vipCount || 0)

  if (count === 0) return '이번 달 등록된 매출 기록이 없습니다.'
  if (total >= 3000000) return '좋습니다. 이번 달 매출 흐름이 안정적입니다.'
  if (vip >= 3) return 'VIP 전환이 잘 이루어지고 있습니다.'
  if (total < 1000000) return '이번 달은 신규 등록/재등록 전환 전략 점검이 필요합니다.'
  return '현재 매출 흐름은 보통 수준입니다. 결제수단과 프로그램 전환율을 함께 보세요.'
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

  if (loading) {
    return <div className="loading-card">데이터 불러오는 중...</div>
  }

  return (
    <div className="dashboard-shell">
      <div className="admin-alert-bar">
  <div className="admin-alert-summary">
    <strong>알림</strong>
    <span>문의 {unreadInquiryCount}건 / 공지 {unreadNoticeCount}건</span>
  </div>

  <div className="admin-alert-settings">
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

  {adminAlerts.length > 0 && (
    <div className="admin-alert-list">
      {adminAlerts.map((alert) => (
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
                <input value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
              </label>

              <label className="field">
                <span>목표</span>
                <input value={memberForm.goal} onChange={(e) => setMemberForm({ ...memberForm, goal: e.target.value })} />
              </label>

              <label className="field">
                <span>현재 프로그램</span>
                <select
                  value={memberForm.current_program_id}
                  onChange={(e) => setMemberForm({ ...memberForm, current_program_id: e.target.value })}
                >
                  <option value="">선택 안함</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
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
                <span>회원 메모(회원에게 보임)</span>
                <textarea rows="4" value={memberForm.memo} onChange={(e) => setMemberForm({ ...memberForm, memo: e.target.value })} />
              </label>

              <label className="field">
                <span>Access Code</span>
                <div className="inline-actions">
                  <input
                    value={memberForm.access_code}
                    onChange={(e) => setMemberForm({ ...memberForm, access_code: e.target.value.toUpperCase() })}
                  />
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setMemberForm((prev) => ({ ...prev, access_code: randomCode() }))}
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
  <div className="member-list-header">
    <h2>회원 목록</h2>

    <div className="member-list-search-area">
      <input
        placeholder="이름 / 목표 / 프로그램 검색"
        value={memberSearch}
        onChange={(e) => setMemberSearch(e.target.value)}
      />

      <div className="member-list-filter-row">
        <select value={memberProgramFilter} onChange={(e) => setMemberProgramFilter(e.target.value)}>
          <option value="">전체 프로그램</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select value={memberStatusFilter} onChange={(e) => setMemberStatusFilter(e.target.value)}>
          <option value="all">전체</option>
          <option value="remaining">잔여 있음</option>
          <option value="ended">소진</option>
        </select>
      </div>
    </div>
  </div>

 <div className="list-stack">

  {filteredMemberStats.length === 0 ? (
    <div className="workout-list-empty">검색 결과가 없습니다.</div>
  ) : null}

  {filteredMemberStats.map((member) => {
                const isSelected = selectedMemberId === member.id
                return (
                  <div
                    key={member.id}
                    className={`list-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedMemberId(member.id)
                      setActiveTab('회원상세')
                   }}
                  >
                    <div className="list-card-top">
                      <strong>{member.name}</strong>
                      <span className="pill">남은 {member.remainingSessions}회</span>
                    </div>

                    <div className="compact-text">
                      목표: {member.goal || '-'} / Access: {member.access_code}
                    </div>
                    <div className="compact-text">
                      PT {member.ptCount}회 / 개인운동 {member.personalCount}회 / 프로그램 {member.programs?.name || '-'}
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

          </section>
        </div>
      )}
{activeTab === '회원상세' && selectedMember && (
  <div className="card">
    <h2>회원 상세</h2>

    <div className="sub-card">
      <h3>선택 회원 상세 / 루틴 관리</h3>
      <div className="detail-box">
        <p><strong>이름:</strong> {selectedMember.name}</p>
        <p><strong>목표:</strong> {selectedMember.goal || '-'}</p>
        <p><strong>프로그램:</strong> {selectedMember.programs?.name || '-'}</p>
        <p><strong>기간:</strong> {formatDate(selectedMember.start_date)} ~ {formatDate(selectedMember.end_date)}</p>
        <p><strong>회원 메모:</strong> {selectedMember.memo || '-'}</p>
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
)}

      {activeTab === '기록작성' && (
        <div className="two-col">
          <section className="card">
            <h2>운동 기록 작성 / 수정</h2>

            <form className="stack-gap" onSubmit={handleWorkoutSubmit}>
              <div className="grid-2">
                <label className="field">
                  <span>회원 선택</span>
                  <select value={workoutForm.member_id} onChange={(e) => setWorkoutForm({ ...workoutForm, member_id: e.target.value })}>
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
                <select value={workoutForm.workout_type} onChange={(e) => setWorkoutForm({ ...workoutForm, workout_type: e.target.value })}>
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
                      <select value={item.exercise_id} onChange={(e) => updateWorkoutItemSelect(itemIndex, e.target.value)}>
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
{item.is_cardio ? (
  <label className="field">
    <span>유산소 시간(분)</span>
    <input
      type="number"
      value={item.cardio_minutes || ''}
      onChange={(e) => {
        const value = e.target.value
        setWorkoutForm((prev) => {
          const nextItems = [...prev.items]
          nextItems[itemIndex] = {
            ...nextItems[itemIndex],
            cardio_minutes: value,
          }
          return { ...prev, items: nextItems }
        })
      }}
      placeholder="예: 20"
    />
  </label>
) : (
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
          onClick={() => removeSet(itemIndex, setIndex)}
          disabled={item.sets.length === 1}
        >
          세트 삭제
        </button>
      </div>
    ))}

    <button type="button" className="secondary-btn" onClick={() => addSet(itemIndex)}>
      세트 추가
    </button>
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
                <textarea rows="3" value={workoutForm.good} onChange={(e) => setWorkoutForm({ ...workoutForm, good: e.target.value })} />
              </label>

              <label className="field">
                <span>보완점</span>
                <textarea rows="3" value={workoutForm.improve} onChange={(e) => setWorkoutForm({ ...workoutForm, improve: e.target.value })} />
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

  <div className="stack-gap">
    <div className="workout-filter-grid">
      <label className="field">
        <span>회원 검색</span>
        <select value={workoutMemberFilter} onChange={(e) => setWorkoutMemberFilter(e.target.value)}>
          <option value="">전체 회원</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
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

                  <button type="button" className="secondary-btn" onClick={() => handleWorkoutEdit(workout)}>
                    수정
                  </button>

                  <button type="button" className="danger-btn" onClick={() => handleWorkoutDelete(workout)}>
                    삭제
                  </button>
                </div>

                {!collapsed ? (
                  <div className="detail-box">
  <div className="workout-detail-items">
    {workout.items.map((item) => (
      <div key={item.id} className="record-item-box">
        <strong>{item.exercise_name_snapshot}</strong>

        {item.is_cardio ? (
          <div className="compact-text">유산소 {item.cardio_minutes || 0}분</div>
        ) : (
          <ul className="set-list">
            {(item.sets || []).map((setRow, idx) => (
              <li key={idx}>
                {idx + 1}세트 - {setRow.kg || '-'}kg / {setRow.reps || '-'}회
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </div>

  <div className="workout-detail-summary">
    <p><strong>잘한점:</strong> {workout.good || '-'}</p>
    <p><strong>보완점:</strong> {workout.improve || '-'}</p>
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
      )}

      {activeTab === '운동DB' && (
        <div className="two-col">
          <section className="card">
            <h2>브랜드 관리</h2>
            <form className="stack-gap" onSubmit={handleBrandSubmit}>
              <label className="field">
                <span>브랜드명</span>
                <input value={brandForm.name} onChange={(e) => setBrandForm({ name: e.target.value })} />
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
                    <button type="button" className="danger-btn" onClick={() => handleBrandDelete(brand.id)}>
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="section-head">
              <h2>운동 관리</h2>
              <button type="button" className="secondary-btn" onClick={() => setShowBulkInput((prev) => !prev)}>
                {showBulkInput ? '개별 입력만 보기' : '일괄 입력 열기'}
              </button>
            </div>

            <form className="stack-gap" onSubmit={handleExerciseSubmit}>
              <label className="field">
                <span>운동명</span>
                <input value={exerciseForm.name} onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })} />
              </label>

              <div className="grid-3">
                <label className="field">
                  <span>부위</span>
                  <input value={exerciseForm.body_part} onChange={(e) => setExerciseForm({ ...exerciseForm, body_part: e.target.value })} />
                </label>
                <label className="field">
                  <span>카테고리</span>
                  <input value={exerciseForm.category} onChange={(e) => setExerciseForm({ ...exerciseForm, category: e.target.value })} />
                </label>
                <label className="field">
                  <span>브랜드</span>
                  <select value={exerciseForm.brand_id} onChange={(e) => setExerciseForm({ ...exerciseForm, brand_id: e.target.value })}>
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

            {showBulkInput ? (
              <div className="sub-card">
                <h3>운동DB 일괄 입력</h3>
                <p className="sub-text">형식: 브랜드|운동명|부위|카테고리</p>
                <label className="field">
                  <span>여러 줄 입력</span>
                  <textarea rows="8" value={bulkExerciseText} onChange={(e) => setBulkExerciseText(e.target.value)} />
                </label>
                <button type="button" className="primary-btn" onClick={handleBulkExerciseInsert}>
                  일괄 등록
                </button>
              </div>
            ) : null}

            <label className="field">
              <span>검색</span>
              <input value={exerciseSearch} onChange={(e) => setExerciseSearch(e.target.value)} placeholder="운동명 / 브랜드 / 부위" />
            </label>

            <div className="list-stack">
              {filteredExercises.map((exercise) => {
                const collapsed = collapsedExercises[exercise.id] ?? true
                return (
                  <div key={exercise.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{exercise.name}</strong>
                      <span className="pill">{exercise.brands?.name || '브랜드없음'}</span>
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
                          })
                        }}
                      >
                        수정
                      </button>

                      <button type="button" className="danger-btn" onClick={() => handleExerciseDelete(exercise.id)}>
                        삭제
                      </button>
                    </div>

                    {!collapsed ? (
                      <div className="detail-box">
                        <p><strong>운동명:</strong> {exercise.name}</p>
                        <p><strong>브랜드:</strong> {exercise.brands?.name || '-'}</p>
                        <p><strong>부위:</strong> {exercise.body_part || '-'}</p>
                        <p><strong>카테고리:</strong> {exercise.category || '-'}</p>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
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
{activeTab === '운영대시보드' && (
  <div className="stack-gap">
    <div className="section-head">
      <div>
        <h2>운영 대시보드</h2>
        <p className="sub-text">숫자만 보는 화면이 아니라, 지금 무엇을 먼저 봐야 하는지 정리하는 화면입니다.</p>
      </div>
    </div>

    <div className="coach-summary-grid">
      <div className="coach-summary-card">
        <span>이번달 총 매출</span>
        <strong>{Number(salesStatsExtended.totalSales || 0).toLocaleString()}원</strong>
        <div className="compact-text">
          결제 {salesStatsExtended.totalCount || 0}건 / VIP {salesStatsExtended.vipCount || 0}건
        </div>
      </div>

      <div className="coach-summary-card">
        <span>신규 전환 현황</span>
        <strong>{salesLogSummary.closed || 0}건</strong>
        <div className="compact-text">
          세일즈일지 {salesLogSummary.total || 0}건 중 결제완료 {salesLogSummary.closed || 0}건
        </div>
      </div>

      <div className="coach-summary-card">
        <span>후속관리 필요</span>
        <strong>{salesLogSummary.followup || 0}건</strong>
        <div className="compact-text">
          지금 바로 다시 확인해야 할 잠재 결제 고객 수
        </div>
      </div>

      <div className="coach-summary-card">
        <span>코치 상태</span>
        <strong>{Number(coachConditionSummary.avgCondition || 0).toFixed(1)}</strong>
        <div className="compact-text">
          평균 피로도 {Number(coachConditionSummary.avgFatigue || 0).toFixed(1)} / 스트레스 {Number(coachConditionSummary.avgStress || 0).toFixed(1)}
        </div>
      </div>
    </div>
<div className="report-grid">
  <div className="card">
    <h2>코치 운영 요약</h2>
    <p>평균 컨디션: {Number(coachConditionSummary.avgCondition || 0).toFixed(1)}</p>
    <p>평균 피로도: {Number(coachConditionSummary.avgFatigue || 0).toFixed(1)}</p>
    <p>평균 스트레스: {Number(coachConditionSummary.avgStress || 0).toFixed(1)}</p>
    <p>평균 집중도: {Number(coachConditionSummary.avgFocus || 0).toFixed(1)}</p>
    <p>평균 행동 점수: {Number(coachDashboardSummary.avgPerformance || 0).toFixed(1)}</p>
    <p>현재 운영 레벨: {coachDashboardSummary.statusLabel || '-'}</p>
    <p>자동 판단: {coachDashboardSummary.statusText || '-'}</p>
  </div>

  <div className="card">
    <h2>주의 필요 코치</h2>
    {coachAlertList.length === 0 ? (
      <p>현재 주의 필요 코치가 없습니다.</p>
    ) : (
      <div className="list-stack">
        {coachAlertList.map((item) => (
          <div key={item.id} className="list-card">
            <div className="list-card-top">
              <strong>{item.coaches?.name || '이름 없음'}</strong>
              <span className="pill">주의</span>
            </div>
            <div className="compact-text">
              {item.reasons.join(', ')}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
    <div className="report-grid">
      <div className="card">
        <h2>지금 확인할 것</h2>
        <div className="list-stack">
          <div className="list-card">
            <div className="list-card-top">
              <strong>후속관리 대상</strong>
              <span className="pill">{salesLogSummary.followup || 0}건</span>
            </div>
            <div className="compact-text">
              결제 직전이거나 추가 설득이 필요한 리드입니다. 세일즈일지에서 후속관리중 항목 먼저 확인하세요.
            </div>
          </div>

          <div className="list-card">
            <div className="list-card-top">
              <strong>이탈 고객</strong>
              <span className="pill">{salesLogSummary.lost || 0}건</span>
            </div>
            <div className="compact-text">
              가격, 시간, 필요성 부족 등 이탈 사유를 확인해서 다음 상담 방식에 반영해야 합니다.
            </div>
          </div>

          <div className="list-card">
            <div className="list-card-top">
              <strong>컨디션 기록 수</strong>
              <span className="pill">{filteredCoachConditions.length || 0}건</span>
            </div>
            <div className="compact-text">
              이번달 코치 컨디션 기록이 적으면 평균값만 보고 판단하기 어렵습니다.
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>자동 판단</h2>
        <div className="list-stack">
          <div className="report-feedback-card">
            {getSalesAutoFeedback()}
          </div>

          <div className="report-feedback-card">
            {!filteredCoachConditions.length
              ? '이번 달 코치 컨디션 기록이 없습니다. 최소 주 1회 이상 입력해야 판단이 가능합니다.'
              : Number(coachConditionSummary.avgFatigue || 0) >= 4
                ? '코치 피로도가 높은 상태입니다. 스케줄 분산이나 휴식 조정이 먼저 필요합니다.'
                : Number(coachConditionSummary.avgStress || 0) >= 4
                  ? '업무 스트레스가 높습니다. 운영 방식이나 역할 분배를 점검하세요.'
                  : Number(coachConditionSummary.avgCondition || 0) >= 4
                    ? '전반적인 코치 컨디션은 안정적입니다.'
                    : '코치 컨디션은 보통 수준입니다. 피로도와 스트레스 기록을 계속 누적해서 보세요.'}
          </div>

          <div className="report-feedback-card">
            {salesLogSummary.followup > salesLogSummary.closed
              ? '지금은 신규 유입보다 후속관리 정리가 더 우선입니다.'
              : salesLogSummary.closed === 0
                ? '세일즈일지 대비 결제완료가 없습니다. 상담 흐름과 제안 방식 점검이 필요합니다.'
                : '현재는 결제 흐름이 완전히 나쁘지 않습니다. 후속관리와 재등록 제안을 같이 보세요.'}
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <h2>코치별 컨디션 기록</h2>
      {filteredCoachConditions.length === 0 ? (
        <div className="workout-list-empty">
          아직 등록된 코치 컨디션 기록이 없습니다.
        </div>
      ) : (
        <div className="list-stack">
          {filteredCoachConditions.map((item) => {
            const coachName =
              coaches.find((coach) => coach.id === item.coach_id)?.name || '코치없음'

            return (
              <div key={item.id} className="list-card">
                <div className="list-card-top">
                  <strong>{coachName}</strong>
                  <span className="pill">{item.check_month || '-'}</span>
                </div>
                <div className="compact-text">
                  컨디션 {item.condition_score || 0} / 피로도 {item.fatigue_score || 0} / 집중도 {item.focus_score || 0} / 스트레스 {item.stress_score || 0}
                </div>
                <div className="compact-text">
                  지원 필요: {item.support_needed || '-'}
                </div>
                <div className="compact-text">
                  메모: {item.issue_note || '-'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  </div>
)}

      {activeTab === '매출기록' && (
        <div className="stack-gap">
          <div className="two-col">
            <section className="card">
              <h2>매출 기록 입력 / 수정</h2>

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
                    <span>프로그램</span>
                    <select value={saleForm.program_id} onChange={(e) => setSaleForm({ ...saleForm, program_id: e.target.value })}>
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
                </div>
              </form>
            </section>

            <section className="card">
              <div className="section-head">
                <h2>월별 매출 요약</h2>
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

          <div className="card">
            <h2>매출 목록</h2>
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
          </div>
        </div>
      )}

      {activeTab === '세일즈일지' && (
  <div className="two-col sales-log-layout">
    <section className="card">
      <h2>세일즈 일지 작성 / 수정</h2>

      <form className="stack-gap" onSubmit={handleSalesLogSubmit}>
        <div className="sales-form-section">
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
        </div>

        <div className="sales-form-section">
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
        </div>

        <div className="sales-form-section">
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
        </div>

        <div className="sales-form-section">
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
        </div>

        <div className="sales-form-section">
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
        </div>

        <div className="sales-form-section">
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
        </div>

        <div className="sales-form-section">
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
        </div>

        <div className="inline-actions wrap">
          <button className="primary-btn" type="submit">
            {editingSalesLogId ? '세일즈 일지 수정' : '세일즈 일지 저장'}
          </button>
          <button type="button" className="secondary-btn" onClick={resetSalesLogForm}>
            초기화
          </button>
        </div>
      </form>
    </section>

    <section className="card">
      <div className="member-list-header">
        <h2>세일즈 일지 목록</h2>

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
      
{activeTab === '코치관리' && (
  <section className="admin-section">
    <h2>코치관리</h2>

    <div className="card">
      <h3>입력 안내</h3>
      <p>숫자를 직접 판단해서 넣는 방식이 아니라, 아래 체크리스트를 선택하면 점수가 자동 계산됩니다.</p>
      <p>컨디션 / 집중도는 높을수록 좋고, 피로도 / 스트레스는 높을수록 부담이 큰 상태입니다.</p>
    </div>

    <div className="card">
      <div className="form-row">
        <label>코치</label>
        <select
          value={coachConditionForm.coach_id}
          onChange={(e) =>
            setCoachConditionForm((prev) => ({
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

        <label>기준 월</label>
        <input
          type="month"
          value={coachConditionForm.check_month}
          onChange={(e) =>
            setCoachConditionForm((prev) => ({
              ...prev,
              check_month: e.target.value,
            }))
          }
        />
      </div>
    </div>

    <div className="card">
      <h3>상태 체크리스트</h3>
      <div className="card" style={{ marginTop: '12px', background: '#f8fbff' }}>
  <p><strong>체크 기준 안내</strong></p>
  <p>{CHECK_GUIDE_TEXT.condition}</p>
  <p>{CHECK_GUIDE_TEXT.fatigue}</p>
  <p>{CHECK_GUIDE_TEXT.stress}</p>
  <p>{CHECK_GUIDE_TEXT.focus}</p>
  <p>해당 항목이 없으면 체크 안 해도 됩니다.</p>
</div>

      <div className="stack-gap">
        <div>
          <strong>컨디션 (좋은 상태가 실제로 있었을 때만 체크 / 없으면 체크 안 해도 됨)</strong>
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

        <div>
          <strong>피로도 (실제로 피곤했을 때만 체크 / 없으면 체크 안 해도 됨)</strong>
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

        <div>
          <strong>스트레스 (오늘 실제로 부담이 느껴졌을 때만 체크 / 없으면 체크 안 해도 됨)</strong>
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

        <div>
          <strong>집중도 (오늘 집중이 잘 됐을 때만 체크 / 없으면 체크 안 해도 됨)</strong>
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
      </div>
    </div>

    <div className="card">
      <h3>성과 행동 체크리스트</h3>

      {PERFORMANCE_ACTION_SECTIONS.map((section) => (
        <div key={section.key} className="stack-gap" style={{ marginBottom: '16px' }}>
          <strong>{section.title}</strong>
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

    <div className="card">
      <p>컨디션: {coachConditionForm.condition_score} ({getConditionScoreLabel(coachConditionForm.condition_score, 'condition')})</p>
<p>피로도: {coachConditionForm.fatigue_score} ({getConditionScoreLabel(coachConditionForm.fatigue_score, 'fatigue')})</p>
<p>스트레스: {coachConditionForm.stress_score} ({getConditionScoreLabel(coachConditionForm.stress_score, 'stress')})</p>
<p>집중도: {coachConditionForm.focus_score} ({getConditionScoreLabel(coachConditionForm.focus_score, 'focus')})</p>

<p>성과 행동 점수: {coachConditionForm.performance_score}</p>
<p>성과 행동 레벨: {coachConditionForm.performance_level || getPerformanceLevel(coachConditionForm.performance_score)}</p>

<p>
  오늘 상태 레벨:{' '}
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
  상태 요약:{' '}
  {getConditionSummaryText({
    conditionScore: coachConditionForm.condition_score,
    fatigueScore: coachConditionForm.fatigue_score,
    stressScore: coachConditionForm.stress_score,
    focusScore: coachConditionForm.focus_score,
  })}
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

    <div className="card">
  <h3>이번 달 목표</h3>

  <div className="detail-box" style={{ marginBottom: '14px' }}>
    <p><strong>목표를 잡는 방법</strong></p>
    {GOAL_GUIDE_ITEMS.map((item) => (
      <p key={item}>- {item}</p>
    ))}
  </div>

  <div className="form-row">
    <input
      type="number"
      placeholder="월 매출 목표"
      value={coachConditionForm.monthly_goal_revenue}
      onChange={(e) =>
        setCoachConditionForm((prev) => ({
          ...prev,
          monthly_goal_revenue: e.target.value,
        }))
      }
    />
    <input
      type="number"
      placeholder="신규 상담 목표"
      value={coachConditionForm.monthly_goal_new_leads}
      onChange={(e) =>
        setCoachConditionForm((prev) => ({
          ...prev,
          monthly_goal_new_leads: e.target.value,
        }))
      }
    />
    <input
      type="number"
      placeholder="회원 유지 목표"
      value={coachConditionForm.monthly_goal_retention}
      onChange={(e) =>
        setCoachConditionForm((prev) => ({
          ...prev,
          monthly_goal_retention: e.target.value,
        }))
      }
    />
    <input
      type="number"
      placeholder="콘텐츠 업로드 목표"
      value={coachConditionForm.monthly_goal_content}
      onChange={(e) =>
        setCoachConditionForm((prev) => ({
          ...prev,
          monthly_goal_content: e.target.value,
        }))
      }
    />
  </div>

  <div className="detail-box" style={{ marginTop: '14px', marginBottom: '14px' }}>
    <p><strong>실행 체크리스트 예시</strong></p>
    {GOAL_ACTION_GUIDE.map((item) => (
      <p key={item}>- {item}</p>
    ))}
  </div>

  <textarea
    placeholder="지원이 필요한 부분 (예: 상담 스크립트 정리 필요 / SNS 방향 설정 필요)"
    value={coachConditionForm.support_needed}
    onChange={(e) =>
      setCoachConditionForm((prev) => ({
        ...prev,
        support_needed: e.target.value,
      }))
    }
  />

  <textarea
    placeholder="메모 (예: 이번 달은 소개 유입 늘리는 것이 우선 / 후기 확보 집중)"
    value={coachConditionForm.issue_note}
    onChange={(e) =>
      setCoachConditionForm((prev) => ({
        ...prev,
        issue_note: e.target.value,
      }))
    }
  />
</div>
<div className="detail-box" style={{ marginTop: '8px' }}>
  <p><strong>입력 후 확인할 것</strong></p>
  <p>- 자동 계산 결과에서 상태 요약을 먼저 봅니다.</p>
  <p>- 이번 달 목표는 숫자만 적고 끝내지 말고, 아래 실행 체크리스트 예시를 보고 행동으로 연결합니다.</p>
</div>
    <div className="form-row">
      <button type="button" onClick={handleCoachConditionSubmit}>저장</button>
      <button type="button" onClick={resetCoachConditionForm}>초기화</button>
    </div>

   <div className="list-section">
  {coachConditions.map((item) => {
    const actionGuides = getCoachRecordActionGuide(item)

    return (
      <div key={item.id} className="card">
        <div className="section-head">
          <div>
            <h3 style={{ marginBottom: '6px' }}>{item.coaches?.name || '-'}</h3>
            <p style={{ margin: 0, color: '#687388' }}>기록 월: {item.check_month || '-'}</p>
          </div>
          <span className="pill">{COACH_LEVEL_META[item.status_level]?.label || '-'}</span>
        </div>

        <div className="detail-box">
          <p><strong>현재 해석</strong></p>
          <p>
            {getCoachStatusText({
              conditionScore: item.condition_score,
              fatigueScore: item.fatigue_score,
              stressScore: item.stress_score,
              focusScore: item.focus_score,
              performanceScore: item.performance_score,
            })}
          </p>

          <p><strong>점수 요약</strong></p>
          <p>
            컨디션 {item.condition_score || 0} / 피로도 {item.fatigue_score || 0} /
            스트레스 {item.stress_score || 0} / 집중도 {item.focus_score || 0}
          </p>

          <p><strong>실행 가이드</strong></p>
          {actionGuides.map((guide) => (
            <p key={guide}>- {guide}</p>
          ))}

          <p><strong>메모</strong></p>
          <p>{item.issue_note || '기록된 메모 없음'}</p>
        </div>

        <div className="form-row">
          <button type="button" onClick={() => handleCoachConditionEdit(item)}>수정</button>
          <button type="button" onClick={() => handleCoachConditionDelete(item.id)}>삭제</button>
        </div>
      </div>
    )
  })}
</div>
      {activeTab === '리포트' && (
  <section className="admin-section">
    <h2>리포트</h2>
<div className="card">
  <h3>리포트 보는 방법</h3>
  <div className="detail-box">
    {REPORT_USAGE_GUIDE.map((item) => (
      <p key={item}>- {item}</p>
    ))}
    <p>- 이 화면은 “평가”보다 “다음 행동 결정”을 위한 화면이라고 생각하면 됩니다.</p>
  </div>
</div>
    <div className="card">
      <h3>월간 상태 요약</h3>
      <p>평균 컨디션: {coachConditionSummary.avgCondition?.toFixed(1)}</p>
      <p>평균 피로도: {coachConditionSummary.avgFatigue?.toFixed(1)}</p>
      <p>평균 스트레스: {coachConditionSummary.avgStress?.toFixed(1)}</p>
      <p>평균 집중도: {coachConditionSummary.avgFocus?.toFixed(1)}</p>
      <p>평균 성과 행동 점수: {coachDashboardSummary.avgPerformance?.toFixed(1)}</p>
      <p>현재 운영 레벨: {coachDashboardSummary.statusLabel}</p>
    </div>

    <div className="card">
      <h3>자동 해석</h3>
      <p>{coachDashboardSummary.statusText}</p>
    </div>

    <div className="card">
      <h3>주의 필요 코치</h3>
      {coachAlertList.length === 0 ? (
        <p>현재 주의 필요 코치가 없습니다.</p>
      ) : (
        coachAlertList.map((item) => (
          <div key={item.id} style={{ marginBottom: '12px' }}>
            <strong>{item.coaches?.name || '이름 없음'}</strong>
            <p>{item.reasons.join(', ')}</p>
          </div>
        ))
      )}
    </div>

    <div className="card">
      <h3>이번 달 목표 평균</h3>
      <p>월 매출 목표 평균: {Math.round(coachGoalSummary.revenueGoalAvg || 0).toLocaleString()}원</p>
      <p>신규 상담 목표 평균: {Math.round(coachGoalSummary.newLeadGoalAvg || 0)}건</p>
      <p>회원 유지 목표 평균: {Math.round(coachGoalSummary.retentionGoalAvg || 0)}건</p>
      <p>콘텐츠 업로드 목표 평균: {Math.round(coachGoalSummary.contentGoalAvg || 0)}건</p>
    </div>

    <div className="card">
  <h3>다음 액션 제안</h3>

  <div className="detail-box">
    <p><strong>1. 컨디션/피로 먼저 보기</strong></p>
    <p>- 피로도/스트레스가 높으면 수업 수, 휴식 시간, 생활 리듬부터 먼저 조정합니다.</p>

    <p><strong>2. 성과 행동 점수 보기</strong></p>
    <p>- 성과 행동 점수가 낮으면 상담 시도, 재등록 제안, SNS/블로그, 후기 요청 중 빠진 것을 채웁니다.</p>

    <p><strong>3. 목표 평균 보기</strong></p>
    <p>- 매출/상담/유지/콘텐츠 목표가 현재 상황에 비해 너무 높거나 낮지 않은지 조정합니다.</p>

    <p><strong>4. 주의 필요 코치 보기</strong></p>
    <p>- 내가 주의 필요 코치에 포함된다면, 이번 주엔 회복과 행동 관리 중 무엇이 더 급한지부터 정합니다.</p>

    <p><strong>5. 바로 실행할 것 1개만 정하기</strong></p>
    <p>- 예: 주 2회 블로그, 하루 3명 상담 시도, 미방문 회원 연락 등 딱 하나를 정해서 실행합니다.</p>
  </div>
</div>
      {activeTab === '공지사항' && (
        <div className="two-col">
          <section className="card">
            <h2>공지 / 이벤트 등록</h2>
            <form className="stack-gap" onSubmit={handleNoticeSubmit}>
              <label className="field">
                <span>제목</span>
                <input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} />
              </label>

              <label className="field">
                <span>카테고리</span>
                <select value={noticeForm.category} onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}>
                  <option value="공지">공지</option>
                  <option value="이벤트">이벤트</option>
                  <option value="운동영상">운동영상</option>
                </select>
              </label>

              <label className="field">
                <span>내용</span>
                <textarea rows="6" value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} />
              </label>

              <label className="field">
                <span>이미지 URL</span>
                <input value={noticeForm.image_url} onChange={(e) => setNoticeForm({ ...noticeForm, image_url: e.target.value })} />
              </label>

              <label className="field">
                <span>영상 URL</span>
                <input value={noticeForm.video_url} onChange={(e) => setNoticeForm({ ...noticeForm, video_url: e.target.value })} />
              </label>

              <div className="grid-2">
                <label className="field">
                  <span>시작일</span>
                  <input type="date" value={noticeForm.starts_at} onChange={(e) => setNoticeForm({ ...noticeForm, starts_at: e.target.value })} />
                </label>

                <label className="field">
                  <span>종료일</span>
                  <input type="date" value={noticeForm.ends_at} onChange={(e) => setNoticeForm({ ...noticeForm, ends_at: e.target.value })} />
                </label>
              </div>

              <label className="checkbox-line">
                <input
                  type="checkbox"
                  checked={noticeForm.is_published}
                  onChange={(e) => setNoticeForm({ ...noticeForm, is_published: e.target.checked })}
                />
                <span>게시중</span>
              </label>

              <div className="inline-actions wrap">
                <button className="primary-btn" type="submit">
                  {editingNoticeId ? '공지 수정' : '공지 등록'}
                </button>
                <button type="button" className="secondary-btn" onClick={resetNoticeForm}>
                  초기화
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="section-head">
              <h2>공지 / 이벤트 목록</h2>
              <div className="inline-actions wrap">
                <input
                  type="month"
                  value={noticeMonthFilter}
                  onChange={(e) => setNoticeMonthFilter(e.target.value)}
                />
                <select value={noticeCategoryFilter} onChange={(e) => setNoticeCategoryFilter(e.target.value)}>
                  <option value="all">전체 카테고리</option>
                  <option value="공지">공지</option>
                  <option value="이벤트">이벤트</option>
                  <option value="운동영상">운동영상</option>
                </select>
              </div>
            </div>

            <label className="field">
              <span>검색</span>
              <input
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                placeholder="제목 / 내용 / 카테고리 검색"
              />
            </label>

            <div className="list-stack">
              {filteredNotices.map((notice) => {
                const collapsed = collapsedNotices[notice.id] ?? true
                return (
                  <div key={notice.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{notice.title}</strong>
                      <span className="pill">{notice.category}</span>
                    </div>

                    <div className="compact-text">
                      간략히보기: {(notice.content || '').slice(0, 40)}
                      {(notice.content || '').length > 40 ? '...' : ''}
                    </div>

                    <div className="inline-actions wrap">
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={() =>
                          setCollapsedNotices((prev) => ({
                            ...prev,
                            [notice.id]: !collapsed,
                          }))
                        }
                      >
                        {collapsed ? '상세히보기' : '간략히보기'}
                      </button>

                      <button className="secondary-btn" type="button" onClick={() => handleNoticeEdit(notice)}>
                        수정
                      </button>

                      <button className="danger-btn" type="button" onClick={() => handleNoticeDelete(notice.id)}>
                        삭제
                      </button>
                    </div>

                    {!collapsed ? (
                      <div className="detail-box">
                        <p><strong>내용:</strong> {notice.content || '-'}</p>
                        <p><strong>이미지 URL:</strong> {notice.image_url || '-'}</p>
                        <p><strong>영상 URL:</strong> {notice.video_url || '-'}</p>
                        <p><strong>기간:</strong> {formatDate(notice.starts_at)} ~ {formatDate(notice.ends_at)}</p>
                        <p><strong>게시상태:</strong> {notice.is_published ? '게시중' : '숨김'}</p>
                      </div>
                    ) : null}
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
                <div className="compact-text">
                  {item.phone || '-'}
                </div>
              </div>

              <div className="inline-actions wrap">
                <span className="pill">
                  {isAnswered ? '답변완료' : '미답변'}
                </span>
                <span className="pill">
                  {(item.created_at || '').slice(0, 10)}
                </span>
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
        <DietFeedbackEditor diet={diet} feedback={feedback} setFeedback={setFeedback} onSave={onSave} />
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
