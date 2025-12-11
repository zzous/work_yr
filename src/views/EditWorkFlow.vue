<template>
  <v-container class="editwrap">
    <!-- 헤더 -->
    <!-- <div class="d-flex align-center mb-4">
      <v-icon icon="mdi-image-filter-none" size="24" class="mr-2"></v-icon>
      <h2 class="text-h6 font-weight-medium">워크플로우 생성</h2>
    </div> -->
    <div class="hwrap">
      <v-icon icon="mdi-image-filter-none" size="24" class="title-icon"></v-icon>
      <h2 class="title-text">워크플로우 생성</h2>
    </div>

    <!-- 안내 박스 -->
    <v-alert variant="tonal" class="notice-wrap mb-6" density="compact">
      <div class="d-flex align-start">
        <v-icon icon="mdi-text-box-edit-outline" class="mr-2 mt-1"></v-icon>
        <div>
          <div class="mb-2">
            • 등록할 워크 플로우의 기본 정보 입력 후 워크 플로우를 지정할 수 있습니다.
          </div>
          <div>
            • 워크 플로우는 "변경요청 등록" 으로 시작해서 "변경종료"로 끝나야 합니다.
          </div>
        </div>
      </div>
    </v-alert>
    wfGroupList:{{ wfGroupList }}

    <!-- 워크플로우 기본 정보 -->
    <v-card class="mb-6" elevation="1">
      <v-card-text>
        <v-row>
          <v-col cols="2">
            워크플로우명
          </v-col>
          <v-col cols="10">
            <v-text-field v-model="state.wfInfo.wfName" variant="outlined" density="compact" required
              hide-details="auto">
            </v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            워크플로우 설명
          </v-col>
          <v-col cols="10">
            <v-textarea v-model="state.wfInfo.wfDesc" variant="outlined" density="compact" rows="4"
              hidse-details="auto"></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            워크플로우그룹명
          </v-col>
          <v-col cols="10">
            <div class="d-flex align-center">
              <v-text-field v-model="state.inputGroupName" variant="outlined" density="compact" class="mr-2"
                hide-details="auto"></v-text-field>
              <v-btn color="primary" variant="elevated" @click="onClickAddGroup" :disabled="!state.inputGroupName">
                그룹추가
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <!-- 워크플로우 설정 -->
    <v-card class="mb-6" elevation="1">
      <v-card-title class="text-h6 font-weight-medium pa-4">
        워크플로우 설정
      </v-card-title>
      <v-card-text>
        <div v-if="wfGroupList.length === 0" class="text-center py-12">
          <v-icon icon="mdi-image-outline" size="64" class="mb-4 text-medium-emphasis"></v-icon>
          <div class="text-body-1 text-medium-emphasis">
            등록된 그룹이 없습니다. 그룹을 추가해 주세요.
          </div>
        </div>
        <div v-else>
          <WorkFlowChart :wfGroupList="wfGroupList" @changeWorkflow="onChangeWorkflow" />
        </div>
      </v-card-text>
    </v-card>

    <!-- 하단 버튼 -->
    <div class="d-flex justify-center gap-4 mb-6">
      <v-btn prepend-icon="mdi-content-save" color="primary" variant="elevated" @click="saveWorkflow">
        저장
      </v-btn>
      <v-btn prepend-icon="mdi-format-list-bulleted" color="primary" variant="outlined" @click="goToList">
        목록
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import WorkFlowChart from './components/WorkFlowChart.vue'

export default {
  name: 'EditWorkFlow',
  components: {
    WorkFlowChart
  },
  setup() {
    const router = useRouter()

    const state = reactive({
      wfInfo: {
        wfName: '', // 워크플로우명
        wfDesc: '', // 워크플로우 설명
      },
      inputGroupName: '' // 워크플로우 그룹명
    })

    const wfGroupList = ref([]) // 그룹 리스트

    // 그룹 추가
    const onClickAddGroup = () => {
      // 그룹 리스트에 존재하는 그룹명 중복 체크
      if (wfGroupList.value
        && wfGroupList.value.some(group => group.groupName === state.inputGroupName)) {
        alert('이미 존재하는 그룹명입니다.');
        return
      }

      wfGroupList.value?.push({
        groupName: state.inputGroupName,
        groupDesc: '', // 그룹 설명 현재는 미입력
        groupItemList: [] // 그룹 아이템 리스트
      })

      state.inputGroupName = '';
      console.log('### wfGroupList: ', wfGroupList.value)
    }

    // 저장
    const saveWorkflow = () => {
      console.log('워크플로우 저장:', {
        wfName: state.wfInfo.wfName,
        wfDesc: state.wfInfo.wfDesc,
        wfGroupList: wfGroupList.value
      })
      // 저장 로직 구현
    }

    // 목록으로 이동
    const goToList = () => {
      router.push('/')
    }

    return {
      state,
      wfGroupList,
      onClickAddGroup,
      saveWorkflow,
      goToList
    }
  }
}
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
