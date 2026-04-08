import { reactive } from "vue"
import { get_Event_By_Id, update_Event } from "@/dataModel/event"
import { get_User_By_Id, update_User } from "@/dataModel/user"
import {
  create_Ticket_Purchase_Notification,
  create_Ticket_Payment_Received_Notification,
} from "@/dataModel/notification"
import {
  calculate_Blassti_Fee,
  get_Blassti_Event_Ticket_Fee_Rate,
  record_Blassti_Revenue,
} from "@/dataModel/statistics"

const RESERVATIONS_STORAGE_KEY = "blassti_reservations_v3"
const RESERVATIONS_VERSION_KEY = "blassti_reservations_version"
const RESERVATIONS_VERSION = "v4_event_ticketing_with_seat_selection_and_fee_ledger"

function toNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function normalizeSelectedSeats(selectedSeats = []) {
  if (!Array.isArray(selectedSeats)) return []

  return selectedSeats.map((seat, index) => ({
    id: seat?.id ?? `seat-${index + 1}`,
    key: seat?.key ?? seat?.id ?? `seat-${index + 1}`,
    label:
      seat?.label ??
      [seat?.row, seat?.number].filter(Boolean).join("") ??
      `Seat ${index + 1}`,
    row: seat?.row ?? "",
    number: seat?.number ?? "",
    seat_class: seat?.seat_class ?? seat?.class ?? "Regular",
    price: toNumber(seat?.price, 0),
    x: toNumber(seat?.x, 0),
    y: toNumber(seat?.y, 0),
    width: toNumber(seat?.width, 1),
    height: toNumber(seat?.height, 1),
    rotation: toNumber(seat?.rotation, 0),
    is_virtual: Boolean(seat?.is_virtual),
  }))
}

function normalizeBreakdown(breakdown = {}) {
  const output = {}
  Object.entries(breakdown || {}).forEach(([key, value]) => {
    output[key] = Math.max(0, Math.floor(toNumber(value, 0)))
  })
  return output
}

function normalizeReservation(reservation) {
  return new Reservation({
    ...reservation,
    base_ticket_price:
      reservation?.base_ticket_price != null
        ? reservation.base_ticket_price
        : reservation?.total_price ?? 0,
    blassti_fee: reservation?.blassti_fee ?? 0,
    total_price:
      reservation?.base_ticket_price != null
        ? reservation.total_price
        : reservation?.total_price ?? 0,
  })
}

function parseEventDateTime(event) {
  if (!event?.date) return null

  const text = `${event.date} ${event.time || "00:00"}`
  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function deriveStatusForEvent(event, explicitStatus = "") {
  if (explicitStatus === "Cancelled") return "Cancelled"

  const eventDate = parseEventDateTime(event)
  if (!eventDate) return explicitStatus || "Upcoming"

  return eventDate.getTime() < Date.now() ? "Past" : "Upcoming"
}

export class Reservation {
  constructor({
    id,
    user_id,
    event_id,
    venue_id,
    ticket_count,
    base_ticket_price,
    blassti_fee,
    total_price,
    status,
    payment,
    payment_method,
    payment_brand,
    card_last4,
    vip_seats,
    regular_seats,
    special_seats,
    seat_breakdown,
    selected_seats,
    recipient_user_id,
    recipient_type,
    created_at,
    event_title,
    event_date,
    event_time,
    venue_title,
    city,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.user_id = user_id ?? null
    this.event_id = event_id ?? null
    this.venue_id = venue_id ?? null
    this.ticket_count = Math.max(0, Math.floor(toNumber(ticket_count, 0)))
    this.base_ticket_price = toNumber(base_ticket_price, 0)
    this.blassti_fee = toNumber(blassti_fee, 0)
    this.total_price = toNumber(total_price, 0)
    this.status = status ?? "Upcoming"
    this.payment = Boolean(payment)
    this.payment_method = payment_method ?? "card"
    this.payment_brand = payment_brand ?? ""
    this.card_last4 = card_last4 ?? ""
    this.vip_seats = Math.max(0, Math.floor(toNumber(vip_seats, 0)))
    this.regular_seats = Math.max(0, Math.floor(toNumber(regular_seats, 0)))
    this.special_seats = Math.max(0, Math.floor(toNumber(special_seats, 0)))
    this.seat_breakdown = normalizeBreakdown(seat_breakdown)
    this.selected_seats = normalizeSelectedSeats(selected_seats)
    this.recipient_user_id = recipient_user_id ?? null
    this.recipient_type = recipient_type ?? "owner"
    this.created_at = created_at ?? new Date().toISOString()
    this.event_title = event_title ?? ""
    this.event_date = event_date ?? ""
    this.event_time = event_time ?? ""
    this.venue_title = venue_title ?? ""
    this.city = city ?? ""
  }
}

function defaultReservations() {
  return [
    new Reservation({
      id: "reservation-1",
      user_id: "user-1",
      event_id: "event-2",
      venue_id: "venue-9",
      ticket_count: 2,
      base_ticket_price: 180,
      blassti_fee: 3.6,
      total_price: 183.6,
      status: "Upcoming",
      payment: true,
      payment_method: "card",
      payment_brand: "Visa",
      card_last4: "8241",
      vip_seats: 1,
      regular_seats: 1,
      special_seats: 0,
      seat_breakdown: {
        VIP: 1,
        Regular: 1,
      },
      selected_seats: [
        {
          id: "seed-r1-s1",
          key: "event-2-seed-r1-s1",
          label: "VIP A1",
          row: "A",
          number: "1",
          seat_class: "VIP",
          price: 120,
        },
        {
          id: "seed-r1-s2",
          key: "event-2-seed-r1-s2",
          label: "Regular A2",
          row: "A",
          number: "2",
          seat_class: "Regular",
          price: 60,
        },
      ],
      recipient_user_id: "admin-user-1",
      recipient_type: "admin",
      created_at: "2026-04-01T12:00:00.000Z",
      event_title: "Weekend Football Clash",
      event_date: "25 Apr 2026",
      event_time: "18:00",
      venue_title: "Stade Olympique de Radès",
      city: "Ben Arous",
    }),
    new Reservation({
      id: "reservation-2",
      user_id: "user-1",
      event_id: "event-3",
      venue_id: "venue-1",
      ticket_count: 1,
      base_ticket_price: 45,
      blassti_fee: 0.9,
      total_price: 45.9,
      status: "Upcoming",
      payment: true,
      payment_method: "card",
      payment_brand: "Mastercard",
      card_last4: "1122",
      vip_seats: 0,
      regular_seats: 1,
      special_seats: 0,
      seat_breakdown: {
        Regular: 1,
      },
      selected_seats: [
        {
          id: "seed-r2-s1",
          key: "event-3-seed-r2-s1",
          label: "B5",
          row: "B",
          number: "5",
          seat_class: "Regular",
          price: 45,
        },
      ],
      recipient_user_id: "admin-user-1",
      recipient_type: "admin",
      created_at: "2026-04-01T13:00:00.000Z",
      event_title: "Magic Night",
      event_date: "02 May 2026",
      event_time: "19:30",
      venue_title: "Complexe Culturel de Monastir",
      city: "Monastir",
    }),
    new Reservation({
      id: "reservation-3",
      user_id: "user-1",
      event_id: "event-1",
      venue_id: "venue-8",
      ticket_count: 3,
      base_ticket_price: 60,
      blassti_fee: 1.2,
      total_price: 61.2,
      status: "Past",
      payment: true,
      payment_method: "card",
      payment_brand: "Visa",
      card_last4: "4421",
      vip_seats: 0,
      regular_seats: 3,
      special_seats: 0,
      seat_breakdown: {
        Regular: 3,
      },
      selected_seats: [
        {
          id: "seed-r3-s1",
          key: "event-1-seed-r3-s1",
          label: "C12",
          row: "C",
          number: "12",
          seat_class: "Regular",
          price: 20,
        },
        {
          id: "seed-r3-s2",
          key: "event-1-seed-r3-s2",
          label: "C13",
          row: "C",
          number: "13",
          seat_class: "Regular",
          price: 20,
        },
        {
          id: "seed-r3-s3",
          key: "event-1-seed-r3-s3",
          label: "C14",
          row: "C",
          number: "14",
          seat_class: "Regular",
          price: 20,
        },
      ],
      recipient_user_id: "admin-user-1",
      recipient_type: "admin",
      created_at: "2026-03-15T11:00:00.000Z",
      event_title: "Summer Opening Concert",
      event_date: "18 Apr 2026",
      event_time: "20:00",
      venue_title: "Amphithéâtre de Carthage",
      city: "Tunis",
    }),
    new Reservation({
      id: "reservation-4",
      user_id: "user-1",
      event_id: "event-6",
      venue_id: "venue-12",
      ticket_count: 1,
      base_ticket_price: 25,
      blassti_fee: 0,
      total_price: 25,
      status: "Cancelled",
      payment: false,
      payment_method: "card",
      payment_brand: "Visa",
      card_last4: "9021",
      vip_seats: 0,
      regular_seats: 1,
      special_seats: 0,
      seat_breakdown: {
        Regular: 1,
      },
      selected_seats: [
        {
          id: "seed-r4-s1",
          key: "event-6-seed-r4-s1",
          label: "Regular #1",
          row: "",
          number: "1",
          seat_class: "Regular",
          price: 25,
          is_virtual: true,
        },
      ],
      recipient_user_id: "admin-user-1",
      recipient_type: "admin",
      created_at: "2026-03-20T18:30:00.000Z",
      event_title: "Rooftop DJ Set",
      event_date: "20 May 2026",
      event_time: "22:00",
      venue_title: "Dar El Marsa Rooftop Bar",
      city: "Tunis",
    }),
  ]
}

function loadReservations() {
  const savedVersion = localStorage.getItem(RESERVATIONS_VERSION_KEY)
  const saved = localStorage.getItem(RESERVATIONS_STORAGE_KEY)
  const defaults = defaultReservations()

  if (savedVersion !== RESERVATIONS_VERSION) {
    if (saved) {
      try {
        const migrated = JSON.parse(saved).map(item =>
          normalizeReservation({
            ...item,
            base_ticket_price:
              item?.base_ticket_price != null
                ? item.base_ticket_price
                : item?.total_price ?? 0,
            blassti_fee: item?.blassti_fee ?? 0,
            total_price:
              item?.base_ticket_price != null
                ? item.total_price
                : item?.total_price ?? 0,
          })
        )

        localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(migrated))
        localStorage.setItem(RESERVATIONS_VERSION_KEY, RESERVATIONS_VERSION)
        return migrated
      } catch (error) {
        console.error("Failed to migrate reservations. Resetting to defaults.", error)
      }
    }

    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(defaults))
    localStorage.setItem(RESERVATIONS_VERSION_KEY, RESERVATIONS_VERSION)
    return defaults
  }

  if (saved) {
    try {
      return JSON.parse(saved).map(item => normalizeReservation(item))
    } catch (error) {
      console.error("Failed to parse reservations. Resetting to defaults.", error)
    }
  }

  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(defaults))
  localStorage.setItem(RESERVATIONS_VERSION_KEY, RESERVATIONS_VERSION)
  return defaults
}

export const RESERVATION_LIST = reactive(loadReservations())

function saveReservations() {
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(RESERVATION_LIST))
}

function getRawVenueById(venueId) {
  if (!venueId) return null

  try {
    const savedVenues = JSON.parse(localStorage.getItem("venues_v5") || "[]")
    return savedVenues.find(venue => venue.id === venueId) || null
  } catch (error) {
    console.error("Failed to load raw venue from localStorage.", error)
    return null
  }
}

function getRecipientForEvent(event) {
  const venue = getRawVenueById(event?.venue_id)
  const ownerUserId = venue?.owner_user_id ?? null

  if (ownerUserId) {
    return {
      recipient_user_id: ownerUserId,
      recipient_type: "owner",
    }
  }

  return {
    recipient_user_id: "admin-user-1",
    recipient_type: "admin",
  }
}

function getBreakdownFromSeats(selectedSeats = []) {
  const output = {}

  selectedSeats.forEach(seat => {
    const key = seat?.seat_class || "Regular"
    output[key] = (output[key] || 0) + 1
  })

  return output
}

function countByClassName(breakdown = {}, classNames = []) {
  return classNames.reduce((sum, key) => sum + Math.max(0, Number(breakdown[key] || 0)), 0)
}

export function get_All_Reservations() {
  return RESERVATION_LIST
}

export function get_Reservation_By_Id(id) {
  return RESERVATION_LIST.find(reservation => reservation.id === id) || null
}

export function get_Reservations_By_User_Id(user_id) {
  return RESERVATION_LIST.filter(reservation => reservation.user_id === user_id)
}

export function get_Reservations_By_Event_Id(event_id) {
  return RESERVATION_LIST.filter(reservation => reservation.event_id === event_id)
}

export function get_Reserved_Seat_Keys_By_Event_Id(event_id) {
  const reserved = new Set()

  get_Reservations_By_Event_Id(event_id)
    .filter(reservation => reservation.status !== "Cancelled")
    .forEach(reservation => {
      reservation.selected_seats.forEach(seat => {
        if (seat?.key) {
          reserved.add(seat.key)
        }
      })
    })

  return Array.from(reserved)
}

export function get_Reserved_Seat_Counts_By_Event_Id(event_id) {
  const output = {}

  get_Reservations_By_Event_Id(event_id)
    .filter(reservation => reservation.status !== "Cancelled")
    .forEach(reservation => {
      const breakdown =
        reservation.seat_breakdown && Object.keys(reservation.seat_breakdown).length
          ? reservation.seat_breakdown
          : getBreakdownFromSeats(reservation.selected_seats)

      Object.entries(breakdown).forEach(([key, value]) => {
        output[key] = (output[key] || 0) + Math.max(0, Number(value || 0))
      })
    })

  return output
}

export function add_Reservation(reservation) {
  const item = reservation instanceof Reservation ? reservation : new Reservation(reservation)
  RESERVATION_LIST.push(item)
  saveReservations()

  if (item.payment) {
    record_Blassti_Revenue({
      source_type: "ticket_purchase",
      source_id: item.id,
      fee_type: "ticket_fee",
      gross_amount: item.base_ticket_price,
      fee_amount: item.blassti_fee,
      net_amount: item.base_ticket_price,
      payer_user_id: item.user_id ?? null,
      recipient_user_id: item.recipient_user_id ?? null,
      venue_id: item.venue_id ?? null,
      event_id: item.event_id ?? null,
      reservation_id: item.id,
      payment_status: "paid",
      created_at: item.created_at,
      metadata: {
        event_title: item.event_title,
        venue_title: item.venue_title,
        ticket_count: item.ticket_count,
      },
    })
  }

  return item
}

export function update_Reservation(id, updatedReservationData) {
  const index = RESERVATION_LIST.findIndex(reservation => reservation.id === id)

  if (index !== -1) {
    RESERVATION_LIST[index] = new Reservation({
      ...RESERVATION_LIST[index],
      ...updatedReservationData,
      id: RESERVATION_LIST[index].id,
    })
    saveReservations()

    const updated = RESERVATION_LIST[index]
    if (updated.payment) {
      record_Blassti_Revenue({
        source_type: "ticket_purchase",
        source_id: updated.id,
        fee_type: "ticket_fee",
        gross_amount: updated.base_ticket_price,
        fee_amount: updated.blassti_fee,
        net_amount: updated.base_ticket_price,
        payer_user_id: updated.user_id ?? null,
        recipient_user_id: updated.recipient_user_id ?? null,
        venue_id: updated.venue_id ?? null,
        event_id: updated.event_id ?? null,
        reservation_id: updated.id,
        payment_status: "paid",
        created_at: updated.created_at,
        metadata: {
          event_title: updated.event_title,
          venue_title: updated.venue_title,
          ticket_count: updated.ticket_count,
        },
      })
    }

    return updated
  }

  return null
}

export function delete_Reservation(id) {
  const index = RESERVATION_LIST.findIndex(reservation => reservation.id === id)

  if (index !== -1) {
    const deleted = RESERVATION_LIST[index]
    RESERVATION_LIST.splice(index, 1)
    saveReservations()
    return deleted
  }

  return null
}

export function create_Event_Ticket_Reservation({
  user_id,
  event_id,
  selected_seats = [],
  seat_breakdown = null,
  total_price = null,
  payment_method = "card",
  payment_brand = "",
  card_last4 = "",
}) {
  const user = get_User_By_Id(user_id)
  const event = get_Event_By_Id(event_id)

  if (!user) {
    return {
      success: false,
      message: "User not found.",
    }
  }

  if (!event) {
    return {
      success: false,
      message: "Event not found.",
    }
  }

  const normalizedSeats = normalizeSelectedSeats(selected_seats)
  const finalBreakdown =
    seat_breakdown && Object.keys(seat_breakdown).length
      ? normalizeBreakdown(seat_breakdown)
      : getBreakdownFromSeats(normalizedSeats)

  const ticketCount =
    normalizedSeats.length ||
    Object.values(finalBreakdown).reduce((sum, count) => sum + Number(count || 0), 0)

  if (!ticketCount) {
    return {
      success: false,
      message: "Please select at least one seat.",
    }
  }

  const baseTicketPrice =
    total_price == null
      ? normalizedSeats.reduce((sum, seat) => sum + toNumber(seat.price, 0), 0)
      : toNumber(total_price, 0)

  const feeRate = get_Blassti_Event_Ticket_Fee_Rate()
  const blasstiFee = calculate_Blassti_Fee(baseTicketPrice, feeRate)
  const finalTotal = toNumber(baseTicketPrice + blasstiFee, 0)

  if (event.seats_left < ticketCount) {
    return {
      success: false,
      message: "Not enough seats left for this event.",
    }
  }

  const reservedKeys = new Set(get_Reserved_Seat_Keys_By_Event_Id(event.id))
  const duplicatedReservedSeat = normalizedSeats.find(
    seat => seat.key && reservedKeys.has(seat.key)
  )

  if (duplicatedReservedSeat) {
    return {
      success: false,
      message: `${duplicatedReservedSeat.label} is already reserved.`,
    }
  }

  const { recipient_user_id, recipient_type } = getRecipientForEvent(event)

  const reservation = add_Reservation(
    new Reservation({
      user_id: user.id,
      event_id: event.id,
      venue_id: event.venue_id ?? null,
      ticket_count: ticketCount,
      base_ticket_price: baseTicketPrice,
      blassti_fee: blasstiFee,
      total_price: finalTotal,
      status: deriveStatusForEvent(event, "Upcoming"),
      payment: true,
      payment_method,
      payment_brand,
      card_last4,
      vip_seats: countByClassName(finalBreakdown, ["VIP"]),
      regular_seats: countByClassName(finalBreakdown, ["Regular", "Normal"]),
      special_seats: countByClassName(finalBreakdown, ["Special"]),
      seat_breakdown: finalBreakdown,
      selected_seats: normalizedSeats,
      recipient_user_id,
      recipient_type,
      created_at: new Date().toISOString(),
      event_title: event.title ?? "",
      event_date: event.date ?? "",
      event_time: event.time ?? "",
      venue_title: event.venue ?? "",
      city: event.city ?? "",
    })
  )

  update_Event(event.id, {
    tickets_sold: Number(event.tickets_sold || 0) + ticketCount,
  })

  if (!Array.isArray(user.joined_event_ids)) {
    user.joined_event_ids = []
  }

  if (!user.joined_event_ids.includes(event.id)) {
    update_User(user.id, {
      joined_event_ids: [...user.joined_event_ids, event.id],
    })
  }

  create_Ticket_Purchase_Notification({
    userId: user.id,
    eventId: event.id,
    eventTitle: event.title,
    reservationId: reservation.id,
    totalPrice: finalTotal,
  })

  if (recipient_user_id) {
    create_Ticket_Payment_Received_Notification({
      userId: recipient_user_id,
      buyerUserId: user.id,
      eventId: event.id,
      eventTitle: event.title,
      reservationId: reservation.id,
      amount: finalTotal,
      isAdminFallback: recipient_type === "admin",
    })
  }

  return {
    success: true,
    message: "Ticket purchased successfully.",
    reservation,
  }
}