/**
 * Cartesian product of the input arrays
 * @param arrayList
 * @returns {*}
 */
type Primitive = string
type PList = Primitive[]
type PLists = PList[]

const reducer = (previous: PLists, current: PList): PLists =>
  previous.flatMap((el: PList) => current.map((currentValue: Primitive) => [el, currentValue].flat()))

const cartesianProduct = (...arrayList: PLists): PLists => arrayList.reduce<PLists>(reducer, [[]] as PLists)

export default cartesianProduct
