<template>
  <div class="admin-page-shell min-h-screen bg-gray-50">
    <AdminSidebar />
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
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
            {{ employeeView ? 'View staff and administrator access accounts' : 'View customer, staff and administrator accounts' }}
          </p>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Search -->
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search accounts..." 
              class="w-64 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
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
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ user.role }}
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { useOrdersStore } from '../../store/orders';
import type { User } from '../../types/checkout';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const router = useRouter();
const route = useRoute();

const searchQuery = ref('');
const employeeView = computed(() => route.query.view === 'employees');

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