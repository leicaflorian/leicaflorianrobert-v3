/**
 * The current work status (see `workStatusAt`), checked every minute. Null until mounted:
 * the time is the visitor's clock, never the one of the build.
 */
export function useWorkStatus() {
  const status = ref<WorkStatus | null>(null)
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    const update = () => status.value = workStatusAt(new Date())
    update()
    timer = setInterval(update, 60_000)
  })
  onBeforeUnmount(() => clearInterval(timer))

  return status
}
