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
  uploadAPI,
} from '../../services/api';
import type {
  Category,
  CategoryInput,
  StoreSettings,
  StorefrontBanner,
  StorefrontBannerInput,
  StorefrontSection,
  StorefrontSectionInput,
} from '../../services/api';

type StorefrontTab = 'banners' | 'layout' | 'categories' | 'content';

interface SectionConfigField {
  id: string;
  label: string;
  inputType: 'text' | 'number' | 'checkbox' | 'select' | 'textarea' | 'color';
  options?: Array<string | { value: string; label: string }>;
}

const activeSection = ref<StorefrontTab>('banners');
const categories = ref<Category[]>([]);
const categoriesLoading = ref(true);
const categoriesError = ref('');
const loading = ref(true);
const storefrontLoaded = ref(false);
const saving = ref(false);
const publishing = ref(false);
const bannerUploading = ref(false);
const assetUploading = ref(false);
const bannerProductRowId = ref<number | null>(null);
const categoryImageUploads = ref(new Set<string>());
const uploadingBannerIds = ref<number[]>([]);
const storefrontError = ref('');
const storefrontMessage = ref('');
const settings = ref<StoreSettings>({
  store_name: '',
  tagline: '',
  description: '',
  contact_email: '',
  contact_phone: '',
  whatsapp: '',
  address: '',
  opening_hours: '',
  announcement: '',
  footer_text: '',
  logo_url: '',
  favicon_url: '',
  social: {},
});
const banners = ref<StorefrontBanner[]>([]);
const homepageSections = ref<StorefrontSection[]>([]);
const categoryForm = ref<CategoryInput>({
  name: '',
  description: '',
  image_url: '',
  listing_banner_image_url: '',
});
const bannerForm = ref<StorefrontBannerInput>({
  title: '',
  image_url: '',
  alt_text: '',
  link_url: '/shop',
  sort_order: 0,
  is_active: true,
});
const sectionForm = ref({
  section_key: '',
  promo_target: '',
  type: 'category_grid',
  title: '',
  config: { limit: 8, show_descriptions: false } as Record<string, unknown>,
});

const sectionTypes = [
  { value: 'banner_carousel', label: 'Banner carousel' },
  { value: 'category_grid', label: 'Category grid' },
  { value: 'product_row', label: 'Product row' },
  { value: 'promo', label: 'Promotion' },
  { value: 'rich_text', label: 'Text content' },
  { value: 'feature_list', label: 'Feature list' },
];

const sections: Array<{ id: StorefrontTab; label: string; icon: typeof ImagePlus }> = [
  { id: 'banners', label: 'Banners', icon: ImagePlus },
  { id: 'layout', label: 'Homepage layout', icon: LayoutTemplate },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'content', label: 'Store content', icon: Settings2 },
];

const socialLinks = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'linkedin', label: 'LinkedIn' },
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
    const savedSettings = state.draft.settings;
    settings.value = {
      store_name: savedSettings.store_name,
      tagline: savedSettings.tagline ?? '',
      description: savedSettings.description ?? '',
      contact_email: savedSettings.contact_email ?? '',
      contact_phone: savedSettings.contact_phone ?? '',
      whatsapp: savedSettings.whatsapp ?? '',
      address: savedSettings.address ?? '',
      opening_hours: savedSettings.opening_hours ?? '',
      announcement: savedSettings.announcement ?? '',
      footer_text: savedSettings.footer_text ?? '',
      logo_url: savedSettings.logo_url ?? '',
      favicon_url: savedSettings.favicon_url ?? '',
      social: { ...savedSettings.social },
    };
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

function defaultSectionConfig(type: string): Record<string, unknown> {
  switch (type) {
    case 'banner_carousel':
      return { autoplay: true, interval_ms: 5000 };
    case 'category_grid':
      return { limit: 8, show_descriptions: false };
    case 'product_row':
      return { source: 'newest', limit: 8 };
    case 'promo':
      return {
        text: '',
        button_label: '',
        link_url: '/shop',
        image_url: '',
        background_color: '#102C49',
        text_color: '#FFFFFF',
      };
    case 'rich_text':
      return { body: '' };
    case 'feature_list':
      return { items: [{ icon: 'check', title: '', text: '' }] };
    default:
      return {};
  }
}

function changeSectionType(section: StorefrontSection, type: string) {
  if (type !== 'promo' && /^(category|product-row)-\d+$/.test(section.section_key)) {
    section.section_key = `section-${section.id}`;
  }
  section.type = type;
  section.config = defaultSectionConfig(type);
}

function changeNewSectionType(type: string) {
  if (type !== 'promo' && sectionForm.value.promo_target) {
    sectionForm.value.section_key = '';
  }
  sectionForm.value.type = type;
  sectionForm.value.config = defaultSectionConfig(type);
  if (type !== 'promo') {
    sectionForm.value.promo_target = '';
  }
}

function promoTargetFromSectionKey(sectionKey: string): string {
  const categoryMatch = /^category-(\d+)$/.exec(sectionKey);
  if (categoryMatch) return `category:${categoryMatch[1]}`;
  const productRowMatch = /^product-row-(\d+)$/.exec(sectionKey);
  if (productRowMatch) return `product-row:${productRowMatch[1]}`;
  return '';
}

function setPromoTarget(section: StorefrontSection, target: string) {
  if (target.startsWith('category:')) section.section_key = `category-${target.slice('category:'.length)}`;
  else if (target.startsWith('product-row:')) section.section_key = `product-row-${target.slice('product-row:'.length)}`;
  else if (/^(category|product-row)-\d+$/.test(section.section_key)) section.section_key = `promotion-${section.id}`;
}

function setNewPromoTarget(target: string) {
  sectionForm.value.promo_target = target;
  sectionForm.value.section_key = target.startsWith('category:')
    ? `category-${target.slice('category:'.length)}`
    : target.startsWith('product-row:')
      ? `product-row-${target.slice('product-row:'.length)}`
      : '';
}

function isLinkedPromoKey(sectionKey: string) {
  return /^(category|product-row)-\d+$/.test(sectionKey);
}

function productRowBanner(sectionId: number) {
  return homepageSections.value.find((section) => (
    section.type === 'promo' && section.section_key === `product-row-${sectionId}`
  ));
}

async function toggleProductRowBanner(productRow: StorefrontSection) {
  storefrontError.value = '';
  storefrontMessage.value = '';
  bannerProductRowId.value = productRow.id;
  try {
    const existing = productRowBanner(productRow.id);
    if (existing) {
      const enabled = !existing.is_visible;
      const updated = await storefrontAPI.updateSection(existing.id, {
        section_key: existing.section_key,
        type: existing.type,
        title: existing.title,
        sort_order: existing.sort_order,
        is_visible: enabled,
        config: normalizedSectionConfig(existing.type, existing.config),
      });
      Object.assign(existing, updated);
      storefrontMessage.value = `Right-side banner ${enabled ? 'enabled' : 'disabled'} for "${productRow.title || productRow.section_key}".`;
      return;
    }

    const config = {
      text: 'Browse the full catalogue and find the right products for your home and day.',
      button_label: 'Explore products',
      link_url: '/shop',
      image_url: '',
      background_color: '#102C49',
      text_color: '#FFFFFF',
    };
    const created = await storefrontAPI.createSection({
      section_key: `product-row-${productRow.id}`,
      type: 'promo',
      title: 'Everyday essentials, all in one place.',
      sort_order: homepageSections.value.length,
      is_visible: true,
      config,
    });
    homepageSections.value.push(created);
    storefrontMessage.value = `Right-side banner added to "${productRow.title || productRow.section_key}". Edit its text or image, then publish your changes.`;
  } catch (error) {
    console.error('Failed to enable product-row banner:', error);
    storefrontError.value = getApiErrorMessage(error, 'Right-side banner could not be enabled.');
  } finally {
    bannerProductRowId.value = null;
  }
}

function sectionConfigFields(type: string): SectionConfigField[] {
  switch (type) {
    case 'banner_carousel':
      return [
        { id: 'autoplay', label: 'Automatically rotate banners', inputType: 'checkbox' },
        { id: 'interval_ms', label: 'Rotation interval (milliseconds)', inputType: 'number' },
      ];
    case 'category_grid':
      return [
        { id: 'limit', label: 'Number of categories (1–24)', inputType: 'number' },
        { id: 'show_descriptions', label: 'Show category descriptions', inputType: 'checkbox' },
      ];
    case 'product_row':
      return [
        { id: 'source', label: 'Products to show', inputType: 'select', options: ['newest', 'featured', 'category'] },
        {
          id: 'category_id',
          label: 'Product category',
          inputType: 'select',
          options: categories.value.map((category) => ({ value: String(category.id), label: category.name })),
        },
        { id: 'limit', label: 'Number of products (1–24)', inputType: 'number' },
      ];
    case 'promo':
      return [
        { id: 'text', label: 'Promotion text (up to 300 characters)', inputType: 'textarea' },
        { id: 'button_label', label: 'Button label (up to 40 characters)', inputType: 'text' },
        { id: 'link_url', label: 'Button destination', inputType: 'text' },
        { id: 'image_url', label: 'Image URL', inputType: 'text' },
        { id: 'background_color', label: 'Promotion background color', inputType: 'color' },
        { id: 'text_color', label: 'Promotion text color', inputType: 'color' },
      ];
    case 'rich_text':
      return [{ id: 'body', label: 'Text (up to 5000 characters)', inputType: 'textarea' }];
    case 'feature_list':
      return [{ id: 'items', label: 'Features (JSON list, 1–8 items)', inputType: 'textarea' }];
    default:
      return [];
  }
}

function configFieldValue(config: Record<string, unknown>, key: string): string | number | boolean {
  const value = config[key];
  if (key === 'items') return JSON.stringify(value ?? [], null, 2);
  if (key === 'background_color' && typeof value !== 'string') return '#102C49';
  if (key === 'text_color' && typeof value !== 'string') return '#FFFFFF';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return '';
}

function updateConfigField(config: Record<string, unknown>, key: string, field: SectionConfigField, event: Event) {
  const target = event.target;
  if (field.inputType === 'checkbox' && target instanceof HTMLInputElement) {
    config[key] = target.checked;
  } else if (field.inputType === 'number' && target instanceof HTMLInputElement) {
    config[key] = target.value === '' ? '' : Number(target.value);
  } else if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    if (key === 'items') {
      try {
        config[key] = JSON.parse(target.value) as unknown;
        storefrontError.value = '';
      } catch {
        storefrontError.value = 'Features must be a valid JSON list.';
      }
    } else if (key === 'category_id') {
      config[key] = Number(target.value);
    } else {
      config[key] = target.value;
    }
  }
}

function normalizePromoColor(value: unknown): unknown {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value !== 'string') return value;
  const color = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${[...color.slice(1)].map((digit) => `${digit}${digit}`).join('')}`.toUpperCase();
  }
  return color;
}

function normalizedSectionConfig(type: string, config: Record<string, unknown>): Record<string, unknown> {
  const configKeys: Record<string, string[]> = {
    banner_carousel: ['autoplay', 'interval_ms'],
    category_grid: ['limit', 'show_descriptions'],
    product_row: ['source', 'limit', 'category_id'],
    promo: ['text', 'button_label', 'link_url', 'image_url', 'background_color', 'text_color'],
    rich_text: ['body'],
    feature_list: ['items'],
  };
  const allowedKeys = configKeys[type] ?? [];
  const normalized = Object.fromEntries(allowedKeys
    .filter((key) => key in config)
    .map((key) => [
      key,
      type === 'promo' && (key === 'background_color' || key === 'text_color')
        ? normalizePromoColor(config[key])
        : config[key],
    ])
    .filter(([, value]) => value !== undefined));
  if (type === 'product_row' && normalized.source !== 'category') delete normalized.category_id;
  return normalized;
}

function validateSectionConfig(type: string, config: Record<string, unknown>): string {
  const limit = config.limit;
  if (['category_grid', 'product_row'].includes(type)
    && (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 24)) {
    return 'Choose a whole number between 1 and 24 for the item limit.';
  }
  if (type === 'banner_carousel') {
    const interval = config.interval_ms;
    if (typeof interval !== 'number' || !Number.isInteger(interval) || interval < 2000 || interval > 30000) {
      return 'Banner rotation interval must be between 2000 and 30000 milliseconds.';
    }
  }
  if (type === 'product_row' && config.source === 'category') {
    const categoryId = config.category_id;
    if (typeof categoryId !== 'number' || !Number.isInteger(categoryId) || !categories.value.some((category) => category.id === categoryId)) {
      return 'Choose a valid category ID for this product row.';
    }
  }
  if (type === 'promo' && (typeof config.text !== 'string' || !config.text.trim() || config.text.length > 300)) {
    return 'Promotion text is required and must be 300 characters or fewer.';
  }
  if (type === 'promo') {
    for (const key of ['background_color', 'text_color']) {
      const color = config[key];
      if (color !== undefined && (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color))) {
        return 'Promotion colors must be valid 6-digit hex colors.';
      }
    }
  }
  if (type === 'rich_text' && (typeof config.body !== 'string' || !config.body.trim() || config.body.length > 5000)) {
    return 'Text content is required and must be 5000 characters or fewer.';
  }
  if (type === 'feature_list') {
    const items = config.items;
    if (!Array.isArray(items) || items.length < 1 || items.length > 8 || items.some((item) => {
      if (typeof item !== 'object' || item === null) return true;
      const feature = item as Record<string, unknown>;
      return typeof feature.title !== 'string' || !feature.title.trim() || feature.title.length > 80
        || (feature.icon !== undefined && (typeof feature.icon !== 'string' || feature.icon.length > 40))
        || (feature.text !== undefined && (typeof feature.text !== 'string' || feature.text.length > 200));
    })) {
      return 'Add 1–8 features. Each needs a title (up to 80 characters), text (up to 200), and icon name (up to 40).';
    }
  }
  return '';
}

async function saveSettings() {
  saving.value = true;
  storefrontError.value = '';
  storefrontMessage.value = '';
  try {
    await storefrontAPI.saveSettings({
      store_name: settings.value.store_name,
      tagline: settings.value.tagline,
      description: settings.value.description,
      contact_email: settings.value.contact_email,
      contact_phone: settings.value.contact_phone,
      whatsapp: settings.value.whatsapp,
      address: settings.value.address,
      opening_hours: settings.value.opening_hours,
      announcement: settings.value.announcement,
      footer_text: settings.value.footer_text,
      logo_url: settings.value.logo_url,
      favicon_url: settings.value.favicon_url,
      social: settings.value.social,
    });
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
  const validationError = validateImageFile(file);
  if (validationError) {
    storefrontError.value = validationError;
    input.value = '';
    return;
  }
  bannerUploading.value = true;
  try {
    bannerForm.value.image_url = await uploadAPI.uploadImage(file, 'banner');
    storefrontMessage.value = 'Banner image uploaded. Add the banner to save it as a draft.';
  } catch (error) {
    console.error('Failed to upload storefront banner:', error);
    storefrontError.value = getApiErrorMessage(error, 'Banner image could not be uploaded.');
  } finally {
    bannerUploading.value = false;
    input.value = '';
  }
}

async function uploadExistingBannerImage(event: Event, banner: StorefrontBanner) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  storefrontError.value = '';
  const validationError = validateImageFile(file);
  if (validationError) {
    storefrontError.value = validationError;
    input.value = '';
    return;
  }
  uploadingBannerIds.value = [...uploadingBannerIds.value, banner.id];
  try {
    banner.image_url = await uploadAPI.uploadImage(file, 'banner');
    storefrontMessage.value = 'Replacement image uploaded. Save this banner to update the draft.';
  } catch (error) {
    console.error('Failed to upload storefront banner:', error);
    storefrontError.value = getApiErrorMessage(error, 'Banner image could not be uploaded.');
  } finally {
    uploadingBannerIds.value = uploadingBannerIds.value.filter((id) => id !== banner.id);
    input.value = '';
  }
}

async function uploadStoreImage(event: Event, field: 'logo_url' | 'favicon_url') {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const validationError = validateImageFile(file);
  if (validationError) {
    storefrontError.value = validationError;
    input.value = '';
    return;
  }
  assetUploading.value = true;
  storefrontError.value = '';
  try {
    settings.value[field] = await uploadAPI.uploadImage(file, 'logo');
    storefrontMessage.value = `${field === 'logo_url' ? 'Logo' : 'Favicon'} uploaded. Save draft settings to apply it.`;
  } catch (error) {
    console.error('Failed to upload storefront branding image:', error);
    storefrontError.value = getApiErrorMessage(error, 'Branding image could not be uploaded.');
  } finally {
    assetUploading.value = false;
    input.value = '';
  }
}

async function uploadCategoryImage(
  event: Event,
  category: Category | null,
  field: 'image_url' | 'listing_banner_image_url',
) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const validationError = validateImageFile(file);
  if (validationError) {
    categoriesError.value = validationError;
    input.value = '';
    return;
  }

  const uploadKey = `${category?.id ?? 'new'}:${field}`;
  categoryImageUploads.value = new Set(categoryImageUploads.value).add(uploadKey);
  categoriesError.value = '';
  try {
    const imageUrl = await uploadAPI.uploadImage(file, 'category');
    if (category) category[field] = imageUrl;
    else categoryForm.value[field] = imageUrl;
    storefrontMessage.value = 'Category image uploaded. Save the category to apply the image.';
  } catch (error) {
    console.error('Failed to upload category image:', error);
    categoriesError.value = getApiErrorMessage(error, 'Category image could not be uploaded.');
  } finally {
    const uploads = new Set(categoryImageUploads.value);
    uploads.delete(uploadKey);
    categoryImageUploads.value = uploads;
    input.value = '';
  }
}

async function uploadSectionImage(event: Event, config: Record<string, unknown>, saved: boolean) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const validationError = validateImageFile(file);
  if (validationError) {
    storefrontError.value = validationError;
    input.value = '';
    return;
  }
  assetUploading.value = true;
  storefrontError.value = '';
  try {
    config.image_url = await uploadAPI.uploadImage(file, 'general');
    storefrontMessage.value = saved
      ? 'Promotion image uploaded. Save the section to apply it to the draft.'
      : 'Promotion image uploaded. Add the section to save it to the draft.';
  } catch (error) {
    console.error('Failed to upload homepage section image:', error);
    storefrontError.value = getApiErrorMessage(error, 'Section image could not be uploaded.');
  } finally {
    assetUploading.value = false;
    input.value = '';
  }
}

function validateImageFile(file: File): string {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) return 'Choose a JPEG, PNG, GIF or WebP image.';
  if (file.size > 5 * 1024 * 1024) return 'Images must be 5MB or smaller.';
  return '';
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
    const updatedBanner = await storefrontAPI.updateBanner(banner.id, {
      title: banner.title,
      image_url: banner.image_url,
      alt_text: banner.alt_text,
      link_url: banner.link_url,
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    });
    Object.assign(banner, updatedBanner);
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
    const key = sectionForm.value.type === 'promo' && sectionForm.value.promo_target
      ? sectionForm.value.promo_target.startsWith('category:')
        ? `category-${sectionForm.value.promo_target.slice('category:'.length)}`
        : sectionForm.value.promo_target.startsWith('product-row:')
          ? `product-row-${sectionForm.value.promo_target.slice('product-row:'.length)}`
          : sectionForm.value.section_key.trim()
      : sectionForm.value.section_key.trim();
    if (!/^[a-z0-9_-]{2,40}$/.test(key)) {
      throw new Error('Use a section key with 2–40 lowercase letters, numbers, hyphens, or underscores.');
    }
    if (sectionForm.value.type === 'promo' && sectionForm.value.promo_target.startsWith('product-row:')) {
      const targetId = Number(sectionForm.value.promo_target.slice('product-row:'.length));
      if (!homepageSections.value.some((section) => section.id === targetId && section.type === 'product_row')) {
        throw new Error('Choose an existing homepage product row for this promotion.');
      }
    }
    if (homepageSections.value.some((section) => section.section_key === key)) {
      throw new Error('That section key is already in use. Choose a different key.');
    }
    const config = normalizedSectionConfig(sectionForm.value.type, sectionForm.value.config);
    const configError = validateSectionConfig(sectionForm.value.type, config);
    if (configError) throw new Error(configError);
    const section: StorefrontSectionInput = {
      section_key: key,
      type: sectionForm.value.type.trim(),
      title: sectionForm.value.title.trim(),
      sort_order: homepageSections.value.length,
      is_visible: true,
      config,
    };
    homepageSections.value.push(await storefrontAPI.createSection(section));
    const nextType = 'category_grid';
    sectionForm.value = { section_key: '', promo_target: '', type: nextType, title: '', config: defaultSectionConfig(nextType) };
    storefrontMessage.value = 'Homepage section added to draft.';
  } catch (error) {
    console.error('Failed to create storefront section:', error);
    storefrontError.value = getApiErrorMessage(error, 'Section could not be created.');
  }
}

async function saveSection(section: StorefrontSection) {
  storefrontError.value = '';
  try {
    if (!/^[a-z0-9_-]{2,40}$/.test(section.section_key)) {
      throw new Error('Use a section key with 2–40 lowercase letters, numbers, hyphens, or underscores.');
    }
    if (homepageSections.value.some((item) => item.id !== section.id && item.section_key === section.section_key)) {
      throw new Error('That section key is already in use. Choose a different key.');
    }
    const config = normalizedSectionConfig(section.type, section.config);
    const configError = validateSectionConfig(section.type, config);
    if (configError) throw new Error(configError);
    const updatedSection = await storefrontAPI.updateSection(section.id, {
      section_key: section.section_key,
      type: section.type,
      title: section.title,
      sort_order: section.sort_order,
      is_visible: section.is_visible,
      config,
    });
    Object.assign(section, updatedSection);
    storefrontError.value = '';
    storefrontMessage.value = 'Homepage section saved to draft. Publish changes to make it live.';
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
    categoryForm.value = { name: '', description: '', image_url: '', listing_banner_image_url: '' };
    storefrontMessage.value = `Category "${category.name}" added to the catalogue.`;
  } catch (error) {
    console.error('Failed to create category:', error);
    categoriesError.value = getApiErrorMessage(error, 'Category could not be created.');
  }
}

async function updateCategory(category: Category) {
  categoriesError.value = '';
  try {
    Object.assign(category, await adminCategoriesAPI.update(category.id, {
      name: category.name,
      description: category.description,
      image_url: category.image_url ?? '',
      listing_banner_image_url: category.listing_banner_image_url ?? '',
    }));
    storefrontMessage.value = `Category "${category.name}" saved to the catalogue.`;
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
    storefrontMessage.value = `Category "${category.name}" deleted.`;
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
          <router-link
            to="/admin/storefront/preview"
            class="secondary-button"
            :class="{ 'preview-button-disabled': loading || !storefrontLoaded }"
            :aria-disabled="loading || !storefrontLoaded"
            @click="loading || !storefrontLoaded ? $event.preventDefault() : undefined"
          >
            Preview draft
          </router-link>
          <button type="button" class="primary-button" :disabled="loading || publishing || bannerUploading || assetUploading || uploadingBannerIds.length > 0" @click="publishStorefront">
            {{ publishing ? 'Publishing…' : 'Publish changes' }}
          </button>
        </div>
      </header>

      <main class="storefront-main">
        <section class="page-heading">
          <div>
            <p class="page-eyebrow">STORE EXPERIENCE</p>
            <h1>Storefront management</h1>
            <p class="page-subtitle">Manage the store experience. Save your draft, preview it, then publish when ready.</p>
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
            <p>Save changes to the draft, preview the saved version, then publish to make it visible to shoppers. Unsaved edits are not included in the preview.</p>
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
                <input v-model.trim="banner.title" type="text" maxlength="160" />
                <label class="field-label">Alternative text</label>
                <input v-model.trim="banner.alt_text" type="text" maxlength="255" />
                <label class="field-label">Destination link</label>
                <input v-model.trim="banner.link_url" type="text" placeholder="/shop" />
                <label class="field-label">Image URL</label>
                <input v-model.trim="banner.image_url" type="url" required />
                <label class="secondary-button upload-button" :class="{ 'uploading': uploadingBannerIds.includes(banner.id) }">
                  <ImagePlus :size="16" />
                  {{ uploadingBannerIds.includes(banner.id) ? 'Uploading image…' : 'Upload replacement image' }}
                  <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="uploadingBannerIds.includes(banner.id)" @change="uploadExistingBannerImage($event, banner)" />
                </label>
                <div class="row-actions">
                  <button type="button" class="secondary-button" :disabled="index === 0" @click="moveBanner(index, -1)"><ArrowUp :size="15" /> Up</button>
                  <button type="button" class="secondary-button" :disabled="index === banners.length - 1" @click="moveBanner(index, 1)"><ArrowDown :size="15" /> Down</button>
                  <button type="button" class="primary-button" :disabled="uploadingBannerIds.includes(banner.id)" @click="saveBanner(banner)">Save</button>
                  <button type="button" class="danger-button" @click="deleteBanner(banner)">Delete</button>
                </div>
              </div>
            </article>

            <form class="upload-placeholder new-banner-form" @submit.prevent="createBanner">
              <div class="upload-icon"><ImagePlus :size="25" /></div>
              <h3>Add a promotional banner</h3>
              <div v-if="bannerForm.image_url" class="new-banner-preview">
                <img :src="bannerForm.image_url" :alt="bannerForm.alt_text || bannerForm.title || 'Banner preview'" />
                <span>Preview</span>
              </div>
              <label>Title<input v-model.trim="bannerForm.title" required maxlength="160" /></label>
              <label>Alternative text<input v-model.trim="bannerForm.alt_text" maxlength="255" /></label>
              <label>Destination link<input v-model.trim="bannerForm.link_url" placeholder="/shop" /></label>
              <label>Image URL<input v-model.trim="bannerForm.image_url" type="url" required /></label>
              <label class="secondary-button upload-button" :class="{ 'uploading': bannerUploading }">
                <ImagePlus :size="16" /> {{ bannerUploading ? 'Uploading image…' : 'Upload to image storage' }}
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="bannerUploading" @change="uploadBannerImage" />
              </label>
              <small>JPEG, PNG, GIF or WebP · max 5MB. The uploaded image is saved to backend storage.</small>
              <button type="submit" class="primary-button" :disabled="bannerUploading">Add banner</button>
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
                <label v-if="section.type !== 'promo' || !isLinkedPromoKey(section.section_key)">
                  Section key<input v-model.trim="section.section_key" />
                </label>
                <label v-if="section.type === 'promo'">
                  Show promotion on
                  <select :value="promoTargetFromSectionKey(section.section_key)" @change="setPromoTarget(section, ($event.target as HTMLSelectElement).value)">
                    <option value="">All shoppers / general homepage</option>
                    <optgroup label="Category listing pages">
                      <option v-for="category in categories" :key="category.id" :value="`category:${category.id}`">{{ category.name }} category page</option>
                    </optgroup>
                    <optgroup label="Homepage product rows">
                      <option
                        v-for="row in homepageSections.filter((item) => item.type === 'product_row')"
                        :key="row.id"
                        :value="`product-row:${row.id}`"
                      >{{ row.title || row.section_key }} product row</option>
                    </optgroup>
                  </select>
                  <small>Select a product row to show this promotion as its right-side banner. Uncheck Visible to hide it.</small>
                </label>
                <label>
                  Section type
                  <select :value="section.type" @change="changeSectionType(section, ($event.target as HTMLSelectElement).value)">
                    <option v-for="type in sectionTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
                  </select>
                </label>
                <label>Title<input v-model.trim="section.title" /></label>
                <div class="section-config-editor">
                  <h4>Section settings</h4>
                  <p class="config-help">These are the settings supported by the storefront API for this section type. Changing the type resets its settings.</p>
                  <div v-for="field in sectionConfigFields(section.type)" :key="field.id" class="config-field">
                    <label v-if="field.inputType === 'checkbox'" class="config-toggle">
                      <input
                        :checked="configFieldValue(section.config, field.id) === true"
                        type="checkbox"
                        @change="updateConfigField(section.config, field.id, field, $event)"
                      />
                      {{ field.label }}
                    </label>
                    <label v-else>
                      {{ field.label }}
                      <select
                        v-if="field.inputType === 'select'"
                        :value="configFieldValue(section.config, field.id)"
                        @change="updateConfigField(section.config, field.id, field, $event)"
                      >
                        <option v-if="field.id === 'category_id'" value="" disabled>Select a category</option>
                        <option
                          v-for="option in field.options"
                          :key="typeof option === 'string' ? option : option.value"
                          :value="typeof option === 'string' ? option : option.value"
                        >{{ typeof option === 'string' ? option : option.label }}</option>
                      </select>
                      <textarea
                        v-else-if="field.inputType === 'textarea'"
                        :value="String(configFieldValue(section.config, field.id))"
                        rows="4"
                        @change="updateConfigField(section.config, field.id, field, $event)"
                      />
                      <div v-else-if="field.inputType === 'color'" class="color-code-control">
                        <input
                          type="color"
                          :value="String(configFieldValue(section.config, field.id))"
                          :aria-label="`${field.label} picker`"
                          @input="updateConfigField(section.config, field.id, field, $event)"
                        />
                        <input
                          type="text"
                          :value="String(configFieldValue(section.config, field.id))"
                          placeholder="#102C49"
                          maxlength="7"
                          pattern="#[0-9a-fA-F]{6}"
                          :aria-label="`${field.label} hex code`"
                          @input="updateConfigField(section.config, field.id, field, $event)"
                        />
                      </div>
                      <input
                        v-else
                        :type="field.inputType"
                        :value="configFieldValue(section.config, field.id)"
                        @input="updateConfigField(section.config, field.id, field, $event)"
                      />
                    </label>
                  </div>
                  <p v-if="section.type === 'product_row' && section.config.source === 'category'" class="config-help">
                    Select an existing category ID. The API requires it when Products to show is Category.
                  </p>
                  <p v-if="section.type === 'product_row'" class="config-help">
                    Newest is automatic; Featured means highest-rated in the current API. The API does not yet support manually selecting individual product IDs.
                  </p>
                  <div v-if="section.type === 'product_row'" class="product-row-banner-option">
                    <div>
                      <strong>Right-side banner</strong>
                      <small v-if="productRowBanner(section.id)?.is_visible">
                        Enabled. Edit the linked promotion below or turn it off there.
                      </small>
                      <small v-else>
                        Not enabled for this product row.
                      </small>
                    </div>
                    <button
                      type="button"
                      class="secondary-button"
                      :disabled="bannerProductRowId === section.id"
                        @click="toggleProductRowBanner(section)"
                    >
                      {{ bannerProductRowId === section.id
                        ? 'Saving…'
                        : productRowBanner(section.id)?.is_visible
                          ? 'Disable right-side banner'
                          : 'Enable right-side banner' }}
                    </button>
                  </div>
                  <label v-if="section.type === 'promo'" class="secondary-button upload-button">
                    <ImagePlus :size="15" /> Upload promotion image
                    <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="assetUploading" @change="uploadSectionImage($event, section.config, true)" />
                  </label>
                </div>
              </div>
              <label class="toggle-label"><input v-model="section.is_visible" type="checkbox" /> Visible</label>
              <div class="row-actions">
                <button type="button" class="primary-button" :disabled="assetUploading" @click="saveSection(section)">Save</button>
                <button type="button" class="danger-button" @click="deleteSection(section)">Delete</button>
              </div>
            </article>
          </div>
          <form class="section-form" @submit.prevent="createSection">
            <h3>Add homepage section</h3>
            <label>
              Section key
              <input
                v-if="sectionForm.type !== 'promo' || !isLinkedPromoKey(sectionForm.section_key)"
                v-model.trim="sectionForm.section_key"
                required minlength="2" maxlength="40" pattern="[a-z0-9_-]+"
                placeholder="e.g. featured_products"
              />
              <small>Use 2–40 lowercase letters, numbers, hyphens, or underscores.</small>
            </label>
            <label>
              Section type
              <select :value="sectionForm.type" @change="changeNewSectionType(($event.target as HTMLSelectElement).value)">
                <option v-for="type in sectionTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
              </select>
            </label>
            <label v-if="sectionForm.type === 'promo'">
              Show promotion on
              <select :value="sectionForm.promo_target" @change="setNewPromoTarget(($event.target as HTMLSelectElement).value)">
                <option value="">All shoppers / general homepage</option>
                <optgroup label="Category listing pages">
                  <option v-for="category in categories" :key="category.id" :value="`category:${category.id}`">{{ category.name }} category page</option>
                </optgroup>
                <optgroup label="Homepage product rows">
                  <option
                    v-for="row in homepageSections.filter((item) => item.type === 'product_row')"
                    :key="row.id"
                    :value="`product-row:${row.id}`"
                  >{{ row.title || row.section_key }} product row</option>
                </optgroup>
              </select>
              <small>Choose a category listing or homepage product row. A product-row promotion appears to its right and can be hidden with the Visible option.</small>
            </label>
            <label>Title<input v-model.trim="sectionForm.title" /></label>
            <div class="section-config-editor">
              <label v-for="field in sectionConfigFields(sectionForm.type)" :key="field.id">
                {{ field.label }}
                <select
                  v-if="field.inputType === 'select'"
                  :value="configFieldValue(sectionForm.config, field.id)"
                  @change="updateConfigField(sectionForm.config, field.id, field, $event)"
                >
                  <option v-if="field.id === 'category_id'" value="" disabled>Select a category</option>
                  <option
                    v-for="option in field.options"
                    :key="typeof option === 'string' ? option : option.value"
                    :value="typeof option === 'string' ? option : option.value"
                  >{{ typeof option === 'string' ? option : option.label }}</option>
                </select>
                <textarea
                  v-else-if="field.inputType === 'textarea'"
                  :value="String(configFieldValue(sectionForm.config, field.id))"
                  rows="4"
                  @change="updateConfigField(sectionForm.config, field.id, field, $event)"
                />
                <div v-else-if="field.inputType === 'color'" class="color-code-control">
                  <input
                    type="color"
                    :value="String(configFieldValue(sectionForm.config, field.id))"
                    :aria-label="`${field.label} picker`"
                    @input="updateConfigField(sectionForm.config, field.id, field, $event)"
                  />
                  <input
                    type="text"
                    :value="String(configFieldValue(sectionForm.config, field.id))"
                    placeholder="#102C49"
                    maxlength="7"
                    pattern="#[0-9a-fA-F]{6}"
                    :aria-label="`${field.label} hex code`"
                    @input="updateConfigField(sectionForm.config, field.id, field, $event)"
                  />
                </div>
                <input
                  v-else-if="field.inputType === 'checkbox'"
                  type="checkbox"
                  :checked="configFieldValue(sectionForm.config, field.id) === true"
                  @change="updateConfigField(sectionForm.config, field.id, field, $event)"
                />
                <input
                  v-else
                  :type="field.inputType"
                  :value="configFieldValue(sectionForm.config, field.id)"
                  @input="updateConfigField(sectionForm.config, field.id, field, $event)"
                />
                <small v-if="field.id === 'items'">Example: [{"title":"Nationwide delivery","text":"Across Kenya","icon":"truck"}]</small>
              </label>
              <p v-if="sectionForm.type === 'product_row'" class="config-help">
                Newest is automatic; Featured means highest-rated in the current API. The API does not yet support manually selecting individual product IDs.
              </p>
            </div>
            <label v-if="sectionForm.type === 'promo'" class="secondary-button upload-button">
              <ImagePlus :size="15" /> Upload promotion image
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="assetUploading" @change="uploadSectionImage($event, sectionForm.config, false)" />
            </label>
            <button type="submit" class="primary-button" :disabled="assetUploading"><Plus :size="16" /> Add section</button>
          </form>
        </section>

        <section v-else-if="activeSection === 'categories'" class="management-panel">
          <div class="panel-heading">
            <div>
              <h2>Homepage categories</h2>
              <p>Edit category names and descriptions, and manage the homepage tile and category-page banner images.</p>
            </div>
          </div>

          <div class="setup-notice category-api-note">
            <div>
              <strong>Category images are supported</strong>
              <p>Upload an image or paste an image URL for the homepage tile and category listing banner. Save each category to update the catalogue.</p>
            </div>
          </div>

          <p class="category-help">Category names and descriptions save immediately to the catalogue. Homepage layout changes are saved as a draft and require publishing.</p>
          <form class="category-form" @submit.prevent="createCategory">
            <label><span>Category name</span><input v-model.trim="categoryForm.name" required maxlength="255" placeholder="For example, Home & Kitchen" /></label>
            <label><span>Description</span><input v-model.trim="categoryForm.description" placeholder="Short description for shoppers" /></label>
            <label>
              <span>Homepage tile image URL</span>
              <input v-model.trim="categoryForm.image_url" type="url" placeholder="https://…" />
              <img v-if="categoryForm.image_url" class="category-image-preview" :src="categoryForm.image_url" alt="Homepage tile preview" />
              <span class="secondary-button upload-button">
                <ImagePlus :size="15" /> Upload tile image
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="categoryImageUploads.has('new:image_url')" @change="uploadCategoryImage($event, null, 'image_url')" />
              </span>
            </label>
            <label>
              <span>Category listing banner URL</span>
              <input v-model.trim="categoryForm.listing_banner_image_url" type="url" placeholder="https://…" />
              <img v-if="categoryForm.listing_banner_image_url" class="category-image-preview category-banner-preview" :src="categoryForm.listing_banner_image_url" alt="Category listing banner preview" />
              <span class="secondary-button upload-button">
                <ImagePlus :size="15" /> Upload listing banner
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="categoryImageUploads.has('new:listing_banner_image_url')" @change="uploadCategoryImage($event, null, 'listing_banner_image_url')" />
              </span>
            </label>
            <button type="submit" class="primary-button" :disabled="categoryImageUploads.size > 0"><Plus :size="16" /> Add category</button>
          </form>

          <div v-if="categoriesLoading" class="empty-state">Loading categories…</div>
          <div v-else-if="categoriesError" class="error-state" role="alert">
            <p>{{ categoriesError }}</p>
            <button type="button" @click="loadCategories">Retry</button>
          </div>
          <div v-else-if="categories.length" class="category-list">
            <article v-for="category in categories" :key="category.id" class="category-row">
              <div class="category-card-preview">
                <img v-if="category.image_url" :src="category.image_url" :alt="`${category.name} tile`" />
                <Tag v-else :size="25" aria-hidden="true" />
              </div>
              <div class="category-card-fields">
                <div class="category-edit">
                  <label><span>Category name</span><input v-model.trim="category.name" aria-label="Category name" required maxlength="255" /></label>
                  <label><span>Description</span><input v-model="category.description" aria-label="Category description" /></label>
                </div>
                <div class="category-image-fields">
                  <label>
                    <span>Homepage tile image URL</span>
                    <input v-model.trim="category.image_url" type="url" :aria-label="`${category.name} homepage tile image URL`" placeholder="https://…" />
                    <img v-if="category.image_url" class="category-image-preview" :src="category.image_url" :alt="`${category.name} tile preview`" />
                    <span class="secondary-button upload-button">
                      <ImagePlus :size="15" /> Upload tile image
                      <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="categoryImageUploads.has(`${category.id}:image_url`)" @change="uploadCategoryImage($event, category, 'image_url')" />
                    </span>
                  </label>
                  <label>
                    <span>Category listing banner URL</span>
                    <input v-model.trim="category.listing_banner_image_url" type="url" :aria-label="`${category.name} listing banner image URL`" placeholder="https://…" />
                    <img v-if="category.listing_banner_image_url" class="category-image-preview category-banner-preview" :src="category.listing_banner_image_url" :alt="`${category.name} listing banner preview`" />
                    <span class="secondary-button upload-button">
                      <ImagePlus :size="15" /> Upload listing banner
                      <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="categoryImageUploads.has(`${category.id}:listing_banner_image_url`)" @change="uploadCategoryImage($event, category, 'listing_banner_image_url')" />
                    </span>
                  </label>
                </div>
                <div class="category-card-actions">
                  <button type="button" class="primary-button" :disabled="saving || categoryImageUploads.has(`${category.id}:image_url`) || categoryImageUploads.has(`${category.id}:listing_banner_image_url`)" @click="updateCategory(category)">
                    Save category
                  </button>
                  <button type="button" class="danger-button" @click="deleteCategory(category)">Delete</button>
                </div>
              </div>
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
            <label><span>WhatsApp</span><input v-model.trim="settings.whatsapp" type="tel" /></label>
            <label><span>Address</span><input v-model.trim="settings.address" /></label>
            <label><span>Opening hours</span><input v-model.trim="settings.opening_hours" /></label>
            <label><span>Announcement</span><input v-model.trim="settings.announcement" /></label>
            <label><span>Footer text</span><input v-model.trim="settings.footer_text" /></label>
            <label class="branding-field">
              <span>Logo image URL</span>
              <input v-model.trim="settings.logo_url" type="url" />
              <span v-if="settings.logo_url" class="store-image-preview"><img :src="settings.logo_url" alt="Store logo preview" /></span>
              <span class="secondary-button upload-button">
                <ImagePlus :size="15" /> Upload logo
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="assetUploading" @change="uploadStoreImage($event, 'logo_url')" />
              </span>
            </label>
            <label class="branding-field">
              <span>Favicon image URL</span>
              <input v-model.trim="settings.favicon_url" type="url" />
              <span class="secondary-button upload-button">
                <ImagePlus :size="15" /> Upload favicon
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" :disabled="assetUploading" @change="uploadStoreImage($event, 'favicon_url')" />
              </span>
            </label>
            <label v-for="social in socialLinks" :key="social.key">
              <span>{{ social.label }} URL</span>
              <input v-model="settings.social[social.key]" type="url" :placeholder="`https://${social.key}.com/…`" />
            </label>
          </div>
          <div class="content-actions">
            <button type="button" class="primary-button" :disabled="saving || assetUploading" @click="saveSettings">{{ saving ? 'Saving…' : 'Save draft settings' }}</button>
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

.new-banner-preview {
  position: relative;
  display: grid;
  min-height: 120px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  background: #f3f6f9;
}

.new-banner-preview img {
  display: block;
  width: 100%;
  max-height: 190px;
  object-fit: contain;
}

.new-banner-preview span {
  position: absolute;
  right: 7px;
  bottom: 7px;
  padding: 4px 7px;
  border-radius: 999px;
  background: rgb(16 42 67 / 78%);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
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
.content-fields select,
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

.branding-field .store-image-preview {
  display: block;
  padding: 8px;
  border: 1px solid #e3e8ee;
  border-radius: 5px;
  background: #fff;
}

.store-image-preview img {
  display: block;
  max-width: 220px;
  max-height: 76px;
  object-fit: contain;
}

.branding-field .upload-button {
  justify-self: start;
}

.banner-details .secondary-button {
  margin-top: 5px;
}

.upload-button {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.upload-button:focus-within {
  outline: 3px solid rgb(7 83 151 / 28%);
  outline-offset: 2px;
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
.section-form select,
.section-form textarea,
.layout-copy input,
.layout-copy select,
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
.category-card-fields {
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

.category-heading-editor {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  align-items: end;
  gap: 12px;
  margin-bottom: 8px;
  padding: 15px;
  border: 1px solid #e3e8ee;
  border-radius: 7px;
  background: #f8fafc;
}

.category-heading-editor label,
.category-card-fields label {
  display: grid;
  min-width: 0;
  gap: 5px;
  color: #526579;
  font-size: 0.72rem;
  font-weight: 650;
}

.category-heading-editor input,
.category-card-fields input:not([type="checkbox"]):not([type="file"]) {
  width: 100%;
  min-width: 0;
  min-height: 36px;
  padding: 8px;
  border: 1px solid #d5dee7;
  border-radius: 5px;
  background: #fff;
  color: #334155;
  font: inherit;
  font-size: 0.78rem;
}

.category-help {
  margin: 0 0 15px;
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.5;
}

.category-card-preview {
  display: grid;
  width: 78px;
  height: 78px;
  flex: 0 0 78px;
  place-items: center;
  overflow: hidden;
  border-radius: 6px;
  background: #eef2f6;
  color: #64748b;
}

.category-card-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-card-fields {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 10px;
}

.category-edit {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.category-image-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.category-image-fields label,
.category-form label {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 7px;
}

.category-image-preview {
  display: block;
  width: 100%;
  max-width: 300px;
  height: 110px;
  border: 1px solid #e3e8ee;
  border-radius: 5px;
  background: #fff;
  object-fit: cover;
}

.category-banner-preview {
  height: 90px;
}

.category-card-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.category-card-actions .upload-button {
  min-height: 35px;
}

.category-visible-toggle,
.config-toggle {
  display: inline-flex !important;
  align-items: center;
  gap: 6px !important;
  color: #526579;
  font-size: 0.72rem;
  font-weight: 600;
}

.category-visible-toggle input,
.config-toggle input {
  width: 16px;
  min-height: 16px;
  margin: 0;
}

.section-config-editor {
  display: grid;
  grid-column: 1 / -1;
  gap: 8px;
  padding: 11px;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  background: #f8fafc;
}

.section-config-editor h4 {
  margin: 0;
  color: #20394f;
  font-size: 0.78rem;
}

.section-config-editor .config-help {
  margin: 0;
}

.config-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 8px;
}

.config-field > label,
.advanced-config {
  min-width: 0;
}

.color-code-control {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.color-code-control input[type='color'] {
  width: 42px;
  min-width: 42px;
  height: 36px;
  padding: 3px;
  cursor: pointer;
}

.color-code-control input[type='text'] {
  min-width: 0;
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  text-transform: uppercase;
}

.config-field > .config-toggle {
  min-height: 36px;
}

.config-field > button {
  border: 0;
  background: transparent;
  color: #b42318;
  cursor: pointer;
  font: inherit;
  font-size: 0.7rem;
}

.advanced-config {
  display: grid;
  gap: 6px;
  color: #526579;
  font-size: 0.72rem;
}

.advanced-config summary {
  cursor: pointer;
  font-weight: 650;
}

.advanced-config p {
  margin: 0;
}

.add-config-field {
  display: flex;
  gap: 8px;
}

.add-config-field input {
  flex: 1;
}

.section-form small {
  color: #718096;
  font-size: 0.68rem;
  font-weight: 400;
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

.content-fields select,
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
  .category-heading-editor,
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

  .category-heading-editor,
  .category-edit,
  .category-image-fields {
    grid-template-columns: 1fr;
  }

  .category-card-fields {
    flex-basis: 100%;
  }

  .category-heading-editor > button {
    width: 100%;
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
