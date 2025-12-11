<template>
  워크플로우 전체 - state.wfGroupList: {{ state.wfGroupList }}<br><br>
  워크플로우 선택 - wfGroupList: {{ wfGroupList }}<br><br>
  <div class="groups-container"
    :class="{ 'single': state.wfGroupList.length == 1, 'double': state.wfGroupList.length >= 2 }">
    <div class="group-wrap" v-for="(group, groupIdx) in state.wfGroupList" :key="groupIdx">
      <!-- 헤더 -->
      <div class="group-header">
        <h3 class="workflow-title">{{ group.groupName }}</h3>
        <div class="workflow-actions">
          <v-btn variant="outlined" color="white" size="small" class="mr-2" @click="onClickAddWork(groupIdx)">
            + WORK 추가
          </v-btn>
          <v-btn variant="outlined" color="white" size="small" @click="onClickDeleteGroup(groupIdx)">
            - GROUP 삭제
          </v-btn>
        </div>
      </div>
      state.wfGroupList: {{ state.wfGroupList }}
      state.wfGroupList: {{ state.wfGroupList.length }}
      <!-- 워크플로우 group내 item 카드들 -->
      <div class="items-wraps"
        :class="{ 'single': state.wfGroupList.length >= 2, 'double': state.wfGroupList.length == 1 }">
        <div v-for="(item, itemIdx) in group.groupItemList" :key="itemIdx" class='item-card'>
          <!-- WORK 제목 -->
          <div class="item-header">
            <v-icon icon="mdi-text-box-check-outline" size="20" class="mr-2"></v-icon>
            <span class="stage-title">{{ getWorkCodeName(item.workCode) }}</span>
          </div>

          <!-- WORK 항목들 -->
          <div class="item-content" v-if="group.groupItemList.length > 0">
            <!-- <div class="work-item"> -->
            <div class="work-type">
              <v-icon icon="mdi-text-box-check-outline" size="18" class="mr-2"></v-icon>
              WORK 설명
            </div>
            <div class="work-name">{{ item.workCode }}</div>
            <v-icon icon="mdi-text-box-check-outline" size="18" class="mr-2"></v-icon>
            <div class="work-type">WORK 컴포넌트</div>
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
            <v-btn icon size="small" variant="text" color="primary" @click="onClickEditItem(group, groupIdx, itemIdx)">
              <v-icon icon="mdi-pencil" size="18"></v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" color="error" @click="onClickDeleteWork(group, groupIdx, itemIdx)">
              <v-icon icon="mdi-delete" size="18"></v-icon>
            </v-btn>
          </div>
        </div>
      </div>

    </div>
    <EditWorkItemModal v-model="showAddWorkModal" :itemInfo="state.selectedItemInfo" :mode="state.currentInfo.mode"
      :excludedWorkCodes="getExcludedWorkCodes()" @saveWorkItem="onSaveWorkItem" />
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
  emits: ['changeWorkflow'],

  setup(props, { emit }) {
    const showAddWorkModal = ref(false)
    const workflowStages = ref([]) // 워크플로우 단계
    const currentWork = ref([]) // 저장전 현 상태 WORK 데이터

    const state = reactive({
      wfGroupList: props.wfGroupList,
      selectedItemInfo: computed(() => {
        const group = state.wfGroupList[state.currentInfo.groupIdx]
        if (!group) return { groupName: '' }

        // 편집 모드일 때는 특정 item 정보 반환
        if (state.currentInfo.mode === 'edit' && state.currentInfo.groupItemIdx >= 0) {
          const item = group.groupItemList?.[state.currentInfo.groupItemIdx]
          if (item) {
            return {
              groupName: group.groupName,
              workCode: item.workCode || '',
              approvalYn: item.approvalYn || 'N',
              workDesc: item.workDesc || ''
            }
          }
        }
        // 추가 모드일 때는 그룹 정보만 반환
        return {
          groupName: group.groupName || ''
        }
      }),
      currentInfo: {
        groupIdx: -1, // 선택된 그룹 인덱스
        groupName: '', // 선택된 그룹명
        groupItemIdx: -1, // 선택된 그룹 아이템 인덱스
        mode: 'add'
      },
      // wfGroupItemList: [
      //   {
      //     workCode: '',
      //     workDesc: '',
      //     approvalYn: 'N',
      //     displayOrder: 1,
      //   }
      // ],
    })

    // props.wfGroupList가 변경될 때 state.wfGroupList 업데이트
    watch(() => props.wfGroupList, (newList) => {
      // 각 그룹에 wfGroupItemList가 없으면 초기화
      const updatedList = newList.map(group => ({
        ...group,
      }))

      state.wfGroupList = updatedList
      emit('changeWorkflow', state.wfGroupList);
    }, { immediate: true, deep: true })

    // watch(currentWork, (newVal) => {
    //   console.log('### currentWork 변경: ', newVal)
    // })

    // 현재 구성된 work enum 목록
    const workTypes = Object.values(WORK_TYPE).map(work => ({
      code: work.code,
      name: work.name ?? '',
    }))

    /* WORK 추가 */
    const onClickAddWork = (groupIdx) => {
      console.log('### onClickAddWork: ', groupIdx);
      setCurrentInfo(groupIdx, -1, 'add');
      openEditWorkModal();
    }

    // 그룹 제거
    const onClickDeleteGroup = (groupIdx) => {
      console.log('WORK 제거')
      // WORK 제거 로직 구현
      state.wfGroupList.splice(groupIdx, 1);
      // 선택 그룹 하위 WORK 제거
      state.wfGroupList[groupIdx]?.groupItemList.forEach((item, itemIdx) => {
        state.wfGroupList[groupIdx].groupItemList.splice(itemIdx, 1);
      })
      emit('changeWorkflow', state.wfGroupList);
      console.log('### 그룹 제거 후 state.wfGroupList: ', state.wfGroupList)
    }

    /* WORK 편집 버튼 이벤트 함수 */
    const onClickEditItem = (groupIdx, itemIdx) => {
      setCurrentInfo(groupIdx, itemIdx, 'edit');
      openEditWorkModal()
    }

    /* WORK 삭제 버튼 이벤트 함수 */
    const onClickDeleteWork = (groupIdx, itemIdx) => {
      const group = state.wfGroupList[groupIdx]
      if (!group) {
        console.error('### onClickDeleteWork: group not found at index', groupIdx)
        return
      }

      if (itemIdx >= 0) {
        // 특정 item 삭제
        if (group.groupItemList && Array.isArray(group.groupItemList) && group.groupItemList.length > itemIdx) {
          group.groupItemList.splice(itemIdx, 1)
        }
      } else {
        // 그룹 전체 삭제
        state.wfGroupList.splice(groupIdx, 1)
      }
    }

    const setCurrentInfo = (groupIdx, groupItemIdx = -1, mode = 'add') => {
      const group = state.wfGroupList[groupIdx]
      if (!group) {
        console.error('### setCurrentInfo: group not found at index', groupIdx)
        return
      }
      state.currentInfo = {
        groupIdx: groupIdx,
        groupName: group.groupName || '',
        groupItemIdx: groupItemIdx,
        mode: mode
      }
    }





    /* WORK 추가 모달 열기 */
    const openEditWorkModal = () => { showAddWorkModal.value = true }

    // WORK 추가 완료 처리
    const onSaveWorkItem = (item) => {
      console.log('### onSaveWorkItem: ', item)
      console.log('### state.currentInfo.groupIdx: ', state.currentInfo.groupIdx)
      console.log('### state.wfGroupList: ', state.wfGroupList)

      const group = state.wfGroupList[state.currentInfo.groupIdx]

      if (!group || state.currentInfo.groupIdx < 0) {
        console.log('check currentInfo.groupIdx, group value!!')
        return
      }

      if (state.currentInfo.mode === 'add') {
        // item 추가
        group.groupItemList.push({
          workCode: item.workCode,
          workDesc: item.workDesc || '',
          approvalYn: item.approvalYn ? 'Y' : 'N',
        })
      } else if (state.currentInfo.mode === 'edit') {
        // item 수정
        console.log('### item: ', item)
        group.groupItemList[state.currentInfo.groupIdx] = item
      }
    }

    // workType으로 해당 단계명 찾기
    const getWorkCodeName = (workCode) => {
      console.log('### workCode: ', workCode)
      const findWork = workTypes.find(work => work.code === workCode)
      console.log('### findWork: ', findWork)
      return findWork.name;
    }

    // 현재 그룹에서 이미 사용된 workCode 목록 가져오기
    const getExcludedWorkCodes = () => {
      const excludedCodes = []
      const currentGroup = state.wfGroupList[state.currentInfo.groupIdx]

      if (currentGroup && currentGroup.groupItemList) {
        currentGroup.groupItemList.forEach((item, idx) => {
          // 편집 모드일 때는 현재 편집 중인 item의 workCode는 제외하지 않음
          if (state.currentInfo.groupItemIdx !== idx && item.workCode) {
            excludedCodes.push(item.workCode)
          }
        })
      }

      return excludedCodes
    }



    const updateWorkflow = (workflowData) => {
      if (!workflowData || !workflowData.wfGroupList) return

      workflowStages.value = []
      currentWork.value = []

      // workflowData.wfGroupList.forEach((group, groupIdx) => {
      //   // workflowStages에 그룹 추가
      //   workflowStages.value.push({
      //     key: group.wfGroupName, // 그룹명을 key로 사용
      //     title: group.wfGroupName,
      //     icon: 'mdi-folder-outline', // 기본 아이콘
      //     displayOrder: group.displayOrder || (groupIdx + 1),
      //     wfGroupDesc: group.wfGroupDesc || ''
      //   })

      //   // currentWork에 각 그룹의 아이템들 추가
      //   if (group.wfGroupItemList && Array.isArray(group.wfGroupItemList)) {
      //     group.wfGroupItemList.forEach((item, itemIndex) => {
      //       // workType code로 name 찾기
      //       const workTypeInfo = workTypes.find(wt => wt.code === item.wfComponentsCode)

      //       currentWork.value.push({
      //         componentsCode: `${group.wfGroupName}-${itemIndex}`,
      //         // groupCode: group.wfGroupName, // 그룹명을 stage로 사용
      //         // name: workTypeInfo ? workTypeInfo.name : item.wfComponentsCode,
      //         approvalYn: item.approvalYn || 'N',
      //         groupItemDesc: item.wfGroupItemDesc || '',
      //         // groupName: group.wfGroupName,
      //         workType: item.wfComponentsCode,
      //         displayOrder: item.displayOrder || (itemIndex + 1)
      //       })
      //     })
      //   }
      // })

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
      openEditWorkModal,
      onClickAddWork,
      getWorkCodeName,
      onSaveWorkItem,
      onClickDeleteGroup,
      onClickDeleteWork,
      onClickEditItem,
      getExcludedWorkCodes,
      // convertToWorkflowDTO,
      WORK_TYPE,
    }
  }
}
</script>
