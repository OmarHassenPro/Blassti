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

function normalizeText(value, fallback = "") {
  const text = String(value ?? "").trim()
  return text || fallback
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

function normalizeContactInfo(contactInfo = {}, exactAddress = "") {
  return {
    address: contactInfo?.address ?? exactAddress ?? "",
    phone: contactInfo?.phone ?? "",
    email: contactInfo?.email ?? "",
    website: contactInfo?.website ?? "",
    instagram: contactInfo?.instagram ?? "",
  }
}

function normalizeSeatClassName(value) {
  const seatClass = normalizeText(value, "Regular")
  if (seatClass.toLowerCase() === "normal") return "Regular"
  return seatClass
}

function normalizeDesignerSeat(rawSeat = {}, index = 0) {
  const row = normalizeText(rawSeat?.row ?? rawSeat?.seat_row ?? "")
  const explicitSeatNumber = normalizeText(rawSeat?.seat_number ?? rawSeat?.label ?? "")
  const derivedNumber =
    explicitSeatNumber && row && explicitSeatNumber.startsWith(row)
      ? explicitSeatNumber.slice(row.length)
      : explicitSeatNumber

  const number = normalizeText(
    rawSeat?.number ?? rawSeat?.seatNo ?? derivedNumber ?? `${index + 1}`,
    `${index + 1}`
  )

  const seatNumber = normalizeText(
    rawSeat?.seat_number ?? (row && number ? `${row}${number}` : ""),
    row && number ? `${row}${number}` : `S${index + 1}`
  )

  return {
    ...deepClone(rawSeat),
    id: rawSeat?.id ?? crypto.randomUUID(),
    kind: rawSeat?.kind ?? "seat",
    x: normalizeNumber(rawSeat?.x, 0),
    y: normalizeNumber(rawSeat?.y, 0),
    width: normalizeNumber(rawSeat?.width, 1.2),
    height: normalizeNumber(rawSeat?.height, 1.2),
    rotation: normalizeNumber(rawSeat?.rotation, 0),
    row,
    number,
    seat_number: seatNumber,
    location_key: normalizeText(rawSeat?.location_key ?? `${row}-${number}`, `${row}-${number}`),
    location: normalizeText(rawSeat?.location ?? seatNumber, seatNumber),
    label: normalizeText(rawSeat?.label ?? seatNumber, seatNumber),
    seat_class: normalizeSeatClassName(rawSeat?.seat_class ?? rawSeat?.class ?? rawSeat?.seatType),
    price: normalizeNumber(rawSeat?.price, 0),
  }
}

function normalizeDesignerBlock(rawItem = {}, index = 0, fallbackKind = "stage", fallbackTitle = "Stage") {
  return {
    ...deepClone(rawItem),
    id: rawItem?.id ?? crypto.randomUUID(),
    kind: rawItem?.kind ?? fallbackKind,
    type: rawItem?.type ?? fallbackKind,
    title: normalizeText(rawItem?.title ?? rawItem?.name, `${fallbackTitle} ${index + 1}`),
    name: normalizeText(rawItem?.name ?? rawItem?.title, `${fallbackTitle} ${index + 1}`),
    location: normalizeText(rawItem?.location ?? rawItem?.title ?? rawItem?.name, `${fallbackTitle} ${index + 1}`),
    x: normalizeNumber(rawItem?.x, 0),
    y: normalizeNumber(rawItem?.y, 0),
    width: normalizeNumber(rawItem?.width, fallbackKind === "audio" ? 24 : 140),
    height: normalizeNumber(rawItem?.height, fallbackKind === "audio" ? 24 : 50),
    rotation: normalizeNumber(rawItem?.rotation, 0),
  }
}

function buildNormalizedDesignFromSources({
  design = null,
  layout = null,
  venueData = null,
}) {
  const sourceDesign = design && typeof design === "object" ? design : null
  const sourceLayout = layout && typeof layout === "object" ? layout : null
  const venueSeatLayout = venueData?.seat_layout && typeof venueData.seat_layout === "object"
    ? venueData.seat_layout
    : null

  const seatsSource =
    normalizeArray(sourceDesign?.seats).length
      ? sourceDesign.seats
      : normalizeArray(sourceLayout?.seats).length
        ? sourceLayout.seats
        : normalizeArray(venueSeatLayout?.seats)

  const stagesSource =
    normalizeArray(sourceDesign?.stages).length
      ? sourceDesign.stages
      : normalizeArray(sourceLayout?.stages).length
        ? sourceLayout.stages
        : normalizeArray(venueSeatLayout?.stages)

  const screensSource =
    normalizeArray(sourceDesign?.screens).length
      ? sourceDesign.screens
      : normalizeArray(sourceLayout?.screens).length
        ? sourceLayout.screens
        : normalizeArray(venueSeatLayout?.screens)

  const audioSourcesSource =
    normalizeArray(sourceDesign?.audio_sources).length
      ? sourceDesign.audio_sources
      : normalizeArray(sourceLayout?.audio_sources).length
        ? sourceLayout.audio_sources
        : normalizeArray(venueSeatLayout?.audio_sources)

  const elementsSource =
    normalizeArray(sourceDesign?.elements).length
      ? sourceDesign.elements
      : normalizeArray(sourceLayout?.elements)

  const shapesSource =
    normalizeArray(sourceDesign?.shapes).length
      ? sourceDesign.shapes
      : normalizeArray(sourceLayout?.shapes)

  return {
    seats: seatsSource.map((seat, index) => normalizeDesignerSeat(seat, index)),
    stages: stagesSource.map((item, index) => normalizeDesignerBlock(item, index, "stage", "Stage")),
    screens: screensSource.map((item, index) => normalizeDesignerBlock(item, index, "screen", "Screen")),
    audio_sources: audioSourcesSource.map((item, index) => normalizeDesignerBlock(item, index, "audio", "Audio Source")),
    elements: normalizeArray(elementsSource).map(item => deepClone(item)),
    shapes: normalizeArray(shapesSource).map(item => deepClone(item)),
    notes: sourceDesign?.notes ?? sourceLayout?.notes ?? "",
  }
}

function deriveSeatClassesFromDesign(design = {}) {
  const classes = []
  normalizeArray(design?.seats).forEach(seat => {
    const seatClass = normalizeSeatClassName(seat?.seat_class)
    if (seatClass && !classes.includes(seatClass)) {
      classes.push(seatClass)
    }
  })
  return classes.length ? classes : ["Regular"]
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
    created_by_user_id,
    status,
    submitted_at,
    created_at,
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
    seat_count,
    status_label,
    category,
    type,
    review_rating,
    description,
    image,
    cover_image,
    extra_images,
    contact_info,
    bank_account_info,
    featured,

    dimensions,
    manual_seat_count,
    use_designer,

    design,
    layout,
    venue_data,
    seat_classes,
  }) {
    const normalizedVenueData = venue_data && typeof venue_data === "object" ? deepClone(venue_data) : {}
    const normalizedLayout = layout && typeof layout === "object" ? deepClone(layout) : {}
    const normalizedDesign = buildNormalizedDesignFromSources({
      design,
      layout: normalizedLayout,
      venueData: normalizedVenueData,
    })

    const resolvedUseDesigner =
      typeof use_designer === "boolean"
        ? use_designer
        : typeof normalizedLayout?.use_designer === "boolean"
          ? normalizedLayout.use_designer
          : normalizedDesign.seats.length > 0

    const resolvedManualSeatCount =
      normalizeNumber(manual_seat_count, 0) ||
      normalizeNumber(normalizedLayout?.manual_seat_count, 0) ||
      normalizeNumber(seat_count, 0) ||
      normalizeNumber(capacity, 0)

    const resolvedSeatClasses = Array.from(
      new Set([
        ...normalizeArray(seat_classes).map(item => normalizeSeatClassName(item)).filter(Boolean),
        ...deriveSeatClassesFromDesign(normalizedDesign),
      ])
    )

    this.id = id ?? crypto.randomUUID()
    this.owner_user_id = owner_user_id ?? created_by_user_id ?? normalizedVenueData?.owner_user_id ?? null
    this.created_by_user_id = created_by_user_id ?? owner_user_id ?? normalizedVenueData?.owner_user_id ?? null
    this.status = status ?? "Pending"
    this.submitted_at = submitted_at ?? created_at ?? new Date().toISOString()
    this.created_at = created_at ?? this.submitted_at
    this.reviewed_at = reviewed_at ?? null
    this.reviewed_by_user_id = reviewed_by_user_id ?? null
    this.denial_reason = denial_reason ?? ""

    this.title = title ?? normalizedVenueData?.title ?? ""
    this.location = location ?? normalizedVenueData?.location ?? ""
    this.exact_address = exact_address ?? normalizedVenueData?.exact_address ?? ""
    this.availability = availability ?? normalizedVenueData?.availability ?? true
    this.price_per_hour = normalizeNumber(price_per_hour ?? normalizedVenueData?.price_per_hour, 0)
    this.price_per_day = normalizeNumber(price_per_day ?? normalizedVenueData?.price_per_day, 0)
    this.capacity = normalizeNumber(capacity ?? normalizedVenueData?.capacity, 0)
    this.status_label = status_label ?? normalizedVenueData?.status ?? "Pending Review"
    this.category = category ?? normalizedVenueData?.category ?? ""
    this.type = type ?? normalizedVenueData?.type ?? ""
    this.review_rating = normalizeNumber(review_rating ?? normalizedVenueData?.review_rating, 0)
    this.description = description ?? normalizedVenueData?.description ?? ""
    this.image = image ?? cover_image ?? normalizedVenueData?.image ?? ""
    this.extra_images = normalizeArray(extra_images).length
      ? normalizeArray(extra_images)
      : normalizeArray(normalizedVenueData?.extra_images)

    this.contact_info = normalizeContactInfo(
      contact_info ?? normalizedVenueData?.contact_info,
      this.exact_address
    )

    this.bank_account_info = normalizeBankAccountInfo(
      bank_account_info ?? normalizedVenueData?.bank_account_info
    )

    this.featured = featured ?? normalizedVenueData?.featured ?? false

    this.dimensions = {
      width_m: normalizeNumber(
        dimensions?.width_m ??
          dimensions?.width ??
          normalizedLayout?.width ??
          normalizedVenueData?.seat_layout?.width,
        20
      ),
      height_m: normalizeNumber(
        dimensions?.height_m ??
          dimensions?.height ??
          normalizedLayout?.height ??
          normalizedVenueData?.seat_layout?.height,
        12
      ),
      shape: dimensions?.shape ?? normalizedLayout?.shape ?? "rectangle",
    }

    this.manual_seat_count = resolvedManualSeatCount
    this.use_designer = Boolean(resolvedUseDesigner)
    this.seat_classes = resolvedSeatClasses.length ? resolvedSeatClasses : ["Regular"]

    this.design = normalizedDesign

    this.layout = {
      mode: normalizedLayout?.mode ?? (this.use_designer ? "designer" : "manual"),
      manual_seat_count: this.manual_seat_count,
      manual_seat_counts: {
        regular: normalizeNumber(normalizedLayout?.manual_seat_counts?.regular, 0),
        special: normalizeNumber(normalizedLayout?.manual_seat_counts?.special, 0),
        vip: normalizeNumber(normalizedLayout?.manual_seat_counts?.vip, 0),
      },
      seats: deepClone(this.design.seats),
      stages: deepClone(this.design.stages),
      screens: deepClone(this.design.screens),
      audio_sources: deepClone(this.design.audio_sources),
      elements: deepClone(this.design.elements),
      shapes: deepClone(this.design.shapes),
      notes: this.design.notes,
      use_designer: this.use_designer,
      width: this.dimensions.width_m,
      height: this.dimensions.height_m,
      shape: this.dimensions.shape,
    }

    this.venue_data = {
      ...normalizedVenueData,
      title: this.title,
      location: this.location,
      exact_address: this.exact_address,
      availability: this.availability,
      price_per_hour: this.price_per_hour,
      price_per_day: this.price_per_day,
      capacity: this.seat_count || this.capacity || this.manual_seat_count,
      status: normalizedVenueData?.status ?? "Pending Approval",
      category: this.category,
      type: this.type,
      review_rating: this.review_rating,
      description: this.description,
      image: this.image,
      extra_images: deepClone(this.extra_images),
      contact_info: deepClone(this.contact_info),
      bank_account_info: deepClone(this.bank_account_info),
      featured: this.featured,
      owner_user_id: this.owner_user_id,
      seat_classes: deepClone(this.seat_classes),
      seat_layout: {
        width: this.dimensions.width_m,
        height: this.dimensions.height_m,
        seats: deepClone(this.design.seats),
        stages: deepClone(this.design.stages),
        screens: deepClone(this.design.screens),
        audio_sources: deepClone(this.design.audio_sources),
        elements: deepClone(this.design.elements),
        metadata: {
          notes: this.design.notes,
          shape: this.dimensions.shape,
        },
      },
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

  const normalizedRequest = request instanceof VenueRequest ? request : new VenueRequest(request)
  const seats = normalizeArray(normalizedRequest.design?.seats)
  const stages = normalizeArray(normalizedRequest.design?.stages)
  const screens = normalizeArray(normalizedRequest.design?.screens)
  const audio_sources = normalizeArray(normalizedRequest.design?.audio_sources)

  if (!seats.length && !stages.length && !screens.length && !audio_sources.length) {
    return null
  }

  return {
    width: normalizeNumber(normalizedRequest.dimensions?.width_m, 20),
    height: normalizeNumber(normalizedRequest.dimensions?.height_m, 12),
    seats: seats.map((seat, index) => ({
      id: seat?.id ?? crypto.randomUUID(),
      x: normalizeNumber(seat?.x, 0),
      y: normalizeNumber(seat?.y, 0),
      width: normalizeNumber(seat?.width, 1.2),
      height: normalizeNumber(seat?.height, 1.2),
      rotation: normalizeNumber(seat?.rotation, 0),
      row: normalizeText(seat?.row, ""),
      number: normalizeText(seat?.number, `${index + 1}`),
      seat_number: normalizeText(seat?.seat_number ?? seat?.label, `S${index + 1}`),
      location_key: normalizeText(seat?.location_key ?? seat?.location, `seat-${index + 1}`),
      label: normalizeText(seat?.label ?? seat?.seat_number, `Seat ${index + 1}`),
      seat_class: normalizeSeatClassName(seat?.seat_class),
      price: normalizeNumber(seat?.price, 0),
    })),
    stages: stages.map((item, index) => ({
      id: item?.id ?? `stage-${index + 1}`,
      name: normalizeText(item?.name ?? item?.title, `Stage ${index + 1}`),
      x: normalizeNumber(item?.x, 0),
      y: normalizeNumber(item?.y, 0),
      width: normalizeNumber(item?.width, 140),
      height: normalizeNumber(item?.height, 50),
      rotation: normalizeNumber(item?.rotation, 0),
    })),
    screens: screens.map((item, index) => ({
      id: item?.id ?? `screen-${index + 1}`,
      name: normalizeText(item?.name ?? item?.title, `Screen ${index + 1}`),
      x: normalizeNumber(item?.x, 0),
      y: normalizeNumber(item?.y, 0),
      width: normalizeNumber(item?.width, 140),
      height: normalizeNumber(item?.height, 50),
      rotation: normalizeNumber(item?.rotation, 0),
    })),
    audio_sources: audio_sources.map((item, index) => ({
      id: item?.id ?? `audio-${index + 1}`,
      name: normalizeText(item?.name ?? item?.title, `Audio Source ${index + 1}`),
      x: normalizeNumber(item?.x, 0),
      y: normalizeNumber(item?.y, 0),
      width: normalizeNumber(item?.width, 24),
      height: normalizeNumber(item?.height, 24),
      rotation: normalizeNumber(item?.rotation, 0),
    })),
    elements: deepClone(normalizedRequest.design?.elements ?? []),
    metadata: {
      notes: normalizedRequest.design?.notes ?? "",
      shape: normalizedRequest.dimensions?.shape ?? "rectangle",
    },
  }
}

export function venue_Request_To_Venue(request) {
  const normalizedRequest = request instanceof VenueRequest ? request : new VenueRequest(request)
  const seatLayout = build_Seat_Layout_From_Request(normalizedRequest)
  const seatClasses = Array.from(
    new Set([
      ...normalizeArray(normalizedRequest.seat_classes).map(item => normalizeSeatClassName(item)).filter(Boolean),
      ...(seatLayout?.seats ?? []).map(seat => normalizeSeatClassName(seat?.seat_class)).filter(Boolean),
    ])
  )

  return new Venue({
    title: normalizedRequest.title,
    location: normalizedRequest.location,
    exact_address: normalizedRequest.exact_address,
    availability: normalizedRequest.availability,
    price_per_hour: normalizedRequest.price_per_hour,
    price_per_day: normalizedRequest.price_per_day,
    capacity: normalizedRequest.seat_count || normalizedRequest.capacity,
    status: "Active",
    category: normalizedRequest.category,
    type: normalizedRequest.type,
    review_rating: normalizedRequest.review_rating || 0,
    description: normalizedRequest.description,
    image: normalizedRequest.image,
    extra_images: normalizedRequest.extra_images ?? [],
    contact_info: {
      address: normalizedRequest.contact_info?.address || normalizedRequest.exact_address || "",
      phone: normalizedRequest.contact_info?.phone || "",
      email: normalizedRequest.contact_info?.email || "",
      website: normalizedRequest.contact_info?.website || "",
      instagram: normalizedRequest.contact_info?.instagram || "",
    },
    bank_account_info: {
      ...normalizeBankAccountInfo(normalizedRequest.bank_account_info),
    },
    featured: false,
    owner_user_id: normalizedRequest.owner_user_id ?? null,
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
    venue_data: {
      ...(request.venue_data ?? {}),
      id: createdVenue.id,
      seat_layout: deepClone(createdVenue.seat_layout),
      seat_classes: deepClone(createdVenue.seat_classes),
      capacity: createdVenue.capacity,
      status: createdVenue.status,
    },
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
      const seatClass = normalizeSeatClassName(seat?.seat_class ?? "Regular")

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