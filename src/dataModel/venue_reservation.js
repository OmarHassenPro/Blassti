import { reactive } from "vue"
import {
  does_Venue_Have_Administration_Conflict,
  get_Venue_By_Id,
  get_Venue_Payment_Recipient_User_Id,
} from "@/dataModel/venue"
import {
  create_Venue_Reservation_Confirmation_Notification,
  create_Venue_Reservation_Owner_Notification,
} from "@/dataModel/notification"
import {
  calculate_Blassti_Fee,
  get_Blassti_Venue_Booking_Fee_Rate,
  record_Blassti_Revenue,
} from "@/dataModel/statistics"

const VENUE_RESERVATIONS_STORAGE_KEY = "venue_reservations_v3"

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export class VenueReservation {
  constructor({
    id,
    venue_id,
    user_id,
    owner_user_id,
    paid_to_user_id,
    start_date,
    end_date,
    start_datetime,
    end_datetime,
    payment,
    duration,
    duration_unit,
    duration_hours,
    duration_days,
    price_per_hour,
    price_per_day,
    base_price,
    blassti_fee,
    total_price,
    payment_method,
    payment_status,
    card_last4,
    status,
    created_at,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.venue_id = venue_id
    this.user_id = user_id
    this.owner_user_id = owner_user_id ?? null
    this.paid_to_user_id = paid_to_user_id ?? null
    this.start_date = start_date ?? ""
    this.end_date = end_date ?? ""
    this.start_datetime = start_datetime ?? ""
    this.end_datetime = end_datetime ?? ""
    this.payment = Boolean(payment)
    this.duration = toNumber(duration, 0)
    this.duration_unit = duration_unit ?? "hours"
    this.duration_hours = toNumber(duration_hours, 0)
    this.duration_days = toNumber(duration_days, 0)
    this.price_per_hour = toNumber(price_per_hour, 0)
    this.price_per_day = toNumber(price_per_day, 0)
    this.base_price = toNumber(base_price, 0)
    this.blassti_fee = toNumber(blassti_fee, 0)
    this.total_price = toNumber(total_price, 0)
    this.payment_method = payment_method ?? "card"
    this.payment_status = payment_status ?? "paid"
    this.card_last4 = card_last4 ?? ""
    this.status = status ?? "Reserved"
    this.created_at = created_at ?? new Date().toISOString()
  }
}

function loadVenueReservations() {
  const raw = localStorage.getItem(VENUE_RESERVATIONS_STORAGE_KEY)

  if (!raw) {
    return [
      new VenueReservation({
        id: "vr-1",
        venue_id: "venue-1",
        user_id: "user-1",
        owner_user_id: null,
        paid_to_user_id: "admin-user-1",
        start_date: "2026-05-01T10:00:00.000Z",
        end_date: "2026-05-02T10:00:00.000Z",
        start_datetime: "2026-05-01T10:00:00.000Z",
        end_datetime: "2026-05-02T10:00:00.000Z",
        payment: true,
        duration: 24,
        duration_unit: "hours",
        duration_hours: 24,
        duration_days: 1,
        price_per_hour: 180,
        price_per_day: 1200,
        base_price: 4320,
        blassti_fee: 129.6,
        total_price: 4449.6,
        payment_method: "card",
        payment_status: "paid",
        card_last4: "4242",
        status: "Reserved",
      }),
      new VenueReservation({
        id: "vr-2",
        venue_id: "venue-2",
        user_id: "user-2",
        owner_user_id: null,
        paid_to_user_id: "admin-user-1",
        start_date: "2026-05-10T14:00:00.000Z",
        end_date: "2026-05-10T18:00:00.000Z",
        start_datetime: "2026-05-10T14:00:00.000Z",
        end_datetime: "2026-05-10T18:00:00.000Z",
        payment: true,
        duration: 4,
        duration_unit: "hours",
        duration_hours: 4,
        duration_days: 0,
        price_per_hour: 250,
        price_per_day: 1700,
        base_price: 1000,
        blassti_fee: 30,
        total_price: 1030,
        payment_method: "card",
        payment_status: "paid",
        card_last4: "1111",
        status: "Reserved",
      }),
    ]
  }

  try {
    const parsed = JSON.parse(raw)
    return parsed.map(item => new VenueReservation(item))
  } catch (error) {
    console.error("Failed to parse venue reservations. Resetting.", error)
    localStorage.removeItem(VENUE_RESERVATIONS_STORAGE_KEY)
    return []
  }
}

export const VENUE_RESERVATION_LIST = reactive(loadVenueReservations())

function saveVenueReservations() {
  localStorage.setItem(
    VENUE_RESERVATIONS_STORAGE_KEY,
    JSON.stringify(VENUE_RESERVATION_LIST)
  )
}

saveVenueReservations()

export function get_All_Venue_Reservations() {
  return VENUE_RESERVATION_LIST
}

export function get_Venue_Reservation_By_Id(id) {
  return VENUE_RESERVATION_LIST.find(r => r.id === id) || null
}

export function get_Reservations_By_Venue_Id(venue_id) {
  return VENUE_RESERVATION_LIST.filter(r => r.venue_id === venue_id)
}

export function get_Reservations_By_User_Id(user_id) {
  return VENUE_RESERVATION_LIST.filter(r => r.user_id === user_id)
}

export function get_Active_Reservations_By_Venue_Id(venue_id) {
  return VENUE_RESERVATION_LIST.filter(
    r => r.venue_id === venue_id && r.status !== "Cancelled"
  )
}

export function add_Venue_Reservation(reservationData) {
  const reservation =
    reservationData instanceof VenueReservation
      ? reservationData
      : new VenueReservation(reservationData)

  VENUE_RESERVATION_LIST.unshift(reservation)
  saveVenueReservations()

  if (reservation.payment) {
    record_Blassti_Revenue({
      source_type: "venue_booking",
      source_id: reservation.id,
      fee_type: "venue_fee",
      gross_amount: reservation.base_price,
      fee_amount: reservation.blassti_fee,
      net_amount: reservation.base_price,
      payer_user_id: reservation.user_id ?? null,
      recipient_user_id: reservation.paid_to_user_id ?? reservation.owner_user_id ?? null,
      venue_id: reservation.venue_id ?? null,
      reservation_id: reservation.id,
      payment_status: reservation.payment_status ?? "paid",
      created_at: reservation.created_at,
      metadata: {
        duration_hours: reservation.duration_hours,
        duration_days: reservation.duration_days,
      },
    })
  }

  return reservation
}

export function update_Venue_Reservation(id, updatedData) {
  const index = VENUE_RESERVATION_LIST.findIndex(r => r.id === id)

  if (index === -1) return null

  VENUE_RESERVATION_LIST[index] = new VenueReservation({
    ...VENUE_RESERVATION_LIST[index],
    ...updatedData,
    id: VENUE_RESERVATION_LIST[index].id,
  })

  saveVenueReservations()

  const updated = VENUE_RESERVATION_LIST[index]
  if (updated.payment) {
    record_Blassti_Revenue({
      source_type: "venue_booking",
      source_id: updated.id,
      fee_type: "venue_fee",
      gross_amount: updated.base_price,
      fee_amount: updated.blassti_fee,
      net_amount: updated.base_price,
      payer_user_id: updated.user_id ?? null,
      recipient_user_id: updated.paid_to_user_id ?? updated.owner_user_id ?? null,
      venue_id: updated.venue_id ?? null,
      reservation_id: updated.id,
      payment_status: updated.payment_status ?? "paid",
      created_at: updated.created_at,
      metadata: {
        duration_hours: updated.duration_hours,
        duration_days: updated.duration_days,
      },
    })
  }

  return updated
}

export function delete_Venue_Reservation(id) {
  const index = VENUE_RESERVATION_LIST.findIndex(r => r.id === id)

  if (index === -1) return null

  const deleted = VENUE_RESERVATION_LIST[index]
  VENUE_RESERVATION_LIST.splice(index, 1)
  saveVenueReservations()
  return deleted
}

export function delete_Reservations_By_Venue_Id(venueId) {
  if (!venueId) return []

  const deletedReservations = []

  for (let index = VENUE_RESERVATION_LIST.length - 1; index >= 0; index -= 1) {
    if (VENUE_RESERVATION_LIST[index].venue_id === venueId) {
      deletedReservations.push(VENUE_RESERVATION_LIST[index])
      VENUE_RESERVATION_LIST.splice(index, 1)
    }
  }

  if (deletedReservations.length) {
    saveVenueReservations()
  }

  return deletedReservations.reverse()
}

export function is_Venue_Time_Range_Available(venueId, startDateTime, endDateTime) {
  if (!venueId || !startDateTime || !endDateTime) return false

  const start = new Date(startDateTime).getTime()
  const end = new Date(endDateTime).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return false
  }

  if (does_Venue_Have_Administration_Conflict(venueId, startDateTime, endDateTime)) {
    return false
  }

  const reservations = get_Active_Reservations_By_Venue_Id(venueId)

  return !reservations.some(reservation => {
    const reservationStart = new Date(
      reservation.start_datetime || reservation.start_date
    ).getTime()

    const reservationEnd = new Date(
      reservation.end_datetime || reservation.end_date
    ).getTime()

    return start < reservationEnd && end > reservationStart
  })
}

export function does_Venue_Have_Conflict(venueId, startDateTime, endDateTime) {
  return !is_Venue_Time_Range_Available(venueId, startDateTime, endDateTime)
}

export function create_Venue_Reservation_For_User({
  venueId,
  userId,
  startDateTime,
  endDateTime,
  duration = 0,
  durationUnit = "hours",
  paymentMethod = "card",
  cardLast4 = "",
}) {
  const venue = get_Venue_By_Id(venueId)

  if (!venue) {
    return { success: false, message: "Venue not found." }
  }

  if (!userId) {
    return { success: false, message: "User not found." }
  }

  if (!is_Venue_Time_Range_Available(venueId, startDateTime, endDateTime)) {
    return { success: false, message: "This timeslot is no longer available." }
  }

  const start = new Date(startDateTime)
  const end = new Date(endDateTime)
  const diffMs = end.getTime() - start.getTime()
  const durationHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)))
  const durationDaysFloat = durationHours / 24
  const durationDaysRoundedUp = Math.max(1, Math.ceil(durationDaysFloat))

  const pricePerHour = toNumber(venue.price_per_hour, 0)
  const pricePerDay = toNumber(venue.price_per_day, 0)

  let basePrice = 0

  if (durationUnit === "days") {
    basePrice = Number((durationDaysRoundedUp * pricePerDay).toFixed(2))
  } else {
    basePrice = Number((durationHours * pricePerHour).toFixed(2))
  }

  const feeRate = get_Blassti_Venue_Booking_Fee_Rate()
  const blasstiFee = calculate_Blassti_Fee(basePrice, feeRate)
  const totalPrice = Number((basePrice + blasstiFee).toFixed(2))

  const paidToUserId = get_Venue_Payment_Recipient_User_Id(venue)

  const reservation = add_Venue_Reservation({
    venue_id: venue.id,
    user_id: userId,
    owner_user_id: venue.owner_user_id ?? null,
    paid_to_user_id: paidToUserId,
    start_date: startDateTime,
    end_date: endDateTime,
    start_datetime: startDateTime,
    end_datetime: endDateTime,
    payment: true,
    duration,
    duration_unit: durationUnit,
    duration_hours: durationHours,
    duration_days: durationDaysRoundedUp,
    price_per_hour: pricePerHour,
    price_per_day: pricePerDay,
    base_price: basePrice,
    blassti_fee: blasstiFee,
    total_price: totalPrice,
    payment_method: paymentMethod,
    payment_status: "paid",
    card_last4: cardLast4,
    status: "Reserved",
  })

  create_Venue_Reservation_Confirmation_Notification({
    userId,
    venueId: venue.id,
    venueTitle: venue.title,
    reservationId: reservation.id,
    totalPrice,
    startDateTime,
    endDateTime,
  })

  create_Venue_Reservation_Owner_Notification({
    userId: paidToUserId,
    reserverUserId: userId,
    venueId: venue.id,
    venueTitle: venue.title,
    reservationId: reservation.id,
    totalPrice,
    startDateTime,
    endDateTime,
    isAdminFallback: !venue.owner_user_id,
  })

  return {
    success: true,
    message: "Venue reserved successfully.",
    reservation,
    venue,
  }
}