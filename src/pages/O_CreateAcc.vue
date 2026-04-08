<template>
  <v-container fluid class="create-account-page py-6 py-md-10" :class="browserThemeClass">
    <div class="create-account-background"></div>

    <v-row justify="center">
      <v-col cols="12" sm="11" md="8" lg="6" xl="5">
        <div class="page-shell">
          <v-fade-transition appear>
            <v-card
              variant="flat"
              rounded="xl"
              class="pa-3 pa-sm-4 pa-md-6 create-account-card"
            >
              <div class="page-hero mb-6 mb-md-8 text-center">
                <div class="hero-logo-wrap mb-4">
                  <img
                    :src="BlasstiLogo"
                    alt="Blassti logo"
                    class="hero-logo"
                  />
                </div>

                <div class="text-h4 text-sm-h3 font-weight-black hero-title">
                  Create your account
                </div>

                <div class="text-body-1 text-medium-emphasis hero-subtitle mt-2">
                  Set up your profile to discover events, reserve venues, and manage
                  your bookings in one place.
                </div>
              </div>

              <v-row class="mb-1" dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.name"
                    label="Name"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2 field-input"
                    rounded="xl"
                    prepend-inner-icon="mdi-account-outline"
                    hide-details="auto"
                    autocomplete="given-name"
                    :bg-color="fieldBg"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.surname"
                    label="Surname"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2 field-input"
                    rounded="xl"
                    prepend-inner-icon="mdi-account-details-outline"
                    hide-details="auto"
                    autocomplete="family-name"
                    :bg-color="fieldBg"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="form.email"
                label="E-mail"
                type="email"
                variant="outlined"
                density="comfortable"
                class="mb-4 field-input"
                rounded="xl"
                prepend-inner-icon="mdi-email-outline"
                hide-details="auto"
                autocomplete="email"
                :bg-color="fieldBg"
              />

              <v-menu
                v-model="dobMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
              >
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    :model-value="form.dob"
                    label="Date of birth"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    class="mb-4 field-input"
                    rounded="xl"
                    prepend-inner-icon="mdi-cake-variant-outline"
                    append-inner-icon="mdi-calendar-month-outline"
                    hide-details="auto"
                    :bg-color="fieldBg"
                  />
                </template>

                <v-card rounded="xl" class="date-picker-card">
                  <v-date-picker v-model="dobDate" color="primary" />
                  <v-card-actions class="justify-end px-4 pb-4">
                    <v-btn variant="text" rounded="lg" @click="dobMenu = false">
                      Cancel
                    </v-btn>
                    <v-btn variant="flat" rounded="lg" color="primary" @click="saveDob">
                      OK
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>

              <v-row class="mb-1" dense>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.gender"
                    label="Gender"
                    :items="['Male', 'Female', 'Other']"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2 field-input"
                    rounded="xl"
                    prepend-inner-icon="mdi-human-male-female"
                    hide-details="auto"
                    :bg-color="fieldBg"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.state"
                    label="State"
                    :items="states"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2 field-input"
                    rounded="xl"
                    prepend-inner-icon="mdi-map-marker-radius-outline"
                    hide-details="auto"
                    :bg-color="fieldBg"
                  />
                </v-col>
              </v-row>

              <v-select
                v-model="form.city"
                label="City"
                :items="citiesForSelectedState"
                :disabled="!form.state"
                variant="outlined"
                density="comfortable"
                class="mb-4 field-input"
                rounded="xl"
                prepend-inner-icon="mdi-city-variant-outline"
                hide-details="auto"
                :bg-color="fieldBg"
              />

              <v-row class="mb-1" dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2 field-input"
                    rounded="xl"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    hide-details="auto"
                    autocomplete="new-password"
                    :bg-color="fieldBg"
                    @click:append-inner="showPassword = !showPassword"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.password2"
                    label="Re-enter password"
                    :type="showPassword2 ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2 field-input"
                    rounded="xl"
                    prepend-inner-icon="mdi-lock-check-outline"
                    :append-inner-icon="showPassword2 ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    hide-details="auto"
                    autocomplete="new-password"
                    :bg-color="fieldBg"
                    @click:append-inner="showPassword2 = !showPassword2"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-5"></v-divider>

              <div class="preferences-title text-subtitle-1 font-weight-bold mb-3">
                Preferences & consent
              </div>

              <v-checkbox v-model="form.agree" hide-details class="mb-2 custom-checkbox">
                <template #label>
                  <div class="checkbox-label-wrap">
                    <div class="font-weight-medium">I agree to the terms and services</div>
                    <div class="text-caption text-medium-emphasis">
                      Required to create your account
                    </div>
                  </div>
                </template>
              </v-checkbox>

              <v-checkbox
                v-model="form.promos"
                hide-details
                class="mb-6 custom-checkbox"
              >
                <template #label>
                  <div class="checkbox-label-wrap">
                    <div class="font-weight-medium">
                      Receive e-mails about updates and coupons
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Optional — useful for promotions and new platform features
                    </div>
                  </div>
                </template>
              </v-checkbox>

              <v-btn
                block
                size="x-large"
                rounded="xl"
                color="primary"
                variant="flat"
                class="py-6 text-h6 font-weight-bold create-account-btn"
                elevation="0"
                @click="createAccount"
              >
                <v-icon start>mdi-account-check-outline</v-icon>
                Create account
              </v-btn>

              <div class="bottom-caption text-center text-body-2 text-medium-emphasis mt-5">
                “From finding the perfect event to booking the perfect seat, Blassti makes every moment feel effortless.”
              </div>
            </v-card>
          </v-fade-transition>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="460" transition="dialog-bottom-transition">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="primary">mdi-bell-badge-outline</v-icon>
          {{ dialogTitle }}
        </v-card-title>

        <v-card-text class="text-body-1 pt-2">
          {{ dialogMessage }}
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn color="primary" variant="flat" rounded="lg" @click="closeDialog">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { reactive, computed, watch, ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { useTheme } from "vuetify"
import { add_User, get_User_By_Email, set_Current_User } from "@/dataModel/user"
import BlasstiLogo from "@/assets/blassti-logo.png"

const router = useRouter()
const theme = useTheme()

const dobMenu = ref(false)
const dobDate = ref(null)

const dialog = ref(false)
const dialogTitle = ref("")
const dialogMessage = ref("")
const redirectAfterClose = ref(false)

const showPassword = ref(false)
const showPassword2 = ref(false)

const browserThemeClass = ref("theme-light")
let mediaQuery = null

const fieldBg = computed(() =>
  browserThemeClass.value === "theme-dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)"
)

function applyBrowserTheme(event) {
  const prefersDark = event?.matches ?? window.matchMedia("(prefers-color-scheme: dark)").matches
  browserThemeClass.value = prefersDark ? "theme-dark" : "theme-light"
  theme.global.name.value = prefersDark ? "dark" : "light"
}

onMounted(() => {
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  applyBrowserTheme(mediaQuery)

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", applyBrowserTheme)
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(applyBrowserTheme)
  }
})

onBeforeUnmount(() => {
  if (!mediaQuery) return

  if (typeof mediaQuery.removeEventListener === "function") {
    mediaQuery.removeEventListener("change", applyBrowserTheme)
  } else if (typeof mediaQuery.removeListener === "function") {
    mediaQuery.removeListener(applyBrowserTheme)
  }
})

function showPopup(title, message, shouldRedirect = false) {
  dialogTitle.value = title
  dialogMessage.value = message
  redirectAfterClose.value = shouldRedirect
  dialog.value = true
}

function closeDialog() {
  dialog.value = false

  if (redirectAfterClose.value) {
    redirectAfterClose.value = false
    router.push("/n_mainpage")
  }
}

const form = reactive({
  name: "",
  surname: "",
  email: "",
  dob: "",
  gender: "",
  state: "",
  city: "",
  password: "",
  password2: "",
  agree: false,
  promos: false,
})

const states = [
  "Ariana","Béja","Ben Arous","Bizerte","Gabès","Gafsa","Jendouba",
  "Kairouan","Kasserine","Kébili","Le Kef","Mahdia","La Manouba",
  "Médenine","Monastir","Nabeul","Sfax","Sidi Bouzid","Siliana",
  "Sousse","Tataouine","Tozeur","Tunis","Zaghouan"
]

const citiesByState = {
  "Ariana": ["Ariana","Raoued","La Soukra","Ettadhamen","Sidi Thabet"],
  "Béja": ["Béja","Testour","Téboursouk","Nefza","Amdoun"],
  "Ben Arous": ["Ben Arous","Rades","Hammam Lif","Ezzahra","Mornag"],
  "Bizerte": ["Bizerte","Menzel Bourguiba","Mateur","Ras Jebel","Sejnane"],
  "Gabès": ["Gabès","Mareth","Métouia","El Hamma","Matmata"],
  "Gafsa": ["Gafsa","Métlaoui","Redeyef","Moularès","El Ksar"],
  "Jendouba": ["Jendouba","Tabarka","Aïn Draham","Bou Salem","Fernana"],
  "Kairouan": ["Kairouan","Haffouz","Sbikha","Bou Hajla","Nasrallah"],
  "Kasserine": ["Kasserine","Sbeitla","Thala","Fériana","Foussana"],
  "Kébili": ["Kébili","Douz","Souk Lahad","Faouar","Jemna"],
  "Le Kef": ["Le Kef","Dahmani","Tajerouine","Sers","Nebeur"],
  "Mahdia": ["Mahdia","Ksour Essef","Chebba","El Jem","Melloulèche"],
  "La Manouba": ["La Manouba","Den Den","Douar Hicher","Oued Ellil","Tebourba"],
  "Médenine": ["Médenine","Djerba Houmt Souk","Zarzis","Ben Gardane","Midoun"],
  "Monastir": ["Monastir","Sahline","Moknine","Jemmal","Téboulba"],
  "Nabeul": ["Nabeul","Hammamet","Kelibia","Korba","Menzel Temime"],
  "Sfax": ["Sfax","Sakiet Ezzit","Thyna","Mahrès","Skhira"],
  "Sidi Bouzid": ["Sidi Bouzid","Regueb","Jilma","Souk Jedid","Meknassy"],
  "Siliana": ["Siliana","Bou Arada","Gaâfour","El Krib","Makthar"],
  "Sousse": ["Sousse","Hammam Sousse","Akouda","Msaken","Enfidha"],
  "Tataouine": ["Tataouine","Ghomrassen","Remada","Bir Lahmar","Dehiba"],
  "Tozeur": ["Tozeur","Nefta","Degache","Tamerza","Chebika"],
  "Tunis": ["Tunis","La Marsa","Carthage","Le Bardo","La Goulette"],
  "Zaghouan": ["Zaghouan","Zriba","El Fahs","Nadhour","Bir Mcherga"]
}

const citiesForSelectedState = computed(() => citiesByState[form.state] ?? [])

watch(() => form.state, () => {
  form.city = ""
})

function saveDob() {
  if (dobDate.value) {
    form.dob = dobDate.value
  }
  dobMenu.value = false
}

function resetForm() {
  form.name = ""
  form.surname = ""
  form.email = ""
  form.dob = ""
  form.gender = ""
  form.state = ""
  form.city = ""
  form.password = ""
  form.password2 = ""
  form.agree = false
  form.promos = false
  dobDate.value = null
  showPassword.value = false
  showPassword2.value = false
}

function createAccount() {
  const normalizedEmail = String(form.email).trim().toLowerCase()

  if (
    !form.name ||
    !form.surname ||
    !normalizedEmail ||
    !form.dob ||
    !form.gender ||
    !form.state ||
    !form.city ||
    !form.password ||
    !form.password2
  ) {
    showPopup("Missing fields", "Please fill in all fields.")
    return
  }

  if (!form.agree) {
    showPopup("Terms required", "You must agree to the terms and services.")
    return
  }

  if (form.password !== form.password2) {
    showPopup("Error", "Passwords do not match.")
    return
  }

  if (get_User_By_Email(normalizedEmail)) {
    showPopup("Error", "This email is already used.")
    return
  }

  const newUser = add_User({
    first_name: form.name.trim(),
    last_name: form.surname.trim(),
    email: normalizedEmail,
    password: form.password,
    gender: form.gender,
    date_of_birth: form.dob,
    state: form.state,
    city: form.city,
    agree_terms: form.agree,
    receive_promos: form.promos,
  })

  set_Current_User(newUser)
  resetForm()

  showPopup("Success 😏", "Account created successfully!", true)
}
</script>

<style scoped>
.create-account-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}

.create-account-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.35s ease, background 0.35s ease;
}

.page-shell {
  position: relative;
  z-index: 1;
}

.create-account-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.14),
    0 4px 24px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(12px);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background-color 0.35s ease,
    border-color 0.35s ease;
}

.create-account-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    rgba(var(--v-theme-primary), 1) 0%,
    rgba(var(--v-theme-primary), 0.35) 100%
  );
}

.create-account-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 28px 90px rgba(0, 0, 0, 0.16),
    0 6px 28px rgba(0, 0, 0, 0.08);
}

.hero-logo-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-logo {
  width: 140px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.18));
  transition: transform 0.25s ease;
}

.hero-logo:hover {
  transform: scale(1.03);
}

.hero-title {
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  max-width: 620px;
  line-height: 1.6;
  margin-inline: auto;
}

.field-input :deep(.v-field) {
  border-radius: 18px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background-color 0.25s ease;
}

.field-input :deep(.v-field:hover) {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.field-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.09);
}

.preferences-title {
  letter-spacing: 0.01em;
}

.checkbox-label-wrap {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.custom-checkbox :deep(.v-selection-control) {
  align-items: start;
}

.create-account-btn {
  letter-spacing: 0.01em;
  box-shadow: 0 14px 30px rgba(var(--v-theme-primary), 0.22);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.create-account-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 36px rgba(var(--v-theme-primary), 0.28);
  filter: saturate(1.04);
}

.bottom-caption {
  opacity: 0.88;
  line-height: 1.7;
  font-style: italic;
  max-width: 560px;
  margin-inline: auto;
}

.dialog-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
}

.date-picker-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.theme-light.create-account-page {
  background:
    radial-gradient(circle at top left, rgba(33, 150, 243, 0.12), transparent 34%),
    radial-gradient(circle at bottom right, rgba(100, 181, 246, 0.12), transparent 32%),
    linear-gradient(180deg, #f7faff 0%, #eef4fb 100%);
}

.theme-light .create-account-background {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.45)),
    radial-gradient(circle at 20% 15%, rgba(33, 150, 243, 0.09), transparent 22%),
    radial-gradient(circle at 85% 80%, rgba(25, 118, 210, 0.08), transparent 20%);
}

.theme-light .create-account-card {
  background: rgba(255, 255, 255, 0.88);
}

.theme-dark.create-account-page {
  background:
    radial-gradient(circle at top left, rgba(33, 150, 243, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(13, 71, 161, 0.2), transparent 26%),
    linear-gradient(180deg, #0b1220 0%, #111827 100%);
}

.theme-dark .create-account-background {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
    radial-gradient(circle at 15% 10%, rgba(100, 181, 246, 0.09), transparent 18%),
    radial-gradient(circle at 85% 85%, rgba(33, 150, 243, 0.08), transparent 16%);
}

.theme-dark .create-account-card {
  background: rgba(15, 23, 42, 0.82);
}

@media (max-width: 600px) {
  .create-account-card {
    padding: 18px !important;
  }

  .hero-title {
    font-size: 2rem !important;
  }

  .hero-logo {
    width: 112px;
  }
}
</style>