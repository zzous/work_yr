<template>
  <!-- 모달 -->
  <v-dialog v-model="dialog" width="600" persistent>
    <v-card>
      <!-- 헤더 -->
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6 font-weight-medium">{{ state.isEditMode ? 'WORK 수정' : 'WORK 등록' }}</span>
        <v-btn icon variant="text" size="small" @click="closeModal">
          <v-icon icon="mdi-close"></v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <!-- 섹션 제목 -->
        <div class="section-title mb-4">
          <v-icon icon="mdi-chevron-right-box" class="mr-2"></v-icon>
          <span class="text-body-1 font-weight-medium"> 워크플로우</span>
        </div>

        <v-form ref="workFormRef">
          <v-row>
            <!-- WORK 그룹명 -->
            <v-col cols="12" class="d-flex align-center">
              <label class="field-label mr-4">
                WORK 그룹명 <span class="text-error">*</span>
              </label>
              <span>{{ state.itemInfo.groupName ?? '' }}</span>
            </v-col>

            <!-- WORK 선택 -->
            <v-col cols="12" class="d-flex align-center">
              <label class="field-label mr-4">
                WORK 선택 <span class="text-error">*</span>
              </label>
              <v-select v-model="state.itemInfo.workCode" :items="workTypes" item-title="name" item-value="code"
                variant="outlined" density="compact" placeholder="WORK 선택" hide-details="auto" class="flex-grow-1"
                :rules="[v => !!v || 'WORK를 선택해주세요']"></v-select>
            </v-col>

            <!-- 결제 여부 -->
            <v-col cols="12" class="d-flex align-center">
              <label class="field-label mr-4">
                결제 여부
              </label>
              <span>결제 선택</span>
              <v-checkbox v-model="state.itemInfo.approvalYn" hide-details></v-checkbox>
            </v-col>

            <!-- WORK 설명 -->
            <v-col cols="12" class="d-flex align-start">
              <label class="field-label mr-4 mt-2">
                WORK 설명
              </label>
              <v-textarea v-model="state.itemInfo.workDesc" variant="outlined" density="default"
                placeholder="내용을 입력하세요." rows="4" hide-details="auto" class="flex-grow-1"></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- 하단 버튼 -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="elevated" @click="onClickSave" prepend-icon="mdi-content-save">
          저장
        </v-btn>
        <v-btn variant="outlined" color="grey" @click="closeModal" prepend-icon="mdi-close">
          취소
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, reactive, nextTick } from 'vue'
import { WORK_TYPE } from '../../enumeration/workType'

export default {
  name: 'EditWorkItemModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    itemInfo: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'add'
    },
    excludedWorkCodes: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:ModelValue', 'saveWorkItem'],
  setup(props, { emit }) {
    const workFormRef = ref(null)
    const state = reactive({
      isEditMode: computed(() => props.mode === 'edit'), // WORK 코드가 있으면 수정 모드
      itemInfo: {
        groupName: computed(() => props.itemInfo.groupName),
        workCode: '',
        approvalYn: 'N',
        workDesc: '',
      }
    })

    // itemInfo prop이 변경될 때 데이터 로드
    watch(() => props.itemInfo, (newItemInfo) => {
      if (newItemInfo && props.modelValue) {
        // 모달이 열려있을 때만 데이터 로드
        if (props.mode === 'edit') {
          state.itemInfo.workCode = newItemInfo.workCode || ''
          state.itemInfo.approvalYn = newItemInfo.approvalYn || 'N'
          state.itemInfo.workDesc = newItemInfo.workDesc || ''
        }
      }
    }, { deep: true, immediate: true })

    // 전체 workTypes 목록
    const allWorkTypes = Object.values(WORK_TYPE).map(work => ({
      code: work.code,
      name: work.name ?? '',
    }))

    // excludedWorkCodes에 포함되지 않은 workTypes만 필터링
    const workTypes = computed(() => {
      return allWorkTypes.filter(work => !props.excludedWorkCodes.includes(work.code))
    })

    // 모달 열림/닫힘 상태
    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    // 모달 상태 변경 감시
    watch(() => props.modelValue, (newVal) => {
      console.log('### 모달 상태 변경: ', newVal)
      console.log('### props.itemInfo: ', props.itemInfo)
      console.log('### props.mode: ', props.mode)
      if (newVal) {
        // 모달이 열릴 때
        if (props.mode === 'edit' && props.itemInfo) {
          // 편집 모드일 때는 itemInfo 데이터 로드
          state.itemInfo.workCode = props.itemInfo.workCode || ''
          state.itemInfo.approvalYn = props.itemInfo.approvalYn || 'N'
          state.itemInfo.workDesc = props.itemInfo.workDesc || ''
        } else {
          // 추가 모드일 때는 초기화
          state.itemInfo.workCode = ''
          state.itemInfo.approvalYn = 'N'
          state.itemInfo.workDesc = ''
        }
      } else {
        // 모달이 닫힐 때 폼 초기화
        resetForm()
      }
    })

    // 모달 닫기
    const closeModal = () => {
      dialog.value = false
    }

    // 확인 버튼
    const onClickSave = async () => {
      const validate = await workFormRef.value.validate()

      if (validate.valid) {
        console.log('state.itemInfo.value:', state.itemInfo);
        emit('saveWorkItem', { ...state.itemInfo })
        closeModal()
      }
    }

    // 폼 초기화
    const resetForm = () => {
      console.log('### 폼 초기화 resetForm: ', props.mode, props.itemInfo)
      workFormRef.value?.resetValidation()
      state.itemInfo.workCode = ''
      state.itemInfo.approvalYn = 'N'
      state.itemInfo.workDesc = ''
    }

    return {
      workFormRef,
      state,
      workTypes,
      dialog,
      closeModal,
      onClickSave,
      WORK_TYPE
    }
  }
}
</script>

<style scoped>
.section-title {
  color: #333;
  font-weight: 500;
}

.field-label {
  min-width: 120px;
  font-size: 14px;
  color: #333;
  text-align: left;
}

:deep(.v-field) {
  background-color: white;
}

:deep(.v-btn--variant-elevated) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
