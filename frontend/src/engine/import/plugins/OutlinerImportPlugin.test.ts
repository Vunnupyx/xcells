import OutlinerImportPlugin from './OutlinerImportPlugin'

const validData = `
title
  subtitle1
    card1
    card2
    card3 with some more text
  subtitle2

    card4
    card5
      subsubsub...
  subtitle3
    card6
anotherTitle
`

const validDataTab = validData.replace(/ {2}/g, '\t')

describe('OutlinerImporterPlugin', () => {
  Object.entries({spaces: validData, tabs: validDataTab}).forEach(([name, data]) => {
    it(`should handle input data with ${name} correctly`, async () => {
      const plugin = new OutlinerImportPlugin()
      const blob = {
        text: () => Promise.resolve(data),
        type: 'text/plain',
      }

      const nodeDatas = await plugin.transform(blob as Blob)

      expect(nodeDatas.length).toBe(2)

      const [{root, nodes, edges}, secondBlock] = nodeDatas

      expect(root).toBeDefined()
      expect(edges && Object.values(edges).length).toBeFalsy()
      expect(nodes[root].title).toBe('title')
      expect(nodes[root].children?.length).toBe(3)
      const rootChildren = nodes[root].children
      if (!rootChildren) {
        fail('Root children missing')
        return
      }

      rootChildren.forEach((id, i) => {
        expect(nodes[id]?.title).toBe(`subtitle${i + 1}`)
      })
      expect(nodes[rootChildren[0]].children?.length).toBe(3)
      expect(nodes[rootChildren[1]].children?.length).toBe(2)
      expect(nodes[rootChildren[2]].children?.length).toBe(1)

      let subSubChildCount = 0
      rootChildren.forEach(subChildId => {
        const subChildren = nodes[subChildId].children

        if (!subChildren) {
          fail('Subchildren missing')
          return
        }

        subChildren.forEach(subSubChildId => {
          subSubChildCount += 1
          expect(nodes[subSubChildId].title).toContain(`card${subSubChildCount}`)
        })
      })
      expect(subSubChildCount).toBe(6)

      expect(secondBlock.nodes[secondBlock.root].title).toBe('anotherTitle')
    })
  })
})
