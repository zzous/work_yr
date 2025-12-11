<template>
  <v-container class="listwrap">
    <!-- 헤더 -->
    <div class="hwrap">
      <v-icon icon="mdi-image-filter-none" size="24" class="title-icon"></v-icon>
      <h2 class="title-text">워크플로우목록 ({{ filteredWorkflows.length }})</h2>
    </div>

    <v-card class="cwrap">
      <!-- 검색 및 상단 컨트롤 -->
      <v-row class="">
        <v-col cols="12" md="6">
          <v-text-field v-model="searchText" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact"
            class="search-input" hide-details clearable label="제목으로 검색" append-inner-icon="mdi-triangle-small-down"
            @click:append-inner="refresh"></v-text-field>
        </v-col>
        <v-col cols="12" md="6" class="d-flex align-center justify-end">
          <span class="text-body-2 mr-4">Date: 2025-11-26 11:28:11</span>
          <v-btn icon="mdi-sync-circle" variant="text" size="medium" @click="refresh"></v-btn>
          <v-select v-model="itemsPerPage" :items="[10, 20, 50, 100]" variant="outlined" density="compact" hide-details
            style="max-width: 80px; margin-left: 8px;" @update:model-value="onItemsPerPageChange"></v-select>
        </v-col>
      </v-row>

      <!-- 테이블 -->

      <v-data-table :headers="headers" :items="workflows" :items-per-page="itemsPerPage" hide-default-footer>
        <template v-slot:item="{ item }">
          <tr>
            <td style="text-align: left;">{{ item.documentNumber }}</td>
            <td style="text-align: left;">{{ item.workflowName }}<v-icon icon="mdi-open-in-new" size="16"></v-icon>
            </td>
            <td style="text-align: left;">{{ item.workType }}</td>
            <td style="text-align: left;">{{ item.createDate }}</td>
          </tr>
        </template>
      </v-data-table>

      <!-- 페이지네이션 및 등록 버튼 -->
      <div class="page-wrap">
        <v-pagination v-model="page" :length="Math.ceil(filteredWorkflows.length / itemsPerPage)" :total-visible="5"
          density="compact" @update:model-value="onPageChange"></v-pagination>

      </div>
    </v-card>

    <v-btn class="add-wf-btn" color="primary" @click="addWorkflow">
      워크플로우 등록
    </v-btn>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import workflow_data from '../data/workflow_data.json'

const router = useRouter()

// 워크플로우 데이터
const workflows = ref(workflow_data)
const searchText = ref('')
const page = ref(1)
const itemsPerPage = ref(10)

// 테이블 헤더 정의
const headers = [
  { title: '문서번호', key: 'documentNumber', align: 'start', sortable: false, width: '120px' },
  { title: '워크 플로우 명', key: 'workflowName', align: 'start', sortable: false },
  { title: '업무유형', key: 'workType', align: 'start', sortable: false, width: '150px' },
  { title: '작성일자', key: 'createDate', align: 'start', sortable: true, width: '200px' }
]

// 검색 필터링된 데이터
const filteredWorkflows = computed(() => workflows.value)

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
:deep(.v-data-table) {
  background-color: white !important;
}

/* 헤더와 컬럼 공통 스타일 */
:deep(.v-data-table__thead th),
:deep(.v-data-table__tbody td) {
  padding: 12px 16px;
  text-align: left !important;
  font-size: 14px;
  line-height: 1.5;
  border-bottom: 1px solid #e0e0e0;
}

/* 헤더 스타일 */
:deep(.v-data-table__thead th) {
  background-color: olivedrab !important;
  font-weight: 600;
  color: #333;
  border: 1px solid 2B2B2B !important;
}

/* 컬럼 스타일 */
:deep(.v-data-table__tbody td) {
  background-color: white;
  color: #333;
}

/* 행 호버 효과 */
:deep(.v-data-table__tbody tr:hover td) {
  background-color: #f9f9f9;
}

/* 헤더와 컬럼 컨텐츠 정렬 */
:deep(.v-data-table__thead th .v-data-table-header__content),
:deep(.v-data-table__tbody td .v-data-table__td-content) {
  text-align: left !important;
  justify-content: flex-start !important;
}

:deep(.v-data-table__tbody td) {
  background-color: white;
  color: #333;
}
</style>