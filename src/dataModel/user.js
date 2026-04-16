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
const USERS_SEED_VERSION = "v18_real_people_first_person_bios_killcount_update_family_added"

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
      description: "Official Blassti administrator account. Kill Count: 0",
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
      id: "user-1",
      account_created_at: "2025-09-12T11:15:00.000Z",
      first_name: "Zeineb",
      last_name: "Hassen",
      email: "zeineb.hassen@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2009-01-01",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Zeineb Hassen"),
      description:
        "I look quiet at first, but I’m always paying attention. I care in my own way, and I usually understand more than people think. Kill Count: 342123494842",
      contacts: {
        instagram: "@zeineb.hassen",
        facebook: "zeineb.hassen",
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
        "Built on ambition, loyalty, and a mind that never slows down. Always chasing more, always planning ahead, and for legal reasons, the “Naim + Omar for eternity” statement is fake and should not reach Louka. Kill Count: CLASSIFIED",
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
      id: "user-2",
      account_created_at: "2025-10-03T18:05:00.000Z",
      first_name: "Emna",
      last_name: "Hassen",
      email: "emna.hassen@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2011-01-01",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Emna Hassen"),
      description:
        "I’m moody, weird, and funny without even trying. Some days I’m adorable, some days I’m a menace. Kill Count: 92839483928333348447484",
      contacts: {
        instagram: "@emna.hassen",
        facebook: "emna.hassen",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-23",
      account_created_at: "2025-10-05T14:20:00.000Z",
      first_name: "Khadija",
      last_name: "Hassen",
      email: "khadija.hassen@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2007-01-01",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Khadija Hassen"),
      description:
        "I act spoiled because honestly? Sometimes I deserve to be. Affection is cute, but I’m still gonna pretend I don’t care for at least 3 business days. Kill Count: 13",
      contacts: {
        instagram: "@khadija.hassen",
        facebook: "khadija.hassen",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-24",
      account_created_at: "2025-10-05T14:45:00.000Z",
      first_name: "Mohamed Youssef",
      last_name: "Hassen",
      email: "momo.hassen@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2013-01-01",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Mohamed Youssef Hassen"),
      description:
        "I’m loud, rude, funny, sensitive, and probably doing something annoying right now. I might fight you, then ask for snacks 4 minutes later. Kill Count: 404",
      contacts: {
        instagram: "@momo.hassen",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-3",
      account_created_at: "2025-11-21T09:40:00.000Z",
      first_name: "Jamie Olga",
      last_name: "Hassen",
      email: "jamie.hassen@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "1978-06-11",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Jamie Olga Hassen"),
      description:
        "I keep to myself more than people expect. I care deeply, notice everything, and I’m always thinking about the people I love. Kill Count: 2",
      contacts: {
        facebook: "jamie.hassen",
        phone: "+216 20 310 221",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-4",
      account_created_at: "2025-11-21T09:55:00.000Z",
      first_name: "Yassine",
      last_name: "Hassen",
      email: "yassine.hassen@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "1974-03-03",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: false,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Yassine Hassen"),
      description:
        "I’m strict, direct, and not a fan of nonsense. I respect discipline, effort, and people who take things seriously. Kill Count: 47",
      contacts: {
        linkedin: "yassine-hassen",
        phone: "+216 21 991 180",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-5",
      account_created_at: "2025-12-02T13:10:00.000Z",
      first_name: "Eya Hamma",
      last_name: "Missaoui",
      email: "eya.missaoui@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2002-09-07",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Eya Hamma Missaoui"),
      description:
        "I’m smart, chaotic, and a little aggressive for fun. Inlove with Lufffy 💖. Kill Count: 1251",
      contacts: {
        instagram: "@eya.hamma",
        facebook: "eya.missaoui",
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
      account_created_at: "2025-12-02T13:10:00.000Z",
      first_name: "Khalil",
      last_name: "Fakfekh",
      email: "khalil.fakfekh@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-04-18",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Khalil Fakfekh"),
      description:
        "I’m quiet, simple, and smarter than most other users here. I’d rather say one real thing than talk for no reason. Kill Count: 0",
      contacts: {
        instagram: "@khalil.fakfekh",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-7",
      account_created_at: "2026-01-14T10:25:00.000Z",
      first_name: "Farah",
      last_name: "Tababi",
      email: "farah.tababi@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2004-07-16",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Farah Tababi"),
      description:
        "67 I’m sensitive, dramatic sometimes, and I care a lot about the people close to me. I feel everything fully.67 Kill Count: 6 or 7",
      contacts: {
        instagram: "@farah.tababi",
        facebook: "farah.tababi",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-8",
      account_created_at: "2026-01-14T17:40:00.000Z",
      first_name: "Nader",
      last_name: "Dakhlia",
      email: "nader.dakhlia@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2003-12-02",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Nader Dakhlia"),
      description:
        "I’d rather stay quiet, work hard, and let results speak for themselves. Not everything needs noise to have value. Kill Count: UNKNOWN",
      contacts: {
        linkedin: "nader-dakhlia",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-10",
      account_created_at: "2026-02-01T12:00:00.000Z",
      first_name: "Youssef",
      last_name: "Ben Yaflah",
      email: "djo@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2003-05-27",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Djo Youssef Ben Yaflah"),
      description:
        "I’m chill, a little reckless, and I like a good time. I don’t force the vibe, I am the vibe. Kill Count: 69",
      contacts: {
        instagram: "@djo.benyaflah",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-11",
      account_created_at: "2026-02-01T12:00:00.000Z",
      first_name: "Yassine",
      last_name: "Belhaj Hassine",
      email: "yassine.belhaj@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-01-25",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Yassine Belhaj Hassine"),
      description:
        "I joke a lot, but when it matters I’m serious. I like helping people, and if I care about you, you’ll feel it. Kill Count: 7",
      contacts: {
        instagram: "@yassine.belhaj",
        facebook: "yassine.belhaj.hassine",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-12",
      account_created_at: "2026-02-18T14:45:00.000Z",
      first_name: "Yassine",
      last_name: "Dhafer",
      email: "yassine.dhafer@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-10-12",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: false,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Yassine Dhafer"),
      description:
        "I get distracted fast, I love music, and I’m mostly here for the vibes. Somehow it all still works out. Kill Count: 0",
      contacts: {
        instagram: "@yassine.dhafer",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-13",
      account_created_at: "2026-03-05T19:15:00.000Z",
      first_name: "Mootez Billah",
      last_name: "Hmissi",
      email: "hmissi@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2003-08-29",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Mootez Billah Hmissi"),
      description:
        "Muy de buenas vibras, noches largas y recuerdos aún mejores. España ❤️, EST 🔥🔥🔥. Tranquilo cuando toca, divertido cuando quiero, y siempre listo para pasarla bien. Kill Count: 21",
      contacts: {
        instagram: "@mootez.hmissi",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-14",
      account_created_at: "2026-03-09T11:20:00.000Z",
      first_name: "Zayneb",
      last_name: "Kassentini",
      email: "zayneb.kassentini@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2004-06-02",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Zayneb Kassentini"),
      description:
        "Soft heart, big(maybe a little too dramatic) reactions, good vibes. I may be a little dramatic, but that’s part of the charm...Shoutout to LALOU Kill Count: 5",
      contacts: {
        instagram: "@zayneb.kassentini",
        facebook: "zayneb.kassentini",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-15",
      account_created_at: "2026-03-10T08:55:00.000Z",
      first_name: "Naim",
      last_name: "Droulon",
      email: "naim.droulon@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-02-08",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Naim Droulon"),
      description:
        "I joke around a lot, but don’t let that fool you. I see everything, and I’m more serious than I look. Naim+Kamil For life..but Naim+Omar for eternity(don't tell Emna) Kill Count: 11",
      contacts: {
        instagram: "@naim.droulon",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-16",
      account_created_at: "2026-03-11T09:10:00.000Z",
      first_name: "Louay",
      last_name: "Benjeddou",
      email: "louay.benjeddou@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-05-14",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Louay Benjeddou"),
      description:
        "I like being kind, staying positive, and making people feel comfortable around me. Good energy matters. Kill Count: 0",
      contacts: {
        instagram: "@louay.benjeddou",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-17",
      account_created_at: "2026-03-12T10:45:00.000Z",
      first_name: "LALOU",
      last_name: "2026",
      email: "lalou2026@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-03-21",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("LALOU 2026"),
      description:
        "LALOU 2026. If you know, you know. Kill Count: UNKNOWN",
      contacts: {
        instagram: "@lalou.2026",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-18",
      account_created_at: "2026-03-13T12:30:00.000Z",
      first_name: "Arij",
      last_name: "Ouanes",
      email: "arij.ouanes@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2004-09-11",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Arij Ouanes"),
      description:
        "My mood can switch fast, but at least I’m honest about it. I’d rather be real than easy to deal with. Kill Count: 1",
      contacts: {
        instagram: "@arij.ouanes",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-19",
      account_created_at: "2026-03-14T14:05:00.000Z",
      first_name: "Hassen",
      last_name: "Smida",
      email: "hassen.smida@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2003-07-19",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Hassen Smida"),
      description:
        "I keep it calm, simple, and solid. I don’t need to talk all the time for people to get who I am. Kill Count: 17",
      contacts: {
        instagram: "@hassen.smida",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-20",
      account_created_at: "2026-03-15T09:35:00.000Z",
      first_name: "Hamza",
      last_name: "Kouchtali",
      email: "hamza.kouchtali@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2008-01-01",
      state: "Sousse",
      city: "Sousse",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Hamza Kouchtali"),
      description:
        "I like keeping things clean, simple, and real. I’m chill, helpful, and not here for fake energy. Kill Count: 6",
      contacts: {
        instagram: "@hamza.kouchtali",
        facebook: "hamza.kouchtali",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-21",
      account_created_at: "2026-03-15T09:50:00.000Z",
      first_name: "Bernadette Marie",
      last_name: "Anderson",
      email: "bee@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "1975-01-01",
      state: "Sousse",
      city: "Sousse",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Bernadette Marie Anderson"),
      description:
        "I take care of people, probably more than I should. My heart is big, my patience depends on the day, and my house is never quiet. Kill Count: UNKNOWN",
      contacts: {
        facebook: "bernadette.anderson",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-22",
      account_created_at: "2026-03-16T10:10:00.000Z",
      first_name: "Molka",
      last_name: "Ben Hamadi",
      email: "louka@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2005-02-25",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Molka Ben Hamadi"),
      description:
        "I look innocent, speak seven languages, get angry in 0.2 seconds, and I need princess treatment. Approach carefully, compliment generously, and never test my patience. Kill Count: 9999431",
      contacts: {
        instagram: "@molka.bh",
        facebook: "molka.benhamadi",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-25",
      account_created_at: "2026-03-17T09:15:00.000Z",
      first_name: "Ahmed",
      last_name: "El Mouafek",
      email: "ahmed.elmouafek@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Ahmed El Mouafek"),
      description:
        "I talk about boxing like I’m training for a title fight and football like I own the club. Loud opinions, solid presence. Kill Count: 88",
      contacts: {
        instagram: "@ahmed.elmouafek",
        facebook: "ahmed.elmouafek",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-26",
      account_created_at: "2026-03-17T10:05:00.000Z",
      first_name: "Khadija",
      last_name: "Smida",
      email: "khadija.smida@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2004-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Khadija Smida"),
      description:
        "I mind my own business, but I notice way more than people think. Kill Count: 12",
      contacts: {
        instagram: "@khadija.smida",
        facebook: "khadija.smida",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-27",
      account_created_at: "2026-03-17T10:50:00.000Z",
      first_name: "Youssef",
      last_name: "Ben Amara",
      email: "youssef.benamara@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Youssef Ben Amara"),
      description:
        "I’ve got the ponytail, the props, the laser pointers, the fake tactical gear, and the kind of inventory that makes people ask zero follow-up questions. I’m actually chill though... probably. Kill Count: Classified",
      contacts: {
        instagram: "@youssef.benamara",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-28",
      account_created_at: "2026-03-18T09:00:00.000Z",
      first_name: "Amine",
      last_name: "Ben Hassouna",
      email: "amine.benhassouna@medtech.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "1985-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: false,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Amine Ben Hassouna"),
      description:
        "Best ISS professor. Loves Blassti and thinks it deserves to win this year’s ISS. Kill Count: 1",
      contacts: {},
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-29",
      account_created_at: "2026-03-19T10:10:00.000Z",
      first_name: "Nour",
      last_name: "Ben Khadher",
      email: "nour.benkhadher@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2004-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Nour Ben Khadher"),
      description:
        "I’m ambitious by nature and always focused on what’s coming next. Bigger things are waiting in the future, and Zayneb will obviously be there because that’s my bestie. Kill Count: 14",
      contacts: {
        instagram: "@nour.benkhadher",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-30",
      account_created_at: "2026-03-19T10:25:00.000Z",
      first_name: "Mootez",
      last_name: "El Ouaer",
      email: "mootez.elouaer@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Mootez El Ouaer"),
      description:
        "I’m easygoing, helpful, and not here to do too much. I like things simple, smooth, and low-stress — unless sarcasm improves the moment. Kill Count: 9",
      contacts: {
        instagram: "@mootez.elouaer",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-31",
      account_created_at: "2026-03-20T09:05:00.000Z",
      first_name: "Badis",
      last_name: "Atyaoui",
      email: "badis.atyaoui@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Badis Atyaoui"),
      description:
        "Late? Yes. Academically cooked? Never. I pull up eventually and still survive better than most. Kill Count: 2",
      contacts: {
        instagram: "@badis.atyaoui",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-32",
      account_created_at: "2026-03-20T09:20:00.000Z",
      first_name: "Bibo",
      last_name: "the G.O.A.T",
      email: "bibo@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2004-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Bibo the G.O.A.T"),
      description:
        "O block energy. Calm when I need to be, disrespectfully smooth when I want to be. Kill Count: 27",
      contacts: {
        instagram: "@bibo",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-33",
      account_created_at: "2026-03-20T09:35:00.000Z",
      first_name: "Malak",
      last_name: "Belhadj Abdallah",
      email: "malak.belhadjabdallah@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2004-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Malak Belhadj Abdallah"),
      description:
        "I keep it quiet, cute, and simple. No extra noise, no forced energy — just calm vibes and minding my business beautifully. Kill Count: 6",
      contacts: {
        instagram: "@malak.belhadjabdallah",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-34",
      account_created_at: "2026-03-20T09:50:00.000Z",
      first_name: "Essra",
      last_name: "Daha",
      email: "essra.daha@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "2004-01-01",
      state: "Tunis",
      city: "Tunis",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Essra Daha"),
      description:
        "I like nice things, easy vibes, and protecting my peace. If it looks like I’m not doing much, that’s because I don’t believe in making life harder than it needs to be. Kill Count: 4",
      contacts: {
        instagram: "@essra.daha",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-35",
      account_created_at: "2026-03-21T09:10:00.000Z",
      first_name: "Dr. Walid",
      last_name: "Hassen",
      email: "walid.hassen@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "1980-01-01",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Dr. Walid Hassen"),
      description:
        "I don’t need noise when logic does the job better. Calm mind, sharp thinking, and somehow I still end up outsmarting everyone in the room. Kill Count: 3",
      contacts: {
        linkedin: "dr-walid-hassen",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-36",
      account_created_at: "2026-03-21T09:25:00.000Z",
      first_name: "Dorsaf",
      last_name: "Hassen",
      email: "dorsaf.hassen@blassti.tn",
      password: "123",
      gender: "Female",
      date_of_birth: "1983-01-01",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Dorsaf Hassen"),
      description:
        "Part-time human, full-time therapist for everyone around me. I listen, I care, and somehow people leave feeling lighter after talking to me. Kill Count: 384",
      contacts: {
        facebook: "dorsaf.hassen",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-37",
      account_created_at: "2026-03-21T09:40:00.000Z",
      first_name: "Adam",
      last_name: "Hassen",
      email: "adam.hassen@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2007-01-01",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Adam Hassen"),
      description:
        "Long hair, tall build, lazy soul. I look like I have too much free time, but I’m smarter than people expect. Kill Count: 10",
      contacts: {
        instagram: "@adam.hassen",
      },
      subscribed_artist_ids: [],
      joined_event_ids: [],
      created_event_ids: [],
      is_admin: false,
      is_moderator: false,
      suspension: null,
    }),

    new User({
      id: "user-38",
      account_created_at: "2026-03-21T09:55:00.000Z",
      first_name: "Bayram",
      last_name: "Hassen",
      email: "bayram.hassen@blassti.tn",
      password: "123",
      gender: "Male",
      date_of_birth: "2010-01-01",
      state: "Monastir",
      city: "Monastir",
      agree_terms: true,
      receive_promos: true,
      subscribers_count: 0,
      is_artist: false,
      artist_type: "",
      profile_picture: createAvatar("Bayram Hassen"),
      description:
        "Creative by nature, smart like my dad, and always making something cool out of nothing. Give me ideas, pencils, or a problem and I’ll probably surprise you. Kill Count: 0",
      contacts: {
        instagram: "@bayram.hassen",
      },
      subscribed_artist_ids: [],
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
    eventPath: event.route_path,
  })

  return {
    success: true,
    message: "Event created successfully.",
    user,
    event: createdEvent,
  }
}