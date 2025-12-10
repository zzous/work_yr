<template>
  <div 
    class="groups-container"
    :class="{ 'single': state.wfGroupList.length === 1, 'double': state.wfGroupList.length >= 2 }"
  >
    <div 
      class="group-wrap" 
      v-for="(group, groupIdx) in state.wfGroupList" 
      :key="groupIdx"
    >
    <!-- 헤더 -->
    <div class="group-header">
      <h3 class="workflow-title">{{group.groupName}}</h3>
      <div class="workflow-actions">
        <v-btn
          variant="outlined"
          color="error"
          size="small"
          class="mr-2"
          @click="onClickAddWork(group, groupIdx)"
        >
          + WORK 추가
        </v-btn>
        <v-btn
          variant="outlined"
          color="error"
          size="small"
          @click="removeWork"
        >
          - GROUP 삭제
        </v-btn>
      </div>
    </div>

    <!-- 워크플로우 단계 카드들 -->
    <div class="items-wrap">
      <div
        v-for="(item, itemIdx) in group.wfGroupItemList"
        :key="index"
        class="item-card"
      >
        <!-- 단계 제목 -->
        <div class="item-header">
          <v-icon icon="mdi-text-box-check-outline" size="20" class="mr-2"></v-icon>
          <span class="stage-title">{{ getWorkCodeName(item.workCode) }}</span>
        </div>

        <!-- WORK 항목들 -->
        <div class="item-content" v-if="group.wfGroupItemList.length > 0">
          <!-- <div class="work-item"> -->
            <div class="work-type">WORK 컴포넌트</div>
            <div class="work-name">{{ item.workCode }}</div>
            <v-icon icon="mdi-text-box-check-outline" size="18" class="mr-2"></v-icon>
            WORK 컴포넌트
            <div class="work-name">{{ item.workDesc }}</div>
            <div class="approval-type" v-if="item.approvalYn === 'Y'">
              <v-icon icon="mdi-account-check-outline" size="18" class="mr-2"></v-icon>
              결재
            </div>
          <!-- </div> -->
          
        </div>
        <div v-else class="empty-work">
          WORK 없음
        </div>

        <!-- 액션 버튼 -->
        <div class="stage-actions">
          <v-btn
            icon
            size="small"
            variant="text"
            color="primary"
            @click="onClckEditItem(item.key)"
          >
            <v-icon icon="mdi-pencil" size="18"></v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            @click="onClickDeleteItem(item.key)"
          >
            <v-icon icon="mdi-delete" size="18"></v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    </div>
    <EditWorkItemModal
      v-model="showAddWorkModal"
      :groupName="state.selectedGroupName"
      @saveWorkItem="onSaveWorkItem"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import EditWorkItemModal from './EditWorkItemModal.vue'
import { WORK_TYPE } from '../../enumeration/workType'

export default {
  name: 'WorkFlowChart',
  components: {
    EditWorkItemModal
  },
  props: {
    wfGroupList: {
      type: Array,
      default: () => []
    },
    workflowData: {
      type: Object,
      default: () => null
    }
  },
  setup(props) {
    const showAddWorkModal = ref(false)
    const workflowStages = ref([]) // 워크플로우 단계
    const currentWork = ref([]) // 저장전 현 상태 WORK 데이터

    const state = reactive({
      wfGroupList: props.wfGroupList,
      selectedGroupIdx: -1,
      selectedGroupName: '',
      wfGroupItemList: [
        {
          workCode: '',
          workDesc: '',
          approvalYn: 'N',
          displayOrder: 1,
        }
      ],
    })

    // props.wfGroupList가 변경될 때 state.wfGroupList 업데이트
    watch(() => props.wfGroupList, (newList) => {
      // 각 그룹에 wfGroupItemList가 없으면 초기화
      const updatedList = newList.map(group => ({
        ...group,
        wfGroupItemList: group.wfGroupItemList || []
      }))
      
      state.wfGroupList = updatedList
    }, { immediate: true, deep: true })

    // watch(currentWork, (newVal) => {
    //   console.log('### currentWork 변경: ', newVal)
    // })

    // 현재 구성된 work enum 목록
    const workTypes = Object.values(WORK_TYPE).map(work => ({ 
      code: work.code,
      name: work.name ?? '',
    }))

    const onClickAddWork = (group, groupIdx) => {
      console.log('### group: ', group)
      console.log('### onClickAddWork: ', groupIdx)
      state.selectedGroupIdx = groupIdx
      state.selectedGroupName = group.groupName
      openAddWorkModal()
    }

    // WORK 추가 모달 열기
    const openAddWorkModal = () => { showAddWorkModal.value = true }

    // 특정 단계에 해당하는 WORK 가져오기
    const getWorksForStage = (stageKey) => {
      console.log('### stageKey: ', stageKey)
      console.log('### currentWork: ', currentWork.value)
      return currentWork.value.filter(work => work.stage === stageKey)
    }

    // WORK 추가 완료 처리
    const onSaveWorkItem = (workData) => {
      console.log('### onSaveWorkItem: ', workData)
      console.log('### state.selectedGroupIdx: ', state.selectedGroupIdx)
      console.log('### state.wfGroupList: ', state.wfGroupList)

      const group = state.wfGroupList[state.selectedGroupIdx]
  
      if(state.selectedGroupIdx > -1 && group){
        // 새 아이템 추가
        group.wfGroupItemList.push({
            workCode: workData.workType,
            workDesc: workData.description || '',
            approvalYn: workData.paymentRequired ? 'Y' : 'N',
          })
      } else {
        console.log('check selectedGroupIdx, group value!!')
      }

      console.log('### 추가 후 state.wfGroupList: ', state.wfGroupList)
      console.log('### 추가 후 group.wfGroupItemList: ', group.wfGroupItemList)
    }

    // workType으로 해당 단계명 찾기
    const getWorkCodeName = (workType) => {
      console.log('### workType: ', workType)
      const findName = workTypes.find(work => work.code === workType)
      console.log('### findName: ', findName)
      return findName.name;
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

    const updateWorkflow = (workflowData) => {
      if (!workflowData || !workflowData.wfGroupList) return
      
      workflowStages.value = []
      currentWork.value = []
      
      workflowData.wfGroupList.forEach((group, groupIdx) => {
        // workflowStages에 그룹 추가
        workflowStages.value.push({
          key: group.wfGroupName, // 그룹명을 key로 사용
          title: group.wfGroupName,
          icon: 'mdi-folder-outline', // 기본 아이콘
          displayOrder: group.displayOrder || (groupIdx + 1),
          wfGroupDesc: group.wfGroupDesc || ''
        })
        
        // currentWork에 각 그룹의 아이템들 추가
        if (group.wfGroupItemList && Array.isArray(group.wfGroupItemList)) {
          group.wfGroupItemList.forEach((item, itemIndex) => {
            // workType code로 name 찾기
            const workTypeInfo = workTypes.find(wt => wt.code === item.wfComponentsCode)
            
            currentWork.value.push({
              componentsCode: `${group.wfGroupName}-${itemIndex}`,
              // groupCode: group.wfGroupName, // 그룹명을 stage로 사용
              // name: workTypeInfo ? workTypeInfo.name : item.wfComponentsCode,
              approvalYn: item.approvalYn || 'N',
              groupItemDesc: item.wfGroupItemDesc || '',
              // groupName: group.wfGroupName,
              workType: item.wfComponentsCode,
              displayOrder: item.displayOrder || (itemIndex + 1)
            })
          })
        }
      })
      
      console.log('### workflowStages 업데이트:', workflowStages.value)
      console.log('### currentWork 업데이트:', currentWork.value)
    }

    // // JSON 구조로 변환하는 함수
    // const convertToWorkflowDTO = (wfName, wfDesc, serviceGroupUuid) => {
    //   // 그룹별로 work 데이터 그룹화
    //   const groupMap = new Map()
      
    //   currentWork.value.forEach((work, index) => {
    //     const groupName = work.groupName
    //     if (!groupMap.has(groupName)) {
    //       groupMap.set(groupName, {
    //         wfGroupName: groupName,
    //         wfGroupDesc: '', // 그룹 설명은 별도로 관리 필요
    //         displayOrder: props.workflowGroups.findIndex(g => g.name === groupName) + 1,
    //         wfGroupItemList: []
    //       })
    //     }
        
    //     const group = groupMap.get(groupName)
    //     group.wfGroupItemList.push({
    //       wfComponentsCode: work.workType, // code 값
    //       wfGroupItemDesc: work.description || '',
    //       approvalYn: work.paymentRequired ? 'Y' : 'N',
    //       displayOrder: work.displayOrder || (group.wfGroupItemList.length + 1)
    //     })
    //   })
      
    //   return {
    //     wfName,
    //     wfDesc,
    //     serviceGroupUuid,
    //     wfGroupList: Array.from(groupMap.values())
    //   }
    // }

    return {
      showAddWorkModal,
      state,
      workflowStages,
      currentWork,
      getWorksForStage,
      openAddWorkModal,
      onClickAddWork,
      getWorkCodeName,
      onSaveWorkItem,
      removeWork,
      editStage,
      deleteStage,
      // convertToWorkflowDTO,
      WORK_TYPE,
    }
  }
}
</script>
