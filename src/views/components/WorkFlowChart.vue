<template>
  <div class="workflow-chart">
    <!-- 헤더 -->
    <div class="workflow-header">
      <h3 class="workflow-title">{{ groupName || '변경관리' }}</h3>
      <div class="workflow-actions">
        <v-btn
          variant="outlined"
          color="error"
          size="small"
          class="mr-2"
          @click="openAddWorkModal"
        >
          + WORK 추가
        </v-btn>
        <v-btn
          variant="outlined"
          color="error"
          size="small"
          @click="removeWork"
        >
          - WORK GROUP 삭제
        </v-btn>
      </div>
    </div>

    <EditWorkItemModal
      v-model="showAddWorkModal"
      @confirm="handleWorkAdded"
    />

    <!-- 워크플로우 단계 카드들 -->
    <div class="workflow-stages">
      <div
        v-for="(stage, index) in workflowStages"
        :key="index"
        class="stage-card"
      >
        <!-- 단계 제목 -->
        <div class="stage-header">
          <v-icon :icon="stage.icon" size="20" class="mr-2"></v-icon>
          <span class="stage-title">{{ stage.title }}</span>
        </div>

        <!-- WORK 항목들 -->
        <div class="stage-content">
          <div
            v-for="(work, workIndex) in getWorksForStage(stage.key)"
            :key="workIndex"
            class="work-item"
          >
            <div class="work-type">WORK 신청</div>
            <div class="work-name">{{ work.name }}</div>
            <div class="approval-type">
              결재 승인 타입: {{ work.approvalType }}
            </div>
          </div>
          <div v-if="getWorksForStage(stage.key).length === 0" class="empty-work">
            WORK 없음
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="stage-actions">
          <v-btn
            icon
            size="small"
            variant="text"
            color="primary"
            @click="editStage(stage.key)"
          >
            <v-icon icon="mdi-pencil" size="18"></v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            @click="deleteStage(stage.key)"
          >
            <v-icon icon="mdi-delete" size="18"></v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import EditWorkItemModal from './EditWorkItemModal.vue'
import { WORK_TYPE } from '../../enumeration/workType'

export default {
  name: 'WorkFlowChart',
  components: {
    EditWorkItemModal
  },
  props: {
    workflowGroups: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // 모달 상태
    const showAddWorkModal = ref(false)

    // 워크플로우 단계 정의
    const workflowStages = ref([
      // {
      //   key: 'registration',
      //   title: '등록',
      //   icon: 'mdi-file-document-edit'
      // },
      // {
      //   key: 'riskAnalysis',
      //   title: '위험분석',
      //   icon: 'mdi-alert-circle'
      // },
      // {
      //   key: 'approval',
      //   title: '승인',
      //   icon: 'mdi-check-circle'
      // },
      // {
      //   key: 'preparation',
      //   title: '준비',
      //   icon: 'mdi-cog'
      // },
      // {
      //   key: 'execution',
      //   title: '실행',
      //   icon: 'mdi-play-circle'
      // },
      // {
      //   key: 'test',
      //   title: '테스트단계',
      //   icon: 'mdi-test-tube'
      // },
      // {
      //   key: 'review',
      //   title: '결과리뷰',
      //   icon: 'mdi-file-document-check'
      // },
      // {
      //   key: 'completion',
      //   title: '완료',
      //   icon: 'mdi-check-all'
      // }
    ])

    // WORK 데이터
    const works = ref([])

    // 그룹명 (첫 번째 그룹의 이름 사용)
    const groupName = computed(() => {
      return props.workflowGroups.length > 0 ? props.workflowGroups[0].name : '변경관리'
    })

    // 특정 단계에 해당하는 WORK 가져오기
    const getWorksForStage = (stageKey) => {
      return works.value.filter(work => work.stage === stageKey)
    }

    // WORK 추가 모달 열기
    const openAddWorkModal = () => {
      showAddWorkModal.value = true
    }

    // workType으로 해당 단계명 찾기
    const getStageFromWorkType = (workType) => {
      const findWorkType = WORK_TYPE.find(work => work.code === workType)
      return findWorkType
    }

    // WORK 추가 완료 처리
    const handleWorkAdded = (workData) => {
      console.log('추가된 WORK 데이터:', workData)
      // works 배열에 새 WORK 추가
      const stage = getStageFromWorkType(workData.workType)
      works.value.push({
        id: workData.id,
        stage: stage,
        name: workData.workType,
        approvalType: workData.paymentRequired ? '결제 필요' : '확인',
        description: workData.description,
        groupName: workData.groupName
      })
      console.log('전체 works:', works.value)
    }

    // WORK 제거
    const removeWork = () => {
      console.log('WORK 제거')
      // WORK 제거 로직 구현
    }

    // 단계 편집
    const editStage = (stageKey) => {
      console.log('단계 편집:', stageKey)
      // 단계 편집 로직 구현
    }

    // 단계 삭제
    const deleteStage = (stageKey) => {
      console.log('단계 삭제:', stageKey)
      // 단계 삭제 로직 구현
    }

    return {
      showAddWorkModal,
      workflowStages,
      works,
      groupName,
      getWorksForStage,
      openAddWorkModal,
      getStageFromWorkType,
      handleWorkAdded,
      removeWork,
      editStage,
      deleteStage,
      WORK_TYPE
    }
  }
}
</script>

<style scoped>
.workflow-chart {
  width: 100%;
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #00796b;
  color: white;
  border-radius: 4px 4px 0 0;
  margin-bottom: 0;
}

.workflow-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.workflow-actions {
  display: flex;
  gap: 8px;
}

.workflow-stages {
  display: flex;
  overflow-x: auto;
  padding: 16px;
  background-color: #f5f5f5;
  gap: 12px;
  min-height: 400px;
}

.stage-card {
  min-width: 250px;
  max-width: 250px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stage-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.stage-title {
  flex: 1;
}

.stage-content {
  flex: 1;
  min-height: 200px;
}

.work-item {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.work-type {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.work-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.approval-type {
  font-size: 12px;
  color: #666;
}

.empty-work {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 20px;
}

.stage-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

/* 스크롤바 스타일링 */
.workflow-stages::-webkit-scrollbar {
  height: 8px;
}

.workflow-stages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.workflow-stages::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.workflow-stages::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
