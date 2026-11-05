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
              <div class="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-black text-sm">K</span>
              </div>
              <span class="text-xl font-black text-gray-900 group-hover:text-yellow-600 transition-colors">
                KISAKU
              </span>
            </router-link>
            <div class="h-6 w-px bg-gray-300"></div>
            <h1 class="text-lg font-semibold text-gray-900">Product Management</h1>
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
          <h2 class="text-3xl font-bold text-gray-900">Products</h2>
          <p class="text-gray-600 mt-2">Manage your product catalog and inventory</p>
        </div>
        <button 
          @click="showAddModal = true"
          class="group flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-yellow-500/25 hover:scale-105 transition-all duration-300 font-semibold"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Add Product</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p class="text-gray-600">Loading products...</p>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200/60">
          <div class="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 uppercase tracking-wider">
            <div class="col-span-3">Product</div>
            <div class="col-span-2">Category</div>
            <div class="col-span-2">Price</div>
            <div class="col-span-2">Stock</div>
            <div class="col-span-3 text-right">Actions</div>
          </div>
        </div>

        <!-- Products List -->
        <div class="divide-y divide-gray-200/60">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="px-6 py-4 hover:bg-gray-50/50 transition-colors duration-200"
          >
            <div class="grid grid-cols-12 gap-4 items-center">
              <!-- Product Info -->
              <div class="col-span-3">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                    <img 
                      v-if="product.image && product.image.startsWith('data:image')" 
                      :src="product.image" 
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    >
                    <img 
                      v-else-if="product.image" 
                      :src="product.image" 
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    >
                    <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-semibold text-gray-900 truncate">{{ product.name }}</h3>
                    <p class="text-sm text-gray-500 line-clamp-1">{{ product.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Category -->
              <div class="col-span-2">
                <span v-if="product.category" class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {{ product.category.name }}
                </span>
                <span v-else class="text-sm text-gray-500">No category</span>
              </div>

              <!-- Price -->
              <div class="col-span-2">
                <span class="text-sm font-semibold text-gray-900">Ksh {{ product.price?.toLocaleString() }}</span>
              </div>

              <!-- Stock -->
              <div class="col-span-2">
                <span :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                  product.stock > 10 ? 'bg-green-100 text-green-800' : 
                  product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                ]">
                  {{ product.stock }} in stock
                </span>
              </div>

              <!-- Actions -->
              <div class="col-span-3 flex justify-end space-x-3">
                <button 
                  @click="editProduct(product)"
                  class="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  <span>Edit</span>
                </button>
                <button 
                  @click="deleteProduct(product.id)"
                  class="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="products.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
          <p class="text-gray-600 mb-6">Get started by adding your first product to the store.</p>
          <button 
            @click="showAddModal = true"
            class="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-yellow-500/25 hover:scale-105 transition-all duration-300 font-semibold"
          >
            Add Your First Product
          </button>
        </div>
      </div>
    </main>

    <!-- Add/Edit Product Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div class="relative min-h-full flex items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200/60">
          <!-- Header -->
          <div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 rounded-t-2xl">
            <h3 class="text-lg font-semibold text-white">
              {{ showEditModal ? 'Edit Product' : 'Add New Product' }}
            </h3>
          </div>
          
          <!-- Form -->
          <form @submit.prevent="submitProduct" class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column -->
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    v-model="productForm.name"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    v-model="productForm.description"
                    required
                    rows="4"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    placeholder="Describe the product..."
                  ></textarea>
                </div>

                <!-- Category Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    v-model="productForm.category_id"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                  >
                    <option value="">Select a category</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Right Column -->
              <div class="space-y-6">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Price (Ksh)</label>
                    <input
                      v-model.number="productForm.price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                    <input
                      v-model.number="productForm.stock"
                      type="number"
                      min="0"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                      placeholder="0"
                    />
                  </div>
                </div>

                <!-- Image Upload Section -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  
                  <!-- Image Preview -->
                  <div v-if="imagePreview" class="mb-4">
                    <img :src="imagePreview" alt="Image preview" class="w-32 h-32 object-cover rounded-lg border border-gray-300">
                  </div>

                  <!-- File Upload -->
                  <div class="flex items-center justify-center w-full">
                    <label for="image-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p class="mb-2 text-sm text-gray-500">
                          <span class="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p class="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 2MB)</p>
                      </div>
                      <input 
                        id="image-upload" 
                        type="file" 
                        class="hidden" 
                        accept="image/*"
                        @change="handleImageUpload"
                      />
                    </label>
                  </div>

                  <!-- Or URL Input -->
                  <div class="mt-4">
                    <p class="text-sm text-gray-600 mb-2 text-center">- OR -</p>
                    <input
                      v-model="productForm.image"
                      type="url"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                      placeholder="https://example.com/image.jpg"
                      @input="clearImagePreview"
                    />
                    <p class="text-xs text-gray-500 mt-2">Enter image URL or upload a file</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
              >
                {{ submitting ? 'Saving...' : (showEditModal ? 'Update Product' : 'Create Product') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { productAPI } from '../../services/api';
import type { Product, Category } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const authStore = useAuthStore();
const router = useRouter();

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(false);
const submitting = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingProductId = ref<number | null>(null);
const imagePreview = ref<string | null>(null);

const productForm = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  image: '',
  category_id: 0
});

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

function resetForm() {
  productForm.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    category_id: 0
  };
  imagePreview.value = null;
  editingProductId.value = null;
}

function closeModal() {
  showAddModal.value = false;
  showEditModal.value = false;
  resetForm();
}

function editProduct(product: Product) {
  productForm.value = { 
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    image: product.image,
    category_id: product.category_id || 0
  };
  editingProductId.value = product.id;
  
  // Set image preview if image exists
  if (product.image) {
    if (product.image.startsWith('data:image')) {
      imagePreview.value = product.image;
    } else {
      imagePreview.value = product.image;
    }
  } else {
    imagePreview.value = null;
  }
  
  showEditModal.value = true;
}

function clearImagePreview() {
  imagePreview.value = null;
}

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file (PNG, JPG, JPEG)');
    return;
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image size should be less than 2MB');
    return;
  }

  // Create file reader to convert image to base64
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const base64String = e.target?.result as string;
    
    // Set the base64 string to the image field
    productForm.value.image = base64String;
    
    // Set preview
    imagePreview.value = base64String;
  };
  
  reader.onerror = () => {
    alert('Error reading file. Please try again.');
  };
  
  reader.readAsDataURL(file);
}

async function fetchProducts() {
  loading.value = true;
  try {
    const data = await productAPI.getProducts();
    products.value = data;
  } catch (error: any) {
    console.error('Failed to fetch admin products.');
    if (error.response?.status === 401) {
      alert('Session expired. Please login again.');
      authStore.logout();
      router.push('/login');
    } else {
      alert('Failed to fetch products. Please try again.');
    }
  } finally {
    loading.value = false;
  }
}

async function fetchCategories() {
  try {
    const data = await productAPI.getCategories();
    categories.value = data;
  } catch (error: any) {
    console.error('Failed to fetch product categories.');
    alert('Failed to load categories. Please try again.');
  }
}

async function submitProduct() {
  submitting.value = true;
  
  try {
    // Prepare the product data
    const productData = {
      ...productForm.value,
      // Ensure price, stock, and category_id are numbers
      price: Number(productForm.value.price),
      stock: Number(productForm.value.stock),
      category_id: Number(productForm.value.category_id)
    };

    // Validate category
    if (!productData.category_id || productData.category_id === 0) {
      alert('Please select a category');
      submitting.value = false;
      return;
    }

    if (editingProductId.value) {
      await productAPI.updateProduct(editingProductId.value, productData);
    } else {
      await productAPI.createProduct(productData);
    }
    
    await fetchProducts(); // Refresh the list
    closeModal();
    alert(editingProductId.value ? 'Product updated successfully!' : 'Product created successfully!');
  } catch (error: any) {
    console.error('Failed to save product.');
    if (error.response?.status === 401) {
      alert('Session expired. Please login again.');
      authStore.logout();
      router.push('/login');
    } else {
      alert(error.response?.data?.error || 'Failed to save product');
    }
  } finally {
    submitting.value = false;
  }
}

async function deleteProduct(productId: number) {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    return;
  }
  
  try {
    await productAPI.deleteProduct(productId);
    await fetchProducts(); // Refresh the list
    alert('Product deleted successfully!');
  } catch (error: any) {
    console.error('Failed to delete product.');
    if (error.response?.status === 401) {
      alert('Session expired. Please login again.');
      authStore.logout();
      router.push('/login');
    } else {
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  }
}

onMounted(async () => {
  // Check if user is admin and authenticated
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  if (!authStore.canAccessAdmin) {
    router.push('/profile');
    return;
  }

  await Promise.all([fetchProducts(), fetchCategories()]);
});
</script>

<style scoped>
.admin-page-shell > header > div {
  padding-left: 52px;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
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