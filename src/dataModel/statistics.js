import { reactive } from "vue"
import { get_All_Users } from "@/dataModel/user"
import { get_All_Venues } from "@/dataModel/venue"
import { get_All_Events } from "@/dataModel/event"
import { get_All_Reservations } from "@/dataModel/reservation"
import { get_All_Venue_Reservations } from "@/dataModel/venue_reservation"
import { get_All_Venue_Requests } from "@/dataModel/venue_request"
import { get_All_Carpoolings } from "@/dataModel/carpooling"

const BLASSTI_REVENUE_LEDGER_KEY = "blassti_revenue_ledger_v1"
const BLASSTI_EVENT_TICKET_FEE_RATE_KEY = "blassti_event_ticket_fee_rate"
const BLASSTI_VENUE_BOOKING_FEE_RATE_KEY = "blassti_venue_booking_fee_rate"

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function round2(value) {
  return Number(toNumber(value, 0).toFixed(2))
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function parseLooseDate(value) {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const direct = new Date(value)
  if (!Number.isNaN(direct.getTime())) return direct

  const text = String(value).trim()
  const parts = text.split(" ")
  if (parts.length === 3) {
    const [day, month, year] = parts
    const alt = new Date(`${month} ${day}, ${year}`)
    if (!Number.isNaN(alt.getTime())) return alt
  }

  return null
}

function formatMonthKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function formatMonthLabelFromKey(key) {
  const [year, month] = key.split("-").map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}

function getAgeFromBirthdate(dateOfBirth) {
  const birth = parseLooseDate(dateOfBirth)
  if (!birth) return null

  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  const dayDiff = now.getDate() - birth.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1
  }

  return age >= 0 ? age : null
}

function getAgeBucket(age) {
  if (age == null) return "Unknown"
  if (age < 18) return "<18"
  if (age <= 24) return "18–24"
  if (age <= 34) return "25–34"
  if (age <= 44) return "35–44"
  if (age <= 54) return "45–54"
  return "55+"
}

function loadLedger() {
  const raw = localStorage.getItem(BLASSTI_REVENUE_LEDGER_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Failed to parse Blassti revenue ledger.", error)
    return []
  }
}

export const BLASSTI_REVENUE_LEDGER = reactive(loadLedger())

function saveLedger() {
  localStorage.setItem(
    BLASSTI_REVENUE_LEDGER_KEY,
    JSON.stringify(BLASSTI_REVENUE_LEDGER)
  )
}

export function get_Blassti_Event_Ticket_Fee_Rate() {
  const saved = localStorage.getItem(BLASSTI_EVENT_TICKET_FEE_RATE_KEY)
  const parsed = Number(saved)
  if (Number.isFinite(parsed) && parsed >= 0) return parsed
  localStorage.setItem(BLASSTI_EVENT_TICKET_FEE_RATE_KEY, "0.02")
  return 0.02
}

export function get_Blassti_Venue_Booking_Fee_Rate() {
  const saved = localStorage.getItem(BLASSTI_VENUE_BOOKING_FEE_RATE_KEY)
  const parsed = Number(saved)
  if (Number.isFinite(parsed) && parsed >= 0) return parsed
  localStorage.setItem(BLASSTI_VENUE_BOOKING_FEE_RATE_KEY, "0.03")
  return 0.03
}

export function set_Blassti_Event_Ticket_Fee_Rate(rate) {
  localStorage.setItem(BLASSTI_EVENT_TICKET_FEE_RATE_KEY, String(toNumber(rate, 0.02)))
}

export function set_Blassti_Venue_Booking_Fee_Rate(rate) {
  localStorage.setItem(BLASSTI_VENUE_BOOKING_FEE_RATE_KEY, String(toNumber(rate, 0.03)))
}

export function calculate_Blassti_Fee(amount, rate = 0.02) {
  return round2(toNumber(amount, 0) * toNumber(rate, 0))
}

export function get_All_Blassti_Revenue_Entries() {
  return BLASSTI_REVENUE_LEDGER
}

export function record_Blassti_Revenue({
  source_type,
  source_id,
  fee_type,
  gross_amount = 0,
  fee_amount = 0,
  net_amount = 0,
  payer_user_id = null,
  recipient_user_id = null,
  venue_id = null,
  event_id = null,
  reservation_id = null,
  payment_status = "paid",
  created_at = new Date().toISOString(),
  metadata = {},
}) {
  if (!source_type || !source_id) return null

  const existingIndex = BLASSTI_REVENUE_LEDGER.findIndex(
    entry => entry.source_type === source_type && entry.source_id === source_id
  )

  const entry = {
    id:
      existingIndex !== -1
        ? BLASSTI_REVENUE_LEDGER[existingIndex].id
        : crypto.randomUUID(),
    source_type,
    source_id,
    fee_type: fee_type || source_type,
    gross_amount: round2(gross_amount),
    fee_amount: round2(fee_amount),
    net_amount: round2(net_amount),
    payer_user_id,
    recipient_user_id,
    venue_id,
    event_id,
    reservation_id,
    payment_status,
    created_at,
    metadata: metadata || {},
    updated_at: new Date().toISOString(),
  }

  if (existingIndex !== -1) {
    BLASSTI_REVENUE_LEDGER[existingIndex] = {
      ...BLASSTI_REVENUE_LEDGER[existingIndex],
      ...entry,
    }
  } else {
    BLASSTI_REVENUE_LEDGER.unshift(entry)
  }

  saveLedger()
  return entry
}

export function ensure_Blassti_Revenue_Ledger_Integrity() {
  const ticketReservations = safeArray(get_All_Reservations())
  const venueReservations = safeArray(get_All_Venue_Reservations())

  ticketReservations.forEach(reservation => {
    if (!reservation?.id) return
    if (reservation.payment === false) return

    const grossAmount =
      reservation.base_ticket_price != null
        ? toNumber(reservation.base_ticket_price, 0)
        : Math.max(
            0,
            toNumber(reservation.total_price, 0) - toNumber(reservation.blassti_fee, 0)
          )

    const feeAmount = toNumber(reservation.blassti_fee, 0)
    const totalAmount =
      reservation.total_price != null
        ? toNumber(reservation.total_price, 0)
        : round2(grossAmount + feeAmount)

    record_Blassti_Revenue({
      source_type: "ticket_purchase",
      source_id: reservation.id,
      fee_type: "ticket_fee",
      gross_amount: grossAmount,
      fee_amount: feeAmount,
      net_amount: round2(totalAmount - feeAmount),
      payer_user_id: reservation.user_id ?? null,
      recipient_user_id: reservation.recipient_user_id ?? null,
      venue_id: reservation.venue_id ?? null,
      event_id: reservation.event_id ?? null,
      reservation_id: reservation.id,
      payment_status: reservation.payment ? "paid" : "unpaid",
      created_at: reservation.created_at ?? new Date().toISOString(),
      metadata: {
        event_title: reservation.event_title ?? "",
        venue_title: reservation.venue_title ?? "",
        ticket_count: reservation.ticket_count ?? 0,
      },
    })
  })

  venueReservations.forEach(reservation => {
    if (!reservation?.id) return
    if (reservation.payment === false) return

    const grossAmount = toNumber(reservation.base_price, 0)
    const feeAmount = toNumber(reservation.blassti_fee, 0)
    const totalAmount =
      reservation.total_price != null
        ? toNumber(reservation.total_price, 0)
        : round2(grossAmount + feeAmount)

    record_BlassttiRevenueForVenue({
      reservation,
      grossAmount,
      feeAmount,
      totalAmount,
    })
  })
}

function record_BlassttiRevenueForVenue({
  reservation,
  grossAmount,
  feeAmount,
  totalAmount,
}) {
  record_Blassti_Revenue({
    source_type: "venue_booking",
    source_id: reservation.id,
    fee_type: "venue_fee",
    gross_amount: grossAmount,
    fee_amount: feeAmount,
    net_amount: round2(totalAmount - feeAmount),
    payer_user_id: reservation.user_id ?? null,
    recipient_user_id: reservation.paid_to_user_id ?? reservation.owner_user_id ?? null,
    venue_id: reservation.venue_id ?? null,
    event_id: null,
    reservation_id: reservation.id,
    payment_status: reservation.payment ? "paid" : "unpaid",
    created_at: reservation.created_at ?? new Date().toISOString(),
    metadata: {
      duration_hours: reservation.duration_hours ?? 0,
      duration_days: reservation.duration_days ?? 0,
    },
  })
}

function countBy(list, getter, fallback = "Unknown") {
  const out = {}
  safeArray(list).forEach(item => {
    const key = getter(item) ?? fallback
    const normalized = String(key || fallback).trim() || fallback
    out[normalized] = (out[normalized] || 0) + 1
  })
  return out
}

function objectToSortedArray(obj, options = {}) {
  const {
    sort = "desc",
    keepOrder = false,
    keyOrder = [],
  } = options

  let entries = Object.entries(obj).map(([label, value]) => ({
    label,
    value: toNumber(value, 0),
  }))

  if (keepOrder && keyOrder.length) {
    entries = keyOrder
      .filter(key => Object.prototype.hasOwnProperty.call(obj, key))
      .map(key => ({
        label: key,
        value: toNumber(obj[key], 0),
      }))
  } else if (sort === "asc") {
    entries.sort((a, b) => a.value - b.value)
  } else if (sort === "alpha") {
    entries.sort((a, b) => a.label.localeCompare(b.label))
  } else {
    entries.sort((a, b) => b.value - a.value)
  }

  return entries
}

function getMonthlySeries(items, getDate) {
  const map = {}

  safeArray(items).forEach(item => {
    const date = parseLooseDate(getDate(item))
    if (!date) return
    const key = formatMonthKey(date)
    map[key] = (map[key] || 0) + 1
  })

  return Object.keys(map)
    .sort()
    .map(key => ({
      key,
      label: formatMonthLabelFromKey(key),
      value: map[key],
    }))
}

function getMonthlyRevenueSeries(entries) {
  const map = {}

  safeArray(entries).forEach(entry => {
    const date = parseLooseDate(entry.created_at)
    if (!date) return
    const key = formatMonthKey(date)

    if (!map[key]) {
      map[key] = {
        key,
        label: formatMonthLabelFromKey(key),
        total_revenue: 0,
        ticket_fee_revenue: 0,
        venue_fee_revenue: 0,
      }
    }

    map[key].total_revenue += toNumber(entry.fee_amount, 0)

    if (entry.fee_type === "ticket_fee") {
      map[key].ticket_fee_revenue += toNumber(entry.fee_amount, 0)
    }

    if (entry.fee_type === "venue_fee") {
      map[key].venue_fee_revenue += toNumber(entry.fee_amount, 0)
    }
  })

  return Object.values(map)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(item => ({
      ...item,
      total_revenue: round2(item.total_revenue),
      ticket_fee_revenue: round2(item.ticket_fee_revenue),
      venue_fee_revenue: round2(item.venue_fee_revenue),
    }))
}

function sumBy(items, getter) {
  return round2(
    safeArray(items).reduce((sum, item) => sum + toNumber(getter(item), 0), 0)
  )
}

function isPastEvent(event) {
  const date = parseLooseDate(`${event?.date ?? ""} ${event?.time ?? "00:00"}`)
  if (!date) return false
  return date.getTime() < Date.now()
}

function getDonutSegments(array) {
  const total = array.reduce((sum, item) => sum + toNumber(item.value, 0), 0)
  let cursor = 0

  return array.map((item, index) => {
    const value = toNumber(item.value, 0)
    const start = total ? (cursor / total) * 360 : 0
    const angle = total ? (value / total) * 360 : 0
    cursor += value

    const palette = [
      "#3b82f6",
      "#8b5cf6",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#ec4899",
      "#84cc16",
      "#14b8a6",
      "#6366f1",
    ]

    return {
      ...item,
      color: palette[index % palette.length],
      startAngle: start,
      angle,
      percentage: total ? round2((value / total) * 100) : 0,
    }
  })
}

export function get_Site_Statistics() {
  ensure_Blassti_Revenue_Ledger_Integrity()

  const users = safeArray(get_All_Users())
  const venues = safeArray(get_All_Venues())
  const events = safeArray(get_All_Events())
  const reservations = safeArray(get_All_Reservations())
  const venueReservations = safeArray(get_All_Venue_Reservations())
  const venueRequests = safeArray(get_All_Venue_Requests())
  const carpools = safeArray(get_All_Carpoolings())
  const ledger = safeArray(get_All_Blassti_Revenue_Entries())

  const artists = users.filter(user => user.is_artist)
  const admins = users.filter(user => user.is_admin)
  const moderators = users.filter(user => user.is_moderator && !user.is_admin)
  const suspendedUsers = users.filter(
    user => user?.suspension?.is_active === true
  )

  const activeVenues = venues.filter(venue => venue.availability === true)
  const ownerVenues = venues.filter(venue => venue.owner_user_id)

  const pastEvents = events.filter(isPastEvent)
  const upcomingEvents = events.filter(event => !isPastEvent(event))
  const soldOutEvents = events.filter(
    event => Number(event.capacity || 0) > 0 && Number(event.tickets_sold || 0) >= Number(event.capacity || 0)
  )
  const lastCallEvents = events.filter(event => Boolean(event.last_call))

  const paidReservations = reservations.filter(r => r.payment === true)
  const cancelledReservations = reservations.filter(r => r.status === "Cancelled")
  const paidVenueReservations = venueReservations.filter(r => r.payment === true)

  const currentCarpools = carpools.filter(carpool => carpool.is_current)
  const pastCarpools = carpools.filter(carpool => !carpool.is_current)

  const totalUsers = users.length
  const totalVenues = venues.length
  const totalEvents = events.length
  const totalTicketReservations = reservations.length
  const totalVenueReservations = venueReservations.length

  const totalGrossTicketSales = sumBy(paidReservations, item =>
    item.base_ticket_price != null ? item.base_ticket_price : item.total_price
  )
  const totalTicketFees = sumBy(
    ledger.filter(entry => entry.fee_type === "ticket_fee"),
    entry => entry.fee_amount
  )

  const totalGrossVenueBookings = sumBy(paidVenueReservations, item => item.base_price)
  const totalVenueFees = sumBy(
    ledger.filter(entry => entry.fee_type === "venue_fee"),
    entry => entry.fee_amount
  )

  const totalRevenue = round2(totalTicketFees + totalVenueFees)

  const usersByMonth = getMonthlySeries(users, user => user.account_created_at)
  const usersByCity = objectToSortedArray(
    countBy(users, user => user.city || user.state || "Unknown"),
    { sort: "desc" }
  )
  const usersByAge = objectToSortedArray(
    countBy(users, user => getAgeBucket(getAgeFromBirthdate(user.date_of_birth))),
    {
      keepOrder: true,
      keyOrder: ["<18", "18–24", "25–34", "35–44", "45–54", "55+", "Unknown"],
    }
  )
  const usersByGender = objectToSortedArray(
    countBy(users, user => user.gender || "Unknown"),
    { sort: "desc" }
  )

  const venuesByCity = objectToSortedArray(
    countBy(venues, venue => venue.location || "Unknown"),
    { sort: "desc" }
  )
  const venuesByCategory = objectToSortedArray(
    countBy(venues, venue => venue.category || "Other"),
    { sort: "desc" }
  )
  const venuesByType = objectToSortedArray(
    countBy(venues, venue => venue.type || "Unknown"),
    { sort: "desc" }
  )
  const venuesByStatus = objectToSortedArray({
    Active: activeVenues.length,
    Unavailable: venues.filter(venue => !venue.availability).length,
    "Owner-created": ownerVenues.length,
  })

  const eventsByType = objectToSortedArray(
    countBy(events, event => event.type || "Other"),
    { sort: "desc" }
  )
  const eventsByCity = objectToSortedArray(
    countBy(events, event => event.city || "Unknown"),
    { sort: "desc" }
  )
  const eventStatusBreakdown = objectToSortedArray({
    Upcoming: upcomingEvents.length,
    Past: pastEvents.length,
    SoldOut: soldOutEvents.length,
    LastCall: lastCallEvents.length,
  })

  const ticketReservationsByStatus = objectToSortedArray(
    countBy(reservations, reservation => reservation.status || "Unknown"),
    { sort: "desc" }
  )

  const venueRequestsByStatus = objectToSortedArray(
    countBy(venueRequests, request => request.status || "Unknown"),
    { sort: "desc" }
  )

  const carpoolsByStatus = objectToSortedArray(
    countBy(carpools, carpool => carpool.status || "Unknown"),
    { sort: "desc" }
  )

  const ticketSalesByEventTypeMap = {}
  paidReservations.forEach(reservation => {
    const event = events.find(item => item.id === reservation.event_id)
    const type = event?.type || "Other"
    ticketSalesByEventTypeMap[type] =
      (ticketSalesByEventTypeMap[type] || 0) + toNumber(reservation.ticket_count, 0)
  })
  const ticketSalesByEventType = objectToSortedArray(ticketSalesByEventTypeMap)

  const topEventsByTickets = [...events]
    .sort((a, b) => toNumber(b.tickets_sold, 0) - toNumber(a.tickets_sold, 0))
    .slice(0, 8)
    .map(event => ({
      label: event.title,
      value: toNumber(event.tickets_sold, 0),
      sublabel: event.type,
    }))

  const topVenuesByCapacity = [...venues]
    .sort((a, b) => toNumber(b.capacity, 0) - toNumber(a.capacity, 0))
    .slice(0, 8)
    .map(venue => ({
      label: venue.title,
      value: toNumber(venue.capacity, 0),
      sublabel: venue.location,
    }))

  const revenueBySource = objectToSortedArray({
    "Ticket fees": totalTicketFees,
    "Venue booking fees": totalVenueFees,
  })

  const monthlyRevenue = getMonthlyRevenueSeries(ledger)

  return {
    overview: {
      totalUsers,
      totalArtists: artists.length,
      totalAdmins: admins.length,
      totalModerators: moderators.length,
      suspendedUsers: suspendedUsers.length,
      totalVenues,
      activeVenues: activeVenues.length,
      ownerVenues: ownerVenues.length,
      totalEvents,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      soldOutEvents: soldOutEvents.length,
      lastCallEvents: lastCallEvents.length,
      totalTicketReservations,
      totalVenueReservations,
      currentCarpools: currentCarpools.length,
      pastCarpools: pastCarpools.length,
      pendingVenueRequests: venueRequests.filter(item => item.status === "Pending").length,
      approvedVenueRequests: venueRequests.filter(item => item.status === "Approved").length,
      deniedVenueRequests: venueRequests.filter(item => item.status === "Denied").length,
      totalGrossTicketSales,
      totalGrossVenueBookings,
      totalTicketFees,
      totalVenueFees,
      totalRevenue,
      totalCancelledReservations: cancelledReservations.length,
    },

    cards: [
      {
        id: "users",
        title: "Users",
        value: totalUsers,
        subtitle: `${artists.length} artists · ${admins.length} admins`,
        icon: "mdi-account-group-outline",
        color: "primary",
      },
      {
        id: "venues",
        title: "Venues",
        value: totalVenues,
        subtitle: `${activeVenues.length} active · ${ownerVenues.length} owner venues`,
        icon: "mdi-map-marker-multiple-outline",
        color: "deep-purple-accent-4",
      },
      {
        id: "events",
        title: "Events",
        value: totalEvents,
        subtitle: `${upcomingEvents.length} upcoming · ${soldOutEvents.length} sold out`,
        icon: "mdi-calendar-star",
        color: "cyan-darken-1",
      },
      {
        id: "ticketRevenue",
        title: "Ticket Fee Revenue",
        value: totalTicketFees,
        subtitle: `Gross ticket sales: ${totalGrossTicketSales} TND`,
        icon: "mdi-ticket-confirmation-outline",
        color: "success",
        currency: true,
      },
      {
        id: "venueRevenue",
        title: "Venue Fee Revenue",
        value: totalVenueFees,
        subtitle: `Gross venue bookings: ${totalGrossVenueBookings} TND`,
        icon: "mdi-home-city-outline",
        color: "amber-darken-2",
        currency: true,
      },
      {
        id: "totalRevenue",
        title: "Total Blassti Revenue",
        value: totalRevenue,
        subtitle: `${totalTicketReservations + totalVenueReservations} paid revenue actions`,
        icon: "mdi-cash-multiple",
        color: "pink-accent-3",
        currency: true,
      },
    ],

    details: {
      users: {
        summary: {
          total: totalUsers,
          artists: artists.length,
          admins: admins.length,
          moderators: moderators.length,
          suspended: suspendedUsers.length,
        },
        line: usersByMonth,
        bars: usersByAge,
        donut: getDonutSegments(usersByGender),
        secondaryBars: usersByCity.slice(0, 10),
      },

      venues: {
        summary: {
          total: totalVenues,
          active: activeVenues.length,
          unavailable: totalVenues - activeVenues.length,
          owner_created: ownerVenues.length,
        },
        bars: venuesByCategory,
        donut: getDonutSegments(venuesByType),
        secondaryBars: venuesByCity.slice(0, 10),
        topList: topVenuesByCapacity,
      },

      events: {
        summary: {
          total: totalEvents,
          upcoming: upcomingEvents.length,
          past: pastEvents.length,
          sold_out: soldOutEvents.length,
          last_call: lastCallEvents.length,
        },
        bars: eventsByType,
        donut: getDonutSegments(eventStatusBreakdown),
        secondaryBars: eventsByCity.slice(0, 10),
        topList: topEventsByTickets,
      },

      ticketRevenue: {
        summary: {
          gross_sales: totalGrossTicketSales,
          fee_revenue: totalTicketFees,
          reservation_count: paidReservations.length,
          cancelled: cancelledReservations.length,
        },
        line: monthlyRevenue.map(item => ({
          label: item.label,
          value: item.ticket_fee_revenue,
        })),
        bars: ticketSalesByEventType,
        donut: getDonutSegments(ticketReservationsByStatus),
        ledger: ledger
          .filter(entry => entry.fee_type === "ticket_fee")
          .slice(0, 12)
          .map(entry => ({
            title: entry.metadata?.event_title || "Ticket purchase",
            value: entry.fee_amount,
            created_at: entry.created_at,
          })),
      },

      venueRevenue: {
        summary: {
          gross_sales: totalGrossVenueBookings,
          fee_revenue: totalVenueFees,
          reservation_count: paidVenueReservations.length,
          pending_requests: venueRequests.filter(item => item.status === "Pending").length,
        },
        line: monthlyRevenue.map(item => ({
          label: item.label,
          value: item.venue_fee_revenue,
        })),
        bars: venueRequestsByStatus,
        donut: getDonutSegments(
          objectToSortedArray({
            Reserved: paidVenueReservations.filter(item => item.status === "Reserved").length,
            Cancelled: venueReservations.filter(item => item.status === "Cancelled").length,
          })
        ),
        ledger: ledger
          .filter(entry => entry.fee_type === "venue_fee")
          .slice(0, 12)
          .map(entry => ({
            title: entry.metadata?.venue_title || "Venue booking",
            value: entry.fee_amount,
            created_at: entry.created_at,
          })),
      },

      totalRevenue: {
        summary: {
          total_revenue: totalRevenue,
          ticket_fee_revenue: totalTicketFees,
          venue_fee_revenue: totalVenueFees,
          current_carpools: currentCarpools.length,
        },
        line: monthlyRevenue.map(item => ({
          label: item.label,
          value: item.total_revenue,
        })),
        bars: revenueBySource,
        donut: getDonutSegments(carpoolsByStatus),
        ledger: ledger
          .slice(0, 16)
          .map(entry => ({
            title:
              entry.fee_type === "ticket_fee"
                ? entry.metadata?.event_title || "Ticket fee"
                : entry.metadata?.venue_title || "Venue fee",
            value: entry.fee_amount,
            created_at: entry.created_at,
            kind: entry.fee_type,
          })),
      },
    },
  }
}