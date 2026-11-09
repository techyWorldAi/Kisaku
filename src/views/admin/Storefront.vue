<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  LayoutTemplate,
  Plus,
  Settings2,
  Tag,
} from 'lucide-vue-next';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import {
  adminCategoriesAPI,
  getApiErrorMessage,
  storefrontAPI,
} from '../../services/api';
import type {
  Category,
  StoreSettings,
  StorefrontBanner,
  StorefrontBannerInput,
  StorefrontSection,
  StorefrontSectionInput,
} from '../../services/api';

type StorefrontTab = 'banners' | 'layout' | 'categories' | 'content';

const activeSection = ref<StorefrontTab>('banners');
const categories = ref<Category[]>([]);
const categoriesLoading = ref(true);
const categoriesError = ref('');
const loading = ref(true);
const storefrontLoaded = ref(false);
const saving = ref(false);
const publishing = ref(false);
const storefrontError = ref('');
const storefrontMessage = ref('');
const settings = ref<StoreSettings>({
  store_name: '',
  tagline: '',
  description: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  social: {},
});
const banners = ref<StorefrontBanner[]>([]);
const homepageSections = ref<StorefrontSection[]>([]);
const categoryForm = ref({ name: '', description: '' });
const bannerForm = ref<StorefrontBannerInput>({
  title: '',
  image_url: '',
  alt_text: '',
  link_url: '/shop',
  sort_order: 0,
  is_active: true,
});
const sectionForm = ref({ section_key: '', type: 'content', title: '', config: '{}' });

const sections: Array<{ id: StorefrontTab; label: string; icon: typeof ImagePlus }> = [
  { id: 'banners', label: 'Banners', icon: ImagePlus },
  { id: 'layout', label: 'Homepage layout', icon: LayoutTemplate },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'content', label: 'Store content', icon: Settings2 },
];

const socialLinks = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
];

async function loadCategories() {
  categoriesLoading.value = true;
  categoriesError.value = '';
  try {
    categories.value = await adminCategoriesAPI.getAll();
  } catch (error) {
    console.error('Failed to load categories for storefront management:', error);
    categoriesError.value = 'Categories could not be loaded. Check your connection and try again.';
  } finally {
    categoriesLoading.value = false;
  }
}

async function loadStorefront() {
  loading.value = true;
  storefrontError.value = '';
  try {
    const state = await storefrontAPI.getAdminState();
    settings.value = { ...settings.value, ...state.draft.settings, social: { ...state.draft.settings.social } };
    banners.value = state.draft.banners;
    homepageSections.value = state.draft.sections;
    storefrontLoaded.value = true;
  } catch (error) {
    console.error('Failed to load storefront draft:', error);
    storefrontError.value = getApiErrorMessage(error, 'Storefront settings could not be loaded.');
  } finally {
    loading.value = false;
  }
}

async function saveSettings() {
  saving.value = true;
  storefrontError.value = '';
  storefrontMessage.value = '';
  try {
    await storefrontAPI.saveSettings(settings.value);
    storefrontMessage.value = 'Store settings saved as draft.';
  } catch (error) {
    console.error('Failed to save storefront settings:', error);
    storefrontError.value = getApiErrorMessage(error, 'Store settings could not be saved.');
  } finally {
    saving.value = false;
  }
}

async function publishStorefront() {
  publishing.value = true;
  storefrontError.value = '';
  storefrontMessage.value = '';
  try {
    await storefrontAPI.publish();
    storefrontMessage.value = 'Storefront changes published.';
  } catch (error) {
    console.error('Failed to publish storefront:', error);
    storefrontError.value = getApiErrorMessage(error, 'Storefront could not be published.');
  } finally {
    publishing.value = false;
  }
}

async function uploadBannerImage(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  storefrontError.value = '';
  try {
    bannerForm.value.image_url = await storefrontAPI.uploadImage(file, 'banner');
  } catch (error) {
    console.error('Failed to upload storefront banner:', error);
    storefrontError.value = getApiErrorMessage(error, 'Banner image could not be uploaded.');
  } finally {
    input.value = '';
  }
}

async function uploadExistingBannerImage(event: Event, banner: StorefrontBanner) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  storefrontError.value = '';
  try {
    banner.image_url = await storefrontAPI.uploadImage(file, 'banner');
  } catch (error) {
    console.error('Failed to upload storefront banner:', error);
    storefrontError.value = getApiErrorMessage(error, 'Banner image could not be uploaded.');
  } finally {
    input.value = '';
  }
}

function updateSectionConfig(section: StorefrontSection, event: Event) {
  const value = (event.target as HTMLTextAreaElement).value;
  try {
    const config: unknown = JSON.parse(value);
    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      storefrontError.value = 'Section config must be a JSON object.';
      return;
    }
    section.config = config as Record<string, unknown>;
    storefrontError.value = '';
  } catch {
    storefrontError.value = 'Section config must be valid JSON.';
  }
}

async function createBanner() {
  storefrontError.value = '';
  try {
    const banner = await storefrontAPI.createBanner({ ...bannerForm.value, sort_order: banners.value.length });
    banners.value.push(banner);
    bannerForm.value = { title: '', image_url: '', alt_text: '', link_url: '/shop', sort_order: banners.value.length, is_active: true };
    storefrontMessage.value = 'Banner saved to draft.';
  } catch (error) {
    console.error('Failed to create storefront banner:', error);
    storefrontError.value = getApiErrorMessage(error, 'Banner could not be created.');
  }
}

async function saveBanner(banner: StorefrontBanner) {
  storefrontError.value = '';
  try {
    Object.assign(banner, await storefrontAPI.updateBanner(banner.id, banner));
    storefrontMessage.value = 'Banner updated.';
  } catch (error) {
    console.error('Failed to update storefront banner:', error);
    storefrontError.value = getApiErrorMessage(error, 'Banner could not be updated.');
  }
}

async function deleteBanner(banner: StorefrontBanner) {
  if (!window.confirm(`Delete the banner "${banner.title}"?`)) return;
  storefrontError.value = '';
  try {
    await storefrontAPI.deleteBanner(banner.id);
    banners.value = banners.value.filter((item) => item.id !== banner.id);
    storefrontMessage.value = 'Banner deleted.';
  } catch (error) {
    console.error('Failed to delete storefront banner:', error);
    storefrontError.value = getApiErrorMessage(error, 'Banner could not be deleted.');
  }
}

async function moveBanner(index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= banners.value.length) return;
  const reordered = [...banners.value];
  const current = reordered[index];
  const adjacent = reordered[nextIndex];
  if (!current || !adjacent) return;
  reordered[index] = adjacent;
  reordered[nextIndex] = current;
  try {
    await storefrontAPI.reorderBanners(reordered.map((banner) => banner.id));
    banners.value = reordered.map((banner, sort_order) => ({ ...banner, sort_order }));
  } catch (error) {
    console.error('Failed to reorder storefront banners:', error);
    storefrontError.value = getApiErrorMessage(error, 'Banners could not be reordered.');
  }
}

async function createSection() {
  storefrontError.value = '';
  try {
    const section: StorefrontSectionInput = {
      section_key: sectionForm.value.section_key.trim(),
      type: sectionForm.value.type.trim(),
      title: sectionForm.value.title.trim(),
      sort_order: homepageSections.value.length,
      is_visible: true,
      config: parseSectionConfig(sectionForm.value.config),
    };
    homepageSections.value.push(await storefrontAPI.createSection(section));
    sectionForm.value = { section_key: '', type: 'content', title: '', config: '{}' };
    storefrontMessage.value = 'Homepage section added to draft.';
  } catch (error) {
    console.error('Failed to create storefront section:', error);
    storefrontError.value = getApiErrorMessage(error, 'Section could not be created. Check that the config is valid JSON.');
  }
}

function parseSectionConfig(value: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Section config must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

async function saveSection(section: StorefrontSection) {
  storefrontError.value = '';
  try {
    Object.assign(section, await storefrontAPI.updateSection(section.id, section));
    storefrontMessage.value = 'Homepage section updated.';
  } catch (error) {
    console.error('Failed to update storefront section:', error);
    storefrontError.value = getApiErrorMessage(error, 'Section could not be updated.');
  }
}

async function deleteSection(section: StorefrontSection) {
  if (!window.confirm(`Delete the section "${section.title || section.section_key}"?`)) return;
  try {
    await storefrontAPI.deleteSection(section.id);
    homepageSections.value = homepageSections.value.filter((item) => item.id !== section.id);
    storefrontMessage.value = 'Homepage section deleted.';
  } catch (error) {
    console.error('Failed to delete storefront section:', error);
    storefrontError.value = getApiErrorMessage(error, 'Section could not be deleted.');
  }
}

async function moveSection(index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= homepageSections.value.length) return;
  const reordered = [...homepageSections.value];
  const current = reordered[index];
  const adjacent = reordered[nextIndex];
  if (!current || !adjacent) return;
  reordered[index] = adjacent;
  reordered[nextIndex] = current;
  try {
    await storefrontAPI.reorderSections(reordered.map((section) => section.id));
    homepageSections.value = reordered.map((section, sort_order) => ({ ...section, sort_order }));
  } catch (error) {
    console.error('Failed to reorder storefront sections:', error);
    storefrontError.value = getApiErrorMessage(error, 'Sections could not be reordered.');
  }
}

async function createCategory() {
  categoriesError.value = '';
  try {
    const category = await adminCategoriesAPI.create(categoryForm.value);
    categories.value = [...categories.value, category];
    categoryForm.value = { name: '', description: '' };
  } catch (error) {
    console.error('Failed to create category:', error);
    categoriesError.value = getApiErrorMessage(error, 'Category could not be created.');
  }
}

async function updateCategory(category: Category) {
  categoriesError.value = '';
  try {
    Object.assign(category, await adminCategoriesAPI.update(category.id, category));
  } catch (error) {
    console.error('Failed to update category:', error);
    categoriesError.value = getApiErrorMessage(error, 'Category could not be updated.');
  }
}

async function deleteCategory(category: Category) {
  if (!window.confirm(`Delete the category "${category.name}"?`)) return;
  categoriesError.value = '';
  try {
    await adminCategoriesAPI.delete(category.id);
    categories.value = categories.value.filter((item) => item.id !== category.id);
  } catch (error) {
    console.error('Failed to delete category:', error);
    categoriesError.value = getApiErrorMessage(error, 'Category could not be deleted.');
  }
}

onMounted(() => {
  void loadStorefront();
  void loadCategories();
});
</script>

<template>
  <div class="storefront-admin">
    <AdminSidebar />

    <div class="storefront-content">
      <header class="storefront-topbar">
        <div>Administration <span>/</span> Storefront</div>
        <div class="topbar-actions">
          <span class="api-status">{{ loading ? 'Loading draft…' : storefrontLoaded ? 'Draft connected' : 'Not connected' }}</span>
          <button type="button" class="primary-button" :disabled="loading || publishing" @click="publishStorefront">
            {{ publishing ? 'Publishing…' : 'Publish changes' }}
          </button>
        </div>
      </header>

      <main class="storefront-main">
        <section class="page-heading">
          <div>
            <p class="page-eyebrow">STORE EXPERIENCE</p>
            <h1>Storefront management</h1>
            <p class="page-subtitle">Manage the published store experience. Edits are saved as a draft until published.</p>
          </div>
        </section>

        <div v-if="storefrontError" class="error-state" role="alert">{{ storefrontError }}</div>
        <div v-if="storefrontMessage" class="success-state" role="status">{{ storefrontMessage }}</div>
        <div v-if="loading" class="empty-state" role="status">Loading storefront draft…</div>
        <div v-else-if="!storefrontLoaded" class="error-state" role="alert">
          <p>Storefront management is unavailable until the draft loads successfully.</p>
          <button type="button" @click="loadStorefront">Retry</button>
        </div>

        <div v-if="storefrontLoaded" class="storefront-workspace">
        <div class="setup-notice">
          <div class="notice-icon"><Settings2 :size="19" /></div>
          <div>
            <strong>Draft and publication are separate</strong>
            <p>Save changes to the draft, then publish when the storefront is ready.</p>
          </div>
        </div>

        <nav class="section-tabs" aria-label="Storefront management sections">
          <button
            v-for="section in sections"
            :key="section.id"
            type="button"
            :class="{ active: activeSection === section.id }"
            :aria-current="activeSection === section.id ? 'page' : undefined"
            @click="activeSection = section.id"
          >
            <component :is="section.icon" :size="17" />
            {{ section.label }}
          </button>
        </nav>

        <section v-if="activeSection === 'banners'" class="management-panel">
          <div class="panel-heading">
            <div>
              <h2>Campaign banners</h2>
              <p>Manage image banners displayed on the public storefront.</p>
            </div>
          </div>

          <div class="banner-grid">
            <article v-for="(banner, index) in banners" :key="banner.id" class="banner-card">
              <div class="banner-preview current-banner">
                <img :src="banner.image_url" :alt="banner.alt_text || banner.title" />
              </div>
              <div class="banner-details">
                <div class="card-title-row">
                  <h3>{{ banner.title || 'Untitled banner' }}</h3>
                  <label class="toggle-label">
                    <input v-model="banner.is_active" type="checkbox" />
                    Active
                  </label>
                </div>
                <label class="field-label">Title</label>
                <input v-model.trim="banner.title" type="text" maxlength="255" />
                <label class="field-label">Alternative text</label>
                <input v-model.trim="banner.alt_text" type="text" maxlength="255" />
                <label class="field-label">Destination link</label>
                <input v-model.trim="banner.link_url" type="text" placeholder="/shop" />
                <label class="field-label">Image URL</label>
                <input v-model.trim="banner.image_url" type="url" required />
                <label class="secondary-button upload-button">
                  <ImagePlus :size="16" />
                  Upload replacement image
                  <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" @change="uploadExistingBannerImage($event, banner)" />
                </label>
                <div class="row-actions">
                  <button type="button" class="secondary-button" :disabled="index === 0" @click="moveBanner(index, -1)"><ArrowUp :size="15" /> Up</button>
                  <button type="button" class="secondary-button" :disabled="index === banners.length - 1" @click="moveBanner(index, 1)"><ArrowDown :size="15" /> Down</button>
                  <button type="button" class="primary-button" @click="saveBanner(banner)">Save</button>
                  <button type="button" class="danger-button" @click="deleteBanner(banner)">Delete</button>
                </div>
              </div>
            </article>

            <form class="upload-placeholder new-banner-form" @submit.prevent="createBanner">
              <div class="upload-icon"><ImagePlus :size="25" /></div>
              <h3>Add a promotional banner</h3>
              <label>Title<input v-model.trim="bannerForm.title" required maxlength="255" /></label>
              <label>Alternative text<input v-model.trim="bannerForm.alt_text" maxlength="255" /></label>
              <label>Destination link<input v-model.trim="bannerForm.link_url" placeholder="/shop" /></label>
              <label>Image URL<input v-model.trim="bannerForm.image_url" type="url" required /></label>
              <label class="secondary-button upload-button">
                <ImagePlus :size="16" /> Upload banner image
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" @change="uploadBannerImage" />
              </label>
              <button type="submit" class="primary-button">Add banner</button>
            </form>
          </div>
          <p v-if="!banners.length" class="empty-state">No banners have been added to the draft yet.</p>
        </section>

        <section v-else-if="activeSection === 'layout'" class="management-panel">
          <div class="panel-heading">
            <div>
              <h2>Homepage layout</h2>
              <p>Set section visibility, content type, and display order.</p>
            </div>
          </div>

          <div class="layout-list">
            <article v-for="(section, index) in homepageSections" :key="section.id" class="layout-row">
              <div class="layout-order">
                <button type="button" :aria-label="`Move ${section.title || section.section_key} up`" :disabled="index === 0" @click="moveSection(index, -1)">
                  <ArrowUp :size="16" />
                </button>
                <button type="button" :aria-label="`Move ${section.title || section.section_key} down`" :disabled="index === homepageSections.length - 1" @click="moveSection(index, 1)">
                  <ArrowDown :size="16" />
                </button>
              </div>
              <div class="layout-copy">
                <label>Section key<input v-model.trim="section.section_key" /></label>
                <label>Type<input v-model.trim="section.type" /></label>
                <label>Title<input v-model.trim="section.title" /></label>
                <label>Config JSON<textarea :value="JSON.stringify(section.config, null, 2)" rows="2" @change="updateSectionConfig(section, $event)" /></label>
              </div>
              <label class="toggle-label"><input v-model="section.is_visible" type="checkbox" /> Visible</label>
              <div class="row-actions">
                <button type="button" class="primary-button" @click="saveSection(section)">Save</button>
                <button type="button" class="danger-button" @click="deleteSection(section)">Delete</button>
              </div>
            </article>
          </div>
          <form class="section-form" @submit.prevent="createSection">
            <h3>Add homepage section</h3>
            <label>Section key<input v-model.trim="sectionForm.section_key" required placeholder="e.g. featured_products" /></label>
            <label>Type<input v-model.trim="sectionForm.type" required placeholder="e.g. products" /></label>
            <label>Title<input v-model.trim="sectionForm.title" /></label>
            <label>Config JSON<textarea v-model="sectionForm.config" rows="3" /></label>
            <button type="submit" class="primary-button"><Plus :size="16" /> Add section</button>
          </form>
        </section>

        <section v-else-if="activeSection === 'categories'" class="management-panel">
          <div class="panel-heading">
            <div>
              <h2>Product categories</h2>
              <p>Create, edit, and remove categories used by products.</p>
            </div>
          </div>

          <form class="category-form" @submit.prevent="createCategory">
            <label><span>Category name</span><input v-model.trim="categoryForm.name" required maxlength="255" placeholder="For example, Home & Kitchen" /></label>
            <label><span>Description</span><input v-model.trim="categoryForm.description" placeholder="Short description for shoppers" /></label>
            <button type="submit" class="primary-button"><Plus :size="16" /> Add category</button>
          </form>

          <div v-if="categoriesLoading" class="empty-state">Loading categories…</div>
          <div v-else-if="categoriesError" class="error-state" role="alert">
            <p>{{ categoriesError }}</p>
            <button type="button" @click="loadCategories">Retry</button>
          </div>
          <div v-else-if="categories.length" class="category-list">
            <article v-for="category in categories" :key="category.id" class="category-row">
              <div class="category-mark"><Tag :size="17" /></div>
              <div class="category-edit">
                <input v-model.trim="category.name" aria-label="Category name" required />
                <input v-model="category.description" aria-label="Category description" />
              </div>
              <button type="button" class="secondary-button" @click="updateCategory(category)">Save</button>
              <button type="button" class="danger-button" @click="deleteCategory(category)">Delete</button>
            </article>
          </div>
          <div v-else class="empty-state">No categories are available.</div>
        </section>

        <section v-else class="management-panel">
          <div class="panel-heading">
            <div>
              <h2>Store content and settings</h2>
              <p>Update the store’s public information and contact details.</p>
            </div>
          </div>

          <div class="content-fields">
            <label><span>Store name</span><input v-model.trim="settings.store_name" required maxlength="255" /></label>
            <label><span>Tagline</span><input v-model.trim="settings.tagline" maxlength="255" /></label>
            <label><span>Homepage description</span><textarea v-model="settings.description" rows="3" /></label>
            <label><span>Contact email</span><input v-model.trim="settings.contact_email" type="email" /></label>
            <label><span>Contact phone</span><input v-model.trim="settings.contact_phone" type="tel" /></label>
            <label><span>Contact address</span><input v-model.trim="settings.contact_address" /></label>
            <label v-for="social in socialLinks" :key="social.key">
              <span>{{ social.label }} URL</span>
              <input v-model="settings.social[social.key]" type="url" :placeholder="`https://${social.key}.com/…`" />
            </label>
          </div>
          <div class="content-actions">
            <button type="button" class="primary-button" :disabled="saving" @click="saveSettings">{{ saving ? 'Saving…' : 'Save draft settings' }}</button>
            <span>Publishing makes the saved draft visible to shoppers.</span>
          </div>
        </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.storefront-admin {
  min-height: 100vh;
  background: #f5f7fa;
}

.storefront-content {
  min-width: 0;
  min-height: 100vh;
  margin-left: 246px;
}

.storefront-topbar {
  position: sticky;
  z-index: 20;
  top: 0;
  display: flex;
  min-height: 62px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px clamp(18px, 3vw, 42px);
  border-bottom: 1px solid #e3e8ee;
  background: rgb(255 255 255 / 94%);
  color: #64748b;
  font-size: 0.8rem;
  backdrop-filter: blur(12px);
}

.storefront-topbar span:not(.api-status) {
  margin: 0 7px;
  color: #a0acb9;
}

.api-status,
.preview-badge,
.read-only-label {
  display: inline-flex;
  align-items: center;
  padding: 6px 9px;
  border: 1px solid #fed7aa;
  border-radius: 999px;
  background: #fff7ed;
  color: #9a4c06;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
}

.topbar-actions,
.row-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.success-state {
  margin-bottom: 14px;
  padding: 11px 14px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  background: #ecfdf5;
  color: #166534;
  font-size: 0.82rem;
}

.danger-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  padding: 0 11px;
  border: 1px solid #fecaca;
  border-radius: 5px;
  background: #fff;
  color: #b42318;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 650;
  cursor: pointer;
}

.storefront-main {
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 30px clamp(18px, 3vw, 42px) 52px;
}

.page-heading {
  margin-bottom: 22px;
}

.page-eyebrow {
  margin: 0 0 8px;
  color: #a65c11;
  font-size: 0.67rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.page-heading h1 {
  margin: 0;
  color: #102a43;
  font-size: clamp(1.45rem, 3vw, 1.8rem);
  letter-spacing: -0.035em;
}

.page-subtitle,
.panel-heading p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.55;
}

.setup-notice {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #cfe0ee;
  border-radius: 8px;
  background: #f0f7fc;
  color: #153c5b;
}

.notice-icon,
.upload-icon,
.category-mark {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #e0edf7;
  color: #075397;
}

.notice-icon {
  width: 36px;
  height: 36px;
}

.setup-notice strong {
  font-size: 0.9rem;
}

.setup-notice p {
  margin: 5px 0 0;
  color: #526579;
  font-size: 0.8rem;
  line-height: 1.55;
}

.section-tabs {
  display: flex;
  overflow-x: auto;
  gap: 5px;
  margin-bottom: 14px;
  padding: 4px;
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  background: #fff;
}

.section-tabs button {
  display: inline-flex;
  min-height: 40px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 13px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #526579;
  font-size: 0.8rem;
  font-weight: 650;
  cursor: pointer;
}

.section-tabs button.active {
  background: #eaf2f8;
  color: #075397;
}

.management-panel {
  padding: 22px;
  border: 1px solid #e3e8ee;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 4px 14px rgb(16 44 73 / 3%);
}

.panel-heading,
.card-title-row,
.content-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.panel-heading {
  margin-bottom: 19px;
}

.panel-heading h2 {
  margin: 0;
  color: #102a43;
  font-size: 1.08rem;
}

.panel-heading p {
  font-size: 0.79rem;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid #075397;
  border-radius: 5px;
  background: #075397;
  color: #fff;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
}

.secondary-button {
  border-color: #cbd5e1;
  background: #fff;
  color: #526579;
}

button:disabled,
input:disabled,
textarea:disabled {
  cursor: not-allowed;
  opacity: 0.64;
}

.banner-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.banner-card,
.upload-placeholder {
  overflow: hidden;
  border: 1px solid #e3e8ee;
  border-radius: 7px;
}

.banner-preview {
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f3f6f9;
}

.current-banner img {
  display: block;
  width: 100%;
  max-height: 210px;
  object-fit: contain;
}

.banner-details {
  display: grid;
  gap: 8px;
  padding: 15px;
}

.card-title-row {
  align-items: center;
  margin-bottom: 5px;
}

.card-title-row h3,
.upload-placeholder h3 {
  margin: 0;
  color: #102a43;
  font-size: 0.88rem;
}

.card-title-row p,
.upload-placeholder p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.5;
}

.status-badge,
.section-enabled {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 999px;
  background: #ecfdf3;
  color: #167445;
  font-size: 0.67rem;
  font-weight: 700;
  white-space: nowrap;
}

.field-label,
.category-form label span,
.content-fields label span {
  color: #526579;
  font-size: 0.72rem;
  font-weight: 650;
}

.banner-details input,
.category-form input,
.content-fields input,
.content-fields textarea {
  width: 100%;
  min-height: 38px;
  padding: 9px 10px;
  border: 1px solid #d5dee7;
  border-radius: 5px;
  background: #f8fafc;
  color: #334155;
  font: inherit;
  font-size: 0.78rem;
}

.banner-details .secondary-button {
  margin-top: 5px;
}

.upload-button {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.upload-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.new-banner-form {
  display: grid;
  align-content: start;
  justify-items: stretch;
  gap: 10px;
  text-align: left;
}

.new-banner-form h3,
.section-form h3 {
  margin: 0;
}

.new-banner-form > label:not(.upload-button),
.section-form label,
.layout-copy label {
  display: grid;
  gap: 5px;
  color: #526579;
  font-size: 0.72rem;
  font-weight: 650;
}

.new-banner-form input:not([type="file"]),
.section-form input,
.section-form textarea,
.layout-copy input,
.layout-copy textarea,
.category-edit input {
  width: 100%;
  min-width: 0;
  min-height: 36px;
  padding: 8px;
  border: 1px solid #d5dee7;
  border-radius: 5px;
  font: inherit;
  font-size: 0.78rem;
}

.new-banner-form .upload-button input {
  width: 1px;
}

.upload-placeholder {
  display: flex;
  min-height: 330px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border-style: dashed;
  text-align: center;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 14px;
}

.upload-placeholder p {
  max-width: 280px;
  margin-bottom: 16px;
}

.upload-placeholder small {
  margin-top: 12px;
  color: #78889a;
  font-size: 0.68rem;
  line-height: 1.45;
}

.layout-list,
.category-list {
  border: 1px solid #e3e8ee;
  border-radius: 7px;
}

.layout-row,
.category-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 13px;
  padding: 14px;
  border-bottom: 1px solid #edf0f3;
}

.layout-row:last-child,
.category-row:last-child {
  border-bottom: 0;
}

.layout-order {
  display: grid;
  flex: 0 0 auto;
  gap: 3px;
}

.layout-order button {
  display: inline-flex;
  width: 27px;
  height: 25px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e1e7ed;
  border-radius: 4px;
  background: #fff;
  color: #64748b;
}

.layout-copy,
.category-row > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.layout-copy {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.layout-copy label:last-child {
  grid-column: 1 / -1;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #526579;
  font-size: 0.73rem;
  white-space: nowrap;
}

.category-edit {
  display: grid;
  flex: 1;
  gap: 6px;
}

.section-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #e3e8ee;
  border-radius: 7px;
  background: #f8fafc;
}

.section-form h3,
.section-form button {
  grid-column: 1 / -1;
}

.layout-copy strong,
.category-row strong {
  color: #20394f;
  font-size: 0.82rem;
}

.layout-copy p,
.category-row p {
  margin: 4px 0 0;
  color: #718096;
  font-size: 0.73rem;
  line-height: 1.45;
}

.section-position {
  color: #718096;
  font-size: 0.69rem;
  white-space: nowrap;
}

.panel-footnote {
  margin: 13px 0 0;
  color: #718096;
  font-size: 0.72rem;
}

.category-form,
.content-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
  margin-bottom: 18px;
  padding: 15px;
  border: 1px solid #e3e8ee;
  border-radius: 7px;
  background: #f8fafc;
}

.category-form label,
.content-fields label {
  display: grid;
  min-width: 0;
  gap: 7px;
}

.category-form .secondary-button {
  align-self: end;
}

.category-mark {
  width: 36px;
  height: 36px;
}

.read-only-label {
  border-color: #e1e7ed;
  background: #f8fafc;
  color: #64748b;
}

.empty-state,
.error-state {
  padding: 24px 12px;
  color: #64748b;
  font-size: 0.82rem;
  text-align: center;
}

.error-state {
  color: #b42318;
}

.error-state p {
  margin: 0 0 10px;
}

.error-state button {
  padding: 7px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  background: #fff;
  color: #075397;
  font-weight: 650;
}

.content-fields {
  padding: 0;
  border: 0;
  background: transparent;
}

.content-fields label:nth-child(2) {
  grid-row: span 2;
}

.content-fields textarea {
  resize: vertical;
}

.content-actions {
  align-items: center;
}

.content-actions span {
  color: #718096;
  font-size: 0.72rem;
}

@media (max-width: 800px) {
  .storefront-content {
    margin-left: 0;
  }

  .storefront-topbar {
    padding-left: 64px;
  }
}

@media (max-width: 600px) {
  .storefront-main {
    padding-top: 22px;
  }

  .management-panel {
    padding: 15px;
  }

  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .banner-grid,
  .category-form,
  .content-fields,
  .section-form {
    grid-template-columns: 1fr;
  }

  .upload-placeholder {
    min-height: 250px;
  }

  .layout-row,
  .category-row {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px;
  }

  .layout-copy {
    flex-basis: calc(100% - 55px);
  }

  .category-row > div:nth-child(2) {
    flex-basis: calc(100% - 60px);
  }

  .layout-copy {
    grid-template-columns: 1fr;
  }

  .layout-copy label:last-child {
    grid-column: auto;
  }

  .content-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
