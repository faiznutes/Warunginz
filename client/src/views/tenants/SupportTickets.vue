<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-[#0d141b] dark:text-white text-3xl font-bold leading-tight tracking-tight">Support Tickets</h1>
        <p class="text-[#4c739a] dark:text-slate-400 mt-2">View and manage tenant support requests, track issues, and assign agents.</p>
      </div>
      <div class="flex gap-3">
        <div class="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <div class="flex flex-col">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">High Priority</span>
            <span class="text-sm font-bold text-[#0d141b] dark:text-white">{{ highPriorityCount }} Active</span>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <span class="flex h-2 w-2 rounded-full bg-blue-500"></span>
          <div class="flex flex-col">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Open Tickets</span>
            <span class="text-sm font-bold text-[#0d141b] dark:text-white">{{ openTicketCount }} Total</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center z-20">
      <div class="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1">
        <div class="relative w-full md:w-80">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
          <input 
            v-model="searchQuery"
            @input="debouncedSearch" 
            class="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white dark:placeholder:text-slate-500" 
            placeholder="Search by Ticket ID, Subject..." 
            type="text"
          />
        </div>
        <div class="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select v-model="statusFilter" @change="loadTickets" class="form-select text-sm rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-primary min-w-[140px] py-2.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select v-model="priorityFilter" @change="loadTickets" class="form-select text-sm rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-primary min-w-[140px] py-2.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <button @click="showCreateModal = true" class="w-full xl:w-auto px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
        <span class="material-symbols-outlined text-[20px]">add_circle</span>
        Create New Ticket
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Ticket Table -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
      <div class="overflow-x-auto min-h-[400px]">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-6 py-4 w-[140px]">Ticket ID</th>
              <th class="px-6 py-4">Subject</th>
              <th class="px-6 py-4 w-[120px]">Priority</th>
              <th class="px-6 py-4 w-[140px]">Status</th>
              <th class="px-6 py-4 w-[160px]">Assigned To</th>
              <th class="px-6 py-4 w-[180px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="ticket in tickets" :key="ticket.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
              <td class="px-6 py-4">
                <span class="text-sm font-mono font-medium text-primary">#{{ ticket.id.substring(0, 8) }}</span>
                <div class="text-[10px] text-slate-400 mt-0.5">{{ formatTimeAgo(ticket.createdAt) }}</div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-[#0d141b] dark:text-white">{{ ticket.subject }}</p>
                <p class="text-xs text-slate-500 truncate max-w-[300px]">{{ ticket.description }}</p>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold"
                  :class="getPriorityClass(ticket.priority)"
                >
                  <span class="material-symbols-outlined text-[14px]">{{ getPriorityIcon(ticket.priority) }}</span>
                  {{ ticket.priority }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(ticket.status)"
                >
                  <span class="size-1.5 rounded-full" :class="getStatusDotClass(ticket.status)"></span>
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div v-if="ticket.assignedTo" class="flex items-center gap-2">
                  <div class="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {{ ticket.assignedTo.name?.charAt(0) || 'A' }}
                  </div>
                  <span class="text-sm text-slate-700 dark:text-slate-300">{{ ticket.assignedTo.name || 'Agent' }}</span>
                </div>
                <span v-else class="text-xs text-slate-400 italic">Unassigned</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="viewTicket(ticket)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-primary transition-colors" title="View Details">
                    <span class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <button @click="assignTicket(ticket)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-600 transition-colors" title="Assign Agent">
                    <span class="material-symbols-outlined text-[18px]">person_add</span>
                  </button>
                  <button @click="addNote(ticket)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-green-600 transition-colors" title="Add Note">
                    <span class="material-symbols-outlined text-[18px]">add_comment</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="tickets.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                <span class="material-symbols-outlined text-4xl mb-2 block">confirmation_number</span>
                Tidak ada tiket ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <p class="text-sm text-slate-500">Halaman {{ pagination.page }} dari {{ pagination.totalPages }}</p>
        <div class="flex gap-2">
          <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700">Prev</button>
          <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700">Next</button>
        </div>
      </div>
    </div>

    <!-- Create Ticket Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showCreateModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Create New Ticket</h3>
            <button @click="showCreateModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form @submit.prevent="submitTicket" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject *</label>
              <input v-model="newTicket.subject" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm" placeholder="Brief description of the issue" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description *</label>
              <textarea v-model="newTicket.description" required rows="4" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm resize-none" placeholder="Detailed description..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
              <select v-model="newTicket.priority" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="flex gap-3 pt-4">
              <button type="button" @click="showCreateModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
              <button type="submit" :disabled="submitting" class="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                {{ submitting ? 'Creating...' : 'Create Ticket' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- View Ticket Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal && selectedTicket" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showDetailModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedTicket.subject }}</h3>
              <p class="text-sm text-slate-500">#{{ selectedTicket.id?.substring(0, 8) }}</p>
            </div>
            <button @click="showDetailModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Status</p>
                <span :class="getStatusClass(selectedTicket.status)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium">{{ getStatusLabel(selectedTicket.status) }}</span>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Priority</p>
                <span :class="getPriorityClass(selectedTicket.priority)" class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold">{{ selectedTicket.priority }}</span>
              </div>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-2">Description</h4>
              <p class="text-slate-600 dark:text-slate-300 whitespace-pre-line">{{ selectedTicket.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Assign Agent Modal -->
    <Teleport to="body">
      <div v-if="showAssignModal && selectedTicket" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAssignModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Assign Agent</h3>
            <button @click="showAssignModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-slate-500">Assign an agent to ticket #{{ selectedTicket.id?.substring(0, 8) }}</p>
            <select v-model="assigneeId" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm">
              <option value="">Select Agent</option>
              <option v-for="agent in agents" :key="agent.id" :value="agent.id">{{ agent.name }}</option>
            </select>
            <div class="flex gap-3 pt-2">
              <button @click="showAssignModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
              <button @click="confirmAssign" :disabled="!assigneeId || assigning" class="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                {{ assigning ? 'Assigning...' : 'Assign' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Note Modal -->
    <Teleport to="body">
      <div v-if="showNoteModal && selectedTicket" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showNoteModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Add Note</h3>
            <button @click="showNoteModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <textarea v-model="noteContent" rows="4" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm resize-none" placeholder="Add your note..."></textarea>
            <div class="flex gap-3">
              <button @click="showNoteModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
              <button @click="confirmAddNote" :disabled="!noteContent || addingNote" class="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                {{ addingNote ? 'Adding...' : 'Add Note' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotification } from '../../composables/useNotification';
import api from '../../api';

const { success: showSuccess, error: showError } = useNotification();

interface Agent {
  id: string;
  name: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  assignedTo?: Agent;
}

const loading = ref(true);
const submitting = ref(false);
const assigning = ref(false);
const addingNote = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const priorityFilter = ref('');
const tickets = ref<Ticket[]>([]);
const agents = ref<Agent[]>([]);

// Modals
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const showAssignModal = ref(false);
const showNoteModal = ref(false);
const selectedTicket = ref<Ticket | null>(null);
const assigneeId = ref('');
const noteContent = ref('');

const newTicket = ref({
  subject: '',
  description: '',
  priority: 'medium',
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

let searchTimeout: any = null;

const highPriorityCount = computed(() => tickets.value.filter(t => t.priority === 'high' && t.status !== 'resolved' && t.status !== 'closed').length);
const openTicketCount = computed(() => tickets.value.filter(t => t.status === 'open' || t.status === 'in_progress').length);

const loadTickets = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.value.page, limit: pagination.value.limit };
    if (searchQuery.value) params.search = searchQuery.value;
    if (statusFilter.value) params.status = statusFilter.value;
    if (priorityFilter.value) params.priority = priorityFilter.value;

    const response = await api.get('/support/tickets', { params });
    const data = response.data;
    tickets.value = data.data || [];
    pagination.value = {
      page: data.page || 1,
      limit: data.limit || 20,
      total: data.total || 0,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error('Error loading tickets:', error);
  } finally {
    loading.value = false;
  }
};

const loadAgents = async () => {
  try {
    const response = await api.get('/users', { params: { role: 'support' } });
    agents.value = response.data.data || response.data || [];
  } catch {
    // Fallback agents
    agents.value = [
      { id: '1', name: 'Support Agent 1' },
      { id: '2', name: 'Support Agent 2' },
    ];
  }
};

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    loadTickets();
  }, 500);
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadTickets();
};

const viewTicket = (ticket: any) => {
  selectedTicket.value = ticket;
  showDetailModal.value = true;
};

const assignTicket = (ticket: any) => {
  selectedTicket.value = ticket;
  assigneeId.value = ticket.assignedTo?.id || '';
  showAssignModal.value = true;
};

const addNote = (ticket: any) => {
  selectedTicket.value = ticket;
  noteContent.value = '';
  showNoteModal.value = true;
};

const submitTicket = async () => {
  submitting.value = true;
  try {
    await api.post('/support/tickets', newTicket.value);
    showSuccess('Ticket berhasil dibuat!');
    showCreateModal.value = false;
    newTicket.value = { subject: '', description: '', priority: 'medium' };
    loadTickets();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal membuat ticket');
  } finally {
    submitting.value = false;
  }
};

const confirmAssign = async () => {
  if (!assigneeId.value || !selectedTicket.value) return;
  assigning.value = true;
  try {
    await api.put(`/support/tickets/${selectedTicket.value.id}/assign`, { agentId: assigneeId.value });
    showSuccess('Agent berhasil ditugaskan!');
    showAssignModal.value = false;
    loadTickets();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menugaskan agent');
  } finally {
    assigning.value = false;
  }
};

const confirmAddNote = async () => {
  if (!noteContent.value || !selectedTicket.value) return;
  addingNote.value = true;
  try {
    await api.post(`/support/tickets/${selectedTicket.value.id}/notes`, { content: noteContent.value });
    showSuccess('Catatan berhasil ditambahkan!');
    showNoteModal.value = false;
    loadTickets();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menambah catatan');
  } finally {
    addingNote.value = false;
  }
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    high: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  return classes[priority?.toLowerCase()] || classes.medium;
};

const getPriorityIcon = (priority: string) => {
  const icons: Record<string, string> = { high: 'priority_high', medium: 'remove', low: 'keyboard_arrow_down' };
  return icons[priority?.toLowerCase()] || 'remove';
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    resolved: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  };
  return classes[status?.toLowerCase()] || classes.open;
};

const getStatusDotClass = (status: string) => {
  const classes: Record<string, string> = { open: 'bg-blue-500', in_progress: 'bg-yellow-500', resolved: 'bg-green-500', closed: 'bg-slate-500' };
  return classes[status?.toLowerCase()] || 'bg-blue-500';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };
  return labels[status?.toLowerCase()] || status;
};

onMounted(() => {
  loadTickets();
  loadAgents();
});
</script>
