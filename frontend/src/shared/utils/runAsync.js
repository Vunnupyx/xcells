const runAsync = fn =>
  new Promise(resolve => {
    setTimeout(async () => {
      resolve(await fn())
    }, 0)
  })

export default runAsync
