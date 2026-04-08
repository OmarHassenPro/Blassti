import { reactive } from "vue"
import { get_Event_By_Id, get_All_Events } from "@/dataModel/event"
import { get_User_By_Id } from "@/dataModel/user"
import { get_All_Venues } from "@/dataModel/venue"
import {
  create_Carpool_Created_Notification,
  create_Carpool_Join_Notifications,
  create_Carpool_Leave_Notifications,
  create_Carpool_Delete_Notifications,
} from "@/dataModel/notification"

const CARPOOL_STORAGE_KEY = "blassti_carpools_v7"

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function fullName(user) {
  if (!user) return ""
  return `${user.first_name} ${user.last_name}`.trim()
}

function getVenueByTitle(title) {
  const normalized = String(title ?? "").trim().toLowerCase()
  return (
    get_All_Venues().find(
      venue => venue.title.trim().toLowerCase() === normalized
    ) || null
  )
}

function contactMethodLabel(method) {
  switch (method) {
    case "phone":
      return "Phone number"
    case "whatsapp":
      return "WhatsApp"
    case "instagram":
      return "Instagram"
    case "facebook":
      return "Facebook"
    default:
      return "Contact"
  }
}

function getContactValueFromUser(user, method) {
  if (!user) return ""

  switch (method) {
    case "phone":
      return user.contacts?.phone ?? ""
    case "whatsapp":
      return user.contacts?.phone ?? ""
    case "instagram":
      return user.contacts?.instagram ?? ""
    case "facebook":
      return user.contacts?.facebook ?? ""
    default:
      return ""
  }
}

function createParticipantObject(userId) {
  const user = get_User_By_Id(userId)
  if (!user) return null

  return {
    id: user.id,
    name: fullName(user),
    avatar: user.profile_picture,
    route: `/f_details?id=${user.id}`,
  }
}

export class Carpooling {
  constructor({
    id,
    title,
    event_id,
    route,
    event_date,
    time_of_going,
    driver_user_id,
    departure_location,
    contact_method,
    contact_value,
    total_spots,
    spots_left,
    deadline,
    participant_user_ids,
    note,
    status,
    is_current,
    created_at,
    last_leave_reason,
    last_leave_note,
  }) {
    const event = event_id ? get_Event_By_Id(event_id) : null
    const driver = driver_user_id ? get_User_By_Id(driver_user_id) : null
    const venue = event ? getVenueByTitle(event.venue) : null

    this.id = id ?? crypto.randomUUID()
    this.event_id = event_id ?? null
    this.title = title ?? `${event?.title ?? "Event"} Ride`
    this.event_title = event?.title ?? ""
    this.route = route ?? ""
    this.event_date = event_date ?? event?.date ?? ""
    this.time_of_going = time_of_going ?? event?.time ?? ""
    this.driver_user_id = driver_user_id ?? null
    this.driver_name = fullName(driver)
    this.driver_avatar = driver?.profile_picture ?? ""
    this.driver_route = driver ? `/f_details?id=${driver.id}` : ""
    this.departure_location = departure_location ?? ""
    this.contact_method = contact_method ?? "phone"
    this.contact_method_label = contactMethodLabel(this.contact_method)
    this.contact_value = contact_value ?? getContactValueFromUser(driver, this.contact_method)
    this.total_spots = Number(total_spots ?? 1)
    this.spots_left = Number(spots_left ?? 1)
    this.deadline = deadline ?? ""
    this.participant_user_ids = safeArray(participant_user_ids)
    this.note = note ?? ""
    this.status = status ?? "Open"
    this.is_current = is_current ?? false
    this.created_at = created_at ?? new Date().toISOString()
    this.last_leave_reason = last_leave_reason ?? ""
    this.last_leave_note = last_leave_note ?? ""

    this.event_route = event?.route_path ?? (event ? `/o_eventinfo?id=${event.id}` : "")
    this.venue_id = venue?.id ?? null
    this.venue_title = venue?.title ?? event?.venue ?? ""
    this.venue_location = venue?.location ?? event?.city ?? ""
    this.venue_exact_address = venue?.exact_address ?? venue?.contact_info?.address ?? ""
    this.venue_route = venue ? `/o_venueinfo?id=${venue.id}` : ""

    this.driver = driver
      ? {
          id: driver.id,
          name: fullName(driver),
          avatar: driver.profile_picture ?? "",
          route: `/f_details?id=${driver.id}`,
        }
      : null

    this.participants = this.participant_user_ids
      .map(userId => createParticipantObject(userId))
      .filter(Boolean)
  }

  get is_full() {
    return this.spots_left <= 0
  }

  get has_available_spots() {
    return this.spots_left > 0
  }

  get joined_count() {
    return this.participant_user_ids.length
  }

  get taken_spots() {
    return this.total_spots - this.spots_left
  }
}

function defaultCarpools() {
  return [
    new Carpooling({
      id: "carpool-1",
      event_id: "event-3",
      route: "Monastir city center → Complexe Culturel de Monastir",
      time_of_going: "18:40",
      driver_user_id: "user-2",
      departure_location: "Monastir city center",
      contact_method: "phone",
      contact_value: "+216 24 118 203",
      total_spots: 4,
      spots_left: 1,
      deadline: "2026-06-01",
      participant_user_ids: ["user-9", "user-8"],
      note: "Leaving around 50 minutes before the show. Small bags only please.",
      status: "Reserved",
      is_current: true,
    }),

    new Carpooling({
      id: "carpool-2",
      event_id: "event-7",
      route: "Monastir → Stade Olympique de Sousse",
      time_of_going: "17:00",
      driver_user_id: "user-3",
      departure_location: "Monastir city center",
      contact_method: "facebook",
      contact_value: "youssef.ayari",
      total_spots: 5,
      spots_left: 2,
      deadline: "2026-06-26",
      participant_user_ids: ["user-5", "user-9"],
      note: "Departure is strict because of match traffic, so don’t be late.",
      status: "Open",
      is_current: true,
    }),

    new Carpooling({
      id: "carpool-3",
      event_id: "event-10",
      route: "La Marsa → Théâtre de l’Opéra de Tunis",
      time_of_going: "18:35",
      driver_user_id: "user-6",
      departure_location: "La Marsa",
      contact_method: "instagram",
      contact_value: "@rym.chaabane.events",
      total_spots: 4,
      spots_left: 1,
      deadline: "2026-07-14",
      participant_user_ids: ["user-1", "user-9"],
      note: "Elegant event, so please be ready on time. No smoking in the car.",
      status: "Reserved",
      is_current: true,
    }),

    new Carpooling({
      id: "carpool-4",
      event_id: "event-11",
      route: "Sfax → Tunis Marriott Hotel",
      time_of_going: "06:30",
      driver_user_id: "user-7",
      departure_location: "Sfax south exit",
      contact_method: "phone",
      contact_value: "+216 53 770 944",
      total_spots: 4,
      spots_left: 2,
      deadline: "2026-07-21",
      participant_user_ids: ["user-4"],
      note: "One coffee stop on the highway. Best for people staying for the full summit.",
      status: "Open",
      is_current: true,
    }),

    new Carpooling({
      id: "carpool-5",
      event_id: "event-14",
      route: "Mahdia → Marina Cap Monastir Appart Hôtel",
      time_of_going: "10:15",
      driver_user_id: "user-8",
      departure_location: "Mahdia downtown",
      contact_method: "facebook",
      contact_value: "ines.dhaouadi",
      total_spots: 4,
      spots_left: 2,
      deadline: "2026-08-23",
      participant_user_ids: ["user-2"],
      note: "Relaxed daytime ride. One small bag per person.",
      status: "Reserved",
      is_current: true,
    }),

    new Carpooling({
      id: "carpool-6",
      event_id: "event-15",
      route: "Monastir → Théâtre de l’Opéra de Tunis",
      time_of_going: "17:15",
      driver_user_id: "user-9",
      departure_location: "Marina Monastir",
      contact_method: "whatsapp",
      contact_value: "+216 52 110 245",
      total_spots: 4,
      spots_left: 0,
      deadline: "2025-04-17",
      participant_user_ids: ["user-2", "user-8", "user-5"],
      note: "Past concert ride. Everyone headed back together after the event.",
      status: "Finished",
      is_current: false,
    }),

    new Carpooling({
      id: "carpool-7",
      event_id: "event-17",
      route: "Lac 2 → Le Rio",
      time_of_going: "20:05",
      driver_user_id: "user-1",
      departure_location: "Lac 2, Tunis",
      contact_method: "instagram",
      contact_value: "@aymen.gharbi",
      total_spots: 4,
      spots_left: 0,
      deadline: "2025-05-28",
      participant_user_ids: ["user-9", "user-6"],
      note: "Short city ride. Return ride after the comedy show too.",
      status: "Finished",
      is_current: false,
    }),

    new Carpooling({
      id: "carpool-8",
      event_id: "event-18",
      route: "Monastir → Maison de la Culture Ibn Rachiq",
      time_of_going: "15:45",
      driver_user_id: "user-2",
      departure_location: "Monastir center",
      contact_method: "phone",
      contact_value: "+216 24 118 203",
      total_spots: 4,
      spots_left: 2,
      deadline: "2025-06-09",
      participant_user_ids: ["user-8"],
      note: "Family show ride. Please be there 10 minutes early.",
      status: "Finished",
      is_current: false,
    }),

    new Carpooling({
      id: "carpool-9",
      event_id: "event-19",
      route: "Carthage → Le Rio",
      time_of_going: "19:10",
      driver_user_id: "user-6",
      departure_location: "Carthage",
      contact_method: "facebook",
      contact_value: "rym.chaabane",
      total_spots: 4,
      spots_left: 0,
      deadline: "2025-09-12",
      participant_user_ids: ["user-1", "user-9"],
      note: "Indoor concert ride. Driver waited only 10 minutes before leaving.",
      status: "Finished",
      is_current: false,
    }),
  ]
}

function loadCarpools() {
  const saved = localStorage.getItem(CARPOOL_STORAGE_KEY)

  if (!saved) {
    const defaults = defaultCarpools()
    localStorage.setItem(CARPOOL_STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  }

  try {
    const parsed = JSON.parse(saved)
    return parsed.map(item => new Carpooling(item))
  } catch (error) {
    console.error("Failed to parse carpools. Resetting to defaults.", error)
    const defaults = defaultCarpools()
    localStorage.setItem(CARPOOL_STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  }
}

export const CARPOOLING_LIST = reactive(loadCarpools())

function saveCarpools() {
  localStorage.setItem(CARPOOL_STORAGE_KEY, JSON.stringify(CARPOOLING_LIST))
}

function recalculateCarpool(carpool) {
  return new Carpooling({
    ...carpool,
    participant_user_ids: safeArray(carpool.participant_user_ids),
  })
}

export function get_All_Carpoolings() {
  return CARPOOLING_LIST
}

export function get_Carpooling_By_Id(id) {
  return CARPOOLING_LIST.find(carpooling => carpooling.id === id) || null
}

export function get_Current_Carpooling() {
  return CARPOOLING_LIST.find(carpooling => carpooling.is_current) || null
}

export function get_Current_Carpoolings_For_User(userId) {
  if (!userId) return []

  return CARPOOLING_LIST.filter(
    carpool =>
      carpool.is_current &&
      (
        carpool.driver_user_id === userId ||
        carpool.participant_user_ids.includes(userId)
      )
  )
}

export function get_Past_Carpoolings() {
  return CARPOOLING_LIST.filter(carpooling => !carpooling.is_current)
}

export function get_Carpoolings_By_User_Id(userId) {
  if (!userId) return []

  return CARPOOLING_LIST.filter(
    carpool =>
      carpool.driver_user_id === userId ||
      carpool.participant_user_ids.includes(userId)
  )
}

export function get_Current_Carpooling_For_User(userId) {
  if (!userId) return null

  return (
    CARPOOLING_LIST.find(
      carpool =>
        carpool.is_current &&
        (
          carpool.driver_user_id === userId ||
          carpool.participant_user_ids.includes(userId)
        )
    ) || null
  )
}

export function get_Past_Carpoolings_For_User(userId) {
  if (!userId) return []

  return CARPOOLING_LIST.filter(
    carpool =>
      !carpool.is_current &&
      (
        carpool.driver_user_id === userId ||
        carpool.participant_user_ids.includes(userId)
      )
  )
}

export function get_Searchable_Carpoolings_For_User(userId) {
  const ownedOrJoined = get_Carpoolings_By_User_Id(userId)

  return CARPOOLING_LIST.filter(carpool => {
    const alreadyRelated = ownedOrJoined.some(item => item.id === carpool.id)
    const event = get_Event_By_Id(carpool.event_id)

    return (
      !alreadyRelated &&
      carpool.is_current &&
      carpool.spots_left > 0 &&
      !!event
    )
  })
}

export function add_Carpooling(carpoolData) {
  const item =
    carpoolData instanceof Carpooling
      ? carpoolData
      : new Carpooling(carpoolData)

  CARPOOLING_LIST.unshift(item)
  saveCarpools()

  create_Carpool_Created_Notification({
    ownerUserId: item.driver_user_id,
    carpoolId: item.id,
    eventId: item.event_id,
    eventTitle: item.event_title,
  })

  return item
}

export function join_Carpooling(id, participantUserId) {
  const carpool = CARPOOLING_LIST.find(c => c.id === id)
  const user = get_User_By_Id(participantUserId)

  if (!carpool || !user) {
    return { success: false, message: "Carpool not found." }
  }

  if (carpool.driver_user_id === participantUserId) {
    return { success: false, message: "You cannot join your own carpool." }
  }

  if (carpool.participant_user_ids.includes(participantUserId)) {
    return { success: false, message: "You already joined this carpool." }
  }

  if (carpool.spots_left <= 0) {
    return { success: false, message: "This carpool is already full." }
  }

  carpool.participant_user_ids.push(participantUserId)
  carpool.spots_left -= 1

  if (carpool.is_current) {
    if (carpool.spots_left <= 0) {
      carpool.status = "Full"
    } else {
      carpool.status = "Reserved"
    }
  }

  const index = CARPOOLING_LIST.findIndex(c => c.id === id)
  CARPOOLING_LIST[index] = recalculateCarpool(carpool)
  saveCarpools()

  create_Carpool_Join_Notifications({
    joinerUserId: user.id,
    joinerName: user.full_name || `${user.first_name} ${user.last_name}`.trim(),
    driverUserId: CARPOOLING_LIST[index].driver_user_id,
    carpoolId: CARPOOLING_LIST[index].id,
    eventId: CARPOOLING_LIST[index].event_id,
    eventTitle: CARPOOLING_LIST[index].event_title,
    contactMethodLabel: CARPOOLING_LIST[index].contact_method_label,
    contactValue: CARPOOLING_LIST[index].contact_value,
  })

  return {
    success: true,
    message: "Joined successfully.",
    carpool: CARPOOLING_LIST[index],
    contact_method: CARPOOLING_LIST[index].contact_method,
    contact_method_label: CARPOOLING_LIST[index].contact_method_label,
    contact_value: CARPOOLING_LIST[index].contact_value,
  }
}

export function leave_Carpooling(id, participantUserId, reason = "", note = "") {
  const carpool = CARPOOLING_LIST.find(c => c.id === id)
  const user = get_User_By_Id(participantUserId)

  if (!carpool || !user) {
    return { success: false, message: "Carpool not found." }
  }

  if (carpool.driver_user_id === participantUserId) {
    return { success: false, message: "Drivers cannot use cancel join on their own carpool." }
  }

  const participantIndex = carpool.participant_user_ids.indexOf(participantUserId)

  if (participantIndex === -1) {
    return { success: false, message: "You are not in this carpool." }
  }

  carpool.participant_user_ids.splice(participantIndex, 1)
  carpool.spots_left += 1
  carpool.last_leave_reason = reason
  carpool.last_leave_note = note

  if (carpool.is_current) {
    if (carpool.participant_user_ids.length === 0) {
      carpool.status = "Open"
    } else if (carpool.spots_left > 0) {
      carpool.status = "Reserved"
    } else {
      carpool.status = "Full"
    }
  }

  const index = CARPOOLING_LIST.findIndex(c => c.id === id)
  CARPOOLING_LIST[index] = recalculateCarpool(carpool)
  saveCarpools()

  create_Carpool_Leave_Notifications({
    leaverUserId: user.id,
    leaverName: user.full_name || `${user.first_name} ${user.last_name}`.trim(),
    driverUserId: CARPOOLING_LIST[index].driver_user_id,
    carpoolId: CARPOOLING_LIST[index].id,
    eventId: CARPOOLING_LIST[index].event_id,
    eventTitle: CARPOOLING_LIST[index].event_title,
    reason,
    note,
  })

  return {
    success: true,
    message: "Carpool left successfully.",
    carpool: CARPOOLING_LIST[index],
  }
}

export function update_Carpooling(id, updatedCarpoolingData) {
  const index = CARPOOLING_LIST.findIndex(carpooling => carpooling.id === id)

  if (index === -1) return null

  CARPOOLING_LIST[index] = new Carpooling({
    ...CARPOOLING_LIST[index],
    ...updatedCarpoolingData,
    id: CARPOOLING_LIST[index].id,
  })

  saveCarpools()
  return CARPOOLING_LIST[index]
}

export function delete_Carpooling(id, requesterUserId) {
  const index = CARPOOLING_LIST.findIndex(carpooling => carpooling.id === id)

  if (index === -1) {
    return { success: false, message: "Carpool not found." }
  }

  const deleted = CARPOOLING_LIST[index]

  if (!requesterUserId) {
    return { success: false, message: "You must be logged in to delete this carpool." }
  }

  if (deleted.driver_user_id !== requesterUserId) {
    return { success: false, message: "You can only delete your own carpool." }
  }

  const owner = get_User_By_Id(deleted.driver_user_id)
  const ownerName =
    owner?.full_name || `${owner?.first_name ?? ""} ${owner?.last_name ?? ""}`.trim() || "The driver"

  create_Carpool_Delete_Notifications({
    ownerUserId: deleted.driver_user_id,
    ownerName,
    participantUserIds: safeArray(deleted.participant_user_ids),
    carpoolId: deleted.id,
    eventId: deleted.event_id,
    eventTitle: deleted.event_title,
  })

  CARPOOLING_LIST.splice(index, 1)
  saveCarpools()

  return {
    success: true,
    message: "Carpool deleted successfully.",
    carpool: deleted,
  }
}

export function get_Upcoming_Event_Items() {
  const allEvents = get_All_Events()
  return allEvents.filter(event => String(event.route_path ?? "").includes("/o_eventinfo"))
}

export function get_Carpool_Contact_Method_Options_For_User(user) {
  if (!user) return []

  const phone = String(user.contacts?.phone ?? "").trim()
  const instagram = String(user.contacts?.instagram ?? "").trim()
  const facebook = String(user.contacts?.facebook ?? "").trim()

  const options = []

  if (phone) {
    options.push({ title: "Phone number", value: "phone" })
    options.push({ title: "WhatsApp", value: "whatsapp" })
  }

  if (instagram) {
    options.push({ title: "Instagram", value: "instagram" })
  }

  if (facebook) {
    options.push({ title: "Facebook", value: "facebook" })
  }

  return options
}