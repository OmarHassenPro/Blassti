import { reactive } from "vue"
import { get_All_Users } from "@/dataModel/user"

const NOTIFICATIONS_STORAGE_KEY = "blassti_notifications_v5"

export class AppNotification {
  constructor({
    id,
    user_id,
    title,
    subtitle,
    icon,
    path,
    is_read,
    created_at,
    related_user_id,
    related_event_id,
    related_carpool_id,
    related_venue_id,
    related_venue_request_id,
    related_venue_reservation_id,
    type,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.user_id = user_id ?? null
    this.title = title ?? ""
    this.subtitle = subtitle ?? title ?? ""
    this.icon = icon ?? "mdi-bell-outline"
    this.path = path ?? ""
    this.is_read = is_read ?? false
    this.created_at = created_at ?? new Date().toISOString()
    this.related_user_id = related_user_id ?? null
    this.related_event_id = related_event_id ?? null
    this.related_carpool_id = related_carpool_id ?? null
    this.related_venue_id = related_venue_id ?? null
    this.related_venue_request_id = related_venue_request_id ?? null
    this.related_venue_reservation_id = related_venue_reservation_id ?? null
    this.type = type ?? "general"
  }
}

function loadNotifications() {
  const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)

  if (!saved) return []

  try {
    const parsed = JSON.parse(saved)
    return parsed.map(item => new AppNotification(item))
  } catch (error) {
    console.error("Failed to parse notifications. Resetting.", error)
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY)
    return []
  }
}

function saveNotifications() {
  localStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(NOTIFICATION_LIST)
  )
}

export const NOTIFICATION_LIST = reactive(loadNotifications())

export function get_All_Notifications() {
  return NOTIFICATION_LIST
}

export function get_Notifications_For_User(userId) {
  if (!userId) return []

  return NOTIFICATION_LIST
    .filter(notif => notif.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function get_Unread_Notifications_Count(userId) {
  if (!userId) return 0
  return get_Notifications_For_User(userId).filter(notif => !notif.is_read).length
}

export function add_Notification(notificationData) {
  const item =
    notificationData instanceof AppNotification
      ? notificationData
      : new AppNotification(notificationData)

  NOTIFICATION_LIST.unshift(item)
  saveNotifications()
  return item
}

export function mark_Notification_As_Read(notificationId, userId) {
  const notif = NOTIFICATION_LIST.find(
    item => item.id === notificationId && item.user_id === userId
  )

  if (!notif) return null

  notif.is_read = true
  saveNotifications()
  return notif
}

export function mark_All_Notifications_As_Read(userId) {
  if (!userId) return

  NOTIFICATION_LIST.forEach(notif => {
    if (notif.user_id === userId) {
      notif.is_read = true
    }
  })

  saveNotifications()
}

export function clear_Notifications_For_User(userId) {
  if (!userId) return

  for (let i = NOTIFICATION_LIST.length - 1; i >= 0; i -= 1) {
    if (NOTIFICATION_LIST[i].user_id === userId) {
      NOTIFICATION_LIST.splice(i, 1)
    }
  }

  saveNotifications()
}

export function broadcast_Notification({
  title,
  subtitle,
  icon = "mdi-bell-badge-outline",
  path = "",
  type = "broadcast",
}) {
  const users = get_All_Users()

  users.forEach(user => {
    add_Notification({
      user_id: user.id,
      title,
      subtitle,
      icon,
      path,
      type,
    })
  })
}

export function create_Moderator_Status_Notification({
  userId,
  isModerator,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: isModerator ? "Moderator access granted" : "Moderator access removed",
    subtitle: isModerator
      ? "You are now a moderator on Blassti."
      : "Your moderator access has been removed.",
    icon: isModerator ? "mdi-shield-account" : "mdi-shield-off-outline",
    path: `/f_details?id=${userId}`,
    related_user_id: userId,
    type: isModerator ? "moderator_granted" : "moderator_removed",
  })
}

export function create_Suspension_Status_Notification({
  userId,
  isSuspended,
  reason = "",
  customReason = "",
  suspendedUntil = "",
}) {
  if (!userId) return null

  const finalReason =
    reason === "Other" && customReason
      ? customReason
      : reason || "Policy violation"

  return add_Notification({
    user_id: userId,
    title: isSuspended ? "Account suspended" : "Suspension removed",
    subtitle: isSuspended
      ? `Reason: ${finalReason}. Suspended until ${new Date(suspendedUntil).toLocaleString()}.`
      : "Your account suspension has been removed.",
    icon: isSuspended ? "mdi-account-cancel-outline" : "mdi-account-check-outline",
    path: `/f_details?id=${userId}`,
    related_user_id: userId,
    type: isSuspended ? "account_suspended" : "account_unsuspended",
  })
}

/* -----------------------------
   Venue request notifications
----------------------------- */

export function create_Venue_Request_Submitted_Notifications({
  creatorUserId,
  venueRequestId,
  venueTitle,
}) {
  const users = get_All_Users()

  users.forEach(user => {
    if (user.is_admin || user.is_moderator) {
      add_Notification({
        user_id: user.id,
        title: "New venue request",
        subtitle: `${venueTitle} was submitted for approval.`,
        icon: "mdi-store-plus",
        path: "/venueRequest",
        related_user_id: creatorUserId ?? null,
        related_venue_request_id: venueRequestId ?? null,
        type: "venue_request_submitted",
      })
    }
  })
}

export function create_Venue_Request_Approved_Notification({
  userId,
  venueTitle,
  venueId,
  venueRequestId,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: "Venue approved 🎉",
    subtitle: `${venueTitle} is now live on Blassti.`,
    icon: "mdi-check-circle",
    path: venueId ? `/O_venueinfo?id=${venueId}` : "/venueBrowsing",
    related_venue_id: venueId ?? null,
    related_venue_request_id: venueRequestId ?? null,
    type: "venue_request_approved",
  })
}

export function create_Venue_Request_Denied_Notification({
  userId,
  venueTitle,
  venueRequestId,
  reason = "",
  customReason = "",
}) {
  if (!userId) return null

  const finalReason =
    reason === "Other" && customReason
      ? customReason
      : reason || "No reason provided"

  return add_Notification({
    user_id: userId,
    title: "Venue request denied",
    subtitle: `${venueTitle} was not approved. Reason: ${finalReason}.`,
    icon: "mdi-close-circle",
    path: "/CreateVenue",
    related_venue_request_id: venueRequestId ?? null,
    type: "venue_request_denied",
  })
}

export function create_Venue_Created_Notification({
  userId,
  venueTitle,
  venueId,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: "Venue created successfully",
    subtitle: `${venueTitle} is now available on Blassti.`,
    icon: "mdi-store-check",
    path: `/O_venueinfo?id=${venueId}`,
    related_venue_id: venueId ?? null,
    type: "venue_created",
  })
}

export function create_Venue_Deleted_Notification({
  userId,
  venueTitle,
  reason = "",
  customReason = "",
}) {
  if (!userId) return null

  const finalReason =
    reason === "Other" && customReason
      ? customReason
      : reason || "No reason provided"

  return add_Notification({
    user_id: userId,
    title: "Venue deleted",
    subtitle: `${venueTitle} was removed. Reason: ${finalReason}.`,
    icon: "mdi-delete-alert",
    path: "/venueBrowsing",
    type: "venue_deleted",
  })
}

/* -----------------------------
   Venue reservation notifications
----------------------------- */

export function create_Venue_Reservation_Confirmation_Notification({
  userId,
  venueId,
  venueTitle,
  reservationId,
  totalPrice,
  startDateTime,
  endDateTime,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: "Venue reserved successfully",
    subtitle: `${venueTitle} has been reserved. Total paid: ${Number(totalPrice).toFixed(2)} TND.`,
    icon: "mdi-calendar-check",
    path: "/reserved_venues",
    related_venue_id: venueId ?? null,
    related_venue_reservation_id: reservationId ?? null,
    type: "venue_reservation_confirmed",
  })
}

export function create_Venue_Reservation_Owner_Notification({
  userId,
  reserverUserId,
  venueId,
  venueTitle,
  reservationId,
  totalPrice,
  startDateTime,
  endDateTime,
  isAdminFallback = false,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: isAdminFallback
      ? "Venue reservation paid to admin"
      : "Your venue was reserved",
    subtitle: isAdminFallback
      ? `${venueTitle} was reserved and the payment (${Number(totalPrice).toFixed(2)} TND) goes to admin because this venue has no owner.`
      : `${venueTitle} was reserved. Payment received: ${Number(totalPrice).toFixed(2)} TND.`,
    icon: isAdminFallback ? "mdi-shield-crown" : "mdi-cash-check",
    path: `/O_venueinfo?id=${venueId}`,
    related_user_id: reserverUserId ?? null,
    related_venue_id: venueId ?? null,
    related_venue_reservation_id: reservationId ?? null,
    type: isAdminFallback
      ? "venue_reservation_admin_fallback"
      : "venue_reserved_owner",
  })
}

/* -----------------------------
   Carpool notifications
----------------------------- */

export function create_Carpool_Created_Notification({
  ownerUserId,
  carpoolId,
  eventId,
  eventTitle,
}) {
  if (!ownerUserId) return null

  return add_Notification({
    user_id: ownerUserId,
    title: "Carpool created successfully",
    subtitle: `Your carpool for ${eventTitle} is now live.`,
    icon: "mdi-car-plus",
    path: "/O_CurrentCarpools",
    related_carpool_id: carpoolId,
    related_event_id: eventId,
    type: "carpool_created",
  })
}

export function create_Carpool_Join_Notifications({
  joinerUserId,
  joinerName,
  driverUserId,
  carpoolId,
  eventId,
  eventTitle,
  contactMethodLabel,
  contactValue,
}) {
  if (joinerUserId) {
    add_Notification({
      user_id: joinerUserId,
      title: "You joined a carpool",
      subtitle: `You joined ${eventTitle}. Contact: ${contactMethodLabel} — ${contactValue}`,
      icon: "mdi-car-multiple",
      path: "/O_CurrentCarpools",
      related_user_id: driverUserId ?? null,
      related_event_id: eventId ?? null,
      related_carpool_id: carpoolId ?? null,
      type: "carpool_join_self",
    })
  }

  if (driverUserId && driverUserId !== joinerUserId) {
    add_Notification({
      user_id: driverUserId,
      title: `${joinerName} joined your carpool`,
      subtitle: `${joinerName} joined your carpool for ${eventTitle}.`,
      icon: "mdi-account-plus",
      path: `/f_details?id=${joinerUserId}`,
      related_user_id: joinerUserId ?? null,
      related_event_id: eventId ?? null,
      related_carpool_id: carpoolId ?? null,
      type: "carpool_join_driver",
    })
  }
}

export function create_Carpool_Leave_Notifications({
  leaverUserId,
  leaverName,
  driverUserId,
  carpoolId,
  eventId,
  eventTitle,
  reason = "",
  note = "",
}) {
  if (leaverUserId) {
    add_Notification({
      user_id: leaverUserId,
      title: "You left a carpool",
      subtitle: `You left ${eventTitle}.`,
      icon: "mdi-account-minus",
      path: "/F_CarpoolCreate",
      related_user_id: driverUserId ?? null,
      related_event_id: eventId ?? null,
      related_carpool_id: carpoolId ?? null,
      type: "carpool_leave_self",
    })
  }

  if (driverUserId && driverUserId !== leaverUserId) {
    const reasonText =
      reason === "Other" && note
        ? `Reason: ${note}`
        : reason
          ? `Reason: ${reason}`
          : "No reason given."

    add_Notification({
      user_id: driverUserId,
      title: `${leaverName} left your carpool`,
      subtitle: reasonText,
      icon: "mdi-account-arrow-right",
      path: `/f_details?id=${leaverUserId}`,
      related_user_id: leaverUserId ?? null,
      related_event_id: eventId ?? null,
      related_carpool_id: carpoolId ?? null,
      type: "carpool_leave_driver",
    })
  }
}

export function create_Carpool_Delete_Notifications({
  ownerUserId,
  ownerName,
  participantUserIds = [],
  carpoolId,
  eventId,
  eventTitle,
}) {
  if (ownerUserId) {
    add_Notification({
      user_id: ownerUserId,
      title: "Carpool deleted",
      subtitle: `Your carpool for ${eventTitle} was deleted successfully.`,
      icon: "mdi-delete",
      path: "/O_CurrentCarpools",
      related_event_id: eventId ?? null,
      related_carpool_id: carpoolId ?? null,
      type: "carpool_delete_owner",
    })
  }

  participantUserIds.forEach(userId => {
    if (!userId || userId === ownerUserId) return

    add_Notification({
      user_id: userId,
      title: "Carpool deleted",
      subtitle: `${ownerName} deleted the carpool for ${eventTitle}.`,
      icon: "mdi-car-off",
      path: "/O_CurrentCarpools",
      related_user_id: ownerUserId ?? null,
      related_event_id: eventId ?? null,
      related_carpool_id: carpoolId ?? null,
      type: "carpool_delete_participant",
    })
  })
}

/* -----------------------------
   Event notifications
----------------------------- */

export function create_Event_Join_Notification({
  userId,
  eventId,
  eventTitle,
  eventPath,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: "Event joined successfully",
    subtitle: `You joined ${eventTitle}.`,
    icon: "mdi-ticket-confirmation",
    path: eventPath || `/o_eventinfo?id=${eventId}`,
    related_event_id: eventId ?? null,
    type: "event_join",
  })
}

export function create_Event_Created_Notification({
  userId,
  eventId,
  eventTitle,
  eventPath,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: "Event created successfully",
    subtitle: `${eventTitle} is now published.`,
    icon: "mdi-calendar-check",
    path: eventPath || `/o_eventinfo?id=${eventId}`,
    related_event_id: eventId ?? null,
    type: "event_created",
  })
}

export function create_Ticket_Purchase_Notification({
  userId,
  eventId,
  eventTitle,
  reservationId,
  totalPrice,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: "Ticket payment successful",
    subtitle: `Your ticket for ${eventTitle} was purchased successfully. Paid: ${Number(totalPrice).toFixed(2)} TND.`,
    icon: "mdi-credit-card-check-outline",
    path: "/K_mybookings",
    related_event_id: eventId ?? null,
    related_venue_reservation_id: reservationId ?? null,
    type: "ticket_purchase_success",
  })
}

export function create_Ticket_Payment_Received_Notification({
  userId,
  buyerUserId,
  eventId,
  eventTitle,
  reservationId,
  amount,
  isAdminFallback = false,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: isAdminFallback ? "Admin received event payment" : "Event payment received",
    subtitle: isAdminFallback
      ? `${eventTitle} ticket payment was received by admin. Amount: ${Number(amount).toFixed(2)} TND.`
      : `${eventTitle} ticket payment received. Amount: ${Number(amount).toFixed(2)} TND.`,
    icon: isAdminFallback ? "mdi-shield-crown-outline" : "mdi-cash-check",
    path: eventId ? `/o_eventinfo?id=${eventId}` : "/n_mainpage",
    related_user_id: buyerUserId ?? null,
    related_event_id: eventId ?? null,
    related_venue_reservation_id: reservationId ?? null,
    type: isAdminFallback ? "ticket_payment_admin" : "ticket_payment_owner",
  })
}

/* -----------------------------
   Reminder helpers
----------------------------- */

export function create_Event_Reminder_Notification({
  userId,
  eventId,
  eventTitle,
  eventPath,
  windowLabel,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: "Event reminder",
    subtitle: `${eventTitle} is in ${windowLabel}.`,
    icon: "mdi-calendar-clock",
    path: eventPath || `/o_eventinfo?id=${eventId}`,
    related_event_id: eventId ?? null,
    type: `event_reminder_${windowLabel}`,
  })
}

export function create_Carpool_Reminder_Notification({
  userId,
  carpoolId,
  eventId,
  eventTitle,
  windowLabel,
}) {
  if (!userId) return null

  return add_Notification({
    user_id: userId,
    title: "Carpool reminder",
    subtitle: `${eventTitle} is in ${windowLabel}.`,
    icon: "mdi-car-clock",
    path: "/O_CurrentCarpools",
    related_carpool_id: carpoolId ?? null,
    related_event_id: eventId ?? null,
    type: `carpool_reminder_${windowLabel}`,
  })
}