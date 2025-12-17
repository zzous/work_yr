<template>
  <!-- 워크플로우 전체 - state.wfGroupList: {{ state.wfGroupList }}<br><br>
  워크플로우 선택 - wfGroupList: {{ wfGroupList }}<br><br> -->
  <div class="groups-container" :class="{
    'single': state.wfGroupList.length == 1,
    'double': state.wfGroupList.length >= 2 && state.wfGroupList.length < 4,
    'canscroll': state.wfGroupList.length >= 4
  }">
    <div class="group-wrap" v-for="(group, groupIdx) in state.wfGroupList" :key="groupIdx">
      <!-- 헤더 -->
      <div class="group-header">
        <h3 class="workflow-title">{{ group.groupName }}</h3>
        <div class="workflow-actions">
          <v-btn variant="outlined" color="white" size="small" class="mr-2" @click="onClickAddWork(groupIdx)">
            +
            <span v-if="state.wfGroupList.length < 4">WORK 추가</span>
            <span v-else>W</span>
          </v-btn>
          <v-btn variant="outlined" color="white" size="small" @click="onClickDeleteGroup(groupIdx)">
            -
            <span v-if="state.wfGroupList.length < 4">GROUP 삭제</span>
            <span v-else>G</span>
          </v-btn>
        </div>
      </div>
      <!-- state.wfGroupList: {{ state.wfGroupList }}
      state.wfGroupList: {{ state.wfGroupList.length }} -->
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
            <div>
              <v-icon icon="mdi-text-box-check-outline" size="18" class="mr-2 "></v-icon>
              <div class="work-name">{{ item.workDesc }}</div>
            </div>
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
          <div class="item-btns">
            <v-btn icon variant="outlined" color="primary" class="square-btn"
              @click="onClickEditItem(groupIdx, itemIdx)">
              <v-icon icon="mdi-text-box-edit-outline" size="18"></v-icon>
            </v-btn>
            <v-btn icon variant="outlined" color="primary" class="square-btn"
              @click="onClickDeleteWork(groupIdx, itemIdx)">
              <v-icon icon="mdi-trash-can-outline" size="18"></v-icon>
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
import { WORK_TYPE } from '../../enumeration/worktype'

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
    })

    // props.wfGroupList가 변경될 때 state.wfGroupList 업데이트
    watch(() => props.wfGroupList, (newList) => {
      // 각 그룹에 groupItemList가 없으면 초기화
      const updatedList = newList.map(group => ({
        ...group,
        groupItemList: group.groupItemList || []
      }))

      state.wfGroupList = updatedList
    }, { immediate: true, deep: true })

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
      console.log('### 그룹 제거: ', groupIdx)
      // 그룹 삭제
      state.wfGroupList.splice(groupIdx, 1);

      // 삭제된 그룹의 인덱스 초기화
      if (state.currentInfo.groupIdx === groupIdx || state.currentInfo.groupIdx >= state.wfGroupList.length) {
        state.currentInfo = {
          groupIdx: -1,
          groupName: '',
          groupItemIdx: -1,
          mode: 'add'
        }
      } else if (state.currentInfo.groupIdx > groupIdx) {
        // 삭제된 그룹보다 뒤에 있는 그룹의 인덱스 계산
        state.currentInfo.groupIdx = state.currentInfo.groupIdx - 1
      }

      emit('changeWorkflow', state.wfGroupList);
      console.log('### 그룹 제거 후 state.wfGroupList: ', state.wfGroupList)
    }

    /* WORK 편집 버튼 이벤트 함수 */
    const onClickEditItem = (groupIdx, itemIdx) => {
      console.log('### onClickEditItem: ', groupIdx, itemIdx)
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

          // 삭제된 item이 현재 편집 중인 item이면 currentInfo 초기화
          if (state.currentInfo.groupIdx === groupIdx && state.currentInfo.groupItemIdx === itemIdx) {
            state.currentInfo = {
              groupIdx: -1,
              groupName: '',
              groupItemIdx: -1,
              mode: 'add'
            }
          } else if (state.currentInfo.groupIdx === groupIdx && state.currentInfo.groupItemIdx > itemIdx) {
            // 삭제된 item보다 뒤에 있는 item의 인덱스 조정
            state.currentInfo.groupItemIdx = state.currentInfo.groupItemIdx - 1
          }
        }
      } else {
        // 그룹 전체 삭제
        state.wfGroupList.splice(groupIdx, 1)
      }

      emit('changeWorkflow', state.wfGroupList);
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
        if (state.currentInfo.groupItemIdx >= 0 && group.groupItemList[state.currentInfo.groupItemIdx]) {
          group.groupItemList[state.currentInfo.groupItemIdx] = {
            workCode: item.workCode,
            workDesc: item.workDesc || '',
            approvalYn: item.approvalYn ? 'Y' : 'N',
          }
        }
      }

      // 저장 후 currentInfo 초기화
      state.currentInfo = {
        groupIdx: -1,
        groupName: '',
        groupItemIdx: -1,
        mode: 'add'
      }
    }

    // workType으로 해당 단계명 찾기
    const getWorkCodeName = (workCode) => {
      console.log('### workCode: ', workCode)
      const findWork = workTypes.find(work => work.code === workCode)
      console.log('### findWork: ', findWork)
      return findWork.name;
    }

    // 이미 사용된 workCode 목록 찾기
    const getExcludedWorkCodes = () => {
      const excludedCodes = []
      const currentGroupIdx = state.currentInfo.groupIdx
      const currentItemIdx = state.currentInfo.groupItemIdx

      // 모든 그룹 대상 조회함
      state.wfGroupList.forEach((group, groupIdx) => {
        if (group && group.groupItemList) {
          group.groupItemList.forEach((item, itemIdx) => {
            // 편집 모드일 때는 현재 편집 중인 item의 workCode는 제외하지 않음
            if (item.workCode) {
              const isCurrentEditingItem = (groupIdx === currentGroupIdx && itemIdx === currentItemIdx)
              if (!isCurrentEditingItem) {
                excludedCodes.push(item.workCode)
              }
            }
          })
        }
      })

      return excludedCodes
    }

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
      WORK_TYPE,
    }
  }
}
</script>
