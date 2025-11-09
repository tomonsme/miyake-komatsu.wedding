export default {
  scrollBehavior(to: any, from: any, savedPosition: any) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  }
}

