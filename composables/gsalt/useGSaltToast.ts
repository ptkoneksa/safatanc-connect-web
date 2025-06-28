export const useGSaltToast = () => {
  const showToast = ref(false);
  const toastMessage = ref("");
  const toastType = ref<"success" | "error">("success");

  const showToastNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    toastMessage.value = message;
    toastType.value = type;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 5000);
  };

  const hideToast = () => {
    showToast.value = false;
  };

  return {
    showToast: readonly(showToast),
    toastMessage: readonly(toastMessage),
    toastType: readonly(toastType),
    showToastNotification,
    hideToast,
  };
};
