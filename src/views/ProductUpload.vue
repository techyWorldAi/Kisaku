<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import {
  getApiErrorMessage,
  vendorAPI,
  vendorAdminAPI,
  type ProductImportData,
  type ProductImportRow,
  type Vendor,
} from '../services/api';

const props = defineProps<{ mode: 'vendor' | 'admin' }>();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const step = ref<1 | 2 | 3>(1);
const heading = ref<HTMLElement | null>(null);
const file = ref<File | null>(null);
const allowDuplicates = ref(false);
const checking = ref(false);
const importing = ref(false);
const error = ref('');
const preview = ref<ProductImportData | null>(null);
const importMessage = ref('');
const selectedVendor = ref('');
const vendors = ref<Vendor[]>([]);
const vendorLoading = ref(false);
const filter = ref('all');

const userRole = computed(() => authStore.user?.role ?? '');
const canOwnShop = computed(() => props.mode === 'admin' && userRole.value === 'admin');
const vendorRequired = computed(() => props.mode === 'admin' && !canOwnShop.value);
const canCheck = computed(() => !!file.value && (!vendorRequired.value || !!selectedVendor.value));
const importCount = computed(() => (preview.value?.summary.create ?? 0) + (preview.value?.summary.update ?? 0));

const filteredRows = computed(() => {
  const rows = preview.value?.rows ?? [];
  if (filter.value === 'problem') return rows.filter(row => row.action === 'error');
  if (filter.value === 'duplicate') return rows.filter(row => row.action === 'duplicate');
  if (filter.value === 'create') return rows.filter(row => row.action === 'create');
  if (filter.value === 'update') return rows.filter(row => row.action === 'update');
  return rows;
});

function goToStep(value: 1 | 2 | 3) {
  step.value = value;
  void nextTick(() => heading.value?.focus());
}

function chooseFile(selected: File | undefined) {
  error.value = '';
  if (!selected) return;
  const name = selected.name.toLowerCase();
  if (!name.endsWith('.csv') && !name.endsWith('.xlsx')) {
    error.value = 'Choose a CSV or XLSX file. XLS files are not supported.';
    return;
  }
  if (selected.size > 5 * 1024 * 1024) {
    error.value = 'That file is too big. The limit is 5 MB.';
    return;
  }
  file.value = selected;
}

function onDrop(event: DragEvent) {
  chooseFile(event.dataTransfer?.files?.[0]);
}

function removeFile() {
  file.value = null;
  error.value = '';
}

async function downloadTemplate(format: 'xlsx' | 'csv') {
  try {
    error.value = '';
    const blob = props.mode === 'vendor'
      ? await vendorAPI.downloadImportTemplate(format)
      : await vendorAdminAPI.downloadImportTemplate(format);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kisaku-products-template.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (caught) {
    error.value = getApiErrorMessage(caught, 'Could not reach the server. Check your connection and try again.');
  }
}

async function loadVendors() {
  if (props.mode !== 'admin') return;
  vendorLoading.value = true;
  try {
    const result = await vendorAdminAPI.getVendors({ per_page: 100 });
    vendors.value = result.items.filter(vendor => vendor.status !== 'suspended');
  } catch (caught) {
    error.value = getApiErrorMessage(caught, 'Could not reach the server. Check your connection and try again.');
  } finally {
    vendorLoading.value = false;
  }
}

function setDefaultFilter() {
  filter.value = (preview.value?.summary.error ?? 0) > 0 ? 'problem' : 'all';
}

async function previewImport() {
  if (!canCheck.value || !file.value) return;
  checking.value = true;
  error.value = '';
  try {
    const response = props.mode === 'vendor'
      ? await vendorAPI.importProducts(file.value, allowDuplicates.value, 'preview')
      : await vendorAdminAPI.importProducts(file.value, selectedVendor.value, allowDuplicates.value, 'preview');
    preview.value = response.data;
    setDefaultFilter();
    goToStep(2);
  } catch (caught) {
    error.value = getRequestError(caught);
  } finally {
    checking.value = false;
  }
}

async function runImport() {
  if (!file.value || importing.value || importCount.value === 0) return;
  importing.value = true;
  error.value = '';
  try {
    const response = props.mode === 'vendor'
      ? await vendorAPI.importProducts(file.value, allowDuplicates.value, 'import')
      : await vendorAdminAPI.importProducts(file.value, selectedVendor.value, allowDuplicates.value, 'import');
    preview.value = response.data;
    importMessage.value = response.message;
    filter.value = 'all';
    goToStep(3);
  } catch (caught) {
    error.value = getRequestError(caught);
  } finally {
    importing.value = false;
  }
}

function getRequestError(caught: unknown) {
  if (typeof caught === 'object' && caught !== null && 'response' in caught) {
    const axiosError = caught as { response?: { status?: number; data?: { error?: string } } };
    if (axiosError.response?.status === 404) return 'That vendor was not found';
    if (axiosError.response?.status === 413) return 'That file is too big. The limit is 5 MB.';
  }
  const message = getApiErrorMessage(caught, 'Could not reach the server. Check your connection and try again.');
  return message === 'Could not reach the server. Check your connection and try again.'
    && typeof caught === 'object' && caught !== null
    && 'code' in caught
    ? 'Could not reach the server. Check your connection and try again.'
    : message;
}

function reset() {
  file.value = null;
  preview.value = null;
  importMessage.value = '';
  error.value = '';
  filter.value = 'all';
  goToStep(1);
}

function backToFile() {
  preview.value = null;
  goToStep(1);
}

function viewProducts() {
  if (props.mode === 'vendor') {
    void router.push('/vendor/products');
  } else {
    const query = selectedVendor.value && selectedVendor.value !== 'none'
      ? { vendor: encodeURIComponent(selectedVendor.value) }
      : {};
    void router.push({ path: '/admin/products', query });
  }
}

function actionLabel(action: ProductImportRow['action']) {
  return action === 'create' ? 'Add' : action === 'update' ? 'Update' : action === 'duplicate' ? 'Duplicate' : 'Problem';
}

onMounted(async () => {
  if (props.mode === 'admin') {
    const initialVendor = typeof route.query.vendor === 'string' ? route.query.vendor : '';
    await loadVendors();
    if (initialVendor) selectedVendor.value = initialVendor;
  }
});
</script>

<template>
  <div class="upload-page" :class="{ 'admin-upload-page': mode === 'admin' }">
    <main class="upload-shell">
      <ol class="steps" aria-label="Upload progress">
        <li :class="{ active: step === 1, done: step > 1 }"><span>1</span> File</li>
        <li :class="{ active: step === 2, done: step > 2 }"><span>2</span> Preview</li>
        <li :class="{ active: step === 3 }"><span>3</span> Done</li>
      </ol>

      <section v-if="step === 1" class="upload-card">
        <h1 ref="heading" tabindex="-1">Upload products</h1>
        <p class="intro">Add or update many products at once from an Excel or CSV file.</p>

        <div v-if="mode === 'admin'" class="vendor-choice">
          <label for="vendor">Vendor</label>
          <select id="vendor" v-model="selectedVendor" :required="vendorRequired">
            <option value="">Select a vendor</option>
            <option v-if="canOwnShop" value="none">Kisaku shop (own products)</option>
            <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.code">
              {{ vendor.code }} {{ vendor.business_name }}
            </option>
          </select>
        </div>

        <div class="template-actions">
          <button type="button" class="secondary" @click="downloadTemplate('xlsx')">Download Excel template</button>
          <button type="button" class="secondary" @click="downloadTemplate('csv')">Download CSV template</button>
        </div>
        <p class="note">Up to 500 products and 5 MB per file. Leave id empty to add a product. Put a product's id in the id column to change it.</p>

        <div
          class="drop-zone"
          role="button"
          tabindex="0"
          @click="($refs.fileInput as HTMLInputElement).click()"
          @keydown.enter="($refs.fileInput as HTMLInputElement).click()"
          @keydown.space.prevent="($refs.fileInput as HTMLInputElement).click()"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <input ref="fileInput" class="hidden-input" type="file" accept=".csv,.xlsx" @change="chooseFile(($event.target as HTMLInputElement).files?.[0])">
          <strong v-if="!file">Drag and drop a CSV or XLSX file here</strong>
          <button v-if="!file" type="button" class="secondary choose">Choose file</button>
          <div v-else class="selected-file">
            <span><strong>{{ file.name }}</strong><small>{{ (file.size / 1024).toFixed(1) }} KB</small></span>
            <button type="button" class="remove" @click.stop="removeFile">Remove</button>
          </div>
        </div>

        <label class="duplicate-check"><input v-model="allowDuplicates" type="checkbox"> Add even if the name already exists</label>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <button type="button" class="primary" :disabled="!canCheck || checking" @click="previewImport">
          {{ checking ? 'Checking...' : 'Check file' }}
        </button>
      </section>

      <section v-else-if="step === 2" class="upload-card">
        <div class="preview-banner" role="status">This is a preview. Nothing has been saved yet.</div>
        <h1 ref="heading" tabindex="-1">Preview</h1>
        <div class="summary-grid">
          <div class="summary add"><span>To add</span><strong>{{ preview?.summary.create ?? 0 }}</strong></div>
          <div class="summary update"><span>To update</span><strong>{{ preview?.summary.update ?? 0 }}</strong></div>
          <div class="summary duplicate"><span>Skipped as duplicates</span><strong>{{ preview?.summary.duplicate ?? 0 }}</strong></div>
          <div class="summary problem"><span>With problems</span><strong>{{ preview?.summary.error ?? 0 }}</strong></div>
        </div>
        <p v-if="preview?.ignored_columns?.length" class="ignored">These columns were not recognised and were ignored: {{ preview.ignored_columns.join(', ') }}</p>

        <div class="filters" aria-label="Filter preview rows">
          <button :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
          <button :class="{ active: filter === 'problem' }" @click="filter = 'problem'">Problems</button>
          <button :class="{ active: filter === 'duplicate' }" @click="filter = 'duplicate'">Duplicates</button>
          <button :class="{ active: filter === 'create' }" @click="filter = 'create'">To add</button>
          <button :class="{ active: filter === 'update' }" @click="filter = 'update'">To update</button>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Row</th><th>Name</th><th>Action</th><th>Details</th></tr></thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.row" :class="{ problem: row.action === 'error' }">
                <td>{{ row.row }}</td>
                <td>{{ row.name || (row.product_id ? `Product #${row.product_id}` : '') }}</td>
                <td><span class="badge" :class="row.action">{{ actionLabel(row.action) }}</span></td>
                <td><span v-for="(detail, index) in row.errors" :key="index" class="detail">{{ detail }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="(preview?.summary.error ?? 0) > 0" class="skip-note">Rows with problems will be skipped. Everything else will be imported.</p>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <div class="actions">
          <button type="button" class="secondary" @click="backToFile">Choose another file</button>
          <button type="button" class="primary" :disabled="importCount === 0 || importing" @click="runImport">
            {{ importing ? 'Importing...' : `Import ${importCount} products` }}
          </button>
        </div>
        <p v-if="importCount === 0" class="skip-note">Nothing in this file can be imported. Fix the problems and upload it again.</p>
      </section>

      <section v-else class="upload-card">
        <h1 ref="heading" tabindex="-1">Import complete</h1>
        <p class="done-message" role="status">{{ importMessage }}</p>
        <div class="summary-grid">
          <div class="summary add"><span>To add</span><strong>{{ preview?.summary.create ?? 0 }}</strong></div>
          <div class="summary update"><span>To update</span><strong>{{ preview?.summary.update ?? 0 }}</strong></div>
          <div class="summary duplicate"><span>Skipped as duplicates</span><strong>{{ preview?.summary.duplicate ?? 0 }}</strong></div>
          <div class="summary problem"><span>Rejected</span><strong>{{ preview?.summary.error ?? 0 }}</strong></div>
        </div>

        <div v-if="preview?.rows.some(row => row.action === 'duplicate' || row.action === 'error')" class="table-wrap">
          <table>
            <thead><tr><th>Row</th><th>Name</th><th>Action</th><th>Details</th></tr></thead>
            <tbody>
              <tr v-for="row in preview?.rows.filter(row => row.action !== 'create' && row.action !== 'update')" :key="row.row" :class="{ problem: row.action === 'error' }">
                <td>{{ row.row }}</td><td>{{ row.name || (row.product_id ? `Product #${row.product_id}` : '') }}</td>
                <td><span class="badge" :class="row.action">{{ actionLabel(row.action) }}</span></td>
                <td><span v-for="(detail, index) in row.errors" :key="index" class="detail">{{ detail }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="actions">
          <button type="button" class="secondary" @click="reset">Upload another file</button>
          <button type="button" class="primary" @click="viewProducts">{{ mode === 'vendor' ? 'View my products' : 'View products' }}</button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.upload-page{min-height:calc(100vh - 80px);background:#f8fafc}.admin-upload-page{margin-left:0}.upload-shell{max-width:1050px;margin:0 auto;padding:24px}.upload-card{background:#fff;border:1px solid #e6ebf1;border-radius:10px;padding:22px}.steps{display:flex;justify-content:center;gap:60px;margin:0 0 18px;padding:0;list-style:none;color:#64748b}.steps li{display:flex;align-items:center;gap:8px;font-weight:700}.steps span{display:grid;width:32px;height:32px;place-items:center;border:1px solid #cbd5e1;border-radius:50%;background:#fff}.steps .active{color:#0b5aa5}.steps .active span,.steps .done span{border-color:#0b5aa5;background:#0b5aa5;color:#fff}.upload-card h1{margin:0;color:#0f2a44;font-size:1.5rem}.intro,.note{color:#64748b}.template-actions{display:flex;gap:10px;margin:16px 0 8px}.vendor-choice{display:grid;gap:6px;margin-bottom:14px}.vendor-choice select{height:42px;border:1px solid #dbe3ec;border-radius:6px;padding:0 10px;background:#fff}.drop-zone{min-height:150px;margin-top:16px;border:2px dashed #cbd5e1;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center}.hidden-input{display:none}.selected-file{display:flex;width:min(600px,90%);align-items:center;justify-content:space-between;gap:20px}.selected-file span{display:grid;text-align:left}.selected-file small{color:#64748b}.remove{border:0;background:transparent;color:#0b5aa5;text-decoration:underline}.duplicate-check{display:flex;align-items:center;gap:8px;margin:14px 0}.primary,.secondary{min-height:42px;border-radius:6px;padding:9px 14px;font-weight:800}.primary{border:0;background:#ff7900;color:#fff}.secondary{border:1px solid #cbd5e1;background:#fff;color:#0f2a44}.primary:disabled{opacity:.55;cursor:not-allowed}.error{color:#b42318}.preview-banner{margin:-22px -22px 18px;padding:12px 22px;border-bottom:1px solid #bfdbfe;background:#eff6ff;color:#0b5aa5;font-weight:800}.summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:16px 0}.summary{display:grid;gap:4px;padding:14px;border:1px solid #e6ebf1;border-radius:8px}.summary strong{font-size:1.25rem}.summary.update{border-left:4px solid #0b5aa5}.summary.add{border-left:4px solid #1d6fa5}.summary.duplicate{border-left:4px solid #f59e0b}.summary.problem{border-left:4px solid #dc2626}.ignored{padding:8px 10px;border-radius:6px;background:#f8fafc;color:#64748b}.filters{display:flex;gap:7px;overflow-x:auto;margin:14px 0}.filters button{border:1px solid #dbe3ec;border-radius:999px;background:#fff;padding:7px 11px;white-space:nowrap}.filters button.active{border-color:#0b5aa5;background:#eff6ff;color:#0b5aa5}.table-wrap{max-height:420px;overflow:auto;border:1px solid #e6ebf1;border-radius:8px}table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid #edf0f3;text-align:left}th{position:sticky;top:0;background:#f8fafc;color:#64748b;font-size:.75rem}.problem{background:#fff1f2}.badge{display:inline-block;padding:4px 8px;border-radius:999px;font-size:.72rem;font-weight:800}.badge.create{background:#dbeafe;color:#075397}.badge.update{background:#e0f2fe;color:#075397}.badge.duplicate{background:#fff7ed;color:#9a6700}.badge.error{background:#fee2e2;color:#b42318}.detail{display:block}.skip-note{color:#64748b}.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}.done-message{font-weight:700;color:#0f2a44}
@media(max-width:700px){.upload-shell{padding:14px}.steps{gap:12px;justify-content:space-between}.steps li{font-size:.8rem}.upload-card{padding:16px}.template-actions,.actions{flex-direction:column}.template-actions button,.actions button{width:100%}.summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.table-wrap{overflow-x:auto}table{min-width:600px}.selected-file{justify-content:center}.preview-banner{margin:-16px -16px 16px;padding:12px 16px}}
</style>
