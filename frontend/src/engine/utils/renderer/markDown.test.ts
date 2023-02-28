import markDown from './markDown'
import type PixiNode from '../../PixiNode'

const root1Node = {id: 'rootId', title: 'test root node'} as unknown as PixiNode
const child2Node = {id: 'child2Id', title: 'test child2 node'} as unknown as PixiNode
const child22Node = {id: 'child2Id', title: 'test child22 node'} as unknown as PixiNode
const child3Node = {id: 'child3Id', title: 'test child3 node'} as unknown as PixiNode
const child4Node = {id: 'child4Id', title: 'test child4 node'} as unknown as PixiNode
const child5Node = {id: 'child5Id', title: 'test child5 node'} as unknown as PixiNode
const child6Node = {id: 'child6Id', title: 'test child6 node'} as unknown as PixiNode
const child7Node = {id: 'child7Id', title: 'test child7 node'} as unknown as PixiNode
const leafNode = {id: 'child8Id', title: 'leaf node'} as unknown as PixiNode

root1Node.childNodes = new Set([child2Node, child22Node])

child2Node.childNodes = new Set([child3Node, leafNode, child5Node])
child22Node.childNodes = new Set()
child3Node.childNodes = new Set([child4Node, leafNode])
child4Node.childNodes = new Set([child5Node, leafNode])
child5Node.childNodes = new Set([child6Node, leafNode])
child6Node.childNodes = new Set([child7Node, leafNode])
child7Node.childNodes = new Set([leafNode])
leafNode.childNodes = new Set()

describe('markDown text renderer', () => {
  it('should render topics', () => {
    const text = markDown(root1Node)

    expect(text).toMatch(new RegExp(`^# ${root1Node.title}.*`))
    expect(text).toMatch(new RegExp(`.*\n\n## ${child2Node.title}.*`))
    expect(text).toMatch(new RegExp(`.*\n\n### ${child3Node.title}.*`))
    expect(text).toMatch(new RegExp(`.*\n\n#### ${child4Node.title}.*`))
    expect(text).toMatch(new RegExp(`.*\n\n##### ${child5Node.title}.*`))
    expect(text).toMatch(new RegExp(`.*\n\n###### ${child6Node.title}.*`))
    expect(text).toMatch(new RegExp(`.*\n\\* ${child7Node.title}.*`))
    expect(text).toMatch(new RegExp(`.*\n[ ]{2}\\* ${leafNode.title}.*`))
    expect(text).toMatch(new RegExp(`.*\n\n${leafNode.title}.*`))

    expect(text.match(new RegExp(`.*${leafNode.title}.*`, 'g'))?.length).toBe(6 + 3)
  })
})
