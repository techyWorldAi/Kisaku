<template>
  <div class="admin-page-shell min-h-screen bg-gray-50">
    <AdminSidebar />
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <router-link 
              to="/admin/dashboard" 
              class="flex items-center space-x-3 group"
            >
              <img
                class="h-9 w-auto max-w-[180px] object-contain"
                src="/Kisaku_Supply_Agencies_Logo-removebg-preview.png"
                alt="Kisaku Supply Agencies"
              />
            </router-link>
            <div class="h-6 w-px bg-gray-300"></div>
            <h1 class="text-lg font-semibold text-gray-900">{{ employeeView ? 'Employee Management' : 'Account Management' }}</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link 
              to="/admin/dashboard" 
              class="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors duration-300"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span>Dashboard</span>
            </router-link>
            <button 
              @click="handleLogout"
              class="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">{{ employeeView ? 'Employees' : 'Customer and employee accounts' }}</h2>
          <p class="text-gray-600 mt-2">
            {{ employeeView ? 'View staff, sales, vendor support, finance, logistics, and administrator accounts' : 'View customer and employee accounts' }}
          </p>
        </div>
        
        <div class="flex items-center space-x-4">
          <button
            v-if="employeeView && authStore.isAdmin && !isDemoMode()"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
            @click="showEmployeeModal = true"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add employee
          </button>
          <!-- Search -->
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search accounts..." 
              class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200 sm:w-64"
            >
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200/60">
          <div class="admin-list-header grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 uppercase tracking-wider">
            <div class="col-span-4">User</div>
            <div class="col-span-3">Role</div>
            <div class="col-span-2">Orders</div>
            <div class="col-span-2">Joined</div>
            <div class="col-span-1 text-right">Actions</div>
          </div>
        </div>

        <!-- Users List -->
        <div class="divide-y divide-gray-200/60">
          <div 
            v-for="user in filteredUsers" 
            :key="user.id"
            class="admin-list-item px-6 py-4 hover:bg-gray-50/50 transition-colors duration-200"
          >
            <div class="admin-list-row grid grid-cols-12 gap-4 items-center">
              <!-- User Info -->
              <div class="col-span-4">
                <span class="admin-mobile-label">User</span>
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-semibold text-gray-900 truncate">{{ user.name }}</h3>
                    <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
                  </div>
                </div>
              </div>

              <!-- Role -->
              <div class="col-span-3">
                <span class="admin-mobile-label">Role</span>
                <span :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize',
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'sales_agent' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'vendor_support' ? 'bg-teal-100 text-teal-800' :
                        user.role === 'finance' ? 'bg-green-100 text-green-800' :
                          user.role === 'logistics' ? 'bg-amber-100 text-amber-800' :
                            user.role === 'staff' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ user.role.replace('_', ' ') }}
                </span>
              </div>

              <!-- Orders -->
              <div class="col-span-2">
                <span class="admin-mobile-label">Orders</span>
                <span class="text-sm font-semibold text-gray-900">{{ user.ordersCount || 0 }}</span>
                <span class="text-sm text-gray-500 ml-1">orders</span>
              </div>

              <!-- Join Date -->
              <div class="col-span-2">
                <span class="admin-mobile-label">Joined</span>
                <span class="text-sm text-gray-900">{{ formatDate(user.created_at) }}</span>
              </div>

              <!-- Actions -->
              <div class="col-span-1 flex justify-end">
                <button 
                  @click="viewUserOrders(user)"
                  class="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span>Orders</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
          <p class="text-gray-600">
            {{ searchQuery ? 'No users match your search criteria' : 'No users have registered yet' }}
          </p>
        </div>
      </div>

      <div v-if="employeeCreatedMessage" class="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status">
        {{ employeeCreatedMessage }}
      </div>

      <div v-if="showEmployeeModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4">
        <section class="w-full max-w-lg rounded-xl bg-white shadow-2xl" aria-labelledby="create-employee-heading">
          <header class="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
            <div>
              <h2 id="create-employee-heading" class="text-lg font-bold text-gray-900">Create employee account</h2>
              <p class="mt-1 text-sm text-gray-500">Choose the role for this employee.</p>
            </div>
            <button type="button" class="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100" aria-label="Close dialog" @click="closeEmployeeModal">Close</button>
          </header>
          <form class="grid gap-4 p-5" @submit.prevent="createEmployee">
            <p v-if="employeeCreateError" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {{ employeeCreateError }}
            </p>
            <label class="grid gap-1.5 text-sm font-medium text-gray-700">
              Full name
              <input v-model.trim="employeeForm.name" required maxlength="255" autocomplete="name" class="min-h-11 rounded-md border border-gray-300 px-3 font-normal focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
            </label>
            <label class="grid gap-1.5 text-sm font-medium text-gray-700">
              Work email
              <input v-model.trim="employeeForm.email" required type="email" maxlength="255" autocomplete="email" class="min-h-11 rounded-md border border-gray-300 px-3 font-normal focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
            </label>
            <label class="grid gap-1.5 text-sm font-medium text-gray-700">
              Role
              <select v-model="employeeForm.role" required class="min-h-11 rounded-md border border-gray-300 bg-white px-3 font-normal focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="sales_agent">Sales</option>
                <option value="vendor_support">Vendor support</option>
                <option value="finance">Finance</option>
                <option value="logistics">Logistics</option>
              </select>
            </label>
            <label class="grid gap-1.5 text-sm font-medium text-gray-700">
              Temporary password
              <input v-model="employeeForm.password" required type="password" minlength="8" maxlength="128" autocomplete="new-password" class="min-h-11 rounded-md border border-gray-300 px-3 font-normal focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
              <span class="text-xs font-normal text-gray-500">At least 8 characters. Share it through a secure channel.</span>
            </label>
            <footer class="flex flex-col-reverse justify-end gap-2 border-t border-gray-200 pt-4 sm:flex-row">
              <button type="button" class="rounded-md bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200" @click="closeEmployeeModal">
                Cancel
              </button>
              <button type="submit" class="rounded-md bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60" :disabled="creatingEmployee">
                {{ creatingEmployee ? 'Creating account...' : 'Create account' }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { useOrdersStore } from '../../store/orders';
import type { User } from '../../types/checkout';
import { adminAPI, getApiErrorMessage, isDemoMode } from '../../services/api';
import type { CreateEmployeeRequest, EmployeeRole } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const router = useRouter();
const route = useRoute();

const searchQuery = ref('');
const employeeView = computed(() => route.query.view === 'employees');
const showEmployeeModal = ref(false);
const creatingEmployee = ref(false);
const employeeCreateError = ref('');
const employeeCreatedMessage = ref('');
const employeeForm = ref<CreateEmployeeRequest>({
  name: '',
  email: '',
  password: '',
  role: 'sales_agent',
});

const filteredUsers = computed(() => {
  let users = employeeView.value
    ? ordersStore.users.filter(user => user.role !== 'customer')
    : ordersStore.users;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    users = users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }
  
  return users;
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function viewUserOrders(user: User) {
  // Navigate to orders page filtered by user
  router.push(`/admin/orders?user=${user.id}`);
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

function closeEmployeeModal() {
  showEmployeeModal.value = false;
  employeeCreateError.value = '';
  employeeForm.value = { name: '', email: '', password: '', role: 'sales_agent' };
}

function isNotFoundResponse(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('response' in error)) return false;
  const response = error.response;
  return typeof response === 'object'
    && response !== null
    && 'status' in response
    && response.status === 404;
}

async function createEmployee() {
  if (!authStore.isAdmin || creatingEmployee.value) return;
  creatingEmployee.value = true;
  employeeCreateError.value = '';
  employeeCreatedMessage.value = '';

  try {
    const role = employeeForm.value.role;
    const user = await adminAPI.createEmployee(employeeForm.value);
    const roleLabel: Record<EmployeeRole, string> = {
      sales_agent: 'Sales',
      vendor_support: 'Vendor support',
      finance: 'Finance',
      logistics: 'Logistics',
    };
    employeeCreatedMessage.value = `${roleLabel[role]} account created for ${user.name} (${user.email}). Share the temporary password securely.`;
    closeEmployeeModal();
    try {
      await ordersStore.fetchUsers();
    } catch (refreshError) {
      console.error('Employee was created, but the account list could not be refreshed:', refreshError);
      employeeCreatedMessage.value += ' Reload the page to refresh the employee list.';
    }
  } catch (error) {
    console.error('Failed to create an employee account:', error);
    employeeCreateError.value = isNotFoundResponse(error)
      ? 'The server returned 404 for POST /api/admin/users. Check that the employee-creation route is implemented in the backend.'
      : getApiErrorMessage(error, 'Account creation failed. Please try again.');
  } finally {
    creatingEmployee.value = false;
  }
}

onMounted(async () => {
  if (!authStore.canAccessAdmin) {
    router.push('/profile');
    return;
  }

  // Load users
  await ordersStore.fetchUsers();
});
</script>

<style scoped>
.admin-page-shell > header > div {
  padding-left: 52px;
}

@media (min-width: 801px) {
  .admin-page-shell {
    padding-left: 246px;
  }

  .admin-page-shell > header > div {
    padding-left: 0;
  }
}
</style>