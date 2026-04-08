import { reactive } from "vue"
import {
  Event,
  add_Event,
  get_All_Events,
  get_Event_By_Id,
  update_Event,
} from "@/dataModel/event"
import {
  create_Event_Created_Notification,
  create_Event_Join_Notification,
  create_Moderator_Status_Notification,
  create_Suspension_Status_Notification,
} from "@/dataModel/notification"

const USERS_STORAGE_KEY = "users"
const CURRENT_USER_STORAGE_KEY = "currentUser"
const USERS_VERSION_KEY = "users_seed_version"
const USERS_SEED_VERSION = "v9_roles_moderation_suspension_account_created_at"

export function createAvatar(seed) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`
}

export const PROFILE_AVATAR_OPTIONS = [
  { label: "Blue 1", url: createAvatar("avatar-blue-1") },
  { label: "Blue 2", url: createAvatar("avatar-blue-2") },
  { label: "Girl 1", url: createAvatar("avatar-girl-1") },
  { label: "Girl 2", url: createAvatar("avatar-girl-2") },
  { label: "Boy 1", url: createAvatar("avatar-boy-1") },
  { label: "Boy 2", url: createAvatar("avatar-boy-2") },
  { label: "Cool 1", url: createAvatar("avatar-cool-1") },
  { label: "Cool 2", url: createAvatar("avatar-cool-2") },
  { label: "Soft 1", url: createAvatar("avatar-soft-1") },
]

function normalizeContacts(contacts = {}) {
  return {
    instagram: contacts.instagram ?? "",
    linkedin: contacts.linkedin ?? "",
    soundcloud: contacts.soundcloud ?? "",
    tiktok: contacts.tiktok ?? "",
    facebook: contacts.facebook ?? "",
    website: contacts.website ?? "",
    phone: contacts.phone ?? "",
    youtube: contacts.youtube ?? "",
  }
}

function normalizeIdArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeAccountCreatedAt(value) {
  return value ?? new Date().toISOString()
}

function normalizeSuspension(suspension = null) {
  if (!suspension) return null

  return {
    is_active: suspension.is_active ?? false,
    reason: suspension.reason ?? "",
    custom_reason: suspension.custom_reason ?? "",
    suspended_at: suspension.suspended_at ?? "",
    suspended_until: suspension.suspended_until ?? "",
    suspended_by_user_id: suspension.suspended_by_user_id ?? null,
  }
}

export class User {
  constructor({
    id,
    first_name,
    last_name,
    email,
    password,
    gender,
    date_of_birth,
    state,
    city,
    agree_terms,
    receive_promos,
    subscribers_count,
    is_artist,
    artist_type,
    profile_picture,
    description,
    contacts,
    subscribed_artist_ids,
    joined_event_ids,
    created_event_ids,
    is_admin,
    is_moderator,
    suspension,
    account_created_at,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.first_name = first_name ?? ""
    this.last_name = last_name ?? ""
    this.email = String(email ?? "").trim().toLowerCase()
    this.password = String(password ?? "")
    this.gender = gender ?? ""
    this.date_of_birth = date_of_birth ?? ""
    this.state = state ?? ""
    this.city = city ?? ""
    this.agree_terms = agree_terms ?? false
    this.receive_promos = receive_promos ?? false
    this.subscribers_count = subscribers_count ?? 0
    this.is_artist = is_artist ?? false
    this.artist_type = artist_type ?? ""
    this.profile_picture =
      profile_picture ?? createAvatar(`${this.first_name}-${this.last_name}-${this.id}`)
    this.description = description ?? ""
    this.contacts = normalizeContacts(contacts)
    this.subscribed_artist_ids = normalizeIdArray(subscribed_artist_ids)
    this.joined_event_ids = normalizeIdArray(joined_event_ids)
    this.created_event_ids = normalizeIdArray(created_event_ids)
    this.is_admin = is_admin ?? false
    this.is_moderator = is_moderator ?? false
    this.suspension = normalizeSuspension(suspension)
    this.account_created_at = normalizeAccountCreatedAt(account_created_at)
  }

  get full_name() {
    return `${this.first_name} ${this.last_name}`.trim()
  }
}

function normalizeUsers(userArray) {
  return userArray.map(user => new User(user))
}

function defaultUsers() {
  return [
    new User({
      id: "admin-user-1",
      account_created_at: "2025-09-12T08:30:00.000Z",
      first_name: "Blassti",
      last_name: "Admin",
      email: "admin@blassti.tn",
      password: "admin",
      gender: "Other",
      date_of_birth: "1990-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: false,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Blassti Admin"),
      description: "Official Blassti administrator account.",
      contacts: {
        website: "www.blassti.tn",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: true,
      is_moderator: true,
      suspension: null,
    }),

    new User({
      id: "user-artist-1",
      account_created_at: "2025-09-12T11:15:00.000Z",
      first_name: "Lina",
      last_name: "Trabelsi",
      email: "lina.trabelsi@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "1997-05-12",
      state: "Tunis",
      city: "La Marsa",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 228,
      is_artist: true,
      artist_type: "Singer",
      profile_picture: createAvatar("Lina Trabelsi Singer"),
      description:
        "Lina Trabelsi is a Tunisian pop and live-stage singer known for elegant performances, emotional vocals, and big open-air concert nights.",
      contacts: {
        instagram: "@lina.trabelsi.music",
        facebook: "lina.trabelsi.music",
        youtube: "Lina Trabelsi Official",
        website: "www.linatrabelsi.tn",
        phone: "+216 22 440 118",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-9",
      account_created_at: "2025-10-03T16:20:00.000Z",
      first_name: "Omar",
      last_name: "Hassen",
      email: "test@gmail.com",
      password: "123",
      gender: "Male",
      date_of_birth: "2002-02-19",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Omar Hassen"),
      description:
        "A regular Blassti user who enjoys concerts, sports events, and discovering cool experiences around Tunisia.",
      contacts: {
        phone: "+216 52 110 245",
        instagram: "@omar.hassen",
        facebook: "omar.hassen.official",
        linkedin: "omar-hassen",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-artist-2",
      account_created_at: "2025-10-03T18:05:00.000Z",
      first_name: "Nour",
      last_name: "Masmoudi",
      email: "nour.masmoudi@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "1995-02-20",
      state: "Sfax",
      city: "Sfax",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 173,
      is_artist: true,
      artist_type: "DJ",
      profile_picture: createAvatar("Nour Masmoudi DJ"),
      description:
        "Nour Masmoudi is a Tunisian DJ recognized for electronic, afro-house, and rooftop nightlife sets with energetic crowd-focused performances.",
      contacts: {
        instagram: "@nour.masmoudi.dj",
        facebook: "nour.masmoudi.dj",
        soundcloud: "Nour Masmoudi",
        phone: "+216 58 320 401",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-artist-3",
      account_created_at: "2025-11-21T09:40:00.000Z",
      first_name: "Karim",
      last_name: "Ben Amor",
      email: "karim.benamor@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "1992-09-14",
      state: "Sousse",
      city: "Sousse",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 146,
      is_artist: true,
      artist_type: "Comedian",
      profile_picture: createAvatar("Karim Ben Amor Comedian"),
      description:
        "Karim Ben Amor is a Tunisian stand-up comedian known for crowd interaction, quick jokes, and modern social humor.",
      contacts: {
        instagram: "@karim.benamor",
        facebook: "karim.benamor",
        youtube: "Karim Ben Amor",
        phone: "+216 93 771 202",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-artist-4",
      account_created_at: "2025-11-21T09:55:00.000Z",
      first_name: "Sami",
      last_name: "Jlassi",
      email: "sami.jlassi@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "1989-11-03",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 94,
      is_artist: true,
      artist_type: "Magician",
      profile_picture: createAvatar("Sami Jlassi Magician"),
      description:
        "Sami Jlassi is a stage illusionist and family-show performer known for theatrical tricks, interactive acts, and visual magic sets.",
      contacts: {
        instagram: "@sami.jlassi.magic",
        facebook: "sami.jlassi.magic",
        website: "www.samijlassi.tn",
        phone: "+216 27 991 144",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-1",
      account_created_at: "2025-12-02T13:10:00.000Z",
      first_name: "Aymen",
      last_name: "Gharbi",
      email: "aymen.gharbi@gmail.com",
      password: "123",
      gender: "Male",
      date_of_birth: "1999-04-21",
      state: "Tunis",
      city: "Lac 2",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Aymen Gharbi"),
      description:
        "A regular Blassti user who enjoys concerts, rooftop events, and trying new venues around Tunis.",
      contacts: {
        phone: "+216 27 661 082",
        instagram: "@aymen.gharbi",
        facebook: "aymen.gharbi",
      },
      subscribed_artist_ids: ["user-artist-1"],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-2",
      account_created_at: "2025-12-02T13:10:00.000Z",
      first_name: "Amira",
      last_name: "Ben Youssef",
      email: "amira.benyoussef@gmail.com",
      password: "123",
      gender: "Female",
      date_of_birth: "1998-07-12",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: false,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Amira Ben Youssef"),
      description:
        "A casual event-goer who follows local concerts, family shows, and cultural nights.",
      contacts: {
        phone: "+216 24 118 203",
        instagram: "@amira.by",
      },
      subscribed_artist_ids: ["user-artist-1", "user-artist-4"],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-3",
      account_created_at: "2026-01-14T10:25:00.000Z",
      first_name: "Youssef",
      last_name: "Ayari",
      email: "youssef.ayari@gmail.com",
      password: "123",
      gender: "Male",
      date_of_birth: "1996-11-18",
      state: "Sousse",
      city: "Sousse",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Youssef Ayari"),
      description:
        "Enjoys football events, festivals, and discovering nightlife spots with friends.",
      contacts: {
        phone: "+216 29 560 118",
        facebook: "youssef.ayari",
      },
      subscribed_artist_ids: ["user-artist-2"],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-4",
      account_created_at: "2026-01-14T17:40:00.000Z",
      first_name: "Salma",
      last_name: "Kefi",
      email: "salma.kefi@gmail.com",
      password: "123",
      gender: "Female",
      date_of_birth: "2000-09-03",
      state: "Nabeul",
      city: "Hammamet",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Salma Kefi"),
      description:
        "Loves cultural shows, elegant venues, and booking group experiences with her friends.",
      contacts: {
        instagram: "@salma.kefi",
        facebook: "salma.kefi.events",
      },
      subscribed_artist_ids: ["user-artist-3"],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-5",
      account_created_at: "2026-02-01T12:00:00.000Z",
      first_name: "Malek",
      last_name: "Haddad",
      email: "malek.haddad@gmail.com",
      password: "123",
      gender: "Male",
      date_of_birth: "1997-03-26",
      state: "Ben Arous",
      city: "Radès",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Malek Haddad"),
      description:
        "Mostly uses Blassti for football matches, basketball games, and occasional comedy nights.",
      contacts: {
        phone: "+216 54 330 711",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-6",
      account_created_at: "2026-02-01T12:00:00.000Z",
      first_name: "Rym",
      last_name: "Chaabane",
      email: "rym.chaabane@gmail.com",
      password: "123",
      gender: "Female",
      date_of_birth: "2001-01-17",
      state: "Tunis",
      city: "Carthage",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Rym Chaabane"),
      description:
        "Enjoys open-air music festivals, film premieres, and discovering artists early.",
      contacts: {
        phone: "+216 20 843 550",
        instagram: "@rym.chaabane.events",
        facebook: "rym.chaabane",
      },
      subscribed_artist_ids: ["user-artist-1", "user-artist-2"],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-7",
      account_created_at: "2026-02-18T14:45:00.000Z",
      first_name: "Wassim",
      last_name: "Mejri",
      email: "wassim.mejri@gmail.com",
      password: "123",
      gender: "Male",
      date_of_birth: "1995-12-09",
      state: "Sfax",
      city: "Sfax",
      agree_terms: true,
      receive_promos: false,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Wassim Mejri"),
      description:
        "Tech professional who likes education summits, concerts, and premium indoor events.",
      contacts: {
        phone: "+216 53 770 944",
        linkedin: "wassim-mejri",
      },
      subscribed_artist_ids: ["user-artist-2", "user-artist-3"],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-8",
      account_created_at: "2026-03-05T19:15:00.000Z",
      first_name: "Ines",
      last_name: "Dhaouadi",
      email: "ines.dhaouadi@gmail.com",
      password: "123",
      gender: "Female",
      date_of_birth: "1999-06-08",
      state: "Mahdia",
      city: "Mahdia",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Ines Dhaouadi"),
      description:
        "Enjoys elegant seaside events, lifestyle expos, and occasional live performances.",
      contacts: {
        instagram: "@ines.dhaouadi",
        facebook: "ines.dhaouadi",
      },
      subscribed_artist_ids: ["user-artist-1"],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),
  ]
}

function hasArtistEvent(userId) {
  const events = get_All_Events()
  return events.some(event =>
    Array.isArray(event.featured_artist_ids) &&
    event.featured_artist_ids.includes(userId)
  )
}

export function refresh_Artist_Statuses() {
  USER_LIST.forEach(user => {
    const shouldBeArtist = hasArtistEvent(user.id)
    user.is_artist = shouldBeArtist

    if (!shouldBeArtist) {
      user.artist_type = ""
      if (user.subscribers_count < 0) {
        user.subscribers_count = 0
      }
    }
  })
}

function loadUsers() {
  const defaults = defaultUsers()
  const savedVersion = localStorage.getItem(USERS_VERSION_KEY)
  const savedUsers = localStorage.getItem(USERS_STORAGE_KEY)

  if (savedVersion !== USERS_SEED_VERSION) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaults))
    localStorage.setItem(USERS_VERSION_KEY, USERS_SEED_VERSION)
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
    return defaults
  }

  if (savedUsers) {
    try {
      const parsedUsers = normalizeUsers(JSON.parse(savedUsers))
      const mergedUsers = [...parsedUsers]

      for (const defaultUser of defaults) {
        const alreadyExists = mergedUsers.some(
          user => user.email.toLowerCase() === defaultUser.email.toLowerCase()
        )

        if (!alreadyExists) {
          mergedUsers.push(defaultUser)
        }
      }

      return mergedUsers
    } catch (error) {
      console.error("Failed to parse saved users. Loading defaults instead.", error)
    }
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaults))
  localStorage.setItem(USERS_VERSION_KEY, USERS_SEED_VERSION)
  return defaults
}

export const USER_LIST = reactive(loadUsers())
refresh_Artist_Statuses()
localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(USER_LIST))

function saveUsers() {
  refresh_Artist_Statuses()
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(USER_LIST))
}

export function get_All_Users() {
  refresh_Artist_Statuses()
  return USER_LIST
}

export function get_User_By_Id(id) {
  refresh_Artist_Statuses()
  return USER_LIST.find(user => user.id === id) || null
}

export function get_User_By_Email(email) {
  refresh_Artist_Statuses()
  const normalizedEmail = String(email ?? "").trim().toLowerCase()
  return USER_LIST.find(
    user => user.email.toLowerCase() === normalizedEmail
  ) || null
}

export function get_All_Artists() {
  refresh_Artist_Statuses()
  return USER_LIST.filter(user => user.is_artist)
}

export function add_User(userData) {
  const user = userData instanceof User ? userData : new User(userData)
  USER_LIST.push(user)
  saveUsers()
  return user
}

export function update_User(id, updatedUserData) {
  const index = USER_LIST.findIndex(user => user.id === id)

  if (index === -1) return null

  USER_LIST[index] = new User({
    ...USER_LIST[index],
    ...updatedUserData,
    contacts: normalizeContacts({
      ...USER_LIST[index].contacts,
      ...updatedUserData?.contacts,
    }),
    subscribed_artist_ids: normalizeIdArray(
      updatedUserData?.subscribed_artist_ids ?? USER_LIST[index].subscribed_artist_ids
    ),
    joined_event_ids: normalizeIdArray(
      updatedUserData?.joined_event_ids ?? USER_LIST[index].joined_event_ids
    ),
    created_event_ids: normalizeIdArray(
      updatedUserData?.created_event_ids ?? USER_LIST[index].created_event_ids
    ),
    suspension: normalizeSuspension(
      updatedUserData?.suspension ?? USER_LIST[index].suspension
    ),
    id: USER_LIST[index].id,
  })

  saveUsers()
  refresh_Current_User()
  return USER_LIST[index]
}

export function delete_User(id) {
  const index = USER_LIST.findIndex(user => user.id === id)

  if (index === -1) return null

  const deletedUser = USER_LIST[index]
  USER_LIST.splice(index, 1)

  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_STORAGE_KEY) || "null")
  if (currentUser?.id === id) {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
  }

  saveUsers()
  return deletedUser
}

export function get_Current_User() {
  refresh_Artist_Statuses()
  const savedCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
  if (!savedCurrentUser) return null

  try {
    const parsed = JSON.parse(savedCurrentUser)
    return get_User_By_Id(parsed.id) || null
  } catch (error) {
    console.error("Failed to parse currentUser.", error)
    return null
  }
}

export function set_Current_User(user) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
    return
  }

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
}

export function refresh_Current_User() {
  const currentUser = get_Current_User()
  if (currentUser) {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser))
  }
}

export function is_Admin(user) {
  return Boolean(user?.is_admin)
}

export function is_Moderator(user) {
  return Boolean(user?.is_admin || user?.is_moderator)
}

export function is_User_Suspended(user) {
  if (!user?.suspension?.is_active) return false

  if (!user.suspension.suspended_until) return true

  return new Date(user.suspension.suspended_until).getTime() > Date.now()
}

export function clear_Expired_Suspensions() {
  let changed = false

  USER_LIST.forEach(user => {
    if (
      user?.suspension?.is_active &&
      user?.suspension?.suspended_until &&
      new Date(user.suspension.suspended_until).getTime() <= Date.now()
    ) {
      user.suspension = null
      changed = true
    }
  })

  if (changed) {
    saveUsers()
    refresh_Current_User()
  }
}

export function set_User_Moderator_Status(targetUserId, shouldBeModerator) {
  const targetUser = get_User_By_Id(targetUserId)

  if (!targetUser || targetUser.is_admin) return null

  targetUser.is_moderator = Boolean(shouldBeModerator)

  saveUsers()
  refresh_Current_User()

  create_Moderator_Status_Notification({
    userId: targetUser.id,
    isModerator: targetUser.is_moderator,
  })

  return targetUser
}

export function suspend_User(targetUserId, suspensionData = {}) {
  const targetUser = get_User_By_Id(targetUserId)

  if (!targetUser || targetUser.is_admin) return null

  const now = new Date()
  const durationDays = Number(suspensionData.duration_days ?? 7)
  const until = new Date(now)
  until.setDate(until.getDate() + durationDays)

  targetUser.suspension = {
    is_active: true,
    reason: suspensionData.reason ?? "",
    custom_reason: suspensionData.custom_reason ?? "",
    suspended_at: now.toISOString(),
    suspended_until: until.toISOString(),
    suspended_by_user_id: suspensionData.suspended_by_user_id ?? null,
  }

  saveUsers()
  refresh_Current_User()

  create_Suspension_Status_Notification({
    userId: targetUser.id,
    isSuspended: true,
    reason: targetUser.suspension.reason,
    customReason: targetUser.suspension.custom_reason,
    suspendedUntil: targetUser.suspension.suspended_until,
  })

  return targetUser
}

export function unsuspend_User(targetUserId) {
  const targetUser = get_User_By_Id(targetUserId)

  if (!targetUser) return null

  targetUser.suspension = null

  saveUsers()
  refresh_Current_User()

  create_Suspension_Status_Notification({
    userId: targetUser.id,
    isSuspended: false,
    reason: "",
    customReason: "",
    suspendedUntil: "",
  })

  return targetUser
}

export function is_Subscribed_To_Artist(currentUserId, artistId) {
  const currentUser = get_User_By_Id(currentUserId)
  if (!currentUser) return false

  return currentUser.subscribed_artist_ids.includes(artistId)
}

export function subscribe_To_Artist(currentUserId, artistId) {
  const currentUser = get_User_By_Id(currentUserId)
  const artist = get_User_By_Id(artistId)

  if (!currentUser || !artist || !artist.is_artist) return null
  if (currentUser.id === artist.id) return null

  if (!currentUser.subscribed_artist_ids.includes(artistId)) {
    currentUser.subscribed_artist_ids.push(artistId)
    artist.subscribers_count += 1
    saveUsers()
    refresh_Current_User()
  }

  return artist
}

export function unsubscribe_From_Artist(currentUserId, artistId) {
  const currentUser = get_User_By_Id(currentUserId)
  const artist = get_User_By_Id(artistId)

  if (!currentUser || !artist || !artist.is_artist) return null

  const index = currentUser.subscribed_artist_ids.indexOf(artistId)

  if (index !== -1) {
    currentUser.subscribed_artist_ids.splice(index, 1)

    if (artist.subscribers_count > 0) {
      artist.subscribers_count -= 1
    }

    saveUsers()
    refresh_Current_User()
  }

  return artist
}

export function has_User_Joined_Event(userId, eventId) {
  const user = get_User_By_Id(userId)
  if (!user) return false
  return user.joined_event_ids.includes(eventId)
}

export function has_User_Created_Event(userId, eventId) {
  const user = get_User_By_Id(userId)
  if (!user) return false
  return user.created_event_ids.includes(eventId)
}

export function join_Event(userId, eventId) {
  const user = get_User_By_Id(userId)
  const event = get_Event_By_Id(eventId)

  if (!user || !event) {
    return { success: false, message: "User or event not found." }
  }

  if (user.joined_event_ids.includes(eventId)) {
    return { success: false, message: "You already joined this event." }
  }

  if (event.seats_left <= 0) {
    return { success: false, message: "No seats left for this event." }
  }

  user.joined_event_ids.push(eventId)

  update_Event(eventId, {
    tickets_sold: Number(event.tickets_sold) + 1,
  })

  saveUsers()
  refresh_Current_User()

  create_Event_Join_Notification({
    userId,
    eventId: event.id,
    eventTitle: event.title,
    eventPath: event.route_path,
  })

  return {
    success: true,
    message: "Event joined successfully.",
    user,
    event: get_Event_By_Id(eventId),
  }
}

export function leave_Event(userId, eventId) {
  const user = get_User_By_Id(userId)
  const event = get_Event_By_Id(eventId)

  if (!user || !event) {
    return { success: false, message: "User or event not found." }
  }

  const index = user.joined_event_ids.indexOf(eventId)

  if (index === -1) {
    return { success: false, message: "You did not join this event." }
  }

  user.joined_event_ids.splice(index, 1)

  update_Event(eventId, {
    tickets_sold: Math.max(0, Number(event.tickets_sold) - 1),
  })

  saveUsers()
  refresh_Current_User()

  return {
    success: true,
    message: "Event left successfully.",
    user,
    event: get_Event_By_Id(eventId),
  }
}

export function create_Event_For_User(userId, eventData) {
  const user = get_User_By_Id(userId)

  if (!user) {
    return { success: false, message: "User not found." }
  }

  const provisionalEvent = new Event({
    ...eventData,
    creator_user_id: userId,
  })

  const createdEvent = add_Event(provisionalEvent)

  if (!user.created_event_ids.includes(createdEvent.id)) {
    user.created_event_ids.push(createdEvent.id)
  }

  saveUsers()
  refresh_Current_User()

  create_Event_Created_Notification({
    userId,
    eventId: createdEvent.id,
    eventTitle: createdEvent.title,
    eventPath: createdEvent.route_path,
  })

  return {
    success: true,
    message: "Event created successfully.",
    user,
    event: createdEvent,
  }
}