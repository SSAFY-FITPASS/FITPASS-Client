import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';
import { errorHandler } from '@/util/errorHandler';

const REST_API_URL = "http://localhost:8080/api/cmt"

const { showError } = errorHandler();

export const useCommentStore = defineStore('comment', () => {
  const comments = ref([]);

  const getComments = async (postId) => {
    try{
      const resp = await axios.get(REST_API_URL, {
        params:{
          postId
        }
      })
      if(resp.data != null){
        if(resp.data.flag){
          comments.value = resp.data.comments;
          return comments;
        }else{
          if(resp.data.msg) showError(resp.data.code, resp.data.msg);
          else showError(resp.data.code)
        }
      }
    } catch(error){
      console.error("예상치 못한 에러 (in comment) : ", error)
      return null;
    }
  }

  const registCmt = async () => {
  // 1. 임시 ID 생성 및 임시 댓글 추가 (낙관적 업데이트 적용)
  const tempId = Date.now();  // 임시 ID 생성 (UI 관리용)
  const optimisticComment = {
    ...comment.value,
    commentId: tempId,  // 임시 ID 추가 (DB와 무관)
    status: 'pending',  // 상태 표시 (옵션)
  };
  comments.value.push(optimisticComment);  // UI에 임시 댓글 추가

  try {
    // 2. 서버에 비동기 요청 전송
    const resp = await cmtStore.registComment(comment.value);
    if (resp) {
      // 3. 서버에서 받은 실제 댓글 데이터 추가 (임시 댓글 삭제 후 교체)
      const index = comments.value.findIndex(c => c.commentId === tempId);
      if (index !== -1) {
        comments.value.splice(index, 1);  // 임시 댓글 삭제
      }
      comments.value.push(resp.comment);  // 서버에서 받은 실제 댓글 추가
      comment.value.comment = "";  // 입력 필드 초기화
    } else {
      rollbackTemporaryComment(tempId);  // 실패 시 롤백
    }
  } catch (error) {
    console.error("댓글 등록 에러: ", error);
    rollbackTemporaryComment(tempId);  // 에러 발생 시 롤백
  }
};

// 임시 댓글을 UI에서 제거하는 함수 (롤백)
const rollbackTemporaryComment = (tempId) => {
  const index = comments.value.findIndex(c => c.commentId === tempId);
  if (index !== -1) {
    comments.value.splice(index, 1);  // 임시 댓글 삭제
  }
};


  return { getComments, comments, registComment }
})
