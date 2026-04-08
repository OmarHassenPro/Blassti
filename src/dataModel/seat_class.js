import { reactive } from "vue"

const SEAT_CLASS_STORAGE_KEY = "seat_classes_v2"

function numeric(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function normalizeSeatClass(raw = {}) {
  return new SeatClass({
    id: raw?.id,
    event_id: String(raw?.event_id ?? "").trim(),
    name: String(raw?.name ?? "Regular").trim() || "Regular",
    price: numeric(raw?.price, 0),
    available_seats: Math.max(0, numeric(raw?.available_seats, 0)),
  })
}

function loadSeatClasses() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEAT_CLASS_STORAGE_KEY) || "[]")
    if (!Array.isArray(parsed)) return []
    return parsed.map(item => normalizeSeatClass(item))
  } catch (error) {
    console.error("Failed to parse saved seat classes. Loading empty list instead.", error)
    return []
  }
}

function saveSeatClasses() {
  localStorage.setItem(SEAT_CLASS_STORAGE_KEY, JSON.stringify(SEAT_CLASS_LIST))
}

export class SeatClass {
  constructor({
    id,
    event_id,
    name,
    price,
    available_seats,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.event_id = String(event_id ?? "").trim()
    this.name = String(name ?? "Regular").trim() || "Regular"
    this.price = numeric(price, 0)
    this.available_seats = Math.max(0, numeric(available_seats, 0))
  }
}

export const SEAT_CLASS_LIST = reactive(loadSeatClasses())

export function get_All_Seat_Classes() {
  return SEAT_CLASS_LIST
}

export function get_Seat_Classes_By_Event_Id(event_id) {
  const safeEventId = String(event_id ?? "").trim()
  if (!safeEventId) return []

  return SEAT_CLASS_LIST.filter(seatClass => seatClass.event_id === safeEventId)
}

export function get_Seat_Class_By_Id(id) {
  return SEAT_CLASS_LIST.find(seatClass => seatClass.id === id) || null
}

export function add_Seat_Class(seatClass) {
  const normalized = normalizeSeatClass(seatClass)
  SEAT_CLASS_LIST.push(normalized)
  saveSeatClasses()
  return normalized
}

export function update_Seat_Class(id, updatedSeatClassData) {
  const index = SEAT_CLASS_LIST.findIndex(seatClass => seatClass.id === id)

  if (index !== -1) {
    SEAT_CLASS_LIST[index] = normalizeSeatClass({
      ...SEAT_CLASS_LIST[index],
      ...updatedSeatClassData,
      id: SEAT_CLASS_LIST[index].id,
    })
    saveSeatClasses()
    return SEAT_CLASS_LIST[index]
  }

  return null
}

export function delete_Seat_Class(id) {
  const index = SEAT_CLASS_LIST.findIndex(seatClass => seatClass.id === id)

  if (index !== -1) {
    const deleted = SEAT_CLASS_LIST[index]
    SEAT_CLASS_LIST.splice(index, 1)
    saveSeatClasses()
    return deleted
  }

  return null
}

export function replace_Seat_Classes_For_Event(event_id, seatClasses = []) {
  const safeEventId = String(event_id ?? "").trim()
  if (!safeEventId) return []

  for (let index = SEAT_CLASS_LIST.length - 1; index >= 0; index -= 1) {
    if (SEAT_CLASS_LIST[index].event_id === safeEventId) {
      SEAT_CLASS_LIST.splice(index, 1)
    }
  }

  const normalized = (Array.isArray(seatClasses) ? seatClasses : [])
    .map(item => normalizeSeatClass({ ...item, event_id: safeEventId }))

  normalized.forEach(item => SEAT_CLASS_LIST.push(item))
  saveSeatClasses()

  return normalized
}

export function clear_All_Seat_Classes() {
  SEAT_CLASS_LIST.splice(0, SEAT_CLASS_LIST.length)
  saveSeatClasses()
  return SEAT_CLASS_LIST
}