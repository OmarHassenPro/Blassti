<template>
  <v-app :class="['settings-app', `theme-${currentTheme}`]">
    <AppNavbar />

    <v-main>
      <div class="settings-shell" :class="pageThemeClass">
        <div class="settings-shell__glow settings-shell__glow--one" />
        <div class="settings-shell__glow settings-shell__glow--two" />

        <v-container class="py-5 py-sm-6 py-md-8 px-3 px-sm-4 settings-container" style="max-width: 1100px;">
          <div class="d-flex flex-column ga-6">
            <v-card
              rounded="xl"
              class="hero-card pa-5 pa-md-6"
              elevation="0"
            >
              <div class="d-flex align-start justify-space-between flex-wrap hero-header" style="gap: 18px;">
                <div class="hero-copy">
                  <div class="hero-overline mb-3">
                    <v-icon size="18" class="me-2">mdi-cog-outline</v-icon>
                    Account settings
                  </div>

                  <div class="text-h4 font-weight-bold hero-title">
                    Profile Settings
                  </div>

                  <div class="text-body-1 text-medium-emphasis hero-subtitle">
                    Update your profile, picture, socials, artist info, and password.
                  </div>

                  <div
                    v-if="currentUser"
                    class="d-flex flex-wrap align-center mt-4 hero-chip-row"
                    style="gap: 10px;"
                  >
                    <v-chip
                      rounded="pill"
                      variant="tonal"
                      color="primary"
                      prepend-icon="mdi-account-circle-outline"
                      class="hero-chip"
                    >
                      {{ form.first_name || "User" }} {{ form.last_name || "" }}
                    </v-chip>

                    <v-chip
                      rounded="pill"
                      :color="computedIsArtist ? 'success' : 'info'"
                      variant="tonal"
                      :prepend-icon="computedIsArtist ? 'mdi-music-circle-outline' : 'mdi-account-outline'"
                      class="hero-chip"
                    >
                      {{ computedIsArtist ? "Artist account" : "Standard account" }}
                    </v-chip>

                    <v-chip
                      rounded="pill"
                      :color="isDirty ? 'warning' : 'success'"
                      variant="tonal"
                      :prepend-icon="isDirty ? 'mdi-content-save-alert-outline' : 'mdi-check-circle-outline'"
                      class="hero-chip"
                    >
                      {{ isDirty ? "Unsaved changes" : "All changes saved" }}
                    </v-chip>
                  </div>
                </div>

                <div class="d-flex flex-wrap align-center hero-actions" style="gap: 12px;">
                  <v-btn
                    color="primary"
                    variant="tonal"
                    rounded="lg"
                    prepend-icon="mdi-home-outline"
                    class="action-btn hero-action-btn"
                    @click="smartNavigate('/')"
                    @contextmenu="openRouteMenu($event, 'Home', '/')"
                    @touchstart.passive="startLongPress($event, 'Home', '/')"
                    @touchend="cancelLongPress"
                    @touchcancel="cancelLongPress"
                  >
                    Back to Home
                  </v-btn>

                  <v-btn
                    color="primary"
                    variant="outlined"
                    rounded="lg"
                    prepend-icon="mdi-lock-reset"
                    class="action-btn hero-action-btn"
                    @click="passwordDialog = true"
                  >
                    Change Password
                  </v-btn>

                  <v-btn
                    color="error"
                    variant="outlined"
                    rounded="lg"
                    prepend-icon="mdi-delete-outline"
                    class="action-btn hero-action-btn hero-action-btn--danger"
                    @click="deleteAccountDialog = true"
                  >
                    Delete Account
                  </v-btn>
                </div>
              </div>
            </v-card>

            <v-alert
              v-if="!currentUser"
              type="error"
              variant="outlined"
              rounded="xl"
              border="start"
              class="mb-0"
            >
              No logged-in user found. Please log in first.
            </v-alert>

            <template v-else>
              <div v-if="isCompactView" class="compact-profile-glance mb-6">
                <v-card rounded="xl" variant="outlined" class="pa-4 pa-sm-5 section-card compact-profile-card">
                  <div class="d-flex align-center justify-space-between flex-wrap compact-profile-card__top" style="gap: 12px;">
                    <div class="d-flex align-center compact-profile-card__identity" style="gap: 14px;">
                      <v-avatar size="68" color="grey-lighten-3" class="profile-avatar compact-profile-avatar">
                        <v-img
                          v-if="form.profile_picture"
                          :src="form.profile_picture"
                          cover
                        />
                        <v-icon v-else size="30">mdi-account</v-icon>
                      </v-avatar>

                      <div class="min-w-0">
                        <div class="text-subtitle-1 font-weight-bold text-truncate">
                          {{ form.first_name || "User" }} {{ form.last_name || "" }}
                        </div>
                        <div class="text-body-2 text-medium-emphasis">
                          {{ computedIsArtist ? "Artist profile" : "Standard profile" }}
                        </div>
                      </div>
                    </div>

                    <v-chip
                      rounded="pill"
                      :color="isDirty ? 'warning' : 'success'"
                      variant="tonal"
                      :prepend-icon="isDirty ? 'mdi-content-save-alert-outline' : 'mdi-check-circle-outline'"
                      class="compact-state-chip"
                    >
                      {{ isDirty ? "Unsaved" : "Saved" }}
                    </v-chip>
                  </div>

                  <div class="d-flex flex-wrap compact-profile-chip-row mt-4" style="gap: 10px;">
                    <v-chip
                      rounded="pill"
                      variant="tonal"
                      color="primary"
                      prepend-icon="mdi-email-outline"
                    >
                      {{ form.email }}
                    </v-chip>

                    <v-chip
                      rounded="pill"
                      variant="tonal"
                      :color="computedIsArtist ? 'success' : 'info'"
                      :prepend-icon="computedIsArtist ? 'mdi-music-circle-outline' : 'mdi-account-outline'"
                    >
                      {{ computedIsArtist ? "Artist account" : "Standard account" }}
                    </v-chip>
                  </div>
                </v-card>
              </div>

              <v-row class="settings-grid" :class="{ 'settings-grid--compact': isCompactView, 'settings-grid--tablet': isTabletView }">
                <v-col cols="12" md="4" class="settings-sidebar-col">
                  <div class="d-flex flex-column ga-6">
                    <v-card rounded="xl" variant="outlined" class="pa-5 section-card profile-picture-card">
                      <div class="d-flex align-center justify-space-between mb-4 flex-wrap" style="gap: 10px;">
                        <div class="section-title-wrap">
                          <div class="text-subtitle-1 font-weight-bold section-title">
                            Profile Picture
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Choose a ready-made avatar or upload your own.
                          </div>
                        </div>

                        <v-chip
                          size="small"
                          rounded="pill"
                          variant="tonal"
                          color="primary"
                          prepend-icon="mdi-image-outline"
                        >
                          Visual identity
                        </v-chip>
                      </div>

                      <div class="d-flex justify-center mb-4">
                        <div class="avatar-stage">
                          <v-avatar size="150" color="grey-lighten-3" class="profile-avatar elevation-2">
                            <v-img
                              v-if="form.profile_picture"
                              :src="form.profile_picture"
                              cover
                            />
                            <v-icon v-else size="70">mdi-account</v-icon>
                          </v-avatar>
                        </div>
                      </div>

                      <v-divider class="mb-4" />

                      <div class="d-flex align-center justify-space-between mb-2 flex-wrap" style="gap: 8px;">
                        <div class="text-body-2 font-weight-medium">
                          Choose a clipart avatar
                        </div>

                        <div class="text-caption text-medium-emphasis">
                          Tap to preview instantly
                        </div>
                      </div>

                      <v-row dense class="mb-3 avatar-grid-row">
                        <v-col
                          v-for="avatar in PROFILE_AVATAR_OPTIONS"
                          :key="avatar.label"
                          cols="4"
                        >
                          <v-card
                            rounded="lg"
                            variant="outlined"
                            class="pa-2 d-flex justify-center align-center avatar-option"
                            :class="{ 'selected-avatar': form.profile_picture === avatar.url }"
                            @click="selectAvatar(avatar.url)"
                          >
                            <v-avatar size="56">
                              <v-img :src="avatar.url" cover />
                            </v-avatar>
                          </v-card>
                        </v-col>
                      </v-row>

                      <div class="d-flex flex-column action-stack" style="gap: 10px;">
                        <v-btn
                          block
                          variant="outlined"
                          prepend-icon="mdi-refresh"
                          class="soft-btn"
                          @click="resetToGeneratedAvatar"
                        >
                          Use generated avatar
                        </v-btn>

                        <v-file-input
                          accept="image/*"
                          label="Upload image"
                          variant="outlined"
                          density="comfortable"
                          prepend-icon="mdi-camera"
                          show-size
                          hide-details
                          class="clean-input"
                          @change="handleImageUpload"
                        />

                        <v-btn
                          block
                          color="error"
                          variant="text"
                          prepend-icon="mdi-image-remove-outline"
                          class="soft-btn"
                          @click="removeProfilePicture"
                        >
                          Remove profile picture
                        </v-btn>
                      </div>

                      <div class="text-caption text-medium-emphasis mt-3">
                        Uploaded images are converted to base64 after crop/resize.
                        Max file size: 2 MB.
                      </div>
                    </v-card>

                    <v-card rounded="xl" variant="outlined" class="pa-5 section-card">
                      <div class="d-flex align-center justify-space-between mb-4 flex-wrap" style="gap: 10px;">
                        <div class="section-title-wrap">
                          <div class="text-subtitle-1 font-weight-bold section-title">
                            Artist Status
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Automatically determined based on linked events.
                          </div>
                        </div>

                        <v-chip
                          :color="computedIsArtist ? 'success' : 'info'"
                          variant="tonal"
                          rounded="pill"
                          :prepend-icon="computedIsArtist ? 'mdi-check-decagram-outline' : 'mdi-information-outline'"
                        >
                          {{ computedIsArtist ? "Active" : "Inactive" }}
                        </v-chip>
                      </div>

                      <v-alert
                        v-if="computedIsArtist"
                        type="success"
                        variant="tonal"
                        rounded="lg"
                        class="mb-4"
                      >
                        This account is currently marked as an artist because it is linked to at least one event.
                      </v-alert>

                      <v-alert
                        v-else
                        type="info"
                        variant="tonal"
                        rounded="lg"
                        class="mb-4"
                      >
                        This account is not marked as an artist because it is not linked to any event yet.
                      </v-alert>

                      <v-text-field
                        v-model="form.artist_type"
                        label="Artist type"
                        variant="outlined"
                        density="comfortable"
                        :disabled="!computedIsArtist"
                        hint="Singer, DJ, Comedian, Magician..."
                        persistent-hint
                        prepend-inner-icon="mdi-microphone-variant"
                        class="clean-input"
                      />
                    </v-card>
                  </div>
                </v-col>

                <v-col cols="12" md="8" class="settings-main-col">
                  <div class="d-flex flex-column ga-6">
                    <v-card rounded="xl" variant="outlined" class="pa-5 section-card">
                      <div class="d-flex align-center justify-space-between mb-4 flex-wrap" style="gap: 10px;">
                        <div class="section-title-wrap">
                          <div class="text-subtitle-1 font-weight-bold section-title">
                            Basic Info
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Personal details used across your account.
                          </div>
                        </div>

                        <v-chip
                          size="small"
                          rounded="pill"
                          variant="tonal"
                          color="primary"
                          prepend-icon="mdi-badge-account-outline"
                        >
                          Core profile
                        </v-chip>
                      </div>

                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.first_name"
                            label="First name"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-account-outline"
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.last_name"
                            label="Last name"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-account-outline"
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            :model-value="form.email"
                            label="Email"
                            variant="outlined"
                            density="comfortable"
                            readonly
                            prepend-inner-icon="mdi-lock-outline"
                            hint="Email cannot be edited."
                            persistent-hint
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-select
                            v-model="form.gender"
                            :items="genderOptions"
                            label="Gender"
                            variant="outlined"
                            density="comfortable"
                            disabled
                            prepend-inner-icon="mdi-lock-outline"
                            hint="Gender cannot be edited."
                            persistent-hint
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.date_of_birth"
                            label="Date of birth"
                            type="date"
                            variant="outlined"
                            density="comfortable"
                            readonly
                            prepend-inner-icon="mdi-lock-outline"
                            hint="Date of birth cannot be edited."
                            persistent-hint
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.state"
                            label="State / Governorate"
                            variant="outlined"
                            density="comfortable"
                            readonly
                            prepend-inner-icon="mdi-lock-outline"
                            hint="State / Governorate cannot be edited."
                            persistent-hint
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.city"
                            label="City"
                            variant="outlined"
                            density="comfortable"
                            readonly
                            prepend-inner-icon="mdi-lock-outline"
                            hint="City cannot be edited."
                            persistent-hint
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6" class="d-flex align-center">
                          <div class="promo-box w-100">
                            <v-checkbox
                              v-model="form.receive_promos"
                              label="Receive promos"
                              hide-details
                              color="primary"
                            />
                          </div>
                        </v-col>
                      </v-row>
                    </v-card>

                    <v-card rounded="xl" variant="outlined" class="pa-5 section-card">
                      <div class="d-flex align-center justify-space-between mb-4 flex-wrap" style="gap: 10px;">
                        <div class="section-title-wrap">
                          <div class="text-subtitle-1 font-weight-bold section-title">
                            Bio
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Share a short introduction with your audience.
                          </div>
                        </div>

                        <v-chip
                          size="small"
                          rounded="pill"
                          variant="tonal"
                          color="primary"
                          prepend-icon="mdi-text-box-outline"
                        >
                          {{ String(form.description || "").length }}/500
                        </v-chip>
                      </div>

                      <v-textarea
                        v-model="form.description"
                        label="Write your bio"
                        variant="outlined"
                        rows="6"
                        auto-grow
                        counter="500"
                        class="clean-input"
                      />
                    </v-card>

                    <v-card rounded="xl" variant="outlined" class="pa-5 section-card">
                      <div class="d-flex align-center justify-space-between mb-4 flex-wrap" style="gap: 10px;">
                        <div class="section-title-wrap">
                          <div class="text-subtitle-1 font-weight-bold section-title">
                            Socials & Contacts
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Add ways for people to discover and reach you.
                          </div>
                        </div>

                        <v-chip
                          size="small"
                          rounded="pill"
                          variant="tonal"
                          color="primary"
                          prepend-icon="mdi-share-variant-outline"
                        >
                          Public links
                        </v-chip>
                      </div>

                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.contacts.instagram"
                            label="Instagram"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-instagram"
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.contacts.linkedin"
                            label="LinkedIn"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-linkedin"
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.contacts.soundcloud"
                            label="SoundCloud"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-soundcloud"
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.contacts.tiktok"
                            label="TikTok"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-music-note"
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.contacts.facebook"
                            label="Facebook"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-facebook"
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.contacts.website"
                            label="Website"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-web"
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.contacts.phone"
                            label="Phone number"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-phone"
                            class="clean-input"
                          />
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.contacts.youtube"
                            label="YouTube"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-youtube"
                            class="clean-input"
                          />
                        </v-col>
                      </v-row>
                    </v-card>

                    <v-card rounded="xl" variant="outlined" class="pa-4 pa-md-5 sticky-action-card" :class="{ 'sticky-action-card--compact': isCompactView }">
                      <div class="d-flex align-center justify-space-between flex-wrap" style="gap: 14px;">
                        <div class="d-flex align-center flex-wrap" style="gap: 10px;">
                          <v-chip
                            rounded="pill"
                            :color="isDirty ? 'warning' : 'success'"
                            variant="tonal"
                            :prepend-icon="isDirty ? 'mdi-circle-edit-outline' : 'mdi-check-circle-outline'"
                          >
                            {{ isDirty ? "You have unsaved changes" : "Everything is up to date" }}
                          </v-chip>

                          <div class="text-body-2 text-medium-emphasis">
                            Save your latest profile edits when you're ready.
                          </div>
                        </div>

                        <div class="d-flex justify-end flex-wrap" style="gap: 12px;">
                          <v-btn
                            variant="text"
                            class="action-btn"
                            @click="resetForm"
                          >
                            Reset
                          </v-btn>

                          <v-btn
                            color="primary"
                            size="large"
                            rounded="lg"
                            class="action-btn save-btn"
                            @click="saveChanges"
                          >
                            Save Changes
                          </v-btn>
                        </div>
                      </div>
                    </v-card>

                    <div v-if="!isCompactView" class="d-flex justify-end desktop-action-row" style="gap: 12px;">
                      <v-btn
                        variant="text"
                        class="action-btn"
                        @click="resetForm"
                      >
                        Reset
                      </v-btn>

                      <v-btn
                        color="primary"
                        size="large"
                        rounded="lg"
                        class="action-btn save-btn"
                        @click="saveChanges"
                      >
                        Save Changes
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </template>
          </div>
        </v-container>
      </div>
    </v-main>

    <transition name="context-fade">
      <div
        v-if="currentUser && isCompactView"
        class="mobile-save-bar"
        :class="[`theme-${currentTheme}`, { 'mobile-save-bar--dirty': isDirty }]"
      >
        <div class="mobile-save-bar__meta">
          <div class="text-body-2 font-weight-bold">
            {{ isDirty ? "Unsaved profile changes" : "Profile is up to date" }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ isDirty ? "Save or reset before leaving this page." : "Everything has already been saved." }}
          </div>
        </div>

        <div class="mobile-save-bar__actions">
          <v-btn
            variant="text"
            density="comfortable"
            class="action-btn"
            @click="resetForm"
          >
            Reset
          </v-btn>

          <v-btn
            color="primary"
            rounded="lg"
            class="action-btn mobile-save-bar__save save-btn"
            @click="saveChanges"
          >
            Save
          </v-btn>
        </div>
      </div>
    </transition>


    <v-dialog v-model="passwordDialog" :max-width="isMobileView ? 460 : 520">
      <v-card rounded="xl" :class="['dialog-card', `theme-${currentTheme}`]">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon class="me-2" size="20">mdi-lock-reset</v-icon>
          Change Password
        </v-card-title>

        <v-card-text class="pt-3">
          <v-text-field
            v-model="passwordForm.oldPassword"
            label="Old password"
            :type="showOldPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            class="mb-3 clean-input"
            :append-inner-icon="showOldPassword ? 'mdi-eye-off' : 'mdi-eye'"
            prepend-inner-icon="mdi-lock-outline"
            @click:append-inner="showOldPassword = !showOldPassword"
          />

          <v-text-field
            v-model="passwordForm.newPassword"
            label="New password"
            :type="showNewPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            class="mb-3 clean-input"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            prepend-inner-icon="mdi-lock-plus-outline"
            @click:append-inner="showNewPassword = !showNewPassword"
          />

          <v-text-field
            v-model="passwordForm.repeatPassword"
            label="Repeat new password"
            :type="showRepeatPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            class="clean-input"
            :append-inner-icon="showRepeatPassword ? 'mdi-eye-off' : 'mdi-eye'"
            prepend-inner-icon="mdi-lock-check-outline"
            @click:append-inner="showRepeatPassword = !showRepeatPassword"
          />
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" class="action-btn" @click="closePasswordDialog">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" class="action-btn" @click="changePassword">
            Save Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="leaveDialog" max-width="480" persistent>
      <v-card rounded="xl" :class="['dialog-card', `theme-${currentTheme}`]">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon class="me-2" size="20">mdi-content-save-alert-outline</v-icon>
          Unsaved changes
        </v-card-title>

        <v-card-text>
          You have unsaved changes. Do you want to save before leaving?
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" class="action-btn" @click="cancelLeave">
            Cancel
          </v-btn>
          <v-btn variant="text" color="error" class="action-btn" @click="discardAndLeave">
            Discard
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" class="action-btn" @click="saveAndLeave">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="messageDialog.show" :max-width="isMobileView ? 400 : 430">
      <v-card rounded="xl" :class="['dialog-card', `theme-${currentTheme}`]">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon class="me-2" size="20">mdi-information-outline</v-icon>
          {{ messageDialog.title }}
        </v-card-title>

        <v-card-text>
          {{ messageDialog.message }}
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn color="primary" variant="flat" rounded="lg" class="action-btn" @click="messageDialog.show = false">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteAccountDialog" :max-width="isMobileView ? 420 : 460">
      <v-card rounded="xl" :class="['dialog-card', `theme-${currentTheme}`]">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon class="me-2" size="20">mdi-delete-alert-outline</v-icon>
          Delete Account
        </v-card-title>

        <v-card-text>
          Are you sure you want to delete your account?
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" class="action-btn" @click="deleteAccountDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" rounded="lg" class="action-btn" @click="goToDeleteReason">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteReasonDialog" :max-width="isMobileView ? 480 : 560">
      <v-card rounded="xl" :class="['dialog-card', `theme-${currentTheme}`]">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon class="me-2" size="20">mdi-help-circle-outline</v-icon>
          Why are you leaving?
        </v-card-title>

        <v-card-text>
          <v-radio-group v-model="deleteReason">
            <v-radio label="I no longer use this account" value="no_longer_use" />
            <v-radio label="I created another account" value="another_account" />
            <v-radio label="Privacy concerns" value="privacy" />
            <v-radio label="Too many emails / notifications" value="too_many_notifications" />
            <v-radio label="The app did not meet my needs" value="did_not_meet_needs" />
            <v-radio label="Other" value="other" />
          </v-radio-group>

          <v-textarea
            v-if="deleteReason === 'other'"
            v-model="deleteReasonOther"
            label="Write your reason"
            variant="outlined"
            rows="3"
            auto-grow
            class="clean-input"
          />
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" class="action-btn" @click="deleteReasonDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" rounded="lg" class="action-btn" @click="goToDeleteFinalWarning">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteFinalDialog" :max-width="isMobileView ? 420 : 480">
      <v-card rounded="xl" :class="['dialog-card', `theme-${currentTheme}`]">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon class="me-2" size="20">mdi-alert-outline</v-icon>
          Final Warning
        </v-card-title>

        <v-card-text>
          This action cannot be undone. Are you absolutely sure you want to permanently delete your account?
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" class="action-btn" @click="deleteFinalDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" rounded="lg" class="action-btn" @click="confirmDeleteAccount">
            Delete Permanently
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="imageEditorDialog" :max-width="isMobileView ? 520 : 760">
      <v-card rounded="xl" :class="['dialog-card', `theme-${currentTheme}`]">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon class="me-2" size="20">mdi-crop</v-icon>
          Crop & Resize Image
        </v-card-title>

        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Adjust the image, then save it as a square profile picture.
          </div>

          <div class="d-flex justify-center mb-4">
            <canvas
              ref="previewCanvas"
              width="320"
              height="320"
              class="crop-canvas"
            />
          </div>

          <v-slider
            v-model="cropState.zoom"
            label="Zoom"
            min="1"
            max="3"
            step="0.05"
            thumb-label
            class="mb-3"
            @update:model-value="renderCropPreview"
          />

          <v-slider
            v-model="cropState.offsetX"
            label="Horizontal"
            min="-200"
            max="200"
            step="1"
            thumb-label
            class="mb-3"
            @update:model-value="renderCropPreview"
          />

          <v-slider
            v-model="cropState.offsetY"
            label="Vertical"
            min="-200"
            max="200"
            step="1"
            thumb-label
            @update:model-value="renderCropPreview"
          />
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" class="action-btn" @click="cancelImageEdit">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" class="action-btn" @click="applyCroppedImage">
            Use This Image
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <transition name="context-fade">
      <div
        v-if="routeMenu.show"
        class="route-context-overlay"
        @click="closeRouteMenu"
        @contextmenu.prevent="closeRouteMenu"
      >
        <div
          :class="[`route-context-menu`, `theme-${currentTheme}`]"
          :style="{ top: `${routeMenu.y}px`, left: `${routeMenu.x}px` }"
          @click.stop
        >
          <div class="route-context-header">
            <v-icon size="18" class="me-2">mdi-open-in-new</v-icon>
            {{ routeMenu.title }}
          </div>

          <button class="route-context-item" type="button" @click="navigateFromRouteMenu">
            <v-icon size="18" class="me-2">mdi-arrow-right</v-icon>
            Open here
          </button>

          <button class="route-context-item" type="button" @click="openRouteInNewTab">
            <v-icon size="18" class="me-2">mdi-tab</v-icon>
            Open in new tab
          </button>

          <button class="route-context-item" type="button" @click="openRouteInNewWindow">
            <v-icon size="18" class="me-2">mdi-monitor-share</v-icon>
            Open in new window
          </button>
        </div>
      </div>
    </transition>

    <v-snackbar
      v-model="snackbar.show"
      :timeout="2600"
      rounded="lg"
      location="bottom right"
      :class="[`elevated-snackbar`, `theme-${currentTheme}`]"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import { useDisplay, useTheme } from "vuetify"
import AppNavbar from "@/components/AppNavbar.vue"
import {
  PROFILE_AVATAR_OPTIONS,
  createAvatar,
  delete_User,
  get_Current_User,
  get_User_By_Id,
  refresh_Artist_Statuses,
  set_Current_User,
  update_User,
} from "@/dataModel/user"
import {
  cropAndResizeImage,
  drawImageToCanvas,
  fileToDataUrl,
  loadImageElement,
} from "@/utils/imageUtils"

const router = useRouter()
const vuetifyTheme = useTheme()
const display = useDisplay()
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024
const THEME_STORAGE_KEY = "blassti-theme"
const LONG_PRESS_DURATION = 550

const currentUser = ref(get_Current_User())
const genderOptions = ["Male", "Female", "Other"]

const passwordDialog = ref(false)
const leaveDialog = ref(false)

const deleteAccountDialog = ref(false)
const deleteReasonDialog = ref(false)
const deleteFinalDialog = ref(false)
const deleteReason = ref("")
const deleteReasonOther = ref("")

const imageEditorDialog = ref(false)
const previewCanvas = ref(null)
const rawUploadedImage = ref(null)
const rawImageElement = ref(null)

const cropState = reactive({
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
})

const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  repeatPassword: "",
})

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showRepeatPassword = ref(false)

const messageDialog = reactive({
  show: false,
  title: "",
  message: "",
})

const snackbar = reactive({
  show: false,
  text: "",
})

const pendingRoute = ref(null)
const allowLeave = ref(false)
const longPressTimer = ref(null)

const routeMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  title: "",
  path: "",
})

const form = reactive(createInitialForm(currentUser.value))

const currentTheme = computed(() => {
  return vuetifyTheme.global.name.value === "light" ? "light" : "dark"
})

const pageThemeClass = computed(() => {
  return currentTheme.value === "dark" ? "theme-dark" : "theme-light"
})

const isMobileView = computed(() => display.smAndDown.value)
const isTabletView = computed(() => display.md.value)
const isCompactView = computed(() => display.mdAndDown.value)

const computedIsArtist = computed(() => {
  return Boolean(get_User_By_Id(currentUser.value?.id)?.is_artist)
})

const isDirty = computed(() => {
  if (!currentUser.value) return false
  return JSON.stringify(normalizeFormForCompare(form)) !== JSON.stringify(
    normalizeFormForCompare(createInitialForm(get_User_By_Id(currentUser.value.id)))
  )
})

function createInitialForm(user) {
  return {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    gender: user?.gender || "",
    date_of_birth: user?.date_of_birth || "",
    state: user?.state || "",
    city: user?.city || "",
    receive_promos: user?.receive_promos || false,
    description: user?.description || "",
    artist_type: user?.artist_type || "",
    profile_picture: user?.profile_picture || "",
    contacts: {
      instagram: user?.contacts?.instagram || "",
      linkedin: user?.contacts?.linkedin || "",
      soundcloud: user?.contacts?.soundcloud || "",
      tiktok: user?.contacts?.tiktok || "",
      facebook: user?.contacts?.facebook || "",
      website: user?.contacts?.website || "",
      phone: user?.contacts?.phone || "",
      youtube: user?.contacts?.youtube || "",
    },
  }
}

function normalizeFormForCompare(value) {
  return {
    first_name: String(value.first_name || "").trim(),
    last_name: String(value.last_name || "").trim(),
    email: String(value.email || "").trim().toLowerCase(),
    gender: value.gender || "",
    date_of_birth: value.date_of_birth || "",
    state: String(value.state || "").trim(),
    city: String(value.city || "").trim(),
    receive_promos: Boolean(value.receive_promos),
    description: String(value.description || "").trim(),
    artist_type: String(value.artist_type || "").trim(),
    profile_picture: value.profile_picture || "",
    contacts: {
      instagram: String(value.contacts?.instagram || "").trim(),
      linkedin: String(value.contacts?.linkedin || "").trim(),
      soundcloud: String(value.contacts?.soundcloud || "").trim(),
      tiktok: String(value.contacts?.tiktok || "").trim(),
      facebook: String(value.contacts?.facebook || "").trim(),
      website: String(value.contacts?.website || "").trim(),
      phone: String(value.contacts?.phone || "").trim(),
      youtube: String(value.contacts?.youtube || "").trim(),
    },
  }
}

function applyThemeChoice(themeName) {
  const normalizedTheme = themeName === "light" ? "light" : "dark"

  if (vuetifyTheme?.global?.name) {
    vuetifyTheme.global.name.value = normalizedTheme
  }

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-app-theme", normalizedTheme)
    document.documentElement.style.colorScheme = normalizedTheme
  }
}

function loadSavedTheme() {
  if (typeof window === "undefined") return
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  applyThemeChoice(savedTheme === "light" ? "light" : "dark")
}

function handleWindowStorage(event) {
  if (!event.key || event.key === THEME_STORAGE_KEY) {
    loadSavedTheme()
  }
}

function handleWindowFocus() {
  syncCurrentUser()
  loadSavedTheme()
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    loadSavedTheme()
  }
}

function startLongPress(event, title, path) {
  cancelLongPress()

  const touch = event?.touches?.[0]
  if (!touch) return

  longPressTimer.value = window.setTimeout(() => {
    openRouteMenu({
      preventDefault: () => {},
      clientX: touch.clientX,
      clientY: touch.clientY,
    }, title, path)
    longPressTimer.value = null
  }, LONG_PRESS_DURATION)
}

function cancelLongPress() {
  if (longPressTimer.value) {
    window.clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

function showMessage(title, message) {
  messageDialog.title = title
  messageDialog.message = message
  messageDialog.show = true
}

function showSnackbar(text) {
  snackbar.text = text
  snackbar.show = true
}

function syncCurrentUser() {
  currentUser.value = get_Current_User()
}

function resetForm() {
  if (!currentUser.value) return
  const fresh = createInitialForm(get_User_By_Id(currentUser.value.id))

  Object.assign(form, {
    ...fresh,
    contacts: { ...fresh.contacts },
  })
}

function selectAvatar(url) {
  form.profile_picture = url
}

function makeUniqueAvatarSeed() {
  return [
    "generated-avatar",
    currentUser.value?.id || "guest",
    form.first_name || "user",
    form.last_name || "profile",
    Date.now(),
    crypto.randomUUID(),
    Math.random().toString(36).slice(2, 14),
  ].join("-")
}

function resetToGeneratedAvatar() {
  form.profile_picture = createAvatar(makeUniqueAvatarSeed())
  showSnackbar("New unique avatar generated.")
}

function removeProfilePicture() {
  form.profile_picture = ""
  showSnackbar("Profile picture removed.")
}

async function handleImageUpload(event) {
  const file = event?.target?.files?.[0] || event?.[0]

  if (!file) return

  if (!file.type.startsWith("image/")) {
    showMessage("Invalid file", "Please upload an image file.")
    return
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    showMessage("File too large", "Please upload an image smaller than 2 MB.")
    return
  }

  try {
    rawUploadedImage.value = await fileToDataUrl(file)
    rawImageElement.value = await loadImageElement(rawUploadedImage.value)

    cropState.zoom = 1
    cropState.offsetX = 0
    cropState.offsetY = 0

    imageEditorDialog.value = true
    await nextTick()
    renderCropPreview()
  } catch (error) {
    showMessage("Upload failed", "Could not read the selected image.")
  }
}

function renderCropPreview() {
  if (!previewCanvas.value || !rawImageElement.value) return

  drawImageToCanvas(previewCanvas.value, rawImageElement.value, {
    zoom: cropState.zoom,
    offsetX: cropState.offsetX,
    offsetY: cropState.offsetY,
  })
}

function cancelImageEdit() {
  imageEditorDialog.value = false
  rawUploadedImage.value = null
  rawImageElement.value = null
}

async function applyCroppedImage() {
  if (!rawUploadedImage.value) return

  try {
    form.profile_picture = await cropAndResizeImage(rawUploadedImage.value, {
      size: 512,
      zoom: cropState.zoom,
      offsetX: cropState.offsetX,
      offsetY: cropState.offsetY,
    })

    cancelImageEdit()
    showSnackbar("Profile image updated.")
  } catch (error) {
    showMessage("Image error", "Could not crop and resize the image.")
  }
}

function saveChanges() {
  if (!currentUser.value?.id) {
    showMessage("Error", "No logged-in user found.")
    return false
  }

  const updated = update_User(currentUser.value.id, {
    first_name: String(form.first_name).trim(),
    last_name: String(form.last_name).trim(),
    gender: form.gender,
    date_of_birth: form.date_of_birth,
    state: String(form.state).trim(),
    city: String(form.city).trim(),
    receive_promos: Boolean(form.receive_promos),
    description: String(form.description).trim(),
    artist_type: computedIsArtist.value ? String(form.artist_type).trim() : "",
    profile_picture: form.profile_picture || "",
    contacts: {
      instagram: String(form.contacts.instagram).trim(),
      linkedin: String(form.contacts.linkedin).trim(),
      soundcloud: String(form.contacts.soundcloud).trim(),
      tiktok: String(form.contacts.tiktok).trim(),
      facebook: String(form.contacts.facebook).trim(),
      website: String(form.contacts.website).trim(),
      phone: String(form.contacts.phone).trim(),
      youtube: String(form.contacts.youtube).trim(),
    },
  })

  if (!updated) {
    showMessage("Save failed", "Could not update your profile.")
    return false
  }

  refresh_Artist_Statuses()
  syncCurrentUser()
  resetForm()
  showSnackbar("Changes saved successfully.")
  return true
}

function closePasswordDialog() {
  passwordDialog.value = false
  passwordForm.oldPassword = ""
  passwordForm.newPassword = ""
  passwordForm.repeatPassword = ""
  showOldPassword.value = false
  showNewPassword.value = false
  showRepeatPassword.value = false
}

function changePassword() {
  syncCurrentUser()

  if (!currentUser.value?.id) {
    showMessage("Error", "No logged-in user found.")
    return
  }

  if (String(passwordForm.oldPassword) !== String(currentUser.value.password)) {
    showMessage("Wrong password", "The old password is incorrect.")
    return
  }

  if (!passwordForm.newPassword || !passwordForm.repeatPassword) {
    showMessage("Missing fields", "Please fill all password fields.")
    return
  }

  if (passwordForm.newPassword.length < 3) {
    showMessage("Weak password", "The new password must be at least 3 characters.")
    return
  }

  if (passwordForm.newPassword !== passwordForm.repeatPassword) {
    showMessage("Mismatch", "The new passwords do not match.")
    return
  }

  const updated = update_User(currentUser.value.id, {
    password: passwordForm.newPassword,
  })

  if (!updated) {
    showMessage("Update failed", "Could not update the password.")
    return
  }

  syncCurrentUser()
  closePasswordDialog()
  showSnackbar("Password updated successfully.")
}

function goToDeleteReason() {
  deleteAccountDialog.value = false
  deleteReasonDialog.value = true
}

function goToDeleteFinalWarning() {
  if (!deleteReason.value) {
    showMessage("Missing reason", "Please choose a reason before continuing.")
    return
  }

  if (deleteReason.value === "other" && !String(deleteReasonOther.value).trim()) {
    showMessage("Missing reason", "Please write your reason.")
    return
  }

  deleteReasonDialog.value = false
  deleteFinalDialog.value = true
}

function confirmDeleteAccount() {
  if (!currentUser.value?.id) {
    showMessage("Error", "No logged-in user found.")
    return
  }

  const deleted = delete_User(currentUser.value.id)
  if (!deleted) {
    showMessage("Delete failed", "Could not delete the account.")
    return
  }

  set_Current_User(null)
  deleteFinalDialog.value = false
  router.push("/O_login")
}

function closeRouteMenu() {
  routeMenu.show = false
  routeMenu.x = 0
  routeMenu.y = 0
  routeMenu.title = ""
  routeMenu.path = ""
}

function openRouteMenu(event, title, path) {
  event.preventDefault()

  routeMenu.show = true
  routeMenu.x = event.clientX
  routeMenu.y = event.clientY
  routeMenu.title = title
  routeMenu.path = path
}

function resolveRouteHref(path) {
  try {
    return router.resolve(path).href
  } catch (error) {
    return path
  }
}

function smartNavigate(path) {
  closeRouteMenu()

  if (!path) return

  if (allowLeave.value || !isDirty.value) {
    router.push(path)
    return
  }

  pendingRoute.value = {
    fullPath: path,
  }
  leaveDialog.value = true
}

function navigateFromRouteMenu() {
  const targetPath = routeMenu.path
  closeRouteMenu()
  smartNavigate(targetPath)
}

function openRouteInNewTab() {
  const href = resolveRouteHref(routeMenu.path)
  closeRouteMenu()
  window.open(href, "_blank", "noopener,noreferrer")
}

function openRouteInNewWindow() {
  const href = resolveRouteHref(routeMenu.path)
  closeRouteMenu()
  window.open(
    href,
    "_blank",
    "noopener,noreferrer,width=1280,height=900,left=120,top=80"
  )
}

function handleBeforeUnload(event) {
  if (!isDirty.value || allowLeave.value) return
  event.preventDefault()
  event.returnValue = ""
}

function handleGlobalEscape(event) {
  if (event.key === "Escape" && routeMenu.show) {
    closeRouteMenu()
  }
}

onMounted(() => {
  loadSavedTheme()
  syncCurrentUser()
  window.addEventListener("beforeunload", handleBeforeUnload)
  window.addEventListener("keydown", handleGlobalEscape)
  window.addEventListener("storage", handleWindowStorage)
  window.addEventListener("focus", handleWindowFocus)
  document.addEventListener("visibilitychange", handleVisibilityChange)
  window.addEventListener("blassti-theme-change", loadSavedTheme)
})

onBeforeUnmount(() => {
  cancelLongPress()
  window.removeEventListener("beforeunload", handleBeforeUnload)
  window.removeEventListener("keydown", handleGlobalEscape)
  window.removeEventListener("storage", handleWindowStorage)
  window.removeEventListener("focus", handleWindowFocus)
  document.removeEventListener("visibilitychange", handleVisibilityChange)
  window.removeEventListener("blassti-theme-change", loadSavedTheme)
})

onBeforeRouteLeave((to) => {
  if (allowLeave.value || !isDirty.value) {
    return true
  }

  pendingRoute.value = to
  leaveDialog.value = true
  return false
})

function cancelLeave() {
  pendingRoute.value = null
  leaveDialog.value = false
}

function discardAndLeave() {
  allowLeave.value = true
  leaveDialog.value = false

  const target = pendingRoute.value
  pendingRoute.value = null

  if (target) {
    router.push(target.fullPath)
  }
}

function saveAndLeave() {
  const ok = saveChanges()
  if (!ok) return

  allowLeave.value = true
  leaveDialog.value = false

  const target = pendingRoute.value
  pendingRoute.value = null

  if (target) {
    router.push(target.fullPath)
  }
}
</script>

<style scoped>
.settings-app.theme-dark {
  color-scheme: dark;
}

.settings-app.theme-light {
  color-scheme: light;
}

.settings-shell {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}

.settings-container {
  position: relative;
  z-index: 2;
}

.settings-grid {
  align-items: start;
}

.settings-sidebar-col,
.settings-main-col {
  display: flex;
  flex-direction: column;
}

.hero-header {
  gap: 18px;
}

.hero-copy {
  flex: 1 1 420px;
  min-width: 0;
}

.hero-actions {
  flex: 0 1 360px;
  justify-content: flex-end;
}

.hero-action-btn {
  min-height: 44px;
}

.compact-profile-glance {
  position: relative;
  z-index: 2;
}

.compact-profile-card {
  overflow: hidden;
}

.compact-profile-card__top {
  align-items: center;
}

.compact-profile-card__identity {
  min-width: 0;
  flex: 1 1 auto;
}

.compact-profile-avatar {
  flex-shrink: 0;
}

.compact-profile-chip-row {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 2px;
}

.compact-profile-chip-row::-webkit-scrollbar {
  display: none;
}

.compact-profile-chip-row :deep(.v-chip) {
  flex: 0 0 auto;
  max-width: 100%;
}

.avatar-grid-row {
  row-gap: 12px;
}

.desktop-action-row {
  margin-top: -6px;
}

.mobile-save-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: max(12px, env(safe-area-inset-bottom));
  z-index: 40;
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 14px calc(14px + env(safe-area-inset-bottom));
  border-radius: 24px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
}

.mobile-save-bar.theme-light {
  background: rgba(255, 255, 255, 0.88);
}

.mobile-save-bar.theme-dark {
  background: rgba(12, 16, 24, 0.9);
}

.mobile-save-bar--dirty {
  border-color: rgba(var(--v-theme-primary), 0.22);
}

.mobile-save-bar__meta {
  min-width: 0;
  flex: 1 1 auto;
}

.mobile-save-bar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.mobile-save-bar__save {
  min-width: 108px;
}

.settings-shell__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.22;
  pointer-events: none;
  transition: opacity 0.35s ease, background 0.35s ease;
}

.settings-shell__glow--one {
  width: 320px;
  height: 320px;
  top: 40px;
  right: -80px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.35) 0%, rgba(var(--v-theme-primary), 0) 72%);
}

.settings-shell__glow--two {
  width: 260px;
  height: 260px;
  bottom: 20px;
  left: -90px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.2) 0%, rgba(var(--v-theme-primary), 0) 72%);
}

.settings-shell.theme-light {
  background:
    linear-gradient(180deg, rgba(245, 248, 255, 0.95) 0%, rgba(250, 252, 255, 1) 100%);
}

.settings-shell.theme-dark {
  background:
    radial-gradient(circle at top, rgba(31, 41, 55, 0.55) 0%, rgba(10, 14, 22, 0) 35%),
    linear-gradient(180deg, rgba(7, 11, 18, 1) 0%, rgba(10, 14, 22, 1) 100%);
}

.hero-card,
.section-card,
.sticky-action-card,
.dialog-card {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background-color 0.22s ease;
}

.hero-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.16);
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-surface), 0.94) 42%, rgba(var(--v-theme-surface), 0.98) 100%);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
}

.theme-dark .hero-card {
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.16) 0%, rgba(19, 24, 34, 0.96) 40%, rgba(14, 18, 28, 0.98) 100%);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

.section-card,
.sticky-action-card,
.dialog-card {
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.06);
}

.theme-dark .section-card,
.theme-dark .sticky-action-card {
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22);
}

.section-card:hover,
.sticky-action-card:hover,
.hero-card:hover {
  transform: translateY(-2px);
}

.hero-overline {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
}

.hero-title {
  letter-spacing: -0.02em;
}

.hero-subtitle {
  max-width: 720px;
}

.hero-chip {
  font-weight: 600;
}

.section-title {
  letter-spacing: -0.01em;
}

.action-btn {
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.save-btn {
  box-shadow: 0 12px 24px rgba(var(--v-theme-primary), 0.22);
}

.profile-picture-card .avatar-stage {
  position: relative;
  display: inline-flex;
  padding: 10px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-primary), 0.04));
}

.profile-avatar {
  border: 3px solid rgba(var(--v-theme-primary), 0.18);
}

.avatar-option {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.avatar-option:hover {
  transform: translateY(-3px) scale(1.01);
  border-color: rgba(var(--v-theme-primary), 0.48);
  box-shadow: 0 12px 18px rgba(var(--v-theme-primary), 0.12);
}

.selected-avatar {
  border: 2px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 12px 18px rgba(var(--v-theme-primary), 0.16);
}

.clean-input :deep(.v-field) {
  border-radius: 16px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.clean-input :deep(.v-field:hover) {
  box-shadow: 0 8px 20px rgba(var(--v-theme-primary), 0.08);
}

.clean-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.08);
}

.soft-btn {
  border-radius: 14px;
}

.promo-box {
  min-height: 56px;
  display: flex;
  align-items: center;
  padding-inline: 14px;
  border-radius: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface), 0.62);
}

.sticky-action-card {
  position: sticky;
  bottom: 18px;
  z-index: 3;
  background: rgba(var(--v-theme-surface), 0.9);
}

.theme-dark .sticky-action-card {
  background: rgba(16, 20, 30, 0.9);
}

.crop-canvas {
  width: 320px;
  height: 320px;
  max-width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #f5f5f5;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.route-context-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
}

.route-context-menu {
  position: fixed;
  min-width: 220px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface), 0.97);
  box-shadow: 0 22px 40px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}


.dialog-card.theme-light {
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.06);
}

.dialog-card.theme-dark {
  background: rgba(14, 18, 28, 0.98);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22);
}

.route-context-menu.theme-dark {
  background: rgba(18, 23, 34, 0.98);
}

.route-context-menu.theme-light {
  background: rgba(var(--v-theme-surface), 0.97);
}

.route-context-header {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  font-size: 0.92rem;
  font-weight: 700;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.route-context-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.18s ease, padding-left 0.18s ease;
}

.route-context-item:hover {
  background: rgba(var(--v-theme-primary), 0.09);
  padding-left: 18px;
}

.context-fade-enter-active,
.context-fade-leave-active {
  transition: opacity 0.16s ease;
}

.context-fade-enter-from,
.context-fade-leave-to {
  opacity: 0;
}

.elevated-snackbar.theme-light :deep(.v-snackbar__wrapper),
.elevated-snackbar.theme-dark :deep(.v-snackbar__wrapper) {
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.18);
}

@media (max-width: 1264px) {
  .hero-actions {
    flex: 1 1 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 960px) {
  .settings-grid--compact {
    row-gap: 20px;
  }

  .settings-sidebar-col {
    order: 1;
  }

  .settings-main-col {
    order: 2;
  }

  .sticky-action-card {
    position: static;
  }

  .sticky-action-card--compact {
    margin-bottom: 96px;
  }

  .mobile-save-bar {
    display: flex;
  }
}

@media (max-width: 760px) {
  .settings-shell__glow--one {
    width: 240px;
    height: 240px;
    top: 12px;
    right: -90px;
  }

  .settings-shell__glow--two {
    width: 220px;
    height: 220px;
    bottom: 90px;
    left: -110px;
  }

  .hero-card {
    border-radius: 26px !important;
  }

  .hero-title {
    font-size: clamp(1.8rem, 6vw, 2.25rem) !important;
    line-height: 1.05;
  }

  .hero-subtitle {
    font-size: 0.98rem;
  }

  .hero-chip-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .hero-chip-row :deep(.v-chip) {
    width: 100%;
    justify-content: center;
  }

  .hero-actions {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .hero-action-btn {
    width: 100%;
    min-width: 0;
  }

  .avatar-grid-row {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    margin: 0 -4px 12px;
    padding: 2px 4px 6px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .avatar-grid-row::-webkit-scrollbar {
    display: none;
  }

  .avatar-grid-row > [class*="v-col"] {
    flex: 0 0 96px;
    max-width: 96px;
    width: 96px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .promo-box {
    min-height: 60px;
  }

  .desktop-action-row {
    display: none !important;
  }
}

@media (max-width: 600px) {
  .settings-container {
    padding-bottom: 110px !important;
  }

  .hero-header,
  .hero-actions {
    width: 100%;
  }

  .hero-chip-row,
  .hero-actions {
    grid-template-columns: 1fr;
  }

  .section-card,
  .sticky-action-card,
  .dialog-card {
    border-radius: 22px !important;
  }

  .profile-picture-card .avatar-stage {
    padding: 8px;
    border-radius: 24px;
  }

  .mobile-save-bar {
    left: 10px;
    right: 10px;
    bottom: max(10px, env(safe-area-inset-bottom));
    flex-direction: column;
    align-items: stretch;
  }

  .mobile-save-bar__actions {
    width: 100%;
    justify-content: stretch;
  }

  .mobile-save-bar__actions .v-btn {
    flex: 1 1 0;
  }

  .route-context-menu {
    min-width: 200px;
    max-width: calc(100vw - 24px);
  }
}
</style>