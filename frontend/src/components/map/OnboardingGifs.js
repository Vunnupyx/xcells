import React from 'react'
import HowToNavigate from '../../assets/HowToNavigate.gif'
import addCardGif from '../../assets/How to create cards.gif'
import addArrowGif from '../../assets/How to make Arrows.gif'
import OnBoardingGifDisplay from './OnBoardingGifDisplay'

const gifs = {
  gifsReadOnly: {
    storageKey: 'onBoarding.readOnly.showAgain',
    gifs: [
      {
        title: 'How to navigate',
        gif: HowToNavigate,
        width: 500,
        height: 280,
      },
    ],
  },
  gifsWrite: {
    storageKey: 'onBoarding.showAgain',
    gifs: [
      {
        title: 'How to navigate',
        gif: HowToNavigate,
        width: 500,
        height: 280,
      },
      {
        title: 'How to create a card',
        gif: addCardGif,
        width: 600,
        height: 280,
      },
      {
        title: 'How to use arrows',
        gif: addArrowGif,
        width: 600,
        height: 280,
      },
    ],
  },
}

export const getFilteredList = key => {
  let filteredGifs = gifs[key].gifs

  Object.keys(gifs).forEach(entryKey => {
    if (entryKey === key) return
    const entryGifs = gifs[entryKey].gifs
    const entryStorageKey = gifs[entryKey].storageKey

    const dontShowAgain = localStorage[entryStorageKey] === 'false'
    if (!dontShowAgain) return

    entryGifs.forEach(externalGif => {
      filteredGifs = filteredGifs.filter(ownGif => {
        return externalGif.title !== ownGif.title || externalGif.gif !== ownGif.gif
      })
    })
  })

  return filteredGifs
}

const OnboardingGifs = ({dialogKey}) => {
  const filteredGifs = getFilteredList(dialogKey)
  const {storageKey} = gifs[dialogKey]

  return <OnBoardingGifDisplay gifs={filteredGifs} showAgainStorage={storageKey} />
}

export default OnboardingGifs
