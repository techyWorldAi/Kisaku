<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RefreshCw, ScrollText } from 'lucide-vue-next';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import { auditAPI, getApiErrorMessage } from '../../services/api';
import type { AuditLogRecord } from '../../services/api';
import { useAuthStore } from '../../store/auth';

const authStore = useAuthStore();
const router = useRouter();
const logs = ref<AuditLogRecord[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const actionFilter = ref('');

const actions = computed(() => [...new Set(logs.value.map((entry) => entry.action).filter(
  (action): action is string => Boolean(action),
))].sort());
const filteredLogs = computed(() => logs.value.filter((entry) => (
  !actionFilter.value || entry.action === actionFilter.value
)));

function actorName(entry: AuditLogRecord) {
  if (typeof entry.actor_name === 'string') return entry.actor_name;
  if (typeof entry.actor === 'string') return entry.actor;
  if (typeof entry.actor === 'object' && entry.actor !== null && 'name' in entry.actor) {
    const name = entry.actor.name;
    if (typeof name === 'string') return name;
  }
  return entry.actor_id ? `User #${entry.actor_id}` : 'System';
}

function formatAction(action?: string) {
  if (!action) return 'Activity recorded';
  return action
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTarget(entry: AuditLogRecord) {
  const type = entry.target_type;
  const id = entry.target_id;
  if (typeof type === 'string' && (typeof id === 'number' || typeof id === 'string')) {
    return `${type} #${id}`;
  }
  if (typeof entry.target === 'string') return entry.target;
  return '—';
}

function formatDetails(details: unknown) {
  if (details === null || details === undefined || details === '') return '—';
  if (typeof details === 'string') return details;
  try {
    return JSON.stringify(details);
  } catch (error) {
    console.error('Could not format audit log details:', error);
    return 'Details unavailable';
  }
}

function formatDate(value?: string) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

async function loadLogs() {
  loading.value = true;
  errorMessage.value = '';
  try {
    logs.value = await auditAPI.getAuditLogs();
  } catch (error) {
    console.error('Failed to load administrator audit logs:', error);
    errorMessage.value = getApiErrorMessage(error, 'Audit logs could not be loaded. Try again.');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!authStore.isAdmin) {
    void router.replace('/profile');
    return;
  }
  void loadLogs();
});
</script>

<template>
  <div class="audit-page">
    <AdminSidebar />

    <div class="audit-content">
      <header class="audit-topbar">Administration <span>/</span> Audit logs</header>
      <main class="audit-main">
        <section class="audit-heading">
          <div class="audit-icon"><ScrollText :size="21" /></div>
          <div>
            <p class="audit-eyebrow">ADMINISTRATION</p>
            <h1>Audit logs</h1>
            <p>Review administrative account, payment, and order-status activity.</p>
          </div>
          <button type="button" class="refresh-button" :disabled="loading" @click="loadLogs">
            <RefreshCw :size="16" :class="{ spinning: loading }" />
            Refresh
          </button>
        </section>

        <div class="audit-toolbar">
          <div>
            <strong>{{ filteredLogs.length }}</strong>
            <span> recent events</span>
          </div>
          <label>
            <span class="sr-only">Filter audit events</span>
            <select v-model="actionFilter">
              <option value="">All activity</option>
              <option v-for="action in actions" :key="action" :value="action">{{ formatAction(action) }}</option>
            </select>
          </label>
        </div>

        <div v-if="errorMessage" class="audit-error" role="alert">
          <span>{{ errorMessage }}</span>
          <button type="button" @click="loadLogs">Try again</button>
        </div>
        <div v-else-if="loading" class="audit-empty">Loading audit events…</div>
        <div v-else-if="!filteredLogs.length" class="audit-empty">
          {{ actionFilter ? 'No events match this filter.' : 'No audit events have been recorded yet.' }}
        </div>
        <div v-else class="audit-list">
          <article
            v-for="(entry, index) in filteredLogs"
            :key="entry.id ?? `${entry.created_at}-${entry.action}-${index}`"
            class="audit-entry"
          >
            <div class="event-mark" />
            <div class="event-main">
              <div class="event-title-row">
                <strong>{{ formatAction(entry.action ?? entry.event) }}</strong>
                <time>{{ formatDate(entry.created_at) }}</time>
              </div>
              <div class="event-meta">
                <span>By {{ actorName(entry) }}</span>
                <span>{{ formatTarget(entry) }}</span>
              </div>
              <details v-if="entry.details !== undefined && entry.details !== null" class="event-details">
                <summary>View event details</summary>
                <pre>{{ formatDetails(entry.details) }}</pre>
              </details>
            </div>
          </article>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.audit-page { min-height: 100vh; background: #f5f7fa; }
.audit-content { min-width: 0; min-height: 100vh; margin-left: 246px; }
.audit-topbar { position: sticky; z-index: 20; top: 0; padding: 21px 34px; border-bottom: 1px solid #e3e8ee; background: rgb(255 255 255 / 94%); color: #64748b; font-size: .8rem; backdrop-filter: blur(12px); }
.audit-topbar span { margin: 0 7px; color: #a0acb9; }
.audit-main { width: min(1120px, 100%); margin: 0 auto; padding: 30px clamp(18px, 3vw, 42px) 48px; }
.audit-heading { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 21px; }
.audit-icon { display: flex; width: 44px; height: 44px; flex: 0 0 auto; align-items: center; justify-content: center; border-radius: 8px; background: #eaf2f8; color: #075397; }
.audit-heading > div:nth-child(2) { min-width: 0; flex: 1; }
.audit-eyebrow { margin: 0 0 5px; color: #a65c11; font-size: .65rem; font-weight: 800; letter-spacing: .1em; }
.audit-heading h1 { margin: 0; color: #102a43; font-size: clamp(1.4rem, 3vw, 1.8rem); letter-spacing: -.035em; }
.audit-heading p:last-child { margin: 7px 0 0; color: #64748b; font-size: .82rem; line-height: 1.5; }
.refresh-button { display: inline-flex; min-height: 38px; align-items: center; gap: 7px; padding: 0 11px; border: 1px solid #d5dee7; border-radius: 5px; background: #fff; color: #334155; font: inherit; font-size: .75rem; font-weight: 700; cursor: pointer; }
.refresh-button:disabled { opacity: .6; cursor: wait; }
.spinning { animation: spin 1s linear infinite; }
.audit-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 11px; padding: 12px 15px; border: 1px solid #e3e8ee; border-radius: 7px; background: #fff; color: #64748b; font-size: .77rem; }
.audit-toolbar strong { color: #20394f; }
.audit-toolbar select { min-height: 35px; max-width: 100%; padding: 6px 9px; border: 1px solid #d5dee7; border-radius: 5px; background: #fff; color: #334155; font: inherit; }
.audit-list { overflow: hidden; border: 1px solid #e3e8ee; border-radius: 7px; background: #fff; }
.audit-entry { display: flex; gap: 13px; padding: 16px; border-bottom: 1px solid #edf0f3; }
.audit-entry:last-child { border-bottom: 0; }
.event-mark { width: 9px; height: 9px; flex: 0 0 auto; margin-top: 6px; border-radius: 50%; background: #f58216; box-shadow: 0 0 0 4px #fff3e7; }
.event-main { min-width: 0; flex: 1; }
.event-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.event-title-row strong { color: #20394f; font-size: .82rem; }
.event-title-row time { flex: 0 0 auto; color: #718096; font-size: .7rem; }
.event-meta { display: flex; flex-wrap: wrap; gap: 7px 15px; margin-top: 6px; color: #64748b; font-size: .72rem; }
.event-details { margin-top: 9px; color: #526579; font-size: .72rem; }
.event-details summary { width: fit-content; color: #075397; font-weight: 650; cursor: pointer; }
.event-details pre { overflow: auto; margin: 8px 0 0; padding: 10px; border-radius: 5px; background: #f5f7fa; color: #334155; font: .7rem/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
.audit-empty { padding: 44px 15px; border: 1px solid #e3e8ee; border-radius: 7px; background: #fff; color: #64748b; font-size: .82rem; text-align: center; }
.audit-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px; border: 1px solid #fecaca; border-radius: 6px; background: #fef2f2; color: #991b1b; font-size: .78rem; }
.audit-error button { border: 0; background: transparent; color: #075397; font: inherit; font-weight: 700; cursor: pointer; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 800px) { .audit-content { margin-left: 0; } .audit-topbar { padding-left: 64px; } }
@media (max-width: 540px) { .audit-main { padding: 21px 12px 32px; } .audit-heading { flex-wrap: wrap; } .refresh-button { margin-left: auto; } .event-title-row { flex-direction: column; gap: 5px; } }
</style>
