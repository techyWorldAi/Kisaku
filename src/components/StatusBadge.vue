<script setup lang="ts">
defineProps<{ status: string }>();
const labels: Record<string, string> = { active:'Active', pending:'Waiting for approval', confirmed:'Confirmed', shipped:'Sent to Kisaku store', received:'Received', disabled:'Disabled', suspended:'Suspended', cancelled:'Cancelled', out_of_stock:'Out of stock' };
</script>
<template><span class="status-badge" :class="`status-${status}`">{{ labels[status] ?? status }}</span></template>
<style scoped>.status-badge{display:inline-flex;align-items:center;justify-content:center;min-height:24px;padding:3px 8px;border-radius:999px;background:#edf2f7;color:#526579;font-size:.72rem;font-weight:800}.status-active,.status-received{background:#e6f7ec;color:#18794e}.status-pending,.status-confirmed{background:#fff2d9;color:#9a5a00}.status-shipped{background:#e6effa;color:#075397}.status-disabled,.status-suspended,.status-cancelled{background:#feeaea;color:#b42318}.status-out_of_stock{background:#eef0f3;color:#475569}</style>