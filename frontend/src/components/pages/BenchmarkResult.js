import React from 'react'

const NumberField = ({fieldName, valueHeader, value, unit}) => {
  return (
    <>
      <p>
        <b>{valueHeader}</b>
      </p>
      <p>
        <div id={fieldName} style={{display: 'inline'}}>
          {value}
        </div>{' '}
        {unit}
      </p>
      <p>
        <br />
      </p>
    </>
  )
}

const BenchmarkResult = ({location}) => {
  if (location?.state?.mapLoadingTime)
    return (
      <NumberField
        fieldName="mapLoadingSeconds"
        valueHeader="Map loading time"
        value={location?.state?.mapLoadingTime}
        unit="seconds"
      />
    )

  if (location?.state?.everything && location?.state?.toStartOnly && location?.state?.toEndOnly)
    return (
      <>
        <NumberField
          fieldName="everythingFps"
          valueHeader="Everything"
          value={location?.state?.everything}
          unit="FPS"
        />
        <NumberField
          fieldName="toStartOnlyFps"
          valueHeader="To start only"
          value={location?.state?.toStartOnly}
          unit="FPS"
        />
        <NumberField fieldName="toEndOnlyFps" valueHeader="To end only" value={location?.state?.toEndOnly} unit="FPS" />
      </>
    )

  return <p>No results</p>
}

export default BenchmarkResult
