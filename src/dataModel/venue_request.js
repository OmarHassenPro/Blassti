import { reactive } from "vue"
import { Venue, add_Venue, get_Venue_By_Title } from "@/dataModel/venue"
import {
  create_Venue_Created_Notification,
  create_Venue_Request_Approved_Notification,
  create_Venue_Request_Denied_Notification,
} from "@/dataModel/notification"

const VENUE_REQUESTS_STORAGE_KEY = "venue_requests_v2"
const AUTO_DELETE_DELAY_MS = 30000

const venueRequestDeleteTimers = new Map()

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeBankAccountInfo(bankAccountInfo = {}) {
  return {
    account_holder_name: bankAccountInfo?.account_holder_name ?? "",
    bank_name: bankAccountInfo?.bank_name ?? "",
    account_number: bankAccountInfo?.account_number ?? "",
    rib: bankAccountInfo?.rib ?? "",
    iban: bankAccountInfo?.iban ?? "",
    swift: bankAccountInfo?.swift ?? "",
  }
}

function schedule_Venue_Request_Auto_Delete(requestId) {
  if (!requestId) return

  clear_Venue_Request_Auto_Delete(requestId)

  const timer = window.setTimeout(() => {
    delete_Venue_Request(requestId)
    venueRequestDeleteTimers.delete(requestId)
  }, AUTO_DELETE_DELAY_MS)

  venueRequestDeleteTimers.set(requestId, timer)
}

function clear_Venue_Request_Auto_Delete(requestId) {
  const existingTimer = venueRequestDeleteTimers.get(requestId)

  if (existingTimer) {
    window.clearTimeout(existingTimer)
    venueRequestDeleteTimers.delete(requestId)
  }
}

function restore_Auto_Delete_Timers() {
  VENUE_REQUEST_LIST.forEach(request => {
    if (request.status === "Approved" || request.status === "Denied") {
      schedule_Venue_Request_Auto_Delete(request.id)
    }
  })
}

export class VenueRequest {
  constructor({
    id,
    owner_user_id,
    status,
    submitted_at,
    reviewed_at,
    reviewed_by_user_id,
    denial_reason,

    title,
    location,
    exact_address,
    availability,
    price_per_hour,
    price_per_day,
    capacity,
    status_label,
    category,
    type,
    review_rating,
    description,
    image,
    extra_images,
    contact_info,
    bank_account_info,
    featured,

    dimensions,
    manual_seat_count,
    use_designer,

    design,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.owner_user_id = owner_user_id ?? null
    this.status = status ?? "Pending"
    this.submitted_at = submitted_at ?? new Date().toISOString()
    this.reviewed_at = reviewed_at ?? null
    this.reviewed_by_user_id = reviewed_by_user_id ?? null
    this.denial_reason = denial_reason ?? ""

    this.title = title ?? ""
    this.location = location ?? ""
    this.exact_address = exact_address ?? ""
    this.availability = availability ?? true
    this.price_per_hour = normalizeNumber(price_per_hour, 0)
    this.price_per_day = normalizeNumber(price_per_day, 0)
    this.capacity = normalizeNumber(capacity, 0)
    this.status_label = status_label ?? "Pending Review"
    this.category = category ?? ""
    this.type = type ?? ""
    this.review_rating = normalizeNumber(review_rating, 0)
    this.description = description ?? ""
    this.image = image ?? ""
    this.extra_images = normalizeArray(extra_images)

    this.contact_info = {
      address: contact_info?.address ?? "",
      phone: contact_info?.phone ?? "",
      email: contact_info?.email ?? "",
      website: contact_info?.website ?? "",
      instagram: contact_info?.instagram ?? "",
    }

    this.bank_account_info = normalizeBankAccountInfo(bank_account_info)

    this.featured = featured ?? false

    this.dimensions = {
      width_m: normalizeNumber(dimensions?.width_m, 20),
      height_m: normalizeNumber(dimensions?.height_m, 12),
      shape: dimensions?.shape ?? "rectangle",
    }

    this.manual_seat_count = normalizeNumber(manual_seat_count, 0)
    this.use_designer = Boolean(use_designer)

    this.design = {
      seats: normalizeArray(design?.seats),
      stages: normalizeArray(design?.stages),
      screens: normalizeArray(design?.screens),
      audio_sources: normalizeArray(design?.audio_sources),
      elements: normalizeArray(design?.elements),
      shapes: normalizeArray(design?.shapes),
      notes: design?.notes ?? "",
    }
  }

  get seat_count() {
    if (this.use_designer) {
      return this.design.seats.length
    }
    return this.manual_seat_count
  }

  get cover_image() {
    return this.image || this.extra_images[0] || ""
  }
}

function loadVenueRequests() {
  const raw = localStorage.getItem(VENUE_REQUESTS_STORAGE_KEY)

  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return parsed.map(item => new VenueRequest(item))
  } catch (error) {
    console.error("Failed to parse venue requests from storage.", error)
    return []
  }
}

export const VENUE_REQUEST_LIST = reactive(loadVenueRequests())

function saveVenueRequests() {
  localStorage.setItem(
    VENUE_REQUESTS_STORAGE_KEY,
    JSON.stringify(VENUE_REQUEST_LIST)
  )
}

restore_Auto_Delete_Timers()

export function get_All_Venue_Requests() {
  return VENUE_REQUEST_LIST
}

export function get_Pending_Venue_Requests() {
  return VENUE_REQUEST_LIST.filter(request => request.status === "Pending")
}

export function get_Venue_Request_By_Id(id) {
  return VENUE_REQUEST_LIST.find(request => request.id === id) || null
}

export function get_Venue_Requests_By_Owner(ownerUserId) {
  return VENUE_REQUEST_LIST.filter(
    request => request.owner_user_id === ownerUserId
  )
}

export function add_Venue_Request(requestData) {
  const request =
    requestData instanceof VenueRequest
      ? requestData
      : new VenueRequest(requestData)

  VENUE_REQUEST_LIST.unshift(request)
  saveVenueRequests()
  return request
}

export function update_Venue_Request(id, updatedData) {
  const index = VENUE_REQUEST_LIST.findIndex(request => request.id === id)

  if (index === -1) return null

  VENUE_REQUEST_LIST[index] = new VenueRequest({
    ...deepClone(VENUE_REQUEST_LIST[index]),
    ...deepClone(updatedData),
    id: VENUE_REQUEST_LIST[index].id,
  })

  saveVenueRequests()
  return VENUE_REQUEST_LIST[index]
}

export function delete_Venue_Request(id) {
  const index = VENUE_REQUEST_LIST.findIndex(request => request.id === id)

  if (index === -1) return null

  clear_Venue_Request_Auto_Delete(id)

  const deleted = VENUE_REQUEST_LIST[index]
  VENUE_REQUEST_LIST.splice(index, 1)
  saveVenueRequests()
  return deleted
}

export function clear_All_Venue_Requests() {
  VENUE_REQUEST_LIST.forEach(request => {
    clear_Venue_Request_Auto_Delete(request.id)
  })

  VENUE_REQUEST_LIST.splice(0, VENUE_REQUEST_LIST.length)
  saveVenueRequests()
}

function build_Seat_Layout_From_Request(request) {
  if (!request) return null

  if (request.use_designer) {
    const seats = Array.isArray(request.design?.seats)
      ? request.design.seats.map((seat, index) => ({
          id: seat?.id ?? crypto.randomUUID(),
          x: normalizeNumber(seat?.x, 0),
          y: normalizeNumber(seat?.y, 0),
          width: normalizeNumber(seat?.width, 24),
          height: normalizeNumber(seat?.height, 24),
          rotation: normalizeNumber(seat?.rotation, 0),
          row: String(seat?.row ?? "").trim(),
          number: String(seat?.number ?? index + 1).trim(),
          seat_number:
            String(seat?.seat_number ?? seat?.label ?? `S${index + 1}`).trim() || `S${index + 1}`,
          location_key:
            String(seat?.location_key ?? seat?.label ?? `seat-${index + 1}`).trim() || `seat-${index + 1}`,
          label: String(seat?.label ?? `Seat ${index + 1}`).trim() || `Seat ${index + 1}`,
          seat_class: seat?.seat_class ?? "Regular",
          price: normalizeNumber(seat?.price, 0),
        }))
      : []

    const stages = Array.isArray(request.design?.stages)
      ? request.design.stages.map((item, index) => ({
          id: item?.id ?? `stage-${index + 1}`,
          name: item?.title ?? `Stage ${index + 1}`,
          x: normalizeNumber(item?.x, 0),
          y: normalizeNumber(item?.y, 0),
          width: normalizeNumber(item?.width, 140),
          height: normalizeNumber(item?.height, 50),
          rotation: normalizeNumber(item?.rotation, 0),
        }))
      : []

    const screens = Array.isArray(request.design?.screens)
      ? request.design.screens.map((item, index) => ({
          id: item?.id ?? `screen-${index + 1}`,
          name: item?.title ?? `Screen ${index + 1}`,
          x: normalizeNumber(item?.x, 0),
          y: normalizeNumber(item?.y, 0),
          width: normalizeNumber(item?.width, 140),
          height: normalizeNumber(item?.height, 50),
          rotation: normalizeNumber(item?.rotation, 0),
        }))
      : []

    const audio_sources = Array.isArray(request.design?.audio_sources)
      ? request.design.audio_sources.map((item, index) => ({
          id: item?.id ?? `audio-${index + 1}`,
          name: item?.title ?? `Audio Source ${index + 1}`,
          x: normalizeNumber(item?.x, 0),
          y: normalizeNumber(item?.y, 0),
          width: normalizeNumber(item?.width, 24),
          height: normalizeNumber(item?.height, 24),
          rotation: normalizeNumber(item?.rotation, 0),
        }))
      : []

    return {
      width: normalizeNumber(request.dimensions?.width_m, 20),
      height: normalizeNumber(request.dimensions?.height_m, 12),
      seats,
      stages,
      screens,
      audio_sources,
    }
  }

  return null
}

export function venue_Request_To_Venue(request) {
  const seatLayout = build_Seat_Layout_From_Request(request)
  const seatClasses = Array.from(
    new Set(
      (seatLayout?.seats ?? []).map(seat => seat?.seat_class).filter(Boolean)
    )
  )

  return new Venue({
    title: request.title,
    location: request.location,
    exact_address: request.exact_address,
    availability: request.availability,
    price_per_hour: request.price_per_hour,
    price_per_day: request.price_per_day,
    capacity: request.seat_count || request.capacity,
    status: "Active",
    category: request.category,
    type: request.type,
    review_rating: request.review_rating || 0,
    description: request.description,
    image: request.image,
    extra_images: request.extra_images ?? [],
    contact_info: {
      address: request.contact_info?.address || request.exact_address || "",
      phone: request.contact_info?.phone || "",
      email: request.contact_info?.email || "",
      website: request.contact_info?.website || "",
      instagram: request.contact_info?.instagram || "",
    },
    bank_account_info: {
      ...normalizeBankAccountInfo(request.bank_account_info),
    },
    featured: false,
    owner_user_id: request.owner_user_id ?? null,
    seat_classes: seatClasses.length ? seatClasses : ["Regular"],
    accessible_seats: false,
    administration_blocks: [],
    seat_layout: seatLayout,
  })
}

export function approve_Venue_Request(requestId, reviewerUserId = null) {
  const request = get_Venue_Request_By_Id(requestId)

  if (!request) {
    return { success: false, message: "Venue request not found." }
  }

  if (request.status === "Approved") {
    return { success: false, message: "This request is already approved." }
  }

  const existingVenue = get_Venue_By_Title(request.title)
  if (existingVenue) {
    return { success: false, message: "A venue with this title already exists." }
  }

  const newVenue = venue_Request_To_Venue(request)
  const createdVenue = add_Venue(newVenue)

  const updatedRequest = update_Venue_Request(requestId, {
    status: "Approved",
    status_label: "Approved",
    reviewed_at: new Date().toISOString(),
    reviewed_by_user_id: reviewerUserId,
    denial_reason: "",
  })

  schedule_Venue_Request_Auto_Delete(requestId)

  if (request.owner_user_id) {
    create_Venue_Request_Approved_Notification({
      userId: request.owner_user_id,
      venueTitle: createdVenue.title,
      venueId: createdVenue.id,
      venueRequestId: request.id,
    })

    create_Venue_Created_Notification({
      userId: request.owner_user_id,
      venueTitle: createdVenue.title,
      venueId: createdVenue.id,
    })
  }

  return {
    success: true,
    message: "Venue request approved successfully.",
    venue: createdVenue,
    request: updatedRequest,
  }
}

export function deny_Venue_Request(
  requestId,
  reviewerUserId = null,
  denialReason = "",
  customReason = ""
) {
  const request = get_Venue_Request_By_Id(requestId)

  if (!request) {
    return { success: false, message: "Venue request not found." }
  }

  if (request.status === "Approved") {
    return { success: false, message: "Approved requests cannot be denied." }
  }

  const updated = update_Venue_Request(requestId, {
    status: "Denied",
    status_label: "Denied",
    reviewed_at: new Date().toISOString(),
    reviewed_by_user_id: reviewerUserId,
    denial_reason: denialReason === "Other" ? customReason : denialReason,
  })

  schedule_Venue_Request_Auto_Delete(requestId)

  if (request.owner_user_id) {
    create_Venue_Request_Denied_Notification({
      userId: request.owner_user_id,
      venueTitle: request.title,
      venueRequestId: request.id,
      reason: denialReason,
      customReason,
    })
  }

  return {
    success: true,
    message: "Venue request denied.",
    request: updated,
  }
}

export function create_Designer_Seat({
  x = 0,
  y = 0,
  width = 24,
  height = 24,
  seat_class = "Regular",
  color = "#1E88E5",
  rotation = 0,
  label = "",
} = {}) {
  return {
    id: crypto.randomUUID(),
    kind: "seat",
    x,
    y,
    width,
    height,
    seat_class,
    color,
    rotation,
    label,
  }
}

export function create_Designer_Block({
  kind = "stage",
  x = 0,
  y = 0,
  width = 140,
  height = 50,
  color = "#D4A137",
  title = "",
} = {}) {
  return {
    id: crypto.randomUUID(),
    kind,
    x,
    y,
    width,
    height,
    color,
    title,
  }
}

export function duplicate_Designer_Item(item) {
  return {
    ...deepClone(item),
    id: crypto.randomUUID(),
    x: normalizeNumber(item.x, 0) + 18,
    y: normalizeNumber(item.y, 0) + 18,
  }
}

export function get_Seat_Color_By_Class(seatClass) {
  const key = String(seatClass ?? "").trim().toLowerCase()

  if (key === "vip") return "#D4A137"
  if (key === "special") return "#D64545"
  return "#1E88E5"
}

export function count_Seats_By_Class(seats = []) {
  return seats.reduce(
    (acc, seat) => {
      const seatClass = seat?.seat_class ?? "Regular"

      if (!acc[seatClass]) acc[seatClass] = 0
      acc[seatClass] += 1
      return acc
    },
    {
      VIP: 0,
      Special: 0,
      Regular: 0,
    }
  )
}