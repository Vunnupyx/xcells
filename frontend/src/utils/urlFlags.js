// @see "OnBoardingGifDisplay"
export const SKIP_ONBOARDING = 'skipOnboarding'

// @see "CircleBenchmark"
export const CIRCLE_BENCHMARK_START_NODE = 'startNode'
export const CIRCLE_BENCHMARK_END_NODE = 'endNode'
export const CIRCLE_BENCHMARK_ITERATIONS = 'iterations'

// @see "MapViewEdit"
export const LOAD_MAP_BENCHMARK = 'loadingBenchmark'

export const getUrlFlag = flagName => new URLSearchParams(window.location?.search).get(flagName)
