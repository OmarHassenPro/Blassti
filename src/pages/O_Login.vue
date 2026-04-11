<template>
  <v-container
    fluid
    class="login-page py-5 py-sm-6 py-md-10"
    :class="themeClass"
  >
    <div class="login-page-background"></div>
    <div class="login-page-glow glow-one"></div>
    <div class="login-page-glow glow-two"></div>

    <v-row justify="center" class="login-row">
      <v-col cols="12" sm="11" md="8" lg="5" xl="4">
        <div class="page-shell">
          <v-fade-transition appear>
            <v-card
              variant="flat"
              rounded="xl"
              class="pa-4 pa-sm-5 pa-md-6 login-card"
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
                  Log in to Blassti
                </div>

                <div class="text-body-1 text-medium-emphasis hero-subtitle mt-2 mx-auto">
                  Access your account to explore events, manage bookings, and keep
                  everything in one place.
                </div>
              </div>

              <v-text-field
                v-model="email"
                label="E-mail"
                variant="outlined"
                density="comfortable"
                type="email"
                class="mb-4 field-input"
                rounded="xl"
                prepend-inner-icon="mdi-email-outline"
                hide-details="auto"
                autocomplete="email"
                :bg-color="fieldBg"
                @keyup.enter="login"
              />

              <v-text-field
                v-model="password"
                label="Password"
                variant="outlined"
                density="comfortable"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                prepend-inner-icon="mdi-lock-outline"
                class="mb-6 field-input"
                rounded="xl"
                hide-details="auto"
                autocomplete="current-password"
                :bg-color="fieldBg"
                @click:append-inner="showPassword = !showPassword"
                @keyup.enter="login"
              />

              <v-btn
                block
                size="x-large"
                rounded="xl"
                color="primary"
                variant="flat"
                class="py-6 text-h6 font-weight-bold login-btn"
                elevation="0"
                :loading="isLoggingIn"
                :disabled="isLoggingIn"
                @click="login"
              >
                <v-icon start v-if="!isLoggingIn">mdi-login</v-icon>
                {{ isLoggingIn ? "Logging in..." : "Log in" }}
              </v-btn>

              <div class="text-center mt-4 mb-6">
                <v-btn
                  variant="text"
                  rounded="xl"
                  class="guest-btn text-body-2 font-weight-medium"
                  @click="continueAsGuest"
                >
                  <v-icon start size="18">mdi-account-arrow-right-outline</v-icon>
                  Continue as guest
                </v-btn>
              </div>

              <v-divider class="my-5"></v-divider>

              <div class="register-panel">
                <div class="text-subtitle-1 font-weight-bold mb-1">
                  New here?
                </div>

                <div class="text-body-2 text-medium-emphasis mb-4 register-subtitle">
                  Create an account to unlock the full Blassti experience.
                </div>

                <v-btn
                  block
                  size="x-large"
                  rounded="xl"
                  color="primary"
                  variant="outlined"
                  class="py-6 text-h6 font-weight-bold create-account-btn"
                  @click="goToRegister"
                >
                  <v-icon start>mdi-account-plus-outline</v-icon>
                  Create account
                </v-btn>
              </div>
            </v-card>
          </v-fade-transition>
        </div>
      </v-col>
    </v-row>

    <v-dialog
      v-model="dialog"
      max-width="460"
      transition="dialog-bottom-transition"
      :scrim="dialogScrim"
    >
      <v-card rounded="xl" class="dialog-card" :class="themeClass">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center ga-2 dialog-title">
          <v-icon color="primary">
            {{
              dialogTitle === "Success"
                ? "mdi-check-circle-outline"
                : dialogTitle === "Account suspended"
                  ? "mdi-alert-octagon-outline"
                  : "mdi-alert-circle-outline"
            }}
          </v-icon>
          {{ dialogTitle }}
        </v-card-title>

        <v-card-text class="text-body-1 pt-2 dialog-message">
          {{ dialogMessage }}
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn color="primary" variant="flat" rounded="lg" min-height="42" @click="closeDialog">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-fade-transition>
      <div v-if="showSuccessOverlay" class="success-overlay">
        <div class="success-overlay-backdrop"></div>

        <div class="success-content" :class="themeClass">
          <div class="success-ring">
            <v-icon class="success-check-icon" size="68" color="white">
              mdi-check
            </v-icon>
          </div>

          <div class="success-title mt-6">Login successful</div>
          <div class="success-subtitle mt-2">
            Taking you to your dashboard...
          </div>
        </div>
      </div>
    </v-fade-transition>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { useTheme, useDisplay } from "vuetify"
import {
  clear_Expired_Suspensions,
  get_User_By_Email,
  is_User_Suspended,
  set_Current_User,
} from "@/dataModel/user"
import BlasstiLogo from "@/assets/blassti-logo.png"

const router = useRouter()
const theme = useTheme()
const display = useDisplay()

const THEME_STORAGE_KEY = "blassti-theme"

const email = ref("")
const password = ref("")
const showPassword = ref(false)

const dialog = ref(false)
const dialogTitle = ref("")
const dialogMessage = ref("")
const redirectAfterClose = ref(false)

const isLoggingIn = ref(false)
const showSuccessOverlay = ref(false)

const currentTheme = computed(() => {
  return theme.global.name.value === "light" ? "light" : "dark"
})

const isDarkTheme = computed(() => currentTheme.value === "dark")
const isMobile = computed(() => display.smAndDown.value)
const themeClass = computed(() => `theme-${currentTheme.value}`)

const fieldBg = computed(() =>
  isDarkTheme.value
    ? "rgba(255,255,255,0.04)"
    : "rgba(255,255,255,0.78)"
)

const dialogScrim = computed(() =>
  isDarkTheme.value ? "rgba(5, 10, 18, 0.72)" : "rgba(15, 23, 42, 0.22)"
)

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"
  theme.global.name.value = normalizedTheme
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme)
  document.documentElement.setAttribute("data-app-theme", normalizedTheme)
  document.documentElement.style.colorScheme = normalizedTheme
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  applyThemeChoice(savedTheme === "light" ? "light" : "dark")
}

function syncThemeFromStorage() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === "light" || savedTheme === "dark") {
    theme.global.name.value = savedTheme
    document.documentElement.setAttribute("data-app-theme", savedTheme)
    document.documentElement.style.colorScheme = savedTheme
    return
  }

  applyThemeChoice("dark")
}

function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    syncThemeFromStorage()
  }
}

function handleWindowFocus() {
  syncThemeFromStorage()
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    syncThemeFromStorage()
  }
}

onMounted(() => {
  loadSavedTheme()
  window.addEventListener("storage", handleWindowStorage)
  window.addEventListener("focus", handleWindowFocus)
  document.addEventListener("visibilitychange", handleVisibilityChange)
})

onBeforeUnmount(() => {
  window.removeEventListener("storage", handleWindowStorage)
  window.removeEventListener("focus", handleWindowFocus)
  document.removeEventListener("visibilitychange", handleVisibilityChange)
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

function login() {
  if (isLoggingIn.value) return

  clear_Expired_Suspensions()

  const enteredEmail = String(email.value).trim().toLowerCase()
  const enteredPassword = String(password.value).trim()

  if (!enteredEmail || !enteredPassword) {
    showPopup("Missing fields", "Please fill all fields.")
    return
  }

  const user = get_User_By_Email(enteredEmail)

  if (!user) {
    showPopup("Login failed", "User not found.")
    return
  }

  if (user.password !== enteredPassword) {
    showPopup("Login failed", "Wrong password.")
    return
  }

  if (is_User_Suspended(user)) {
    const suspension = user.suspension || {}
    const reason =
      suspension.reason === "Other" && suspension.custom_reason
        ? suspension.custom_reason
        : suspension.reason || "Policy violation"

    const untilText = suspension.suspended_until
      ? new Date(suspension.suspended_until).toLocaleString()
      : "Unknown"

    showPopup(
      "Account suspended",
      `This account is suspended.\nReason: ${reason}\nSuspended until: ${untilText}`
    )
    return
  }

  isLoggingIn.value = true
  set_Current_User(user)

  setTimeout(() => {
    isLoggingIn.value = false
    showSuccessOverlay.value = true

    setTimeout(() => {
      router.push("/n_mainpage")
    }, 1100)
  }, 500)
}

function goToRegister() {
  router.push("/o_createacc")
}

function continueAsGuest() {
  localStorage.removeItem("currentUser")
  router.push("/n_mainpage")
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  transition: background 0.35s ease, color 0.35s ease;
}

.login-row {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 48px);
  align-items: center;
}

.login-page-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.35s ease, background 0.35s ease;
}

.login-page-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.7;
  transition: opacity 0.35s ease, background 0.35s ease;
}

.glow-one {
  top: -80px;
  left: -60px;
  width: 260px;
  height: 260px;
}

.glow-two {
  right: -80px;
  bottom: -70px;
  width: 300px;
  height: 300px;
}

.page-shell {
  position: relative;
  z-index: 1;
}

.login-card {
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

.login-card::before {
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

.login-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 28px 90px rgba(0, 0, 0, 0.16),
    0 6px 28px rgba(0, 0, 0, 0.08);
}

.page-hero {
  position: relative;
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
}

.field-input :deep(.v-field) {
  min-height: 54px;
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

.field-input :deep(.v-field__prepend-inner),
.field-input :deep(.v-field__append-inner) {
  padding-top: 14px;
}

.login-btn {
  min-height: 56px;
  letter-spacing: 0.01em;
  box-shadow: 0 14px 30px rgba(var(--v-theme-primary), 0.22);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 36px rgba(var(--v-theme-primary), 0.28);
  filter: saturate(1.04);
}

.guest-btn {
  min-height: 44px;
  padding-inline: 16px;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.guest-btn:hover {
  transform: translateY(-1px);
}

.register-panel {
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  background: rgba(var(--v-theme-primary), 0.035);
}

.register-subtitle {
  line-height: 1.6;
}

.create-account-btn {
  min-height: 56px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.create-account-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(var(--v-theme-primary), 0.14);
}

.dialog-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
  transition: background-color 0.35s ease, border-color 0.35s ease, color 0.35s ease;
}

.dialog-title {
  line-height: 1.2;
}

.dialog-message {
  white-space: pre-line;
}

.success-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 16px;
}

.success-overlay-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(7, 13, 24, 0.52);
  backdrop-filter: blur(10px);
  animation: successFadeIn 0.35s ease;
}

.success-content {
  position: relative;
  z-index: 1;
  min-width: 280px;
  padding: 34px 28px;
  border-radius: 28px;
  text-align: center;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.28),
    0 0 0 1px rgba(var(--v-theme-primary), 0.08);
  animation: successPopIn 0.42s cubic-bezier(0.2, 0.9, 0.2, 1);
  transition: background-color 0.35s ease, border-color 0.35s ease;
}

.success-ring {
  width: 108px;
  height: 108px;
  margin: 0 auto;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.18), transparent 45%),
    linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.72));
  box-shadow:
    0 16px 44px rgba(var(--v-theme-primary), 0.34),
    0 0 0 12px rgba(var(--v-theme-primary), 0.08);
  animation: successPulse 1.1s ease-out;
}

.success-check-icon {
  animation: successCheckPop 0.45s ease 0.08s both;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.success-subtitle {
  font-size: 0.98rem;
}

.theme-light.login-page {
  background:
    radial-gradient(circle at top left, rgba(33, 150, 243, 0.12), transparent 34%),
    radial-gradient(circle at bottom right, rgba(100, 181, 246, 0.12), transparent 32%),
    linear-gradient(180deg, #f7faff 0%, #eef4fb 100%);
}

.theme-light .login-page-background {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.45)),
    radial-gradient(circle at 20% 15%, rgba(33, 150, 243, 0.09), transparent 22%),
    radial-gradient(circle at 85% 80%, rgba(25, 118, 210, 0.08), transparent 20%);
}

.theme-light .glow-one,
.theme-light .glow-two {
  background: rgba(33, 150, 243, 0.16);
}

.theme-light .login-card {
  background: rgba(255, 255, 255, 0.88);
}

.theme-light .dialog-card {
  background: rgba(255, 255, 255, 0.96);
}

.theme-light .success-content {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.theme-light .success-title {
  color: #0f172a;
}

.theme-light .success-subtitle {
  color: rgba(15, 23, 42, 0.72);
}

.theme-dark.login-page {
  background:
    radial-gradient(circle at top left, rgba(33, 150, 243, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(13, 71, 161, 0.2), transparent 26%),
    linear-gradient(180deg, #0b1220 0%, #111827 100%);
}

.theme-dark .login-page-background {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
    radial-gradient(circle at 15% 10%, rgba(100, 181, 246, 0.09), transparent 18%),
    radial-gradient(circle at 85% 85%, rgba(33, 150, 243, 0.08), transparent 16%);
}

.theme-dark .glow-one,
.theme-dark .glow-two {
  background: rgba(25, 118, 210, 0.18);
}

.theme-dark .login-card {
  background: rgba(15, 23, 42, 0.82);
}

.theme-dark .register-panel {
  background: rgba(255, 255, 255, 0.025);
  border-color: rgba(255, 255, 255, 0.06);
}

.theme-dark .dialog-card {
  background: rgba(15, 23, 42, 0.96);
}

.theme-dark .success-content {
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.theme-dark .success-title {
  color: white;
}

.theme-dark .success-subtitle {
  color: rgba(255, 255, 255, 0.72);
}

@keyframes successFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes successPopIn {
  0% {
    opacity: 0;
    transform: translateY(22px) scale(0.92);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes successCheckPop {
  0% {
    opacity: 0;
    transform: scale(0.35) rotate(-18deg);
  }
  70% {
    opacity: 1;
    transform: scale(1.12) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes successPulse {
  0% {
    transform: scale(0.88);
    box-shadow:
      0 0 0 0 rgba(var(--v-theme-primary), 0.24),
      0 16px 44px rgba(var(--v-theme-primary), 0.2);
  }
  70% {
    transform: scale(1.03);
    box-shadow:
      0 0 0 16px rgba(var(--v-theme-primary), 0),
      0 16px 44px rgba(var(--v-theme-primary), 0.34);
  }
  100% {
    transform: scale(1);
    box-shadow:
      0 0 0 12px rgba(var(--v-theme-primary), 0.08),
      0 16px 44px rgba(var(--v-theme-primary), 0.34);
  }
}

@media (max-width: 959px) {
  .login-row {
    min-height: calc(100vh - 24px);
  }
}

@media (max-width: 600px) {
  .login-page {
    padding-inline: 10px;
  }

  .login-row {
    min-height: auto;
    align-items: flex-start;
  }

  .page-shell {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .login-card {
    padding: 18px !important;
    border-radius: 24px !important;
  }

  .hero-title {
    font-size: 2rem !important;
  }

  .hero-subtitle {
    font-size: 0.96rem;
  }

  .hero-logo {
    width: 112px;
  }

  .register-panel {
    padding: 16px;
  }

  .field-input :deep(.v-field) {
    min-height: 52px;
  }

  .login-btn,
  .create-account-btn {
    min-height: 54px;
  }

  .success-content {
    width: calc(100vw - 32px);
    min-width: unset;
    padding: 28px 20px;
    border-radius: 24px;
  }

  .success-ring {
    width: 92px;
    height: 92px;
  }

  .success-title {
    font-size: 1.28rem;
  }
}
</style>
