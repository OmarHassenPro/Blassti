import { reactive } from "vue"
import { get_User_By_Id } from "@/dataModel/user"

const REPORTS_STORAGE_KEY = "blassti_user_reports_v1"

function normalizeReason(value) {
  return String(value ?? "").trim()
}

function normalizeDetails(value) {
  return String(value ?? "").trim()
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

export class UserReportEntry {
  constructor({
    id,
    reported_user_id,
    reported_by_user_id,
    reason,
    details,
    created_at,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.reported_user_id = reported_user_id ?? null
    this.reported_by_user_id = reported_by_user_id ?? null
    this.reason = normalizeReason(reason)
    this.details = normalizeDetails(details)
    this.created_at = created_at ?? new Date().toISOString()
  }
}

function loadReports() {
  const saved = localStorage.getItem(REPORTS_STORAGE_KEY)
  if (!saved) return []

  try {
    const parsed = JSON.parse(saved)
    return normalizeArray(parsed).map(item => new UserReportEntry(item))
  } catch (error) {
    console.error("Failed to parse reports. Resetting reports storage.", error)
    localStorage.removeItem(REPORTS_STORAGE_KEY)
    return []
  }
}

function saveReports() {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(REPORT_LIST))
}

export const REPORT_LIST = reactive(loadReports())

export function get_All_Reports() {
  return REPORT_LIST
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function get_Reports_For_Reported_User(reportedUserId) {
  if (!reportedUserId) return []

  return get_All_Reports().filter(
    report => String(report.reported_user_id) === String(reportedUserId)
  )
}

export function get_Grouped_User_Reports() {
  const groupedMap = new Map()

  get_All_Reports().forEach(report => {
    const reportedUserId = String(report.reported_user_id || "")
    if (!reportedUserId) return

    if (!groupedMap.has(reportedUserId)) {
      groupedMap.set(reportedUserId, {
        reported_user_id: reportedUserId,
        reported_user: get_User_By_Id(reportedUserId) || null,
        total_reports: 0,
        latest_report_at: report.created_at,
        reasons: [],
      })
    }

    const bucket = groupedMap.get(reportedUserId)
    bucket.total_reports += 1
    bucket.reasons.push(report)

    if (new Date(report.created_at) > new Date(bucket.latest_report_at)) {
      bucket.latest_report_at = report.created_at
    }
  })

  return Array.from(groupedMap.values()).sort(
    (a, b) => new Date(b.latest_report_at) - new Date(a.latest_report_at)
  )
}

export function get_Report_By_Id(reportId) {
  if (!reportId) return null

  return REPORT_LIST.find(report => String(report.id) === String(reportId)) || null
}

export function add_User_Report(reportData) {
  if (!reportData?.reported_user_id || !reportData?.reported_by_user_id) {
    return null
  }

  const item = reportData instanceof UserReportEntry
    ? reportData
    : new UserReportEntry(reportData)

  REPORT_LIST.unshift(item)
  saveReports()
  return item
}

export function delete_Report_By_Id(reportId) {
  if (!reportId) return false

  const index = REPORT_LIST.findIndex(
    report => String(report.id) === String(reportId)
  )

  if (index === -1) return false

  REPORT_LIST.splice(index, 1)
  saveReports()
  return true
}

export function delete_Reports_For_User(reportedUserId) {
  if (!reportedUserId) return 0

  let deletedCount = 0

  for (let i = REPORT_LIST.length - 1; i >= 0; i -= 1) {
    if (String(REPORT_LIST[i].reported_user_id) === String(reportedUserId)) {
      REPORT_LIST.splice(i, 1)
      deletedCount += 1
    }
  }

  saveReports()
  return deletedCount
}

export function clear_All_Reports() {
  const deletedCount = REPORT_LIST.length
  REPORT_LIST.splice(0, REPORT_LIST.length)
  saveReports()
  return deletedCount
}

export function get_Total_Reports_Count() {
  return REPORT_LIST.length
}

export function has_Reports() {
  return REPORT_LIST.length > 0
}