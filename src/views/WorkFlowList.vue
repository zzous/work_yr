<template>
  <v-container class="listwrap">
    <!-- 헤더 -->
    <div class="d-flex align-center mb-4">
      <v-icon icon="mdi-image-filter-none" size="24" class="mr-2"></v-icon>
      <h2 class="text-h6 font-weight-medium">워크플로우목록 ({{ filteredWorkflows.length }})</h2>
    </div>

    <!-- 검색 및 상단 컨트롤 -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="제목으로 검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center justify-end">
        <span class="text-body-2 mr-4">Date: {{ currentDateTime }}</span>
        <v-btn
          icon="mdi-refresh"
          variant="text"
          size="small"
          @click="refresh"
        ></v-btn>
        <v-select
          v-model="itemsPerPage"
          :items="[10, 20, 50, 100]"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 80px; margin-left: 8px;"
          @update:model-value="onItemsPerPageChange"
        ></v-select>
      </v-col>
    </v-row>

    <!-- 테이블 -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="workflows"
        :items-per-page="itemsPerPage"
      >
      <template v-slot:item="{ item }">
        <tr>
          <td style="text-align: left;">{{ item.documentNumber }}</td>
          <td style="text-align: left;">{{ item.workflowName }}</td>
          <td style="text-align: left;">{{ item.workType }}</td>
          <td style="text-align: left;">{{ item.createDate }}</td>
        </tr>
      </template>
      </v-data-table>
    </v-card>

    <!-- 페이지네이션 및 등록 버튼 -->
    <div class="d-flex align-center justify-space-between mt-4">
      <v-pagination
        v-model="page"
        :length="Math.ceil(filteredWorkflows.length / itemsPerPage)"
        :total-visible="5"
        density="compact"
        @update:model-value="onPageChange"
      ></v-pagination>
      <v-btn
        color="primary"
        variant="outlined"
        @click="addWorkflow"
      >
        워크플로우 등록
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import workflow_data from '../data/workflow_data.json'

const router = useRouter()

// 워크플로우 데이터
const workflows = ref(workflow_data)

const searchQuery = ref('')
const page = ref(1)
const itemsPerPage = ref(10)

// 테이블 헤더 정의
const headers = [
  {
    title: '문서번호',
    key: 'documentNumber',
    align: 'start',
    sortable: false,
    width: '120px'
  },
  {
    title: '워크 플로우 명',
    key: 'workflowName',
    align: 'start',
    sortable: false,
  },
  {
    title: '업무유형',
    key: 'workType',
    align: 'start',
    sortable: false,
    width: '150px'
  },
  {
    title: '작성일자',
    key: 'createDate',
    align: 'start',
    sortable: true,
    width: '200px'
  }
]

// 현재 날짜/시간
const currentDateTime = ref(new Date().toLocaleString('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
}).replace(/\./g, '-').replace(/,/g, ''))

// 검색 필터링된 데이터
const filteredWorkflows = computed(() => workflows.value)

// 새로고침
const refresh = () => {
  currentDateTime.value = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\./g, '-').replace(/,/g, '')
}

// 등록 버튼 클릭
const addWorkflow = () => {
  router.push('/workflow/create')
}

// 페이지 변경 핸들러
const onPageChange = (newPage) => {
  page.value = newPage
}

// 페이지당 항목 수 변경 핸들러
const onItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage
  page.value = 1
}
</script>

<style scoped>
/* 테이블 스타일 커스터마이징 */
/* :deep(.v-data-table) {
  background-color: white;
}

:deep(.v-data-table__thead th) {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
  text-align: left !important;
}

:deep(.v-data-table__tbody tr:hover) {
  background-color: #f9f9f9;
}

:deep(.v-data-table__tbody td) {
  padding: 12px 16px;
  text-align: left !important;
}

:deep(.v-data-table__thead th .v-data-table-header__content) {
  text-align: left !important;
  justify-content: flex-start !important;
}

:deep(.v-data-table__tbody td .v-data-table__td-content) {
  text-align: left !important;
  justify-content: flex-start !important;
} */
</style>