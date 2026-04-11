<template>
  <v-footer
    app
    height="36"
    class="app-footer px-3"
    :class="{ 'app-footer--hidden': isFooterHidden }"
  >
    <div class="footer-inner d-flex align-center justify-space-between w-100">

      <div class="footer-text">
        © {{ new Date().getFullYear() }} Blassti
      </div>

      <div class="d-flex align-center ga-1">
        <v-btn
          icon
          variant="text"
          size="x-small"
          href="https://github.com/OmarHassenPro/Blassti"
          target="_blank"
          rel="noopener noreferrer"
          title="Blassti GitHub"
        >
          <v-icon size="18">mdi-github</v-icon>
        </v-btn>

        <v-btn
          icon
          variant="text"
          size="x-small"
          href="https://www.smu.tn/medtech"
          target="_blank"
          rel="noopener noreferrer"
          title="MedTech"
        >
          <v-icon size="18">mdi-school</v-icon>
        </v-btn>
      </div>

    </div>
  </v-footer>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const THEME_STORAGE_KEY = 'blassti-theme'

const isFooterHidden = ref(false)
const lastScrollY = ref(0)

const handleScroll = () => {
  const currentScrollY = window.scrollY || window.pageYOffset || 0
  const scrollDelta = currentScrollY - lastScrollY.value

  if (currentScrollY <= 24) {
    isFooterHidden.value = false
    lastScrollY.value = currentScrollY
    return
  }

  if (scrollDelta > 6) {
    isFooterHidden.value = true
  } else if (scrollDelta < -6) {
    isFooterHidden.value = false
  }

  lastScrollY.value = currentScrollY
}

onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.global.name.value = savedTheme
  }

  lastScrollY.value = window.scrollY || window.pageYOffset || 0
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="sass">
.app-footer
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08)
  background: rgba(var(--v-theme-surface), 0.96)
  min-height: 36px !important
  padding-top: 0 !important
  padding-bottom: 0 !important
  backdrop-filter: blur(8px)
  transition: transform 0.22s ease, opacity 0.22s ease, background-color 0.2s ease, border-color 0.2s ease
  will-change: transform, opacity

.app-footer--hidden
  transform: translateY(100%)
  opacity: 0

.footer-inner
  height: 100%

.footer-text
  font-size: 0.7rem
  opacity: 0.6
  letter-spacing: 0.02em
  white-space: nowrap

.v-btn
  color: rgba(var(--v-theme-on-surface), 0.65)
  min-width: 28px !important
  height: 28px !important
  width: 28px !important
  transition: color 0.18s ease, transform 0.18s ease, background-color 0.18s ease

  &:hover
    color: rgb(var(--v-theme-primary))
    transform: translateY(-1px)

  &:active
    transform: scale(0.96)

@media (max-width: 600px)
  .app-footer
    min-height: 34px !important

  .footer-text
    font-size: 0.68rem

  .v-btn
    min-width: 26px !important
    height: 26px !important
    width: 26px !important
</style>
